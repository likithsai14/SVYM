const { connectDB } = require("./utils/mongodb");
const Attendance = require("./models/Attendance");
const Course = require("./models/Course");

// Helper to normalize date to UTC midnight
function normalizeDate(date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: JSON.stringify({ message: "Method Not Allowed" }) };
    }

    const { studentId, courseId, month, year } = JSON.parse(event.body || "{}");
    if (!studentId) return { statusCode: 400, body: JSON.stringify({ message: "studentId is required" }) };

    await connectDB();

    // Build query: find all attendance docs where the student appears; if courseId provided, filter by it
    const baseQuery = { 'students.studentId': studentId };
    if (courseId) baseQuery.courseId = courseId;

    // If month/year filter provided, compute date range
    let dateFilter = {};
    if (month && year) {
      const start = normalizeDate(new Date(`${year}-${String(month).padStart(2, '0')}-01`));
      const end = new Date(start);
      end.setUTCMonth(end.getUTCMonth() + 1);
      // attendanceDate >= start && < end
      dateFilter = { attendanceDate: { $gte: start, $lt: end } };
    }

    const finalQuery = Object.assign({}, baseQuery, dateFilter);

    // Fetch matching attendance sessions
    const records = await Attendance.find(finalQuery).lean();

    // Map courseId -> { courseName }
    const courseIds = Array.from(new Set(records.map(r => r.courseId).filter(Boolean)));
    const coursesMap = {};
    if (courseIds.length) {
      const courseDocs = await Course.find({ courseId: { $in: courseIds } }).lean();
      courseDocs.forEach(c => { coursesMap[c.courseId] = c.courseName || c.courseId; });
    }

    const overall = { total: 0, present: 0, absent: 0 };
    const perCourse = {}; // courseId -> aggregated data + dates[]

    records.forEach(rec => {
      const cid = rec.courseId || 'unknown';
      const studentEntry = (rec.students || []).find(s => s.studentId === studentId);
      if (!studentEntry) return;

      // Consider present boolean only; if present is false -> absent
      const present = !!studentEntry.present;
      const remarks = studentEntry.remarks || '';
      const dateISO = rec.attendanceDate ? new Date(rec.attendanceDate).toISOString().slice(0,10) : null;

      overall.total += 1;
      if (present) overall.present += 1; else overall.absent += 1;

      if (!perCourse[cid]) perCourse[cid] = { courseId: cid, courseName: coursesMap[cid] || cid, totalDays: 0, present: 0, absent: 0, dates: [] };
      perCourse[cid].totalDays += 1;
      if (present) perCourse[cid].present += 1; else perCourse[cid].absent += 1;

      perCourse[cid].dates.push({ date: dateISO, present: present, remarks: remarks });
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ overall, courses: Object.values(perCourse) })
    };
  } catch (err) {
    console.error('getStudentAttendance error', err);
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
};

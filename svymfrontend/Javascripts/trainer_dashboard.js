document.addEventListener('DOMContentLoaded', async () => {
    const welcomeMessageElement = document.getElementById('welcomeMessage');
    const loggedInUserName = JSON.parse(sessionStorage.getItem("user")).username;

    if (welcomeMessageElement && loggedInUserName) {
        const displayUserName = loggedInUserName.charAt(0).toUpperCase() + loggedInUserName.slice(1);
        welcomeMessageElement.textContent = `Welcome, ${displayUserName}!`;
    } else if (welcomeMessageElement) {
        welcomeMessageElement.textContent = `Welcome to SVYM, Trainer!`;
    }

    // Get trainer ID from sessionStorage
    const sessionUserId = sessionStorage.getItem('userId');
    if (!sessionUserId) {
        console.warn('No session userId found in sessionStorage');
        return;
    }

    // Load stats
    await loadTrainerStats(sessionUserId);
});

async function loadTrainerStats(trainerId) {
    try {
        // Fetch courses
        const coursesRes = await fetch('/.netlify/functions/fetchTrainerCourses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trainerId })
        });
        const courses = await coursesRes.json();

        // Fetch students data
        const studentsRes = await fetch('/.netlify/functions/getTrainerStudentsData', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trainerId })
        });
        const studentsData = await studentsRes.json();

        // Update UI
        const coursesList = document.getElementById('placementsList'); // Using existing placementsList for courses
        const studentsList = document.getElementById('announcementsList'); // Using existing announcementsList for students

        // Display courses
        if (courses && courses.length > 0) {
            coursesList.innerHTML = courses.map(course => `
                <li class="placement-item">
                    <strong>${course.courseName}</strong>
                    <span>Course ID: ${course.courseId}</span>
                    <span>Duration: ${course.durationMonths || 'N/A'} days</span>
                    <span>Status: ${course.courseStatus || 'Upcoming'}</span>
                </li>
            `).join('');
        } else {
            coursesList.innerHTML = '<li class="no-data">No courses assigned yet.</li>';
        }

        // Display students stats
        if (studentsData && studentsData.students) {
            const totalStudents = studentsData.students.length;
            const activeStudents = studentsData.students.filter(s => s.accountStatus === 'Active').length;
            const totalCourses = studentsData.courses ? studentsData.courses.length : 0;

            studentsList.innerHTML = `
                <li class="placement-item">
                    <strong>Total Students: ${totalStudents}</strong>
                    <span>Active Students: ${activeStudents}</span>
                    <span>Total Courses: ${totalCourses}</span>
                </li>
            `;
        } else {
            studentsList.innerHTML = '<li class="no-data">No students data available.</li>';
        }

    } catch (err) {
        console.error('Error loading trainer stats:', err);
        // Fallback to default messages
        document.getElementById('placementsList').innerHTML = '<li class="no-data">Unable to load courses.</li>';
        document.getElementById('announcementsList').innerHTML = '<li class="no-data">Unable to load students data.</li>';
    }
}

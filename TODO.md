# TODO: Change Duration Calculation to Days

## Tasks
- [x] Update `calculateDuration` in `svymfrontend/Javascripts/add_course.js` to calculate inclusive days
- [x] Update `calculateUpdateDuration` in `svymfrontend/Javascripts/trainer_courses.js` to calculate inclusive days
- [x] Update `durationMonths` calculation in `svymbackend/functions/updateTrainerCourse.js` to days
- [x] Change label in `svymfrontend/admin_courses.html` to "(days)"
- [x] Change label in `svymfrontend/trainer_courses.html` to "(days)"
- [x] Change display text in `svymfrontend/Javascripts/admin_courses.js` to "days"
- [x] Change display text in `svymfrontend/Javascripts/student_courses.js` to "days"
- [x] Change display text in `svymfrontend/Javascripts/trainer_dashboard.js` to "days"
- [x] Change header in `svymfrontend/Javascripts/admin_reports.js` to "(Days)"
- [x] Test the duration calculations (inclusive days: floor((end - start)/msPerDay) + 1)
- [x] Verify displays and labels show "days" instead of "months"

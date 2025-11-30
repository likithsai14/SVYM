## Plan to Remove Location Field from Course

### Information Gathered
- Course model in `svymbackend/functions/models/Course.js` has `location` field set to `required: true`.
- `svymbackend/functions/addCourse.js` destructures `location` from request body, validates it as required, and passes it to the Course constructor.
- `svymbackend/functions/updateCourse.js` does not handle `location` field.
- Frontend in `svymfrontend/Javascripts/add_course.js` has `location` commented out in the payload.
- HTML form in `svymfrontend/admin_courses.html` does not include a location input field.

### Plan
1. [x] Remove `location` field from Course schema in `svymbackend/functions/models/Course.js`.
2. [x] Remove `location` from destructuring in `svymbackend/functions/addCourse.js`.
3. [x] Remove `location` from validation check in `addCourse.js`.
4. [x] Remove `location` from Course constructor in `addCourse.js`.

### Dependent Files to Edit
- `svymbackend/functions/models/Course.js`
- `svymbackend/functions/addCourse.js`

### Followup Steps
- Test adding a course to ensure no validation error for location.
- Check if any other backend functions or frontend code references location that needs updating.

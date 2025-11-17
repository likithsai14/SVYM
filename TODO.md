# TODO: Enable Editing of Course Name, Price, and Donor Fund Amount

## Information Gathered
- Frontend (admin_courses.js): Populates courseName, price, donorFundAmount in edit mode but does not send them in the update payload. No validation for donorFundAmount <= price in edit mode.
- Backend (updateCourse.js): Does not accept or update courseName, price, donorFundAmount fields.
- Course model: Already supports courseName (required), price (required), donorFundAmount (default 0).
- Validation needed: Ensure donorFundAmount <= price during edit.

## Plan
1. **Update Backend (updateCourse.js)**:
   - Add courseName, price, donorFundAmount to payload destructuring.
   - Add validation to ensure donorFundAmount <= price if both are provided.
   - Update the course fields in the database.

2. **Update Frontend (admin_courses.js)**:
   - In the form submit handler for updates, collect courseName, price, donorFundAmount from form inputs.
   - Add validation to check donorFundAmount <= price before sending payload.
   - Include courseName, price, donorFundAmount in the update payload.

3. **Testing**:
   - Verify that editing a course updates courseName, price, donorFundAmount correctly.
   - Ensure validation prevents invalid donorFundAmount > price.
   - Check that the UI reflects changes after update.

## Dependent Files
- svymbackend/functions/updateCourse.js
- svymfrontend/Javascripts/admin_courses.js

## Followup Steps
- Test the edit functionality by updating a course's name, price, and donor fund amount.
- Verify validation alerts when donor fund exceeds price.
- Ensure no regressions in other edit fields (dates, modules, trainer).

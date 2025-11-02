# TODO List for Adding "Others" Options to Tribal and PWD, and Input Restrictions

## 1. Update User Schema
- [x] Add `otherTribal: String` and `otherPwd: String` fields to `svymbackend/functions/models/User.js`.

## 2. Update Signup Form (HTML)
- [x] Add "Others" option to tribal select in `svymfrontend/signup.html`.
- [x] Add "Others" option to pwd select in `svymfrontend/signup.html`.
- [x] Add hidden input fields for `otherTribal` and `otherPwd` in `svymfrontend/signup.html`.

## 3. Update Signup JavaScript
- [x] Add event listeners for tribal and pwd select changes to show/hide other inputs in `svymfrontend/Javascripts/signup.js`.
- [x] Restrict `staffName` input to alphabets and spaces, apply title case in `svymfrontend/Javascripts/signup.js`.
- [x] Add validation for `otherTribal` and `otherPwd` when "Others" is selected in `svymfrontend/Javascripts/signup.js`.

## 4. Update Signup Backend
- Add validation and storage for `otherTribal` and `otherPwd` in `svymbackend/functions/signup.js`.

## 5. Update Admin Students Form (HTML)
- Add "Others" option to tribal and pwd selects in `svymfrontend/admin_students.html`.
- Add input fields for `otherTribal` and `otherPwd` in `svymfrontend/admin_students.html`.

## 6. Update Admin Students JavaScript
- Add input restrictions: names (candidateName, fatherHusbandName, villageName, staffName) to alphabets and spaces with title case in `svymfrontend/Javascripts/admin_student.js`.
- Add input restrictions: aadharNumber, candidatePhone, parentPhone to digits only in `svymfrontend/Javascripts/admin_student.js`.
- Add event listeners for tribal and pwd changes to show/hide other inputs in `svymfrontend/Javascripts/admin_student.js`.
- Add validation for `otherTribal` and `otherPwd` in `svymfrontend/Javascripts/admin_student.js`.

## 7. Update Admin Students Backend (if needed)
- Ensure `svymbackend/functions/addOrUpdateStudent.js` handles the new fields.

## 8. Testing
- Test signup form with new options and restrictions.
- Test admin students form with restrictions and new fields.
- Verify backend saves new fields correctly.

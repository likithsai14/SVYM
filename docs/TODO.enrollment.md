# Enrollment Updates Summary

## Backend Changes
- StudentEnrollment model: Added coursePrice, fundedAmount, maxInstallments fields.
- assignCourse.js: Persists coursePrice and fundedAmount; totalPrice = student amount.
- applyAndPay.js: Handles fundedAmount (default 0); computes student amount.
- payDues.js: Enforces max 4 installments; final payment must equal remaining due.
- getStudentFees.js: Includes fundedAmount in response.

## Frontend Changes
- student_fee_details.html: Added utils.js script for formatDate.
- admin_students.html: Added funded and student amount display in assign course modal.
- admin_student.js: Computes and displays funded/student amounts on course select.
- student_courses.html: Removed apply course functionality; shows assigned course card if enrolled, else message.
- student_dashboard.html: Added "My Course" card showing enrollment details if assigned.
- student_fee_details.html: Added funded amount stat; "All cleared!" if pending == 0.
- admin_students.html: Shows "No dues" text if dueAmount == 0 instead of Pay Dues button.

## Rules Implemented
- Students assigned only 1 course by admin.
- Fee paid in max 4 installments; sum of installments == student amount (totalPrice - fundedAmount).
- Only student amount collected; funded amount not charged.

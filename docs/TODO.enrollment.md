Enrollment changes: Single-course, funded vs student amount, max 4 installments

Status: IMPLEMENTED

Scope
- Enforce: one course per student (already present; ensured unchanged).
- Each course has two amounts: coursePrice and fundedAmount. Only studentAmount = coursePrice - fundedAmount is collected.
- Fees must be paid in maximum 4 installments per enrollment. Sum of installments must equal studentAmount.

Changes implemented
1) Model: svymbackend/functions/models/StudentEnrollment.js
   - Added fields:
     - coursePrice: Number (original course price, >=0, default 0)
     - fundedAmount: Number (donor funded amount, >=0, default 0)
     - maxInstallments: Number (default 4)
   - Kept totalPrice to preserve compatibility, now defined as the studentAmount to be collected.
   - Pre-validate hook ensures:
     - totalPrice = max(0, coursePrice - fundedAmount)
     - dueAmount = max(0, totalPrice - amountPaid)

2) assignCourse: svymbackend/functions/assignCourse.js
   - Validates inputs and persists coursePrice and fundedAmount.
   - Computes amountToPay = coursePrice - funded.
   - Creates enrollment with:
     - coursePrice, fundedAmount, totalPrice (student amount), amountPaid=0, dueAmount=amountToPay.

3) applyAndPay: svymbackend/functions/applyAndPay.js
   - Accepts optional fundedAmount=0 and treats input totalPrice as coursePrice.
   - Validates initialPayment: 0 <= initialPayment <= (coursePrice - funded).
   - Creates enrollment with coursePrice, fundedAmount, totalPrice=studentAmount, amountPaid=initialPayment, dueAmount=studentAmount - initialPayment.
   - Creates first Transaction for initialPayment.

4) payDues: svymbackend/functions/payDues.js
   - Counts existing transactions for enrollmentId to enforce installments:
     - If count >= maxInstallments: reject further payments.
     - If count === maxInstallments - 1 (i.e. paying the 4th installment): amount must equal remaining due exactly.
     - Otherwise, amount must be > 0 and ≤ dueBefore (no overpayment).
   - Updates enrollment and creates Transaction.

Reporting endpoints (getStudentFees/getAllStudentFees/getAllCourseTransactions)
- No changes required. They compute paid/due based on enrollment.totalPrice (now studentAmount) and Transactions, which remains correct.

Sanity test checklist
1) Assign a course by admin
   - Request (POST) /assignCourse:
     {
       "courseId": "12345",
       "courseName": "ABC",
       "studentId": "USR00001",
       "totalPrice": 10000,         // coursePrice
       "fundedAmount": 2500
     }
   - Expect: enrollment with coursePrice=10000, fundedAmount=2500, totalPrice=7500, amountPaid=0, dueAmount=7500.

2) Apply and pay initial installment (self-apply flow)
   - Request (POST) /applyAndPay:
     {
       "courseId": "12345",
       "courseName": "ABC",
       "studentId": "USR00002",
       "totalPrice": 10000,         // coursePrice
       "fundedAmount": 2500,        // optional; defaults to 0 if omitted
       "amountPaid": 2000,
       "paymentMethod": "UPI"
     }
   - Expect: enrollment with coursePrice=10000, fundedAmount=2500, totalPrice=7500, amountPaid=2000, dueAmount=5500, 1 transaction recorded.

3) Pay dues (additional installments)
   - Request (POST) /payDues:
     {
       "studentId": "USR00002",
       "courseId": "12345",
       "amount": 3000,
       "paymentMethod": "Cash"
     }
   - Expect: accepted if not final installment and amount ≤ dueBefore.
   - For the 4th (final allowed) installment: amount must equal remaining due exactly.
   - 5th payment attempt should be rejected with message: "Maximum of 4 installments already reached".

Notes
- totalPrice now consistently means studentAmount across the system.
- The sum of installments is enforced to match studentAmount by:
  - Preventing overpayment before the final installment.
  - Requiring the last allowed installment to match the exact remaining due.
- Existing reports remain compatible.

Completed steps
- [x] Update StudentEnrollment schema with new fields and consistency hook.
- [x] Update assignCourse to persist coursePrice/fundedAmount and compute student amount.
- [x] Update applyAndPay with funded handling and initial-payment validation.
- [x] Update payDues to enforce max 4 installments and final-sum equality.
- [x] Quick scan of backend usage and reports for compatibility.

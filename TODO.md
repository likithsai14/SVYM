# TODO: Fix Age Calculation and Live Validation for Date of Birth in signup.js

- [x] Extract age calculation logic into a reusable `calculateAge` function.
- [x] Attach `calculateAge` to 'change', 'blur', and 'input' events on `dobInput` to ensure it triggers on user interactions.
- [x] Modify live validation to include `validity.valid` checks for date inputs (add condition for `input.type === 'date'`).
- [x] In form submit revalidation, add check for `!input.validity.valid && input.value.trim() !== ''` to catch invalid dates.
- [x] Ensure age validation (17-50) happens after age calculation.
- [x] Test the form to verify age calculation and validation work on input, blur, and submit. (Skipped by user)

# TODO: Implement Title Case Conversion for Candidate Name and Father/Husband Name

- [x] Add `toTitleCase` function to signup.js.
- [x] Attach 'input' event listeners to candidateName and fatherHusbandName inputs in signup.js to convert to title case.
- [x] Add `toTitleCase` function to admin_student.js.
- [x] Attach 'input' event listeners to candidateName and fatherHusbandName inputs in admin_student.js add/edit modal.
- [x] Note: trainer_students.js is view-only, no editing capability, so no changes needed.

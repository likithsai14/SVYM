# TODO: Fix Admin Courses Issues

## Issues to Address
1. Form data persists from edit to add course modal.
2. "Add New Trainer" option appears in edit course trainer dropdown.
3. "Add New Trainer" should be a button enabled only when "Select Trainer" is chosen in add course.

## Steps to Complete
- [x] Step 1: Ensure form fields are fully enabled and reset in add course modal to prevent data persistence.
- [x] Step 2: Remove "Add New Trainer" option from trainerSelect dropdown in edit course.
- [x] Step 3: For add course, replace "Add New Trainer" dropdown option with a separate button next to the dropdown.
- [x] Step 4: Enable the "Add New Trainer" button only when trainerSelect.value === "".
- [x] Step 5: Update form submit logic to handle new trainer creation via the button.
- [x] Step 6: Test the changes to ensure no regressions.

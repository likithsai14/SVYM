# TODO List for Admin Students Pagination Fix

## Tasks
- [ ] Add getFilteredData() function to centralize filtering logic
- [ ] Update renderStudentsTable() to use getFilteredData() and fix totalPages calculation
- [ ] Update updatePaginationInfo() to use filtered data, update pagination text, and disable/enable buttons
- [ ] Update prevPage and nextPage click handlers to use filtered data for totalPages
- [ ] Test the pagination to ensure buttons are disabled at start/end and enabled otherwise

 
 totalrequests=0;
 totalapproved=0;
 totalrejected=0;
 totalpending=0;
 document.addEventListener('DOMContentLoaded', async function() {
    
    const fieldmobilisersData = [
          
        ];
     try {
                // Fetch data from the specified endpoint
                const response = await fetch('/.netlify/functions/allfieldmobilisers');
                
                // Check if the response is okay (status code 200-299)
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const fetchedData = await response.json();

                console.log('Fetched FieldMobiliser data:', typeof(fetchedData.fieldmobilisers));
                for (const fieldmobilisers of fetchedData.fieldmobilisers) {
                    fieldmobilisersData.push({
                        id: fieldmobilisers._id,
                        name: fieldmobilisers.FieldMobiliserName,
                        email: fieldmobilisers.FieldMobiliserEmailID,
                        supportedProject: fieldmobilisers.FieldMobiliserSupportedProject,
                        status: fieldmobilisers.isAppRejPen === 0 ? 'Pending' : (fieldmobilisers.isAppRejPen === 1 ? 'Approve' : 'Reject')
                    });
                    // Log each student's details to the console
                    console.log(`ID: ${fieldmobilisers._id}, Name: ${fieldmobilisers.FieldMobiliserName}, Mobile No: ${fieldmobilisers.FieldMobiliserMobileNo}, Email: ${fieldmobilisers.FieldMobiliserEmailID}, Supported Project: ${fieldmobilisers.FieldMobiliserSupportedProject}, Status: ${fieldmobilisers.isAppRejPen}`);
                    totalrequests++;
                    if (fieldmobilisers.isAppRejPen === 1) {
                        totalapproved++;
                    } else if (fieldmobilisers.isAppRejPen === 0) {
                        totalpending++;
                    } else {
                        totalrejected++;
                    }
                }
                
                // Render the table with the fetched data
                renderTable(fieldmobilisersData);

            } catch (error) {
                // Log any errors that occur during the fetch process
                console.error('Failed to fetch student data:', error);
                const tableBody = document.getElementById('fieldmobiliserTableBody');
                tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--danger-color);">
                    Failed to load data. Please try again later.
                </td></tr>`;
            }
 

        // Function to render the table rows based on provided data
        function renderTable(data) {
            const tableBody = document.getElementById('fieldmobiliserTableBody');
            // Clear any existing table rows
            tableBody.innerHTML = '';

            // Loop through the data and create a row for each student
            data.forEach(fieldmobiliser => {
                const row = document.createElement('tr');
                
                // Set the status badge class based on the student's status
                const statusClass = fieldmobiliser.status.toLowerCase();
                if(fieldmobiliser.status === 'Pending') {

                
                const statusHtml = `<span class="status ${statusClass}">${fieldmobiliser.status.charAt(0).toUpperCase() + fieldmobiliser.status.slice(1)}</span>`;

                // Set the inner HTML of the row with all the student details
                row.innerHTML = `
                    <td>${fieldmobiliser.id}</td>
                    <td>${fieldmobiliser.name}</td>
                    <td>${fieldmobiliser.email}</td>
                    <td>${fieldmobiliser.supportedProject}</td>
                    <td>${statusHtml}</td>
                    <td>
                        <div class="actions">
                            <button class="action-btn approve-btn" id="approvebtn"><i class="fas fa-check"></i> Approve</button>
                            <button class="action-btn reject-btn" id="rejectbtn"><i class="fas fa-trash-alt"></i> Reject</button>
                        </div>
                    </td>
                `;
                // Add event listeners for the approve and reject buttons based on the id
                row.querySelector('.approve-btn').addEventListener('click', async function() {
                    const fieldmobiliserId = fieldmobiliser.id;
                    if(!confirm(`Are you sure you want to approve the request for fieldmobiliser ID: ${fieldmobiliserId}?`)) {
                        return; // Exit if the user cancels the confirmation
                    }
                    else {  
                        console.log(`Approve button clicked for fieldmobiliser ID: ${fieldmobiliserId}`);
                        totalapproved++;
                        totalpending--;
                        console.log('Total Requests:', totalrequests);
                        console.log('Total Approved:', totalapproved);
                        console.log('Total Rejected:', totalrejected);
                        console.log('Total Pending:', totalpending);
                        fieldmobiliser.status = 'Approve';
                        row.querySelector('.status').textContent = 'Approved';
                        row.querySelector('.status').className = 'status approved';
                        row.querySelector('.approve-btn').disabled = true;
                        row.querySelector('.reject-btn').disabled = true;
                        //remove the row from the table body
                       //console.error('Error updating student status:', error);
                        const requestbody={fieldmobiliserId: fieldmobiliserId, isAppRejPen: 1}; // Set to 1 for approved status
                        console.log('Request body for fieldmobiliser request handler:', requestbody);
                          try{
                             const response=await fetch('/.netlify/functions/fieldmobiliserrequesthandler',{
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(requestbody)
                            })
                            console.log('Response from fieldmobiliser request handler:', response.json());
                            if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                            }
                        }
                        catch(error) {
                            console.error('Error updating student status:', error);
                        }
                        }
                     
                         


                    }
                   
                    // Here you can add the logic to handle the approval action
                    // For example, you might want to send a request to your server to update the student's status
                );
                row.querySelector('.reject-btn').addEventListener('click', async function() {
                    const fieldmobiliserId = fieldmobiliser.id;
                    if(!confirm(`Are you sure you want to reject the request for fieldmobiliser ID: ${fieldmobiliserId}?`)) {
                        return; // Exit if the user cancels the confirmation
                    }
                    else {  
                        console.log(`Rejected button clicked for fieldmobiliser ID: ${fieldmobiliserId}`);
                        totalrejected++;
                        totalpending--;
                        console.log('Total Requests:', totalrequests);
                        console.log('Total Approved:', totalapproved);
                        console.log('Total Rejected:', totalrejected);
                        console.log('Total Pending:', totalpending);
                        fieldmobiliser.status = 'Approve';
                        row.querySelector('.status').textContent = 'Rejected';
                        row.querySelector('.status').className = 'status rejected';
                        row.querySelector('.approve-btn').disabled = true;
                        row.querySelector('.reject-btn').disabled = true;
                        //remove the row from the table body
                       //console.error('Error updating student status:', error);
                        const requestbody={fieldmobiliserId: fieldmobiliserId, isAppRejPen: 2}; // Set to 1 for approved status
                        console.log('Request body for fieldmobiliser request handler:', requestbody);
                          try{
                             const response=await fetch('/.netlify/functions/fieldmobiliserrequesthandler',{
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(requestbody)
                            })
                            console.log('Response from fieldmobiliser request handler:', response.json());
                            if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                            }
                        }
                        catch(error) {
                            console.error('Error updating student status:', error);
                        }
                        }
                    
                });     
            }

               
                // Append the new row to the table body
                tableBody.appendChild(row);
            });
        }

        // Function to handle the search logic
        function handleSearch() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            
            // Filter the original data array based on the search term
            const filteredData = fieldmobilisersData.filter(fieldmobiliser => 
                
                fieldmobiliser.name.toLowerCase().includes(searchTerm) ||
                fieldmobiliser.email.toLowerCase().includes(searchTerm) 

            );

            // Re-render the table with the filtered data
            renderTable(filteredData);
        }

          renderTable(fieldmobilisersData);
            
            // Add event listener to the search input for real-time filtering
            document.getElementById('searchInput').addEventListener('keyup', handleSearch);
            
            // Add event listener to the search button
            document.getElementById('searchBtn').addEventListener('click', handleSearch);






            const tableBody = document.querySelector('.data-table tbody');
            const rows = Array.from(tableBody.querySelectorAll('tr'));
            
            // Set the number of rows to display per page
            const rowsPerPage = 10;
            let currentPage = 1;

            // Get the pagination controls
            const prevBtn = document.getElementById('prevBtn');
            const nextBtn = document.getElementById('nextBtn');
            const pageInfo = document.getElementById('page-info');

            
            // Calculate the total number of pages
            const totalPages = Math.ceil(rows.length / rowsPerPage);
            console.log('Total Rows:', rows.length);
            console.log('Total Pages:', totalPages);
            /**
             * Displays a specific page of data in the table.
             * @param {number} page The page number to display.
             */
            function displayPage(page) {
                // Hide all rows initially
                rows.forEach(row => row.style.display = 'none');

                // Calculate the start and end index for the rows on the current page
                const startIndex = (page - 1) * rowsPerPage;
                const endIndex = startIndex + rowsPerPage;

                // Loop through the rows for the current page and display them
                for (let i = startIndex; i < endIndex && i < rows.length; i++) {
                    rows[i].style.display = '';
                }

                // Update the page information text
                pageInfo.textContent = `Page ${page} of ${totalPages}`;

                // Disable or enable the navigation buttons based on the current page
                prevBtn.disabled = page === 1;
                nextBtn.disabled = page === totalPages;
            }

            // Event listener for the "Previous" button
            prevBtn.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    displayPage(currentPage);
                }
            });

            // Event listener for the "Next" button
            nextBtn.addEventListener('click', () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    displayPage(currentPage);
                }
            });

            // Call the function to display the initial page when the script loads
            displayPage(currentPage);
    });
    function getStudentDashboardData() {
    return {
        totalRequests: totalrequests,
        totalApproved: totalapproved,
        totalRejected: totalrejected,
        totalPending: totalpending
    };
}
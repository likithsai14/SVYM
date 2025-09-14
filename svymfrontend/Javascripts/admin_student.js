
let addstudents=document.getElementById('addstudents');

document.addEventListener('DOMContentLoaded', async function() {

   try{
    totalrequests = 0;
totalapproved = 0;
totalrejected = 0;
totalpending = 0;
   const response = await fetch('/.netlify/functions/studentallrequest');
   const studentrequest=await response.json()
   console.log('Fetched student request data:', studentrequest);
   console.log(typeof(studentrequest));
   for(let i=0;i<studentrequest.students.length;i++){
       if(studentrequest.students[i].isAppRejPen === 0) {
           totalpending++;
       }
       else if(studentrequest.students[i].isAppRejPen === 1) {
           totalapproved++;
       }
       else if(studentrequest.students[i].isAppRejPen === 2) {
              totalrejected++;
         }
       console.log(`Student ID: ${studentrequest.students[i]._id}, Name: ${studentrequest.students[i].candidateName}, Email: ${studentrequest.students[i].email}, Course: ${studentrequest.students[i].supportedProject}, Status: ${studentrequest.students[i].isAppRejPen}`);
   }
   totalrequests = totalapproved + totalrejected + totalpending;
   document.getElementById('totalRequests').textContent = totalrequests.toString();
   document.getElementById('approvedRequests').textContent = totalapproved.toString();
   document.getElementById('rejectedRequests').textContent= totalrejected.toString();
   document.getElementById('pendingRequests').textContent = totalpending.toString();
   console.log('Total Requests:', totalrequests);
   console.log('Total Approved:', totalapproved);
   console.log('Total Rejected:', totalrejected);
   console.log('Total Pending:', totalpending);
   }
catch(error) {
    console.error('Error fetching student data:', error);
}
});

addstudents.addEventListener('click', function() {
    // Redirect to the add students page
    window.location.href = 'admin_addstudents.html';
});

let editstudents=document.getElementById('editstudents');
editstudents.addEventListener('click', function() {
    // Redirect to the edit students page
    window.location.href = 'admin_editstudents.html';
});

let requeststudents=document.getElementById('requeststudents');
requeststudents.addEventListener('click', function() {
    // Redirect to the view requests page
    window.location.href = 'admin_viewstudentrequests.html';
   
});
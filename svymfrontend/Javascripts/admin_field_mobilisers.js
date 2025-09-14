

document.addEventListener('DOMContentLoaded', async function() {

   try{
    totalrequests = 0;
totalapproved = 0;
totalrejected = 0;
totalpending = 0;
   const response = await fetch('/.netlify/functions/fieldmobiliserallrequest');
   const fieldmobiliserrequest=await response.json()
   console.log('Fetched fieldmobiliser request data:', fieldmobiliserrequest);
   console.log(typeof(fieldmobiliserrequest));
   for(let i=0;i<fieldmobiliserrequest.fieldmobilisers.length;i++){
       if(fieldmobiliserrequest.fieldmobilisers[i].isAppRejPen === 0) {
           totalpending++;
       }
       else if(fieldmobiliserrequest.fieldmobilisers[i].isAppRejPen === 1) {
           totalapproved++;
       }
       else if(fieldmobiliserrequest.fieldmobilisers[i].isAppRejPen === 2) {
              totalrejected++;
         }
      console.log(`Field Mobiliser ID: ${fieldmobiliserrequest.fieldmobilisers[i]._id}, Name: ${fieldmobiliserrequest.fieldmobilisers[i].FieldMobiliserName}, Email: ${fieldmobiliserrequest.fieldmobilisers[i].FieldMobiliserEmailID}, Region: ${fieldmobiliserrequest.fieldmobilisers[i].FieldMobiliserRegion}, Supported Project: ${fieldmobiliserrequest.fieldmobilisers[i].FieldMobiliserSupportedProject}, Status: ${fieldmobiliserrequest.fieldmobilisers[i].isAppRejPen}`);
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

let addfieldmobiliser=document.getElementById('addfieldmobiliser');
addfieldmobiliser.addEventListener('click', function() {
    // Redirect to the add students page
    window.location.href = 'admin_addfieldmobiliser.html';
});

let editfieldmobiliser=document.getElementById('editfieldmobiliser');
editfieldmobiliser.addEventListener('click', function() {
    // Redirect to the edit students page
    window.location.href = 'admin_editstudents.html';
});

let requestfieldmobiliser=document.getElementById('requestfieldmobiliser');
requestfieldmobiliser.addEventListener('click', function() {
    // Redirect to the view requests page
    window.location.href = 'admin_viewfieldmobiliserrequest.html';
   
});
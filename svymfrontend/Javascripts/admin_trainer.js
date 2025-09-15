document.addEventListener('DOMContentLoaded', function() {

    // =========================================================
    // --- Trainer Management Logic (CRUD Operations) ---
    // =========================================================
    const trainersTableBody = document.getElementById('trainersTableBody');
    const trainerModal = document.getElementById('trainerFormModal');
    const trainerModalTitle = document.getElementById('trainerModalTitle');
    const trainerForm = document.getElementById('trainerForm');
    const formTrainerId = document.getElementById('formTrainerId');
    const formTrainerName = document.getElementById('formTrainerName');
    const formTrainerExpertise = document.getElementById('formTrainerExpertise');
    const formTrainerContact = document.getElementById('formTrainerMobile');
    const formTrainerEmail = document.getElementById('formTrainerEmail');
    const formTrainerSecurityQuestion = document.getElementById('formTrainerSecurityQuestion');
    const formTrainerSecurityAnswer = document.getElementById('formTrainerSecurityAnswer');
    const formTrainerMessage = document.getElementById('trainerFormMessage');

    const viewTrainerRequestButton = document.getElementById('requestTrainer');
    const listTrainers = document.getElementById('editTrainer');
    

    const addTrainerBtn = document.getElementById('addTrainerBtn');
    
    addTrainerBtn.onclick = function() {
        const addTrainerModal = document.getElementById('trainerFormModal');
        addTrainerModal.classList.add('show');
        openAddEditTrainerModal();
    }

    listTrainers.onclick = function() {
        window.location.href = 'admin_listTrainer.html';
    }

    function openAddEditTrainerModal(userId = null) {
        if (!trainerModal) return;

        showFormMessage(formTrainerMessage, '', '');
        trainerForm.reset();

        if (userId) { 
            trainerModalTitle.textContent = `Edit Trainer: ${userId}`;
            formTrainerId.value = userId;

            const users = JSON.parse(sessionStorage.getItem('users')) || [];
            const trainerToEdit = users.find(u => u.userId === userId);

            if (trainerToEdit) {
                formTrainerName.value = trainerToEdit.name || '';
                formTrainerExpertise.value = trainerToEdit.expertise || '';
                formTrainerContact.value = trainerToEdit.contact || '';
                formTrainerEmail.value = trainerToEdit.email || '';
                formTrainerSecurityQuestion.value = trainerToEdit.securityQuestion || '';
                formTrainerSecurityAnswer.value = trainerToEdit.securityAnswer || '';
                console.log('Populated trainer data for edit:', trainerToEdit);
            } else {
                showFormMessage(formTrainerMessage, 'error', 'Trainer not found for editing.');
                console.warn('Trainer not found for editing, userId:', userId);
                return;
            }
        } else { // Add mode
            console.log('Opening modal for adding new trainer.');
            trainerModalTitle.textContent = 'Add New Trainer';
            formTrainerId.value = '';
            formTrainerId.removeAttribute('required');
            formTrainerId.setAttribute('disabled', 'disabled');
            formTrainerId.placeholder = 'Auto-generated on Creation';
            console.log('Opening modal for new trainer.');
        }
        trainerModal.style.display = 'flex';
    }

    if (trainerForm) {
        trainerForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            console.log('Trainer form submitted.');

            const isEditMode = !!formTrainerId.value;

            if(!formTrainerContact.value && !formTrainerEmail.value){
                showFormMessage(formTrainerMessage, 'error', 'Please provide at least one contact detail: Email or Phone.');
                console.warn('No contact detail provided.');
                return;
            }


            const newTrainerData = {
                name: formTrainerName.value,
                expertise: formTrainerExpertise.value,
                mobile: formTrainerContact.value,
                email: formTrainerEmail.value,
                securityQuestion: formTrainerSecurityQuestion.value,
                securityAnswer: formTrainerSecurityAnswer.value
            };

            console.log(newTrainerData);

            if (!isEditMode) { // Adding a new trainer
                console.log('Attempting to add new trainer.');

                const newTrainer = {
                    role: 'trainer',
                    ...newTrainerData,
                    isFirstLogin: true,
                    status: 'Active'
                };

                const response = await fetch('/.netlify/functions/createTrainer',{
                    body:JSON.stringify(newTrainer),
                    method:'POST'
                }); 

                const data = await response.json();

                if(response.ok){
                    if(response.status==200){
                        showFormMessage(formTrainerMessage, 'success', `Trainer ${data.trainer.id} updated successfully!`);
                    }
                }
                showFormMessage(formTrainerMessage, 'success', 'Trainer added successfully!');
            } else { // Editing an existing trainer
                console.log('Attempting to edit existing trainer.');
                const userIdToEdit = formTrainerId.value;
                const response = await fetch('/.netlify/functions/editTrainer',{
                        body:JSON.stringify(newTrainer),
                        method:'POST'
                }); 

                const data = response.json();

                if(response.ok){
                    if(response.status==200){
                        showFormMessage(formTrainerMessage, 'success', `Trainer ${data.trainer.id} updated successfully!`);
                    }
                }
                else {
                showFormMessage(formTrainerMessage, 'error', 'Error: Trainer not found for update.');
                console.error('Trainer not found for update, userId:', userIdToEdit);
            }
        }
    });
}



    // --- Modal Event Listeners ---
// Initial render
    // renderTrainersTable();
});
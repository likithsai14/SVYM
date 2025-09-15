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
    const formTrainerContact = document.getElementById('formTrainerContact');
    const formTrainerPin = document.getElementById('formTrainerPin');
    const formTrainerConfirmPin = document.getElementById('formTrainerConfirmPin');
    const formTrainerSecurityQuestion = document.getElementById('formTrainerSecurityQuestion');
    const formTrainerSecurityAnswer = document.getElementById('formTrainerSecurityAnswer');
    const formTrainerPinGroup = document.getElementById('formTrainerPinGroup');
    const formTrainerConfirmPinGroup = document.getElementById('formTrainerConfirmPinGroup');
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
            formTrainerPinGroup.style.display = 'none';
            formTrainerPin.removeAttribute('required');
            formTrainerConfirmPinGroup.style.display = 'none';
            formTrainerConfirmPin.removeAttribute('required');

            const users = JSON.parse(sessionStorage.getItem('users')) || [];
            const trainerToEdit = users.find(u => u.userId === userId);

            if (trainerToEdit) {
                formTrainerName.value = trainerToEdit.name || '';
                formTrainerExpertise.value = trainerToEdit.expertise || '';
                formTrainerContact.value = trainerToEdit.contact || '';
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
            formTrainerPin.setAttribute('required', 'required');
            formTrainerConfirmPin.setAttribute('required', 'required');
            console.log('Opening modal for new trainer.');
        }
        trainerModal.style.display = 'flex';
    }

    if (trainerForm) {
        trainerForm.addEventListener('submit', function(event) {
            event.preventDefault();
            console.log('Trainer form submitted.');

            const isEditMode = !!formTrainerId.value;
            let users = JSON.parse(sessionStorage.getItem('users')) || [];

            const newTrainerData = {
                name: formTrainerName.value,
                expertise: formTrainerExpertise.value,
                contact: formTrainerContact.value,
                securityQuestion: formTrainerSecurityQuestion.value,
                securityAnswer: formTrainerSecurityAnswer.value
            };

            console.log(newTrainerData);

            if (!isEditMode) { // Adding a new trainer
                console.log('Attempting to add new trainer.');
                if (formTrainerPin.value !== formTrainerConfirmPin.value) {
                    showFormMessage(formTrainerMessage, 'error', 'PIN and Confirm PIN do not match.');
                    console.warn('Trainer PIN mismatch.');
                    return;
                }
                if (formTrainerPin.value.length !== 4 || !/^\d{4}$/.test(formTrainerPin.value)) {
                    showFormMessage(formTrainerMessage, 'error', 'PIN must be a 4-digit number.');
                    console.warn('Invalid Trainer PIN format.');
                    return;
                }

                if (users.some(u => u.contact && u.contact.toLowerCase() === newTrainerData.contact.toLowerCase())) {
                    showFormMessage(formTrainerMessage, 'error', 'A trainer with this Contact (Email/Phone) already exists.');
                    console.warn('Duplicate trainer contact:', newTrainerData.contact);
                    return;
                }

                // send request to appropriate route here

                const newTrainer = {
                    role: 'trainer',
                    ...newTrainerData,
                    pin: formTrainerPin.value,
                    isFirstLogin: true,
                    status: 'Active'
                };

                // send request to appropriate route here


                showFormMessage(formTrainerMessage, 'success', 'Trainer added successfully!');

            } else { // Editing an existing trainer
                console.log('Attempting to edit existing trainer.');
                const userIdToEdit = formTrainerId.value;
                const trainerIndex = users.findIndex(u => u.userId === userIdToEdit);

                if (trainerIndex !== -1) {
                    if (users.some((u, idx) => u.contact && u.contact.toLowerCase() === newTrainerData.contact.toLowerCase() && idx !== trainerIndex)) {
                        showFormMessage(formTrainerMessage, 'error', 'A trainer with this Contact (Email/Phone) already exists.');
                        console.warn('Duplicate trainer contact during edit:', newTrainerData.contact);
                        return;
                    }

                    // send request to appropriate route here

                    showFormMessage(formTrainerMessage, 'success', `Trainer ${userIdToEdit} updated successfully!`);
                } else {
                    showFormMessage(formTrainerMessage, 'error', 'Error: Trainer not found for update.');
                    console.error('Trainer not found for update, userId:', userIdToEdit);
                }
            }

            sessionStorage.setItem('users', JSON.stringify(users));
            console.log('Users array saved to sessionStorage. Current sessionStorage users:', JSON.parse(sessionStorage.getItem('users')));
            renderTrainersTable();
            setTimeout(() => {
                if (trainerModal) trainerModal.style.display = 'none';
            }, 1500);
        });
    }



    // --- Modal Event Listeners ---
// Initial render
    // renderTrainersTable();
});
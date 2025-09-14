document.addEventListener('DOMContentLoaded', function() {
    // Check if the user is an admin; if not, redirect to login.
    const adminLoggedIn = sessionStorage.getItem('isAdminLoggedIn');
    if (!adminLoggedIn || adminLoggedIn !== 'true') {
        console.log('Admin not logged in, redirecting to login.html');
        window.location.href = 'login.html';
        return;
    }

    const adminLogoutBtn = document.getElementById('adminLogoutBtn');
    const sidebar = document.getElementById('sidebar');
    const hamburgerMenu = document.getElementById('hamburgerMenu');

    // Toggle sidebar on hamburger menu click (for mobile)
    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    // --- Logout Functionality ---
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', function() {
            sessionStorage.removeItem('adminLoggedIn');
            sessionStorage.removeItem('loggedInAdminUsername');
            window.location.href = 'login.html';
        });
    }

    // =========================================================
    // --- Trainer Management Logic (CRUD Operations) ---
    // =========================================================
    const trainersTableBody = document.getElementById('trainersTableBody');
    const addTrainerBtn = document.getElementById('addTrainerBtn');
    const trainerModal = document.getElementById('trainerModal');
    const closeTrainerModalBtn = trainerModal ? trainerModal.querySelector('.close-button') : null;
    const cancelTrainerButton = trainerModal ? trainerModal.querySelector('.cancel-button') : null;
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

    // Utility function to show form-specific messages
    function showFormMessage(messageElement, type, text) {
        messageElement.textContent = text;
        messageElement.className = `message ${type}`;
        messageElement.style.display = 'block';
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 3000);
    }

    function renderTrainersTable() {
        console.log('renderTrainersTable called.');
        const users = JSON.parse(sessionStorage.getItem('users')) || [];
        const trainers = users.filter(user => user.role === 'trainer');
        console.log('Filtered trainers:', trainers);

        if (trainersTableBody) {
            trainersTableBody.innerHTML = '';
            if (trainers.length === 0) {
                trainersTableBody.innerHTML = '<tr><td colspan="5">No trainer records found.</td></tr>';
            } else {
                trainers.forEach(trainer => {
                    const row = `
                        <tr>
                            <td>${trainer.userId}</td>
                            <td>${trainer.name || 'N/A'}</td>
                            <td>${trainer.expertise || 'N/A'}</td>
                            <td>${trainer.contact || 'N/A'}</td>
                            <td>
                                <button class="action-btn-primary edit-trainer-btn" data-user-id="${trainer.userId}">Edit</button>
                                <button class="action-btn-danger delete-trainer-btn" data-user-id="${trainer.userId}">Delete</button>
                            </td>
                        </tr>
                    `;
                    trainersTableBody.insertAdjacentHTML('beforeend', row);
                });

                trainersTableBody.querySelectorAll('.edit-trainer-btn').forEach(button => {
                    button.addEventListener('click', function() {
                        const userIdToEdit = this.dataset.userId;
                        openAddEditTrainerModal(userIdToEdit);
                    });
                });

                trainersTableBody.querySelectorAll('.delete-trainer-btn').forEach(button => {
                    button.addEventListener('click', function() {
                        const userIdToDelete = this.dataset.userId;
                        deleteTrainer(userIdToDelete);
                    });
                });
            }
        } else {
            console.error('trainersTableBody element not found!');
        }
    }

    function openAddEditTrainerModal(userId = null) {
        if (!trainerModal) return;

        showFormMessage(formTrainerMessage, '', '');
        trainerForm.reset();

        if (userId) { // Edit mode
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
            trainerModalTitle.textContent = 'Add New Trainer';
            formTrainerId.value = '';
            formTrainerPinGroup.style.display = 'block';
            formTrainerPin.setAttribute('required', 'required');
            formTrainerConfirmPinGroup.style.display = 'block';
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

                let newUserId;
                do {
                    newUserId = 'TRN' + Math.floor(100 + Math.random() * 900);
                } while (users.some(u => u.userId === newUserId));

                const newTrainer = {
                    userId: newUserId,
                    role: 'trainer',
                    ...newTrainerData,
                    pin: formTrainerPin.value,
                    isFirstLogin: true,
                    status: 'Active'
                };

                users.push(newTrainer);
                console.log('New trainer object created and added to array:', newTrainer);
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

                    users[trainerIndex] = {
                        ...users[trainerIndex],
                        ...newTrainerData
                    };
                    console.log('Trainer updated in array:', users[trainerIndex]);
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

    function deleteTrainer(userId) {
        if (confirm(`Are you sure you want to delete trainer ${userId}? This action cannot be undone.`)) {
            console.log('Attempting to delete trainer:', userId);
            let users = JSON.parse(sessionStorage.getItem('users')) || [];
            const initialLength = users.length;
            users = users.filter(user => user.userId !== userId);

            if (users.length < initialLength) {
                sessionStorage.setItem('users', JSON.stringify(users));
                console.log('Trainer deleted from sessionStorage. Remaining users:', JSON.parse(sessionStorage.getItem('users')));
                renderTrainersTable();
                showMainMessage('success', `Trainer ${userId} deleted successfully.`);
            } else {
                showMainMessage('error', 'Error: Trainer not found for deletion.');
                console.error('Trainer not found for deletion:', userId);
            }
        }
    }

    // --- Modal Event Listeners ---
    if (addTrainerBtn) addTrainerBtn.addEventListener('click', () => openAddEditTrainerModal());
    if (closeTrainerModalBtn) closeTrainerModalBtn.addEventListener('click', () => trainerModal.style.display = 'none');
    if (cancelTrainerButton) cancelTrainerButton.addEventListener('click', () => trainerModal.style.display = 'none');
    if (trainerModal) {
        window.addEventListener('click', (event) => {
            if (event.target === trainerModal) {
                trainerModal.style.display = 'none';
            }
        });
    }

    // Initial render
    renderTrainersTable();
});
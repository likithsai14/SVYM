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
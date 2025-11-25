document.addEventListener("DOMContentLoaded", () => {
    console.log("Admin Organization page loaded.");

    // Initialize data
    loadOrganizationData();

    // FAQ toggle functionality
    setupFAQToggle();

    // Event listeners for buttons
    setupEventListeners();

    // Setup modal close functionality
    setupModalClose();

    // Add input event listener for memberName input to prevent digits and capitalize first letter of each word
    const memberNameInput = document.getElementById('memberName');
    if (memberNameInput) {

        // Prevent digit entry on keypress
        memberNameInput.addEventListener('keypress', (e) => {
            const char = String.fromCharCode(e.which);
            if (/\d/.test(char)) {
                e.preventDefault();
            }
        });

        // Sanitize input on input event, remove digits and unwanted characters, then capitalize words
        memberNameInput.addEventListener('input', (e) => {
            // Remove digits and other non-alphabetic characters except spaces
            let sanitized = e.target.value.replace(/[^a-zA-Z\s]/g, '');

            // Capitalize first letter of each word
            let words = sanitized.split(' ');
            for (let i = 0; i < words.length; i++) {
                if (words[i].length > 0) {
                    words[i] = words[i][0].toUpperCase() + words[i].substr(1);
                }
            }
            e.target.value = words.join(' ');
        });
    }

    // Add input event listener for memberRole input to prevent digits and capitalize first letter of each word
    const memberRoleInput = document.getElementById('memberRole');
    if (memberRoleInput) {

        // Prevent digit entry on keypress
        memberRoleInput.addEventListener('keypress', (e) => {
            const char = String.fromCharCode(e.which);
            if (/\d/.test(char)) {
                e.preventDefault();
            }
        });

        // Sanitize input on input event, remove digits and unwanted characters, then capitalize words
        memberRoleInput.addEventListener('input', (e) => {
            // Remove digits and other non-alphabetic characters except spaces
            let sanitized = e.target.value.replace(/[^a-zA-Z\s]/g, '');

            // Capitalize first letter of each word
            let words = sanitized.split(' ');
            for (let i = 0; i < words.length; i++) {
                if (words[i].length > 0) {
                    words[i] = words[i][0].toUpperCase() + words[i].substr(1);
                }
            }
            e.target.value = words.join(' ');
        });
    }
});

async function loadOrganizationData() {
    try {
        const [aboutData, helpData, contactData, teamData] = await Promise.all([
            fetch('/.netlify/functions/org-get-aboutus').then(res => res.json()),
            fetch('/.netlify/functions/org-get-help-faqs').then(res => res.json()),
            fetch('/.netlify/functions/org-get-contact').then(res => res.json()),
            fetch('/.netlify/functions/org-get-team').then(res => res.json())
        ]);

        console.log("Fetched org team data:", teamData);

        populateAboutSection(aboutData);
        populateHelpSection(helpData);
        populateContactSection(contactData);
        populateSocialSection(contactData);
        populateTeamSection(teamData);
    } catch (error) {
        console.error('Error loading organization data:', error);
    }
}

function populateAboutSection(data) {
    document.getElementById('orgMission').textContent = data.mission;
    document.getElementById('orgVision').textContent = data.vision;
    document.getElementById('orgValues').textContent = data.values.join(', ');
}

function populateContactSection(contactData) {
    const contactContent = document.getElementById('contactContent');
    if (!contactContent) {
        console.error('contactContent element not found');
        return;
    }
    contactContent.innerHTML = '';

    // Emails
    const emailsContainer = document.createElement('div');
    emailsContainer.className = 'contact-list-item';
    emailsContainer.innerHTML = `
        <div class="header-container">
            <h4>Email</h4>
            <button id="addEmailBtn" class="add-btn-small"><i class="fas fa-plus"></i></button>
        </div>
        <div class="contact-list" id="emailList">
        </div>
    `;
    contactContent.appendChild(emailsContainer);

    // Phones
    const phonesContainer = document.createElement('div');
    phonesContainer.className = 'contact-list-item';
    phonesContainer.innerHTML = `
        <div class="header-container">
            <h4>Phone</h4>
            <button id="addPhoneBtn" class="add-btn-small"><i class="fas fa-plus"></i></button>
        </div>
        <div class="contact-list" id="phoneList">
        </div>
    `;
    contactContent.appendChild(phonesContainer);

    // Addresses
    const addressesContainer = document.createElement('div');
    addressesContainer.className = 'contact-list-item';
    addressesContainer.innerHTML = `
        <div class="header-container">
            <h4>Address</h4>
            <button id="addAddressBtn" class="add-btn-small"><i class="fas fa-plus"></i></button>
        </div>
        <div class="contact-list" id="addressList">
        </div>
    `;
    contactContent.appendChild(addressesContainer);

    // Populate lists
    populateContactLists(contactData);
}

function populateSocialSection(socialData) {
    const socialContent = document.getElementById('socialContent');
    if (!socialContent) {
        console.error('socialContent element not found');
        return;
    }
    socialContent.innerHTML = '';

    const socialContainer = document.createElement('div');
    socialContainer.className = 'contact-list-item';
    socialContainer.innerHTML = `
        <div class="contact-list" id="socialList">
        </div>
    `;
    socialContent.appendChild(socialContainer);

    function toTitleCase(str) {
        return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
    }

    // Populate social list only
    const socialList = document.getElementById('socialList');
    socialList.innerHTML = '';
    if (socialData.socialMedia) {
        Object.entries(socialData.socialMedia).forEach(([platform, url]) => {
            const displayPlatform = platform.toLowerCase() === 'twitter' ? 'X' : toTitleCase(platform);
            const item = document.createElement('div');
            item.className = 'contact-item';
            item.innerHTML = `
                <span>${displayPlatform}</span>
                <div class="org-actions">
                    <button class="view-btn" data-type="social-view" data-platform="${platform}" data-url="${url}"><i class="fas fa-eye"></i></button>
                    <button class="edit-btn" data-type="social" data-platform="${platform}" data-url="${url}"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" data-type="social" data-platform="${platform}"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            socialList.appendChild(item);
        });
    }
}

function populateHelpSection(data) {
    const helpContent = document.getElementById('helpContent');
    helpContent.innerHTML = '';

    data.forEach((faq, index) => {
        const faqItem = document.createElement('div');
        faqItem.className = 'faq-item';
        faqItem.innerHTML = `
            <div class="faq-content">
                <div class="faq-question">
                    ${index + 1}. ${faq.qtn}
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="faq-answer">
                    ${faq.answer}
                </div>
            </div>
            <div class="org-actions">
                <button class="view-btn" data-id="${index}"><i class="fas fa-eye"></i></button>
                <button class="edit-btn" data-id="${index}"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" data-id="${index}"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
        helpContent.appendChild(faqItem);
    });

    setupFAQToggle();
}



function populateTeamSection(data) {
    const teamContent = document.getElementById('teamContent');
    teamContent.innerHTML = '';

    console.log(`Rendering ${data.length} team members`);  // Added log

    if (data && data.length > 0) {
        data.forEach((member, index) => {
            const memberItem = document.createElement('div');
            memberItem.className = 'member-item';
            memberItem.innerHTML = `
                <div class="member-info">
                    <p class="member-name">${member.name}</p>
                    <p class="member-role">${member.role}</p>
                </div>
                <div class="org-actions">
                    <button class="view-btn" data-type="team" data-index="${index}"><i class="fas fa-eye"></i></button>
                    <button class="edit-btn" data-type="team" data-index="${index}"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" data-type="team" data-index="${index}"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            teamContent.appendChild(memberItem);
        });
    } else {
        teamContent.innerHTML = '<p>No team members added yet.</p>';
    }
}

function setupFAQToggle() {
    const faqItems = document.querySelectorAll(".faq-item");
    faqItems.forEach(item => {
        const question = item.querySelector(".faq-question");
        const answer = item.querySelector(".faq-answer");

        question.addEventListener("click", () => {
            const isActive = item.classList.toggle("active");
            if (isActive) {
                answer.style.maxHeight = answer.scrollHeight + "px";
            } else {
                answer.style.maxHeight = "0";
            }
        });
    });
}

function setupEventListeners() {
    // About section buttons
    const viewMissionBtn = document.getElementById('viewMissionBtn');
    if (viewMissionBtn) viewMissionBtn.addEventListener('click', () => openViewMissionModal());
    const editMissionBtn = document.getElementById('editMissionBtn');
    if (editMissionBtn) editMissionBtn.addEventListener('click', () => openMissionModal());
    const viewVisionBtn = document.getElementById('viewVisionBtn');
    if (viewVisionBtn) viewVisionBtn.addEventListener('click', () => openViewVisionModal());
    const editVisionBtn = document.getElementById('editVisionBtn');
    if (editVisionBtn) editVisionBtn.addEventListener('click', () => openVisionModal());
    const viewValuesBtn = document.getElementById('viewValuesBtn');
    if (viewValuesBtn) viewValuesBtn.addEventListener('click', () => openViewValuesModal());
    const editValuesBtn = document.getElementById('editValuesBtn');
    if (editValuesBtn) editValuesBtn.addEventListener('click', () => openValuesModal());

    // Add Contact Add buttons explicitly
    const addEmailBtn = document.getElementById('addEmailBtn');
    if (addEmailBtn) addEmailBtn.addEventListener('click', () => openContactItemModal('email'));
    const addPhoneBtn = document.getElementById('addPhoneBtn');
    if (addPhoneBtn) addPhoneBtn.addEventListener('click', () => openContactItemModal('phone'));
    const addAddressBtn = document.getElementById('addAddressBtn');
    if (addAddressBtn) addAddressBtn.addEventListener('click', () => openContactItemModal('address'));

    // Help section buttons
    const addFaqBtn = document.getElementById('addFaqBtn');
    if (addFaqBtn) addFaqBtn.addEventListener('click', () => openFaqModal());

    // Team section buttons
    const addTeamMemberBtn = document.getElementById('addTeamMemberBtn');
    if (addTeamMemberBtn) addTeamMemberBtn.addEventListener('click', () => openTeamMemberModal());

    // FAQ view buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.view-btn[data-id]')) {
            const index = e.target.closest('.view-btn').dataset.id;
            openViewFaqModal(parseInt(index));
        }
    });

    // Team view buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.view-btn[data-type="team"]')) {
            const index = e.target.closest('.view-btn').dataset.index;
            openViewTeamMemberModal(parseInt(index));
        }
    });

    // Modal forms
    const missionForm = document.getElementById('missionForm');
    if (missionForm) missionForm.addEventListener('submit', handleMissionSubmit);
    const visionForm = document.getElementById('visionForm');
    if (visionForm) visionForm.addEventListener('submit', handleVisionSubmit);
    const faqForm = document.getElementById('faqForm');
    if (faqForm) faqForm.addEventListener('submit', handleFaqSubmit);
    const valueForm = document.getElementById('valueForm');
    if (valueForm) valueForm.addEventListener('submit', handleValueSubmit);
    const teamMemberForm = document.getElementById('teamMemberForm');
    if (teamMemberForm) teamMemberForm.addEventListener('submit', handleTeamMemberSubmit);
    const contactItemForm = document.getElementById('contactItemForm');
    if (contactItemForm) contactItemForm.addEventListener('submit', handleContactItemSubmit);
    const socialForm = document.getElementById('socialForm');
    if (socialForm) socialForm.addEventListener('submit', handleSocialSubmit); // Add this for social media submit
}

function openTeamMemberModal(index = null, name = '', role = '') {
    const header = document.querySelector('#teamMemberModal .modal-header h2');
    if (index !== null && index !== undefined) {
        if (header) header.textContent = 'Edit Member';
    } else {
        if (header) header.textContent = 'Add Member';
    }
    document.getElementById('memberName').value = name;
    document.getElementById('memberRole').value = role;
    document.getElementById('teamMemberForm').dataset.index = index;
    document.getElementById('teamMemberModal').classList.add('show');
}

async function handleTeamMemberSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('memberName').value.trim();
    const role = document.getElementById('memberRole').value.trim();
    const index = e.target.dataset.index;

    try {
        let response;
        if (index !== 'null' && index !== '') {
            // Edit
            response = await fetch('/.netlify/functions/org-team-edit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ index: parseInt(index), name, role })
            });
        } else {
            // Add
            response = await fetch('/.netlify/functions/org-team-add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, role })
            });
        }

        if (response.ok) {
            closeModal('teamMemberModal');
            loadOrganizationData();
        } else {
            alert('Error updating team member');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error updating team member');
    }
}

// Modal functions
function openMissionModal() {
    const missionText = document.getElementById('orgMission').textContent;
    document.getElementById('missionText').value = missionText;
    document.getElementById('missionModal').classList.add('show');
}

function openVisionModal() {
    const visionText = document.getElementById('orgVision').textContent;
    document.getElementById('visionText').value = visionText;
    document.getElementById('visionModal').classList.add('show');
}

function openValuesModal() {
    fetch('/.netlify/functions/org-get-aboutus')
        .then(res => res.json())
        .then(data => {
            const valuesTextarea = document.getElementById('valuesTextarea');
            valuesTextarea.value = data.values.join('\n');
            document.getElementById('valuesModal').classList.add('show');
        });
}

async function handleValuesSubmit(event) {
    event.preventDefault();
    const textarea = document.getElementById('valuesTextarea');
    const valuesArray = textarea.value
        .split('\n')
        .map(v => v.trim())
        .filter(v => v.length > 0);

    try {
        const response = await fetch('/.netlify/functions/org-update-values-bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ values: valuesArray })
        });

        if (response.ok) {
            // Close modal and reload data
            closeModal('valuesModal');
            loadOrganizationData();
        } else {
            alert('Error updating values');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error updating values');
    }
}

// Add event listener for values form submit
document.addEventListener('DOMContentLoaded', () => {
    const valuesForm = document.getElementById('valuesForm');
    if (valuesForm) {
        valuesForm.addEventListener('submit', handleValuesSubmit);
    }
});



function openValueEditModal(index = null, value = '') {
    document.getElementById('valueText').value = value;
    document.getElementById('valueForm').dataset.index = index;
    document.getElementById('valueForm').dataset.oldValue = value;
    document.getElementById('valueEditModal').classList.add('show');
}

function openFaqModal(index = null) {
    const header = document.querySelector('#faqModal .modal-header h2');
    if (index !== null) {
        // Edit mode
        fetch('/.netlify/functions/org-get-help-faqs')
            .then(res => res.json())
            .then(data => {
                const faq = data[index];
                document.getElementById('faqQuestion').value = faq.qtn;
                document.getElementById('faqAnswer').value = faq.answer;
                document.getElementById('faqForm').dataset.index = index;
                if (header) header.textContent = 'Edit FAQ';
            });
    } else {
        // Add mode
        document.getElementById('faqQuestion').value = '';
        document.getElementById('faqAnswer').value = '';
        document.getElementById('faqForm').dataset.index = '';
        if (header) header.textContent = "Add FAQ";
    }
    document.getElementById('faqModal').classList.add('show');
}

function openContactModal() {
    // Load current contact data
    fetch('/.netlify/functions/org-get-contact')
        .then(res => res.json())
        .then(data => {
            populateContactLists(data);
            document.getElementById('contactModal').classList.add('show');
        });
}

function populateContactLists(data) {
    // Emails
    const emailsList = document.getElementById('emailList');
    emailsList.innerHTML = '';
    if (data.emails) {
        data.emails.forEach((email, index) => {
            const item = document.createElement('div');
            item.className = 'contact-item';
            item.innerHTML = `
                <span>${email}</span>
                <div class="org-actions">
                    <button class="edit-btn" data-type="email" data-index="${index}"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" data-type="email" data-index="${index}"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            emailsList.appendChild(item);
        });
    }

    // Phones
    const phonesList = document.getElementById('phoneList');
    phonesList.innerHTML = '';
    if (data.phones) {
        data.phones.forEach((phone, index) => {
            const item = document.createElement('div');
            item.className = 'contact-item';
            item.innerHTML = `
                <span>${phone}</span>
                <div class="org-actions">
                    <button class="edit-btn" data-type="phone" data-index="${index}"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" data-type="phone" data-index="${index}"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            phonesList.appendChild(item);
        });
    }

    // Addresses
    const addressesList = document.getElementById('addressList');
    addressesList.innerHTML = '';
    if (data.addresses) {
        data.addresses.forEach((address, index) => {
            const item = document.createElement('div');
            item.className = 'contact-item';
            item.innerHTML = `
                <span>${address}</span>
                <div class="org-actions">
                    <button class="edit-btn" data-type="address" data-index="${index}"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" data-type="address" data-index="${index}"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            addressesList.appendChild(item);
        });
    }

    // Social Media
    const socialList = document.getElementById('socialList');
        if (data.socialMedia) {
            Object.entries(data.socialMedia).forEach(([platform, url]) => {
                const displayPlatform = platform.toLowerCase() === 'twitter' ? 'X' : platform;
                const item = document.createElement('div');
                item.className = 'contact-item';
                item.innerHTML = `
                    <span><a href="${url}" target="_blank">${displayPlatform}</a></span>
                    <div class="org-actions">
                        <button class="view-btn" data-type="social-view" data-platform="${platform}" data-url="${url}"><i class="fas fa-eye"></i></button>
                        <button class="edit-btn" data-type="social" data-platform="${platform}" data-url="${url}"><i class="fas fa-edit"></i></button>
                        <button class="delete-btn" data-type="social" data-platform="${platform}"><i class="fas fa-trash-alt"></i></button>
                    </div>
                `;
                socialList.appendChild(item);
            });
        }
}



function openContactItemModal(type, index = null, value = '') {
    console.log('Opening contact item modal for type:', type, 'index:', index, 'value:', value);
    const modal = document.getElementById('contactItemModal');
    const header = modal.querySelector('.modal-header h2');
    const label = modal.querySelector('label[for="contactItemValue"]');
    const input = document.getElementById('contactItemValue');
    const errorDiv = document.getElementById('contactItemError');

    // Set dynamic header
    const action = index !== null ? 'Edit' : 'Add';
    const typeCapitalized = type.charAt(0).toUpperCase() + type.slice(1);
    header.textContent = `${action} ${typeCapitalized}`;

    // Set dynamic label
    label.textContent = typeCapitalized + ':';

    // Clear any previous error
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';

    // Fix maxLength setting to avoid zero or invalid
    if (type === 'phone') {
        input.type = 'text';
        input.placeholder = 'Enter 10-digit phone number';
        input.maxLength = 10;
        // Restrict input to digits only
        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    } else if (type === 'email') {
        input.type = 'email';
        input.placeholder = 'Enter email address';
        // Remove maxLength setting to avoid invalid zero
        input.removeAttribute('maxLength');
        // Remove any previous input restriction listener
        input.removeEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    } else if (type === 'address') {
        input.type = 'text';
        input.placeholder = 'Enter address';
        // Remove maxLength setting to avoid invalid zero
        input.removeAttribute('maxLength');
        // Remove any previous input restriction listener for digits only (this is only for phone)
        input.removeEventListener('input', (e) => {
            // No digits only restriction here - do nothing
        });
    }

    input.value = value;
    // Set oldValue for edit mode to send in request body
    document.getElementById('contactItemForm').dataset.oldValue = value;

    // Ensure focus after modal is shown
    setTimeout(() => {
        input.focus();
        console.log('Input focused for type:', type);
    }, 100);
    document.getElementById('contactItemForm').dataset.type = type;
    document.getElementById('contactItemForm').dataset.index = index;
    modal.classList.add('show');
}

function openSocialModal(platform = '', url = '') {
    console.log("openSocialModal called with platform:", platform, "url:", url);
    const header = document.querySelector('#socialModal .modal-header h2');
    const socialPlatformInput = document.getElementById('socialPlatform');
    if (platform) {
        if (header) header.textContent = 'Edit Social Media';
        if (socialPlatformInput) {
            socialPlatformInput.value = platform;
            socialPlatformInput.disabled = true;  // make platform non-editable in edit mode
        }
    } else {
        if (header) header.textContent = 'Add Social Media';
        if (socialPlatformInput) {
            socialPlatformInput.value = '';
            socialPlatformInput.disabled = false;  // editable in add mode
        }
    }
    document.getElementById('socialUrl').value = url;
    document.getElementById('socialForm').dataset.platform = platform; // store original platform for edit
    document.getElementById('socialModal').classList.add('show');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        // Prevent body scroll when modal is closed
        document.body.style.overflow = '';
    }
}

function setupModalClose() {
    // Close modal on close button click
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('close-btn') || e.target.closest('.close-btn')) {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.classList.remove('show');
                document.body.style.overflow = '';
            }
        }
    });

    // Close modal on outside click
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('show');
            document.body.style.overflow = '';
        }
    });

    // Add support for cancel buttons inside modals to close modal
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('cancel-btn') || e.target.closest('.cancel-btn')) {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.classList.remove('show');
                document.body.style.overflow = '';
            }
        }
    });

    // Prevent body scroll when modal is open and stop propagation for inputs inside modals
    document.addEventListener('click', (e) => {
        const openModals = document.querySelectorAll('.modal.show');
        document.body.style.overflow = openModals.length > 0 ? 'hidden' : '';

        // If the click is inside a modal and not on a close or cancel button, stop propagation to prevent global handlers
        if (e.target.closest('.modal.show') && !e.target.classList.contains('close-btn') && !e.target.closest('.close-btn') && !e.target.classList.contains('cancel-btn') && !e.target.closest('.cancel-btn')) {
            e.stopPropagation();
        }
    });
}

// View modal functions
function openViewMissionModal() {
    const missionText = document.getElementById('orgMission').textContent;
    document.getElementById('viewMissionText').textContent = missionText;
    document.getElementById('viewMissionModal').classList.add('show');
}

function openViewVisionModal() {
    const visionText = document.getElementById('orgVision').textContent;
    document.getElementById('viewVisionText').textContent = visionText;
    document.getElementById('viewVisionModal').classList.add('show');
}

function openViewValuesModal() {
    fetch('/.netlify/functions/org-get-aboutus')
        .then(res => res.json())
        .then(data => {
            const valuesList = document.getElementById('viewValuesList');
            valuesList.innerHTML = '';
            data.values.forEach(value => {
                const li = document.createElement('li');
                li.textContent = value;
                valuesList.appendChild(li);
            });
            document.getElementById('viewValuesModal').classList.add('show');
        });
}

function openViewFaqModal(index) {
    fetch('/.netlify/functions/org-get-help-faqs')
        .then(res => res.json())
        .then(data => {
            const faq = data[index];
            document.getElementById('viewFaqQuestion').textContent = faq.qtn;
            document.getElementById('viewFaqAnswer').textContent = faq.answer;
            document.getElementById('viewFaqModal').classList.add('show');
        });
}

function openViewContactModal(type, index) {
    fetch('/.netlify/functions/org-get-contact')
        .then(res => res.json())
        .then(data => {
            const content = document.getElementById('viewContactContent');
            content.innerHTML = '';

            let value = '';
            if (type === 'email' && data.emails && data.emails[index]) {
                value = data.emails[index];
                content.innerHTML = `<h4>Email</h4><p>${value}</p>`;
            } else if (type === 'phone' && data.phones && data.phones[index]) {
                value = data.phones[index];
                content.innerHTML = `<h4>Phone</h4><p>${value}</p>`;
            } else if (type === 'address' && data.addresses && data.addresses[index]) {
                value = data.addresses[index];
                content.innerHTML = `<h4>Address</h4><p>${value}</p>`;
            }

            document.getElementById('viewContactModal').classList.add('show');
        });
}

function openViewTeamMemberModal(index) {
    fetch('/.netlify/functions/org-get-team')
        .then(res => res.json())
        .then(data => {
            const member = data[index];
            document.getElementById('viewMemberName').textContent = member.name;
            document.getElementById('viewMemberRole').textContent = member.role;
            document.getElementById('viewTeamMemberModal').classList.add('show');
        });
}

function openViewSocialModal(platform, url) {
    document.getElementById('viewSocialPlatform').textContent = platform;
    const urlElement = document.getElementById('viewSocialUrl');
    urlElement.href = url;
    urlElement.textContent = url;
    document.getElementById('viewSocialModal').classList.add('show');
}

// Form handlers
async function handleMissionSubmit(e) {
    e.preventDefault();
    const mission = document.getElementById('missionText').value.trim();
    try {
        const response = await fetch('/.netlify/functions/org-update-mission', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mission })
        });
        if (response.ok) {
            closeModal('missionModal');
            loadOrganizationData();
        } else {
            alert('Error updating mission');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error updating mission');
    }
}

async function handleVisionSubmit(e) {
    e.preventDefault();
    const vision = document.getElementById('visionText').value.trim();
    try {
        const response = await fetch('/.netlify/functions/org-update-vision', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vision })
        });
        if (response.ok) {
            closeModal('visionModal');
            loadOrganizationData();
        } else {
            alert('Error updating vision');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error updating vision');
    }
}

async function handleValueSubmit(e) {
    e.preventDefault();
    const value = document.getElementById('valueText').value.trim();
    const index = e.target.dataset.index;
    const oldValue = e.target.dataset.oldValue;

    try {
        let response;
        if (index !== 'null' && index !== '') {
            // Edit
            response = await fetch('/.netlify/functions/org-update-values-edit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ oldValue, newValue: value })
            });
        } else {
            // Add
            response = await fetch('/.netlify/functions/org-update-values-add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value })
            });
        }

        if (response.ok) {
            closeModal('valueEditModal');
            closeModal('valuesModal');
            loadOrganizationData();
        } else {
            alert('Error updating value');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error updating value');
    }
}

async function handleFaqSubmit(e) {
    e.preventDefault();
    const question = document.getElementById('faqQuestion').value.trim();
    const answer = document.getElementById('faqAnswer').value.trim();
    const index = e.target.dataset.index;

    // Validation for digits only input
    const digitOnlyRegex = /^\d+$/;
    if (digitOnlyRegex.test(question) || digitOnlyRegex.test(answer)) {
        alert('Please enter valid details');
        return;
    }

    try {
        let response;
        if (index !== '') {
            // Edit
            response = await fetch('/.netlify/functions/org-faq-edit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ index: parseInt(index), qtn: question, answer })
            });
        } else {
            // Add
            response = await fetch('/.netlify/functions/org-faq-add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ qtn: question, answer })
            });
        }

        if (response.ok) {
            closeModal('faqModal');
            loadOrganizationData();
        } else {
            alert('Error updating FAQ');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error updating FAQ');
    }
}

async function handleContactItemSubmit(e) {
    e.preventDefault();
    const input = document.getElementById('contactItemValue');
    const value = input.value.trim();
    const type = e.target.dataset.type;
    const index = e.target.dataset.index;
    const oldValue = e.target.dataset.oldValue;
    const errorDiv = document.getElementById('contactItemError');

    // Validation
    let isValid = true;
    let errorMessage = '';

    if (type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address.';
        }
    } else if (type === 'phone') {
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a 10-digit phone number.';
        }
    } else if (type === 'address') {
        if (value.length < 5) {
            isValid = false;
            errorMessage = 'Please enter a valid address (at least 5 characters).';
        } else if (/^\d+$/.test(value)) {
            // If address is digits only, invalid
            isValid = false;
            errorMessage = 'Please enter valid address';
        }
    }

    if (!isValid) {
        errorDiv.textContent = errorMessage;
        errorDiv.style.display = 'block';
        input.focus();
        return;
    }

    // Clear error
    errorDiv.style.display = 'none';

    const endpoints = {
        email: index !== 'null' ? 'org-email-edit' : 'org-email-add',
        phone: index !== 'null' ? 'org-phone-edit' : 'org-phone-add',
        address: index !== 'null' ? 'org-address-edit' : 'org-address-add'
    };

    let body = {};

    if (index !== 'null') {
        if (type === 'email') {
            body = { oldEmail: oldValue, newEmail: value };
        } else if (type === 'phone') {
            body = { oldPhone: oldValue, newPhone: value };
        } else if (type === 'address') {
            body = { oldAddress: oldValue, newAddress: value };
        }
    } else {
        body = { [type]: value };
    }

    try {
        const response = await fetch(`/.netlify/functions/${endpoints[type]}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (response.ok) {
            closeModal('contactItemModal');
            closeModal('contactModal');
            loadOrganizationData();
        } else {
            alert(`Error updating ${type}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`Error updating ${type}`);
    }
}

async function handleSocialSubmit(e) {
    e.preventDefault();
    console.log("handleSocialSubmit called");
    let platform = document.getElementById('socialPlatform').value.trim();
    const url = document.getElementById('socialUrl').value.trim();
    platform = platform.toLowerCase();

    // Get original platform before editing
    const originalPlatform = document.getElementById('socialForm').dataset.platform;

    console.log("Submitting social media:", { originalPlatform, platform, url });

    try {
        // Send originalPlatform for update requests to identify which entry to update
        // For adding new platform, originalPlatform will be empty string
        const response = await fetch('/.netlify/functions/org-social-update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                originalPlatform: originalPlatform ? originalPlatform.toLowerCase() : '',
                platform,
                url 
            })
        });
        console.log('Response status:', response.status);
        const respText = await response.text();
        console.log('Response text:', respText);

        if (response.ok) {
            console.log("Social media updated successfully");
            closeModal('socialModal');
            closeModal('contactModal');
            loadOrganizationData();
        } else {
            alert('Error updating social media');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error updating social media');
    }
}

async function handleDeleteConfirm() {
    const { type, index, platform } = window.deleteItem;
    let endpoint, body;

    if (type === 'value') {
        endpoint = 'org-update-values-delete';
        body = { index: parseInt(index) };
    } else if (type === 'faq') {
        endpoint = 'org-faq-delete';
        body = { index: parseInt(index) };
    } else if (type === 'email') {
        endpoint = 'org-email-delete';
        body = { email: index }; // Assuming index is the email value
    } else if (type === 'phone') {
        endpoint = 'org-phone-delete';
        body = { phone: index };
    } else if (type === 'address') {
        endpoint = 'org-address-delete';
        body = { address: index };
    } else if (type === 'social') {
        endpoint = 'org-social-delete';
        body = { platform: platform.trim().toLowerCase() };
    } else if (type === 'team') {
        endpoint = 'org-team-delete';
        body = { index: parseInt(index) };
    }

    try {
        const response = await fetch(`/.netlify/functions/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (response.ok) {
            closeModal('deleteModal');
            loadOrganizationData();
        } else {
            alert('Error deleting item');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting item');
    }
}

    // Event delegation for dynamic buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.edit-btn')) {
            const btn = e.target.closest('.edit-btn');
            const type = btn.dataset.type;
            const index = btn.dataset.index;
            const platform = btn.dataset.platform;

            if (type === 'team') {
                // Team member edit - check first
                fetch('/.netlify/functions/org-get-team')
                    .then(res => res.json())
                    .then(data => {
                        const member = data[index];
                        openTeamMemberModal(index, member.name, member.role);
                    });
            } else if (type === 'email' || type === 'phone' || type === 'address') {
                const value = btn.parentElement.previousElementSibling.textContent.trim();
                openContactItemModal(type, index, value);
            } else if (type === 'social') {
                // Social media edit
                const url = btn.dataset.url;  // Fix: used btn.dataset.url without shadowing variable
                openSocialModal(platform, url);
            } else if (type === 'social-view') {
                // Social media view
                const url = btn.dataset.url;
                openViewSocialModal(platform, url);
            } else if (btn.dataset.id !== undefined) {
                // FAQ edit
                openFaqModal(parseInt(btn.dataset.id));
            } else if (index !== undefined) {
                // Value edit
                fetch('/.netlify/functions/org-get-aboutus')
                    .then(res => res.json())
                    .then(data => {
                        openValueEditModal(index, data.values[index]);
                    });
            }
        } else if (e.target.closest('.view-btn[data-type="social-view"]')) {
            const btn = e.target.closest('.view-btn[data-type="social-view"]');
            const platform = btn.dataset.platform;
            const url = btn.dataset.url;
            openViewSocialModal(platform, url);
        } else if (e.target.closest('.delete-btn')) {
            const btn = e.target.closest('.delete-btn');
            const type = btn.dataset.type;
            const index = btn.dataset.index;
            const platform = btn.dataset.platform;

            if (type === 'team') {
                window.deleteItem = { type: 'team', index };
                showDeleteModal('team', index);
            } else if (type === 'email' || type === 'phone' || type === 'address') {
                window.deleteItem = { type, index: btn.parentElement.previousElementSibling.textContent };
                showDeleteModal(type, btn.parentElement.previousElementSibling.textContent);
            } else if (type === 'social') {
                window.deleteItem = { type, platform };
                showDeleteModal('social', platform);
            } else if (btn.dataset.id !== undefined) {
                window.deleteItem = { type: 'faq', index: btn.dataset.id };
                showDeleteModal('faq', btn.dataset.id);
            } else if (index !== undefined) {
                window.deleteItem = { type: 'value', index };
                showDeleteModal('value', index);
            }

            document.getElementById('deleteModal').classList.add('show');
        } else if (e.target.closest('.add-btn[data-type]')) {
            const btn = e.target.closest('.add-btn');
            const type = btn.dataset.type;
            if (type === 'email' || type === 'phone' || type === 'address') {
                openContactItemModal(type);
            } else if (type === 'social') {
                openSocialModal();
            }
        } else if (e.target.closest('.add-btn-small')) {
            const btn = e.target.closest('.add-btn-small');
            const id = btn.id;
            if (id === 'addEmailBtn') {
                openContactItemModal('email');
            } else if (id === 'addPhoneBtn') {
                openContactItemModal('phone');
            } else if (id === 'addAddressBtn') {
                openContactItemModal('address');
            } else if (id === 'addSocialBtn') {
                openSocialModal();
            }
        }
    });

// Function to show delete modal with specific content
function showDeleteModal(type, identifier, index = null) {
    const modalBody = document.querySelector('#deleteModal .modal-body');
    modalBody.innerHTML = '';

    if (type === 'faq') {
        // Fetch FAQ data
        fetch('/.netlify/functions/org-get-help-faqs')
            .then(res => res.json())
            .then(data => {
                const faq = data[identifier];
                modalBody.innerHTML = `
                    <p>Are you sure you want to delete this FAQ?</p>
                    <div class="delete-preview">
                        <h4>Question:</h4>
                        <p>${faq.qtn}</p>
                        <h4>Answer:</h4>
                        <p>${faq.answer}</p>
                    </div>
                    <button id="confirmDeleteBtn" class="btn btn-danger">Delete</button>
                    <button id="cancelDeleteBtn" class="btn btn-secondary">Cancel</button>
                `;
                // Add event listeners
                document.getElementById('confirmDeleteBtn').addEventListener('click', handleDeleteConfirm);
                document.getElementById('cancelDeleteBtn').addEventListener('click', () => closeModal('deleteModal'));
            });
    } else if (type === 'team') {
        // Fetch team member data
        fetch('/.netlify/functions/org-get-team')
            .then(res => res.json())
            .then(data => {
                const member = data[identifier];
                modalBody.innerHTML = `
                    <p>Are you sure you want to delete this team member?</p>
                    <div class="delete-preview">
                        <h4>Name:</h4>
                        <p>${member.name}</p>
                        <h4>Role:</h4>
                        <p>${member.role}</p>
                    </div>
                    <button id="confirmDeleteBtn" class="btn btn-danger">Delete</button>
                    <button id="cancelDeleteBtn" class="btn btn-secondary">Cancel</button>
                `;
                // Add event listeners
                document.getElementById('confirmDeleteBtn').addEventListener('click', handleDeleteConfirm);
                document.getElementById('cancelDeleteBtn').addEventListener('click', () => closeModal('deleteModal'));
            });
    } else if (type === 'email' || type === 'phone' || type === 'address') {
        // Show the contact item being deleted
        const typeCapitalized = type.charAt(0).toUpperCase() + type.slice(1);
        modalBody.innerHTML = `
            <p>Are you sure you want to delete this ${type}?</p>
            <div class="delete-preview">
                <h4>${typeCapitalized}:</h4>
                <p>${identifier}</p>
            </div>
            <button id="confirmDeleteBtn" class="btn btn-danger">Delete</button>
            <button id="cancelDeleteBtn" class="btn btn-secondary">Cancel</button>
        `;
        // Add event listeners
        document.getElementById('confirmDeleteBtn').addEventListener('click', handleDeleteConfirm);
        document.getElementById('cancelDeleteBtn').addEventListener('click', () => closeModal('deleteModal'));
    } else {
        // Default for other types
        modalBody.innerHTML = `
            <p>Are you sure you want to delete this ${type}?</p>
            <button id="confirmDeleteBtn" class="btn btn-danger">Delete</button>
            <button id="cancelDeleteBtn" class="btn btn-secondary">Cancel</button>
        `;
        // Add event listeners
        document.getElementById('confirmDeleteBtn').addEventListener('click', handleDeleteConfirm);
        document.getElementById('cancelDeleteBtn').addEventListener('click', () => closeModal('deleteModal'));
    }
}

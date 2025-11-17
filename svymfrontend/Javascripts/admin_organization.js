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
});

async function loadOrganizationData() {
    try {
        const [aboutData, helpData, contactData, teamData] = await Promise.all([
            fetch('/.netlify/functions/org-get-aboutus').then(res => res.json()),
            fetch('/.netlify/functions/org-get-help-faqs').then(res => res.json()),
            fetch('/.netlify/functions/org-get-contact').then(res => res.json()),
            fetch('/.netlify/functions/org-get-team').then(res => res.json())
        ]);

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

function populateContactSection(data) {
    const contactContent = document.getElementById('contactContent');
    contactContent.innerHTML = '';

    // Emails
    if (data.emails && data.emails.length > 0) {
        const emailDiv = document.createElement('div');
        emailDiv.innerHTML = `<h4>Emails</h4>`;
        data.emails.forEach((email, index) => {
            const emailItem = document.createElement('div');
            emailItem.className = 'contact-item';
            emailItem.innerHTML = `
                <span>${email}</span>
                <div class="org-actions">
                    <button class="edit-btn" data-type="email" data-index="${index}"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" data-type="email" data-index="${index}"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            emailDiv.appendChild(emailItem);
        });
        contactContent.appendChild(emailDiv);
    }

    // Phones
    if (data.phones && data.phones.length > 0) {
        const phoneDiv = document.createElement('div');
        phoneDiv.innerHTML = `<h4>Phones</h4>`;
        data.phones.forEach((phone, index) => {
            const phoneItem = document.createElement('div');
            phoneItem.className = 'contact-item';
            phoneItem.innerHTML = `
                <span>${phone}</span>
                <div class="org-actions">
                    <button class="edit-btn" data-type="phone" data-index="${index}"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" data-type="phone" data-index="${index}"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            phoneDiv.appendChild(phoneItem);
        });
        contactContent.appendChild(phoneDiv);
    }

    // Addresses
    if (data.addresses && data.addresses.length > 0) {
        const addressDiv = document.createElement('div');
        addressDiv.innerHTML = `<h4>Addresses</h4>`;
        data.addresses.forEach((address, index) => {
            const addressItem = document.createElement('div');
            addressItem.className = 'contact-item';
            addressItem.innerHTML = `
                <span>${address}</span>
                <div class="org-actions">
                    <button class="edit-btn" data-type="address" data-index="${index}"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" data-type="address" data-index="${index}"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            addressDiv.appendChild(addressItem);
        });
        contactContent.appendChild(addressDiv);
    }
}

function populateSocialSection(data) {
    const socialContent = document.getElementById('socialContent');
    socialContent.innerHTML = '';

    // Social Media
    if (data.socialMedia && Object.keys(data.socialMedia).length > 0) {
        Object.entries(data.socialMedia).forEach(([platform, url]) => {
            const socialItem = document.createElement('div');
            socialItem.className = 'social-item';
            socialItem.innerHTML = `
                <div class="social-info">
                    <p class="social-platform">${platform}</p>
                    <p class="social-url"><a href="${url}" target="_blank">${url}</a></p>
                </div>
                <div class="org-actions">
                    <button class="edit-btn" data-type="social" data-platform="${platform}"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" data-type="social" data-platform="${platform}"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            socialContent.appendChild(socialItem);
        });
    } else {
        socialContent.innerHTML = '<p>No social media links added yet.</p>';
    }
}

function populateTeamSection(data) {
    const teamContent = document.getElementById('teamContent');
    teamContent.innerHTML = '';

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
    document.getElementById('viewMissionBtn').addEventListener('click', () => openViewMissionModal());
    document.getElementById('editMissionBtn').addEventListener('click', () => openMissionModal());
    document.getElementById('viewVisionBtn').addEventListener('click', () => openViewVisionModal());
    document.getElementById('editVisionBtn').addEventListener('click', () => openVisionModal());
    document.getElementById('viewValuesBtn').addEventListener('click', () => openViewValuesModal());
    document.getElementById('editValuesBtn').addEventListener('click', () => openValuesModal());

    // Contact section add buttons
    const contactSection = document.querySelector('.contact-container .section-header');
    const addEmailBtn = document.createElement('button');
    addEmailBtn.className = 'add-btn';
    addEmailBtn.innerHTML = '<i class="fas fa-plus"></i> Add Email';
    addEmailBtn.addEventListener('click', () => openContactItemModal('email'));
    contactSection.appendChild(addEmailBtn);

    const addPhoneBtn = document.createElement('button');
    addPhoneBtn.className = 'add-btn';
    addPhoneBtn.innerHTML = '<i class="fas fa-plus"></i> Add Phone';
    addPhoneBtn.addEventListener('click', () => openContactItemModal('phone'));
    contactSection.appendChild(addPhoneBtn);

    const addAddressBtn = document.createElement('button');
    addAddressBtn.className = 'add-btn';
    addAddressBtn.innerHTML = '<i class="fas fa-plus"></i> Add Address';
    addAddressBtn.addEventListener('click', () => openContactItemModal('address'));
    contactSection.appendChild(addAddressBtn);

    // Social section add button
    const socialSection = document.querySelector('.social-container .section-header');
    const addSocialBtn = document.createElement('button');
    addSocialBtn.className = 'add-btn';
    addSocialBtn.innerHTML = '<i class="fas fa-plus"></i> Add Social Media';
    addSocialBtn.addEventListener('click', () => openSocialModal());
    socialSection.appendChild(addSocialBtn);

    // Help section buttons
    document.getElementById('addFaqBtn').addEventListener('click', () => openFaqModal());

    // Team section buttons
    document.getElementById('addTeamMemberBtn').addEventListener('click', () => openTeamModal());
    document.getElementById('addTeamMemberBtnModal').addEventListener('click', () => openTeamMemberModal());

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
    document.getElementById('missionForm').addEventListener('submit', handleMissionSubmit);
    document.getElementById('visionForm').addEventListener('submit', handleVisionSubmit);
    document.getElementById('faqForm').addEventListener('submit', handleFaqSubmit);
    document.getElementById('valueForm').addEventListener('submit', handleValueSubmit);
    document.getElementById('contactItemForm').addEventListener('submit', handleContactItemSubmit);
    document.getElementById('socialForm').addEventListener('submit', handleSocialSubmit);
    document.getElementById('teamMemberForm').addEventListener('submit', handleTeamMemberSubmit);

    // Add buttons
    document.getElementById('addValueBtn').addEventListener('click', () => openValueEditModal());
    document.getElementById('addEmailBtn').addEventListener('click', () => openContactItemModal('email'));
    document.getElementById('addPhoneBtn').addEventListener('click', () => openContactItemModal('phone'));
    document.getElementById('addAddressBtn').addEventListener('click', () => openContactItemModal('address'));
    document.getElementById('addSocialBtn').addEventListener('click', () => openSocialModal());
    document.getElementById('addTeamMemberBtn').addEventListener('click', () => openTeamMemberModal());
}

function openTeamMemberModal(index = null, name = '', role = '') {
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
            closeModal('teamModal');
            loadOrganizationData();
        } else {
            alert('Error updating team member');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error updating team member');
    }

    // Delete confirmation
    document.getElementById('confirmDeleteBtn').addEventListener('click', handleDeleteConfirm);
    document.getElementById('cancelDeleteBtn').addEventListener('click', () => closeModal('deleteModal'));
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
    // Load current values
    fetch('/.netlify/functions/org-get-aboutus')
        .then(res => res.json())
        .then(data => {
            const valuesList = document.getElementById('valuesList');
            valuesList.innerHTML = '';
            data.values.forEach((value, index) => {
                const valueItem = document.createElement('div');
                valueItem.className = 'value-item';
                valueItem.innerHTML = `
                    <span>${value}</span>
                    <div class="org-actions">
                        <button class="edit-btn" data-index="${index}"><i class="fas fa-edit"></i></button>
                        <button class="delete-btn" data-index="${index}"><i class="fas fa-trash-alt"></i></button>
                    </div>
                `;
                valuesList.appendChild(valueItem);
            });
            document.getElementById('valuesModal').classList.add('show');
        });
}

function openTeamModal() {
    // Load current team
    fetch('/.netlify/functions/org-get-team')
        .then(res => res.json())
        .then(data => {
            const teamList = document.getElementById('teamList');
            teamList.innerHTML = '';
            data.forEach((member, index) => {
                const memberItem = document.createElement('div');
                memberItem.className = 'member-item';
                memberItem.innerHTML = `
                    <div class="member-info">
                        <p class="member-name">${member.name}</p>
                        <p class="member-role">${member.role}</p>
                    </div>
                    <div class="org-actions">
                        <button class="edit-btn" data-type="team" data-index="${index}"><i class="fas fa-edit"></i></button>
                        <button class="delete-btn" data-type="team" data-index="${index}"><i class="fas fa-trash-alt"></i></button>
                    </div>
                `;
                teamList.appendChild(memberItem);
            });
            document.getElementById('teamModal').classList.add('show');
        });
}

function openValueEditModal(index = null, value = '') {
    document.getElementById('valueText').value = value;
    document.getElementById('valueForm').dataset.index = index;
    document.getElementById('valueForm').dataset.oldValue = value;
    document.getElementById('valueEditModal').classList.add('show');
}

function openFaqModal(index = null) {
    if (index !== null) {
        // Edit mode
        fetch('/.netlify/functions/org-get-help-faqs')
            .then(res => res.json())
            .then(data => {
                const faq = data[index];
                document.getElementById('faqQuestion').value = faq.qtn;
                document.getElementById('faqAnswer').value = faq.answer;
                document.getElementById('faqForm').dataset.index = index;
            });
    } else {
        // Add mode
        document.getElementById('faqQuestion').value = '';
        document.getElementById('faqAnswer').value = '';
        document.getElementById('faqForm').dataset.index = '';
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
    const emailsList = document.getElementById('emailsList');
    emailsList.innerHTML = '<h4>Emails</h4>';
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
    const phonesList = document.getElementById('phonesList');
    phonesList.innerHTML = '<h4>Phones</h4>';
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
    const addressesList = document.getElementById('addressesList');
    addressesList.innerHTML = '<h4>Addresses</h4>';
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
    socialList.innerHTML = '<h4>Social Media</h4>';
    if (data.socialMedia) {
        Object.entries(data.socialMedia).forEach(([platform, url]) => {
            const item = document.createElement('div');
            item.className = 'contact-item';
            item.innerHTML = `
                <span><a href="${url}" target="_blank">${platform}</a></span>
                <div class="org-actions">
                    <button class="edit-btn" data-type="social" data-platform="${platform}"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" data-type="social" data-platform="${platform}"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            socialList.appendChild(item);
        });
    }
}

function openContactItemModal(type, index = null, value = '') {
    document.getElementById('contactItemValue').value = value;
    document.getElementById('contactItemForm').dataset.type = type;
    document.getElementById('contactItemForm').dataset.index = index;
    document.getElementById('contactItemModal').classList.add('show');
}

function openSocialModal(platform = '', url = '') {
    document.getElementById('socialPlatform').value = platform;
    document.getElementById('socialUrl').value = url;
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

// Add modal close functionality
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

    // Prevent body scroll when modal is open
    document.addEventListener('click', (e) => {
        const openModals = document.querySelectorAll('.modal.show');
        document.body.style.overflow = openModals.length > 0 ? 'hidden' : '';
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

function openViewContactModal() {
    fetch('/.netlify/functions/org-get-contact')
        .then(res => res.json())
        .then(data => {
            const content = document.getElementById('viewContactContent');
            content.innerHTML = '';

            if (data.emails && data.emails.length > 0) {
                content.innerHTML += `<h4>Emails</h4><ul>${data.emails.map(email => `<li>${email}</li>`).join('')}</ul>`;
            }
            if (data.phones && data.phones.length > 0) {
                content.innerHTML += `<h4>Phones</h4><ul>${data.phones.map(phone => `<li>${phone}</li>`).join('')}</ul>`;
            }
            if (data.addresses && data.addresses.length > 0) {
                content.innerHTML += `<h4>Addresses</h4><ul>${data.addresses.map(address => `<li>${address}</li>`).join('')}</ul>`;
            }
            if (data.socialMedia && Object.keys(data.socialMedia).length > 0) {
                content.innerHTML += `<h4>Social Media</h4><ul>${Object.entries(data.socialMedia).map(([platform, url]) => `<li><a href="${url}" target="_blank">${platform}</a></li>`).join('')}</ul>`;
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
    const value = document.getElementById('contactItemValue').value.trim();
    const type = e.target.dataset.type;
    const index = e.target.dataset.index;

    const endpoints = {
        email: index !== 'null' ? 'org-email-edit' : 'org-email-add',
        phone: index !== 'null' ? 'org-phone-edit' : 'org-phone-add',
        address: index !== 'null' ? 'org-address-edit' : 'org-address-add'
    };

    try {
        const body = index !== 'null' ? { index: parseInt(index), [type]: value } : { [type]: value };
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
    const platform = document.getElementById('socialPlatform').value.trim();
    const url = document.getElementById('socialUrl').value.trim();

    try {
        const response = await fetch('/.netlify/functions/org-social-update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ platform, url })
        });

        if (response.ok) {
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

function handleDeleteConfirm() {
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
        body = { platform };
    } else if (type === 'team') {
        endpoint = 'org-team-delete';
        body = { index: parseInt(index) };
    }

    fetch(`/.netlify/functions/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    })
    .then(response => {
        if (response.ok) {
            closeModal('deleteModal');
            loadOrganizationData();
        } else {
            alert('Error deleting item');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error deleting item');
    });
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
            const value = btn.parentElement.previousElementSibling.textContent;
            openContactItemModal(type, index, value);
        } else if (type === 'social') {
            // Social media edit
            const socialInfo = btn.closest('.social-item').querySelector('.social-info');
            const platform = socialInfo.querySelector('.social-platform').textContent;
            const url = socialInfo.querySelector('.social-url a').href;
            openSocialModal(platform, url);
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
    } else if (e.target.closest('.delete-btn')) {
        const btn = e.target.closest('.delete-btn');
        const type = btn.dataset.type;
        const index = btn.dataset.index;
        const platform = btn.dataset.platform;

        if (type === 'team') {
            // Team member delete - check first
            window.deleteItem = { type: 'team', index };
        } else if (type === 'email' || type === 'phone' || type === 'address') {
            window.deleteItem = { type, index: btn.parentElement.previousElementSibling.textContent };
        } else if (type === 'social') {
            window.deleteItem = { type, platform };
        } else if (btn.dataset.id !== undefined) {
            // FAQ delete
            window.deleteItem = { type: 'faq', index: btn.dataset.id };
        } else if (index !== undefined) {
            // Value delete
            window.deleteItem = { type: 'value', index };
        }

        document.getElementById('deleteModal').classList.add('show');
    }
});

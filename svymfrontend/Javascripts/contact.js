document.addEventListener('DOMContentLoaded', () => {
    const emailContainer = document.getElementById('emailContainer');
    const phoneContainer = document.getElementById('phoneContainer');
    const addressLine1 = document.getElementById('addressLine1');
    const addressLine2 = document.getElementById('addressLine2');
    const socialLinksContainer = document.getElementById('socialLinksContainer');

    fetch('/.netlify/functions/org-get-contact')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch Contact data');
            }
            return response.json();
        })
        .then(data => {
            // Clear existing content if any
            if(emailContainer) emailContainer.innerHTML = '';
            if(phoneContainer) phoneContainer.innerHTML = '';
            if(addressLine1) addressLine1.textContent = '';
            if(addressLine2) addressLine2.textContent = '';
            if(socialLinksContainer) socialLinksContainer.innerHTML = '';

            // Emails array
            if(emailContainer && Array.isArray(data.emails) && data.emails.length > 0) {
                data.emails.forEach(email => {
                    const emailLink = document.createElement('a');
                    emailLink.href = `mailto:${email}`;
                    emailLink.textContent = email;
                    emailLink.style.display = 'block'; // make each email appear in its own line
                    emailContainer.appendChild(emailLink);
                });
            }

            // Phones array
            if(phoneContainer && Array.isArray(data.phones)) {
                data.phones.forEach(phone => {
                    const p = document.createElement('p');
                    p.textContent = phone;
                    phoneContainer.appendChild(p);
                });
            }

            // Addresses array
            if(Array.isArray(data.addresses)) {
                if(addressLine1) addressLine1.textContent = data.addresses[0] || '';
                if(addressLine2) addressLine2.textContent = data.addresses[1] || '';
            }

            // SocialMedia Map (object keys and values)
            if(socialLinksContainer && data.socialMedia) {
                Object.entries(data.socialMedia).forEach(([key, url]) => {
                    if(url) {
                        const a = document.createElement('a');
                        a.href = url;
                        a.target = '_blank';
                        a.rel = 'noopener noreferrer';
                        let iconClass = '';
                        switch(key.toLowerCase()) {
                            case 'facebook':
                                iconClass = 'fab fa-facebook-f';
                                break;
                            case 'twitter':
                            case 'x':
                                iconClass = 'fab fa-x-twitter';
                                break;
                            case 'instagram':
                                iconClass = 'fab fa-instagram';
                                break;
                            case 'youtube':
                                iconClass = 'fab fa-youtube';
                                break;
                            case 'linkedin':
                                iconClass = 'fab fa-linkedin';
                                break;
                            default:
                                iconClass = 'fas fa-globe';
                        }
                        const icon = document.createElement('i');
                        icon.className = iconClass;
                        a.appendChild(icon);
                        socialLinksContainer.appendChild(a);
                        socialLinksContainer.appendChild(document.createTextNode(' ')); // spacing
                    }
                });
            }
        })
        .catch(error => {
            console.error('Error loading Contact Us:', error);
            if(emailContainer) emailContainer.textContent = 'Failed to load contact data. Please try again later.';
        });
});

document.addEventListener('DOMContentLoaded', () => {
    // --- Hamburger menu functionality ---
    const hamburger = document.getElementById('hamburger');
    const sideMenu = document.getElementById('sideMenu');
    const overlay = document.getElementById('overlay');

    hamburger.addEventListener('click', () => {
        sideMenu.classList.toggle('open');
        overlay.classList.toggle('active');
    });

    overlay.addEventListener('click', () => {
        sideMenu.classList.remove('open');
        overlay.classList.remove('active');
    });

    // --- Fetch and display all announcements ---
    async function loadAnnouncements() {
        const container = document.getElementById('announcementsContainer');
        try {
            const res = await fetch('/.netlify/functions/getAnnouncements');
            if (res.ok) {
                const { announcements } = await res.json();
                if (announcements.length === 0) {
                    container.innerHTML = '<p class="no-announcements">No announcements available.</p>';
                    return;
                }
                container.innerHTML = '';
                announcements.forEach(announcement => {
                    const eventDate = new Date(announcement.eventDate).toLocaleDateString('en-IN');
                    const card = document.createElement('div');
                    card.classList.add('announcement-card');
                    card.innerHTML = `
                        <h3>${announcement.title}</h3>
                        <div class="announcement-date">
                            <i class="fas fa-calendar-alt"></i> ${eventDate}
                        </div>
                        <div class="announcement-description">
                            ${announcement.description}
                        </div>
                    `;
                    container.appendChild(card);
                });
            } else {
                container.innerHTML = '<p class="no-announcements">Failed to load announcements.</p>';
            }
        } catch (error) {
            console.error('Error fetching announcements:', error);
            container.innerHTML = '<p class="no-announcements">Error loading announcements.</p>';
        }
    }

    // --- Initial load ---
    loadAnnouncements();

    // --- Set active link in sidebar ---
    const currentPath = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const sideMenu = document.getElementById('sideMenu');
    const hamburger = document.getElementById('hamburger');
    const overlay = document.getElementById('overlay');
    const navLinks = document.getElementById('navLinks');

    const ullinks = navLinks.getElementsByTagName('li');

    
    // Toggle sidebar visibility on mobile
    hamburger.addEventListener('click', () => {
        sideMenu.classList.toggle('open');
        overlay.classList.toggle('active');
    });

    overlay.addEventListener('click', () => {
        sideMenu.classList.remove('open');
        overlay.classList.remove('active');
    });

    // --- Logout Functionality ---
    const logoutLink = document.querySelector('.logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Clear any user session data (e.g., from localStorage)
            
            localStorage.removeItem('isAdminLoggedIn');
            sessionStorage.removeItem('isAdminLoggedIn');
            alert('You have been logged out successfully.');
            window.location.href = 'login.html';
        });
    }

    // --- Dynamic Content Loading (Placeholder Data) ---
    function loadAdminDashboardData() {
        // Quick Stats
        document.getElementById('totalStudents').textContent = '1,250';
        document.getElementById('activeCourses').textContent = '22';
        document.getElementById('totalTrainers').textContent = '35';
        document.getElementById('placedStudents').textContent = '87';

        // Enrollment Chart (Using Chart.js)
        const ctx = document.getElementById('enrollmentChart');
        if (ctx) {
            const chartData = {
                labels: ['Mobile Repair', 'Electrical Work', 'Fashion Design', 'Digital Literacy'],
                datasets: [{
                    label: 'Enrolled Students',
                    data: [300, 250, 400, 300],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                    ],
                    borderWidth: 1
                }]
            };

            new Chart(ctx, {
                type: 'bar',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
        
        // Recent Activity
        const recentActivityList = document.getElementById('recentActivityList');
        const activities = [
            '<strong>John Doe</strong> enrolled in a new course: <strong>Mobile Repair</strong>.',
            '<strong>Jane Smith</strong> updated the <strong>Python for Beginners</strong> course details.',
            'A new placement opportunity from <strong>TechCorp Solutions</strong> was added.',
            '<strong>Mary Johnson</strong> marked fee payment for student ID <strong>S101</strong> as complete.',
        ];
        recentActivityList.innerHTML = activities.map(activity => `<li><span class="activity-text">${activity}</span><span class="activity-time">${new Date().toLocaleTimeString()}</span></li>`).join('');

        // Latest Announcements
        const latestAnnouncements = document.getElementById('latestAnnouncements');
        const announcements = [
            'New server maintenance scheduled for tonight at 11 PM.',
            'Reminder: All trainers must submit their monthly reports by EOD.',
        ];
        latestAnnouncements.innerHTML = announcements.map(announcement => `<li>${announcement}</li>`).join('');
        
        // Top Performing Courses
        const topCourses = document.getElementById('topCourses');
        const courses = ['Web Development', 'Data Science', 'Graphic Design'];
        topCourses.innerHTML = courses.map(course => `<li><i class="fas fa-arrow-up"></i> ${course}</li>`).join('');
    }

    loadAdminDashboardData();
});
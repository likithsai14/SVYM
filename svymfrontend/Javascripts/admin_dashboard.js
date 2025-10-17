document.addEventListener('DOMContentLoaded', () => {
    const sideMenu = document.getElementById('sideMenu');
    const hamburger = document.getElementById('hamburger');
    const overlay = document.getElementById('overlay');

    
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

    // --- Dynamic Content Loading from DB ---
    async function loadAdminDashboardData() {
        try {
            // Fetch stats from backend
            const [studentsRes, trainersRes, fieldMobilisersRes, coursesRes, enrollmentStatsRes] = await Promise.all([
                fetch('/.netlify/functions/allstudents'),
                fetch('/.netlify/functions/allTrainers'),
                fetch('/.netlify/functions/allfieldmobilisers'),
                fetch('/.netlify/functions/allCourses'),
                fetch('/.netlify/functions/getEnrollmentStats')
            ]);

            const studentsData = studentsRes.ok ? await studentsRes.json() : { students: [] };
            const trainersData = trainersRes.ok ? await trainersRes.json() : { trainers: [] };
            const fieldMobilisersData = fieldMobilisersRes.ok ? await fieldMobilisersRes.json() : { fieldmobilisers: [] };
            const coursesData = coursesRes.ok ? await coursesRes.json() : [];
            const enrollmentStatsData = enrollmentStatsRes.ok ? await enrollmentStatsRes.json() : { stats: [] };

            // Quick Stats
            document.getElementById('totalStudents').textContent = studentsData.students.length;
            document.getElementById('totalTrainers').textContent = trainersData.trainers.length;
            document.getElementById('totalFieldMobilisers').textContent = fieldMobilisersData.fieldmobilisers.length;
            document.getElementById('totalCourses').textContent = coursesData.courses.length;

            // Enrollment Chart (Using Chart.js)
            const ctx = document.getElementById('enrollmentChart');
            if (ctx) {
                const stats = enrollmentStatsData.stats;
                if (stats.length > 0) {
                    document.getElementById('noChartData').style.display = 'none';
                    const maxEnroll = Math.max(...stats.map(s => s.enrollments));
                    const maxY = maxEnroll === 0 ? 10 : Math.ceil(maxEnroll / 10) * 10;
                    const stepSize = maxY / 10;
                    const chartData = {
                        labels: stats.map(s => s.courseName),
                        datasets: [{
                            label: 'Enrolled Students',
                            data: stats.map(s => s.enrollments),
                            backgroundColor: stats.map((_, i) => `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`),
                            borderColor: stats.map((_, i) => `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`),
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
                                    beginAtZero: true,
                                    max: maxY,
                                    ticks: {
                                        stepSize: stepSize
                                    }
                                }
                            }
                        }
                    });
                } else {
                    document.getElementById('noChartData').style.display = 'block';
                }
            }

            // Recent Activity (placeholder, as no dynamic data available)
            const recentActivityList = document.getElementById('recentActivityList');
            const activities = [
                '<strong>John Doe</strong> enrolled in a new course: <strong>Mobile Repair</strong>.',
                '<strong>Jane Smith</strong> updated the <strong>Python for Beginners</strong> course details.',
                'A new placement opportunity from <strong>TechCorp Solutions</strong> was added.',
                '<strong>Mary Johnson</strong> marked fee payment for student ID <strong>S101</strong> as complete.',
            ];
            recentActivityList.innerHTML = activities.map(activity => `<li><span class="activity-text">${activity}</span><span class="activity-time">${new Date().toLocaleTimeString()}</span></li>`).join('');

            // Latest Announcements (placeholder)
            const latestAnnouncements = document.getElementById('latestAnnouncements');
            const announcements = [
                'New server maintenance scheduled for tonight at 11 PM.',
                'Reminder: All trainers must submit their monthly reports by EOD.',
            ];
            latestAnnouncements.innerHTML = announcements.map(announcement => `<li>${announcement}</li>`).join('');

            // Top Performing Courses (use enrollment stats)
            const topCourses = document.getElementById('topCourses');
            const topCoursesList = enrollmentStatsData.stats.slice(0, 3).map(s => s.courseName);
            if (topCoursesList.length > 0) {
                topCourses.innerHTML = topCoursesList.map(course => `<li><i class="fas fa-arrow-up"></i> ${course}</li>`).join('');
            } else {
                topCourses.innerHTML = '<li class="no-data">No data available.</li>';
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            // Fallback to placeholder data
            document.getElementById('totalStudents').textContent = 'Error';
            document.getElementById('totalTrainers').textContent = 'Error';
            document.getElementById('totalFieldMobilisers').textContent = 'Error';
            document.getElementById('totalCourses').textContent = 'Error';
        }
    }

    loadAdminDashboardData();
});
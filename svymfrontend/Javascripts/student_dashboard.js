document.addEventListener('DOMContentLoaded', () => {
    // --- Hamburger menu functionality (keep existing) ---
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

    // --- Personalize Welcome Message (keep existing) ---
    const welcomeMessageElement = document.getElementById('welcomeMessage');
    const loggedInUserName = JSON.parse(sessionStorage.getItem("user")).username;

    if (welcomeMessageElement && loggedInUserName) {
        const displayUserName = loggedInUserName.charAt(0).toUpperCase() + loggedInUserName.slice(1);
        welcomeMessageElement.textContent = `Welcome, ${displayUserName}!`;
    } else if (welcomeMessageElement) {
        welcomeMessageElement.textContent = `Welcome to SVYM, Student!`;
    }

    // --- Dynamic Dashboard Content Data (Dummy Data) ---
    // Announcements will be fetched from backend

    // --- Fetch student's enrollment for My Course card ---
    const studentId = sessionStorage.getItem("userId");
    let enrollment = null;

    async function fetchEnrollment() {
        try {
            const res = await fetch(`/.netlify/functions/studentEnrollments?studentId=${studentId}`);
            if (res.ok) {
                const enrollments = await res.json();
                enrollment = enrollments.length > 0 ? enrollments[0] : null;
            }
        } catch (err) {
            console.error("Error fetching enrollment:", err);
        }
    }


    // --- Functions to Populate Dashboard Sections ---

    async function populateAnnouncements() {
        const announcementsList = document.getElementById('announcementsList');
        try {
            const res = await fetch('/.netlify/functions/getAnnouncements');
            if (res.ok) {
                const { announcements } = await res.json();
                if (announcements.length === 0) {
                    announcementsList.innerHTML = '<li class="no-data">No new announcements.</li>';
                    return;
                }
                announcementsList.innerHTML = '';
                announcements.forEach(announcement => {
                    const eventDate = new Date(announcement.eventDate).toLocaleDateString('en-IN');
                    const listItem = document.createElement('li');
                    listItem.classList.add('announcement-item');
                    listItem.innerHTML = `
                        <strong>${announcement.title}</strong>
                        <span class="date"><i class="fas fa-calendar-alt"></i> ${eventDate}</span>
                        <p class="description">${announcement.description}</p>
                    `;
                    announcementsList.appendChild(listItem);
                });
            } else {
                announcementsList.innerHTML = '<li class="no-data">No new announcements.</li>';
            }
        } catch (error) {
            console.error('Error fetching announcements:', error);
            announcementsList.innerHTML = '<li class="no-data">No new announcements.</li>';
        }
    }

    // --- Populate My Course card ---
    async function populateMyCourse() {
        const myCourseList = document.getElementById('myCourseList');
        await fetchEnrollment();
        if (enrollment) {
            // Fetch full course details
            let courseDetails = null;
            try {
                const res = await fetch(`/.netlify/functions/allCourses?courseId=${enrollment.courseId}`);
                if (res.ok) {
                    const { courses } = await res.json();
                    courseDetails = courses.find(c => c.courseId === enrollment.courseId);
                }
            } catch (err) {
                console.error("Error fetching course details:", err);
            }

            if (courseDetails) {
                myCourseList.innerHTML = `
                    <li class="course-info-item">
                        <i class="fas fa-graduation-cap"></i>
                        <span><strong>Name:</strong> ${courseDetails.courseName}</span>
                    </li>
                    <li class="course-info-item">
                        <i class="fas fa-book"></i>
                        <span><strong>Description:</strong> ${courseDetails.description}</span>
                    </li>
                    <li class="course-info-item">
                        <i class="fas fa-user"></i>
                        <span><strong>Trainer:</strong> ${courseDetails.trainerName || 'Not Assigned'}</span>
                    </li>
                    <li class="course-info-item">
                        <i class="fas fa-clock"></i>
                        <span><strong>Duration:</strong> ${courseDetails.durationMonths} days</span>
                    </li>
                    <li class="course-info-item">
                        <i class="fas fa-rupee-sign"></i>
                        <span><strong>Course Price:</strong> INR ${courseDetails.price.toLocaleString('en-IN')}</span>
                    </li>
                    <li class="course-info-item">
                        <i class="fas fa-hand-holding-heart"></i>
                        <span><strong>Funded Amount:</strong> INR ${enrollment.fundedAmount ? enrollment.fundedAmount.toLocaleString('en-IN') : 0}</span>
                    </li>
                    <li class="course-info-item">
                        <i class="fas fa-money-bill-wave"></i>
                        <span><strong>Amount to Pay:</strong> INR ${enrollment.totalPrice ? enrollment.totalPrice.toLocaleString('en-IN') : 0}</span>
                    </li>
                    <li class="course-info-item">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span><strong>Due Amount:</strong> INR ${enrollment.dueAmount ? enrollment.dueAmount.toLocaleString('en-IN') : 0}</span>
                    </li>
                    <li class="course-info-item">
                        <i class="fas fa-info-circle"></i>
                        <span><strong>Status:</strong> ${enrollment.dueAmount === 0 ? 'Completed' : 'Ongoing'}</span>
                    </li>
                `;
            } else {
                // Fallback to enrollment data if course details not found
                myCourseList.innerHTML = `
                    <li class="course-info-item">
                        <i class="fas fa-graduation-cap"></i>
                        <span><strong>Course:</strong> ${enrollment.courseName}</span>
                    </li>
                    <li class="course-info-item">
                        <i class="fas fa-hand-holding-heart"></i>
                        <span><strong>Funded Amount:</strong> INR ${enrollment.fundedAmount ? enrollment.fundedAmount.toLocaleString('en-IN') : 0}</span>
                    </li>
                    <li class="course-info-item">
                        <i class="fas fa-money-bill-wave"></i>
                        <span><strong>Amount to Pay:</strong> INR ${enrollment.totalPrice ? enrollment.totalPrice.toLocaleString('en-IN') : 0}</span>
                    </li>
                    <li class="course-info-item">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span><strong>Due Amount:</strong> INR ${enrollment.dueAmount ? enrollment.dueAmount.toLocaleString('en-IN') : 0}</span>
                    </li>
                    <li class="course-info-item">
                        <i class="fas fa-info-circle"></i>
                        <span><strong>Status:</strong> ${enrollment.dueAmount === 0 ? 'Completed' : 'Ongoing'}</span>
                    </li>
                `;
            }
        } else {
            myCourseList.innerHTML = '<li class="no-data">No course assigned yet.</li>';
        }
    }

    // --- Initial Load and Dynamic Updates ---
    populateAnnouncements();
    populateMyCourse();

    // Set active link in sidebar (keep existing)
    const currentPath = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
});
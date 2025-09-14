document.addEventListener('DOMContentLoaded', () => {
    const courseListElement = document.getElementById('courseList');
    const welcomeMessageElement = document.getElementById('welcomeMessage');

    // Define the list of courses with estimated prices, dates, center names, and duration
    const courses = [
        { id: 'fashion-designing', name: 'Fashion Designing', price: 15000, description: 'Learn to create stunning designs and patterns for the fashion industry.', startDate: '2025-08-01', endDate: '2026-01-31', duration: '6 Months', centerName: 'Bengaluru Main Center' },
        { id: 'beauticians', name: 'Beauticians', price: 12000, description: 'Master various beauty treatments, makeup artistry, and salon management.', startDate: '2025-09-01', endDate: '2026-02-28', duration: '6 Months', centerName: 'Bengaluru Main Center' },
        { id: 'mobile-repair', name: 'Mobile Repair and Service', price: 10000, description: 'Hands-on training for diagnosing and repairing smartphones and tablets.', startDate: '2025-08-15', endDate: '2025-12-15', duration: '4 Months', centerName: 'Mysuru Satellite Branch' },
        { id: 'electrician-assist', name: 'Electrician Assistant & Home Appliances Repair', price: 18000, description: 'Gain skills in electrical wiring, installation, and repair of home appliances.', startDate: '2025-10-01', endDate: '2026-03-31', duration: '6 Months', centerName: 'Bengaluru Main Center' },
        { id: 'plumbing-training', name: 'Plumbing Training', price: 14000, description: 'Essential skills for plumbing installation, maintenance, and repair work.', startDate: '2025-09-10', endDate: '2026-01-10', duration: '4 Months', centerName: 'Hubballi Training Center' },
        { id: 'two-wheeler-repair', name: 'Two-wheeler Repair & Service', price: 11000, description: 'Comprehensive training for motorcycle and scooter maintenance and troubleshooting.', startDate: '2025-08-05', endDate: '2025-12-05', duration: '4 Months', centerName: 'Bengaluru Main Center' },
        { id: 'four-wheeler-driving', name: 'Four/Three Wheeler Driving for Women', price: 20000, description: 'Empowering women with professional driving skills for various vehicles.', startDate: '2025-09-15', endDate: '2025-11-15', duration: '2 Months', centerName: 'Mysuru Satellite Branch' },
        { id: 'art-craft', name: 'Art & Craft', price: 8000, description: 'Explore various artistic techniques and craft creation for creative expression or business.', startDate: '2025-08-20', endDate: '2025-10-20', duration: '2 Months', centerName: 'Bengaluru Main Center' },
        { id: 'sebc-ls', name: 'SEBCLs (Self-Employment Business Creation & Linkage Support)', price: 25000, description: 'Guidance and support for aspiring entrepreneurs to start and link their businesses.', startDate: '2025-10-15', endDate: '2026-04-15', duration: '6 Months', centerName: 'Bengaluru Main Center' },
        { id: 'copa', name: 'Computer Operator and Programming Assistant (COPA)', price: 16000, description: 'Fundamentals of computer operations, data entry, and basic programming skills.', startDate: '2025-09-01', endDate: '2026-02-28', duration: '6 Months', centerName: 'Hubballi Training Center' },
        { id: 'hospitality-management', name: 'Hospitality Management Training (HMT)', price: 22000, description: 'Develop skills for a successful career in hotels, restaurants, and the wider hospitality sector.', startDate: '2025-11-01', endDate: '2026-05-31', duration: '7 Months', centerName: 'Bengaluru Main Center' },
        { id: 'panchakarma-yoga', name: 'Panchakarma Therapy & Yoga', price: 28000, description: 'Traditional Ayurvedic therapeutic practices combined with yoga for wellness and healing.', startDate: '2025-10-05', endDate: '2026-01-05', duration: '3 Months', centerName: 'Mysuru Satellite Branch' },
        { id: 'gda-home-nursing', name: 'GDA/Home Nursing', price: 17000, description: 'Training for General Duty Assistant and essential home healthcare services for patient care.', startDate: '2025-08-25', endDate: '2026-02-25', duration: '6 Months', centerName: 'Bengaluru Main Center' },
        { id: 'dairy-farming', name: 'Dairy Farming Training', price: 9000, description: 'Learn modern techniques and best practices for efficient dairy production.', startDate: '2025-09-01', endDate: '2025-11-01', duration: '2 Months', centerName: 'Rural Development Center' },
        { id: 'sheep-goats', name: 'Sheep & Goats Training', price: 7000, description: 'Practical training in rearing sheep and goats for livelihood and commercial purposes.', startDate: '2025-10-01', endDate: '2025-12-01', duration: '2 Months', centerName: 'Rural Development Center' },
        { id: 'sericulture', name: 'Sericulture Training', price: 8500, description: 'Comprehensive training in silkworm rearing, mulberry cultivation, and silk production.', startDate: '2025-08-01', endDate: '2025-10-01', duration: '2 Months', centerName: 'Rural Development Center' },
        { id: 'poultry', name: 'Poultry Training', price: 9500, description: 'Effective methods for poultry farming, including rearing, feeding, and disease management.', startDate: '2025-09-15', endDate: '2025-12-15', duration: '3 Months', centerName: 'Rural Development Center' },
        { id: 'fishery', name: 'Fishery Training', price: 10500, description: 'Techniques for sustainable fish farming, aquaculture, and fishery management.', startDate: '2025-11-01', endDate: '2026-01-01', duration: '2 Months', centerName: 'Coastal Training Center' },
        { id: 'mushroom', name: 'Mushroom Training', price: 6000, description: 'Cultivation, harvesting, and marketing of various edible mushroom species.', startDate: '2025-08-10', endDate: '2025-09-10', duration: '1 Month', centerName: 'Hubballi Training Center' },
        { id: 'apiculture', name: 'Apiculture Training', price: 7500, description: 'The art and science of beekeeping, honey production, and bee colony management.', startDate: '2025-09-05', endDate: '2025-11-05', duration: '2 Months', centerName: 'Rural Development Center' }
    ];

    // Optional: Display personalized welcome message if welcomeMessageElement exists
    if (welcomeMessageElement) {
        const dummyUsers = JSON.parse(localStorage.getItem('tech4hopeUsers')) || {};
        const loggedInUserEmail = localStorage.getItem('loggedInUserEmail');

        if (loggedInUserEmail && dummyUsers[loggedInUserEmail]) {
            const userName = dummyUsers[loggedInUserEmail].candidateName || 'Student';
            welcomeMessageElement.textContent = `Welcome, ${userName}! Explore and apply for courses:`;
        } else {
            welcomeMessageElement.textContent = `Welcome! Explore and apply for courses:`;
        }
    }

    // Function to display courses
    function displayCourses() {
        courseListElement.innerHTML = ''; // Clear existing list
        courses.forEach(course => {
            const courseCard = document.createElement('div');
            courseCard.classList.add('course-card'); // Add class for grid styling
            courseCard.innerHTML = `
                <div class="card-header">
                    <h3>${course.name}</h3>
                    <div class="course-price">INR ${course.price.toLocaleString('en-IN')}</div>
                </div>
                <div class="card-body">
                    <p>${course.description}</p>
                    <div class="course-details-grid">
                        <p><strong>Start Date:</strong> ${course.startDate}</p>
                        <p><strong>End Date:</strong> ${course.endDate}</p>
                        <p><strong>Duration:</strong> ${course.duration}</p>
                        <p class="full-width"><strong>Center:</strong> ${course.centerName}</p>
                    </div>
                </div>
                <div class="card-footer">
                    <button class="apply-button" data-course-id="${course.id}" data-course-name="${course.name}" data-course-price="${course.price}" data-center-name="${course.centerName}">Apply Now</button>
                </div>
            `;
            courseListElement.appendChild(courseCard); // Append the card to the container
        });

        // Add event listeners to all "Apply Now" buttons
        document.querySelectorAll('.apply-button').forEach(button => {
            button.addEventListener('click', handleApplyCourse);
        });
    }

    // Function to handle course application
    function handleApplyCourse(event) {
        const courseId = event.target.dataset.courseId;
        const courseName = event.target.dataset.courseName;
        const coursePrice = event.target.dataset.coursePrice;
        const centerName = event.target.dataset.centerName; // Get center name

        // In a real application, you would send this application data to your backend
        // For this demo, we'll store it in localStorage to simulate an "applied course"
        // so it can be picked up by fee_details.js
        let appliedCourses = JSON.parse(localStorage.getItem('appliedCourses')) || [];
        const existingCourse = appliedCourses.find(c => c.id === courseId);

        if (!existingCourse) {
            appliedCourses.push({
                id: courseId,
                name: courseName,
                price: parseFloat(coursePrice), // Convert to number
                paidAmount: 0, // Initially no payment
                dueAmount: parseFloat(coursePrice),
                lastPaymentDate: 'N/A',
                centerName: centerName // Store center name
            });
            localStorage.setItem('appliedCourses', JSON.stringify(appliedCourses));

            alert(`You have applied for: ${courseName} (Price: INR ${coursePrice.toLocaleString('en-IN')}) at ${centerName}.\n\nYour application has been noted. Please check Fee Details for payment options.`);

            // Disable the button after application
            event.target.textContent = 'Applied';
            event.target.disabled = true;
            event.target.style.backgroundColor = '#6c757d'; // Grey out button
            event.target.style.cursor = 'not-allowed';
        } else {
            alert(`You have already applied for ${courseName}.`);
        }
    }

    // Display courses when the page loads
    displayCourses();
});
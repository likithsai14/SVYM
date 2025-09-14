document.addEventListener('DOMContentLoaded', () => {
    console.log("Submit Feedback page loaded.");

    const feedbackForm = document.getElementById('feedbackForm');

    feedbackForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission

        const feedbackType = document.getElementById('feedbackType').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;

        // In a real application, you would send this data to a backend server.
        // For this demo, we'll just log it and show an alert.

        console.log({
            feedbackType: feedbackType,
            subject: subject,
            message: message
        });

        alert('Thank you for your feedback! Your message has been received.');

        // Optionally clear the form after submission
        feedbackForm.reset();
    });
});
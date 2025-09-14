document.addEventListener('DOMContentLoaded', () => {
    console.log("Help & FAQs page loaded.");

    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', () => {
            // Toggle 'active' class on the clicked FAQ item
            item.classList.toggle('active');

            // Adjust max-height for smooth transition
            const answer = item.querySelector('.faq-answer');
            if (item.classList.contains('active')) {
                answer.style.maxHeight = answer.scrollHeight + "px"; // Set to actual height
            } else {
                answer.style.maxHeight = "0";
            }
        });
    });
});
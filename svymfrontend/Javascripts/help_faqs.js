document.addEventListener('DOMContentLoaded', () => {
    console.log("Help & FAQs page loaded.");

    const faqList = document.getElementById('faqList');

    // Fetch FAQs data from backend
    fetch('/.netlify/functions/org-get-help-faqs')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch FAQs data');
            }
            return response.json();
        })
        .then(data => {
            faqList.innerHTML = '';  // Clear existing static content

            data.forEach(faq => {
                const faqItem = document.createElement('div');
                faqItem.classList.add('faq-item');

                const questionDiv = document.createElement('div');
                questionDiv.classList.add('faq-question');
                questionDiv.innerHTML = "<span>" + faq.qtn + "</span><i class=\"fas fa-chevron-down toggle-icon\"></i>";

                const answerDiv = document.createElement('div');
                answerDiv.classList.add('faq-answer');
                answerDiv.innerHTML = "<p>" + faq.answer + "</p>";

                faqItem.appendChild(questionDiv);
                faqItem.appendChild(answerDiv);

                // Add click event to toggle visibility
                questionDiv.addEventListener('click', () => {
                    faqItem.classList.toggle('active');
                    if (faqItem.classList.contains('active')) {
                        answerDiv.style.maxHeight = answerDiv.scrollHeight + 'px';
                    } else {
                        answerDiv.style.maxHeight = '0';
                    }
                });

                faqList.appendChild(faqItem);
            });
        })
        .catch(error => {
            console.error('Error loading FAQs:', error);
            faqList.innerHTML = '<p>Failed to load FAQs. Please try again later.</p>';
        });
});

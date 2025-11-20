const modals = document.querySelectorAll('.modal');
console.log(modals);

// Function to prevent body scroll when modal is open
function toggleBodyScroll() {
    const isAnyModalOpen = document.querySelector('.modal.show') !== null;
    document.body.style.overflow = isAnyModalOpen ? 'hidden' : '';
}

// Close modal on close button click
modals.forEach(modal => {
    const closeBtn = modal.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.classList.remove('show');
            toggleBodyScroll();
        };
    }
});

// Use MutationObserver to watch for modal show/hide changes
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            toggleBodyScroll();
        }
    });
});

// Observe each modal for class changes
modals.forEach(modal => {
    observer.observe(modal, { attributes: true });
});

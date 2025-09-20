const modals = document.querySelectorAll('.modal');
console.log(modals);
modals.forEach(modal => {
    modal.querySelector('.close-btn').onclick = function() {
        modal.classList.remove('show');
    }
})
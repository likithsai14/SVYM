const modals = document.querySelectorAll('.modal');
console.log(modals);
modals.forEach(modal => {
    console.log(modal);
    console.log(modal.querySelector('.close-btn'));
    modal.querySelector('.close-btn').onclick = function() {
        console.log("Close button clicked");
        modal.classList.remove('show');
    }
})
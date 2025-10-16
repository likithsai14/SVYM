document.addEventListener('DOMContentLoaded', () => {
    const welcomeMessageElement = document.getElementById('welcomeMessage');
    const loggedInUserName = JSON.parse(sessionStorage.getItem("user")).username;

    if (welcomeMessageElement && loggedInUserName) {
        const displayUserName = loggedInUserName.charAt(0).toUpperCase() + loggedInUserName.slice(1);
        welcomeMessageElement.textContent = `Welcome, ${displayUserName}!`;
    } else if (welcomeMessageElement) {
        welcomeMessageElement.textContent = `Welcome to SVYM, Trainer!`;
    }
});
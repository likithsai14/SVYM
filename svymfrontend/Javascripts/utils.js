function showFormMessage(messageElement, type, text) {
    messageElement.textContent = text;
    messageElement.className = `message ${type}`;
    messageElement.style.display = 'block';
}

// Standard date formatting function: DD/MM/YYYY
function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

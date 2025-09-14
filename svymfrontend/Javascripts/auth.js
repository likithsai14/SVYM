const adminLoggedIn = sessionStorage.getItem('isLoggedIn');
if (!adminLoggedIn || adminLoggedIn !== 'true') {
    console.log('Admin not logged in, redirecting to login.html');
    window.location.href = 'login.html';
    return;
}


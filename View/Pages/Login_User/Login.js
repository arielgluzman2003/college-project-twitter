document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    // Demo: show alert. Replace with real authentication logic.
    const username = document.getElementById('username').value;
    alert(`Welcome, ${username}!`);
});
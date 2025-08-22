document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    // Demo: show alert. Replace with real authentication logic.
    const username = document.getElementById('username').value;
    alert(`Welcome, ${username}!`);
});

document.getElementById('openCreateUserModal').addEventListener('click', function(e) {
    e.preventDefault();
    fetch('../CreateUser/CreateUserModal.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('createUserModalContainer').innerHTML = html;
            // Load CreateUser CSS if needed
            if (!document.getElementById('createUser-css')) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = '../CreateUser/CreateUser.css';
                link.id = 'createUser-css';
                document.head.appendChild(link);
            }
            // Show the modal
            const modal = new bootstrap.Modal(document.getElementById('createUserModal'));
            modal.show();
        });
});
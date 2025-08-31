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
            // Load CreateUser CSS
            if (!document.getElementById('createUser-css')) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = '../CreateUser/CreateUser.css';
                link.id = 'createUser-css';
                document.head.appendChild(link);
            }
            
            // Show the modal
            const modalElement = document.getElementById('createUserModal');
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
            
            // Add a listener to remove the CSS when the modal is hidden
            modalElement.addEventListener('hidden.bs.modal', function() {
                const link = document.getElementById('createUser-css');
                if (link) {
                    link.remove();
                }
            }, { once: true }); // The { once: true } ensures the listener is removed after it runs
        });
});

document.querySelector('#loginForm button[type="submit"]').addEventListener('click', function(e) {
    e.preventDefault();
    fetch('LoginModal.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('loginUserModalContainer').innerHTML = html;
            const modal = new bootstrap.Modal(document.getElementById('loginUserModal'));
            modal.show();
        });
});
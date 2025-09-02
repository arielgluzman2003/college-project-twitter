// path: /js/Login.js
(function () {
  'use strict';

  const qs = (sel, root = document) => root.querySelector(sel);

  function ensureStylesheet(id, href) {
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.id = id;
      document.head.appendChild(link);
    }
  }

  // ---- Spinner handling ----
  function showSpinner() {
    if (!qs('#global-spinner')) {
      const spinner = document.createElement('div');
      spinner.id = 'global-spinner';
      spinner.className =
        'position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50';
      spinner.innerHTML =
        '<div class="spinner-border text-light" role="status"><span class="visually-hidden">Loading...</span></div>';
      document.body.appendChild(spinner);
    }
  }

  function hideSpinner() {
    const spinner = qs('#global-spinner');
    if (spinner) spinner.remove();
  }

  function closeLoginModal() {
    const el = document.getElementById('loginUserModal');
    if (!el) return Promise.resolve();
    const instance = bootstrap.Modal.getInstance(el) || new bootstrap.Modal(el);
    return new Promise((resolve) => {
      el.addEventListener('hidden.bs.modal', resolve, { once: true });
      instance.hide();
    });
  }
  
  function closeCreateUserModal() {
    const el = document.getElementById('createUserModal');
    if (!el) return Promise.resolve();
    const instance = bootstrap.Modal.getInstance(el) || new bootstrap.Modal(el);
    return new Promise((resolve) => {
      el.addEventListener('hidden.bs.modal', resolve, { once: true });
      instance.hide();
    });
  }

  function loadAndShowCreateUserModal() {
    showSpinner();
    return $.ajax({
      url: '../CreateUser/CreateUserModal.html',
      method: 'GET',
      dataType: 'html'
    })
      .done((html) => {
        const container = document.getElementById('createUserModalContainer');
        if (!container) {
          console.error('Missing #createUserModalContainer');
          return;
        }
        container.innerHTML = html;

        ensureStylesheet('createUser-css', '../CreateUser/CreateUser.css');
        const modalEl = document.getElementById('createUserModal');
        if (!modalEl) {
          console.error('Missing #createUserModal inside loaded HTML');
          return;
        }
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
        
        // Event listener for the user creation form
        const createUserForm = document.getElementById('createUserForm');
        if (createUserForm) {
            createUserForm.addEventListener('submit', (e) => {
                e.preventDefault();
                // Collect all user data from the form using correct IDs from HTML
                const name = document.getElementById('NameCreation')?.value || '';
                const email = document.getElementById('EmailCreation')?.value || '';
                const username = document.getElementById('UserNameCreation')?.value || '';
                const password = document.getElementById('PasswordCreation')?.value || '';
                const birthYear = document.getElementById('user-birthyear-select')?.value || '';
                const birthMonth = document.getElementById('user-birthmonth-select')?.value || '';
                const birthDay = document.getElementById('user-birthday-select')?.value || '';

                showSpinner();
                $.ajax({
                    url: 'http://localhost:3000/api/users/create',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ name, email, username, password, birthYear, birthMonth, birthDay })
                })
                .done((response) => {
                    console.log('User creation success:', response);
                    if (response.success) {
                        alert(`Account created successfully for ${username}!`);
                        closeCreateUserModal();
                    } else {
                        alert(response.message || 'User creation failed. Please try again.');
                    }
                })
                .fail((xhr, status, error) => {
                    console.error('User creation failed:', status, error);
                    if (xhr.status === 401) {
                        alert('Authentication failed. Please check your credentials.');
                    } else {
                        alert('User creation failed due to a server error or no response. Please try again.');
                    }
                })
                .always(hideSpinner);
            });
        }
        
        modalEl.addEventListener(
          'hidden.bs.modal',
          () => {
            const link = document.getElementById('createUser-css');
            if (link) link.remove();
          },
          { once: true }
        );
      })
      .fail((xhr, status, error) => {
        console.error('Failed to load CreateUser modal:', status, error);
        alert('Failed to load Create User modal. Check console.');
      })
      .always(hideSpinner);
  }

  function openLoginModal() {
    showSpinner();
    return $.ajax({
      url: 'LoginModal.html',
      method: 'GET',
      dataType: 'html'
    })
      .done((html) => {
        const container = document.getElementById('loginUserModalContainer');
        if (!container) {
          console.error('Missing #loginUserModalContainer');
          return;
        }
        container.innerHTML = html;

        const modalEl = document.getElementById('loginUserModal');
        if (!modalEl) {
          console.error('Missing #loginUserModal inside loaded HTML');
          return;
        }
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
      })
      .fail((xhr, status, error) => {
        console.error('Failed to load Login modal:', status, error);
        alert('Failed to load Login modal. Check console.');
      })
      .always(hideSpinner);
  }

  // ---- All Event Bindings in one place for robustness ----
  document.addEventListener('submit', (e) => {
    // This listener will only work for forms with a matching ID, ensuring it works after the modal is loaded.
    if (e.target.id === 'loginUserForm') {
      e.preventDefault();
      const username = document.getElementById('loginUsername')?.value || '';
      const password = document.getElementById('loginPassword')?.value || '';

      showSpinner();
      $.ajax({
        url: 'http://localhost:3000/api/users/authenticate',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ username, password })
      })
        .done((response) => {
          console.log('Login success:', response);
          if (response.success) {
            alert(`Welcome, ${username}!`);
            closeLoginModal();
          } else {
            alert(response.message || 'Login failed, please try again.');
          }
        })
        .fail((xhr, status, error) => {
          console.error('Login failed:', status, error);
          if (xhr.status === 401) {
            alert('Authentication failed. Please check your credentials.');
          } else {
            alert('Login failed due to a server error or no response. Please try again.');
          }
        })
        .always(hideSpinner);
    }
  });

  document.addEventListener('click', (e) => {
    // This delegated handler checks for a button that opens the login modal.
    const loginSubmitBtn = e.target.closest('#loginForm button[type="submit"]');
    if (loginSubmitBtn) {
      e.preventDefault();
      openLoginModal();
      return;
    }

    // This delegated handler checks for a link that opens the create user modal.
    const createAccountLink = e.target.closest('#goToCreateUser');
    if (createAccountLink) {
      e.preventDefault();
      closeLoginModal().then(loadAndShowCreateUserModal).catch(loadAndShowCreateUserModal);
      return;
    }

    // This handler checks for the button that opens the create user modal from the main page.
    const openCreateUserBtn = e.target.closest('#openCreateUserModal');
    if (openCreateUserBtn) {
      e.preventDefault();
      loadAndShowCreateUserModal();
    }
  });
})();
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

  function loadAndShowCreateUserModal() {
    showSpinner();
    return $.ajax({
      url: '../CreateUser/CreateUserModal.html', // check this path
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
      url: 'LoginModal.html', // check this path
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

  // ---- Bindings ----
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('username')?.value || '';
      const password = document.getElementById('password')?.value || '';

      showSpinner();
      sleep
      $.ajax({
        url: '/api/login', // replace with your backend
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ username, password })
      })
        .done((response) => {
          console.log('Login success:', response);
          alert(`Welcome, qs{username}!`);
          closeLoginModal();
        })
        .fail((xhr, status, error) => {
          console.error('Login failed:', status, error);
          alert('Login failed, please try again.');
        })
        .always(hideSpinner);
    });
  }

  const openCreateUserBtn = document.getElementById('openCreateUserModal');
  if (openCreateUserBtn) {
    openCreateUserBtn.addEventListener('click', (e) => {
      e.preventDefault();
      loadAndShowCreateUserModal();
    });
  }

  const loginSubmitBtn = document.querySelector('#loginForm button[type=\"submit\"]');
  if (loginSubmitBtn) {
    loginSubmitBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openLoginModal();
    });
  }

  // Delegated handler for "המשך להרשמה"
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;

    const isGoToCreateBySelector = a.matches('#goToCreateUser, [data-go-to=\"create-user\"]');
    const text = (a.textContent || '').trim();
    const isGoToCreateByText = /המשך\\s*להרשמה/.test(text);

    if (isGoToCreateBySelector || isGoToCreateByText) {
      e.preventDefault();
      closeLoginModal()
        .then(loadAndShowCreateUserModal)
        .catch(() => loadAndShowCreateUserModal());
    }
  });
})();


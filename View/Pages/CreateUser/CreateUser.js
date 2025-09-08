const addSelectOptions = (container, optionsArr) => {
    optionsArr.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        container.appendChild(optionElement);
    });
};

addYears = (container, startYear, endYear) => {
    const yearsArray = [];
    for (let year = endYear; year >= startYear; year--) {
        yearsArray.push({ value: year, label: year.toString() });
    }
    addSelectOptions(container, yearsArray);
}
addMonths = (container) => {
    const monthsArray = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' }
    ];
    addSelectOptions(container, monthsArray);
}
addDays = (container) => {
    const daysArray = [];
    for (let day = 1; day <= 31; day++) {
        daysArray.push({ value: day, label: day.toString() });
    }
    addSelectOptions(container, daysArray);
}

// window.onload = () => {
//     const yearSelect = document.getElementById('user-birthyear-select');
//     const monthSelect = document.getElementById('user-birthmonth-select');
//     const daySelect = document.getElementById('user-birthday-select');

//     // Add years from 1900 to the current year
//     const currentYear = new Date().getFullYear();
//     addYears(yearSelect, 1900, currentYear);

//     // Add months
//     addMonths(monthSelect);

//     // Add days
//     addDays(daySelect);
// }

function setupCreateUserFields() {
    const yearSelect = document.getElementById('user-birthyear-select');
    const monthSelect = document.getElementById('user-birthmonth-select');
    const daySelect = document.getElementById('user-birthday-select');

    if (yearSelect && monthSelect && daySelect) {
        // Add years from 1900 to the current year
        const currentYear = new Date().getFullYear();
        yearSelect.innerHTML = '<option value="" selected disabled hidden></option>';
        addYears(yearSelect, 1900, currentYear);

        // Add months
        monthSelect.innerHTML = '<option value="" selected disabled hidden></option>';
        addMonths(monthSelect);

        // Add days
        daySelect.innerHTML = '<option value="" selected disabled hidden></option>';
        addDays(daySelect);
    }
}

// Listen for modal show event
document.addEventListener('shown.bs.modal', function(event) {
    if (event.target.id === 'createUserModal') {
        setupCreateUserFields();
    }
});




// path: /CreateUser/CreateUser.js
(function () {
  'use strict';

  function showSpinner() {
    const spinner = document.createElement('div');
    spinner.id = 'global-spinner';
    spinner.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50';
    spinner.innerHTML = '<div class="spinner-border text-light" role="status"><span class="visually-hidden">Loading...</span></div>';
    document.body.appendChild(spinner);
  }

  function hideSpinner() {
    const spinner = document.getElementById('global-spinner');
    if (spinner) spinner.remove();
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

  document.addEventListener('submit', (e) => {
    if (e.target.id === 'createUserForm') {
      e.preventDefault();
      
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
        xhrFields: { withCredentials: true },
        data: JSON.stringify({ name, email, username, password, birthYear, birthMonth, birthDay })
      })
      .done((response) => {
        console.log('User creation success:', response);
        if (response.success) {
          alert(`Account created successfully for ${username}!`);
          closeCreateUserModal();
          window.location.href = "/View/Pages/Feed/Feed.html"; 
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
    }
  });

})();
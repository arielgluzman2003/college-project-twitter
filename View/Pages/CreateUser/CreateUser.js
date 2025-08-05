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

window.onload = () => {
    const yearSelect = document.getElementById('user-birthyear-select');
    const monthSelect = document.getElementById('user-birthmonth-select');
    const daySelect = document.getElementById('user-birthday-select');

    // Add years from 1900 to the current year
    const currentYear = new Date().getFullYear();
    addYears(yearSelect, 1900, currentYear);

    // Add months
    addMonths(monthSelect);

    // Add days
    addDays(daySelect);
}
'use strict'

import { format_ISO_Date } from "./date_functions.js";
import { calculateHolidays } from "./holidays.js";

// region: global declarations
const excludeDays = [0, 6]; //sunday & monday
var excludeHolidays = [];
const Tage_form = document.getElementById("Tage-date-form");
const form_start_date = document.getElementById("Tage-start-date");
const form_end_date = document.getElementById("Tage-end-date");
const form_incl_start = document.getElementById('Tage-include-start');
const results_table = document.getElementById('Tage-results-table');


// Get the two dates from the user
const start_date = () => { return new Date(document.getElementById("Tage-start-date").value) };
const end_date = () => { return new Date(document.getElementById("Tage-end-date").value) };


function Tage_init() {
    form_start_date.value = format_ISO_Date(new Date());
    form_end_date.value = format_ISO_Date(new Date());
    form_start_date.focus();
    form_incl_start.checked = true;
    Tage_form.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent the form from submitting normally
        add_result();
    });
    results_table.addEventListener('dblclick', (event) => {
        console.log(event.target.innerHTML);
        navigator.clipboard.writeText(event.target.innerHTML);
    })
}

// region: main functions
function update_holidays() {
    // 
    // 
    let start_year = start_date().getFullYear();
    let end_year = end_date().getFullYear();
    let current_year = start_year;
    excludeHolidays = [];
    while (current_year <= end_year) {
        excludeHolidays.push(...Object.values(calculateHolidays(current_year)));
        current_year++;
    }
    excludeHolidays = excludeHolidays.map(el => format_ISO_Date(el));
}

function get_days_between() {
    // Initialize the count of days to 0
    let days = 0;
    let weekdays = 0;
    let days_without_holidays = 0;
    let weekdays_without_holidays = 0;

    // Loop through each day between the two dates
    const currentDate = new Date(start_date());
    if (!form_incl_start.checked) { currentDate.setDate(currentDate.getDate() + 1); }
    while (currentDate <= end_date()) {
        days++;
        // Check if the current day is a weekday
        if (!excludeDays.includes(currentDate.getDay())) { weekdays++; }
        // Check if the current day is not a holiday
        if (!excludeHolidays.includes(format_ISO_Date(currentDate))) { days_without_holidays++; }
        // Check if the current day is a weekday and not in the exclude list
        if (
            !excludeDays.includes(currentDate.getDay()) &&
            !excludeHolidays.includes(format_ISO_Date(currentDate))
        ) { weekdays_without_holidays++; }

        // Move to the next day
        currentDate.setDate(currentDate.getDate() + 1);
    }
    let days_between = { 'days': days, 'weekdays': weekdays, 'days_without_holidays': days_without_holidays, 'weekdays_without_holidays': weekdays_without_holidays }
    return days_between;
}

function add_result() {
    // Add the results to the table
    update_holidays();
    let days_between = get_days_between();
    const resultsBody = document.getElementById('results-body');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
          <td>${start_date().toLocaleDateString()}</td>
          <td>${end_date().toLocaleDateString()}</td>
          <td>${days_between.days}</td>
          <td>${days_between.weekdays}</td>
          <td>${days_between.days_without_holidays}</td>
          <td>${days_between.weekdays_without_holidays}</td>
      `;
    if (form_incl_start.checked) {
        newRow.innerHTML += "<td>&#9745;</td>"; // 
    }
    else {
        newRow.innerHTML += "<td>&#9744;</td>";
    }
    resultsBody.appendChild(newRow);

}

Tage_init();

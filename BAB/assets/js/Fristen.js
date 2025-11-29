'use strict'

import { addYearsToDate, addMonthToDate, addWeeksToDate, addDaysToDate, getFormatedDate } from "./date_functions.js";

// region: DOM elements
// Define constants for DOM elements
let Fristen_form;
let dateInput;
let yearsInput;
let monthsInput;
let weeksInput;
let daysInput;
let calculateButton;
let dateOutput;

// Define function to calculate date that is a certain number of years, months, weeks, and days away from input date
function calculateNewDate() {
  // Get the user's input date
  const userDate = new Date(dateInput.value);

  // Get the number of years, months, weeks, and days from the input fields
  const years = parseInt(yearsInput.value);
  const months = parseInt(monthsInput.value);
  const weeks = parseInt(weeksInput.value);
  const days = parseInt(daysInput.value);

  // Calculate the new date
  let newDate = new Date(userDate);

  if (years != 0) { newDate = addYearsToDate(newDate, years) };
  if (months != 0) { newDate = addMonthToDate(newDate, months) };
  if (weeks != 0) { newDate = addWeeksToDate(newDate, weeks) };
  if (days != 0) { newDate = addDaysToDate(newDate, days) };

  dateOutput.innerHTML = getFormatedDate(newDate); //getDayOfWeek(newDate, false) + ". " + newDate.toLocaleDateString();
}

// init with date from today
function Fristen_init(params) {
  Fristen_form = document.getElementById("Fristen-formDateDif");
  dateInput = document.querySelector("#Fristen-date");
  yearsInput = document.querySelector("#Fristen-years");
  monthsInput = document.querySelector("#Fristen-months");
  weeksInput = document.querySelector("#Fristen-weeks");
  daysInput = document.querySelector("#Fristen-days");
  calculateButton = document.getElementById("Fristen-calculate-button");
  dateOutput = document.getElementById("Fristen-result");

  Fristen_form.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent the form from submitting normally
    calculateNewDate();
  });


  dateInput.addEventListener("focus", (event) => { event.target.select(); });
  yearsInput.addEventListener("focus", (event) => { event.target.select(); });
  monthsInput.addEventListener("focus", (event) => { event.target.select(); });
  weeksInput.addEventListener("focus", (event) => { event.target.select(); });
  daysInput.addEventListener("focus", (event) => { event.target.select(); });


  dateInput.value = new Date().toISOString().split("T")[0];
  // dateInput.focus();

}
Fristen_init();




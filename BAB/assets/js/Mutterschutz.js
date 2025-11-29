'use strict'

import { addWeeksToDate, getFormatedDate } from "./date_functions.js";

// region: DOM elements
let Mutterschutz_form;
let Mutterschutz_dateInput;
let Mutterschutz_calculateButton;
let Mutterschutz_Result;
let Mutterschutz_Mehrlinge;

// region: INIT
// init with date from today
function Mutterschutz_init(params) {
  Mutterschutz_form = document.getElementById("Mutterschutz-form");
  Mutterschutz_dateInput = document.querySelector("#Mutterschutz-date");
  Mutterschutz_calculateButton = document.getElementById("Mutterschutz-calculate-button");
  Mutterschutz_Mehrlinge = document.getElementById("Mutterschutz-Mehrlinge");
  Mutterschutz_Result = document.getElementById("Mutterschutz-result");

  Mutterschutz_form.addEventListener('submit', (event) => {
    event.preventDefault();
    Mutterschutz_calculate();
  });

  Mutterschutz_dateInput.value = new Date().toISOString().split("T")[0];
  Mutterschutz_dateInput.focus();
}
Mutterschutz_init();

// region: functions
function Mutterschutz_calculate() {
  const userDate = new Date(Mutterschutz_dateInput.value);
  // Fristen aus MuschG § 3
  const weeks_before_birth = -6;
  const weeks_after_birth = 8;
  const weeks_Mehrlinge = 4;

  // Calculate the new date
  let newDate_before_birth = new Date(userDate);
  let newDate_after_birth = new Date(userDate);

  newDate_before_birth = addWeeksToDate(newDate_before_birth, weeks_before_birth);
  newDate_after_birth = addWeeksToDate(newDate_after_birth, weeks_after_birth);
  if (Mutterschutz_Mehrlinge.checked) {
    newDate_after_birth = addWeeksToDate(newDate_after_birth, weeks_Mehrlinge);
  }
  let result = `
  <table class=border-none">
  <tr><td class="align-left border-none">Beginn Mutterschutz:</td> <td class="align-right border-none"> ${getFormatedDate(newDate_before_birth)}</td></tr>
  <tr><td class="align-left border-none">voraussichtlicher Entbindungstag:</td> <td class="align-right border-none">${getFormatedDate(userDate)}</td></tr>
  <tr><td class="align-left border-none">Ende Mutterschutz:</td> <td class="align-right border-none">${getFormatedDate(newDate_after_birth)}</td></tr>
  </table>`;

  Mutterschutz_Result.innerHTML = result;
}
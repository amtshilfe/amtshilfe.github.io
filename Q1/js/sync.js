import { getState, updateState } from "./state.js";
import { defaultSettings } from "./constants.js";

export function syncSettingsToState(uiElements) {
  const holidaysToSkip = {};
  Object.keys(uiElements.holidayCheckboxes).forEach((k) => {
    holidaysToSkip[k] = uiElements.holidayCheckboxes[k]?.checked;
  });

  const dateFormats = {};
  Object.keys(uiElements.formatSelectors).forEach((k) => {
    dateFormats[k] = uiElements.formatSelectors[k].value;
  });

  const holidaysToShorten = {};
  const shortenCheckboxes = uiElements.shortenHolidaysContainer.querySelectorAll("input[type=checkbox]");
  shortenCheckboxes.forEach((checkbox) => {
    const key = checkbox.dataset.key;
    holidaysToShorten[key] = checkbox.checked;
  });

  updateState({
    weekdaysToSkip: {
      0: uiElements.weekdayCheckboxes.skipSunday.checked,
      1: uiElements.weekdayCheckboxes.skipMonday.checked,
      2: uiElements.weekdayCheckboxes.skipTuesday.checked,
      3: uiElements.weekdayCheckboxes.skipWednesday.checked,
      4: uiElements.weekdayCheckboxes.skipThursday.checked,
      5: uiElements.weekdayCheckboxes.skipFriday.checked,
      6: uiElements.weekdayCheckboxes.skipSaturday.checked,
    },
    currentMonth: parseInt(uiElements.monthSelector.value, 10),
    currentYear: parseInt(uiElements.yearSelector.value, 10),
    deadline1: parseInt(uiElements.deadline1InputSettings.value, 10) || 0,
    deadline2: parseInt(uiElements.deadline2InputSettings.value, 10) || 0,
    displayMonthCount: Math.max(1, Math.min(12, parseInt(uiElements.displayMonthCountInput.value, 10) || 1)),
    holidaysToSkip,
    dateFormats,
    holidaysToShorten,
    copyPrefix: uiElements.copyPrefixInput.value,
    copySuffix: uiElements.copySuffixInput.value,
  });
}

export function syncStateToUI(uiElements) {
  const appState = getState();
  uiElements.displayMonthCountInput.value = appState.displayMonthCount;
  uiElements.monthSelector.value = appState.currentMonth;
  uiElements.yearSelector.value = appState.currentYear;
  uiElements.deadline1InputSettings.value = appState.deadline1;
  uiElements.deadline2InputSettings.value = appState.deadline2;
  uiElements.weekdayCheckboxes.skipSunday.checked = appState.weekdaysToSkip[0];
  uiElements.weekdayCheckboxes.skipMonday.checked = appState.weekdaysToSkip[1];
  uiElements.weekdayCheckboxes.skipTuesday.checked = appState.weekdaysToSkip[2];
  uiElements.weekdayCheckboxes.skipWednesday.checked = appState.weekdaysToSkip[3];
  uiElements.weekdayCheckboxes.skipThursday.checked = appState.weekdaysToSkip[4];
  uiElements.weekdayCheckboxes.skipFriday.checked = appState.weekdaysToSkip[5];
  uiElements.weekdayCheckboxes.skipSaturday.checked = appState.weekdaysToSkip[6];
  Object.keys(uiElements.holidayCheckboxes).forEach((k) => {
    uiElements.holidayCheckboxes[k].checked = appState.holidaysToSkip[k];
  });
  Object.keys(uiElements.formatSelectors).forEach((k) => {
    uiElements.formatSelectors[k].value = appState.dateFormats[k];
  });
  uiElements.copyPrefixInput.value = appState.copyPrefix;
  uiElements.copySuffixInput.value = appState.copySuffix;

  // Dynamische UI für Verkürzungsfeiertage
  populateShortenHolidays(uiElements, appState);
}

export function populateShortenHolidays(uiElements, appState) {
  const container = uiElements.shortenHolidaysContainer;
  container.innerHTML = ""; // Leeren
  const fragment = document.createDocumentFragment();

  const holidayNameMapping = {
    skipNewYear: "Neujahr (1.1.)",
    skipGoodFriday: "Karfreitag",
    skipEasterMonday: "Ostermontag",
    skipLabourDay: "Tag d. Arbeit (1.5.)",
    skipAscension: "Chr. Himmelfahrt",
    skipPentecostMonday: "Pfingstmontag",
    skipUnityDay: "Tag d. D. Einheit (3.10.)",
    skipReformationDay: "Reformationstag (31.10.)",
    skipChristmasEve: "Heiligabend (24.12.)",
    skipChristmasDay: "1. Weihnachtstag",
    skipBoxingDay: "2. Weihnachtstag",
    skipNewYearsEve: "Silvester (31.12.)",
  };

  Object.keys(defaultSettings.holidaysToSkip).forEach((key) => {
    if (!appState.holidaysToSkip[key]) {
      const label = document.createElement("label");
      label.className = "flex items-center";
      const isChecked = appState.holidaysToShorten[key] || false;
      label.innerHTML = `<input type="checkbox" data-key="${key}" class="mr-2 h-4 w-4" ${isChecked ? "checked" : ""} /><span>${
        holidayNameMapping[key]
      }</span>`;
      fragment.appendChild(label);
    }
  });
  container.appendChild(fragment);
}

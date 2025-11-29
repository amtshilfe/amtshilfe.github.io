import { monthNames } from "./constants.js";

// === UI-Hilfsfunktionen ===
export function showMessage(uiElements, text, isError = false) {
  uiElements.messageBox.textContent = text;
  uiElements.messageBox.classList.remove("bg-red-500", "bg-green-500");
  uiElements.messageBox.classList.add(isError ? "bg-red-500" : "bg-green-500");
  uiElements.messageBox.style.display = "block";
  setTimeout(() => (uiElements.messageBox.style.display = "none"), 4000);
}

export function formatDateDisplay(date) {
  return `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}.${date.getFullYear()}`;
}

export function formatDateISOShort(date) {
  return `${String(date.getFullYear()).slice(2)}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
}

export function formatDateBasedOnSetting(date, stringFormat) {
  return stringFormat === "normal" ? formatDateDisplay(date) : formatDateISOShort(date);
}

export function createDetailsText(startStringFormat, resultStringFormat, skippedDays, shortenedDays, numberOfDaysToSkip) {
  let detailsText = `Start: ${formatDateDisplay(startStringFormat)}\nFrist: ${numberOfDaysToSkip} AT\nErgebnis: ${formatDateDisplay(
    resultStringFormat
  )}\n\n`;
  if (skippedDays.length > 0) {
    detailsText +=
      `Übersprungen (${skippedDays.length}):\n` + skippedDays.map((i) => `• ${formatDateDisplay(i.date)} (${i.reason})`).join("\n");
  } else {
    detailsText += "Keine Tage übersprungen.";
  }

  if (shortenedDays && shortenedDays.length > 0) {
    detailsText +=
      `\n\nVerkürzt wegen (${shortenedDays.length}):\n` +
      shortenedDays.map((i) => `• ${formatDateDisplay(i.date)} (${i.reason})`).join("\n");
  }
  return detailsText;
}

export function showDetailsBox(uiElements, title, content) {
  uiElements.detailsDialog.querySelector("#details-title").textContent = title;
  uiElements.detailsDialog.querySelector("#details-content").textContent = content;
  uiElements.detailsDialog.showPopover();
}

export function renderTableRows(tbody, data, appState) {
  tbody.innerHTML = "";
  if (!data) return;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const fragment = document.createDocumentFragment();
  data.forEach((item) => {
    const row = document.createElement("tr");
    const normDate = new Date(item.currentDate);
    normDate.setHours(0, 0, 0, 0);
    const isToday = normDate.getTime() === today.getTime();
    row.className = isToday ? "today" : "";

    // Erstellt eine Zelle (td) mit den notwendigen Daten und hängt sie an die Zeile (tr) an.
    const createCell = (type, date, format, details) => {
      const cell = document.createElement("td");
      cell.dataset.type = type;
      cell.dataset.date = date.toISOString();
      cell.dataset.details = details;
      cell.textContent = formatDateBasedOnSetting(date, format);
      row.appendChild(cell);
    };

    createCell(
      "currentDate",
      item.currentDate,
      appState.dateFormats.formatCurrentDate,
      createDetailsText(item.currentDate, item.currentDate, [], [], 0)
    );

    createCell(
      "deadline1",
      item.deadline1,
      appState.dateFormats.formatDeadline1,
      createDetailsText(item.currentDate, item.deadline1, item.skippedDays1, item.shortenedDays1, appState.deadline1)
    );

    createCell(
      "deadline2",
      item.deadline2,
      appState.dateFormats.formatDeadline2,
      createDetailsText(item.currentDate, item.deadline2, item.skippedDays2, item.shortenedDays2, appState.deadline2)
    );

    fragment.appendChild(row);
  });
  tbody.appendChild(fragment);
}

export function updateMonthYearDisplay(uiElements, appState) {
  const count = appState.displayMonthCount;
  const startDate = new Date(appState.currentYear, appState.currentMonth, 1);
  if (count <= 1) {
    uiElements.currentMonthYear.textContent = `${monthNames[startDate.getMonth()]} ${startDate.getFullYear()}`;
  } else {
    const endDate = new Date(appState.currentYear, appState.currentMonth + count - 1, 1);
    const startText = `${monthNames[startDate.getMonth()]} ${startDate.getFullYear()}`;
    const endText = `${monthNames[endDate.getMonth()]} ${endDate.getFullYear()}`;
    uiElements.currentMonthYear.textContent = `${startText} - ${endText}`;
  }
}

export function populateYears(uiElements) {
  const currentYear = new Date().getFullYear(),
    firstYear = currentYear - 3,
    lastYear = currentYear + 5;
  uiElements.yearSelector.innerHTML = "";
  for (let year = firstYear; year <= lastYear; year++) {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    uiElements.yearSelector.appendChild(option);
  }
}

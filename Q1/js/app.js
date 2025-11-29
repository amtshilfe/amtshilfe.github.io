import { monthNames, defaultSettings } from "./constants.js";
import { showMessage, renderTableRows, updateMonthYearDisplay, populateYears, showDetailsBox } from "./ui.js";
import { uiElements } from "./uiElements.js";
import { clearHolidayCaches } from "./holidays.js";
import { initializeEventListeners } from "./events.js";
import { getState, updateState, saveSettings, loadSettings, resetStateToDefault, changeMonthInState } from "./state.js";
import { syncSettingsToState, syncStateToUI } from "./sync.js";
import { addWorkingDays } from "./dateLogic.js";

const deadlineCache = new Map(); // Cache für berechnete Monatsdaten

// === Hauptfunktionen ===
function calculateAndCacheMonth(year, month) {
  const key = `${year}-${month}`;
  const appState = getState();
  if (deadlineCache.has(key)) return;
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate(),
    localCacheArray = [];
  for (let i = 1; i <= lastDayOfMonth; i++) {
    const runningDate = new Date(year, month, i),
      d1 = addWorkingDays(runningDate, appState.deadline1),
      d2 = addWorkingDays(runningDate, appState.deadline2);
    localCacheArray.push({
      currentDate: runningDate,
      deadline1: d1.resultDate,
      deadline2: d2.resultDate,
      skippedDays1: d1.skippedDays,
      skippedDays2: d2.skippedDays,
      shortenedDays1: d1.shortenedDays,
      shortenedDays2: d2.shortenedDays,
    });
  }
  deadlineCache.set(key, localCacheArray);
}

export function updateTableDisplay() {
  const appState = getState();
  uiElements.tablesWrapper.innerHTML = "";
  for (let i = 0; i < appState.displayMonthCount; i++) {
    const date = new Date(appState.currentYear, appState.currentMonth + i, 1); // Berechnet den Monat für jede Tabelle im Loop
    const year = date.getFullYear();
    const month = date.getMonth();

    const monthContainer = document.createElement("div");
    monthContainer.className = "flex-shrink-0 w-60"; // Feste Breite für jede Tabelle

    let table = createTable(year, month, appState);
    monthContainer.appendChild(table);
    uiElements.tablesWrapper.appendChild(monthContainer);
  }
  updateMonthYearDisplay(uiElements, appState);
}

function createTable(year, month, appState) {
  calculateAndCacheMonth(year, month);
  const monthData = deadlineCache.get(`${year}-${month}`);
  // Tabellenstruktur mit createElement erstellen
  const table = document.createElement("table");
  table.className = "w-full";

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  const headers = {
    th1: { className: "rounded-tl-lg border-0", textContent: `${monthNames[month]} ${year}` },
    th2: { className: "border-0", textContent: "Frist 1" },
    th3: { className: "rounded-tr-lg border-0", textContent: "Frist 2" },
  };

  Object.keys(headers).forEach((key) => {
    let th = document.createElement("th");
    th.className = headers[key].className;
    th.textContent = headers[key].textContent;
    headerRow.append(th);
  });
  thead.appendChild(headerRow);

  const tbody = document.createElement("tbody");
  renderTableRows(tbody, monthData, appState);

  table.append(thead, tbody);
  return table;
}

// === Handler-Funktionen (werden an events.js übergeben) ===
export function changeMonth(offset) {
  changeMonthInState(offset);
  updateTableDisplay();
}

export function changeToCurrentMonth() {
  const d = new Date();
  updateState({
    currentYear: d.getFullYear(),
    currentMonth: d.getMonth(),
  });
  updateTableDisplay();
}

function openSettings() {
  syncStateToUI(uiElements); // Erst UI befüllen
  uiElements.settingsDialog.showModal();
}

function closeSettings() {
  uiElements.settingsDialog.close(); // ohne Speichern
}

function closeAndSaveSettings() {
  syncSettingsToState(uiElements);
  saveSettings();
  deadlineCache.clear();
  clearHolidayCaches();
  updateTableDisplay();
  closeSettings();
}

function resetSettings() {
  localStorage.clear(); // Sicherer, um alles zu löschen
  resetStateToDefault();
  syncStateToUI(uiElements);
  showMessage(uiElements, "Einstellungen zurückgesetzt & gelöscht");
}

async function generateAndCopyExportLink() {
  syncSettingsToState(uiElements); // Ensure state is current with UI
  const appState = getState();
  const params = new URLSearchParams();

  // Compare current settings with default settings and add differences to params
  Object.keys(defaultSettings).forEach((key) => {
    const currentValue = appState[key];
    const defaultValue = defaultSettings[key];

    if (JSON.stringify(currentValue) !== JSON.stringify(defaultValue)) {
      if (typeof currentValue === "object" && currentValue !== null) {
        params.set(key, JSON.stringify(currentValue));
      } else {
        params.set(key, currentValue);
      }
    }
  });

  const exportUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  uiElements.exportSettingsLinkInput.value = exportUrl;
  uiElements.exportSettingsLinkInput.select();
  try {
    await navigator.clipboard.writeText(exportUrl);
  } catch (err) {
    // Fallback für ältere Browser oder unsichere Kontexte (http)
    console.warn("Fallback für ältere Browser oder unsichere Kontexte (http)");
    document.execCommand("copy");
  }
  showMessage(uiElements, "Link mit Einstellungen in die Zwischenablage kopiert!");
  window.history.pushState("Fristenrechner", "Fristenrechner", `${window.location.origin}${window.location.pathname}?${params.toString()}`);
}

function applyUrlParameters() {
  const params = new URLSearchParams(window.location.search);
  if (params.toString() === "") return false;

  const settingsFromUrl = {};
  params.forEach((value, key) => {
    try {
      // Try to parse JSON for objects, otherwise use the string value
      settingsFromUrl[key] = JSON.parse(value);
    } catch (e) {
      settingsFromUrl[key] = value;
    }
  });

  updateState(settingsFromUrl);
  return true;
}

// Initialisierung
window.addEventListener("load", () => {
  const hasUrlParams = applyUrlParameters();
  if (!hasUrlParams && loadSettings()) {
    showMessage(uiElements, "Benutzereinstellungen aus lokalem Speicher geladen");
  }

  const appState = getState();
  populateYears(uiElements);
  syncStateToUI(uiElements);

  initializeEventListeners(uiElements, {
    changeMonth,
    changeToCurrentMonth,
    openSettings,
    closeAndSaveSettings,
    closeSettings,
    resetSettings,
    generateAndCopyExportLink,
  });

  updateTableDisplay(); // Erste Anzeige rendern
});

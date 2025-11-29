import { showMessage, showDetailsBox, formatDateBasedOnSetting } from "./ui.js";
//  === AppState muss für die Events zur Laufzeit aktualisiert werden ===
import { getState } from "./state.js";
import { populateShortenHolidays } from "./sync.js";

export function initializeEventListeners(uiElements, handlers) {
  // === Navigations-Buttons ===
  uiElements.prevMonthButton.addEventListener("click", () => handlers.changeMonth(-1));
  uiElements.nextMonthButton.addEventListener("click", () => handlers.changeMonth(1));
  uiElements.currentMonthButton.addEventListener("click", handlers.changeToCurrentMonth);

  // === Einstellungs-Buttons ===
  uiElements.settingsButton.addEventListener("click", handlers.openSettings);
  uiElements.closeSettingsButton.addEventListener("click", handlers.closeAndSaveSettings);
  uiElements.cancelSettingsButton.addEventListener("click", handlers.closeSettings);
  uiElements.resetSettingsButton.addEventListener("click", handlers.resetSettings);
  uiElements.exportSettingsButton.addEventListener("click", handlers.generateAndCopyExportLink);

  // === Tabellen-Interaktionen (Doppelklick zum Kopieren) ===
  uiElements.tablesWrapper.addEventListener("dblclick", async (e) => {
    const appState = getState();
    e.preventDefault();
    const cell = e.target.closest("td");
    if (!cell || !cell.dataset.date) return;

    const dateType = cell.dataset.type;
    let dateStringFormat = appState.dateFormats.formatCurrentDate;
    if (dateType === "deadline1") dateStringFormat = appState.dateFormats.formatDeadline1;
    else if (dateType === "deadline2") dateStringFormat = appState.dateFormats.formatDeadline2;

    const copyString = `${appState.copyPrefix}${formatDateBasedOnSetting(new Date(cell.dataset.date), dateStringFormat)}${
      appState.copySuffix
    }`;

    try {
      await navigator.clipboard.writeText(copyString);
      showMessage(uiElements, `"${copyString}" kopiert`);
    } catch (err) {
      // Fallback für ältere Browser oder unsichere Kontexte (http)
      console.warn("Fallback für ältere Browser oder unsichere Kontexte (http)");
      const el = document.createElement("textarea");
      el.value = copyString;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      showMessage(uiElements, `"${copyString}" kopiert`);
    }
  });

  // === Tabellen-Interaktionen (Rechtsklick für Details) ===
  uiElements.tablesWrapper.addEventListener("contextmenu", (e) => {
    const appState = getState();
    e.preventDefault();
    const cell = e.target.closest("td");
    if (!cell || !cell.dataset.details) return;

    const dateType = cell.dataset.type;
    let detailsTitle = "Details zum Datum";
    if (dateType === "deadline1") detailsTitle = `Details Frist 1 (${appState.deadline1} AT)`;
    else if (dateType === "deadline2") detailsTitle = `Details Frist 2 (${appState.deadline2} AT)`;

    showDetailsBox(uiElements, detailsTitle, cell.dataset.details);
  });

  // === Globale Tastatur-Events ===
  window.addEventListener("keydown", (e) => {
    // Nur in der Hauptansicht auf Pfeiltasten reagieren
    if (!uiElements.settingsDialog.open) {
      if (e.key === "h") handlers.changeToCurrentMonth();
      if (e.key === "ArrowLeft") handlers.changeMonth(-1);
      if (e.key === "ArrowRight") handlers.changeMonth(1);
      if (e.key === "-") {
        uiElements.displayMonthCountInput.value -= 1;
        handlers.closeAndSaveSettings();
      }
      if (e.key === "+") {
        // Sicherstellen, dass der aktuelle Wert eine Zahl ist, bevor 1 addiert wird
        let newValue = parseInt(uiElements.displayMonthCountInput.value) + 1;
        uiElements.displayMonthCountInput.value = newValue;
        handlers.closeAndSaveSettings();
      }
      if (e.key === "e") handlers.openSettings();
      if (e.key === "i") uiElements.infoDialog.togglePopover();
    }
  });

  // === Dynamisches Update für "Fristverkürzung durch Feiertage" im Einstellungsdialog ===
  Object.values(uiElements.holidayCheckboxes).forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      // Erstelle einen temporären Zustand basierend auf der aktuellen UI,
      // um die "shortenHolidays" Sektion neu zu rendern, ohne zu speichern.

      // 1. Lese den aktuellen Zustand der "skip" Checkboxen aus der UI
      const currentHolidaysToSkip = {};
      Object.keys(uiElements.holidayCheckboxes).forEach((k) => {
        currentHolidaysToSkip[k] = uiElements.holidayCheckboxes[k].checked;
      });

      // 2. Lese den aktuellen Zustand der "shorten" Checkboxen, um deren Status zu erhalten
      const currentHolidaysToShorten = { ...getState().holidaysToShorten };
      uiElements.shortenHolidaysContainer.querySelectorAll("input[type=checkbox]").forEach((cb) => {
        currentHolidaysToShorten[cb.dataset.key] = cb.checked;
      });

      // 3. Rufe die UI-Update-Funktion mit dem temporären Zustand auf
      populateShortenHolidays(uiElements, {
        holidaysToSkip: currentHolidaysToSkip,
        holidaysToShorten: currentHolidaysToShorten,
      });
    });
  });
}

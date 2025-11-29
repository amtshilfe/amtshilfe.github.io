import { SETTINGS_KEY, defaultSettings } from "./constants.js";

// === App-Zustand (State) ===
// Der appState wird mit den Standardwerten initialisiert und um Laufzeit-Werte ergänzt.
const appState = {
  ...JSON.parse(JSON.stringify(defaultSettings)), // Tiefe Kopie, um verschachtelte Objekte zu trennen
  currentMonth: new Date().getMonth(),
  currentYear: new Date().getFullYear(),
};

/**
 * Gibt eine schreibgeschützte Kopie des aktuellen Zustands zurück.
 * @returns {object} Der aktuelle Anwendungszustand.
 */
export function getState() {
  // Wir geben eine Kopie zurück, um direkte Mutationen von außen zu verhindern.
  return { ...appState };
}

/**
 * Aktualisiert den Zustand mit neuen Werten.
 * @param {object} newState - Ein Objekt mit den zu aktualisierenden Schlüsseln und Werten.
 */
export function updateState(newState) {
  Object.assign(appState, newState);
}

export function saveSettings() {
  try {
    // Nur die konfigurierbaren Einstellungen speichern, nicht den aktuellen Monat/Jahr
    const { currentMonth, currentYear, ...settingsToSave } = appState;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settingsToSave));
  } catch (e) {
    console.error("Fehler beim Speichern der Einstellungen:", e);
  }
}

export function loadSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      // Führt die gespeicherten Einstellungen mit dem bestehenden State zusammen.
      // Neue Default-Werte bleiben erhalten, falls sie in den alten gespeicherten Settings fehlen.
      const savedSettings = JSON.parse(saved);
      Object.assign(appState, savedSettings);
      return true; // Signalisiert, dass Einstellungen geladen wurden
    }
  } catch (e) {
    console.error("Fehler beim Laden der Einstellungen:", e);
    localStorage.removeItem(SETTINGS_KEY);
  }
  return false; // Signalisiert, dass keine Einstellungen geladen wurden
}

export function resetStateToDefault() {
  const today = new Date();
  // Alle konfigurierbaren Werte auf den Standard zurücksetzen
  const newSettings = JSON.parse(JSON.stringify(defaultSettings));
  // Laufzeit-Werte auf den aktuellen Tag setzen und mit neuen Settings kombinieren
  updateState({
    ...newSettings,
    currentMonth: today.getMonth(),
    currentYear: today.getFullYear(),
  });
}

/**
 * Setzt den Monat basierend auf einem Offset zurück.
 * @param {number} offset - Die Anzahl der Monate, um die der aktuelle Monat verschoben werden soll.
 */
export function changeMonthInState(offset) {
  const currentState = getState();
  const d = new Date(currentState.currentYear, currentState.currentMonth + offset, 1);
  updateState({ currentYear: d.getFullYear(), currentMonth: d.getMonth() });
}

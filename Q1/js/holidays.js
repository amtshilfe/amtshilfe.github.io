import { calculateEasterSunday } from "./easter.js";

const allHolidaysCache = new Map(); // Cache für alle Feiertage eines Jahres
const skippedHolidaysCache = new Map(); // Cache für die Feiertage, die tatsächlich übersprungen werden
const shorteningHolidaysCache = new Map(); // Cache für Feiertage, die die Frist verkürzen

/**
 * Leert alle Feiertags-Caches.
 */
export function clearHolidayCaches() {
  allHolidaysCache.clear();
  skippedHolidaysCache.clear();
  shorteningHolidaysCache.clear();
}

/**
 * Berechnet alle potenziellen Feiertage für ein Jahr, unabhängig von den Einstellungen.
 * Die Ergebnisse werden gecacht.
 * @param {number} year Das Jahr, für das die Feiertage berechnet werden sollen.
 * @returns {Map<string, string>} Eine Map mit den Feiertagen (Format "M-D" -> "Name").
 */
function getHolidaysForYear(year) {
  if (allHolidaysCache.has(year)) return allHolidaysCache.get(year);

  const holidays = new Map();
  holidays.set("1-1", "Neujahr");
  holidays.set("5-1", "Tag d. Arbeit");
  holidays.set("10-3", "Tag d. D. Einheit");
  holidays.set("10-31", "Reformationstag");
  holidays.set("12-24", "Heiligabend");
  holidays.set("12-25", "1. W-tag");
  holidays.set("12-26", "2. W-tag");
  holidays.set("12-31", "Silvester");

  const easterSunday = calculateEasterSunday(year);
  const addEasterRelatedHoliday = (offset, name) => {
    const d = new Date(easterSunday);
    d.setDate(d.getDate() + offset);
    holidays.set(`${d.getMonth() + 1}-${d.getDate()}`, name);
  };

  addEasterRelatedHoliday(-2, "Karfreitag");
  addEasterRelatedHoliday(1, "Ostermontag");
  addEasterRelatedHoliday(39, "Himmelfahrt");
  addEasterRelatedHoliday(50, "Pfingstmontag");

  allHolidaysCache.set(year, holidays);
  return holidays;
}

/**
 * Filtert die Feiertage eines Jahres basierend auf den Benutzereinstellungen und cacht das Ergebnis.
 * @param {number} year Das Jahr.
 * @param {object} holidaysToSkip Das Konfigurationsobjekt, welche Feiertage übersprungen werden sollen.
 * @returns {Map<string, string>} Eine Map der zu überspringenden Feiertage.
 */
export function getSkippedHolidays(year, holidaysToSkip) {
  // Der Cache-Schlüssel muss die Einstellungen berücksichtigen, um bei Änderungen neu zu berechnen.
  const cacheKey = `${year}-${JSON.stringify(holidaysToSkip)}`;
  if (skippedHolidaysCache.has(cacheKey)) return skippedHolidaysCache.get(cacheKey);

  const allHolidays = getHolidaysForYear(year);
  const result = new Map();
  const holidayMapping = {
    Neujahr: "skipNewYear",
    "Tag d. Arbeit": "skipLabourDay",
    "Tag d. D. Einheit": "skipUnityDay",
    Reformationstag: "skipReformationDay",
    Heiligabend: "skipChristmasEve",
    "1. W-tag": "skipChristmasDay",
    "2. W-tag": "skipBoxingDay",
    Silvester: "skipNewYearsEve",
    Karfreitag: "skipGoodFriday",
    Ostermontag: "skipEasterMonday",
    Himmelfahrt: "skipAscension",
    Pfingstmontag: "skipPentecostMonday",
  };

  for (const [dateKey, name] of allHolidays.entries()) {
    const skipKey = holidayMapping[name];
    if (skipKey && holidaysToSkip[skipKey]) {
      result.set(dateKey, name);
    }
  }
  skippedHolidaysCache.set(cacheKey, result);
  return result;
}

/**
 * Filtert die Feiertage eines Jahres, die eine Frist verkürzen sollen, basierend auf den Einstellungen.
 * @param {number} year Das Jahr.
 * @param {object} holidaysToShorten Das Konfigurationsobjekt, welche Feiertage verkürzen sollen.
 * @returns {Map<string, string>} Eine Map der zu verkürzenden Feiertage.
 */
export function getShorteningHolidays(year, holidaysToShorten) {
  const cacheKey = `${year}-${JSON.stringify(holidaysToShorten)}`;
  if (shorteningHolidaysCache.has(cacheKey)) return shorteningHolidaysCache.get(cacheKey);

  const allHolidays = getHolidaysForYear(year);
  const result = new Map();
  const holidayMapping = {
    Neujahr: "skipNewYear",
    "Tag d. Arbeit": "skipLabourDay",
    "Tag d. D. Einheit": "skipUnityDay",
    Reformationstag: "skipReformationDay",
    Heiligabend: "skipChristmasEve",
    "1. W-tag": "skipChristmasDay",
    "2. W-tag": "skipBoxingDay",
    Silvester: "skipNewYearsEve",
    Karfreitag: "skipGoodFriday",
    Ostermontag: "skipEasterMonday",
    Himmelfahrt: "skipAscension",
    Pfingstmontag: "skipPentecostMonday",
  };

  for (const [dateKey, name] of allHolidays.entries()) {
    const shortenKey = holidayMapping[name];
    if (shortenKey && holidaysToShorten[shortenKey]) {
      result.set(dateKey, name);
    }
  }
  shorteningHolidaysCache.set(cacheKey, result);
  return result;
}

import { dayNames } from "./constants.js";
import { getState } from "./state.js";
import { getSkippedHolidays, getShorteningHolidays } from "./holidays.js";

// === Datumslogik ===
function isSkippedDay(date) {
  const appState = getState();
  const dayOfWeek = date.getDay(),
    year = date.getFullYear(),
    dateKey = `${date.getMonth() + 1}-${date.getDate()}`,
    holidays = getSkippedHolidays(year, appState.holidaysToSkip),
    isWeekdayToSkip = appState.weekdaysToSkip[dayOfWeek],
    isHoliday = holidays.has(dateKey);

  return {
    isSkipped: isWeekdayToSkip || isHoliday,
    reason: isHoliday ? holidays.get(dateKey) : isWeekdayToSkip ? dayNames[dayOfWeek] : null,
  };
}

function subtractSkippedDays(start, holidaysToShortenConfig) {
  const finalDate = new Date(start);
  const shortenedDays = [];
  let currentYear = finalDate.getFullYear();
  let shorteningHolidays = getShorteningHolidays(currentYear, holidaysToShortenConfig);

  let { isSkipped, reason } = isSkippedDay(finalDate);
  let isShorteningHoliday = shorteningHolidays.has(`${finalDate.getMonth() + 1}-${finalDate.getDate()}`);

  // Solange das Datum ein "Skipped Day" oder ein "Shortening Holiday" ist, gehe einen Tag zurück.
  while (isSkipped || isShorteningHoliday) {
    const reasonForShortening = isShorteningHoliday ? shorteningHolidays.get(`${finalDate.getMonth() + 1}-${finalDate.getDate()}`) : reason;
    shortenedDays.push({ date: new Date(finalDate), reason: reasonForShortening });

    finalDate.setDate(finalDate.getDate() - 1);

    // Wenn sich das Jahr durch die Subtraktion ändert, müssen die Feiertage neu geladen werden.
    if (finalDate.getFullYear() !== currentYear) {
      currentYear = finalDate.getFullYear();
      shorteningHolidays = getShorteningHolidays(currentYear, holidaysToShortenConfig);
    }

    const nextCheck = isSkippedDay(finalDate);
    isSkipped = nextCheck.isSkipped;
    reason = nextCheck.reason;
    isShorteningHoliday = shorteningHolidays.has(`${finalDate.getMonth() + 1}-${finalDate.getDate()}`);
  }
  return {
    finalDate,
    shortenedDays,
  };
}

export function addWorkingDays(start, days) {
  const date = new Date(start);
  if (days <= 0) return { resultDate: date, skippedDays: [] };
  let counter = 0;
  const skippedDays = [];
  while (counter < days) {
    date.setDate(date.getDate() + 1);
    const { isSkipped, reason } = isSkippedDay(date);
    if (!isSkipped) {
      counter++;
    } else if (reason) {
      skippedDays.push({ date: new Date(date), reason });
    }
  }

  // Nach der Berechnung prüfen, ob das Ergebnis auf einen Verkürzungstag fällt
  const appState = getState();
  const { finalDate, shortenedDays } = subtractSkippedDays(date, appState.holidaysToShorten);

  return { resultDate: finalDate, skippedDays: skippedDays, shortenedDays: shortenedDays };
}

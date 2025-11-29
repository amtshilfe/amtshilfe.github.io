'use strict';
// region: date functions
export function addYearsToDate(date, years) {
    let newDate = new Date(date);
    newDate.setFullYear(newDate.getFullYear() + years);
    return newDate;
}
export function addMonthToDate(date, months) {
    // TODO: Implementierung von Kalendermonaten
    // 
    let newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + months);
    return newDate;
}
export function addWeeksToDate(date, weeks) {
    let newDate = addDaysToDate(date, weeks * 7);
    return newDate;
}
export function addDaysToDate(date, days) {
    let newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
}
// Format a date as a string in the format YYYY-MM-DD
export function format_ISO_Date(date, delimiter = "-") {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}${delimiter}${month}${delimiter}${day}`;
}

export function getDayOfWeek(date, long = false) {
    const WochentagLang = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    const WochentagKurz = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

    if (long) { return WochentagLang[date.getDay()]; }
    else { return WochentagKurz[date.getDay()]; }
}

export function getFormatedDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const weekday = getDayOfWeek(date);
    return `${weekday}. ${day}.${month}.${year}`
}

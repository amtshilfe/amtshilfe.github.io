export function calculateHolidays(year) {
    // 
    // berechnet die Feiertage eines gegebenen Jahres
    // Feiertage für das Bundesland Schleswig Holstein
    // 

    const easter = calculateEasterSunday(year);
    const holidays = {
        'Neujahrstag': new Date(year, 0, 1),
        'Karfreitag': new Date(easter.getTime() - 2 * 24 * 60 * 60 * 1000),
        'Ostermontag': new Date(easter.getTime() + 1 * 24 * 60 * 60 * 1000),
        'Tag der Arbeit': new Date(year, 4, 1),
        'Christi Himmelfahrt': new Date(easter.getTime() + 39 * 24 * 60 * 60 * 1000),
        'Pfingstmontag': new Date(easter.getTime() + 50 * 24 * 60 * 60 * 1000),
        'Tag der Deutschen Einheit': new Date(year, 9, 3),
        'Reformationstag': new Date(year, 9, 31),
        'Heilig Abend': new Date(year, 11, 24),
        '1. Weihnachtsfeiertag': new Date(year, 11, 25),
        '2. Weihnachtsfeiertag': new Date(year, 11, 26),
        'Silvester': new Date(year, 11, 31)
    };
    return holidays;
}

// only for internal use
function calculateEasterSunday(year) {
    // 
    // berechnet den Ostersonntag eines jeden gegebenen Jahres
    // 
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const n = h + l - 7 * m + 114;
    const month = Math.floor(n / 31) - 1;
    const day = (n % 31) + 1;
    return new Date(year, month, day);
}
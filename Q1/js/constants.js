// Schlüssel für den Local Storage
export const SETTINGS_KEY = "deadlineCalculatorSettings_v4";

// Monats- und Tagesnamen für die Anzeige
export const monthNames = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
export const dayNames = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

// Standardeinstellungen, die gespeichert und zurückgesetzt werden können.
export const defaultSettings = {
  displayMonthCount: 1,
  deadline1: 19,
  deadline2: 4,
  weekdaysToSkip: {
    0: true, // So
    1: false, // Mo
    2: false, // Di
    3: false, // Mi
    4: false, // Do
    5: false, // Fr
    6: true, // Sa
  },
  holidaysToSkip: {
    skipNewYear: true, // Neujahr
    skipGoodFriday: true, // Karfreitag
    skipEasterMonday: true, // Ostermontag
    skipLabourDay: true, // Tag der Arbeit
    skipAscension: true, // Christi Himmelfahrt
    skipPentecostMonday: true, // Pfingstmontag
    skipUnityDay: true, // Tag der Deutschen Einheit
    skipReformationDay: false, // Reformationstag
    skipChristmasEve: false, // Heiligabend
    skipChristmasDay: true, // 1. Weihnachtstag
    skipBoxingDay: true, // 2. Weihnachtstag
    skipNewYearsEve: false, // Silvester
  },
  dateFormats: {
    formatCurrentDate: "normal",
    formatDeadline1: "iso",
    formatDeadline2: "iso",
  },
  copyPrefix: "",
  copySuffix: " Q1 ",
  holidaysToShorten: {
    skipNewYear: false,
    skipGoodFriday: false,
    skipEasterMonday: false,
    skipLabourDay: false,
    skipAscension: false,
    skipPentecostMonday: false,
    skipUnityDay: false,
    skipReformationDay: false,
    skipChristmasEve: true, // Heiligabend ist ein Standard für eine Verkürzung
    skipChristmasDay: false,
    skipBoxingDay: false,
    skipNewYearsEve: true, // Silvester ebenfalls
  },
};

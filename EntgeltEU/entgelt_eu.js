// JSON-Daten für die Länderauswahl (Währungen)
// noinspection JSNonASCIINames,SpellCheckingInspection

const COUNTRIES_JSON = `[
    {
        "Land": "Belgien",
        "Währung": "Euro",
        "Währungscode": "EUR"
    },
    {
        "Land": "Bulgarien",
        "Währung": "Bulgarischer Lew",
        "Währungscode": "BGN"
    },
    {
        "Land": "Deutschland",
        "Währung": "Euro",
        "Währungscode": "EUR"
    },
    {
        "Land": "Dänemark",
        "Währung": "Dänische Krone",
        "Währungscode": "DKK"
    },
    {
        "Land": "Estland",
        "Währung": "Euro",
        "Währungscode": "EUR"
    },
    {
        "Land": "Estland (bis 2010)",
        "Währung": "Estnische Kroon",
        "Währungscode": "EEK"
    },
    {
        "Land": "Finnland",
        "Währung": "Euro",
        "Währungscode": "EUR"
    },
    {
        "Land": "Frankreich",
        "Währung": "Euro",
        "Währungscode": "EUR"
    },
    {
        "Land": "Griechenland",
        "Währung": "Euro",
        "Währungscode": "EUR"
    },
    {
        "Land": "Italien",
        "Währung": "Euro",
        "Währungscode": "EUR"
    },
    {
        "Land": "Irland",
        "Währung": "Euro",
        "Währungscode": "EUR"
    },
    {
        "Land": "Island",
        "Währung": "Isländische Króna",
        "Währungscode": "ISK"
    },
    {
        "Land": "Lettland",
        "Währung": "Euro",
        "Währungscode": "EUR"
    },
    {
        "Land": "Lettland (bis 2013)",
        "Währung": "Lettischer Lats",
        "Währungscode": "LVL"
    },
    {
        "Land": "Litauen",
        "Währung": "Euro",
        "Währungscode": "EUR"
    },
    {
        "Land": "Litauen (bis 2014)",
        "Währung": "Litauischer Litas",
        "Währungscode": "LTL"
    },
    {
        "Land": "Luxemburg",
        "Währung": "Euro",
        "Währungscode": "EUR"
    },
    {
        "Land": "Kroatien",
        "Währung": "Euro",
        "Währungscode": "EUR"
    },
    {
        "Land": "Kroatien (bis 2022)",
        "Währung": "Kroatische Kuna",
        "Währungscode": "HRK"
    },
    {
        "Land": "Liechtenstein",
        "Währung": "Schweizer Franken",
        "Währungscode": "CHF"
    },
    {
        "Land": "Malta",
        "Währung": "Euro",
        "Währungscode": "EUR"
    },
    {
        "Land": "Niederlande",
        "Währung": "Euro",
        "Währungscode": "EUR"
    },
    {
        "Land": "Norwegen",
        "Währung": "Norwegische Krone",
        "Währungscode": "NOK"
    },
    {
        "Land": "Österreich",
        "Währung": "Euro",
        "Währungscode": "EUR"
    },
    {
        "Land": "Polen",
        "Währung": "Polnischer Złoty",
        "Währungscode": "PLN"
    },
    {
        "Land": "Portugal",
        "Währung": "Euro",
        "Währungscode": "EUR"
    },
    {
        "Land": "Rumänien",
        "Währung": "Rumänischer Leu",
        "Währungscode": "RON"
    },
    {
        "Land": "Schweden",
        "Währung": "Schwedische Krone",
        "Währungscode": "SEK"
    },
    {
        "Land": "Schweiz",
        "Währung": "Schweizer Franken",
        "Währungscode": "CHF"
    },
    {
        "Land": "Slowakei",
        "Währung": "Euro",
        "Währungscode": "EUR"
    },
    {
        "Land": "Slowenien",
        "Währung": "Euro",
        "Währungscode": "EUR"
    },
    {
        "Land": "Spanien",
        "Währung": "Euro",
        "Währungscode": "EUR"
    },
    {
        "Land": "Tschechien",
        "Währung": "Tschechische Krone",
        "Währungscode": "CZK"
    },
    {
        "Land": "Ungarn",
        "Währung": "Ungarischer Forint",
        "Währungscode": "HUF"
    },
    {
        "Land": "Zypern (griechischer Teil)",
        "Währung": "Euro",
        "Währungscode": "EUR"
    }
]`;
// Event-Listener, der nach dem vollständigen Laden des DOMs ausgeführt wird
document.addEventListener("DOMContentLoaded", async () => {
    // Parsen der JSON-Länderdaten
    const countriesData = JSON.parse(COUNTRIES_JSON);

    /*    let countriesData = [];

        try {
            const response = await fetch('Laender.json'); // Annahme: Laender.json liegt im selben Verzeichnis wie die HTML
            if (!response.ok) {
                throw new Error(`HTTP errorDiv! status: ${response.status} beim Laden von Laender.json`);
            }
            countriesData = await response.json();
        } catch (errorDiv) {
            console.errorDiv("Fehler beim Laden der Länderdaten (Laender.json):", errorDiv);

        }*/


    // --- Hilfsfunktionen ---

    /**
     * Berechnet die Anzahl der Tage zwischen zwei Daten (inklusive Start- und Enddatum).
     * @param {string} date1Str - Startdatum im Format YYYY-MM-DD.
     * @param {string} date2Str - Enddatum im Format YYYY-MM-DD.
     * @returns {number} Die Anzahl der Tage oder 0 bei ungültigen Eingaben.
     */
    function calculateDays(date1Str, date2Str) {
        if (!date1Str || !date2Str) return 0;
        const d1 = new Date(date1Str);
        const d2 = new Date(date2Str);
        if (isNaN(d1.getTime()) || isNaN(d2.getTime()) || d2 < d1) return 0;
        const diffTime = d2.getTime() - d1.getTime();
        return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    /**
     * Formatiert eine Zahl in das deutsche Zahlenformat (z.B. 1.234,56).
     * @param {number} value - Die zu formatierende Zahl.
     * @param {number} [decimals=2] - Die Anzahl der Dezimalstellen.
     * @returns {string} Die formatierte Zahl als String.
     */
    function formatNumberDE(value, decimals = 2) {
        if (isNaN(value) || value === null) return "0,00";
        return value.toLocaleString("de-DE", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        });
    }

    /**
     * Formatiert ein Date-Objekt in das YYYY-MM-DD Format für Input-Felder.
     * @param {Date} date - Das zu formatierende Date-Objekt.
     * @returns {string} Das formatierte Datum als String oder ein leerer String bei Fehler.
     */
    function formatDateForInput(date) {
        if (!(date instanceof Date) || isNaN(date.getTime())) return "";
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
    }


    /**
     * Formatiert ein Date-Objekt in das DD.MM.YYYY Format für die Anzeige.
     * @param {Date} date - Das zu formatierende Date-Objekt.
     * @returns {string} Das formatierte Datum als String oder ein leerer String bei Fehler.
     */
    function formatDateForDisplay(date) {
        if (!(date instanceof Date) || isNaN(date.getTime())) return "";
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        return `${day}.${month}.${year}`;
    }

    /**
     * Ermittelt den letzten Tag eines bestimmten Monats und Jahres.
     * @param {number} year - Das Jahr.
     * @param {number} month - Der Monat (0-basiert, d.h. 0 für Januar).
     * @returns {number} Der letzte Tag des Monats.
     */
    function getLastDayOfMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }

    /**
     * Konvertiert einen Datumsstring in ein Date-Objekt und setzt die Uhrzeit auf 00:00:00.
     * Dies ist nützlich für reine Datumsvergleiche.
     * @param {string} dateStr - Datumsstring (z.B. YYYY-MM-DD).
     * @returns {Date|null} Das Date-Objekt oder null bei ungültiger Eingabe.
     */
    function getDatePart(dateStr) {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return null;
        date.setHours(0, 0, 0, 0);
        return date;
    }

    /**
     * Gibt eine Liste der Euro-Umrechnungskurse eines Zeitraums zurück.
     * Die Kurse werden von der Deutschen Bundesbank abgerufen unter Anwendung der öffentlichen API
     * @param {string} currency - Währungsstring als Kürzel (z.B. DKK).
     * @param {Date} startDate - Startdatum als Date.
     * @param {Date} endDate - Enddatum als Date.
     * @returns {Array|null} Array von Einträgen oder null bei ungültiger Eingabe oder Fehler.
     */
    async function fetchCourse(currency, startDate, endDate) {
        const start = formatDateForInput(startDate);
        const end = formatDateForInput(endDate);
        const key = `D.${currency}.EUR.BB.AC.000`;
        const url = `https://api.statistiken.bundesbank.de/rest/data/BBEX3/${key}?startPeriod=${start}&endPeriod=${end}&format=json`;

        let entries = [];
        try {
            const resp = await fetch(url);
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

            const response = await resp.json();
            const data = response.data;
            const seriesKey = Object.keys(data.dataSets[0].series)[0];
            const obs = data.dataSets[0].series[seriesKey].observations;
            const timePeriods = data.structure.dimensions.observation[0].values;

            for (const [indexStr, timeObj] of timePeriods.entries()) {
                const rateEntry = obs[indexStr];
                const rate = rateEntry ? rateEntry[0] : null;
                const date = timeObj.id;
                entries.push({date, rate});
            }

        } catch (err) {
            console.error(`Fehler bei der Abfrage: ${err.message}`);
        }

        return entries;
    }


    // --- Referenzen auf DOM-Elemente ---
    const vonDatumInput = document.getElementById("von_datum");
    const bisDatumInput = document.getElementById("bis_datum");
    const tageInput = document.getElementById("tage");
    const stichtagInput = document.getElementById("stichtag");
    const betragFremdInput = document.getElementById("betrag_fremd");
    const wechselkursEurInput = document.getElementById("wechselkurs_eur");
    const betragEurInput = document.getElementById("betrag_eur");
    const fremdwaehrungSelect = document.getElementById("fremdwaehrung");
    const currencyCodeDisplayLabel = document.getElementById("currency_code_display_label"); // Geändert von currency_code_display
    // Buttons
    const setExchangeRateButton = document.getElementById("set-exchange-rate-button");
    const setBemessung1JahrButton = document.getElementById("set_bemessung_1_jahr_button");
    const setBemessung2JahreButton = document.getElementById("set_bemessung_2_jahre_button");
    const printButton = document.getElementById("print-button");

    const bemessungAbManuellInput = document.getElementById("bemessung_ab_manuell_input");
    const bemessungVonInput = document.getElementById("bemessung_von");
    const bemessungBisInput = document.getElementById("bemessung_bis");
    const bemessungTageInput = document.getElementById("bemessung_tage");
    const bemessungEntgeltInput = document.getElementById("bemessung_entgelt");

    const jahressummenGrid = document.getElementById("jahressummen_grid");

    const detailsTableBody = document.getElementById("details-table-body");
    const detailsTableSumCell = document.getElementById("details-table-sum");

    // Globale Variablen für berechnete Startdaten der Bemessung
    let calculatedStartBemessung1Jahr = "";
    let calculatedStartBemessung2Jahre = "";


    /**
     * Berechnet das Startdatum für die Bemessung unter Berücksichtigung der Regeln
     * (Monatsanfang, nicht vor Gesamtanfangsdatum).
     * @param {string} baseBisDateStr - Das Enddatum, von dem zurückgerechnet wird.
     * @param {number} yearsToSubtract - Anzahl der Jahre, die zurückgerechnet werden.
     * @param {string} overallVonDateStr - Das Gesamtanfangsdatum des Hauptzeitraums.
     * @returns {string} Das berechnete Startdatum im Format YYYY-MM-DD.
     */
    function getAdjustedBemessungAbDate(baseBisDateStr, yearsToSubtract, overallVonDateStr) {
        if (!baseBisDateStr) return "";
        const bisDate = getDatePart(baseBisDateStr);
        const overallVonDate = getDatePart(overallVonDateStr);
        if (!bisDate) return "";

        let targetDate = new Date(bisDate);
        targetDate.setFullYear(targetDate.getFullYear() - yearsToSubtract)
        // Setzt auf den Ersten des Monats
        targetDate.setDate(1)
        targetDate.setMonth(targetDate.getMonth() + 1);

        if (overallVonDate && targetDate < overallVonDate) {
            targetDate = new Date(overallVonDate);
        }

        return formatDateForInput(targetDate);
    }


    /**
     * Befüllt die Dropdown-Liste für die Länderauswahl.
     */
    function populateCurrencyDropdown() {
        fremdwaehrungSelect.innerHTML = '<option value="">-- Bitte wählen --</option>';
        countriesData.forEach((country) => {
            const option = document.createElement("option");
            option.value = country.Währungscode;
            option.textContent = `${country.Land} (${country.Währungscode})`;
            fremdwaehrungSelect.appendChild(option);
        });
        fremdwaehrungSelect.addEventListener("change", updateMainCalculations);
    }

    /**
     * Zeigt die berechneten Jahressummen dynamisch im Formular an.
     * @param {object} annualSums - Ein Objekt mit Jahren als Schlüssel und Summen als Werte.
     */
    function displayAnnualSums(annualSums) {
        jahressummenGrid.innerHTML = ""; // Vorherige Einträge löschen
        const years = Object.keys(annualSums).sort(
            (a, b) => parseInt(a) - parseInt(b) // Jahre numerisch sortieren
        );

        if (years.length === 0) {
            return; // Keine Anzeige, wenn keine Summen vorhanden
        }

        years.forEach((year) => {
            const label = document.createElement("label");
            label.textContent = `Jahressumme ${year}:`;
            label.id = `jahressumme-label-${year}`; // Eindeutige ID für Label

            const input = document.createElement("input");
            input.type = "text";
            input.value = formatNumberDE(annualSums[year]);
            input.readOnly = true;
            input.classList.add("calculated-grey");
            input.setAttribute("aria-labelledby", label.id); // Verknüpfung mit Label für Barrierefreiheit
            input.setAttribute("aria-label", `Jahressumme für ${year}`);


            jahressummenGrid.appendChild(label);
            jahressummenGrid.appendChild(input);
        });
    }

    /**
     * Aktualisiert die Tabelle der Abrechnungszeiträume und berechnet Jahressummen.
     * @param {number} totalEurAmount - Der Gesamtbetrag in Euro für den Hauptzeitraum.
     * @param {number} totalDaysInOverallPeriod - Die Gesamtzahl der Tage im Hauptzeitraum.
     * @param {string} overallStartDateStr - Startdatum des Hauptzeitraums.
     * @param {string} overallEndDateStr - Enddatum des Hauptzeitraums.
     */
    function updateDetailTable(
        totalEurAmount,
        totalDaysInOverallPeriod,
        overallStartDateStr,
        overallEndDateStr
    ) {
        detailsTableBody.innerHTML = ""; // Bestehende Zeilen löschen
        let tableSumEur = 0; // Gesamtsumme der gefilterten Tabelle
        const annualSums = {}; // Summen pro Kalenderjahr

        // Startdatum für die Filterung der Tabelle ("Bemessung ab")
        const filterStartDateValue = bemessungAbManuellInput.value;
        const filterStartDate = getDatePart(filterStartDateValue);

        // Abbruch, wenn keine validen Daten für den Hauptzeitraum vorliegen
        if (
            totalDaysInOverallPeriod <= 0 ||
            !overallStartDateStr ||
            !overallEndDateStr
        ) {
            detailsTableSumCell.textContent = formatNumberDE(0);
            displayAnnualSums(annualSums); // Leere Jahressummen anzeigen
            return;
        }

        const overallStartDate = getDatePart(overallStartDateStr);
        const overallEndDate = getDatePart(overallEndDateStr);

        if (
            !overallStartDate ||
            !overallEndDate ||
            overallEndDate < overallStartDate
        ) {
            detailsTableSumCell.textContent = formatNumberDE(0);
            displayAnnualSums(annualSums);
            return;
        }

        // Tagesrate basierend auf dem *gesamten* Ursprungszeitraum und *gesamten* Eurobetrag
        const betragEuroProTag =
            totalDaysInOverallPeriod > 0
                ? totalEurAmount / totalDaysInOverallPeriod
                : 0;

        // Iterator für die Monate innerhalb des Hauptzeitraums
        let currentProcessingMonthStart = new Date(overallStartDate);

        // Durchlaufen aller Monate im Hauptzeitraum
        while (currentProcessingMonthStart <= overallEndDate) {
            const yearOfCurrentSegment = currentProcessingMonthStart.getFullYear();
            const month = currentProcessingMonthStart.getMonth();

            // Startdatum des aktuellen Monatssegments (unter Berücksichtigung des Gesamtstartdatums)
            let monthSegmentStartDate =
                (currentProcessingMonthStart.getFullYear() === overallStartDate.getFullYear() &&
                    currentProcessingMonthStart.getMonth() === overallStartDate.getMonth())
                    ? new Date(overallStartDate)
                    : new Date(yearOfCurrentSegment, month, 1);

            // Enddatum des aktuellen Monatssegments (unter Berücksichtigung des Gesamtenddatums)
            let monthSegmentEndDate =
                (currentProcessingMonthStart.getFullYear() === overallEndDate.getFullYear() &&
                    currentProcessingMonthStart.getMonth() === overallEndDate.getMonth())
                    ? new Date(overallEndDate)
                    : new Date(yearOfCurrentSegment, month, getLastDayOfMonth(yearOfCurrentSegment, month));

            // Sicherstellen, dass Start nicht nach Ende liegt (kann bei kurzen Zeiträumen passieren)
            if (monthSegmentStartDate > monthSegmentEndDate) {
                currentProcessingMonthStart.setMonth(currentProcessingMonthStart.getMonth() + 1);
                currentProcessingMonthStart.setDate(1); // Zum Ersten des nächsten Monats springen
                continue; // Nächste Iteration
            }

            // Filterung: Nur Segmente berücksichtigen, die das Filterdatum (Bemessung ab) nicht unterschreiten
            if (!filterStartDate || monthSegmentEndDate >= filterStartDate) {
                // Effektives Startdatum der Tabellenzeile, ggf. angepasst durch das Filterdatum
                let effectiveRowStartDate = monthSegmentStartDate;
                if (filterStartDate && filterStartDate > monthSegmentStartDate) {
                    effectiveRowStartDate = new Date(filterStartDate);
                }

                // Effektives Enddatum der Tabellenzeile ist das Ende des Monatssegments
                let effectiveRowEndDate = monthSegmentEndDate;

                // Nur verarbeiten, wenn der effektive Zeitraum gültig ist
                if (effectiveRowStartDate <= effectiveRowEndDate) {
                    const rowDays = calculateDays(
                        formatDateForInput(effectiveRowStartDate),
                        formatDateForInput(effectiveRowEndDate)
                    );
                    if (rowDays > 0) {
                        const rowEurAmount = betragEuroProTag * rowDays;
                        tableSumEur += rowEurAmount; // Zur Gesamtsumme der Tabelle addieren

                        // Zur Jahressumme addieren
                        const rowYear = effectiveRowStartDate.getFullYear();
                        if (!annualSums[rowYear]) annualSums[rowYear] = 0;
                        annualSums[rowYear] += rowEurAmount;

                        // Tabellenzeile erstellen und einfügen
                        const tr = document.createElement("tr");
                        tr.innerHTML = `<td class="date-cell">${formatDateForDisplay(effectiveRowStartDate)}</td>
                                                <td class="date-cell">${formatDateForDisplay(effectiveRowEndDate)}</td>
                                                <td>${rowYear}</td>
                                                <td class="calculated-grey-cell">${rowDays}</td>
                                                <td class="number-cell">${formatNumberDE(rowEurAmount)}</td>`;
                        detailsTableBody.appendChild(tr);
                    }
                }
            }
            // Zum nächsten Monat springen
            currentProcessingMonthStart.setMonth(currentProcessingMonthStart.getMonth() + 1);
            currentProcessingMonthStart.setDate(1); // Sicherstellen, dass es der Erste des Monats ist
        }
        // Gesamtsumme der Tabelle und Jahressummen anzeigen
        detailsTableSumCell.textContent = formatNumberDE(tableSumEur);
        displayAnnualSums(annualSums);
    }

    /**
     * Hauptfunktion zur Aktualisierung aller Berechnungen und Anzeigen.
     */
    function updateMainCalculations() {
        // 1. Daten aus dem PD-U1 Formular lesen und Basisberechnungen
        const vonDatumValue = vonDatumInput.value;
        const bisDatumValue = bisDatumInput.value;
        const selectedCurrencyCode = fremdwaehrungSelect.value;
        const totalDaysInOriginalPeriod = calculateDays(vonDatumValue, bisDatumValue);
        tageInput.value = totalDaysInOriginalPeriod > 0 ? totalDaysInOriginalPeriod : "";

        // Stichtag für Wechselkurs berechnen (erster Tag des Folgemonats nach "bis"-Datum)
        let stichtagValue = "";
        if (bisDatumValue) {
            const bisDate = new Date(bisDatumValue);
            if (!isNaN(bisDate.getTime())) {
                let nextMonth = bisDate.getMonth() + 1;
                let nextYear = bisDate.getFullYear();
                if (nextMonth > 11) { // Jahreswechsel berücksichtigen
                    nextMonth = 0;
                    nextYear++;
                }
                stichtagValue = formatDateForInput(new Date(nextYear, nextMonth, 1));
            }
        }
        stichtagInput.value = stichtagValue;

        // Betrag in Euro umrechnen
        const betragFremd = parseFloat(betragFremdInput.value.replace(",", ".")); // Komma als Dezimaltrenner erlauben
        const wechselkurs = parseFloat(wechselkursEurInput.value.replace(",", "."));
        let betragEur = 0;
        if (!isNaN(betragFremd) && !isNaN(wechselkurs) && wechselkurs !== 0) {
            betragEur = betragFremd * wechselkurs;
        }
        betragEurInput.value = formatNumberDE(betragEur);

        // Währungscode im Label anzeigen
        currencyCodeDisplayLabel.textContent = selectedCurrencyCode ? `Betrag PD-U1 (${selectedCurrencyCode})` : "Betrag PD-U1";

        // 2. Vorschlagsdaten für "Bemessung ab"-Buttons berechnen
        calculatedStartBemessung1Jahr = getAdjustedBemessungAbDate(bisDatumValue, 1, vonDatumValue);
        calculatedStartBemessung2Jahre = getAdjustedBemessungAbDate(bisDatumValue, 2, vonDatumValue);

        // Buttons aktivieren/deaktivieren, je nachdem ob Daten berechnet werden konnten
        setBemessung1JahrButton.disabled = !calculatedStartBemessung1Jahr;
        setBemessung2JahreButton.disabled = !calculatedStartBemessung2Jahre;

        // 3. Eingabe für "Bemessung ab" validieren (darf nicht außerhalb Hauptzeitraum liegen)
        const currentBemessungAbStr = bemessungAbManuellInput.value;
        const currentBemessungAbDate = getDatePart(currentBemessungAbStr);
        const overallVonDate = getDatePart(vonDatumValue);
        const overallBisDate = getDatePart(bisDatumValue);

        if (currentBemessungAbDate) { // Nur prüfen, wenn ein gültiges Datum eingegeben wurde
            if (overallVonDate && currentBemessungAbDate < overallVonDate) {
                bemessungAbManuellInput.value = vonDatumValue; // Korrigieren auf "von"-Datum
            } else if (overallBisDate && currentBemessungAbDate > overallBisDate) {
                // Sicherstellen, dass bisDatum nicht vor vonDatum liegt, bevor korrigiert wird
                if (!overallVonDate || overallBisDate >= overallVonDate) {
                    bemessungAbManuellInput.value = bisDatumValue; // Korrigieren auf "bis"-Datum
                }
            }
        }

        // 4. Felder im Abschnitt "Bemessung" aktualisieren
        let bemVon = bemessungAbManuellInput.value; // Nimmt den (ggf. korrigierten) Wert
        let bemBis = bisDatumValue; // Bemessung bis ist das Haupt-Enddatum

        bemessungVonInput.value = bemVon;
        bemessungBisInput.value = bemBis;
        const bemessungDays = calculateDays(bemVon, bemBis);
        bemessungTageInput.value = bemessungDays > 0 ? bemessungDays : "";

        // 5. Tabelle der Abrechnungszeiträume und Jahressummen aktualisieren
        // Wichtig: Hier den *Gesamtbetrag* und den *Gesamtzeitraum* übergeben,
        // die Filterung erfolgt innerhalb von updateDetailTable.
        updateDetailTable(betragEur, totalDaysInOriginalPeriod, vonDatumValue, bisDatumValue);

        // 6. Bemessungsentgelt mit der Summe der gefilterten Tabelle füllen
        bemessungEntgeltInput.value = detailsTableSumCell.textContent;

        // Für Druck: Ausgewählten Text der Select-Box in data-Attribut speichern
        const selectedOption = fremdwaehrungSelect.options[fremdwaehrungSelect.selectedIndex];
        fremdwaehrungSelect.dataset.selectedText = selectedOption ? selectedOption.textContent : "";
    }

    // --- Event-Listener für Interaktionen ---

    // Klicks auf die "Jahr zurück"-Buttons
    setBemessung1JahrButton.addEventListener("click", () => {
        if (calculatedStartBemessung1Jahr) {
            bemessungAbManuellInput.value = calculatedStartBemessung1Jahr;
            updateMainCalculations(); // Neuberechnung auslösen
        }
    });
    setBemessung2JahreButton.addEventListener("click", () => {
        if (calculatedStartBemessung2Jahre) {
            bemessungAbManuellInput.value = calculatedStartBemessung2Jahre;
            updateMainCalculations();
        }
    });

    // Abruf des Wechselkurses über Bundesbank-API und Eintrag in Input-Feld
    setExchangeRateButton.addEventListener("click", async () => {
        if (stichtagInput.value !== null && fremdwaehrungSelect.value !== null) {
            let startDate = new Date(stichtagInput.value);
            let endDate = new Date(startDate)
            endDate.setDate(startDate.getDate() + 6);
            let currency = fremdwaehrungSelect.value;
            let response = await fetchCourse(currency, startDate, endDate);
            response = response.filter((entry) => entry.rate !== null);
            console.info(response[0]);
            let rate = 1 / response[0].rate;
            wechselkursEurInput.value = rate.toFixed(8);
        }
        updateMainCalculations();
    });

    // Änderungen an den Haupt-Datumsfeldern und "Bemessung ab" (nach Verlassen des Feldes)
    [vonDatumInput, bisDatumInput, bemessungAbManuellInput].forEach((dateInput) => {
        dateInput.addEventListener("change", updateMainCalculations);
    });

    // Zusätzliche Validierung für "Bemessung ab" bei Änderung
    bemessungAbManuellInput.addEventListener('change', () => {
        const currentValDate = getDatePart(bemessungAbManuellInput.value);
        const vonD = getDatePart(vonDatumInput.value);
        const bisD = getDatePart(bisDatumInput.value);

        if (currentValDate) {
            if (vonD && currentValDate < vonD) {
                bemessungAbManuellInput.value = formatDateForInput(vonD);
            } else if (bisD && currentValDate > bisD) {
                if (!vonD || bisD >= vonD) { // Nur korrigieren, wenn bisD nicht vor vonD liegt
                    bemessungAbManuellInput.value = formatDateForInput(bisD);
                }
            }
        }
    });

    // Änderungen an Betrags- und Wechselkursfeldern (direkt bei Eingabe)
    [betragFremdInput, wechselkursEurInput].forEach(
        (input) => {
            input.addEventListener("input", updateMainCalculations);
            // 'change' zusätzlich, falls Benutzer Wert über Pfeile ändert und Feld nicht verlässt
            input.addEventListener("change", updateMainCalculations);
        }
    );

    // Event-Listener für den Druck-Button
    printButton.addEventListener('click', () => {
        window.print(); // Öffnet den Druckdialog des Browsers
    });

    // --- Initialisierung der Anwendung ---
    populateCurrencyDropdown(); // Länderauswahl befüllen

    // Standardwerte für eine initiale Ansicht setzen
    // fremdwaehrungSelect.value = 'DKK';
    // vonDatumInput.value = "2021-01-01";
    // bisDatumInput.value = "2024-12-11";
    // betragFremdInput.value = "63811.26";
    

    updateMainCalculations(); // Alle Berechnungen und Anzeigen initial durchführen
});
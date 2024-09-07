'use strict'

const JahresentgeltAusland_section = document.querySelector("#JahresentgeltAusland");
const JahresentgeltAusland_form = document.querySelector("#JahresentgeltAusland-form");
const JahresentgeltAusland_input_land = document.querySelector("#JahresentgeltAusland-land");
const JahresentgeltAusland_datalist_laender = document.querySelector("#JahresentgeltAusland-laender");
const JahresentgeltAusland_datalist_jahre = document.querySelector("#JahresentgeltAusland-jahre");
const JahresentgeltAusland_input_jahr = document.querySelector('#JahresentgeltAusland-jahr');
const JahresentgeltAusland_input_entgelt = document.querySelector('#JahresentgeltAusland-entgelt');
const JahresentgeltAusland_result = document.querySelector("#JahresentgeltAusland-result");


let JahresentgeltAusland_zeitreihen;
let JahresentgeltAusland_laender;
let JahresentgeltAusland_Land_Jahreswerte = { "name": "", "jahreswerte": [] };

const path = "../assets/data/Jahreswechselkurse.json";
const JahresentgeltAusland_api_url = "https://api.statistiken.bundesbank.de/rest/data/BBEX3/A."
const JahresentgeltAusland_api_url_appendix = ".EUR.BB.AC.A04?&detail=dataonly"


function addEventListeners() {
  JahresentgeltAusland_section.addEventListener("click", event => {
    if (event.target.tagName === "INPUT") {
      event.target.focus();
      event.target.select();
    }
  })
  JahresentgeltAusland_form.addEventListener("submit", (event) => {
    event.preventDefault();
    update_result(JahresentgeltAusland_input_land.value);
  })

}

async function init_JahresentgeltAusland() {
  addEventListeners();
  // load coutries that are supported by the Bundesbank API
  let response = await fetch(path);
  JahresentgeltAusland_zeitreihen = await response.json();
  JahresentgeltAusland_laender = Object.keys(JahresentgeltAusland_zeitreihen).sort();
  JahresentgeltAusland_laender.forEach(land => {
    let option = document.createElement('option');
    option.value = land;
    JahresentgeltAusland_datalist_laender.appendChild(option);
  })
  // init with first country of the global list
  let JahresentgeltAusland_aktuelles_land = JahresentgeltAusland_laender[0];
  JahresentgeltAusland_input_land.value = JahresentgeltAusland_aktuelles_land;
  // init with year before last year
  JahresentgeltAusland_input_jahr.value = Number((new Date()).getFullYear()) - 2;
  JahresentgeltAusland_input_entgelt.value = 1;
  update_result(JahresentgeltAusland_aktuelles_land);
}

init_JahresentgeltAusland();


async function update_result(land) {
  JahresentgeltAusland_Land_Jahreswerte.name = land;
  JahresentgeltAusland_Land_Jahreswerte.jahreswerte = [];
  await fetch_Bundesbank_data(land);
  let entry = JahresentgeltAusland_Land_Jahreswerte.jahreswerte.find(o => o.jahr === JahresentgeltAusland_input_jahr.value)
  let kurs = entry.wert;
  let entgelt_fremd = Number(JahresentgeltAusland_input_entgelt.value);
  let entgelt_euro = (Number(entgelt_fremd) / Number(kurs)).toFixed(2).toString();
  let waehrung = JahresentgeltAusland_zeitreihen[land].Waehrung;
  let result_text = `der aktuelle Kurs ist: ${kurs}. Das heißt es gibt für 1,00 € ${kurs} ${waehrung}. <br>
      Somit ergibt sich bei einem Entgelt von ${entgelt_fremd.toFixed(2)} ${waehrung} ein Entgelt von ${entgelt_euro} €.`;
  JahresentgeltAusland_result.innerHTML = result_text;
  console.log(JahresentgeltAusland_zeitreihen);
}


async function fetch_Bundesbank_data(land) {
  // TODO:  check if already loaded, if already loaded, use cache.
  let waehrung = JahresentgeltAusland_zeitreihen[land].Waehrung;
  let api_url_Bundensbank = JahresentgeltAusland_api_url + waehrung + JahresentgeltAusland_api_url_appendix;
  let response = await fetch(api_url_Bundensbank);
  let text = await response.text();
  let parser = new DOMParser();
  let xml = parser.parseFromString(text, "text/xml");
  xml = xml.firstChild.lastChild.firstChild.childNodes;
  JahresentgeltAusland_datalist_jahre.innerHTML = "";
  xml.forEach(element => {
    if (!element.children[0].hasAttribute("id")) {
      let jahr = element.children[0].attributes['value'].value;
      let wert
      try {
        wert = element.children[1].attributes['value'].value;
      } catch (error) {
        console.error(
          `kein Kurs angegeben für ${waehrung} / ${land} im Jahr ${jahr}. 
          Bitte manuell prüfen. Der Eintrag wird nicht hinzugefügt`
        )
        wert = null;
      }
      if (wert !== null) {
        JahresentgeltAusland_Land_Jahreswerte.jahreswerte.push({ "jahr": jahr, "wert": wert });
        // export to own function
        let option = document.createElement('option');
        option.value = jahr;
        JahresentgeltAusland_datalist_jahre.appendChild(option);
      }
    }
  })
  console.log(JahresentgeltAusland_Land_Jahreswerte.jahreswerte);
  return JahresentgeltAusland_Land_Jahreswerte.jahreswerte;

}


function update_datalist(datalist, options) {
  for (const element of options) {
    let option = document.createElement('option');
    option.value = element;
    datalist.appendChild(option);
  }
}




async function JahresentgeltAusland_update_zeitreihen(land) {
  // add empty array to object
  // if existing, it will be updated to empty array
  JahresentgeltAusland_zeitreihen[land]["jahreswerte"] = [];
  let data;
  data = await fetch_Bundesbank_data(land);
  JahresentgeltAusland_zeitreihen[land]["jahreswerte"] = data;

}


async function fetchAll() {
  // fetches the data for all countries in list
  for await (const c_land of JahresentgeltAusland_laender) {
    await JahresentgeltAusland_update_zeitreihen(c_land);
  }
}

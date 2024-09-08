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
// let JahresentgeltAusland_Land_Jahreswerte = { "name": "", "jahreswerte": [] };

const path_wechselkurse = "../assets/data/Jahreswechselkurse.json";
const JahresentgeltAusland_api_url = "https://api.statistiken.bundesbank.de/rest/data/BBEX3/A."
const JahresentgeltAusland_api_url_appendix = ".EUR.BB.AC.A04?&detail=dataonly"


function addEventListeners() {
  JahresentgeltAusland_section.addEventListener("click", event => {
    if (event.target.tagName === "INPUT") {
      event.target.focus();
      event.target.select();
    }
  })
  JahresentgeltAusland_section.addEventListener("change", event => {
    if (event.target.tagName === "INPUT" && event.target.id === "JahresentgeltAusland-land") {
      update_datalist_jahre(event.target.value);
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
  let response = await fetch(path_wechselkurse);
  JahresentgeltAusland_zeitreihen = await response.json();
  JahresentgeltAusland_laender = Object.keys(JahresentgeltAusland_zeitreihen).sort();
  update_datalist(JahresentgeltAusland_datalist_laender, JahresentgeltAusland_laender);
  JahresentgeltAusland_input_land.focus();
}

init_JahresentgeltAusland();

async function update_result(land) {
  let jahreswerte;
  jahreswerte = await fetch_Bundesbank_data(land);
  let entry = jahreswerte.find(o => o.jahr === JahresentgeltAusland_input_jahr.value)
  let kurs = entry.wert;
  let entgelt_fremd = Number(JahresentgeltAusland_input_entgelt.value);
  let entgelt_euro = (Number(entgelt_fremd) / Number(kurs)).toFixed(2);
  let waehrung = JahresentgeltAusland_zeitreihen[land].Waehrung;
  let result_text =
    `Der aktuelle Kurs ist: ${kurs}. <br>
  Das heißt es gibt für 1,00 € ${kurs} ${waehrung}. <br> <br>
  Somit ergibt sich bei einem Entgelt von ${entgelt_fremd.toFixed(2)} ${waehrung} ein Entgelt von ${entgelt_euro} €.`;
  JahresentgeltAusland_result.innerHTML = result_text;
  update_datalist_jahre(land);
}


async function fetch_Bundesbank_data(land) {
  //  check if already loaded, if already loaded, use cache.
  if (JahresentgeltAusland_zeitreihen[land]["jahreswerte"] !== undefined) {
    return JahresentgeltAusland_zeitreihen[land]["jahreswerte"];
  };
  let jahreswerte = [];
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
        jahreswerte.push({ "jahr": jahr, "wert": wert });
      } catch (error) {
        console.error(
          `kein Kurs angegeben für ${waehrung} / ${land} im Jahr ${jahr}. 
          Bitte manuell prüfen. Der Eintrag wird nicht hinzugefügt`
        )
      }
    }
  })
  JahresentgeltAusland_update_zeitreihen(land, jahreswerte);
  return jahreswerte;

}

function update_datalist(datalist, options) {
  for (const element of options) {
    let option = document.createElement('option');
    option.value = element;
    datalist.appendChild(option);
  }
}

async function update_datalist_jahre(land) {
  let jahreswerte;
  jahreswerte = await fetch_Bundesbank_data(land);
  let options = jahreswerte.map(({ jahr }) => jahr);
  update_datalist(JahresentgeltAusland_datalist_jahre, options)
}



async function JahresentgeltAusland_update_zeitreihen(land, data) {
  // add empty array to object
  // if existing, it will be updated to empty array
  JahresentgeltAusland_zeitreihen[land]["jahreswerte"] = [];
  // let data;
  // data = await fetch_Bundesbank_data(land);
  JahresentgeltAusland_zeitreihen[land]["jahreswerte"] = data;

}
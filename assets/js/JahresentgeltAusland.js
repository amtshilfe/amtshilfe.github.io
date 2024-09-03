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
let JahresentgeltAusland_aktuelles_land;
let JahresentgeltAusland_Land = { "name": "", "jahreswerte": [] };

const JahresentgeltAusland_api_url = "https://api.statistiken.bundesbank.de/rest/data/BBEX3/A."
const JahresentgeltAusland_api_url_appendix = ".EUR.BB.AC.A04?&detail=dataonly"



async function init_JahresentgeltAusland() {
  JahresentgeltAusland_section.addEventListener("click", event => {
    if (event.target.tagName === "INPUT") {
      event.target.focus();
      event.target.select();
    }
  })
  JahresentgeltAusland_form.addEventListener("submit", (event) => {
    event.preventDefault();
    fetch_Bundesbank(JahresentgeltAusland_input_land.value);
  })
  JahresentgeltAusland_input_entgelt.value = 1;
  // load coutries that are supported by the Bundesbank API
  let path = "../assets/data/Jahreswechselkurse EUR - Bundesbank_de.json";
  let response = await fetch(path);
  let json = await response.json();
  JahresentgeltAusland_zeitreihen = json;
  JahresentgeltAusland_laender = Object.keys(JahresentgeltAusland_zeitreihen).sort();
  JahresentgeltAusland_laender.forEach(land => {
    let option = document.createElement('option');
    option.value = land;
    JahresentgeltAusland_datalist_laender.appendChild(option);
  })
  JahresentgeltAusland_aktuelles_land = JahresentgeltAusland_laender[0];
  JahresentgeltAusland_input_land.value = JahresentgeltAusland_aktuelles_land;
  JahresentgeltAusland_input_jahr.value = 2023;
  fetch_Bundesbank(JahresentgeltAusland_aktuelles_land);
}

init_JahresentgeltAusland();


// temporal function, will be splitted
async function fetch_Bundesbank(land) {
  let waehrung = JahresentgeltAusland_zeitreihen[land].Waehrung;
  JahresentgeltAusland_Land.name = land;
  JahresentgeltAusland_Land.jahreswerte = [];
  await fetch_Bundesbank_data(land);

  let entry = JahresentgeltAusland_Land.jahreswerte.find(o => o.jahr === JahresentgeltAusland_input_jahr.value)
  let kurs = entry.wert;
  let entgelt_fremd = Number(JahresentgeltAusland_input_entgelt.value);
  let entgelt_euro = (Number(entgelt_fremd) / Number(kurs)).toFixed(2);
  let result_text = `der aktuelle Kurs ist: ${kurs}. Das heißt es gibt für 1,00 € ${kurs} ${waehrung}.
      Somit ergibt sich bei einem Entgelt von ${entgelt_fremd.toFixed(2)} ${waehrung} ein Entgelt in Euro von ${entgelt_euro}.`;
  JahresentgeltAusland_result.innerHTML = result_text;


  // console.log(await fetch_Bundesbank_data(land));

  for await (const c_land of JahresentgeltAusland_laender) {
    await JahresentgeltAusland_update_zeitreihen(c_land);
  }

  console.log(JahresentgeltAusland_zeitreihen);
}


async function fetch_Bundesbank_data(land) {
  // TODO:  check if already loaded
  //        if already loaded, use cache
  let waehrung = JahresentgeltAusland_zeitreihen[land].Waehrung;
  let url = JahresentgeltAusland_api_url + waehrung + JahresentgeltAusland_api_url_appendix;
  let xml;
  JahresentgeltAusland_Land.name = land;
  JahresentgeltAusland_Land.jahreswerte = [];
  let response = await fetch(url);
  let text = await response.text();

  let parser = new DOMParser();
  xml = parser.parseFromString(text, "text/xml");
  xml = xml.firstChild.lastChild.firstChild.childNodes;
  JahresentgeltAusland_datalist_jahre.innerHTML = "";
  xml.forEach(element => {
    if (!element.children[0].hasAttribute("id")) {
      // console.log(element);
      let jahr = element.children[0].attributes['value'].value;
      let wert
      try {
        wert = element.children[1].attributes['value'].value;

      } catch (error) {
        console.error(`kein Kurs angegeben für ${waehrung} / ${land} im Jahr ${jahr}. Bitte manuell prüfen. Der Kurst wird auf 0.01 festgelegt`)
        wert = 0.01;
      }
      JahresentgeltAusland_Land.jahreswerte.push({ "jahr": jahr, "wert": wert });
      let option = document.createElement('option');
      option.value = jahr;
      JahresentgeltAusland_datalist_jahre.appendChild(option);
    }
  })

  return JahresentgeltAusland_Land.jahreswerte;

}


async function JahresentgeltAusland_update_zeitreihen(land) {
  // add empty array to object
  // if existing, it will be updated to empty array
  JahresentgeltAusland_zeitreihen[land]["jahreswerte"] = [];
  let data;
  data = await fetch_Bundesbank_data(land);
  JahresentgeltAusland_zeitreihen[land]["jahreswerte"] = data;

}
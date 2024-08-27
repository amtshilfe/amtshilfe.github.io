'use strict'

// region DOM elements
let Jugendhilfe_form;
let Jugendhilfe_firstname;
let Jugendhilfe_lastname;
let Jugendhilfe_KD;
let Jugendhilfe_birthdate;
let Jugendhilfe_type;
let Jugendhilfe_type_BAB;
let Jugendhilfe_type_BVB;
let Jugendhilfe_sendMailButton;
let Jugendhilfe_Result;
let Jugendhilfe_Betreff_preview;
let Jugendhilfe_Text_preview;
let Jugendhilfe_Copy_Buttons;


// region INIT
// init with date from today
async function Jugendhilfe_init(params) {
  // just get the items, not the values
  Jugendhilfe_form = document.getElementById("Jugendhilfe-form");
  Jugendhilfe_firstname = document.querySelector("#Jugendhilfe-firstname");
  Jugendhilfe_lastname = document.querySelector("#Jugendhilfe-lastname");
  Jugendhilfe_KD = document.querySelector("#Jugendhilfe-KD");
  Jugendhilfe_birthdate = document.querySelector("#Jugendhilfe-birthdate");
  Jugendhilfe_type_BVB = document.querySelector("#Jugendhilfe-BvB");
  Jugendhilfe_type_BAB = document.querySelector("#Jugendhilfe-BAB");
  Jugendhilfe_sendMailButton = document.getElementById("Jugendhilfe-send-mail-button");
  Jugendhilfe_Result = document.getElementById("Jugendhilfe-result");
  Jugendhilfe_Betreff_preview = document.getElementById("Jugendhilfe-Betreff-preview");
  Jugendhilfe_Text_preview = document.getElementById("Jugendhilfe-Text-preview");
  Jugendhilfe_Copy_Buttons = document.querySelectorAll(".copy-text");

  Jugendhilfe_type = () => {
    if (Jugendhilfe_type_BAB.checked) return "BAB";
    if (Jugendhilfe_type_BVB.checked) return "BVB";
    return "BAB";
  };

  // region Event-Listeners added
  Jugendhilfe_Result.addEventListener('click', (event) => {
    if (event.target.classList.contains("copy-text")) {
      copyElementContentToClipboard(event.target);
    }
  })

  Jugendhilfe_form.addEventListener('submit', (event) => {
    event.preventDefault();
    Jugendhilfe_createMail();
  });
  Jugendhilfe_form.addEventListener('change', (event) => {
    if (event.target === Jugendhilfe_KD) { Jugendhilfe_KD.value = Jugendhilfe_KD.value.toUpperCase() };
    Jugendhilfe_updateText();
  });

  await addTemplateTexts();

  Jugendhilfe_birthdate.value = new Date().toISOString().split("T")[0];
  Jugendhilfe_firstname.focus();

}
Jugendhilfe_init();

async function addTemplateTexts() {
  // add contents of file templates to script for caching
  const template_files = [
    ["./assets/templates/text/Jugendhilfe_BAB_Betreff.txt", "Jugendhilfe_BAB_Betreff"],
    ["./assets/templates/text/Jugendhilfe_BVB_Betreff.txt", "Jugendhilfe_BVB_Betreff"],
    ["./assets/templates/text/Jugendhilfe_BAB_Text.txt", "Jugendhilfe_BAB_Text"],
    ["./assets/templates/text/Jugendhilfe_BVB_Text.txt", "Jugendhilfe_BVB_Text"],
  ]
  template_files.forEach(file => { addTemplate(file[0], file[1]); })
  // end of save
}

async function addTemplate(filename, id) {
  let textfile = await fetch(filename);
  let text = await textfile.text();
  // save json in document
  let script = document.createElement('script');
  script.async = true;
  script.type = 'text/plain';
  script.id = id;
  script.text = text;
  document.body.appendChild(script);
}

// region functions
function Jugendhilfe_renderTexts(Typ = "BVB") {
  // minor error handling
  if (Typ !== "BVB" && Typ !== "BAB") { throw new Error(`Typ muss "BAB" oder "BVB" sein; übergeben wurde ${Typ}.`); }

  const replacements = {
    "[VORNAME]": Jugendhilfe_firstname.value,
    "[NACHNAME]": Jugendhilfe_lastname.value,
    "[KD-Nummer]": Jugendhilfe_KD.value,
    "[Geburtsdatum]": (new Date(Jugendhilfe_birthdate.value)).toLocaleDateString()
  }

  let template_betreff = document.scripts["Jugendhilfe_" + Typ + "_Betreff"];
  let template_text = document.scripts["Jugendhilfe_" + Typ + "_Text"];
  let render_betreff = template_betreff.text;
  let render_text = template_text.text;


  Object.keys(replacements).forEach(key => { render_betreff = render_betreff.replaceAll(key, replacements[key]); })
  Object.keys(replacements).forEach(key => { render_text = render_text.replaceAll(key, replacements[key]); })
  let result = { "Betreff": render_betreff, "Text": render_text };
  return result;
}


function copyElementContentToClipboard(element) {
  let source = document.querySelector(element.dataset['copysource'])
  navigator.clipboard.writeText(source.textContent);
}

function Jugendhilfe_updateText() {
  let renderedTexts = Jugendhilfe_renderTexts(Jugendhilfe_type());
  Jugendhilfe_Betreff_preview.innerHTML = renderedTexts["Betreff"];
  Jugendhilfe_Text_preview.innerHTML = renderedTexts["Text"].replaceAll("\n", "<br>");
}

function Jugendhilfe_createMail() {
  let renderedTexts = Jugendhilfe_renderTexts(Jugendhilfe_type());
  let address = "mail@JuHi.de";
  let body = encodeURIComponent(renderedTexts["Text"]);
  let subject = encodeURIComponent(renderedTexts["Betreff"]);
  let href = "mailto:" + address + "?"
    + "subject=" + subject + "&"
    + "body=" + body;
  window.open(href, "_parent");
}

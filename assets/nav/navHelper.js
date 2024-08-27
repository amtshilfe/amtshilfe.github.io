"use strict"
import { loadFromLink } from "../js/ajax.js";
// sidenavigation
let sideNav;
let openMenuButton;

function toggleNav() {
    sideNav.classList.toggle("is-active");
}

async function initNav(navDiv = "mySidenav") {
    await addNav();
    loadCSS();
    await addNavElements(sideNav);
    openMenuButton.addEventListener("click", () => { toggleNav(); });
    window.addEventListener("click", (event) => {
        if (sideNav.classList.contains("is-active") &&
            (!event.target.classList.contains("openNav")) &&
            isClickInMenu(event)) toggleNav();
    });
    // show menu @ start
    if (location.hash === "") sideNav.classList.add("is-active");
}

async function addNav() {
    let body = document.body;
    // append invisible sidenav to document
    if (document.getElementById("mySidenav") == null) {
        let newNav = document.createElement("nav");
        newNav.className = "sidenav";
        newNav.id = "mySidenav";
        body.appendChild(newNav);
    }
    sideNav = document.getElementById("mySidenav");
    // append button to open menu to title in heading
    if (document.getElementsByClassName("openNav") == null) {
        let title = document.getElementById("title");
        let navButton = document.createElement("button");
        // navButton.id = "openNav";
        navButton.className = "openNav";
        title.appendChild(navButton);
    }
    // openMenuButton = document.getElementById("openNav");
    openMenuButton = document.getElementsByClassName("openNav")[0];
    openMenuButton.innerText += " \u{2630}"
}

async function addNavElements(navDiv) {
    let Tools = await fetch("./assets/nav/tools.json");
    Tools = await Tools.json();
    // save json in document
    let script = document.createElement('script');
    script.async = false;
    script.type = 'application/json';
    script.id = "tools_json";
    script.text = JSON.stringify(Tools);
    document.body.appendChild(script);
    // end of save

    // add button to close sidenav
    let closeButton = document.createElement("button");
    closeButton.className = "menubutton";
    closeButton.addEventListener("click", (e) => toggleNav());
    closeButton.innerText = "\u{2573}";
    navDiv.appendChild(closeButton);
    // add links to sideNav
    Tools.forEach(tool => {
        let linkElement = document.createElement("a");
        linkElement.className = "sidenav-link";
        linkElement.href = tool.Link;
        linkElement.innerText = tool.Name;
        let json = JSON.stringify(tool);
        linkElement.dataset.json = json;

        navDiv.appendChild(linkElement);
        navDiv.children[navDiv.children.length - 1].addEventListener("click", event => {
            event.preventDefault();
            loadFromLink(event);
            toggleNav();
        })
    });
}

function loadCSS() {
    // dynamically load sidenav.css
    let head = document.getElementsByTagName("HEAD")[0];
    let link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = "./assets/nav/sidenav.css";
    head.appendChild(link);
}

function isClickInMenu(event) {
    return Number(event.clientX) > (Number(sideNav.clientWidth) + Number(getComputedStyle(sideNav).left.split("px")[0]));
}

initNav();
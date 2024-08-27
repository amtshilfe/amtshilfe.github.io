'use strict'

async function initDoc() {
    let toolName = location.hash;
    if (toolName != "") {
        let tools;
        try {
            tools = JSON.parse(document.scripts.tools_json.text);
            if (!tools.ID) {
                throw new Error("initDoc: tools JSON hat nicht das erwartete Format");
            }
        }
        catch (error) {
            console.info("initDoc: Tools noch nicht gespeichert. Datei wird von Server geladen.");
            tools = await fetch("./assets/nav/tools.json");
            tools = await tools.json();
        }
        finally {
            toolName = location.hash.substring(1);
            let tool = tools.find(tool => tool.ID == toolName);
            loadDoc(tool);
        }
    }
}
initDoc();
// tools menu is shown @ start

export function loadDoc(nav_element) {
    var toolbox_container;
    toolbox_container = document.getElementById("toolbox-container");
    allSectionsInvisible(toolbox_container);
    if (toolbox_container.children[nav_element.ID] == null) {
        // load new tool
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let html = this.responseText;
                let newTool = htmlToNode(html);
                newTool.classList.add("is-active")
                toolbox_container.appendChild(newTool);
                let script = document.createElement('script');
                script.src = nav_element.Script;
                script.async = false;
                script.type = 'module';
                script.id = "s_" + nav_element.ID;
                script.onload = () => { };
                script.onerror = () => { console.log('Error occurred while loading additional script'); };
                document.body.appendChild(script);
            }
        }
        xhttp.open("GET", nav_element.Link, true);
        xhttp.send();
    }
    else { // tool already loaded
        toolbox_container.children[nav_element.ID].classList.add("is-active");
    }
}

export function loadFromLink(event) {
    loadDoc(JSON.parse(event.currentTarget.dataset.json));
}

function allSectionsInvisible(toolbox_container) {
    toolbox_container.querySelectorAll("section").forEach(section => {
        section.classList.remove("is-active");
    });
}

/**
 * @param {String} html representing a single node (which might be an Element, a text node, or a comment).
 * @return {Node}
 */
function htmlToNode(html) {
    const template = document.createElement('template');
    template.innerHTML = html;
    const nNodes = template.content.childNodes.length;
    if (nNodes !== 1) {
        throw new Error(
            `html parameter must represent a single node; got ${nNodes}. ` +
            'Note that leading or trailing spaces around an element in your ' +
            'HTML, like " <img/> ", get parsed as text nodes neighbouring ' +
            'the element; call .trim() on your input to avoid this.'
        );
    }
    return template.content.firstChild;
}

/**
 * @param {String} html representing any number of sibling nodes
 * @return {NodeList} 
 */
function htmlToNodes(html) {
    const template = document.createElement('template');
    template.innerHTML = html;
    return template.content.childNodes;
}

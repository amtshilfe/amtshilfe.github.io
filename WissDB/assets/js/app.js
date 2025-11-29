'use strict';
// app.js
import Toasts from './Toasts.js';
const DB_NAME = 'KnowledgeDB';
const DB_VERSION = 1;
const STORE_NAME = 'entries';
const STORE_NAME_SETTINGS = 'settings';
const DEFAULT_IMPORT_URL = './assets/default-entries.json'; // Pfad anpassen

let db;
let currentEditId = null;
let selectedTags = [];
let tagSort = 'name';

// IndexedDB Initialisierung
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            // Notwendige Stores erstellen
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, {
                    keyPath: 'id',
                    autoIncrement: true
                });
                store.createIndex('tags', 'tags', { multiEntry: true });
                store.createIndex('created', 'created');
            }
            // Settings-Store für neue Installationen
            if (!db.objectStoreNames.contains(STORE_NAME_SETTINGS)) {
                db.createObjectStore(STORE_NAME_SETTINGS, { keyPath: 'name' });
            };
        };


        request.onsuccess = (event) => {
            db = event.target.result;
            resolve();
            updateDisplay();
        };

        request.onerror = (event) => {
            reject('Datenbankfehler: ' + event.target.error);
        };
    });
}

async function checkInitialEntries() {
    const entries = await getAllEntries();
    const toasts = new Toasts({
        duration: '.5s',
        dimOld: false,
        position: 'top-center',
    });

    if (entries.length === 0) {
        try {
            await importDefaultEntries();
            toasts.push({
                title: 'Keine Einträge in Datenbank vorhanden',
                content: 'Standard-Einträge wurden erfolgreich geladen',
                style: 'success',
                dismissAfter: "5s"

            });
        } catch (error) {
            toasts.push({
                title: 'Keine Einträge in Datenbank vorhanden',
                content: 'Fehler beim Import der Standardeinträge',
                style: 'error',
                dismissAfter: "5s"

            });

        }
    }
}

async function importDefaultEntries() {
    try {
        const response = await fetch(DEFAULT_IMPORT_URL);
        if (!response.ok) throw new Error('Datei nicht gefunden');

        const defaultEntries = await response.json();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        defaultEntries.forEach(entry => {
            entry.created = new Date(); // Aktuelles Datum hinzufügen
            store.put(entry);
        });

        return new Promise((resolve, reject) => {
            transaction.oncomplete = resolve;
            transaction.onerror = () => reject(transaction.error);
        });
    } catch (error) {
        throw new Error(`Import fehlgeschlagen: ${error.message}`);
    }
}

// Datenbankoperationen
async function addEntry(title, content, tags) {
    const entry = {
        title,
        content,
        tags: tags.split(',').map(t => t.trim()),
        created: new Date()
    };

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.add(entry);

        request.onsuccess = () => {
            updateDisplay();
            triggerSync();
            resolve();
        };

        request.onerror = (event) => reject(event.target.error);
    });
}

async function deleteEntry(id) {
    let confirmDelete = confirm('Willst du den Eintrag wirklich löschen?\nDiese Aktion kann nicht rückgängig gemacht werden!');
    if (!confirmDelete) return;

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => {
            updateDisplay();
            triggerSync();
            resolve();
        };

        request.onerror = (event) => reject(event.target.error);
    });
}

async function deleteDB() {
    let confirmDelete = confirm('Willst du die Datenbank wirklich löschen?\nDiese Aktion kann nicht rückgängig gemacht werden!');
    if (!confirmDelete) return;
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => {
            updateDisplay();
            resolve();
        };
        request.onerror = (event) => reject(event.target.error);
    });
}

async function editEntry(id, title, content, tags) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const getRequest = store.get(id);

        getRequest.onsuccess = () => {
            const entry = getRequest.result;
            entry.title = title;
            entry.content = content;
            entry.tags = tags.split(',').map(t => t.trim());

            const putRequest = store.put(entry);
            putRequest.onsuccess = () => {
                updateDisplay();
                triggerSync();
                resolve();
            };
            putRequest.onerror = (event) => reject(event.target.error);
        };

        getRequest.onerror = (event) => reject(event.target.error);
    });
}

async function getAllEntries() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

async function getEntryFromDB(entryID) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(entryID);

        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// Event Listener
document.addEventListener('DOMContentLoaded', async () => {
    await initDB();
    await checkInitialEntries();
    setupEventListeners();
    updateDisplay();

    // Automatischen Sync starten
    if (syncSettings.path) {
        await performSync();
    }
});


function setupEventListeners() {
    document.getElementById('addButton').addEventListener('click', showAddForm);
    document.getElementById('deleteDBButton').addEventListener('click', deleteDB);
    document.getElementById('saveButton').addEventListener('click', saveEntry);
    document.getElementById('cancelButton').addEventListener('click', closeModal);
    document.getElementById('exportButton').addEventListener('click', exportData);
    document.getElementById('importFile').addEventListener('change', handleFileImport);
    document.getElementById("toggleTagSortName").addEventListener("click", (event) => toggleTagSort('name'));
    document.getElementById("toggleTagSortCount").addEventListener("click", () => toggleTagSort('count'));
    document.getElementById("toggleFilterMenu").addEventListener("click", toggleFilterMenu);
    document.getElementById("closeFilterMenu").addEventListener("click", toggleFilterMenu);
    document.getElementById("deleteFilter").addEventListener("click", clearTagFilter);
    document.getElementById("buttonSearch").addEventListener("click", filterByText);

    document.getElementById("toTop").addEventListener("click", (e) => scrollToTopFunction(e));
    document.getElementById("toBottom").addEventListener("click", scrollToBottomFunction);


    // sync & settings buttons
    document.getElementById("settings-link").addEventListener("click", openSettings);
    document.getElementById("buttonSelectSyncFile").addEventListener("click", selectSyncFile);
    document.getElementById("buttonSaveSettings").addEventListener("click", storeSettings);
    document.getElementById("buttonCloseSettings").addEventListener("click", closeSettings);
    document.getElementById("buttonSelectSyncFile").addEventListener("click", selectSyncFile);
}

// UI Funktionen
async function copyEntryContent(id) {
    let entry = await getEntryFromDB(id);
    const rich = renderMarkdown(entry.content);
    const plain = entry.content;
    const html = new Blob([rich], { type: "text/html" });
    const text = new Blob([plain], { type: "text/plain" });
    const data = new ClipboardItem({ "text/html": html, "text/plain": text });
    await navigator.clipboard.write([data]);
}

// Markdown mit XSS-Schutz rendern
function renderMarkdown(content) {
    marked.use({
        gfm: true,
        breaks: true,
    });
    const unsafeHtml = marked.parse(content || '');
    return DOMPurify.sanitize(unsafeHtml, {
        ALLOWED_TAGS: [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'blockquote', 'p', 'a', 'ul', 'ol', 'nl', 'li',
            'b', 'i', 'strong', 'em', 'strike', 'code', 'hr',
            'br', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
            'pre', 'span', 'img'
        ],
        ALLOWED_ATTR: ['href', 'target', 'src', 'alt', 'title', 'class']
    });
}

function createElementWithOptions(htmlTag, options) {
    const element = document.createElement(htmlTag);
    for (let key in options) {
        if (key.startsWith('data-')) {
            element.setAttribute(key, options[key]);
        }
        else {
            element[key] = options[key];
        }
    }
    return element;
}

async function filterByText() {
    // const searchBox = document.getElementById("searchBox");
    let searchText = document.getElementById("searchText").value
    await updateDisplayNext("text", searchText);
}

async function updateDisplay() {
    await updateDisplayNext("tags", selectedTags)
    // const entries = await getAllEntries();
    // const container = document.getElementById('entries');
    // const filteredEntries = entries.filter(entry => selectedTags.every(t => entry.tags.includes(t)));
    // container.innerHTML = '';
    // for (let entry of filteredEntries) {
    //     container.appendChild(ComponentEntry(entry));
    // }
    // updateTagList(entries);
}


async function updateDisplayNext(selector, filter) {
    const entries = await getAllEntries();
    const container = document.getElementById('entries');
    let filteredEntries;

    if (selector == "text") {
        filteredEntries = entries.filter(entry => entry.content.toLowerCase().includes(filter.toLowerCase()));
    }
    else if (selector = "tags") {
        filteredEntries = entries.filter(entry => filter.every(t => entry.tags.includes(t)));
    }
    // reset container
    container.innerHTML = '';
    for (let entry of filteredEntries) {
        container.appendChild(ComponentEntry(entry));
    }

    updateTagList(filteredEntries);
    // updateTagList(entries);
}

function ComponentEntry(entry) {
    // returns a div element with the entry content
    // https://stackoverflow.com/questions/63005745/cleanest-way-for-allowing-htmls-onclick-to-access-a-modules-function
    let entryDiv = createElementWithOptions('div', { classList: ['entry'], });
    let heading = createElementWithOptions('div', { classList: ['entry-heading'], });
    let h3 = createElementWithOptions('h3', { textContent: entry.title });
    let deleteButton = createElementWithOptions('actionIcon', {
        textContent: 'delete',
        classList: 'material-icons-outlined',
        title: 'Eintrag Löschen',
        onclick: () => deleteEntry(entry.id),
    });
    heading.appendChild(h3);
    heading.appendChild(deleteButton);
    entryDiv.appendChild(heading);
    let content = createElementWithOptions('div', {
        classList: 'content',
        innerHTML: renderMarkdown(entry.content)
    });
    entryDiv.appendChild(content);
    let tags = createElementWithOptions('div', { classList: ['tagList'] });
    for (let tag of entry.tags) {
        let span = createElementWithOptions('span', {
            classList: 'tag inactive',
            textContent: tag,
            onclick: () => toggleTagFilter(tag),
        });
        tags.appendChild(span);
    }
    entryDiv.appendChild(tags);
    let actions = createElementWithOptions('div', { classList: ['entry-actions'] });
    let editButton = createElementWithOptions('actionIcon', {
        textContent: 'edit',
        classList: 'material-icons-outlined',
        title: 'Eintrag bearbeiten',
        onclick: () => startEdit(entry.id),
    })
    let copyButton = createElementWithOptions('actionIcon', {
        textContent: 'content_copy',
        classList: 'material-icons-outlined',
        title: "Text kopieren",
        onclick: () => copyEntryContent(entry.id),
    })
    actions.appendChild(editButton);
    actions.appendChild(copyButton);
    entryDiv.appendChild(actions);
    return entryDiv;
}

async function updateTagList(entries) {
    const tagContainer = document.getElementById('tagList');
    const selectedTagContainer = document.getElementById('selectedTagList');

    let tags = {};
    // count tags -> {tag: count}
    entries.forEach(entry => {
        entry.tags.forEach(tag => {
            tags[tag] = (tags[tag] || 0) + 1;
        });
    });
    // sort tags by name or count
    const sortedTags = Object.entries(tags).sort((a, b) => {
        return tagSort === 'name'
            ? a[0].localeCompare(b[0])
            : b[1] - a[1];
    });
    // update tag list
    tagContainer.innerHTML = '';
    for (let tag of sortedTags) {
        let span = createElementWithOptions('span', {
            classList: `tag ${selectedTags.includes(tag[0]) ? 'active' : ''}`,
            textContent: `${tag[0]} (${tag[1]})`,
            onclick: () => toggleTagFilter(`${tag[0]}`),
        });
        tagContainer.appendChild(span);
    }
    selectedTagContainer.innerHTML = '';
    for (let tag of selectedTags) {
        let span = createElementWithOptions('span', {
            classList: `tag`,
            textContent: `${tag}`,
            onclick: () => toggleTagFilter(`${tag}`),
        });
        selectedTagContainer.appendChild(span);
    }

}

function toggleTagSort(type) {
    tagSort = type;
    updateDisplay();
}

function toggleTagFilter(tag) {
    const index = selectedTags.indexOf(tag);
    if (index === -1) {
        selectedTags.push(tag);
    } else {
        selectedTags.splice(index, 1);
    }
    updateDisplayNext("tags", selectedTags);
}

function clearTagFilter() {
    selectedTags = [];
    updateDisplay();
}

// Modal-Funktionen
function showAddForm() {
    currentEditId = null;
    document.getElementById('entryModal').classList.add('show');
    clearModalFields();
}

async function startEdit(id) {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = () => {
        const entry = request.result;
        document.getElementById('title').value = entry.title;
        document.getElementById('content').value = entry.content;
        document.getElementById('tags').value = entry.tags.join(', ');
        currentEditId = id;
        document.getElementById('entryModal').classList.add('show');
    };
}

function clearModalFields() {
    document.getElementById('title').value = '';
    document.getElementById('content').value = '';
    document.getElementById('tags').value = '';
}

async function saveEntry() {
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const tags = document.getElementById('tags').value;

    if (!title || !content) {
        alert('Bitte Titel und Inhalt ausfüllen!');
        return;
    }

    try {
        if (currentEditId !== null) {
            await editEntry(currentEditId, title, content, tags);
        } else {
            await addEntry(title, content, tags);
        }
        closeModal();
    } catch (error) {
        console.error('Fehler beim Speichern:', error);
        alert('Fehler beim Speichern des Eintrags!');
    }
}

function closeModal() {
    document.getElementById('entryModal').classList.remove('show');
    currentEditId = null;
}

// Import/Export
async function exportData() {
    try {
        const entries = await getAllEntries();
        const data = JSON.stringify(entries, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `knowledge-export-${new Date().toISOString()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Export fehlgeschlagen:', error);
        alert('Fehler beim Exportieren der Daten!');
    }
}

function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function (e) {
        try {
            const importedEntries = JSON.parse(e.target.result);
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            importedEntries.forEach(entry => {
                store.put(entry);
            });

            transaction.oncomplete = () => {
                updateDisplay();
                event.target.value = ''; // Reset file input
            };
        } catch (error) {
            console.error('Import fehlgeschlagen:', error);
            alert('Ungültige Importdatei!');
        }
    };
    reader.readAsText(file);
}


// add syncing and settings

// app.js
let syncFileHandle = null;
let syncIntervalId = null;
let syncSettings = {
    path: '',
    interval: 5,
    lastSync: null
};

// Settings-Funktionen
async function selectSyncFile() {
    try {
        const handle = await window.showSaveFilePicker({
            types: [{
                description: 'Sync-Datei',
                accept: { 'application/json': ['.json'] }
            }]
        });
        syncFileHandle = handle;
        document.getElementById('syncPath').value = handle.name;
        await storeSettings();
    } catch (err) {
        console.log('Dateiauswahl abgebrochen');
    }
}

async function loadSettings() {
    if (!db.objectStoreNames.contains(STORE_NAME_SETTINGS)) {
        console.warn('Settings-Store nicht vorhanden');
        return;
    }

    const settings = await new Promise((resolve) => {
        const transaction = db.transaction(['settings'], 'readonly');
        const store = transaction.objectStore('settings');
        const request = store.get('syncSettings');
        request.onsuccess = () => resolve(request.result?.value || {});
    });

    syncSettings = { ...syncSettings, ...settings };
    document.getElementById('syncInterval').value = syncSettings.interval;
    document.getElementById('syncPath').value = syncSettings.path;

    if (syncSettings.path) {
        startSyncInterval();
    }
}

async function storeSettings() {
    // Sicherstellen, dass die Datenbank initialisiert ist
    if (!db) {
        await initDB();
    }

    // Settings-Store existenz prüfen
    if (!db.objectStoreNames.contains('settings')) {
        // Datenbank-Upgrade durchführen
        await new Promise((resolve, reject) => {
            const newVersion = db.version + 1;
            const request = indexedDB.open(db.name, newVersion);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'name' });
                }
            };

            request.onsuccess = resolve;
            request.onerror = reject;
        });
    }

    // Aktuelle Einstellungen übernehmen
    syncSettings = {
        ...syncSettings,
        path: syncFileHandle ? syncFileHandle.name : '',
        interval: parseInt(document.getElementById('syncInterval').value)
    };

    // Transaktion mit Fehlerbehandlung
    try {
        const transaction = db.transaction(['settings'], 'readwrite');
        const store = transaction.objectStore('settings');

        await new Promise((resolve, reject) => {
            const request = store.put({
                name: 'syncSettings',
                value: syncSettings,
                created: new Date()
            });

            request.onsuccess = resolve;
            request.onerror = () => reject(request.error);
        });

        await transaction.done;
        startSyncInterval();

    } catch (error) {
        console.error('Fehler beim Speichern der Einstellungen:', error);
        showSystemNotice('Einstellungen konnten nicht gespeichert werden', true);
    }
    finally {
        closeSettings();
    }
}

function startSyncInterval() {
    if (syncIntervalId) clearInterval(syncIntervalId);
    syncIntervalId = setInterval(
        () => performSync(),
        syncSettings.interval * 60 * 1000
    );
}

// Sync-Funktionen
async function performSync() {
    if (!syncFileHandle) return;

    try {
        // Schreiben
        const entries = await getAllEntries();
        const writable = await syncFileHandle.createWritable();
        await writable.write(JSON.stringify(entries));
        await writable.close();

        // Lesen und Merge
        const file = await syncFileHandle.getFile();
        const remoteData = JSON.parse(await file.text());
        await mergeEntries(remoteData);

        updateSyncStatus(true);
    } catch (error) {
        console.error('Sync fehlgeschlagen:', error);
        updateSyncStatus(false);
    }
}

async function mergeEntries(remoteEntries) {
    const localEntries = await getAllEntries();
    const merged = [...localEntries];

    remoteEntries.forEach(remote => {
        const localIndex = localEntries.findIndex(l => l.id === remote.id);
        if (localIndex === -1) {
            merged.push(remote);
        } else if (new Date(remote.updated) > new Date(localEntries[localIndex].updated)) {
            merged[localIndex] = remote;
        }
    });

    const transaction = db.transaction([STORE_NAME], 'readwrite');
    transaction.objectStore(STORE_NAME).clear();
    merged.forEach(entry => transaction.objectStore(STORE_NAME).put(entry));
    await transaction.complete;

    updateDisplay();

}

function updateSyncStatus(success) {
    const toasts = new Toasts({
        dimOld: false,
        position: 'bottom-center',
    });

    if (success) {
        toasts.push({
            title: 'Sychronisierung erfolgreich',
            content: `Einträge zuletzt synchronisiert: ${new Date().toLocaleTimeString()}`,
            style: 'success',
            dismissAfter: "0.5s"
        })
    }
    else {
        toasts.push({
            title: 'Fehler bei Synchronisierung',
            content: 'Synchronisierung wurde nicht durchgeführt',
            style: 'error',
            dismissAfter: "5s"
        });
    }
}

// UI Events
function openSettings() {
    // document.getElementById('settingsModal').style.display = 'block';
    document.getElementById('settingsModal').classList.toggle('show');
}
function toggleFilterMenu() {
    document.getElementById('filterContainer').classList.toggle('hidden');
}

function closeSettings() {
    // document.getElementById('settingsModal').style.display = 'none';
    document.getElementById('settingsModal').classList.remove('show');
}


// Bei Datenänderungen manuell syncen
function triggerSync() {
    performSync();
}

// In allen CRUD-Funktionen nach dem updateDisplay:
// triggerSync() aufrufen

// When the user clicks on the button, scroll to the top of the document
function scrollToTopFunction() {
//    e.preventDefault();
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

// When the user clicks on the button, scroll to the bottom of the document
function scrollToBottomFunction() {
    window.scrollTo(0, document.body.scrollHeight, { behavior: 'smooth' });
}
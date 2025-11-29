const app = {
  data: [], // Leer beim Start
  activeTag: "Alle",
  searchTerm: "",
  allTags: new Set(["Alle"]),

  init() {
    this.cacheDOM();
    this.bindEvents();
    // Lade lokale Tools beim Start
    this.loadTools("tools.json", "Lokal");
  },

  cacheDOM() {
    this.dom = {
      grid: document.getElementById("toolsGrid"),
      tags: document.getElementById("tagsContainer"),
      empty: document.getElementById("emptyState"),
      logo: document.getElementById("logo"),
      resetBtn: document.getElementById("resetBtn"),
      footerSearchInput: document.getElementById("footerSearchInput"),
      loadExtraBtn: document.getElementById("loadExtraBtn"),
    };
  },

  bindEvents() {
    const handleSearch = (e) => {
      this.searchTerm = e.target.value.toLowerCase();
      this.renderGrid();
    };

    this.dom.footerSearchInput.addEventListener("input", handleSearch);

    this.dom.logo.addEventListener("click", () => this.resetFilter());
    this.dom.resetBtn.addEventListener("click", () => this.resetFilter());
    this.dom.loadExtraBtn.addEventListener("click", () => this.loadTools("extra-tools.json", "Extern", this.dom.loadExtraBtn));

    // Events für die Such-Animation im Footer
    const searchContainer = document.getElementById("footerSearchContainer");
    this.dom.footerSearchInput.addEventListener("focus", () => {
      searchContainer.classList.add("active");
      if (this.dom.loadExtraBtn.style.display !== "none") {
        this.dom.loadExtraBtn.classList.add("hidden");
      }
    });

    this.dom.footerSearchInput.addEventListener("blur", () => {
      searchContainer.classList.remove("active");
      this.dom.loadExtraBtn.classList.remove("hidden");
    });
  },

  async loadTools(filename, automaticTag, btnElement = null) {
    if (btnElement) {
      btnElement.classList.add("opacity-50", "cursor-not-allowed");
      btnElement.innerText = "Lade...";
    }

    try {
      const response = await fetch(filename);
      if (response.ok) {
        const newData = await response.json();
        if (Array.isArray(newData)) {
          // Füge den automatischen Tag hinzu
          const taggedData = newData.map((item) => {
            if (!item.tags) item.tags = [];
            if (!item.tags.includes(automaticTag)) {
              item.tags.push(automaticTag);
            }
            return item;
          });

          this.data = [...this.data, ...taggedData];

          // --- NEU: Sortierung der Tools nach Titel ---
          this.data.sort((a, b) => a.title.localeCompare(b.title));
          // --- ENDE NEU ---

          this.extractTags();
          this.renderTags();
          this.renderGrid();

          // Wenn Button geklickt wurde, verstecke ihn nach Erfolg
          if (btnElement) {
            btnElement.style.display = "none";
          }
        }
      } else {
        console.error(`Fehler beim Laden von ${filename}: ${response.status}`);
        if (btnElement) btnElement.innerText = "Fehler beim Laden";
      }
    } catch (error) {
      console.log(`Konnte ${filename} nicht laden.`, error);
      if (btnElement) btnElement.innerText = "Datei nicht gefunden";
    }
  },

  extractTags() {
    // Reset Tags, aber behalte 'Alle'
    this.allTags = new Set(["Alle"]);
    this.data.forEach((item) => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach((tag) => this.allTags.add(tag));
      }
    });
  },

  setTag(tag) {
    this.activeTag = tag;
    this.renderTags();
    this.renderGrid();
  },

  resetFilter() {
    this.activeTag = "Alle";
    this.searchTerm = "";
    this.dom.footerSearchInput.value = "";
    this.renderTags();
    this.renderGrid();
  },

  renderTags() {
    this.dom.tags.innerHTML = "";

    const priorityTags = ["Alle", "Lokal", "Extern"];

    // Filtere die Prioritäts-Tags heraus und sortiere den Rest alphabetisch
    const otherTags = Array.from(this.allTags)
      .filter((t) => !priorityTags.includes(t))
      .sort((a, b) => a.localeCompare(b)); // Explizite alphabetische Sortierung

    // Führe die Prioritäts-Tags (sofern vorhanden) mit den alphabetisch sortierten Tags zusammen
    const sortedTags = [...priorityTags.filter((t) => this.allTags.has(t)), ...otherTags];

    sortedTags.forEach((tag) => {
      const btn = document.createElement("button");
      const isActive = this.activeTag === tag;

      btn.className = `whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
        isActive ? "tag-active shadow-md scale-105" : "tag-inactive"
      }`;
      btn.innerText = tag;
      btn.onclick = () => this.setTag(tag);
      this.dom.tags.appendChild(btn);
    });
  },

  renderGrid() {
    this.dom.grid.innerHTML = "";

    const filtered = this.data.filter((item) => {
      const matchesTag = this.activeTag === "Alle" || (item.tags && item.tags.includes(this.activeTag));
      const matchesSearch = item.title.toLowerCase().includes(this.searchTerm) || item.description.toLowerCase().includes(this.searchTerm);
      return matchesTag && matchesSearch;
    });

    if (filtered.length === 0) {
      this.dom.empty.classList.remove("hidden");
    } else {
      this.dom.empty.classList.add("hidden");
      filtered.forEach((item, index) => {
        this.createCard(item, index);
      });
    }
  },

  createCard(item, index) {
    const card = document.createElement("div");
    card.className =
      "group bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-blue-200 transition-all duration-300 relative flex flex-col h-full";

    // Header
    const header = document.createElement("div");
    header.className = "flex items-start justify-between mb-3";

    // Emoji Icon
    const iconDiv = document.createElement("div");
    iconDiv.className =
      "w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300 select-none";
    iconDiv.innerText = item.emoji || "🔗";
    header.appendChild(iconDiv);

    const linkIcon = document.createElement("a");
    linkIcon.href = item.url;
    linkIcon.target = "_blank";
    linkIcon.className = "text-slate-400 hover:text-primary transition-colors no-underline";
    linkIcon.innerText = "↗";

    header.appendChild(linkIcon);

    // Content
    const content = document.createElement("div");
    content.className = "flex-grow";

    const title = document.createElement("h3");
    title.className = "font-bold text-slate-800 text-lg mb-1 group-hover:text-primary transition-colors";
    title.innerText = item.title;

    const desc = document.createElement("p");
    desc.className = "text-slate-500 text-sm leading-relaxed mb-4";
    desc.innerText = item.description;

    content.appendChild(title);
    content.appendChild(desc);

    // Footer (Tags)
    const footer = document.createElement("div");
    footer.className = "pt-4 border-t border-slate-100 flex flex-wrap gap-2 mt-auto";

    if (item.tags) {
      item.tags.forEach((tag) => {
        const tagSpan = document.createElement("span");
        // Färbe "Lokal" und "Extern" Tags speziell
        let tagColorClass = "bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-700";
        if (tag === "Lokal") tagColorClass = "bg-emerald-100 text-emerald-700 hover:bg-emerald-200";
        if (tag === "Extern") tagColorClass = "bg-amber-100 text-amber-700 hover:bg-amber-200";

        tagSpan.className = `text-xs font-medium px-2 py-1 rounded cursor-pointer transition-colors ${tagColorClass}`;
        tagSpan.innerText = tag;
        tagSpan.onclick = (e) => {
          e.stopPropagation();
          this.setTag(tag);
          window.scrollTo({ top: 0, behavior: "smooth" });
        };
        footer.appendChild(tagSpan);
      });
    }

    card.appendChild(header);
    card.appendChild(content);
    card.appendChild(footer);

    card.addEventListener("click", (e) => {
      if (e.target.tagName !== "A" && e.target.tagName !== "SPAN") {
        window.open(item.url, "_blank");
      }
    });
    card.style.cursor = "pointer";

    this.dom.grid.appendChild(card);
  },
};

document.addEventListener("DOMContentLoaded", () => {
  app.init();
});

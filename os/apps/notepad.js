WebOSApps.register("notepad", {
  title: "Notepad",
  icon: "📝",
  showOnDesktop: true,
  render(root, { FileSystem }) {
    root.innerHTML = `
      <style>
        .ide-root { width:100%; height:100%; display:flex; flex-direction:column; }
        .ide-topbar {
          background:#2d2d2d; color:white; padding:8px 12px;
          display:flex; gap:20px; user-select:none; position:relative;
        }
        .ide-menu { position:relative; cursor:pointer; }
        .ide-dropdown {
          display:none; position:absolute; top:28px; left:0;
          background:#1e1e1e; border:1px solid #333; min-width:180px; z-index:10;
        }
        .ide-dropdown div {
          padding:6px 12px; color:white; cursor:pointer;
        }
        .ide-dropdown div:hover { background:#333; }
        .ide-tabs {
          background:#1e1e1e; color:white; padding:6px;
          display:flex; gap:10px; border-bottom:1px solid #333;
        }
        .ide-tab {
          padding:6px 12px; background:#333;
          border-radius:4px 4px 0 0; cursor:pointer;
          display:flex; align-items:center; gap:6px;
        }
        .ide-tab.active {
          background:#1e1e1e; border-bottom:2px solid #007acc;
        }
        .ide-close-btn { color:#aaa; cursor:pointer; }
        .ide-close-btn:hover { color:white; }
        .ide-editor { flex:1; }
      </style>

      <div class="ide-root">
        <div class="ide-topbar" id="ide-topbar">
          <div class="ide-menu" data-menu="file">File
            <div class="ide-dropdown" id="ide-file-menu">
              <div data-action="new">New File</div>
              <div data-action="open-virtual">Open from C:/...</div>
              <div data-action="save">Save</div>
              <div data-action="save-as">Save As...</div>
              <div data-action="close-tab">Close Editor</div>
            </div>
          </div>

          <div class="ide-menu" data-menu="edit">Edit
            <div class="ide-dropdown" id="ide-edit-menu">
              <div data-action="undo">Undo</div>
              <div data-action="redo">Redo</div>
              <div data-action="toggle-comment">Toggle Line Comment</div>
              <div data-action="find">Find</div>
              <div data-action="replace">Replace</div>
            </div>
          </div>

          <div class="ide-menu" data-menu="view">View
            <div class="ide-dropdown" id="ide-view-menu">
              <div data-action="toggle-wrap">Toggle Word Wrap</div>
              <div data-action="force-lang-menu">Force Language ></div>
            </div>

            <div class="ide-dropdown" id="ide-language-menu" style="left:180px; top:28px;">
              <div data-lang="javascript">JavaScript</div>
              <div data-lang="html">HTML</div>
              <div data-lang="css">CSS</div>
              <div data-lang="json">JSON</div>
            </div>
          </div>
        </div>

        <div class="ide-tabs" id="ide-tabs"></div>
        <div class="ide-editor" id="ide-editor"></div>
      </div>
    `;

    let editor;
    let files = {}; // name -> content
    let meta = {};  // name -> { path, ext }
    let currentFile = null;
    let forcedLanguage = null;

    const topbar = root.querySelector("#ide-topbar");
    const tabsEl = root.querySelector("#ide-tabs");
    const editorEl = root.querySelector("#ide-editor");
    const languageMenu = root.querySelector("#ide-language-menu");

    // ---------- Monaco loader ----------
    function loadMonaco(callback) {
      if (window.monaco && window.require) {
        callback();
        return;
      }
      if (!window.require) {
        const loader = document.createElement("script");
        loader.src = "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs/loader.min.js";
        loader.onload = () => {
          window.require.config({
            paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }
          });
          window.require(['vs/editor/editor.main'], callback);
        };
        document.body.appendChild(loader);
      } else {
        window.require.config({
          paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' }
        });
        window.require(['vs/editor/editor.main'], callback);
      }
    }

    // ---------- Language detection ----------
    function detectLanguage(text) {
      const score = { javascript: 0, html: 0, css: 0 };
      const jsTokens = ["const ", "let ", "var ", "function", "//", "=>", "import ", "export "];
      jsTokens.forEach(t => { if (text.includes(t)) score.javascript++; });
      const htmlTokens = ["<html", "<div", "<span", "<body", "<head", "<script", "<style", "<!DOCTYPE"];
      htmlTokens.forEach(t => { if (text.includes(t)) score.html++; });
      const cssTokens = ["{", "}", "color:", "background:", "font-size:", "display:"];
      cssTokens.forEach(t => { if (text.includes(t)) score.css++; });

      let best = "javascript";
      let max = score.javascript;
      if (score.html > max) { best = "html"; max = score.html; }
      if (score.css > max) { best = "css"; max = score.css; }
      return best;
    }

    // ---------- Tabs ----------
    function renderTabs() {
      tabsEl.innerHTML = "";
      Object.keys(files).forEach(name => {
        const tab = document.createElement("div");
        tab.className = "ide-tab" + (name === currentFile ? " active" : "");
        const close = document.createElement("span");
        close.className = "ide-close-btn";
        close.textContent = "×";
        close.addEventListener("click", (e) => {
          e.stopPropagation();
          closeTab(name);
        });
        tab.textContent = name + " ";
        tab.appendChild(close);
        tab.addEventListener("click", () => switchTab(name));
        tabsEl.appendChild(tab);
      });
    }

    function switchTab(name) {
      if (!files[name]) return;
      if (currentFile) files[currentFile] = editor.getValue();
      currentFile = name;
      const content = files[name];
      editor.setValue(content);
      if (forcedLanguage) {
        monaco.editor.setModelLanguage(editor.getModel(), forcedLanguage);
      } else {
        const lang = detectLanguage(content);
        monaco.editor.setModelLanguage(editor.getModel(), lang);
      }
      renderTabs();
    }

    function newFile() {
      let idx = Object.keys(files).length + 1;
      let name = "untitled" + idx;
      while (files[name]) {
        idx++;
        name = "untitled" + idx;
      }
      files[name] = "";
      meta[name] = { path: "C:/Documents/", ext: "txt" };
      currentFile = name;
      editor.setValue("");
      monaco.editor.setModelLanguage(editor.getModel(), forcedLanguage || "javascript");
      renderTabs();
    }

    function closeTab(name = currentFile) {
      if (!name) return;
      delete files[name];
      delete meta[name];
      const keys = Object.keys(files);
      currentFile = keys.length ? keys[0] : null;
      if (currentFile) editor.setValue(files[currentFile]);
      else editor.setValue("");
      renderTabs();
    }

    // ---------- Virtual FS actions ----------
    function saveFile() {
      if (!currentFile) return;
      files[currentFile] = editor.getValue();
      const m = meta[currentFile] || { path: "C:/Documents/", ext: "txt" };
      meta[currentFile] = m;
      FileSystem.writeFile(m.path, currentFile, m.ext, files[currentFile]);
      alert("Saved to " + m.path + currentFile + "." + m.ext);
    }

    function saveAs() {
      if (!currentFile) return;
      const defaultName = currentFile;
      const full = prompt("Save as (e.g. C:/Documents/myfile.js):", "C:/Documents/" + defaultName);
      if (!full) return;
      let path = full;
      let name = full;
      let ext = "txt";

      // crude parse: split path and name.ext
      const lastSlash = full.lastIndexOf("/");
      if (lastSlash !== -1) {
        path = full.slice(0, lastSlash + 1);
        name = full.slice(lastSlash + 1);
      }
      if (name.includes(".")) {
        const parts = name.split(".");
        ext = parts.pop();
        name = parts.join(".") || "untitled";
      }

      const content = editor.getValue();
      FileSystem.writeFile(path, name, ext, content);
      delete files[currentFile];
      delete meta[currentFile];
      currentFile = name;
      files[name] = content;
      meta[name] = { path, ext };
      renderTabs();
      alert("Saved as " + path + name + "." + ext);
    }

    function openFromVirtual() {
      const full = prompt("Open from (e.g. C:/Documents/myfile.js):", "C:/Documents/");
      if (!full) return;
      let path = full;
      let name = full;
      let ext = "txt";

      const lastSlash = full.lastIndexOf("/");
      if (lastSlash !== -1) {
        path = full.slice(0, lastSlash + 1);
        name = full.slice(lastSlash + 1);
      }
      if (name.includes(".")) {
        const parts = name.split(".");
        ext = parts.pop();
        name = parts.join(".") || "untitled";
      }

      const content = FileSystem.readFile(path, name, ext);
      if (content == null) {
        alert("File not found in virtual FS.");
        return;
      }
      files[name] = content;
      meta[name] = { path, ext };
      currentFile = name;
      editor.setValue(content);
      if (forcedLanguage) {
        monaco.editor.setModelLanguage(editor.getModel(), forcedLanguage);
      } else {
        const lang = detectLanguage(content);
        monaco.editor.setModelLanguage(editor.getModel(), lang);
      }
      renderTabs();
    }

    // ---------- Menu wiring ----------
    topbar.querySelectorAll(".ide-menu").forEach(menu => {
      menu.addEventListener("click", (e) => {
        const id = "ide-" + menu.dataset.menu + "-menu";
        const dropdown = root.querySelector("#" + id);
        root.querySelectorAll(".ide-dropdown").forEach(d => {
          if (d !== dropdown && d !== languageMenu) d.style.display = "none";
        });
        if (dropdown) {
          dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
        }
      });
    });

    root.addEventListener("click", (e) => {
      if (!e.target.closest(".ide-menu")) {
        root.querySelectorAll(".ide-dropdown").forEach(d => d.style.display = "none");
      }
    });

    // File menu actions
    root.querySelector("#ide-file-menu").addEventListener("click", (e) => {
      const action = e.target.dataset.action;
      if (!action) return;
      if (action === "new") newFile();
      if (action === "open-virtual") openFromVirtual();
      if (action === "save") saveFile();
      if (action === "save-as") saveAs();
      if (action === "close-tab") closeTab();
    });

    // Edit menu actions
    root.querySelector("#ide-edit-menu").addEventListener("click", (e) => {
      const action = e.target.dataset.action;
      if (!action || !editor) return;
      if (action === "undo") editor.trigger('', 'undo');
      if (action === "redo") editor.trigger('', 'redo');
      if (action === "toggle-comment") editor.trigger('', 'editor.action.commentLine');
      if (action === "find") editor.getAction('actions.find').run();
      if (action === "replace") editor.getAction('editor.action.startFindReplaceAction').run();
    });

    // View menu actions
    root.querySelector("#ide-view-menu").addEventListener("click", (e) => {
      const action = e.target.dataset.action;
      if (!action) return;
      if (action === "toggle-wrap" && editor) {
        const wrap = editor.getRawOptions().wordWrap === "on" ? "off" : "on";
        editor.updateOptions({ wordWrap: wrap });
      }
      if (action === "force-lang-menu") {
        e.stopPropagation();
        languageMenu.style.display = languageMenu.style.display === "block" ? "none" : "block";
      }
    });

    languageMenu.addEventListener("click", (e) => {
      const lang = e.target.dataset.lang;
      if (!lang || !editor) return;
      forcedLanguage = lang;
      monaco.editor.setModelLanguage(editor.getModel(), lang);
      languageMenu.style.display = "none";
    });

    // ---------- Init Monaco ----------
    loadMonaco(() => {
      editor = monaco.editor.create(editorEl, {
        value: "",
        language: "javascript",
        theme: "vs-dark",
        automaticLayout: true,
        minimap: { enabled: false }
      });
      newFile();
    });
  }
});

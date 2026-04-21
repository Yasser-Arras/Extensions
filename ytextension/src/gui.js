// gui.js
import { State } from "./state.js";
import { Icons, createIcon } from "./icons.js";

let root = null;
let toolbar = null;

// --------------------
// BUILD GUI (SAFE)
// --------------------
export function buildGUI() {
  if (State.get("guiBuilt"))   console.log("[GUI] already built "); return;


  State.set("guiBuilt", true);

  console.log("[GUI] build");

  createRoot();
  createToolbar();
  syncToolbar();
}

// --------------------
// ROOT FLOATING BUTTON
// --------------------
function createRoot() {
  root = document.createElement("div");

  Object.assign(root.style, {
    position: "fixed",
    top: "80px",
    left: "80px",
    zIndex: 999999,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    userSelect: "none"
  });

  const handle = document.createElement("div");
  handle.style.width = "28px";
  handle.style.height = "28px";
  handle.style.cursor = "grab";
  handle.style.display = "flex";
  handle.style.alignItems = "center";
  handle.style.justifyContent = "center";

  handle.appendChild(createIcon(Icons.drag, 28, 28));

  const btn = document.createElement("button");

  Object.assign(btn.style, {
    width: "40px",
    height: "40px",
    background: "#191919",
    border: "1px solid #555",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  });

  btn.appendChild(createIcon(Icons.cog, 20, 20));

  btn.onclick = () => {
    if (!toolbar) createToolbar();
    toolbar.style.display =
      toolbar.style.display === "flex" ? "none" : "flex";
  };

  // drag
  let ox = 0, oy = 0;

  handle.onmousedown = (e) => {
    ox = e.clientX - root.offsetLeft;
    oy = e.clientY - root.offsetTop;

    const move = (ev) => {
      root.style.left = ev.clientX - ox + "px";
      root.style.top = ev.clientY - oy + "px";
      syncToolbar();
    };

    const up = () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    };

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };

  root.appendChild(handle);
  root.appendChild(btn);
  document.body.appendChild(root);
}

// --------------------
// TOOLBAR
// --------------------
function createToolbar() {
  toolbar = document.createElement("div");

  Object.assign(toolbar.style, {
    position: "fixed",
    display: "none",
    gap: "6px",
    padding: "8px",
    background: "#2b2b2b",
    borderRadius: "12px",
    zIndex: 999999
  });

  document.body.appendChild(toolbar);
}

// --------------------
// SYNC POSITION
// --------------------
function syncToolbar() {
  if (!root || !toolbar) return;

  const r = root.getBoundingClientRect();

  toolbar.style.top = r.top + 70 + "px";
  toolbar.style.left = r.left + "px";
}

// --------------------
// ADD BUTTON (EXTERNAL API)
// --------------------
export function addButton(btn) {
  if (!toolbar) createToolbar();
  toolbar.appendChild(btn);
}

// --------------------
// UPDATE GUI (CALLED FROM OUTSIDE)
// --------------------
export function updateGUI() {
  if (!State.get("guiBuilt")) return;

  const mode = State.get("mode");

  if (mode === "none") {
    destroyGUI();
    return;
  }

  syncToolbar();
}
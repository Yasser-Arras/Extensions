import { Icons, createIcon } from "./icons.js";
import { State } from "./state.js";

let root = null;
let toolbar = null;
let built = false;

// --------------------
// BUILD GUI
// --------------------
export function buildGUI() {
  if (built) return;
  if (State.get("mode") === "none") return;

  built = true;

  console.log("[GUI] build");

  root = document.createElement("div");
  root.style.position = "fixed";
  root.style.top = "50px";
  root.style.left = "50px";
  root.style.zIndex = "999999";

  const btn = document.createElement("button");
  btn.style.width = "40px";
  btn.style.height = "40px";
  btn.style.background = "#191919";
  btn.style.border = "1px solid #555";
  btn.style.borderRadius = "10px";

  btn.appendChild(createIcon(Icons.cog, 20, 20));

  btn.onclick = () => {
    if (!toolbar) ensureToolbar();
    toolbar.style.display =
      toolbar.style.display === "none" ? "flex" : "none";
  };

  root.appendChild(btn);
  document.body.appendChild(root);
}

// --------------------
// TOOLBAR
// --------------------
function ensureToolbar() {
  toolbar = document.createElement("div");
  toolbar.style.position = "fixed";
  toolbar.style.top = "120px";
  toolbar.style.left = "50px";
  toolbar.style.display = "flex";
  toolbar.style.gap = "6px";
  toolbar.style.background = "#2b2b2b";
  toolbar.style.padding = "8px";
  toolbar.style.borderRadius = "10px";
  toolbar.style.zIndex = "999999";

  document.body.appendChild(toolbar);
}

// --------------------
// DESTROY
// --------------------
export function destroyGUI() {
  console.log("[GUI] destroy");

  built = false;

  if (root) root.remove();
  if (toolbar) toolbar.remove();

  root = null;
  toolbar = null;
}
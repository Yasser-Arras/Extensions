import { State } from "./state.js";
import { Controller } from "./controller.js";
import { Icons, createIcon } from "./icons.js";

let root, toolbar;
let offset = { x: 0, y: 0 };

function run(fn, ...args) {
  return Controller.run(fn, ...args);
}

// --------------------
// BUILD
// --------------------
export function buildGUI() {
  if (State.get("guiBuilt")) return;
  State.set("guiBuilt", true);

  createRoot();
  createToolbar();
}

// --------------------
// ROOT
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
    userSelect: "none"
  });

  const handle = document.createElement("div");
  Object.assign(handle.style, {
    width: "28px",
    height: "28px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "grab"
  });

  handle.appendChild(createIcon(Icons.drag, 24, 24));

  const mainBtn = document.createElement("button");

  Object.assign(mainBtn.style, {
    width: "40px",
    height: "40px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#191919",
    border: "1px solid #555",
    borderRadius: "10px"
  });

  mainBtn.appendChild(createIcon(Icons.cog, 20, 20));

  mainBtn.onclick = () => {
    toolbar.style.display =
      toolbar.style.display === "flex" ? "none" : "flex";
  };

  // DRAG FIXED
  handle.onmousedown = (e) => {
    offset.x = e.clientX - root.offsetLeft;
    offset.y = e.clientY - root.offsetTop;

    const move = (ev) => {
      root.style.left = ev.clientX - offset.x + "px";
      root.style.top = ev.clientY - offset.y + "px";
    
    };

    document.addEventListener("mousemove", move);
    document.onmouseup = () =>
      document.removeEventListener("mousemove", move);
  };

  root.appendChild(handle);
  root.appendChild(mainBtn);
  document.body.appendChild(root);
}

// --------------------
// TOOLBAR
// --------------------
function createToolbar() {
  toolbar = document.createElement("div");

  Object.assign(toolbar.style, {
    position: "absolute", 
    top: "70px",          
    left: "50%",
    transform: "translateX(-50%)",

    display: "none",
    gap: "6px",
    padding: "8px",
    background: "#2b2b2b",
    borderRadius: "12px",

    alignItems: "center",
    justifyContent: "center"
  });

  root.appendChild(toolbar); // 🔥 attach to root

  addButtons();
}
export function showGUI() {
  if (root) root.style.display = "flex";
}

export function hideGUI() {
  if (root) root.style.display = "none";
  if (toolbar) toolbar.style.display = "none";
}

// --------------------
// BUTTON FACTORY
// --------------------
function button({ icon, title, action, args, altArgs }) {
  const b = document.createElement("button");
  if (title) b.title = title;

  Object.assign(b.style, {
    width: "40px",
    height: "40px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#2e2e2e",
    border: "1px solid #555",
    borderRadius: "6px"
  });

  const img = createIcon(icon, 22, 22);
  img.style.objectFit = "contain";
  b.appendChild(img);

  // LEFT CLICK
  b.onclick = () => {
    if (args) run(action, ...args);
    else run(action);
  };

  // RIGHT CLICK (secondary action)
  b.oncontextmenu = (e) => {
    e.preventDefault(); // stop browser menu

    if (altArgs) run(action, ...altArgs);
    else run(action);
  };

  return b;
}

// --------------------
// CYCLE BUTTON FIXED
// --------------------
function cycle(icon, values, initial) {
  let i = initial || 0;

  const b = document.createElement("button");

  Object.assign(b.style, {
    width: "40px",
    height: "40px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#2e2e2e",
    border: "1px solid #555",
    borderRadius: "6px",
    position: "relative"
  });

  // ICON (same as others)
  const img = createIcon(icon, 22, 22);
  b.appendChild(img);

  // LABEL STICKER (NO LAYOUT IMPACT)
  const label = document.createElement("div");

  Object.assign(label.style, {
    position: "absolute",
    top: "-14px",
    left: "50%",
    transform: "translateX(-50%)",
    fontSize: "10px",
    color: "white",
    pointerEvents: "none",
    whiteSpace: "nowrap"
  });

  function update() {
    label.textContent = values[i] + "x";
    run("setSpeed", values[i]);
  }

  update();

  b.onclick = () => {
    i = (i + 1) % values.length;
    update();
  };

  b.addEventListener("wheel", (e) => {
    e.preventDefault();

    i =
      e.deltaY < 0
        ? (i + 1) % values.length
        : (i - 1 + values.length) % values.length;

    update();
  });

  b.appendChild(label);

  return b;
}
// --------------------
// BUTTONS ORDER
// --------------------
function addButtons() {
  toolbar.appendChild(button({
    icon: Icons.prevFrame,
    title: "Previous Frame",
    action: "step",
    args: [-0.025]
  }));

  toolbar.appendChild(button({
    icon: Icons.nextFrame,
    title: "Next Frame",
    action: "step",
    args: [0.025]
  }));

  toolbar.appendChild(cycle(Icons.speed, [0.5, 1, 1.5, 2, 3], 1));

  toolbar.appendChild(button({
    icon: Icons.openas,
    title: "Open as watch video",
    action: "openAsWatch",
  }));

  toolbar.appendChild(button({
    icon: Icons.screenshot,
    title: "Take Screenshot",
    action: "screenshot"
  }));

 toolbar.appendChild(button({
  icon: Icons.download,
  title: "Download MP4 / MP3 (right-click)",
  action: "download",
  args: ["mp4"],      
  altArgs: ["mp3"]    
}));
}
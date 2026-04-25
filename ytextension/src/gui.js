//gui.js
import { State } from "./state.js";
import { Controller } from "./controller.js";
import { Icons, createIcon } from "./icons.js";

let root, toolbar;

// --------------------
// HELPERS
// --------------------
function run(fn, ...args) {
  return Controller.run(fn, ...args);
}

function savePos(x, y) {
  localStorage.setItem("toolbox_pos", JSON.stringify({ x, y }));
}

function loadPos() {
  try {
    return JSON.parse(localStorage.getItem("toolbox_pos"));
  } catch {
    return null;
  }
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
// ROOT (DRAGGABLE)
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

  // --------------------
  // DRAG (POINTER CLEAN)
  // --------------------
  let offset = { x: 0, y: 0 };
  let dragging = false;

  handle.onpointerdown = (e) => {
    dragging = true;

    offset.x = e.clientX - root.offsetLeft;
    offset.y = e.clientY - root.offsetTop;

    handle.setPointerCapture(e.pointerId);
  };

  handle.onpointermove = (e) => {
    if (!dragging) return;

    root.style.left = e.clientX - offset.x + "px";
    root.style.top = e.clientY - offset.y + "px";
  };

  handle.onpointerup = (e) => {
    dragging = false;
    handle.releasePointerCapture(e.pointerId);

    savePos(root.offsetLeft, root.offsetTop);
  };

  root.appendChild(handle);
  root.appendChild(mainBtn);
  document.body.appendChild(root);

  // restore position
  const saved = loadPos();
  if (saved) {
    root.style.left = saved.x + "px";
    root.style.top = saved.y + "px";
  }
}

// --------------------
// TOOLBAR (INSIDE ROOT)
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

  root.appendChild(toolbar);

  addButtons();
}

// --------------------
// SHOW / HIDE
// --------------------
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
    e.preventDefault();

    if (altArgs) run(action, ...altArgs);
    else run(action);
  };

  return b;
}

// --------------------
// CYCLE (GENERIC)
// --------------------
function cycle({
  icon,
  values = [],
  initial = 0,
  labelFormat = (v) => v,
  action
}) {
  let i = initial;

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

  const img = createIcon(icon, 22, 22);
  b.appendChild(img);

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

  function apply() {
    const value = values[i];

    label.textContent = labelFormat(value);

    if (action) run(action, value);
  }

  // initial display
  label.textContent = labelFormat(values[i]);

  b.onclick = () => {
    i = (i + 1) % values.length;
    apply();
  };

  b.addEventListener("wheel", (e) => {
    e.preventDefault();

    i =
      e.deltaY < 0
        ? (i + 1) % values.length
        : (i - 1 + values.length) % values.length;

    apply();
  });

  b.appendChild(label);

  return b;
}
function toggle({
  icon,
  title,
  action,
  initial = false,
}) {
  let on = initial;

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

  const img = createIcon(icon, 22, 22);
  b.appendChild(img);

 
  const bar = document.createElement("div");

  Object.assign(bar.style, {
    position: "absolute",
    bottom: "3px",
    left: "6px",
    right: "6px",
    height: "3px",
    borderRadius: "999px",
    background: "#ffffff",
    opacity: on ? "1" : "0",
    transition: "0.15s"
  });

  b.appendChild(bar);

  b.title = title;

  b.onclick = () => {
    on = !on;

    bar.style.opacity = on ? "1" : "0";

    run(action, on);
  };

  return b;
}
// --------------------
// BUTTONS
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

  toolbar.appendChild(cycle({
    icon: Icons.speed,
    values: [0.5, 1, 1.2, 1.5, 2, 3],
    initial: 1,
    labelFormat: (v) => v + "x",
    action: "setSpeed"
  }));
toolbar.appendChild(toggle({
  icon: Icons.boost,
  title: "Volume Boost",
  action: "volumeBoost"
}));
  toolbar.appendChild(button({
    icon: Icons.openas,
    title: "Open as watch video",
    action: "openAsWatch"
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
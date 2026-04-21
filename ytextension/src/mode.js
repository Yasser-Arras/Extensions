// mode.js

import { State } from "./state.js";
import { Controller } from "./controller.js";
import { showGUI, hideGUI } from "./gui.js";
let mode = "none";
let url = location.href;

let waits = [];
let attaching = false;

// ------------------------
// MODE DETECTION
// ------------------------
function detectMode() {
  const p = location.pathname;

  if (p.startsWith("/shorts/")) return "shorts";
  if (p.startsWith("/watch")) return "watch";

  return "none";
}

// ------------------------
// WAIT (NON-BLOCKING)
// ------------------------
function waitUntil(check, done) {
  let tries = 0;

  const id = setInterval(() => {
    if (!State.get("active")) {
      clearInterval(id);
      return;
    }

    const res = check();

    if (res) {
      clearInterval(id);
      done(res);
      return;
    }

    if (++tries > 10) {
      clearInterval(id);
    }

  }, 1000);

  waits.push(id);
}

// ------------------------
// START
// ------------------------
export function startModeSystem() {
  mode = detectMode();
  url = location.href;

  console.log("[MODE] start:", mode);

  observeUrl();
  handleRoute();
}

// ------------------------
// URL OBSERVER
// ------------------------
function observeUrl() {
  new MutationObserver(() => {
    if (location.href !== url) {
      url = location.href;
      handleRoute();
    }
  }).observe(document, { subtree: true, childList: true });
}

// ------------------------
// ROUTE
// ------------------------
function handleRoute() {
  const newMode = detectMode();

  if (newMode === mode) {
    refresh();
  } else {
    enter(newMode);
  }
}

// ------------------------
// ENTER MODE
// ------------------------
function enter(newMode) {
  console.log("[MODE] switch:", mode, "->", newMode);

  cleanup();

  mode = newMode;

  State.resetMode(newMode);
  State.set("mode", newMode);

  if (newMode === "none") {
    hideGUI();
    return;
  }

  State.set("active", true);

  attachVideo();
  showGUI();
}

// ------------------------
// REFRESH SAME MODE
// ------------------------
function refresh() {
  if (mode === "none") return;

  State.set("active", true);
  attachVideo();
}

// ------------------------
// VIDEO FLOW
// ------------------------ç

function getVideo() {
  const vids = document.querySelectorAll("video");

  for (const v of vids) {
    if (v.readyState >= 2 && v.offsetParent !== null) {
      return v; // visible + usable
    }
  }

  return vids[0] || null;
}
function attachVideo() {
  if (attaching) return;
  attaching = true;

  waitUntil(() => getVideo(), (video) => {
    attaching = false;

    if (!video) return;
    if (State.get("video") === video) return;

    State.set("video", video);
    Controller.bind(video);

    waitUntil(() => video.readyState >= 2, () => {
      Controller.applyAll();
    });
  });
}
// ------------------------
// CLEANUP
// ------------------------
function cleanup() {
  console.log("[MODE] cleanup");

  State.set("active", false);
  State.set("video", null);

  waits.forEach(clearInterval);
  waits = [];
   attaching = false; 
}
import { State } from "./state.js";
import { Controller } from "./controller.js";
import { showGUI, hideGUI } from "./gui.js";

let mode = "none";
let url = location.href;

let waits = [];
let attaching = false;

// ------------------------
// MODE
// ------------------------
function detectMode() {
  const p = location.pathname;

  if (p.startsWith("/shorts/")) return "shorts";
  if (p.startsWith("/watch")) return "watch";

  return "none";
}

// ------------------------
// SIMPLE STATE HELPERS
// ------------------------
const isActive = () => State.get("active");

// ------------------------
// WAIT
// ------------------------
function waitForVideo(done) {
  const tick = () => {
    if (!State.get("active")) return;

    const v = getVideo();
    if (v) return done(v);

    requestAnimationFrame(tick);
  };

  tick();
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

  if (newMode === mode) refresh();
  else enter(newMode);
}

// ------------------------
// ENTER
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
// REFRESH
// ------------------------
function refresh() {
  if (mode === "none") return;

  State.set("active", true);
  attachVideo();
}

// ------------------------
// VIDEO DETECTION
// ------------------------
function getVideo() {
  const vids = document.querySelectorAll("video");

  for (const v of vids) {
    if (v.readyState >= 2) return v;
  }

  return vids[0] || null;
}

// ------------------------
// APPLY SPEED (single source of truth)
// ------------------------
function applySpeed(video) {
  const speed = State.get("speed");

  if (!video || !isFinite(speed)) return;

  console.log("[VIDEO] applying speed:", speed);

  video.playbackRate = speed;
}

// ------------------------
// ATTACH VIDEO (clean)
// ------------------------
function attachVideo() {
  if (attaching) return;
  attaching = true;

  waitForVideo((video) => {
    attaching = false;

    if (!video) return;

    const prev = State.get("video");
    const changed = prev !== video;

    State.set("video", video);
    Controller.bind(video);

    if (changed) {
      console.log("[VIDEO] changed → reapplying speed");
    }

    // apply immediately (no delay chain)
    const speed = State.get("speed");

    if (isFinite(speed)) {
      video.playbackRate = speed;
      console.log("[VIDEO] speed applied:", speed);
    }
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
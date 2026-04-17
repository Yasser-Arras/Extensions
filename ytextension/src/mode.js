// mode.js

import { State } from "./state.js";
import { Controller } from "./controller.js";

let currentMode = "none";
let lastUrl = location.href;

// ------------------------
// MODE DETECTION
// ------------------------
function getMode() {
  const p = location.pathname;

  if (p.startsWith("/shorts/")) return "shorts";
  if (p.startsWith("/watch")) return "watch";

  return "none";
}

// ------------------------
// BLOCKING WAIT FUNCTION (SYNC STYLE)
// ------------------------
function waitFor(checkFn, interval = 1000, timeout = 10000) {
  let elapsed = 0;

  while (elapsed < timeout) {

     if (!State.get("active")) return null;

    const result = checkFn();
    if (result) return result;

    const start = Date.now();
    while (Date.now() - start < interval) {
      if (!active) return null;
    }

    elapsed += interval;
  }

  return null;
}

// ------------------------
// START SYSTEM
// ------------------------
export function startModeSystem() {
  currentMode = getMode();
  lastUrl = location.href;

  console.log("[MODE] start:", currentMode);

  observe();
  route();
}

// ------------------------
// URL OBSERVER
// ------------------------
function observe() {
  const obs = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      route();
    }
  });

  obs.observe(document, { subtree: true, childList: true });
}

// ------------------------
// ROUTE HANDLER
// ------------------------
function route() {
  const newMode = getMode();

  if (newMode === currentMode) {
    refresh();
    return;
  }

  switchMode(newMode);
}

// ------------------------
// SWITCH MODE
// ------------------------
function switchMode(newMode) {
  console.log("[MODE] switch:", currentMode, "->", newMode);

  cleanup();

  currentMode = newMode;

  State.resetMode(newMode);
  State.set("mode", newMode);

  if (newMode === "none") return;

  State.set("active", true);

  const video = waitFor(() => document.querySelector("video"));

  if (!video) return;

  State.set("video", video);

  Controller.bind(video);

  waitFor(() => video.readyState >= 2);

  Controller.applyAll();
}
// ------------------------
// SAME MODE REFRESH
// ------------------------
function refresh() {
  if (currentMode === "none") return;

  const video = waitFor(() => document.querySelector("video"));

  if (!video) return;

  State.set("video", video);
  State.set("active", true);

  Controller.bind(video);

  waitFor(() => video.readyState >= 2);

  Controller.applyAll();
}

// ------------------------
// CLEANUP
// ------------------------
function cleanup() {
  console.log("[MODE] cleanup");

  State.set("active", false);
  State.set("video", null);

  currentMode = "none";
}
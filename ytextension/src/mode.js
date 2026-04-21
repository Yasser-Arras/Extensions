// mode.js

import { State } from "./state.js";
import { Controller } from "./controller.js";

let mode = "none";
let url = location.href;

// ------------------------
// DETECT MODE
// ------------------------
function detectMode() {
  const p = location.pathname;

  if (p.startsWith("/shorts/")) return "shorts";
  if (p.startsWith("/watch")) return "watch";

  return "none";
}

// ------------------------
// BLOCKING WAIT
// ------------------------
function waitUntil(check, onDone) {
  let tries = 0;

  const interval = setInterval(() => {
    if (!State.get("active")) {
      clearInterval(interval);
      console.log("[WAIT] cancelled");
      return;
    }

    const result = check();

    if (result) {
      clearInterval(interval);
      console.log("[WAIT] success");
      onDone(result);
      return;
    }

    tries++;
    if (tries > 10) {
      clearInterval(interval);
      console.log("[WAIT] timeout");
    }

  }, 1000);
}
// ------------------------
// START
// ------------------------
export function startModeSystem() {
  mode = detectMode();
  url = location.href;

  console.log("[MODE] start:", mode);

  watchUrl();
  handleRoute();
}

// ------------------------
// WATCH URL (SPA)
// ------------------------
function watchUrl() {
  new MutationObserver(() => {
    if (location.href !== url) {
      url = location.href;
      handleRoute();
    }
  }).observe(document, { subtree: true, childList: true });
}

// ------------------------
// ROUTE LOGIC
// ------------------------
function handleRoute() {
  const newMode = detectMode();

  if (newMode === mode) {
    refreshVideo();
  } else {
    enterMode(newMode);
  }
}

// ------------------------
// ENTER MODE
// ------------------------
function enterMode(newMode) {
  console.log("[MODE] switch:", mode, "->", newMode);

  stop(); // cleanup old

  mode = newMode;

  State.resetMode(newMode);
  State.set("mode", newMode);

  if (newMode === "none") return;

  State.set("active", true);

  attachVideo();
}

// ------------------------
// REFRESH (same mode)
// ------------------------
function refreshVideo() {
  if (mode === "none") return;

  attachVideo();
}

// ------------------------
// VIDEO FLOW
// ------------------------
function attachVideo() {
  waitUntil(() => document.querySelector("video"), (video) => {
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
function stop() {
  console.log("[MODE] cleanup");

  State.set("active", false);
  State.set("video", null);
}
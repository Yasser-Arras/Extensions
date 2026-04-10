import { GUI } from "./gui.js";
import { Video } from "./video.js";
import { State } from "./state.js";
import { Icons } from "./icons.js";

let started = false;
let currentMode = null;
let currentPath = location.pathname + location.search;
let tweakStyleEl = null;
let initTimer = null;
let initAttempt = 0;
const INIT_ATTEMPT_LIMIT = 12;
const INIT_ATTEMPT_DELAY_MS = 250;

function getMode() {
  if (location.pathname.startsWith("/shorts/")) return "shorts";
  if (location.pathname === "/watch") return "video";
  return null;
}

function hasVideoElement() {
  return !!document.querySelector("video");
}

function clearPendingInit() {
  if (!initTimer) return;
  clearTimeout(initTimer);
  initTimer = null;
}

function buildToolbox() {
    Video.init();
    GUI.init({
      tweaks: [
        { key: "autoPlayNext", label: "Auto-play next video", scope: "global" },
        { key: "moveShortsAds", label: "Move Shorts ads from main screen", scope: "shorts" },
        { key: "hideShortsMetadata", label: "Hide Shorts metadata unless hovered", scope: "shorts" },
        { key: "hideEndCards", label: "Hide end cards unless hovered", scope: "video" }
      ],
      onTweakToggle: () => applyTweaksForPage()
    });

  GUI.addButton(GUI.makeCycle({
    label: "Speed",
    icon: Icons.speed,
    options: [
        { value: 0.2 },
        { value: 0.5 },
        { value: 1 },
        { value: 1.2 },
        { value: 1.5 },
        { value: 2 }
    ],
    defaultIndex: [0.2, 0.5, 1, 1.2, 1.5, 2].indexOf(State.get("speed") ?? 1),
    onChange: (v) => Video.setSpeed(v)
}));

  GUI.addButton(GUI.makeCycle({
    label: "Volume Boost",
    icon: Icons.boost,
    options: [
        { value: 1 },
        { value: 1.5 },
        { value: 2 }
    ],
    defaultIndex: State.get("volumeLevel") ?? 0,
    onChange: (v) => Video.cycleVolume()
  }));

  GUI.addButton(GUI.makeButton({
    label: "Previous Frame",
    icon: Icons.prevFrame,
    onClick: () => Video.prevFrame()
  }));

  GUI.addButton(GUI.makeButton({
    label: "Next Frame",
    icon: Icons.nextFrame,
    onClick: () => Video.nextFrame()
  }));

  GUI.addButton(GUI.makeButton({
    label: "Screenshot",
    icon: Icons.screenshot,
    onClick: () => Video.screenshot()
  }));

  GUI.addButton(GUI.makeButton({
    label: "Open as Video",
    icon: Icons.openas,
    onClick: () => Video.openAsVideo()
  }));

  GUI.addButton(GUI.makeButton({
    label: "Download",
    icon: Icons.download,
    onClick: () => Video.downloadExternal()
  }));
}

function ensureStyleElement() {
  if (tweakStyleEl) return tweakStyleEl;
  tweakStyleEl = document.createElement("style");
  tweakStyleEl.id = "yt-toolbox-tweaks-style";
  document.documentElement.appendChild(tweakStyleEl);
  return tweakStyleEl;
}

function applyTweaksForPage() {
  const mode = getMode();
  const tweaks = State.getTweaks();
  const styleEl = ensureStyleElement();
  let css = "";

  if (mode === "shorts" && tweaks.hideShortsMetadata) {
    css += `
      #metadata-container.style-scope.ytd-reel-player-overlay-renderer {
        opacity: 0 !important;
        transition: opacity 0.2s ease;
      }
      ytd-reel-player-overlay-renderer:hover #metadata-container.style-scope.ytd-reel-player-overlay-renderer {
        opacity: 1 !important;
      }
    `;
  }

  if (mode === "video" && tweaks.hideEndCards) {
    css += `
      .ytp-fullscreen-grid-main-content {
        opacity: 0 !important;
        transition: opacity 0.2s ease;
      }
      .ytp-fullscreen-grid-main-content:hover {
        opacity: 1 !important;
      }
    `;
  }

  if (mode === "shorts" && tweaks.moveShortsAds) {
    css += `
      ytd-reel-video-renderer ytd-ad-slot-renderer,
      ytd-reel-video-renderer ytm-promoted-sparkles-web-renderer,
      ytd-reel-video-renderer .ytp-ad-module {
        position: fixed !important;
        right: 12px !important;
        bottom: 12px !important;
        max-width: 240px !important;
        transform: scale(0.85) !important;
        transform-origin: bottom right !important;
        z-index: 999990 !important;
        opacity: 0.9 !important;
      }
    `;
  }

  styleEl.textContent = css;
}

function runStart(mode) {
  if (!started) {
    buildToolbox();
    started = true;
  } else {
    Video.init();
  }
  applyTweaksForPage();
}

function startForMode(mode, forceRetry = false) {
  if (!mode) return;
  clearPendingInit();
  if (!forceRetry && hasVideoElement()) {
    initAttempt = 0;
    runStart(mode);
    return;
  }

  initAttempt = 0;
  const tryInit = () => {
    const modeNow = getMode();
    if (!modeNow) return;

    if (hasVideoElement() || initAttempt >= INIT_ATTEMPT_LIMIT) {
      runStart(modeNow);
      return;
    }

    initAttempt += 1;
    initTimer = setTimeout(tryInit, INIT_ATTEMPT_DELAY_MS);
  };

  initTimer = setTimeout(tryInit, INIT_ATTEMPT_DELAY_MS);
}

function stopToolbox() {
  clearPendingInit();
  GUI.destroy();
  started = false;
  currentMode = null;
  if (tweakStyleEl) tweakStyleEl.textContent = "";
}

const observer = new MutationObserver(() => {
    const mode = getMode();
    const newPath = location.pathname + location.search;
    const routeChanged = newPath !== currentPath;
    const modeChanged = mode !== currentMode;

    if (!mode) {
      if (started) stopToolbox();
      currentPath = newPath;
      return;
    }

    if (!started || modeChanged) {
      if (started) stopToolbox();
      startForMode(mode, true);
    } else if (routeChanged) {
      startForMode(mode, true);
    } else {
      applyTweaksForPage();
    }

    currentMode = mode;
    currentPath = newPath;
});

observer.observe(document.documentElement, { childList: true, subtree: true });

const initialMode = getMode();
if (initialMode) {
  currentMode = initialMode;
  startForMode(initialMode, true);
}
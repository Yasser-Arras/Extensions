import { State } from "./state.js";
import { AppMode } from "./app-mode.js";

const STYLE_ID = "yt-toolbox-tweaks-style";

function ensureStyleEl() {
  let el = document.getElementById(STYLE_ID);
  if (!el) {
    el = document.createElement("style");
    el.id = STYLE_ID;
    document.documentElement.appendChild(el);
  }
  return el;
}

export function applyPageTweaks(mode) {
  const tweaks = State.getTweaks();
  const styleEl = ensureStyleEl();
  let css = "";

  if (mode === AppMode.SHORTS && tweaks.hideShortsMetadata) {
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

  if (mode === AppMode.WATCH && tweaks.hideEndCards) {
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

  if (mode === AppMode.SHORTS && tweaks.moveShortsAds) {
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

export function clearPageTweaks() {
  const el = document.getElementById(STYLE_ID);
  if (el) el.textContent = "";
}

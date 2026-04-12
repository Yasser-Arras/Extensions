import { AppMode, detectAppMode } from "./app-mode.js";
import { subscribeNavigation } from "./navigation.js";
import { debounce } from "./utils.js";
import { applyPageTweaks, clearPageTweaks } from "./tweaks.js";
import { createVideoController } from "./video-controller.js";
import { GUI } from "./gui.js";
import { Icons } from "./icons.js";
import { State } from "./state.js";

const NAV_DEBOUNCE_MS = 64;

const video = createVideoController({ getAppMode: detectAppMode });

/** Mode we have fully activated (after cleanup + init). Not the same as "URL says" during transitions. */
let activeMode = AppMode.NEITHER;

function cleanupActiveSurface() {
  video.dispose();
  GUI.destroy();
  clearPageTweaks();
}

function buildToolboxUi() {
  GUI.init({
    tweaks: [
      { key: "autoPlayNext", label: "Auto-play next video", scope: "global" },
      { key: "moveShortsAds", label: "Move Shorts ads from main screen", scope: "shorts" },
      { key: "hideShortsMetadata", label: "Hide Shorts metadata unless hovered", scope: "shorts" },
      { key: "hideEndCards", label: "Hide end cards unless hovered", scope: "video" }
    ],
    onTweakToggle: () => {
      const mode = detectAppMode();
      if (mode !== AppMode.NEITHER) applyPageTweaks(mode);
    }
  });

  const speedOptions = [0.2, 0.5, 1, 1.2, 1.5, 2];
  GUI.addButton(
    GUI.makeCycle({
      label: "Speed",
      icon: Icons.speed,
      options: speedOptions.map((value) => ({ value })),
      defaultIndex: Math.max(0, speedOptions.indexOf(State.get("speed") ?? 1)),
      onChange: (v) => video.setSpeed(v)
    })
  );

  const boostSteps = [1, 1.5, 2];
  GUI.addButton(
    GUI.makeCycle({
      label: "Volume Boost",
      icon: Icons.boost,
      options: boostSteps.map((value) => ({ value })),
      defaultIndex: State.get("volumeLevel") ?? 0,
      onChange: (v) => {
        const idx = boostSteps.indexOf(v);
        video.setVolumeBoostIndex(idx >= 0 ? idx : 0);
      }
    })
  );

  GUI.addButton(
    GUI.makeButton({
      label: "Previous Frame",
      icon: Icons.prevFrame,
      onClick: () => video.prevFrame()
    })
  );

  GUI.addButton(
    GUI.makeButton({
      label: "Next Frame",
      icon: Icons.nextFrame,
      onClick: () => video.nextFrame()
    })
  );

  GUI.addButton(
    GUI.makeButton({
      label: "Screenshot",
      icon: Icons.screenshot,
      onClick: () => video.screenshot()
    })
  );

  GUI.addButton(
    GUI.makeButton({
      label: "Open as Video",
      icon: Icons.openas,
      onClick: () => video.openAsVideo()
    })
  );

  GUI.addButton(
    GUI.makeButton({
      label: "Download",
      icon: Icons.download,
      onClick: () => video.downloadExternal()
    })
  );
}

function initiateShorts() {
  buildToolboxUi();
  applyPageTweaks(AppMode.SHORTS);
  video.syncToVideoElement();
}

function initiateWatch() {
  buildToolboxUi();
  applyPageTweaks(AppMode.WATCH);
  video.syncToVideoElement();
}

function initiateNeither() {
  /* cleanup already ran; nothing to mount */
}

function onRouteResolved() {
  const next = detectAppMode();

  if (next === activeMode) {
    if (next !== AppMode.NEITHER) {
      video.syncToVideoElement();
      applyPageTweaks(next);
    }
    return;
  }

  cleanupActiveSurface();
  activeMode = next;

  if (next === AppMode.SHORTS) initiateShorts();
  else if (next === AppMode.WATCH) initiateWatch();
  else initiateNeither();
}

export function boot() {
  const debounced = debounce(onRouteResolved, NAV_DEBOUNCE_MS);
  subscribeNavigation(debounced);
  onRouteResolved();
}

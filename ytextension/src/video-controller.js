import { State } from "./state.js";
import { AppMode } from "./app-mode.js";

const VOLUME_LEVELS = [1, 1.5, 2];

function createAudioGraph(videoEl) {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new Ctx();
  const gainNode = audioCtx.createGain();
  gainNode.connect(audioCtx.destination);
  const sourceNode = audioCtx.createMediaElementSource(videoEl);
  sourceNode.connect(gainNode);
  return { audioCtx, gainNode, sourceNode };
}

function disposeAudioGraph(graph) {
  if (!graph) return;
  try {
    graph.sourceNode.disconnect();
  } catch (_) { /* ignore */ }
  try {
    graph.gainNode.disconnect();
  } catch (_) { /* ignore */ }
  if (graph.audioCtx && graph.audioCtx.state !== "closed") {
    graph.audioCtx.close().catch(() => {});
  }
}

export function createVideoController({ getAppMode }) {
  let boundVideo = null;
  let abort = null;
  let audioGraph = null;
  let volumeLevelIndex = 0;
  let attachTimer = null;
  let attachAttempts = 0;
  const ATTEMPT_LIMIT = 16;
  const ATTEMPT_DELAY_MS = 200;

  function clearAttachRetry() {
    if (attachTimer) {
      clearTimeout(attachTimer);
      attachTimer = null;
    }
    attachAttempts = 0;
  }

  function ensureBoostGraph() {
    if (!boundVideo || audioGraph) return;
    audioGraph = createAudioGraph(boundVideo);
    audioGraph.gainNode.gain.value = VOLUME_LEVELS[volumeLevelIndex];
  }

  function goToNextVideo() {
    const mode = getAppMode();
    if (mode === AppMode.SHORTS) {
      const nextShortsButton = document.querySelector(
        "#navigation-button-down button, button[aria-label*='Next'], button[title*='Next']"
      );
      if (nextShortsButton) {
        nextShortsButton.click();
        return;
      }
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
      return;
    }
    if (mode === AppMode.WATCH) {
      const nextButton = document.querySelector(".ytp-next-button");
      if (nextButton) nextButton.click();
    }
  }

  function bindVideo(el) {
    abort = new AbortController();
    const signal = abort.signal;

    el.playbackRate = State.get("speed") || 1;
    volumeLevelIndex = State.get("volumeLevel") || 0;

    el.addEventListener(
      "ended",
      () => {
        const tweaks = State.getTweaks();
        if (!tweaks.autoPlayNext) return;
        goToNextVideo();
      },
      { signal }
    );

    if (volumeLevelIndex > 0) ensureBoostGraph();
  }

  function unbindVideo() {
    clearAttachRetry();
    if (abort) {
      abort.abort();
      abort = null;
    }
    disposeAudioGraph(audioGraph);
    audioGraph = null;
    boundVideo = null;
  }

  function scheduleAttachRetry() {
    if (attachTimer || attachAttempts >= ATTEMPT_LIMIT) return;
    attachAttempts += 1;
    attachTimer = setTimeout(() => {
      attachTimer = null;
      syncToVideoElement();
    }, ATTEMPT_DELAY_MS);
  }

  function syncToVideoElement() {
    const mode = getAppMode();
    if (mode === AppMode.NEITHER) return;

    const el = document.querySelector("video");
    if (!el) {
      scheduleAttachRetry();
      return;
    }

    clearAttachRetry();

    if (el === boundVideo && abort) return;

    unbindVideo();
    boundVideo = el;
    bindVideo(el);
  }

  function dispose() {
    unbindVideo();
  }

  function setSpeed(speed) {
    State.set("speed", speed);
    if (boundVideo) boundVideo.playbackRate = speed;
  }

  function nextFrame() {
    if (!boundVideo) return;
    boundVideo.pause();
    boundVideo.currentTime += 0.025 / boundVideo.playbackRate;
  }

  function prevFrame() {
    if (!boundVideo) return;
    boundVideo.pause();
    boundVideo.currentTime -= 0.025 / boundVideo.playbackRate;
  }

  function screenshot() {
    if (!boundVideo) return;
    const canvas = document.createElement("canvas");
    canvas.width = boundVideo.videoWidth;
    canvas.height = boundVideo.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(boundVideo, 0, 0);
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `screenshot_${Date.now()}.png`;
    link.click();
  }

  function setVolumeBoostIndex(index) {
    volumeLevelIndex = Math.max(0, Math.min(VOLUME_LEVELS.length - 1, index));
    State.set("volumeLevel", volumeLevelIndex);
    if (!boundVideo) return VOLUME_LEVELS[volumeLevelIndex];
    if (volumeLevelIndex === 0) {
      disposeAudioGraph(audioGraph);
      audioGraph = null;
    } else {
      ensureBoostGraph();
      audioGraph.gainNode.gain.value = VOLUME_LEVELS[volumeLevelIndex];
    }
    return VOLUME_LEVELS[volumeLevelIndex];
  }

  function openAsVideo() {
    const id = getVideoId();
    if (id) window.open(`https://www.youtube.com/watch?v=${id}`);
  }

  function downloadExternal() {
    const id = getVideoId();
    if (id) window.open(`https://ytmp3.nu/#${id}/mp3`);
  }

  function getVideoId() {
    const shortsMatch = location.pathname.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
    if (shortsMatch) return shortsMatch[1];
    return new URL(location.href).searchParams.get("v");
  }

  return {
    dispose,
    syncToVideoElement,
    setSpeed,
    setVolumeBoostIndex,
    nextFrame,
    prevFrame,
    screenshot,
    openAsVideo,
    downloadExternal,
    getVolumeLevelIndex: () => volumeLevelIndex
  };
}

// controller.js

import { State } from "./state.js";

export const Controller = {
  bind(video) {
    State.set("video", video);
  },

  applyAll() {
    const v = State.get("video");
    if (!v) return;

    v.playbackRate = State.get("speed") || 1;
  },

  setSpeed(value) {
    State.set("speed", value);

    const v = State.get("video");
    if (v) v.playbackRate = value;
  },

  setVolumeBoost(value) {
    State.set("volumeBoost", value);

    const v = State.get("video");
    if (!v) return;

    v.volume = Math.min(1, 0.5 + value);
  }
};
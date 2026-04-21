// state.js

export const State = {
  data: {
    mode: "none",
    video: null,
    active: false,
    guiBuilt: false,
    lastUrl: location.href,

    speed: 1,
    volumeBoost: 0
  },

  set(key, value) {
    this.data[key] = value;
  },

  get(key) {
    return this.data[key];
  },

  resetMode(mode) {
    this.data.mode = mode;
    this.data.video = null;
    this.data.active = false;
  
  }
};
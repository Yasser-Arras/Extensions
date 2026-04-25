//controller.js
import { State } from "./state.js";
function getVideoId(url = location.href) {
  return url.split("v=")[1]?.split("&")[0]
    || url.split("/shorts/")[1]?.split("?")[0]
    || null;
}
function video() {
  return State.get("video");
}

function safeVideo() {
  const v = video();
  if (!v || !isFinite(v.currentTime)) return null;
  return v;
}

export const Controller = {
  run(name, ...args) {
    const v = safeVideo();
    if (!v) return;

    const fn = Controller[name];
    if (!fn) return;

    return fn(v, ...args);
  },

  bind(v) {
    State.set("video", v);

    const speed = State.get("speed");

    if (v && isFinite(speed)) {
      v.playbackRate = speed;
    }

    v.addEventListener("ratechange", () => {
      const s = State.get("speed");
      if (v && isFinite(s)) {
        v.playbackRate = s;
      }
    });
  },

  applyAll() {
    const v = State.get("video");
    const speed = State.get("speed");

    if (!v || !isFinite(speed)) return;

    v.playbackRate = speed;
  },
  setSpeed(v, value) {
    if (!isFinite(value)) return;

    State.set("speed", value);
    v.playbackRate = value;
  },
  volumeBoost(v) {
    if (!v) return;

    if (!v._g) {
      const ctx = new AudioContext();
      const src = ctx.createMediaElementSource(v);
      const gain = ctx.createGain();

      src.connect(gain);
      gain.connect(ctx.destination);

      v._g = gain;
    }

    v.classList.toggle("boosted");

    v._g.gain.value = v.classList.contains("boosted") ? 2 : 1;
  },
  step(v, amount) {
    if (!isFinite(v.currentTime) || !isFinite(amount)) return;
    v.pause();
    const next = v.currentTime + amount;
    if (isFinite(next)) v.currentTime = Math.max(0, next);
  },

  screenshot(v) {
    const c = document.createElement("canvas");
    c.width = v.videoWidth;
    c.height = v.videoHeight;

    const ctx = c.getContext("2d");
    ctx.drawImage(v, 0, 0, c.width, c.height);

    const a = document.createElement("a");
    a.href = c.toDataURL("image/png");
    a.download = "frame.png";
    a.click();
  },
  openAsWatch(v) {
    const id = getVideoId();
    if (!id) return;
    const url = `https://www.youtube.com/watch?v=${id}`;
    window.open(url, "_blank");
  },
  download(v, type = "mp4") {
    const id = getVideoId();
    if (!id) return;

    const url =
      type === "mp3"
        ? `https://ytmp3.nu/#${id}/mp3`
        : `https://ytmp3.nu/#${id}/mp4`;

    window.open(url, "_blank");
  }
};
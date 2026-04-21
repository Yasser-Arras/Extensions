// icons.js
export const Icons = {
  play: "src/assets/icons/play.png",
  pause: "src/assets/icons/pause.png",
  speed: "src/assets/icons/speed.png",
  screenshot: "src/assets/icons/screenshot.png",
  nextFrame: "src/assets/icons/next.png",
  prevFrame: "src/assets/icons/prev.png",
  cog: "src/assets/icons/cog.png",
  list: "src/assets/icons/list.png",
  openas: "src/assets/icons/openas.png",
  boost: "src/assets/icons/boost.png",
  download: "src/assets/icons/download.png",
  drag: "src/assets/icons/drag.png"
};

export function createIcon(path, width = 32, height = 32) {
  const img = document.createElement("img");
  img.src = chrome.runtime.getURL(path);
  img.width = width;
  img.height = height;
  img.style.pointerEvents = "none";
  img.style.background = "transparent";
  img.style.display = "block";
  img.style.filter = "brightness(0) invert(1)";
  return img;
}

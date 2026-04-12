import { State } from "./state.js";
import { Icons, createIcon } from "./icons.js";

export const GUI = (() => {
  let mainButton = null;
  let toolbar = null;
  let moreButton = null;
  let tweaksPanel = null;
  let tweaksConfig = [];
  let onTweakChange = null;
  const buttons = [];

  function createMainButton() {
    mainButton = document.createElement("div");
    mainButton.title = "YouTube Shorts Toolbox";
    Object.assign(mainButton.style, {
      position: "fixed",
      top: "50px",
      left: "50px",
      zIndex: 999999,
      userSelect: "none",
      width: "40px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "6px"
    });

    const handle = document.createElement("div");
    Object.assign(handle.style, {
      width: "28px",
      height: "28px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "grab",
      background: "transparent",
      border: "none",
      boxShadow: "none",
      padding: "0"
    });

    const dragIcon = createIcon(Icons.drag);
    dragIcon.style.width = "28px";
    dragIcon.style.height = "28px";
    dragIcon.style.objectFit = "contain";
    handle.appendChild(dragIcon);

    const button = document.createElement("button");
    button.title = "Open YouTube Toolbox";
    Object.assign(button.style, {
      width: "40px",
      height: "40px",
      cursor: "pointer",
      background: "#191919",
      border: "1px solid #555",
      borderRadius: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      padding: "0"
    });

    const img = createIcon(Icons.cog);
    img.style.width = "20px";
    img.style.height = "20px";
    img.style.objectFit = "contain";
    button.appendChild(img);

    let offsetX = 0;
    let offsetY = 0;

    handle.addEventListener("mousedown", (e) => {
      offsetX = e.clientX - mainButton.getBoundingClientRect().left;
      offsetY = e.clientY - mainButton.getBoundingClientRect().top;

      function moveHandler(ev) {
        mainButton.style.top = `${ev.clientY - offsetY}px`;
        mainButton.style.left = `${ev.clientX - offsetX}px`;
        if (toolbar) updateToolbarPosition();
      }

      function upHandler() {
        document.removeEventListener("mousemove", moveHandler);
        document.removeEventListener("mouseup", upHandler);
      }

      document.addEventListener("mousemove", moveHandler);
      document.addEventListener("mouseup", upHandler);
    });

    button.addEventListener("click", () => {
      if (!toolbar) buildToolbar();
      const open = toolbar.style.display === "none";
      toolbar.style.display = open ? "flex" : "none";
      if (moreButton) moreButton.style.display = open ? "flex" : "none";
      if (open) updateToolbarPosition();
    });

    mainButton.appendChild(handle);
    mainButton.appendChild(button);
    document.body.appendChild(mainButton);
  }

  function buildToolbar() {
    toolbar = document.createElement("div");
    Object.assign(toolbar.style, {
      position: "fixed",
      top: "0px",
      left: "0px",
      display: "none",
      gap: "4px",
      background: "#2b2b2b",
      padding: "8px 4px",
      borderRadius: "16px",
      border: "1px solid rgba(255,255,255,0.08)",
      boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
      zIndex: 999999,
      justifyContent: "center"
    });
    document.body.appendChild(toolbar);
    ensureMoreButton();
    updateToolbarPosition();
  }

  function updateToolbarPosition() {
    if (!toolbar || !mainButton) return;
    const top = parseInt(mainButton.style.top, 10);
    const left = parseInt(mainButton.style.left, 10);
    toolbar.style.top = `${top + 70}px`;
    toolbar.style.left = `${left + 20 - toolbar.offsetWidth / 2}px`;
    updateMoreButtonPosition();
  }

  function ensureMoreButton() {
    if (moreButton) return;
    moreButton = document.createElement("button");
    moreButton.title = "More Tweaks";
    Object.assign(moreButton.style, {
      position: "fixed",
      width: "22px",
      height: "40px",
      cursor: "pointer",
      background: "#1f1f1f",
      border: "1px solid #555",
      borderRadius: "0 8px 8px 0",
      display: "none",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 999999,
      padding: "0"
    });

    const listImg = createIcon(Icons.list);
    listImg.style.width = "14px";
    listImg.style.height = "14px";
    listImg.style.objectFit = "contain";
    moreButton.appendChild(listImg);
    moreButton.addEventListener("click", toggleTweaksPanel);
    document.body.appendChild(moreButton);
  }

  function updateMoreButtonPosition() {
    if (!moreButton || !toolbar) return;
    const topPx =
      parseInt(toolbar.style.top, 10) + Math.max(0, Math.floor((toolbar.offsetHeight - 40) / 2));
    const leftPx = parseInt(toolbar.style.left, 10) + toolbar.offsetWidth + 4;
    moreButton.style.top = `${topPx}px`;
    moreButton.style.left = `${leftPx}px`;
    moreButton.style.display = toolbar.style.display === "none" ? "none" : "flex";
  }

  function buildTweaksPanel() {
    if (tweaksPanel) return;
    tweaksPanel = document.createElement("div");
    Object.assign(tweaksPanel.style, {
      position: "fixed",
      right: "16px",
      bottom: "16px",
      width: "230px",
      background: "#1f1f1f",
      color: "#fff",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: "10px",
      padding: "10px",
      zIndex: 999999,
      boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
      fontFamily: "Arial, sans-serif",
      fontSize: "12px",
      display: "none"
    });

    const title = document.createElement("div");
    title.textContent = "Additional Tweaks";
    title.style.fontWeight = "bold";
    title.style.marginBottom = "8px";
    tweaksPanel.appendChild(title);

    const currentTweaks = State.getTweaks();
    const groups = [
      { key: "global", label: "Global" },
      { key: "shorts", label: "Shorts only" },
      { key: "video", label: "Video only" }
    ];

    groups.forEach((group) => {
      const groupTitle = document.createElement("div");
      groupTitle.textContent = group.label;
      Object.assign(groupTitle.style, {
        margin: "8px 0 6px",
        fontWeight: "bold",
        opacity: "0.9"
      });
      tweaksPanel.appendChild(groupTitle);

      tweaksConfig
        .filter((cfg) => cfg.scope === group.key)
        .forEach((cfg) => {
          const row = document.createElement("label");
          Object.assign(row.style, {
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "8px",
            cursor: "pointer"
          });

          const input = document.createElement("input");
          input.type = "checkbox";
          input.checked = !!currentTweaks[cfg.key];
          input.addEventListener("change", () => {
            const value = input.checked;
            State.setTweak(cfg.key, value);
            if (onTweakChange) onTweakChange(cfg.key, value);
          });

          const text = document.createElement("span");
          text.textContent = cfg.label;
          row.appendChild(input);
          row.appendChild(text);
          tweaksPanel.appendChild(row);
        });
    });

    document.body.appendChild(tweaksPanel);
  }

  function toggleTweaksPanel() {
    buildTweaksPanel();
    const open = tweaksPanel.style.display === "none";
    tweaksPanel.style.display = open ? "block" : "none";
  }

  function addButton(btn) {
    if (!toolbar) buildToolbar();
    toolbar.appendChild(btn);
    buttons.push(btn);
    updateToolbarPosition();
  }

  function makeToggle({ label, iconOn, iconOff, onToggle, initial = false }) {
    const b = document.createElement("button");
    b.title = label;
    Object.assign(b.style, {
      width: "40px",
      height: "40px",
      cursor: "pointer",
      background: "#2e2e2e",
      border: "1px solid #555",
      borderRadius: "6px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
      transition: "transform 0.1s"
    });

    const img = createIcon(initial ? iconOn : iconOff);
    img.style.width = "24px";
    img.style.height = "24px";
    img.style.objectFit = "contain";
    b.appendChild(img);

    const indicator = document.createElement("div");
    indicator.style.position = "absolute";
    indicator.style.top = "-4px";
    indicator.style.left = "50%";
    indicator.style.transform = "translateX(-50%)";
    indicator.style.width = "20px";
    indicator.style.height = "2px";
    indicator.style.background = initial ? "white" : "transparent";
    indicator.style.borderRadius = "1px";
    b.appendChild(indicator);

    let state = initial;
    b.addEventListener("click", () => {
      state = !state;
      img.src = chrome.runtime.getURL(state ? iconOn : iconOff);
      indicator.style.background = state ? "white" : "transparent";
      if (onToggle) onToggle(state);
    });

    return b;
  }

  function makeCycle({ label, icon, options = [], defaultIndex = 0, onChange }) {
    let index = defaultIndex;
    const b = document.createElement("button");
    b.title = label;
    Object.assign(b.style, {
      width: "40px",
      height: "40px",
      cursor: "pointer",
      background: "#2e2e2e",
      border: "1px solid #555",
      borderRadius: "6px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
      transition: "transform 0.1s"
    });

    const img = createIcon(icon);
    img.style.width = "24px";
    img.style.height = "24px";
    img.style.objectFit = "contain";
    b.appendChild(img);

    const labelSpan = document.createElement("span");
    labelSpan.textContent = `${options[index].value}x`;
    labelSpan.style.fontSize = "10px";
    labelSpan.style.color = "white";
    labelSpan.style.position = "absolute";
    labelSpan.style.top = "-16px";
    labelSpan.style.left = "50%";
    labelSpan.style.transform = "translateX(-50%)";
    labelSpan.style.whiteSpace = "nowrap";
    b.appendChild(labelSpan);

    function update() {
      labelSpan.textContent = `${options[index].value}x`;
      if (onChange) onChange(options[index].value);
    }

    b.addEventListener("click", () => {
      index = (index + 1) % options.length;
      update();
    });

    b.addEventListener("wheel", (e) => {
      e.preventDefault();
      if (e.deltaY < 0) index = (index + 1) % options.length;
      else index = (index - 1 + options.length) % options.length;
      update();
    });

    return b;
  }

  function makeButton({ label, icon, onClick }) {
    const b = document.createElement("button");
    b.title = label;
    Object.assign(b.style, {
      width: "40px",
      height: "40px",
      cursor: "pointer",
      background: "#2e2e2e",
      border: "1px solid #555",
      borderRadius: "6px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
      transition: "transform 0.1s"
    });

    const img = createIcon(icon);
    img.style.width = "24px";
    img.style.height = "24px";
    img.style.objectFit = "contain";
    b.appendChild(img);
    b.addEventListener("click", () => {
      if (onClick) onClick();
    });

    return b;
  }

  function destroy() {
    buttons.forEach((b) => b.remove());
    buttons.length = 0;
    if (toolbar) {
      toolbar.remove();
      toolbar = null;
    }
    if (moreButton) {
      moreButton.remove();
      moreButton = null;
    }
    if (tweaksPanel) {
      tweaksPanel.remove();
      tweaksPanel = null;
    }
    if (mainButton) {
      mainButton.remove();
      mainButton = null;
    }
    tweaksConfig = [];
    onTweakChange = null;
  }

  function init({ tweaks = [], onTweakToggle } = {}) {
    tweaksConfig = tweaks;
    onTweakChange = onTweakToggle || null;
    createMainButton();
  }

  return { init, addButton, makeToggle, makeCycle, makeButton, destroy };
})();

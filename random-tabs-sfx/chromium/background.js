async function ensureOffscreen() {
  if (!chrome.offscreen) return
  const exists = await chrome.offscreen.hasDocument?.()
  if (exists) return
  await chrome.offscreen.createDocument({
    url: "offscreen.html",
    reasons: ["AUDIO_PLAYBACK"],
    justification: "play sounds for tab events"
  })
}

async function play(sound) {
  await ensureOffscreen()
  chrome.runtime.sendMessage({ type: "play", sound })
}

chrome.tabs.onCreated.addListener(() => play("open"))
chrome.tabs.onRemoved.addListener(() => play("close"))
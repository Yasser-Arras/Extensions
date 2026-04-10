fetch(chrome.runtime.getURL('shared/sounds.json'))
  .then(r => r.json())
  .then(data => window.sounds = data)
  .catch(()=>{})

const rand = arr => arr[Math.floor(Math.random() * arr.length)]

chrome.runtime.onMessage.addListener(msg => {
  if (!window.sounds) return
  const list = window.sounds[msg.sound]
  if (!list || !list.length) return
  const file = rand(list)
  const audio = new Audio(chrome.runtime.getURL(file))
  audio.play().catch(()=>{})
})
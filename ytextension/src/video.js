// src/video.js
import { State } from "./state.js";

export const Video = (() => {
    let vid = null;
    let currentVolumeLevel = 0; // 0: 1x, 1: 1.5x, 2: 2x

    const volumeLevels = [1, 1.5, 2];

    function getVideo() {
        vid = document.querySelector("video");
        return vid;
    }

    function initAudioContext() {
        if (!window.audioCtx) {
            window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }

        if (!window.gainNode) {
            window.gainNode = window.audioCtx.createGain();
            window.gainNode.connect(window.audioCtx.destination);
        }

        if (!window.mediaSourceVideo || window.mediaSourceVideo !== vid) {
            if (window.mediaSource) {
                try {
                    window.mediaSource.disconnect();
                } catch (e) {
                    // ignore disconnect errors
                }
            }
            const mediaSource = window.audioCtx.createMediaElementSource(vid);
            mediaSource.connect(window.gainNode);
            window.mediaSource = mediaSource;
            window.mediaSourceVideo = vid;
        }

        window.gainNode.gain.value = volumeLevels[currentVolumeLevel];
    }

    function init() {
        const vid_elem = getVideo();
        if (!vid_elem) return;

        vid_elem.playbackRate = State.get("speed") || 1;
        currentVolumeLevel = State.get("volumeLevel") || 0;
        initAudioContext();
        bindAutoPlayNext();
    }

    function isShortsPage() {
        return location.pathname.startsWith("/shorts/");
    }

    function bindAutoPlayNext() {
        if (!vid || vid.dataset.ytToolboxAutoNextBound === "1") return;
        vid.dataset.ytToolboxAutoNextBound = "1";
        vid.addEventListener("ended", () => {
            const tweaks = State.getTweaks();
            if (!tweaks.autoPlayNext) return;
            goToNextVideo();
        });
    }

    function goToNextVideo() {
        if (isShortsPage()) {
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

        const nextButton = document.querySelector(".ytp-next-button");
        if (nextButton) nextButton.click();
    }

    function togglePlay() {
        if (!vid) return;
        if (vid.paused) vid.play();
        else vid.pause();
    }

    function setSpeed(speed) {
        State.set("speed", speed);
        if (vid) vid.playbackRate = speed;
    }

    function nextFrame() {
        if (!vid) return;
        vid.pause();
        vid.currentTime += 0.025 / vid.playbackRate;
    }

    function prevFrame() {
        if (!vid) return;
        vid.pause();
        vid.currentTime -=  0.025 / vid.playbackRate;
    }

    function screenshot() {
        if (!vid) return;
        const canvas = document.createElement("canvas");
        canvas.width = vid.videoWidth;
        canvas.height = vid.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(vid, 0, 0);
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "screenshot_" + Date.now() + ".png";
        link.click();
    }

    function cycleVolume() {
        if (!vid) return;
        initAudioContext();
        currentVolumeLevel = (currentVolumeLevel + 1) % volumeLevels.length;
        window.gainNode.gain.value = volumeLevels[currentVolumeLevel];
        State.set("volumeLevel", currentVolumeLevel);
        return volumeLevels[currentVolumeLevel];
    }

    function openAsVideo() {
        const videoId = getVideoId();
        if (videoId) window.open("https://www.youtube.com/watch?v=" + videoId);
    }

    function downloadExternal() {
        const videoId = getVideoId();
        if (videoId) window.open("https://ytmp3.nu/#" + videoId + "/mp3");
    }

    function getVideoId() {
        const shortsMatch = location.pathname.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
        if (shortsMatch) return shortsMatch[1];
        const url = new URL(location.href);
        return url.searchParams.get("v");
    }

    return { init, togglePlay, setSpeed, nextFrame, prevFrame, screenshot, cycleVolume, openAsVideo, downloadExternal };
})();
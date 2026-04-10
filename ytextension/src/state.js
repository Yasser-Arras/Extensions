// src/state.js
import { save, load } from "./utils.js";

const DEFAULT_STATE = {
    play: true,
    speed: 1,
    volumeLevel: 0,
    tweaks: {
        autoPlayNext: true,
        moveShortsAds: false,
        hideShortsMetadata: false,
        hideEndCards: false
    }
};

export const State = {
    data: load("yt_short_state", DEFAULT_STATE),

    set(key, value) {
        this.data[key] = value;
        save("yt_short_state", this.data);
    },

    get(key) {
        return this.data[key];
    },

    getTweaks() {
        if (!this.data.tweaks) {
            this.data.tweaks = { ...DEFAULT_STATE.tweaks };
        }
        return { ...DEFAULT_STATE.tweaks, ...this.data.tweaks };
    },

    setTweak(key, value) {
        const tweaks = this.getTweaks();
        tweaks[key] = value;
        this.data.tweaks = tweaks;
        save("yt_short_state", this.data);
    },

    isUserReady() {
        // Assume user is ready since we're on YouTube Shorts
        return true;
    }
};
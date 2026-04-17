// main.js

import { startModeSystem } from "./mode.js";
import { buildGUI } from "./gui.js";
import { State } from "./state.js";

console.log("[MAIN] loaded");

// start mode system (handles video + state)
startModeSystem();

// build GUI once at startup
buildGUI();
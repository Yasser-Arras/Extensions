// main.js

import { startModeSystem } from "./mode.js";
import { buildGUI } from "./gui.js";
import { State } from "./state.js";


// start mode system (handles video + state)
startModeSystem();

// build GUI once at startup
buildGUI();
console.log("[MAIN] initialized");
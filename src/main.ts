import { createEngine } from "@engine/core";

/** Entry point. Further systems register themselves on the engine as their Phase 1 items land. */
const root = document.getElementById("app");
if (root === null) {
  throw new Error("City Engine: #app element not found in index.html");
}
root.textContent = "City Engine — core loop running";

const engine = createEngine();
engine.start();

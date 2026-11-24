/** Entry point. Engine bootstrap is wired in here by the next Phase 1 items. */
const root = document.getElementById("app");
if (root === null) {
  throw new Error("City Engine: #app element not found in index.html");
}
root.textContent = "City Engine — setup OK";

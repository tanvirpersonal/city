import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

const fromRoot = (path: string): string => fileURLToPath(new URL(path, import.meta.url));

// Relative base so the build works on GitHub Pages (project site) and locally.
export default defineConfig({
  base: "./",
  // The repository asset directory is copied to the site root for static fetches.
  publicDir: "assets",
  resolve: {
    alias: {
      "@engine": fromRoot("./src/engine"),
      "@editor": fromRoot("./src/editor"),
      "@games": fromRoot("./src/games"),
    },
  },
  build: {
    target: "es2022",
    sourcemap: true,
  },
});

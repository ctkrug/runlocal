import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
  },
  test: {
    include: ["test/**/*.test.js"],
  },
});

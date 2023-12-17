
import { defineConfig } from 'vite';
import { resolve } from 'path';

let root = "src";
export default defineConfig({
  build: {
    root: root,
    base: "/lazyslate/",
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, root, "index.html"),
      }
    },
  },
});

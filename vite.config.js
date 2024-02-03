
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: "src",
    base: "/lazyslate/",
    build: {
        outDir: "../dist",
        emptyOutDir: true,
        rollupOptions: {
            input: {
                index: resolve(__dirname, "src", "index.html"),
            }
        }
    }
});

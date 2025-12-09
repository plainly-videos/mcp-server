import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "node18",
    lib: {
      entry: resolve(__dirname, "src/cli.ts"),
      formats: ["es"],
      fileName: "cli",
    },
    rollupOptions: {
      external: [
        "@modelcontextprotocol/sdk",
        "@modelcontextprotocol/sdk/server/index.js",
        "@modelcontextprotocol/sdk/server/stdio.js",
        "@modelcontextprotocol/sdk/types.js",
        "node:process",
        "node:console",
      ],
      output: {
        format: "es",
        preserveModules: false,
        entryFileNames: "cli.js",
      },
    },
    outDir: "dist",
    emptyOutDir: true,
    minify: false,
    sourcemap: false,
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
});

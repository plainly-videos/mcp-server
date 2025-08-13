import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    target: 'node20',
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: [
        '@modelcontextprotocol/sdk',
        '@modelcontextprotocol/sdk/server/index.js',
        '@modelcontextprotocol/sdk/server/stdio.js',
        'node:process',
        'node:console',
      ],
      output: {
        format: 'es',
        preserveModules: false,
        entryFileNames: 'index.js',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
    minify: false,
    sourcemap: false,
  },
});
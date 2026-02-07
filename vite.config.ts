import { defineConfig } from 'vite';

export default defineConfig({
  // Phaser 3 feature flags — mirrors the old Rollup replace() config
  define: {
    'typeof CANVAS_RENDERER': JSON.stringify(true),
    'typeof WEBGL_RENDERER': JSON.stringify(true),
    'typeof WEBGL_DEBUG': JSON.stringify(false),
    'typeof EXPERIMENTAL': JSON.stringify(true),
    'typeof PLUGIN_CAMERA3D': JSON.stringify(false),
    'typeof PLUGIN_FBINSTANT': JSON.stringify(false),
    'typeof FEATURE_SOUND': JSON.stringify(true),
  },

  build: {
    // Output to dist/ (Vite default)
    outDir: 'dist',
    // Don't empty dist/ on build — Vite does this by default, which is fine
    rollupOptions: {
      output: {
        // Keep a predictable output name for the main bundle
        entryFileNames: 'game.js',
      },
    },
  },

  server: {
    port: 10001,
    open: true,
  },
});

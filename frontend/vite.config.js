import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
    }),
  ],
  server: { port: 5173 },
  define: {
    global: 'window',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'socket': ['socket.io-client'],
          // Split static pages into separate chunk (loaded lazily)
          'static-pages': [
            './src/pages/About.jsx',
            './src/pages/HowToPlay.jsx',
            './src/pages/Privacy.jsx',
            './src/pages/Terms.jsx',
            './src/pages/Contact.jsx'
          ]
        }
      }
    },
    // Increase warning limit to avoid noise
    chunkSizeWarningLimit: 600
  }
});

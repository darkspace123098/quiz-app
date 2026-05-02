import fs from "fs"
import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function copyRedirects() {
  return {
    name: 'copy-redirects',
    closeBundle() {
      const redirects = ["_redirects", "redirects"]

      for (const fileName of redirects) {
        const src = path.resolve(__dirname, 'public', fileName)
        const dest = path.resolve(__dirname, 'dist', fileName)
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest)
        }
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), copyRedirects()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Proxy all /api/* requests from Vite (port 5173) → backend (port 5000)
      "/api": {
        target:      "http://localhost:5000",
        changeOrigin: true,
        secure:      false,
      },
    },
  },
})

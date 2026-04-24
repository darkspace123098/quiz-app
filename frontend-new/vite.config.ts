import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
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

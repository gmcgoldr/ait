import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from "vite-plugin-wasm";

// https://vitejs.dev/config/
export default defineConfig({
  build: { target: "ESNext"},
  plugins: [wasm(), react()],
  base: "/ait/",
})

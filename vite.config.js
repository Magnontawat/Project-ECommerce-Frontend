import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node', // ไม่ต้องการ DOM เพราะ test pure functions เท่านั้น
    globals: true,       // ใช้ describe/it/expect ได้โดยไม่ต้อง import
  },
})

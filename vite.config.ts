import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // 相對路徑：讓 GitHub Pages 子路徑（/osce-island/）也能正確載入資源
  base: './',
  plugins: [react()],
  server: { host: true },
});

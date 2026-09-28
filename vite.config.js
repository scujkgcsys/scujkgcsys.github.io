import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import contentAdmin from './plugins/content-admin.js'

export default defineConfig({
  // base 用相对路径：可部署到任意子目录
  base: './',
  plugins: [vue(), contentAdmin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173
  },
  build: {
    outDir: 'dist',
    cssCodeSplit: false,
    modulePreload: false,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        // iife + 单 chunk：产物可作为普通 <script> 内联执行，不受 file:// 的模块跨域限制
        format: 'iife',
        inlineDynamicImports: true,
        entryFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]'
      }
    }
  }
})

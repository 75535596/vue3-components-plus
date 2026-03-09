import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import copy from 'rollup-plugin-copy'
import vue from '@vitejs/plugin-vue'

// 普通项目构建配置
// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_URL || '/vue3-components-plus/',
  plugins: [
    vue(),
    copy({
      targets: [
        {
          src: 'README.md',
          dest: 'dist/',
        },
      ],
      hook: 'writeBundle', // 在构建完成后执行复制
      verbose: true, // 显示复制信息
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      packages: fileURLToPath(new URL('./packages', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist',
    // 普通应用构建，不使用lib模式
    rollupOptions: {
      // 不排除任何依赖，打包所有内容
      external: [],
      output: {
        // 普通应用输出格式
        manualChunks: undefined,
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
    },
  },
})

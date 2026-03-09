import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    // 启用全局测试环境
    globals: true,
    // 指定测试环境为jsdom，用于模拟浏览器环境
    environment: 'jsdom',
    // 测试文件目录
    dir: './tests',
    // 设置测试文件匹配模式
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    // 设置测试环境配置
    environmentOptions: {
      jsdom: {
        resources: "usable"
      }
    },
    // 设置测试覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['packages/**/*'],
      exclude: ['packages/**/*.d.ts', 'packages/**/index.ts']
    },
    // 设置测试文件的别名解析
    alias: {
      '@': './src',
      'packages': './packages'
    },
    // 设置测试前需要执行的文件
    setupFiles: ['./tests/setup.ts']
  }
})

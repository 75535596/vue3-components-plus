<template>
  <div class="demo-container">
    <div class="control-panel">
      <h3>Markdown 文档预览演示</h3>

      <!-- 文件上传方式 -->
      <div class="upload-section">
        <h4>方式一：文件上传</h4>
        <input
          type="file"
          @change="importMd(($event.target as any)?.files?.[0])"
          accept=".md,.markdown"
        />
        <button @click="clearFile" :disabled="!file">清除文件</button>
      </div>

      <!-- URL方式 -->
      <div class="url-section">
        <h4>方式二：URL地址</h4>
        <input
          v-model="mdUrl"
          type="text"
          placeholder="请输入Markdown文档的URL地址"
          class="url-input"
        />
        <button @click="loadFromUrl" :disabled="!mdUrl.trim()">加载URL</button>
        <button @click="clearUrl" :disabled="!mdUrl">清除URL</button>
      </div>

      <!-- 模式切换 -->
      <div class="mode-section">
        <h4>显示模式</h4>
        <button 
          @click="toggleMode" 
          :class="['mode-btn', { active: mode === 'dark' }]"
        >
          {{ mode === 'light' ? '切换到深色模式' : '切换到浅色模式' }}
        </button>
      </div>
    </div>

    <!-- Markdown组件 -->
    <div class="md-container">
      <NsMD
        v-if="showComponent"
        :content="currentContent"
        :mode="mode"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'

const showComponent = ref(true)
const file = ref()
const mdUrl = ref(
  'https://raw.githubusercontent.com/microsoft/vscode/main/README.md',
)
const currentContent = ref('')
const mode = ref<'light' | 'dark'>('light')

async function importMd(f: any) {
  // 清除URL，使用文件上传
  mdUrl.value = ''
  file.value = f

  if (f && (f.name.endsWith('.md') || f.name.endsWith('.markdown'))) {
    try {
      // 读取文件内容
      const text = await f.text()
      currentContent.value = text
      reloadComponent()
    } catch (error) {
      console.error('读取文件失败:', error)
      alert('读取文件失败，请重试')
      clearFile()
    }
  } else if (f) {
    alert('请选择Markdown文件(.md或.markdown)')
    clearFile()
  }
}

async function loadFromUrl() {
  if (mdUrl.value.trim()) {
    // 清除文件，使用URL
    clearFile()
    try {
      // 从URL获取Markdown内容
      const response = await fetch(mdUrl.value.trim())
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const text = await response.text()
      currentContent.value = text
      reloadComponent()
    } catch (error) {
      console.error('加载URL失败:', error)
      clearUrl()
    }
  }
}

function clearFile() {
  file.value = null
  currentContent.value = ''
}

function clearUrl() {
  mdUrl.value = ''
  currentContent.value = ''
}

function toggleMode() {
  mode.value = mode.value === 'light' ? 'dark' : 'light'
}

// 重新加载组件
function reloadComponent() {
  showComponent.value = false
  nextTick(() => {
    showComponent.value = true
  })
}

// 初始化时加载默认URL
loadFromUrl()
</script>

<style scoped lang="scss">
.demo-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.control-panel {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;

  h3 {
    margin: 0 0 20px 0;
    color: #333;
  }

  h4 {
    margin: 15px 0 10px 0;
    color: #666;
    font-size: 14px;
  }
}

.upload-section,
.url-section,
.mode-section {
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e0e0e0;

  input[type='file'] {
    margin-right: 10px;
  }

  .url-input {
    width: 300px;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-right: 10px;
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: #409eff;
    }
  }

  button {
    padding: 8px 16px;
    background: #409eff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 10px;
    font-size: 14px;

    &:hover:not(:disabled) {
      background: #337ecc;
    }

    &:disabled {
      background: #c0c4cc;
      cursor: not-allowed;
    }

    &.mode-btn {
      background: #666;

      &:hover:not(:disabled) {
        background: #555;
      }

      &.active {
        background: #1890ff;

        &:hover {
          background: #096dd9;
        }
      }
    }
  }
}

.md-container {
  min-height: 600px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  background: white;
  overflow: auto;
  margin-bottom: 20px;

  // 深色模式样式
  &:has(.markdown-view) {
    transition: background-color 0.3s ease;
  }
}

@media (max-width: 768px) {
  .url-input {
    width: 100% !important;
    margin-bottom: 10px;
  }
  
  .control-panel {
    padding: 15px;
  }
  
  .upload-section,
  .url-section,
  .mode-section {
    padding: 10px;
  }
}
</style>
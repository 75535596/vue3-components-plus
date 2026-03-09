<template>
  <div class="demo-container">
    <div class="control-panel">
      <h3>Word 文档预览演示</h3>

      <!-- 文件上传方式 -->
      <div class="upload-section">
        <h4>方式一：文件上传</h4>
        <input
          type="file"
          @change="importWord(($event.target as any)?.files?.[0])"
          accept=".docx"
        />
        <button @click="clearFile" :disabled="!file">清除文件</button>
      </div>

      <!-- URL方式 -->
      <div class="url-section">
        <h4>方式二：URL地址</h4>
        <input
          v-model="wordUrl"
          type="text"
          placeholder="请输入Word文档的URL地址"
          class="url-input"
        />
        <button @click="loadFromUrl" :disabled="!wordUrl.trim()">加载URL</button>
        <button @click="clearUrl" :disabled="!wordUrl">清除URL</button>
      </div>
    </div>

    <!-- Word组件 -->
    <div class="word-container">
      <NsWord
        v-if="counts"
        ref="wordRef"
        :url="currentUrl"
        :hasTool="true"
        :options="wordOptions">
      </NsWord>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'

const counts = ref(true)
const file = ref()
const wordRef = ref()
const wordUrl = ref(
  'https://501351981.github.io/vue-office/examples/dist/static/test-files/test.docx',
)
const currentUrl = ref(wordUrl.value)

// Word文档配置选项
const wordOptions = ref({
  // 可以在这里配置@vue-office/docx的选项
})

function importWord(f: any) {
  // 清除URL，使用文件上传
  wordUrl.value = ''
  file.value = f

  if (f && f.name.endsWith('.docx')) {
    // 创建文件URL
    const fileUrl = URL.createObjectURL(f)
    currentUrl.value = fileUrl
  } else if (f) {
    alert('请选择DOCX文件')
    clearFile()
  }
}

function loadFromUrl() {
  if (wordUrl.value.trim()) {
    // 清除文件，使用URL
    clearFile()
    currentUrl.value = wordUrl.value.trim()
  }
}

function clearFile() {
  file.value = null
  if (currentUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(currentUrl.value)
  }
  currentUrl.value = ''
}

function clearUrl() {
  wordUrl.value = ''
  currentUrl.value = ''
}

// 重新加载组件
function reloadComponent() {
  counts.value = false
  nextTick(() => {
    counts.value = true
  })
}
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
.url-section {
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
  }
}

.word-container {
  height: 600px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .url-input {
    width: 100% !important;
    margin-bottom: 10px;
  }
}
</style>

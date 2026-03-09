<template>
  <div class="demo-container">
    <div class="control-panel">
      <h3>PDF 文档预览演示</h3>

      <!-- 文件上传方式 -->
      <div class="upload-section">
        <h4>方式一：文件上传</h4>
        <input
          type="file"
          @change="importPdf(($event.target as any)?.files?.[0])"
          accept=".pdf"
        />
        <button @click="clearFile" :disabled="!file">清除文件</button>
      </div>

      <!-- URL方式 -->
      <div class="url-section">
        <h4>方式二：URL地址</h4>
        <input
          v-model="pdfUrl"
          type="text"
          placeholder="请输入PDF文档的URL地址"
          class="url-input"
        />
        <button @click="loadFromUrl" :disabled="!pdfUrl.trim()">加载URL</button>
        <button @click="clearUrl" :disabled="!pdfUrl">清除URL</button>
      </div>

      <!-- 搜索功能 -->
      <div class="search-section">
        <h4>文档搜索</h4>
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="输入要搜索的关键字"
          class="search-input"
        />
        <button @click="clickPdf" :disabled="!searchKeyword.trim()">搜索</button>
      </div>
    </div>

    <!-- PDF组件 -->
    <div class="pdf-container">
      <NsPdf
        v-if="counts"
        ref="pdfRef"
        :url="currentUrl"
        :hasTool="true">
      </NsPdf>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'

const counts = ref(true)
const file = ref()
const pdfRef = ref()
const pdfUrl = ref(
  'https://501351981.github.io/vue-office/examples/dist/static/test-files/test.pdf',
)
const currentUrl = ref(pdfUrl.value)
const searchKeyword = ref('')

function importPdf(f: any) {
  // 清除URL，使用文件上传
  pdfUrl.value = ''
  file.value = f

  if (f && f.name.endsWith('.pdf')) {
    // 创建文件URL
    const fileUrl = URL.createObjectURL(f)
    currentUrl.value = fileUrl
  } else if (f) {
    alert('请选择PDF文件')
    clearFile()
  }
}

function loadFromUrl() {
  if (pdfUrl.value.trim()) {
    // 清除文件，使用URL
    clearFile()
    currentUrl.value = pdfUrl.value.trim()
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
  pdfUrl.value = ''
  currentUrl.value = ''
}

function clickPdf() {
  if (searchKeyword.value.trim() && pdfRef.value) {
    pdfRef.value.search(searchKeyword.value.trim())
  }
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
.url-section,
.search-section {
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e0e0e0;

  input[type='file'] {
    margin-right: 10px;
  }

  .url-input,
  .search-input {
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

.pdf-container {
  height: 600px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .url-input,
  .search-input {
    width: 100% !important;
    margin-bottom: 10px;
  }
}
</style>

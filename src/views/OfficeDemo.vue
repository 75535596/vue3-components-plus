<template>
  <div class="office-demo">
    <h2>NsOffice 组件演示</h2>

    <div class="demo-controls">
      <!-- 文件上传方式 -->
      <div class="upload-section">
        <h3>方式一：文件上传</h3>
        <input
          type="file"
          @change="importFile(($event.target as any)?.files?.[0])"
          accept=".docx,.xlsx,.xls,.pdf"
        />
        <el-button @click="clearFile" :disabled="!file">清除文件</el-button>
      </div>

      <!-- URL方式 -->
      <el-form :model="form" label-width="120px" inline>
        <el-form-item label="文件URL:">
          <el-input v-model="form.url" placeholder="请输入文件URL" style="width: 400px" />
        </el-form-item>

        <el-form-item label="Excel编辑模式:">
          <el-switch v-model="form.isEdit" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="loadFile">加载文件</el-button>
          <el-button @click="clearUrl">清空</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="demo-content">
      <el-card v-if="currentUrl">
        <template #header>
          <div class="card-header">
            <span>当前文件: {{ getFileName(currentUrl) }}</span>
            <span class="file-type">类型: {{ getFileTypeDisplay() }}</span>
          </div>
        </template>

        <div class="office-container">
          <NsOffice v-bind="form" ref="officeRef" />
        </div>
      </el-card>

      <el-empty v-else description="请输入文件URL或选择预设文件" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
const form = reactive({
  url: '',
  isEdit: false,
  isShowDialog: false,
  dialogWidth: '1200px',
  dialogHeight: '700px',
})

const currentUrl = ref('')
const officeRef = ref()
const file = ref()

// 文件上传处理
function importFile(f: any) {
  // 清除URL，使用文件上传
  form.url = ''
  file.value = f

  if (f && (f.name.endsWith('.docx') || f.name.endsWith('.xlsx') || f.name.endsWith('.xls') || f.name.endsWith('.pdf'))) {
    // 创建文件URL
    const fileUrl = URL.createObjectURL(f)
    currentUrl.value = fileUrl
    form.url = fileUrl
  } else if (f) {
    alert('请选择支持的文件格式（.docx, .xlsx, .xls, .pdf）')
    clearFile()
  }
}

const loadFile = () => {
  if (form.url.trim()) {
    currentUrl.value = form.url.trim()
  }
}

const clearFile = () => {
  file.value = null
  if (currentUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(currentUrl.value)
  }
  currentUrl.value = ''
  form.url = ''
}

const clearUrl = () => {
  form.url = ''
  currentUrl.value = ''
}

const getFileName = (url: string) => {
  if (!url) return ''
  const parts = url.split('/')
  return parts[parts.length - 1]
}

const getFileTypeDisplay = () => {
  if (officeRef.value) {
    const fileType = officeRef.value.getFileType()
    switch (fileType) {
      case 'excel':
        return 'Excel文档'
      case 'pdf':
        return 'PDF文档'
      case 'word':
        return 'Word文档'
      case 'unsupported':
        return '不支持的格式'
      default:
        return '未知'
    }
  }
  return '未知'
}
</script>

<style scoped>
.office-demo {
  padding: 20px;
}

.demo-controls {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.upload-section {
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.upload-section h3 {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 14px;
}

.upload-section input[type='file'] {
  margin-right: 10px;
}

.preset-files {
  margin-top: 20px;
}

.preset-files h3 {
  margin-bottom: 10px;
  color: #666;
}

.demo-content {
  min-height: 700px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-type {
  color: #409eff;
  font-size: 14px;
}

.office-container {
  height: 600px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}
</style>

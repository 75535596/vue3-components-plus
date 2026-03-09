<template>
  <div class="demo-container">
    <div class="control-panel">
      <h3>Excel 预览演示</h3>

      <!-- 文件上传方式 -->
      <div class="upload-section">
        <h4>方式一：文件上传</h4>
        <el-form-item label="弹框模式:">
          <el-switch v-model="isShowDialog" @change="hideExcelHandler" />
        </el-form-item>
        <input
          type="file"
          @change="importExcel(($event.target as any)?.files?.[0])"
          accept=".xls,.xlsx"
        />
        <button @click="clearFile" :disabled="!file">清除文件</button>
      </div>

      <!-- URL方式 -->
      <div class="url-section">
        <h4>方式二：URL地址</h4>
        <input
          v-model="excelUrl"
          type="text"
          placeholder="请输入Excel文件的URL地址"
          class="url-input"
        />
        <button @click="loadFromUrl" :disabled="!excelUrl.trim()">加载URL</button>
        <button @click="clearUrl" :disabled="!excelUrl">清除URL</button>
      </div>
      <button @click="exportExcel" class="export-btn">导出数据</button>
    </div>

    <!-- Excel组件 -->
    <div class="excel-container">
      <NsExcel
        v-if="counts"
        class="excel"
        :file="file"
        :isShowDialog="isShowDialog"
        dialogWidth="1200px"
        dialogHeight="700px"
        ref="excelRef"
        exportType="2"
        @dialogExport="dialogExport"
      ></NsExcel>
    </div>
    <!-- 导出数据展示 -->
    <div class="data-display">
      <div class="data-section">
        <h4>导出数据格式1 (原始格式)</h4>
        <pre>{{ data1 }}</pre>
      </div>
      <div class="data-section">
        <h4>导出数据格式2 (Excel格式)</h4>
        <pre>{{ data2 }}</pre>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

const counts = ref(true)
const isShowDialog = ref(false)
const file = ref()
const excelRef = ref()
const data1 = ref()
const data2 = ref()
const excelUrl = ref(
  'https://501351981.github.io/vue-office/examples/dist/static/test-files/test.xlsx',
)

function hideExcelHandler(val: boolean) {
  counts.value = false
  nextTick(() => {
    counts.value = true
    isShowDialog.value = val
  })
}

function importExcel(f: any) {
  // 清除URL，使用文件上传
  excelUrl.value = ''
  file.value = f
}

function loadFromUrl() {
  if (excelUrl.value.trim()) {
    // 清除文件，使用URL
    file.value = excelUrl.value.trim()
  }
}

function clearFile() {
  file.value = null
  data1.value = null
  data2.value = null
}

function clearUrl() {
  excelUrl.value = ''
  data1.value = null
  data2.value = null
}

function dialogExport(data: any) {
  console.warn(`excel导出数据：${data}`)
}

function exportExcel() {
  if (excelRef.value) {
    data1.value = excelRef.value.exportExcel(1)
    data2.value = excelRef.value.exportExcel(2)
  }
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
.example-section {
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

.export-btn {
  padding: 10px 20px;
  background: #67c23a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;

  &:hover {
    background: #5daf34;
  }
}

.excel {
  width: 100%;
  height: 500px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

.data-display {
  display: flex;
  gap: 20px;
  margin-top: 20px;

  .data-section {
    flex: 1;
    background: #f9f9f9;
    border-radius: 8px;
    padding: 15px;

    h4 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 14px;
    }

    pre {
      background: white;
      padding: 15px;
      border-radius: 4px;
      border: 1px solid #e0e0e0;
      max-height: 300px;
      overflow: auto;
      font-size: 12px;
      line-height: 1.4;
      margin: 0;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  }
}

.excel-container {
  height: 300px;
}

@media (max-width: 768px) {
  .data-display {
    flex-direction: column;
  }

  .url-input {
    width: 100% !important;
    margin-bottom: 10px;
  }
}
</style>

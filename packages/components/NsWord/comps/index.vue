<script setup lang="ts">
import { onMounted, ref, watchEffect, defineExpose, nextTick } from 'vue'
import { renderAsync } from 'docx-preview'

// 定义组件名称
defineOptions({
  name: 'ns-word',
})

const props = defineProps({
  hasTool: {
    type: Boolean,
    default: true,
  },
  url: {
    type: String,
    default: '',
  },
  options: {
    type: Object,
    default: () => ({
      className: "docx",
      inWrapper: true, // 启用文档内容周围的包装器渲染
      hideWrapperOnPrint: false, // 打印时禁用包装器样式
      ignoreWidth: false, // 禁用页面宽度渲染
      ignoreHeight: false, // 禁用页面高度渲染
      ignoreFonts: false, // 禁用字体渲染
      breakPages: true, // 启用分页符处的分页
      ignoreLastRenderedPageBreak: true, // 禁用lastRenderedPageBreak元素的分页
      experimental: false, // 启用实验性功能（制表符停止计算）
      trimXmlDeclaration: true, // 如果为true，解析前将从xml文档中删除xml声明
      useBase64URL: false, // 如果为true，图像、字体等将转换为base64 URL，否则使用URL.createObjectURL
      renderChanges: false, // 启用文档更改的实验性渲染（插入/删除）
      renderHeaders: true, // 启用页眉渲染
      renderFooters: true, // 启用页脚渲染
      renderFootnotes: true, // 启用脚注渲染
      renderEndnotes: true, // 启用尾注渲染
      renderComments: false, // 启用实验性注释渲染
      renderAltChunks: true, // 启用altChunks（html部分）渲染
      debug: false, // 启用额外的日志记录
    }),
  },
})

const wordUrl = ref('')
const noData = ref(false)
const loading = ref(false)
const error = ref('')
const zoom = ref(1)
const wordContainer = ref<HTMLElement>()

watchEffect(() => {
  noData.value = !props.url
  console.info('word地址：', props.url)
  if (props.url) {
    wordUrl.value = props.url
    loadDocument()
  }
})

/**
 * 放大文档
 */
function zoomIn() {
  if (zoom.value < 3) {
    zoom.value += 0.1
    updateZoom()
  }
}

/**
 * 缩小文档
 */
function zoomOut() {
  if (zoom.value > 0.5) {
    zoom.value -= 0.1
    updateZoom()
  }
}

/**
 * 重置缩放
 */
function resetZoom() {
  zoom.value = 1
  updateZoom()
}

/**
 * 更新缩放
 */
function updateZoom() {
  if (wordContainer.value) {
    const docxElement = wordContainer.value.querySelector('.docx') as HTMLElement
    if (docxElement) {
      docxElement.style.zoom = zoom.value
    }
  }
}

/**
 * 加载文档
 */
async function loadDocument() {
  if (!wordUrl.value || !wordContainer.value) return

  loading.value = true
  error.value = ''

  try {
    // 清空容器
    wordContainer.value.innerHTML = ''

    // 获取文件
    const response = await fetch(wordUrl.value)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const arrayBuffer = await response.arrayBuffer()

    // 渲染文档
    await renderAsync(arrayBuffer, wordContainer.value, undefined, {
      ...props.options,
      className: 'docx',
    })

    // 应用缩放
    await nextTick()
    updateZoom()

    loading.value = false
    console.log('Word文档加载完成')
  } catch (err: any) {
    loading.value = false
    error.value = err.message || '文档加载失败'
    console.error('Word文档加载错误:', err)
  }
}

defineExpose({
  zoomIn,
  zoomOut,
  resetZoom,
  loadDocument,
})

onMounted(() => {
  console.log('NsWord组件已挂载')
})
</script>

<template>
  <div class="word-reader">
    <div class="word-tools" v-show="hasTool && !noData">
      <el-button @click="zoomOut" :disabled="zoom <= 0.5">缩小</el-button>
      <span class="zoom-info">{{ Math.round(zoom * 100) }}%</span>
      <el-button @click="zoomIn" :disabled="zoom >= 3">放大</el-button>
    </div>

    <div class="word-container" v-show="!noData">
      <div v-if="loading" class="loading-wrapper">
        <!-- <el-loading-directive v-loading="true" element-loading-text="正在加载文档..."></el-loading-directive> -->
        <div style="height: 200px"></div>
      </div>

      <!--  <div v-if="error && !loading" class="error-wrapper">
        <el-alert :title="error" type="error" center show-icon :closable="false" />
      </div> -->
      <div ref="wordContainer" class="document-wrapper" v-show="!loading && !error"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.word-reader {
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  height: 100%;
  background: var(--home-pdf-bk-color, #f5f5f5);

  :deep(.docx-wrapper) {
    width: 100%;
    box-sizing: border-box;
  }

  .word-tools {
    flex: none;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 60px;
    background-color: var(--home-pdf-tool-bk-color, #ffffff);
    border-bottom: 1px solid var(--el-border-color-light);

    > * {
      margin: 0 5px;
    }

    .zoom-info {
      font-size: 14px;
      color: var(--el-text-color-regular);
      min-width: 50px;
      text-align: center;
    }
  }

  .word-container {
    flex: 1;
    background: var(--home-pdf-bk-color, #f5f5f5);
    overflow: auto;
    position: relative;

    .loading-wrapper {
      position: relative;
      width: 100%;
      height: 200px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .error-wrapper {
      padding: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
    }

    .document-wrapper {
      // padding: 20px;
      display: flex;
      justify-content: center;
      min-height: 100%;
    }
  }
}

// 自定义滚动条样式
.word-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.word-container::-webkit-scrollbar-track {
  background: var(--el-fill-color-light);
  border-radius: 4px;
}

.word-container::-webkit-scrollbar-thumb {
  background: var(--el-color-info-light-5);
  border-radius: 4px;
}

.word-container::-webkit-scrollbar-thumb:hover {
  background: var(--el-color-info-light-3);
}
</style>

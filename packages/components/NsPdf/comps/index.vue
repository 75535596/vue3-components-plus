<script setup lang="ts">
import { onMounted, ref, watchEffect, defineExpose, computed } from 'vue'
import VuePdfApp from 'vue3-pdf-app'
// 定义组件名称
defineOptions({
  name: 'ns-pdf'
})
const props = defineProps({
  hasTool: {
    type: Boolean,
    default: true,
  },
  hasOriginalTool: {
    type: Boolean,
    default: false,
  },
  url: {
    type: String,
    default: '',
  },
  pageScale: {
    type: String,
    default: 'page-width',
  },
})
const pdfurl = ref('')
const noData = ref(false)

watchEffect(() => {
  noData.value = !props.url
  console.info('pdf地址：', props.url)
  if (props.url) {
    pdfurl.value = props.url
  }
})

const hideTool = computed(() => {
  return props.hasOriginalTool ? 'unset' : 'none'
})

const idConfig = ref({
  previousPage: 'previousPageId',
  nextPage: 'nextPageId',
  // numPages: "numPagesId",
  pageNumber: 'pageNumberId',
  zoomIn: 'zoomInId',
  zoomOut: 'zoomOutId',
})

const config = ref({
  toolbar: props.hasOriginalTool,
})

const numPages = ref(0)

function rendered(pdfApp) {
  numPages.value = pdfApp.pagesCount
}

/**
 * 执行搜索
 * @param keyword 关键字
 * @param isPrevious 向前搜索
 */
function search(keyword: string, isPrevious = false) {
  const highlight = document.querySelector('#findHighlightAll') as HTMLInputElement
  if (!highlight.checked) {
    highlight.click()
  }
  if (!keyword) {
    return
  }
  const findInputEle = document.querySelector('#findInput') as HTMLInputElement
  // 传入关键字
  if (findInputEle) {
    findInputEle.value = keyword
  }
  const eleName = isPrevious ? '#findPrevious' : '#findNext'
  const findPrevious = document.querySelector(eleName) as HTMLInputElement
  // 每点一次执行一次
  if (findPrevious) {
    findPrevious.click()
  }
}

/**
 * 数组返回第一个为当前搜索到的index， 第二个为匹配到的所有关键字
 */
function getSearchInfo() {
  document.querySelector('#findResultsCount')?.innerHTML?.replaceAll('matches', '')?.split(' of ')
}

defineExpose({
  search,
  getSearchInfo,
})

onMounted(() => {})
</script>
<template>
  <div class="pdf-reader">
    <div class="pdf-tools" v-show="hasTool && !noData">
      <el-button :id="idConfig.previousPage">上一页</el-button>
      <span>
        <input class="jump-input" :id="idConfig.pageNumber" type="number" />
        <span>/{{ numPages }}页</span>
      </span>
      <el-button :id="idConfig.nextPage">下一页</el-button>
      <el-button :id="idConfig.zoomOut">缩小</el-button>
      <el-button :id="idConfig.zoomIn">放大</el-button>
    </div>
    <vue-pdf-app
      v-show="!noData"
      class="pdf-container"
      :config="config"
      :id-config="idConfig"
      :pdf="pdfurl"
      :page-number="1"
      :page-scale="pageScale"
      @pages-rendered="rendered"
    >
    </vue-pdf-app>
    <slot name="noData">
      <el-empty v-show="noData" description="请配置资源地址" />
    </slot>
  </div>
</template>
<style lang="scss" scoped>
.pdf-reader {
  display: flex;
  flex-flow: column nowrap;
  width: 100%;
  height: 100%;
  background: var(--home-pdf-bk-color);

  .pdf-tools {
    flex: none;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 60px;
    background-color: var(--home-pdf-tool-bk-color);

    > * {
      margin: 0 5px;
    }

    .jump-input {
      height: 30px;
      width: 70px;
      border-radius: 4px;
      border: none;
      text-indent: 10px;
    }
  }

  .pdf-container {
    flex: 1;
    background: var(--home-pdf-bk-color);
  }

  :deep(.pdf-app .pdfViewer .page) {
    border: none;
  }
  :deep(#errorWrapper) {
    display: none;
  }
  :deep(#findbar) {
    display: v-bind("hideTool");
  }
}
</style>

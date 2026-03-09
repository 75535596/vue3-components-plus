<template>
  <div class="ns-office">
    <!-- Excel组件 -->
    <NsExcel
      v-if="fileType === 'excel'"
      v-bind="$attrs"
      :isEdit="false"
      :isShowDialog="false"
      :file="url"
      ref="officeRef"
    />

    <!-- PDF组件 -->
    <NsPdf v-else-if="fileType === 'pdf'" v-bind="$attrs" :url="url" ref="officeRef" />

    <!-- Word组件 -->
    <NsWord v-else-if="fileType === 'word'" v-bind="$attrs" :url="url" ref="officeRef" />

    <!-- 不支持的文件类型 -->
    <NoData v-else :noData="true" height="100px"></NoData>
    <!-- <div v-else class="unsupported-file">
      <div class="error-message">
        <div class="empty-icon"></div>
        <span>暂无数据</span>
      </div>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { computed, ref, defineExpose } from 'vue'
import NsExcel from '../../NsExcel/comps/index.vue'
import NsPdf from '../../NsPdf/comps/index.vue'
import NsWord from '../../NsWord/comps/index.vue'

// 定义组件名称
defineOptions({
  name: 'ns-office',
})

const props = defineProps({
  // 文件URL地址
  url: {
    type: String,
    required: true,
    default: '',
  },
})

const officeRef = ref()

// 根据URL获取文件扩展名
const getFileExtension = (url: string): string => {
  if (!url) return ''

  // 移除查询参数和锚点
  const cleanUrl = url.split('?')[0].split('#')[0]
  const parts = cleanUrl.split('.')

  if (parts.length < 2) return ''

  return parts[parts.length - 1].toLowerCase()
}

// 根据文件扩展名确定文件类型
const fileType = computed(() => {
  const extension = getFileExtension(props.url)

  // Excel文件
  if (['xlsx', 'xls'].includes(extension)) {
    return 'excel'
  }

  // PDF文件
  if (extension === 'pdf') {
    return 'pdf'
  }

  // Word文件
  if (['docx'].includes(extension)) {
    return 'word'
  }

  return 'unsupported'
})

// 暴露子组件的方法
defineExpose({
  // 获取当前激活的组件实例
  getActiveComponent: () => officeRef.value,
  // 获取文件类型
  getFileType: () => fileType.value,
  // 刷新组件
  refresh: () => {
    if (officeRef.value && typeof officeRef.value.refresh === 'function') {
      officeRef.value.refresh()
    }
  },
})
</script>

<style scoped lang="scss">
.ns-office {
  width: 100%;
  height: 100%;
}

.unsupported-file {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.error-message {
  text-align: center;
  color: #666;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.empty-icon {
  width: 100px;
  height: 80px;
  margin-bottom: 10px;
  background: var(--matrix-empty-icon) no-repeat top left / 100% 100%;
}

.error-message h3 {
  color: #f56565;
  margin-bottom: 16px;
}

.error-message ul {
  text-align: left;
  margin: 16px 0;
  padding-left: 20px;
}

.error-message li {
  margin: 8px 0;
}

.error-message p {
  margin: 12px 0;
  word-break: break-all;
}
</style>

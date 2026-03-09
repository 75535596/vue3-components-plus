<template>
  <div class="h-layout">
    <el-tree
      class="tree"
      style="max-width: 600px"
      :data="data"
      :props="defaultProps"
      :default-expand-all="true"
      @node-click="handleNodeClick"
    />
    <div class="center-view">
      <RouterView></RouterView>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router'

// const route = useRoute();
const router = useRouter()
function handleNodeClick(nodeData: any) {
  router.push({
    name: nodeData.name,
  })
}

const data = [
  {
    label: '组件',
    children: [
      {
        label: '组件库说明',
        name: 'readme',
      },
      {
        label: 'MD预览',
        name: 'md',
      },
      {
        label: '视频组件',
        name: 'video',
      },
      {
        label: '弹出框组件',
        name: 'dialog',
      },
      {
        label: 'excel组件',
        name: 'excel',
      },
      {
        label: 'pdf组件',
        name: 'pdf',
      },
      {
        label: 'word组件',
        name: 'word',
      },
      {
        label: '动态表单',
        name: 'form',
      },
      {
        label: '浸润线',
        name: 'saturationline',
      },
      {
        label: '图片组件',
        name: 'image',
      },
      {
        label: 'office组件',
        name: 'office',
      },
    ],
  },
  {
    label: '函数',
    children: [
      {
        label: '自定义指令',
        name: 'test',
      },
    ],
  },
]

const defaultProps = {
  children: 'children',
  label: 'label',
}
</script>
<style lang="scss" scoped>
.h-layout {
  display: flex;
  height: 100%;
  .tree {
    width: 10%;
    border-right: 1px dashed #9c9c9c;
    margin-right: 10px;
  }
  .center-view {
    flex: 1;
  }
}
</style>

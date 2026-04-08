<template>
  <ExcelComp v-if="!isShowDialog" v-bind="$attrs" ref="excelCompRef"></ExcelComp>
</template>

<script setup lang="ts">
import { onMounted, ref, useAttrs, watch, defineExpose, nextTick } from 'vue'
import ExcelComp from './ExcelComp.vue'
import { NsDialog } from '../../NsDialog/comps'

const emit = defineEmits(['dialogExport'])

const props = defineProps({
  isShowDialog: {
    type: Boolean,
    default: true,
  },
  dialogTitle: {
    type: String,
    default: 'Excel预览',
  },
  dialogWidth: {
    type: String,
    default: '800px',
  },
  dialogHeight: {
    type: String,
    default: '500px',
  },
  exportType: {
    type: Number,
    default: 1,
  },
  exportExcel: {
    type: Boolean,
    default: false,
  },
})

const excelCompRef = ref()
// 获取 attrs
const attrs = useAttrs()

const isShowDialog = ref(props.isShowDialog)

watch(
  () => attrs.file,
  (newFile) => {
    if (isShowDialog.value) {
      if (newFile) {
        openDialog(newFile)
      }
    } else {
      // 刷新excel组件
      isShowDialog.value = !isShowDialog.value
      nextTick(() => {
        isShowDialog.value = !isShowDialog.value
      })
    }
  },
  { immediate: true, deep: true },
)

function dialogExport(exportExcelData) {
  emit('dialogExport', exportExcelData)
}

// 透传
defineExpose({
  initShow: (blob: any) => excelCompRef.value?.initShow(blob),
  exportExcel: (type = 1, isDownload = false) => excelCompRef.value?.exportExcel(type, isDownload),
})

function openDialog(file) {
  NsDialog(
    {
      title: props.dialogTitle,
      // 任何组件添加 $emit('close') 时，会触发关闭弹出框事件
      dom: ExcelComp, // 也可以通过异步方式：import("@/views/xx.vue") 和 () => import("@/views/xx.vue")
      option: {
        // dom对应的自定义组件props属性
        ...attrs,
        file,
      },
      events: {
        // dom组件内部自定义事件emit('btnClick', xxx)
        btnClick: () => {
          console.log('点击中间区域内容')
        },
      },
      modalColor: 'rgb(0 21 115 / 20%)', // 遮罩层颜色
      width: props.dialogWidth, // 宽度, 整个弹出框的高度，非内容高度
      height: props.dialogHeight, // 高度, 不配置则默认为内容高度
      dialogPadding: [10, 20], // 弹窗内padding
      showFooter: true, // 默认显示底部按钮
      immediately: false, // true立即取消弹出框, false异步请求后取消弹出框，默认false
      draggable: true, // 是否可拖拽，默认false
      confirm: async (closeFn: any, componentRef: any) => {
        const exportExcelData = await componentRef.value?.exportExcel(
          props.exportType,
          props.exportExcel,
        )
        dialogExport(exportExcelData)
        // 1.请求数据，再关闭
        if (closeFn) {
          closeFn()
        }
      },
      close: () => {
        // 关闭弹出时立即出发
        console.log('点击关闭')
      },
      closed: () => {
        // 弹窗销毁时触发
        console.log('完成关闭')
      },
    },
    true,
    '#app',
  ) // true为是否遮罩（非必填）， '#app'为挂载点（非必填）
}
</script>

<style lang="scss" scoped></style>

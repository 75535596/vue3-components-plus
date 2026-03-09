<template>
  <div>
    <el-button type="warning" @click="openDialog({ params: { test: '222' } })">弹出框组件</el-button>
    <el-button type="primary" @click="updateDialogOption">更新弹窗选项</el-button>
    <el-button type="success" @click="callDialogMethod">调用弹窗方法</el-button>
    <!-- 为每个打开的弹窗生成一个关闭按钮 -->
    <div v-for="(instance, index) in dialogInstances" :key="instance.id" style="margin-top: 10px;">
      <el-button type="danger" @click="closeDialog(instance)">关闭弹窗 {{ index + 1 }}</el-button>
    </div>

    <!-- 全部关闭按钮 -->
    <el-button v-if="dialogInstances.length > 0" type="danger" @click="closeAllDialogs" style="margin-top: 10px;">关闭所有弹窗</el-button>
  </div>
</template>
<script setup lang="ts">
import VideoDemo from '@/views/VideoDemo.vue'
import { onMounted, onUnmounted, ref } from 'vue'

// 扩展Window接口
declare global {
  interface Window {
    __dialogInstances: any[];
    NsDialog: any;
  }
}

// 保存当前打开的弹窗实例数组
const dialogInstances = ref<any[]>([])
const openIndex = ref(0);
function openDialog(data = {}) {
  openIndex.value++;
  if(dialogInstances.value.length === 0) {
    openIndex.value = 0;
  }
  window.NsDialog(
    {
      class: 'xxx',
      title: '测试',
      // 任何组件添加 $emit('close') 时，会触发关闭弹出框事件
      dom: VideoDemo, // 也可以通过异步方式：import("@/views/VideoDemo.vue") 和 () => import("@/views/VideoDemo.vue")
      domCompleted: (domRef: any)=>{
        // dom加载完成或触发函数，domRef为dom实例可以执行defineExpose暴露出的函数
        console.log('组件加载完成，domRef:', domRef)
        domRef?.xxx?.()
      },
      option: {
        // dom对应的自定义组件props属性
        ...data,
      },
      events: {
        // dom组件内部自定义事件emit('btnClick', xxx)
        btnClick: () => {
          console.log('点击中间区域内容')
        },
      },
      width: '800px', // 宽度, 整个弹出框的高度，非内容高度
      height: '450px', // 高度, 不配置则默认为内容高度
      dialogPadding: [10, 20], // 弹窗内padding
      // 弹窗绝对定位
      x: 250 + openIndex.value * 20,
      y: 100 + openIndex.value * 20,
      // 设置函数时，则有放大和还原按钮，且按返回的对象设置弹出框。（会关闭拖动功能）
      // maxSize: function () {
      //   return { width: '100%', height: '800px', x: 0, y: 100 }
      // },
      modal: false, // 模态框
      modalColor: 'rgb(0 21 115 / 20%)', // 遮罩层颜色
      showFooter: true, // 默认显示底部按钮
      immediately: false, // true立即取消弹出框, false异步请求后取消弹出框，默认false
      draggable: true, // 是否可拖拽，默认false
      // 底部确认按钮回调事件
      confirm: async (closeFn: any, componentRef: any, footerLoading: any) => {
        // 2.componentRef可以调用内部函数，前提需要defineExpose
        try {
          const selectRows = componentRef?.value?.getSelectedRows()
          console.log('点击确认，选择数据：', selectRows)
        } catch (e) {
          console.log(e)
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
        // 3.footerLoading可以控制底部loading状态
        if (footerLoading) {
          footerLoading.value = false
        }
        // 1.请求数据，再关闭
        if (closeFn) {
          closeFn()
        }
      },
      close: () => {
        // 关闭弹出时立即出发
        console.log('点击关闭')
        // 更新dialogInstances数组
        updateDialogInstances()
      },
      closed: () => {
        // 弹窗销毁时触发
        console.log('完成关闭')
        // 更新dialogInstances数组
        updateDialogInstances()
      },
      // 头部+底部自定义配置
      /*
      // 任何组件添加 $emit('close') 时，会触发关闭弹出框事件
      headerDom: xxx,
      headerOption: {},
      headerEvents: {},
      // 任何组件添加 $emit('close') 时，会触发关闭弹出框事件
      footerDom: yyy,
      footerOption: {},
      footerEvents: {},
      // 底部按钮名称
      footerTitle: {
        close: "取消",
        confirm: "确定",
      },
      */
    },
    true,
    '#app',
  ) // true为是否遮罩（非必填）， '#app'为挂载点（非必填）

  // 更新dialogInstances数组
  updateDialogInstances()

  setTimeout(()=>{
    const data = window.__dialogInstances;
    console.log('当前所有弹窗实例:', data)
  }, 333)
}

// 更新dialogInstances数组
function updateDialogInstances() {
  // 使用setTimeout确保在DOM更新后执行
  setTimeout(() => {
    dialogInstances.value = [...window.__dialogInstances]
  }, 0)
}

// 更新弹窗选项
function updateDialogOption() {
  if (dialogInstances.value.length > 0) {
    // 更新最后一个弹窗的选项
    const lastInstance = dialogInstances.value[dialogInstances.value.length - 1]
    // 现在可以直接更新弹窗标题了
    lastInstance.updateOption({
      title: '更新后的标题',
      params: { test: '更新后的参数' }
    })
    console.log('已更新弹窗标题和选项')
  } else {
    console.warn('没有打开的弹窗实例')
  }
}

// 调用弹窗内组件的方法
function callDialogMethod() {
  if (dialogInstances.value.length > 0) {
    // 调用最后一个弹窗内组件的方法
    const lastInstance = dialogInstances.value[dialogInstances.value.length - 1]
    if (lastInstance.domRef) {
      // 使用新的callMethod方法调用组件方法
      // 注意：这里需要组件内部通过defineExpose暴露方法
      lastInstance.callMethod('defineExpose暴露的方法名', 'arg1', 'arg2')
      console.log('已调用弹窗内组件方法')
    } else {
      console.warn('组件引用不存在')
    }
  } else {
    console.warn('没有打开的弹窗实例')
  }
}

// 关闭指定弹窗
async function closeDialog(instance: any) {
  if (instance) {
    // 使用新的close方法关闭弹窗
    await instance.close()
    console.log('已关闭指定弹窗')
  } else {
    console.warn('弹窗实例不存在')
  }
}

// 关闭所有弹窗
function closeAllDialogs() {
  // 关闭所有弹窗
  dialogInstances.value.forEach(instance => {
    instance.close()
  })
  openIndex.value = 0;
  console.log('已关闭所有弹窗')
}

onMounted(() => {
  setTimeout(() => {
    openDialog({ params: { test: '1' } })
  }, 300)

  // 初始化dialogInstances数组
  updateDialogInstances()
})

onUnmounted(()=>{
  window.__dialogInstances.forEach(item=>{
    item.close()
  })
})
</script>
<style scoped></style>

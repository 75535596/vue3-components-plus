<template>
  <!-- 对话框组件，具有自定义头部、内容和底部 -->
  <el-dialog
    :class="['dialog-plus', props.class, { 'dialog-absolute-position': isAbsolutePosition, 'dialog-maximized': isMaximized }]"
    :modal-class="['dialog-plus-modal', props.class ? props.class + '-modal' : '']"
    :modal="props.modal"
    :modal-penetrable="(props.modal+'') === 'false'"
    :draggable="props.draggable"
    :close-on-click-modal="props.closeOnClickModal"
    align-center
    v-model="visible"
    :width="currentWidth"
    :show-close="false"
    @close="dealClose"
    @closed="dealClosed"
  >
    <!-- 简写便于扩展（后期改写attrs+events） -->
    <!-- <el-dialog class="dialog-plus" modal-class="dialog-plus-modal" v-model="visible" v-bind="props" v-on="props"
    :show-close="false" align-center> -->
    <!-- 对话框内容区域，动态加载组件 -->
    <div class="dialog-content">
      <component
        ref="componentRef"
        :is="asyncDom"
        v-bind="currentOption"
        v-on="{
          ...props.events,
          close: closeDialog,
        }"
      />
    </div>
    <!-- 自定义对话框头部，包括标题和关闭按钮 -->
    <template #header>
      <div class="dialog-header">
        <div class="dialog-title">
          <component
            v-if="headerDom"
            :is="asyncHeaderDom"
            v-bind="props.headerOption"
            v-on="{
              ...props.headerEvents,
              close: closeDialog,
            }"
          />
          <template v-else>{{ currentTitle }}</template>
        </div>
        <div class="dialog-controls">
          <el-icon
            v-if="showMaximizeButton"
            class="dialog-maximize"
            style="cursor: pointer; margin-right: 8px"
            @click="toggleMaximize"
          >
            <FullScreen v-if="!isMaximized" />
            <ScaleToOriginal v-else />
          </el-icon>
          <el-icon class="dialog-close" style="cursor: pointer" @click="closeDialog"
            ><CloseBold />
          </el-icon>
        </div>
      </div>
    </template>
    <!-- 自定义对话框底部，包含操作按钮 -->
    <template #footer v-if="showFooter">
      <component
        v-if="footerDom"
        :is="asyncFooterDom"
        v-bind="props.footerOption"
        v-on="{
          ...props.footerEvents,
          close: closeDialog,
        }"
      />
      <div v-else class="dialog-footer">
        <el-button class="dialog-footer-btn btn-cancel" @click="closeDialog">{{
          footerTitle.close
        }}</el-button>
        <el-button
          class="dialog-footer-btn btn-confirm"
          type="primary"
          @click="dealConfirm"
          :loading="footerLoading"
        >
          {{ footerTitle.confirm }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts" name="DialogPlus">
import { computed, watch, reactive } from 'vue'
import { ref, onMounted, onUnmounted } from 'vue'
import { defineAsyncComponent, DefineComponent } from 'vue'
import { ElMessage } from 'element-plus'
import { CloseBold, FullScreen, ScaleToOriginal } from '@element-plus/icons-vue'
import { ThemeVar } from '../../../utils/loadCssVars'

/**
 * dom支持异步组件和同步方式
 */
const asyncDom = computed(() => {
  if (typeof props.dom === 'function') {
    return defineAsyncComponent(props.dom as any)
  } else if (typeof props.dom?.then === 'function') {
    return defineAsyncComponent(() => props.dom as any)
  }
  return props.dom
})

/**
 * headerDom支持异步组件和同步方式
 */
const asyncHeaderDom = computed(() => {
  if (typeof props.headerDom === 'function') {
    return defineAsyncComponent(props.headerDom as any)
  } else if (typeof props.headerDom?.then === 'function') {
    return defineAsyncComponent(() => props.headerDom as any)
  }
  return props.headerDom
})

/**
 * footerDom支持异步组件和同步方式
 */
const asyncFooterDom = computed(() => {
  if (typeof props.footerDom === 'function') {
    return defineAsyncComponent(props.footerDom as any)
  } else if (typeof props.footerDom?.then === 'function') {
    return defineAsyncComponent(() => props.footerDom as any)
  }
  return props.footerDom
})

// 对话框属性定义，包括标题、宽度、是否显示遮罩等
const props = defineProps({
  class: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  width: {
    type: [Number, String],
    default: 500,
  },
  height: {
    type: [Number, String],
    default: '',
  },
  modal: {
    type: Boolean,
    default: true,
  },
  dialogPadding: {
    type: [Number, String],
    default: -1,
  },
  modalColor: {
    type: String,
    default: 'rgba(0,0,0,0.6)',
  },
  closeOnClickModal: {
    type: Boolean,
    default: true,
  },
  dom: {
    type: [Object, Function],
    default: null,
  },
  option: {
    type: Object,
    default: () => ({}),
  },
  events: {
    type: Object,
    default: () => ({}),
  },
  domCompleted: {
    type: Function,
  },
  headerDom: {
    type: [Object, Function],
    default: null,
  },
  headerOption: {
    type: Object,
    default: () => ({}),
  },
  headerEvents: {
    type: Object,
    default: () => ({}),
  },
  showFooter: {
    type: Boolean,
    default: true,
  },
  footerDom: {
    type: Object,
    default: null,
  },
  footerOption: {
    type: Object,
    default: () => ({}),
  },
  footerTitle: {
    type: Object,
    default: () => ({
      close: '取消',
      confirm: '确定',
    }),
  },
  footerEvents: {
    type: Object,
    default: () => ({}),
  },
  immediately: {
    type: Boolean,
    default: false,
  },
  close: {
    type: Function,
    default: null,
  },
  closed: {
    type: Function,
    default: null,
  },
  draggable: {
    type: Boolean,
    default: false,
  },
  confirm: {
    type: Function,
    default: null,
  },
  // xy偏离设置
  x: {
    type: [Number, String],
    default: null,
  },
  y: {
    type: [Number, String],
    default: null,
  },
  maxSize: {
    type: Function,
    default: null,
  },
  // 添加dialogInstance属性
  dialogInstance: {
    type: Object,
    default: null,
  },
  containerId: {
    type: String,
    default: '',
  }
})

const componentRef = ref<InstanceType<DefineComponent> | null>(null)

// 使用reactive创建响应式的option
const currentOption = reactive({ ...props.option })

// 创建响应式的title
const currentTitle = ref(props.title)

// 当前对话框尺寸和位置 - 必须在其他computed之前定义
const currentWidth = ref<string | number>(props.width)
const currentHeight = ref<string | number>(props.height)
const currentX = ref<string | number | null>(props.x)
const currentY = ref<string | number | null>(props.y)

// 控制对话框显示状态
const visible = ref(false)

// 最大化状态管理
const isMaximized = ref(false)
const originalSize = ref({
  width: '' as string | number,
  height: '' as string | number,
  x: null as string | number | null,
  y: null as string | number | null,
})

const _height = ref('fit-content')

const _centerHeight = ref('auto')

const tbPadding = ref(ThemeVar.VARS['--matrix-dialog-padding-topBottom'])
const lrPadding = ref(ThemeVar.VARS['--matrix-dialog-padding-leftRight'])

// 是否显示最大化按钮
const showMaximizeButton = computed(() => {
  return typeof props.maxSize === 'function'
})

// 计算绝对定位的样式
const dialogPosition = computed(() => {
  if (currentX.value !== null || currentY.value !== null) {
    const style: any = {
      position: 'fixed',
      margin: '0 !important',
    }

    if (currentX.value !== null) {
      style.left = typeof currentX.value === 'number' ? `${currentX.value}px` : currentX.value
    }

    if (currentY.value !== null) {
      style.top = typeof currentY.value === 'number' ? `${currentY.value}px` : currentY.value
    }

    return style
  }
  return {}
})

// 是否使用绝对定位
const isAbsolutePosition = computed(() => {
  return currentX.value !== null || currentY.value !== null
})

watch(
  () => props.dialogPadding,
  (newVal) => {
    if (newVal != -1) {
      if (Array.isArray(newVal)) {
        if (newVal.length == 2) {
          tbPadding.value = newVal[0] + 'px'
          lrPadding.value = newVal[1] + 'px'
        } else {
          tbPadding.value = newVal[0] + 'px'
          lrPadding.value = newVal[0] + 'px'
        }
      } else {
        tbPadding.value = newVal + 'px'
        lrPadding.value = newVal + 'px'
      }
    } else {
      tbPadding.value = ThemeVar.VARS['--matrix-dialog-padding-topBottom']
      lrPadding.value = ThemeVar.VARS['--matrix-dialog-padding-leftRight']
    }
  },
  { immediate: true, deep: true },
)

watch(
  componentRef,
  (newVal) => {
    if (newVal) {
      console.log('异步组件已加载完成')
      // 保存组件引用到实例中
      if (props.dialogInstance) {
        // 使用一个临时变量来避免直接修改props
        const instance = props.dialogInstance
        instance.domRef = newVal

        // 更新实例中的方法
        instance.callMethod = (methodName: string, ...args: any[]) => {
          if (newVal && typeof (newVal as any)[methodName] === 'function') {
            return (newVal as any)[methodName](...args)
          } else {
            console.warn(`Method ${methodName} not found on component`)
          }
        }
      }

      // 可以访问组件实例的方法和属性
      props.domCompleted?.(newVal)
    }
  },
  { immediate: true },
)

// 监听props.option变化，更新currentOption
watch(
  () => props.option,
  (newVal) => {
    // 更新currentOption对象
    Object.assign(currentOption, newVal)
  },
  { deep: true }
)

// 监听props.title变化，更新currentTitle
watch(
  () => props.title,
  (newVal) => {
    currentTitle.value = newVal
  },
  { immediate: true }
)

// 更新实例中的updateOption方法
onMounted(() => {
  if (props.dialogInstance) {
    // 使用一个临时变量来避免直接修改props
    const instance = props.dialogInstance

    // 替换updateOption方法
    instance.updateOption = (newOption: Record<string, any>) => {
      // 如果包含title，更新标题
      if (newOption.title !== undefined) {
        currentTitle.value = newOption.title
      }
      // 更新其他选项到currentOption
      const { title, ...otherOptions } = newOption
      Object.assign(currentOption, otherOptions)
    }

    // 替换close方法
    instance.close = () => {
      // 调用关闭对话框方法
      closeDialog()
    }

    // 如果componentRef已经存在，也需要更新callMethod
    if (componentRef.value) {
      instance.callMethod = (methodName: string, ...args: any[]) => {
        if (componentRef.value && typeof (componentRef.value as any)[methodName] === 'function') {
          return (componentRef.value as any)[methodName](...args)
        } else {
          console.warn(`Method ${methodName} not found on component`)
        }
      }
    }
  }
})

watch(
  () => currentHeight.value,
  (newVal) => {
    if (newVal !== null && newVal !== undefined && newVal !== '') {
      try {
        const topBottom = parseFloat((tbPadding.value || '0').toString().replace('px', '')) || 0
        const heightValue = String(newVal).trim()

        if (typeof newVal === 'number' || /^\d+(\.\d+)?(px)?$/.test(heightValue)) {
          const baseHeight = parseFloat(heightValue)
          _height.value = `${baseHeight - topBottom}px`
        } else {
          _height.value = `calc(${heightValue} - ${topBottom}px)`
        }

        _centerHeight.value = `calc(100% - ${topBottom * 2}px)`
        return
      } catch (error) {
        console.log(error)
      }
    }
    _height.value = 'fit-content'
    _centerHeight.value = 'auto'
  },
  { immediate: true, deep: true },
)

// 监听props变化，更新当前值
watch(
  () => [props.width, props.height, props.x, props.y],
  ([width, height, x, y]) => {
    if (!isMaximized.value) {
      currentWidth.value = width
      currentHeight.value = height
      currentX.value = x
      currentY.value = y
    }
  },
  { immediate: true },
)

// 键盘事件处理函数
const handleKeydown = (event: KeyboardEvent) => {
  // 只有当对话框可见且显示底部按钮时才处理回车键
  if (visible.value && props.showFooter && event.key === 'Enter') {
    // 检查是否有自定义底部组件，如果没有则触发确认按钮
    if (!props.footerDom/*  && props.confirm */) {
      event.preventDefault()
      dealConfirm()
    }
  }
}

onMounted(() => {
  visible.value = true
  // 初始化当前尺寸和位置
  currentWidth.value = props.width
  currentHeight.value = props.height
  currentX.value = props.x
  currentY.value = props.y

  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  // 移除键盘事件监听
  document.removeEventListener('keydown', handleKeydown)
})

// 最大化/还原切换
const toggleMaximize = () => {
  if (!props.maxSize) return

  if (!isMaximized.value) {
    // 保存当前尺寸和位置
    originalSize.value = {
      width: currentWidth.value,
      height: currentHeight.value,
      x: currentX.value,
      y: currentY.value,
    }

    // 获取最大化配置
    const maxConfig: any = props.maxSize()

    // 应用最大化尺寸和位置
    currentWidth.value = maxConfig.width || '100vw'
    currentHeight.value = maxConfig.height || '100vh'
    currentX.value = maxConfig.x !== undefined ? maxConfig.x : 0
    currentY.value = maxConfig.y !== undefined ? maxConfig.y : 0

    isMaximized.value = true
  } else {
    // 还原到原始尺寸和位置
    currentWidth.value = originalSize.value.width
    currentHeight.value = originalSize.value.height
    currentX.value = originalSize.value.x
    currentY.value = originalSize.value.y

    isMaximized.value = false
  }
}

// 关闭对话框方法
const closeDialog = () => {
  visible.value = false
}

// 处理关闭事件
const dealClose = () => {
  if (props?.close) {
    props.close()
  }
}

// 处理关闭动画结束事件
const dealClosed = () => {
  if (props?.closed) {
    props.closed()
  }
}

const footerLoading = ref(false)

// 处理确认事件
const dealConfirm = () => {
  footerLoading.value = true
  if (!props.confirm) {
    footerLoading.value = false
    return
  }
  if (props.immediately) {
    footerLoading.value = false
    visible.value = false
    props.confirm(null, componentRef)
  } else {
    // 支持2个参数，第一个为关闭方法，第二个为组件实例
    props.confirm(
      () => {
        footerLoading.value = false
        visible.value = false
        ElMessage.success('操作成功')
      },
      componentRef,
      footerLoading,
    )
  }
}

// 分离属性和事件（后期改写成v-bind='attrs' v-on='events'）
/* const attrs = {
  title: props.title,
  width: props.width,
  modal: props.modal,
  modalColor: props.modalColor,
  closeOnClickModal: props.closeOnClickModal,
  draggable: props.draggable,
};

const events = {
  close: dealClose,
  closed: dealClosed,
}; */
</script>

<style lang="scss">
// 模态框颜色
.el-overlay.dialog-plus-modal {
  background-color: v-bind(modalColor);
}

// 对话框样式定义
.dialog-plus.el-dialog {
  margin: auto !important;
  display: flex;
  flex-flow: column nowrap;
  overflow: hidden;
  min-height: 100px;
  max-height: 100%;
  height: v-bind(_height);
  background: var(--matrix-dialog-bk-color);
  border-radius: var(--matrix-dialog-border-radius);
  box-shadow: var(--matrix-dialog-box-shandow);
  border: none; //var(--matrix-dialog-border);
  padding: 0 !important;

  // 绝对定位样式
  &.dialog-absolute-position {
    position: fixed !important;
    margin: 0 !important;
    left: v-bind('dialogPosition.left');
    top: v-bind('dialogPosition.top');
  }

  // 最大化时屏蔽拖拽产生的transform偏移，确保使用maxSize的x/y
  &.dialog-maximized {
    transform: none !important;
  }

  .el-dialog__header {
    position: relative;
    box-sizing: border-box;
    padding: 0 24px;
    line-height: var(--matrix-dialog-header-height);
    height: var(--matrix-dialog-header-height);
    width: 100%;
    background: var(--matrix-dialog-header-bg-color);
    color: var(--matrix-dialog-header-text-color);

    .dialog-header {
      width: 100%;
      height: 100%;
      position: relative;
      display: flex;
      flex-flow: row nowrap;
      justify-content: space-between;
      align-items: center;

      .dialog-title {
        font-size: 16px;
        font-weight: bold;
        text-align: left;
      }

      .dialog-controls {
        display: flex;
        align-items: center;
      }

      .dialog-maximize,
      .dialog-close {
        font-size: 16px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          color: #409eff;
        }
      }
    }

    .el-dialog__headerbtn {
      top: 50%;
      z-index: 10;
      transform: translateY(-50%);

      .el-dialog__close {
        color: #fff;
        font-size: 25px;
        transition: all 0.2s;
      }

      &:hover {
        .el-dialog__close {
          color: rgb(40, 205, 255);
        }
      }
    }
  }

  .el-dialog__body {
    // height: 100%;
    flex: 1;
    overflow: auto;
    padding: 0;
    color: #000;

    .dialog-content {
      padding-top: v-bind(tbPadding);
      padding-bottom: v-bind(tbPadding);
      padding-left: v-bind(lrPadding);
      padding-right: v-bind(lrPadding);
      height: v-bind(_centerHeight);
    }
  }

  .dialog-footer {
    border-top: 1px solid var(--matrix-dialog-footer-border-color);
    background-color: var(--matrix-dialog-footer-bg-color);
    height: var(--matrix-dialog-footer-height);
    display: flex;
    flex-flow: row nowrap;
    justify-content: var(--matrix-dialog-footer-VH);
    align-items: var(--matrix-dialog-footer-VH);
    // padding: 10px;
    .dialog-footer-btn {
      border-radius: var(--matrix-dialog-footer-btn-radius);
      width: var(--matrix-dialog-footer-btn-width);
      height: var(--matrix-dialog-footer-btn-height);
      padding: 0 var(--matrix-dialog-footer-btn-space);
      &.btn-cancel {
        background-color: var(--matrix-dialog-footer-cancel-bg-color);
        border: 1px solid var(--matrix-dialog-footer-cancel-border-color);
        color: var(--matrix-dialog-footer-cancel-color);
      }
      &.btn-confirm {
        background-color: var(--matrix-dialog-footer-confirm-bg-color);
        border: 1px solid var(--matrix-dialog-footer-confirm-bg-color);
        color: var(--matrix-dialog-footer-confirm-color);
      }
    }
  }
}
</style>
<style lang="scss">
.dialog-plus {
  .el-dialog__footer {
    padding-top: 0 !important;
  }
}
</style>

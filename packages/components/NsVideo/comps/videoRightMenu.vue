<template>
  <div
    class="right-box"
    :style="state.rightStyle"
    v-show="state.rightShow"
    tabindex="-1"
    @blur="right_closeMenu2()"
  >
    <div class="right-box-2">
      <div
        v-for="(item, index) in rightMenus"
        :key="index"
        @click="
          ()=>{
            right_closeMenu()
            rightHandler(item)
          }
        "
      >
        {{ item?.name }}
      </div>
    </div>
  </div>
</template>

<script setup name="com-right-menu" lang="ts">
import { nextTick, defineProps, defineExpose, reactive } from 'vue'

const props = defineProps({
  rightMenus: {
    type: Array,
    default: () => [],
  },
  sacle_x: {
    type: Number,
    default: 1,
  },
  sacle_y: {
    type: Number,
    default: 1,
  },
})

function rightHandler(rightAction) {
  rightAction?.callback?.(state.rightTargetData)
}

// --------------- 所有状态
const state = reactive({
  rightShow: false, // 右键菜单是否正在显示
  rightTargetData: null, // 右键菜单正在操作的 tab
  rightStyle: {
    // 右键菜单的 style 样式
    left: '0px', // 坐标x
    top: '0px', // 坐标y
    maxHeight: '0px', // 右键菜单的最高高度 (控制是否展开)
  },
})

// --------------- 所有方法
// 展开右键菜单
const right_showMenu = function (tab, event) {
  state.rightTargetData = tab // 绑定操作tab
  const e = event || window.event
  // 根据缩放比例调整坐标
  state.rightStyle.left = e.clientX / props.sacle_x + 1 + 'px' // 设置给坐标x
  state.rightStyle.top = e.clientY / props.sacle_y + 'px' // 设置给坐标y
  state.rightShow = true // 显示右键菜单
  nextTick(function () {
    const foxHeight = document.querySelector('.right-box-2')?.offsetHeight // 应该展开多高
    state.rightStyle.maxHeight = foxHeight + 'px' // 展开
    document.querySelector('.right-box')?.focus() // 获得焦点,以被捕获失去焦点事件
  })
}

// 关闭右键菜单 - 立即关闭
const right_closeMenu = function () {
  state.rightStyle.maxHeight = '0px'
  state.rightShow = false
}

// 关闭右键菜单 - 带动画折叠关闭 (失去焦点和点击取消时调用, 为什么不全部调用这个? 因为其它时候调用这个都太卡了)
const right_closeMenu2 = function () {
  state.rightStyle.maxHeight = '0px'
  // this.rightShow = false;
}

// 右键 - 打开视频
const right_open_video = function () {
  console.log('打开视频')
}

// 所有开放属性、方法
defineExpose({ right_showMenu })
</script>

<style lang="scss" scoped>
/* 右键菜单 样式 */
.right-box {
  position: fixed;
  z-index: 2147483647;
  transition: max-height 0.2s;
  outline: none;
  max-height: 0px;
  width: auto;
  overflow: hidden;
  box-shadow: 0px 0px 5px #b8b8b8;
}
.right-box-2 {
  font-size: 0.8em;
  padding: 0.5em 0;
  border: 1px #aaa solid;
  border-radius: 1px;
  background-color: #fff;
  padding: 0;
}
.right-box-2 > div {
  line-height: 35px;
  padding-left: 20px;
  padding-right: 40px;
  cursor: pointer;
  white-space: nowrap;
}
.right-box-2 > div:hover {
  background-color: var(--table-header-bg-color);
  color: #2d8cf0;
}
.right-box-2 > div i {
  margin-right: 5px;
  transform: translate(0, 1px);
}
</style>

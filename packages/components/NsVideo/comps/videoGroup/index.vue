<template>
  <div class="split-box">
    <SplitIcon
      :type="activeIndex"
      v-model:activeIndex="activeIndex"
      width="100%"
      height="100%"
      :isVideo="true"
    >
      <template #video-view-slot="{ index, url, info }">
        <div
          class="live-player-box"
          :ref="(el) => videoDivRefHandler(el, index)"
          @dblclick="toggleFullScreen"
          @mouseover="showCloseBtnHandler(index)"
          @mouseleave="hideCloseBtnHandler(index)"
        >
          <span v-if="!url" class="no-signal">无信号</span>
          <component
            v-else
            :is="getVideoModel(info)"
            :ref="(el) => videoPlayerRefHandler(el, index)"
            :videoUrl="url"
            :MSE="videoConfig.MSE"
            :WCS="videoConfig.WCS"
            :WASM="videoConfig.WASM"
            :WASMSIMD="videoConfig.WASMSIMD"
            :loadTimeReplay="videoErrorMaxCount"
            :stretch="videoConfig.stretch"
            :hasAudio="videoConfig.hasAudio"
            :isLive="videoConfig.isLive"
            :playerIndex="index"
            :hkPath="info?.hkPath"
            @dblclick="toggleFullScreen"
            @error="messageHandler($event, index)"
            @urlError="urlErrorHandler($event, index)"
            @videoOriginalInfo="videoOriginalInfoHandler($event, index)"
            >
          </component>
          <el-button
            v-show="closeBtnStatusList[index] && !!url && showClose"
            @click="closeVideoHandler(index)"
            type="info"
            class="close-btn"
            >关闭</el-button
          >
          <div
            class="ctrl-box"
            v-if="showVideoCtrls"
            v-show="(activeIndex == 1 || isFullScreen) && closeBtnStatusList[index] && !!url"
          >
            <div class="ctrl-left">
              <el-icon class="ctrl-btn left" @mousedown="ctrlHandler('left', info)"
                ><CaretLeft
              /></el-icon>
              <el-icon class="ctrl-btn top" @mousedown="ctrlHandler('top', info)"
                ><CaretTop
              /></el-icon>
              <el-icon class="ctrl-btn right" @mousedown="ctrlHandler('right', info)"
                ><CaretRight
              /></el-icon>
              <el-icon class="ctrl-btn bottom" @mousedown="ctrlHandler('bottom', info)"
                ><CaretBottom
              /></el-icon>
              <el-icon
                class="ctrl-btn speak"
                :class="[speakStatue ? 'running' : '']"
                @mousedown="ctrlHandler('speak', info)"
                ><Microphone
              /></el-icon>
              <div class="ctrl-btn-speed">
                <span class="speed-title">速度：</span>
                <el-slider
                  class="slid-btn"
                  v-model="slidValue"
                  :step="5"
                  :max="255"
                  :show-tooltip="false"
                  @change="slidHandler(info)"
                />
              </div>
            </div>
            <div class="ctrl-right">
              <el-icon class="ctrl-btn zoom-in" @mousedown="ctrlHandler('zoom-in', info)"
                ><ZoomIn
              /></el-icon>
              <el-icon class="ctrl-btn zoom-out" @mousedown="ctrlHandler('zoom-out', info)"
                ><ZoomOut
              /></el-icon>
              <el-icon class="ctrl-btn scan" @mousedown="ctrlHandler('scan', info)"
                ><Files
              /></el-icon>
              <el-icon class="ctrl-btn cruise" @mousedown="ctrlHandler('cruise', info)"
                ><MapLocation
              /></el-icon>
              <el-icon class="ctrl-btn call" @mousedown="ctrlHandler('call', info)"
                ><VideoCamera
              /></el-icon>
            </div>
          </div>
          <template v-if="injectedSlots?.['video-player-cover']">
            <component :is="injectedSlots['video-player-cover']" />
          </template>
        </div>
      </template>
    </SplitIcon>
  </div>
</template>
<script setup lang="ts">
import SplitIcon from '../group/SplitIcon.vue'
// import LivePlayer from '@liveqing/liveplayer-v3'

// console.log('---------------->', LivePlayer)

import { ElMessage } from 'element-plus'
import { nextTick, inject, ref, defineProps, onMounted, onUnmounted, computed } from 'vue'
import EasyPlayView  from './player/EasyPlay.vue'
import HKPlayView  from './player/HKPlay.vue'

const injectedSlots = inject('slots')

const videoModelsInfo = ref({
  easyplayer: {
    name: 'easyplayer',
    player: EasyPlayView,
  },
  hk: {
    name: 'hk',
    player: HKPlayView,
  },
})

// 视频类型
const videoModel = inject('videoModel')
// 选中的分屏模式
const activeIndex = inject('activeIndex')
const videoCtrlFun = inject('videoCtrlFun')
const showVideoCtrls = inject('showVideoCtrls')
// 控制缩放slid
const slidValue = inject('slidValue')
const hasFullScreen = inject('hasFullScreen')

const emits = defineEmits(['removeVideo' , 'errorVideo', 'urlError', 'videoOriginalInfo'])

// 分屏的播放器实例
const videoDivRefs = ref({})
// 分屏的播放器实例
const videoPlayerRefs = ref({})
// 分屏的关闭按钮状态
const closeBtnStatusList = ref([])
// 关闭按钮
const showClose = inject('showClose') + '' === 'true'

const isFullScreen = ref(false)

/* const getVideoModel = computed(() => {
  return videoModelsInfo.value?.[videoModel]?.player
})
 */

 /**
  * 播放器类型
  */
function getVideoModel(info) {
  if(!!info?.videoModel) {
    return videoModelsInfo.value?.[info.videoModel]?.player
  }
  return videoModelsInfo.value?.[videoModel]?.player
}

const props = defineProps({
  videoErrorMaxCount: {
    type: Number,
    default: 3,
  },
  videoConfig: {
    type: Object,
    default: () => {},
  },
})

function messageHandler(e, index) {
  emits('errorVideo', index, false)
}

function urlErrorHandler(e, index) {
  emits('urlError', index)
}
function videoOriginalInfoHandler(e, index) {
  emits('videoOriginalInfo', e, index)
}

function videoDivRefHandler(el, index) {
  if (el) {
    videoDivRefs.value[index] = el
  }
}

function videoPlayerRefHandler(el, index) {
  if (el) {
    videoPlayerRefs.value[index] = el
  }
}

function customButtonsHandler(name, index, url) {
  const ele = videoDivRefs.value?.[index]
  if (ele) {
    const event = new MouseEvent('dblclick', { bubbles: true, cancelable: true, test: false })
    ele.dispatchEvent(event)
  }
}
function showCloseBtnHandler(index) {
  closeBtnStatusList.value[index] = true
}

function hideCloseBtnHandler(index) {
  closeBtnStatusList.value[index] = false
}

let clickCtrlStatus = false
const speakStatue = ref(false)
const ctrlInfoByMousedown = ref()

function ctrlHandler(type, info) {
  clickCtrlStatus = true
  ctrlInfoByMousedown.value = info
  if (type === 'left') {
    videoCtrlFun?.toLeft?.(info)
  } else if (type === 'right') {
    videoCtrlFun?.toRight?.(info)
  } else if (type === 'top') {
    videoCtrlFun?.toTop?.(info)
  } else if (type === 'bottom') {
    videoCtrlFun?.toBottom?.(info)
  } else if (type === 'zoom-in') {
    videoCtrlFun?.changeZoom?.(info, 1, slidValue.value)
  } else if (type === 'zoom-out') {
    videoCtrlFun?.changeZoom?.(info, -1, slidValue.value)
  } else if (type === 'speak') {
    speakStatue.value = true
    videoCtrlFun?.toSpeak?.(info)
  } else if (type === 'scan') {
    videoCtrlFun?.toScan?.(info)
  } else if (type === 'cruise') {
    videoCtrlFun?.toCruise?.(info)
  } else if (type === 'call') {
    videoCtrlFun?.toCall?.(info)
  }
}

function stopHandler() {
  if (clickCtrlStatus) {
    videoCtrlFun?.stop?.(ctrlInfoByMousedown.value)
  }
  clickCtrlStatus = false
  speakStatue.value = false
  ctrlInfoByMousedown.value = null
}

function slidHandler(info) {
  videoCtrlFun?.speed?.(info, slidValue.value)
}

function toggleFullScreen(index) {
  try {
    if(hasFullScreen + '' === 'false') {
      ElMessage.info('当前视频不支持全屏')
      return
    }
  } catch (error) {
    console.error(`配置是否全屏失败：`, error)
  }
  let target: any = null
  try {
    target = index?.currentTarget
  } catch (error) {
    console.error(`全屏/退出失败，`, error)
  }
  if (!target) {
    target = videoDivRefs.value?.[index]
  }
  if (!document.fullscreenElement) {
    isFullScreen.value = true
    if(target) {
      target.requestFullscreen()
    }
  } else {
    isFullScreen.value = false
    document?.exitFullscreen?.()
  }
}

// 新增全屏状态变化处理函数
function handleFullscreenChange() {
  if (!document.fullscreenElement) {
    isFullScreen.value = false
  } else {
    isFullScreen.value = true
  }
  nextTick(() => {
    const eles = document.querySelectorAll('[title="全屏"]')
    if (isFullScreen.value) {
      eles.forEach((ele) => {
        ele.innerHTML = '退出全屏'
      })
    } else {
      eles.forEach((ele) => {
        ele.innerHTML = '全屏'
      })
    }
  })
}

// 关闭的确视频时，退出全屏
function closeVideoHandler(index) {
  emits('removeVideo', index, false)
  // 退出全屏
  isFullScreen.value = false
}

// 在组件挂载时添加监听
onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('mouseup', stopHandler)
})

// 在组件卸载时移除监听
onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('mouseup', stopHandler)
})
</script>
<style lang="scss" scoped>
.split-box {
  margin-left: var(--matrix-video-margin-left);
  display: flex;
  align-items: center;
  .live-player-box {
    width: 100%;
    height: 100%;
    .no-signal {
      font-size: var(--matrix-video-font-size);
      position: absolute;
      display: block;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
    .close-btn {
      position: absolute;
      right: 10px;
      top: 10px;
      z-index: 9999;
    }
    .ctrl-box {
      cursor: default;
      position: absolute;
      display: flex;
      font-size: 34px;
      right: 50px;
      bottom: 50px;
      width: 200px;
      height: 150px;
      background-color: rgba(255, 255, 255, 0.6);
      border-radius: 10px;
      .running {
        color: var(--matrix-video-ctrl-running);
      }
      .ctrl-right {
        flex: none;
        width: 35%;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 10px 0;
        position: relative;

        .ctrl-btn {
          cursor: pointer;
          margin-top: 8px;
          font-size: 20px;
          &:first-child {
            margin-top: 0;
          }
        }
      }
      .ctrl-left {
        position: relative;
        flex: 1;
        .ctrl-btn-speed {
          display: flex;
          position: absolute;
          bottom: 8%;
          font-size: 14px;
          width: calc(100% - 20px);
          padding: 0 10px;
          align-items: center;
          .speed-title {
            color: #fff;
            display: block;
            width: 45px;
          }
          .slid-btn {
            flex: 1;
            width: 100%;
            font-size: 12px;
            :deep(.el-slider__button) {
              width: 10px;
              height: 10px;
            }
            :deep(.el-slider__runway) {
              height: 5px;
              background-color: #9c9c9c9c;
            }
            :deep(.el-slider__button-wrapper) {
              top: -15px;
            }
          }
        }
        .ctrl-btn {
          cursor: pointer;
          &.top {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
          }
          &.bottom {
            position: absolute;
            left: 50%;
            bottom: 30%;
            transform: translateX(-50%);
          }
          &.left {
            position: absolute;
            top: 35%;
            left: 5%;
            transform: translateY(-50%);
          }
          &.right {
            position: absolute;
            top: 35%;
            right: 5%;
            transform: translateY(-50%);
          }
          &.speak {
            font-size: 30px;
            position: absolute;
            top: 25%;
            left: 50%;
            transform: translateX(-50%);
          }
        }
      }
    }
  }
}
</style>

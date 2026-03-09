<template>
  <div
    class="rv-container"
    :id="`parent-hk-${videoRandomId}`"
    @mouseover="mouseoverHandler"
    @mouseleave="mouseleaveHandler"
  >
    <div class="video-container" :id="`hk-${videoRandomId}`"></div>
    <div class="video-mask" v-loading="videoLoading" element-loading-text="加载中..."></div>
    <div
      v-show="showBtn"
      ref="videoBtnRef"
      class="video-button"
      style="
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        background: rgba(255, 255, 255, 0.3);
      "
    >
      <div
        style="
          display: flex;
          align-items: center;
          justify-content: flex-end;
          width: 100%;
          height: 100%;
        "
      >
        <!-- <el-input v-model="urlInput" style="width: 50%;" placeholder="ws地址" />
        <el-button @click="handleUrlInput" type="primary">确定</el-button> -->
        <span title="全屏" class="full-title" @click="doEmits">全屏</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  onMounted,
  onUnmounted,
  nextTick,
  watch,
  defineExpose,
  inject,
  onBeforeUnmount,
} from 'vue'
import hkVideo from './hk/hkVideo.ts'
import { ElMessage } from 'element-plus'

const videoRandomId = parseInt(Math.random() * 999999999 + '')

const hkPath = inject('hkPath')
const videoModel = inject('videoModel')
console.warn('播放模式===>', videoModel)

const emits = defineEmits(['dblclick', 'error', 'urlError', 'videoOriginalInfo'])

const props = defineProps({
  // divId: {
  //   type: String,
  //   default: "video",
  // },
  hkPath: {
    type: Object,
    default: null,
  },
  splitNum: {
    type: Number,
    default: 1,
  },
  videoList: {
    type: Array,
  },
  videoUrl: {
    type: String,
    default: '',
  },
  playerIndex: {
    type: Number,
    default: -1,
  },
})

const videoBtnRef = ref()
const hkVideoRef = ref()
const splitNum = ref(1)
const currentIndex = ref(-1)
const hkVideoObj = ref()
const ysyVideoObj = ref(null)
const videoListNew = ref([])
const isNext = ref(true)
const urlInput = ref('')
const videoType = ref('0')

const showBtn = ref(false)
const btnTime = ref()
const videoLoading = ref(true)

watch(
  () => props.videoUrl,
  (val) => {
    changeVideo(val)
  },
  { immediate: true },
)

function mouseoverHandler() {
  showBtn.value = true
  if (btnTime.value) {
    clearTimeout(btnTime.value)
  }
}

function mouseleaveHandler() {
  btnTime.value = setTimeout(() => {
    showBtn.value = false
  }, 1000)
}

function doEmits() {
  emits('dblclick', props.playerIndex)
}

onMounted(() => {
  currentIndex.value = -1
  videoListNew.value = []
  isNext.value = true
  splitNum.value = props.splitNum

  nextTick(() => {
    initVideo()
  })
  setTimeout(() => {
    videoLoading.value = false
  }, 30 * 1000)
})

onBeforeUnmount(() => {
  closeAllVideo()
})

const changeSplitNum = (num) => {
  splitNum.value = num
  currentIndex.value = num === 1 ? -1 : 0
  isNext.value = true
  stopHk()
  nextTick(() => {
    initVideo()
    hkVideoObj.value.changeSplitNum(num)
    const hkVideo = props.videoUrl
    if (hkVideo) changeVideo(hkVideo)
  })
}
const initVideo = async () => {
  const { divId, clientWidth, clientHeight } = getVideoDom()
  hkVideoObj.value = new hkVideo({
    divId,
    splitNum: 1,
    width: clientWidth,
    height: clientHeight,
    szBasePath: props.hkPath || hkPath,
    windowEventSelect: changeIndex,
    pluginErrorHandler: pluginErrorHandler,
    firstFrameDisplay: firstFrameDisplay,
  })
}
function changeVideo(url) {
  nextTick(() => {
    // currentIndex.value = getNextIndex()
    // 海康视频
    if (!hkVideoObj.value) initVideo()
    console.log('海康视频信息')
    nextTick(() => {
      if (!hkVideoObj.value) {
        setTimeout(() => {
          hkVideoObj.value.realplay(url, 0)
        }, 200)
      } else {
        hkVideoObj.value.realplay(url, 0)
      }
    })
  })
}
const changeIndex = (index) => {
  console.log(index, 'index')
  if (splitNum.value !== 1) {
    currentIndex.value = index
    isNext.value = false
  }
}
const pluginErrorHandler = (index) => {
  console.log('播放超时')
  videoLoading.value = false
}

const firstFrameDisplay = (iWndIndex, iWidth, iHeight) => {
  console.log('海康开始播放')
  videoLoading.value = false
  emits('videoOriginalInfo', {
    width: iWidth,
    height: iHeight,
  })
}

const getNextIndex = () => {
  const totale = splitNum.value * splitNum.value
  if (splitNum.value === 1) {
    return 0
  } else {
    // 四宫格
    if (isNext.value) {
      return currentIndex.value < totale - 1 ? currentIndex.value + 1 : totale - 1
    } else {
      return currentIndex.value
    }
  }
}
const getVideoDom = () => {
  const dom = {
    divId: `hk-${videoRandomId}`,
    clientWidth: document.getElementById(`parent-hk-${videoRandomId}`).clientWidth,
    clientHeight: document.getElementById(`parent-hk-${videoRandomId}`).clientHeight,
  }
  console.log('视频容器信息', dom)
  return dom
}
const resize = () => {
  nextTick(() => {
    const dom = getVideoDom()
    if (hkVideoObj.value != null) hkVideoObj.value.reSize(dom.clientWidth, dom.clientHeight)
    if (ysyVideoObj.value != null) ysyVideoObj.value.reSize(dom.clientWidth, dom.clientHeight)
  })
}
const closeAllVideo = () => {
  stopHk()
  // changeSplitNum(1);
  videoListNew.value = []
}
const stopHk = () => {
  if (hkVideoObj.value) {
    hkVideoObj.value.stopAll()
  }
  hkVideoObj.value = null
}
/* const stopYsy = () => {
  if (ysyVideoObj.value != null) {
    ysyVideoObj.value.stop();
    ysyVideoObj.value = null;
  }
}; */
/* const stopFlv = () => {
  if (flvVideoObj.value != null) {
    flvVideoObj.value.pause();
    flvVideoObj.value.unload();
    flvVideoObj.value.detachMediaElement();
    flvVideoObj.value.destroy();
    flvVideoObj.value = null;
  }
}; */
defineExpose({
  splitNum,
  closeAllVideo,
  resize,
  changeIndex,
})

function handleUrlInput() {
  const info = {
    videoType: videoType.value,
    url: urlInput.value,
  }
  videoListNew.value = [info]
  changeVideo(videoListNew.value[videoListNew.value.length - 1])
}
</script>

<style scoped>
#qx-video {
  width: 100% !important;
  height: 100% !important;
}
</style>

<style scoped lang="scss">
.rv-container {
  position: relative;
  width: 100%;
  height: 100%;
}
.video-container {
  pointer-events: none;
  width: calc(100% - 2px);
  height: calc(100% - 2px);
  // width: 50%;
  // height: 50%;
}
.video-mask {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  width: 100%;
  height: 100%;
  :deep(.el-loading-mask) {
    background: transparent;
  }
}
.video-button {
  background-color: #9c9c9c;
  color: #000;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  height: 45px;
  position: relative;
  span {
    display: inline-block;
  }
}
.rv-content {
  width: 100%;
  height: calc(100% - 45px);
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: space-between;
  justify-content: space-between;

  .video-item2 {
    width: calc(50% - 10px);
    height: calc(50% - 10px);
    border: 1px solid #0055ff;
    cursor: pointer;
  }
  .video-item2-selected {
    border: 1px solid #ffcc00;
  }
}

.rv-content-qp {
  width: 100%;
  height: calc(100% - 45px);
  background: #000;
}

.video-item {
  width: 100%;
  // margin-bottom: 15px;
  height: 100%;
  border: 1px solid #0055ff;
}

.video-button {
  background-color: #9c9c9c;
  color: #000;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  height: 45px;
  // margin-right: 10px;
  position: relative;
  span {
    display: inline-block;
    width: 14px;
    height: 14px;
    margin-left: 10px;
  }
  .full-title {
    font-size: 12px;
    width: auto;
    padding-right: 10px;
    color: #fff;
  }
  .video-sj {
    font-family: Microsoft YaHei;
    font-weight: 400;
    font-size: 14px;
    color: #1ccbfd;
    line-height: 22px;
    text-align: center;
    background: rgba(28, 203, 253, 0.1);
    border-radius: 4px;
    border: 1px solid #1ccbfd;
    padding: 0 5px 0 5px;
    position: absolute;
    left: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    img {
      display: inline-block;
      margin-right: 5px;
    }
  }
  .video-sj-1 {
    font-family: Microsoft YaHei;
    font-weight: 400;
    font-size: 14px;
    color: #fff;
    line-height: 22px;
    text-align: center;
    background: rgba(28, 203, 253, 0.1);
    border-radius: 4px;
    border: 1px solid #fff;
    padding: 0 5px 0 5px;
    position: absolute;
    left: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    img {
      display: inline-block;
      margin-right: 5px;
    }
  }
}
.font-class {
  font-family: Microsoft YaHei;
  font-weight: 400;
  font-size: 14px;
  color: #1ccbfd;
  line-height: 18px;
  .title {
    width: 24px;
    height: 24px;
    background: rgba(28, 203, 253, 0.1);
    border-radius: 50%;
    border: 1px solid #1380b8;
    text-align: center;
    line-height: 24px;
  }
}
.position-loading-class-4-1 {
  height: calc(50% - 2.8rem);
  width: 50%;
  position: absolute;
  z-index: 9999;
}
.position-loading-class-4-2 {
  height: calc(50% - 2.8rem);
  width: 50%;
  z-index: 9999;
  position: absolute;
  left: 50%;
}
.position-loading-class-4-3 {
  height: calc(50% - 2.8rem);
  width: 50%;
  z-index: 9999;
  position: absolute;
  top: 50%;
}
.position-loading-class-4-4 {
  height: calc(50% - 2.8rem);
  width: 50%;
  z-index: 9999;
  position: absolute;
  top: 50%;
  left: 50%;
}

// 9宫格
.position-loading-class-9-0 {
  height: calc(33% - 2.6rem);
  width: 33%;
  z-index: 9999;
  position: absolute;
}
.position-loading-class-9-1 {
  height: calc(33% - 2.6rem);
  width: 33%;
  z-index: 9999;
  position: absolute;
  left: 33%;
}
.position-loading-class-9-2 {
  height: calc(33% - 2.6rem);
  width: 33%;
  z-index: 9999;
  position: absolute;
  left: 66%;
}
.position-loading-class-9-3 {
  height: calc(33% - 2.6rem);
  width: 33%;
  z-index: 9999;
  position: absolute;
  top: 33%;
}
.position-loading-class-9-4 {
  height: calc(33% - 2.6rem);
  width: 33%;
  z-index: 9999;
  position: absolute;
  top: 33%;
  left: 33%;
}
.position-loading-class-9-5 {
  height: calc(33% - 2.6rem);
  width: 33%;
  z-index: 9999;
  position: absolute;
  top: 33%;
  left: 66%;
}
.position-loading-class-9-6 {
  height: calc(33% - 2.6rem);
  width: 33%;
  z-index: 9999;
  position: absolute;
  top: 66%;
}
.position-loading-class-9-7 {
  height: calc(33% - 2.6rem);
  width: 33%;
  z-index: 9999;
  position: absolute;
  top: 66%;
  left: 33%;
}
.position-loading-class-9-8 {
  height: calc(33% - 2.6rem);
  width: 33%;
  z-index: 9999;
  position: absolute;
  top: 66%;
  left: 66%;
}
</style>

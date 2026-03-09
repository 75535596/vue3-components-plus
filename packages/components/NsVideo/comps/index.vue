<template>
  <div class="video-player-view">
    <slot name="video-tree" v-if="showTree">
      <div class="video-tree">
        <el-tree
          class="tree-view"
          ref="treeRef"
          :node-key="treeNodeKey"
          :data="treeData"
          :expand-on-click-node="false"
          :props="treeOptions"
          :default-expanded-keys="treeExpandedKeys"
          @node-click="treeNodeAction"
          @node-contextmenu="treeRightMenu"
          @node-expand="treeExpand"
        >
          <!-- 判断节点对应的视频是否在播放 -->
          <template #default="{ node, data }">
            <div
              class="tree-node"
              :style="{
                background: data?.[treeOptions.background]
                  ? `url(${data[treeOptions.background]}) no-repeat top left / 100% 100%`
                  : '',
              }"
            >
              <span
                :class="['tree-node-icon', getTreeNodeIcon(data?.[treeOptions.icontype])]"
              ></span>
              <span
                class="tree-node-title"
                v-sline
                :class="{ 'tree-node-playing': checkTreeNodeIsPlayHandler(data) }"
                >{{ data[treeOptions.label] }}</span
              >
            </div>
          </template>
        </el-tree>
      </div>
    </slot>
    <div class="player-container">
      <slot name="video-player-head" v-if="showVideoSplit">
        <SplitIconGroup class="video-player-head" :videoSplitUseIcon></SplitIconGroup>
      </slot>
      <slot
        name="video-player-view"
        :videoConfig
        :videoInfos="videoInfos"
        :activeIndex="activeIndex"
        :fouceIndex="fouceIndex"
        :getCurrentVideoUrl="getCurrentVideoUrl"
      >
        <SplitVideoGroup
          :class="['video-player-center', !showTree ? 'no-tree' : '']"
          :videoConfig
          :videoErrorMaxCount
          @removeVideo="removeVideo"
          @errorVideo="errorVideo"
          @urlError="urlError"
          @videoOriginalInfo="videoOriginalInfo"
        ></SplitVideoGroup>
      </slot>
      <slot name="video-player-foot"> </slot>
    </div>
    <!-- 右键菜单 -->
    <Teleport to="body">
      <com-right-menu ref="comRightMenuRef" :rightMenus="rightMenus"></com-right-menu>
    </Teleport>
  </div>
</template>
<script setup lang="ts" name="NsVideo">
import {
  computed,
  nextTick,
  ref,
  defineProps,
  defineEmits,
  defineExpose,
  watch,
  provide,
  useSlots
} from 'vue'
import ComRightMenu from './videoRightMenu.vue'
import SplitIconGroup from './group/index.vue'
import SplitVideoGroup from './videoGroup/index.vue'
import { ctrlApis } from './ctrlActionApi'

const slots = useSlots()
provide('slots', slots)

const props = defineProps({
  // 视频类型， easyplayer / hk
  videoModel: {
    type: String,
    default: 'easyplayer',
  },
  hkPath: {
    type: String,
    default: '/js/h5player',
  },
  // 显示视频关闭按钮
  showClose: {
    type: Boolean,
    default: true,
  },
  // 是否支持全屏
  hasFullScreen: {
    type: Boolean,
    default: true,
  },
  // 显示树
  showTree: {
    type: Boolean,
    default: true,
  },
  // 树数据
  treeData: {
    type: Array,
    default: () => [],
    required: true,
  },
  // ！！！树节点key
  treeNodeKey: {
    type: String,
    default: 'label',
  },
  // 树节点展开
  treeExpandedKeys: {
    type: Array,
    default: () => [],
  },
  // 树节点属性 (videoUrlKey值要和treeData中的播放地址key一致, 默认为url)
  treeOptions: {
    type: Object,
    default: () => ({
      icontype: 'icontype',
      background: 'background',
      videoUrlKey: 'url',
      children: 'children',
      label: 'label',
    }),
  },
  // 显示分屏按钮
  showVideoSplit: {
    type: Boolean,
    default: true,
  },
  // 分屏使用图标
  videoSplitUseIcon: {
    type: Boolean,
    default: true,
  },
  // 显示方向控制按钮
  showVideoCtrls: {
    type: Boolean,
    default: false,
  },
  // 禁止控制按钮默认请求行为(默认false，true则不使用组件的发送请求仅调用自定义回调函数)
  stopVideoCtrlMethods: {
    type: Boolean,
    default: false,
  },
  // 分屏模式: 1: 单屏, 2: 四屏, 3: 九屏
  videoSplitType: {
    type: Number,
    default: 1,
  },
  // 播放模式: 1: 单击,2: 双击
  videoPlayModel: {
    type: Number,
    default: 1,
  },
  // 单个视频错误最大次数
  videoErrorMaxCount: {
    type: Number,
    default: 3,
  },
  // easyplayer配置 (默认一般不修改)
  videoConfig: {
    type: Object,
    default: () => {
      return {
        MSE: true,
        WCS: true,
        WASM: true,
        WASMSIMD: true,
        isLive: true,
        hasAudio: false,
        stretch: false,
      }
    },
  },
  // 获取、设置打开的播放视频信息
  videoInfos: {
    type: Array,
    default: () => [
      {
        index: 0,
      },
    ],
  },
  // ！！！ 单点播放
  videoSingleUrl: {
    type: Boolean,
    default: false,
  },
  // ！！！ 已经在播放的是否关闭后再点击打开(需要单点播 videoSingleUrl:true)
  videoSingleClose: {
    type: Boolean,
    default: false,
  },
  hasVideoRightMenu: {
    type: Boolean,
    default: false,
  },
  // 回调函数后是否继续执行默认播放操作
  callbackContinueExecute: {
    type: Boolean,
    default: true,
  },
  // 回调函数
  treeClick: {
    type: Function,
    default: null,
  },
  treeDBClick: {
    type: Function,
    default: null,
  },
  treeRightMenu: {
    type: Function,
    default: null,
  },
  treeExpand: {
    type: Function,
    default: null,
  },
  videoError: {
    type: Function,
    default: null,
  },
})

const treeRef = ref()

// 失败次数统计
let videoErrorInfos = {}

const emit = defineEmits([
  'videoOriginalInfo',
  'up',
  'down',
  'left',
  'right',
  'zoomin',
  'zoomout',
  'stop',
  'speed',
  'speak',
  'scan',
  'cruise',
  'call',
  'changeSplit',
])

const getTreeNodeIcon = (iconType: string) => {
  if (iconType === 'on') {
    return 'online'
  } else if (iconType === 'off') {
    return 'offline'
  }
  return ''
}

// 当前分屏类型的index，从1开始
const activeIndex = ref(props.videoSplitType)
// 当前的聚焦视频index
const fouceIndex = ref(0)
// 控制监控操作速度
const slidValue = ref(50)
// 调用操作控制的函数
const videoCtrlFun = {
  speed: (info, slidValue) => {
    console.log('speed: ', slidValue)
    ctrlCommand('speed', info, slidValue)
  },
  toTop: (info) => {
    console.log('up')
    ctrlCommand('up', info)
  },
  toBottom: (info) => {
    console.log('down')
    ctrlCommand('down', info)
  },
  toLeft: (info) => {
    console.log('left')
    ctrlCommand('left', info)
  },
  toRight: (info) => {
    console.log('right')
    ctrlCommand('right', info)
  },
  stop: (info) => {
    console.log('stop')
    ctrlCommand('stop', info)
  },
  changeZoom: (info, type, speed) => {
    console.log('changeZoom: ', type)
    if (type > 0) {
      ctrlCommand('zoomin', info, speed)
    } else if (type < 0) {
      ctrlCommand('zoomout', info, speed)
    }
  },
  toSpeak: (info) => {
    ctrlSpeak('speak', info)
  },
  toScan: (info) => {
    ctrlFunction('scan', info)
  },
  toCruise: (info) => {
    ctrlFunction('cruise', info)
  },
  toCall: (info) => {
    ctrlFunction('call', info)
  },
}

/**
 * 监控对讲
 * @param type
 * @param value
 */
function ctrlSpeak(type, info, value = null) {
  emit(type, info, value)
  if (props.stopVideoCtrlMethods) {
    return
  }
  const params = objectToString({
    url: ' ',
    deviceId: info?.deviceId ? info.deviceId : '',
    channelId: info?.channelId ? info.channelId : '',
  })
  fetch(`${ctrlApis?.speakUrl}?${params}`)
}

/**
 * 监控动作：调用、巡航、扫描
 * @param type
 * @param value
 */
function ctrlFunction(type, info, value = null) {
  emit(type, info, value)
  if (props.stopVideoCtrlMethods) {
    return
  }
  const params = objectToString({
    url: ' ',
    deviceId: info?.deviceId ? info.deviceId : '',
    channelId: info?.channelId ? info.channelId : '',
    functionType: type,
  })
  fetch(`${ctrlApis?.fnUrl}?${params}`)
}

/**
 * 监控移动：上、下、左、右、缩、放、速度
 * @param type
 * @param value
 */
function ctrlCommand(type, info, value = null) {
  emit(type, info, value)
  if (props.stopVideoCtrlMethods) {
    return
  }

  const params = objectToString({
    url: ' ',
    deviceId: info?.deviceId ? info.deviceId : '',
    channelId: info?.channelId ? info.channelId : '',
    command: type,
    horizonSpeed: slidValue.value,
    verticalSpeed: slidValue.value,
    zoomSpeed: slidValue.value,
  })
  fetch(`${ctrlApis?.commandUrl}?${params}`)
}

// 视频信息[{index:1, [videoUrlKey]:''}, ...]
const videoInfos = ref([{ index: 0, [props.treeOptions.videoUrlKey]: '' }])
// 监听传入的videoInfos播放数据
watch(
  () => props.videoInfos,
  (nv) => {
    console.log('传入的videoInfos----->', nv)
    nextTick(() => {
      const changeNv = checkVideoInfos(JSON.parse(JSON.stringify(nv)))
      videoInfos.value = changeNv
      videoErrorInfos = {}
    })
  },
  { immediate: true, deep: true },
)

watch(
  () => videoInfos.value,
  (nv) => {
    console.log('播放数据:', nv)
  },
  { immediate: true, deep: true },
)

// 监听传入的分屏类型
watch(
  () => props.videoSplitType,
  (nv) => {
    console.log('分屏方式:', nv)
    activeIndex.value = nv
    videoErrorInfos = {}
  },
  { immediate: true },
)

provide('videoModel', props.videoModel)
provide('hkPath', props.hkPath) // 海康js位置（需项目名称）
provide('videoUrlKey', props.treeOptions.videoUrlKey)
provide('activeIndex', activeIndex)
provide('fouceIndex', fouceIndex)
provide('videoInfos', videoInfos)
provide('videoCtrlFun', videoCtrlFun)
provide('showVideoCtrls', props.showVideoCtrls)
provide('slidValue', slidValue)
provide('showClose', props.showClose)
provide('hasFullScreen', props.hasFullScreen + '' === 'false' ? false : true)

watch(
  () => activeIndex.value,
  (nv) => {
    emit('changeSplit', nv)
  },
)

// 将对象转换为GET请求参数
function objectToString(obj) {
  return Object.keys(obj)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join('&')
}

/**
 * 检测视频信息是否合规
 * @param data
 */
function checkVideoInfos(data) {
  const differenceCount = Math.pow(activeIndex.value, 2)
  // 先排序
  data.sort((a, b) => a.index - b.index)
  // 清除 index 大于 differenceCount - 1 的数据
  data = data.filter((item) => item.index <= differenceCount - 1)
  // 添加缺少的 index 值
  for (let i = 0; i < differenceCount; i++) {
    if (!data.some((item) => item.index === i)) {
      data.push({ index: i, [props.treeOptions.videoUrlKey]: '' })
    }
  }
  // 再排序
  data.sort((a, b) => a.index - b.index)
  return data
}

const comRightMenuRef = ref(null)

const rightMenus = ref([
  {
    name: '打开监控',
    callback: openVideo,
  },
])

function openVideo(val) {
  if (val?.[props.treeOptions.videoUrlKey]) {
    setVideoUrl(val[props.treeOptions.videoUrlKey], true, fouceIndex.value, val)
  }
}

const treeExpand = computed(() => {
  return props.treeExpand || treeExpandHandler
})

const treeRightMenu = (event, val) => {
  if (!props.hasVideoRightMenu) {
    return
  }
  if (props.treeRightMenu) {
    props.treeRightMenu(event, val)
    if (props.callbackContinueExecute) {
      treeRightMenuHandler(event, val)
    }
  } else {
    treeRightMenuHandler(event, val)
  }
}

const dbClickInfo = {
  dbTime: 200,
  timeOut: null,
}

/**
 * 单击/双击操作
 */
function treeNodeAction(val) {
  if (!dbClickInfo.timeOut) {
    dbClickInfo.timeOut = setTimeout(() => {
      dbClickInfo.timeOut = null
      if (props.treeClick) {
        props.treeClick(val)
        if (props.callbackContinueExecute) {
          treeNodeClickHandler(val)
        }
      } else {
        treeNodeClickHandler(val)
      }
      // props.treeClick?.(val) || treeNodeClickHandler(val);
    }, dbClickInfo.dbTime)
  } else {
    clearTimeout(dbClickInfo.timeOut)
    dbClickInfo.timeOut = null
    if (props.treeDBClick) {
      props.treeDBClick(val)
      if (props.callbackContinueExecute) {
        treeNodeDBClickHandler(val)
      }
    } else {
      treeNodeDBClickHandler(val)
    }
    // props.treeDBClick?.(val) || treeNodeDBClickHandler(val);
  }
}

function treeNodeClickHandler(val) {
  console.log('单击')
  if (props.videoPlayModel == 1) {
    defalutPlay(val)
  }
}

function treeNodeDBClickHandler(val) {
  console.log('双击')
  // 单击模式时，双击后也能触发播放
  defalutPlay(val)
}

function defalutPlay(val) {
  if (val?.[props.treeOptions.videoUrlKey]) {
    setVideoUrl(val?.[props.treeOptions.videoUrlKey], true, fouceIndex.value, val)
  }
}

function versionHandler() {
  console.log('版本号:128')
}

function treeRightMenuHandler(event, val) {
  console.log('右键菜单')
  comRightMenuRef.value.right_showMenu(val, event)
}

function treeExpandHandler() {
  console.log('展开')
}

// 最近一次设置视频信息（为slot使用）
const getCurrentVideoUrl = ref({})

/**
 * 为当前聚焦的视频设置url
 * @param url 视频url, 设置''也能做到删除当前视频的功能
 * @param toNext 是否切换到下一个视频
 * @param index 设置哪个视频index，默认当前选中的视频
 * @param treeNodeInfo 树node节点信息
 */
function setVideoUrl(url, toNext = true, index = fouceIndex.value, treeNodeInfo = null) {
  getCurrentVideoUrl.value = {
    url,
    toNext,
    index,
    treeNodeInfo,
  }
  if (index == -1) {
    index = fouceIndex.value
  }
  const currentVideoInfo: any = videoInfos.value.find((item) => item.index === index)
  if (fouceIndex.value != index) {
    // 切换到设置视频的位置（可能存在bug，有问题则注释）
    fouceIndex.value = index
  }
  if (currentVideoInfo) {
    // 是否使用单例播放，一个视频只能在一个播放贴片中播放
    if (treeNodeInfo && props.videoSingleUrl) {
      const treeNodeInfoPlaying = videoInfos.value?.find(
        (item) => item.info?.[props.treeNodeKey] === treeNodeInfo?.[props.treeNodeKey],
      )
      if (treeNodeInfoPlaying) {
        treeNodeInfoPlaying[props.treeOptions.videoUrlKey] = ''
        delete treeNodeInfoPlaying.info
        // 如果是单例播放，则关闭其他播放的视频，并且不在播放，需要再点击相同节点才能播放
        if (props.videoSingleClose) {
          return
        }
      }
    }

    // 清除视频后再播放，避免出现播放失败的情况
    currentVideoInfo[props.treeOptions.videoUrlKey] = ''
    delete currentVideoInfo.info

    setTimeout(() => {
      currentVideoInfo[props.treeOptions.videoUrlKey] = url
      if (treeNodeInfo) {
        currentVideoInfo.info = treeNodeInfo
      }
    }, 250)
  }
  const maxCount =
    Object.values(videoInfos.value)[Object.values(videoInfos.value).length - 1]?.index >
    Math.pow(activeIndex.value, 2)
      ? Math.pow(activeIndex.value, 2) - 1
      : Object.values(videoInfos.value)[Object.values(videoInfos.value).length - 1]?.index
  if (maxCount > fouceIndex.value && toNext) {
    fouceIndex.value++
  }
}

/**
 * 删除视频
 * @param index 删除视频的index
 * @param toNext 是否切换到下一个视频
 */
function removeVideo(index, toNext = true) {
  setVideoUrl('', toNext, index)
  try {
    delete videoOriginalInfos.value[index]
  } catch (error) {
    console.warn('删除视频原始信息：', error)
  }
}

/**
 * 播放失败触发
 * @param index
 * @param toNext
 */
function errorVideo(index, toNext = true) {
  console.warn('播放失败：', index)
  if (props.videoErrorMaxCount <= 0) {
    removeVideo(index, toNext)
    props.videoError?.(index)
  } else {
    if (videoErrorInfos[index] == null || videoErrorInfos[index] == undefined) {
      videoErrorInfos[index] = { errors: 1 }
    } else {
      videoErrorInfos[index] = { errors: videoErrorInfos[index].errors + 1 }
    }
    console.warn('部分视频播放失败：', JSON.stringify(videoErrorInfos))
    for (const [k, v] of Object.entries(videoErrorInfos)) {
      if (v.errors >= props.videoErrorMaxCount) {
        v.errors = 0
        removeVideo(index, toNext)
        props.videoError?.(index)
        console.info(`关闭失败视频：${k}, (失败次数: ${v.errors})`)
      }
    }
  }
}

function urlError(index) {
  console.warn('【url错误】播放失败')
  removeVideo(index)
}

// 直播视频原始信息
const videoOriginalInfos = ref({})

function videoOriginalInfo(originalInfo, index){
  videoOriginalInfos.value[index] = originalInfo
  emit('videoOriginalInfo', videoOriginalInfos.value)
}

/**
 * 选中播放的树节点
 * @param node
 * @param data
 */
function checkTreeNodeIsPlayHandler(data) {
  let isPlay = false
  for (let i = 0; i < videoInfos.value.length; i++) {
    const selectTreeNode = videoInfos.value[i]
    const nodeKey = data?.[props?.treeNodeKey]
    if (selectTreeNode?.info && nodeKey && nodeKey == selectTreeNode.info?.[props?.treeNodeKey]) {
      isPlay = true
      break
    }
  }
  if (isPlay) {
    return 'tree-node-playing'
  } else {
    return ''
  }
}

function getOriginalInfo() {
  return videoOriginalInfos.value
}

defineExpose({ setVideoUrl, removeVideo, fouceIndex, videoInfos, treeRef, getOriginalInfo })
</script>
<style lang="scss" scoped>
div {
  position: relative;
}
.video-player-view {
  font-size: var(--matrix-video-font-size);
  display: flex;
  height: 100%;
  width: 100%;
  color: var(--matrix-video-text-color);
  overflow: hidden;
  .video-tree {
    width: 300px;
    box-sizing: border-box;
    border-right: 1px solid var(--matrix-video-tree-border-color);
    .tree-view {
      color: var(--matrix-video-tree-text-color);
      overflow: auto;
      height: 100%;
      background: var(--matrix-video-tree-bg-color);
      :deep(.el-tree-node.is-current) {
        // background: var(--matrix-video-tree-active-bg-color);
      }
      :deep(.el-tree-node__content) {
        background: transparent;
        height: 35px;
        &:hover {
          background: var(--matrix-video-tree-active-bg-color);
        }
      }
      :deep(.el-tree-node__expand-icon) {
        color: var(--matrix-video-tree-expand-icon-color);
      }
      :deep(.tree-node-playing) {
        color: var(--matrix-video-tree-selected-color);
        font-weight: 500;
      }
      :deep(.tree-node) {
        width: calc(100% - 30px);
        display: flex;
        align-items: center;
        .tree-node-title {
          font-size: var(--matrix-video-font-size);
        }
        .tree-node-icon {
          flex: none;
          &.online {
            width: 16px;
            height: 16px;
            margin-right: 5px;
            background: url(/packages/assets/imgs/online.png) no-repeat top left / 100% 100%;
          }
          &.offline {
            width: 16px;
            height: 16px;
            margin-right: 5px;
            background: url(/packages/assets/imgs/offline.png) no-repeat top left / 100% 100%;
          }
        }
      }
      :deep(.el-tree-node__content > .el-tree-node__expand-icon) {
        padding-right: 10px;
      }
    }
  }
  .player-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    .video-player-center {
      flex: 1;
      overflow: hidden;
      &.no-tree {
        margin-left: 0;
      }
    }
  }
}
</style>

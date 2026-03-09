<template>
  <div class="split-icon-container">
    <div
      v-for="videoInfo in isVideo ? videoInfos : count"
      :key="videoInfo"
      :class="[
        'icon-item',
        isFirst ? 'first' : '',
        isActive ? 'active' : '',
        isVideo ? 'video' : '',
        onlyOne ? 'only-one' : '',
        checkFouceIndex(videoInfo.index) ? 'fouce' : '',
      ]"
      @click="iconClick(videoInfo.index)"
    >
      <div class="video-view-bg">
        <slot
          v-if="isVideo"
          name="video-view-slot"
          :index="videoInfo.index"
          :url="videoInfo[videoUrlKey]"
          :info="videoInfo?.info"
        ></slot>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { inject, ref, defineProps, onMounted, watch } from 'vue'

interface VideoInfo {
  index: number
  [key: string]: any
}

const props = defineProps({
  type: {
    type: Number,
    default: 1,
  },
  width: {
    type: String,
    default: '20px',
  },
  height: {
    type: String,
    default: '20px',
  },
  isVideo: {
    type: Boolean,
    default: false,
  },
})

const videoUrlKey = inject<string>('videoUrlKey')
const activeIndex = inject<number>('activeIndex')
const fouceIndex = inject<number>('fouceIndex')
const videoInfos = inject<VideoInfo[]>('videoInfos')

const checkFouceIndex = (index: number) => {
  if (!props.isVideo) {
    return false
  }
  return fouceIndex.value == index
}

const _w = props.width
const _h = props.height

const isFirst = ref(false)
const onlyOne = ref(false)
const mixWidth = ref('100%')
const count = ref(1)
const isActive = ref(false)

function iconClick(index: number) {
  if (!props.isVideo) {
    activeIndex.value = props.type
  } else {
    fouceIndex.value = index
  }
}

const heightComputed = ref('100%')

watch(
  () => activeIndex.value,
  () => {
    isActive.value = activeIndex.value == props.type
    heightComputed.value = (100 / Number(activeIndex.value)).toFixed(2) + '%'
  },
  { immediate: true },
)

watch(
  () => props.type,
  () => {
    if (props.type == 1) {
      isFirst.value = true
      if (props.isVideo) {
        onlyOne.value = true
      }
    } else {
      onlyOne.value = false
    }
    count.value = Math.pow(props.type, 2)
    mixWidth.value = (100 / props.type).toFixed(2) + '%'
    // 根据count的个数初始化数组, 并且停止播放
    const resetInfo = new Array(count.value).fill(null).map((_, index) => ({
      index,
      [videoUrlKey]: '',
    })) as VideoInfo[]
    fouceIndex.value = 0
    videoInfos.value = resetInfo
  },
  { immediate: true },
)

onMounted(() => {
  if (props.isVideo) {
    console.log('video初始化')
  }
})
</script>
<style lang="scss" scoped>
.split-icon-container {
  display: flex;
  flex-flow: row wrap;
  width: v-bind(_w);
  height: v-bind(_h);
  // margin: 0 5px;
  cursor: pointer;
  overflow: hidden;
  &:hover {
    .icon-item {
      background-color: var(--matrix-video-split-icon-hover-color);
      &.video {
        background-color: transparent;
      }
    }
  }
  .icon-item {
    flex: 1;
    position: relative;
    border: 1px solid #fff;
    background-color: var(--matrix-video-split-icon-color);
    min-width: v-bind(mixWidth);
    min-height: v-bind(mixWidth);
    box-sizing: border-box;
    &.active {
      background-color: var(--matrix-video-split-icon-active-color);
    }
    &.video {
      height: v-bind(heightComputed);
      background-color: transparent;
      border: var(--matrix-video-margin) solid transparent;
      &.fouce {
        box-sizing: border-box;
        .video-view-bg {
          border: var(--matrix-video-focus-border) solid
            var(--matrix-video-split-icon-focus-border-color);
        }
      }
      &.only-one {
        border: unset;
        box-sizing: unset;
        .video-view-bg {
          border: unset;
          box-sizing: unset;
        }
      }
      .video-view-bg {
        width: 100%;
        height: 100%;
        background-color: var(--matrix-video-split-icon-color);
      }
    }
    .video-default {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      .video-default-text {
        color: #fff;
      }
    }
  }
}
</style>

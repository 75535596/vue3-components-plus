<template>
  <div class="easy-player-view" ref="easyRef"></div>
</template>
<script setup lang="ts">
import { nextTick, inject, onUnmounted, reactive, ref, watch, watchEffect } from 'vue'

const props = defineProps({
  videoUrl: {
    type: String,
    default: '',
  },
  hasAudio: {
    type: Boolean,
    default: false,
  },
  MSE: {
    type: Boolean,
    default: true,
  },
  WCS: {
    type: Boolean,
    default: true,
  },
  WASM: {
    type: Boolean,
    default: true,
  },
  WASMSIMD: {
    type: Boolean,
    default: true,
  },
  loadTimeReplay: {
    type: Number,
    default: 3,
  },
  isLive: {
    type: Boolean,
    default: true,
  },
  digitalZoom: {
    type: Boolean,
    default: true,
  },
  stretch: {
    type: Boolean,
    default: true,
  },
  watermark: {
    type: String,
    default: '',
  },
  playerIndex: {
    type: Number,
    default: -1,
  },
})

console.info('----------初始化----------')

const emits = defineEmits(['dblclick', 'error', 'urlError', 'videoOriginalInfo'])

const videoModel = inject('videoModel')
console.warn('播放模式===>',videoModel)

const easyRef = ref()
const player = ref();

const playerInfo = reactive({
  config: {
    hasAudio: true,
    isLive: true,
    MSE: false,
    WCS: false,
  },
  isPlay: false,
})

watch(
  () => props.videoUrl,
  async (nv) => {
    if (nv) {
      onReplay(nv)
    }else {
      // 卸载
      await onDestroy();
    }
  },
  { immediate: true }
)

function onPlayer(videoUrl) {
  playerInfo.isPlay = true
  setTimeout(
    (url) => {
      if(player.value){
        player.value
          .play(url)
          .then(() => {})
          .catch((e) => {
            console.warn('播放错误:',e)
            emits('urlError')
          })
      }
    },
    200,
    videoUrl,
  )
}
function onDestroy() {
  try {
    return new Promise<void>((resolve) => {
      try {
        if (player.value) {
          player.value.destroy()
          player.value = null
        }
      } catch (error) {
        console.warn('销毁失败:',error)
      }
      setTimeout(() => {
        resolve()
      }, 100)
    })
  } catch (error) {
    setTimeout(() => {
      console.error('888==>onDestroy失败:',error)
      resolve()
    }, 100)
  }
}
function onReplay(videoUrl) {
  onDestroy().then(() => {
    setTimeout(() => {
      try {
        playCreate(videoUrl)
      } catch (error) {
        console.warn('播放容器错误:',error)
      }
    }, 200)
  })
}
async function playCreate(videoUrl) {
  let container = easyRef.value;
  if(container) {
    createPlay(container)
    onPlayer(videoUrl)
  }else {
    setTimeout(async ()=>{
      container = easyRef.value;
      await nextTick();
      createPlay(container)
      onPlayer(videoUrl)
    },500)
  }
}

function createPlay(container) {
  player.value = new EasyPlayerPro(container,{
      stretch: !props.stretch,
      MSE: props.MSE,
      WCS: props.WCS,
      WASM:props.WASM,
      WASMSIMD: props.WASMSIMD,
      isLive: props.isLive,
      loadTimeReplay: -1,
      hasAudio: props.hasAudio,
      bufferTime: 3, // 缓存时长
    });

    // 监听视频信息事件
    player.value.on('videoInfo', (videoOriginalInfo) => {
      try {
        console.log('视频原始信息:', videoOriginalInfo);
        emits('videoOriginalInfo', videoOriginalInfo)
      } catch (error) {
        console.warn('视频原始信息错误:',error)
      }
    })

    player.value.on('timeout', () => {
      console.error('播放器超时')
      // emits('error')
      appendLoading()
    })
    player.value.on('error', () => {
      console.error('播放器异常')
      // emits('error')
      appendLoading()
    })

    appendLoading()
}

function appendLoading() {
  setTimeout(async () => {
    const container = easyRef.value;
    await nextTick();
    if(container.querySelector('.easyplayer-loading-text')) {
      container.querySelector('.easyplayer-loading-text').innerHTML = '加载中...'
    }
    const rightMenus = container.querySelector('.easyplayer-controls-right')
    const fullBtn = rightMenus?.querySelector('.easyplayer-controls-item-wrap:last-child')
    if( !!fullBtn ) {
      const fullscreenBtn = document.createElement('span');
      fullscreenBtn.setAttribute('title', '全屏')
      fullscreenBtn.innerHTML = '全屏'
      fullscreenBtn.style.marginLeft = '8px'
      fullscreenBtn.style.fontSize = '14px'
      fullscreenBtn.style.zoom = '0.8'
      fullscreenBtn.style.position = 'relative';
      fullscreenBtn.style.top = '-1px';
      fullscreenBtn.addEventListener('click', doEmits);
      fullBtn.replaceChildren(fullscreenBtn);
    }
  }, 200)
}

function doEmits(){
  emits('dblclick', props.playerIndex)
}

onUnmounted(() => {
  onDestroy()
  console.warn('卸载成功')
})

</script>
<style lang="scss" scoped>
.easy-player-view {
  :deep(.easyplayer-loading-img) {
    display: none;
  }
  :deep(.easyplayer-zoom) {
    display: none !important;
  }
  :deep(.easyplayer-contextmenu-close) {
    display: none !important;
  }
  :deep(.easyplayer-contextmenu-version) {
    display: none !important;
  }
  :deep(.easyplayer-performance-panel) {
    zoom: 1 !important;
  }
}
</style>

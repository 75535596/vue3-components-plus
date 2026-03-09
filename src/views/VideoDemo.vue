<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'

const nsVideoRef = ref()

// 视频信息
const videoData = reactive({
  // videoModel: 'hk',
  // hkPath: '/martrix/cdn/h5player',
  // 显示视频关闭按钮
  showClose: true,
  // 是否支持全屏
  hasFullScreen: true,
  // 显示树
  showTree: true,
  // 树数据
  treeData: [
    {
      id: '1',
      label: '分组1',
      children: [
        {
          id: '11',
          label: '分组1-1',
          children: [
            {
              videoModel: 'easyplayer',
              id: '111',
              label: '视频A--1视频A--1视频A--1',
              url: 'ws://199.10.9.192:30200/rtp/34020000001110000001_34020000001320000003.live.flv',
              deviceId: 'a1',
              channelId: 'a11',
              icontype: 'on',
            },
            {
              id: 'D',
              label: '视频A--2',
              url: 'ws://199.10.9.192:30200/rtp/34020000001110000001_34020000001320000010.live.flv',
              deviceId: 'b1',
              channelId: 'b11',
              icontype: 'off',
            },
          ],
        },
        {
          id: 'b',
          label: '分组b',
          children: [
            {
              id: 'b1',
              label: '视频A--1视频A--1视频A--1视频A--1视频A--1视频A--1视频A--1视频A--1视频A--1视频A--1视频A--1视频A--1视频A--1视频A--1视频A--1视频A--1',
              url: 'ws://199.10.9.192:30200/rtp/34020000001110000001_34020000001320000003.live.flv',
              deviceId: 'a1',
              channelId: 'a11',
              icontype: 'on',
            },
            {
              id: 'b2',
              label: '视频A--2',
              url: 'ws://199.10.9.192:30200/rtp/34020000001110000001_34020000001320000015.live.flv',
              deviceId: 'b1',
              channelId: 'b11',
              icontype: 'off',
            },
            {
              id: 'b3',
              label: '视频A--3',
              url: 'ws://199.10.9.192:30200/rtp/34020000001110000001_34020000001320000009.live.flv',
              deviceId: 'c1',
              channelId: 'c11',
            },
          ],
        },
      ],

    },
    {
      id: 'xxx2',
      label: '视频Zxxxx2',
      url: 'ws://199.10.9.192:30200/rtp/34020000001110000001_34020000001320000009.live.flv',
      deviceId: '34020000001110000001',
      channelId: '34020000001320000003',
    },
  ],
  // 树节点对应的key(！！！用于改变选中后的颜色)
  treeNodeKey: 'id',
  // 树节点展开的key
  treeExpandedKeys: ['11'],
  // 树节点属性 (videoUrlKey值要和treeData中的播放地址key一致, 默认为url)
  treeOptions: {
    icontype: 'icontype',
    background: 'background',
    videoUrlKey: 'url',
    children: 'children',
    label: 'label',
  },
  // 获取、设置打开的播放视频信息
  videoInfos: [
    {
      index: 0,
      url: 'https://sf3-ttcdn-tos.pstatp.com/obj/developer/bytdance.flv',
      info: {
        videoModel: 'easyplayer',
        id: 'xxx2',
        url: 'https://sf3-ttcdn-tos.pstatp.com/obj/developer/bytdance.flv',
        deviceId: 'c1',
        channelId: 'c11',
      },
    },
    // {
    //   index: 1,
    //   url: 'ws://199.10.9.192:30200/rtp/34020000001110000001_34020000001320000015.live.flv',
    //   info: {
    //     videoModel: 'easyplayer',
    //     id: '222',
    //     url: 'ws://199.10.9.192:30200/rtp/34020000001110000001_34020000001320000015.live.flv',
    //     deviceId: 'c2',
    //     channelId: 'c11',
    //   },
    // },
    // {
    //   index: 2,
    //   url: 'ws://199.10.9.192:30200/rtp/34020000001110000001_34020000001320000009.live.flv',
    //   info: {
    //     videoModel: 'easyplayer',
    //     id: 'xxx2',
    //     url: 'ws://199.10.9.192:30200/rtp/34020000001110000001_34020000001320000009.live.flv',
    //     deviceId: 'c3',
    //     channelId: 'c11',
    //   },
    // },
    // {
    //   index: 3,
    //   url: 'ws://199.10.9.192:30200/rtp/34020000001110000001_34020000001320000008.live.flv',
    //   info: {
    //     videoModel: 'easyplayer',
    //     id: 'b3',
    //     url: 'ws://199.10.9.192:30200/rtp/34020000001110000001_34020000001320000008.live.flv',
    //     deviceId: 'c4',
    //     channelId: 'c11',
    //   },
    // },
  ],
  // ！！！ 单点播放
  videoSingleUrl: false,
  // ！！！ 已经在播放的是否关闭后再点击打开(需要单点播 videoSingleUrl:true)
  videoSingleClose: false,
  // 回调函数后是否继续执行默认播放操作
  callbackContinueExecute: true,
  // 播放模式: 1: 单击,2: 双击
  videoPlayModel: 1,
  // 分屏模式: 1: 单屏, 2: 四屏, 3: 九屏
  videoSplitType: 1,
  // 显示分屏按钮
  showVideoSplit: true,
  // 分屏使用图标
  // videoSplitUseIcon: true,
  // 显示方向控制按钮
  showVideoCtrls: false,
  // 禁止控制按钮默认请求行为(默认false，true则不使用组件的发送请求仅调用自定义回调函数)
  stopVideoCtrlMethods: true,
  // 单个视频错误最大次数
  videoErrorMaxCount: 3,
  // easyplayer配置 (默认一般不需要配置, 加载不出来的时候修改)
  videoConfig: {
    MSE: true,
    WCS: true,
    WASM:true,
    WASMSIMD: true,
    isLive: true,
    hasAudio: false,
    stretch: false
  },
  // -----------事件回调-------------
  // 点击树节点的操作
  treeClick: () => {
    console.log('点击树节点回调函数')
  },
  // 双击树节点的操作
  treeDBClick: () => {
    console.log('双击树节点回调函数')
  },
  // 右键树展示菜单
  treeRightMenu: () => {
    console.log('右键树展示菜单')
  },
  // 展开树节点
  treeExpand: () => {
    console.log('展开树节点')
  },
  // 视频错误回调函数
  videoError: () => {
    console.log('视频错误回调函数')
  },
})

// 视频操作事件
const videoEvent = {
  videoOriginalInfo: (info: any) => {
    console.log('===============>视频原始信息:', info)
  },
  up: () => {
    console.log('视频向上移动操作')
  },
  down: () => {
    console.log('视频向下移动操作')
  },
  left: () => {
    console.log('视频向左移动操作')
  },
  right: () => {
    console.log('视频向右移动操作')
  },
  zoomin: () => {
    console.log('视频放大操作')
  },
  zoomout: () => {
    console.log('视频缩小操作')
  },
  stop: () => {
    console.log('视频停止操作')
  },
  speed: () => {
    console.log('设置视频移动速度')
  },
  speak: () => {
    console.log('视频开始说话')
  },
  scan: () => {
    console.log('视频扫描')
  },
  cruise: () => {
    console.log('视频巡航')
  },
  call: () => {
    console.log('视频调用')
  },
}

onMounted(() => {
  // setTimeout(() => {
  //   // ！！！暴露方法
  //   // nsVideoRef.value.[setVideoUrl / removeVideo / fouceIndex / videoInfos / treeRef]
  //   // 设置视频
  //   videoData.videoInfos = [
  //   {
  //     index: 1,
  //     url: 'ws://199.10.9.192:30200/rtp/34020000001110000001_34020000001320000004.live.flv',
  //     info: {
  //       videoModel: 'easyplayer',
  //       id: 'xxx',
  //       label: '视频A--3',
  //       url: 'ws://199.10.9.192:30200/rtp/34020000001110000001_34020000001320000004.live.flv',
  //       deviceId: 'c1',
  //       channelId: 'c11',
  //     },
  //   },
  // ]
  // // }, 3000)
  // setTimeout(() => {
  //   // 关闭视频方法1：
  //   nsVideoRef.value.removeVideo(7, true)
  //   // 关闭视频方法2：
  //   // nsVideoRef.value.setVideoUrl('', false, 7)
  // }, 5000)
  // 播放视频
  // nextTick(()=>{
  //   nsVideoRef.value.setVideoUrl('ws://199.10.9.192:30200/rtp/34020000001110000001_34020000001320000010.live.flv', false, 1, {
  //     videoModel: 'easyplayer',
  //     /* videoModel: 'hk',
  //     hkPath: '/xxxx', */
  //   })
  // })
})
function changeSplitHandler(num: number) {
  console.log('分屏模式：如1,2,3代表单屏，四屏，九屏', num)
}
</script>
<template>
  <div class="video-demo">
    <h1 class="title" style="color: #fff" v-sline>视频组件(国标28181 + 海康威视)</h1>
    <NsVideo class="nsvideo" ref="nsVideoRef" v-bind="videoData" v-on="videoEvent" @changeSplit='changeSplitHandler'>
      <!-- 自定义插槽
      <template #video-tree><span>左侧树-自定义插槽</span></template>
      <template #video-player-head><span>播放区域头部-自定义插槽</span></template>
      <template #video-player-view><span>播放区域主体-自定义插槽</span></template>
      <template #video-player-foot><span>播放区域底部控制按钮-自定义插槽</span></template>
      <template #video-player-cover><span>播放器canvas画布区域（除head+foot+tree区域）</span></template>
      -->
    </NsVideo>
  </div>
</template>
<style scoped lang="scss">
.video-demo {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #0f2a3b;
  .title {
    margin-bottom: 10px;
  }
}
</style>

视频播放器【支持多种不同播放器的视频在同一个组件种播放！！】

1. 复制播放器资源
   js文件夹 到 public/目录中
   cdn文件夹 到 public/目录中

2. index.html中引入
   <script src="./js/EasyPlayer-pro.js"></script>
   <script src="./cdn/h5player/h5player.min.js"></script>

3. 安装公共组件库 (安装过则无需安装)
   //@ts-ignore
   import NsComponents from 'vue3-components-plus'
   import 'vue3-components-plus/dist/vue3-components-plus.css'
   app.use(NsComponents)

4. 项目组件中引入视频组件, NsVideo组件配置参考NsVideo目录ReadMe.md和VideoDemo.vue
   <template>
      <NsVideo class="nsvideo" ref="nsVideoRef" v-bind="videoData" v-on="videoEvent" @changeSplit='changeSplitHandler'>
         <!-- 自定义插槽
         <template #video-tree><span>左侧树-自定义插槽</span></template>
         <template #video-player-head><span>播放区域头部-自定义插槽</span></template>
         <template #video-player-view><span>播放区域主体-自定义插槽</span></template>
         <template #video-player-foot><span>播放区域底部控制按钮-自定义插槽</span></template>
         -->
      </NsVideo>
   </template>

【配置参数方法】
// 视频播放器类型，easyplayer(默认) / hk
videoModel: 'hk',
// hk播放路径， 只有videoModel: 'hk' 才生效
hkPath: '/bigScreen/cdn/h5player',
// 显示视频关闭按钮
showClose: true,
// 显示树
showTree: true  
// 树数据  
treeData: [
   {
      label: '分组1',
      children: [{
         label: '分组1-1',
         children: [
            {
               // 【可选】 当前节点播放视频的播放器类型，easyplayer / hk， 优先级高于全局配置videoModel, 默认easyplayer
               videoModel: 'hk',
               // 【可选】 当前节点海康视频加载js的目录， 优先级高于全局配置hkPath
               hkPath: '/bigScreen/cdn/h5player',
               // 对应树节点的【treeNodeKey】 ，选中树节点必填
               id: '111',
               // 播放地址，必填
               url: 'https://sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/flv/xgplayer-demo-360p.flv',
               // 节点显示名称
               label: '视频A--1',
               // 用于控制设备、通道信息
               deviceId: 'a1',
               channelId: 'a11',
            },
         ],
      }],
   },
   {
      // 【可选】 当前节点播放视频的播放器类型，easyplayer / hk， 优先级高于全局配置videoModel, 默认easyplayer
      videoModel: 'hk',
      // 【可选】 当前节点海康视频加载js的目录， 优先级高于全局配置hkPath
      hkPath: '/bigScreen/cdn/h5player',
      // 对应树节点的【treeNodeKey】 ，选中树节点必填
      id: '111',
      // 播放地址，必填
      url: 'https://sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/flv/xgplayer-demo-360p.flv',
      // 节点显示名称
      label: '测试',
      deviceId: '34020000001110000001',
      channelId: '34020000001320000003',
   }
]
// 树节点对应的key(！！！用于改变选中后的颜色)
treeNodeKey: "id"
// 树节点属性(！！！注: videoUrlKey值要和treeData中的播放地址key一致, 默认为url)
treeOptions: {
   videoUrlKey: "url",
   children: "children",
   label: "label",
},
// 播放模式: 1: 单击,2: 双击
videoPlayModel: 1
// 分屏模式: 1: 单屏, 2: 四屏, 3: 九屏
videoSplitType: 1
// 回调函数后是否继续执行默认播放操作
callbackContinueExecute: true
// 点击树节点的操作
treeClick: function
treeDBClick: function
treeRightMenu: function
treeExpand: function
// 视频错误回调函数
videoError: function
// 视频错误最大次数
videoErrorMaxCount: 10
// 显示分屏按钮
showVideoSplit: true
// 显示方向控制按钮
showVideoCtrls: true
// 禁止控制按钮默认请求行为(默认false，true则不使用组件的发送请求仅调用自定义回调函数)
stopVideoCtrlMethods: false
// 视频配置项 (一般不需要修改)
videoConfig: {}
// 通过设置videoInfos, 做到从外部全部替换右侧分屏的视频内容
// (内容格式固定: [{index: 0, [treeOptions中设置的videoUrlKey]: 'ws://x'}, {index: 1, [treeOptions中设置的videoUrlKey]: 'ws://y'}])
videoInfos: [
   {
      // 播放index
      index: 3,
      // 视频地址
      url: 'ws://199.10.9.192:30200/rtp/34020000001110000001_34020000001320000001.live.flv',
      info: {
         // 【可选】 当前节点播放视频的播放器类型，easyplayer / hk， 优先级高于全局配置videoModel, 默认easyplayer
         videoModel: 'hk',
         // 【可选】 当前节点海康视频加载js的目录， 优先级高于全局配置hkPath
         hkPath: '/bigScreen/cdn/h5player',
         // 对应树节点的【treeNodeKey】 ，选中树节点必填
         id: '111',
         deviceId: 'c1',
         channelId: 'c11',
      },
   },
],

暴露事件：
// 控制按钮
@up=""
@down=""
@left=""
@right=""
@zoomin=""
@zoomout=""
@stop=""
@speed=""
@speak=""
@scan=""
@cruise=""
@call=""

函数:
1. 设置视频地址
方法1:
通过配置自动初始化：
videoInfos: [
   {
      // 播放index
      index: 3,
      // 视频地址
      url: 'ws://199.10.9.192:30200/rtp/34020000001110000001_34020000001320000001.live.flv',
      info: {
         // 【可选】 当前节点播放视频的播放器类型，easyplayer / hk， 优先级高于全局配置videoModel, 默认easyplayer
         videoModel: 'hk',
         // 【可选】 当前节点海康视频加载js的目录， 优先级高于全局配置hkPath
         hkPath: '/bigScreen/cdn/h5player',
         // 对应树节点的【treeNodeKey】 ，选中树节点必填
         id: '111',
         deviceId: 'c1',
         channelId: 'c11',
      },
   },
],
方法2:
setVideoUrl(url, toNext = true, index = fouceIndex.value, treeNodeInfo = null)
```
url: 设置''也能做到删除当前视频的功能; toNext: 是否切换到下一个视频; index: 设置哪个视频index, 默认当前选中的视频; treeNodeInfo: 树node节点信息
如果需要多种视频组件混合使用，全局配置的videoModel不能满足，就需要为treeNodeInfo单独设置videoModel：
treeNodeInfo = {
   // 【可选】 视频播放器类型，easyplayer(默认) / hk
   videoModel: 'hk',
   // 【可选】 hk播放路径， 只有videoModel: 'hk' 才生效
   hkPath: '/bigScreen/cdn/h5player',
   ...其他节点属性
}
```
nextTick(()=>{
   nsVideoRef.value.setVideoUrl('ws://199.10.9.192:30200/rtp/34020000001110000001_34020000001320000010.live.flv', false, 3, {
      videoModel: 'hk',
      hkPath: '/xxxx',
   })
})

2. 删除/关闭视频
方法1：
nextTick(()=>{
   nsVideoRef.value.removeVideo(7, true)
})
方法2：
nextTick(()=>{
   nsVideoRef.value.setVideoUrl('', false, 7)
})

插槽:
// 自定义左侧
video-tree
// 自定义头部
video-player-head
// 播放区域(一般不设置, 否则视频被替换)
video-player-view
// 控制按钮
video-player-foot

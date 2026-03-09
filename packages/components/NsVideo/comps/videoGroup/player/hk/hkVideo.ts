import { ref, reactive, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
export default class hkVideo {
  public hkVideoInfo: any
  constructor(options) {
    this.hkVideoInfo = reactive({
      open: false,
      player: null,
      splitNum: options.splitNum || 1,
      width: options.width || '500px',
      height: options.height || '500px',
      currentPlayUrl: '',
      mode: options.mode || 1, // 0普通模式， 1高级模式
    })
    this.createPlayer(options)
  }

  // 创建视频容器
  createPlayer(options) {
    this.hkVideoInfo.player = new window.JSPlugin({
      szId: options.divId,
      szBasePath: options.szBasePath, //"/bigScreen/cdn/h5player",
      iMaxSplit: 1,
      iCurrentSplit: 1,
      openDebug: true,
      oStyle: {
        borderSelect: 'none',
      },
    })
    // 设置播放容器的宽高并监听窗口大小变化
    window.addEventListener('resize', () => {
      this.hkVideoInfo.player.JS_Resize()
    })

    this.hkVideoInfo.player
      .JS_SetConnectTimeOut(this.hkVideoInfo.player.currentWindowIndex, 6000)
      .then(
        () => {},

        (err) => {
          console.error('播放6000秒超时')
          // do you want...
        },
      )

    // 事件回调绑定
    this.hkVideoInfo.player.JS_SetWindowControlCallback({
      windowEventSelect: function (iWndIndex) {
        //插件选中窗口回调
        console.log('windowSelect callback: ', iWndIndex)
        if (options.windowEventSelect) options.windowEventSelect(iWndIndex)
      },
      pluginErrorHandler: function (iWndIndex, iErrorCode, oError) {
        //插件错误回调
        console.log('海康播放器-插件错误回调: ', iWndIndex, iErrorCode, oError)
        if (options.pluginErrorHandler) options.pluginErrorHandler(iWndIndex)
      },
      windowEventOver: function (iWndIndex) {
        //鼠标移过回调
        //console.log(iWndIndex);
      },
      windowEventOut: function (iWndIndex) {
        //鼠标移出回调
        //console.log(iWndIndex);
      },
      windowEventUp: function (iWndIndex) {
        //鼠标mouseup事件回调
        //console.log(iWndIndex);
      },
      windowFullCcreenChange: function (bFull) {
        //全屏切换回调
        console.log('海康播放器-全屏切换回调: ', bFull)
      },
      firstFrameDisplay: function (iWndIndex, iWidth, iHeight) {
        //首帧显示回调
        console.log('海康播放器-首帧显示回调: ', iWndIndex, iWidth, iHeight)
        if (options.firstFrameDisplay) options.firstFrameDisplay(iWndIndex, iWidth, iHeight)
      },
      performanceLack: function () {
        //性能不足回调
        console.log('海康播放器-性能不足回调')
      },
      InterruptStream: (iWndIndex, interruptTime) => {
        //断流事件回调，interruptTime为秒级
        console.log('断流事件回调: ' + iWndIndex + 'interrupt time:' + interruptTime)
        // 断流时自动重新播放
        if (this.hkVideoInfo.currentPlayUrl) {
          console.log('检测到断流，尝试重新播放:', this.hkVideoInfo.currentPlayUrl)
          this.realplay(this.hkVideoInfo.currentPlayUrl, iWndIndex)
        }
      },
    })
    console.log('海康播放器-视频初始化')
  }
  // 开始播放
  realplay(playURL, index) {
    // const url1 = new URL(url)
    // const playURL = 'wss://' + window.location.host + '/wss/' + url1.pathname
    console.warn('视频播放地址：', playURL)
    // 保存当前播放URL，用于断流重连
    this.hkVideoInfo.currentPlayUrl = playURL
    this.hkVideoInfo.player.JS_Play(playURL, { playURL, mode: this.hkVideoInfo.mode }, index).then(
      () => {
        console.log('开始播放')
      },
      (e) => {
        console.error('海康播放器- error', e)
      },
    )
  }
  // 停止预览
  stop(index) {
    this.hkVideoInfo.player.JS_Stop(index).then(
      () => {
        console.log('停止预览')
      },
      (e) => {
        console.error(e)
      },
    )
  }
  // 停止预览
  stopAll() {
    this.hkVideoInfo.player.JS_StopRealPlayAll().then(
      () => {
        console.log('停止预览')
      },
      (e) => {
        console.error(e)
      },
    )
  }
  // 切换分屏
  changeSplitNum(splitNum) {
    this.hkVideoInfo.player.JS_ArrangeWindow(splitNum).then(
      () => {
        console.log(`切换分屏 success`)
      },
      (e) => {
        console.error(e)
      },
    )
  }
  // 全屏
  wholeFullScreen() {
    this.hkVideoInfo.player.JS_FullScreenDisplay(true).then(
      () => {
        console.log(`wholeFullScreen success`)
      },
      (e) => {
        console.error(e)
      },
    )
  }
  // 设置播放容器的宽高并监听窗口大小变化
  reSize(width, height) {
    this.hkVideoInfo.player.JS_Resize(width, height)
  }
}

import type { App } from 'vue'
import NsVideo from './comps/index.vue'
import { registerDirective } from '../../directives/index'

import '../../assets/martrix_iconfont/martrix_iconfont.css'

NsVideo.install = (app: App) => {
  app.component(NsVideo.name as string, NsVideo)
  try {
    registerDirective(app)
  } catch (error) {
    console.warn('组件库注册指令失败：',error)
  }
}

export default NsVideo

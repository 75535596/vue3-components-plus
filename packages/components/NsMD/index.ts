import type { App } from 'vue'
import NsMD from './index.vue'
import { registerDirective } from '../../directives/index'

NsMD.install = (app: App) => {
  app.component(NsMD.name as string, NsMD)
  try {
    registerDirective(app)
  } catch (error) {
    console.warn('组件库注册指令失败：',error)
  }
}

export default NsMD

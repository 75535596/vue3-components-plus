import type { App } from 'vue'
import NsExcel from './comps/index.vue'

NsExcel.install = (app: App) => {
  app.component(NsExcel.name as string, NsExcel)
}

export default NsExcel

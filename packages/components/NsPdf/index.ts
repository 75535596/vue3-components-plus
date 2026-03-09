import type { App } from 'vue'
import NsPdf from './comps/index.vue'

NsPdf.install = (app: App) => {
  app.component(NsPdf.name as string, NsPdf)
}

export default NsPdf

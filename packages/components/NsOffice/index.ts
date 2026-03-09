import type { App } from 'vue'
import NsOffice from './comps/index.vue'

NsOffice.install = (app: App) => {
  app.component(NsOffice.name as string, NsOffice)
}

export default NsOffice

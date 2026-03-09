import type { App } from 'vue'
import NsWord from './comps/index.vue'

NsWord.install = (app: App) => {
  app.component(NsWord.name as string, NsWord)
}

export default NsWord

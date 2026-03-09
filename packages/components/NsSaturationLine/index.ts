import type { App } from 'vue'
import NsSaturationLine from './comps/index.vue'

NsSaturationLine.install = (app: App) => {
  const componentName = NsSaturationLine.name || 'NsSaturationLine'
  app.component(componentName, NsSaturationLine)
}

export default NsSaturationLine

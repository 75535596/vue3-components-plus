import type { App } from 'vue'
import NsTableContainer from './comps/PageContainer.vue'
import NsSearch from './comps/PageSearch.vue'
import NsTable from './comps/PageTable.vue'

// 导出分页工具函数
export * from './comps/Pagination'

// 导出组件
export { NsTableContainer, NsSearch, NsTable }

// 为组件添加安装方法
NsTableContainer.install = (app: App) => {
  app.component('NsTableContainer', NsTableContainer)
}

NsSearch.install = (app: App) => {
  app.component('NsSearch', NsSearch)
}

NsTable.install = (app: App) => {
  app.component('NsTable', NsTable)
}

// 默认导出主组件
export default NsTableContainer

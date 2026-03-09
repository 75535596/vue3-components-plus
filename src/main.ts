import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'


const app = createApp(App)

// 安装 Element-Plus
import 'element-plus/dist/index.css'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
app.use(ElementPlus, {
  locale: zhCn,
})


// 本地(启用本地，还需要修改demo中的vue3-components-plus引入)
//@ts-expect-error
// import NsComponents from 'packages/index'
// import 'packages/assets/main.css'
// nexus获取
import NsComponents from 'vue3-components-plus'
import 'vue3-components-plus/dist/vue3-components-plus.css'
app.use(NsComponents)

app.use(createPinia())
app.use(router)

import '@/assets/main.css'
app.mount('#app')

import './assets/main.css'

import type { App } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import NsVideo from './components/NsVideo'
import NsExcel from './components/NsExcel'
import NsPdf from './components/NsPdf'
import NsWord from './components/NsWord'
import NsOffice from './components/NsOffice'
import { NsForm, NsFormTitle } from './components/NsForm'
import NsMD from './components/NsMD'
import NsSaturationLine from './components/NsSaturationLine'
import NsImage from './components/NsImage'
import NsImg from './components/NsImage'
import VueKonva from 'vue-konva';

import { registerDirective } from './directives'
import { setHttpApp, post, get, put, del, download, downLoadLocalFile, getTokenInfo } from './api/http.js'
export * from './utils';
import { loadCssVars } from './utils/loadCssVars.js'
// 弹出框组件及函数
import { NsDialog, setExternalApp, closeAllNsDialog } from './components/NsDialog/comps/index.js'
export { NsDialog, closeAllNsDialog }

// 导出组件
export { NsVideo, NsExcel, NsPdf, NsWord, NsOffice, NsForm, NsFormTitle, NsSaturationLine, NsImage, NsImg, NsMD }
// 兼容老版本命名
export { NsSaturationLine as NsSaturationline }

// 导出工具函数
export { sacle_x, sacle_y, autoScaleInit } from './components/NsAutoScreen'
export { loadAccess, removeDynamicAccess } from './utils/loadAccess'
export * from './utils/useTableSort'
export { getEncryptSm2 } from './utils/smUtils.js'
export { post, get, put, del, download, downLoadLocalFile, getTokenInfo }
// 动态表单上传组件相关
export { useFileUpload } from './components/NsForm'
// 获取动态表单节点
export { getAllFormNodeByKey, getAllFormKvData, getAllFormNodeRefByKey } from './components/NsForm'

// 阅读器vue3-pdf-app
import 'vue3-pdf-app/dist/icons/main.css'

export const components = {
  NsVideo,
  NsExcel,
  NsPdf,
  NsWord,
  NsOffice,
  NsForm,
  NsFormTitle,
  NsSaturationLine,
  NsSaturationline: NsSaturationLine,
  NsImage,
  NsImg,
  NsMD
}

const install = (app: App, _params = null) => {
  try {
    // 请求的base_url
    setHttpApp(app)
  } catch (error) {
    console.error('设置请求的base_url报错：', error)
  }

  // canvas画图组件
  try {
    app.use(VueKonva);
  } catch (error) {
    console.error('Konva加载失败：', error)
  }

  // 注册 Element-Plus 图标组件
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

  // 注册指令
  try {
    registerDirective(app)
    app.config.globalProperties.$__vue3ComponentsPlus_by__ = 'emh1eWluZw==';
  } catch (error) {
    console.error('注册指令失败：', error)
  }

  // 注册组件
  Object.keys(components).forEach((compName) => {
    app.component(compName, components[compName])
  })
  // 注册弹窗组件
  try {
    setExternalApp(app)
  } catch (error) {
    console.error('注册弹出框失败：', error)
  }
  try {
    window.NsDialog = NsDialog
  } catch (error) {
    console.error('window绑定NsDialog失败：', error)
  }
  // 获取css变量
  loadCssVars()
}

export { install }

export default {
  install,
  ...components,
}

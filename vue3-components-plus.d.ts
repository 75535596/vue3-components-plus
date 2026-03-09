// 全局类型定义文件，用于ESLint校验，放开所有限制

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.css' {
  const content: Record<string, string>
  export default content
}

declare module '*.scss' {
  const content: Record<string, string>
  export default content
}

declare module '*.less' {
  const content: Record<string, string>
  export default content
}

declare module '*.json' {
  const content: Record<string, any>
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.jpeg' {
  const content: string
  export default content
}

declare module '*.gif' {
  const content: string
  export default content
}

declare module '*.svg' {
  const content: string
  export default content
}

declare module '*.ico' {
  const content: string
  export default content
}

declare module '*.woff' {
  const content: string
  export default content
}

declare module '*.woff2' {
  const content: string
  export default content
}

declare module '*.ttf' {
  const content: string
  export default content
}

declare module '*.eot' {
  const content: string
  export default content
}

declare module '*.wasm' {
  const content: any
  export default content
}

// 引用HTTP请求相关类型定义
// 注意：这些类型已在 packages/api/types.d.ts 中详细定义

// 矩阵组件库类型声明
declare module 'vue3-components-plus' {
  import type { App } from 'vue'

  const components: {
    NsVideo: any
    NsExcel: any
    NsPdf: any
    NsWord: any
    NsOffice: any
    NsForm: any
    NsFormTitle: any
    NsSaturationLine: any
    NsSaturationline: any
    NsImage: any
    NsImg: any
    NsMD: any
  }

  const install: (app: App, params?: any) => void

  const NsDialog: any

  const sacle_x: any
  const sacle_y: any
  const autoScaleInit: any

  const loadAccess: any
  const removeDynamicAccess: any

  const getEncryptSm2: any

  /** GET请求函数 */
  const get: <T = any>(
    url: string,
    params?: Record<string, any>,
    base?: string,
    customConfig?: HttpCustomConfig,
    errorCallback?: ErrorCallback
  ) => Promise<T>

  /** POST请求函数 */
  const post: <T = any>(
    url: string,
    data?: any,
    base?: string,
    customConfig?: HttpCustomConfig,
    errorCallback?: ErrorCallback
  ) => Promise<T>

  /** PUT请求函数 */
  const put: <T = any>(
    url: string,
    data?: any,
    base?: string,
    customConfig?: HttpCustomConfig,
    errorCallback?: ErrorCallback
  ) => Promise<T>

  /** DELETE请求函数 */
  const del: <T = any>(
    url: string,
    data?: any,
    base?: string,
    customConfig?: HttpCustomConfig,
    errorCallback?: ErrorCallback
  ) => Promise<T>

  /** 下载文件函数 */
  const download: (
    url: string,
    filename?: string,
    method?: string,
    data?: any,
    base?: string,
    customConfig?: HttpCustomConfig,
    errorCallback?: ErrorCallback
  ) => Promise<any>

  /** 下载本地文件函数 */
  const downLoadLocalFile: (
    path: string,
    name: string,
    errorCallback?: ErrorCallback
  ) => void

  /** 获取Token信息函数 */
  const getTokenInfo: () => Record<string, string>

  export default {
    install,
    ...components
  }

  export {
    install,
    components,
    NsDialog,
    sacle_x,
    sacle_y,
    autoScaleInit,
    loadAccess,
    removeDynamicAccess,
    getEncryptSm2,
    post,
    get,
    put,
    del,
    download,
    downLoadLocalFile,
    getTokenInfo,
    NsVideo,
    NsExcel,
    NsPdf,
    NsWord,
    NsOffice,
    NsForm,
    NsFormTitle,
    NsSaturationLine,
    NsSaturationline,
    NsImage,
    NsImg,
    NsMD
  }
}

// 声明全局变量
declare global {
  interface Window {
    [key: string]: any
  }

  interface NodeRequire {
    context: any
  }

  const process: {
    env: {
      [key: string]: string | undefined
    }
  }
}

// 允许使用任意类型
declare type AnyType = any

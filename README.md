# vue3-components-plus  组件库

## 简介

vue3-components-plus  是一个功能丰富的 Vue 3 企业级组件库，提供办公文档预览、动态表单、视频播放、权限控制等完整解决方案。

**GitHub 源代码**: https://github.com/75535596/vue3-components-plus

组件使用示例参考 `dist/ComponentDemo`

## 📸 部分组件预览

### NsVideo

![emh1eWluZw==](https://tc-cdn.processon.com/po/605c2da663768970077b1422-695db61dbffe264705f9b033)

### NsDialog

![emh1eWluZw==](https://tc-cdn.processon.com/po/605c2da663768970077b1422-695db64084aa6b1f690b64aa)

### NsForm

![emh1eWluZw==](https://tc-cdn.processon.com/po/605c2da663768970077b1422-695db6559c0db14c9eab014d)

### NsTableContainer

![emh1eWluZw==](https://tc-cdn.processon.com/po/605c2da663768970077b1422-69b40ffd83c3c63c147141e1)

### NsOffice

![emh1eWluZw==](https://tc-cdn.processon.com/po/605c2da663768970077b1422-695db66d8dbb075444370b09)

![emh1eWluZw==](https://tc-cdn.processon.com/po/605c2da663768970077b1422-695db68829cd2a22227ba9e0)

![emh1eWluZw==](https://tc-cdn.processon.com/po/605c2da663768970077b1422-695db698af380f3b56b06c4b)

### NsMD

![emh1eWluZw==](https://tc-cdn.processon.com/po/605c2da663768970077b1422-695db6c1c5602355134e07c1)

### 自定义指令集

![emh1eWluZw==](https://tc-cdn.processon.com/po/605c2da663768970077b1422-695db6aa15bee62062d24bcb)

### 浸润线

![emh1eWluZw==](https://tc-cdn.processon.com/po/605c2da663768970077b1422-695db6d88dbb075444370b13)

## 📊 功能特性总结

### 组件功能

- ✅ **NsOffice**: 办公文档统一预览（Excel/PDF/Word）
- ✅ **NsForm**: 动态表单生成和管理
- ✅ **NsVideo**: 专业视频播放器
- ✅ **NsDialog**: 灵活弹窗对话框
- ✅ **NsPdf**: PDF文档预览和搜索
- ✅ **NsExcel**: Excel预览和编辑
- ✅ **NsWord**: Word文档预览
- ✅ **NsImage**: 图片预览
- ✅ **NsMD**: Markdown编辑器
- ✅ **NsSaturationline**: 浸润线
- ✅ **NsAutoScreen**: 自适应屏幕工具

### 指令功能

- ✅ **v-permission**: 按钮权限控制
- ✅ **v-length**: 输入长度和格式限制
- ✅ **v-sline**: 单行文本省略
- ✅ **v-event-unuse/use**: 事件穿透控制

### 工具函数

- ✅ **HTTP请求**: 完整的RESTful API封装
- ✅ **资源加载**: 动态JS/CSS资源管理
- ✅ **表格排序**: 表格排序功能
- ✅ **SM2加密**: 国密算法加密
- ✅ **CSS变量**: 主题样式管理
- ✅ **通用工具**: 常用工具函数


## 创建公共组件库步骤

- npm create vue@latest
- 主目录：创建packages（任意文件夹）, 创建全局导出文件index.ts

```typescript
// 主index.ts
import NsXX from './packages/NsXX/index.ts'
const components = { NsXX, 其他公共组件 }
const NsComponents = {
  install: (app: App)=> {
    Object.Keys(components).forEach((compName)=>{
      app.component(compName, components[compName])
    })
  }
}
// 按需导出
export {
  NsXX,
  其他公共组件
}
// 全局导入
export default NsComponents
```

- 子目录：NsXX目录，创建独立导出index.ts

```typescript
// 子index.ts：
import NsXX from './comps/index.ts'
// 按需导出
NsXX.install = (app)=>{
  app.component(NsXX.name, NsXX)
}
// 导出子组件
export default NsXX
```

- 配置package.json

```json
{
  "name": "vue3-components-plus",
  "version": "2.0.100",
  "private": false,
  "type": "module",
  "files": [
    "dist"
  ],
  "main": "./dist/vue3-components-plus.umd.cjs",
  "module": "./dist/vue3-components-plus.js",
  "exports": {
    "./dist/vue3-components-plus.css": "./dist/vue3-components-plus.css",
    "./css": "./dist/vue3-components-plus.css",
    ".": {
      "import": "./dist/vue3-components-plus.js",
      "require": "./dist/vue3-components-plus.umd.cjs"
    }
  },
  "publishConfig": {
    "registry": "http://199.10.9.178:8081/repository/npm-hosted/"
  }
}
```

- 配置vite.config.ts

```typescript
build: {
  outDir: "dist",
  lib: {
    // 指定入口主文件
    entry: fileURLToPath(new URL("./pacakges/index.ts"), import.meta.url),
    // 组件库导出后可以使用的全局变量
    name: 'MatrixComponents',
    // 不指定为package.json的name属性
    fileName: 'vue3-components-plus',
  },
  rollupOptions: {
    // 使用外部依赖（打包时删除的包，避免打入到组件库中）
    external: ["vue"],
    output: {
      // 主index.ts导出多个module时需要指定"named"否则报警告，默认为"default"
      exports: 'named',
      // 配合external: ["vue"]， 使用外部项目的变量映射
      globals: {
         vue: 'Vue',
      },
    }
  },
  // 【可选】压缩方式，viet3+需安装pnpm i terser -D
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true,
      drop_debugger: true,
    },
    format: {
      comments: false,
    },
  },
}
```

- 打包

```bash
npm run build
```

- 当前项目main.ts使用

```typescript
import NsComponents from '../dist/vue3-components-plus.js'
// 按需引入
// import {NsXX} from '../dist/vue3-components-plus,js'
...
app.use(NsComponents)
// 按需引入
// app.use(NsXX)
```

- 当前项目Test.vue使用

```vue
<template>
  <NsXX />
</template>
```

## 使用公共组件库

```bash
# 1. 引入组件库
pnpm i element-plus
pnpm i vue3-components-plus -S --registry=http://199.10.9.178:8081/repository/npm-group/
# 安装失败：pnpm i vue3-components-plus --registry=http://199.10.9.178:8081/repository/npm-hosted/

# 非初始化安装
pnpm i -S --registry=http://199.10.9.178:8081/repository/npm-group/
```

```typescript
// 2. main.ts中引入
// 安装 Element-Plus
import 'element-plus/dist/index.css'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
app.use(ElementPlus, {
  locale: zhCn,
})
// 安装组件库(ts需要//@ts-ignore)
//@ts-ignore
import NsComponents from 'vue3-components-plus'
import 'vue3-components-plus/dist/vue3-components-plus.css'
app.use(NsComponents)
```

## 📋 组件列表

### 1. NsOffice - 办公文档统一预览组件

支持格式：Excel(.xlsx/.xls)、PDF(.pdf)、Word(.docx/.doc)

```vue
<template>
  <!-- 基础使用 -->
  <NsOffice :url="fileUrl" />
  
  <!-- Excel编辑模式 -->
  <NsOffice :url="excelUrl" :isEdit="true" />
  
  <!-- 获取组件引用 -->
  <NsOffice ref="officeRef" :url="fileUrl" />
</template>

<script setup>
import { ref } from 'vue'
import { NsOffice } from 'vue3-components-plus'

const officeRef = ref()

// 获取文件类型
const fileType = officeRef.value?.getFileType() // 'excel' | 'pdf' | 'word' | 'unsupported'

// 获取当前激活的组件实例
const activeComponent = officeRef.value?.getActiveComponent()

// 刷新组件
officeRef.value?.refresh()
</script>
```

### 2. NsForm - 动态表单组件

```vue
<template>
  <NsForm :rows="formConfig" ref="formRef" />
</template>

<script setup>
import { ref } from 'vue'
import { NsForm } from 'vue3-components-plus'

const formRef = ref()
const formConfig = [
  {
    key: 'name',
    label: '姓名',
    component: 'el-input',
    props: { placeholder: '请输入姓名' }
  },
  {
    key: 'age',
    label: '年龄',
    component: 'el-input-number',
    props: { min: 0, max: 100 }
  }
]

// 获取表单数据
const formData = formRef.value?.getFormData()

// 重置表单
formRef.value?.resetForm()

// 验证表单
const isValid = formRef.value?.validate()
</script>
```

### 3. NsVideo - 视频播放组件

```vue
<template>
  <NsVideo 
    ref="nsVideoRef" 
    v-bind="videoData" 
    v-on="videoEvent" 
    @changeSplit='changeSplitHandler'
  >
    <!-- 自定义插槽 -->
    <template #video-tree><span>左侧树-自定义插槽</span></template>
    <template #video-player-head><span>播放区域头部-自定义插槽</span></template>
    <template #video-player-view><span>播放区域主体-自定义插槽</span></template>
    <template #video-player-foot><span>播放区域底部控制按钮-自定义插槽</span></template>
    <template #video-player-cover><span>播放器canvas画布区域（除head+foot+tree区域）</span></template>
  </NsVideo>
</template>

<script setup>
import { ref } from 'vue'
import { NsVideo } from 'vue3-components-plus'

const nsVideoRef = ref()

// 视频配置数据
const videoData = {
  // 显示视频关闭按钮
  showClose: true,
  // 是否支持全屏
  hasFullScreen: true,
  // 显示树
  showTree: true,
  // 树数据
  treeData: [
    {
      id: '1',
      label: '分组1',
      children: [
        {
          videoModel: 'easyplayer',
          id: '111',
          label: '视频A',
          url: 'ws://example.com/rtp/video.live.flv',
          deviceId: 'a1',
          channelId: 'a11',
          icontype: 'on',
        }
      ]
    }
  ],
  // 树节点对应的key
  treeNodeKey: 'id',
  // 树节点展开的key
  treeExpandedKeys: ['11'],
  // 树节点属性
  treeOptions: {
    icontype: 'icontype',
    background: 'background',
    videoUrlKey: 'url',
    children: 'children',
    label: 'label',
  },
  // 获取、设置打开的播放视频信息
  videoInfos: [
    {
      index: 0,
      url: 'https://example.com/video.flv',
      info: {
        videoModel: 'easyplayer',
        id: 'video1',
        url: 'https://example.com/video.flv',
        deviceId: 'c1',
        channelId: 'c11',
      },
    }
  ],
  // 单点播放
  videoSingleUrl: false,
  // 已经在播放的是否关闭后再点击打开
  videoSingleClose: false,
  // 播放模式: 1: 单击,2: 双击
  videoPlayModel: 1,
  // 分屏模式: 1: 单屏, 2: 四屏, 3: 九屏
  videoSplitType: 1,
  // 显示分屏按钮
  showVideoSplit: true,
  // 显示方向控制按钮
  showVideoCtrls: false,
  // 禁止控制按钮默认请求行为
  stopVideoCtrlMethods: true,
  // 单个视频错误最大次数
  videoErrorMaxCount: 3,
  // easyplayer配置
  videoConfig: {
    MSE: true,
    WCS: true,
    WASM: true,
    WASMSIMD: true,
    isLive: true,
    hasAudio: false,
    stretch: false
  },
  // 事件回调
  treeClick: () => { console.log('点击树节点') },
  treeDBClick: () => { console.log('双击树节点') },
  treeRightMenu: () => { console.log('右键树菜单') },
  treeExpand: () => { console.log('展开树节点') },
  videoError: () => { console.log('视频错误') },
}

// 视频操作事件
const videoEvent = {
  videoOriginalInfo: (info) => { console.log('视频原始信息:', info) },
  up: () => { console.log('向上移动') },
  down: () => { console.log('向下移动') },
  left: () => { console.log('向左移动') },
  right: () => { console.log('向右移动') },
  zoomin: () => { console.log('放大') },
  zoomout: () => { console.log('缩小') },
  stop: () => { console.log('停止') },
  speed: () => { console.log('设置速度') },
  speak: () => { console.log('开始说话') },
  scan: () => { console.log('扫描') },
  cruise: () => { console.log('巡航') },
  call: () => { console.log('调用') },
}

// 获取原始视频信息
const videoInfo = nsVideoRef.value?.getOriginalInfo()

// 设置视频URL
nsVideoRef.value?.setVideoUrl('ws://example.com/rtp/video.live.flv', false, 1, {
  videoModel: 'easyplayer'
})

// 移除视频
nsVideoRef.value?.removeVideo(1, true)

// 分屏变化回调
function changeSplitHandler(num) {
  console.log('分屏模式:', num)
}
</script>
```

**前置准备：**

1. 复制播放器资源：`js文件夹` 到 `public/` 目录中
2. 复制播放器资源：`cdn文件夹` 到 `public/` 目录中
3. 在 `index.html` 中引入：

```html
<script src="./js/EasyPlayer-pro.js"></script>
<script src="./cdn/h5player/h5player.min.js"></script>
```

### 4. NsDialog - 弹出框组件

```javascript
import { NsDialog, closeAllNsDialog } from 'vue3-components-plus'

// 打开对话框
NsDialog({
  title: '测试',
  // 任何组件添加 $emit('close') 时，会触发关闭弹出框事件
  dom: VideoDemo, // 也可以通过异步方式：import("@/views/VideoDemo.vue") 和 () => import("@/views/VideoDemo.vue")
  option: {
    // dom对应的自定义组件props属性
    ...data,
  },
  events: {
    // dom组件内部自定义事件emit('btnClick', xxx)
    btnClick: () => {
      console.log("点击中间区域内容");
    },
  },
  modalColor: 'rgb(0 21 115 / 20%)', // 遮罩层颜色
  width: '800px', // 宽度, 整个弹出框的高度，非内容高度
  height: '450px', // 高度, 不配置则默认为内容高度
  dialogPadding: [10, 20], // 弹窗内padding
  showFooter: true, // 默认显示底部按钮
  immediately: false, // true立即取消弹出框, false异步请求后取消弹出框，默认false
  draggable: true, // 是否可拖拽，默认false

  confirm: async (closeFn, componentRef, footerLoading) => { // 底部确认按钮回调事件
    // componentRef可以调用内部函数，前提需要defineExpose
    try{
      const selectRows = componentRef?.value?.getSelectedRows();
      console.log("点击确认，选择数据：", selectRows);
    } catch(e) {
      console.log(e)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    // footerLoading可以控制底部loading状态
    if(footerLoading) {
      footerLoading.value = false
    }
    // 请求数据，再关闭
    if(closeFn) {
      closeFn()
    }
  },
  close: () => { // 关闭弹出时立即出发
    console.log("点击关闭");
  },
  closed: () => { // 弹窗销毁时触发
    console.log("完成关闭");
  },
  // 头部+底部自定义配置
  headerDom: xxx,
  headerOption: {},
  headerEvents: {},
  footerDom: yyy,
  footerOption: {},
  footerEvents: {},
  // 底部按钮名称
  footerTitle: {
    close: "取消",
    confirm: "确定",
  },
}, true, '#app') // true为是否遮罩（非必填）， '#app'为挂载点（非必填）

// 关闭所有对话框
closeAllNsDialog()
```

### 5. NsPdf - PDF预览组件

```vue
<template>
  <NsPdf ref="pdfRef" :url="pdfUrl"></NsPdf>
</template>

<script setup>
import { ref } from 'vue'
import { NsPdf } from 'vue3-components-plus'

const pdfRef = ref()

// 搜索关键词
function searchKeyword() {
  pdfRef.value?.search('关键词')
}
</script>
```

### 6. NsExcel - Excel预览/编辑组件

```vue
<template>
  <NsExcel :url="excelUrl" :isEdit="true" />
</template>
```

### 7. NsWord - Word预览组件

```vue
<template>
  <NsWord :url="wordUrl" />
</template>
```

### 8. NsImage - 图片预览组件

```vue
<template>
  <NsImage :src="imageUrl" :defaultImg="defaultImage" />
</template>
```

### 9. NsMD - Markdown编辑器组件

```vue
<template>
  <NsMD v-model="markdownContent" />
</template>
```

### 10. NsSaturationline - 饱和度线组件

```vue
<template>
  <NsSaturationline :data="saturationData" />
</template>
```

### 11. NsAutoScreen - 自适应屏幕工具

```javascript
import { autoScaleInit, sacle_x, sacle_y } from 'vue3-components-plus'

// 初始化自适应
autoScaleInit(document.querySelector('body'), {
  designWidth: 1920,
  designHeight: 920,
  mode: 'stretch', // 可选 horizontal/vertical/stretch
});

// 获取缩放比例
const scaleX = sacle_x()
const scaleY = sacle_y()
```

## 🔧 自定义指令

### 1. v-permission - 按钮权限控制

```vue
<template>
  <!-- 使用class控制权限，无权限时隐藏 -->
  <el-button v-permission.class.display>查看</el-button>
  
  <!-- 使用id控制权限，无权限时隐藏 -->
  <el-button v-permission.id>编辑</el-button>
  
  <!-- 默认使用id控制权限 -->
  <el-button id="zuhu_list_add" v-permission>新增</el-button>
</template>

<script setup>
// 权限配置（需要在引入组件库之前设置）
import { createApp } from 'vue'

const app = createApp(App)

// 方式1：使用 provide/inject
const btnsPermission = ['zuhu_list_add', 'zuhu_list_edit', 'admin-btn']
app.provide('btnsPermission', btnsPermission)

// 方式2：使用全局属性
app.config.globalProperties.$btnsPermission = ['zuhu_list_add', 'zuhu_list_edit']

// 方式3：使用 sessionStorage（适用于动态权限）（推荐）
sessionStorage.setItem('btnsPermission', JSON.stringify(['zuhu_list_add', 'zuhu_list_edit']))

// 方式4：使用 localStorage（持久化权限）
localStorage.setItem('btnsPermission', JSON.stringify(['zuhu_list_add', 'zuhu_list_edit']))

app.use(NsComponents) // 引入组件库
</script>
```

#### 权限控制优先级说明

权限控制按以下优先级进行判断（从高到低）：

1. **sessionStorage** → `sessionStorage.getItem('btnsPermission')`
2. **localStorage** → `localStorage.getItem('btnsPermission')`
3. **全局属性** → `app.config.globalProperties.$btnsPermission`
4. **provide/inject** → `app.provide('btnsPermission', btnsPermission)`

#### 指令修饰符说明

- **v-permission** - 默认模式，使用 `id` 选择器，无权限时设置 `visibility: hidden`
- **v-permission.id** - 显式指定使用 `id` 选择器
- **v-permission.class** - 使用 `class` 选择器
- **v-permission.id.display** - 使用 `id` 选择器，无权限时设置 `display: none`
- **v-permission.class.display** - 使用 `class` 选择器，无权限时设置 `display: none`

#### 动态权限切换示例

```javascript
// 动态切换权限
function togglePermission() {
  // 获取当前权限列表
  let btnsPermission = JSON.parse(sessionStorage.getItem('btnsPermission')) || []
  
  // 添加新权限
  if (!btnsPermission.includes('delete_btn')) {
    btnsPermission.push('delete_btn')
  } else {
    // 移除权限
    btnsPermission = btnsPermission.filter(item => item !== 'delete_btn')
  }
  
  // 更新权限存储
  sessionStorage.setItem('btnsPermission', JSON.stringify(btnsPermission))
  
  // 刷新页面或重新渲染组件
  location.reload() // 或使用响应式更新
}
```

#### 实际应用场景

```vue
<template>
  <!-- 按钮组权限控制 -->
  <div class="toolbar">
    <el-button id="add_btn" v-permission type="primary">添加</el-button>
    <el-button id="edit_btn" v-permission type="success">编辑</el-button>
    <el-button id="delete_btn" v-permission type="danger">删除</el-button>
    <el-button id="export_btn" v-permission.id.display type="warning">导出</el-button>
    <el-button class="admin-btn" v-permission.class type="info">管理员</el-button>
  </div>
  
  <!-- 菜单权限控制 -->
  <el-menu>
    <el-menu-item index="1" id="dashboard_menu" v-permission>
      <span>仪表盘</span>
    </el-menu-item>
    <el-menu-item index="2" class="user-menu" v-permission.class>
      <span>用户管理</span>
    </el-menu-item>
  </el-menu>
</template>

<script setup>
// 权限配置示例
const app = createApp(App)

// 实际项目中，权限数据通常从后端获取
const userPermissions = {
  // 普通用户权限
  normal: ['add_btn', 'edit_btn', 'dashboard_menu'],
  // 管理员权限
  admin: ['add_btn', 'edit_btn', 'delete_btn', 'export_btn', 'admin-btn', 'user-menu']
}

// 根据用户角色设置权限
const userRole = 'admin' // 从登录信息获取
app.provide('btnsPermission', userPermissions[userRole])

app.use(NsComponents)
</script>
```

### 2. v-length - 输入长度限制

```vue
<template>
  <!-- 限制最大长度50（默认） -->
  <el-input v-length placeholder="请输入用户名" />
  
  <!-- 自定义长度限制 -->
  <el-input v-length="100" placeholder="最多100字符" />
  
  <!-- 仅允许输入数字 -->
  <el-input v-length.number="11" placeholder="请输入手机号" />
  
  <!-- 自定义正则表达式 -->
  <el-input v-length.regex="{ maxLength: 10, pattern: /^[a-zA-Z]*$/ }" placeholder="仅允许字母" />
  
  <!-- 数字范围限制 -->
  <el-input v-length.range="{ min: 0, max: 100, int: true, maxLength: 10 }" placeholder="0-100整数" />
</template>
```

### 3. v-sline - 单行文本省略

```vue
<template>
  <span v-sline>这是一段很长的文本内容，超出部分会自动显示省略号...</span>
</template>
```

### 4. v-event-unuse / v-event-use - 事件穿透控制

```vue
<template>
  <!-- 阻止事件穿透 -->
  <div v-event-use>
    <button>这个按钮可以点击</button>
  </div>
  
  <!-- 允许事件穿透 -->
  <div v-event-unuse>
    <div>这个区域的事件会穿透到下层</div>
  </div>
</template>
```

## 🔧 工具函数

### 1. 通用工具函数

```javascript
import { isNotNull } from 'vue3-components-plus'

// 检查值是否非空
const result = isNotNull(value) // 返回布尔值
```

### 2. 动态资源加载

```javascript
import { loadAccess, removeDynamicAccess } from 'vue3-components-plus'

// 加载JS/CSS资源
await loadAccess('https://example.com/script.js', 'script-tag', false)

// 移除动态加载的资源
removeDynamicAccess('script-tag')
```

### 3. CSS变量管理

```javascript
import { loadCssVars } from 'vue3-components-plus'

// 获取所有CSS变量
const cssVars = loadCssVars()
console.log(cssVars['--matrix-primary-color'])
```

### 4. 表格排序工具

```javascript
import { handleSortChange, headerClick, handleHeaderCellClass } from 'vue3-components-plus'

// 在表格组件中使用
<el-table
  @sort-change="(sort) => handleSortChange(sort, searchForm, getList)"
  @header-click="headerClick"
  :header-cell-class-name="(params) => handleHeaderCellClass(params, searchForm)"
>
  <!-- 表格内容 -->
</el-table>
```

### 5. SM2加密工具

```javascript
import { getEncryptSm2 } from 'vue3-components-plus'

// 使用SM2加密
const encrypted = getEncryptSm2(publicKey, ["xxx", "yyy"], isAdd04=false, cipherMode=1)
```

### 6. 动态表单工具函数

```javascript
import { 
  useFileUpload, 
  getAllFormNodeByKey, 
  getAllFormKvData, 
  getAllFormNodeRefByKey 
} from 'vue3-components-plus'

// 表单文件上传hook
const { uploadFile, deleteFile } = useFileUpload()

// 根据key获取表单节点信息
const formNode = getAllFormNodeByKey(formRows, 'username')

// 获取表单所有键值对数据
const formData = getAllFormKvData(formRows)

// 根据key获取表单节点引用
const nodeRef = getAllFormNodeRefByKey(formRows, 'username')
```



### 7. 屏幕自适应函数

```javascript
import { sacle_x, sacle_y, autoScaleInit } from 'vue3-components-plus'

// 初始化自适应
autoScaleInit(document.querySelector('body'), {
  designWidth: 1920,
  designHeight: 920,
  mode: 'stretch' // 可选 horizontal/vertical/stretch
})

// 获取当前缩放比例
const scaleX = sacle_x()
const scaleY = sacle_y()
```

## 🌐 HTTP请求函数

### 1. 基础HTTP请求方法

```javascript
import { get, post, put, del, download, downLoadLocalFile, getTokenInfo } from 'vue3-components-plus'

// GET请求
const result = await get('/api/users', { page: 1, size: 10 })

// POST请求
const result = await post('/api/users', { name: '张三', age: 25 })

// PUT请求
const result = await put('/api/users/1', { name: '李四', age: 30 })

// DELETE请求
const result = await del('/api/users/1')

// 文件下载
await download('/api/export', 'report.xlsx', 'get', { type: 'excel' })

// 下载本地文件
downLoadLocalFile('/public/', 'template.xlsx', 'template.xlsx')

// 获取token信息
const tokenInfo = getTokenInfo()
```

### 2. 初始化配置

```javascript
// main.ts中配置
import { createApp } from 'vue'
import NsComponents from 'vue3-components-plus'

const app = createApp(App)

// 请求地址的baseUrl，建议在app.use(NsComponents)之前设置
app.config.globalProperties.$BaseUrl = 'http://api.example.com/'

// 图片、文件请求地址的ImageBaseUrl，建议在app.use(NsComponents)之前设置
app.config.globalProperties.$ImageBaseUrl = 'http://api.example.com/'

// 【可选】401无权显示回调
app.config.globalProperties.$LogoutCallback = logoutHandler

// 【可选】请求添加的token头的key，默认为satoken
sessionStorage.setItem('tokenName', 'Authorization')
sessionStorage.setItem('tokenValue', 'Bearer your-token-here')

app.use(NsComponents)
```

### 3. 实际使用示例

```javascript
// api/user.js
import { get, post } from 'vue3-components-plus'

export const getUserList = (params) => get('/api/users', params)

export const createUser = (data) => post('/api/users', data)

export const updateUser = (id, data) => put(`/api/users/${id}`, data)

export const deleteUser = (id) => del(`/api/users/${id}`)

export const exportUsers = () => download('/api/users/export', 'users.xlsx')
```

## 🚀 完整安装和使用

### 1. 安装依赖

```bash
# 安装Element Plus
pnpm i element-plus

# 安装组件库
pnpm i vue3-components-plus -S --registry=http://199.10.9.178:8081/repository/npm-group/

# 如果安装失败，使用备用地址
pnpm i vue3-components-plus --registry=http://199.10.9.178:8081/repository/npm-hosted/
```

### 2. 全局引入

```javascript
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

// 安装 Element-Plus
import 'element-plus/dist/index.css'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

// 安装组件库
// @ts-ignore
import NsComponents from 'vue3-components-plus'
import 'vue3-components-plus/dist/vue3-components-plus.css'

const app = createApp(App)

// 配置请求地址
app.config.globalProperties.$BaseUrl = 'http://your-api-server/'
app.config.globalProperties.$ImageBaseUrl = 'http://your-api-server/'

app.use(ElementPlus, {
  locale: zhCn,
})
app.use(NsComponents)

app.mount('#app')
```

### 3. 按需引入

```javascript
// 按需引入组件和函数
import { NsForm, NsVideo, get, post, autoScaleInit } from 'vue3-components-plus'

// 在组件中使用
const app = createApp(App)
app.use(NsForm)
app.use(NsVideo)

autoScaleInit(document.querySelector('body'), {
  designWidth: 1920,
  designHeight: 920,
  mode: 'stretch'
})
```

## 更新日志

```text
version: 3.0.13
日期: 2026-03-13
更新内容：
1. 添加NsTableContainer带搜索条件的表格
```

```text
version: 3.0.11
日期: 2026-03-09
更新内容：
1. 修复bug
```

```text
version: 3.0.10
日期: 2026-01-23
更新内容：
1. 修改NsSaturationLine文字字体
```
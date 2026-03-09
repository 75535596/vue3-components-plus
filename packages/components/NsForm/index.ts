import type { App } from 'vue'
import NsForm from './DynamicForm.vue'
import NsFormTitle from './DynamicFormTitle.vue'
import { registerDirective } from '../../directives/index'
// 上传组件使用，非通用！！
export * from './uploadHook'

import '../../assets/martrix_iconfont/martrix_iconfont.css'

NsForm.install = (app: App) => {
  app.component(NsForm.name as string, NsForm)
  try {
    registerDirective(app)
  } catch (error) {
    console.warn('组件库注册指令失败：',error)
  }
}

NsFormTitle.install = (app: App) => {
  app.component(NsFormTitle.name as string, NsFormTitle)
}

function getAllFormKvData(rows) {
  const result = {}
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex]
    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const item = row[colIndex]
      if (item.key) {
        if (
          item?.value &&
          item?.delValue &&
          Array.isArray(item.value) &&
          Array.isArray(item.delValue)
          // && item.value.length
          // && item.delValue.length
        ) {
          // 用于上传时删除的问题处理
          result[item.key] = [...item.value, ...item.delValue]
        } else {
          result[item.key] = item.value ?? ''
        }
      }

      // 检查子项
      if (item.children && Array.isArray(item.children)) {
        for (let childIndex = 0; childIndex < item.children.length; childIndex++) {
          const child = item.children[childIndex]
          if (child.key) {
            if (
              child?.value &&
              child?.delValue &&
              Array.isArray(child.value) &&
              Array.isArray(child.delValue) 
              // && child.value.length 
              // && child.delValue.length
            ) {
              // 用于上传时删除的问题处理
              result[child.key] = [...child.value, ...child.delValue]
            } else {
              result[child.key] = child.value ?? ''
            }
          }
        }
      }
    }
  }
  return result
}

// 详情+获取时使用，根据key获取当前节点的信息
function getAllFormNodeByKey(rows, key) {
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex]
    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const item = row[colIndex]

      if (item.key === key) {
        return item
      }

      // 检查子项
      if (item.children && Array.isArray(item.children)) {
        for (let childIndex = 0; childIndex < item.children.length; childIndex++) {
          const child = item.children[childIndex]
          if (child.key === key) {
            return child
          }
        }
      }
    }
  }
  return null
}

  // 详情+获取时使用，根据key获取当前节点的实例ref
function getAllFormNodeRefByKey(rows, key) {
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex]
    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const item = row[colIndex]

      if (item.key === key) {
        return item.ref || null
      }

      // 检查子项
      if (item.children && Array.isArray(item.children)) {
        for (let childIndex = 0; childIndex < item.children.length; childIndex++) {
          const child = item.children[childIndex]
          if (child.key === key) {
            return child.ref || null
          }
        }
      }
    }
  }
  return null
}

// 全局
globalThis.getAllFormNodeRefByKey = getAllFormNodeRefByKey;
globalThis.getAllFormNodeByKey = getAllFormNodeByKey;
globalThis.getAllFormKvData = getAllFormKvData;
export { NsForm, NsFormTitle, getAllFormNodeByKey, getAllFormKvData, getAllFormNodeRefByKey }

import { uniqueId } from 'lodash-es'
import { createApp, createVNode, render } from 'vue'
import DialogPlus from './NsDialog.vue'

import '../../../assets/main.css'

window.__dialogInstances = [] // 修改：使用数组存储多个弹窗实例

let externalApp = null

export function setExternalApp(app) {
  externalApp = app
}

// 关闭所有弹出框
export function closeAllNsDialog() {
  window.__dialogInstances.forEach(instance => {
    instance.closed()
  })
}

/**
 * 大屏弹框应该都是居中展示, 因此直接添加到body或者__scale_box__上, 不需要在页面上定义很多el-dialog
 * (后期改成teleport再精简)
 */
// 定义一个函数NsDialog，接收一个参数data
// 判断data中是否存在dom属性，如果不存在则输出内容缺失并返回false
// 如果data中没有dom属性，则输出内容缺失，并返回false
// modal：默认有遮罩
// appendTo：默认添加到#app
export const NsDialog = (data, modal = true, appendTo = '#app') => {
  if (!data?.dom) {
    console.log('内容缺失')
    return false
  }

  const superData = {
    modal,
    ...data,
  }

  // 不传递id时，创建唯一容器ID
  const containerId = data?.id || uniqueId('dialog-')
  const container = document.createElement('div')
  container.setAttribute('id', containerId)
  document.querySelector(appendTo).appendChild(container)

  // 创建实例对象
  const instance = {
    id: containerId,
    class: data.class || '',
    element: container,
    // 添加组件引用占位符
    domRef: null,
    // 添加更新option的方法
    updateOption: (newOption) => {
      // 这个方法将在NsDialog.vue中被替换为实际的更新函数
      console.log('updateOption method will be replaced in NsDialog component')
    },
    // 添加调用组件方法的方法
    callMethod: (methodName, ...args) => {
      // 这个方法将在NsDialog.vue中被替换为实际的调用函数
      console.log('callMethod method will be replaced in NsDialog component')
    }
  }

  // 存储当前实例
  window.__dialogInstances.push(instance)

  if (externalApp) {
    const vnode = createVNode(DialogPlus, {
      ...superData,
      containerId, // 添加容器ID传递给组件
      // 传递实例引用，以便NsDialog.vue可以更新它
      dialogInstance: instance,
      closed: () => {
        // 防御性检查确保容器存在
        const containerEl = document.getElementById(containerId)
        if (containerEl) {
          render(null, containerEl) // 卸载组件
          containerEl.remove() // 移除DOM

          // 从实例数组中移除
          window.__dialogInstances = window.__dialogInstances.filter(inst => inst.id !== containerId)
        }

        try {
          data?.closed?.()
        } catch (error) {
          console.log(error)
        }
      },
    })
    vnode.appContext = externalApp._context // 使用外部应用上下文

    render(vnode, container) // 渲染组件
  } else {
    const app = createApp(DialogPlus, {
      ...superData,
      containerId, // 添加容器ID传递给组件
      // 传递实例引用，以便NsDialog.vue可以更新它
      dialogInstance: instance,
      closed: () => {
        // 防御性检查确保容器存在
        const containerEl = document.getElementById(containerId)
        if (containerEl) {
          render(null, containerEl) // 卸载组件
          containerEl.remove() // 移除DOM

          // 从实例数组中移除
          window.__dialogInstances = window.__dialogInstances.filter(inst => inst.id !== containerId)
        }

        try {
          data?.closed?.()
        } catch (error) {
          console.log(error)
        }
      },
    })

    // 创建虚拟节点并渲染
    const vnode = createVNode(DialogPlus, {
      ...superData,
      containerId,
      dialogInstance: instance
    })
    vnode.appContext = app._context
    render(vnode, container)
  }

  // 返回当前实例，便于外部调用
  return instance
}
export default NsDialog

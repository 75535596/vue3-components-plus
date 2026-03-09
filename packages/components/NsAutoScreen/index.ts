/**
 * 创建自适应缩放控制器
 * @param {HTMLElement} container 需要自适应的容器元素
 * @param {Object} options 配置项
 * @param {number} options.designWidth 设计稿宽度
 * @param {number} options.designHeight 设计稿高度
 * @param {'horizontal'|'vertical'|'stretch'} options.mode 自适应模式
 * @param {number} [debounceDelay=0] 防抖延迟(ms)
 */
export let sacle_x = 1
export let sacle_y = 1
export function autoScaleInit(
  container: any,
  { designWidth, designHeight, mode, debounceDelay = 100 },
) {
  // 样式初始化
  Object.assign(container.style, {
    position: 'fixed',
    left: '50%',
    top: '50%',
    transformOrigin: '0 0',
    width: `${designWidth}px`,
    height: `${designHeight}px`,
  })

  // 计算缩放比例
  const getScale = () => {
    const winWidth = window.innerWidth
    const winHeight = window.innerHeight

    switch (mode) {
      case 'horizontal': // 横向自适应
        const ratio = winWidth / designWidth
        return { x: ratio, y: ratio }
      case 'vertical': // 纵向自适应
        const ratioY = winHeight / designHeight
        return { x: ratioY, y: ratioY }
      case 'stretch': // 拉伸填充
        return {
          x: winWidth / designWidth,
          y: winHeight / designHeight,
        }
      default:
        throw new Error(`Invalid mode: ${mode}`)
    }
  }

  // 应用缩放
  const applyTransform = () => {
    const { x, y } = getScale()
    container.style.transform = `scale(${x}, ${y}) translate(-50%, -50%)`
    sacle_x = x
    sacle_y = y
    resizePop()
  }

  // 防抖处理
  const debouncedResize = debounce(applyTransform, debounceDelay)

  // 事件监听
  window.addEventListener('resize', debouncedResize)
  applyTransform() // 初始化

  // 销毁方法
  return {
    destroy: () => window.removeEventListener('resize', debouncedResize),
  }
}

function resizePop() {
  // 确保元素存在后再应用样式
  setTimeout(() => {
    document
      .querySelectorAll('.el-popper[class*="__dropdown"], .el-popper[class*="__popper"]')
      .forEach((item: any) => {
        // 使用setProperty确保transform样式优先级
        item?.style?.setProperty('transform', `scale(${sacle_x}, ${sacle_y})`, 'important')
      })
  }, 0)
  return { sacle_x, sacle_y }
}

// 防抖函数实现
function debounce(fn: any, delay: any) {
  if (delay === 0) {
    return fn
  } else {
    let timeoutId
    return (...args) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => fn.apply(this, args), delay)
    }
  }
}

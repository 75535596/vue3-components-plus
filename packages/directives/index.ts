/**
 * 注册自定义指令
 * 这些指令用于控制元素的样式和行为，以实现特定的视觉效果或交互特性
 * @param app 应用实例，用于注册自定义指令
 */
import type { App } from 'vue'
import { inject } from 'vue'

export function registerDirective(app: App<Element>) {
  // 'v-sline' 指令，用于设置元素文本单行显示并隐藏溢出文本
  app.directive('sline', {
    mounted(el) {
      el.style.whiteSpace = 'nowrap'
      el.style.overflow = 'hidden'
      el.style.textOverflow = 'ellipsis'
      el.style.display = 'inline-block'
      el.style.maxWidth = '100%'
    },
  })

  /**
   * v-permission 按钮权限指令
   * 已开发页面需要对鉴权的按钮增加id或class，然后使用v-permission[.id/.class][.display]指令，如<el-button text v-permission>查看</el-button>
   * ！！！注意：v-permission最好配置id/class否则永远不展示
   * 可选：v-permission.class.display  / v-permission.id.display  / v-permission.class  / v-permission.id(默认)
   */
  app.directive('permission', {
    mounted(el, binding) {
      // 获取按钮权限数据，优先从 sessionStorage 获取
      let btnsPermission: string[] = []
      try {
        if (sessionStorage.getItem('btnsPermission')) {
          Array.isArray(JSON.parse(sessionStorage.getItem('btnsPermission')))
            ? (btnsPermission = JSON.parse(sessionStorage.getItem('btnsPermission')))
            : null
        } else if (localStorage.getItem('btnsPermission')) {
          Array.isArray(JSON.parse(localStorage.getItem('btnsPermission')))
            ? (btnsPermission = JSON.parse(localStorage.getItem('btnsPermission')))
            : null
        }
      } catch (e) {
        btnsPermission = []
      }

      // 如果 sessionStorage 中没有，尝试从其他来源获取
      if (btnsPermission.length === 0) {
        // 方法1: 从全局属性获取
        if (app.config.globalProperties.$btnsPermission) {
          btnsPermission = app.config.globalProperties.$btnsPermission
        }
        // 方法2: 从元素的Vue实例上下文获取（如果可用）
        else if (
          binding.instance &&
          binding.instance.$.appContext.app.config.globalProperties.$btnsPermission
        ) {
          btnsPermission = binding.instance.$.appContext.app.config.globalProperties.$btnsPermission
        }
        // 方法3: 尝试从provide/inject获取（通过组件实例）
        else if (binding.instance && binding.instance.$.provides?.btnsPermission) {
          btnsPermission = binding.instance.$.provides.btnsPermission
        }
        // 方法4: 从父级provides获取
        else if (binding.instance && binding.instance.$.parent?.provides?.btnsPermission) {
          btnsPermission = binding.instance.$.parent.provides.btnsPermission
        }
      }
      const selector = binding.modifiers?.['class']
        ? 'class'
        : binding.modifiers?.['id']
          ? 'id'
          : 'id'
      const isDisplayNone = binding.modifiers?.['display']
      if (selector === 'id') {
        if (!btnsPermission?.includes(el.getAttribute(selector))) {
          if (isDisplayNone) {
            el.style.display = 'none'
          } else {
            el.style.visibility = 'hidden'
            el.style.pointerEvents = 'none'
          }
        } else {
          el.style.pointerEvents = 'auto'
        }
      } else if (selector === 'class') {
        if (
          btnsPermission?.filter((item) => Array.from(el.classList).includes(item)).length === 0
        ) {
          if (isDisplayNone) {
            el.style.display = 'none'
          } else {
            el.style.visibility = 'hidden'
            el.style.pointerEvents = 'none'
          }
        } else {
          el.style.pointerEvents = 'auto'
        }
      }
    },
  })

  /**
   * 'v-length' 指令，用于设置元素文本的最大长度
   *  方法(可选)：v-length[.number][="100"] 或自定义正则 v-length.regex="{ maxLength: 100, pattern: /^[a-zA-Z0-9]*$/ }" v-length.range="{ min: 0, max: 100, int: true, maxLength: 10 }"
   *  说明：.number：仅能输入正负浮点数值，不写则为任意字符串
   *
   *        .range：输入指定范围内的数字，支持小数和边界值
   *        ={ min: 0, max: 100, maxLength: 10 }：范围模式，支持数字范围限制
   *        ={ min: 0, max: 100, int: true }：整数范围模式，仅能输入整数
   *
   *        .regex：启用自定义正则表达式校验
   *        =100：最大长度（简单模式）
   *        ={ maxLength: 100, pattern: /^[a-zA-Z0-9]*$/ }：对象模式，支持自定义正则
   */
  app.directive('length', {
    mounted(el, binding) {
      const config = parseBindingValue(binding)
      let isComposing = false

      // 获取真实的 input 元素（处理 Element Plus 的 el-input 组件）
      const getInputElement = () => {
        return el.tagName === 'INPUT' ? el : el.querySelector('input')
      }

      // 处理中文输入法
      const handleCompositionStart = () => {
        isComposing = true
      }

      const handleCompositionEnd = (e) => {
        isComposing = false
        // 输入法结束后，触发一次格式化
        if (binding.modifiers?.number || binding.modifiers?.range || binding.modifiers?.regex) {
          handleInput(e)
        }
      }

      const handleInput = (e) => {
        const inputEl = e.target

        // 如果正在使用输入法，不做任何处理，等待 compositionend
        if (isComposing) {
          return
        }

        const oldValue = inputEl.value
        let newValue = oldValue

        if (binding.modifiers?.range) {
          newValue = formatRangeInput(oldValue, config)
        } else if (binding.modifiers?.number) {
          newValue = formatNumberInput(oldValue, config.maxLength)
        } else if (binding.modifiers?.regex && config.pattern) {
          newValue = formatRegexInput(oldValue, config.maxLength, config.pattern)
        } else {
          newValue = oldValue.slice(0, config.maxLength)
        }

        // 只有当值真正改变时才更新，避免触发不必要的事件
        if (newValue !== oldValue) {
          inputEl.value = newValue
          // 使用 Vue 兼容的方式触发 input 事件
          const event = new Event('input', { bubbles: true })
          inputEl.dispatchEvent(event)
        }
      }

      const inputEl = getInputElement()
      if (inputEl) {
        inputEl.addEventListener('compositionstart', handleCompositionStart)
        inputEl.addEventListener('compositionend', handleCompositionEnd)
        inputEl.addEventListener('input', handleInput)

        // 初始化时也应用限制（不触发事件）
        if (inputEl.value) {
          if (binding.modifiers?.range) {
            inputEl.value = formatRangeInput(inputEl.value, config)
          } else if (binding.modifiers?.number) {
            inputEl.value = formatNumberInput(inputEl.value, config.maxLength)
          } else if (binding.modifiers?.regex && config.pattern) {
            inputEl.value = formatRegexInput(inputEl.value, config.maxLength, config.pattern)
          } else {
            inputEl.value = inputEl.value.slice(0, config.maxLength)
          }
        }
      }

      // 保存事件处理器引用，用于 unmounted 时清理
      el._lengthDirectiveHandlers = {
        compositionstart: handleCompositionStart,
        compositionend: handleCompositionEnd,
        input: handleInput,
        inputElement: inputEl,
      }
    },
    unmounted(el) {
      // 清理事件监听器
      const handlers = el._lengthDirectiveHandlers
      if (handlers && handlers.inputElement) {
        handlers.inputElement.removeEventListener('compositionstart', handlers.compositionstart)
        handlers.inputElement.removeEventListener('compositionend', handlers.compositionend)
        handlers.inputElement.removeEventListener('input', handlers.input)
        delete el._lengthDirectiveHandlers
      }
    },
    updated(el, binding) {
      updatedCheck(el, binding)
    },
  })

  // 'v-event-unuse' 穿透（禁用当前组件的事件，一般设置在父组件上）
  app.directive('event-unuse', {
    mounted(el) {
      el.style.pointerEvents = 'none'
    },
  })

  // 'v-event-use' 阻止穿透（使用当前组件的事件，一般用在子组件上）
  app.directive('event-use', {
    mounted(el) {
      el.style.pointerEvents = 'auto'
    },
  })
}

/**
 * 解析指令绑定值
 */
function parseBindingValue(binding) {
  const defaultConfig = { maxLength: 50, pattern: null, min: null, max: null, int: false }

  if (!binding.value) {
    return defaultConfig
  }

  // 如果是数字，直接作为最大长度
  if (typeof binding.value === 'number') {
    return { ...defaultConfig, maxLength: binding.value }
  }

  // 如果是对象，解析配置
  if (typeof binding.value === 'object') {
    return {
      maxLength: binding.value.maxLength || defaultConfig.maxLength,
      pattern: binding.value.pattern || null,
      min: binding.value.min || null,
      max: binding.value.max || null,
      int: binding.value.int || false,
    }
  }

  return defaultConfig
}

/**
 * 使用正则表达式格式化输入
 */
function formatRegexInput(value, maxLength, pattern) {
  let result = ''

  for (let i = 0; i < value.length && result.length < maxLength; i++) {
    const char = value[i]
    const testValue = result + char

    // 测试当前字符是否符合正则表达式
    if (pattern.test(testValue)) {
      result += char
    }
  }

  return result
}

/**
 * v-length 指令更新检查
 */
function updatedCheck(el, binding) {
  const config = parseBindingValue(binding)
  const els = el.querySelectorAll('input, textarea')
  els.forEach((element) => {
    if (element?.value) {
      if (binding.modifiers?.range) {
        element.value = formatRangeInput(element.value, config)
        element.dispatchEvent(new Event('input'))
      } else if (binding.modifiers?.number) {
        element.value = formatNumberInput(element.value, config.maxLength)
        element.dispatchEvent(new Event('input'))
      } else if (binding.modifiers?.regex && config.pattern) {
        element.value = formatRegexInput(element.value, config.maxLength, config.pattern)
        element.dispatchEvent(new Event('input'))
      } else {
        element.value = element.value.slice(0, config.maxLength)
        element.dispatchEvent(new Event('input'))
      }
    }
  })
}

/**
 * 处理数字输入的格式
 */
function formatNumberInput(value, maxLength, allowNegative = true) {
  let result = ''
  let hasMinus = false
  let hasDot = false
  for (let i = 0; i < value.length; i++) {
    const char = value[i]
    // 1. 处理负号（只有当允许负数时才能输入，且只能出现在第一位，且只能有一个）
    if (char === '-') {
      if (allowNegative && i === 0 && !hasMinus) {
        result += char
        hasMinus = true
      }
      continue
    }
    // 2. 处理小数点（不能出现在第一位，且只能有一个，且前一个字符不能是负号）
    if (char === '.') {
      if (i !== 0 && !hasDot && (i === 0 || result[i - 1] !== '-')) {
        result += char
        hasDot = true
      }
      continue
    }
    // 3. 处理数字（0-9）
    if (/^\d$/.test(char)) {
      // 非整数模式下处理前导零：如果当前是0且后面输入数字（不是小数点），则替换0
      const currentResult = hasMinus ? result.slice(1) : result
      if (currentResult === '0' && char !== '0' && !hasDot) {
        // 如果当前是0，输入非零数字且没有小数点，则替换0
        result = hasMinus ? '-' : '' // 重置结果，保留负号
      }
      result += char
    }
  }
  // 4. 截取最大长度
  return result.slice(0, maxLength)
}

/**
 * 处理整数输入的格式，不允许小数点
 */
function formatIntegerInput(value, maxLength, config) {
  let result = ''
  let hasMinus = false

  // 判断是否允许负数：只有当 min 小于 0 时才允许负号
  const allowNegative = config.min !== null && config.min < 0

  for (let i = 0; i < value.length; i++) {
    const char = value[i]

    // 1. 处理负号（只有当允许负数时才能输入，且只能出现在第一位，且只能有一个）
    if (char === '-') {
      if (allowNegative && i === 0 && !hasMinus) {
        result += char
        hasMinus = true
      }
      continue
    }

    // 2. 处理数字（0-9），不允许小数点
    if (/^\d$/.test(char)) {
      const currentResult = hasMinus ? result.slice(1) : result // 去掉负号部分
      if (currentResult === '0' && char !== '0') {
        // 如果当前是0，输入非零数字时，清空并输入新数字
        result = hasMinus ? '-' : '' // 重置结果，保留负号
      }
      result += char
    }

    // 3. 忽略所有其他字符，包括小数点
  }

  // 4. 截取最大长度
  return result.slice(0, maxLength)
}

/**
 * 处理数字范围输入的格式，支持小数和边界值
 */
function formatRangeInput(value, config) {
  // 如果设置了仅能输入整数，使用整数格式化函数
  if (config.int) {
    let result = formatIntegerInput(value, config.maxLength || 50, config)

    // 如果没有设置范围限制，直接返回格式化后的整数
    if (config.min === null && config.max === null) {
      return result
    }

    // 如果结果为空或只有负号，直接返回
    if (result === '' || result === '-') {
      return result
    }

    // 转换为整数进行范围检查
    const numValue = parseInt(result, 10)

    // 如果无法转换为整数，返回空
    if (isNaN(numValue)) {
      return ''
    }

    // 检查最小值限制
    if (config.min !== null && numValue < config.min) {
      return Math.ceil(config.min).toString()
    }

    // 检查最大值限制
    if (config.max !== null && numValue > config.max) {
      return Math.floor(config.max).toString()
    }

    return result
  }

  // 判断是否允许负数：只有当 min 小于 0 时才允许负号
  const allowNegative = config.min !== null && config.min < 0

  // 首先使用数字格式化确保输入的是有效数字格式
  let result = formatNumberInput(value, config.maxLength || 50, allowNegative)

  // 如果没有设置范围限制，直接返回格式化后的数字
  if (config.min === null && config.max === null) {
    return result
  }

  // 如果结果为空或只有负号或小数点，直接返回
  if (result === '' || result === '-' || result === '.') {
    return result
  }

  // 转换为数字进行范围检查
  const numValue = parseFloat(result)

  // 如果无法转换为数字，返回空
  if (isNaN(numValue)) {
    return ''
  }

  // 检查最小值限制
  if (config.min !== null && numValue < config.min) {
    // 如果当前值小于最小值，返回最小值或保持输入状态
    // 这里选择返回最小值，也可以返回空或保持原样
    return config.min.toString()
  }

  // 检查最大值限制
  if (config.max !== null && numValue > config.max) {
    // 如果当前值大于最大值，返回最大值
    return config.max.toString()
  }

  // 在范围内，返回原值
  return result
}

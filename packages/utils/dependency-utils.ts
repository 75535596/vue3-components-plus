/**
 * 动态表单字段依赖关系工具类
 * 提供循环依赖检测、调试日志等功能
 */

/**
 * 依赖更新结果接口
 * 定义 handler 函数可以返回的更新配置
 */
export interface DependencyUpdateResult {
  /** 控制字段显示/隐藏 */
  hidden?: boolean
  /** 控制字段禁用/启用 */
  disabled?: boolean
  /** 动态更新选项列表 */
  options?: any[]
  /** 更新字段值 */
  value?: any
  /** 更新 params 对象中的其他属性 */
  params?: Record<string, any>
}

/**
 * 循环依赖检测器
 * 使用深度优先搜索算法检测依赖关系中的循环
 */
export class CircularDependencyDetector {
  /**
   * 检测依赖映射表中是否存在循环依赖
   * @param dependencyMap 依赖映射表，格式为 Map<watchKey, Set<dependentKey>>
   * @returns 检测结果，包含是否存在循环和所有循环路径
   */
  detect(dependencyMap: Map<string, Set<string>>): {
    hasCircular: boolean
    cycles: string[][]
  } {
    const cycles: string[][] = []
    const visited = new Set<string>()
    const recStack = new Set<string>()

    // 遍历所有节点，确保检测到所有可能的循环
    for (const node of dependencyMap.keys()) {
      if (!visited.has(node)) {
        const cycle = this.dfs(node, visited, recStack, [], dependencyMap)
        if (cycle) {
          cycles.push(cycle)
        }
      }
    }

    return {
      hasCircular: cycles.length > 0,
      cycles
    }
  }

  /**
   * 深度优先搜索检测循环
   * @param node 当前节点
   * @param visited 已访问节点集合
   * @param recStack 递归栈，用于检测循环
   * @param path 当前路径
   * @param dependencyMap 依赖映射表
   * @returns 如果发现循环，返回循环路径；否则返回 null
   */
  private dfs(
    node: string,
    visited: Set<string>,
    recStack: Set<string>,
    path: string[],
    dependencyMap: Map<string, Set<string>>
  ): string[] | null {
    visited.add(node)
    recStack.add(node)
    path.push(node)

    const dependents = dependencyMap.get(node)
    if (dependents) {
      for (const dependent of dependents) {
        if (!visited.has(dependent)) {
          const cycle = this.dfs(dependent, visited, recStack, [...path], dependencyMap)
          if (cycle) {
            return cycle
          }
        } else if (recStack.has(dependent)) {
          // 发现循环：找到循环的起始点
          const cycleStartIndex = path.indexOf(dependent)
          return [...path.slice(cycleStartIndex), dependent]
        }
      }
    }

    recStack.delete(node)
    return null
  }
}

/**
 * 依赖调试日志器
 * 提供调试模式下的日志输出功能
 */
export class DependencyDebugger {
  private enabled: boolean = false

  /**
   * 启用或禁用调试模式
   * @param enabled 是否启用调试模式
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  /**
   * 获取调试模式状态
   * @returns 是否启用调试模式
   */
  isEnabled(): boolean {
    return this.enabled
  }

  /**
   * 输出依赖映射表
   * @param map 依赖映射表
   */
  logDependencyMap(map: Map<string, Set<string>>): void {
    if (!this.enabled) return

    console.group('[DynamicForm Dependency] 依赖映射表')
    const mapObj: Record<string, string[]> = {}
    map.forEach((dependents, watchKey) => {
      mapObj[watchKey] = Array.from(dependents)
    })
    console.table(mapObj)
    console.groupEnd()
  }

  /**
   * 输出字段变化日志
   * @param key 字段 key
   * @param oldValue 旧值
   * @param newValue 新值
   */
  logFieldChange(key: string, oldValue: any, newValue: any): void {
    if (!this.enabled) return

    console.log(`[DynamicForm Dependency] 字段变化: ${key}`, {
      oldValue,
      newValue
    })
  }

  /**
   * 输出 Handler 执行日志
   * @param fieldKey 字段 key
   * @param watchedValues 被监听字段的值
   * @param result Handler 返回的更新配置
   * @param duration 执行时间（毫秒）
   */
  logHandlerExecution(
    fieldKey: string,
    watchedValues: Record<string, any>,
    result: DependencyUpdateResult,
    duration: number
  ): void {
    if (!this.enabled) return

    console.group(`[DynamicForm Dependency] Handler 执行: ${fieldKey}`)
    console.log('监听的字段值:', watchedValues)
    console.log('返回的更新配置:', result)
    console.log(`执行时间: ${duration.toFixed(2)}ms`)
    console.groupEnd()
  }

  /**
   * 输出警告信息
   * @param message 警告消息
   * @param context 上下文信息
   */
  logWarning(message: string, context?: any): void {
    if (!this.enabled) return

    if (context) {
      console.warn(`[DynamicForm Dependency] ${message}`, context)
    } else {
      console.warn(`[DynamicForm Dependency] ${message}`)
    }
  }

  /**
   * 输出错误信息
   * @param message 错误消息
   * @param error 错误对象
   * @param context 上下文信息
   */
  logError(message: string, error: Error, context?: any): void {
    if (!this.enabled) return

    console.group(`[DynamicForm Dependency] 错误: ${message}`)
    console.error('错误对象:', error)
    if (context) {
      console.error('上下文:', context)
    }
    console.groupEnd()
  }
}

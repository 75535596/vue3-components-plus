import { ref } from "vue"

let currentClickProperty = '' //  * 当前点击的表头字段名
/**
 * 手动处理排序
 * @param param0 默认回调参数
 * @param searchForm 搜索表单
 * @param getList 获取列表的函数
 */
const handleSortChange = ({ prop, order }: any, searchForm: any, getList: any) => {
  if (order) {
    if (!searchForm.orderByStr) {
      searchForm.orderByStr = {}
    }
    if (order === 'ascending') {
      order = 'asc'
    } else if (order === 'descending') {
      order = 'desc'
    }
    searchForm.orderByStr[prop] = order
    getList()
  } else {
    //  * 取消排序时，column, prop, order 都是 null，无法判断是哪一列取消了排序
    //  * 所以要等 @header-click 事件执行完成，再用当前点击的表头字段名来判断是哪一列
    setTimeout(() => {
      // 清除取消排序的列
      if (searchForm.orderByStr) {
        delete searchForm.orderByStr[currentClickProperty]
      }
      getList()
    }, 0)
  }
}
/**
 * 点击表头回调
 * @param column 当前点击列的对象
 */
const headerClick = (column: any) => {
  currentClickProperty = column.property // 把当前点击的表头字段名存起来，后面取消列的排序会用到
}

/**
 * 处理表头样式
 * @param param0 默认回调参数
 * @param searchForm 搜索表单
 */
const handleHeaderCellClass = ({ column }: any, searchForm: any) => {
  //  * 遍历更新每一列的排序状态
  //  * 要用setTimeout等取消列排序的操作执行完成，才去更新表头样式
  setTimeout(() => {
    if (searchForm.orderByStr) {
      for (const key in searchForm.orderByStr) {
        if (key === column.property) {
          let order: any = searchForm.orderByStr[key]
          if (order === 'asc') {
            order = 'ascending'
          } else if (order === 'desc') {
            order = 'descending'
          }
          column.order = order
        }
      }
    }
  }, 0)
}

/*
// 记录排序字段与升降状态
const orderArr = ref<any>({
  orderByStr: {}
})


//当表格的排序条件发生变化的时候会触发该事件
const sortChange = async ({ prop, order }: any) => {
  orderArr.value.orderByStr[prop] = order
  //调封装的函数
  handleSortChange({ prop, order }, orderArr.value, laterFun)
}

let orderList: any = []

// 根据后端给的传参格式，把排序数据结构调整成后端想要的格式
const laterFun = () => {
  orderList = []
  const orderProp = Object.keys(orderArr.value.orderByStr).reduce((result, key) => {
    if (orderArr.value.orderByStr[key] !== null) {
      result[key] = orderArr.value.orderByStr[key]
    }
    return result
  }, {})
  for (const [key, value] of Object.entries(orderProp)) {
    if (value) {
      const index = orderList.findIndex(e => e['columnName'] === key)
      if (index > -1) {
        orderList[index].asc = value === 'asc'
      } else {
        let obj = {}
        obj['columnName'] = key
        obj['asc'] = value === 'asc'
        orderList.push(obj)
      }
    }
  }
// 调表格接口
  getTableData()
} */

export { handleSortChange, headerClick, handleHeaderCellClass }

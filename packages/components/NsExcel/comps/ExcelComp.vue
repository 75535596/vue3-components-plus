<template>
  <div class="excel-container" :class="{ readonly: !props.isEdit }">
    <div ref="excelContainerRef" class="excel-view"></div>
    <!-- <input type="file" @change="importExcel($event.target.files[0])" />
    <button @click="exportExcel">导出</button> -->
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, watch, defineExpose } from 'vue'
import Spreadsheet from 'x-data-spreadsheet'
import zhCN from 'x-data-spreadsheet/src/locale/zh-cn'
import * as XLSX from 'xlsx'
Spreadsheet.locale('zh-cn', zhCN)
// 备用，不可修改宽高，可直接传入arraybuffer
// import ExcelViewer from 'excel-viewer'
const props = defineProps({
  // 文件对象或文件URL
  file: {
    type: [Object, String],
    default: () => null,
  },
  // 是否可编辑：false时为只读模式，不能编辑，没有工具栏，仅能复制文字和切换sheet
  isEdit: {
    type: Boolean,
    default: true,
  },
  showToolbar: {
    type: Boolean,
    default: true,
  },
  showGrid: {
    type: Boolean,
    default: true,
  },
  showContextmenu: {
    type: Boolean,
    default: true,
  },
  cellWidth: {
    type: Number,
    default: 100,
  },
  cellHeight: {
    type: Number,
    default: 28,
  },
  miniRowLength: {
    type: Number,
    default: 100,
  },
})

const xs = ref()
const excelContainerRef = ref()
const totalRows = ref(props.miniRowLength)
const totalCols = ref(26) // 动态列数
const loadState = ref('')
const currentSheetData = ref() // 存储当前sheet数据

// 直接传入文件数据
function initShow(blob: any) {
  nextTick(() => {
    importExcel(blob)
  })
}

watch(
  () => props.file,
  (nv) => {
    if (nv) {
      initShow(nv)
    }
  },
  { immediate: true, deep: true },
)

// 导入数据
function importExcel(file: any) {
  loadState.value = 'loading'

  // 处理数据的通用函数
  const processData = (data: ArrayBuffer) => {
    const fixedData = fixData(data)
    const workbook = XLSX.read(btoa(fixedData), { type: 'base64' })
    const sheetData = stox(workbook)
    loadState.value = 'loaded'
    // 存储sheet数据
    currentSheetData.value = sheetData

    // 初始化xs
    nextTick(() => {
      if (!xs.value) {
        // 设置第一个sheet的列数
        if (sheetData.length > 0) {
          totalCols.value = sheetData[0].maxCols
        }
        init()
      }
      xs.value.loadData(sheetData)

      // 在数据加载完成后添加监听
      setTimeout(() => {
        addSheetChangeListener()
      }, 300)
    })
  }

  // 判断是URL还是File对象
  if (typeof file === 'string') {
    // 处理URL
    fetch(file)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.arrayBuffer()
      })
      .then((data) => {
        processData(data)
      })
      .catch((error) => {
        console.error('加载Excel文件失败:', error)
        loadState.value = 'error'
      })
  } else {
    // 处理File对象
    const reader = new FileReader()
    reader.onload = (e: any) => {
      processData(e.target.result)
    }
    reader.onerror = () => {
      console.error('读取文件失败')
      loadState.value = 'error'
    }
    reader.readAsArrayBuffer(file)
  }
}
// 初始化
function init() {
  // 只读模式配置：当isEdit为false时启用只读模式
  const isReadonlyMode = !props.isEdit
  const showToolbarConfig = isReadonlyMode ? false : props.showToolbar
  const showContextmenuConfig = isReadonlyMode ? false : props.showContextmenu

  xs.value = new Spreadsheet(excelContainerRef.value, {
    mode: isReadonlyMode ? 'read' : 'edit',
    showToolbar: showToolbarConfig,
    showGrid: props.showGrid, // 显示网格
    showContextmenu: showContextmenuConfig, // 显示右键菜单
    view: {
      height: () => {
        if (excelContainerRef.value) {
          return excelContainerRef.value.offsetHeight
        } else {
          return
        }
      },
      width: () => {
        if (excelContainerRef.value) {
          return excelContainerRef.value.offsetWidth
        } else {
          return
        }
      },
    },
    style: {
      bgcolor: '#ffffff',
      align: 'left',
      valign: 'middle',
      textwrap: false,
      strike: false,
      underline: false,
      color: '#0b0b0b',
      font: {
        name: 'Helvetica',
        size: 11,
        bold: false,
        italic: false,
      },
    },
    row: {
      len: totalRows.value,
      height: props.cellHeight,
    },
    col: {
      len: totalCols.value,
      width: props.cellWidth,
      indexWidth: 60,
      minWidth: 60,
    },
  })
}

// 处理数据
function fixData(data: any) {
  let o = '',
    l = 0
  const w = 10240
  for (; l < data.byteLength / w; ++l)
    o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)) as any)
  o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)) as any)
  return o
}

// sheet转换为x-sheet格式
function stox(wb: any) {
  const out: any = []
  let globalMaxCols = 26 // 全局最小26列
  const sheetColsInfo: any[] = [] // 存储每个sheet的列信息

  // 第一遍：计算每个sheet的列数和全局最大列数
  wb.SheetNames.forEach((name: any, index: number) => {
    const ws = wb.Sheets[name]
    const aoa = XLSX.utils.sheet_to_json(ws, { raw: false, header: 1 })
    let sheetMaxCols = 0

    aoa.forEach((r: any) => {
      r.forEach((c: any, j: any) => {
        sheetMaxCols = Math.max(sheetMaxCols, j + 1)
      })
    })

    // 如果数据列数大于默认26列，则在后面添加10列空白用于编辑
    let actualMaxCols = Math.max(sheetMaxCols, 26)
    if (sheetMaxCols > 26) {
      actualMaxCols = sheetMaxCols + 10
    }

    sheetColsInfo[index] = actualMaxCols
    globalMaxCols = Math.max(globalMaxCols, actualMaxCols)
  })

  // 第二遍：使用全局最大列数创建所有sheet
  wb.SheetNames.forEach((name: any, index: number) => {
    const o: any = { name: name, rows: {}, merges: [] }
    const ws = wb.Sheets[name]
    const aoa = XLSX.utils.sheet_to_json(ws, { raw: false, header: 1 })

    aoa.forEach((r: any, i) => {
      const cells: any = {}
      r.forEach((c: any, j: any) => {
        cells[j] = { text: c }
      })
      o.rows[i] = { cells: cells }
    })

    // 每个sheet使用自己的实际列数
    o.maxCols = sheetColsInfo[index] // 使用实际列数
    o.actualCols = sheetColsInfo[index] // 实际有数据的列数

    // 设置列配置 - 使用实际列数
    o.cols = {
      len: sheetColsInfo[index],
      width: props.cellWidth,
      indexWidth: 60,
      minWidth: 60,
    }

    // 获取表格行数，下方空20行
    if (Object.keys(o.rows).length > props.miniRowLength) {
      totalRows.value = Object.keys(o.rows).length + props.miniRowLength
    }

    // 设置合并单元格
    if (ws['!merges']) {
      ws['!merges'].forEach((merge: any) => {
        /** merge = {
         *  s: {c: 0, r: 15}
         *  e: {c: 15, r: 15}
         * }
         */
        // 修改 cell 中 merge [合并行数,合并列数]
        let cell = o.rows[merge.s.r].cells[merge.s.c]

        //无内容单元格处理
        if (!cell) {
          cell = { text: '' }
        }
        cell.merge = [merge.e.r - merge.s.r, merge.e.c - merge.s.c]
        o.rows[merge.s.r].cells[merge.s.c] = cell

        // 修改 merges
        o.merges.push(XLSX.utils.encode_range(merge))
      })
    }

    out.push(o)
  })

  // 设置初始列数为第一个sheet的列数
  totalCols.value = sheetColsInfo[0] || 26

  console.log(`处理完成: 全局最大列数 ${globalMaxCols}, 各sheet实际列数:`, sheetColsInfo)
  console.log(`初始列数设置为: ${totalCols.value}`)

  return out
}

// 添加sheet切换监听器
function addSheetChangeListener() {
  if (!xs.value || !currentSheetData.value) return

  // 使用简单的点击事件监听
  setTimeout(() => {
    const bottomBar = excelContainerRef.value?.querySelector('.x-spreadsheet-bottombar')
    if (bottomBar) {
      bottomBar.addEventListener('click', handleSheetTabClick)
    }
  }, 100)
}

// 处理sheet标签点击
function handleSheetTabClick(e: Event) {
  const target = e.target as HTMLElement

  console.log('Sheet标签被点击:', target)

  // 检查是否点击了sheet标签
  if (target.classList.contains('x-spreadsheet-item') || target.closest('.x-spreadsheet-item')) {
    // 获取点击的sheet索引
    const sheetItems = Array.from(
      excelContainerRef.value?.querySelectorAll('.x-spreadsheet-item') || [],
    )
    const clickedItem = target.classList.contains('x-spreadsheet-item')
      ? target
      : target.closest('.x-spreadsheet-item')
    const sheetIndex = sheetItems.indexOf(clickedItem as Element)

    console.log(`点击了sheet ${sheetIndex}`)

    if (sheetIndex >= 0 && currentSheetData.value && currentSheetData.value[sheetIndex]) {
      const targetSheet = currentSheetData.value[sheetIndex]
      console.log(`目标sheet信息:`, {
        index: sheetIndex,
        maxCols: targetSheet.maxCols,
        currentCols: totalCols.value,
      })

      // 延迟检查，确保sheet切换完成
      setTimeout(() => {
        if (targetSheet.maxCols && targetSheet.maxCols !== totalCols.value) {
          console.log(`需要调整列数: ${totalCols.value} -> ${targetSheet.maxCols}`)
          recreateSpreadsheetWithNewColumns(targetSheet.maxCols, sheetIndex)
        } else {
          console.log('列数相同，无需调整')
        }
      }, 200)
    } else {
      console.log('未找到有效的sheet数据')
    }
  }
}

// 重新创建spreadsheet以应用新的列数
function recreateSpreadsheetWithNewColumns(newColCount: number, targetSheetIndex: number) {
  if (!currentSheetData.value || newColCount === totalCols.value) return

  console.log(`开始重新创建spreadsheet: 列数 ${totalCols.value} -> ${newColCount}`)

  // 移除旧的事件监听器
  const bottomBar = excelContainerRef.value?.querySelector('.x-spreadsheet-bottombar')
  if (bottomBar) {
    bottomBar.removeEventListener('click', handleSheetTabClick)
  }

  // 销毁当前实例
  if (xs.value && typeof xs.value.destroy === 'function') {
    try {
      xs.value.destroy()
    } catch (error) {
      console.warn('销毁spreadsheet实例时出错:', error)
    }
  }

  // 更新列数
  totalCols.value = newColCount
  console.log(`列数已更新为: ${totalCols.value}`)

  // 清空容器
  if (excelContainerRef.value) {
    excelContainerRef.value.innerHTML = ''
  }

  // 重置引用
  xs.value = null

  // 重新初始化
  nextTick(() => {
    console.log('开始重新初始化spreadsheet')
    init()
    console.log('spreadsheet初始化完成，开始加载数据')

    // 重新加载数据
    xs.value.loadData(currentSheetData.value)
    console.log('数据加载完成')

    // 切换到目标sheet
    if (targetSheetIndex > 0) {
      setTimeout(() => {
        if (xs.value && xs.value.changeSheet) {
          console.log(`切换到目标sheet: ${targetSheetIndex}`)
          xs.value.changeSheet(targetSheetIndex)
        }
      }, 150)
    }

    // 重新添加监听器
    setTimeout(() => {
      console.log('重新添加sheet切换监听器')
      addSheetChangeListener()
    }, 400)
  })
}

// 导出excel
function exportExcel(type = 1, isDownload = false) {
  const type1 = xs.value.getData()
  const type2 = xtos(type1)
  if (isDownload) {
    XLSX.writeFile(type2, 'SheetJS.xlsx')
  }
  return type == 1 ? type1 : type2
}

// x-sheet转换为sheet格式
function xtos(sdata: any) {
  const out = XLSX.utils.book_new()
  if (!sdata || !Array.isArray(sdata)) {
    console.error('Invalid spreadsheet data format', sdata)
    return out
  }

  sdata.forEach((xws: any) => {
    if (!xws || !xws.rows) {
      console.error('Invalid worksheet data format', xws)
      return
    }

    const aoa: any = [[]]
    const rowObj = xws.rows
    const rowLen = rowObj.len || Object.keys(rowObj).length

    for (let ri = 0; ri < rowLen; ++ri) {
      const row = rowObj[ri]
      if (!row || !row.cells) continue

      aoa[ri] = []
      Object.keys(row.cells).forEach((k) => {
        const idx = +k
        if (isNaN(idx)) return
        aoa[ri][idx] = row.cells[k].text
      })
    }

    const ws: any = XLSX.utils.aoa_to_sheet(aoa)

    /** 读取在线中的合并单元格，并写入导出的数据中
     * merges: Array(19)
     0: "A16:P16"
     1: "A17:P17"
     2: "O2:P2"
     3: "F2:G2"
     */
    ws['!merges'] = []
    if (xws.merges && Array.isArray(xws.merges)) {
      xws.merges.forEach((merge: any) => {
        ws['!merges'].push(XLSX.utils.decode_range(merge))
      })
    }

    XLSX.utils.book_append_sheet(out, ws, xws.name || 'Sheet')
  })
  return out
}

defineExpose({
  initShow,
  exportExcel,
})
</script>

<style lang="scss" scoped>
.excel-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  .excel-view {
    width: 100%;
    height: 100%;
  }
  .ant-spin-text {
    margin-top: 10px;
  }
}
:deep(.x-spreadsheet-toolbar) {
  width: auto !important;
}
:deep(.x-spreadsheet-bottombar) {
   overflow-x: auto;
   overflow-y: hidden;
  .x-spreadsheet-menu {
    li:not(:nth-child(1)) {
      opacity: 0;
      pointer-events: none;
    }
    .x-spreadsheet-icon {
      opacity: 0;
      pointer-events: none;
    }
    .x-spreadsheet-dropdown-content {
      display: flex !important;
      align-items: center;
      height: 100%;
      width: auto;
      top: 0;
      // left: 0;
      left: -72px;
      box-shadow: none;
      background: #f5f6f7;
      .x-spreadsheet-item {
        cursor: pointer;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}

// 只读模式样式
.excel-container.readonly {
  :deep(.x-spreadsheet-toolbar) {
    display: none !important;
  }

  :deep(.x-spreadsheet-canvas) {
    user-select: text !important;
    -webkit-user-select: text !important;
    -moz-user-select: text !important;
    -ms-user-select: text !important;
  }

  :deep(.x-spreadsheet-cell) {
    user-select: text !important;
    -webkit-user-select: text !important;
    -moz-user-select: text !important;
    -ms-user-select: text !important;
    cursor: text !important;
  }

  :deep(.x-spreadsheet-editor) {
    display: none !important;
  }
}
</style>

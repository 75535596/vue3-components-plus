<!-- eslint-disable vue/valid-attribute-name -->
<!--
  PageTable 表格组件

  1. 支持动态列配置，可配置普通列、操作列、标签列、图片列、链接列等
  2. 支持选择列（多选）和序号列
  3. 支持分页功能，自动计算序号
  4. 支持表格工具栏，可自定义左侧和右侧内容
  5. 支持自定义列插槽，灵活定制列内容
  6. 支持操作按钮配置，可控制按钮的显示和禁用状态
  7. 支持表格属性和事件的透传
  8. 支持多级表头，通过 children 属性配置嵌套列

  使用示例：
  <PageTable
    :table-data="tableData"
    :columns="columns"
    :total="total"
    :current-page="currentPage"
    :page-size="pageSize"
    :show-selection="true"
    :show-index="true"
    :loading="loading"
    @selection-change="handleSelectionChange"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  >
    <template #status="{ row }">
      <el-tag :type="row.status === 1 ? 'success' : 'danger'">
        {{ row.status === 1 ? '启用' : '禁用' }}
      </el-tag>
    </template>
  </PageTable>

  columns 配置示例：
  const columns = [
    { prop: 'id', label: 'ID', width: 80, sortable: true },
    { prop: 'name', label: '姓名', width: 120 },
    { prop: 'status', label: '状态', slot: 'status', width: 100 },
    { prop: 'avatar', label: '头像', type: 'image', width: 80 },
    { prop: 'email', label: '邮箱', type: 'link', minWidth: 180 },
    {
      type: 'action',
      label: '操作',
      width: 200,
      fixed: 'right',
      buttons: [
        { label: '编辑', type: 'primary', link: true, handler: row => handleEdit(row) },
        { label: '删除', type: 'danger', link: true, handler: row => handleDelete(row) }
      ]
    }
  ]

  多级表头配置示例：
  const columns = [
    { prop: 'id', label: 'ID', width: 80 },
    {
      label: '基本信息',
      children: [
        { prop: 'name', label: '姓名', width: 120 },
        { prop: 'age', label: '年龄', width: 80 },
        { prop: 'gender', label: '性别', width: 80 }
      ]
    },
    {
      label: '联系方式',
      children: [
        { prop: 'phone', label: '电话', width: 120 },
        { prop: 'email', label: '邮箱', width: 180 }
      ]
    }
  ]
-->
<template>
  <div class="page-table">
    <slot name="page-content">
      <!-- 表头操作区域 -->
      <div class="table-header" v-if="showHeaderToolbar">
        <div class="header-left">
          <slot name="header-left" />
        </div>
        <div class="header-right">
          <slot name="header-right">
            <el-button
              v-if="showAddButton"
              type="primary"
              :icon="Plus"
              @click="handleAdd"
            >
              {{ addButtonText }}
            </el-button>
          </slot>
        </div>
      </div>

      <!-- 表格主体 -->
      <el-table
        ref="tableRef"
        v-bind="tableAttrs"
        :data="tableData"
        :border="border"
        :stripe="stripe"
        :height="height"
        :max-height="maxHeight"
        :row-key="rowKey"
        :default-expand-all="defaultExpandAll"
        :highlight-current-row="highlightCurrentRow"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        @row-click="handleRowClick"
        v-loading="loading"
      >
        <!-- 选择列 -->
        <el-table-column
          v-if="showSelection"
          type="selection"
          width="55"
          align="center"
          :reserve-selection="!!rowKey"
        />

        <!-- 序号列 -->
        <el-table-column
          v-if="showIndex"
          type="index"
          label="序号"
          width="60"
          :index="getNumIndex"
          align="center"
        />

        <!-- 动态列渲染（支持多级表头） -->
        <TableColumn
          v-for="column in columns"
          :key="column.prop || column.type || column.label"
          :column="column"
          @link-click="handleLinkClick"
        >
          <!-- 透传所有插槽到 TableColumn 组件 -->
          <template v-for="(_, slotName) in $slots" #[slotName]="slotData">
            <slot :name="slotName" v-bind="slotData" />
          </template>
        </TableColumn>

        <!-- 空状态插槽 -->
        <template #empty>
          <slot name="empty">
            <el-empty description="暂无数据" />
          </slot>
        </template>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper" v-if="showPagination">
        <el-pagination
          v-model:current-page="currentPageModel"
          v-model:page-size="pageSizeModel"
          :page-sizes="pageSizes"
          :total="total"
          :layout="paginationLayout"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </slot>
  </div>
</template>

<script setup>
import { ref, computed, useAttrs, reactive, watch } from "vue";
import { Plus } from "@element-plus/icons-vue";
import { createPagination } from "./Pagination";
import TableColumn from "./TableColumn.vue";

// Props 定义
const props = defineProps({
  // 表格数据
  tableData: {
    type: Array,
    default: () => []
  },
  // 列配置
  columns: {
    type: Array,
    default: () => []
  },
  // 操作按钮配置
  actionButtons: {
    type: Array,
    default: () => []
  },
  // 操作列宽度
  actionColumnWidth: {
    type: [String, Number],
    default: 200
  },
  // 操作列固定
  actionFixed: {
    type: [String, Boolean],
    default: "right"
  },
  // 操作列标签
  actionColumnLabel: {
    type: String,
    default: "操作"
  },
  // 操作列对齐方式
  actionColumnAlign: {
    type: String,
    default: "left"
  },
  // 操作列表头对齐方式
  actionColumnHeaderAlign: {
    type: String,
    default: "center"
  },
  // 操作列最小宽度
  actionColumnMinWidth: {
    type: [String, Number],
    default: undefined
  },
  // 是否显示新增按钮
  showAddButton: {
    type: Boolean,
    default: true
  },
  // 新增按钮文本
  addButtonText: {
    type: String,
    default: "新增"
  },
  // 是否显示表头工具栏
  showHeaderToolbar: {
    type: Boolean,
    default: true
  },
  // 是否显示选择列
  showSelection: {
    type: Boolean,
    default: false
  },
  // 是否显示序号列
  showIndex: {
    type: Boolean,
    default: false
  },
  // 是否显示边框
  border: {
    type: Boolean,
    default: true
  },
  // 是否显示斑马纹
  stripe: {
    type: Boolean,
    default: false
  },
  // 表格高度
  height: {
    type: [String, Number],
    default: undefined
  },
  // 表格最大高度
  maxHeight: {
    type: [String, Number],
    default: undefined
  },
  // 行数据的 Key
  rowKey: {
    type: [String, Function],
    default: undefined
  },
  // 是否默认展开所有行
  defaultExpandAll: {
    type: Boolean,
    default: false
  },
  // 是否高亮当前行
  highlightCurrentRow: {
    type: Boolean,
    default: false
  },
  // 是否显示加载状态
  loading: {
    type: Boolean,
    default: false
  },
  // 是否显示分页
  showPagination: {
    type: Boolean,
    default: true
  },
  // 总条数
  total: {
    type: Number,
    default: 0
  },
  // 当前页（可选，如果传入则使用外部值，否则使用内部管理）
  currentPage: {
    type: Number,
    default: null
  },
  // 每页条数（可选，如果传入则使用外部值，否则使用内部管理）
  pageSize: {
    type: Number,
    default: null
  },
  // 每页条数选项
  pageSizes: {
    type: Array,
    default: () => [10, 20, 50, 100]
  },
  // 分页布局
  paginationLayout: {
    type: String,
    default: "total, sizes, prev, pager, next, jumper"
  },
  // 分页参数自定义 key 名称
  pageNumberKey: {
    type: String,
    default: "currentPage"
  },
  pageSizeKey: {
    type: String,
    default: "pageSize"
  },
  pageTotalKey: {
    type: String,
    default: "total"
  }
});

// Emits 定义
const emit = defineEmits([
  "add",
  "selection-change",
  "sort-change",
  "row-click",
  "size-change",
  "current-change",
  "link-click",
  "update:currentPage",
  "update:pageSize"
]);

// 获取所有属性和事件
const attrs = useAttrs();

// 已定义的属性列表（需要排除的属性）
const definedProps = [
  "tableData",
  "columns",
  "actionButtons",
  "actionColumnWidth",
  "actionFixed",
  "actionColumnLabel",
  "actionColumnAlign",
  "actionColumnHeaderAlign",
  "actionColumnMinWidth",
  "showAddButton",
  "addButtonText",
  "showHeaderToolbar",
  "showSelection",
  "showIndex",
  "border",
  "stripe",
  "height",
  "maxHeight",
  "rowKey",
  "defaultExpandAll",
  "highlightCurrentRow",
  "loading",
  "showPagination",
  "total",
  "currentPage",
  "pageSize",
  "pageSizes",
  "paginationLayout",
  "pageNumberKey",
  "pageSizeKey",
  "pageTotalKey"
];

// 已定义的事件列表（需要排除的事件）
const definedEvents = [
  "add",
  "selection-change",
  "sort-change",
  "row-click",
  "size-change",
  "current-change",
  "link-click",
  "update:currentPage",
  "update:pageSize"
];

// 将驼峰式属性名转换为短横线式
const toKebabCase = str => {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
};

// 将事件名转换为 on 前缀格式（Vue 3 事件监听器格式）
const toEventName = eventName => {
  // 将短横线分隔的事件名转换为驼峰式，并添加 on 前缀
  // 例如：selection-change -> onSelectionChange
  return (
    "on" + eventName.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
  );
};

// 过滤出需要透传的属性（排除已定义的属性）
const tableAttrs = computed(() => {
  const result = {};
  for (const key in attrs) {
    // 检查是否是已定义的属性（包括驼峰式和短横线式）
    const isDefinedProp = definedProps.some(
      prop => key === prop || key === toKebabCase(prop)
    );

    // 检查是否是已定义的事件（以 on 开头的事件监听器）
    const isDefinedEvent = definedEvents.some(event => {
      const eventKey = toEventName(event);
      return key === eventKey;
    });

    if (!isDefinedProp && !isDefinedEvent) {
      result[key] = attrs[key];
    }
  }
  return result;
});

// 表格引用
const tableRef = ref(null);

// 内部分页状态管理
const internalPagination = reactive(createPagination());

// 监听外部传入的分页参数，同步到内部状态
watch(
  () => props.currentPage,
  newVal => {
    if (newVal !== null && newVal !== internalPagination.currentPage) {
      internalPagination.currentPage = newVal;
    }
  },
  { immediate: true }
);

watch(
  () => props.pageSize,
  newVal => {
    if (newVal !== null && newVal !== internalPagination.pageSize) {
      internalPagination.pageSize = newVal;
    }
  },
  { immediate: true }
);

// 计算属性：优先使用外部传入的值，否则使用内部管理的值
const currentPageModel = computed({
  get: () => props.currentPage !== null ? props.currentPage : internalPagination.currentPage,
  set: val => {
    internalPagination.currentPage = val;
    emit("update:currentPage", val);
  }
});

const pageSizeModel = computed({
  get: () => props.pageSize !== null ? props.pageSize : internalPagination.pageSize,
  set: val => {
    internalPagination.pageSize = val;
    emit("update:pageSize", val);
  }
});

const getNumIndex = index => {
  return (Number(currentPageModel.value) - 1) * Number(pageSizeModel.value) + index + 1;
};

// 新增按钮点击
const handleAdd = () => {
  emit("add");
};

// 选择变化
const handleSelectionChange = selection => {
  emit("selection-change", selection);
};

// 排序变化
const handleSortChange = sort => {
  emit("sort-change", sort);
};

// 行点击
const handleRowClick = (row, column, event) => {
  emit("row-click", row, column, event);
};

// 每页条数变化
const handleSizeChange = size => {
  emit("size-change", size);
};

// 当前页变化
const handleCurrentChange = page => {
  emit("current-change", page);
};

// 链接点击
const handleLinkClick = (row, column) => {
  emit("link-click", row, column);
};

// 暴露方法
defineExpose({
  tableRef,
  // 选择列相关方法
  clearSelection: () => tableRef.value?.clearSelection?.(),
  toggleRowSelection: (row, selected) =>
    tableRef.value?.toggleRowSelection?.(row, selected),
  toggleAllSelection: () => tableRef.value?.toggleAllSelection?.(),
  setCurrentRow: row => tableRef.value?.setCurrentRow?.(row),
  // 获取选择数据
  getSelectionRows: () => tableRef.value?.getSelectionRows?.() || [],
  getSelectionKeys: () => {
    const rows = tableRef.value?.getSelectionRows?.() || [];
    if (props.rowKey) {
      if (typeof props.rowKey === "function") {
        return rows.map(row => props.rowKey(row));
      } else {
        return rows.map(row => row[props.rowKey]);
      }
    }
    return rows;
  },
  // 设置选择数据
  setSelectionRows: rows => {
    if (!tableRef.value) return;
    // 先清空当前选择
    tableRef.value?.clearSelection?.();
    // 然后设置新的选择
    rows.forEach(row => {
      tableRef.value?.toggleRowSelection?.(row, true);
    });
  },
  setSelectionKeys: keys => {
    if (!tableRef.value || !props.rowKey) return;
    const tableData = props.tableData;

    // 先清空当前选择
    tableRef.value?.clearSelection?.();
    // 然后设置新的选择
    keys.forEach(key => {
      const row = tableData.find(row => {
        if (typeof props.rowKey === "function") {
          return props.rowKey(row) === key;
        } else {
          return row[props.rowKey] === key;
        }
      });
      if (row) {
        tableRef.value?.toggleRowSelection?.(row, true);
      }
    });
  },
  // 判断是否选中
  isRowSelected: row => {
    const selectedRows = tableRef.value?.getSelectionRows?.() || [];
    return selectedRows.includes(row);
  },
  isKeySelected: key => {
    if (!props.rowKey) return false;
    const selectedRows = tableRef.value?.getSelectionRows?.() || [];
    return selectedRows.some(row => {
      if (typeof props.rowKey === "function") {
        return props.rowKey(row) === key;
      } else {
        return row[props.rowKey] === key;
      }
    });
  },
  // 全选/取消全选
  selectAll: () => {
    tableRef.value?.toggleAllSelection?.();
  },
  clearAllSelection: () => {
    tableRef.value?.clearSelection?.();
  },
  // 表格操作相关方法
  clearSort: () => tableRef.value?.clearSort?.(),
  clearFilter: columnKey => tableRef.value?.clearFilter?.(columnKey),
  doLayout: () => tableRef.value?.doLayout?.(),
  sort: (prop, order) => tableRef.value?.sort?.(prop, order),
  // 分页控制方法
  resetPage: () => {
    internalPagination.currentPage = 1;
    emit("update:currentPage", 1);
  },
  setPage: (page) => {
    internalPagination.currentPage = page;
    emit("update:currentPage", page);
  },
  setPageSize: (size) => {
    internalPagination.pageSize = size;
    emit("update:pageSize", size);
  },
  getPagination: () => ({
    [props.pageTotalKey]: props.total,
    [props.pageNumberKey]: currentPageModel.value,
    [props.pageSizeKey]: pageSizeModel.value
  }),
  setPagination: (pagination) => {
    if (pagination.currentPage !== undefined) {
      internalPagination.currentPage = pagination.currentPage;
      emit("update:currentPage", pagination.currentPage);
    }
    if (pagination.pageSize !== undefined) {
      internalPagination.pageSize = pagination.pageSize;
      emit("update:pageSize", pagination.pageSize);
    }
  }
});
</script>

<style scoped>
.page-table {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.table-header {
  flex-shrink: 0; /* 表头不压缩 */
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 4px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pagination-wrapper {
  flex-shrink: 0; /* 分页不压缩 */
  display: flex;
  justify-content: flex-end;
  padding: 16px 0;
}

:deep(.el-table) {
  flex: 1;
  min-height: 0; /* 允许收缩 */
}

:deep(.el-button + .el-button) {
  margin-left: 8px;
}

/* 禁用按钮的自定义样式 */
:deep(.is-disabled-custom) {
  cursor: not-allowed !important;
  pointer-events: auto !important;
  color: #9c9c9c !important;
  /* filter: grayscale(100%); */
}

:deep(.is-disabled-custom:hover) {
  cursor: not-allowed !important;
}
</style>

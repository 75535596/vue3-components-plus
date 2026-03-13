<!--
  PageContainer 页面容器组件
  1. 集成 PageSearch 和 PageTable 组件，统一管理搜索和表格
  2. 支持搜索参数的双向绑定和分页参数的自动管理
  3. 支持外部参数注入，用于特殊场景传参
  4. 支持插槽透传，可自定义搜索项和表格列
  5. 提供丰富的表格操作方法（选择、排序、筛选等）
  6. 支持搜索表单和表格的属性透传
  7. 自动处理搜索、重置、分页等事件

  使用示例：
  <PageContainer
    ref="containerRef"
    v-model:current-page="pagination.currentPage"
    v-model:page-size="pagination.pageSize"
    :search-items="searchItems"
    :external-search-params="externalSearchParams"
    :search-props="{
      labelWidth: '100px',
      defaultPageSize: 10
    }"
    :table-data="tableData"
    :columns="columns"
    :total="pagination.total"
    :table-props="{
      showSelection: true,
      showIndex: true,
      loading: loading,
      rowKey: 'id',
      showPagination: true
    }"
    @search="handleSearch"
    @reset="handleReset"
    @add="handleAdd"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
    @selection-change="handleSelectionChange"
  >
    <template #status="{ row }">
      <el-tag :type="getStatusType(row.status)">
        {{ getStatusText(row.status) }}
      </el-tag>
    </template>
  </PageContainer>

  暴露的方法：
  - getSearchFormData(): 获取搜索表单数据
  - setSearchFormData(data): 设置搜索表单数据
  - resetSearchForm(): 重置搜索表单
  - validateSearchForm(): 验证搜索表单
  - getSelectionRows(): 获取选中的行数据
  - getSelectionKeys(): 获取选中的行ID
  - setSelectionRows(rows): 设置选中的行
  - setSelectionKeys(keys): 通过ID设置选中的行
  - clearAllSelection(): 清空所有选择
  - selectAll(): 全选
  - isRowSelected(row): 判断行是否被选中
  - isKeySelected(key): 判断ID是否被选中
-->
<template>
  <div class="page-container">
    <!-- 搜索区域 -->
    <div class="search-wrapper" v-if="showSearch">
      <PageSearch
        ref="searchRef"
        v-model:page-size="pageSizeModel"
        v-model:current-page="currentPageModel"
        :items="searchItems"
        :external-params="externalSearchParams"
        v-bind="searchProps"
        @search="handleSearch"
        @reset="handleReset"
      >
        <!-- 透传搜索表单插槽 -->
        <template v-for="(_, name) in $slots" :key="name" #[name]="slotData">
          <slot :name="name" v-bind="slotData" />
        </template>
      </PageSearch>
    </div>

    <!-- 表格区域 -->
    <div class="table-wrapper">
      <PageTable
        ref="tableRef"
        :table-data="tableData"
        :columns="columns"
        :action-buttons="actionButtons"
        :total="total"
        v-model:current-page="currentPageModel"
        v-model:page-size="pageSizeModel"
        v-bind="tableProps"
        @add="handleAdd"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        @row-click="handleRowClick"
        @link-click="handleLinkClick"
      >
        <!-- 透传表格插槽 -->
        <template v-for="(_, name) in $slots" :key="name" #[name]="slotData">
          <slot :name="name" v-bind="slotData" />
        </template>
      </PageTable>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from "vue";
import PageSearch from "./PageSearch.vue";
import PageTable from "./PageTable.vue";
import { createPagination } from "./Pagination";

// Props 定义
const props = defineProps({
  // 是否显示搜索区域
  showSearch: {
    type: Boolean,
    default: true
  },
  // 外部注入的搜索参数（用于特殊情况传参）
  externalSearchParams: {
    type: Object,
    default: () => ({})
  },
  // 搜索项配置
  searchItems: {
    type: Array,
    default: () => []
  },
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
  // PageSearch 的其他属性
  searchProps: {
    type: Object,
    default: () => ({})
  },
  // PageTable 的其他属性
  tableProps: {
    type: Object,
    default: () => ({})
  },
  // 数据加载函数（用于分页变化时自动刷新数据）
  loadData: {
    type: Function,
    default: null
  }
});

// Emits 定义
const emit = defineEmits([
  "update:currentPage",
  "update:pageSize",
  "search",
  "reset",
  "add",
  "size-change",
  "current-change",
  "page-change",
  "selection-change",
  "sort-change",
  "row-click",
  "link-click"
]);

// 组件引用
const searchRef = ref(null);
const tableRef = ref(null);

// 内部分页状态管理
const internalPagination = reactive(createPagination());

// 跨页选择：存储待选中的 key 列表
const pendingSelectionKeys = ref(new Set());

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

// 监听 tableData 变化，自动匹配并选中当前页中存在的数据
watch(
  () => props.tableData,
  () => {
    // 如果有待选中的 key，尝试匹配当前页的数据
    if (pendingSelectionKeys.value.size > 0 && tableRef.value) {
      const rowKey = props.tableProps?.rowKey;
      if (!rowKey) return;

      // 使用 nextTick 确保表格已渲染
      setTimeout(() => {
        props.tableData.forEach(row => {
          let key;
          if (typeof rowKey === "function") {
            key = rowKey(row);
          } else {
            key = row[rowKey];
          }
          // 如果当前行在待选中列表中，则选中它
          if (pendingSelectionKeys.value.has(key)) {
            tableRef.value?.toggleRowSelection?.(row, true);
          }
        });
      }, 0);
    }
  },
  { immediate: true }
);

// 事件处理
const handleSearch = params => {
  // 清空表格选中节点和待选中列表
  pendingSelectionKeys.value = new Set();
  if (tableRef.value) {
    tableRef.value.clearSelection?.();
  }
  // 检查是否需要重置页码
  if (params && params._resetPage) {
    const { _resetPage, ...searchParams } = params;
    internalPagination.currentPage = 1;
    emit("search", searchParams);
  } else {
    emit("search", params);
  }
};

const handleReset = () => {
  // 清空表格选中节点和待选中列表
  pendingSelectionKeys.value = new Set();
  if (tableRef.value) {
    tableRef.value.clearSelection?.();
  }
  emit("reset");
};

const handleAdd = () => {
  emit("add");
};

const handleSizeChange = size => {
  emit("size-change", size);
  // 自动触发 page-change 事件，携带完整分页信息
  emit("page-change", {
    currentPage: internalPagination.currentPage,
    pageSize: size
  });
  // 如果传入了 loadData 函数，自动调用
  if (props.loadData) {
    props.loadData();
  }
};

const handleCurrentChange = page => {
  emit("current-change", page);
  // 自动触发 page-change 事件，携带完整分页信息
  emit("page-change", {
    currentPage: page,
    pageSize: internalPagination.pageSize
  });
  // 如果传入了 loadData 函数，自动调用
  if (props.loadData) {
    props.loadData();
  }
};

const handleSelectionChange = selection => {
  emit("selection-change", selection);
};

const handleSortChange = sort => {
  emit("sort-change", sort);
};

const handleRowClick = (row, column, event) => {
  emit("row-click", row, column, event);
};

const handleLinkClick = (row, column) => {
  emit("link-click", row, column);
};

// 创建表格方法的代理对象，直接透传PageTable的方法
const tableMethods = new Proxy(
  {},
  {
    get(target, prop) {
      // 如果访问的是tableRef属性，直接返回
      if (prop === "tableRef") {
        return tableRef;
      }

      // 否则返回一个函数，调用tableRef.value上的对应方法
      return (...args) => {
        if (tableRef.value && typeof tableRef.value[prop] === "function") {
          return tableRef.value[prop](...args);
        }
        // 如果方法不存在，返回undefined
        return undefined;
      };
    }
  }
);

// 初始化搜索参数并触发查询
// 用于在搜索条件准备好后（如异步获取下拉选项后）手动调用
const initSearchAndLoad = () => {
  if (searchRef.value && props.showSearch) {
    // 获取 PageSearch 的初始表单数据（包含默认值和外部参数）
    const initialFormData = searchRef.value.getFormData();
    // 触发 search 事件，让父组件同步搜索参数并加载数据
    emit("search", initialFormData);
  }
};

// 暴露方法
defineExpose({
  searchRef,
  tableRef,
  // 初始化搜索参数并触发查询（用于异步搜索条件场景）
  initSearchAndLoad,
  // 暴露 PageSearch 的方法
  getSearchFormData: () => searchRef.value?.getFormData(),
  setSearchFormData: data => searchRef.value?.setFormData(data),
  resetSearchForm: () => searchRef.value?.resetForm(),
  validateSearchForm: () => searchRef.value?.validate(),
  // 暴露内部分页状态
  getPagination: () => ({ ...internalPagination, total: props.total }),
  setPagination: (pagination) => {
    if (pagination.currentPage !== undefined) {
      internalPagination.currentPage = pagination.currentPage;
    }
    if (pagination.pageSize !== undefined) {
      internalPagination.pageSize = pagination.pageSize;
    }
  },
  resetPagination: () => {
    internalPagination.currentPage = 1;
    internalPagination.pageSize = 10;
  },
  // 直接透传PageTable的所有方法
  ...tableMethods,
  // 为了向后兼容，保留原有的方法名（可选）
  clearTableSelection: () => tableRef.value?.clearSelection?.(),
  toggleRowSelection: (row, selected) =>
    tableRef.value?.toggleRowSelection?.(row, selected),
  toggleAllSelection: () => tableRef.value?.toggleAllSelection?.(),
  setCurrentRow: row => tableRef.value?.setCurrentRow?.(row),
  getSelectionRows: () => tableRef.value?.getSelectionRows?.() || [],
  getSelectionKeys: () => {
    const rows = tableRef.value?.getSelectionRows?.() || [];
    const rowKey = props.tableProps?.rowKey;
    if (rowKey) {
      if (typeof rowKey === "function") {
        return rows.map(row => rowKey(row));
      } else {
        return rows.map(row => row[rowKey]);
      }
    }
    return rows;
  },
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
    if (!tableRef.value) return;
    const rowKey = props.tableProps?.rowKey;
    if (!rowKey) {
      console.warn("setSelectionKeys 需要配置 rowKey");
      return;
    }

    // 存储待选中的 key 列表（用于跨页选择）
    pendingSelectionKeys.value = new Set(keys);

    // 先清空当前选择
    tableRef.value?.clearSelection?.();

    // 然后设置新的选择（只选中当前页存在的数据）
    keys.forEach(key => {
      const row = props.tableData.find(row => {
        if (typeof rowKey === "function") {
          return rowKey(row) === key;
        } else {
          return row[rowKey] === key;
        }
      });
      if (row) {
        tableRef.value?.toggleRowSelection?.(row, true);
      }
    });
  },
  isRowSelected: row => {
    const selectedRows = tableRef.value?.getSelectionRows?.() || [];
    return selectedRows.includes(row);
  },
  isKeySelected: key => {
    const rowKey = props.tableProps?.rowKey;
    if (!rowKey) return false;
    const selectedRows = tableRef.value?.getSelectionRows?.() || [];
    return selectedRows.some(row => {
      if (typeof rowKey === "function") {
        return rowKey(row) === key;
      } else {
        return row[rowKey] === key;
      }
    });
  },
  // 全选/取消全选
  selectAll: () => {
    // 全选当前页所有数据
    const rowKey = props.tableProps?.rowKey;
    if (rowKey) {
      // 将当前页所有数据的 key 添加到待选中列表
      props.tableData.forEach(row => {
        let key;
        if (typeof rowKey === "function") {
          key = rowKey(row);
        } else {
          key = row[rowKey];
        }
        pendingSelectionKeys.value.add(key);
      });
    }
    // 选中当前页所有数据
    props.tableData.forEach(row => {
      tableRef.value?.toggleRowSelection?.(row, true);
    });
  },
  clearAllSelection: () => {
    // 清空待选中列表
    pendingSelectionKeys.value = new Set();
    tableRef.value?.clearSelection?.();
  },
  // 表格操作相关方法
  clearSort: () => tableRef.value?.clearSort?.(),
  clearFilter: columnKey => tableRef.value?.clearFilter?.(columnKey),
  doLayout: () => tableRef.value?.doLayout?.(),
  sort: (prop, order) => tableRef.value?.sort?.(prop, order)
});
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.search-wrapper {
  flex-shrink: 0; /* 搜索区域不压缩 */
  width: 100%;
}

.table-wrapper {
  flex: 1; /* 表格区域占据剩余空间 */
  min-height: 0; /* 允许收缩 */
  width: 100%;
  display: flex;
  flex-direction: column;
}

/* 确保 PageTable 组件占满容器 */
.table-wrapper > * {
  flex: 1;
  min-height: 0;
}
</style>

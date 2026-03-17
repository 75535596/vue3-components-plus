<template>
  <div class="demo-page">
    <!-- 使用 NsTableContainer 组件 -->
    <NsTableContainer
      ref="containerRef"
      page-number-key="currentPage1"
      page-size-key="pageSize1"
      page-total-key="total1"
      :search-items="searchItems"
      :external-search-params="externalSearchParams"
      :search-props="{
        labelWidth: '100px',
      }"
      :table-data="tableData"
      :columns="columns"
      :total="total"
      :table-props="{
        showSelection: true,
        showIndex: true,
        loading: loading,
        rowKey: 'id',
        showPagination: true,
      }"
      :load-data="loadData"
      @search="handleSearch"
      @reset="handleReset"
      @add="handleAdd"
      @selection-change="handleSelectionChange"
    >
      <!-- 替代表格插槽 -->
      <!-- <template #page-content>
        <div>替代表格插槽</div>
      </template> -->
      <!-- 自定义状态列 -->
      <template #status="{ row }">
        <el-tag :type="getStatusType(row.status)">
          {{ getStatusText(row.status) }}
        </el-tag>
      </template>

      <!-- 自定义性别列 -->
      <template #gender="{ row }">
        <el-tag :type="row.gender === 1 ? 'primary' : 'danger'" size="small">
          {{ row.gender === 1 ? '男' : '女' }}
        </el-tag>
      </template>

      <!-- 自定义部门列 -->
      <template #department="{ row }">
        <el-tag effect="plain">{{ getDepartmentText(row.department) }}</el-tag>
      </template>

      <!-- 自定义删除按钮（使用 el-popconfirm） -->
      <template #delete-action="{ row, $index }">
        <el-popconfirm
          title="确定要删除吗？"
          :description="`确定要删除用户吗？`"
          confirm-button-text="确定"
          cancel-button-text="取消"
          @confirm="handleDelete(row)"
        >
          <template #reference>
            <el-button
              type="danger"
              size="small"
              link
              :icon="Delete"
              :disabled="row.status === 0"
              class="is-disabled-custom"
            >
              删除
            </el-button>
          </template>
        </el-popconfirm>
      </template>
    </NsTableContainer>
    <!-- 选择操作区域 -->
    <div class="selection-actions">
      <el-button @click="getSelectedRows">获取选中行</el-button>
      <el-button @click="getSelectedKeys">获取选中ID</el-button>
      <el-button @click="selectRows([1, 5, 21])">选中ID为1, 5, 21的行</el-button>
      <el-button @click="clearSelection">清空选择</el-button>
      <el-button @click="selectAll">全选</el-button>
      <el-button @click="checkSelection">检查选择状态</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Delete, Edit, View } from '@element-plus/icons-vue'
import {
  ElDatePicker,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElPopconfirm,
  ElSelect,
  ElSwitch,
} from 'element-plus'
import { onMounted, ref } from 'vue'
import { fetchDepartmentOptions, fetchStatusOptions, filterUsers, mockUsers } from './mockData.js'

// ==================== 组件引用 ====================
const containerRef = ref(null)

// ==================== 搜索配置 ====================
// 当前搜索参数（从 PageSearch 获取）
const searchParams = ref({})

// 外部注入的搜索参数（用于特殊情况传参）
const externalSearchParams = ref({ test: 'aaa' })

// ==================== 数据状态 ====================
const loading = ref(false)
const tableData = ref([])
const total = ref(0)

const searchItems = ref([
  {
    prop: 'mounth',
    label: '归属月',
    span: 6,
    component: ElSelect,
    attrs: {
      placeholder: '请选择归属月',
      clearable: true,
      type: 'month',
    },
    children: Array.from({ length: 12 }, (_, i) => {
      return {
        label: `${i + 1}月`,
        value: String(i + 1),
      }
    }),
    defaultValue: '3', // 默认选中3月
  },
  {
    prop: 'username',
    label: '用户名',
    span: 6,
    component: ElInput,
    attrs: {
      placeholder: '请输入用户名',
      clearable: true,
      maxlength: 20,
    },
    events: {
      keyup: (e) => {
        if (e.key === 'Enter') {
          handleSearch()
        }
      },
    },
  },
  {
    prop: 'realName',
    label: '真实姓名',
    span: 6,
    component: ElInput,
    attrs: {
      placeholder: '请输入真实姓名',
      clearable: true,
    },
  },
  {
    prop: 'status',
    label: '状态',
    span: 6,
    component: ElSelect,
    attrs: {
      placeholder: '请选择状态',
      clearable: true,
    },
    children: [],
    events: {
      change: (_) => {
        ElMessage.success('下拉选择变化')
      },
    },
  },
  {
    prop: 'department',
    label: '部门',
    span: 6,
    component: ElSelect,
    attrs: {
      placeholder: '请选择部门',
      clearable: true,
      filterable: true,
    },
    children: [],
  },
  {
    prop: 'gender',
    label: '性别',
    span: 6,
    component: ElSelect,
    attrs: {
      placeholder: '请选择性别',
      clearable: true,
    },
    children: [
      { label: '全部', value: '' },
      { label: '男', value: 1 },
      { label: '女', value: 2 },
    ],
  },
  {
    prop: 'createTime',
    label: '创建时间',
    span: 6,
    component: ElDatePicker,
    attrs: {
      type: 'daterange',
      rangeSeparator: '至',
      startPlaceholder: '开始日期',
      endPlaceholder: '结束日期',
      clearable: true,
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD',
    },
  },
  {
    prop: 'phone',
    label: '手机号',
    span: 6,
    component: ElInput,
    attrs: {
      placeholder: '请输入手机号',
      clearable: true,
      maxlength: 11,
    },
  },
  {
    prop: 'active',
    label: '是否激活',
    span: 6,
    component: ElSwitch,
    attrs: {
      activeText: '是',
      inactiveText: '否',
    },
    defaultValue: true,
  },
])

// ==================== 表格配置 ====================
const columns = ref([
  {
    prop: 'id',
    label: 'ID',
    width: 80,
    sortable: true,
    // el-table-column 属性透传示例
    'class-name': 'id-column', // 自定义列样式类名
    resizable: false, // 禁止拖拽调整宽度
  },
  // 多级表头示例：基本信息
  {
    label: '基本信息',
    children: [
      { prop: 'avatar', label: '头像', slot: 'avatar', width: 80 },
      {
        prop: 'username',
        label: '用户名',
        width: 120,
        // 透传属性
        'show-overflow-tooltip': true, // 内容过长时显示 tooltip
        formatter: (row, column, cellValue) => {
          return cellValue ? `@${cellValue}` : '-'
        },
      },
      {
        prop: 'realName',
        label: '真实姓名',
        width: 120,
        'min-width': 100, // 最小宽度
      },
      { prop: 'gender', label: '性别', slot: 'gender', width: 80 },
    ],
  },
  // 多级表头示例：组织信息
  {
    label: '组织信息',
    children: [
      { prop: 'department', label: '部门', slot: 'department', width: 120 },
      { prop: 'status', label: '状态', slot: 'status', width: 100 },
    ],
  },
  // 多级表头示例：联系方式
  {
    label: '联系方式',
    children: [
      {
        prop: 'phone',
        label: '手机号',
        width: 130,
        'show-overflow-tooltip': true,
      },
      {
        prop: 'email',
        label: '邮箱',
        minWidth: 180,
        'show-overflow-tooltip': true,
        filters: [
          // 筛选配置
          { text: 'Gmail', value: '@gmail.com' },
          { text: 'QQ邮箱', value: '@qq.com' },
        ],
        'filter-method': (value, row) => {
          return row.email.includes(value)
        },
      },
    ],
  },
  {
    prop: 'createTime',
    label: '创建时间',
    width: 180,
    sortable: true,
    'sort-orders': ['descending', 'ascending'], // 排序顺序
  },
  // 操作列
  {
    type: 'action',
    label: '操作',
    width: 300,
    fixed: 'right',
    align: 'center',
    headerAlign: 'center',
    buttons: [
      {
        label: '查看',
        type: 'primary',
        link: true,
        icon: View,
        handler: (row) => handleView(row),
      },
      {
        label: '编辑',
        type: 'warning',
        link: true,
        icon: Edit,
        handler: (row) => handleEdit(row),
      },
      {
        label: '删除',
        type: 'danger',
        link: true,
        icon: Delete,
        show: true,
        disabled: (row) => row.status === 0, // 业务时不展示
        slot: 'delete-action', // 使用插槽自定义删除按钮
      },
    ],
  },
])

// ==================== 工具方法 ====================
const getStatusType = (status) => {
  return status === 1 ? 'success' : 'danger'
}

const getStatusText = (status) => {
  return status === 1 ? '启用' : '禁用'
}

const getDepartmentText = (department) => {
  const departmentOptions = [
    { label: '技术部', value: 'tech' },
    { label: '产品部', value: 'product' },
    { label: '运营部', value: 'operation' },
    { label: '人力资源部', value: 'hr' },
    { label: '财务部', value: 'finance' },
  ]
  const dept = departmentOptions.find((d) => d.value === department)
  return dept ? dept.label : department
}

// ==================== 数据加载 ====================
const loadData = async () => {
  loading.value = true
  try {
    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 从组件获取分页信息（使用自定义 key）
    // getPagination() 返回的对象会根据 page-number-key 和 page-size-key 配置使用对应的 key
    // 例如：{ total1: 0, currentPage1: 1, pageSize1: 10 }
    const pagination = containerRef.value?.getPagination() || {
      currentPage1: 1,
      pageSize1: 10,
    }

    // 使用 filterUsers 进行过滤和分页
    // 直接传入 pagination 对象，filterUsers 会根据 keyConfig 解析对应的值
    const result = filterUsers(mockUsers, searchParams.value, pagination, {
      pageNumberKey: 'currentPage1',
      pageSizeKey: 'pageSize1',
    })

    // 更新数据
    tableData.value = result.list
    total.value = result.total
  } catch (error) {
    console.error('加载数据失败：', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// ==================== 事件处理 ====================
// 搜索
const handleSearch = (params) => {
  // 更新搜索参数
  searchParams.value = { ...params }
  loadData()
}

// 重置
const handleReset = () => {
  // 重置搜索参数
  // searchParams.value = {};
  console.log('表单已重置，数据已刷新')
}

// 选择变化
const handleSelectionChange = (selection) => {
  console.log('选中的数据：', selection)
}

// ==================== 选择列操作方法 ====================
const getSelectedRows = () => {
  if (!containerRef.value) return
  const selectedRows = containerRef.value.getSelectionRows()
  ElMessage.success(
    `选中了 ${selectedRows.length} 行数据：${selectedRows.map((r) => r.username).join(', ')}`,
  )
  console.log('选中的行数据：', selectedRows)
}

const getSelectedKeys = () => {
  if (!containerRef.value) return
  const selectedKeys = containerRef.value.getSelectionKeys()
  ElMessage.success(`选中了 ${selectedKeys.length} 个ID：${selectedKeys.join(', ')}`)
  console.log('选中的ID：', selectedKeys)
}

const selectRows = (ids) => {
  if (!containerRef.value) return

  try {
    // 设置选择
    containerRef.value.setSelectionKeys(ids)

    // 延迟检查选择结果
    const selectedRows = containerRef.value.getSelectionRows()
    const selectedKeys = containerRef.value.getSelectionKeys()

    if (selectedRows.length > 0) {
      ElMessage.success(`已选中ID为 ${ids.join(', ')} 的行，实际选中：${selectedKeys.join(', ')}`)
    } else {
      ElMessage.warning(`未选中任何行，请检查数据是否正确`)
    }
  } catch (error) {
    console.error('选择出错：', error)
    ElMessage.error(`选择失败：${error.message}`)
  }
}

const clearSelection = () => {
  if (!containerRef.value) return
  containerRef.value.clearAllSelection()
  ElMessage.success('已清空所有选择')
}

const selectAll = () => {
  if (!containerRef.value) return
  containerRef.value.selectAll()
  ElMessage.success('已全选所有行')
}

const checkSelection = () => {
  if (!containerRef.value) return

  // 检查特定行是否被选中
  const isRow1Selected = containerRef.value.isRowSelected(tableData.value[0])
  const isKey3Selected = containerRef.value.isKeySelected(3)

  ElMessage.info(
    `第一行是否选中：${isRow1Selected ? '是' : '否'}，ID为3是否选中：${
      isKey3Selected ? '是' : '否'
    }`,
  )
}

// 新增
const handleAdd = () => {
  ElMessage.success('新增')
}

// 查看
const handleView = (row) => {
  ElMessage.success(`查看：${row.username}`)
}

// 编辑
const handleEdit = (row) => {
  ElMessage.success(`编辑:${row.username}`)
}

// 删除
const handleDelete = (row) => {
  // 模拟删除
  ElMessage.success(`删除用户 "${row.username}" 成功`)
  loadData()
}

// ==================== 生命周期 ====================
onMounted(async () => {
  // 异步获取状态选项（模拟接口请求，延迟2秒）
  const options = await fetchStatusOptions()
  searchItems.value[2].children = options

  // 异步获取部门选项（模拟接口请求，延迟2秒）
  const departmentOptions = await fetchDepartmentOptions()
  searchItems.value[3].children = departmentOptions

  // 搜索条件准备好后，调用 initSearchAndLoad 初始化搜索参数并加载数据
  // 这会自动获取 PageSearch 的初始表单数据（包含默认值和外部参数）
  containerRef.value?.initSearchAndLoad()
})
</script>

<style scoped>
.demo-page {
  height: 100%;
  padding: 20px;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

.selection-actions {
  margin-top: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.debug-content {
  padding: 0 20px;
}

.debug-item {
  margin-bottom: 24px;
}

.debug-label {
  display: block;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
  font-size: 14px;
}

.debug-value {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  font-size: 13px;
  color: #606266;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  border: 1px solid #e4e7ed;
}
</style>

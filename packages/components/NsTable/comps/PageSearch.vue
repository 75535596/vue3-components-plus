<!--
  PageSearch 搜索表单组件，支持动态配置搜索项，自动生成表单元素。

  1. 支持动态配置搜索项，可配置各种表单组件（输入框、下拉框、日期选择器等）
  2. 支持展开/收起功能，优化页面空间
  3. 支持外部参数注入，用于特殊场景传参
  4. 支持自定义插槽，灵活定制搜索项
  5. 自动管理表单数据，提供获取、设置、重置、验证等方法
  6. 支持按钮位置配置（第一行后面或最后一行后面）
  7. 支持分页参数的自动控制

  使用示例：
  <PageSearch
    :items="searchItems"
    :external-params="externalParams"
    :label-width="'100px'"
    :default-span="6"
    :show-collapse="true"
    :collapse-limit="3"
    @search="handleSearch"
    @reset="handleReset"
  >
    <template #customSlot="{ formData }">
      <el-input v-model="formData.customField" placeholder="自定义搜索项" />
    </template>
  </PageSearch>

  searchItems 配置示例：
  const searchItems = [
    {
      prop: 'username',
      label: '用户名',
      span: 6,
      component: ElInput,
      attrs: {
        placeholder: '请输入用户名',
        clearable: true
      },
      events: {
        keyup: e => {
          if (e.key === 'Enter') handleSearch()
        }
      }
    },
    {
      prop: 'status',
      label: '状态',
      span: 6,
      component: ElSelect,
      attrs: {
        placeholder: '请选择状态',
        clearable: true
      },
      children: [
        { label: '全部', value: '' },
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 }
      ]
    },
    {
      prop: 'createTime',
      label: '创建时间',
      span: 6,
      component: ElDatePicker,
      attrs: {
        type: 'daterange',
        startPlaceholder: '开始日期',
        endPlaceholder: '结束日期'
      }
    },
    {
      type: 'slot',
      slot: 'customSlot',
      label: '自定义',
      span: 6
    }
  ]
-->
<template>
  <div class="page-search">
    <el-form
      ref="formRef"
      :model="formData"
      :label-width="labelWidth"
      :inline="false"
    >
      <el-row :gutter="16">
        <!-- 搜索项 -->
        <template v-for="(item, index) in visibleItems" :key="index">
          <el-col :span="item.span || defaultSpan">
            <el-form-item :label="item.label" :prop="item.prop">
              <!-- 使用 component :is 动态渲染组件 -->
              <component
                :is="item.component"
                v-if="item.component"
                v-model="formData[item.prop]"
                v-bind="item.attrs"
                v-on="item.events || {}"
              >
                <!-- 渲染子组件（如 el-select 的 el-option） -->
                <template v-if="item.children && item.children.length">
                  <component
                    :is="'el-option'"
                    v-for="child in item.children"
                    :key="child.value"
                    :label="child.label"
                    :value="child.value"
                  />
                </template>
              </component>

              <!-- 自定义插槽 -->
              <slot
                v-else-if="item.type === 'slot'"
                :name="item.slot"
                :form-data="formData"
                :item="item"
              />
            </el-form-item>
          </el-col>

          <!-- 按钮放在第一行后面 -->
          <el-col
            v-if="buttonPosition === 'first' && index === firstRowLastIndex"
            :span="buttonSpan"
            class="search-buttons"
          >
            <el-form-item label=" ">
              <el-button type="primary" :icon="Search" @click="handleSearch">
                查询
              </el-button>
              <el-button :icon="Refresh" @click="handleReset"> 重置 </el-button>
              <el-button
                v-if="showCollapse && totalItems > collapseLimit"
                type="primary"
                link
                @click="toggleCollapse"
              >
                {{ isCollapsed ? "展开" : "收起" }}
                <el-icon class="el-icon--right">
                  <component :is="isCollapsed ? 'ArrowDown' : 'ArrowUp'" />
                </el-icon>
              </el-button>
            </el-form-item>
          </el-col>
        </template>

        <!-- 按钮放在最后一行后面 -->
        <el-col
          v-if="buttonPosition === 'last'"
          :span="buttonSpan"
          class="search-buttons"
        >
          <el-form-item label=" ">
            <el-button type="primary" :icon="Search" @click="handleSearch">
              查询
            </el-button>
            <el-button :icon="Refresh" @click="handleReset"> 重置 </el-button>
            <el-button
              v-if="showCollapse && totalItems > collapseLimit"
              type="primary"
              link
              @click="toggleCollapse"
            >
              {{ isCollapsed ? "展开" : "收起" }}
              <el-icon class="el-icon--right">
                <component :is="isCollapsed ? 'ArrowDown' : 'ArrowUp'" />
              </el-icon>
            </el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { Search, Refresh } from "@element-plus/icons-vue";

// Props 定义
const props = defineProps({
  // 搜索项配置
  items: {
    type: Array,
    required: true,
    default: () => []
  },
  // 外部注入的搜索参数（用于特殊情况传参）
  externalParams: {
    type: Object,
    default: () => ({})
  },
  // 标签宽度
  labelWidth: {
    type: String,
    default: "100px"
  },
  // 默认每项占用的 span
  defaultSpan: {
    type: Number,
    default: 6
  },
  // 按钮占用的 span
  buttonSpan: {
    type: Number,
    default: 6
  },
  // 按钮位置：first-第一行后面，last-最后一行后面
  buttonPosition: {
    type: String,
    default: "last",
    validator: value => ["first", "last"].includes(value)
  },
  // 是否显示展开/收起按钮
  showCollapse: {
    type: Boolean,
    default: true
  },
  // 折叠时显示的项数
  collapseLimit: {
    type: Number,
    default: 3
  },
  // 每行显示的项数（用于计算第一行最后一项的索引）
  itemsPerRow: {
    type: Number,
    default: 4
  }
});

// Emits 定义
const emit = defineEmits(["search", "reset"]);

// 表单引用
const formRef = ref(null);

// 表单数据
const formData = ref({});

// 是否折叠
const isCollapsed = ref(true);

// 总项数
const totalItems = computed(() => props.items.length);

// 第一行最后一项的索引
const firstRowLastIndex = computed(() => {
  return Math.min(props.itemsPerRow - 1, props.items.length - 1);
});

// 可见的搜索项
const visibleItems = computed(() => {
  if (!props.showCollapse || !isCollapsed.value) {
    return props.items;
  }
  return props.items.slice(0, props.collapseLimit);
});

// 初始化表单数据
const initFormData = () => {
  const data = {};
  props.items.forEach(item => {
    if (item.defaultValue !== undefined) {
      data[item.prop] = item.defaultValue;
    } else {
      data[item.prop] = undefined;
    }
  });
  // 合并外部参数
  formData.value = { ...data, ...props.externalParams };
};

// 监听外部参数变化
watch(
  () => props.externalParams,
  newVal => {
    if (newVal && Object.keys(newVal).length > 0) {
      formData.value = { ...formData.value, ...newVal };
    }
  },
  { deep: true, immediate: true }
);

// 监听 items 变化
watch(
  () => props.items,
  () => {
    initFormData();
  },
  { deep: true }
);

// 查询
const handleSearch = () => {
  // 搜索时通知父组件重置到第一页（通过 search 事件携带 resetPage 标记）
  emit("search", { ...formData.value, _resetPage: true });
};

// 重置
const handleReset = () => {
  // 重置表单数据
  const data = {};
  props.items.forEach(item => {
    if (item.defaultValue !== undefined) {
      data[item.prop] = item.defaultValue;
    } else {
      data[item.prop] = undefined;
    }
  });
  // 合并外部参数，确保重置后外部参数不丢失
  formData.value = { ...data, ...props.externalParams };

  // 自动执行查询，并通知父组件重置到第一页
  emit("search", { ...formData.value, _resetPage: true });
  emit("reset");
};

// 切换折叠状态
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

// 暴露方法
defineExpose({
  formRef,
  getFormData: () => ({ ...formData.value }),
  setFormData: data => {
    formData.value = { ...formData.value, ...data };
  },
  resetForm: handleReset,
  validate: () => formRef.value?.validate(),
  clearValidate: props => formRef.value?.clearValidate(props)
});

// 组件挂载时初始化
onMounted(() => {
  initFormData();
});
</script>

<style scoped>
.page-search {
  background: #fff;
  padding: 16px 16px 0;
  margin-bottom: 16px;
  border-radius: 4px;
}

.search-buttons {
  display: flex;
  align-items: center;
}

.search-buttons :deep(.el-form-item) {
  margin-bottom: 16px;
}

:deep(.el-form-item) {
  margin-bottom: 16px;
}

:deep(.el-select),
:deep(.el-date-editor),
:deep(.el-input-number) {
  width: 100%;
}
</style>

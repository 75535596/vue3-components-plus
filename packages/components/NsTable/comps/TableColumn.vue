<!--
  TableColumn 递归列渲染组件
  用于支持多级表头功能
-->
<template>
  <el-table-column
    :prop="column.prop"
    :label="column.label"
    :width="column.width"
    :min-width="column.minWidth"
    :fixed="column.fixed"
    :sortable="column.sortable"
    :align="column.align || 'center'"
    :header-align="column.headerAlign"
    :show-overflow-tooltip="column.showOverflowTooltip !== false"
    v-bind="getColumnAttrs(column)"
  >
    <!-- 如果有子列，递归渲染 -->
    <template v-if="column.children && column.children.length">
      <TableColumn
        v-for="(child, index) in column.children"
        :key="child.prop || `${column.label}-child-${index}`"
        :column="child"
      >
        <!-- 透传所有插槽 -->
        <template v-for="(_, slotName) in $slots" #[slotName]="slotData">
          <slot :name="slotName" v-bind="slotData" />
        </template>
      </TableColumn>
    </template>

    <!-- 如果没有子列，渲染列内容 -->
    <template v-if="!column.children || !column.children.length" #default="scope">
      <!-- 操作列类型 -->
      <template v-if="column.type === 'action'">
        <template v-for="(btn, index) in column.buttons" :key="index">
          <!-- 使用插槽自定义操作按钮 -->
          <slot v-if="btn.slot" :name="btn.slot" :row="scope.row" :$index="scope.$index" />
          <!-- 默认按钮渲染 -->
          <template v-else>
            <el-button
              v-if="isBtnShow(btn, scope.row)"
              :type="btn.type || 'primary'"
              :size="btn.size || 'small'"
              :link="btn.link"
              :icon="btn.icon"
              :disabled="isBtnDisabled(btn, scope.row)"
              :class="{
                'is-disabled-custom': isBtnDisabled(btn, scope.row),
              }"
              @click.stop="handleButtonClick(btn, scope.row, scope.$index)"
            >
              {{ btn.label }}
            </el-button>
          </template>
        </template>
      </template>
      <!-- 使用插槽自定义列内容 -->
      <slot
        v-else-if="column.slot"
        :name="column.slot"
        :row="scope.row"
        :column="column"
        :$index="scope.$index"
      >
        {{ scope.row[column.prop] }}
      </slot>
      <!-- 默认渲染 -->
      <template v-else>
        <template v-if="column.type === 'tag'">
          <el-tag :type="getTagType(scope.row[column.prop], column.tagMap)">
            {{ formatValue(scope.row[column.prop], column) }}
          </el-tag>
        </template>
        <template v-else-if="column.type === 'image'">
          <el-image
            :src="scope.row[column.prop]"
            :style="{
              width: column.imageWidth || '50px',
              height: column.imageHeight || '50px',
            }"
            :preview-src-list="column.previewList ? [scope.row[column.prop]] : undefined"
            fit="cover"
          />
        </template>
        <template v-else-if="column.type === 'link'">
          <el-link type="primary" @click="handleLinkClick(scope.row, column)">
            {{ formatValue(scope.row[column.prop], column) }}
          </el-link>
        </template>
        <template v-else>
          {{ formatValue(scope.row[column.prop], column) }}
        </template>
      </template>
    </template>
  </el-table-column>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

// Props 定义
const props = defineProps({
  column: {
    type: Object,
    required: true,
  },
})

// Emits 定义
const emit = defineEmits(['link-click', 'button-click'])

// 判断按钮是否禁用
const isBtnDisabled = (btn, row) => {
  if (!btn.disabled) return false
  if (typeof btn.disabled === 'function') {
    return btn.disabled(row)
  }
  return Boolean(btn.disabled)
}

// 判断按钮是否显示
const isBtnShow = (btn, row) => {
  if (!btn.show) return true
  if (typeof btn.show === 'function') {
    return btn.show(row)
  }
  return Boolean(btn.show)
}

// 格式化值
const formatValue = (value, column) => {
  if (column.formatter) {
    return column.formatter(value)
  }
  if (column.enum) {
    return column.enum[value] || value
  }
  return value
}

// 获取标签类型
const getTagType = (value, tagMap) => {
  if (!tagMap) return ''
  return tagMap[value] || ''
}

// 按钮点击处理
const handleButtonClick = (btn, row, index) => {
  // 如果按钮被禁用，阻止点击操作
  if (isBtnDisabled(btn, row)) {
    return
  }
  // 执行按钮的点击处理函数
  if (btn.handler) {
    btn.handler(row, index)
  }
  emit('button-click', btn, row, index)
}

// 链接点击
const handleLinkClick = (row, column) => {
  emit('link-click', row, column)
}

// 已显式绑定的列属性（需要排除的属性）
const boundColumnProps = [
  'prop',
  'label',
  'width',
  'minWidth',
  'fixed',
  'sortable',
  'align',
  'headerAlign',
  'showOverflowTooltip',
  'type',
  'slot',
  'buttons',
  'tagMap',
  'imageWidth',
  'imageHeight',
  'previewList',
  'formatter',
  'format',
  'enum',
  'attrs',
  'children',
]

// 获取列的透传属性
const getColumnAttrs = (column) => {
  const result = {}
  for (const key in column) {
    if (!boundColumnProps.includes(key)) {
      result[key] = column[key]
    }
  }
  // 支持 attrs 字段透传额外属性
  if (column.attrs) {
    Object.assign(result, column.attrs)
  }
  return result
}
</script>

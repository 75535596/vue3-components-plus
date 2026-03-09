<!--
 前提：
 1. 需要使用el-form，配置 :model="state" ref="formRef"（由于当前使用elment-plus作为基础表单）

 配置项说明：
 model: string = "" // 可选table, vertical, horizontal（默认）
 readOnly: boolean = false // 是否只读，默认false，一般配合无子列中的自定义component时使用
 backgroundColor: string = "" // 背景颜色，默认透明
 labelColor: string = "#0A7BFF" // (父+子)文字颜色，默认#0A7BFF
 labelWidth: string = "80px" // (父+子)文字宽度，默认80px
 superLabelWidth: string = "30px" // 父文字宽度（仅对有子列的情况），默认30px
 gapH: string = "10px"  // 垂直行间距（model: table无效）
 gapV: string = "10px"  // 水平列间距（model: table无效）
 height: string = "32px" // 文字高度，默认32px
 rows?: Array<Array<IRowInfo>> = [] // [可选]表单数据列表, 详细内容见下
 valueEmptyTag: string = "--" // 没值时显示的内容，默认"--"
 formPropKey: string = "rows" // 表单校验路径前缀，用于支持多个DetailView
 hasPoint: boolean = false // 是否显示点状前缀（仅vertical模式有效）

 行配置项说明（rows中的每个配置项）：
 label: string // 标签文本（重要）
 hideLabel: boolean // 是否显示标签文本
 value: any // 当前值（重要）
 defaultValue?: any // 默认值（用于重置表单）
 valueEmptyTag: string = "--" // 没值时显示的内容，默认"--"，优先级高于props.valueEmptyTag
 span?: string | number // 宽度配置，支持24栅格和百分比
 children?: IRowInfo[] // 子项配置（用于有子列的情况）
 component?: any // 组件类型（支持element-plus组件和自定义组件）
 params?: Record<string, any> // 组件参数（包含rules校验规则, options下拉框等）
 events?: Record<string, Function> // 组件事件
 slots?: Record<string, any> // 组件slot
 ref?: any // 组件实例引用
 readOnlyUseComponent?: boolean // 只读时是否使用自定义组件，true：使用组件，false：使用span展示value文字
 span配置说明：
 // span支持24栅格和百分比
 // 如果配置的span总和少于24，则使用24栅格，否则使用百分比
 // 不配置span的，则按照全行-已配置的/未配置的比例进行分配
 
 rows配置示例：
 [
    // 无子列（编辑+详情）
    // component: 支持element-plus组件和自定义组件
    // params: 组件参数(包含rules校验规则, options下拉框)
    // events: 组件事件
    // slots: 组件slot
    [
        {
            label: "输入框",
            value: "",
            component: ElInput,
            params: {
                placeholder: "请输入内容",
            },
            slots: {
                append: () => h(ElButton, { type: "primary" }, "搜索"),
                prefix: () => h(ElIcon, null, () => h(Warning)),
            },
            events: {
                input: (val) => {
                    console.log("输入值:", val);
                },
            },
        },
        {
            label: "下拉框",
            value: "b",
            component: ElSelect,
            params: {
                props: {
                    value: "value",
                    label: "label",
                    options: "options",
                },
                options: [
                    {
                        label: "正常蓄水位(m)",
                        value: "a",
                    },
                    {
                        label: "前汛期防洪限制水位(m)",
                        value: "b",
                    },
                    {
                        label: "后汛期防洪限制水位(m)",
                        value: "c",
                    },
                ],
            },
            events: {
                change: (val) => {
                    console.log("*****>", val);
                },
            },
        },
        // ！！！文件上传，需要引入：const { handleRemoveFile, handleFileSuccessFile, handleCheckFileRequire } = useFileUpload(state, state.uploadKey);
        {
            key: "files",
            label: "文件上传",
            value: "",
            component: fileUpload,
            readOnlyUseComponent: true, // 只读时为true：使用自定义组件，false：使用span展示value文字
            params: {
                rules: [
                    {
                        required: true,
                        message: "请上传模型文件",
                        trigger: "change",
                    },
                ],
                limit: "1",
                disabled: props.readOnly,
                actionUrl: state.uploadFileUrl,
                fileList: state.fileFileList,
                tip: "说明：基准模型文件，只支持.pt格式，数量限定为1。",
            },
            events: {
                'on-remove': (file, fileList) => handleRemoveFile(file, fileList, "files", state.rows2),
                'onSuccess': (response, file, fileList) => handleFileSuccessFile(response, file, fileList, "files", state.rows2),
                'change': () => {
                    handleCheckFileRequire(state.rows2, "files", formRef, "rows2")
                }
            }
        }
    ],
    [
        { label: "第二行第1个", value: "xxx", span: "50%" },
        { label: "第二行第2个", value: "yyyy" },
        { label: "第二行第3个", value: "zzz", span: "30%" },
    ],
    // 有子列（仅详情）
    [
        { label: "设计", children: [
            { label: "洪水标准（正常运用）（P=%）", value: abaqgl?.createTime || '--' },
            { label: "洪峰流量（m³/s）", value: abaqgl?.createTime || '--' },
            { label: "1日洪水总量（万m³）", value: abaqgl?.createTime || '--' },
            { label: "3日洪水总量（万m³）", value: abaqgl?.createTime || '--' },
        ] },
        { label: "校核", children: [
            { label: "洪水标准（正常运用）（P=%）", value: abaqgl?.createTime || '--' },
            { label: "洪峰流量（m³/s）", value: abaqgl?.createTime || '--' },
            { label: "1日洪水总量（万m³）", value: abaqgl?.createTime || '--' },
            { label: "3日洪水总量（万m³）", value: abaqgl?.createTime || '--' },
        ] },
    ],
]

使用方法：
form表单校验：（DetailView需要包裹在el-form中）
<el-form
    :model="state"
    :rules="rules"
    ref="formRef"
    :label-position="'left'"
    label-width="150">
    <DetailView
        :readOnly="state.readOnly" // 是否只读
        :model="state.model" // 详情为默认，编辑为vertical
        :rows="state.rows" // 详情数据
        formPropKey="rows" // 配合校验规则使用，传入rows中的rows字符串即可
        labelColor="#606266"
        labelWidth="150"
        gapH="20px"
        gapV="10px"
    ></DetailView>
</el-form>

// js校验
formRef.value.validate((valid, fields) => {
    if (valid) {
        console.log("校验通过!", state.rows);
    } else {
        console.log("校验失败!", fields);
    }
});
-->
<template>
    <div
      :class="[
        'detail-view',
        props.model.indexOf('table') > -1 ? 'model-table' : '',
        props.model.indexOf('vertical') > -1 ? 'vertical' : 'horizontal',
      ]"
      v-if="props.rows.length"
    >
      <div v-for="(row, index) in props.rows" :key="index" class="detial-row">
        <div
          :class="[
            'detial-row-item',
            props.model.indexOf('vertical') > -1 ? 'vertical' : 'horizontal',
            rowInfo?.children ? 'has-child' : '',
          ]"
          v-for="(rowInfo, _index) in row"
          :key="_index"
          :style="getRowItemStyle(row, rowInfo, _index)"
        >
          <!-- 有子列 -->
          <template v-if="rowInfo?.children?.length">
            <div class="sub-row">
              <span
                v-sline
                :class="[
                  'sub-row-title',
                  'detial-row-item-label',
                  props.model.indexOf('table') > -1 ? 'model-table' : '',
                  props.model.indexOf('vertical') > -1 ? 'vertical' : 'horizontal',
                ]"
              >
                {{ rowInfo.label || '' }}
              </span>
              <div :class="['sub-row-group']">
                <div
                  :class="['sub-row-item']"
                  v-for="(subRowInfo, _subIndex) in rowInfo.children"
                  :key="_subIndex"
                >
                  <el-tooltip
                    :hide-after="0"
                    :show-after="500"
                    :content="subRowInfo.label || ''"
                    placement="top-start"
                    popper-class="detail-view-tooltip"
                  >
                    <span
                      :class="[
                        'detial-row-item-label',
                        props.model.indexOf('table') > -1 ? 'model-table' : '',
                        props.model.indexOf('vertical') > -1 ? 'vertical' : 'horizontal',
                      ]"
                    >
                      {{ subRowInfo.label || '' }}
                    </span>
                  </el-tooltip>
                  <el-tooltip
                    :hide-after="0"
                    :show-after="500"
                    :disabled="subRowInfo.component"
                    :content="subRowInfo.value || ''"
                    placement="top-start"
                    popper-class="detail-view-tooltip"
                  >
                    <span
                      v-if="!subRowInfo.component"
                      :class="[
                        'detial-row-item-value',
                        props.model.indexOf('table') > -1 ? 'model-table' : '',
                        props.model.indexOf('vertical') > -1 ? 'vertical' : 'horizontal',
                      ]"
                    >
                      {{ subRowInfo.value || '' }}
                    </span>
                    <span
                      v-else
                      :class="[
                        'detial-row-item-value',
                        props.model.indexOf('table') > -1 ? 'model-table' : '',
                      ]"
                    >
                      <component
                        :is="subRowInfo.component"
                        v-bind="subRowInfo.params"
                        :rowData="subRowInfo"
                        :ref="(el) => setSubComponentRef(el, subRowInfo, index, _index, _subIndex)"
                      >
                        <!-- 传递 slot -->
                        <template
                          v-for="(slot, slotName) in subRowInfo.slots || {}"
                          :key="slotName"
                          #[slotName]
                        >
                          <component :is="typeof slot === 'function' ? slot() : slot" />
                        </template>
                      </component>
                    </span>
                  </el-tooltip>
                </div>
              </div>
            </div>
          </template>
          <!-- 无子列 -->
          <template v-else>
            <el-tooltip
              :hide-after="0"
              :show-after="500"
              :content="rowInfo.label || ''"
              placement="top-start"
              popper-class="detail-view-tooltip"
            >
              <span
                v-sline
                v-if="(!rowInfo.component || readOnly ) && !rowInfo.hideLabel"
                :class="[
                  'detial-row-item-label',
                  props.hasPoint ? 'has-point' : '',
                  props.model.indexOf('table') > -1 ? 'model-table' : '',
                  props.model.indexOf('vertical') > -1 ? 'vertical' : 'horizontal',
                ]"
              >
                {{ rowInfo.label ?? '' }}
              </span>
            </el-tooltip>
            <el-tooltip
              :hide-after="0"
              :show-after="500"
              :disabled="!(readOnly && (!isUploadComponent(rowInfo) && !rowInfo.readOnlyUseComponent /* && (typeof rowInfo.value === 'string' || Array.isArray(rowInfo.value)) */))"
              :content="getComponentValue(rowInfo)"
              placement="top-start"
              popper-class="detail-view-tooltip"
            >
              <span
                v-if="
                  !rowInfo.component || (readOnly && (!isUploadComponent(rowInfo) && !rowInfo.readOnlyUseComponent /* || !rowInfo.value */))
                "
                :class="[
                  'default-span-component',
                  'detial-row-item-value',
                  props.model.indexOf('table') > -1 ? 'model-table' : '',
                  props.model.indexOf('vertical') > -1 ? 'vertical' : 'horizontal',
                ]"
                v-bind="rowInfo?.params"
              >
                {{ getComponentValue(rowInfo) }}
              </span>
              <span
                v-else
                :class="[
                  'custom-component',
                  'detial-row-item-value',
                  props.model.indexOf('table') > -1 ? 'model-table' : '',
                ]"
              >
                <!-- element-plus自带组件 -->
                <!-- <template v-if="checkIsElempentComponent(rowInfo)"> -->
                <el-form-item
                  :class="[
                    'component-form-item',
                    readOnly && (isUploadComponent(rowInfo) || rowInfo.readOnlyUseComponent) ? 'hidden' : '',
                  ]"
                  :label="rowInfo.label"
                  :prop="`${props.formPropKey}.${index}.${_index}.value`"
                  :rules="rowInfo?.params?.rules || []"
                >
                  <!-- 数字限制 -->
                  <component
                    v-if="getDirectiveType(rowInfo) === 'number'"
                    :is="rowInfo.component"
                    v-bind="getComponentParams(rowInfo)"
                    v-model="rowInfo.value"
                    v-on="rowInfo.events"
                    v-length.number="getDirectiveValue(rowInfo)"
                    :rowData="rowInfo"
                    :ref="(el) => setComponentRef(el, rowInfo, index, _index)"
                    class="elementplus-component-item"
                  >
                    <!-- 传递 slot -->
                    <template
                      v-for="(slot, slotName) in rowInfo.slots || {}"
                      :key="slotName"
                      #[slotName]
                    >
                      <component :is="typeof slot === 'function' ? slot() : slot" />
                    </template>
                  </component>
                  <!-- 正则限制 -->
                  <component
                    v-else-if="getDirectiveType(rowInfo) === 'regex'"
                    :is="rowInfo.component"
                    v-bind="getComponentParams(rowInfo)"
                    v-model="rowInfo.value"
                    v-on="rowInfo.events"
                    v-length.regex="getDirectiveValue(rowInfo)"
                    :rowData="rowInfo"
                    :ref="(el) => setComponentRef(el, rowInfo, index, _index)"
                    class="elementplus-component-item"
                  >
                    <!-- 传递 slot -->
                    <template
                      v-for="(slot, slotName) in rowInfo.slots || {}"
                      :key="slotName"
                      #[slotName]
                    >
                      <component :is="typeof slot === 'function' ? slot() : slot" />
                    </template>
                  </component>
                  <!-- 数值范围 -->
                  <component
                    v-else-if="getDirectiveType(rowInfo) === 'range'"
                    :is="rowInfo.component"
                    v-bind="getComponentParams(rowInfo)"
                    v-model="rowInfo.value"
                    v-on="rowInfo.events"
                    v-length.range="getDirectiveValue(rowInfo)"
                    :rowData="rowInfo"
                    :ref="(el) => setComponentRef(el, rowInfo, index, _index)"
                    class="elementplus-component-item"
                  >
                    <!-- 传递 slot -->
                    <template
                      v-for="(slot, slotName) in rowInfo.slots || {}"
                      :key="slotName"
                      #[slotName]
                    >
                      <component :is="typeof slot === 'function' ? slot() : slot" />
                    </template>
                  </component>
                  <component
                    v-else
                    :is="rowInfo.component"
                    v-bind="getComponentParams(rowInfo)"
                    v-model="rowInfo.value"
                    v-on="rowInfo.events"
                    v-length="getDirectiveValue(rowInfo) || 50"
                    :rowData="rowInfo"
                    :ref="(el) => setComponentRef(el, rowInfo, index, _index)"
                    class="elementplus-component-item"
                  >
                    <!-- 传递 slot -->
                    <template
                      v-for="(slot, slotName) in rowInfo.slots || {}"
                      :key="slotName"
                      #[slotName]
                    >
                      <component :is="typeof slot === 'function' ? slot() : slot" />
                    </template>
                  </component>
                </el-form-item>
                <!-- </template> -->
                <!-- 自定义组件 -->
                <!-- <component
                                  v-else
                                  :is="rowInfo.component"
                                  v-bind="rowInfo.params"
                                  v-model="rowInfo.value"
                                  v-on="rowInfo.events"
                                  v-length="getDirectiveValue(rowInfo) || 50"
                                  :rowData="rowInfo"
                              >
                                  <template v-if="rowInfo.slots" v-for="(slot, slotName) in rowInfo.slots" :key="slotName" #[slotName]>
                                      <component :is="typeof slot === 'function' ? slot() : slot" />
                                  </template>
                              </component> -->
              </span>
            </el-tooltip>
          </template>
        </div>
      </div>
    </div>
  </template>
  <script setup lang="ts">
  import { computed, ref, watch, defineExpose, onMounted, nextTick } from 'vue'
import { isNotNull } from '../../utils'
  
  export interface IRowInfo {
    label: string
    hideLabel?: boolean
    value: string
    defaultValue?: any
    valueEmptyTag?: string
    span?: string | number
    children?: IRowInfo[]
    component?: any
    params?: Record<string, any>
    events?: Record<string, Function>
    slots?: Record<string, any>
    ref?: any // 组件实例引用
  }
  
  const props = defineProps({
    // 可选table, vertical, 默认不带边框颜色
    model: {
      type: String,
      default: () => '', // 可选table, vertical
    },
    readOnly: {
      type: Boolean,
      default: () => false,
    },
    // (父+子)文字宽度
    labelWidth: {
      type: String,
      default: '80px',
    },
    // 父文字宽度
    superLabelWidth: {
      type: String,
      default: '30px',
    },
    // (父+子)文字颜色
    labelColor: {
      type: String,
      default: '#0A7BFF',
    },
    // 行中多个间隔（model: table无效）
    gapH: {
      type: String,
      default: '10px',
    },
    // 列间隔（model: table无效）
    gapV: {
      type: String,
      default: '10px',
    },
    // 文字高度
    height: {
      type: String,
      default: '32px',
    },
    // 列表
    rows: {
      type: Array<IRowInfo>,
      default: () => [],
    },
    backgroundColor: {
      type: String,
      default: '',
    },
    // 没值时显示的内容，默认'--'
    valueEmptyTag: {
      type: String,
      default: '--',
    },
    // 表单校验路径前缀，用于支持多个DetailView
    formPropKey: {
      type: String,
      default: 'rows',
    },
    hasPoint: {
      type: Boolean,
      default: false,
    },
  })
  
  // 存储初始值的引用
  const initialValues = ref(new Map())
  
  // 存储组件实例的映射
  const componentRefs = ref(new Map())
  
  const customBackgroundColor = computed(() => {
    if (props.model === 'vertical') {
      return props.backgroundColor || '#eef4fb'
    }
    return 'transparent'
  })
  
  // 深拷贝函数
  function deepClone(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj
    }
    if (obj instanceof Date) {
      return new Date(obj.getTime())
    }
    if (obj instanceof Array) {
      return obj.map((item) => deepClone(item))
    }
    if (typeof obj === 'object') {
      const cloned: any = {}
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = deepClone(obj[key])
        }
      }
      return cloned
    }
    return obj
  }

  // 初始化defaultValue字段
  function initializeDefaultValues(rows: any[]) {
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex]
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const item = row[colIndex]
        
        // 为主项设置defaultValue
        if (item.key && item.defaultValue === undefined) {
          item.defaultValue = deepClone(item.value)
        }

        // 检查子项
        if (item.children && Array.isArray(item.children)) {
          for (let childIndex = 0; childIndex < item.children.length; childIndex++) {
            const child = item.children[childIndex]
            if (child.key && child.defaultValue === undefined) {
              child.defaultValue = deepClone(child.value)
            }
          }
        }
      }
    }
  }
  
  // 保存初始值
  function saveInitialValues(rows: any[]) {
    initialValues.value.clear()
  
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex]
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const item = row[colIndex]
        if (item.key) {
          // 如果没有defaultValue，则将当前value作为defaultValue
          if (item.defaultValue === undefined) {
            item.defaultValue = deepClone(item.value)
          }
          
          // 保存初始值的深拷贝
          initialValues.value.set(item.key, deepClone(item.value))
  
          // 如果有删除的文件列表，也保存初始状态
          if (item.delValue !== undefined) {
            initialValues.value.set(`${item.key}_delValue`, deepClone(item.delValue))
          }
        }
  
        // 检查子项
        if (item.children && Array.isArray(item.children)) {
          for (let childIndex = 0; childIndex < item.children.length; childIndex++) {
            const child = item.children[childIndex]
            if (child.key) {
              // 如果没有defaultValue，则将当前value作为defaultValue
              if (child.defaultValue === undefined) {
                child.defaultValue = deepClone(child.value)
              }
              
              // 保存子项初始值的深拷贝
              initialValues.value.set(child.key, deepClone(child.value))
  
              // 如果有删除的文件列表，也保存初始状态
              if (child.delValue !== undefined) {
                initialValues.value.set(`${child.key}_delValue`, deepClone(child.delValue))
              }
            }
          }
        }
      }
    }
  }
  
  // 设置主组件引用
  function setComponentRef(el: any, rowInfo: IRowInfo, rowIndex: number, colIndex: number) {
    if (el && rowInfo.key) {
      rowInfo.ref = el
      componentRefs.value.set(rowInfo.key, el)
    }
  }
  
  // 设置子组件引用
  function setSubComponentRef(el: any, subRowInfo: IRowInfo, rowIndex: number, colIndex: number, subIndex: number) {
    if (el && subRowInfo.key) {
      subRowInfo.ref = el
      componentRefs.value.set(subRowInfo.key, el)
    }
  }
  
  // 根据key获取组件实例
  function getFormNodeRefByKey(key: string) {
    return componentRefs.value.get(key) || null
  }
  
  // 组件挂载时初始化defaultValue
  onMounted(() => {
    if (props.rows && props.rows.length > 0) {
      initializeDefaultValues(props.rows)
      props.rows?.forEach((rows) => {
        if(Array.isArray(rows)){
          rows?.forEach(rowInfo => {
            if (rowInfo.component) {
              // 处理字符串形式的组件名称
              const componentName = typeof rowInfo.component === 'string' 
                ? rowInfo.component.replace('-', '').toLowerCase()
                : (rowInfo.component.name + '').replace('-', '').toLowerCase()
              if ((componentName === 'elselect' 
                    || componentName === 'elradiogroup' 
                    || componentName === 'elcheckboxgroup'
                    || componentName === 'elradio' 
                    || componentName === 'elcheckbox'
                    || componentName === 'elcascader'
                  ) && !rowInfo.params?.props) {
                rowInfo.params.props = {
                  value: 'value',
                  label: 'label',
                  options: 'options',
                  disabled: 'disabled',
                }
              }
            }
          });
        }
      })
    }
  })

  // 监听 rows 变化，保存初始值
  watch(
    () => props.rows,
    (newRows) => {
      if (newRows && newRows.length > 0) {
        initializeDefaultValues(newRows)
        saveInitialValues(newRows)
      }
    },
    { immediate: true, deep: true },
  )
  
  function checkIsElempentComponent(rowInfo: any, name = 'el') {
    if (rowInfo.component) {
      // 处理字符串形式的组件名称
      const componentName = typeof rowInfo.component === 'string' 
        ? rowInfo.component.toLowerCase()
        : (rowInfo.component.name + '').toLowerCase()
      return componentName.startsWith(name)
    } else {
      return false
    }
  }
  
  function isUploadComponent(rowInfo: any) {
    if (!rowInfo.component) return false
    // 处理字符串形式的组件名称
    const componentName = typeof rowInfo.component === 'string' 
      ? rowInfo.component.toLowerCase()
      : ((rowInfo.component.name || '') + '').toLowerCase()
    return componentName.indexOf('upload') !== -1
  }
  
  // 获取组件参数，格式化placeholder 和 排除指令相关的参数
  function getComponentParams(rowInfo: any) {
    const params = { ...rowInfo.params }
    // 删除指令相关的参数，避免传递给组件
    delete params['v-length']
    delete params['v-length.number']
    delete params['v-length.regex']
    delete params['v-length-modifier']
  
    if (rowInfo.component) {
      // 处理字符串形式的组件名称
      const componentName = typeof rowInfo.component === 'string' 
        ? rowInfo.component.replaceAll('-', '').toLowerCase()
        : (rowInfo.component.name + '').replaceAll('-', '').toLowerCase()
      // 处理 placeholder 默认值
      if (componentName.indexOf('input') !== -1 || componentName === 'elautocomplete') {
        params.placeholder = params.placeholder || '请输入'
      } else if (
        componentName === 'elselect' ||
        componentName === 'eltimeselect' ||
        componentName === 'eltimepicker' ||
        componentName === 'eldatepicker'
      ) {
        params.placeholder = params.placeholder || '请选择'
      }
    }
    return params
  }
  
  // 获取指令值
  function getDirectiveValue(rowInfo: any) {
    if (!rowInfo.params) {
      return undefined
    }
  
    // 处理 v-length.number 语法
    if (rowInfo.params['v-length.number'] !== undefined) {
      return rowInfo.params['v-length.number']
    }
  
    if (rowInfo.params['v-length.range'] !== undefined) {
      return rowInfo.params['v-length.range']
    }
  
    // 处理 v-length.regex 语法
    if (rowInfo.params['v-length.regex'] !== undefined) {
      return rowInfo.params['v-length.regex']
    }
  
    // 处理基本 v-length 指令
    if (rowInfo.params['v-length'] === undefined) {
      return undefined
    }
  
    // 如果是对象模式，返回对象配置
    if (typeof rowInfo.params['v-length'] === 'object') {
      return {
        maxLength: rowInfo.params['v-length'].value || rowInfo.params['v-length'].maxLength,
        pattern: rowInfo.params['v-length'].pattern,
      }
    }
  
    // 简单模式：直接返回数值
    return rowInfo.params['v-length']
  }
  
  // 判断指令类型
  function getDirectiveType(rowInfo: any) {
    if (!rowInfo.params) {
      return 'none'
    }
  
    // 检查直接使用修饰符的语法：v-length.number、v-length.regex
    if (rowInfo.params['v-length.number'] !== undefined) {
      return 'number'
    }
  
    if (rowInfo.params['v-length.range'] !== undefined) {
      return 'range'
    }
  
    if (rowInfo.params['v-length.regex'] !== undefined) {
      return 'regex'
    }
  
    // 检查基本 v-length 指令
    if (rowInfo.params['v-length'] === undefined) {
      return 'none'
    }
  
    // 检查对象模式中的修饰符
    if (typeof rowInfo.params['v-length'] === 'object') {
      if (rowInfo.params['v-length'].modifier) {
        return rowInfo.params['v-length'].modifier
      }
  
      // 检查对象模式中是否有 pattern（自动应用 regex 修饰符）
      if (rowInfo.params['v-length'].pattern) {
        return 'regex'
      }
    }
  
    // 默认为基本类型
    return 'basic'
  }
  
  const gapH = computed(() => {
    if (props.model.indexOf('table') > -1) {
      return 0
    }
    const _tmp: any = (props.gapH + '').replace('px', '').replace('%', '')
    if (isNaN(_tmp)) {
      return 0
    } else {
      return Number(_tmp)
    }
  })
  
  const gapV = computed(() => {
    if (props.model.indexOf('table') > -1) {
      return 0
    }
    const _tmp: any = (props.gapV + '').replace('px', '').replace('%', '')
    if (isNaN(_tmp)) {
      return 0
    } else {
      return _tmp + 'px'
    }
  })
  
  const height = computed(() => {
    const _tmp: any = (props.height + '').replace('px', '').replace('%', '')
    if (isNaN(_tmp)) {
      return 0
    } else {
      return _tmp + 'px'
    }
  })
  
  const labelWidth = computed(() => {
    if (
      props.labelWidth.indexOf('px') > -1 ||
      props.labelWidth.indexOf('%') > -1 ||
      isNaN(Number(props.labelWidth))
    ) {
      return props.labelWidth
    } else {
      return (props.labelWidth + '').replace('px', '') + 'px'
    }
  })
  
  const superLabelWidth = ref('0')
  const subLabelWidth = ref(labelWidth.value)
  
  watch(
    () => props.superLabelWidth,
    (nv) => {
      if (nv.indexOf('px') > -1 || nv.indexOf('%') > -1 || isNaN(nv)) {
        superLabelWidth.value = nv
      } else {
        superLabelWidth.value = (nv + '').replace('px', '') + 'px'
        subLabelWidth.value = `calc(${labelWidth.value} - ${superLabelWidth.value})`
      }
    },
    { immediate: true },
  )
  
  function getRowItemStyle(row: IRowInfo[], rowInfo: IRowInfo, rowInfoIndex: number) {
    const _gapH = gapH.value
    if (rowInfo.span && (rowInfo.span + '').indexOf('%') > -1) {
      return { width: rowInfo.span }
    }
    let emptySpanCount = 0
    let allWidth = 0
    let customSpan = 0
    row?.map((item) => {
      if (!item.span && item.span + '' !== '0') {
        emptySpanCount += 1
      } else {
        const _span = Number((item.span + '').replace('%', ''))
        allWidth += _span
        customSpan += _span
      }
    })
    if (allWidth > 24) {
      allWidth = 100
    } else {
      allWidth = 24
    }
    if (!rowInfo.span) {
      const _tmp = (((allWidth - customSpan) / emptySpanCount / allWidth) * 100).toFixed(2) + '%'
      const margint = row.length == 1 ? 0 : Number(_gapH / 2)
      let marginLeft = margint * 0.75
      let marginRight = margint * 0.75
      if (rowInfoIndex == row.length - 1) {
        marginRight = 0
        marginLeft = margint * 1.25
      } else if (rowInfoIndex == 0) {
        marginLeft = 0
        marginRight = margint * 1.25
      }
      return {
        width: `calc(${_tmp} - ${marginLeft + marginRight}px)`,
        marginLeft: `${marginLeft}px`,
        marginRight: `${marginRight}px`,
      }
    } else if (rowInfo.span == 0) {
      return { width: 0 }
    } else {
      const _tmp = (Number(rowInfo.span) / allWidth) * 100 + '%'
      const margint = row.length == 1 ? 0 : Number(_gapH / 2)
      let marginLeft = margint * 0.75
      let marginRight = margint * 0.75
      if (rowInfoIndex == row.length - 1) {
        marginRight = 0
        marginLeft = margint * 1.25
      } else if (rowInfoIndex == 0) {
        marginLeft = 0
        marginRight = margint * 1.25
      }
      return {
        width: `calc(${_tmp} - ${marginLeft + marginRight}px)`,
        marginLeft: `${marginLeft}px`,
        marginRight: `${marginRight}px`,
      }
    }
  }
  
  // 详情+获取时使用，根据key获取当前节点的信息
  function getFormNodeByKey(key) {
    const rows = props.rows
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex]
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const item = row[colIndex]
  
        if (item.key === key) {
          return item
        }
  
        // 检查子项
        if (item.children && Array.isArray(item.children)) {
          for (let childIndex = 0; childIndex < item.children.length; childIndex++) {
            const child = item.children[childIndex]
            if (child.key === key) {
              return child
            }
          }
        }
      }
    }
    return null
  }

  // 保存时使用，返回state.rows的key和value的对象
  function getFormKvData() {
    const rows = props.rows
    const result = {}
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex]
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const item = row[colIndex]
        if (item.key) {
          if (
            item?.value &&
            item?.delValue &&
            Array.isArray(item.value) &&
            Array.isArray(item.delValue) &&
            item.value.length &&
            item.delValue.length
          ) {
            // 用于上传时删除的问题处理
            result[item.key] = [...item.value, ...item.delValue]
          } else {
            result[item.key] = item.value ?? ''
          }
        }
  
        // 检查子项
        if (item.children && Array.isArray(item.children)) {
          for (let childIndex = 0; childIndex < item.children.length; childIndex++) {
            const child = item.children[childIndex]
            if (child.key) {
              if (
                child?.value &&
                child?.delValue &&
                Array.isArray(child.value) &&
                Array.isArray(child.delValue) &&
                child.value.length &&
                child.delValue.length
              ) {
                // 用于上传时删除的问题处理
                result[child.key] = [...child.value, ...child.delValue]
              } else {
                result[child.key] = child.value ?? ''
              }
            }
          }
        }
      }
    }
    return result
  }
  
  // 重置表单数据到默认值
  function resetForm(triggerEvents=false) {
    const rows = props.rows
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex]
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const item = row[colIndex]
        if (item.key) {
          // 记录旧值用于比较
          const oldValue = deepClone(item.value)
          
          // 使用defaultValue重置，如果没有defaultValue则使用类型默认值
          if (item.defaultValue !== undefined) {
            item.value = deepClone(item.defaultValue)
          } else {
            // 如果没有defaultValue，则根据组件类型设置默认值
            if (Array.isArray(item.value)) {
              item.value = []
            } else if (typeof item.value === 'number') {
              item.value = 0
            } else if (typeof item.value === 'boolean') {
              item.value = false
            } else {
              item.value = ''
            }
          }

          // 重置删除的文件列表
          if (item.delValue !== undefined) {
            item.delValue = []
          }
          
          // 如果值发生了变化，并且有事件处理函数，则触发相应事件
          if (triggerEvents && JSON.stringify(oldValue) !== JSON.stringify(item.value) && item.events) {
            // 触发 change 事件
            if (item.events.change && typeof item.events.change === 'function') {
              nextTick(() => {
                item.events.change(item.value)
              })
            }
            // 触发 input 事件
            if (item.events.input && typeof item.events.input === 'function') {
              nextTick(() => {
                item.events.input(item.value)
              })
            }
          }
        }

        // 检查子项
        if (item.children && Array.isArray(item.children)) {
          for (let childIndex = 0; childIndex < item.children.length; childIndex++) {
            const child = item.children[childIndex]
            if (child.key) {
              // 记录旧值用于比较
              const oldChildValue = deepClone(child.value)
              
              // 使用defaultValue重置子项
              if (child.defaultValue !== undefined) {
                child.value = deepClone(child.defaultValue)
              } else {
                // 如果没有defaultValue，则根据组件类型设置默认值
                if (Array.isArray(child.value)) {
                  child.value = []
                } else if (typeof child.value === 'number') {
                  child.value = 0
                } else if (typeof child.value === 'boolean') {
                  child.value = false
                } else {
                  child.value = ''
                }
              }

              // 重置子项删除的文件列表
              if (child.delValue !== undefined) {
                child.delValue = []
              }
              
              // 如果值发生了变化，并且有事件处理函数，则触发相应事件
              if (triggerEvents && JSON.stringify(oldChildValue) !== JSON.stringify(child.value) && child.events) {
                // 触发 change 事件
                if (child.events.change && typeof child.events.change === 'function') {
                  nextTick(() => {
                    child.events.change(child.value)
                  })
                }
                // 触发 input 事件
                if (child.events.input && typeof child.events.input === 'function') {
                  nextTick(() => {
                    child.events.input(child.value)
                  })
                }
              }
            }
          }
        }
      }
    }
  }
  
  // 手动初始化defaultValue（供外部调用）
  function initDefaultValues() {
    if (props.rows && props.rows.length > 0) {
      initializeDefaultValues(props.rows)
    }
  }

  // 获取只读模式下的显示值
  function getReadOnlyDisplayValue(rowInfo: any) {
    if (!props.readOnly) {
      return rowInfo.value
    }
    
    // 如果是下拉列表、单选框组、复选框组等组件，自动处理显示标签
    if (rowInfo.component && rowInfo.params?.options) {
      // 处理字符串形式的组件名称
      const componentName = typeof rowInfo.component === 'string' 
        ? rowInfo.component.replace('-', '').toLowerCase()
        : (rowInfo.component.name + '').replace('-', '').toLowerCase()
      
      // 处理级联选择器
      if (componentName.indexOf('cascader') !== -1) {
        return getCascaderDisplayValue(rowInfo)
      }
      
      const isSelectComponent = componentName.indexOf('select') !== -1 || 
                                componentName.indexOf('radio') !== -1 || 
                                componentName.indexOf('checkbox') !== -1
      
      if (isSelectComponent) {
        const options = rowInfo.params.options
        const valueKey = rowInfo.params.props?.value || 'value'
        const labelKey = rowInfo.params.props?.label || 'label'
        
        // 处理多选情况
        if (Array.isArray(rowInfo.value)) {
          const selectedLabels = rowInfo.value.map(val => {
            const option = options.find(opt => opt[valueKey] === val)
            return option ? option[labelKey] : val
          })
          return selectedLabels.join('，')
        }
        
        // 处理单选情况
        const selectedOption = options.find(opt => opt[valueKey] === rowInfo.value)
        return selectedOption ? selectedOption[labelKey] : rowInfo.value
      }
    }
    
    // Switch 组件
    if (rowInfo.component) {
      const componentName = typeof rowInfo.component === 'string' 
        ? rowInfo.component.toLowerCase()
        : ((rowInfo.component.name || '') + '').toLowerCase()
      
      if (componentName.indexOf('switch') !== -1) {
        // 根据 value 返回对应的文本
        if (rowInfo.value) {
          return rowInfo.params?.['active-text'] || '启用'
        } else {
          return rowInfo.params?.['inactive-text'] || '禁用'
        }
      }
      
      // 评分组件
      if (componentName.indexOf('rate') !== -1) {
        const max = rowInfo.params?.max || 5
        return `${rowInfo.value || 0}/${max}`
      }
      
      // 滑块组件
      if (componentName.indexOf('slider') !== -1) {
        // 显示滑块值，如果是范围值则显示范围
        if (Array.isArray(rowInfo.value)) {
          return `${rowInfo.value[0]} - ${rowInfo.value[1]}`
        }
        return rowInfo.value || 0
      }
      
      // 颜色选择器
      if (componentName.indexOf('colorpicker') !== -1) {
        return rowInfo.value || ''
      }
    }
    
    // 其他情况直接返回值
    return rowInfo.value
  }

  // 计算显示值的计算属性
  const getComponentValue = computed(() => {
    return (rowInfo: any) => {
      const value = getReadOnlyDisplayValue(rowInfo)
      return isNotNull(value) ? value : (rowInfo?.valueEmptyTag ?? props.valueEmptyTag ?? '--')
    }
  })

  // 获取级联选择器的显示值
  function getCascaderDisplayValue(rowInfo: any) {
    if (!rowInfo.value || !rowInfo.params?.options) {
      return rowInfo.value
    }
    
    const options = rowInfo.params.options
    const valueKey = rowInfo.params.props?.value || 'value'
    const labelKey = rowInfo.params.props?.label || 'label'
    const childrenKey = rowInfo.params.props?.children || 'children'
    // 获取分隔符配置，默认为 ' / '
    const separator = rowInfo.params.separator || ' / '
    // 是否显示所有层级，默认为 true，支持驼峰和连字符两种模式
    const showAllLevels = rowInfo.params.showAllLevels !== false && rowInfo.params['show-all-levels'] !== false
    // 是否多选模式
    const isMultiple = rowInfo.params.props?.multiple === true
    
    // 处理多选模式
    if (isMultiple) {
      // 将值转换为数组形式处理
      let values: any[] = []
      
      if (Array.isArray(rowInfo.value)) {
        values = rowInfo.value
      } else if (typeof rowInfo.value === 'string') {
        // 尝试用逗号分隔
        values = rowInfo.value.split(',').map(v => v.trim()).filter(v => v)
      } else {
        values = [rowInfo.value]
      }
      
      // 处理每个值的显示路径
      const displayPaths: string[] = []
      
      for (const value of values) {
        // 如果值是数组形式（表示单个级联路径）
        if (Array.isArray(value)) {
          const labels: string[] = []
          let currentOptions = options
          
          for (const val of value) {
            const currentOption = currentOptions.find(opt => opt[valueKey] === val)
            if (!currentOption) {
              // 如果找不到对应的选项，直接使用原始值
              labels.push(val)
              break
            }
            
            labels.push(currentOption[labelKey])
            
            // 如果有子选项，继续向下查找
            if (currentOption[childrenKey] && Array.isArray(currentOption[childrenKey])) {
              currentOptions = currentOption[childrenKey]
            } else {
              break
            }
          }
          
          // 根据 show-all-levels 配置决定显示方式
          if (!showAllLevels && labels.length > 0) {
            // 仅显示最后一级
            displayPaths.push(labels[labels.length - 1])
          } else {
            displayPaths.push(labels.join(separator))
          }
        } else {
          // 如果是单个值，需要推理出完整路径
          const findFullPath = (opts: any[], targetValue: any, currentPath: string[] = []): string[] | null => {
            for (const option of opts) {
              if (option[valueKey] === targetValue) {
                return [...currentPath, option[labelKey]]
              }
              
              if (option[childrenKey] && Array.isArray(option[childrenKey])) {
                const newPath = [...currentPath, option[labelKey]]
                const result = findFullPath(option[childrenKey], targetValue, newPath)
                if (result) {
                  return result
                }
              }
            }
            return null
          }
          
          const fullPath = findFullPath(options, value)
          if (fullPath && fullPath.length > 0) {
            // 根据 show-all-levels 配置决定显示方式
            if (!showAllLevels) {
              displayPaths.push(fullPath[fullPath.length - 1])
            } else {
              displayPaths.push(fullPath.join(separator))
            }
          } else {
            // 尝试查找单级选项
            const findOptionInTree = (opts: any[], targetValue: any): string | null => {
              for (const option of opts) {
                if (option[valueKey] === targetValue) {
                  return option[labelKey]
                }
                
                if (option[childrenKey] && Array.isArray(option[childrenKey])) {
                  const result = findOptionInTree(option[childrenKey], targetValue)
                  if (result) {
                    return option[labelKey] + separator + result
                  }
                }
              }
              return null
            }
            
            const label = findOptionInTree(options, value)
            displayPaths.push(label || value)
          }
        }
      }
      
      // 用逗号连接多个路径
      return displayPaths.join('，')
    }
    
    // 处理单选框模式
    // 处理级联选择器的值（通常是数组形式，表示各级的选择）
    if (Array.isArray(rowInfo.value)) {
      const labels: string[] = []
      let currentOptions = options
      
      for (const value of rowInfo.value) {
        const currentOption = currentOptions.find(opt => opt[valueKey] === value)
        if (!currentOption) {
          // 如果找不到对应的选项，直接返回原始值，使用配置的分隔符
          return rowInfo.value.join(separator)
        }
        
        labels.push(currentOption[labelKey])
        
        // 如果有子选项，继续向下查找
        if (currentOption[childrenKey] && Array.isArray(currentOption[childrenKey])) {
          currentOptions = currentOption[childrenKey]
        } else {
          break
        }
      }
      
      // 根据 show-all-levels 配置决定显示方式
      if (!showAllLevels && labels.length > 0) {
        // 仅显示最后一级
        return labels[labels.length - 1]
      }
      
      return labels.join(separator)
    }
    
    // 如果不是数组，说明传入的是最后一级的值，需要推理出全路径
    const findFullPath = (opts: any[], targetValue: any, currentPath: string[] = []): string[] | null => {
      for (const option of opts) {
        // 如果找到目标值，返回当前路径加上这个选项
        if (option[valueKey] === targetValue) {
          return [...currentPath, option[labelKey]]
        }
        
        // 如果有子选项，递归查找
        if (option[childrenKey] && Array.isArray(option[childrenKey])) {
          const newPath = [...currentPath, option[labelKey]]
          const result = findFullPath(option[childrenKey], targetValue, newPath)
          if (result) {
            return result
          }
        }
      }
      return null
    }
    
    // 查找完整路径
    const fullPath = findFullPath(options, rowInfo.value)
    
    if (fullPath && fullPath.length > 0) {
      // 根据 show-all-levels 配置决定显示方式
      if (!showAllLevels) {
        // 仅显示最后一级
        return fullPath[fullPath.length - 1]
      }
      return fullPath.join(separator)
    }
    
    // 如果找不到完整路径，尝试查找单级选项作为备选方案
    const findOptionInTree = (opts: any[], targetValue: any): string | null => {
      for (const option of opts) {
        if (option[valueKey] === targetValue) {
          return option[labelKey]
        }
        
        if (option[childrenKey] && Array.isArray(option[childrenKey])) {
          const result = findOptionInTree(option[childrenKey], targetValue)
          if (result) {
            return option[labelKey] + separator + result
          }
        }
      }
      return null
    }
    
    const label = findOptionInTree(options, rowInfo.value)
    return label || rowInfo.value
  }

  /**
   * 设置表单详情数据
   * @param data 表单数据对象
   * @param triggerEvents 是否触发事件
   */
  function setFormData(data: Record<string, any>, triggerEvents=false) {
    if (!data || typeof data !== 'object') {
      console.warn('setFormData: 参数必须是一个对象')
      return
    }
    for (const [key, value] of Object.entries(data)) {
      const node = getFormNodeByKey(key)
      if (node) {
        node.value = value
        // 有事件处理函数，触发相应事件
        if (triggerEvents && node.events) {
          // 触发 change 事件
          if (node.events.change && typeof node.events.change === 'function') {
            nextTick(() => {
              node.events.change(value)
            })
          }
          // 触发 input 事件
          if (node.events.input && typeof node.events.input === 'function') {
            nextTick(() => {
              node.events.input(value)
            })
          }
        }
      }
    }
  }

  // 暴露方法给父组件使用
  defineExpose({
    // 核心功能：获取表单实例ref
    getFormNodeByKey,
    // 核心功能：获取表单KV数据
    getFormKvData,
    // 核心功能：设置表单详情数据
    setFormData,
    // 核心功能：重置表单
    resetForm,
    // 核心功能：获取组件实例
    getFormNodeRefByKey,
    // 可选
    initDefaultValues,
    getReadOnlyDisplayValue,
  })
  </script>
  <style lang="scss" scoped>
  .detail-view {
    display: flex;
    flex-direction: column;
    &.model-table {
      box-sizing: border-box;
      border-bottom: 1px solid var(--matrix-form-border-color);
      border-right: 1px solid var(--matrix-form-border-color);
    }
    &.vertical {
      background: v-bind(customBackgroundColor);
      border-radius: 8px;
      padding: var(--matrix-form-model-vertical-padding);
      box-sizing: border-box;
    }
    .detial-row {
      display: flex;
      // align-items: center;
      margin-bottom: v-bind(gapV);
      .detial-row-item {
        flex: none;
        display: flex;
        // overflow: hidden;
        .component-form-item {
          margin-bottom: 0;
        }
        .component-form-item.hidden {
          :deep(.el-form-item__label) {
            display: none;
          }
        }
        &.vertical {
          flex-direction: column;
          .component-form-item {
            flex-direction: column;
            :deep(.elementplus-component-item) {
              width: 100%;
            }
          }
        }
        &.has-child {
          .sub-row {
            display: flex;
            overflow: hidden;
            width: 100%;
            .sub-row-title {
              flex: none;
              width: v-bind(superLabelWidth);
              // border-right: 1px solid var(--matrix-form-border-color);
              writing-mode: vertical-lr;
              text-align: center;
              letter-spacing: var(--matrix-form-subrow-title-letter-spacing);
            }
            .sub-row-group {
              width: 100%;
              display: flex;
              flex-direction: column;
              justify-content: space-around;
              .sub-row-item {
                display: flex;
                width: 100%;
              }
              .detial-row-item-label {
                width: v-bind(subLabelWidth);
              }
            }
          }
        }
        // align-items: center;
        span {
          display: block !important;
          min-height: v-bind(height);
          line-height: v-bind(height);
          &.model-table {
            box-sizing: border-box;
            border-left: 1px solid var(--matrix-form-border-color);
            border-top: 1px solid var(--matrix-form-border-color);
            padding: var(--matrix-form-span-padding);
          }
        }
        :deep(.el-form-item__label) {
          flex: none;
          width: v-bind(labelWidth);
          padding-right: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          display: inline-block;
          color: v-bind('$props.labelColor');
        }
        .detial-row-item-label {
          flex: none;
          width: v-bind(labelWidth);
          color: v-bind('$props.labelColor');
          &.model-table {
            background: var(--matrix-form-model-table-label-color);
          }
          &.vertical {
            width: 100%;
            // &.custom-vertical {
            //   &::before {
            //     display: none;
            //   }
            // }
          }
          &.has-point::before {
              content: '';
              width: 10px;
              height: 10px;
              background: var(--matrix-form-readonly-model-vertical-label-prefix-color);
              border-radius: 50%;
              display: inline-block;
              margin-right: var(--matrix-form-model-vertical-beffore-margin-right);
          }
        }
        .detial-row-item-value {
          width: 100%;
          word-break: break-all;
          box-sizing: border-box;
          &.vertical {
            padding-left: var(--matrix-form-row-item-margin-right);
          }
        }
      }
    }
  }
  </style>
  <style lang="scss">
  .detail-view-tooltip {
    max-width: 40%;
  }
  </style>
  
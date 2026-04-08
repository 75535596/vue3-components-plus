<template>
  <div class="demo-container">
    <div class="control-panel">
      <h3>动态表单组件演示</h3>
      <!-- 配置文件选择 -->
      <el-form :model="state" ref="formRef" label-position="left">
        <el-button type="primary" @click="getFormData">获取表单数据</el-button>
        <el-button type="default" @click="resetFormData">重置表单</el-button>
        <br />
        <span style="color: red"> 结果：{{ state.formData }} </span>
        <br />
        <br />
        <NsFormTitle title="模型参数">
          <NsForm
            ref="row1Ref"
            :readOnly="state.readOnly"
            backgroundColor="#fff"
            :model="state.model"
            :rows="state.rows"
            formPropKey="rows"
            labelColor="#606266"
            labelWidth="150"
            gapH="20px"
            gapV="10px"
          ></NsForm>
        </NsFormTitle>
        <NsFormTitle title="视频配置">
          <NsForm
            ref="row2Ref"
            :readOnly="state.readOnly"
            backgroundColor="#fff"
            :model="state.model"
            :rows="state.rows2"
            formPropKey="rows2"
            labelColor="#606266"
            labelWidth="150"
            gapH="20px"
            gapV="10px"
          ></NsForm>
        </NsFormTitle>
        <NsFormTitle title="结果保存">
          <NsForm
            ref="row3Ref"
            :readOnly="state.readOnly"
            backgroundColor="#fff"
            :model="state.model"
            :rows="state.rows3"
            formPropKey="rows3"
            labelColor="#606266"
            labelWidth="150"
            gapH="20px"
            gapV="10px"
          ></NsForm>
        </NsFormTitle>
        <NsFormTitle title="级联选择器测试">
          <NsForm
            ref="row4Ref"
            :readOnly="state.readOnly"
            backgroundColor="#fff"
            :model="state.model"
            :rows="state.rows4"
            formPropKey="rows4"
            labelColor="#606266"
            labelWidth="150"
            gapH="20px"
            gapV="10px"
          ></NsForm>
        </NsFormTitle>
        <NsFormTitle title="文件上传">
          <NsForm
            ref="rowUploadRef"
            :readOnly="state.readOnly"
            backgroundColor="#fff"
            :model="state.model"
            :rows="state.rowsUpload"
            formPropKey="rowsUpload"
            labelColor="#606266"
            labelWidth="150"
            gapH="20px"
            gapV="10px"
          ></NsForm>
        </NsFormTitle>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { UploadRequestOptions, UploadFile, UploadFiles } from 'element-plus'
import { useFileUpload } from '../../packages/components/NsForm/uploadHook'

// ------------全局的函数（不需要引入直接使用）------------
// import { getAllFormKvData, getAllFormNodeByKey, getAllFormNodeRefByKey } from "vue3-components-plus";
// 获取表单数据
// const allFormData = getAllFormKvData(state.rows)
// 获取表单"isEnable"节点数据
// const isEnableData = getAllFormNodeByKey(state.rows, 'isEnable')
// 获取表单"isEnable"节点ref实例
// const isEnableRef = getAllFormNodeRefByKey(state.rows, 'isEnable')
// ------------NsForm实例的方法------------
// 重置表单resetForm()
// row1Ref.value.resetForm()
// 设置NsForm表单数据 setFormData(data)
// row1Ref.value.setFormData(data)
// 获取NsForm表单数据 getFormKvData() 等同于 getAllFormKvData(state.rows)
// row1Ref.value.getFormKvData()
// 获取NsForm表单"isEnable"节点数据 getFormNodeByKey('isEnable') 等同于 getAllFormNodeByKey(state.rows, 'isEnable')
// row1Ref.value.getFormNodeRefByKey('isEnable')
// 「可选」 初始化表单默认值, 建议使用resetForm()
// row1Ref.value.initDefaultValues()
// 「可选」 获取只读模式下的显示值
// row1Ref.value.getReadOnlyDisplayValue(getAllFormNodeByKey(state.rows, 'isEnable'))

const props = defineProps({
  readOnly: {
    type: Boolean,
    default: false,
  },
  row: {
    type: Object,
    default: () => ({}),
  },
})

const formRef = ref()
const row1Ref = ref()
const row2Ref = ref()
const row3Ref = ref()
const row4Ref = ref()
const rowUploadRef = ref()

const state = reactive<any>({
  formData: {},
  readOnly: props.readOnly,
  model: props.readOnly ? '' : 'vertical',
  rows: [
    [
      {
        key: 'isEnable',
        label: '是否启用',
        value: false,
        component: 'ElSwitch',
        events: {
          change: changeHandler,
        },
        params: {
          rules: [
            {
              required: true,
              message: '请选择',
            },
          ],
          width: 60,
          'inline-prompt': true,
          'active-text': '启用',
          'inactive-text': '禁用',
        },
      },
    ],
  ],
  rows2: [
    [
      {
        key: 'timeInterval',
        label: '时间间隔（秒）',
        value: '',
        component: 'ElInput',
        params: {
          'v-length.range': {
            min: 0,
            max: 6000,
            int: true,
          },
          rules: [
            {
              required: true,
              message: '请输入',
            },
          ],
        },
      },
      {
        key: "stuck_threshold",
        label: "所属工程",
        value: "",
        component: "el-cascader",
        params: {
            props: {
                showPrefix: false,
                checkStrictly: true,
                checkOnClickNode: true,
            },
            options: [
                {
                    value: "guide",
                    label: "Guide",
                    children: [
                        {
                            value: "disciplines",
                            label: "Disciplines",
                            children: [
                                {
                                    value: "consistency",
                                    label: "Consistency",
                                },
                            ],
                        },
                        {
                            value: "navigation",
                            label: "Navigation",
                            children: [
                                {
                                    value: "side nav",
                                    label: "Side Navigation",
                                },
                            ],
                        },
                    ],
                },
                {
                    value: "component",
                    label: "测试",
                    children: [
                        {
                            value: "basic",
                            label: "Basic",
                            children: [
                                {
                                    value: "layout",
                                    label: "Layout",
                                },
                            ],
                        },
                        {
                            value: "form",
                            label: "中文",
                            children: [
                                {
                                    value: "radio",
                                    label: "Radio",
                                },
                            ],
                        },
                    ],
                },
                {
                    value: "resource",
                    label: "Resource",
                    children: [
                        {
                            value: "axure",
                            label: "Axure Components",
                        },
                    ],
                },
            ],
            rules: [
                {
                    required: true,
                    message: "请选择",
                },
            ],
        },
      }
    ],
    [
      {
        key: 'max_retries',
        label: '最大重连次数',
        value: '',
        component: 'ElInput',
        params: {
          'v-length.range': {
            min: 0,
            max: 100,
            int: true,
          },
          rules: [
            {
              required: true,
              message: '请输入',
            },
          ],
        },
      },
      {
        value: ' ',
      },
    ],
  ],
  rows3: [
    [
      {
        key: 'save_video',
        label: '是否保存视频',
        value: false,
        component: 'ElRadioGroup',
        params: {
          rules: [
            {
              required: true,
              message: '请选择',
              trigger: 'change',
            },
          ],
          options: [
            {
              value: true,
              label: '是',
            },
            {
              value: false,
              label: '否',
            },
          ],
        },
      },
      {
        key: 'pre_buffer_second',
        label: '帧前缓存（秒）',
        value: '',
        component: 'ElInput',
        params: {
          'v-length.range': {
            min: 0,
            max: 1000,
            int: true,
          },
          rules: [
            {
              required: true,
              message: '请输入',
            },
          ],
        },
      },
    ],
    [
      {
        key: 'det_area_mode',
        label: '检测区域工作模式',
        value: 'normal',
        component: 'ElRadioGroup',
        events: {
          change: detAreaModeChange,
        },
        params: {
          rules: [
            {
              required: true,
              message: '请选择',
              trigger: 'change',
            },
          ],
          options: [
            {
              value: 'normal',
              label: '常规检测(normal)',
            },
            {
              value: 'abnormal',
              label: '非常规检测(abnormal)',
            },
          ],
        },
      },
    ],
  ],
  rows4: [
    [
      {
        key: 'region',
        label: '地区选择',
        value: ['beijing', 'chaoyang'],
        component: 'ElCascader',
        params: {
          showAllLevels: false,
          rules: [
            {
              required: true,
              message: '请选择地区',
              trigger: 'change',
            },
          ],
          props: {
            multiple: true,
            showPrefix: false,
            checkStrictly: true,
            checkOnClickNode: true,
          },
          options: [
            {
              value: 'beijing',
              label: '北京市',
              children: [
                {
                  value: 'chaoyang',
                  label: '朝阳区',
                  children: [
                    {
                      value: 'chaoyangmen',
                      label: '朝阳门街道',
                    },
                  ],
                },
                {
                  value: 'haidian',
                  label: '海淀区',
                },
              ],
            },
            {
              value: 'shanghai',
              label: '上海市',
              children: [
                {
                  value: 'pudong',
                  label: '浦东新区',
                },
              ],
            },
          ],
        },
      },
      {
        key: 'department',
        label: '部门选择',
        value: ['company'],
        component: 'ElCascader',
        params: {
          props: {
            value: 'code',
            label: 'name',
            children: 'subDepartments',
            showPrefix: false,
            checkStrictly: true,
            checkOnClickNode: true,
          },
          separator: '，',
          options: [
            {
              code: 'company',
              name: '公司总部',
              subDepartments: [
                {
                  code: 'tech',
                  name: '技术部',
                  subDepartments: [
                    {
                      code: 'frontend',
                      name: '前端组',
                    },
                    {
                      code: 'backend',
                      name: '后端组',
                    },
                  ],
                },
                {
                  code: 'sales',
                  name: '销售部',
                },
              ],
            },
          ],
        },
      },
    ],
    [
      {
        key: 'single_level_cascader',
        label: '单层级联',
        value: 'beijing',
        component: 'ElCascader',
        params: {
          options: [
            {
              value: 'beijing',
              label: '北京市',
            },
            {
              value: 'shanghai',
              label: '上海市',
            },
            {
              value: 'guangzhou',
              label: '广州市',
            },
          ],
        },
      },
      {
        value: ' ',
      },
    ],
  ],
  uploadFileList: [] as UploadFiles,
  rowsUpload: [
    [
      {
        key: 'upload_file',
        label: '上传模型文件',
        value: [],
        component: 'ElUpload',
        params: {
          drag: true,
          multiple: true,
          limit: 2,
          action: '#',
          accept: '.txt,.md,.json,.jpg,.png,.pdf',
          disabled: props.readOnly,
          fileList: [],
          httpRequest: mockUploadRequest,
          rules: [
            {
              required: true,
              message: '请上传模型或文档',
              trigger: 'change',
            },
          ],
        },
        slots: {
          default: () =>
            h('div', { class: 'upload-trigger' }, [
              h('p', { class: 'upload-title' }, '点击或拖拽上传'),
              h('p', { class: 'upload-sub' }, '自动模拟上传成功，最多2个文件'),
            ]),
          tip: () => h('div', { class: 'el-upload__tip' }, '仅演示，文件信息会写入表单数据'),
        },
        events: {
          success: handleUploadSuccess,
          change: handleUploadChange,
          remove: handleUploadRemove,
        },
      },
    ],
  ],
})

state.rowsUpload[0][0].params.fileList = state.uploadFileList

const uploadFieldKey = 'upload_file'
const uploadFormKey = 'rowsUpload'
const { handleRemoveFile, handleFileSuccessFile, handleCheckFileRequire } = useFileUpload(state)

function mockUploadRequest(options: UploadRequestOptions) {
  const { file, onSuccess, onError } = options
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const response = {
        code: 0,
        data: {
          fileName: file.name,
          filePath: URL.createObjectURL(file),
          fileSize: (file as any).size || (file as any).raw?.size || 0,
        },
        message: 'ok',
      }
      onSuccess?.(response as any)
      resolve(response)
    }, 400)

    ;(options as any).abort = () => {
      clearTimeout(timer)
      const error = new Error('已取消') as any
      onError?.(error)
      reject(error)
    }
  })
}

function handleUploadSuccess(response: unknown, file: UploadFile, fileList: UploadFiles) {
  state.uploadFileList.splice(0, state.uploadFileList.length, ...(fileList || []))
  handleFileSuccessFile(response as any, file as any, fileList as any, uploadFieldKey, state.rowsUpload)
  handleCheckFileRequire(state.rowsUpload, uploadFieldKey, formRef, uploadFormKey)
}

function handleUploadChange(_file: UploadFile, fileList: UploadFiles) {
  state.uploadFileList.splice(0, state.uploadFileList.length, ...(fileList || []))
  handleCheckFileRequire(state.rowsUpload, uploadFieldKey, formRef, uploadFormKey)
}

function handleUploadRemove(file: UploadFile, fileList: UploadFiles) {
  state.uploadFileList.splice(0, state.uploadFileList.length, ...(fileList || []))
  handleRemoveFile(file as any, fileList as any, uploadFieldKey, state.rowsUpload)
  handleCheckFileRequire(state.rowsUpload, uploadFieldKey, formRef, uploadFormKey)
}

function changeHandler(v: boolean) {
  ElMessage.info(v ? '启用' : '禁用')
}

function detAreaModeChange(value: any) {
  if (state.rows3?.length && state.rows3[state.rows3.length - 1]?.[0]?.key === 'det_area_json') {
    state.rows3.pop()
  }

  if (value === 'abnormal') {
    state.rows3.push([
      {
        key: 'det_area_json',
        label: '感兴趣区域',
        value: '',
        readOnlyUseComponent: true,
        component: CustomUIs,
        span: 6,
      },
      { value: ' ' },
    ])
  }
}

function CustomUIs() {
  return h('div', { style: 'color: red', class: 'xx' }, 'xxx')
}

/**
 * 保存
 */
async function getFormData() {
  try {
    await formRef.value.validate()
  } catch (error: any) {
    console.log(error)
    ElMessage.error('表单校验失败')
    state.formData = {}
    return false
  }
  const data1 = row1Ref.value?.getFormKvData?.()
  const data2 = row2Ref.value?.getFormKvData?.()
  const data3 = row3Ref.value?.getFormKvData?.()
  const data4 = row4Ref.value?.getFormKvData?.()
  const dataUpload = rowUploadRef.value?.getFormKvData?.()
  const data = { ...data1, ...data2, ...data3, ...data4, ...dataUpload }
  state.formData = data
  ElMessage.success('表单校验成功')
  return data
}

/**
 * 重置表单
 */
async function resetFormData() {
  // 使用组件内置的 resetForm 方法
  row1Ref.value?.resetForm?.()
  row2Ref.value?.resetForm?.()
  row3Ref.value?.resetForm?.()
  row4Ref.value?.resetForm?.()
  rowUploadRef.value?.resetForm?.()
  state.uploadFileList.splice(0, state.uploadFileList.length)
  setTimeout(() => {
    // 重置表单验证状态
    formRef.value?.clearValidate?.()
    // 清空结果显示
    state.formData = {}
    ElMessage.success('表单重置成功')
  }, 0)
}

async function getDetail() {
  setTimeout(() => {
    const res = {
      isEnable: true,
      confidence: 'aaa1',
      iou: '1',
      timeInterval: '2',
      stuck_threshold: ['component','form'],
      max_retries: '4',
      save_video: true,
      pre_buffer_second: '5',
      det_area_mode: 'abnormal',
      det_area_json: '6',
      region: 'haidian,pudong', //['beijing', 'haidian'],
      department: ['company', 'tech', 'frontend'],
      single_level_cascader: 'shanghai',
      upload_file: [],
    }
    row1Ref.value?.resetForm()
    row2Ref.value?.resetForm()
    row3Ref.value?.resetForm()
    row4Ref.value?.resetForm()
    rowUploadRef.value?.resetForm()
    state.uploadFileList.splice(0, state.uploadFileList.length)
    setTimeout(() => {
      row1Ref.value?.setFormData?.(res)
      row2Ref.value?.setFormData?.(res)
      row3Ref.value?.setFormData?.(res)
      row4Ref.value?.setFormData?.(res)
      rowUploadRef.value?.setFormData?.(res)
    }, 10)
    return
    // 特殊处理
    // if (res.det_area_mode === 'abnormal') {
    //   detAreaModeChange('abnormal')
    // }

    setTimeout(() => {
      const res = {
        isEnable: false,
        confidence: 'aaa1',
        iou: '1',
        timeInterval: '2',
        stuck_threshold: 'component,form',
        max_retries: '4',
        save_video: true,
        pre_buffer_second: '5',
        det_area_mode: 'normal',
        det_area_json: '6',
        region: ['beijing', 'haidian'],
        department: ['company', 'tech', 'frontend'],
        single_level_cascader: 'shanghai',
      }

      row1Ref.value?.resetForm()
      setTimeout(() => {
        row1Ref.value?.setFormData?.(res)
      }, 10)
      // 特殊处理
    }, 2000)
  }, 2000)
}

onMounted(() => {
  getDetail()
})
</script>

<style lang="scss" scoped>
.demo-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.control-panel {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;

  h3 {
    margin: 0 0 20px 0;
    color: #333;
  }

  h4 {
    margin: 15px 0 10px 0;
    color: #666;
    font-size: 14px;
  }
}

.config-section,
.upload-section,
.action-section {
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e0e0e0;

  .config-select {
    width: 300px;
    margin-right: 10px;
  }

  input[type='file'] {
    margin-right: 10px;
  }

  .el-button {
    margin-right: 10px;
    margin-bottom: 5px;
  }
}

.form-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  margin-bottom: 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.data-card {
  margin-top: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .form-data-display {
    background-color: #f5f7fa;
    padding: 15px;
    border-radius: 4px;
    font-size: 12px;
    line-height: 1.5;
    max-height: 400px;
    overflow-y: auto;
  }
}

.upload-trigger {
  padding: 12px 8px;
  text-align: center;
  color: #606266;
  .upload-title {
    margin: 0 0 4px;
    font-weight: 600;
  }
  .upload-sub {
    margin: 0;
    font-size: 12px;
    color: #909399;
  }
}

@media (max-width: 768px) {
  .config-select {
    width: 100% !important;
    margin-bottom: 10px;
  }

  .el-button {
    width: 100%;
    margin-bottom: 10px;
  }
}
</style>

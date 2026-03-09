<template>
  <div class="dynamic-form-plus-demo">
    <h1>DynamicFormPlus 组件演示</h1>

    <el-card class="demo-card">
      <template #header>
        <div class="card-header">
          <span>基础表单示例</span>
          <div>
            <el-radio-group v-model="currentMode" size="small">
              <el-radio-button label="create">新增</el-radio-button>
              <el-radio-button label="edit">编辑</el-radio-button>
              <el-radio-button label="view">查看</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>

      <DynamicFormPlus
        ref="formRef"
        v-model="formData"
        :config="formConfig"
        :mode="currentMode"
        :layout="layoutMode"
        :col-span="12"
        :gutter="16"
        label-width="120px"
        @submit="handleSubmit"
        @reset="handleReset"
        @change="handleChange"
      />
    </el-card>

    <el-card class="demo-card" style="margin-top: 20px;">
      <template #header>
        <span>表单数据</span>
      </template>
      <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { DynamicFormPlus } from '../../packages/components/DynamicFormPlus'
import type { FormConfig, FormMode, LayoutMode } from '../../packages/components/DynamicFormPlus'

// 表单模式
const currentMode = ref<FormMode>('create')
const layoutMode = ref<LayoutMode>('grid')

// 表单数据
const formData = ref({
  name: '',
  email: '',
  age: null,
  gender: '',
  description: '',
})

// 表单配置
const formConfig: FormConfig = {
  items: [
    {
      prop: 'name',
      label: '姓名',
      component: 'el-input',
      componentProps: {
        placeholder: '请输入姓名',
        clearable: true,
      },
      rules: [
        { required: true, message: '请输入姓名', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
      ],
      span: 12,
    },
    {
      prop: 'email',
      label: '邮箱',
      component: 'el-input',
      componentProps: {
        placeholder: '请输入邮箱',
        clearable: true,
      },
      rules: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
      ],
      span: 12,
    },
    {
      prop: 'age',
      label: '年龄',
      component: 'el-input-number',
      componentProps: {
        min: 1,
        max: 120,
        controlsPosition: 'right',
      },
      span: 12,
    },
    {
      prop: 'gender',
      label: '性别',
      component: 'el-select',
      componentProps: {
        placeholder: '请选择性别',
        clearable: true,
      },
      span: 12,
    },
    {
      prop: 'description',
      label: '描述',
      component: 'el-input',
      componentProps: {
        type: 'textarea',
        rows: 4,
        placeholder: '请输入描述',
        maxlength: 200,
        showWordLimit: true,
      },
      span: 24,
    },
  ],
}

// 表单引用
const formRef = ref()

// 处理提交
function handleSubmit(data: Record<string, any>) {
  console.log('表单提交:', data)
  ElMessage.success('表单提交成功！')
}

// 处理重置
function handleReset() {
  console.log('表单重置')
  ElMessage.info('表单已重置')
}

// 处理字段变更
function handleChange(prop: string, value: any) {
  console.log('字段变更:', prop, value)
}
</script>

<style scoped lang="scss">
.dynamic-form-plus-demo {
  padding: 20px;

  h1 {
    margin-bottom: 20px;
    font-size: 24px;
    font-weight: bold;
  }

  .demo-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  pre {
    background-color: #f5f5f5;
    padding: 12px;
    border-radius: 4px;
    overflow-x: auto;
  }
}
</style>

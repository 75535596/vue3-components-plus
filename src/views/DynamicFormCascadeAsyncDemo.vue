<template>
  <div class="cascade-async-demo">
    <h1>级联表单示例 - 异步数据加载</h1>

    <el-card class="demo-card">
      <template #header>
        <span>产品分类级联（模拟异步加载）</span>
      </template>

      <DynamicFormPlus
        ref="formRef"
        v-model="formData"
        :config="formConfig"
        :col-span="12"
        :gutter="16"
        label-width="120px"
        @submit="handleSubmit"
      />
    </el-card>

    <el-card class="demo-card" style="margin-top: 20px">
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
import type { FormConfig } from '../../packages/components/DynamicFormPlus'

// 模拟异步 API 请求
const mockApiDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// 模拟获取一级分类
async function fetchCategories() {
  await mockApiDelay(500)
  return [
    { label: '电子产品', value: 'electronics' },
    { label: '服装鞋帽', value: 'clothing' },
    { label: '食品饮料', value: 'food' },
  ]
}

// 模拟获取二级分类
async function fetchSubCategories(categoryId: string) {
  await mockApiDelay(500)
  const subCategoriesMap: Record<string, Array<{ label: string; value: string }>> = {
    electronics: [
      { label: '手机', value: 'phone' },
      { label: '电脑', value: 'computer' },
      { label: '相机', value: 'camera' },
    ],
    clothing: [
      { label: '男装', value: 'mens' },
      { label: '女装', value: 'womens' },
      { label: '童装', value: 'kids' },
    ],
    food: [
      { label: '零食', value: 'snacks' },
      { label: '饮料', value: 'drinks' },
      { label: '水果', value: 'fruits' },
    ],
  }
  return subCategoriesMap[categoryId] || []
}

// 模拟获取品牌列表
async function fetchBrands(subCategoryId: string) {
  await mockApiDelay(500)
  const brandsMap: Record<string, Array<{ label: string; value: string }>> = {
    phone: [
      { label: '苹果', value: 'apple' },
      { label: '华为', value: 'huawei' },
      { label: '小米', value: 'xiaomi' },
    ],
    computer: [
      { label: '联想', value: 'lenovo' },
      { label: '戴尔', value: 'dell' },
      { label: '惠普', value: 'hp' },
    ],
    camera: [
      { label: '佳能', value: 'canon' },
      { label: '尼康', value: 'nikon' },
      { label: '索尼', value: 'sony' },
    ],
    mens: [
      { label: '耐克', value: 'nike' },
      { label: '阿迪达斯', value: 'adidas' },
      { label: '优衣库', value: 'uniqlo' },
    ],
    womens: [
      { label: 'ZARA', value: 'zara' },
      { label: 'H&M', value: 'hm' },
      { label: '优衣库', value: 'uniqlo' },
    ],
    kids: [
      { label: '巴拉巴拉', value: 'balabala' },
      { label: '安奈儿', value: 'annil' },
      { label: '迪士尼', value: 'disney' },
    ],
    snacks: [
      { label: '三只松鼠', value: 'squirrel' },
      { label: '良品铺子', value: 'bestore' },
      { label: '百草味', value: 'herb' },
    ],
    drinks: [
      { label: '可口可乐', value: 'cocacola' },
      { label: '百事可乐', value: 'pepsi' },
      { label: '农夫山泉', value: 'nongfu' },
    ],
    fruits: [
      { label: '佳沛', value: 'zespri' },
      { label: '都乐', value: 'dole' },
      { label: '新奇士', value: 'sunkist' },
    ],
  }
  return brandsMap[subCategoryId] || []
}

// 表单数据
const formData = ref({
  category: '',
  subCategory: '',
  brand: '',
  productName: '',
  price: 0,
})

// 表单配置
const formConfig: FormConfig = {
  items: [
    {
      prop: 'category',
      label: '一级分类',
      component: 'el-select',
      componentProps: {
        placeholder: '请选择分类',
        clearable: true,
        loading: false,
      },
      rules: [{ required: true, message: '请选择一级分类', trigger: 'change' }],
      span: 12,
    },
    {
      prop: 'subCategory',
      label: '二级分类',
      component: 'el-select',
      componentProps: {
        placeholder: '请先选择一级分类',
        clearable: true,
        disabled: true,
        loading: false,
      },
      rules: [{ required: true, message: '请选择二级分类', trigger: 'change' }],
      span: 12,
      // 级联配置：依赖一级分类
      cascade: {
        dependOn: 'category',
        clearFields: ['subCategory', 'brand'], // 一级分类变化时清除二级分类和品牌
        handler: async ({ dependValues, setComponentProps, clearValue }) => {
          const category = dependValues.category

          if (!category) {
            setComponentProps({
              placeholder: '请先选择一级分类',
              disabled: true,
              loading: false,
              options: [],
            })
            clearValue()
            return
          }

          // 显示加载状态
          setComponentProps({
            placeholder: '加载中...',
            disabled: true,
            loading: true,
            options: [],
          })

          try {
            // 异步加载二级分类数据
            const subCategories = await fetchSubCategories(category)

            setComponentProps({
              placeholder: '请选择二级分类',
              disabled: false,
              loading: false,
              options: subCategories,
            })
          } catch (error) {
            console.error('加载二级分类失败:', error)
            setComponentProps({
              placeholder: '加载失败，请重试',
              disabled: true,
              loading: false,
              options: [],
            })
          }
        },
      },
    },
    {
      prop: 'brand',
      label: '品牌',
      component: 'el-select',
      componentProps: {
        placeholder: '请先选择二级分类',
        clearable: true,
        disabled: true,
        loading: false,
      },
      rules: [{ required: true, message: '请选择品牌', trigger: 'change' }],
      span: 12,
      // 级联配置：依赖二级分类
      cascade: {
        dependOn: 'subCategory',
        clearFields: ['brand'], // 二级分类变化时清除品牌
        handler: async ({ dependValues, setComponentProps, clearValue }) => {
          const subCategory = dependValues.subCategory

          if (!subCategory) {
            setComponentProps({
              placeholder: '请先选择二级分类',
              disabled: true,
              loading: false,
              options: [],
            })
            clearValue()
            return
          }

          // 显示加载状态
          setComponentProps({
            placeholder: '加载中...',
            disabled: true,
            loading: true,
            options: [],
          })

          try {
            // 异步加载品牌数据
            const brands = await fetchBrands(subCategory)

            setComponentProps({
              placeholder: '请选择品牌',
              disabled: false,
              loading: false,
              options: brands,
            })
          } catch (error) {
            console.error('加载品牌失败:', error)
            setComponentProps({
              placeholder: '加载失败，请重试',
              disabled: true,
              loading: false,
              options: [],
            })
          }
        },
      },
    },
    {
      prop: 'productName',
      label: '产品名称',
      component: 'el-input',
      componentProps: {
        placeholder: '请输入产品名称',
        clearable: true,
      },
      rules: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
      span: 12,
    },
    {
      prop: 'price',
      label: '价格',
      component: 'el-input-number',
      componentProps: {
        min: 0,
        precision: 2,
        controlsPosition: 'right',
      },
      rules: [{ required: true, message: '请输入价格', trigger: 'blur' }],
      span: 12,
    },
  ],
}

// 初始化时加载一级分类
;(async () => {
  try {
    const categories = await fetchCategories()
    formConfig.items[0].componentProps!.options = categories
  } catch (error) {
    console.error('加载一级分类失败:', error)
    ElMessage.error('加载分类数据失败')
  }
})()

// 表单引用
const formRef = ref()

// 处理提交
function handleSubmit(data: Record<string, any>) {
  console.log('表单提交:', data)
  ElMessage.success('表单提交成功！')
}
</script>

<style scoped lang="scss">
.cascade-async-demo {
  padding: 20px;

  h1 {
    margin-bottom: 20px;
    font-size: 24px;
    font-weight: bold;
  }

  .demo-card {
    margin-bottom: 20px;
  }

  pre {
    background-color: #f5f5f5;
    padding: 12px;
    border-radius: 4px;
    overflow-x: auto;
  }
}
</style>

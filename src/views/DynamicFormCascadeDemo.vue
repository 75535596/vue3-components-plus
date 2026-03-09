<template>
  <div class="cascade-demo">
    <h1>级联表单示例</h1>

    <el-card class="demo-card">
      <template #header>
        <span>省市区三级联动</span>
      </template>

      <DynamicFormPlus
        ref="formRef"
        v-model="formData"
        :config="formConfig"
        :col-span="8"
        :gutter="16"
        label-width="100px"
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

// 模拟数据源
const provinces = [
  { label: '广东省', value: 'guangdong' },
  { label: '浙江省', value: 'zhejiang' },
  { label: '江苏省', value: 'jiangsu' },
]

const citiesMap: Record<string, Array<{ label: string; value: string }>> = {
  guangdong: [
    { label: '广州市', value: 'guangzhou' },
    { label: '深圳市', value: 'shenzhen' },
    { label: '东莞市', value: 'dongguan' },
  ],
  zhejiang: [
    { label: '杭州市', value: 'hangzhou' },
    { label: '宁波市', value: 'ningbo' },
    { label: '温州市', value: 'wenzhou' },
  ],
  jiangsu: [
    { label: '南京市', value: 'nanjing' },
    { label: '苏州市', value: 'suzhou' },
    { label: '无锡市', value: 'wuxi' },
  ],
}

const districtsMap: Record<string, Array<{ label: string; value: string }>> = {
  guangzhou: [
    { label: '天河区', value: 'tianhe' },
    { label: '越秀区', value: 'yuexiu' },
    { label: '海珠区', value: 'haizhu' },
  ],
  shenzhen: [
    { label: '南山区', value: 'nanshan' },
    { label: '福田区', value: 'futian' },
    { label: '罗湖区', value: 'luohu' },
  ],
  dongguan: [
    { label: '莞城区', value: 'guancheng' },
    { label: '南城区', value: 'nancheng' },
    { label: '东城区', value: 'dongcheng' },
  ],
  hangzhou: [
    { label: '西湖区', value: 'xihu' },
    { label: '滨江区', value: 'binjiang' },
    { label: '余杭区', value: 'yuhang' },
  ],
  ningbo: [
    { label: '海曙区', value: 'haishu' },
    { label: '江北区', value: 'jiangbei' },
    { label: '鄞州区', value: 'yinzhou' },
  ],
  wenzhou: [
    { label: '鹿城区', value: 'lucheng' },
    { label: '龙湾区', value: 'longwan' },
    { label: '瓯海区', value: 'ouhai' },
  ],
  nanjing: [
    { label: '玄武区', value: 'xuanwu' },
    { label: '秦淮区', value: 'qinhuai' },
    { label: '建邺区', value: 'jianye' },
  ],
  suzhou: [
    { label: '姑苏区', value: 'gusu' },
    { label: '吴中区', value: 'wuzhong' },
    { label: '相城区', value: 'xiangcheng' },
  ],
  wuxi: [
    { label: '梁溪区', value: 'liangxi' },
    { label: '滨湖区', value: 'binhu' },
    { label: '惠山区', value: 'huishan' },
  ],
}

// 表单数据
const formData = ref({
  province: '',
  city: '',
  district: '',
  address: '',
})

// 表单配置
const formConfig: FormConfig = {
  items: [
    {
      prop: 'province',
      label: '省份',
      component: 'el-select',
      componentProps: {
        placeholder: '请选择省份',
        clearable: true,
      },
      rules: [{ required: true, message: '请选择省份', trigger: 'change' }],
      span: 8,
      // 静态数据源
      valueTransform: {
        input: (value) => value,
        output: (value) => value,
      },
    },
    {
      prop: 'city',
      label: '城市',
      component: 'el-select',
      componentProps: {
        placeholder: '请先选择省份',
        clearable: true,
        disabled: true,
      },
      rules: [{ required: true, message: '请选择城市', trigger: 'change' }],
      span: 8,
      // 级联配置：依赖省份字段
      cascade: {
        dependOn: 'province',
        clearFields: ['city', 'district'], // 省份变化时清除城市和区县
        handler: ({ dependValues, setComponentProps, clearValue }) => {
          const province = dependValues.province

          if (!province) {
            // 如果省份为空，禁用城市选择器
            setComponentProps({
              placeholder: '请先选择省份',
              disabled: true,
              options: [],
            })
            clearValue()
            return
          }

          // 根据省份加载城市数据
          const cities = citiesMap[province] || []
          setComponentProps({
            placeholder: '请选择城市',
            disabled: false,
            options: cities,
          })
        },
      },
    },
    {
      prop: 'district',
      label: '区县',
      component: 'el-select',
      componentProps: {
        placeholder: '请先选择城市',
        clearable: true,
        disabled: true,
      },
      rules: [{ required: true, message: '请选择区县', trigger: 'change' }],
      span: 8,
      // 级联配置：依赖城市字段
      cascade: {
        dependOn: 'city',
        clearFields: ['district'], // 城市变化时清除区县
        handler: ({ dependValues, setComponentProps, clearValue }) => {
          const city = dependValues.city

          if (!city) {
            // 如果城市为空，禁用区县选择器
            setComponentProps({
              placeholder: '请先选择城市',
              disabled: true,
              options: [],
            })
            clearValue()
            return
          }

          // 根据城市加载区县数据
          const districts = districtsMap[city] || []
          setComponentProps({
            placeholder: '请选择区县',
            disabled: false,
            options: districts,
          })
        },
      },
    },
    {
      prop: 'address',
      label: '详细地址',
      component: 'el-input',
      componentProps: {
        type: 'textarea',
        rows: 3,
        placeholder: '请输入详细地址',
      },
      rules: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
      span: 24,
    },
  ],
}

// 为省份选择器添加静态选项
formConfig.items[0].componentProps!.options = provinces

// 表单引用
const formRef = ref()

// 处理提交
function handleSubmit(data: Record<string, any>) {
  console.log('表单提交:', data)
  ElMessage.success('表单提交成功！')
}
</script>

<style scoped lang="scss">
.cascade-demo {
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

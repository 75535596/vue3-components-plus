# NsOffice 组件

NsOffice 是一个统一的办公文档预览组件，它可以根据传入的文件URL自动识别文件类型并使用相应的组件进行渲染。

## 支持的文件格式

- **Excel**: `.xlsx`, `.xls` - 使用 NsExcel 组件
- **PDF**: `.pdf` - 使用 NsPdf 组件  
- **Word**: `.docx` - 使用 NsWord 组件

## 基本用法

```vue
<template>
  <NsOffice 
    :url="fileUrl"
    :isEdit="false"
  />
</template>

<script setup>
import { NsOffice } from 'your-package-name'

const fileUrl = 'https://example.com/document.xlsx'
</script>
```

## Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| url | String | '' | 文件的URL地址（必填） |
| isEdit | Boolean | false | Excel文件是否为编辑模式，仅对Excel文件有效 |

## 方法

通过 ref 可以访问以下方法：

| 方法名 | 说明 | 返回值 |
|--------|------|--------|
| getActiveComponent() | 获取当前激活的组件实例 | Component Instance |
| getFileType() | 获取当前文件类型 | 'excel' \| 'pdf' \| 'word' \| 'unsupported' |
| refresh() | 刷新当前组件 | void |

## 示例

### 基础使用

```vue
<template>
  <div>
    <NsOffice :url="currentFile" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { NsOffice } from 'your-package-name'

const currentFile = ref('https://example.com/report.pdf')
</script>
```

### Excel 编辑模式

```vue
<template>
  <div>
    <NsOffice 
      :url="excelFile" 
      :isEdit="true" 
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { NsOffice } from 'your-package-name'

const excelFile = ref('https://example.com/data.xlsx')
</script>
```

### 获取组件信息

```vue
<template>
  <div>
    <NsOffice 
      ref="officeRef"
      :url="currentFile" 
    />
    <button @click="getInfo">获取文件信息</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { NsOffice } from 'your-package-name'

const officeRef = ref()
const currentFile = ref('https://example.com/document.docx')

const getInfo = () => {
  const fileType = officeRef.value.getFileType()
  console.log('文件类型:', fileType)
  
  const component = officeRef.value.getActiveComponent()
  console.log('当前组件:', component)
}
</script>
```

## 特性

1. **自动识别**: 根据文件URL的扩展名自动选择合适的组件
2. **统一接口**: 提供统一的props和方法接口
3. **错误处理**: 对不支持的文件格式显示友好的错误提示
4. **灵活配置**: 支持传递所有原组件的属性
5. **Excel特殊处理**: 对Excel组件提供编辑模式控制

## 注意事项

- 确保传入的URL是有效的文件地址
- Excel的编辑模式仅在 `isEdit=true` 时生效
- 不支持的文件格式会显示错误提示界面
- 组件会自动透传其他属性到对应的子组件
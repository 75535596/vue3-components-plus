# Markdown 示例文档

这是一个用于测试 Markdown 解析功能的示例文档。

## 功能特性

- ✅ 支持文件上传（.md 和 .markdown 格式）
- ✅ 支持URL加载
- ✅ 支持深色/浅色模式切换
- ✅ 响应式设计

## 代码示例

```javascript
// 示例代码
function loadMarkdown(url) {
  return fetch(url)
    .then(response => response.text())
    .then(text => {
      // 处理markdown内容
      return text;
    });
}
```

## 列表示例

### 无序列表
- 项目 1
- 项目 2
  - 子项目 2.1
  - 子项目 2.2
- 项目 3

### 有序列表
1. 第一步
2. 第二步
3. 第三步

## 表格示例

| 功能 | 状态 | 说明 |
|------|------|------|
| 文件上传 | ✅ 完成 | 支持本地.md文件上传 |
| URL加载 | ✅ 完成 | 支持远程markdown文件加载 |
| 主题切换 | ✅ 完成 | 支持深色/浅色模式 |

## 引用示例

> 这是一个引用示例。可以用来引用重要的信息或者其他文档的内容。

## 链接和图片

[GitHub仓库](https://github.com)

---

*本文档创建于 2024年，用于测试 Markdown 组件功能。*
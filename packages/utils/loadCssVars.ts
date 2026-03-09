/**
 * 获取theme.css中定义的全部视频相关CSS变量
 * @returns {Object} 返回变量键值对对象，键名为驼峰格式
 */
export class ThemeVar {
	static VARS: any = {};
}
export const loadCssVars = () => {
  if(Object.keys(ThemeVar.VARS).length > 0) {
    return ThemeVar.VARS
  }
  const styleSheets = document.styleSheets
  const variables = {}
  // 遍历所有样式表找到theme.css
  Array.from(styleSheets).forEach((sheet) => {
    Array.from(sheet.cssRules).forEach((rule: any) => {
    if (rule.selectorText === ':root') {
        const style = rule.style

        // 提取所有--matrix-开头的变量
        Array.from(style)
        .filter((name: any) => name.startsWith('--matrix-'))
        .forEach((name: any) => {
            const jsName = name
            variables[jsName] = style.getPropertyValue(name).trim()
        })
    }
    })
  })
  ThemeVar.VARS = variables
  return variables
}

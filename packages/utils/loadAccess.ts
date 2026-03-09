export async function loadAccess(url: string, tag=null, isModel=false) {
  const type = url.endsWith('.js') ? 'js' : 'css';
	return new Promise((resolve) => {
		const htmlEle = document.createElement( type == 'js' ? 'script' : 'link' ) as any;
    htmlEle.setAttribute('data-dynamic', 'true'); // 标识动态加载的脚本
    if (tag) {
      htmlEle.setAttribute('data-tag', tag);
    }
    if (type == 'js') {
      htmlEle.src = url;
      htmlEle.async = true;
      if(isModel) {
        htmlEle.type = 'module';
      }else{
        htmlEle.type = 'text/javascript';
      }
    }else{
      htmlEle.href = url;
      htmlEle.rel = 'stylesheet';
    }
		htmlEle.onload = () => {
			resolve(true);
		};
		htmlEle.onerror = () => {
			console.error(`加载失败: ${url}`);
      resolve(false);
		};
		document.head.appendChild(htmlEle);
	});
}

export function removeDynamicAccess(tag: string | null = null) {
  // 获取所有动态加载的脚本
  const selector = tag
    ? `[data-dynamic="true"][data-tag="${tag}"]`
    : '[data-dynamic="true"]';

  const htmlEle = document.querySelectorAll<HTMLScriptElement>(selector);

  // 移除找到的脚本元素
  htmlEle.forEach(element => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
      console.log(`已移除脚本: ${element.src || '匿名脚本'}`);
    }
  });

  return Array.from(htmlEle); // 返回被删除的元素数组
}

// 从 './axios' 模块导入 createAxiosInstance 函数和 setErrorCallback 函数
import qs from "qs";
import { createAxiosInstance, setAxiosApp } from "./axios";
// 从 '@/enums/httpEnum' 模块导入多个枚举类型
import {
  ContentTypeEnum,
  RequestHttpEnum,
  MIME_map
} from "./httpEnum";


let app: any = null;

// 初始化传入app
export function setHttpApp(_app) {
  app = _app;
  setAxiosApp(_app);
}

export function getBaseUrl() {
  return app?.config?.globalProperties?.$BaseUrl
        || localStorage.getItem('BaseUrl')
        || localStorage.getItem('bseUrl')
        || sessionStorage.getItem('BaseUrl')
        || sessionStorage.getItem('bseUrl')
        || globalThis.BaseUrl
        || globalThis.bseUrl
        ||''
}

export function ImageBaseUrl() {
  return app?.config?.globalProperties?.$ImageBaseUrl
        || localStorage.getItem('ImageBaseUrl')
        || localStorage.getItem('imageBaseUrl')
        || sessionStorage.getItem('ImageBaseUrl')
        || sessionStorage.getItem('imageBaseUrl')
        || globalThis.ImageBaseUrl
        || globalThis.imageBaseUrl
        ||''
}

/**
 * 发起 GET 请求
 * @param url 请求的 URL
 * @param params 请求的参数
 * @param base 基础URL
 * @param customConfig 自定义配置（支持timeout等axios配置）
 * @param errorCallback 错误处理回调函数
 * @returns 返回一个 Promise，该 Promise 解析为请求的响应
 */
export const get = async (url, params, base = "", customConfig = {}, errorCallback=null) => {
    const baseUrl = base || getBaseUrl();
    if (baseUrl.endsWith("/") || url.startsWith("/")) {
        if (baseUrl.endsWith("/") && url.startsWith("/")) {
            url = baseUrl + url.slice(1);
        } else {
            url = baseUrl + url;
        }
    } else {
        url = baseUrl + "/" + url;
    }
    // 创建一个 Axios 实例并发起 GET 请求，传入错误处理回调函数
    return createAxiosInstance(customConfig, errorCallback)({
        url,
        method: RequestHttpEnum.GET,
        params: params,
        ...customConfig, // 支持timeout等配置
    });
};

/**
 * 发起 POST 请求
 * @param url 请求的 URL
 * @param data 请求的数据
 * @param base 基础URL
 * @param customConfig 自定义配置（支持timeout等axios配置，包含contentType）
 * @param errorCallback 错误处理回调函数
 * @returns 返回一个 Promise，该 Promise 解析为请求的响应
 */
export const post = (
    url,
    data = {},
    base = "",
    customConfig = {},
    errorCallback = null
) => {
    const baseUrl = base || getBaseUrl();
    if (baseUrl.endsWith("/") || url.startsWith("/")) {
        if (baseUrl.endsWith("/") && url.startsWith("/")) {
            url = baseUrl + url.slice(1);
        } else {
            url = baseUrl + url;
        }
    } else {
        url = baseUrl + "/" + url;
    }
    
    // 从customConfig中获取contentType，默认为JSON
    const contentType = customConfig?.contentType || ContentTypeEnum.JSON;
    
    // 创建一个 Axios 实例并发起 POST 请求，传入错误处理回调函数
    return createAxiosInstance(customConfig, errorCallback)({
        url,
        // url: import.meta.env.VITE_BASE_URL + url,
        method: RequestHttpEnum.POST,
        data:
            contentType == ContentTypeEnum.FORM_URLENCODED
                ? qs.stringify(data)
                : data,
        headers: {
            // 如果没有指定 headersType，则默认使用 JSON 类型
            "Content-Type": contentType,
        },
        ...customConfig, // 支持timeout等配置
    });
};

/**
 * 发起 PUT 请求
 * @param url 请求的 URL
 * @param data 请求的数据
 * @param base 基础URL
 * @param customConfig 自定义配置（支持timeout等axios配置，包含contentType）
 * @param errorCallback 错误处理回调函数
 * @returns 返回一个 Promise，该 Promise 解析为请求的响应
 */
export const put = (url, data = {}, base = "", customConfig = {}, errorCallback = null) => {
    const baseUrl = base || getBaseUrl();
    if (baseUrl.endsWith("/") || url.startsWith("/")) {
        if (baseUrl.endsWith("/") && url.startsWith("/")) {
            url = baseUrl + url.slice(1);
        } else {
            url = baseUrl + url;
        }
    } else {
        url = baseUrl + "/" + url;
    }

    // 从customConfig中获取contentType，默认为JSON
    const contentType = customConfig?.contentType || ContentTypeEnum.JSON;

    // 创建一个 Axios 实例并发起 put 请求，传入错误处理回调函数
    return createAxiosInstance(customConfig, errorCallback).put(url, data, {
        headers: {
            // 如果没有指定 headersType，则默认使用 JSON 类型
            "Content-Type": contentType,
        },
        ...customConfig, // 支持timeout等配置
    });
};

/**
 * 发起 delete 请求
 * @param url 请求的 URL
 * @param data 请求的数据
 * @param base 基础URL
 * @param customConfig 自定义配置（支持timeout等axios配置）
 * @param errorCallback 错误处理回调函数
 * @returns 返回一个 Promise，该 Promise 解析为请求的响应
 */
export const del = (url, data = {}, base = "", customConfig = {}, errorCallback=null) => {
    const baseUrl = base || getBaseUrl();
    if (baseUrl.endsWith("/") || url.startsWith("/")) {
        if (baseUrl.endsWith("/") && url.startsWith("/")) {
            url = baseUrl + url.slice(1);
        } else {
            url = baseUrl + url;
        }
    } else {
        url = baseUrl + "/" + url;
    }
    try {
        if(typeof data === 'string') {
            const __url = url;
            if(url.startsWith('?')) {
                url = __url + data;
            }else {
                url = __url + '?' + data;
            }
            return createAxiosInstance(customConfig, errorCallback).delete(url, { ...customConfig });
        }
    } catch (error) {
        console.log('delete接口报错: ',error);
    }
    // 创建一个 Axios 实例并发起 delete 请求，传入错误处理回调函数
    return createAxiosInstance(customConfig, errorCallback).delete(url, data, { ...customConfig });
};

/**
 * 下载文件函数：发送HTTP请求获取文件数据，并触发浏览器下载
 *
 * @param {string} url - 请求资源的URL路径
 * @param {string} [filename=''] - 下载文件的默认名称（为空时从响应头获取）
 * @param {RequestHttpEnum} [method=RequestHttpEnum.GET] - HTTP请求方法，默认为GET
 * @param {Object} [data={}] - 请求携带的数据
 * @param {string} [base=""] - 基础URL路径（默认使用全局配置的api_url）
 * @param {Object} [customConfig={}] - 自定义Axios请求配置（支持timeout等配置）
 * @param {Function} [errorCallback] - 错误处理回调函数
 * @returns {Promise} 返回Promise对象，解析后包含响应数据
 */
export const download = (
    url,
    filename = '',
    method = RequestHttpEnum.GET,
    data = {},
    base = "",
    customConfig = {},
    errorCallback
) => {
    const baseUrl = base || getBaseUrl();
    // URL拼接逻辑（与get/post函数保持一致）
    if (baseUrl.endsWith("/") || url.startsWith("/")) {
        if (baseUrl.endsWith("/") && url.startsWith("/")) {
            url = baseUrl + url.slice(1);
        } else {
            url = baseUrl + url;
        }
    } else {
        url = baseUrl + "/" + url;
    }

    // 下载请求配置，支持timeout等配置
    const config: any = {
        url,
        method,
        responseType: "blob", // 关键：指定响应类型为二进制流
        ...customConfig, // 支持timeout等配置
    };

    // 根据请求方法设置参数
    if (method === RequestHttpEnum.GET) {
        config.params = data;
    } else {
        config.data = data;
    }

    // 创建实例并发送请求，添加下载处理逻辑，传入错误处理回调函数
    return createAxiosInstance(customConfig, errorCallback)(config).then(response => {
        if(filename){
            if(filename.indexOf('.') === -1) {
                filename += MIME_map?.[response.data?.type] || ''
            }
        }else {
            // 从响应头获取文件名
            const contentDisposition = response.headers['content-disposition'];
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1].replace(/['"]/g, '');
                }
            }else {
                filename = '下载文件.txt';
            }
        }

        // 创建Blob对象和下载链接
        const blob = new Blob([response.data]);
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        // 清理资源
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);

        return response;
    });
};

/**
 * 下载本地文件，一般放在public中
 * @param {string} path - 文件路径
 * @param {string} name - 文件名
 * @param {Function} errorCallback - 错误处理回调函数
 */
export function downLoadLocalFile(projectBaseUrl, path, name, errorCallback) {
    const downloadUrl = `${window.location.origin}${projectBaseUrl}`;
    download(path, name, 'get', {}, downloadUrl, {}, errorCallback);
}

/**
 * 获取请求函数，默认返回 GET 请求函数
 * @param type 请求的类型，默认为 GET
 * @returns 返回一个请求函数
 */
export const http = (type) => {
    // 根据请求类型返回相应的请求函数
    switch (type) {
    case RequestHttpEnum.GET:
        return get;

    case RequestHttpEnum.POST:
        return post;

    default:
        return get;
    }
};

export function getTokenInfo() {
    // 从本地存储中获取 token
    const tokenName = app?.config?.globalProperties?.$TokenName 
                        || app?.config?.globalProperties?.$TonkenKey
                        || localStorage.getItem('TokenName')
                        || localStorage.getItem('tokenName')
                        || sessionStorage.getItem('TokenName')
                        || sessionStorage.getItem('tokenName')
                        || globalThis.TokenName
                        || globalThis.tokenName
                        || "satoken";
    const tokenValue = app?.config?.globalProperties?.$TokenValue
                        || localStorage.getItem('TokenValue')
                        || sessionStorage.getItem('TokenValue')
                        || localStorage.getItem('tokenValue')
                        || sessionStorage.getItem('tokenValue')
                        || globalThis.TokenValue
                        || globalThis.tokenValue
                        || '';
    return { [tokenName]: tokenValue }
}
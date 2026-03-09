import { ResultEnum } from './httpEnum.ts';
// 从 'axios' 库中导入 axios 实例以及相关类型定义
import axios from 'axios';
// 从 'element-plus' 库中导入 ElMessage 组件，用于显示消息提示
import { ElMessage } from 'element-plus';


let app: any = null;
export function setAxiosApp(_app) {
  app = _app;
}

// 声明一个变量，用于存储 Axios 实例，初始值为 null
let axiosInstance: any = null;

// 管理所有正在进行的请求, ai项目中用来切换页面时取消所有未完成的请求
const pendingRequests = new Map();
let globalAbortController = new AbortController();

/**
 * 安全执行回调函数，确保异常隔离
 * @param {Function} callback - 要执行的回调函数
 * @param {*} error - 错误对象
 * @param {string} message - 格式化的错误消息
 */
function safeExecuteCallback(callback, error, message) {
    if (typeof callback === 'function') {
        try {
            console.log('执行错误回调函数:', { error, message });
            return callback(error, message);
        } catch (callbackError) {
            console.error('错误回调函数执行失败:', callbackError);
        }
    }
    return false
}

/**
 * 初始化带配置的 axios 实例
 * 如果实例已经存在，则直接返回该实例
 * 如果实例不存在，则创建一个新的 axios 实例，并设置请求和响应拦截器
 * @param {Object} customConfig - 自定义配置
 * @param {Function} errorCallback - 错误处理回调函数
 * @returns 返回一个配置好的 axios 实例
 */
export function createAxiosInstance(customConfig={}, errorCallback) {
    // 如果实例已存在，检查是否需要更新回调函数
    if (axiosInstance) {
        if (errorCallback && typeof errorCallback === 'function') {
            console.log('更新错误回调函数');
            axiosInstance.errorCallback = errorCallback;
        }
        return axiosInstance;
    }

    // 创建一个新的 axios 实例，并设置超时时间为 60 秒
    axiosInstance = axios.create({
        // baseURL: import.meta.env.VITE_API_BASE_URL,
        // timeout: ResultEnum.TIMEOUT,
        // 在JSON解析前处理大整数
        transformResponse: [function (data) {
            // 只处理字符串类型的响应数据
            if (typeof data === 'string') {
                try {
                    // 检查是否为有效的JSON字符串
                    if (!data.trim()) {
                        console.warn('响应数据为空字符串');
                        return data;
                    }

                    // 使用正则表达式匹配超过安全整数范围的数字并转换为字符串
                    // 匹配超过MAX_SAFE_INTEGER(9007199254740991)的数字
                    const processedData = data.replace(
                        /"(\w+)":\s*(\d{15,})/g,
                        (match, fieldName, number) => {
                            // 检查数字是否超过安全范围
                            const numValue = BigInt(number);
                            const maxSafeInt = BigInt(Number.MAX_SAFE_INTEGER);

                            if (numValue > maxSafeInt) {
                                return `"${fieldName}":"${number}"`;
                            }
                            return match; // 不超过安全范围，保持原样
                        }
                    );

                    // 尝试解析JSON
                    return JSON.parse(processedData);
                } catch (error) {
                    // JSON解析失败时的处理
                    console.warn('JSON解析失败，尝试直接解析原始数据:', {
                        error: error.message,
                        dataLength: data.length,
                        dataPreview: data.substring(0, 100) + (data.length > 100 ? '...' : '')
                    });

                    try {
                        // 如果处理后的JSON解析失败，尝试直接解析原始JSON
                        return JSON.parse(data);
                    } catch (fallbackError) {
                        console.error('原始JSON解析也失败，返回原始数据:', fallbackError.message);
                        return data;
                    }
                }
            }

            // 非字符串类型直接返回（可能是已经解析过的对象或其他类型）
            return data;
        }],
        ...customConfig
    });

    // 在实例上保存错误回调函数的引用
    if (errorCallback && typeof errorCallback === 'function') {
        console.log('设置错误回调函数');
        axiosInstance.errorCallback = errorCallback;
    }

    // 为 axios 实例添加请求拦截器
    axiosInstance.interceptors.request.use(
        /**
         * 请求拦截器的成功处理函数
         * 在发送请求之前进行一些预处理，例如添加请求头
         * @param {AxiosRequestConfig} config - 请求配置对象
         * @returns {AxiosRequestConfig} 返回处理后的请求配置对象
         */
        (config) => {
            try {
                // 生成唯一的请求ID
                const requestId = `${Date.now()}_${parseInt(Math.random() * 9999999 + '')}`;
                config.requestId = requestId;

                // 如果没有提供signal，使用全局的AbortController
                if (!config.signal) {
                    config.signal = globalAbortController.signal;
                }

                // 将请求添加到待处理请求列表
                pendingRequests.set(requestId, {
                    url: config.url,
                    method: config.method,
                    timestamp: Date.now()
                });
            } catch (error) {
                console.error('请求的ID生成失败:', error);
            }
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
            if (tokenValue){
              config.headers[tokenName] = tokenValue;
            }
            console.log(`token===>`, tokenName, tokenValue);
            // 这里可以添加使用 token 的逻辑，例如添加到请求头中
            return config;
        },
        /**
         * 请求拦截器的错误处理函数
         * 当请求发生错误时，将错误信息通过 Promise.resolve 抛出
         * @param {any} error - 请求过程中发生的错误
         * @returns {Promise<never>} 返回一个被拒绝的 Promise，包含错误信息
         */
        (error) => {
            console.error(error)
            Promise.resolve(null);
        },
    );

    // 为 axios 实例添加响应拦截器
    axiosInstance.interceptors.response.use(
        /**
         * 响应拦截器的成功处理函数
         * 在接收到响应后进行一些处理，例如检查响应状态码
         * @param {AxiosResponse} response - 响应对象
         * @returns {any} 返回处理后的响应数据
         */
        async (response) => {
            // 从待处理请求列表中移除已完成的请求
            try {
                if (response.config.requestId) {
                    pendingRequests.delete(response.config.requestId);
                }
            } catch (error) {
                console.warn('删除ID失败:', error);
            }

            // 是否为下载请求（响应类型为 blob）
            if (response.config.responseType === 'blob' || response.config.responseType === 'stream') {
                return response;  // 直接返回完整响应对象或流对象
            }

            const { status, data } = response;
            // 状态码 != 200 或者 业务数据 != 200
            if (status !== ResultEnum.SUCCESS) {
                const formatMsg = await errorStatus(status);
                console.error(formatMsg || '接口解析错误');
                // 调用自定义错误回调函数
                const isResolve = safeExecuteCallback(axiosInstance.errorCallback, { status, response }, formatMsg);
                if(isResolve) {
                    return Promise.resolve(null);
                }
                return Promise.reject(null);
            } else if (data.code !== ResultEnum.SUCCESS) {
                const formatMsg = await errorStatus(data?.code, data?.msg);
                console.error(formatMsg || '接口解析错误');
                // 调用自定义错误回调函数，包括业务状态码错误
                const isResolve = safeExecuteCallback(axiosInstance.errorCallback, { code: data?.code, data, response }, formatMsg);
                if(isResolve) {
                    return Promise.resolve(null);
                }
                return Promise.reject(null);
            }
            // 如果状态码为 200，则返回响应数据data内容数据
            return data?.data;
        },
        /**
         * 响应拦截器的错误处理函数
         * 当响应发生错误时，将错误信息通过 Promise.resolve 抛出
         * @param {any} error - 响应过程中发生的错误
         * @returns {Promise<never>} 返回一个被拒绝的 Promise，包含错误信息
         */
        async (error) => {
            // 从待处理请求列表中移除出错的请求
            if (error.config && error.config.requestId) {
                try {
                    pendingRequests.delete(error.config.requestId);
                } catch (error) {
                    console.warn('删除ID失败:', error);
                }
            }
            // 错误处理逻辑...
            const formatMsg = await errorFn(error);
            console.error(formatMsg || '接口解析错误');
            // 调用自定义错误回调函数
            const isResolve = safeExecuteCallback(axiosInstance.errorCallback, error, formatMsg);
            if(isResolve) {
                return Promise.resolve(null);
            }
            return Promise.reject(null);
        },
    );

    // 返回配置好的 axios 实例
    return axiosInstance;
}

/**
 * 重置axios实例（用于测试或特殊情况）
 */
export function resetAxiosInstance() {
    console.log('重置axios实例');
    axiosInstance = null;
}

/**
 * 取消所有正在进行的请求
 * @param {string} reason - 取消请求的原因，默认为 '用户取消所有请求'
 * @returns {number} 返回被取消的请求数量
 */
export function cancelAllRequests(reason = '取消所有请求') {
    const canceledCount = pendingRequests.size;

    console.warn(`！正在取消 ${canceledCount} 个请求，原因: ${reason}`);

    // 取消当前的AbortController，这会取消所有使用该signal的请求
    globalAbortController.abort(reason);

    // 清空待处理请求列表
    pendingRequests.clear();

    // 创建新的AbortController供后续请求使用
    globalAbortController = new AbortController();

    console.warn(`！已成功取消 ${canceledCount} 个请求`);
    return canceledCount;
}

/**
 * 获取当前正在进行的请求信息
 * @returns {Array} 返回包含所有待处理请求信息的数组
 */
export function getPendingRequests() {
    const requests = Array.from(pendingRequests.entries()).map(([id, info]) => ({
        id,
        ...info,
        duration: Date.now() - info.timestamp
    }));

    console.log(`当前有 ${requests.length} 个请求正在进行:`, requests);
    return requests;
}

/**
 * 处理请求错误的函数
 * @param {any} error - 请求过程中发生的错误对象
 * @returns {string|undefined} 返回错误信息，如果是取消请求则返回 undefined
 */
async function errorFn(error) {
    // 检查错误是否是由于取消请求导致的
    if (axios.isCancel(error)) {
        // 如果是取消请求，打印取消请求的信息
        console.info('取消请求：' + error.message);
        return '取消请求：' + error.message;
    }
    // 检查错误对象中是否包含响应对象，并且响应对象中是否包含状态码
    if (error?.response?.status)
        // 如果包含状态码，调用 errorStatus 函数根据状态码获取错误信息
        return await errorStatus(error.response.status);

    // 处理其他类型的错误
    return '网络连接错误';
}
/**
 * 根据 HTTP 状态码返回对应的错误消息
 * @param {number} status - HTTP 状态码
 * @returns {string} 错误消息
 */
async function errorStatus(status, message = '') {
    if (!message) {
        switch (status) {
        case 302:
            message = '接口重定向';
            break;
        case 400:
            message = '参数不正确';
            break;
        case 401:
            message = '请先登录';
            break;
        case 403:
            message = '没有权限操作';
            break;
        case 404:
            message = `请求地址出错`;
            break;
        case 408:
            message = '请求超时';
            break;
        case 409:
            message = '系统已存在相同数据';
            break;
        case 500:
            message = '服务器内部错误';
            break;
        case 501:
            message = '服务未实现';
            break;
        case 502:
            message = '网关错误';
            break;
        case 503:
            message = '服务不可用';
            break;
        case 504:
            message = '服务暂时无法访问，请稍后再试';
            break;
        case 505:
            message = 'HTTP版本不受支持';
            break;
        default:
            message = '服务器异常';
            break;
        }
    }

    if (message !== 'ok') ElMessage.warning(message);
    if (status === 401) {
      try {
        const logoutHandler = app?.config?.globalProperties?.$LogoutCallback || '';
        logoutHandler?.()
      } catch (error) {
        console.warn('组件库未找到注销回调函数', error);
      }
    }
    return message;
}

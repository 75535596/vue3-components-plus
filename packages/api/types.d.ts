/**
 * HTTP请求相关类型定义
 */

/** 自定义请求配置接口 */
export interface HttpCustomConfig {
  /** 请求超时时间（毫秒） */
  timeout?: number
  /** Content-Type 类型 */
  contentType?: string
  /** 自定义请求头 */
  headers?: Record<string, string>
  /** 其他axios配置 */
  [key: string]: any
}

/** HTTP响应数据接口 */
export interface HttpResponse<T = any> {
  code: number
  data: T
  msg: string
}

/** 错误响应接口 */
export interface ErrorResponse {
  code?: number
  response?: any
  message?: string
}

/** 错误回调函数类型 */
export type ErrorCallback = (error: ErrorResponse, message: string) => void

/** 请求方法枚举 */
export enum RequestMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH'
}

/** Content-Type枚举 */
export enum ContentType {
  JSON = 'application/json',
  FORM_URLENCODED = 'application/x-www-form-urlencoded',
  FORM_DATA = 'multipart/form-data',
  TEXT = 'text/plain',
  HTML = 'text/html'
}

/** GET请求函数类型 */
export interface GetFunction {
  <T = any>(
    url: string,
    params?: Record<string, any>,
    base?: string,
    customConfig?: HttpCustomConfig,
    errorCallback?: ErrorCallback
  ): Promise<T>
}

/** POST请求函数类型 */
export interface PostFunction {
  <T = any>(
    url: string,
    data?: any,
    base?: string,
    customConfig?: HttpCustomConfig,
    errorCallback?: ErrorCallback
  ): Promise<T>
}

/** PUT请求函数类型 */
export interface PutFunction {
  <T = any>(
    url: string,
    data?: any,
    base?: string,
    customConfig?: HttpCustomConfig,
    errorCallback?: ErrorCallback
  ): Promise<T>
}

/** DELETE请求函数类型 */
export interface DeleteFunction {
  <T = any>(
    url: string,
    data?: any,
    base?: string,
    customConfig?: HttpCustomConfig,
    errorCallback?: ErrorCallback
  ): Promise<T>
}

/** 下载文件函数类型 */
export interface DownloadFunction {
  (
    url: string,
    filename?: string,
    method?: string,
    data?: any,
    base?: string,
    customConfig?: HttpCustomConfig,
    errorCallback?: ErrorCallback
  ): Promise<any>
}

/** 下载本地文件函数类型 */
export interface DownloadLocalFileFunction {
  (path: string, name: string, errorCallback?: ErrorCallback): void
}

/** 获取Token信息函数类型 */
export interface GetTokenInfoFunction {
  (): Record<string, string>
}
/**
 * 分页参数接口定义
 */
export interface PaginationParams {
  total: number;
  currentPage: number;
  pageSize: number;
}

/**
 * 默认分页参数
 */
const DEFAULT_PAGINATION: PaginationParams = {
  total: 0,
  currentPage: 1,
  pageSize: 10
};

/**
 * 创建新的分页参数对象
 * 每次调用都会返回一个新的对象实例，避免单例模式导致的分页信息污染
 * @param customParams 自定义分页参数（可选）
 * @returns 新的分页参数对象
 */
export function createPagination(
  customParams?: Partial<PaginationParams>
): PaginationParams {
  return {
    ...DEFAULT_PAGINATION,
    ...customParams
  };
}

/**
 * 重置分页参数到默认值
 * @param pagination 需要重置的分页对象
 * @returns 重置后的分页对象
 */
export function resetPagination(
  pagination: PaginationParams
): PaginationParams {
  pagination.total = 0;
  pagination.currentPage = 1;
  pagination.pageSize = 10;
  return pagination;
}

/**
 * 分页类（保留用于向后兼容）
 * @deprecated 请使用 createPagination 函数代替
 */
class Pagination {
  total: number;
  currentPage: number;
  pageSize: number;

  constructor(customParams?: Partial<PaginationParams>) {
    this.total = customParams?.total ?? DEFAULT_PAGINATION.total;
    this.currentPage =
      customParams?.currentPage ?? DEFAULT_PAGINATION.currentPage;
    this.pageSize = customParams?.pageSize ?? DEFAULT_PAGINATION.pageSize;
  }

  /**
   * 重置分页参数
   */
  reset(): void {
    this.total = 0;
    this.currentPage = 1;
    this.pageSize = 10;
  }

  /**
   * 获取分页参数对象
   */
  toObject(): PaginationParams {
    return {
      total: this.total,
      currentPage: this.currentPage,
      pageSize: this.pageSize
    };
  }
}

export default Pagination;

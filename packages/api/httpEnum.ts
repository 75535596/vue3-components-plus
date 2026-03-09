/**
 * @description: 请求结果集
 */
export const ResultEnum = {
    DATA_SUCCESS: 0,
    SUCCESS: 200,
    SERVER_ERROR: 500,
    SERVER_FORBIDDEN: 403,
    NOT_FOUND: 404,
    TIMEOUT: 60 * 1000,
};

// 数据相关
export const RequestDataTypeEnum = {
    // 静态MOCK数据
    STATIC: 0,
    // 请求数据
    AJAX: 1,
};

/**
 * @description: 请求方法
 */
export const RequestHttpEnum = {
    GET: "get",
    POST: "post",
    DELETE: "delete",
};

/**
 * @description: 请求头部类型
 */
export const RequestBodyEnum = {
    NONE: "none",
    FORM_DATA: "form-data",
    X_WWW_FORM_URLENCODED: "x-www-form-urlencoded",
    JSON: "json",
};

/**
 * @description: 请求头部类型数组
 */
export const RequestBodyEnumList = [
    RequestBodyEnum.NONE,
    RequestBodyEnum.FORM_DATA,
    RequestBodyEnum.X_WWW_FORM_URLENCODED,
    RequestBodyEnum.JSON,
];

/**
 * @description: 请求参数类型
 */
export const RequestParamsTypeEnum = {
    PARAMS: "Params",
    BODY: "Body",
    HEADER: "Header",
};

/**
 * @description:  常用的contentTyp类型
 */
export const ContentTypeEnum = {
    // json
    JSON: "application/json;charset=UTF-8",
    // text
    TEXT: "text/plain;charset=UTF-8",
    // application/x-www-form-urlencoded
    FORM_URLENCODED: "application/x-www-form-urlencoded;charset=UTF-8",
    // form-data  上传
    FORM_DATA: "multipart/form-data;charset=UTF-8",
};

export const MIME_map = {
    "audio/aac": ".aac",
    "application/x-abiword": ".abw",
    "application/x-freearc": ".arc",
    "video/x-msvideo": ".avi",
    "application/vnd.amazon.ebook": ".azw",
    "application/octet-stream": ".bin",
    "image/bmp": ".bmp",
    "image/x-ms-bmp": ".bmp",
    "application/x-bzip": ".bz",
    "application/x-bzip2": ".bz2",
    "application/x-csh": ".csh",
    "text/css": ".css",
    "text/csv": ".csv",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "application/vnd.ms-fontobject": ".eot",
    "application/epub+zip": ".epub",
    "image/gif": ".gif",
    "text/html": ".html",
    "image/vnd.microsoft.icon": ".ico",
    "text/calendar": ".ics",
    "application/java-archive": ".jar",
    "image/jpeg": ".jpg",
    "text/javascript": ".js",
    "application/json": ".json",
    "application/ld+json": ".jsonld",
    "audio/midi": ".mid",
    "audio/x-midi": ".midi",
    "audio/mpeg": ".mp3",
    "video/mpeg": ".mpeg",
    "application/vnd.apple.installer+xml": ".mpkg",
    "application/vnd.oasis.opendocument.presentation": ".odp",
    "application/vnd.oasis.opendocument.spreadsheet": ".ods",
    "application/vnd.oasis.opendocument.text": ".odt",
    "audio/ogg": ".oga",
    "video/ogg": ".ogv",
    "application/ogg": ".ogx",
    "font/otf": ".otf",
    "image/png": ".png",
    "application/pdf": ".pdf",
    "application/vnd.ms-powerpoint": ".ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
    "application/x-rar-compressed": ".rar",
    "application/x-rar": ".rar",
    "application/rtf": ".rtf",
    "application/x-sh": ".sh",
    "image/svg+xml": ".svg",
    "application/x-shockwave-flash": ".swf",
    "application/x-tar": ".tar",
    "image/tiff": ".tiff",
    "font/ttf": ".ttf",
    "text/plain": ".txt",
    "application/vnd.visio": ".vsd",
    "audio/wav": ".wav",
    "audio/webm": ".weba",
    "video/webm": ".webm",
    "image/webp": ".webp",
    "font/woff": ".woff",
    "font/woff2": ".woff2",
    "application/xhtml+xml": ".xhtml",
    "application/vnd.ms-excel": ".xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
    "application/xml": ".xml",
    "text/xml": ".xml",
    "application/vnd.mozilla.xul+xml": ".xul",
    "application/zip": ".zip",
    "video/3gpp": ".3gp",
    "audio/3gpp": ".3gp",
    "video/3gpp2": ".3g2",
    "audio/3gpp2": ".3g2",
    "application/x-7z-compressed": ".7z"
};

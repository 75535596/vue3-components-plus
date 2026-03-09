/**
 * @Description: 文件上传相关的Hook函数
 */
/**
 * 使用文件上传功能的Hook
 * @param {Object} state - 组件状态
 * @param {string} uploadKey - 文件上传数据的key
 */
import { getAllFormNodeByKey } from "./index";
import { nextTick, getCurrentInstance } from "vue";
import { ImageBaseUrl } from '../../api/http';
const instance = getCurrentInstance();

function getImageBaseUrl() {
  return instance?.appContext?.app?.config?.globalProperties?.$ImageBaseUrl || ImageBaseUrl();
}

/**
 * 校验使用，根据key获取表单字段的路径
 * @param rows - 表单数据行
 * @param key - 要查找的字段key
 * @param formPropKey - 表单属性key，默认为"rows"
 * @returns {string} 表单字段路径，如 "rows.0.1.value"
 */
const getFieldPathByKey = (rows, key, formPropKey = "rows") => {
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex];
        for (let colIndex = 0; colIndex < row.length; colIndex++) {
            const item = row[colIndex];

            if (item.key === key) {
                return `${formPropKey}.${rowIndex}.${colIndex}.value`;
            }

            // 检查子项
            if (item.children && Array.isArray(item.children)) {
                for (
                    let childIndex = 0;
                    childIndex < item.children.length;
                    childIndex++
                ) {
                    const child = item.children[childIndex];
                    if (child.key === key) {
                        return `${formPropKey}.${rowIndex}.${colIndex}.children.${childIndex}.value`;
                    }
                }
            }
        }
    }
    return null;
};
export const useFileUpload = (state, uploadKey = "filesDetail") => {
    /**
     * 格式文件列表详情
     * @param fileList 文件列表
     * @returns 
     */
    const handleFormatFileList = (rows, fileList) => { 
         // 文件
        if (fileList) {
            fileList?.forEach((ele) => {
                ele.url = getImageBaseUrl() + ele.filePath;
                ele.name = ele.fileName || /([^\\]+)(?=\.\w+$)/.exec( ele.filePath.replace(/\\|\//g, "\\") )[0] || null;
            });
        }
        rows.params.fileList = fileList
        if(!rows.value) {
            rows.value = [];
        }
        // 基于id去重合并数组
        const mergedArray = [...rows.value, ...fileList];
        const uniqueArray = mergedArray.filter((item, index, self) => {
            // 如果item有id，则根据id去重；如果没有id，则根据filePath去重
            const identifier = item.id || item.filePath;
            return self.findIndex((i) => (i.id || i.filePath) === identifier) === index;
        });
        rows.value = uniqueArray;
        return fileList;
    };

    /**
     * 处理文件删除
     * @param {Object} file - 被删除的文件对象
     * @param {Array} fileList - 剩余文件列表
     * @param {string} fieldKey - 字段key，用于确定保存到哪个字段
     * @param {Array} rows - 表单行数据，默认为state.rows
     */
    const handleRemoveFile = (file, fileList, fieldKey, rows = state.rows) => {
        let arr: any[] = [];
        let delFileArr: any[] = [];
        if (!file.response && file.status === "success") {
            let delFile: any = {};
            for (const [k, v] of Object.entries(file)) {
                 delFile[k] = v;
            }
            delFile.isDelete = 1;
            delFileArr.push(delFile);
        }
        fileList.forEach((item) => {
            arr.push({
                ...item,
                fileName: item.response
                    ? item.response.data.fileName
                    : item.fileName,
                filePath: item.response
                    ? item.response.data.filePath
                    : item.filePath,
                fileSize: item.response
                    ? item.response.data.fileSize
                    : item.fileSize,
            });
        });
        // 将文件数据保存到对应字段的value中
        const fileItem = getAllFormNodeByKey(rows, fieldKey);
        if (fileItem) {
            if(!fileItem.delValue) {
                fileItem.delValue = [];
            }
            if(Array.isArray(fileItem.delValue)) {
                fileItem.delValue = fileItem.delValue.concat(delFileArr);
            }
            fileItem.value = arr;
            // 修改fileList参数，确保fileUpload组件正确触发响应式
            if (fileItem.params && fileItem.params.fileList) {
                fileItem.params.fileList = fileList;
            }
        }
        
        // state.fileFileList = fileList;
        return fileList;
    };

    /**
     * 处理文件上传成功
     * @param {Object} response - 服务器响应数据
     * @param {Object} file - 上传的文件对象
     * @param {Array} fileList - 文件列表
     * @param {string} fieldKey - 字段key，用于确定保存到哪个字段
     * @param {Array} rows - 表单行数据，默认为state.rows
     */
    const handleFileSuccessFile = (response, file, fileList, fieldKey, rows = state.rows) => {
        const fileItem = getAllFormNodeByKey(rows, fieldKey);
        
        if (file.status === "success") {
            if (file.response) {
                const newFile = {...file.response.data};
                // 将文件数据保存到对应字段的value中
                if (fileItem) {
                    if (!Array.isArray(fileItem.value)) {
                        fileItem.value = [];
                    }
                    fileItem.value.push(newFile);
                   // 修改fileList参数，确保fileUpload组件正确触发响应式
                    /* if (fileItem.params && fileItem.params.fileList) {
                        fileItem.params.fileList = fileList;
                    } */
                }
            }
        }
        // state.fileFileList = fileList;
        return fileList;
    };

    /**
     * 校验文件是否上传
     * @param data - 表单数据，state.rows
     * @param key - 表单字段key，rows中对应的key
     * @param formRef - 整个表单ref对象
     * @param formPropKey - 表单属性key，默认为"rows"
     */
    const handleCheckFileRequire = (data, key, formRef, formPropKey = "rows") => {
        const fileItem = getAllFormNodeByKey(data, key);
        // 文件数据已经在对应字段的value中，无需再从state[uploadKey]获取
        if (fileItem && !Array.isArray(fileItem.value)) {
            fileItem.value = [];
        }
        // 动态获取字段路径并触发校验
        const fieldPath = getFieldPathByKey(data, key, formPropKey);
        if (fieldPath && formRef?.value) {
            nextTick(() => {
                formRef.value.validateField(fieldPath);
            });
        }
    };
    return {
        handleRemoveFile,
        handleFileSuccessFile,
        handleCheckFileRequire,
        handleFormatFileList
    };
};

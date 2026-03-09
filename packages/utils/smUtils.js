import { sm2 } from 'sm-crypto';
function getSmPK(pk) {
    // 若后端返回的公钥未带04前缀，需手动拼接
    return (pk + '').startsWith('04') ? pk : '04' + '后端返回的公钥字符串';
}

/**
 * 函数对象sm2加密 (获取公钥和key后加密)
 * @param {*} publicKey 需要请求的完整参数对象
 * @param {*} originalArr 需要加密的字符串数组
 * @param {*} isAdd04 是否添加04
 * @param {*} cipherMode = 1; // C1C3C2模式
 * @returns encryptArrs 加密后的字符串数组
 */
export async function getEncryptSm2(publicKey, originalArr=[], isAdd04=false, cipherMode=1) {
    let pk = publicKey;
    const encryptArrs = [];
    if(!pk){
      return false;
    }
    pk = getSmPK(pk)
    originalArr.forEach(item=>{
        let encrypted = sm2.doEncrypt(item, pk, cipherMode);
        if(isAdd04) {
          encrypted += "04"
        }
        encryptArrs.push(encrypted);
    })
    return encryptArrs;
}

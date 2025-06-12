/**
 * 默认业务错误码处理函数
 * 用于处理业务错误码的默认行为
 * 
 * @param defaultMessageShower 消息展示函数
 * @param code 业务错误码
 */
export function _defaultErrorCodeHandler(defaultMessageShower: (message: string) => void,code: string) {
    defaultMessageShower(`请求出错，错误码：${code}，请稍后再试`);
}

/**
 * 默认 HTTP 错误码处理函数
 * 用于处理 HTTP 状态码错误的默认行为
 * 
 * @param defaultMessageShower 消息展示函数
 * @param code HTTP 状态码
 */
export function _defaultHttpErrorCodeHandler(defaultMessageShower: (message: string) => void, code: number) {
    defaultMessageShower(`服务端请求出错，Http错误码：${String(code)}，请稍后再试`);
}

/**
 * 默认其他错误处理函数
 * 用于处理未知错误或非标准错误的默认行为
 * 
 * @param defaultMessageShower 消息展示函数
 * @param error 错误对象
 */
export function _defaultOtherErrorCodeHandler(defaultMessageShower: (message: string) => void, error: any) {
    defaultMessageShower(`未知请求出错，请稍后再试`);
}

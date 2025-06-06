export function _defaultErrorCodeHandler(defaultMessageShower: (message: string) => void,code: string) {
    defaultMessageShower(`请求出错，错误码：${code}，请稍后再试`);
}

export function _defaultHttpErrorCodeHandler(defaultMessageShower: (message: string) => void, code: number) {
    defaultMessageShower(`服务端请求出错，Http错误码：${String(code)}，请稍后再试`);
}

export function _defaultOtherErrorCodeHandler(defaultMessageShower: (message: string) => void, error: any) {
    defaultMessageShower(`未知请求出错，请稍后再试`);
}

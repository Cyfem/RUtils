import { message } from 'antd';

export function defaultEquals<Param = any>(prev: Param, next: Param) {
  return JSON.stringify(prev) === JSON.stringify(next);
}

export function _defaultErrorCodeHandler(code: string) {
  message.error(`请求出错，错误码：${code}，请稍后再试`);
}

export function _defaultHttpErrorCodeHandler(code: number) {
  message.error(`服务端请求出错，Http错误码：${String(code)}，请稍后再试`);
}

export function _defaultOtherErrorCodeHandler(error: any) {
  message.error(`未知请求出错，请稍后再试`);
}

/**
 * 请求错误类型
 * - server: 服务端业务错误
 * - http: HTTP 网络错误
 */
export type RequestErrorType = 'server' | 'http';

/**
 * 请求错误类
 * 用于统一处理请求过程中的各种错误
 * 
 * @template Data 错误数据类型
 * @extends Error
 */
export default class RequestError<Data = any> extends Error {
  /** 错误码 */
  public code: string;
  /** 错误类型 */
  public type: RequestErrorType;
  /** 错误相关的数据 */
  public data?: Data;
  /**
   * 构造函数
   * @param message 错误消息
   * @param type 错误类型
   * @param data 错误相关的数据
   */
  constructor(
    message: string,
    type: RequestErrorType,
    data?: Data
  ) {
    super(message);
    this.name = 'RequestError';
    this.type = type;
    this.data = data;
  }
}
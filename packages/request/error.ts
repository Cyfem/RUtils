export type RequestErrorType = 'server' | 'http';
export default class RequestError<Data = any> extends Error {
  public code: string;
  public type: RequestErrorType;
  public data?: Data;

  constructor(
    message: string,
    type:RequestErrorType,
    data?: Data
  ) {
    super(message);
    this.name = 'RequestError';
    this.type = type;
    this.data = data;
  }
}
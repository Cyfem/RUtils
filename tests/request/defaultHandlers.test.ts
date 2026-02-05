import { describe, expect, it, vi } from 'vitest';

import {
  _defaultErrorCodeHandler,
  _defaultHttpErrorCodeHandler,
  _defaultOtherErrorCodeHandler,
} from '../../packages/request/defaultHandlers';

describe('request defaultHandlers', () => {
  it('formats business error messages with the error code', () => {
    // 当未提供自定义映射时，会使用这些默认 handler。
    const show = vi.fn();
    _defaultErrorCodeHandler(show, '500');
    expect(show).toHaveBeenCalledWith('请求出错，错误码：500，请稍后再试');
  });

  it('formats HTTP error messages with the status code', () => {
    const show = vi.fn();
    _defaultHttpErrorCodeHandler(show, 404);
    expect(show).toHaveBeenCalledWith('服务端请求出错，Http错误码：404，请稍后再试');
  });

  it('formats unknown error messages', () => {
    const show = vi.fn();
    _defaultOtherErrorCodeHandler(show, new Error('x'));
    expect(show).toHaveBeenCalledWith('未知请求出错，请稍后再试');
  });
});

import { describe, expect, it } from 'vitest';

import RequestError from '../../packages/request/error';

describe('RequestError', () => {
  it('captures message, type, data and code', () => {
    // RequestError 是 createBaseRequest 统一抛出的错误类型。
    const err = new RequestError('boom', 'server', { any: 1 }, 'E500');
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('RequestError');
    expect(err.message).toBe('boom');
    expect(err.type).toBe('server');
    expect(err.data).toEqual({ any: 1 });
    expect(err.code).toBe('E500');
  });

  it('defaults code to empty string when not provided', () => {
    const err = new RequestError('boom', 'http');
    expect(err.code).toBe('');
    expect(err.type).toBe('http');
  });
});

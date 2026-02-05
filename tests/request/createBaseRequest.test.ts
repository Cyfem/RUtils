import { beforeEach, describe, expect, it, vi } from 'vitest';

// Vitest 会把 `vi.mock(...)` 调用提升到文件顶部，因此这里用 `vi.hoisted` 来构建 mock。
const axiosMock = vi.hoisted(() => {
  const request = vi.fn();
  const create = vi.fn(() => ({ request }));
  return { request, create };
});

vi.mock('axios', () => {
  return {
    default: {
      create: axiosMock.create,
    },
  };
});

import createBaseRequest from '../../packages/request';
import RequestError from '../../packages/request/error';

describe('createBaseRequest', () => {
  beforeEach(() => {
    axiosMock.request.mockReset();
    axiosMock.create.mockClear();
  });

  it('creates an axios instance with baseURL', () => {
    createBaseRequest({ baseURL: 'https://api.example.com' });
    expect(axiosMock.create).toHaveBeenCalledWith({ baseURL: 'https://api.example.com' });
  });

  it('sends a request and returns data for success codes', async () => {
    // 基础“成功路径”：code 在 successCodes 内 => 直接返回 data。
    const requestFactory = createBaseRequest({ baseURL: 'https://api.example.com' });
    const getUser = requestFactory<{ id: number }, { code: string; name: string }>({
      method: 'GET',
      url: '/user',
    });

    axiosMock.request.mockResolvedValueOnce({ data: { code: '0', name: 'Ada' } });

    const data = await getUser({ params: { id: 1 } });
    expect(data).toEqual({ code: '0', name: 'Ada' });

    // 应把 method/url/params/data 透传给 axios。
    expect(axiosMock.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: '/user',
        params: { id: 1 },
      }),
    );
  });

  it('applies responseTransfer on success and caches when enabled', async () => {
    // 组合场景：responseTransfer + cacheData + enableCache
    // - responseTransfer：转换响应数据
    // - cacheData：把转换后的数据写入缓存
    // - enableCache：下次命中缓存直接返回（不再调用 axios）
    const requestFactory = createBaseRequest({ baseURL: 'https://api.example.com' });
    const getThing = requestFactory<undefined, { code: string; value: number }>({
      method: 'GET',
      url: '/thing',
    });

    axiosMock.request.mockResolvedValueOnce({ data: { code: '0', value: 1 } });

    const first = await getThing(undefined, {
      cacheData: true,
      enableCache: true,
      cacheTime: 60,
      responseTransfer: (data) => ({ code: data.code, value: data.value + 1 }),
    });
    expect(first).toEqual({ code: '0', value: 2 });

    const second = await getThing(undefined, { cacheData: true, enableCache: true, cacheTime: 60 });
    expect(second).toEqual({ code: '0', value: 2 });
    expect(axiosMock.request).toHaveBeenCalledTimes(1);
  });

  it('caches POST requests by request body (data)', async () => {
    // 对 POST 来说，库会把 `data` 作为缓存 key（GET 使用 `params`）。
    const requestFactory = createBaseRequest();
    const post = requestFactory<{ id: number }, { code: string; ok: boolean }>({ method: 'POST', url: '/x' });

    axiosMock.request.mockResolvedValueOnce({ data: { code: '0', ok: true } });

    await post({ data: { id: 1 } }, { cacheData: true, enableCache: true, cacheTime: 60 });
    await post({ data: { id: 1 } }, { cacheData: true, enableCache: true, cacheTime: 60 });

    expect(axiosMock.request).toHaveBeenCalledTimes(1);
  });

  it('clearCache clears cached responses for this request', async () => {
    const requestFactory = createBaseRequest({ baseURL: 'https://api.example.com' });
    const getThing = requestFactory<undefined, { code: string; value: number }>({
      method: 'GET',
      url: '/thing',
    });

    axiosMock.request.mockResolvedValueOnce({ data: { code: '0', value: 1 } });
    await getThing(undefined, { cacheData: true, enableCache: true, cacheTime: 60 });

    // clearCache 之后再次请求应重新命中 axios。
    getThing.clearCache();

    axiosMock.request.mockResolvedValueOnce({ data: { code: '0', value: 2 } });
    const data = await getThing(undefined, { cacheData: true, enableCache: true, cacheTime: 60 });
    expect(data.value).toBe(2);
    expect(axiosMock.request).toHaveBeenCalledTimes(2);
  });

  it('applies requestParamsOrDataTransfer to params/data before sending', async () => {
    // 该选项适用于如下场景：
    // - 序列化日期
    // - 改字段名/映射字段
    // - 去除 undefined 等无效字段
    const requestFactory = createBaseRequest();
    const getThing = requestFactory<{ id: number }, { code: string; ok: boolean }>({
      method: 'GET',
      url: '/thing',
    });

    const transfer = vi.fn((input: any) => ({ ...input, transferred: true }));
    axiosMock.request.mockResolvedValueOnce({ data: { code: '0', ok: true } });

    await getThing(
      { params: { id: 1 } },
      { requestParamsOrDataTransfer: transfer, cacheData: false, enableCache: false },
    );

    expect(axiosMock.request).toHaveBeenCalledTimes(1);
    const config = axiosMock.request.mock.calls[0]?.[0] as any;
    expect(config.params).toEqual({ id: 1, transferred: true });
    expect(transfer).toHaveBeenCalled();
  });

  it('handles business error codes via errorCodeMap and throws by default', async () => {
    const requestFactory = createBaseRequest({ baseURL: 'https://api.example.com' });
    const api = requestFactory<undefined, { code: string }>({ method: 'GET', url: '/x' });

    const show = vi.fn();
    axiosMock.request.mockResolvedValueOnce({ data: { code: '500' } });

    await expect(
      api(undefined, {
        defaultMessageShower: show,
        errorCodeMap: { '500': '业务错误' },
      }),
    ).rejects.toBeInstanceOf(RequestError);

    expect(show).toHaveBeenCalledWith('业务错误');
  });

  it('can override business error handling to return replacement data without throwing', async () => {
    const requestFactory = createBaseRequest();
    const api = requestFactory<undefined, { code: string; ok?: boolean }>({ method: 'GET', url: '/x' });

    axiosMock.request.mockResolvedValueOnce({ data: { code: '400' } });

    const data = await api(undefined, {
      throwError: true,
      errorCodeMap: {
        '400': async () => ({
          replaceResData: { code: '400', ok: false },
          throwError: false,
        }),
      },
    });

    expect(data).toEqual({ code: '400', ok: false });
  });

  it('handles HTTP errors via httpErrorCodeMap', async () => {
    const requestFactory = createBaseRequest();
    const api = requestFactory<undefined, any>({ method: 'GET', url: '/x' });

    const show = vi.fn();
    const httpError = { response: { status: 404 } };
    axiosMock.request.mockRejectedValueOnce(httpError);

    // 当 `throwError: false` 时：会展示 handler 消息，并返回原始 error。
    const data = await api(undefined, {
      throwError: false,
      defaultMessageShower: show,
      httpErrorCodeMap: { 404: '未找到资源' },
    });

    expect(show).toHaveBeenCalledWith('未找到资源');
    expect(data).toBe(httpError);
  });

  it('handles network/unknown errors via otherErrorHandler', async () => {
    const requestFactory = createBaseRequest();
    const api = requestFactory<undefined, any>({ method: 'GET', url: '/x' });

    const err = new Error('network');
    axiosMock.request.mockRejectedValueOnce(err);

    const data = await api(undefined, {
      throwError: true,
      otherErrorHandler: async () => ({
        replaceResData: { ok: false },
        throwError: false,
      }),
    });

    expect(data).toEqual({ ok: false });
  });

  it('retries when retryTimes is set (until success or retries exhausted)', async () => {
    const requestFactory = createBaseRequest();
    const api = requestFactory<undefined, { code: string; ok?: boolean }>({ method: 'GET', url: '/x' });

    const show = vi.fn();
    axiosMock.request
      .mockResolvedValueOnce({ data: { code: '500' } })
      .mockResolvedValueOnce({ data: { code: '0', ok: true } });

    const data = await api(undefined, {
      retryTimes: 1,
      defaultMessageShower: show,
      errorCodeMap: { '500': '临时错误' },
    });

    expect(data).toEqual({ code: '0', ok: true });
    expect(axiosMock.request).toHaveBeenCalledTimes(2);
    expect(show).toHaveBeenCalledWith('临时错误');
  });

  it('runs requestMiddlewares sequentially to mutate axiosOptions and requestOptions', async () => {
    const requestFactory = createBaseRequest();
    const api = requestFactory<undefined, { code: string; ok: boolean }>({ method: 'GET', url: '/v1' });

    axiosMock.request.mockResolvedValueOnce({ data: { code: '0', ok: true } });

    const middleware1 = async (options: any, requestOptions: any) => {
      return {
        axiosOptions: {
          ...options.axiosOptions,
          headers: { ...(options.axiosOptions?.headers || {}), 'x-1': '1' },
        },
        requestOptions: {
          ...requestOptions,
          url: '/v2',
          params: { ...(requestOptions.params || {}), id: 1 },
        },
      };
    };

    const middleware2 = (options: any, requestOptions: any) => {
      return {
        axiosOptions: {
          ...options.axiosOptions,
          headers: { ...(options.axiosOptions?.headers || {}), 'x-2': '2' },
        },
        requestOptions,
      };
    };

    await api(undefined, { requestMiddlewares: [middleware1, middleware2] });

    const config = axiosMock.request.mock.calls[0]?.[0] as any;
    expect(config.url).toBe('/v2');
    expect(config.params).toEqual({ id: 1 });
    expect(config.headers).toEqual({ 'x-1': '1', 'x-2': '2' });
  });
});

import React, { useState } from 'react';
import { createBaseRequest } from 'rxtutils';
import { CodeBlock } from './CodeBlock';

const REQUEST_CODE = `
// 创建基础请求实例
const request = createBaseRequest({
  baseURL: 'https://jsonplaceholder.typicode.com',
  enableCache: true,          // 启用缓存
  cacheTime: 60,              // 缓存时间（秒）
  cacheDataInStorage: 'localStorage', // 缓存存储方式
  responseTransfer: (data) => data,
  throwError: true,           // 是否抛出错误
});

// 发送 GET 请求
const data = await request<any, any>({
  method: 'GET',
  url: '/todos/1'
});

// 发送 POST 请求
const result = await request<any, any>({
  method: 'POST',
  url: '/posts',
  data: { title: 'foo', body: 'bar', userId: 1 }
});

// 清除请求缓存
request.clearCache();
`;

// 创建不同的请求实例
const basicRequest = createBaseRequest({
  baseURL: 'https://jsonplaceholder.typicode.com',
  responseTransfer: (data) => data,
});

const cachedRequest = createBaseRequest({
  baseURL: 'https://jsonplaceholder.typicode.com',
  enableCache: true,
  cacheTime: 30,
  cacheDataInStorage: 'localStorage',
  responseTransfer: (data) => data,
});

const retryRequest = createBaseRequest({
  baseURL: 'https://jsonplaceholder.typicode.com',
  retryTimes: 2, // 重试2次
  responseTransfer: (data) => data,
});

export const RequestExample: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'basic' | 'cached' | 'error' | 'post'>('basic');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestUrl, setRequestUrl] = useState('/todos/1');

  const handleBasicRequest = async () => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await basicRequest<any, any>({
        method: 'GET',
        url: requestUrl,
      });
      console.log('Response:', res);
      setData(res);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || '请求失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCachedRequest = async () => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await cachedRequest<any, any>({
        method: 'GET',
        url: requestUrl,
      });
      console.log('Response:', res);
      setData(res);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || '请求失败');
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = () => {
    (cachedRequest as any).clearCache();
    setData(null);
    setError(null);
    alert('缓存已清除');
  };

  const handleErrorRequest = async () => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await basicRequest<any, any>({
        method: 'GET',
        url: '/invalid-endpoint',
      });
      setData(res);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || '请求失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePostRequest = async () => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await basicRequest<any, any>({
        method: 'POST',
        url: '/posts',
        data: {
          title: '测试标题',
          body: '测试内容',
          userId: 1,
        },
      });
      console.log('Response:', res);
      setData(res);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || '请求失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Request HTTP 请求</h2>
        <p className="description">
          RUtils 提供了一个强大的 HTTP 请求库，基于 Axios 构建，支持请求缓存、错误处理、重试机制、
          请求/响应拦截等功能。
        </p>

        <CodeBlock code={REQUEST_CODE} title="使用示例" />
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'basic' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          基础请求
        </button>
        <button
          className={`tab ${activeTab === 'cached' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('cached')}
        >
          缓存请求
        </button>
        <button
          className={`tab ${activeTab === 'error' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('error')}
        >
          错误处理
        </button>
        <button
          className={`tab ${activeTab === 'post' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('post')}
        >
          POST 请求
        </button>
      </div>

      <div className="card">
        {activeTab === 'basic' && (
          <>
            <h2>基础 GET 请求</h2>
            <p className="description">发送一个简单的 GET 请求，从 JSONPlaceholder 获取数据。</p>

            <div className="form-group">
              <label className="label">请求 URL</label>
              <input
                type="text"
                className="input"
                value={requestUrl}
                onChange={(e) => setRequestUrl(e.target.value)}
                placeholder="/todos/1"
              />
            </div>

            <button
              className="button button-primary"
              onClick={handleBasicRequest}
              disabled={loading}
            >
              {loading && <span className="spinner"></span>}
              {loading ? '请求中...' : '发送请求'}
            </button>
          </>
        )}

        {activeTab === 'cached' && (
          <>
            <h2>缓存请求</h2>
            <p className="description">
              请求结果会被缓存，再次请求相同的 URL 时会直接返回缓存数据。
              可以查看控制台确认是否命中缓存。
            </p>

            <div className="form-group">
              <label className="label">请求 URL</label>
              <input
                type="text"
                className="input"
                value={requestUrl}
                onChange={(e) => setRequestUrl(e.target.value)}
                placeholder="/todos/1"
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="button button-primary"
                onClick={handleCachedRequest}
                disabled={loading}
              >
                {loading && <span className="spinner"></span>}
                {loading ? '请求中...' : '发送请求（带缓存）'}
              </button>

              <button className="button button-secondary" onClick={handleClearCache}>
                清除缓存
              </button>
            </div>

            <div className="info" style={{ marginTop: '16px' }}>
              提示：第一次请求会发送网络请求，第二次相同请求将直接返回缓存数据（30秒内有效）。
            </div>
          </>
        )}

        {activeTab === 'error' && (
          <>
            <h2>错误处理</h2>
            <p className="description">演示请求错误时的处理，包括 404、500 等错误。</p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="button button-danger"
                onClick={handleErrorRequest}
                disabled={loading}
              >
                {loading && <span className="spinner"></span>}
                {loading ? '请求中...' : '发送错误请求'}
              </button>
            </div>

            <div className="info" style={{ marginTop: '16px' }}>
              这个请求会失败，演示错误处理机制。
            </div>
          </>
        )}

        {activeTab === 'post' && (
          <>
            <h2>POST 请求</h2>
            <p className="description">发送 POST 请求，创建新的数据。</p>

            <button
              className="button button-primary"
              onClick={handlePostRequest}
              disabled={loading}
            >
              {loading && <span className="spinner"></span>}
              {loading ? '请求中...' : '创建新数据'}
            </button>
          </>
        )}

        {error && (
          <div className="error" style={{ marginTop: '16px' }}>
            {error}
          </div>
        )}

        {data && (
          <div style={{ marginTop: '20px' }}>
            <h3>响应数据:</h3>
            <pre
              style={{
                background: '#f5f5f5',
                padding: '16px',
                borderRadius: '8px',
                overflow: 'auto',
                marginTop: '12px',
              }}
            >
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

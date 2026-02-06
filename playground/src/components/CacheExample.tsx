import React, { useState, useEffect } from 'react';
import { Cache } from 'rxtutils';
import { CodeBlock } from './CodeBlock';

interface CacheItem {
  key: string;
  value: string;
  expireTime: string;
}

const CACHE_CODE = `
// 创建缓存实例
const cache = new Cache<Record<string, any>, string>(
  'localStorage',    // 存储类型：localStorage, sessionStorage, indexedDB
  'my-cache',         // 缓存键名
  60                  // 缓存时间（秒）
);

// 设置缓存
cache.setCache({ id: 1 }, '缓存数据');

// 获取缓存
const data = cache.getCache({ id: 1 });

// 清空缓存
cache.clear();
`;

export const CacheExample: React.FC = () => {
  const [storageType, setStorageType] = useState<'localStorage' | 'sessionStorage' | 'indexedDB'>(
    'localStorage',
  );
  const [cacheKey, setCacheKey] = useState('demo-cache');
  const [cacheTime, setCacheTime] = useState(60);
  const [cacheItems, setCacheItems] = useState<CacheItem[]>([]);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const cacheRef = React.useRef<Cache<Record<string, any>, string> | null>(null);

  // 初始化缓存实例
  useEffect(() => {
    try {
      cacheRef.current = new Cache<Record<string, any>, string>(storageType, cacheKey, cacheTime);
      loadCacheItems();
    } catch (error) {
      console.error('Failed to initialize cache:', error);
    }
  }, [storageType, cacheKey, cacheTime]);

  const loadCacheItems = () => {
    if (!cacheRef.current) return;

    // 获取所有缓存项（通过内部访问）
    const allCache = (cacheRef.current as any).cache || [];
    const items = allCache.map((item: any) => ({
      key: JSON.stringify(item.params),
      value: JSON.stringify(item.data),
      expireTime: item.expireTime,
    }));
    setCacheItems(items);
  };

  const handleSetCache = () => {
    if (!newKey || !newValue) {
      setMessage({ type: 'error', text: '请输入键名和值' });
      return;
    }

    if (!cacheRef.current) return;

    try {
      const params = { key: newKey };
      cacheRef.current.setCache(params, newValue);
      setMessage({ type: 'success', text: '缓存设置成功' });
      setNewKey('');
      setNewValue('');
      loadCacheItems();
    } catch (error) {
      setMessage({ type: 'error', text: `缓存设置失败: ${error}` });
    }
  };

  const handleGetCache = (key: string) => {
    if (!cacheRef.current) return;

    try {
      const params = JSON.parse(key);
      const data = cacheRef.current.getCache(params);
      if (data !== null) {
        setMessage({ type: 'success', text: `缓存命中: ${data}` });
      } else {
        setMessage({ type: 'error', text: '缓存未命中或已过期' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '获取缓存失败' });
    }
  };

  const handleClearCache = () => {
    if (!cacheRef.current) return;

    try {
      cacheRef.current.clear();
      setMessage({ type: 'success', text: '缓存已清空' });
      loadCacheItems();
    } catch (error) {
      setMessage({ type: 'error', text: '清空缓存失败' });
    }
  };

  const formatExpireTime = (expireTime: string) => {
    const date = new Date(expireTime);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    const seconds = Math.floor((diff / 1000) % 60);

    if (diff <= 0) return '已过期';
    return `${minutes}分${seconds}秒后过期`;
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Cache 缓存管理</h2>
        <p className="description">
          RUtils 提供了一个灵活的缓存管理类，支持三种存储方式：localStorage、sessionStorage 和
          IndexedDB。 可以设置缓存过期时间，自动清理过期数据。
        </p>

        <CodeBlock code={CACHE_CODE} title="使用示例" />
      </div>

      <div className="card">
        <h2>缓存配置</h2>
        <div className="grid grid-2">
          <div className="form-group">
            <label className="label">存储类型</label>
            <select
              className="input"
              value={storageType}
              onChange={(e) => setStorageType(e.target.value as any)}
            >
              <option value="localStorage">localStorage (本地存储)</option>
              <option value="sessionStorage">sessionStorage (会话存储)</option>
              <option value="indexedDB">IndexedDB (数据库存储)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="label">缓存键名</label>
            <input
              type="text"
              className="input"
              value={cacheKey}
              onChange={(e) => setCacheKey(e.target.value)}
              placeholder="输入缓存键名"
            />
          </div>
          <div className="form-group">
            <label className="label">缓存时间（秒）</label>
            <input
              type="number"
              className="input"
              value={cacheTime}
              onChange={(e) => setCacheTime(parseInt(e.target.value) || 0)}
              min="1"
            />
          </div>
        </div>
      </div>

      <div className="card">
        <h2>添加缓存项</h2>
        <div className="grid grid-3">
          <div className="form-group">
            <label className="label">键名</label>
            <input
              type="text"
              className="input"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="输入键名"
            />
          </div>
          <div className="form-group">
            <label className="label">值</label>
            <input
              type="text"
              className="input"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="输入值"
            />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="button button-primary" onClick={handleSetCache}>
              设置缓存
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <h2>缓存列表</h2>
          <button className="button button-danger" onClick={handleClearCache}>
            清空缓存
          </button>
        </div>

        {cacheItems.length === 0 ? (
          <div className="info">暂无缓存项</div>
        ) : (
          <div className="list">
            {cacheItems.map((item, index) => (
              <div key={index} className="list-item">
                <div>
                  <div style={{ fontWeight: 500, marginBottom: '4px' }}>{item.key}</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>值: {item.value}</div>
                  <span
                    className="badge badge-info"
                    style={{ marginTop: '8px', display: 'inline-block' }}
                  >
                    {formatExpireTime(item.expireTime)}
                  </span>
                </div>
                <button
                  className="button button-secondary"
                  onClick={() => handleGetCache(item.key)}
                >
                  读取
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {message && (
        <div className={message.type === 'success' ? 'success' : 'error'}>{message.text}</div>
      )}
    </div>
  );
};

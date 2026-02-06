import React, { useState } from 'react';
import { CacheExample } from './components/CacheExample';
import { RequestExample } from './components/RequestExample';
import { StoreExample } from './components/StoreExample';
import { ValidatorExample } from './components/ValidatorExample';
import { HooksExample } from './components/HooksExample';

type TabType = 'cache' | 'request' | 'store' | 'validator' | 'hooks';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('cache');

  const tabs = [
    { id: 'cache' as TabType, label: 'Cache 缓存', icon: '💾' },
    { id: 'request' as TabType, label: 'Request 请求', icon: '🌐' },
    { id: 'store' as TabType, label: 'Store 状态管理', icon: '📦' },
    { id: 'validator' as TabType, label: 'Validator 验证', icon: '✅' },
    { id: 'hooks' as TabType, label: 'Hooks 钩子', icon: '🪝' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f7' }}>
      <header
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '32px 20px',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <h1
          style={{
            color: 'white',
            fontSize: '36px',
            margin: '0 0 8px 0',
            fontWeight: '700',
          }}
        >
          RUtils Playground
        </h1>
        <p
          style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '16px',
            margin: '0',
          }}
        >
          一个完整的 JavaScript/TypeScript 工具库演示
        </p>
      </header>

      <nav
        style={{
          background: 'white',
          padding: '0 20px',
          borderBottom: '1px solid #e5e7eb',
          position: 'sticky',
          top: '0',
          zIndex: '100',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            gap: '4px',
            overflowX: 'auto',
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '16px 24px',
                background: activeTab === tab.id ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                color: activeTab === tab.id ? '#667eea' : '#6b7280',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                borderBottom: activeTab === tab.id ? '2px solid #667eea' : '2px solid transparent',
                marginBottom: '-1px',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ fontSize: '18px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main style={{ padding: '40px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {activeTab === 'cache' && <CacheExample />}
          {activeTab === 'request' && <RequestExample />}
          {activeTab === 'store' && <StoreExample />}
          {activeTab === 'validator' && <ValidatorExample />}
          {activeTab === 'hooks' && <HooksExample />}
        </div>
      </main>

      <footer
        style={{
          background: 'white',
          padding: '24px 20px',
          textAlign: 'center',
          borderTop: '1px solid #e5e7eb',
          marginTop: '40px',
        }}
      >
        <p
          style={{
            color: '#6b7280',
            fontSize: '14px',
            margin: '0',
          }}
        >
          RUtils Playground - 探索和测试 RUtils 库的所有功能
        </p>
      </footer>
    </div>
  );
};

export default App;

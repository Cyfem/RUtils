import React from 'react';
import { createStateStore, createStoreGetter, createStoreGetterMemo } from 'rxtutils';
import { CodeBlock } from './CodeBlock';

const STORE_CODE = `
// 创建状态存储
const store = createStateStore({
  count: 0,
  name: 'John',
  items: [] as string[]
});

// 在组件中使用
function MyComponent() {
  const [state, setState] = store.use();
  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => setState({ count: state.count + 1 })}>
        Increment
      </button>
    </div>
  );
}

// 创建 getters
const getters = createStoreGetter(
  store,
  {
    doubleCount: (state) => state.count * 2,
    itemCount: (state) => state.items.length,
  },
  {
    doubleCount: 'double',
    itemCount: 'totalItems'
  }
);

// 在组件中使用 getters
function GetterComponent() {
  const [state] = store.use();
  console.log(getters.double); // 访问 getter
  return <div>Double: {getters.double}</div>;
}

// 使用 memo hook（推荐）
const useStoreGetters = createStoreGetterMemo(
  store,
  {
    doubleCount: (state) => state.count * 2,
    itemCount: (state) => state.items.length,
  },
  {
    doubleCount: 'double',
    itemCount: 'totalItems'
  }
);

function MemoGetterComponent() {
  const { double, totalItems } = useStoreGetters();
  return <div>Double: {double}, Total: {totalItems}</div>;
}
`;

// 创建一个全局 store 实例
const store = createStateStore({
  count: 0,
  name: 'John',
  items: [] as string[],
});

// 创建 getters
const getters = createStoreGetter(
  store,
  {
    doubleCount: (state) => state.count * 2,
    itemCount: (state) => state.items.length,
    greeting: (state) => `Hello, ${state.name}!`,
  },
  {
    doubleCount: 'double',
    itemCount: 'totalItems',
    greeting: 'greeting',
  }
);

// 创建 memo getters
const useStoreGetters = createStoreGetterMemo(
  store,
  {
    doubleCount: (state) => state.count * 2,
    itemCount: (state) => state.items.length,
    greeting: (state) => 'Hello, ' + state.name + '!',
  },
  {
    doubleCount: 'double',
    itemCount: 'totalItems',
    greeting: 'greeting',
  }
);

const CounterComponent: React.FC = () => {
  const [state, setState] = store.use();

  return (
    <div className="card">
      <h3>计数器组件</h3>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
          Count: {state.count}
        </div>
        <div style={{ color: '#6b7280', marginBottom: '16px' }}>
          Double: {getters.double}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          className="button button-primary"
          onClick={() => setState({ count: state.count + 1 })}
        >
          +1
        </button>
        <button
          className="button button-secondary"
          onClick={() => setState({ count: state.count - 1 })}
        >
          -1
        </button>
        <button
          className="button button-danger"
          onClick={() => setState({ count: 0 })}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

const NameComponent: React.FC = () => {
  const [state, setState] = store.use();

  return (
    <div className="card">
      <h3>名称组件</h3>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '18px', marginBottom: '8px' }}>
          {getters.greeting}
        </div>
      </div>

      <div className="form-group">
        <label className="label">更新名称</label>
        <input
          type="text"
          className="input"
          value={state.name}
          onChange={(e) => setState({ name: e.target.value })}
          placeholder="输入名称"
        />
      </div>
    </div>
  );
};

const ItemsComponent: React.FC = () => {
  const [state, setState] = store.use();
  const [newItem, setNewItem] = React.useState('');

  const handleAddItem = () => {
    if (!newItem.trim()) return;
    setState({ items: [...state.items, newItem] });
    setNewItem('');
  };

  return (
    <div className="card">
      <h3>列表组件</h3>
      <div style={{ marginBottom: '16px' }}>
        <div className="badge badge-info">Total Items: {getters.totalItems}</div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input
          type="text"
          className="input"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="输入新项目"
        />
        <button
          className="button button-primary"
          onClick={handleAddItem}
        >
          添加
        </button>
      </div>

      <div className="list">
        {state.items.length === 0 ? (
          <div style={{ padding: '12px', color: '#6b7280' }}>
            暂无项目
          </div>
        ) : (
          state.items.map((item, index) => (
            <div key={index} className="list-item">
              <span>{item}</span>
              <button
                className="button button-danger"
                onClick={() => {
                  setState({
                    items: state.items.filter((_, i) => i !== index),
                  });
                }}
              >
                删除
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const GetterMemoComponent: React.FC = () => {
  const { double, totalItems, greeting } = useStoreGetters();

  return (
    <div className="card">
      <h3>Getter Memo 组件</h3>
      <p className="description">
        使用 <code>createStoreGetterMemo</code> 创建的 getters 会自动 memoize，
        只在依赖项变化时重新计算。
      </p>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ marginBottom: '8px' }}>
          <span className="badge badge-success">{greeting}</span>
        </div>
        <div style={{ marginBottom: '8px' }}>
          <span className="badge badge-info">Double: {double}</span>
        </div>
        <div>
          <span className="badge badge-warning">Total Items: {totalItems}</span>
        </div>
      </div>

      <div className="info">
        这个组件使用的 getters 是 memoized 的，只有在实际依赖的状态变化时才会重新计算。
      </div>
    </div>
  );
};

export const StoreExample: React.FC = () => {
  return (
    <div className="container">
      <div className="card">
        <h2>Store 状态管理</h2>
        <p className="description">
          RUtils 提供了一个轻量级的状态管理方案，支持在多个组件间共享状态。
          通过 <code>createStateStore</code> 创建状态存储，使用 Hooks 在组件中访问和更新状态。
        </p>

        <CodeBlock code={STORE_CODE} title="使用示例" />
      </div>

      <div className="grid grid-2">
        <CounterComponent />
        <NameComponent />
      </div>

      <ItemsComponent />

      <div className="grid grid-2">
        <GetterMemoComponent />
        <div className="card">
          <h3>全局状态预览</h3>
          <pre style={{
            background: '#f5f5f5',
            padding: '16px',
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '13px',
          }}>
            {JSON.stringify(store.get(), null, 2)}
          </pre>

          <div style={{ marginTop: '16px' }}>
            <button
              className="button button-secondary"
              onClick={() => store.set({ count: 0, name: 'John', items: [] })}
            >
              重置所有状态
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

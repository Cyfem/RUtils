# RUtils

一个功能丰富的 TypeScript 工具库，提供缓存管理、HTTP 请求和状态管理等功能。

## 📦 安装

```bash
npm install rxtutils
# 或
yarn add rxtutils
# 或
pnpm add rxtutils
```

## 🚀 功能特性

- **缓存管理** - 支持内存、localStorage、sessionStorage 和 IndexedDB 多种存储方式
- **HTTP 请求** - 基于 axios 的请求封装，支持错误处理和缓存
- **状态管理** - 轻量级的状态管理解决方案，支持 React Hook
- **TypeScript** - 完整的 TypeScript 类型支持

## 📚 模块介绍

### 1. 缓存管理 (Cache)

提供灵活的缓存管理功能，支持多种存储方式。

#### 基本用法

```typescript
import { Cache } from 'rxtutils';

// 创建内存缓存
const memoryCache = new Cache<string, any>();

// 创建 localStorage 缓存
const localCache = new Cache<string, any>('localStorage', 'myCache', 300);

// 创建 IndexedDB 缓存
const dbCache = new Cache<string, any>('indexedDB', 'dbCache', 600, 'myDatabase');
```

#### 缓存操作

```typescript
// 设置缓存
cache.setCache('key1', { data: 'value1' });
cache.setCache('key2', { data: 'value2' }, { cacheTime: 120 }); // 2分钟过期

// 获取缓存
const data = cache.getCache('key1');
console.log(data); // { data: 'value1' }

// 清空缓存
cache.clear();
```

#### 高级配置

```typescript
import { Cache } from 'rxtutils';

// 自定义比较函数
const customCache = new Cache<{ id: number; name: string }, any>(
  'localStorage',
  'customCache',
  300,
  'customDB',
  (prev, next) => prev.id === next.id // 只比较 id 字段
);
```

### 2. HTTP 请求 (createBaseRequest)

基于 axios 的请求封装，支持错误处理、缓存和自定义配置。

#### 基本用法

```typescript
import { createBaseRequest } from 'rxtutils';

// 创建请求实例
const request = createBaseRequest({
  baseURL: 'https://api.example.com',
  throwError: true,
  defaultMessageShower: (message) => console.log(message)
});

// 创建具体请求
const getUserInfo = request<{ id: number }, { name: string; email: string }>({
  method: 'GET',
  url: '/user/:id'
});

// 发送请求
const userInfo = await getUserInfo({ params: { id: 123 } });
```

#### 错误处理

```typescript
const request = createBaseRequest({
  baseURL: 'https://api.example.com',
  errorCodeMap: {
    '400': '请求参数错误',
    '401': '未授权，请重新登录',
    '500': (code, data, res) => ({
      replaceResData: { error: '服务器内部错误' },
      throwError: false
    })
  },
  httpErrorCodeMap: {
    404: '资源不存在',
    500: '服务器错误'
  }
});
```

#### 缓存功能

```typescript
const request = createBaseRequest({
  baseURL: 'https://api.example.com',
  enableCache: true,
  cacheData: true,
  cacheDataInStorage: 'localStorage',
  cacheDataKey: 'api-cache',
  cacheTime: 300
});

// 第一次请求会从服务器获取数据
const data1 = await getUserInfo({ params: { id: 123 } });

// 第二次请求会从缓存获取数据
const data2 = await getUserInfo({ params: { id: 123 } });

// 清空缓存
getUserInfo.clearCache();
```

### 3. 状态管理 (createStateStore)

轻量级的状态管理解决方案，支持组件间状态共享。

#### 基本用法

```typescript
import { createStateStore } from 'rxtutils';

// 创建状态存储
const userStore = createStateStore({
  name: '',
  email: '',
  isLoggedIn: false
});

// 在组件中使用
function UserComponent() {
  const [user, setUser] = userStore.use();
  
  const handleLogin = () => {
    setUser({
      name: 'John Doe',
      email: 'john@example.com',
      isLoggedIn: true
    });
  };
  
  return (
    <div>
      <p>用户名: {user.name}</p>
      <p>邮箱: {user.email}</p>
      <button onClick={handleLogin}>登录</button>
    </div>
  );
}
```

#### 状态监听

```typescript
// 监听状态变化
const unsubscribe = userStore.watch((state) => {
  console.log('状态已更新:', state);
});

// 取消监听
unsubscribe();
```

#### 直接访问和设置

```typescript
// 直接获取状态
const currentUser = userStore.get();

// 直接设置状态
userStore.set({ name: 'Jane Doe', email: 'jane@example.com', isLoggedIn: true });
```

### 4. 状态计算器 (createStoreGetter)

为状态存储提供计算属性和派生状态。

#### 基本用法

```typescript
import { createStoreGetter, createStoreGetterMemo } from 'rxtutils';

const userStore = createStateStore({
  firstName: 'John',
  lastName: 'Doe',
  age: 30
});

// 创建 getter 函数
const getters = {
  fullName: (state) => `${state.firstName} ${state.lastName}`,
  isAdult: (state) => state.age >= 18,
  displayName: (state) => state.firstName
};

// 创建 getter 名称映射
const getterNameMaps = {
  fullName: 'fullName',
  isAdult: 'isAdult',
  displayName: 'displayName'
};

// 创建 getter 对象（非响应式）
const userGetters = createStoreGetter(userStore, getters, getterNameMaps);
console.log(userGetters.fullName); // "John Doe"

// 创建 getter memo hook（响应式）
const useUserGetters = createStoreGetterMemo(userStore, getters, getterNameMaps);

function UserProfile() {
  const { fullName, isAdult, displayName } = useUserGetters();
  
  return (
    <div>
      <h1>{fullName}</h1>
      <p>成年人: {isAdult ? '是' : '否'}</p>
      <p>显示名: {displayName}</p>
    </div>
  );
}
```

## 🔧 配置选项

### Cache 配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `storageType` | `'sessionStorage' \| 'localStorage' \| 'indexedDB'` | `undefined` | 存储类型 |
| `cacheKey` | `string` | `undefined` | 缓存键名 |
| `cacheTime` | `number` | `60` | 缓存时间（秒） |
| `indexDBName` | `string` | `'__apiCacheDatabase__'` | IndexedDB 数据库名称 |
| `cacheKeyEquals` | `function` | `defaultEquals` | 缓存键比较函数 |

### Request 配置

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `baseURL` | `string` | `''` | 请求基础URL |
| `throwError` | `boolean` | `true` | 是否抛出错误 |
| `enableCache` | `boolean` | `false` | 是否启用缓存 |
| `cacheData` | `boolean` | `false` | 是否缓存数据 |
| `cacheTime` | `number` | `60` | 缓存时间（秒） |
| `cacheDataInStorage` | `StorageType` | `undefined` | 缓存存储类型 |
| `errorCodePath` | `string` | `'code'` | 错误码路径 |
| `successCodes` | `string[]` | `['0', '200']` | 成功状态码 |

## 📝 类型定义

### 缓存相关类型

```typescript
// 缓存项接口
interface ICache<Param, Data> {
  params: Param;
  data: Data;
  expireTime: string;
}

// 缓存选项接口
interface ICacheOptions<Param> {
  storageType?: StorageType;
  cacheKey?: string;
  cacheTime?: number;
  cacheKeyEquals: (prev: Param, next: Param) => boolean;
  indexDBName?: string;
}
```

### 请求相关类型

```typescript
// 请求配置接口
interface Options<Params, Data> {
  baseURL?: string;
  throwError?: boolean;
  enableCache?: boolean;
  cacheData?: boolean;
  cacheTime?: number;
  errorCodeMap?: Record<string, string | Function>;
  httpErrorCodeMap?: Record<string, string | Function>;
  // ... 更多配置选项
}

// 请求参数接口
interface RequestOptions<Param> {
  method: Method;
  url: string;
  data?: Param;
  params?: Param;
}
```

### 状态管理相关类型

```typescript
// 状态存储接口
interface StateStore<S> {
  use: () => [S, (state: IHookStateSetAction<S>) => void];
  get: () => S;
  set: (state: IHookStateSetAction<S>) => void;
  watch: (callback: (state: S) => void) => () => void;
}

// 状态设置动作类型
type IHookStateSetAction<S> = S | IHookStateSetter<S>;
```

## 🎯 使用场景

### 1. API 数据缓存

```typescript
// 创建带缓存的 API 请求
const apiRequest = createBaseRequest({
  baseURL: 'https://api.example.com',
  enableCache: true,
  cacheData: true,
  cacheDataInStorage: 'localStorage',
  cacheTime: 300
});

const getProductList = apiRequest<{ page: number }, { products: Product[] }>({
  method: 'GET',
  url: '/products'
});
```

### 2. 用户状态管理

```typescript
// 创建用户状态存储
const userStore = createStateStore({
  user: null,
  permissions: [],
  theme: 'light'
});

// 创建用户相关的计算属性
const userGetters = createStoreGetter(userStore, {
  isLoggedIn: (state) => !!state.user,
  canEdit: (state) => state.permissions.includes('edit'),
  isDarkTheme: (state) => state.theme === 'dark'
}, {
  isLoggedIn: 'isLoggedIn',
  canEdit: 'canEdit',
  isDarkTheme: 'isDarkTheme'
});
```

### 3. 表单数据缓存

```typescript
// 创建表单缓存
const formCache = new Cache<string, FormData>('sessionStorage', 'form-cache', 1800);

// 保存表单数据
formCache.setCache('user-form', formData);

// 恢复表单数据
const savedData = formCache.getCache('user-form');
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目。

## 📄 许可证

MIT License

## 🔗 相关链接

- [TypeScript](https://www.typescriptlang.org/)
- [React](https://reactjs.org/)
- [Axios](https://axios-http.com/)
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
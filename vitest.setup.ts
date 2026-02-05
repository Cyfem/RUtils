import 'fake-indexeddb/auto';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
  cleanup();
  // 保持测试相互隔离；项目中有不少模块会读写 Web Storage。
  localStorage.clear();
  sessionStorage.clear();
});

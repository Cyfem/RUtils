Based on your requirements and the current project structure, here is the plan to add a demo preview environment that won't be included in the build:

The project already has `vite.config.ts` configured with `root: 'demo'`, and `tsconfig.json` includes the `demo` directory. We just need to create the missing `demo` directory and its entry files.

### 1. Create Demo Directory and Files
I will create the following files to set up a React-based preview environment:

- **`demo/index.html`**: The HTML entry point for Vite.
- **`demo/main.tsx`**: The React entry point that renders the App.
- **`demo/App.tsx`**: A sample component demonstrating how to import and use modules from your library (e.g., using `createBaseRequest`).

### 2. Configuration Verification
- **Build Exclusion**: `rollup.config.js` is already configured to only build files from `packages/`, so the `demo/` directory will be automatically excluded from the final build.
- **Development Alias**: `vite.config.ts` already configures the `@` alias pointing to `packages/`, allowing easy imports like `import { ... } from '@/index'`.

### 3. Usage
After these changes, you can start the preview server using the existing command:
```bash
npm run dev
```
This will launch the demo page where you can interact with and debug your library components.

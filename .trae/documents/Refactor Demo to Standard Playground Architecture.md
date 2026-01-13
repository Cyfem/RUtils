I will implement a standard "Playground" architecture and clean up the project dependencies.

### 1. Cleanup & Dependency Management
-   **Remove Deprecated Files**: Delete the `demo` directory and the root `vite.config.ts`.
-   **Remove Unused Dependency**: Uninstall `react-router` from `devDependencies` as it is not used in the `packages` source code (verified via search) and complicates the playground unnecessarily.
-   **Retain Dependencies**: Keep `moment` (used in `packages/cache`) and `react`/`react-dom` (needed for development/playground).

### 2. Create `playground` Environment
Establish a dedicated directory `playground` with a clean, standard Vite setup:
-   **`playground/vite.config.ts`**:
    -   Configured specifically for the playground.
    -   Sets up an alias `@/` or `rxtutils` pointing to `../packages/index.ts`. This allows you to import your library source directly, enabling "Hot Module Replacement" (HMR) for instant feedback while developing your library.
-   **`playground/index.html`**: Standard Vite entry.
-   **`playground/src/`**: Contains `main.tsx` and a clean `App.tsx` for testing your hooks/utilities.

### 3. Configuration Updates
-   **`package.json`**:
    -   Update the `dev` script: `"dev": "vite serve playground --config playground/vite.config.ts"`
    -   This isolates the dev server command, keeping the root clean.
-   **`tsconfig.json`**:
    -   Update `include` to watch `playground` instead of `demo`.

### Outcome
This setup aligns with open-source best practices (like `VueUse` or `Vite`'s own examples):
-   **Clean Separation**: Library build logic (Rollup) is separate from Dev/Preview logic (Vite).
-   **Zero-Config Root**: The project root remains uncluttered.
-   **Production Simulation**: The playground consumes the library source as if it were an installed package, ensuring your tests are realistic.

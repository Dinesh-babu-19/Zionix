# Setup & Integration Instructions for shadcn, Tailwind, and TypeScript

This document outlines how to configure the project to support TypeScript, Tailwind CSS, and the shadcn/ui CLI structure, as well as why standard paths like `/components/ui` are critical.

---

## 1. Project Analysis & Default Paths

### Current Project Setup
- **Tailwind CSS**: Installed and configured. Standard tailwind configuration is in `tailwind.config.js` and global directives are in `src/index.css`.
- **TypeScript**: Not configured by default. Source files were standard `.js`/`.jsx`. We have now added `tsconfig.json`, `vite-env.d.ts`, and `typescript` devDependencies so you can write `.ts` and `.tsx` files.
- **shadcn/ui**: Not initialized. No `components.json` or `/components/ui` folder existed. We have created a `src/components/ui/` folder and configured the `src/lib/utils.ts` helper.

### Default Paths
- **Components**: `src/components` (Custom UI sections like `NavBar.jsx`, `Layout.jsx`)
- **UI Primitives**: `src/components/ui` (Low-level building blocks like buttons, inputs, dialogs, and our custom `shape-landing-hero.tsx`)
- **Styles**: `src/index.css`
- **Utilities**: `src/lib/utils.ts`

---

## 2. Why the `/components/ui` Folder is Important

In the shadcn/ui ecosystem, components are copied directly into your codebase instead of being installed as compiled npm packages. This gives you full ownership over the source code.

Creating and using the `/components/ui` folder is crucial because:
1. **Separation of Concerns**: It separates low-level, atomic UI primitives (e.g., `Button`, `Input`, `Dialog`) from complex, domain-specific components (e.g., `Navbar`, `Footer`, `AuthForm`) or pages.
2. **CLI Automation**: The shadcn CLI is pre-programmed to add new primitives to `/components/ui`. Keeping this structure allows you to run `npx shadcn@latest add [component]` cleanly.
3. **Safety from Overwrites**: Keeping primitives isolated ensures that CLI updates do not accidentally overwrite your custom, high-level business logic components.

---

## 3. How to Set Up the Stack (If Starting From Scratch)

### A. Setting Up Tailwind CSS
If Tailwind CSS is not installed, install it and configure it:
```bash
# 1. Install Tailwind and its peers
npm install -D tailwindcss postcss autoprefixer

# 2. Generate configuration files
npx tailwindcss init -p
```
Update the `content` block in `tailwind.config.js` to parse your React files:
```js
content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
],
```
Add Tailwind's directives to your main CSS file (e.g., `src/index.css`):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### B. Setting Up TypeScript in a Vite Project
If starting from a pure JavaScript Vite project, convert to TypeScript:
```bash
# 1. Install TypeScript and React typings
npm install -D typescript @types/react @types/react-dom
```
Create a `tsconfig.json` at the root of the frontend:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```
Create `src/vite-env.d.ts`:
```typescript
/// <reference types="vite/client" />
```
Update your `vite.config.js` to support path aliases:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### C. Setting Up shadcn/ui
Once Tailwind and TypeScript are ready, initialize shadcn:
```bash
npx shadcn@latest init
```
During initialization, the CLI will ask:
- **Style**: Default or New York
- **Base Color**: Neutral, Slate, Zinc, etc.
- **Global CSS File**: `src/index.css`
- **CSS Variables for Colors**: Yes/No
- **Tailwind Config Path**: `tailwind.config.js`
- **Components Alias**: `@/components`
- **Utils Alias**: `@/lib/utils`
- **React Server Components**: No (for standard Vite/React client apps)

This generates `components.json` and sets up the standard helper `src/lib/utils.ts`. You can then install components using:
```bash
npx shadcn@latest add button dialog input
```

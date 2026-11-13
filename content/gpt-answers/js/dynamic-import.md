**Dynamic `import()`** is a function-like expression that loads a JavaScript module **at runtime** and returns a **Promise** that resolves to the module's namespace object. Unlike static `import` statements, it can be used anywhere — inside functions, conditionals or event handlers — and the module path can be computed.

## Static vs dynamic import

```js
// Static: top of the file, loaded before any code runs
import { formatDate } from './utils.js';

// Dynamic: loaded only when this line executes
const utils = await import('./utils.js');
utils.formatDate(new Date());
```

## Basic usage

```js
// With async/await
async function showChart(data) {
  const { Chart } = await import('./chart.js');  // named export
  new Chart(data).render();
}

// With .then()
import('./math.js').then((math) => {
  console.log(math.add(2, 3));        // named export
  console.log(math.default(2, 3));    // default export lives under .default
});

// Destructure the default export
const { default: Editor } = await import('./editor.js');
```

## Why use it?

### 1. Code splitting and lazy loading

Bundlers (Vite, webpack, Rollup, esbuild) see `import()` and put that module into a **separate chunk** that is downloaded only when needed, keeping the initial bundle small.

```js
button.addEventListener('click', async () => {
  // The heavy PDF library is fetched only on first click
  const { generatePdf } = await import('./pdf-generator.js');
  generatePdf(report);
});
```

### 2. Conditional loading

```js
const lang = navigator.language.startsWith('fr') ? 'fr' : 'en';
const messages = await import(`./locales/${lang}.js`);
console.log(messages.default.greeting);

if (!('IntersectionObserver' in window)) {
  await import('intersection-observer'); // polyfill only when needed
}
```

### 3. Loading ESM from CommonJS

In Node.js, CommonJS code can always load an ES module with `import()`:

```js
// script.cjs
async function main() {
  const { default: chalk } = await import('chalk'); // ESM-only package
  console.log(chalk.green('ok'));
}
main();
```

## Framework examples

```js
// React: lazy-loaded component
import { lazy, Suspense } from 'react';
const Settings = lazy(() => import('./Settings.jsx'));

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Settings />
    </Suspense>
  );
}

// Route-based splitting (Vue Router, React Router, etc.)
const routes = [{ path: '/admin', component: () => import('./Admin.vue') }];
```

Next.js offers `next/dynamic`, which builds on the same mechanism.

## Error handling

The promise rejects if the module fails to load (network error, missing file, syntax error):

```js
try {
  const mod = await import('./feature.js');
  mod.init();
} catch (err) {
  console.error('Failed to load feature', err);
  showFallbackUI();
}
```

## Static vs dynamic comparison

| Aspect | Static `import` | Dynamic `import()` |
| --- | --- | --- |
| When loaded | Before module code runs | When the expression executes |
| Placement | Top level only | Anywhere |
| Path | String literal only | Any expression |
| Returns | Bindings | Promise of the module namespace |
| Tree-shaking | Fully analysable | Less precise (whole module object) |
| Works in CommonJS | No | Yes |
| Code splitting | No | Yes (separate chunk) |

## Common pitfalls

- **Fully dynamic paths** like `import(userInput)` can't be analysed by bundlers. Keep a static prefix (`./locales/${lang}.js`) so the bundler can include the right files.
- **Default exports** are under `.default`, a frequent source of `undefined is not a function`.
- **Overusing it** for tiny modules adds extra network round trips; split at meaningful boundaries (routes, heavy features).
- Modules are cached: importing the same path twice returns the same instance and doesn't refetch.

## Summary

- `import(path)` loads a module at runtime and returns a Promise of its namespace.
- Enables lazy loading, code splitting and conditional/locale loading; works in ESM and CommonJS.
- Use it for heavy, rarely used or conditional features like charts, editors and admin routes.

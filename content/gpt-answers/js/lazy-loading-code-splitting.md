**Code splitting** breaks your JavaScript bundle into smaller chunks, and **lazy loading** downloads those chunks (or images, components, data) **only when they're actually needed**. Together they shrink the initial download, so the page becomes interactive faster.

## The problem they solve

Without splitting, a single-page app often ships one big `bundle.js` containing every route, modal, chart library and admin screen. The browser must **download, parse, compile and execute** all of it before the app is usable, even though the user may only visit the home page.

Effects of a huge bundle:

- Slower **First Contentful Paint** and **Largest Contentful Paint (LCP)**
- Long main-thread tasks → poor **Interaction to Next Paint (INP)** and **Time to Interactive**
- Wasted bandwidth, especially on mobile
- Any small change invalidates the cache for the whole bundle

## Code splitting with dynamic `import()`

The core primitive is the dynamic `import()` expression. It returns a promise, and bundlers (Vite, webpack, Rollup, esbuild) automatically emit a separate chunk for it.

```js
// Static import: always in the main bundle
import { formatDate } from './utils.js';

// Dynamic import: separate chunk, loaded on demand
button.addEventListener('click', async () => {
  const { renderChart } = await import('./heavy-chart.js');
  renderChart(document.querySelector('#chart'), data);
});
```

### Route-based splitting (React)

```js
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

export default function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
// Visiting "/" never downloads Settings' code until the user navigates there.
```

Frameworks like **Next.js** split by route automatically and offer `next/dynamic` for components.

### Common splitting strategies

- **By route/page**: biggest win, natural boundaries
- **By component**: modals, rich-text editors, charts, maps
- **By interaction**: load on click/hover (with a prefetch on hover)
- **Vendor chunks**: separate rarely-changing libraries for better long-term caching

## Lazy loading other resources

```js
// Native lazy images and iframes
// <img src="photo.jpg" loading="lazy" width="800" height="600" alt="...">
// <iframe src="https://maps.example.com" loading="lazy"></iframe>

// Load a component when it scrolls into view
const observer = new IntersectionObserver(async ([entry]) => {
  if (!entry.isIntersecting) return;
  observer.disconnect();
  const { mountComments } = await import('./comments.js');
  mountComments(entry.target);
});
observer.observe(document.querySelector('#comments'));
```

## Avoiding the downside: loading delays

Lazy loading moves cost to later, which can cause spinners at the moment the user needs the feature. Mitigate with **preloading/prefetching**:

```js
// Prefetch when the user shows intent (hover/focus)
link.addEventListener('mouseenter', () => import('./pages/Settings'), { once: true });

// Or hint the browser
// <link rel="prefetch" href="/assets/settings.chunk.js">   (low priority, future navigation)
// <link rel="modulepreload" href="/assets/critical.js">   (needed soon)
```

## Benefits vs trade-offs

| Benefits | Trade-offs |
|---|---|
| Smaller initial bundle, faster first load | Extra network round-trips later |
| Less parse/compile/execute work upfront | Loading states / spinners to design |
| Better caching (small chunks change independently) | Too many tiny chunks add overhead |
| Users only pay for features they use | Must handle chunk load failures (e.g. after deploys) |

## Best practices

- **Don't lazy-load above-the-fold content** (hero image, main layout); it hurts LCP.
- Always set `width`/`height` on lazy images to avoid layout shift (CLS).
- Analyze bundles with tools like `rollup-plugin-visualizer` or `webpack-bundle-analyzer`.
- Wrap lazy components in **error boundaries** to handle failed chunk loads.
- Combine with **tree shaking** and compression (Brotli) for maximum savings.

## Summary

- **Code splitting** divides the bundle into chunks; **lazy loading** fetches them only when needed.
- Dynamic `import()` (and `React.lazy`, `next/dynamic`) is the main tool; route-based splitting gives the biggest win.
- The result: less JavaScript upfront, faster load and interactivity, as long as you prefetch smartly and keep critical content eager.

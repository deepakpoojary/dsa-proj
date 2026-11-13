**ES Modules (ESM)** are JavaScript's official, standardised module system using `import`/`export`, supported natively in browsers and Node.js. **CommonJS (CJS)** is Node's original module system using `require()` and `module.exports`. The main differences are in syntax, when modules are loaded (static vs dynamic), and how exports are bound (live bindings vs copied values).

## Syntax

```js
// ---------- CommonJS ----------
// math.cjs
function add(a, b) { return a + b; }
module.exports = { add };

// app.cjs
const { add } = require('./math.cjs');
console.log(add(2, 3)); // 5
```

```js
// ---------- ES Modules ----------
// math.mjs
export function add(a, b) { return a + b; }
export default function multiply(a, b) { return a * b; }

// app.mjs
import multiply, { add } from './math.mjs';
console.log(add(2, 3), multiply(2, 3)); // 5 6
```

## Key differences

| Feature | ES Modules | CommonJS |
| --- | --- | --- |
| Syntax | `import` / `export` | `require()` / `module.exports` |
| Loading | Static, analysed before execution; loaded asynchronously | Dynamic, executed synchronously at call time |
| Where imports go | Top level (or `import()` anywhere) | Anywhere, even inside `if` blocks |
| Exports | **Live, read-only bindings** | A **copy** of the exported value/object |
| Tree-shaking | Yes | Limited / generally no |
| Top-level `await` | Yes | No |
| Strict mode | Always | Opt-in (`'use strict'`) |
| Top-level `this` | `undefined` | `module.exports` |
| `__dirname`, `__filename` | No (use `import.meta.dirname`, `import.meta.filename`) | Yes |
| File extensions in imports | Required in Node (`./x.js`) | Optional |
| Browser support | Native (`<script type="module">`) | Needs a bundler |

## Live bindings vs copies

```js
// counter.mjs (ESM)
export let count = 0;
export function inc() { count++; }

// main.mjs
import { count, inc } from './counter.mjs';
inc();
console.log(count); // 1  <- sees the updated value
```

```js
// counter.cjs (CJS)
let count = 0;
module.exports = { count, inc: () => count++ };

// main.cjs
const { count, inc } = require('./counter.cjs');
inc();
console.log(count); // 0  <- copied value at require time
```

## Static vs dynamic loading

Because ESM imports are static, tools can see the whole dependency graph at build time, which enables **tree-shaking** (removing unused exports) and early errors for missing exports.

```js
// CJS: fine — conditional, computed require
if (process.env.DEBUG) {
  const debug = require('./debug-' + process.platform);
}

// ESM: static import must be top-level; use dynamic import() instead
if (process.env.DEBUG) {
  const debug = await import(`./debug-${process.platform}.js`);
}
```

## Using them in Node.js

- A file is treated as **ESM** if it ends in `.mjs`, or ends in `.js` and the nearest `package.json` has `"type": "module"`.
- A file is **CJS** if it ends in `.cjs`, or `.js` without `"type": "module"`.
- **ESM can import CJS**: `import pkg from './legacy.cjs'` (the `module.exports` becomes the default export).
- **CJS can load ESM**: always with dynamic `import()`, and in modern Node (20.19+/22.12+) also with `require()` for ESM that doesn't use top-level `await`.

```js
// package.json
{
  "type": "module",
  "exports": {
    "import": "./dist/index.mjs",
    "require": "./dist/index.cjs"
  }
}
```

## Common pitfalls

- Forgetting file extensions in ESM imports in Node (`import x from './utils'` fails).
- Using `__dirname` in ESM — replace with `import.meta.dirname` (Node 20.11+) or `fileURLToPath(import.meta.url)`.
- Mixing `module.exports` and `export` in the same file.
- Default-export interop confusion: a CJS module imported from ESM gives you `module.exports` as the default.

## Which should you use?

For new code, use **ES Modules** — they're the standard, work in browsers and Node, support tree-shaking and top-level `await`. CommonJS still matters for older Node projects and many existing npm packages.

## Summary

- ESM: `import`/`export`, static, async, live bindings, tree-shakable, strict by default.
- CJS: `require`/`module.exports`, dynamic, synchronous, copied values.
- Prefer ESM for new projects; understand CJS for legacy code and interop.

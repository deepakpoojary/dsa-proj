A plain `<script>` **blocks HTML parsing** while it downloads and executes. `async` downloads in parallel and runs **as soon as it's ready** (order not guaranteed), while `defer` downloads in parallel and runs **after the HTML is fully parsed, in document order**.

## The three modes

### 1. Regular `<script>`

```js
// <script src="app.js"></script>
```

- Parser **stops** when it reaches the tag.
- The script is fetched, then executed immediately.
- Only then does HTML parsing continue.
- This is why scripts were traditionally placed at the end of `<body>`.

### 2. `<script async>`

```js
// <script async src="analytics.js"></script>
```

- Downloaded **in parallel** with parsing.
- Executes **as soon as it finishes downloading**, pausing the parser at that moment.
- **No ordering guarantee** between multiple async scripts: whichever loads first runs first.
- May run before or after `DOMContentLoaded`.

### 3. `<script defer>`

```js
// <script defer src="vendor.js"></script>
// <script defer src="app.js"></script>
```

- Downloaded **in parallel** with parsing.
- Executes **after parsing completes**, just before `DOMContentLoaded`.
- **Preserves document order**: `vendor.js` always runs before `app.js`.
- The full DOM is available when it runs.

## Timeline

```
Regular:  HTML ███▌ [download][execute] ▐█████████
async:    HTML ███████▌[execute]▐███████
                [download]
defer:    HTML ████████████████████ [execute] → DOMContentLoaded
                [download]
```

## Comparison table

| | `<script>` | `async` | `defer` |
|---|---|---|---|
| Blocks parsing while downloading | Yes | No | No |
| Blocks parsing while executing | Yes | Yes | No (runs after parsing) |
| Execution time | Immediately | As soon as downloaded | After HTML parsed |
| Order preserved | Yes | **No** | Yes |
| DOM fully available | Only elements above it | Not guaranteed | Yes |
| Before `DOMContentLoaded`? | Yes | Maybe | Yes |
| Works on inline scripts | n/a | No (ignored) | No (ignored) |

## What about `type="module"`?

ES module scripts are **deferred by default**:

```js
// <script type="module" src="main.js"></script>   → behaves like defer
// <script type="module" async src="widget.js"></script> → behaves like async
```

Modules also run in strict mode and have their own scope. Unlike classic scripts, inline module scripts *can* be `async`.

## Detecting DOM readiness in code

```js
// With defer or type="module" you usually don't need this, but for regular/async scripts:
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init(); // DOM already parsed
}

function init() {
  console.log(document.querySelectorAll('button').length);
}
```

## When to use which

- **`defer`**: the default choice for your app's own scripts that touch the DOM or depend on each other.
- **`async`**: independent third-party scripts that don't depend on anything and nothing depends on them (analytics, ads, chat widgets).
- **Regular blocking**: rarely; only for tiny scripts that must run before rendering (e.g. setting a theme class to avoid a flash of the wrong theme).
- **`type="module"`**: modern apps; deferred automatically.

## Summary

- Plain `<script>` blocks parsing; `async` and `defer` download in parallel.
- `async` runs ASAP in **any order**; `defer` runs **after parsing, in order**.
- Use `defer` (or modules) for app code and `async` for independent third-party scripts.

In async JavaScript, you handle errors with **`.catch()`** on promise chains or **`try/catch`** around `await` in async functions. The key is making sure every promise is either awaited or has a rejection handler, otherwise errors become **unhandled rejections**.

## 1. Promises: `.catch()`

A single `.catch()` at the end of a chain handles errors thrown or rejected in **any** previous step.

```js
fetch('/api/user')
  .then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`); // becomes a rejection
    return res.json();
  })
  .then((user) => console.log(user.name))
  .catch((err) => console.error('Request failed:', err.message))
  .finally(() => console.log('done'));
```

Throwing inside an executor or a `.then` callback automatically turns into a rejection.

## 2. `async`/`await`: `try/catch/finally`

```js
async function loadUser(id) {
  try {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to load user:', err);
    return null; // fallback value
  } finally {
    hideSpinner(); // always runs
  }
}
```

Note: `fetch` only rejects on **network errors**. HTTP 404/500 responses resolve normally, so you must check `res.ok` yourself.

## What `try/catch` does NOT catch

### Un-awaited promises

```js
async function bad() {
  try {
    doSomethingAsync(); // missing await -> rejection escapes
  } catch (err) {
    console.log('never runs');
  }
}
```

### Errors in callbacks that run later

```js
try {
  setTimeout(() => {
    throw new Error('boom'); // thrown later, on a different call stack
  }, 0);
} catch (err) {
  console.log('never runs');
}
```

Handle errors **inside** the callback, or wrap the callback-based API in a promise.

### `return` without `await` inside `try`

```js
async function f() {
  try {
    return mightReject();       // rejection NOT caught here
    // return await mightReject(); // rejection IS caught here
  } catch (err) {
    return 'fallback';
  }
}
```

## 3. Handling errors in parallel work

```js
// Fail fast: one rejection rejects everything
try {
  const [user, posts] = await Promise.all([getUser(), getPosts()]);
} catch (err) {
  console.error('One request failed:', err);
}

// Handle each outcome individually
const results = await Promise.allSettled([getUser(), getPosts()]);
for (const r of results) {
  if (r.status === 'rejected') console.warn('Failed:', r.reason);
}
```

## 4. Global safety nets

Use these for logging and monitoring, not as a replacement for local handling.

```js
// Browser
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled rejection:', event.reason);
});

// Node.js (since v15, unhandled rejections crash the process by default)
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  process.exitCode = 1;
});
```

## 5. Best practices

- **Throw `Error` objects**, not strings, so you get stack traces. Use `cause` (ES2022) to wrap errors without losing context:

```js
try {
  await db.query(sql);
} catch (err) {
  throw new Error('Failed to save order', { cause: err });
}
```

- **Create custom error classes** to distinguish error types:

```js
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

try {
  await loadData();
} catch (err) {
  if (err instanceof HttpError && err.status === 404) showNotFound();
  else throw err; // rethrow what you can't handle
}
```

- **Don't swallow errors** with an empty `catch {}`. Handle, log, or rethrow.
- **Retry transient failures** with backoff when appropriate:

```js
async function retry(fn, attempts = 3, delayMs = 500) {
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === attempts) throw err;
      await new Promise((r) => setTimeout(r, delayMs * 2 ** (i - 1)));
    }
  }
}
```

- **Handle cancellation** with `AbortController`; an aborted `fetch` rejects with an `AbortError` that you usually want to ignore.

## Comparison

| Situation | Approach |
| --- | --- |
| Promise chain | `.catch()` at the end |
| `async` function | `try/catch/finally` around `await` |
| Several independent tasks | `Promise.allSettled` |
| All-or-nothing tasks | `try/catch` around `Promise.all` |
| Callback APIs (`setTimeout`, events) | Handle inside the callback or promisify |
| Last-resort logging | `unhandledrejection` / `process.on('unhandledRejection')` |

## Summary

- Use `.catch()` for promise chains and `try/catch` around `await` for async functions.
- `try/catch` misses un-awaited promises and errors thrown in later callbacks, so always `await` or attach a handler.
- Throw real `Error` objects (with `cause`), don't swallow errors, and use global handlers only as a safety net.

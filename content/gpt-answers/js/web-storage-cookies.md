`localStorage`, `sessionStorage` and cookies all store small pieces of data in the browser, but they differ in **lifetime, scope, size, and whether the data is sent to the server**. Web Storage (`localStorage`/`sessionStorage`) is client-only, while cookies are automatically attached to HTTP requests.

## Quick comparison

| Feature | `localStorage` | `sessionStorage` | Cookies |
|---|---|---|---|
| Capacity | ~5–10 MB per origin | ~5 MB per origin | ~4 KB per cookie |
| Lifetime | Until explicitly cleared | Until the tab/window is closed | Session, or until `Expires`/`Max-Age` |
| Scope | Same origin, all tabs | Same origin, **same tab only** | Domain + path (can include subdomains) |
| Sent to server | No | No | **Yes**, with every matching request |
| Accessible from JS | Yes | Yes | Yes, unless `HttpOnly` |
| API | Synchronous `getItem`/`setItem` | Same | `document.cookie` string, or `cookieStore` (async) |
| Available in workers | No | No | Via `cookieStore` in some browsers |
| Data type | Strings only | Strings only | Strings only |

## localStorage

Persistent key/value storage shared across all tabs of the same origin.

```js
localStorage.setItem('theme', 'dark');
console.log(localStorage.getItem('theme')); // "dark"

// Values are strings, so serialize objects
localStorage.setItem('prefs', JSON.stringify({ fontSize: 16 }));
const prefs = JSON.parse(localStorage.getItem('prefs')); // { fontSize: 16 }

localStorage.removeItem('theme');
localStorage.clear();

// React to changes made in OTHER tabs
window.addEventListener('storage', (e) => {
  console.log(e.key, e.oldValue, '→', e.newValue);
});
```

**Good for:** UI preferences, theme, cached non-sensitive data, drafts.

## sessionStorage

Same API, but data lives only for the lifetime of a **single tab**. Survives reloads, but not closing the tab; opening a new tab gives a fresh store.

```js
sessionStorage.setItem('checkoutStep', '2');
sessionStorage.getItem('checkoutStep'); // "2" (only in this tab)
```

**Good for:** multi-step form progress, per-tab state, one-time flags.

## Cookies

Small strings the browser sends to the server in the `Cookie` header with every matching request. They're usually set by the server via `Set-Cookie`:

```
Set-Cookie: sessionId=abc123; Path=/; Max-Age=3600; HttpOnly; Secure; SameSite=Lax
```

From JavaScript:

```js
document.cookie = 'lang=en; path=/; max-age=31536000; SameSite=Lax';
console.log(document.cookie); // "lang=en; other=value" (one string, you parse it)

// Delete by expiring it
document.cookie = 'lang=; path=/; max-age=0';
```

### Important cookie attributes

- **`HttpOnly`**: not readable by JS, protects session tokens from XSS.
- **`Secure`**: only sent over HTTPS.
- **`SameSite`** (`Strict` / `Lax` / `None`): controls cross-site sending, main defence against CSRF. `Lax` is the default in modern browsers; `None` requires `Secure`.
- **`Domain` / `Path`**: which URLs receive the cookie.
- **`Expires` / `Max-Age`**: persistence; omit both for a session cookie.

**Good for:** authentication sessions, server-side personalization, anything the server must read on each request.

## Security considerations

- Anything in `localStorage`/`sessionStorage` is readable by **any script on the page**, so an XSS bug can steal it. Avoid storing auth tokens there if you can.
- Prefer **`HttpOnly; Secure; SameSite` cookies** for session identifiers.
- Cookies add bytes to **every request**, so keep them small.
- Never store passwords or sensitive personal data in any client storage.
- For large or structured data, use **IndexedDB** instead (async, much larger quota, works in workers).

## Summary

- **localStorage**: persistent, per origin, shared across tabs, never sent to the server.
- **sessionStorage**: same API, but scoped to one tab and cleared when it closes.
- **Cookies**: tiny, sent with every request, configurable expiry, and the only option that can be `HttpOnly`, making them the right choice for auth sessions.

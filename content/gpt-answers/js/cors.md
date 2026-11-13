**CORS (Cross-Origin Resource Sharing)** is a browser security mechanism that lets a server declare, via HTTP headers, which other origins are allowed to read its responses. It's a controlled relaxation of the **Same-Origin Policy**, which by default blocks JavaScript on one origin from reading responses from another.

## What is an "origin"?

An origin is the combination of **scheme + host + port**:

| URL A | URL B | Same origin? |
|---|---|---|
| `https://app.com` | `https://app.com/api` | Yes |
| `https://app.com` | `http://app.com` | No (scheme) |
| `https://app.com` | `https://api.app.com` | No (host) |
| `http://localhost:3000` | `http://localhost:8080` | No (port) |

## How CORS works

When your frontend at `https://app.com` calls `https://api.example.com`, the browser adds an `Origin` header. The server answers with CORS headers, and the **browser** decides whether your JS can see the response.

### Simple requests

`GET`, `HEAD`, or `POST` with "simple" headers and content types (`text/plain`, `application/x-www-form-urlencoded`, `multipart/form-data`) are sent directly:

```
GET /data HTTP/1.1
Origin: https://app.com

HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://app.com
```

If the header is missing or doesn't match, the request still reaches the server, but the browser **hides the response** from your code and logs a CORS error.

### Preflighted requests

Requests using `PUT`/`DELETE`/`PATCH`, custom headers (like `Authorization`), or `Content-Type: application/json` trigger a **preflight** `OPTIONS` request first:

```
OPTIONS /users/1 HTTP/1.1
Origin: https://app.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: content-type, authorization

HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://app.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 600
```

Only if the preflight succeeds does the browser send the real request.

## Key response headers

- **`Access-Control-Allow-Origin`**: allowed origin, or `*` for any.
- **`Access-Control-Allow-Methods`**: allowed HTTP methods (preflight).
- **`Access-Control-Allow-Headers`**: allowed request headers (preflight).
- **`Access-Control-Allow-Credentials: true`**: allow cookies/auth to be sent and the response read.
- **`Access-Control-Expose-Headers`**: response headers JS may read beyond the safe defaults.
- **`Access-Control-Max-Age`**: how long the preflight result can be cached.

## Example: client and server

```js
// Browser (https://app.com)
const res = await fetch('https://api.example.com/profile', {
  method: 'PUT',
  credentials: 'include', // send cookies cross-origin
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Asha' }),
});
```

```js
// Server (Node + Express) using the cors middleware
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors({
  origin: ['https://app.com'], // explicit allow-list
  credentials: true,           // needed for credentials: 'include'
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());
app.put('/profile', (req, res) => res.json({ ok: true }));
app.listen(8080);
```

## Common pitfalls

- **`*` with credentials is not allowed.** If `credentials: 'include'` is used, the server must echo a specific origin, not `*`.
- **CORS is enforced by browsers only.** `curl`, Postman, and server-to-server calls ignore it. It is not a server-side security control against attackers.
- **Fixing CORS happens on the server**, not in frontend code. `mode: 'no-cors'` just gives you an unreadable "opaque" response.
- **Preflight failures** often come from the server not handling `OPTIONS` or auth middleware rejecting it.
- In development, a **dev-server proxy** (Vite, Next.js rewrites) makes requests same-origin and sidesteps CORS.

## Summary

- CORS lets servers opt in to cross-origin reads by sending `Access-Control-Allow-*` headers.
- Simple requests go straight through; others trigger an `OPTIONS` preflight.
- The browser enforces it, so the fix is always configuring the server's allowed origins, methods, headers, and credentials.

import type { BankQuestion } from './types';

// Node.js interview bank, questions 51–100, written so a complete fresher can
// learn each topic from scratch. Same ids/order as the matching entries in
// node.ts (progress tracking keys on id).

export const NODE_2: BankQuestion[] = [
  // ───────────────────────── Streams & Buffers (cont.) ─────────────────────────
  {
    id: 'stream-modes',
    group: 'Streams & Buffers',
    stars: 2,
    difficulty: 'Medium',
    q: 'What are flowing and paused modes of a Readable stream?',
    a: [
      "# ELI5",
      "Flowing mode is like a water tap left open: water keeps coming and you must catch it.",
      "Paused mode is like a water cooler with a button: you get a cup only when you press.",
      "A Readable stream starts with the tap closed (paused) and opens when someone starts listening.",
      "# What it is",
      "A Readable stream is a source of data you read from, like a file, an HTTP request body, or `process.stdin`.",
      "Flowing mode: the stream pushes data to you automatically by emitting `data` events as fast as it can.",
      "Paused mode: data sits in an internal buffer until you explicitly pull it with `stream.read()`, usually when the `readable` event fires.",
      "Every Readable starts in paused mode.",
      "# How it works",
      "Switching to flowing mode happens when you:",
      "  attach a `data` event listener,",
      "  call `stream.resume()`, or",
      "  call `stream.pipe(dest)`.",
      "Switching back to paused happens when you:",
      "  call `stream.pause()` (if there are no pipe destinations), or",
      "  remove pipe destinations with `unpipe()`.",
      "In paused mode, `readable` fires when there is data; you loop `while ((chunk = stream.read()) !== null)` to drain it.",
      "`for await (const chunk of stream)` uses the paused/pull style under the hood and is the modern, recommended way.",
      "# Example walkthrough",
      "Part 1 attaches `on('data')`, which turns on flowing mode; chunks arrive automatically and we pause for 100 ms to show manual backpressure.",
      "Part 2 uses `for await`, which pulls one chunk at a time and waits for your loop body before getting the next — no manual pause needed.",
      "# Why it matters / when to use",
      "Flowing mode with `pipe`/`pipeline` is the most common: you just connect source to destination.",
      "Paused/pull mode gives fine control, e.g. parsing a binary protocol header of exact size with `read(n)`.",
      "Knowing the modes explains bugs like lost data or a stream that never ends.",
      "# Common mistakes",
      "Attaching `data` listener before you are ready: data starts flowing and can be lost if nothing handles it. Fix: attach handlers right before you want data, or use `for await`.",
      "Mixing `data` events, `readable` events and `pipe` on the same stream: confusing and buggy. Fix: pick one style.",
      "Never consuming an HTTP request body: the stream stays paused and the socket may hang. Fix: read it or call `req.resume()` to discard it.",
      "# Say this in the interview",
      "A Readable stream starts paused. Attaching a `data` listener, calling `resume()` or `pipe()` switches it to flowing mode where data is pushed to you; in paused mode you pull with `read()` on the `readable` event. Today I prefer `pipeline` or `for await` loops, which handle backpressure for me.",
      "Follow-up: what is backpressure?",
      "  When the consumer is slower than the producer, the producer pauses until the consumer catches up, so memory does not grow without limit.",
    ],
    code: `import { createReadStream } from 'node:fs';

// 1) Flowing mode: data is pushed to us
const s = createReadStream('./big.log', { highWaterMark: 16 });
s.on('data', (chunk) => {
  console.log('got', chunk.length, 'bytes'); // → got 16 bytes ...
  s.pause();                                 // back to paused mode
  setTimeout(() => s.resume(), 100);         // flowing again later
});
s.on('end', () => console.log('flowing done'));

// 2) Pull style with async iteration (recommended)
let total = 0;
for await (const chunk of createReadStream('./big.log')) {
  total += chunk.length; // next chunk is read only after this runs
}
console.log('total bytes:', total); // → total bytes: <file size>`,
  },
  {
    id: 'object-mode',
    group: 'Streams & Buffers',
    stars: 1,
    difficulty: 'Medium',
    q: 'What is object mode in streams?',
    a: [
      "# ELI5",
      "A normal stream is like a conveyor belt that only carries sand (bytes).",
      "An object-mode stream is a conveyor belt that carries whole parcels (JavaScript objects), one parcel per slot.",
      "In code: normal streams move `Buffer`/string chunks; object-mode streams move any JS value except `null`.",
      "# What it is",
      "By default, Node streams only accept `Buffer`, string, or `Uint8Array` chunks.",
      "Setting `objectMode: true` lets a stream carry arbitrary JavaScript values such as `{ id: 1, name: 'Ann' }`.",
      "`null` is reserved: pushing `null` means end of stream.",
      "`highWaterMark` changes meaning: in object mode it counts objects (default 16), not bytes.",
      "# How it works",
      "You pass `objectMode: true` (or `readableObjectMode` / `writableObjectMode` for just one side of a Transform).",
      "Each `push(obj)` or `write(obj)` is treated as exactly one chunk, never split or merged.",
      "Backpressure kicks in after `highWaterMark` objects are buffered.",
      "`Readable.from(array)` creates an object-mode readable automatically.",
      "# Example walkthrough",
      "`Readable.from(users)` emits each user object one at a time.",
      "The `toCsv` Transform reads objects (`writableObjectMode: true`) but outputs strings, so it can pipe into `process.stdout`, which only takes bytes.",
      "Output is CSV lines like `1,Ann`.",
      "# Why it matters / when to use",
      "Processing records: database rows, parsed CSV lines, JSON events, log entries.",
      "Building pipelines like DB cursor → transform rows → CSV → HTTP response for large exports.",
      "# Common mistakes",
      "Piping an object stream into a byte stream (file, socket): throws `ERR_INVALID_ARG_TYPE`. Fix: convert objects to strings/Buffers first.",
      "Pushing `null` as data: it ends the stream. Fix: wrap or skip null values.",
      "Expecting `highWaterMark` in bytes: in object mode it is a count. Fix: tune it as a number of items.",
      "# Say this in the interview",
      "Object mode lets a stream carry JavaScript values instead of bytes, one object per chunk; `highWaterMark` then counts objects. I use it for record pipelines like DB rows to CSV, converting back to strings before writing to files or sockets.",
      "Follow-up: how to mix modes in a Transform?",
      "  Use `writableObjectMode: true` with byte output, or `readableObjectMode: true` for the reverse.",
    ],
    code: `import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const users = [{ id: 1, name: 'Ann' }, { id: 2, name: 'Bob' }];

// Readable.from() is in object mode automatically
const source = Readable.from(users);

const toCsv = new Transform({
  writableObjectMode: true, // input: objects
  // output side stays in byte/string mode
  transform(user, _enc, cb) {
    cb(null, user.id + ',' + user.name + '\\n');
  },
});

await pipeline(source, toCsv, process.stdout);
// → 1,Ann
// → 2,Bob`,
  },
  {
    id: 'buffer-alloc-unsafe',
    group: 'Streams & Buffers',
    stars: 1,
    difficulty: 'Medium',
    q: 'What is the difference between `Buffer.alloc` and `Buffer.allocUnsafe`?',
    a: [
      "# ELI5",
      "`Buffer.alloc` is like getting a new notebook with clean, empty pages.",
      "`Buffer.allocUnsafe` is like grabbing a used notebook from the recycling bin: faster to get, but old writing may still be on the pages.",
      "If you do not erase every page before showing it to someone, they might read someone else's secrets.",
      "In code: `alloc` gives zero-filled memory; `allocUnsafe` gives memory that may contain old data.",
      "# What it is",
      "A `Buffer` is Node's way of holding raw binary data (bytes), like file contents or network packets; it is a subclass of `Uint8Array`.",
      "`Buffer.alloc(size)` creates a buffer and fills every byte with 0 (or a fill value you pass).",
      "`Buffer.allocUnsafe(size)` creates a buffer without clearing it, so it may contain leftover bytes from memory used earlier.",
      "Comparison:",
      "  Safety: `alloc` = safe, always zeros; `allocUnsafe` = may leak old data.",
      "  Speed: `alloc` slightly slower (it must write zeros); `allocUnsafe` faster.",
      "  Pooling: small `allocUnsafe` buffers (under ~4 KB) may come from a shared pre-allocated pool, making them even faster.",
      "# How it works",
      "`alloc` asks for memory and then writes zero to every byte.",
      "`allocUnsafe` asks for memory and returns it as is; for small sizes it slices from an internal 8 KB pool (`Buffer.poolSize`).",
      "That old memory might hold previous data from your process, such as tokens or passwords.",
      "So `allocUnsafe` is only safe if you immediately overwrite every single byte.",
      "# Example walkthrough",
      "`Buffer.alloc(5)` prints `<Buffer 00 00 00 00 00>` every time.",
      "`Buffer.allocUnsafe(5)` may print random bytes; we then `fill(0)` or write all bytes ourselves.",
      "`Buffer.from('hi')` is the common way to create a buffer from existing data.",
      "# Why it matters / when to use",
      "Use `alloc` by default, especially for anything that could be sent to a client.",
      "Use `allocUnsafe` only in hot, performance-critical code (e.g. binary protocol encoders) where you overwrite the whole buffer right away.",
      "The deprecated `new Buffer(n)` behaved like `allocUnsafe` and caused real security leaks, which is why these explicit APIs exist.",
      "# Common mistakes",
      "Sending an `allocUnsafe` buffer that was only partially written: leaks memory contents. Fix: use `alloc` or fill it completely.",
      "Using `new Buffer()`: deprecated and unsafe. Fix: use `Buffer.alloc` / `Buffer.from`.",
      "# Say this in the interview",
      "`Buffer.alloc` returns zero-filled memory and is safe; `Buffer.allocUnsafe` skips the zeroing for speed, so it can contain old sensitive data. I use `alloc` by default and `allocUnsafe` only when I will overwrite every byte immediately in performance-critical code.",
      "Follow-up: what is the buffer pool?",
      "  Node pre-allocates an 8 KB slab and slices small `allocUnsafe`/`from` buffers from it to avoid many tiny allocations.",
    ],
    code: `// Safe: always zero-filled
const safe = Buffer.alloc(5);
console.log(safe); // → <Buffer 00 00 00 00 00>

// Fast but may contain old memory contents
const fast = Buffer.allocUnsafe(5);
console.log(fast); // → <Buffer ?? ?? ?? ?? ??> (random-looking bytes)

// Only OK if we overwrite every byte before using it
fast.fill(0);
fast.write('hello');
console.log(fast.toString()); // → hello

// Creating from existing data
const fromStr = Buffer.from('hi', 'utf8');
console.log(fromStr, fromStr.length); // → <Buffer 68 69> 2

console.log(Buffer.poolSize); // → 8192 (shared pool for small buffers)`,
  },
  // ───────────────────────── Express & HTTP/APIs ─────────────────────────
  {
    id: 'express-middleware',
    group: 'Express & HTTP/APIs',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is middleware in Express and how does it work?',
    a: [
      "# ELI5",
      "Picture airport security: you pass the ticket check, then the bag scanner, then the passport desk, then you reach the gate.",
      "Each checkpoint can let you through, add a stamp to your passport, or stop you and send you home.",
      "Express middleware are those checkpoints, and the request is the traveller.",
      "In code: each middleware gets the request, can modify it, and either calls `next()` to pass it on or sends a response to stop the chain.",
      "# What it is",
      "Express is the most popular web framework for Node; it helps you handle HTTP requests (a browser or app asking your server for something).",
      "Middleware is a function with the signature `(req, res, next)`:",
      "  `req` — the request object (URL, headers, body, params).",
      "  `res` — the response object you use to reply (`res.json`, `res.status`).",
      "  `next` — a function that hands control to the next middleware in line.",
      "Express keeps all middleware and routes in one ordered list, called the middleware stack, and runs them top to bottom.",
      "A route handler like `app.get('/users', fn)` is just middleware that only runs for matching method and path.",
      "Types: application-level (`app.use`), router-level (`router.use`), built-in (`express.json()`), third-party (`cors`, `helmet`), and error-handling (4 arguments).",
      "# How it works",
      "A request arrives at the server.",
      "Express walks the stack in the order you registered things.",
      "For each entry whose path/method matches, it calls the function with `(req, res, next)`.",
      "The function then does one of three things:",
      "  calls `next()` — continue to the next match;",
      "  sends a response (`res.send`/`res.json`) — the chain ends;",
      "  calls `next(err)` — Express skips normal middleware and jumps to error-handling middleware.",
      "If no one responds and the stack ends, Express sends a default 404.",
      "If a middleware neither responds nor calls `next()`, the request hangs until the client times out.",
      "# Example walkthrough",
      "`express.json()` reads the request body and turns JSON text into `req.body`.",
      "`logger` prints method and URL, records the start time, and calls `next()`.",
      "`requireAuth` checks the `authorization` header; if missing it responds 401 and stops; otherwise it attaches `req.user` and calls `next()`.",
      "`GET /me` only runs if auth passed and replies with the user: `{ name: 'ann' }`.",
      "`GET /health` is registered before `requireAuth` is applied, so it is public.",
      "# Why it matters / when to use",
      "Cross-cutting concerns — things every request needs — belong in middleware: logging, auth, body parsing, CORS, rate limiting, compression, request IDs.",
      "It keeps route handlers small and focused on business logic.",
      "Order is a design tool: public routes before auth, error handler last.",
      "# Common mistakes",
      "Forgetting to call `next()` or send a response: request hangs. Fix: every code path must do one or the other.",
      "Calling `next()` after sending a response: causes `Cannot set headers after they are sent`. Fix: `return res.status(401).json(...)` so the function stops.",
      "Wrong order, e.g. reading `req.body` before `express.json()` is registered: `req.body` is undefined. Fix: register parsers first.",
      "In Express 4, async errors are not caught automatically. Fix: use Express 5 (which forwards rejected promises to `next`) or wrap handlers in try/catch.",
      "# Say this in the interview",
      "Middleware in Express is a function `(req, res, next)` that runs in the order it was registered. Each one can read or modify the request, end the cycle by sending a response, or call `next()` to pass control on, and `next(err)` jumps to error handlers. I use it for cross-cutting concerns like logging, auth, parsing and rate limiting, and I am careful about ordering.",
      "Follow-up: how do you apply middleware to only some routes?",
      "  Mount it on a path (`app.use('/admin', auth)`), on a router, or pass it inline: `app.get('/x', auth, handler)`.",
      "Follow-up: what does `next('route')` do?",
      "  It skips the remaining handlers of the current route and moves to the next matching route.",
    ],
    code: `import express from 'express';
const app = express();

app.use(express.json()); // built-in: parses JSON body into req.body

// Custom logging middleware
function logger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => console.log(req.method, req.url, res.statusCode, Date.now() - start + 'ms'));
  next(); // pass control on
}
app.use(logger);

app.get('/health', (req, res) => res.send('ok')); // public, before auth

// Auth middleware: stops the chain or enriches req
function requireAuth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: 'No token' }); // chain ends
  req.user = { name: 'ann' }; // pretend we verified the token
  next();
}
app.use(requireAuth); // everything registered below needs auth

app.get('/me', (req, res) => res.json(req.user));
// curl localhost:3000/me                     → 401 {"error":"No token"}
// curl -H "Authorization: x" localhost:3000/me → {"name":"ann"}

app.listen(3000);`,
  },
  {
    id: 'express-error-handling',
    group: 'Express & HTTP/APIs',
    stars: 5,
    difficulty: 'Medium',
    q: 'How does error handling middleware work in Express?',
    a: [
      "# ELI5",
      "In a factory, if any worker on the assembly line finds a broken toy, they do not try to fix it themselves.",
      "They put it on a special red conveyor belt that goes straight to the repair desk at the end.",
      "Express error-handling middleware is that repair desk, and `next(err)` is the red belt.",
      "In code: any middleware can call `next(err)`; Express skips all normal middleware and runs the special 4-argument error handler.",
      "# What it is",
      "An error-handling middleware is a function with exactly four parameters: `(err, req, res, next)`.",
      "Express recognises it as an error handler purely by counting the parameters (the function's `length`), so all four must be declared even if unused.",
      "It is registered with `app.use(...)` after all routes, so it is the last thing in the stack.",
      "Express ships a default error handler that returns a 500 HTML page with the stack trace in development; you replace it to return clean JSON.",
      "A custom error class (e.g. `AppError` with a `status` field) lets you say which HTTP status code to send.",
      "# How it works",
      "An error happens in a route or middleware.",
      "It reaches Express in one of these ways:",
      "  a synchronous `throw` inside a handler — Express catches it automatically;",
      "  calling `next(err)` explicitly;",
      "  in Express 5, a rejected promise from an async handler — forwarded automatically;",
      "  in Express 4, async errors are NOT caught; you must try/catch and call `next(err)` or use a wrapper.",
      "Express then skips every normal `(req, res, next)` middleware.",
      "It runs the next 4-argument middleware with the error.",
      "That handler logs the error, picks a status code, and sends a safe response.",
      "If the response was already partly sent (`res.headersSent`), you should delegate to `next(err)` so Express closes the connection.",
      "# Example walkthrough",
      "`AppError` stores an HTTP status alongside the message.",
      "`GET /users/:id` is async; if the user is missing it throws `new AppError(404, 'User not found')`; Express 5 forwards this to the error handler.",
      "A catch-all `app.use` for unknown routes creates a 404 error.",
      "The final error handler logs, chooses `err.status` or 500, and hides internal messages for 500s so stack traces never leak.",
      "Request to `/users/99` returns `404 {\"error\":\"User not found\"}`.",
      "# Why it matters / when to use",
      "One central place for errors means consistent JSON responses, consistent logging, and no leaked stack traces.",
      "It separates expected errors (validation, not found — 4xx) from bugs (500), which is useful for alerts and monitoring.",
      "# Common mistakes",
      "Declaring the handler with three params: Express treats it as normal middleware and it never receives errors. Fix: always `(err, req, res, next)`.",
      "Registering it before routes: errors from routes never reach it. Fix: put it last.",
      "Unhandled async errors in Express 4 crash or hang the request. Fix: upgrade to Express 5, or wrap with `try/catch` + `next(err)`.",
      "Sending `err.stack` to clients: leaks internals. Fix: log it server-side, send a generic message.",
      "# Say this in the interview",
      "Express identifies error middleware by its four-argument signature `(err, req, res, next)`, registered after all routes. Any sync throw or `next(err)` skips normal middleware and lands there, and Express 5 also forwards rejected promises from async handlers. I use a custom error class with a status code, log the full error, and return a clean JSON response without stack traces.",
      "Follow-up: how did people handle async errors in Express 4?",
      "  With a wrapper like `const wrap = fn => (req, res, next) => fn(req, res, next).catch(next)` or the `express-async-errors` package.",
      "Follow-up: what about errors outside requests?",
      "  Use `process.on('unhandledRejection')` / `uncaughtException` to log and then exit gracefully.",
    ],
    code: `import express from 'express'; // Express 5

class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const app = express();
const users = { 1: { id: 1, name: 'Ann' } };

app.get('/users/:id', async (req, res) => {
  const user = users[req.params.id];
  if (!user) throw new AppError(404, 'User not found'); // Express 5 forwards it
  res.json(user);
});

// Unknown route → 404 error
app.use((req, res, next) => next(new AppError(404, 'Route not found')));

// Error handler: MUST have 4 params and be registered last
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err); // let Express close the socket
  const status = err.status ?? 500;
  console.error(err); // full details in logs only
  res.status(status).json({
    error: status === 500 ? 'Internal Server Error' : err.message,
  });
});

app.listen(3000);
// GET /users/1  → 200 {"id":1,"name":"Ann"}
// GET /users/99 → 404 {"error":"User not found"}`,
  },
  {
    id: 'rest-principles',
    group: 'Express & HTTP/APIs',
    stars: 4,
    difficulty: 'Easy',
    q: 'What are the principles of RESTful API design?',
    a: [
      "# ELI5",
      "Think of a library: every book has an address (shelf number), and there are a few standard actions — look at a book, add a book, replace a book, remove a book.",
      "Everyone uses the same small set of actions for every book, so you never need to learn special rules.",
      "REST is that idea for the web: every thing (resource) has a URL, and you use the standard HTTP methods on it.",
      "# What it is",
      "REST (Representational State Transfer) is an architectural style for designing web APIs, described by Roy Fielding in 2000.",
      "A resource is any thing your API exposes: a user, an order, a product. It is identified by a URL like `/users/42`.",
      "A representation is the format you send the resource in, usually JSON.",
      "HTTP methods (also called verbs) describe the action:",
      "  `GET` — read; `POST` — create; `PUT` — replace entirely; `PATCH` — update part; `DELETE` — remove.",
      "Core constraints:",
      "  Client–server: frontend and backend are separate and evolve independently.",
      "  Stateless: each request carries everything needed (e.g. auth token); the server does not remember previous requests.",
      "  Cacheable: responses say whether they can be cached (`Cache-Control`, `ETag`).",
      "  Uniform interface: consistent URLs, methods, status codes.",
      "  Layered system: clients do not know if they talk to the server, a cache, or a load balancer.",
      "Idempotent — doing the same request twice has the same effect as once. `GET`, `PUT`, `DELETE` are idempotent; `POST` is not.",
      "Safe — the method does not change data. `GET` and `HEAD` are safe.",
      "# How it works",
      "Use nouns, plural, for URLs: `/users`, `/users/42`, `/users/42/orders`.",
      "  Not verbs: avoid `/getUsers` or `/createOrder`.",
      "Choose the method by action, then return a fitting status code:",
      "  `POST /users` → `201 Created` with a `Location` header.",
      "  `GET /users/42` → `200 OK` or `404 Not Found`.",
      "  `DELETE /users/42` → `204 No Content`.",
      "Use query strings for filtering, sorting and pagination: `/users?role=admin&sort=-createdAt&limit=20`.",
      "Return consistent JSON error bodies, e.g. `{ error: { code, message } }`.",
      "# Example walkthrough",
      "The snippet defines a full CRUD (Create, Read, Update, Delete) set for `/users` with the correct methods and status codes.",
      "`POST` returns 201, `GET` missing returns 404, `DELETE` returns 204 with no body.",
      "# Why it matters / when to use",
      "Predictable APIs are easy for frontend, mobile and third-party developers to use without reading tons of docs.",
      "Statelessness makes horizontal scaling easy: any server instance can handle any request.",
      "HTTP caching works for free on well-designed `GET` endpoints.",
      "# Common mistakes",
      "Verbs in URLs (`/deleteUser/5`). Fix: `DELETE /users/5`.",
      "Always returning 200 with `{ success: false }`. Fix: use proper 4xx/5xx codes.",
      "Using `GET` for actions that change data: crawlers and prefetchers can trigger them. Fix: use `POST`/`PATCH`/`DELETE`.",
      "Storing session state on one server: breaks scaling. Fix: keep requests stateless or use a shared store.",
      "# Say this in the interview",
      "REST models the API as resources identified by URLs, manipulated through standard HTTP methods with meaningful status codes. It is stateless, cacheable, and has a uniform interface, so it scales well and is predictable. In practice I use plural nouns, query params for filters and pagination, idempotent PUT/DELETE, and consistent error bodies.",
      "Follow-up: PUT vs PATCH?",
      "  PUT replaces the whole resource and is idempotent; PATCH applies a partial update.",
      "Follow-up: what is HATEOAS?",
      "  Including links to related actions in responses; it is part of strict REST but rarely fully used in practice.",
    ],
    code: `import express from 'express';
const app = express();
app.use(express.json());

const users = new Map([[1, { id: 1, name: 'Ann' }]]);
let nextId = 2;

app.get('/users', (req, res) => res.json([...users.values()]));      // 200 list

app.get('/users/:id', (req, res) => {
  const u = users.get(Number(req.params.id));
  if (!u) return res.status(404).json({ error: 'Not found' });        // 404
  res.json(u);                                                       // 200
});

app.post('/users', (req, res) => {
  const user = { id: nextId++, name: req.body.name };
  users.set(user.id, user);
  res.status(201).location('/users/' + user.id).json(user);          // 201
});

app.patch('/users/:id', (req, res) => {
  const u = users.get(Number(req.params.id));
  if (!u) return res.status(404).end();
  Object.assign(u, { name: req.body.name });                         // partial update
  res.json(u);
});

app.delete('/users/:id', (req, res) => {
  users.delete(Number(req.params.id));
  res.status(204).end();                                             // 204, no body
});

app.listen(3000);`,
  },
  {
    id: 'http-status-codes',
    group: 'Express & HTTP/APIs',
    stars: 4,
    difficulty: 'Easy',
    q: 'Which HTTP status codes should a backend developer know?',
    a: [
      "# ELI5",
      "When you hand in homework, the teacher answers with a short signal: a tick (good), a question mark (you made a mistake), or 'sorry, I am sick today' (my problem, not yours).",
      "HTTP status codes are those signals: a three-digit number that tells the client how the request went.",
      "The first digit tells the category: 2 = success, 3 = go elsewhere, 4 = your fault, 5 = server's fault.",
      "# What it is",
      "A status code is the number at the start of every HTTP response, for example `200 OK`.",
      "Categories:",
      "  1xx informational (rare, e.g. `101 Switching Protocols` for WebSockets).",
      "  2xx success.",
      "  3xx redirection.",
      "  4xx client error — the request was wrong.",
      "  5xx server error — the server failed on a valid request.",
      "Must-know codes:",
      "  `200 OK` — success with a body.",
      "  `201 Created` — a new resource was created (after POST).",
      "  `204 No Content` — success, nothing to return (e.g. DELETE).",
      "  `301 Moved Permanently` / `302 Found` — redirects; `304 Not Modified` — use your cached copy.",
      "  `400 Bad Request` — malformed input or failed validation.",
      "  `401 Unauthorized` — not authenticated (no or invalid login).",
      "  `403 Forbidden` — authenticated but not allowed.",
      "  `404 Not Found` — resource does not exist.",
      "  `409 Conflict` — clashes with current state, e.g. duplicate email.",
      "  `422 Unprocessable Content` — syntax OK but semantically invalid (some APIs use this for validation).",
      "  `429 Too Many Requests` — rate limit hit.",
      "  `500 Internal Server Error` — unexpected bug.",
      "  `502 Bad Gateway` / `503 Service Unavailable` / `504 Gateway Timeout` — upstream or availability problems.",
      "# How it works",
      "Your handler decides the outcome, then sets the code with `res.status(code)` before sending.",
      "Clients, browsers, proxies and monitoring tools all react to the code:",
      "  Browsers follow 3xx redirects automatically.",
      "  Caches use 304 to avoid re-downloading.",
      "  Retry logic usually retries 429/503 (with backoff) but not 400.",
      "  Alerts usually fire on 5xx rates.",
      "# Example walkthrough",
      "`POST /signup` returns 400 if the email is missing, 409 if it already exists, and 201 when created.",
      "`GET /admin` returns 401 without a token and 403 for a non-admin user.",
      "# Why it matters / when to use",
      "Correct codes let frontends show the right message and let monitoring separate user mistakes from real outages.",
      "They are a key part of a REST API contract.",
      "# Common mistakes",
      "Mixing up 401 and 403. Fix: 401 = who are you?, 403 = I know you, but no.",
      "Returning 200 with an error message in the body. Fix: use the matching 4xx/5xx code.",
      "Returning 500 for validation errors. Fix: 400/422 — the client caused it.",
      "Sending a body with 204. Fix: 204 must have no body.",
      "# Say this in the interview",
      "I group them by first digit: 2xx success, 3xx redirect, 4xx client error, 5xx server error. The ones I use daily are 200, 201, 204, 304, 400, 401, 403, 404, 409, 422, 429, 500, 502, 503. The important distinction is 401 for missing or invalid authentication versus 403 for authenticated but not permitted.",
      "Follow-up: when do you use 503?",
      "  When the service is temporarily unavailable, e.g. during shutdown or overload, often with a `Retry-After` header.",
    ],
    code: `import express from 'express';
const app = express();
app.use(express.json());
const emails = new Set(['taken@x.com']);

app.post('/signup', (req, res) => {
  const { email } = req.body ?? {};
  if (!email) return res.status(400).json({ error: 'email required' });   // 400
  if (emails.has(email)) return res.status(409).json({ error: 'exists' }); // 409
  emails.add(email);
  res.status(201).json({ email });                                        // 201
});

app.get('/admin', (req, res) => {
  const role = req.headers['x-role']; // pretend this came from a verified token
  if (!role) return res.status(401).json({ error: 'login first' });      // 401
  if (role !== 'admin') return res.status(403).json({ error: 'nope' });  // 403
  res.json({ secret: 42 });                                              // 200
});

app.listen(3000);
// POST /signup {}                       → 400
// POST /signup {"email":"taken@x.com"}  → 409
// GET /admin with x-role: user          → 403`,
  },
  {
    id: 'cors',
    group: 'Express & HTTP/APIs',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is CORS and how do you configure it in a Node API?',
    a: [
      "# ELI5",
      "Imagine a school where kids can only take notes from their own classroom's board.",
      "If a kid from Class A wants to read Class B's board, Class B's teacher must put up a sign saying 'Class A is allowed'.",
      "The browser is the strict hall monitor; CORS is the sign that the server (Class B) puts up.",
      "In code: the browser blocks a web page from reading responses from another origin unless that server sends headers that allow it.",
      "# What it is",
      "Origin — the combination of scheme, host and port, e.g. `https://app.com:443`. `http://localhost:3000` and `http://localhost:5173` are different origins.",
      "Same-Origin Policy — a browser security rule: JavaScript on one origin cannot read responses from another origin by default.",
      "CORS (Cross-Origin Resource Sharing) — a set of HTTP headers that lets a server say which other origins may read its responses.",
      "Key headers the server sends:",
      "  `Access-Control-Allow-Origin` — which origin is allowed (e.g. `https://app.com`).",
      "  `Access-Control-Allow-Methods` — allowed methods for preflight.",
      "  `Access-Control-Allow-Headers` — allowed custom request headers like `Authorization`.",
      "  `Access-Control-Allow-Credentials: true` — allow cookies; then origin cannot be `*`.",
      "  `Access-Control-Max-Age` — how long the browser may cache the preflight result.",
      "CORS is enforced only by browsers. Postman, curl and server-to-server calls ignore it.",
      "# How it works",
      "Simple requests (GET/POST with basic headers and simple content types) are sent directly; the browser checks the response headers and blocks JS from reading it if not allowed.",
      "Non-simple requests (PUT/DELETE, JSON content type, `Authorization` header) trigger a preflight first:",
      "  Browser sends `OPTIONS` with `Origin`, `Access-Control-Request-Method`, `Access-Control-Request-Headers`.",
      "  Server replies with the allow headers (usually 204).",
      "  If allowed, the browser sends the real request; otherwise it shows a CORS error in the console.",
      "The server still receives and may process blocked simple requests — CORS protects reading the response, not the server itself.",
      "# Example walkthrough",
      "The `cors` package is configured with an allowlist; the `origin` callback accepts only listed origins (and requests with no origin, like curl).",
      "`credentials: true` lets the browser send cookies, so we must echo a specific origin, not `*`.",
      "The package automatically answers `OPTIONS` preflights for all routes.",
      "# Why it matters / when to use",
      "Any time your frontend (e.g. `app.example.com` or `localhost:5173`) calls an API on a different origin.",
      "Configuring a strict allowlist prevents random websites from reading your users' data using their cookies.",
      "# Common mistakes",
      "Using `origin: '*'` with credentials: browsers reject it. Fix: echo specific allowed origins.",
      "Thinking CORS is server security: it does not stop curl or attackers' servers. Fix: still use auth and CSRF protection.",
      "Forgetting to handle `OPTIONS`: preflight fails with 404. Fix: use `cors()` before routes, which handles it.",
      "Fixing CORS errors in the frontend: impossible; the server must send the headers (or use a dev proxy).",
      "# Say this in the interview",
      "CORS is a browser mechanism that relaxes the same-origin policy: the server sends `Access-Control-Allow-*` headers saying which origins, methods and headers are allowed, and for non-simple requests the browser first sends an OPTIONS preflight. In Express I use the `cors` middleware with an explicit origin allowlist and `credentials: true` only when cookies are needed. It is not a substitute for authentication.",
      "Follow-up: why does Postman work but the browser fails?",
      "  Only browsers enforce CORS.",
      "Follow-up: how to reduce preflight cost?",
      "  Set `Access-Control-Max-Age` so browsers cache the preflight result.",
    ],
    code: `import express from 'express';
import cors from 'cors';

const app = express();
const allowed = ['https://app.example.com', 'http://localhost:5173'];

app.use(cors({
  origin(origin, cb) {
    // no origin = curl / server-to-server, allow it
    if (!origin || allowed.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,      // allow cookies → must echo a specific origin
  maxAge: 600,            // browser caches preflight for 10 minutes
}));

app.get('/api/data', (req, res) => res.json({ ok: true }));
app.listen(3000);

// Preflight from http://localhost:5173:
// OPTIONS /api/data → 204
//   Access-Control-Allow-Origin: http://localhost:5173
//   Access-Control-Allow-Credentials: true`,
  },
  {
    id: 'pagination',
    group: 'Express & HTTP/APIs',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do you implement pagination in an API?',
    a: [
      "# ELI5",
      "A book is not printed on one huge sheet; it is split into pages so you read a bit at a time.",
      "Offset pagination is like saying 'open at page 50'. Cursor pagination is like using a bookmark: 'continue after where I stopped'.",
      "APIs do the same: they return results in small pages instead of all million rows.",
      "# What it is",
      "Pagination — splitting a large list of results into smaller chunks (pages) returned one request at a time.",
      "Offset/limit pagination: `?page=3&limit=20` → SQL `LIMIT 20 OFFSET 40`.",
      "  `LIMIT` — max rows to return; `OFFSET` — rows to skip first.",
      "Cursor (keyset) pagination: `?limit=20&cursor=<last id seen>` → SQL `WHERE id > $cursor ORDER BY id LIMIT 20`.",
      "  The cursor is a pointer to the last item of the previous page, often base64-encoded so clients treat it as opaque.",
      "Comparison:",
      "  Jump to page N: offset = yes; cursor = no (only next/previous).",
      "  Speed on deep pages: offset gets slower (the DB still reads and discards skipped rows); cursor stays fast using an index.",
      "  Consistency when data changes: offset can skip or duplicate rows if items are inserted/deleted; cursor is stable.",
      "  Total count: offset usually shows `total`; cursor usually just `hasMore` / `nextCursor`.",
      "# How it works",
      "Parse and validate `limit` (set a default like 20 and a max like 100).",
      "Offset version:",
      "  compute `offset = (page - 1) * limit`, query with `ORDER BY` + `LIMIT/OFFSET`, optionally run `COUNT(*)` for the total.",
      "Cursor version:",
      "  decode the cursor, query `WHERE (created_at, id) < (cursorDate, cursorId) ORDER BY created_at DESC, id DESC LIMIT limit + 1`.",
      "  Fetch one extra row: if you got `limit + 1`, there is a next page; drop the extra row and make the cursor from the last returned item.",
      "Always use a deterministic `ORDER BY` with a unique tiebreaker (like `id`), otherwise rows can shuffle between pages.",
      "Return metadata: `{ data, nextCursor, hasMore }` or `{ data, page, limit, total }`.",
      "# Example walkthrough",
      "An in-memory sorted array stands in for a DB table of 50 posts.",
      "`GET /posts?limit=10` returns ids 1–10 and `nextCursor` encoding id 10.",
      "`GET /posts?limit=10&cursor=...` decodes 10 and returns ids 11–20.",
      "On the last page `hasMore` is false and `nextCursor` is null.",
      "# Why it matters / when to use",
      "Without pagination one request could load millions of rows, slowing the DB, the network and the client.",
      "Offset: admin tables with page numbers and small datasets.",
      "Cursor: infinite scroll feeds, large or frequently changing tables, public APIs (Stripe, GitHub, Slack use cursors).",
      "# Common mistakes",
      "No max limit: a client sends `limit=1000000`. Fix: clamp it.",
      "Paginating without `ORDER BY`: row order is undefined. Fix: always sort with a unique tiebreaker.",
      "Huge offsets on big tables: slow queries. Fix: switch to cursor pagination.",
      "Exposing raw DB internals in cursors. Fix: encode them (base64) and validate on decode.",
      "# Say this in the interview",
      "I support offset/limit for simple cases where users need page numbers, and cursor (keyset) pagination for large or fast-changing data because it uses an index with `WHERE id > cursor` and stays fast and consistent on deep pages. I always clamp the limit, use a stable ORDER BY with a unique tiebreaker, and return metadata like `nextCursor` and `hasMore`.",
      "Follow-up: why is OFFSET slow?",
      "  The database must scan and throw away all skipped rows, so OFFSET 1,000,000 reads a million rows.",
    ],
    code: `import express from 'express';
const app = express();

// Fake table: 50 posts sorted by id
const posts = Array.from({ length: 50 }, (_, i) => ({ id: i + 1, title: 'Post ' + (i + 1) }));

const encode = (id) => Buffer.from(String(id)).toString('base64url');
const decode = (c) => Number(Buffer.from(c, 'base64url').toString());

app.get('/posts', (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100); // default 20, max 100
  const afterId = req.query.cursor ? decode(req.query.cursor) : 0;

  // SQL equivalent: WHERE id > $1 ORDER BY id LIMIT $2 + 1
  const rows = posts.filter((p) => p.id > afterId).slice(0, limit + 1);
  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;

  res.json({
    data,
    hasMore,
    nextCursor: hasMore ? encode(data[data.length - 1].id) : null,
  });
});

app.listen(3000);
// GET /posts?limit=10           → ids 1..10, nextCursor "MTA"
// GET /posts?limit=10&cursor=MTA → ids 11..20`,
  },
  {
    id: 'http-module-server',
    group: 'Express & HTTP/APIs',
    stars: 3,
    difficulty: 'Easy',
    q: 'How do you create an HTTP server without a framework?',
    a: [
      "# ELI5",
      "Express is like a restaurant with a full staff: host, waiters, menu cards.",
      "The `http` module is like running a food stall by yourself: you take each order, figure out what was asked, cook it and hand it over.",
      "It is more work, but you see exactly how everything happens.",
      "In code: you write one function that receives every request and must decide what to send back.",
      "# What it is",
      "`node:http` is Node's built-in module for HTTP servers and clients; Express is built on top of it.",
      "`http.createServer(handler)` creates a server; `handler(req, res)` runs for every incoming request.",
      "`req` (an `IncomingMessage`) is a Readable stream with `method`, `url` and `headers`; the body arrives as stream chunks.",
      "`res` (a `ServerResponse`) is a Writable stream; you set status/headers and write the body.",
      "`server.listen(port)` makes the server start accepting connections on that port.",
      "# How it works",
      "Node's networking layer accepts a TCP connection and parses the HTTP request line and headers.",
      "It calls your handler with `req` and `res`.",
      "You route manually: look at `req.method` and the path from `new URL(req.url, 'http://localhost')`.",
      "To read a JSON body you collect chunks from `req` (it is a stream), join them, then `JSON.parse` — there is no `req.body` by default.",
      "You reply with `res.writeHead(status, headers)` then `res.end(body)`.",
      "If you never call `res.end()`, the client waits forever.",
      "# Example walkthrough",
      "`readJson` uses `for await` to collect the request body chunks and parses them.",
      "`GET /hello?name=Ann` reads the query string with `URL.searchParams` and returns `{\"msg\":\"Hello Ann\"}`.",
      "`POST /echo` returns the parsed body back.",
      "Anything else returns 404; invalid JSON is caught and returns 400.",
      "# Why it matters / when to use",
      "Understanding the raw `http` module shows what frameworks do for you: routing, body parsing, error handling.",
      "Useful for tiny services, health-check servers, proxies, or performance-critical code without framework overhead.",
      "For real APIs, frameworks (Express, Fastify, Hono, NestJS) save time and reduce bugs.",
      "# Common mistakes",
      "Expecting `req.body`: it does not exist in raw `http`. Fix: read the stream.",
      "Forgetting `res.end()`: request hangs. Fix: end every path.",
      "Not catching JSON parse errors: crashes the handler. Fix: try/catch and respond 400.",
      "Not limiting body size: a huge body can exhaust memory. Fix: count bytes and reject over a limit (413).",
      "# Say this in the interview",
      "I call `http.createServer` with a handler that receives `req` and `res` for every request, route on `req.method` and the parsed URL, read the body by consuming the request stream, and respond with `writeHead` and `end`. Frameworks like Express add routing, middleware and body parsing on top of exactly this.",
      "Follow-up: how do you make it HTTPS?",
      "  Use `node:https` with `createServer({ key, cert }, handler)`, though in production TLS is often terminated at a load balancer or reverse proxy.",
    ],
    code: `import http from 'node:http';

async function readJson(req) {
  let raw = '';
  for await (const chunk of req) raw += chunk; // body arrives as a stream
  return raw ? JSON.parse(raw) : {};
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const send = (status, data) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  try {
    if (req.method === 'GET' && url.pathname === '/hello') {
      return send(200, { msg: 'Hello ' + (url.searchParams.get('name') ?? 'world') });
    }
    if (req.method === 'POST' && url.pathname === '/echo') {
      return send(200, await readJson(req));
    }
    send(404, { error: 'Not found' });
  } catch {
    send(400, { error: 'Invalid JSON' });
  }
});

server.listen(3000, () => console.log('listening on 3000'));
// GET  /hello?name=Ann          → {"msg":"Hello Ann"}
// POST /echo  {"a":1}           → {"a":1}`,
  },
  {
    id: 'express-router',
    group: 'Express & HTTP/APIs',
    stars: 3,
    difficulty: 'Easy',
    q: 'How do you structure routes in a larger Express app?',
    a: [
      "# ELI5",
      "A big shopping mall has a main entrance, then separate sections: food court, clothes, electronics.",
      "Each section manages its own shops; the entrance only points you to the right section.",
      "`express.Router()` makes those sections: `app` is the entrance, and each router owns one area like `/users` or `/orders`.",
      "# What it is",
      "`express.Router()` creates a mini-app that has its own routes and middleware but no server of its own.",
      "You mount it at a path prefix with `app.use('/users', usersRouter)`; inside, paths are relative (`/` means `/users`, `/:id` means `/users/:id`).",
      "A layered structure separates responsibilities:",
      "  Routes — map URLs and methods to controllers.",
      "  Controllers — read the request, call services, send the response.",
      "  Services — business logic, no `req`/`res`, easy to test.",
      "  Repositories / models — database access.",
      "  Middleware — auth, validation, error handling.",
      "# How it works",
      "Each feature gets a file like `routes/users.js` that creates a router and defines its endpoints.",
      "You can apply middleware to the whole router: `router.use(requireAuth)`.",
      "The main `app.js` imports routers and mounts them, often under a version prefix like `/api/v1`.",
      "When a request comes in, Express matches the prefix, strips it, and runs the router's stack.",
      "Common folder layout: `src/routes`, `src/controllers`, `src/services`, `src/middleware`, `src/db`, plus `app.js` (builds the app) and `server.js` (calls `listen`).",
      "Splitting `app` from `server` lets tests import the app without opening a port.",
      "# Example walkthrough",
      "The snippet shows three files in one block for brevity.",
      "`usersService` holds logic; `usersRouter` maps `GET /` and `GET /:id` to it.",
      "`app.use('/api/v1/users', usersRouter)` makes the real URLs `/api/v1/users` and `/api/v1/users/1`.",
      "`mergeParams: true` is needed if a nested router must read params from its parent path.",
      "# Why it matters / when to use",
      "Keeps files small and focused, so teams can work on different features without conflicts.",
      "Makes testing easier: services can be unit-tested without HTTP.",
      "Allows mounting versions (`/api/v1`, `/api/v2`) and per-area middleware cleanly.",
      "# Common mistakes",
      "One giant `app.js` with hundreds of routes. Fix: split by feature with routers.",
      "Business logic inside route handlers. Fix: move it into services.",
      "Forgetting `mergeParams: true` on nested routers: `req.params.userId` is undefined. Fix: enable it.",
      "Writing full paths inside the router (`router.get('/users/:id')`) while also mounting at `/users`: gives `/users/users/:id`. Fix: use relative paths.",
      "# Say this in the interview",
      "I split routes by feature using `express.Router()` and mount each router under a prefix like `/api/v1/users`. Routers stay thin and call controllers and services that contain the business logic, and data access is in a separate layer. I also separate the app from the server listen call so tests can import the app.",
      "Follow-up: what about NestJS?",
      "  NestJS enforces this structure with modules, controllers and providers plus dependency injection.",
    ],
    code: `import express from 'express';

// --- services/users.js: business logic, no req/res
const db = [{ id: 1, name: 'Ann' }, { id: 2, name: 'Bob' }];
const usersService = {
  list: () => db,
  get: (id) => db.find((u) => u.id === id),
};

// --- routes/users.js: thin HTTP layer
const usersRouter = express.Router();
usersRouter.get('/', (req, res) => res.json(usersService.list()));
usersRouter.get('/:id', (req, res) => {
  const user = usersService.get(Number(req.params.id));
  user ? res.json(user) : res.status(404).json({ error: 'Not found' });
});

// --- app.js: mount routers under prefixes
export const app = express();
app.use(express.json());
app.use('/api/v1/users', usersRouter);

// --- server.js: only this file listens
app.listen(3000);
// GET /api/v1/users   → [{"id":1,...},{"id":2,...}]
// GET /api/v1/users/2 → {"id":2,"name":"Bob"}`,
  },
  {
    id: 'rest-vs-graphql',
    group: 'Express & HTTP/APIs',
    stars: 3,
    difficulty: 'Medium',
    q: 'REST vs GraphQL — when would you choose each?',
    a: [
      "# ELI5",
      "REST is like a set menu at a restaurant: each dish (endpoint) comes with fixed items, even ones you do not want.",
      "GraphQL is like a buffet where you write exactly what you want on your plate in one trip.",
      "The buffet is flexible, but the kitchen has to work harder to support any combination.",
      "In code: REST has many URLs with fixed responses; GraphQL has one URL where the client sends a query describing exactly which fields it needs.",
      "# What it is",
      "REST: resources at URLs (`/users/1`, `/users/1/posts`) using HTTP methods; the server decides the response shape.",
      "GraphQL: a query language and runtime (created by Facebook) with a typed schema; clients send queries to a single endpoint (usually `POST /graphql`).",
      "Schema — a typed description of all data and operations (`type User { id: ID!, name: String }`).",
      "Resolver — a function that fetches the data for one field in the schema.",
      "Over-fetching — getting more data than you need; under-fetching — needing several requests to get all you need.",
      "Comparison:",
      "  Endpoints: REST many; GraphQL one.",
      "  Response shape: REST server-defined; GraphQL client-defined.",
      "  Fetching: REST may over/under-fetch; GraphQL gets exactly the requested fields in one round trip.",
      "  HTTP caching: REST easy (GET + URL + CDN); GraphQL harder (needs client caches like Apollo or persisted queries).",
      "  Errors: REST uses status codes; GraphQL usually returns 200 with an `errors` array.",
      "  Typing/docs: REST via OpenAPI; GraphQL schema is built-in and introspectable.",
      "  Complexity: REST simple; GraphQL needs N+1 protection (DataLoader), query depth/cost limits.",
      "# How it works",
      "REST: client calls `GET /users/1`, then `GET /users/1/posts`; server returns full objects.",
      "GraphQL: client sends `{ user(id: 1) { name posts { title } } }`.",
      "  The server validates the query against the schema.",
      "  It calls resolvers for each field: `user`, then `posts` for that user.",
      "  It returns JSON matching the query's exact shape.",
      "# Example walkthrough",
      "The snippet shows the same data via REST (two calls) and GraphQL (one query) using the `graphql` package's `graphql()` function.",
      "The GraphQL result contains only `name` and post `title`s, nothing else.",
      "# Why it matters / when to use",
      "Choose REST for: public APIs, simple CRUD, heavy HTTP/CDN caching, file uploads, teams new to APIs.",
      "Choose GraphQL for: many different clients (web, mobile) needing different shapes, deeply related data, aggregating many microservices behind one gateway, fast-moving frontends.",
      "Many companies use both: REST for public/simple endpoints, GraphQL as a backend-for-frontend layer.",
      "# Common mistakes",
      "Choosing GraphQL just because it is trendy, for a simple CRUD app. Fix: start with REST unless you have the problems GraphQL solves.",
      "Ignoring the N+1 problem in resolvers. Fix: use DataLoader to batch queries.",
      "No query depth/cost limits: malicious deep queries can overload the server. Fix: add limits and timeouts.",
      "# Say this in the interview",
      "REST exposes resources at multiple URLs with server-defined responses and works great with HTTP caching; GraphQL exposes one typed endpoint where the client asks for exactly the fields it needs, which avoids over- and under-fetching. I pick REST for simple or public APIs and GraphQL when multiple clients need flexible, nested data, keeping in mind it needs batching with DataLoader, query cost limits, and a different caching strategy.",
      "Follow-up: how do you cache GraphQL?",
      "  Client-side normalized caches (Apollo, urql), persisted queries over GET for CDN caching, and server-side resolver caching.",
    ],
    code: `import { graphql, buildSchema } from 'graphql';

const users = [{ id: 1, name: 'Ann', email: 'ann@x.com' }];
const posts = [{ id: 10, userId: 1, title: 'Hello', body: 'long text...' }];

// REST: two requests, full objects (over-fetching email/body)
// GET /users/1        → {"id":1,"name":"Ann","email":"ann@x.com"}
// GET /users/1/posts  → [{"id":10,"userId":1,"title":"Hello","body":"..."}]

// GraphQL: one typed schema + one query
const schema = buildSchema(\`
  type Post { id: ID!, title: String, body: String }
  type User { id: ID!, name: String, email: String, posts: [Post] }
  type Query { user(id: ID!): User }
\`);

const rootValue = {
  user: ({ id }) => {
    const u = users.find((x) => x.id === Number(id));
    return u && { ...u, posts: () => posts.filter((p) => p.userId === u.id) };
  },
};

const result = await graphql({
  schema,
  rootValue,
  source: '{ user(id: 1) { name posts { title } } }',
});
console.log(JSON.stringify(result.data));
// → {"user":{"name":"Ann","posts":[{"title":"Hello"}]}}`,
  },
  {
    id: 'websockets',
    group: 'Express & HTTP/APIs',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do you implement real-time communication in Node?',
    a: [
      "# ELI5",
      "Normal HTTP is like sending letters: you write, wait for a reply, and the post office closes the conversation each time.",
      "A WebSocket is like a phone call: once connected, both sides can talk whenever they want without redialing.",
      "Real-time apps (chat, live scores) need the phone call, not letters.",
      "# What it is",
      "Real-time communication — the server can push data to the client the moment something happens, without the client asking.",
      "Options in Node:",
      "  WebSockets — a full-duplex (both directions at once) persistent connection over a single TCP socket. Libraries: `ws` (low-level), Socket.IO (adds rooms, reconnection, fallbacks).",
      "  Server-Sent Events (SSE) — a one-way stream from server to client over normal HTTP using `Content-Type: text/event-stream`; browsers reconnect automatically.",
      "  Long polling — the client sends a request and the server holds it open until there is news; an older fallback.",
      "Node 22+ also has a built-in global `WebSocket` client, but servers still use `ws` or Socket.IO.",
      "Comparison:",
      "  Direction: WebSocket two-way; SSE server-to-client only.",
      "  Protocol: WebSocket upgrades from HTTP to `ws://`/`wss://`; SSE is plain HTTP.",
      "  Use: WebSocket for chat, games, collaborative editing; SSE for notifications, live feeds, AI token streaming.",
      "# How it works",
      "WebSocket handshake:",
      "  Client sends an HTTP request with `Upgrade: websocket` and a key header.",
      "  Server replies `101 Switching Protocols`; the TCP connection now speaks the WebSocket protocol.",
      "  Both sides send messages (frames) any time until one closes.",
      "Node fits well because the event loop can hold thousands of idle connections cheaply — each one is just a socket, not a thread.",
      "Scaling to many servers:",
      "  A client is connected to one instance, so to broadcast across instances use a pub/sub layer (Redis pub/sub, Socket.IO Redis adapter).",
      "  Load balancers need WebSocket support and often sticky sessions for Socket.IO fallbacks.",
      "Heartbeats (ping/pong) detect dead connections that never closed cleanly.",
      "# Example walkthrough",
      "A `WebSocketServer` from `ws` listens on port 8080.",
      "On each `connection`, we greet the client and mark it alive.",
      "When any client sends a message, we broadcast it to every open client — a minimal chat room.",
      "A 30-second interval pings clients and terminates those that did not answer the previous ping.",
      "# Why it matters / when to use",
      "Chat, notifications, live dashboards, multiplayer games, collaborative docs, stock tickers, delivery tracking.",
      "Use SSE when you only need server-to-client updates; it is simpler and works through most proxies.",
      "# Common mistakes",
      "Storing connections in memory and expecting broadcasts to reach users on other servers. Fix: Redis pub/sub or an adapter.",
      "No authentication on the connection. Fix: verify a token during the upgrade request or in the first message.",
      "No heartbeat: dead sockets pile up and leak memory. Fix: ping/pong and terminate stale clients.",
      "Sending to sockets that are not open. Fix: check `readyState === WebSocket.OPEN`.",
      "# Say this in the interview",
      "For two-way real-time features I use WebSockets via `ws` or Socket.IO; the connection starts as HTTP and upgrades, then both sides can push messages. For one-way updates I prefer Server-Sent Events. Node handles many idle connections well, and to scale horizontally I use Redis pub/sub so messages reach clients on every instance, plus heartbeats and auth on connect.",
      "Follow-up: what does Socket.IO add over raw WebSockets?",
      "  Automatic reconnection, rooms/namespaces, acknowledgements, and an HTTP long-polling fallback; it uses its own protocol, so plain WebSocket clients cannot talk to it.",
    ],
    code: `import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (socket) => {
  socket.isAlive = true;
  socket.on('pong', () => (socket.isAlive = true));
  socket.send('welcome!'); // client sees: welcome!

  socket.on('message', (data) => {
    // broadcast to every connected client
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) client.send(data.toString());
    }
  });
});

// Heartbeat: drop connections that stopped answering
setInterval(() => {
  for (const s of wss.clients) {
    if (!s.isAlive) { s.terminate(); continue; }
    s.isAlive = false;
    s.ping();
  }
}, 30_000);

// Browser: const ws = new WebSocket('ws://localhost:8080');
//          ws.onmessage = (e) => console.log(e.data); ws.send('hi');
// → every connected tab logs: hi`,
  },
  {
    id: 'api-versioning',
    group: 'Express & HTTP/APIs',
    stars: 2,
    difficulty: 'Easy',
    q: 'How do you version an API?',
    a: [
      "# ELI5",
      "A phone charger company changes its plug shape. If they just swap it, everyone's old phones stop charging.",
      "Instead they sell the new plug as 'version 2' and keep making the old one for a while.",
      "API versioning is the same: you release breaking changes as a new version while old clients keep working on the old one.",
      "# What it is",
      "API versioning — a way to change your API without breaking existing clients (mobile apps, partners) that rely on the old behaviour.",
      "Breaking change — anything that can break an existing client: removing or renaming a field, changing a type, changing required parameters.",
      "Non-breaking change — adding an optional field or a new endpoint; usually does not need a new version.",
      "Common strategies:",
      "  URL path: `/api/v1/users` vs `/api/v2/users` — most common, very visible, easy to route and cache.",
      "  Header: `Accept: application/vnd.myapp.v2+json` or a custom `API-Version: 2` — cleaner URLs, harder to test in a browser.",
      "  Query param: `/users?version=2` — simple but less clean.",
      "  Date-based: Stripe-style `Stripe-Version: 2024-06-20` pinned per account.",
      "# How it works",
      "Decide a strategy (usually the URL path).",
      "Keep each version in its own router or controller set, sharing the services underneath where possible.",
      "Mount them: `app.use('/api/v1', v1Router)` and `app.use('/api/v2', v2Router)`.",
      "Announce deprecations: docs, changelog, and response headers like `Deprecation` and `Sunset` with a retirement date.",
      "Monitor traffic on old versions and remove them after the sunset date.",
      "# Example walkthrough",
      "v1 returns `{ name: 'Ann Lee' }`, v2 splits it into `firstName` and `lastName` — a breaking change.",
      "Both routers are mounted, so old clients keep calling `/api/v1/users/1` and new clients use `/api/v2`.",
      "v1 responses carry `Deprecation` and `Sunset` headers to warn clients.",
      "# Why it matters / when to use",
      "Mobile apps cannot be force-updated instantly; old versions stay in use for months.",
      "Partners and third parties integrate once and expect stability.",
      "# Common mistakes",
      "Making breaking changes without a version bump. Fix: treat the API as a contract.",
      "Creating a new version for every small change. Fix: only for breaking changes; add fields compatibly.",
      "Copy-pasting all logic per version. Fix: share services, only adapt the request/response shapes.",
      "Never retiring old versions. Fix: publish a sunset policy.",
      "# Say this in the interview",
      "I version only for breaking changes, usually with a URL prefix like `/api/v1` because it is explicit and easy to route, cache and debug. Each version has its own routers but shares the service layer, and I deprecate old versions with documentation and `Deprecation`/`Sunset` headers before removing them.",
      "Follow-up: how do you avoid versioning at all?",
      "  Additive, backward-compatible changes: new optional fields, new endpoints, never removing or renaming existing ones.",
    ],
    code: `import express from 'express';
const app = express();
const user = { first: 'Ann', last: 'Lee' };

// v1: old shape, marked deprecated
const v1 = express.Router();
v1.use((req, res, next) => {
  res.set('Deprecation', 'true');
  res.set('Sunset', 'Wed, 31 Dec 2026 23:59:59 GMT');
  next();
});
v1.get('/users/1', (req, res) => res.json({ name: user.first + ' ' + user.last }));

// v2: breaking change → new version
const v2 = express.Router();
v2.get('/users/1', (req, res) => res.json({ firstName: user.first, lastName: user.last }));

app.use('/api/v1', v1);
app.use('/api/v2', v2);
app.listen(3000);
// GET /api/v1/users/1 → {"name":"Ann Lee"} + Deprecation/Sunset headers
// GET /api/v2/users/1 → {"firstName":"Ann","lastName":"Lee"}`,
  },
  {
    id: 'app-use-vs-app-get',
    group: 'Express & HTTP/APIs',
    stars: 2,
    difficulty: 'Easy',
    q: 'What is the difference between `app.use` and `app.get` in Express?',
    a: [
      "# ELI5",
      "`app.use('/shop')` is like a security guard at the mall entrance for the whole shop area: everyone going anywhere inside `/shop`, by any door, passes them.",
      "`app.get('/shop/toys')` is like a specific shop counter that only serves people who walk up to that exact counter and ask to look (GET).",
      "So `use` = broad, any method, any sub-path; `get` = exact path, only GET requests.",
      "# What it is",
      "`app.use([path], fn)` registers middleware:",
      "  matches every HTTP method (GET, POST, PUT...);",
      "  matches the path as a prefix: `/api` matches `/api`, `/api/users`, `/api/x/y`;",
      "  path is optional and defaults to `/`, meaning every request;",
      "  inside, `req.url` has the mount prefix stripped (the original is in `req.originalUrl`).",
      "`app.get(path, fn)` registers a route handler:",
      "  matches only GET (and HEAD) requests;",
      "  matches the full path exactly (with params like `/users/:id`), not as a prefix.",
      "There are similar methods: `app.post`, `app.put`, `app.patch`, `app.delete`, and `app.all` (any method, exact path).",
      "Note: `app.get('setting')` with a single argument is a different thing — it reads an app setting.",
      "# How it works",
      "Both add entries to the same ordered stack.",
      "For each request, Express checks entries in order:",
      "  a `use` entry matches if the request path starts with its path at a segment boundary;",
      "  a `get` entry matches if the method is GET/HEAD and the path matches the pattern fully.",
      "Matching functions run until one responds.",
      "# Example walkthrough",
      "`app.use('/api', ...)` logs every request under `/api` regardless of method, then calls `next()`.",
      "`app.get('/api/users', ...)` only answers GET `/api/users`.",
      "POST `/api/users` is logged by the `use` middleware but does not match the `get` route, so it ends with a 404.",
      "GET `/api/users/extra` is also logged but not matched by `get`, because `get` needs an exact path.",
      "# Why it matters / when to use",
      "Use `app.use` for middleware and for mounting routers: logging, auth for a path area, body parsers, static files.",
      "Use `app.get`/`post`/etc. for actual endpoints that return data.",
      "# Common mistakes",
      "Using `app.use('/users', handler)` as an endpoint: it then also answers POST, DELETE and `/users/anything`. Fix: use the specific method.",
      "Expecting `req.url` inside `use` to include the mount path. Fix: use `req.originalUrl` or `req.baseUrl`.",
      "# Say this in the interview",
      "`app.use` mounts middleware or routers: it matches any HTTP method and treats the path as a prefix, so it's for cross-cutting logic. `app.get` defines a route handler that matches only GET requests on an exact path pattern. Both live in the same ordered stack, so registration order matters.",
      "Follow-up: what does `app.all` do?",
      "  It matches every method like `use`, but on an exact path like `get`.",
    ],
    code: `import express from 'express';
const app = express();

// Prefix match, any method
app.use('/api', (req, res, next) => {
  console.log('[api]', req.method, req.originalUrl, '→ inside req.url =', req.url);
  next();
});

// Exact path, GET only
app.get('/api/users', (req, res) => res.json(['Ann', 'Bob']));

app.listen(3000);
// GET  /api/users       → logs "[api] GET /api/users → inside req.url = /users", 200 ["Ann","Bob"]
// POST /api/users       → logged, then 404 (no POST route)
// GET  /api/users/extra → logged, then 404 (get needs exact path)`,
  },
  // ───────────────────────── Security & Auth ─────────────────────────
  {
    id: 'jwt-auth',
    group: 'Security & Auth',
    stars: 5,
    difficulty: 'Medium',
    q: 'How does JWT authentication work?',
    a: [
      "# ELI5",
      "At a theme park, you show your ID once at the gate and get a wristband stamped with the park's special seal.",
      "Every ride operator just checks the seal on your wristband; they do not need to call the gate to ask who you are.",
      "Anyone can read what is written on the wristband, but nobody can fake the seal, and it expires at closing time.",
      "In code: after login the server gives you a signed token (JWT); you send it with each request and the server only verifies the signature.",
      "# What it is",
      "Authentication — proving who you are (login). Authorization — deciding what you are allowed to do.",
      "JWT (JSON Web Token, pronounced 'jot') is a compact string with three base64url-encoded parts separated by dots: `header.payload.signature`.",
      "  Header — the algorithm used, e.g. `{ alg: 'HS256', typ: 'JWT' }`.",
      "  Payload — claims, i.e. facts about the user: `sub` (subject / user id), `role`, `iat` (issued at), `exp` (expiry time).",
      "  Signature — a cryptographic stamp made from header + payload + a secret key, so any change is detectable.",
      "Base64url encoding is NOT encryption: anyone can decode and read the payload, so never put secrets or passwords in it.",
      "Signing algorithms:",
      "  HS256 — one shared secret both signs and verifies (good for a single service).",
      "  RS256 / ES256 — a private key signs, a public key verifies (good when many services verify tokens, e.g. via a JWKS URL).",
      "Stateless — the server does not store sessions; everything needed is in the token.",
      "# How it works",
      "Login:",
      "  The client sends email + password.",
      "  The server checks the password hash in the DB.",
      "  It creates a JWT with `sub`, `role`, and a short `exp` (e.g. 15 minutes), signs it, and returns it.",
      "Each request:",
      "  The client sends `Authorization: Bearer <token>`.",
      "  Middleware verifies the signature and expiry with the key, and checks the expected algorithm, issuer and audience.",
      "  If valid, it puts the payload on `req.user`; if not, it responds 401.",
      "Refresh tokens:",
      "  Access tokens are short-lived; a long-lived refresh token (stored in an `httpOnly` cookie and in the DB) gets new access tokens.",
      "  Refresh tokens are rotated on each use and can be revoked in the DB, which handles logout.",
      "# Example walkthrough",
      "`/login` checks credentials (simplified) and signs a token with `jwt.sign(payload, SECRET, { expiresIn: '15m' })`.",
      "`auth` middleware reads the Bearer header and calls `jwt.verify` with `algorithms: ['HS256']`; a bad or expired token throws and we return 401.",
      "`/profile` returns the decoded payload, e.g. `{ sub: '1', role: 'admin', iat, exp }`.",
      "# Why it matters / when to use",
      "Great for APIs consumed by mobile apps, SPAs and microservices where each service can verify tokens without a shared session store.",
      "Scales horizontally: no session lookup per request.",
      "# Common mistakes",
      "Long-lived tokens with no revocation: a stolen token works for days. Fix: short `exp` + refresh token rotation, or a denylist for critical cases.",
      "Storing tokens in `localStorage`: readable by any XSS script. Fix: prefer `httpOnly`, `Secure`, `SameSite` cookies, or keep access tokens in memory.",
      "Not pinning the algorithm: classic `alg: none` or algorithm-confusion attacks. Fix: pass `algorithms` to `verify`.",
      "Putting sensitive data in the payload. Fix: only ids and roles; it is readable by anyone.",
      "Using `jwt.decode` instead of `jwt.verify`: decode does not check the signature. Fix: always verify.",
      "# Say this in the interview",
      "A JWT is a signed token with a header, payload and signature. After login the server signs claims like user id, role and expiry; the client sends it as a Bearer token and the server verifies the signature and expiry on each request without any session lookup. I keep access tokens short-lived, use rotating refresh tokens in httpOnly cookies for renewal and revocation, pin the algorithm, and never put secrets in the payload.",
      "Follow-up: how do you log out a JWT user?",
      "  Delete/revoke the refresh token server-side and let the short access token expire; for instant revocation keep a denylist of token ids (`jti`).",
      "Follow-up: HS256 vs RS256?",
      "  HS256 uses one shared secret; RS256 uses a private key to sign and a public key to verify, so other services can verify without being able to create tokens.",
    ],
    code: `import express from 'express';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET ?? 'dev-only-secret';
const app = express();
app.use(express.json());

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  // real app: look up user, bcrypt.compare(password, user.hash)
  if (email !== 'ann@x.com' || password !== 'pw') return res.status(401).json({ error: 'Bad credentials' });
  const token = jwt.sign({ sub: '1', role: 'admin' }, SECRET, { expiresIn: '15m' });
  res.json({ token }); // → { token: "eyJhbGciOi..." }
});

function auth(req, res, next) {
  const [scheme, token] = (req.headers.authorization ?? '').split(' ');
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ error: 'Missing token' });
  try {
    req.user = jwt.verify(token, SECRET, { algorithms: ['HS256'] }); // checks signature + exp
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

app.get('/profile', auth, (req, res) => res.json(req.user));
// → {"sub":"1","role":"admin","iat":1730000000,"exp":1730000900}

app.listen(3000);`,
  },
  {
    id: 'session-vs-jwt',
    group: 'Security & Auth',
    stars: 5,
    difficulty: 'Medium',
    q: 'Session-based auth vs token-based (JWT) auth — trade-offs?',
    a: [
      "# ELI5",
      "Session auth is like a coat check: you get a numbered ticket, and the staff keep your coat (your info) in the back. They look up the number each time.",
      "JWT auth is like a festival wristband: all your info is printed on it and sealed, so staff just read the band without checking a back room.",
      "The coat check can cancel your ticket instantly; the wristband stays valid until it expires.",
      "# What it is",
      "Session-based auth: after login the server creates a session record (in memory, Redis or a DB) and sends the browser a random session id in a cookie.",
      "  Cookie — a small piece of data the browser stores and automatically sends back with every request to that site.",
      "  Stateful — the server must store and look up session data.",
      "Token-based (JWT) auth: after login the server sends a signed token containing user info; the server verifies the signature without storing anything.",
      "  Stateless — no server-side lookup needed per request.",
      "Comparison:",
      "  Where state lives: session = server store; JWT = inside the token.",
      "  Revocation / logout: session = delete the record, instant; JWT = hard until expiry (need short expiry, refresh tokens or a denylist).",
      "  Scaling: session needs a shared store like Redis across servers; JWT verifies anywhere with the key.",
      "  Per-request cost: session = one store lookup; JWT = a signature check (CPU only).",
      "  Size: session cookie is tiny; JWT can be large and is sent on every request.",
      "  Clients: sessions fit browser apps on the same domain; JWTs fit mobile apps, third-party APIs and microservices.",
      "  CSRF risk: cookie-based sessions are sent automatically, so need `SameSite` cookies or CSRF tokens; Bearer tokens in headers are not sent automatically.",
      "  XSS risk: `httpOnly` cookies cannot be read by JS; JWT in `localStorage` can be stolen by XSS.",
      "# How it works",
      "Session flow:",
      "  Login → server stores `{ userId }` under random id `abc123` in Redis → `Set-Cookie: sid=abc123; HttpOnly; Secure; SameSite=Lax`.",
      "  Each request → browser sends the cookie → server loads the session from Redis → `req.session.userId`.",
      "  Logout → server deletes `abc123` → instantly invalid everywhere.",
      "JWT flow:",
      "  Login → server signs `{ sub, role, exp }` → client stores it and sends `Authorization: Bearer ...`.",
      "  Each request → server verifies the signature, no DB call.",
      "  Logout → client discards it; server revokes the refresh token; the access token lives until `exp`.",
      "# Example walkthrough",
      "The snippet uses `express-session` with a Redis store (`connect-redis`), so any server instance can read the session.",
      "Login sets `req.session.userId`; `/me` reads it; `/logout` calls `req.session.destroy()` to revoke immediately.",
      "Cookie flags `httpOnly`, `secure`, `sameSite: 'lax'` protect against XSS theft and most CSRF.",
      "# Why it matters / when to use",
      "Choose sessions for classic server-rendered or same-site web apps where instant logout and simple security matter.",
      "Choose JWT for mobile apps, cross-domain APIs, and microservices that need to verify identity without a shared store.",
      "A common hybrid: short-lived JWT access token + server-stored refresh token in an httpOnly cookie.",
      "# Common mistakes",
      "Saying JWT is always more secure or always better: it trades revocation for statelessness.",
      "Using in-memory sessions with multiple servers: users get logged out randomly. Fix: Redis or DB store.",
      "Storing JWTs in localStorage without considering XSS. Fix: httpOnly cookies or in-memory storage.",
      "Forgetting CSRF protection with cookies. Fix: `SameSite=Lax/Strict` and CSRF tokens for sensitive forms.",
      "# Say this in the interview",
      "Sessions are stateful: the server stores the session and the client holds an opaque id in an httpOnly cookie, so revocation is instant but every request needs a store lookup and scaling needs a shared store like Redis. JWTs are stateless: the token carries signed claims so any service can verify it, which scales well, but revoking is hard, so I use short expiry and refresh tokens. For a same-site web app I lean to sessions; for mobile or microservices, JWT.",
      "Follow-up: can you store a JWT in a cookie?",
      "  Yes, and it is often the best option: httpOnly, Secure, SameSite cookie, which avoids XSS theft but then needs CSRF consideration.",
    ],
    code: `import express from 'express';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { createClient } from 'redis';

const redis = createClient({ url: 'redis://localhost:6379' });
await redis.connect();

const app = express();
app.use(express.json());
app.use(session({
  store: new RedisStore({ client: redis }), // shared by every server instance
  secret: process.env.SESSION_SECRET ?? 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 3600_000 },
}));

app.post('/login', (req, res) => {
  req.session.userId = 1;          // stored in Redis, browser gets only sid cookie
  res.json({ ok: true });
});
app.get('/me', (req, res) => {
  if (!req.session.userId) return res.status(401).end();
  res.json({ userId: req.session.userId }); // → {"userId":1}
});
app.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true })); // revoked instantly
});

app.listen(3000);`,
  },
  {
    id: 'common-vulnerabilities',
    group: 'Security & Auth',
    stars: 4,
    difficulty: 'Medium',
    q: 'What are common security vulnerabilities in Node apps and how do you prevent them?',
    a: [
      "# ELI5",
      "A house can be broken into in many ways: an unlocked door, a fake delivery person, a window left open, a spare key under the mat.",
      "Web apps have the same: bad input sneaking in, fake requests, open settings, leaked keys.",
      "Security means locking every one of these entry points, not just the front door.",
      "# What it is",
      "The OWASP Top 10 is a well-known list of the most critical web app risks; the common ones for Node are:",
      "  Injection (SQL/NoSQL/command) — user input is treated as code. Prevent with parameterized queries, input validation, and `execFile` instead of `exec`.",
      "  XSS (Cross-Site Scripting) — attacker-controlled script runs in other users' browsers. Prevent by escaping output, using templating that auto-escapes, Content-Security-Policy (CSP) headers, and sanitizing HTML.",
      "  CSRF (Cross-Site Request Forgery) — another site tricks a logged-in user's browser into sending a request. Prevent with `SameSite` cookies and CSRF tokens.",
      "  Broken authentication / access control — weak passwords, missing ownership checks (IDOR: changing `/orders/5` to `/orders/6`). Prevent with proper hashing, MFA, and checking that the resource belongs to the user.",
      "  Sensitive data exposure — secrets in code, stack traces in responses, HTTP instead of HTTPS. Prevent with env/secret managers, generic error messages, TLS.",
      "  Vulnerable dependencies — npm packages with known bugs or malicious code. Prevent with `npm audit`, Dependabot/Renovate, lockfiles, and `npm ci`.",
      "  ReDoS (Regular expression Denial of Service) — a slow regex on crafted input blocks the single-threaded event loop. Prevent with safe regexes and input length limits.",
      "  Prototype pollution — input with `__proto__` keys modifies every object. Prevent with schema validation and safe merges.",
      "  Path traversal — `../../etc/passwd` in a filename. Prevent by resolving paths and checking they stay inside an allowed directory.",
      "  SSRF (Server-Side Request Forgery) — the server is tricked into fetching internal URLs. Prevent with URL allowlists.",
      "  DoS via large payloads or too many requests. Prevent with body size limits and rate limiting.",
      "# How it works",
      "Defence in depth — several independent layers so one failure is not fatal:",
      "  Validate all input at the edge (Zod, Joi).",
      "  Use safe APIs (parameterized queries, `execFile`, `path.resolve` checks).",
      "  Add security headers (Helmet) and HTTPS.",
      "  Enforce authN/authZ on every route, including ownership checks.",
      "  Rate limit and limit body size.",
      "  Keep dependencies updated and audited in CI.",
      "  Log security events and never leak internals in errors.",
      "# Example walkthrough",
      "The snippet shows four fixes: Helmet headers, a 100 KB JSON body limit, a path traversal guard, and an ownership check that prevents IDOR.",
      "Requesting `/files/..%2F..%2Fetc%2Fpasswd` resolves outside `uploads` and returns 400.",
      "User 1 requesting order 2 (owned by user 2) gets 404 instead of the data.",
      "# Why it matters / when to use",
      "A single breach can leak user data, cost money and reputation, and break laws like GDPR.",
      "Interviewers expect backend developers to know these by name and the fix for each.",
      "# Common mistakes",
      "Trusting the frontend to validate. Fix: always validate on the server.",
      "Only checking authentication, not authorization (ownership). Fix: filter queries by `userId`.",
      "Using `child_process.exec` with user input. Fix: `execFile`/`spawn` with an argument array.",
      "Ignoring `npm audit` warnings for months. Fix: automate dependency updates.",
      "# Say this in the interview",
      "The big ones are injection, XSS, CSRF, broken access control like IDOR, sensitive data exposure, vulnerable dependencies, and Node-specific ones like ReDoS and prototype pollution. I defend in layers: validate input with a schema, use parameterized queries, set security headers with Helmet, use httpOnly SameSite cookies, check ownership on every resource, rate limit, cap body size, and audit dependencies in CI.",
      "Follow-up: why is ReDoS worse in Node?",
      "  Regex runs on the single main thread, so one slow match blocks every other request.",
    ],
    code: `import express from 'express';
import helmet from 'helmet';
import path from 'node:path';

const app = express();
app.use(helmet());                         // security headers (CSP, HSTS, etc.)
app.use(express.json({ limit: '100kb' })); // reject huge bodies → 413

// Path traversal guard
const UPLOADS = path.resolve('uploads');
app.get('/files/:name', (req, res) => {
  const full = path.resolve(UPLOADS, req.params.name);
  if (!full.startsWith(UPLOADS + path.sep)) return res.status(400).end(); // ../../ blocked
  res.sendFile(full);
});

// Broken access control (IDOR) guard: always scope by owner
const orders = [{ id: 1, userId: 1 }, { id: 2, userId: 2 }];
app.get('/orders/:id', (req, res) => {
  const userId = 1; // from verified auth token in a real app
  const order = orders.find((o) => o.id === Number(req.params.id) && o.userId === userId);
  if (!order) return res.status(404).end(); // order 2 → 404, not leaked
  res.json(order);
});

app.listen(3000);`,
  },
  {
    id: 'password-hashing',
    group: 'Security & Auth',
    stars: 4,
    difficulty: 'Easy',
    q: 'How should passwords be stored?',
    a: [
      "# ELI5",
      "Imagine turning each password into a smoothie: easy to make, impossible to turn back into the original fruit.",
      "To check a login you make a new smoothie from what the user typed and see if it tastes exactly the same.",
      "A good password smoothie machine is deliberately slow, so a thief with stolen smoothies cannot try billions of fruits quickly.",
      "In code: store a slow, salted one-way hash, never the password itself.",
      "# What it is",
      "Hashing — a one-way function that turns input into a fixed-length string; you cannot reverse it.",
      "Encryption is different: it is reversible with a key, so it is NOT right for passwords.",
      "Salt — a random value unique to each user, mixed in before hashing, so the same password gives different hashes and precomputed 'rainbow tables' are useless.",
      "Cost / work factor — a setting that makes hashing intentionally slow (e.g. 100 ms), so brute-force guessing is expensive.",
      "Recommended algorithms: Argon2id (best current choice), bcrypt (cost 12+ is widely used), scrypt (built into Node's `crypto`).",
      "Never use fast hashes like MD5, SHA-1 or plain SHA-256 for passwords: GPUs can try billions per second.",
      "Pepper — an optional extra secret stored outside the DB (e.g. in a secret manager) added to every password.",
      "# How it works",
      "Signup:",
      "  Generate a random salt (libraries do this automatically).",
      "  Run the slow hash with the salt and cost.",
      "  Store the result string; bcrypt/argon2 strings contain the algorithm, cost and salt, e.g. `$2b$12$...`.",
      "Login:",
      "  Load the stored hash for that email.",
      "  Call `verify`/`compare`, which re-hashes the typed password with the same salt and cost and compares in constant time (so timing does not leak information).",
      "  Return the same generic error for unknown email or wrong password, to avoid revealing which emails exist.",
      "Raise the cost over time as hardware gets faster, re-hashing on next successful login.",
      "# Example walkthrough",
      "The snippet uses only Node's built-in `crypto.scrypt`, so it runs without extra packages.",
      "`hashPassword` creates a 16-byte random salt, derives a 64-byte key, and stores `salt:hash` in hex.",
      "`verifyPassword` splits the stored value, re-derives with the same salt, and compares with `timingSafeEqual`.",
      "Correct password prints `true`; wrong prints `false`.",
      "# Why it matters / when to use",
      "Databases get leaked; proper hashing means attackers still cannot easily recover passwords, which people reuse on other sites.",
      "It is a legal and compliance expectation (GDPR, PCI, SOC 2).",
      "# Common mistakes",
      "Storing plain text or encrypted passwords. Fix: slow salted hash.",
      "Using SHA-256 alone. Fix: Argon2id, bcrypt or scrypt.",
      "Comparing hashes with `===`: can leak timing info. Fix: library `compare` or `crypto.timingSafeEqual`.",
      "Logging request bodies that contain passwords. Fix: redact sensitive fields in logs.",
      "bcrypt silently truncates input over 72 bytes. Fix: be aware, or prefer Argon2id.",
      "# Say this in the interview",
      "Passwords should never be stored in plain text or encrypted; I store a slow, salted, one-way hash using Argon2id or bcrypt with a suitable cost factor. On login I use the library's verify function, which compares in constant time, and I return a generic error message. I also add rate limiting on login and never log passwords.",
      "Follow-up: why is slow good here?",
      "  A legit login hashes once (~100 ms is fine), but an attacker needs billions of attempts, which becomes impractically expensive.",
    ],
    code: `import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16);                       // unique per user
  const hash = await scryptAsync(password, salt, 64); // slow, memory-hard
  return salt.toString('hex') + ':' + hash.toString('hex');
}

async function verifyPassword(password, stored) {
  const [saltHex, hashHex] = stored.split(':');
  const expected = Buffer.from(hashHex, 'hex');
  const actual = await scryptAsync(password, Buffer.from(saltHex, 'hex'), 64);
  return timingSafeEqual(expected, actual); // constant-time compare
}

const stored = await hashPassword('s3cret!');
console.log(stored.slice(0, 20) + '...');           // → e.g. 9f2c1a...:4b7e... (random)
console.log(await verifyPassword('s3cret!', stored)); // → true
console.log(await verifyPassword('wrong', stored));   // → false

// With a library: await argon2.hash(pw); await argon2.verify(hash, pw);`,
  },
  {
    id: 'rate-limiting',
    group: 'Security & Auth',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do you implement rate limiting?',
    a: [
      "# ELI5",
      "A sweet shop lets each kid take at most 5 candies per minute. If a kid comes back for a 6th, the shopkeeper says 'wait a bit'.",
      "This stops one greedy kid from emptying the jar so others get none.",
      "Rate limiting is that rule for your API: each client can make only N requests per time window.",
      "# What it is",
      "Rate limiting — restricting how many requests a client (identified by IP, user id or API key) can make in a period of time.",
      "When exceeded, the server responds `429 Too Many Requests`, ideally with a `Retry-After` header saying when to try again.",
      "Algorithms:",
      "  Fixed window — count requests per clock window (e.g. per minute). Simple, but allows bursts at window edges.",
      "  Sliding window — counts over the last N seconds continuously; smoother.",
      "  Token bucket — a bucket refills at a steady rate; each request takes a token; allows short bursts up to bucket size.",
      "  Leaky bucket — requests drain at a fixed rate, smoothing traffic.",
      "Where to implement: API gateway / reverse proxy (Nginx, Cloudflare, AWS API Gateway) or in the app (`express-rate-limit`, `rate-limiter-flexible`).",
      "# How it works",
      "For each request, compute a key: IP for anonymous traffic, user id or API key for logged-in traffic.",
      "Increment a counter for that key in a store:",
      "  in memory — only works for a single process;",
      "  Redis — shared across all instances, using atomic `INCR` + `EXPIRE`.",
      "If the counter is over the limit, reject with 429; otherwise continue.",
      "Send headers like `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` so clients can back off.",
      "Behind a load balancer, set `app.set('trust proxy', 1)` so Express reads the real client IP from `X-Forwarded-For`.",
      "# Example walkthrough",
      "A tiny fixed-window limiter uses a `Map` from IP to `{ count, resetAt }`.",
      "Each request increments the count; after 5 requests in 60 seconds it responds 429 with `Retry-After`.",
      "The commented line shows the production version using `express-rate-limit` with a stricter limit on `/login`.",
      "# Why it matters / when to use",
      "Protects against brute-force login attempts, scraping, spam and accidental client loops.",
      "Prevents one tenant or client from starving others (fair usage) and controls costs of expensive endpoints like AI or SMS.",
      "Helps against small-scale DoS; large DDoS needs network-level protection (CDN/WAF).",
      "# Common mistakes",
      "In-memory counters with multiple instances: each instance has its own count, so the limit multiplies. Fix: Redis store.",
      "Not setting `trust proxy`: every user shares the load balancer's IP and gets blocked together. Fix: configure it correctly.",
      "One global limit for everything. Fix: stricter limits on login, signup, password reset; looser on reads.",
      "No `Retry-After` header. Fix: tell clients when to retry.",
      "# Say this in the interview",
      "I limit requests per key, usually IP for anonymous and user or API key for authenticated traffic, using a token bucket or sliding window with counters in Redis so all instances share the state, and return 429 with Retry-After. I apply stricter limits to sensitive endpoints like login, and add edge protection with a gateway or CDN for large-scale abuse.",
      "Follow-up: token bucket vs fixed window?",
      "  Token bucket allows controlled bursts and a smooth average rate; fixed window is simpler but can allow double the rate around window boundaries.",
    ],
    code: `import express from 'express';
const app = express();
app.set('trust proxy', 1); // read real IP behind a load balancer

// Minimal fixed-window limiter (single process only — use Redis in prod)
function rateLimit({ windowMs, max }) {
  const hits = new Map(); // ip → { count, resetAt }
  return (req, res, next) => {
    const now = Date.now();
    const entry = hits.get(req.ip) ?? { count: 0, resetAt: now + windowMs };
    if (now > entry.resetAt) { entry.count = 0; entry.resetAt = now + windowMs; }
    entry.count++;
    hits.set(req.ip, entry);
    res.set('RateLimit-Remaining', String(Math.max(0, max - entry.count)));
    if (entry.count > max) {
      res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({ error: 'Too many requests' });
    }
    next();
  };
}

app.use('/login', rateLimit({ windowMs: 60_000, max: 5 }));
app.post('/login', (req, res) => res.json({ ok: true }));
// 1st..5th POST /login in a minute → 200; 6th → 429 + Retry-After

// Production: import { rateLimit } from 'express-rate-limit';
// app.use('/api', rateLimit({ windowMs: 60_000, limit: 100, store: redisStore }));
app.listen(3000);`,
  },
  {
    id: 'input-validation',
    group: 'Security & Auth',
    stars: 4,
    difficulty: 'Easy',
    q: 'Why and how should you validate input in a Node API?',
    a: [
      "# ELI5",
      "A bouncer at a club checks every guest: are you on the list, old enough, dressed correctly? Anyone who fails stays outside.",
      "Without the bouncer, anyone (or anything) could walk in and cause trouble.",
      "Input validation is the bouncer for your API: it checks every piece of incoming data before your code touches it.",
      "# What it is",
      "Input — anything that comes from outside your server: request body, query string, URL params, headers, cookies, uploaded files, webhooks.",
      "Validation — checking the input has the expected shape, types, lengths and ranges, and rejecting it if not.",
      "Sanitization — cleaning input (trimming, normalizing case, stripping HTML) so it is safe to store or display.",
      "Schema — a declarative description of valid data, e.g. 'email must be a string in email format, age an integer from 13 to 120'.",
      "Popular libraries: Zod (TypeScript-first, infers types from schemas), Joi, Yup, AJV (fast JSON Schema validator), class-validator (NestJS).",
      "Why: TypeScript types disappear at runtime, so a `User` type does not stop a client from sending `{ age: 'banana' }`.",
      "# How it works",
      "Define a schema per endpoint for body, query and params.",
      "Run it in a middleware before the handler:",
      "  if invalid, respond 400 (or 422) with field-level errors;",
      "  if valid, replace `req.body` with the parsed result (which drops unknown fields and applies defaults/coercions).",
      "Use allowlisting — accept only known fields — rather than trying to block bad ones.",
      "Combine with other limits: body size limit, string max lengths, array max sizes, enum values.",
      "Validation is not the only defence: still use parameterized queries and output escaping.",
      "# Example walkthrough",
      "`CreateUser` schema: `email` must be a valid email, `age` an integer 13–120, `role` one of two values with a default.",
      "The `validate` middleware calls `safeParse`; on failure it returns 400 with `issues` such as `age: Too small`.",
      "On success `req.body` is the clean, typed object, and extra fields like `isAdmin: true` are stripped by default.",
      "# Why it matters / when to use",
      "Security: blocks injection, prototype pollution, mass assignment (a user setting `isAdmin` themselves) and huge payload abuse.",
      "Reliability: bad data never reaches the DB, so fewer crashes and corrupted records.",
      "Developer experience: clear 400 errors for clients and auto-generated types and docs from schemas.",
      "# Common mistakes",
      "Validating only on the frontend. Fix: the server must validate; frontend checks are just UX.",
      "Trusting TypeScript types for runtime data. Fix: runtime schema validation.",
      "Passing `req.body` directly into DB create calls: mass assignment. Fix: use the parsed, allowlisted object.",
      "Returning 500 on bad input. Fix: 400/422 with helpful messages.",
      "# Say this in the interview",
      "All external input is untrusted, and TypeScript types vanish at runtime, so I validate body, query and params with a schema library like Zod in middleware before the handler. Invalid requests get a 400 with field errors, and valid ones are replaced with the parsed, allowlisted object, which also prevents mass assignment. It complements, not replaces, parameterized queries and output escaping.",
      "Follow-up: validation vs sanitization?",
      "  Validation rejects bad data; sanitization transforms data into a safe/normal form.",
    ],
    code: `import express from 'express';
import { z } from 'zod';

const CreateUser = z.object({
  email: z.string().email(),
  age: z.number().int().min(13).max(120),
  role: z.enum(['user', 'editor']).default('user'),
}); // unknown keys are stripped by default

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      errors: result.error.issues.map((i) => i.path.join('.') + ': ' + i.message),
    });
  }
  req.body = result.data; // clean, typed data only
  next();
};

const app = express();
app.use(express.json({ limit: '10kb' }));
app.post('/users', validate(CreateUser), (req, res) => res.status(201).json(req.body));
app.listen(3000);

// POST {"email":"a@b.com","age":5}
//   → 400 {"errors":["age: Too small: expected number to be >=13"]}  (message wording varies by Zod version)
// POST {"email":"a@b.com","age":30,"isAdmin":true}
//   → 201 {"email":"a@b.com","age":30,"role":"user"}   (isAdmin stripped)`,
  },
  {
    id: 'oauth2-oidc',
    group: 'Security & Auth',
    stars: 4,
    difficulty: 'Medium',
    q: 'Explain OAuth 2.0 and OpenID Connect at a high level.',
    a: [
      "# ELI5",
      "You want a photo-printing website to print photos from your Google Photos.",
      "Instead of giving the printing site your Google password, Google asks you 'Do you allow this site to view your photos?' and then gives the site a special limited key.",
      "That key opens only the photo album, only for a while, and you can take it back anytime.",
      "OAuth 2.0 is the system for handing out those limited keys; OpenID Connect adds a name tag that says who you are, which is how 'Sign in with Google' works.",
      "# What it is",
      "OAuth 2.0 — an authorization framework: it lets an app get limited access to a user's resources on another service without the user's password.",
      "OpenID Connect (OIDC) — an identity layer on top of OAuth 2.0 that adds authentication: it tells the app who the user is via an ID token.",
      "Roles:",
      "  Resource owner — the user.",
      "  Client — the app wanting access (your web app).",
      "  Authorization server — issues tokens (Google, Auth0, Okta, Keycloak, Cognito).",
      "  Resource server — the API holding the data (Google Photos API).",
      "Tokens:",
      "  Access token — used to call APIs; short-lived.",
      "  Refresh token — gets new access tokens without asking the user again.",
      "  ID token (OIDC only) — a JWT with user identity claims like `sub`, `email`, `name`; meant for the client, not for calling APIs.",
      "Scopes — named permissions the client asks for, e.g. `openid profile email` or `photos.read`.",
      "Grant types (flows): Authorization Code + PKCE (for web/mobile/SPAs, the recommended one), Client Credentials (machine-to-machine), Device Code (TVs). Implicit and Password grants are deprecated.",
      "PKCE (Proof Key for Code Exchange, 'pixie') — the client creates a random secret (`code_verifier`) and sends its hash first, so a stolen authorization code is useless.",
      "# How it works",
      "Authorization Code + PKCE flow:",
      "  The app generates `code_verifier`, a `state` value, and redirects the user to the provider's `/authorize` URL with `client_id`, `redirect_uri`, `scope`, `state` and `code_challenge`.",
      "  The user logs in at the provider and approves the scopes.",
      "  The provider redirects back to `redirect_uri?code=...&state=...`.",
      "  The app checks `state` matches (prevents CSRF), then, server-to-server, POSTs the `code` + `code_verifier` (+ client secret for confidential clients) to the `/token` endpoint.",
      "  It receives `access_token`, optional `refresh_token`, and (with OIDC) `id_token`.",
      "  The app verifies the ID token signature using the provider's public keys (JWKS), then creates its own session for the user.",
      "OIDC discovery: providers publish `/.well-known/openid-configuration` listing all endpoints and keys.",
      "# Example walkthrough",
      "The snippet builds the authorize URL with PKCE using Node's `crypto`, stores `state` and `verifier` in the session, and on the callback exchanges the code with `fetch` at the token endpoint.",
      "In production use a certified library like `openid-client` or a provider SDK, which also validates the ID token.",
      "# Why it matters / when to use",
      "'Sign in with Google/GitHub/Microsoft' (OIDC) and enterprise single sign-on (SSO).",
      "Accessing third-party APIs on behalf of users (calendar, drive, payments).",
      "Machine-to-machine auth between your microservices (Client Credentials).",
      "# Common mistakes",
      "Saying OAuth is for authentication: plain OAuth is authorization; OIDC adds authentication.",
      "Using the access token as proof of identity in the client. Fix: use and verify the ID token.",
      "Skipping `state` or PKCE. Fix: always use both.",
      "Storing the client secret in a frontend app. Fix: SPAs are public clients; use PKCE without a secret or a backend-for-frontend.",
      "# Say this in the interview",
      "OAuth 2.0 is a delegated authorization framework: the user approves scopes at an authorization server, which issues an access token the client uses to call APIs, without sharing the password. OpenID Connect builds on it to provide authentication by adding a signed ID token with user identity. For web and mobile apps I use the Authorization Code flow with PKCE and state, exchange the code server-side, verify the ID token, and then create my own session.",
      "Follow-up: what is the Client Credentials flow?",
      "  A service authenticates with its own client id and secret to get a token for machine-to-machine calls; no user involved.",
    ],
    code: `import crypto from 'node:crypto';

const ISSUER = 'https://accounts.google.com';
const CLIENT_ID = process.env.CLIENT_ID;
const REDIRECT_URI = 'http://localhost:3000/callback';

// Step 1: build the login URL with PKCE + state
export function startLogin(session) {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  session.pkce = { verifier, state: crypto.randomUUID() };
  const params = new URLSearchParams({
    response_type: 'code', client_id: CLIENT_ID, redirect_uri: REDIRECT_URI,
    scope: 'openid email profile', state: session.pkce.state,
    code_challenge: challenge, code_challenge_method: 'S256',
  });
  return ISSUER + '/o/oauth2/v2/auth?' + params; // redirect the user here
}

// Step 2: provider redirects back with ?code=...&state=...
export async function handleCallback(session, code, state) {
  if (state !== session.pkce.state) throw new Error('state mismatch'); // CSRF check
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'authorization_code', code, redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID, client_secret: process.env.CLIENT_SECRET,
      code_verifier: session.pkce.verifier,
    }),
  });
  const tokens = await res.json(); // → { access_token, id_token, expires_in, ... }
  // Next: verify tokens.id_token signature via JWKS (e.g. openid-client / jose)
  return tokens;
}`,
  },
  {
    id: 'security-headers-helmet',
    group: 'Security & Auth',
    stars: 3,
    difficulty: 'Easy',
    q: 'What does Helmet do in Express?',
    a: [
      "# ELI5",
      "When you go out in the rain you put on a raincoat, boots and a hat: each protects a different part of you.",
      "Helmet puts on a set of protective 'clothes' (HTTP headers) on every response, each one telling the browser to block a different kind of attack.",
      "One line of code, many layers of protection.",
      "# What it is",
      "Helmet is an Express middleware that sets security-related HTTP response headers with sensible defaults.",
      "HTTP header — a key/value line sent with a response that gives the browser instructions or info.",
      "Key headers it sets:",
      "  `Content-Security-Policy` (CSP) — which sources of scripts, styles, images are allowed; a strong defence against XSS.",
      "  `Strict-Transport-Security` (HSTS) — tells the browser to always use HTTPS for this site.",
      "  `X-Content-Type-Options: nosniff` — stops the browser guessing file types (MIME sniffing), which can turn uploads into scripts.",
      "  `X-Frame-Options: SAMEORIGIN` and CSP `frame-ancestors` — prevent clickjacking, where your site is hidden in an iframe on an evil page.",
      "  `Referrer-Policy` — controls how much of the URL is sent to other sites.",
      "  `Cross-Origin-Opener-Policy` / `Cross-Origin-Resource-Policy` — isolate your pages and resources from other origins.",
      "It also removes `X-Powered-By: Express`, which advertises your framework to attackers.",
      "# How it works",
      "`app.use(helmet())` registers one middleware made of many small ones.",
      "For every response it adds the headers before your handler runs.",
      "The browser reads the headers and enforces the policies, e.g. refusing to run an inline script not allowed by CSP.",
      "You can configure or disable individual headers, e.g. a custom CSP allowing your CDN.",
      "# Example walkthrough",
      "The snippet enables Helmet with a custom CSP that allows scripts from your own site and one CDN.",
      "`curl -I` shows the added headers like `Content-Security-Policy` and `Strict-Transport-Security`, and no `X-Powered-By`.",
      "# Why it matters / when to use",
      "Cheap, high-value hardening for any Express app, especially ones serving HTML.",
      "For JSON-only APIs it still helps (nosniff, HSTS, hiding the framework), though CSP matters most for pages.",
      "# Common mistakes",
      "Thinking Helmet makes the app secure on its own. Fix: it is one layer; you still need validation, auth, escaping.",
      "A too-strict CSP breaking your frontend, then disabling CSP entirely. Fix: tune directives, test in `reportOnly` mode first.",
      "Setting HSTS on a domain that is not fully HTTPS yet. Fix: enable once HTTPS works everywhere; start with a short `maxAge`.",
      "# Say this in the interview",
      "Helmet is Express middleware that sets security headers such as Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options, frame protection and Referrer-Policy, and removes X-Powered-By. These tell the browser to block XSS, clickjacking, MIME sniffing and downgrade attacks. It's a cheap defence-in-depth layer, not a replacement for proper validation and auth.",
      "Follow-up: what is clickjacking?",
      "  An attacker loads your site invisibly in an iframe and tricks users into clicking buttons; frame-ancestors / X-Frame-Options prevent it.",
    ],
    code: `import express from 'express';
import helmet from 'helmet';

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://cdn.jsdelivr.net'], // allow one CDN
      imgSrc: ["'self'", 'data:'],
    },
  },
  strictTransportSecurity: { maxAge: 31536000, includeSubDomains: true },
}));

app.get('/', (req, res) => res.send('<h1>Hello</h1>'));
app.listen(3000);

// curl -I localhost:3000
// → Content-Security-Policy: default-src 'self';script-src 'self' https://cdn.jsdelivr.net;...
// → Strict-Transport-Security: max-age=31536000; includeSubDomains
// → X-Content-Type-Options: nosniff
// → X-Frame-Options: SAMEORIGIN
// (no X-Powered-By header)`,
  },
  {
    id: 'secrets-management',
    group: 'Security & Auth',
    stars: 3,
    difficulty: 'Easy',
    q: 'How should secrets be handled in a Node application?',
    a: [
      "# ELI5",
      "You would not write your house key's location on the front door for everyone to see.",
      "Secrets in code are like that: anyone who sees the code (on GitHub, in a leaked laptop) gets the key.",
      "Instead, keep keys in a locked safe (secret manager) and hand them to the app only when it starts.",
      "# What it is",
      "Secret — any value that grants access: DB passwords, API keys, JWT signing keys, OAuth client secrets, encryption keys.",
      "Environment variable — a named value given to a process by the operating system or platform, read in Node via `process.env.NAME`.",
      "`.env` file — a local file of `KEY=value` lines for development; loaded with `node --env-file=.env app.js` (built into Node 20.6+) or the `dotenv` package.",
      "Secret manager — a secure service that stores, encrypts, audits and rotates secrets: AWS Secrets Manager, GCP Secret Manager, Azure Key Vault, HashiCorp Vault, Doppler, Kubernetes Secrets (ideally with encryption or an external secrets operator).",
      "Rotation — regularly replacing a secret with a new one so leaked old values stop working.",
      "Principle of least privilege — each service gets only the secrets and permissions it needs.",
      "# How it works",
      "Development: put values in `.env`, add `.env` to `.gitignore`, and commit a `.env.example` with key names but fake values.",
      "Production: the platform injects env vars or the app fetches secrets from a manager at startup using its cloud identity (IAM role), so there is no password to fetch the passwords.",
      "At startup, validate all required config with a schema and crash immediately if something is missing (fail fast).",
      "Access secrets through one config module, not `process.env` scattered everywhere.",
      "CI/CD: store secrets in the CI provider's encrypted secrets (e.g. GitHub Actions secrets), never in workflow files.",
      "Scan for leaks with tools like gitleaks or GitHub secret scanning; if a secret leaks, rotate it immediately (deleting the commit is not enough).",
      "# Example walkthrough",
      "Run with `node --env-file=.env config.js`.",
      "The config module validates `DATABASE_URL` and `JWT_SECRET` with Zod; if `JWT_SECRET` is too short the process exits with a clear error.",
      "The exported `config` object is frozen, and logs show only a masked value.",
      "# Why it matters / when to use",
      "Leaked secrets on GitHub are found by bots within minutes and used for crypto mining or data theft.",
      "Separate secrets per environment (dev, staging, prod) limit the blast radius of a leak.",
      "# Common mistakes",
      "Committing `.env` or hardcoding keys. Fix: `.gitignore` + secret scanning.",
      "Logging `process.env` or full config on startup. Fix: never log secrets; redact.",
      "Baking secrets into Docker images (`ENV` or `COPY .env`). Fix: inject at runtime.",
      "Sending server secrets to the frontend bundle (e.g. `NEXT_PUBLIC_` prefix). Fix: only public values in client code.",
      "# Say this in the interview",
      "I never hardcode or commit secrets: locally they live in a git-ignored `.env` loaded with `--env-file`, and in production they come from a secret manager or platform env vars, fetched using the service's IAM identity. I validate config at startup and fail fast, access it through a single config module, never log it, use separate secrets per environment, and rotate immediately on any leak.",
      "Follow-up: are Kubernetes Secrets secure?",
      "  By default they are only base64-encoded in etcd; enable encryption at rest, restrict RBAC, or sync from an external secret manager.",
    ],
    code: `// config.js — run with: node --env-file=.env config.js
// .env (git-ignored):
//   DATABASE_URL=postgres://app:pw@localhost:5432/app
//   JWT_SECRET=change-me-to-a-long-random-string-123456
import { z } from 'zod';

const Env = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 chars'),
  PORT: z.coerce.number().default(3000),
});

const parsed = Env.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid config:', parsed.error.issues.map((i) => i.path.join('.')));
  process.exit(1); // fail fast instead of crashing later
}

export const config = Object.freeze(parsed.data);

const mask = (s) => s.slice(0, 4) + '****';
console.log('port', config.PORT, 'jwt', mask(config.JWT_SECRET));
// → port 3000 jwt chan****`,
  },
  {
    id: 'prototype-pollution',
    group: 'Security & Auth',
    stars: 2,
    difficulty: 'Hard',
    q: 'What is prototype pollution?',
    a: [
      "# ELI5",
      "Imagine every toy in a toy box copies its rules from one master rulebook.",
      "If a sneaky kid writes 'everyone is the boss' into the master rulebook, suddenly every toy believes it is the boss.",
      "Prototype pollution is when an attacker writes into JavaScript's shared master rulebook, `Object.prototype`, and every object in the app is affected.",
      "# What it is",
      "Prototype — in JavaScript, every object has a hidden link to another object it inherits properties from; for plain objects that is `Object.prototype`.",
      "Prototype chain — when you read `obj.x` and `obj` has no `x`, JS looks at its prototype, then that prototype's prototype, and so on.",
      "Prototype pollution — an attack where user input sets properties on `Object.prototype` (via keys like `__proto__`, `constructor.prototype`), so every object suddenly has them.",
      "It usually happens in code that recursively merges, clones or sets nested paths from user-controlled JSON: deep merge, `set(obj, 'a.b.c', value)`, query string parsers.",
      "Impact: bypassing auth checks (`if (user.isAdmin)` becomes true for everyone), crashes (DoS), and sometimes remote code execution through gadgets in libraries (e.g. template engines or `child_process` options).",
      "# How it works",
      "Attacker sends JSON: `{\"__proto__\": {\"isAdmin\": true}}`.",
      "`JSON.parse` creates an object with an own key literally named `__proto__` (it does not pollute yet).",
      "A naive deep merge does `target[key] = ...` for each key; when `key` is `__proto__`, `target['__proto__']` is `Object.prototype`.",
      "The merge then writes `isAdmin = true` onto `Object.prototype`.",
      "Now `({}).isAdmin === true` for every object in the process, until it restarts.",
      "# Example walkthrough",
      "`unsafeMerge` blindly recurses into every key.",
      "After merging the attacker payload, a brand new `{}` reports `isAdmin: true`.",
      "`safeMerge` skips dangerous keys and only copies own properties, and objects created with `Object.create(null)` have no prototype at all.",
      "# Why it matters / when to use",
      "It is a real class of CVEs in popular packages (lodash, minimist, etc.) and a favourite security interview question.",
      "Any API that merges user JSON into config or options objects is at risk.",
      "# Common mistakes",
      "Hand-written deep merge/set utilities without key checks. Fix: block `__proto__`, `constructor`, `prototype`, or use maintained libraries.",
      "Using plain objects as dictionaries for user keys. Fix: use `Map` or `Object.create(null)`.",
      "Not validating input shape. Fix: schema validation (Zod strips unknown keys) before merging.",
      "Outdated dependencies with known pollution bugs. Fix: `npm audit` and updates; Node's `--disable-proto=delete` flag removes `__proto__` accessor as extra hardening.",
      "# Say this in the interview",
      "Prototype pollution is when attacker-controlled keys like `__proto__` or `constructor.prototype` reach code that recursively merges or sets properties, modifying `Object.prototype` so every object inherits the injected values. It can bypass checks, crash the app or enable code execution. I prevent it with schema validation, rejecting those keys in merges, using `Map` or `Object.create(null)` for dictionaries, freezing prototypes where possible, and keeping dependencies patched.",
      "Follow-up: does `Object.freeze(Object.prototype)` help?",
      "  Yes, it blocks writes to the prototype, but it may break libraries that patch prototypes, so test carefully.",
    ],
    code: `function unsafeMerge(target, source) {
  for (const key in source) {
    if (typeof source[key] === 'object' && source[key] !== null) {
      target[key] ??= {};
      unsafeMerge(target[key], source[key]); // key "__proto__" → Object.prototype!
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

const payload = JSON.parse('{"__proto__": {"isAdmin": true}}');
unsafeMerge({}, payload);
console.log({}.isAdmin); // → true   (every object is now "admin"!)
delete Object.prototype.isAdmin; // clean up for the demo

const BLOCKED = new Set(['__proto__', 'constructor', 'prototype']);
function safeMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (BLOCKED.has(key)) continue; // skip dangerous keys
    const val = source[key];
    if (val && typeof val === 'object') {
      if (!Object.hasOwn(target, key)) target[key] = Object.create(null);
      safeMerge(target[key], val);
    } else target[key] = val;
  }
  return target;
}

safeMerge({}, payload);
console.log({}.isAdmin); // → undefined (safe)`,
  },
  // ───────────────────────── Performance & Scaling ─────────────────────────
  {
    id: 'scaling-node',
    group: 'Performance & Scaling',
    stars: 5,
    difficulty: 'Medium',
    q: 'How do you scale a Node.js application?',
    a: [
      "# ELI5",
      "A lemonade stand gets popular and the line gets long.",
      "You can hire more sellers at the same stand (use all CPU cores), open more stands across town (more servers), pre-make lemonade (caching), or hand slow jobs like squeezing 1000 lemons to a back-room helper (queues and workers).",
      "Scaling Node is choosing the right mix of these tricks so the line stays short.",
      "# What it is",
      "Scaling — making the app handle more load (requests, users, data) while staying fast and reliable.",
      "Vertical scaling (scale up) — a bigger machine with more CPU/RAM. Easy but has limits and a single point of failure.",
      "Horizontal scaling (scale out) — more copies (instances) of the app behind a load balancer. The main approach for Node.",
      "Why Node needs special care: one Node process runs your JavaScript on a single main thread, so it uses only one CPU core and any CPU-heavy work blocks all requests.",
      "Stateless service — an instance keeps no user data in its own memory between requests (sessions, uploads, caches go to shared stores), so any instance can serve any request.",
      "Load balancer — a component that spreads incoming requests across instances (Nginx, AWS ALB, Kubernetes Service).",
      "# How it works",
      "1. Use all cores on one machine: run one process per core with the `cluster` module, PM2 cluster mode, or multiple containers.",
      "2. Scale out: run many instances behind a load balancer; autoscale on CPU/latency (Kubernetes HPA, ECS, Cloud Run).",
      "3. Make instances stateless:",
      "  sessions in Redis, files in object storage (S3), WebSocket broadcasts via Redis pub/sub.",
      "4. Keep the event loop free:",
      "  move CPU-heavy work (image resizing, PDF generation, hashing big data) to `worker_threads` or a separate worker service.",
      "5. Offload slow or non-urgent work to message queues (BullMQ, RabbitMQ, SQS) and respond to the user quickly.",
      "6. Cache aggressively: in-memory LRU, Redis, HTTP caching and CDNs for static and public responses.",
      "7. Scale the database too: connection pooling, indexes, read replicas, query optimization, and sharding/partitioning when huge.",
      "8. Measure: APM, metrics (p95/p99 latency, event loop lag), and load tests (k6, autocannon) to find the real bottleneck before optimizing.",
      "# Example walkthrough",
      "The snippet shows one stateless Express instance: it stores sessions in Redis and caches an expensive query in Redis for 60 seconds.",
      "Because nothing important lives in process memory, you can run 10 copies of it behind a load balancer without changes.",
      "`/report` enqueues heavy work instead of doing it inline, returning 202 Accepted immediately.",
      "# Why it matters / when to use",
      "Traffic grows unevenly (sales, launches); a scalable design handles spikes without rewriting the app.",
      "Redundancy: multiple instances mean one crash does not take the service down.",
      "# Common mistakes",
      "Scaling instances when the DB is the bottleneck: more instances make it worse. Fix: measure first; optimize queries, pool connections.",
      "Storing state in memory (sessions, rate-limit counters, caches that must be consistent). Fix: shared stores.",
      "Doing CPU-heavy work on the main thread. Fix: worker threads or a separate service.",
      "Too many DB connections from many instances (each with its own pool). Fix: size pools per instance or use a pooler like PgBouncer.",
      "# Say this in the interview",
      "Because a Node process runs JavaScript on one thread, I first use all cores with cluster, PM2 or one container per core, then scale horizontally behind a load balancer with stateless instances, keeping sessions and shared state in Redis. I keep the event loop free by moving CPU work to worker threads and slow tasks to queues, add caching at several layers, and scale the database with pooling, indexes and replicas, always guided by metrics and load tests.",
      "Follow-up: how do you know what to scale?",
      "  Measure: high CPU suggests more instances or offloading CPU work; high DB latency suggests query/index/pool work; event loop lag suggests blocking code.",
    ],
    code: `import express from 'express';
import { createClient } from 'redis';

// Stateless instance: shared state lives in Redis, so N copies can run.
const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();
const app = express();

app.get('/products', async (req, res) => {
  const cached = await redis.get('products');
  if (cached) return res.json(JSON.parse(cached));   // cache hit: fast
  const products = await slowDbQuery();              // cache miss
  await redis.set('products', JSON.stringify(products), { EX: 60 });
  res.json(products);
});

app.post('/report', async (req, res) => {
  // Heavy work goes to a queue processed by separate worker processes
  await redis.lPush('jobs:report', JSON.stringify({ userId: 1 }));
  res.status(202).json({ status: 'queued' }); // respond immediately
});

async function slowDbQuery() {
  await new Promise((r) => setTimeout(r, 500));
  return [{ id: 1, name: 'Pen' }];
}

app.listen(process.env.PORT ?? 3000);
// Run many copies behind a load balancer, e.g. pm2 start app.js -i max`,
  },
  {
    id: 'cluster-module',
    group: 'Performance & Scaling',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is the cluster module and how does it work?',
    a: [
      "# ELI5",
      "A restaurant has one very fast chef, but the kitchen has 8 stoves and only one is used.",
      "The manager (primary) hires 7 more identical chefs (workers), one per stove. Customers' orders still come through the same front door, and the manager hands each order to a chef.",
      "If a chef faints, the manager hires a replacement.",
      "In code: the cluster module starts several copies of your Node server, one per CPU core, all sharing the same port.",
      "# What it is",
      "`node:cluster` is a built-in module that forks multiple Node processes (workers) from one primary process.",
      "Process — a separate running program with its own memory; processes do not share variables.",
      "CPU core — an independent processing unit; an 8-core machine can run 8 things truly in parallel.",
      "Primary (formerly called master) — the parent process; it starts workers and manages them, usually without serving requests itself.",
      "Worker — a full copy of your app with its own event loop, memory and V8 instance.",
      "Workers share the server port; the primary distributes incoming connections between them.",
      "`os.availableParallelism()` (Node 18.14+) returns how many workers make sense to start.",
      "# How it works",
      "You run `node server.js`; the code checks `cluster.isPrimary`.",
      "The primary calls `cluster.fork()` N times; each fork re-runs the same file, where `cluster.isPrimary` is false.",
      "Each worker calls `server.listen(3000)`; internally the listen request goes to the primary, which owns the actual socket.",
      "Load distribution:",
      "  On Linux/macOS the default is round-robin: the primary accepts connections and passes them to workers in turn.",
      "  On Windows the default lets the OS distribute connections.",
      "Workers talk to the primary through IPC (inter-process communication) messages with `process.send` / `worker.on('message')`.",
      "If a worker crashes, the primary gets an `exit` event and can fork a replacement.",
      "For zero-downtime deploys you can restart workers one at a time (rolling restart).",
      "# Example walkthrough",
      "The primary forks one worker per core and logs `primary 1234 starting 8 workers`.",
      "Each worker starts an HTTP server on port 3000 that replies with its own PID (process id).",
      "Repeated `curl localhost:3000` calls return different PIDs, showing requests spread across workers.",
      "Killing a worker (`kill <pid>`) triggers `exit`, and the primary forks a new one.",
      "# Why it matters / when to use",
      "It lets one machine use all its CPU cores for an HTTP server, often giving close to N-times throughput for CPU-bound request handling.",
      "Adds resilience: one worker crash does not take down the whole service.",
      "In containers/Kubernetes, many teams instead run one process per container and scale containers, letting the orchestrator handle restarts.",
      "# Common mistakes",
      "Storing sessions or caches in worker memory: each worker has its own copy, so users see inconsistent data. Fix: Redis or a DB.",
      "Assuming workers share variables. Fix: use IPC or external stores.",
      "Forking more workers than cores: context switching overhead. Fix: use `availableParallelism()`.",
      "Using cluster for one CPU-heavy task: it does not split a single task. Fix: worker threads.",
      "In-process rate limiters or schedulers running once per worker (cron jobs run N times). Fix: run them in the primary or a separate service.",
      "# Say this in the interview",
      "The cluster module lets one Node app use all CPU cores: the primary forks worker processes, each with its own event loop and memory, and they share one port while the primary distributes connections, round-robin by default on Linux. Workers are isolated, so state must be in Redis or a DB, and the primary can restart crashed workers. In Kubernetes I often prefer one process per pod and scale pods instead.",
      "Follow-up: cluster vs worker_threads?",
      "  Cluster = separate processes sharing a port to handle more requests; worker threads = threads within one process for CPU-heavy tasks, able to share memory.",
    ],
    code: `import cluster from 'node:cluster';
import http from 'node:http';
import os from 'node:os';

if (cluster.isPrimary) {
  const n = os.availableParallelism();
  console.log('primary', process.pid, 'starting', n, 'workers');
  for (let i = 0; i < n; i++) cluster.fork();

  cluster.on('exit', (worker, code) => {
    console.log('worker', worker.process.pid, 'died (code', code + '), restarting');
    cluster.fork(); // self-healing
  });
} else {
  // Every worker runs this branch and shares port 3000
  http.createServer((req, res) => {
    res.end('handled by worker ' + process.pid + '\\n');
  }).listen(3000);
  console.log('worker', process.pid, 'listening');
}

// $ curl localhost:3000 → handled by worker 41231
// $ curl localhost:3000 → handled by worker 41232  (round-robin)`,
  },
  {
    id: 'worker-threads',
    group: 'Performance & Scaling',
    stars: 5,
    difficulty: 'Medium',
    q: 'What are worker_threads and when should you use them?',
    a: [
      "# ELI5",
      "A waiter (the main thread) takes orders from many tables very quickly. If the waiter stopped to bake a cake for 10 minutes, every table would wait.",
      "So the waiter passes the cake job to a baker in the back (a worker thread) and keeps serving tables.",
      "When the cake is ready, the baker rings a bell (sends a message) and the waiter brings it out.",
      "In code: `worker_threads` run CPU-heavy JavaScript on other threads so the main event loop stays responsive.",
      "# What it is",
      "Thread — a separate line of execution inside the same process; threads in one process can share memory.",
      "Main thread — the thread running your normal Node code and the event loop.",
      "Event loop — the mechanism that picks the next callback to run; if your JS runs a long calculation, the loop cannot handle anything else.",
      "CPU-bound work — tasks limited by computation (image processing, hashing, compression, big JSON parsing, ML inference); I/O-bound work — waiting on disk/network (DB queries, HTTP calls).",
      "`node:worker_threads` gives you `Worker`, which runs a JS file on a new thread with its own V8 isolate (separate JS heap) and event loop.",
      "Communication:",
      "  `postMessage` / `on('message')` — messages are copied using the structured clone algorithm.",
      "  Transferable objects like `ArrayBuffer` can be moved instead of copied (zero-copy).",
      "  `SharedArrayBuffer` + `Atomics` — truly shared memory between threads.",
      "`workerData` — initial data passed when creating the worker.",
      "# How it works",
      "The main thread creates `new Worker('./task.js', { workerData })`.",
      "Node starts a new OS thread with a fresh JS environment and runs the file there.",
      "The worker computes and sends the result back with `parentPort.postMessage(result)`.",
      "The main thread receives it in a `message` event, while having served other requests in the meantime.",
      "Starting a worker costs time and memory (tens of ms, several MB), so for many tasks use a pool of reusable workers (e.g. `piscina`).",
      "# Example walkthrough",
      "The file both creates and acts as the worker using `isMainThread`.",
      "The main thread starts a worker to compute `fib(40)` — slow recursive math that would block for about a second.",
      "While it runs, a `setInterval` keeps printing `tick`, proving the event loop is not blocked.",
      "When the worker posts the result, the main thread prints `fib(40) = 102334155` and stops.",
      "# Why it matters / when to use",
      "Use for CPU-heavy work inside a Node service: image/video thumbnails, PDF generation, encryption or hashing large data, data parsing, compression.",
      "Do NOT use for I/O: async I/O is already non-blocking and handled by libuv; threads add overhead without benefit.",
      "For very heavy or long jobs, a separate worker service fed by a queue may be better than in-process threads.",
      "# Common mistakes",
      "Creating a new worker per request. Fix: use a worker pool.",
      "Sending huge objects back and forth (expensive copy). Fix: transfer `ArrayBuffer`s or share memory.",
      "Using workers for DB calls or HTTP requests. Fix: plain async code.",
      "Forgetting error handling: listen for `error` and `exit` events on the worker.",
      "# Say this in the interview",
      "worker_threads run JavaScript in parallel threads within the same process, each with its own V8 isolate and event loop, communicating via message passing or SharedArrayBuffer. I use them for CPU-bound tasks like image processing or heavy computation so the main event loop stays responsive, usually through a worker pool like Piscina, and never for I/O, which is already asynchronous.",
      "Follow-up: do worker threads share memory?",
      "  Not by default; messages are copied. They can share memory explicitly through `SharedArrayBuffer`, synchronized with `Atomics`.",
    ],
    code: `import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';

const fib = (n) => (n < 2 ? n : fib(n - 1) + fib(n - 2)); // CPU-heavy

if (isMainThread) {
  const timer = setInterval(() => console.log('tick (event loop still free)'), 200);

  const worker = new Worker(new URL(import.meta.url), { workerData: 40 });
  worker.on('message', (result) => {
    console.log('fib(40) =', result); // → fib(40) = 102334155
    clearInterval(timer);
  });
  worker.on('error', (err) => console.error('worker failed', err));
} else {
  // Runs on a separate thread
  parentPort.postMessage(fib(workerData));
}

// Output:
// tick (event loop still free)
// tick (event loop still free)
// ...
// fib(40) = 102334155`,
  },
  {
    id: 'cluster-vs-worker-vs-child',
    group: 'Performance & Scaling',
    stars: 4,
    difficulty: 'Medium',
    q: 'Compare cluster, worker_threads, and child_process.',
    a: [
      "# ELI5",
      "Cluster: opening several identical copies of the same shop, all behind one front door, to serve more customers.",
      "Worker threads: hiring an assistant inside the same shop to do heavy lifting while you keep serving.",
      "Child process: phoning a completely different company (another program) to do a job for you, like a printing service.",
      "# What it is",
      "`child_process` — starts any separate program (a shell command, Python script, ffmpeg, or another Node script) as a new OS process.",
      "`cluster` — a specialised use of child processes: forks copies of the same Node server that share one listening port.",
      "`worker_threads` — runs JavaScript on extra threads inside the same Node process.",
      "Comparison:",
      "  Unit: cluster = process; worker_threads = thread; child_process = process.",
      "  Runs: cluster = same Node app; worker_threads = JS files/functions; child_process = any executable.",
      "  Memory: cluster and child_process are fully isolated; worker_threads have separate heaps but can share memory via `SharedArrayBuffer`.",
      "  Communication: cluster and `fork` use IPC messages; worker_threads use `postMessage` (faster, can transfer buffers); `spawn`/`exec` use stdin/stdout pipes.",
      "  Startup cost: processes are heavier (~30–50 MB, slower start); threads are lighter.",
      "  Crash isolation: a crashing process does not kill the parent; a crashing worker thread usually does not either, but a native crash can take down the whole process.",
      "  Main purpose: cluster = handle more HTTP requests using all cores; worker_threads = CPU-heavy tasks without blocking; child_process = run external tools or isolate untrusted/legacy code.",
      "# How it works",
      "Cluster: the primary calls `cluster.fork()`, workers call `listen`, and the primary distributes connections.",
      "Worker threads: `new Worker(file)` creates a thread with its own event loop; results come back as messages.",
      "Child process: `spawn('ffmpeg', args)` starts a new OS process; you read its stdout/stderr streams and wait for `exit`.",
      "# Example walkthrough",
      "The snippet shows each one in a few lines:",
      "  `cluster.fork()` to scale a server,",
      "  `new Worker` to hash data off the main thread,",
      "  `execFile('git', ['--version'])` to run an external program and print `git version 2.x`.",
      "# Why it matters / when to use",
      "Need more HTTP throughput on a multi-core machine: cluster/PM2 (or more containers).",
      "Need to run heavy JavaScript calculations: worker threads.",
      "Need to call ffmpeg, ImageMagick, Python, git, or isolate risky code: child process.",
      "# Common mistakes",
      "Using cluster to speed up one heavy computation: it only spreads requests. Fix: worker threads.",
      "Using `exec` with user input: shell injection. Fix: `execFile`/`spawn` with argument arrays.",
      "Expecting shared state in cluster workers. Fix: external stores.",
      "# Say this in the interview",
      "All three give parallelism differently. Cluster forks copies of the same server process sharing one port, to use all cores for request handling. worker_threads run JS in threads within one process with cheap message passing and optional shared memory, ideal for CPU-heavy tasks. child_process runs any external program in a separate process, for tools like ffmpeg or for isolation.",
      "Follow-up: which is cheapest to start?",
      "  Worker threads, because they share the process; processes need a whole new Node/V8 runtime.",
    ],
    code: `import cluster from 'node:cluster';
import { Worker } from 'node:worker_threads';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

// 1) cluster: copies of the same server sharing a port
if (cluster.isPrimary && process.env.DEMO_CLUSTER) cluster.fork();

// 2) worker_threads: CPU work off the main thread (inline worker via eval)
const w = new Worker(
  "const { parentPort } = require('node:worker_threads');" +
  "const { createHash } = require('node:crypto');" +
  "parentPort.postMessage(createHash('sha256').update('x'.repeat(1e7)).digest('hex').slice(0, 12));",
  { eval: true },
);
w.on('message', (h) => console.log('hash from thread:', h)); // → hash from thread: 2c7f...

// 3) child_process: run another program
const run = promisify(execFile);
const { stdout } = await run('git', ['--version']);
console.log('child said:', stdout.trim()); // → child said: git version 2.47.0`,
  },
  {
    id: 'child-process',
    group: 'Performance & Scaling',
    stars: 4,
    difficulty: 'Medium',
    q: 'Explain `spawn`, `exec`, `execFile`, and `fork`.',
    a: [
      "# ELI5",
      "You need help from other workers:",
      "  `spawn` is like hiring a worker who calls you with updates as they work (live stream of results).",
      "  `exec` is like asking a manager to pass a whole instruction sentence to a worker and bring back the final report in one envelope.",
      "  `execFile` is the same envelope report, but you talk to the worker directly with an exact list of tasks, no manager interpreting your sentence.",
      "  `fork` is hiring another Node.js person who you can chat with back and forth by walkie-talkie.",
      "# What it is",
      "All four come from `node:child_process` and start a new OS process (a child).",
      "Shell — a command interpreter like `bash` or `cmd.exe` that understands pipes (`|`), wildcards (`*`) and `&&`.",
      "Comparison:",
      "  `spawn(cmd, args, opts)` — no shell by default; returns a ChildProcess with streaming `stdout`/`stderr`; best for long-running or large-output commands.",
      "  `exec(commandString, cb)` — runs the string inside a shell; buffers all output and gives it at the end; has `maxBuffer` (1 MB default); risky with user input.",
      "  `execFile(file, args, cb)` — like exec (buffered) but runs the file directly without a shell; safer and slightly faster.",
      "  `fork(modulePath, args)` — a special `spawn` for Node scripts that also opens an IPC channel, so parent and child can `send()` messages.",
      "Each also has a `Sync` version (`execSync`, `spawnSync`) that blocks the event loop — fine only for scripts/CLIs, not servers.",
      "Promise versions: wrap with `util.promisify(exec)` / `util.promisify(execFile)`.",
      "# How it works",
      "Node asks the OS to create a new process and connects pipes for stdin, stdout and stderr.",
      "`spawn` gives you those pipes as streams immediately, so data flows as it is produced.",
      "`exec`/`execFile` collect everything in memory and call you once with `(error, stdout, stderr)`.",
      "`fork` starts `node modulePath` and sets up an IPC channel: `child.send(msg)` and `process.on('message')` in the child.",
      "When the child ends, you get `exit`/`close` events with the exit code (0 = success).",
      "# Example walkthrough",
      "`spawn('ls', ['-la'])` streams directory lines as they arrive.",
      "`execFile('node', ['--version'])` returns `v22.x` in one go.",
      "`exec` with a pipe (`echo hi | tr a-z A-Z`) needs a shell, and prints `HI`.",
      "`fork` sends `{ n: 5 }` to a Node child, which replies `{ result: 25 }`.",
      "# Why it matters / when to use",
      "`spawn`: ffmpeg video conversion, long builds, streaming logs, big outputs.",
      "`execFile`: quick commands with known arguments (git, image tools) and small output.",
      "`exec`: when you genuinely need shell features with trusted input only.",
      "`fork`: offloading work to another Node process with message passing, isolating risky code.",
      "# Common mistakes",
      "Passing user input to `exec`: command injection, e.g. `file.txt; rm -rf /`. Fix: `execFile`/`spawn` with an args array.",
      "Using `exec` for big outputs: fails with `maxBuffer exceeded`. Fix: `spawn` and stream.",
      "Using `execSync` in a server: blocks every request. Fix: async versions.",
      "Not handling `error` (command not found) and non-zero exit codes. Fix: listen and check both.",
      "# Say this in the interview",
      "`spawn` starts a process and streams its output, ideal for long-running or large-output commands. `exec` runs a command string through a shell and buffers output, which is convenient but dangerous with user input. `execFile` buffers too but runs the binary directly without a shell, so it is safer. `fork` is spawn specialised for Node scripts with a built-in IPC channel for messaging.",
      "Follow-up: what does `{ shell: true }` on spawn do?",
      "  It runs the command through a shell, bringing back shell features and the same injection risks as exec.",
    ],
    code: `import { spawn, execFile, exec, fork } from 'node:child_process';
import { promisify } from 'node:util';

// spawn: streaming output, no shell
const ls = spawn('ls', ['-la']);
ls.stdout.on('data', (chunk) => process.stdout.write(chunk)); // lines appear live
ls.on('close', (code) => console.log('ls exited with', code)); // → 0

// execFile: buffered, no shell (safe with args)
const { stdout } = await promisify(execFile)('node', ['--version']);
console.log('node is', stdout.trim()); // → node is v22.11.0

// exec: buffered, uses a shell (pipes work) — trusted input only!
const { stdout: up } = await promisify(exec)('echo hi | tr a-z A-Z');
console.log(up.trim()); // → HI

// fork: Node child + IPC channel (child.js below)
const child = fork('./child.js');
child.send({ n: 5 });
child.on('message', (msg) => { console.log(msg); child.kill(); }); // → { result: 25 }

// child.js:
// process.on('message', ({ n }) => process.send({ result: n * n }));`,
  },
  {
    id: 'caching-strategies',
    group: 'Performance & Scaling',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do you use caching to improve Node API performance?',
    a: [
      "# ELI5",
      "If friends keep asking you the capital of France, you do not look it up in an atlas every time; you remember it.",
      "But if the answer can change (like today's weather), you remember it only for a little while and then check again.",
      "Caching is remembering answers to expensive questions so you can reply instantly next time.",
      "# What it is",
      "Cache — a fast storage layer that keeps copies of data so future requests are served quicker than from the original source (DB, external API).",
      "Cache hit — the data was in the cache; cache miss — it was not, so you fetch from the source.",
      "TTL (time to live) — how long an entry stays before it expires.",
      "Invalidation — removing or updating cached data when the source changes; famously one of the hardest problems in computing.",
      "Layers:",
      "  In-process memory (a `Map` or `lru-cache`) — fastest, but per instance and lost on restart.",
      "  Distributed cache (Redis, Memcached) — shared by all instances, survives app restarts.",
      "  HTTP caching — `Cache-Control`, `ETag`, `Last-Modified` headers let browsers and proxies reuse responses.",
      "  CDN (Cloudflare, CloudFront) — caches responses at servers close to users.",
      "  Database-level — query caches, materialized views.",
      "Patterns:",
      "  Cache-aside (lazy loading) — app checks cache, on miss reads DB and fills cache. The most common.",
      "  Write-through — every write updates DB and cache together.",
      "  Write-behind — write to cache, persist to DB later (fast but risk of loss).",
      "  Stale-while-revalidate — serve the slightly old value immediately and refresh it in the background.",
      "LRU (least recently used) — eviction rule that removes the entries not used for the longest time when the cache is full.",
      "# How it works",
      "Cache-aside step by step:",
      "  Build a key, e.g. `product:42`.",
      "  `GET` it from Redis; if found, parse and return (hit).",
      "  On a miss, query the DB, then `SET` the key with a TTL, and return.",
      "  When the product is updated, `DEL product:42` so the next read refreshes it.",
      "Cache stampede (thundering herd) — when a popular key expires, thousands of requests miss at once and hammer the DB.",
      "  Fixes: request coalescing (share one in-flight promise), locks, random TTL jitter, stale-while-revalidate.",
      "# Example walkthrough",
      "`getProduct` implements cache-aside with an in-memory `Map` plus a pending-promise map to coalesce concurrent misses.",
      "The first call takes ~300 ms (DB); the second returns instantly from cache.",
      "Calling `invalidate(42)` after an update deletes the entry so the next read is fresh.",
      "The route sets `Cache-Control: public, max-age=60` so browsers/CDNs cache too.",
      "# Why it matters / when to use",
      "Cuts latency from hundreds of ms to a few ms, reduces DB load and cost, and absorbs traffic spikes.",
      "Great for read-heavy data that changes rarely: product catalogs, configs, user profiles, expensive aggregates, third-party API results.",
      "Avoid or use very short TTLs for data that must be perfectly fresh (bank balances, stock levels at checkout).",
      "# Common mistakes",
      "No invalidation strategy: users see stale data. Fix: TTL plus explicit deletes on writes.",
      "Caching per-user or private data under a shared key or with `public` HTTP caching: data leaks between users. Fix: include user id in keys and use `private`.",
      "Unbounded in-memory caches causing memory leaks. Fix: LRU with max size.",
      "Ignoring stampedes on hot keys. Fix: coalescing, jitter, or stale-while-revalidate.",
      "# Say this in the interview",
      "I cache at several layers: HTTP headers and CDNs for public responses, Redis for shared application data, and small in-process LRU caches for very hot data. The usual pattern is cache-aside with a TTL and explicit invalidation on writes, with care for stampedes using request coalescing or stale-while-revalidate, and never caching private data under shared keys.",
      "Follow-up: Redis vs in-memory cache?",
      "  In-memory is fastest but per instance and lost on restart; Redis is shared across instances and consistent, at the cost of a network hop.",
    ],
    code: `import express from 'express';

const cache = new Map();   // key → { value, expires }
const inflight = new Map(); // key → Promise (coalesce concurrent misses)
const TTL = 60_000;

async function dbGetProduct(id) {
  await new Promise((r) => setTimeout(r, 300)); // slow DB
  return { id, name: 'Pen', price: 2 };
}

async function getProduct(id) {
  const key = 'product:' + id;
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;  // cache hit
  if (inflight.has(key)) return inflight.get(key);        // someone is already loading it
  const p = dbGetProduct(id).then((value) => {
    cache.set(key, { value, expires: Date.now() + TTL });
    inflight.delete(key);
    return value;
  });
  inflight.set(key, p);
  return p;
}
const invalidate = (id) => cache.delete('product:' + id); // call after updates

const app = express();
app.get('/products/:id', async (req, res) => {
  console.time('lookup');
  const product = await getProduct(Number(req.params.id));
  console.timeEnd('lookup'); // → 1st: ~300ms, 2nd: ~0.05ms
  res.set('Cache-Control', 'public, max-age=60').json(product);
});
app.listen(3000);`,
  },
  {
    id: 'message-queues',
    group: 'Performance & Scaling',
    stars: 3,
    difficulty: 'Medium',
    q: 'When and why would you use a message queue with Node?',
    a: [
      "# ELI5",
      "At a busy bakery, the cashier takes your order and gives you a ticket instead of making you stand at the counter while the cake bakes.",
      "Orders go on a board (the queue); bakers in the back take tickets one by one. If many orders come at once, the board just gets longer; nothing is lost.",
      "A message queue is that order board between parts of your system.",
      "# What it is",
      "Message queue — a service that stores messages (small job descriptions) from producers until consumers process them.",
      "Producer — the code that sends a message (e.g. your API). Consumer / worker — the code that receives and processes messages.",
      "Asynchronous processing — the user gets a response without waiting for the slow work to finish.",
      "Decoupling — producer and consumer do not need to know about each other or be online at the same time.",
      "Popular options:",
      "  BullMQ (on Redis) — very common in Node; jobs, retries, delays, scheduling, priorities.",
      "  RabbitMQ — classic message broker with flexible routing (exchanges, queues).",
      "  Amazon SQS / Google Pub/Sub — fully managed cloud queues.",
      "  Kafka — a distributed log for high-throughput event streaming and replay.",
      "Delivery guarantees: most queues are 'at least once', meaning a message may be delivered more than once, so consumers must be idempotent (processing twice has the same effect as once).",
      "Dead-letter queue (DLQ) — where messages go after failing too many times, for inspection.",
      "# How it works",
      "The API receives a request (e.g. sign up) and does only the essential work (create user).",
      "It publishes a message like `{ type: 'send-welcome-email', userId: 42 }` to the queue and returns 201 right away.",
      "One or more worker processes pull messages from the queue.",
      "A worker processes the job; on success it acknowledges (ack), and the queue deletes the message.",
      "On failure the job is retried with backoff (increasing delays); after max attempts it goes to the DLQ.",
      "To handle more load, start more workers; the queue spreads jobs across them.",
      "# Example walkthrough",
      "`emailQueue.add(...)` in the API enqueues a job with 3 attempts and exponential backoff.",
      "The `Worker` in a separate process picks up jobs, logs `sending welcome email to 42`, and returns a result.",
      "If `sendEmail` throws, BullMQ retries after 1 s, 2 s, 4 s.",
      "`completed`/`failed` events let you log outcomes.",
      "# Why it matters / when to use",
      "Slow tasks that should not delay the HTTP response: emails, SMS, PDFs, image/video processing, webhooks to third parties.",
      "Smoothing traffic spikes: the queue buffers bursts while workers process at a steady rate.",
      "Reliability: retries for flaky external APIs; work survives crashes because it is stored in the queue.",
      "Microservices communication via events (order placed → inventory, billing, email services react).",
      "Scheduled and delayed jobs (send a reminder in 24 hours).",
      "# Common mistakes",
      "Non-idempotent consumers: a duplicate message charges a card twice. Fix: idempotency keys, check-before-act.",
      "Doing heavy work in the API process instead of separate workers. Fix: run workers as their own deployment.",
      "No DLQ or monitoring: failures silently disappear. Fix: DLQ, alerts on queue depth and failures.",
      "Putting huge payloads in messages. Fix: send ids/references; store data in DB or S3.",
      "# Say this in the interview",
      "I use a message queue to move slow, unreliable or bursty work out of the request path: the API enqueues a job and responds immediately, and separate worker processes consume it with retries, backoff and a dead-letter queue. It decouples services, smooths spikes, and lets me scale workers independently. In Node I usually use BullMQ on Redis, or SQS/RabbitMQ/Kafka depending on scale, and make consumers idempotent because delivery is at least once.",
      "Follow-up: queue vs pub/sub?",
      "  A queue delivers each message to one consumer (work distribution); pub/sub delivers each message to every subscriber (event broadcast).",
    ],
    code: `import { Queue, Worker } from 'bullmq';

const connection = { host: 'localhost', port: 6379 }; // Redis

// --- Producer (inside your API) ---
const emailQueue = new Queue('emails', { connection });
export async function onSignup(userId) {
  await emailQueue.add('welcome', { userId }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 }, // 1s, 2s, 4s
    removeOnComplete: true,
  });
  return { status: 201 }; // user does not wait for the email
}

// --- Consumer (separate worker process) ---
const worker = new Worker('emails', async (job) => {
  console.log('sending welcome email to', job.data.userId); // → sending welcome email to 42
  await sendEmail(job.data.userId); // throw → BullMQ retries
  return 'sent';
}, { connection, concurrency: 5 });

worker.on('completed', (job, result) => console.log(job.id, result)); // → 1 sent
worker.on('failed', (job, err) => console.error(job?.id, 'failed:', err.message));

async function sendEmail(userId) { /* call email provider */ }

await onSignup(42);`,
  },
  {
    id: 'load-balancing-pm2',
    group: 'Performance & Scaling',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do load balancers and process managers fit into a Node deployment?',
    a: [
      "# ELI5",
      "A process manager is like a shift supervisor in one shop: makes sure every worker shows up, replaces anyone who falls ill, and keeps the logbook.",
      "A load balancer is like a traffic officer at the entrance of a mall with many shops: sends each customer to a shop that is open and not too busy.",
      "Together, every shop stays staffed and no shop gets overloaded.",
      "# What it is",
      "Process manager — a tool that starts, monitors and restarts your Node processes on a machine. Examples: PM2, systemd, Docker's restart policy, Kubernetes (which manages containers).",
      "PM2 features: auto-restart on crash, cluster mode (one process per core), zero-downtime reload, log management, memory-limit restarts, startup on boot.",
      "Load balancer — distributes incoming requests across multiple instances. Examples: Nginx, HAProxy, AWS ALB/NLB, GCP Load Balancer, Kubernetes Service/Ingress.",
      "Reverse proxy — a server in front of your app that receives client requests and forwards them; often also the load balancer and the place where TLS (HTTPS) is terminated.",
      "Health check — a URL (like `/health`) the load balancer calls regularly; unhealthy instances are removed from rotation.",
      "Layer 4 vs Layer 7: L4 balances TCP connections; L7 understands HTTP (paths, headers, cookies) and can route by URL.",
      "Algorithms: round-robin, least connections, IP hash / sticky sessions.",
      "# How it works",
      "Typical setup on VMs:",
      "  Internet → load balancer (TLS, health checks) → several servers.",
      "  On each server, PM2 runs N Node processes in cluster mode and restarts them if they crash.",
      "Typical setup on Kubernetes:",
      "  Ingress / cloud LB → Service → many pods, each running one Node process; Kubernetes restarts failed containers and uses readiness/liveness probes. PM2 is usually unnecessary here.",
      "Deploys: the LB drains connections from old instances while new ones pass health checks (rolling deploy), giving zero downtime.",
      "The app should trust the proxy (`app.set('trust proxy', 1)`) to get the real client IP and protocol from `X-Forwarded-*` headers.",
      "# Example walkthrough",
      "`ecosystem.config.cjs` tells PM2 to run `server.js` in cluster mode on all cores, restart if memory exceeds 500 MB, and set env vars.",
      "`pm2 start ecosystem.config.cjs`, then `pm2 reload app` restarts workers one by one with no downtime.",
      "The Nginx block load-balances across two servers using least connections and proxies headers.",
      "# Why it matters / when to use",
      "No single point of failure: if one instance dies, traffic goes to others.",
      "Uses all CPU cores and multiple machines for throughput.",
      "Zero-downtime deploys and automatic recovery from crashes.",
      "# Common mistakes",
      "Running `node server.js` directly in production with no supervisor: one crash means downtime. Fix: PM2, systemd, or container orchestration.",
      "Using PM2 cluster mode inside Kubernetes pods as well as scaling pods: double layers, confusing resource limits. Fix: one process per container.",
      "No health check endpoint or one that always returns 200. Fix: check real dependencies for readiness.",
      "Relying on sticky sessions to hide in-memory state. Fix: keep instances stateless.",
      "# Say this in the interview",
      "A process manager like PM2 or systemd keeps Node processes alive on a machine, restarts crashes, runs one process per core and supports zero-downtime reloads. A load balancer like Nginx or a cloud ALB sits in front, terminates TLS, health-checks instances and spreads traffic across machines. In Kubernetes the orchestrator plays the process-manager role and Services/Ingress do the balancing, so I run one Node process per container.",
      "Follow-up: what are sticky sessions?",
      "  The LB sends a given client to the same instance every time; sometimes needed for WebSocket fallbacks, but stateless design is better.",
    ],
    code: `// ecosystem.config.cjs — PM2 configuration
module.exports = {
  apps: [{
    name: 'app',
    script: './server.js',
    instances: 'max',           // one process per CPU core
    exec_mode: 'cluster',       // share the port, PM2 balances between them
    max_memory_restart: '500M', // restart a process that leaks memory
    env: { NODE_ENV: 'production', PORT: 3000 },
  }],
};

// $ pm2 start ecosystem.config.cjs   → app started on 8 cores
// $ pm2 reload app                   → zero-downtime rolling restart
// $ pm2 logs app                     → combined logs

/* nginx.conf — load balancer across two servers
upstream node_app {
  least_conn;
  server 10.0.0.11:3000;
  server 10.0.0.12:3000;
}
server {
  listen 443 ssl;
  location / {
    proxy_pass http://node_app;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
*/`,
  },
  {
    id: 'profiling-performance',
    group: 'Performance & Scaling',
    stars: 3,
    difficulty: 'Hard',
    q: 'How do you find performance bottlenecks in a Node app?',
    a: [
      "# ELI5",
      "If a car is slow, a good mechanic does not randomly replace parts; they plug in diagnostic tools to see which part is actually struggling.",
      "Profiling is plugging diagnostic tools into your app to find exactly which function or query is slow before fixing anything.",
      "# What it is",
      "Bottleneck — the slowest part of the system that limits overall speed.",
      "Latency — how long a single request takes; throughput — how many requests per second you can serve.",
      "p95/p99 latency — the time under which 95%/99% of requests finish; shows the slow tail that averages hide.",
      "Event loop lag/delay — how late timers fire because JavaScript is busy; high lag means something is blocking.",
      "CPU profile — a recording of which functions used CPU time, usually shown as a flame graph (wide bars = functions using the most time).",
      "Heap snapshot — a picture of all objects in memory; comparing snapshots finds memory leaks.",
      "Tools:",
      "  Load generators: `autocannon`, k6, wrk — create realistic traffic.",
      "  Built-in: `node --cpu-prof`, `node --heap-prof`, `node --inspect` + Chrome DevTools, `perf_hooks.monitorEventLoopDelay`.",
      "  Clinic.js (`clinic doctor`, `clinic flame`, `clinic bubbleprof`) and 0x for flame graphs.",
      "  APM / observability: OpenTelemetry tracing, Datadog, New Relic, Grafana — show slow endpoints and DB calls in production.",
      "  Database: `EXPLAIN ANALYZE`, slow query logs.",
      "# How it works",
      "1. Measure a baseline: run a load test and record throughput and p95/p99 latency.",
      "2. Find which layer is slow:",
      "  High CPU + event loop lag → blocking JavaScript (sync crypto, big JSON, regex, loops).",
      "  Low CPU but slow responses → waiting on I/O (slow DB queries, external APIs, pool exhaustion).",
      "  Memory steadily growing → leak (caches without limits, listeners never removed, globals).",
      "3. Profile that layer: CPU profile/flame graph, heap snapshots, or DB query plans and traces.",
      "4. Fix the biggest hotspot: add an index, cache, move work to worker threads, stream instead of buffering, batch queries.",
      "5. Re-measure to confirm improvement; repeat.",
      "# Example walkthrough",
      "The snippet monitors event loop delay with `perf_hooks` and logs p99 every 5 seconds.",
      "A deliberately blocking `/slow` route (sync busy loop for 200 ms) makes p99 delay jump to ~200 ms.",
      "Running `node --cpu-prof app.js` and loading the `.cpuprofile` file into Chrome DevTools would show `busyWait` as the widest bar.",
      "# Why it matters / when to use",
      "Guessing wastes time; data shows the real cause.",
      "Event-loop blocking in Node affects every request, so finding it is critical.",
      "Run profiling before launches, after latency alerts, and when costs rise.",
      "# Common mistakes",
      "Optimizing without measuring (premature optimization). Fix: profile first.",
      "Looking only at averages. Fix: track p95/p99.",
      "Profiling in dev with tiny data. Fix: production-like data and load, or production tracing.",
      "Forgetting the DB: many slow Node APIs are actually slow queries or N+1 problems. Fix: tracing and EXPLAIN.",
      "# Say this in the interview",
      "I start by measuring with a load test and production metrics like p99 latency and event loop delay to see whether the problem is CPU, I/O or memory. For CPU I take a CPU profile and read the flame graph, for memory I compare heap snapshots, and for I/O I use distributed tracing and EXPLAIN on slow queries. Then I fix the biggest hotspot and re-measure.",
      "Follow-up: how do you detect a memory leak?",
      "  Watch heap usage over time; take heap snapshots a few minutes apart under load and compare which object types keep growing.",
    ],
    code: `import http from 'node:http';
import { monitorEventLoopDelay } from 'node:perf_hooks';

// Watch event loop delay (blocking indicator)
const h = monitorEventLoopDelay({ resolution: 10 });
h.enable();
setInterval(() => {
  console.log('event loop p99 delay:', (h.percentile(99) / 1e6).toFixed(1), 'ms');
  h.reset();
}, 5000);

function busyWait(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {} // blocks the whole process!
}

http.createServer((req, res) => {
  if (req.url === '/slow') busyWait(200);
  res.end('ok');
}).listen(3000);

// Normal:           event loop p99 delay: 10.5 ms
// Under /slow load: event loop p99 delay: 205.3 ms
// Profile: node --cpu-prof app.js → open .cpuprofile in Chrome DevTools
// Load:    npx autocannon -c 50 -d 10 http://localhost:3000/slow`,
  },
  {
    id: 'http-keepalive-compression',
    group: 'Performance & Scaling',
    stars: 2,
    difficulty: 'Medium',
    q: 'How do keep-alive and compression affect Node HTTP performance?',
    a: [
      "# ELI5",
      "Keep-alive: instead of hanging up and redialing for every sentence in a phone conversation, you keep the line open and keep talking.",
      "Compression: instead of mailing a big puffy pillow, you vacuum-pack it so it fits a smaller, cheaper box.",
      "Both make sending data over the internet faster.",
      "# What it is",
      "TCP connection — the underlying network connection HTTP runs on; opening one needs a handshake (back-and-forth messages), and HTTPS adds a TLS handshake on top.",
      "Keep-alive (persistent connections) — reusing one TCP connection for many HTTP requests instead of opening a new one each time.",
      "  Node's HTTP server keeps connections alive by default; `server.keepAliveTimeout` (5 s default) is how long an idle connection stays open.",
      "  For outgoing requests, Node 19+ enables keep-alive in the global `http.Agent` by default, and the built-in `fetch` (undici) pools connections too.",
      "Compression — shrinking response bodies with gzip, Brotli (`br`), or zstd before sending.",
      "  The client says what it supports with `Accept-Encoding`; the server replies with `Content-Encoding`.",
      "  Text formats (JSON, HTML, JS, CSS) often shrink 70–90%; images/videos are already compressed.",
      "# How it works",
      "Keep-alive:",
      "  First request opens a TCP (+TLS) connection.",
      "  After the response, the connection stays open instead of closing.",
      "  The next request reuses it, skipping the handshake and saving tens to hundreds of milliseconds.",
      "  Load balancer and Node timeouts must be coordinated: Node's `keepAliveTimeout` should be longer than the LB's idle timeout, otherwise Node may close a connection the LB is about to reuse, causing random 502 errors.",
      "Compression:",
      "  Middleware checks `Accept-Encoding` and response size/type.",
      "  It pipes the response through zlib, sets `Content-Encoding: gzip` (or br) and `Vary: Accept-Encoding`.",
      "  This costs CPU on the server, which in Node runs mostly in the libuv threadpool via zlib streams, but CPU is still used.",
      "# Example walkthrough",
      "The server uses `compression()` with a 1 KB threshold so tiny responses are not compressed.",
      "`/data` returns a large JSON array; `curl --compressed -v` shows `Content-Encoding: gzip` and a much smaller transfer size.",
      "`keepAliveTimeout` is set to 65 s, longer than a typical AWS ALB idle timeout of 60 s.",
      "An outgoing `http.Agent({ keepAlive: true, maxSockets: 50 })` reuses connections to a downstream service.",
      "# Why it matters / when to use",
      "Keep-alive reduces latency and CPU for clients and for your server's calls to other services (databases over HTTP, microservices, third-party APIs).",
      "Compression reduces bandwidth and speeds up responses for slow mobile networks.",
      "In production, compression is often done at the reverse proxy/CDN (Nginx, Cloudflare), freeing Node's CPU.",
      "# Common mistakes",
      "Mismatched keep-alive timeouts behind a load balancer: intermittent 502s. Fix: Node timeout > LB timeout, and `headersTimeout` slightly larger than `keepAliveTimeout`.",
      "Compressing already-compressed files (images, zip): wastes CPU. Fix: filter by content type.",
      "Compressing in Node and in Nginx both. Fix: do it in one layer.",
      "Compressing responses that mix secrets with attacker-controlled input over HTTPS can enable BREACH-style attacks. Fix: be careful with sensitive pages.",
      "# Say this in the interview",
      "Keep-alive reuses TCP and TLS connections across requests, which removes handshake latency; Node's server has it on by default, and I make sure outgoing agents pool connections and that Node's keepAliveTimeout is longer than the load balancer's idle timeout to avoid 502s. Compression with gzip or Brotli shrinks text responses a lot at some CPU cost, so I enable it for large text responses, usually at the proxy or CDN.",
      "Follow-up: Brotli vs gzip?",
      "  Brotli usually compresses text 15–25% better but is slower at high levels; great for static assets pre-compressed at build time.",
    ],
    code: `import express from 'express';
import compression from 'compression';
import http from 'node:http';

const app = express();
app.use(compression({ threshold: 1024 })); // only compress bodies > 1 KB

app.get('/data', (req, res) => {
  const rows = Array.from({ length: 5000 }, (_, i) => ({ id: i, name: 'item ' + i }));
  res.json(rows); // ~150 KB raw → ~20 KB gzipped
});

const server = app.listen(3000);
server.keepAliveTimeout = 65_000; // > load balancer idle timeout (e.g. ALB 60s)
server.headersTimeout = 66_000;   // must be greater than keepAliveTimeout

// Outgoing calls: reuse connections to a downstream service
export const agent = new http.Agent({ keepAlive: true, maxSockets: 50 });
// http.get({ host: 'inventory', port: 80, path: '/stock', agent }, cb)

// $ curl -s --compressed -o /dev/null -w '%{size_download}\\n' localhost:3000/data
// → 21843  (bytes on the wire, vs ~150000 uncompressed)`,
  },
  // ───────────────────────── Databases & ORMs ─────────────────────────
  {
    id: 'connection-pooling',
    group: 'Databases & ORMs',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is database connection pooling and why is it important?',
    a: [
      "# ELI5",
      "A taxi company could buy a new taxi for every passenger and scrap it after one ride — very slow and wasteful.",
      "Instead it keeps a fleet of, say, 10 taxis. A passenger takes a free taxi, and when the ride ends the taxi returns to the stand for the next passenger.",
      "If all 10 are busy, new passengers wait in line briefly.",
      "Connection pooling is that taxi fleet for database connections.",
      "# What it is",
      "Database connection — an open network session between your app and the DB server; opening one involves TCP, maybe TLS, and authentication, often taking 20–100 ms.",
      "Connection pool — a set of already-open connections that the app reuses; requests borrow (check out) a connection, run queries, and return (release) it.",
      "Pool settings:",
      "  `max` — the maximum number of connections in the pool (e.g. 10).",
      "  `idleTimeoutMillis` — close connections idle longer than this.",
      "  `connectionTimeoutMillis` — how long to wait for a free connection before failing.",
      "The database also has a hard limit on total connections (Postgres default `max_connections` is 100), and each connection uses server memory.",
      "In Node, `pg.Pool`, `mysql2.createPool`, Prisma, Knex, Sequelize and TypeORM all pool by default; MongoDB's driver has `maxPoolSize`.",
      "External poolers like PgBouncer or RDS Proxy sit between many app instances and the DB to multiplex connections.",
      "# How it works",
      "At startup, the pool is created (connections open lazily as needed).",
      "A request calls `pool.query(sql)`:",
      "  if a connection is idle, it is used immediately;",
      "  if not and the pool is under `max`, a new connection is opened;",
      "  if the pool is full, the request waits in a queue until one is released (or times out).",
      "After the query, the connection goes back to the pool instead of closing.",
      "For transactions you check out one client with `pool.connect()` and must call `client.release()` when done.",
      "Total DB connections = instances × pool max, so 20 pods × 10 = 200, which may exceed the DB limit.",
      "# Example walkthrough",
      "A `Pool` with `max: 10` is created once at module level and shared.",
      "`Promise.all` fires 50 queries at once; only 10 run at a time and the rest wait, which keeps the DB safe.",
      "`pool.totalCount`, `idleCount` and `waitingCount` show the pool state.",
      "On shutdown, `pool.end()` closes all connections cleanly.",
      "# Why it matters / when to use",
      "Big latency win: no handshake on each request.",
      "Protects the DB from too many connections under load spikes.",
      "Essential in every production Node app; serverless functions especially need an external pooler or a serverless-friendly driver because each function instance creates its own pool.",
      "# Common mistakes",
      "Creating a new client/pool per request. Fix: one shared pool per process.",
      "Forgetting `client.release()` after `pool.connect()`: connections leak until the pool is exhausted and the app hangs. Fix: release in `finally`.",
      "Setting `max` too high: overwhelms the DB. Bigger is not faster; a small pool (often 10–20) per instance is typical.",
      "Ignoring instance count when sizing. Fix: instances × max < DB limit, or use PgBouncer.",
      "# Say this in the interview",
      "Opening a database connection is expensive, so a pool keeps a limited set of open connections that requests borrow and return. That removes handshake latency and caps how many connections hit the database. I create one pool per process, size it considering the number of instances and the DB's max_connections, always release checked-out clients in a finally block, and use PgBouncer or RDS Proxy when many instances or serverless functions connect.",
      "Follow-up: what happens when the pool is exhausted?",
      "  New requests wait in the pool's queue; if none frees up within the connection timeout, they error, which usually reveals leaked connections or slow queries.",
    ],
    code: `import pg from 'pg';

// One pool per process, created once and shared
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,                       // at most 10 open connections
  idleTimeoutMillis: 30_000,     // close idle ones after 30s
  connectionTimeoutMillis: 5_000 // fail if none free within 5s
});

// 50 concurrent queries → only 10 run at once, 40 wait
const results = await Promise.all(
  Array.from({ length: 50 }, (_, i) => pool.query('SELECT $1::int AS n, pg_sleep(0.1)', [i])),
);
console.log(results.length, 'queries done'); // → 50 queries done
console.log({ total: pool.totalCount, idle: pool.idleCount, waiting: pool.waitingCount });
// → { total: 10, idle: 10, waiting: 0 }

// Manual checkout (e.g. for transactions): ALWAYS release
const client = await pool.connect();
try {
  await client.query('SELECT 1');
} finally {
  client.release(); // back to the pool
}

await pool.end(); // on shutdown`,
  },
  {
    id: 'parameterized-queries',
    group: 'Databases & ORMs',
    stars: 4,
    difficulty: 'Easy',
    q: 'How do you prevent SQL and NoSQL injection in Node?',
    a: [
      "# ELI5",
      "Imagine a form where you write your name, and the clerk reads the whole form out loud as instructions.",
      "If someone writes their name as 'Bob. Also, give Bob all the money', the clerk would obey.",
      "Parameterized queries are like a form where the name box is clearly marked 'this is only a name, never instructions'.",
      "# What it is",
      "Injection — an attack where user input changes the meaning of a query because it is mixed directly into the query text.",
      "SQL injection example: `\"SELECT * FROM users WHERE email = '\" + email + \"'\"` with email `' OR '1'='1` returns every user; with `'; DROP TABLE users; --` it could delete data.",
      "Parameterized query (prepared statement) — the SQL text has placeholders (`$1` in Postgres, `?` in MySQL), and values are sent separately; the DB always treats them as data, never as SQL code.",
      "NoSQL injection — in MongoDB, sending an object instead of a string, e.g. `{ \"password\": { \"$ne\": null } }`, turns an equality check into 'password is not null', bypassing login.",
      "Query operators — MongoDB special keys starting with `$` (`$ne`, `$gt`, `$where`, `$regex`).",
      "# How it works",
      "SQL:",
      "  Write `SELECT * FROM users WHERE email = $1` and pass `[email]`.",
      "  The driver sends the query and values separately; the DB parses the SQL first, then plugs in values as plain data.",
      "  ORMs and query builders (Prisma, Knex, Drizzle, Sequelize) parameterize automatically, except in raw-SQL escape hatches.",
      "  Identifiers like table or column names cannot be parameters; validate them against an allowlist.",
      "NoSQL:",
      "  Validate types with a schema so `email` and `password` must be strings.",
      "  Cast values (`String(x)`) and strip keys starting with `$` (`express-mongo-sanitize` or Mongoose's `sanitizeFilter`).",
      "  Avoid `$where` and server-side JavaScript evaluation.",
      "# Example walkthrough",
      "The unsafe query concatenates input; the attack string makes the WHERE clause always true.",
      "The safe version uses `$1`, so the DB looks for a user whose email is literally `' OR '1'='1` and finds none.",
      "For Mongo, Zod ensures `password` is a string, so the `{ $ne: null }` object is rejected with 400.",
      "The sort column is checked against an allowlist because it cannot be a parameter.",
      "# Why it matters / when to use",
      "Injection is one of the most damaging and common vulnerabilities: data theft, auth bypass, data deletion.",
      "Use parameters for every query that includes any external value, even ones you think are safe (like ids).",
      "# Common mistakes",
      "Using template literals to build SQL (`WHERE id = ${id}`). Fix: placeholders.",
      "Thinking ORMs make you fully safe: raw methods like `prisma.$queryRawUnsafe` or `sequelize.query` with concatenation are still vulnerable. Fix: use the safe tagged versions (`$queryRaw` template tag) or bind params.",
      "Passing `req.body` directly into a Mongo filter. Fix: validate and pick specific string fields.",
      "Escaping by hand. Fix: let the driver do it via parameters.",
      "# Say this in the interview",
      "I never concatenate user input into queries. For SQL I use parameterized queries or an ORM/query builder that binds values separately, so the database treats them strictly as data, and I allowlist things that can't be parameters like column names for sorting. For MongoDB I validate input types with a schema so operators like `$ne` can't be injected, sanitize keys starting with `$`, and avoid `$where`.",
      "Follow-up: do prepared statements also help performance?",
      "  Yes, named prepared statements can let the DB reuse the parsed query plan, though the main benefit is security.",
    ],
    code: `import pg from 'pg';
import { z } from 'zod';
const pool = new pg.Pool();
const email = "' OR '1'='1"; // attacker input

// UNSAFE: input becomes part of the SQL text
// "SELECT * FROM users WHERE email = '' OR '1'='1'" → returns ALL users
// await pool.query("SELECT * FROM users WHERE email = '" + email + "'");

// SAFE: placeholder + separate values
const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
console.log(rows.length); // → 0 (treated as a literal string)

// SAFE: Identifiers can't be params → allowlist them
const SORTABLE = new Set(['created_at', 'name']);
const sort = SORTABLE.has('name') ? 'name' : 'created_at';
await pool.query('SELECT * FROM users ORDER BY ' + sort + ' LIMIT $1', [20]);

// SAFE: NoSQL: force primitive types before building a Mongo filter
const Login = z.object({ email: z.string().email(), password: z.string() });
const body = { email: 'a@b.com', password: { $ne: null } }; // attack
const parsed = Login.safeParse(body);
console.log(parsed.success); // → false → respond 400, never query
// users.findOne({ email: parsed.data.email }) only after validation`,
  },
  {
    id: 'transactions',
    group: 'Databases & ORMs',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do you use database transactions in Node?',
    a: [
      "# ELI5",
      "When you trade cards with a friend, you both hand over your cards at the same time. Either both cards change hands, or nobody's does.",
      "It would be unfair if you gave your card and then the friend ran away before giving theirs.",
      "A database transaction makes a group of changes all-or-nothing in the same way.",
      "# What it is",
      "Transaction — a group of database operations treated as one unit: either all succeed (commit) or all are undone (rollback).",
      "ACID — the four guarantees of transactions:",
      "  Atomicity — all or nothing.",
      "  Consistency — the DB moves from one valid state to another (constraints hold).",
      "  Isolation — concurrent transactions do not see each other's half-done work (to a level you choose).",
      "  Durability — once committed, the data survives crashes.",
      "SQL commands: `BEGIN` starts, `COMMIT` saves, `ROLLBACK` cancels.",
      "Isolation levels: Read Committed (Postgres default), Repeatable Read, Serializable (strictest; may require retries on conflicts).",
      "Row locks — `SELECT ... FOR UPDATE` locks selected rows so others must wait, preventing two transactions from changing the same row at once.",
      "# How it works",
      "In Node with `pg`, a transaction must run on ONE connection, so:",
      "  check out a client: `const client = await pool.connect()`;",
      "  `await client.query('BEGIN')`;",
      "  run all queries on that same `client`;",
      "  `await client.query('COMMIT')` if everything worked;",
      "  in `catch`, `await client.query('ROLLBACK')` and rethrow;",
      "  in `finally`, `client.release()` back to the pool.",
      "ORMs provide helpers that do this for you:",
      "  Prisma: `prisma.$transaction(async (tx) => { ... })`.",
      "  Knex: `knex.transaction(async (trx) => { ... })`.",
      "  Sequelize: `sequelize.transaction(async (t) => { ... })`.",
      "  Mongoose/MongoDB: sessions with `session.withTransaction(...)` (needs a replica set).",
      "Keep transactions short: they hold locks and a connection the whole time.",
      "# Example walkthrough",
      "`transfer` moves money between two accounts.",
      "It locks the sender's row with `FOR UPDATE`, checks the balance, debits one account and credits the other.",
      "If the balance is too low it throws; the catch block runs `ROLLBACK`, so neither account changes.",
      "On success `COMMIT` makes both updates visible at once.",
      "# Why it matters / when to use",
      "Any multi-step change that must stay consistent: money transfers, placing an order and decrementing stock, creating a user plus their profile, booking seats.",
      "Without it, a crash or error halfway leaves data corrupted (money debited but never credited).",
      "# Common mistakes",
      "Running queries with `pool.query` inside a transaction: each may use a different connection, so they are not in the transaction. Fix: use the same `client`.",
      "Forgetting `ROLLBACK` or `release()`: leaves the connection in a broken state or leaks it. Fix: try/catch/finally.",
      "Calling slow external APIs (payments, emails) inside a transaction: holds locks for seconds. Fix: do them outside, use the outbox pattern.",
      "Ignoring race conditions: read-then-write without locks. Fix: `FOR UPDATE`, atomic `UPDATE ... SET balance = balance - $1`, or higher isolation.",
      "# Say this in the interview",
      "A transaction groups operations so they all commit or all roll back, giving ACID guarantees. In Node with pg I check out a single client from the pool, run BEGIN, all the queries on that client, COMMIT on success, ROLLBACK in the catch, and release in finally; with an ORM I use its transaction callback. I keep transactions short, lock rows with FOR UPDATE when I read-then-write, and keep external calls outside.",
      "Follow-up: what is a distributed transaction?",
      "  A transaction across multiple services/databases; usually avoided in favour of the saga pattern with compensating actions and an outbox.",
    ],
    code: `import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function transfer(fromId, toId, amount) {
  const client = await pool.connect(); // ONE connection for the whole transaction
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      'SELECT balance FROM accounts WHERE id = $1 FOR UPDATE', [fromId], // lock row
    );
    if (!rows[0] || rows[0].balance < amount) throw new Error('Insufficient funds');

    await client.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [amount, fromId]);
    await client.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [amount, toId]);
    await client.query('COMMIT'); // both changes saved together
    return 'ok';
  } catch (err) {
    await client.query('ROLLBACK'); // undo everything
    throw err;
  } finally {
    client.release(); // always return the connection
  }
}

console.log(await transfer(1, 2, 50));          // → ok
await transfer(1, 2, 1_000_000).catch((e) => console.log(e.message)); // → Insufficient funds

// Prisma equivalent:
// await prisma.$transaction(async (tx) => { await tx.account.update(...); ... });`,
  },
  {
    id: 'orm-vs-query-builder',
    group: 'Databases & ORMs',
    stars: 3,
    difficulty: 'Medium',
    q: 'ORM vs query builder vs raw SQL — trade-offs?',
    a: [
      "# ELI5",
      "Raw SQL is like cooking from scratch: full control, but you must know every step.",
      "A query builder is like a meal kit: ingredients are pre-measured, you still assemble the dish yourself.",
      "An ORM is like ordering from a restaurant menu: very easy, but you get what the kitchen decides, and special requests are harder.",
      "# What it is",
      "Raw SQL — you write SQL strings yourself and run them with a driver like `pg` or `mysql2`.",
      "Query builder — a library with JavaScript functions that build SQL for you, e.g. `knex('users').where('age', '>', 18)`. Examples: Knex, Kysely, Drizzle (also has ORM-like features).",
      "ORM (Object-Relational Mapper) — maps DB tables to models/objects and relations, so you work with objects instead of SQL. Examples: Prisma, TypeORM, Sequelize, MikroORM; Mongoose is an ODM (object document mapper) for MongoDB.",
      "Comparison:",
      "  Control and performance: raw SQL highest; query builder high; ORM lower for complex queries.",
      "  Productivity for CRUD: ORM highest; query builder medium; raw SQL lowest.",
      "  Type safety: Prisma, Drizzle and Kysely generate or infer TS types; raw SQL needs manual typing or tools like pgTyped.",
      "  Portability across databases: ORM and query builders high; raw SQL tied to a dialect.",
      "  Learning curve: raw SQL needs SQL knowledge (which you should have anyway); ORMs need learning their own API and quirks.",
      "  Hidden problems: ORMs can hide N+1 queries and generate inefficient SQL; raw SQL has nothing hidden.",
      "  Migrations: most ORMs and builders include migration tools.",
      "# How it works",
      "Raw SQL: you send `SELECT ... WHERE id = $1` with params; you map rows to objects yourself.",
      "Query builder: chained method calls produce a parameterized SQL string at runtime, then the driver runs it.",
      "ORM: you define a schema/models; the ORM generates SQL for CRUD and relation loading (`include`), tracks changes, and returns typed objects.",
      "Most ORMs offer a raw SQL escape hatch for complex queries.",
      "# Example walkthrough",
      "The same query 'adult users with their post count' is written three ways:",
      "  raw SQL with `pg` — explicit join and `GROUP BY`;",
      "  Knex query builder — the same SQL built with method chaining;",
      "  Prisma ORM — `findMany` with `_count`, no SQL at all.",
      "All three return something like `[{ name: 'Ann', posts: 3 }]`.",
      "# Why it matters / when to use",
      "ORM: CRUD-heavy apps, fast development, teams that want strong typing and migrations out of the box.",
      "Query builder: when you want SQL-like control and composable dynamic queries (filters) with safety and types.",
      "Raw SQL: complex reporting, window functions, CTEs, performance-critical queries, DB-specific features.",
      "Many real projects mix them: ORM for 90% of CRUD and raw SQL for the hard 10%.",
      "# Common mistakes",
      "Using an ORM without understanding the generated SQL. Fix: enable query logging and check EXPLAIN.",
      "Avoiding SQL completely: you cannot debug performance. Fix: learn SQL fundamentals.",
      "Building raw SQL by string concatenation for dynamic filters: injection risk. Fix: query builder or parameters.",
      "# Say this in the interview",
      "Raw SQL gives maximum control and performance but more boilerplate and manual typing; query builders like Knex, Kysely or Drizzle keep SQL-level control with composable, parameterized, often typed queries; ORMs like Prisma or TypeORM maximize productivity with models, relations and migrations but can hide inefficient SQL and N+1 issues. I usually use an ORM or typed query builder for most work and drop to raw SQL for complex reporting or hot paths, while always checking the generated queries.",
      "Follow-up: what does Prisma generate?",
      "  A typed client from `schema.prisma`, so query results are fully typed in TypeScript.",
    ],
    code: `import pg from 'pg';
import knexLib from 'knex';
import { PrismaClient } from '@prisma/client';

// 1) Raw SQL: full control, manual mapping
const pool = new pg.Pool();
const raw = await pool.query(
  \`SELECT u.name, COUNT(p.id)::int AS posts
     FROM users u LEFT JOIN posts p ON p.user_id = u.id
    WHERE u.age >= $1
 GROUP BY u.id\`, [18]);
console.log(raw.rows); // → [{ name: 'Ann', posts: 3 }]

// 2) Query builder: SQL-shaped JavaScript, parameterized automatically
const knex = knexLib({ client: 'pg', connection: process.env.DATABASE_URL });
const built = await knex('users as u')
  .leftJoin('posts as p', 'p.user_id', 'u.id')
  .where('u.age', '>=', 18)
  .groupBy('u.id')
  .select('u.name', knex.raw('COUNT(p.id)::int AS posts'));

// 3) ORM: work with models and relations, no SQL
const prisma = new PrismaClient();
const viaOrm = await prisma.user.findMany({
  where: { age: { gte: 18 } },
  select: { name: true, _count: { select: { posts: true } } },
}); // → [{ name: 'Ann', _count: { posts: 3 } }]`,
  },
  {
    id: 'n-plus-one',
    group: 'Databases & ORMs',
    stars: 3,
    difficulty: 'Medium',
    q: 'What is the N+1 query problem and how do you fix it?',
    a: [
      "# ELI5",
      "You need milk, eggs, bread and butter. The N+1 way: drive to the shop for the list, come home, then drive back separately for each item — 5 trips.",
      "The smart way: one trip with the whole list.",
      "N+1 queries are making many small trips to the database when one or two would do.",
      "# What it is",
      "The N+1 problem — you run 1 query to load a list of N items, then 1 extra query per item to load related data, for N+1 queries in total.",
      "Example: load 100 posts (1 query), then load each post's author separately (100 queries) = 101 queries.",
      "Each query has network round-trip overhead (often 1–5 ms), so 101 queries can take hundreds of ms instead of ~5 ms.",
      "It often hides inside ORMs with lazy loading (relations fetched automatically when accessed) or inside loops with `await`.",
      "In GraphQL it is very common, because each field resolver runs separately per item.",
      "# How it works",
      "How it appears:",
      "  `const posts = await getPosts()` → 1 query.",
      "  `for (const p of posts) p.author = await getUser(p.authorId)` → N queries, one per loop iteration.",
      "Fixes:",
      "  JOIN — fetch posts and authors in one SQL query.",
      "  Batch with `IN` — collect all author ids, run `SELECT * FROM users WHERE id = ANY($1)` once, then match in memory with a `Map`. Total: 2 queries.",
      "  ORM eager loading — Prisma `include`, TypeORM `relations`, Sequelize `include`, Mongoose `populate` (which batches with `$in`).",
      "  DataLoader — a small library that collects all `load(id)` calls made in the same tick and turns them into one batched query; standard in GraphQL servers.",
      "Detect it by turning on query logging, using APM traces (many identical queries in one request), or counting queries in tests.",
      "# Example walkthrough",
      "`fakeDb` counts queries.",
      "The N+1 version loops with `await getUser`, logging `queries: 4` for 3 posts.",
      "The batched version collects unique author ids, does one `getUsersByIds` call, and maps them with a `Map`, logging `queries: 2`.",
      "With 1000 posts the difference would be 1001 vs 2 queries.",
      "# Why it matters / when to use",
      "One of the most common causes of slow APIs; it gets worse as data grows, so it may be invisible in development with 5 rows and painful in production with 5000.",
      "Fixing it reduces DB load and latency dramatically.",
      "# Common mistakes",
      "Using `await` inside a loop for DB calls. Fix: batch the ids, or at least `Promise.all` (still N queries, but parallel — batching is better).",
      "Eager loading everything everywhere: huge joins and over-fetching. Fix: include only what each endpoint needs.",
      "GraphQL resolvers without DataLoader. Fix: one DataLoader per request per entity.",
      "# Say this in the interview",
      "N+1 is when you run one query for a list and then one more query per item to fetch related data, so 100 items cause 101 round trips. I fix it with a JOIN, with eager loading in the ORM like Prisma's include, or by batching ids into a single `WHERE id IN (...)` query, and in GraphQL with DataLoader. I detect it with query logging and tracing.",
      "Follow-up: how does DataLoader work?",
      "  It collects all `load(key)` calls in the same event-loop tick, calls your batch function once with all keys, and also caches results per request.",
    ],
    code: `let queries = 0;
const users = { 1: 'Ann', 2: 'Bob' };
const db = {
  getPosts: async () => { queries++; return [{ id: 1, authorId: 1 }, { id: 2, authorId: 2 }, { id: 3, authorId: 1 }]; },
  getUser: async (id) => { queries++; return { id, name: users[id] }; },
  // SQL: SELECT * FROM users WHERE id = ANY($1)
  getUsersByIds: async (ids) => { queries++; return ids.map((id) => ({ id, name: users[id] })); },
};

// BAD: N+1 — one query per post
queries = 0;
const posts1 = await db.getPosts();
for (const p of posts1) p.author = await db.getUser(p.authorId);
console.log('N+1 queries:', queries); // → N+1 queries: 4

// GOOD: batch — 2 queries no matter how many posts
queries = 0;
const posts2 = await db.getPosts();
const ids = [...new Set(posts2.map((p) => p.authorId))];
const byId = new Map((await db.getUsersByIds(ids)).map((u) => [u.id, u]));
for (const p of posts2) p.author = byId.get(p.authorId);
console.log('batched queries:', queries); // → batched queries: 2
console.log(posts2[2].author.name);        // → Ann

// Prisma: prisma.post.findMany({ include: { author: true } })`,
  },
  {
    id: 'sql-vs-nosql',
    group: 'Databases & ORMs',
    stars: 3,
    difficulty: 'Easy',
    q: 'When would you choose SQL vs NoSQL for a Node backend?',
    a: [
      "# ELI5",
      "A SQL database is like a set of neat spreadsheets with fixed columns, where rows in one sheet can point to rows in another, and strict rules keep everything tidy.",
      "A NoSQL document database is like a filing cabinet of folders: each folder can hold whatever papers it needs, in any layout.",
      "Spreadsheets are great when data is structured and connected; folders are great when data is varied or always read together.",
      "# What it is",
      "SQL (relational) databases — store data in tables with fixed columns and types, linked by foreign keys, queried with SQL. Examples: PostgreSQL, MySQL, SQL Server, SQLite.",
      "  Schema — the defined structure (tables, columns, types, constraints).",
      "  Joins — combining rows from multiple tables in one query.",
      "  Strong ACID transactions across many rows and tables.",
      "NoSQL — 'not only SQL', a family of non-relational databases:",
      "  Document stores (MongoDB, Firestore) — JSON-like documents, flexible schema.",
      "  Key-value stores (Redis, DynamoDB) — super fast lookups by key.",
      "  Wide-column (Cassandra) — massive write throughput across many servers.",
      "  Graph (Neo4j) — relationships are first-class (social networks, recommendations).",
      "Comparison:",
      "  Structure: SQL fixed schema, enforced by the DB; document NoSQL flexible, enforced by the app.",
      "  Relationships: SQL excels (joins, foreign keys); NoSQL usually embeds or denormalizes data (duplicates it for fast reads).",
      "  Transactions: SQL strong by default; modern MongoDB supports multi-document transactions but they are less central.",
      "  Scaling: SQL usually scales up plus read replicas (sharding is harder); many NoSQL systems scale out horizontally by design.",
      "  Querying: SQL is very powerful for ad-hoc analytics; NoSQL queries are designed around known access patterns.",
      "# How it works",
      "SQL design: normalize data into tables (`users`, `orders`, `order_items`) and join them when reading.",
      "Document design: shape documents around how you read them, e.g. an `order` document that embeds its items.",
      "Key-value design: decide keys from your access patterns (e.g. DynamoDB single-table design with partition and sort keys).",
      "Many systems use both (polyglot persistence): Postgres as the source of truth, Redis for cache/sessions, Elasticsearch for search.",
      "# Example walkthrough",
      "The snippet stores the same order in Postgres (two tables, joined when read) and in MongoDB (one document with embedded items).",
      "Postgres enforces types and foreign keys; Mongo reads the whole order in one lookup without joins.",
      "# Why it matters / when to use",
      "Choose SQL (often Postgres) by default for most business apps: users, orders, payments, inventory — relational data with integrity needs and reporting.",
      "Choose document NoSQL for flexible or rapidly changing structures, content/catalogs with varied attributes, and data read as whole aggregates.",
      "Choose key-value/wide-column for huge scale with simple access patterns (sessions, IoT events, leaderboards).",
      "Postgres also has `JSONB`, giving flexible document fields inside a relational DB.",
      "# Common mistakes",
      "Picking MongoDB just because it is JSON and Node is JavaScript. Fix: choose by data shape and access patterns.",
      "Modeling MongoDB like SQL with lots of references and manual joins. Fix: embed data that is read together.",
      "Assuming NoSQL means no schema at all: the schema just moves into application code. Fix: validate with Mongoose schemas or Zod.",
      "# Say this in the interview",
      "I choose SQL, usually Postgres, when data is relational and integrity matters: it gives schemas, joins, constraints and strong transactions, and covers most business apps. I choose NoSQL when the data is flexible or naturally read as whole documents, or when I need massive horizontal scale with simple access patterns, like MongoDB for catalogs or DynamoDB/Redis for key-value workloads. Often I combine them, with Postgres as the source of truth plus Redis for caching.",
      "Follow-up: what is denormalization?",
      "  Storing duplicated data to avoid joins and speed up reads, at the cost of keeping the copies in sync on writes.",
    ],
    code: `// SQL (PostgreSQL): normalized tables + join
/*
CREATE TABLE orders (id SERIAL PRIMARY KEY, user_id INT NOT NULL REFERENCES users(id));
CREATE TABLE order_items (
  order_id INT REFERENCES orders(id), product TEXT NOT NULL, qty INT CHECK (qty > 0)
);
*/
import pg from 'pg';
const pool = new pg.Pool();
const { rows } = await pool.query(
  'SELECT o.id, i.product, i.qty FROM orders o JOIN order_items i ON i.order_id = o.id WHERE o.id = $1',
  [1],
);
console.log(rows); // → [{ id: 1, product: 'Pen', qty: 2 }, { id: 1, product: 'Ink', qty: 1 }]

// NoSQL (MongoDB): one document, items embedded, no join
import { MongoClient } from 'mongodb';
const mongo = new MongoClient('mongodb://localhost:27017');
const orders = mongo.db('shop').collection('orders');
await orders.insertOne({ _id: 1, userId: 7, items: [{ product: 'Pen', qty: 2 }, { product: 'Ink', qty: 1 }] });
console.log(await orders.findOne({ _id: 1 }));
// → { _id: 1, userId: 7, items: [ { product: 'Pen', qty: 2 }, { product: 'Ink', qty: 1 } ] }`,
  },
  {
    id: 'migrations',
    group: 'Databases & ORMs',
    stars: 2,
    difficulty: 'Easy',
    q: 'What are database migrations?',
    a: [
      "# ELI5",
      "When you renovate a house, you keep a numbered list of every change: 1) add a window, 2) paint the kitchen, 3) build a shed.",
      "A new builder can read the list and make any copy of the house look exactly the same, in the right order.",
      "Migrations are that numbered change list for your database structure.",
      "# What it is",
      "Migration — a versioned file that describes one change to the database schema (create a table, add a column, add an index), usually with an `up` (apply) and sometimes a `down` (undo) step.",
      "Schema — the structure of the database: tables, columns, types, indexes, constraints.",
      "Migration history table — a table the tool creates (e.g. `knex_migrations`, `_prisma_migrations`) recording which migrations have already run in that database.",
      "Tools in Node: Prisma Migrate, Knex migrations, TypeORM migrations, Sequelize CLI, Drizzle Kit, node-pg-migrate; also language-independent ones like Flyway or Liquibase.",
      "Seeds — scripts that insert starting or test data; different from migrations, which change structure.",
      "# How it works",
      "A developer creates a migration file, e.g. `20261110_add_phone_to_users`.",
      "The file is committed to git with the code that needs it, and reviewed in a PR.",
      "In each environment (local, CI, staging, production), the tool:",
      "  reads the history table to see which migrations already ran;",
      "  runs the pending ones in order, usually inside a transaction;",
      "  records them as applied.",
      "In production, migrations usually run as a deploy step (CI job, Kubernetes Job or init container) before the new app version starts.",
      "Zero-downtime changes use the expand-and-contract pattern:",
      "  expand — add the new column (nullable), deploy code that writes both;",
      "  backfill existing data;",
      "  contract — switch reads, then remove the old column in a later migration.",
      "# Example walkthrough",
      "The Knex migration's `up` adds a nullable `phone` column and an index; `down` removes them.",
      "`npx knex migrate:latest` applies it and logs `Batch 1 run: 1 migrations`; `migrate:rollback` runs `down`.",
      "The Prisma comment shows the equivalent workflow: edit `schema.prisma`, then `prisma migrate dev` generates SQL, and `prisma migrate deploy` applies it in production.",
      "# Why it matters / when to use",
      "Every environment and every developer gets the exact same schema, reproducibly.",
      "Schema changes are reviewed, versioned and auditable like code, and can be rolled back if needed.",
      "Never manually edit production schemas by hand in a DB GUI.",
      "# Common mistakes",
      "Editing an already-applied migration file: environments drift apart. Fix: create a new migration.",
      "Breaking changes in one step (renaming/dropping a column used by running code): downtime. Fix: expand and contract.",
      "Adding a NOT NULL column without a default to a big table, or building an index while locking the table. Fix: add nullable first, backfill, and use `CREATE INDEX CONCURRENTLY` in Postgres.",
      "Running migrations from every app instance at startup simultaneously. Fix: one dedicated migration step (tools also use locks).",
      "# Say this in the interview",
      "Migrations are versioned, ordered scripts that evolve the database schema, stored in git alongside the code. A tool like Prisma Migrate or Knex tracks which ones ran in a history table and applies pending ones in order, so every environment gets the same schema. I run them as a separate deploy step and use the expand-and-contract pattern for zero-downtime changes.",
      "Follow-up: should down migrations exist?",
      "  They help in development, but in production teams often roll forward with a new fixing migration because dropping data is risky.",
    ],
    code: `// migrations/20261110120000_add_phone_to_users.js (Knex)
export async function up(knex) {
  await knex.schema.alterTable('users', (t) => {
    t.string('phone', 20).nullable(); // nullable first = safe on big tables
    t.index(['phone']);
  });
}

export async function down(knex) {
  await knex.schema.alterTable('users', (t) => {
    t.dropIndex(['phone']);
    t.dropColumn('phone');
  });
}

// $ npx knex migrate:latest   → Batch 1 run: 1 migrations
// $ npx knex migrate:rollback → Batch 1 rolled back: 1 migrations

// Prisma equivalent:
//   1. add  phone String?  to model User in schema.prisma
//   2. npx prisma migrate dev --name add_phone   (creates + applies SQL locally)
//   3. npx prisma migrate deploy                 (applies pending migrations in prod)`,
  },
  // ───────────────────────── Testing, Debugging & Production ─────────────────────────
  {
    id: 'graceful-shutdown',
    group: 'Testing, Debugging & Production',
    stars: 5,
    difficulty: 'Medium',
    q: 'How do you implement graceful shutdown in a Node server?',
    a: [
      "# ELI5",
      "When a shop closes for the night, the owner does not throw customers out mid-purchase.",
      "They lock the door so no new customers enter, let the people inside finish paying, then turn off the lights and lock the safe.",
      "If someone is taking forever, after a while the owner closes anyway.",
      "Graceful shutdown is doing exactly that with your server.",
      "# What it is",
      "Graceful shutdown — stopping a server in a controlled way: stop accepting new work, finish in-flight work, release resources, then exit.",
      "In-flight request — a request that has started but not finished yet.",
      "Signals — messages the operating system sends to a process:",
      "  `SIGTERM` — 'please terminate'; sent by Kubernetes, Docker (`docker stop`), PM2 and systemd during deploys and scaling.",
      "  `SIGINT` — sent when you press Ctrl+C.",
      "  `SIGKILL` — immediate kill; cannot be caught; sent if you do not exit in time (Kubernetes default grace period is 30 s).",
      "Resources to release: HTTP server, DB pools, Redis clients, message queue consumers, open file handles, timers.",
      "# How it works",
      "1. Listen with `process.on('SIGTERM', shutdown)` and `process.on('SIGINT', shutdown)`.",
      "2. Mark the app as shutting down so the readiness check (`/ready`) returns 503 and the load balancer stops sending new traffic.",
      "3. Call `server.close()` — stops accepting new connections; its callback fires when existing connections finish.",
      "  `server.closeIdleConnections()` closes idle keep-alive connections right away (Node 18.2+); `closeAllConnections()` force-closes everything as a last resort.",
      "4. Stop background work: queue workers stop taking new jobs and finish current ones; intervals are cleared.",
      "5. Close resources: `await pool.end()`, `await redis.quit()`.",
      "6. Exit with `process.exit(0)`.",
      "7. Set a safety timeout (e.g. 10–25 s, below the orchestrator's grace period) that force-exits with code 1 if something hangs.",
      "8. Guard against running shutdown twice if two signals arrive.",
      "In Docker, make sure Node receives the signal: use exec-form `CMD [\"node\", \"server.js\"]` (not `npm start` or a shell form) or `docker run --init`.",
      "# Example walkthrough",
      "`/slow` takes 5 seconds to respond, so we can test.",
      "On Ctrl+C or `kill -TERM <pid>`, shutdown logs `SIGTERM received`, sets `shuttingDown`, and `/ready` starts returning 503.",
      "`server.close` waits for the in-progress `/slow` request to finish, then closes the DB pool and exits with 0.",
      "If closing takes more than 10 seconds, the `unref`'d timer force-exits with 1.",
      "# Why it matters / when to use",
      "Every deploy, autoscale-in or node restart sends SIGTERM; without graceful shutdown, users get dropped connections and 502 errors.",
      "Prevents half-finished work: partially processed jobs, unflushed logs, unclosed transactions.",
      "Essential for zero-downtime deployments in Kubernetes and ECS.",
      "# Common mistakes",
      "Calling `process.exit()` immediately on SIGTERM: kills in-flight requests. Fix: close server first.",
      "No timeout: hanging keep-alive connections keep the process alive until SIGKILL. Fix: force-exit timer and close idle connections.",
      "Running via `npm start` in Docker: npm may not forward signals, so Node never sees SIGTERM. Fix: `CMD [\"node\", ...]` or `--init`.",
      "Not failing the readiness probe first: the load balancer keeps sending traffic to a closing pod. Fix: return 503 on `/ready` and wait a few seconds before closing.",
      "# Say this in the interview",
      "On SIGTERM or SIGINT I flip a flag so the readiness probe fails, call server.close() to stop accepting new connections and let in-flight requests finish, stop queue consumers, then close the database and Redis connections and exit with code 0. I add a force-exit timeout shorter than the orchestrator's grace period, and make sure in Docker the node process actually receives the signal.",
      "Follow-up: what about uncaught exceptions?",
      "  Log them, then shut down (gracefully if possible) and exit with a non-zero code; the process state may be corrupted, so let the supervisor restart it.",
    ],
    code: `import http from 'node:http';

let shuttingDown = false;
const db = { end: async () => console.log('db pool closed') }; // stand-in for pg.Pool

const server = http.createServer(async (req, res) => {
  if (req.url === '/ready') {
    res.statusCode = shuttingDown ? 503 : 200; // LB stops routing when 503
    return res.end();
  }
  if (req.url === '/slow') await new Promise((r) => setTimeout(r, 5000));
  res.end('done\\n');
}).listen(3000);

async function shutdown(signal) {
  if (shuttingDown) return;            // ignore repeated signals
  shuttingDown = true;
  console.log(signal, 'received, shutting down...');

  const force = setTimeout(() => { console.error('forced exit'); process.exit(1); }, 10_000);
  force.unref(); // do not keep the process alive just for this timer

  server.close(async () => {           // waits for in-flight requests
    await db.end();
    console.log('clean exit');
    process.exit(0);
  });
  server.closeIdleConnections();       // drop idle keep-alive sockets now
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
// curl localhost:3000/slow & then Ctrl+C →
// SIGINT received, shutting down... → (5s later) done → db pool closed → clean exit`,
  },
  {
    id: 'testing-node',
    group: 'Testing, Debugging & Production',
    stars: 4,
    difficulty: 'Easy',
    q: 'How do you test a Node.js backend?',
    a: [
      "# ELI5",
      "A car factory tests each bolt and gear by itself (unit tests), then tests the engine with all its parts together (integration tests), then a test driver drives the full car on a road (end-to-end tests).",
      "There are many cheap small tests and only a few expensive full drives.",
      "Backend testing works the same way.",
      "# What it is",
      "Automated test — code that runs your code with known inputs and checks (asserts) the outputs, so you catch bugs before users do.",
      "Test pyramid — lots of fast unit tests at the bottom, fewer integration tests in the middle, a few slow end-to-end (E2E) tests at the top.",
      "  Unit test — tests one function or module in isolation, mocking its dependencies; milliseconds each.",
      "  Integration test — tests several parts together, e.g. an HTTP route + validation + a real test database.",
      "  E2E test — tests the deployed system the way a user/client would (full stack, real network).",
      "Test runner — the program that finds and runs tests and reports results:",
      "  `node:test` — built into Node (stable since Node 20) with `node --test`, plus `node:assert`.",
      "  Vitest — fast, modern, great TypeScript/ESM support, Jest-compatible API.",
      "  Jest — very popular, many existing projects use it.",
      "Supertest — sends HTTP requests to an Express/HTTP app in tests without starting a real port.",
      "Testcontainers — starts real Postgres/Redis in Docker for integration tests.",
      "Coverage — the percentage of code lines/branches executed by tests (`node --test --experimental-test-coverage`, `vitest --coverage`).",
      "# How it works",
      "Structure the app so it is testable: export the `app` separately from `app.listen()`, keep logic in services, inject dependencies.",
      "Each test follows Arrange–Act–Assert:",
      "  Arrange — set up inputs and state;",
      "  Act — call the function or endpoint;",
      "  Assert — check the result.",
      "Use hooks (`beforeEach`, `afterEach`) to reset DB tables or mocks so tests do not affect each other.",
      "Run tests in CI on every pull request; block merging if they fail.",
      "# Example walkthrough",
      "`add` is unit-tested with `node:test` and `assert.equal`.",
      "The Express app is integration-tested with Supertest: `GET /health` must return 200 and `{ status: 'ok' }`, and `POST /users` with a bad body must return 400.",
      "Running `node --test` prints a summary like `pass 3, fail 0`.",
      "# Why it matters / when to use",
      "Gives confidence to refactor and deploy often without breaking things.",
      "Acts as living documentation of how code should behave.",
      "Catches regressions (old bugs coming back) automatically in CI.",
      "# Common mistakes",
      "Only writing E2E tests: slow and flaky. Fix: follow the pyramid.",
      "Mocking everything, including the DB, in integration tests: tests pass but production fails. Fix: use a real test DB (Docker/Testcontainers) for integration.",
      "Tests that depend on each other or on order. Fix: reset state in `beforeEach`.",
      "Calling `app.listen` in the module tests import: port conflicts. Fix: separate `app.js` and `server.js`.",
      "Chasing 100% coverage instead of testing important behaviour. Fix: focus on business logic and edge cases.",
      "# Say this in the interview",
      "I follow the test pyramid: many fast unit tests for services and utilities with Vitest, Jest or the built-in node:test runner; integration tests that hit routes with Supertest against a real test database in Docker; and a few E2E tests for critical flows. I keep the app separate from the listen call, reset state between tests, mock only external services, and run everything in CI on each pull request.",
      "Follow-up: how do you test code that calls a third-party API?",
      "  Mock it at the boundary (e.g. `vi.mock`, MSW, or `nock`) in unit/integration tests, and keep a small number of contract or sandbox tests against the real API.",
    ],
    code: `// app.test.js — run with: node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';

// --- code under test (normally imported from src/) ---
export const add = (a, b) => a + b;
const app = express();
app.use(express.json());
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.post('/users', (req, res) =>
  req.body.email ? res.status(201).json(req.body) : res.status(400).json({ error: 'email required' }));

// --- unit test ---
test('add() sums numbers', () => {
  assert.equal(add(2, 3), 5);
});

// --- integration tests (no real port needed) ---
test('GET /health returns ok', async () => {
  const res = await request(app).get('/health');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { status: 'ok' });
});

test('POST /users validates body', async () => {
  const res = await request(app).post('/users').send({});
  assert.equal(res.status, 400);
});
// → tests 3 | pass 3 | fail 0`,
  },
  {
    id: 'logging',
    group: 'Testing, Debugging & Production',
    stars: 4,
    difficulty: 'Easy',
    q: 'What are best practices for logging in Node?',
    a: [
      "# ELI5",
      "A ship's captain keeps a logbook: time, what happened, how serious. When something goes wrong, investigators read the log to understand why.",
      "If the captain wrote messy notes on random napkins, nobody could find anything.",
      "Good logging is a tidy, searchable logbook for your app.",
      "# What it is",
      "Log — a record of an event in your app (request handled, error thrown, job finished), written with a timestamp.",
      "Structured logging — writing logs as JSON objects with fields (`level`, `time`, `msg`, `userId`, `requestId`) instead of plain sentences, so tools can search and filter them.",
      "Log levels — how important a log is: `fatal`, `error`, `warn`, `info`, `debug`, `trace`. Production usually shows `info` and above.",
      "Correlation / request id — a unique id per request included in every log line for that request, so you can follow one request across services.",
      "Log aggregation — shipping logs from all instances to one place to search: ELK/OpenSearch, Grafana Loki, Datadog, CloudWatch, Google Cloud Logging.",
      "Libraries: Pino (very fast, JSON by default, common choice), Winston (flexible transports).",
      "# How it works",
      "Create one logger instance with a level from config (`LOG_LEVEL`).",
      "Add request logging middleware (e.g. `pino-http`) that assigns a request id and logs method, URL, status and duration when each response finishes.",
      "Use child loggers (`logger.child({ requestId })`) so context fields appear on every line automatically.",
      "Write logs to stdout (standard output) as JSON; the platform (Docker, Kubernetes, cloud agent) collects and ships them. This follows the twelve-factor app approach.",
      "Redact sensitive fields (passwords, tokens, card numbers, cookies) using the logger's redact option.",
      "In development, pretty-print with `pino-pretty`; in production keep raw JSON.",
      "Log errors with the error object (`logger.error({ err }, 'msg')`) so the stack trace is captured.",
      "# Example walkthrough",
      "Pino is created with level `info` and redaction of `req.headers.authorization` and `password` fields.",
      "`pino-http` adds `req.log` with a generated request id.",
      "The route logs `order created` with `orderId`; the output is one JSON line containing `level`, `time`, `reqId`, `orderId`, `msg`.",
      "The password in the body would appear as `[Redacted]` if logged.",
      "# Why it matters / when to use",
      "Logs are often the only way to debug production incidents after the fact.",
      "Structured logs let you answer questions like 'show all errors for user 42 in the last hour'.",
      "Combined with metrics and traces, logs make up observability.",
      "# Common mistakes",
      "Using `console.log` everywhere with unstructured text. Fix: a structured logger with levels.",
      "Logging secrets or personal data (passwords, tokens, full card numbers). Fix: redaction and careful field choice.",
      "Logging too much at `info` (every loop iteration): costs money and hides important events. Fix: use `debug` for noise.",
      "Writing log files inside containers. Fix: log to stdout and let the platform ship them.",
      "Logging an error as a string (`'failed ' + err`): loses the stack trace. Fix: pass the error object.",
      "# Say this in the interview",
      "I use a structured JSON logger like Pino with log levels configured per environment, write to stdout, and let the platform ship logs to a central system. Every request gets a correlation id that appears in each log line through child loggers, I log errors with their stack traces, and I redact secrets and personal data. Logs work together with metrics and tracing for observability.",
      "Follow-up: why is Pino fast?",
      "  It does minimal work on the main thread, serializes JSON efficiently, and can move transport/formatting work to worker threads or separate processes.",
    ],
    code: `import express from 'express';
import pino from 'pino';
import { pinoHttp } from 'pino-http';
import { randomUUID } from 'node:crypto';

const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  redact: ['req.headers.authorization', '*.password'], // never log secrets
});

const app = express();
app.use(express.json());
app.use(pinoHttp({ logger, genReqId: (req) => req.headers['x-request-id'] ?? randomUUID() }));

app.post('/orders', (req, res) => {
  req.log.info({ orderId: 42 }, 'order created'); // req.log already has reqId
  res.status(201).json({ id: 42 });
});

app.use((err, req, res, next) => {
  req.log.error({ err }, 'request failed'); // keeps the stack trace
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(3000, () => logger.info({ port: 3000 }, 'server started'));
// → {"level":30,"time":1730000000000,"reqId":"a1b2...","orderId":42,"msg":"order created"}`,
  },
  {
    id: 'debugging-node',
    group: 'Testing, Debugging & Production',
    stars: 3,
    difficulty: 'Easy',
    q: 'How do you debug a Node.js application?',
    a: [
      "# ELI5",
      "Debugging with `console.log` is like asking someone to shout out what they are doing every few steps.",
      "Using a debugger is like being able to freeze time, walk around the room, look in every pocket, and then unfreeze one step at a time.",
      "Both help; freezing time is far more powerful for tricky problems.",
      "# What it is",
      "Debugging — finding out why code behaves differently from what you expect, then fixing it.",
      "Debugger — a tool that pauses your running program so you can inspect variables, the call stack and step through code line by line.",
      "Breakpoint — a marker on a line where execution pauses; the `debugger;` statement in code acts as one when a debugger is attached.",
      "Call stack — the list of functions currently running, newest on top; it shows how you got to the current line.",
      "Stepping: step over (run the current line), step into (enter the function being called), step out (finish the current function).",
      "Inspector — Node's built-in debugging protocol, enabled with `node --inspect app.js` (or `--inspect-brk` to pause on the first line).",
      "Clients: Chrome DevTools (open `chrome://inspect`), VS Code's built-in debugger (Run and Debug or a JavaScript Debug Terminal), WebStorm.",
      "# How it works",
      "Start the app with the inspector: `node --inspect app.js`; Node prints a WebSocket URL on port 9229.",
      "Attach a client (VS Code auto-attach or Chrome DevTools).",
      "Set breakpoints by clicking line numbers; trigger the code (e.g. send a request).",
      "When paused, inspect local variables, hover values, watch expressions, and the call stack.",
      "Step through to see where values become wrong; use conditional breakpoints (pause only if `id === 42`) and logpoints (log without editing code).",
      "Source maps let you debug TypeScript source even though Node runs compiled JS (`--enable-source-maps`; tools like tsx handle it).",
      "Other techniques:",
      "  Structured logs with request ids to trace production issues.",
      "  `NODE_DEBUG=http,net` prints internal debug output of core modules.",
      "  `--trace-warnings`, `--trace-uncaught` for more context on warnings/errors.",
      "  `util.inspect(obj, { depth: null })` to print deep objects fully.",
      "  CPU profiles and heap snapshots for performance and memory problems.",
      "Never expose the inspector port publicly; it allows running arbitrary code.",
      "# Example walkthrough",
      "The code has a bug: `total` uses `price * qty` but `qty` arrives as a string from a query parameter in some cases.",
      "The `debugger;` statement pauses execution when run with `node --inspect-brk`, letting you see `item.qty` is `'2'`.",
      "The fix converts with `Number(item.qty)`; the output changes from string concatenation weirdness to `total: 7`.",
      "# Why it matters / when to use",
      "A debugger finds bugs faster than adding and removing dozens of log lines.",
      "Understanding the call stack and async stack traces helps with tricky async bugs.",
      "In production, where you cannot pause, good logging, tracing and error tracking (Sentry) are your debugger.",
      "# Common mistakes",
      "Leaving `debugger;` statements and stray `console.log`s in committed code. Fix: lint rules (`no-debugger`, `no-console`).",
      "Debugging only with logs for complex state bugs. Fix: learn breakpoints and stepping.",
      "Exposing `--inspect=0.0.0.0` in production. Fix: bind to localhost and use SSH tunnels if needed.",
      "Reading only the first line of an error. Fix: read the full stack trace — it points to the exact file and line.",
      "# Say this in the interview",
      "For local debugging I run Node with `--inspect` or use VS Code's JavaScript Debug Terminal, set breakpoints including conditional ones, and step through while inspecting variables and the call stack, with source maps for TypeScript. In production I rely on structured logs with request ids, error tracking with stack traces, and CPU or heap profiles for performance and memory problems.",
      "Follow-up: --inspect vs --inspect-brk?",
      "  `--inspect-brk` pauses on the first line so you can attach before any code runs, useful for startup bugs.",
    ],
    code: `// debug.js — run: node --inspect-brk debug.js, then open chrome://inspect
// (or VS Code: JavaScript Debug Terminal → node debug.js)

const cart = [
  { name: 'pen', price: 1.5, qty: 2 },
  { name: 'ink', price: 4, qty: '1' }, // bug: string from a query param
];

function total(items) {
  let sum = 0;
  for (const item of items) {
    debugger; // execution pauses here when a debugger is attached
    sum += item.price * Number(item.qty); // fix: convert qty to a number
  }
  return sum;
}

console.log('total:', total(cart)); // → total: 7

// Handy extras:
// NODE_DEBUG=http node app.js        → core module debug output
// node --trace-warnings app.js       → stack traces for warnings
// console.dir(obj, { depth: null })  → print nested objects fully`,
  },
  {
    id: 'mocking',
    group: 'Testing, Debugging & Production',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do you mock dependencies in Node tests?',
    a: [
      "# ELI5",
      "When actors rehearse a sword fight, they use foam swords instead of real ones: same moves, nobody gets hurt.",
      "When testing, you replace real things that are slow, costly or dangerous (sending real emails, charging real cards) with fake stand-ins.",
      "Those stand-ins are mocks.",
      "# What it is",
      "Dependency — something your code uses but does not own: a database, an email service, a payment API, the clock, random numbers.",
      "Test double — the general name for any fake used in tests. Types:",
      "  Stub — returns pre-set answers (`getUser` always returns Ann).",
      "  Mock — a fake that also records how it was called, so you can assert 'sendEmail was called once with this address'.",
      "  Spy — wraps a real function to record calls while still running it (or not).",
      "  Fake — a simple working implementation, like an in-memory repository instead of Postgres.",
      "Tools:",
      "  `node:test` — `mock.fn()`, `mock.method(obj, 'name')`, `mock.timers`, and `mock.module()` (experimental, behind a flag in current Node versions).",
      "  Vitest — `vi.fn()`, `vi.spyOn()`, `vi.mock('module')`, `vi.useFakeTimers()`.",
      "  Jest — `jest.fn()`, `jest.spyOn()`, `jest.mock()`.",
      "  HTTP-level: `nock` or MSW (Mock Service Worker) intercept outgoing HTTP requests; undici's `MockAgent` for `fetch`.",
      "Dependency injection (DI) — passing dependencies into a function or class instead of importing them inside, which makes swapping in fakes trivial.",
      "# How it works",
      "Option 1, dependency injection (simplest, framework-free):",
      "  Write `createUserService({ db, mailer })`; in tests pass fake `db` and `mailer` objects.",
      "Option 2, module mocking:",
      "  `vi.mock('./mailer.js', () => ({ send: vi.fn() }))` replaces the module for every importer in that test file.",
      "Option 3, spying on an object's method:",
      "  `mock.method(mailer, 'send')` replaces it and records calls; restore afterwards.",
      "Option 4, HTTP interception:",
      "  The code really calls `fetch`, but MSW/nock answer with fake responses, so no network is used.",
      "Then assert on results and on interactions (call count, arguments).",
      "Reset mocks between tests (`mock.restoreAll()`, `vi.restoreAllMocks()`) so they do not leak.",
      "# Example walkthrough",
      "`createSignup` receives `db` and `mailer` through DI.",
      "The test passes a fake db (`mock.fn` returning `{ id: 1 }`) and a fake mailer.",
      "It asserts the result is `{ id: 1 }`, the mailer was called once, and the first argument was the user's email.",
      "No real database or email provider is touched, so the test runs in milliseconds.",
      "# Why it matters / when to use",
      "Unit tests become fast, deterministic (same result every time) and free of side effects.",
      "You can simulate hard-to-create situations: API timeouts, 500 errors, specific dates.",
      "Mock at the edges of your system (external APIs, email, payments), not your own core logic.",
      "# Common mistakes",
      "Over-mocking: tests only verify that mocks were called, not real behaviour, and break on every refactor. Fix: mock boundaries only; use real DBs in integration tests.",
      "Forgetting to restore mocks: later tests behave strangely. Fix: restore in `afterEach`.",
      "Mocking ESM modules with Jest-style hoisting that does not work for ESM. Fix: use Vitest, DI, or the documented ESM approach for your runner.",
      "Real time-based logic in tests (waiting 5 s). Fix: fake timers.",
      "# Say this in the interview",
      "I prefer dependency injection so tests can pass fake implementations directly, and otherwise use the runner's tools: `mock.fn`/`mock.method` in node:test or `vi.fn`/`vi.mock` in Vitest, plus MSW or nock to intercept outgoing HTTP. I mock only external boundaries like email, payments and third-party APIs, assert both on results and on how the mock was called, fake timers when time matters, and restore mocks after each test.",
      "Follow-up: mock vs stub?",
      "  A stub just supplies canned answers; a mock also records and lets you verify how it was called.",
    ],
    code: `import { test, mock } from 'node:test';
import assert from 'node:assert/strict';

// Code under test uses dependency injection
function createSignup({ db, mailer }) {
  return async (email) => {
    const user = await db.insertUser({ email });
    await mailer.send(email, 'Welcome!');
    return user;
  };
}

test('signup saves user and sends welcome email', async () => {
  const db = { insertUser: mock.fn(async () => ({ id: 1 })) };   // stub + recorder
  const mailer = { send: mock.fn(async () => {}) };              // mock

  const signup = createSignup({ db, mailer });
  const user = await signup('ann@x.com');

  assert.deepEqual(user, { id: 1 });
  assert.equal(mailer.send.mock.callCount(), 1);
  assert.deepEqual(mailer.send.mock.calls[0].arguments, ['ann@x.com', 'Welcome!']);
});

test('fake timers', () => {
  mock.timers.enable({ apis: ['setTimeout'] });
  let fired = false;
  setTimeout(() => (fired = true), 5000);
  mock.timers.tick(5000); // no real waiting
  assert.equal(fired, true);
  mock.timers.reset();
});
// → tests 2 | pass 2`,
  },
  {
    id: 'health-checks-monitoring',
    group: 'Testing, Debugging & Production',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do you monitor a Node service in production?',
    a: [
      "# ELI5",
      "A hospital patient wears monitors for heart rate, temperature and oxygen. Nurses see trends on screens and an alarm beeps when something goes wrong.",
      "Production monitoring is putting those monitors on your app, with dashboards and alarms, so you notice problems before users complain.",
      "# What it is",
      "Monitoring / observability — being able to understand what your system is doing from the outside, using three main signals (the 'three pillars'):",
      "  Metrics — numbers over time: request rate, error rate, latency percentiles, CPU, memory, event loop lag.",
      "  Logs — detailed event records (see logging).",
      "  Traces — the path of one request across services and DB calls, with timing for each step (distributed tracing).",
      "Health checks — endpoints that report if the service is OK:",
      "  Liveness (`/healthz` or `/live`) — is the process alive and not stuck? If it fails, the orchestrator restarts it. Keep it simple; do not check the DB here.",
      "  Readiness (`/ready`) — can it serve traffic now (DB connected, warmed up, not shutting down)? If it fails, the load balancer stops sending traffic but does not restart.",
      "  Startup probe — gives slow-starting apps time before liveness checks begin (Kubernetes).",
      "Golden signals (from Google SRE): latency, traffic, errors, saturation. RED method for services: Rate, Errors, Duration.",
      "Tools: Prometheus + Grafana (`prom-client` in Node), OpenTelemetry (vendor-neutral standard for metrics/traces/logs), Datadog, New Relic, Sentry (error tracking), uptime checkers.",
      "SLO (Service Level Objective) — a target like '99.9% of requests succeed under 300 ms over 30 days'; alerts are based on it.",
      "# How it works",
      "Expose health endpoints and wire them to Kubernetes probes or load balancer health checks.",
      "Instrument the app:",
      "  `prom-client` collects default Node metrics (heap, GC, event loop lag) plus custom ones like an HTTP duration histogram, exposed on `/metrics` for Prometheus to scrape.",
      "  OpenTelemetry auto-instrumentation adds traces for HTTP, Express, pg, Redis with almost no code changes.",
      "Ship logs with request/trace ids so you can jump from a trace to its logs.",
      "Build dashboards for RED metrics per endpoint and resource usage.",
      "Set alerts on symptoms users feel (error rate, p99 latency, SLO burn rate), routed to on-call (PagerDuty, Slack).",
      "Capture unhandled exceptions with an error tracker to get stack traces and frequency.",
      "# Example walkthrough",
      "`/healthz` always returns 200 if the process can respond.",
      "`/ready` runs `SELECT 1` against the DB with a short timeout and returns 503 if it fails.",
      "A histogram records request duration labeled by method, route and status.",
      "`/metrics` outputs Prometheus text such as `http_request_duration_seconds_bucket{route=\"/orders\",le=\"0.1\"} 42`.",
      "# Why it matters / when to use",
      "You find out about outages from alerts, not angry users.",
      "Metrics show trends (memory leak growing, latency creeping up) before they become incidents.",
      "Traces quickly reveal which dependency is slow in a microservice system.",
      "# Common mistakes",
      "Liveness probe that checks the database: a DB blip restarts every pod and makes things worse. Fix: DB checks only in readiness.",
      "Alerting on everything (CPU 70%): alert fatigue. Fix: alert on user-facing symptoms and SLOs.",
      "High-cardinality metric labels (user id, full URL with ids): explodes metric storage. Fix: use route patterns like `/users/:id`.",
      "No monitoring of the event loop. Fix: track event loop lag; it is the key Node-specific health signal.",
      "# Say this in the interview",
      "I expose liveness and readiness endpoints for the orchestrator, with readiness checking dependencies like the database. I collect metrics with prom-client or OpenTelemetry, focusing on the RED signals per route plus Node-specific ones like event loop lag and heap usage, add distributed tracing and structured logs correlated by trace id, track errors with a tool like Sentry, and alert on SLO-based symptoms such as error rate and p99 latency.",
      "Follow-up: liveness vs readiness?",
      "  Liveness failing means restart the container; readiness failing means stop sending it traffic for now.",
    ],
    code: `import express from 'express';
import client from 'prom-client';
import pg from 'pg';

const pool = new pg.Pool();
const app = express();

client.collectDefaultMetrics(); // heap, GC, event loop lag, CPU...
const httpDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.05, 0.1, 0.3, 1, 3],
});

app.use((req, res, next) => {
  const end = httpDuration.startTimer();
  res.on('finish', () =>
    end({ method: req.method, route: req.route?.path ?? 'unknown', status: res.statusCode }));
  next();
});

app.get('/healthz', (req, res) => res.send('ok')); // liveness: process alive

app.get('/ready', async (req, res) => {             // readiness: deps OK
  try {
    await pool.query('SELECT 1');
    res.send('ready');
  } catch {
    res.status(503).send('db unavailable');
  }
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.send(await client.register.metrics()); // scraped by Prometheus
});

app.listen(3000);`,
  },
  {
    id: 'docker-node',
    group: 'Testing, Debugging & Production',
    stars: 2,
    difficulty: 'Easy',
    q: 'What are best practices for running Node in Docker?',
    a: [
      "# ELI5",
      "A Docker image is like a lunchbox packed with everything your app needs: the food (your code), the cutlery (Node) and the napkin (settings).",
      "A good lunchbox is small, has only what you need, nothing dangerous inside, and opens the same way every time.",
      "Docker best practices are rules for packing a good lunchbox for your Node app.",
      "# What it is",
      "Docker — a tool that packages an app and its environment into an image, which runs as an isolated container on any machine.",
      "Dockerfile — the recipe of instructions (`FROM`, `COPY`, `RUN`, `CMD`) used to build the image.",
      "Layer — each instruction creates a cached layer; if nothing in it changed, Docker reuses it, making rebuilds fast.",
      "Multi-stage build — using one stage with build tools to compile, then copying only the results into a small final stage.",
      "Best practices:",
      "  Use an official, pinned, small base image: `node:22-slim` or `node:22-alpine` (pin the version, never just `latest`).",
      "  Copy `package.json` and `package-lock.json` first, run `npm ci`, then copy the source, so dependency installs are cached.",
      "  Install only production dependencies in the final image (`npm ci --omit=dev`).",
      "  Use multi-stage builds for TypeScript or frontend builds.",
      "  Run as a non-root user (`USER node`, built into the official image).",
      "  Set `NODE_ENV=production`.",
      "  Use a `.dockerignore` to exclude `node_modules`, `.git`, `.env`, tests and logs.",
      "  Start with exec-form `CMD [\"node\", \"dist/server.js\"]` so Node receives signals (not `npm start`); add `--init` or `tini` if you spawn child processes.",
      "  Never bake secrets into the image; inject them at runtime as env vars or mounted secrets.",
      "  One process per container; scale with more containers.",
      "  Add a `HEALTHCHECK` or rely on orchestrator probes; set memory limits and, if needed, `--max-old-space-size` below the limit.",
      "  Scan images for vulnerabilities (Docker Scout, Trivy) in CI.",
      "# How it works",
      "Stage 1 (`build`) installs all dependencies and compiles TypeScript to `dist/`.",
      "Stage 2 (`runtime`) starts from a fresh slim image, installs only production dependencies, copies `dist/` from stage 1, switches to the `node` user, and sets the start command.",
      "Build tools, dev dependencies and source files stay in stage 1 and never reach the final image.",
      "At runtime, the orchestrator passes env vars, sends SIGTERM on stop, and checks health.",
      "# Example walkthrough",
      "The Dockerfile follows those steps; the final image is typically a few hundred MB smaller than a single-stage build.",
      "`docker build -t api .` then `docker run -p 3000:3000 --env-file .env api` runs it with secrets from the environment, not the image.",
      "`docker stop` sends SIGTERM straight to Node (PID 1) because of the exec-form `CMD`, triggering graceful shutdown.",
      "# Why it matters / when to use",
      "Smaller images deploy faster, cost less to store and have fewer vulnerabilities.",
      "Non-root and no secrets in images limit damage if the container is compromised.",
      "Proper signal handling enables zero-downtime deploys.",
      "# Common mistakes",
      "`COPY . .` before `npm ci`: any code change invalidates the dependency cache. Fix: copy package files first.",
      "Copying the host `node_modules` into the image: wrong OS binaries. Fix: `.dockerignore` it and install inside the image.",
      "`CMD npm start` (shell form): signals may not reach Node, so containers take the full grace period to stop. Fix: exec-form `node` command.",
      "Running as root and using `latest` tags. Fix: `USER node`, pinned versions.",
      "# Say this in the interview",
      "I use a pinned slim official Node image and a multi-stage build: compile in a build stage, then copy only the output and production dependencies into the runtime stage. I order layers so `npm ci` is cached, use `.dockerignore`, run as the non-root `node` user, set NODE_ENV=production, start Node directly with exec-form CMD so it gets SIGTERM for graceful shutdown, inject secrets at runtime, and scan images in CI.",
      "Follow-up: alpine or slim?",
      "  Alpine is smaller but uses musl libc, which can break some native modules; slim (Debian-based) is a safer default.",
    ],
    code: `# syntax=docker/dockerfile:1
# ---------- build stage ----------
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci                      # all deps (incl. TypeScript), cached layer
COPY . .
RUN npm run build               # → /app/dist

# ---------- runtime stage ----------
FROM node:22-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
USER node                       # non-root user from the official image
EXPOSE 3000
CMD ["node", "dist/server.js"]  # exec form → Node gets SIGTERM directly

# .dockerignore:  node_modules  .git  .env  dist  coverage  *.log
# $ docker build -t api .
# $ docker run -p 3000:3000 --env-file .env --init api`,
  },
  {
    id: 'watch-mode',
    group: 'Testing, Debugging & Production',
    stars: 1,
    difficulty: 'Easy',
    q: 'How do you auto-restart a Node app during development?',
    a: [
      "# ELI5",
      "Imagine a robot assistant watching your notebook. Every time you change a sentence, it reads the whole story again from the start so you instantly see the new version.",
      "Watch mode is that robot for your code: when you save a file, the app restarts automatically.",
      "# What it is",
      "Watch mode — a development feature that watches your files for changes and restarts the Node process automatically, so you do not press Ctrl+C and rerun by hand.",
      "Options:",
      "  `node --watch app.js` — built into Node (stable since Node 22; available since 18.11). Restarts when the entry file or anything it imports changes.",
      "  `node --watch-path=./src app.js` — watch specific folders instead.",
      "  `nodemon` — the classic third-party tool, highly configurable (extensions, ignore patterns, delay).",
      "  `tsx watch src/index.ts` — runs TypeScript directly and restarts on changes.",
      "  Node 22.6+/23 can also run TypeScript files by stripping types (`--experimental-strip-types`, unflagged in newer versions), which combines with `--watch`.",
      "Watch mode is for development only; in production use a process manager (PM2, systemd, Kubernetes) for restarts on crash, not on file change.",
      "# How it works",
      "The watcher process starts your app as a child process.",
      "It subscribes to file system change events (via OS APIs like inotify on Linux, FSEvents on macOS).",
      "When a watched file is saved, it kills the running child (sending a signal) and starts a fresh one.",
      "Your app's in-memory state is lost on each restart, which is expected in development.",
      "`--watch-preserve-output` keeps old console output instead of clearing the screen.",
      "# Example walkthrough",
      "The `package.json` scripts show three ways: `dev` with built-in `node --watch` and `--env-file`, `dev:ts` with `tsx watch`, and `dev:nodemon`.",
      "Running `npm run dev` prints `listening on 3000`; editing `server.js` prints `Restarting 'server.js'` and then `listening on 3000` again.",
      "# Why it matters / when to use",
      "Faster feedback loop during development: save, refresh, see the change.",
      "Using the built-in flag means one less dependency to install and update.",
      "# Common mistakes",
      "Using watch mode or nodemon in production. Fix: production uses a supervisor without file watching.",
      "Watching `node_modules` or log/upload folders: endless restarts. Fix: limit paths with `--watch-path` or nodemon's `ignore`.",
      "Expecting restarts to reload `.env` changes without using `--env-file` in the watched command. Fix: include it, or restart manually.",
      "Not handling SIGTERM, so ports stay busy briefly between restarts (`EADDRINUSE`). Fix: graceful shutdown closes the server.",
      "# Say this in the interview",
      "In development I use Node's built-in `node --watch`, which restarts the process when the entry file or its imports change, or `tsx watch` for TypeScript; nodemon is the older alternative with more configuration. It's purely a development tool — in production a process manager or orchestrator handles crash restarts.",
      "Follow-up: what is hot module replacement?",
      "  Swapping changed modules in a running process without a full restart; common in frontend dev servers, rare for Node backends where a quick restart is simpler.",
    ],
    code: `// package.json
{
  "type": "module",
  "scripts": {
    "dev": "node --watch --env-file=.env src/server.js",
    "dev:paths": "node --watch-path=./src --watch-preserve-output src/server.js",
    "dev:ts": "tsx watch src/index.ts",
    "dev:nodemon": "nodemon --ext js,json --ignore uploads/ src/server.js",
    "start": "node src/server.js"
  }
}

// src/server.js
// import http from 'node:http';
// http.createServer((req, res) => res.end('hi')).listen(3000,
//   () => console.log('listening on 3000'));

// $ npm run dev
// → listening on 3000
// (edit and save src/server.js)
// → Restarting 'src/server.js'
// → listening on 3000`,
  },
];

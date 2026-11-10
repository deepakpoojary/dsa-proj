import type { BankQuestion } from './types';

export const NODE: BankQuestion[] = [
  // ───────────────────────── Fundamentals ─────────────────────────
  {
    id: 'what-is-node',
    group: 'Fundamentals',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is Node.js and why is it used for backends?',
    a: [
      'Node.js is a JavaScript runtime built on Google\'s V8 engine plus libuv, letting JS run outside the browser.',
      'Event-driven, non-blocking I/O model: one JS thread handles many concurrent connections cheaply.',
      'Great for I/O-bound work: REST/GraphQL APIs, real-time apps (WebSockets), proxies, BFFs, CLIs, streaming.',
      'One language across frontend and backend; huge npm ecosystem.',
      'Weak spot: CPU-heavy work on the main thread blocks every request (offload to worker_threads or other services).',
    ],
  },
  {
    id: 'single-threaded-concurrency',
    group: 'Fundamentals',
    stars: 5,
    difficulty: 'Medium',
    q: 'Node is single-threaded — how does it handle thousands of concurrent requests?',
    a: [
      'Only your JS runs on one thread; I/O is delegated to the OS (epoll/kqueue/IOCP) or libuv\'s thread pool.',
      'While I/O is in flight the thread is free to process other callbacks; completions are queued and run by the event loop.',
      'Concurrency (interleaving many tasks) is not parallelism (running JS simultaneously on multiple cores).',
      'Node itself is multi-threaded internally: libuv pool (fs, dns.lookup, crypto, zlib), V8 GC and compiler threads.',
      'For parallel JS use `worker_threads`, `cluster`, or multiple processes behind a load balancer.',
    ],
  },
  {
    id: 'blocking-vs-non-blocking',
    group: 'Fundamentals',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is the difference between blocking and non-blocking code in Node?',
    a: [
      'Blocking: the JS thread waits for an operation to finish before running anything else (e.g. `fs.readFileSync`).',
      'Non-blocking: the operation is started, JS continues, and a callback/promise handles the result later.',
      'A blocking call in a request handler stalls every other connection on that process.',
      'Sync APIs are fine at startup (loading config) or in CLI scripts, never in hot request paths.',
      'Long CPU loops (big JSON.parse, regex, sorting huge arrays) are blocking too, even without "Sync" in the name.',
    ],
    code: `// Blocking
const data = fs.readFileSync('big.json', 'utf8');

// Non-blocking
const data2 = await fs.promises.readFile('big.json', 'utf8');`,
  },
  {
    id: 'eventemitter',
    group: 'Fundamentals',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is EventEmitter and how is it used?',
    a: [
      'Class from `node:events` implementing the observer pattern: `on`/`once` to subscribe, `emit` to publish.',
      'Core APIs build on it: streams, `http.Server`, `net.Socket`, `process`.',
      'Listeners run synchronously in registration order when `emit` is called.',
      'Emitting `error` with no listener throws and can crash the process — always handle `error` events.',
      'Default max 10 listeners per event before a leak warning; `events.once(emitter, name)` returns a promise.',
    ],
    code: `import { EventEmitter } from 'node:events';
class Orders extends EventEmitter {}
const orders = new Orders();
orders.on('created', (o) => console.log('new order', o.id));
orders.on('error', (err) => console.error(err));
orders.emit('created', { id: 42 });`,
  },
  {
    id: 'global-objects',
    group: 'Fundamentals',
    stars: 3,
    difficulty: 'Easy',
    q: 'What are the important global objects in Node.js?',
    a: [
      '`globalThis` (alias `global`) — the global object; no `window` or `document`.',
      '`process`, `Buffer`, `console`, timers (`setTimeout`, `setImmediate`, `queueMicrotask`), `URL`, `fetch`, `AbortController`, `structuredClone`.',
      '`__dirname`, `__filename`, `require`, `module`, `exports` are module-scoped in CommonJS, not true globals.',
      'In ESM use `import.meta.dirname` / `import.meta.filename` (Node 20.11+) or `fileURLToPath(import.meta.url)`.',
    ],
  },
  {
    id: 'process-object',
    group: 'Fundamentals',
    stars: 3,
    difficulty: 'Easy',
    q: 'What does the `process` object provide?',
    a: [
      'Info and control of the current process: `process.argv`, `process.env`, `process.pid`, `process.cwd()`, `process.platform`.',
      '`process.exit(code)` ends immediately; prefer setting `process.exitCode` and letting the loop drain.',
      'Signals and lifecycle events: `SIGINT`, `SIGTERM`, `exit`, `beforeExit`, `uncaughtException`, `unhandledRejection`.',
      '`process.memoryUsage()`, `process.hrtime.bigint()`, `process.nextTick()` for diagnostics and scheduling.',
      'Exit code 0 = success, non-zero = failure (orchestrators and CI rely on this).',
    ],
  },
  {
    id: 'node-use-cases',
    group: 'Fundamentals',
    stars: 3,
    difficulty: 'Easy',
    q: 'When should you use Node.js and when should you avoid it?',
    a: [
      'Good fit: I/O-heavy APIs, real-time chat/notifications, streaming, API gateways, microservices, serverless functions.',
      'Poor fit: heavy CPU work (video encoding, ML training, large numeric computation) on the main thread.',
      'CPU tasks can still be done via worker_threads, native addons, or by delegating to Go/Rust/Python services.',
      'Choice often hinges on team skills and ecosystem as much as raw performance.',
    ],
  },
  {
    id: 'env-config',
    group: 'Fundamentals',
    stars: 3,
    difficulty: 'Easy',
    q: 'How do you manage configuration and environment variables in Node?',
    a: [
      'Read config from `process.env` (12-factor style); values are always strings, so parse/validate them.',
      'Node 20.6+ supports `node --env-file=.env app.js` natively; `dotenv` is the classic library alternative.',
      'Validate at startup (e.g. zod/envalid) and fail fast if something is missing.',
      'Never commit `.env` files with secrets; use a secret manager in production.',
      '`NODE_ENV=production` enables optimisations in many libs (e.g. Express view caching, less verbose errors).',
    ],
  },
  {
    id: 'node-vs-browser',
    group: 'Fundamentals',
    stars: 2,
    difficulty: 'Easy',
    q: 'How does JavaScript in Node differ from JavaScript in the browser?',
    a: [
      'Same language (V8 in Chrome and Node), different host APIs.',
      'Browser: DOM, `window`, `localStorage`, sandboxed, no file system access.',
      'Node: file system, network sockets, child processes, `process`, `Buffer`; full OS access.',
      'Both now share many web APIs: `fetch`, `URL`, `AbortController`, `TextEncoder`, Web Streams, `structuredClone`.',
      'Node controls the runtime version, so you are not limited by user browsers.',
    ],
  },
  {
    id: 'repl',
    group: 'Fundamentals',
    stars: 1,
    difficulty: 'Easy',
    q: 'What is the Node REPL?',
    a: [
      'Read-Eval-Print-Loop: interactive shell started by running `node` with no arguments.',
      'Useful for quick experiments; `_` holds the last result, `.help`, `.load`, `.save`, `.editor` commands.',
      'Supports top-level `await` and tab completion.',
    ],
  },

  // ───────────────────────── Event Loop & Internals ─────────────────────────
  {
    id: 'event-loop-phases',
    group: 'Event Loop & Internals',
    stars: 5,
    difficulty: 'Medium',
    q: 'Explain the phases of the Node.js event loop.',
    a: [
      'Node runs JS on one thread; libuv drives the event loop and a thread pool for blocking work.',
      'Phases in order: timers → pending callbacks → idle/prepare → poll → check → close callbacks.',
      'Timers: expired `setTimeout`/`setInterval`. Poll: retrieve new I/O events and run their callbacks. Check: `setImmediate`.',
      '`process.nextTick` queue and then the Promise microtask queue drain after each callback, before the loop moves on.',
      '`setImmediate` runs in the check phase; `setTimeout(fn, 0)` in timers — order between them is only guaranteed inside an I/O callback.',
      'The loop exits when there are no more pending handles or requests.',
    ],
  },
  {
    id: 'nexttick-vs-setimmediate',
    group: 'Event Loop & Internals',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is the difference between `process.nextTick`, `setImmediate`, and `setTimeout(fn, 0)`?',
    a: [
      '`process.nextTick`: runs right after the current operation, before Promise microtasks and before the loop continues.',
      'Promise callbacks (`.then`, `await` continuations, `queueMicrotask`) run after the nextTick queue drains.',
      '`setImmediate`: runs in the check phase of the next loop iteration.',
      '`setTimeout(fn, 0)`: actually ≥1ms, runs in the timers phase.',
      'Naming is confusing: nextTick fires "immediately", setImmediate fires on the next tick.',
    ],
    code: `setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));
Promise.resolve().then(() => console.log('promise'));
process.nextTick(() => console.log('nextTick'));
console.log('sync');
// sync, nextTick, promise, then timeout/immediate (order varies)`,
  },
  {
    id: 'memory-leaks',
    group: 'Event Loop & Internals',
    stars: 5,
    difficulty: 'Hard',
    q: 'What causes memory leaks in Node and how do you find them?',
    a: [
      'Leak = objects that stay reachable from GC roots long after they are needed.',
      'Common causes: unbounded in-memory caches/maps, global arrays, listeners never removed, closures holding big objects, uncleared intervals.',
      'Symptoms: steadily growing heap (`process.memoryUsage().heapUsed`), longer GC pauses, eventual OOM crash.',
      'Find them: `node --inspect` + Chrome DevTools heap snapshots (compare two snapshots), `--heapsnapshot-near-heap-limit`, clinic.js.',
      'Fixes: LRU caches with size/TTL, `removeListener`, `clearInterval`, `WeakMap`/`WeakRef` for metadata keyed by objects.',
    ],
  },
  {
    id: 'microtasks-vs-macrotasks',
    group: 'Event Loop & Internals',
    stars: 4,
    difficulty: 'Medium',
    q: 'What are microtasks and macrotasks in Node?',
    a: [
      'Macrotasks: callbacks scheduled into loop phases — timers, I/O callbacks, `setImmediate`, close events.',
      'Microtasks: Promise reactions and `queueMicrotask`; Node also has the separate, higher-priority nextTick queue.',
      'After every macrotask callback, Node drains all nextTicks, then all microtasks, before the next macrotask.',
      'Since Node 11 this happens between each individual timer/immediate, matching browser behaviour.',
      'A microtask that keeps scheduling microtasks starves the loop just like an infinite loop.',
    ],
  },
  {
    id: 'libuv-thread-pool',
    group: 'Event Loop & Internals',
    stars: 4,
    difficulty: 'Hard',
    q: 'What is libuv and what does its thread pool do?',
    a: [
      'libuv is the C library providing Node\'s event loop, async I/O abstraction across OSes, timers, and a thread pool.',
      'Network I/O uses non-blocking OS mechanisms (epoll, kqueue, IOCP) — no thread pool needed.',
      'The thread pool (default 4 threads) handles work with no async OS API: fs operations, `dns.lookup`, `crypto.pbkdf2/scrypt/randomBytes`, `zlib`.',
      'Pool saturation causes surprising latency: e.g. many concurrent bcrypt/fs calls queue behind each other.',
      'Tune with `UV_THREADPOOL_SIZE` (max 1024), set before the pool is first used.',
    ],
  },
  {
    id: 'blocking-event-loop',
    group: 'Event Loop & Internals',
    stars: 4,
    difficulty: 'Medium',
    q: 'How can the event loop get blocked, and how do you detect and avoid it?',
    a: [
      'Blocked = a single callback runs so long that no other request, timer, or I/O completion can be processed.',
      'Causes: sync fs/crypto APIs, huge `JSON.parse`/`stringify`, catastrophic regex backtracking (ReDoS), heavy loops.',
      'Detect: `perf_hooks.monitorEventLoopDelay()`, event-loop lag metrics in APM, `--cpu-prof`, clinic doctor.',
      'Avoid: async APIs, streaming parsers, chunk work with `setImmediate`, offload CPU work to `worker_threads`.',
    ],
  },
  {
    id: 'garbage-collection',
    group: 'Event Loop & Internals',
    stars: 3,
    difficulty: 'Hard',
    q: 'How does garbage collection work in V8/Node?',
    a: [
      'V8 uses generational GC: new space (young generation) and old space (old generation).',
      'Young gen: fast Scavenge (copying) collector; objects surviving two scavenges are promoted to old space.',
      'Old gen: Mark-Sweep-Compact, mostly concurrent/incremental to reduce pause times.',
      'Objects are collected when unreachable from roots (globals, stack, closures).',
      'Heap limit tunable via `--max-old-space-size=4096` (MB); containers should set it below the memory limit.',
    ],
  },
  {
    id: 'v8-engine',
    group: 'Event Loop & Internals',
    stars: 2,
    difficulty: 'Medium',
    q: 'What role does V8 play in Node.js?',
    a: [
      'V8 is Google\'s JS/WebAssembly engine: parses, compiles, and executes JS and manages the heap/GC.',
      'Pipeline: Ignition interpreter → Sparkplug/Maglev → TurboFan optimizing JIT for hot code.',
      'Optimizations rely on stable object shapes (hidden classes) and monomorphic call sites.',
      'Node adds the rest: libuv, bindings for fs/net/crypto, the module system, and core APIs.',
    ],
  },
  {
    id: 'settimeout-vs-setimmediate',
    group: 'Event Loop & Internals',
    stars: 2,
    difficulty: 'Medium',
    q: 'Why is the order of `setTimeout(fn, 0)` vs `setImmediate` non-deterministic in the main module?',
    a: [
      'From the main module, ordering depends on how fast the loop starts relative to the 1ms timer threshold.',
      'If the timer has expired when the loop enters the timers phase, timeout runs first; otherwise immediate wins.',
      'Inside an I/O callback, `setImmediate` always runs first because check comes right after poll.',
      'Use `setImmediate` when you specifically want to run after pending I/O.',
    ],
  },
  {
    id: 'nexttick-starvation',
    group: 'Event Loop & Internals',
    stars: 2,
    difficulty: 'Hard',
    q: 'How can `process.nextTick` starve the event loop?',
    a: [
      'The nextTick queue is fully drained before the loop continues, including ticks added during draining.',
      'Recursive `process.nextTick` calls therefore prevent I/O and timers from ever running.',
      '`setImmediate` recursion does not starve I/O because new immediates run on the next iteration.',
      'Use nextTick sparingly, e.g. to emit events after a constructor returns or to keep APIs consistently async.',
    ],
  },
  {
    id: 'timers-unref',
    group: 'Event Loop & Internals',
    stars: 1,
    difficulty: 'Medium',
    q: 'What do `timer.unref()` and `timer.ref()` do?',
    a: [
      'Active handles (timers, sockets, servers) keep the process alive.',
      '`unref()` lets the process exit if that handle is the only thing left in the loop.',
      'Useful for background intervals like metrics flushing or cache cleanup.',
      '`ref()` restores the default keep-alive behaviour.',
    ],
  },

  // ───────────────────────── Modules & npm ─────────────────────────
  {
    id: 'commonjs-vs-esm',
    group: 'Modules & npm',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is the difference between CommonJS and ES Modules in Node?',
    a: [
      'CommonJS: `require`/`module.exports`, loaded synchronously, resolved at runtime, default for `.js` without `"type": "module"`.',
      'ESM: `import`/`export`, statically analysable, async loading, supports top-level `await` and tree shaking.',
      'Enable ESM via `.mjs` or `"type": "module"` in package.json; `.cjs` forces CommonJS.',
      'ESM needs file extensions in relative imports and has no `__dirname`/`require` (use `import.meta`, `createRequire`).',
      'ESM can import CJS; CJS can load ESM via dynamic `import()`, and `require(esm)` works in Node 22.12+/20.19+ (no top-level await).',
      'ESM imports are live bindings; CJS exports are copied values at require time.',
    ],
  },
  {
    id: 'module-caching',
    group: 'Modules & npm',
    stars: 4,
    difficulty: 'Medium',
    q: 'How does module caching work in Node?',
    a: [
      'A module is executed once on first load; subsequent `require`/`import` returns the cached instance.',
      'This makes modules natural singletons (DB pools, config objects).',
      'CJS cache is keyed by resolved filename in `require.cache`; deleting an entry forces a reload (rarely a good idea).',
      'Different resolved paths (e.g. two copies in nested node_modules) produce two separate instances.',
    ],
  },
  {
    id: 'module-exports-vs-exports',
    group: 'Modules & npm',
    stars: 4,
    difficulty: 'Easy',
    q: 'What is the difference between `module.exports` and `exports`? What is the module wrapper?',
    a: [
      'Each CJS file is wrapped: `(function (exports, require, module, __filename, __dirname) { ... })`.',
      'That wrapper gives module-level scope (no global leakage) and injects those variables.',
      '`exports` is a shortcut reference to `module.exports`; `require` returns `module.exports`.',
      'Adding props (`exports.fn = ...`) works; reassigning `exports = {...}` breaks the link and exports nothing.',
      'To export a single function/class, assign `module.exports = ...`.',
    ],
  },
  {
    id: 'dependency-types',
    group: 'Modules & npm',
    stars: 4,
    difficulty: 'Easy',
    q: 'Explain dependencies, devDependencies, peerDependencies, and optionalDependencies.',
    a: [
      '`dependencies`: needed at runtime in production.',
      '`devDependencies`: build/test tooling only; skipped with `npm ci --omit=dev`.',
      '`peerDependencies`: the host app must supply them (plugins, e.g. a React component lib); npm 7+ installs them automatically.',
      '`optionalDependencies`: install failures are tolerated; code must handle absence.',
    ],
  },
  {
    id: 'semver-lockfile',
    group: 'Modules & npm',
    stars: 4,
    difficulty: 'Easy',
    q: 'Explain semantic versioning and the purpose of package-lock.json.',
    a: [
      'SemVer MAJOR.MINOR.PATCH: breaking changes, backward-compatible features, bug fixes.',
      '`^1.2.3` allows <2.0.0; `~1.2.3` allows <1.3.0; exact `1.2.3` pins.',
      'Lockfile records the exact resolved tree (versions + integrity hashes) for reproducible installs.',
      'Commit the lockfile; use `npm ci` in CI/Docker — it installs strictly from the lockfile and fails on mismatch.',
      '`npm install` may update the lockfile within ranges; `npm audit` checks for known vulnerabilities.',
    ],
  },
  {
    id: 'module-resolution',
    group: 'Modules & npm',
    stars: 3,
    difficulty: 'Medium',
    q: 'How does Node resolve a module specifier?',
    a: [
      'Core modules first (`fs`, or explicitly `node:fs` — the `node:` prefix is recommended).',
      'Relative/absolute paths: CJS tries exact file, then `.js/.json/.node`, then directory `index.js`; ESM requires the full path.',
      'Bare specifiers: walk up `node_modules` folders from the current directory to the root.',
      'Inside a package, the `exports` field (if present) controls what can be imported and overrides `main`.',
      '`imports` field allows private `#internal` aliases within a package.',
    ],
  },
  {
    id: 'package-json-fields',
    group: 'Modules & npm',
    stars: 3,
    difficulty: 'Easy',
    q: 'What are the key fields of package.json?',
    a: [
      '`name`, `version`: identity for publishing.',
      '`type`: `"module"` or `"commonjs"` decides how `.js` files are treated.',
      '`main` / `exports`: entry points; `exports` supports conditional `import`/`require` targets and encapsulation.',
      '`scripts`, `dependencies`, `devDependencies`, `peerDependencies`.',
      '`engines` declares supported Node versions; `private: true` prevents accidental publishing.',
    ],
  },
  {
    id: 'circular-dependencies',
    group: 'Modules & npm',
    stars: 2,
    difficulty: 'Hard',
    q: 'What happens with circular dependencies in Node modules?',
    a: [
      'CJS: when A requires B and B requires A, B receives A\'s partially-filled `module.exports` (whatever existed so far).',
      'Leads to `undefined` functions at call time — a classic hard-to-debug bug.',
      'ESM: live bindings help, but accessing a binding before its module evaluates throws a TDZ `ReferenceError`.',
      'Fix by extracting shared code into a third module or using lazy requires/dependency injection.',
    ],
  },
  {
    id: 'npm-scripts',
    group: 'Modules & npm',
    stars: 2,
    difficulty: 'Easy',
    q: 'How do npm scripts work?',
    a: [
      'Defined in `scripts`; run with `npm run <name>` (`start` and `test` have shortcuts).',
      '`node_modules/.bin` is added to PATH, so locally installed CLIs work without global installs.',
      '`pre<name>` and `post<name>` hooks run automatically around a script.',
      'Pass args after `--`: `npm test -- --watch`. Node 22 also offers `node --run <script>` for faster startup.',
    ],
  },
  {
    id: 'npm-vs-npx',
    group: 'Modules & npm',
    stars: 1,
    difficulty: 'Easy',
    q: 'What is the difference between npm and npx?',
    a: [
      '`npm` installs and manages packages and runs package.json scripts.',
      '`npx` executes a package binary, from local `node_modules/.bin` or by downloading it temporarily.',
      'Handy for one-off tools: `npx create-next-app`, `npx tsx script.ts`.',
    ],
  },

  // ───────────────────────── Async Patterns & Errors ─────────────────────────
  {
    id: 'callbacks-promises-async-await',
    group: 'Async Patterns & Errors',
    stars: 5,
    difficulty: 'Easy',
    q: 'Compare callbacks, Promises, and async/await.',
    a: [
      'Callbacks: function passed to be called on completion; error-first convention; nesting leads to callback hell.',
      'Promises: object representing a future value (pending/fulfilled/rejected); chainable with `.then/.catch/.finally`.',
      'async/await: syntax over promises that reads like sync code; errors handled with `try/catch`.',
      '`await` only pauses the current async function, never the thread.',
      'Sequential `await` in a loop serialises work — use `Promise.all` for independent tasks.',
      'Modern core APIs offer promise versions: `node:fs/promises`, `node:timers/promises`, `node:stream/promises`.',
    ],
  },
  {
    id: 'error-handling',
    group: 'Async Patterns & Errors',
    stars: 5,
    difficulty: 'Medium',
    q: 'How do you handle errors properly in Node.js?',
    a: [
      'Sync code and `await`: `try/catch`. Promises: `.catch()`. Callbacks: check the first `err` argument. Emitters/streams: `error` listener.',
      'A `throw` inside a callback cannot be caught by an outer `try/catch` — the stack has already unwound.',
      'Always `return`/`await` promises so rejections propagate; floating promises cause unhandled rejections.',
      'Use custom error classes with codes/status and `cause` (`new Error(msg, { cause })`) for context.',
      'Centralise handling (e.g. Express error middleware) and log with stack traces.',
      'Crash on programmer errors and let a supervisor restart; recover from operational errors.',
    ],
  },
  {
    id: 'promise-combinators',
    group: 'Async Patterns & Errors',
    stars: 5,
    difficulty: 'Medium',
    q: 'Explain `Promise.all`, `allSettled`, `race`, and `any`.',
    a: [
      '`Promise.all`: resolves with all values; rejects fast on the first rejection (others keep running).',
      '`Promise.allSettled`: waits for all; returns `{status, value|reason}` for each — use when partial failure is OK.',
      '`Promise.race`: settles with the first settled promise — common for timeouts.',
      '`Promise.any`: first fulfilment wins; rejects with `AggregateError` only if all reject.',
      'None of them cancel the losers; use `AbortController` for real cancellation.',
    ],
    code: `const [user, orders] = await Promise.all([
  getUser(id),
  getOrders(id),
]);
const results = await Promise.allSettled(urls.map((u) => fetch(u)));`,
  },
  {
    id: 'uncaught-exception-unhandled-rejection',
    group: 'Async Patterns & Errors',
    stars: 4,
    difficulty: 'Medium',
    q: 'What are `uncaughtException` and `unhandledRejection`, and how should you handle them?',
    a: [
      '`uncaughtException`: a thrown error bubbled to the event loop with no handler.',
      '`unhandledRejection`: a rejected promise without a handler; since Node 15 it crashes the process by default.',
      'Process state may be corrupt after these — log, flush, close gracefully, then exit with non-zero code.',
      'Do not use them to "keep the server alive"; rely on a process manager/orchestrator to restart.',
    ],
    code: `process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'unhandled rejection');
  shutdown(1);
});
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'uncaught exception');
  shutdown(1);
});`,
  },
  {
    id: 'operational-vs-programmer-errors',
    group: 'Async Patterns & Errors',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is the difference between operational errors and programmer errors?',
    a: [
      'Operational: expected runtime failures — network timeout, DB down, invalid user input, 404, file missing.',
      'Programmer: bugs — `undefined` is not a function, wrong argument types, forgotten await.',
      'Operational errors are handled: retry, fallback, return a 4xx/5xx response.',
      'Programmer errors should crash fast and be fixed; continuing risks inconsistent state.',
    ],
  },
  {
    id: 'callback-hell',
    group: 'Async Patterns & Errors',
    stars: 3,
    difficulty: 'Easy',
    q: 'What is callback hell and how do you avoid it?',
    a: [
      'Deeply nested callbacks ("pyramid of doom") that are hard to read, handle errors in, and maintain.',
      'Avoid with promises + async/await, small named functions, and early returns.',
      'Convert legacy callback APIs with `util.promisify` or use the `/promises` core modules.',
    ],
  },
  {
    id: 'error-first-callback',
    group: 'Async Patterns & Errors',
    stars: 3,
    difficulty: 'Easy',
    q: 'What is the error-first callback pattern?',
    a: [
      'Node convention: callback signature `(err, result)`; `err` is `null` on success.',
      'Caller must check `err` first and return early.',
      'Callbacks should be invoked exactly once and asynchronously (do not mix sync and async invocation — "Zalgo").',
    ],
    code: `fs.readFile('a.txt', 'utf8', (err, data) => {
  if (err) return handle(err);
  console.log(data);
});`,
  },
  {
    id: 'util-promisify',
    group: 'Async Patterns & Errors',
    stars: 3,
    difficulty: 'Easy',
    q: 'What does `util.promisify` do?',
    a: [
      'Converts an error-first callback function into one that returns a promise.',
      'Works for functions whose last argument is `(err, value)` callback.',
      'Respects `util.promisify.custom` for functions with non-standard callbacks.',
      'Many core modules already ship promise APIs, e.g. `node:fs/promises`, `node:dns/promises`.',
    ],
    code: `import { promisify } from 'node:util';
import { exec } from 'node:child_process';
const execAsync = promisify(exec);
const { stdout } = await execAsync('git rev-parse HEAD');`,
  },
  {
    id: 'abortcontroller',
    group: 'Async Patterns & Errors',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do you cancel async operations and add timeouts in Node?',
    a: [
      '`AbortController` creates a `signal` that many APIs accept: `fetch`, `fs.readFile`, `setTimeout` from `timers/promises`, `events.once`, streams.',
      'Calling `controller.abort()` rejects the operation with an `AbortError`.',
      '`AbortSignal.timeout(ms)` gives a ready-made timeout signal; `AbortSignal.any([...])` combines signals.',
      'Always add timeouts to outbound HTTP/DB calls so slow dependencies cannot pile up requests.',
    ],
    code: `const res = await fetch(url, { signal: AbortSignal.timeout(3000) });`,
  },
  {
    id: 'concurrency-limiting',
    group: 'Async Patterns & Errors',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do you limit concurrency when processing many async tasks?',
    a: [
      '`Promise.all` on 10,000 items fires everything at once — can exhaust sockets, DB pool, or rate limits.',
      'Process in batches, or use a pool/semaphore that keeps N tasks in flight (e.g. `p-limit`, `p-queue`).',
      'Sequential `for...of` with `await` is the simplest but slowest option.',
      'Streams with backpressure are another way to bound concurrency for large data sets.',
    ],
  },
  {
    id: 'async-iteration',
    group: 'Async Patterns & Errors',
    stars: 2,
    difficulty: 'Medium',
    q: 'What are async iterators and `for await...of`?',
    a: [
      'Objects implementing `Symbol.asyncIterator` yield promises consumed sequentially by `for await`.',
      'Readable streams, `readline` interfaces, and `events.on()` are async iterable.',
      'Async generators (`async function*`) make it easy to produce paginated or streamed data.',
      'Backpressure is natural: the next chunk is not pulled until the loop body finishes.',
    ],
    code: `import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
const rl = createInterface({ input: createReadStream('log.txt') });
for await (const line of rl) {
  if (line.includes('ERROR')) console.log(line);
}`,
  },
  {
    id: 'async-local-storage',
    group: 'Async Patterns & Errors',
    stars: 2,
    difficulty: 'Hard',
    q: 'What is AsyncLocalStorage and when do you use it?',
    a: [
      'From `node:async_hooks`: stores context that follows an async call chain (like thread-local storage).',
      'Typical use: request IDs/trace IDs, current user, or transaction available in logs without passing args everywhere.',
      '`als.run(store, fn)` sets the context; `als.getStore()` reads it anywhere downstream.',
      'Used internally by OpenTelemetry, Next.js request APIs, and many loggers.',
    ],
  },

  // ───────────────────────── Streams & Buffers ─────────────────────────
  {
    id: 'what-are-streams',
    group: 'Streams & Buffers',
    stars: 5,
    difficulty: 'Medium',
    q: 'What are streams in Node.js and why are they useful?',
    a: [
      'Streams process data piece by piece (chunks) instead of loading it all into memory.',
      'Constant memory for huge files/responses; processing starts before all data arrives (lower latency).',
      'All streams are EventEmitters: `data`, `end`, `error`, `finish`, `close` events.',
      'Examples: `fs.createReadStream`, HTTP request/response, `process.stdin/stdout`, zlib, TCP sockets.',
      'Composable: chain read → transform → write with `pipeline`.',
    ],
  },
  {
    id: 'backpressure',
    group: 'Streams & Buffers',
    stars: 5,
    difficulty: 'Hard',
    q: 'What is backpressure and how does Node handle it?',
    a: [
      'Backpressure: the consumer is slower than the producer, so data piles up in memory.',
      'Each stream has a `highWaterMark` buffer threshold (16KB bytes, or 16 objects in object mode).',
      '`writable.write()` returns `false` when the buffer is full — the producer should pause until the `drain` event.',
      '`pipe()`/`pipeline()` handle this automatically; manual `data` handlers that ignore `write()` return values cause memory blow-ups.',
    ],
    code: `function writeMany(ws, items) {
  for (const item of items) {
    if (!ws.write(item)) {
      return ws.once('drain', () => writeMany(ws, items.slice(items.indexOf(item) + 1)));
    }
  }
  ws.end();
}`,
  },
  {
    id: 'stream-types',
    group: 'Streams & Buffers',
    stars: 4,
    difficulty: 'Easy',
    q: 'What are the four types of streams?',
    a: [
      'Readable: source of data (`fs.createReadStream`, HTTP request on server).',
      'Writable: destination (`fs.createWriteStream`, HTTP response, `process.stdout`).',
      'Duplex: both readable and writable independently (TCP socket).',
      'Transform: duplex where output is computed from input (`zlib.createGzip`, encryption, CSV parsing).',
    ],
  },
  {
    id: 'pipeline-vs-pipe',
    group: 'Streams & Buffers',
    stars: 4,
    difficulty: 'Medium',
    q: 'Why prefer `stream.pipeline` over `.pipe()`?',
    a: [
      '`.pipe()` handles backpressure but does not forward errors or destroy other streams on failure → leaks and hanging handles.',
      '`pipeline()` wires streams together, propagates errors, and cleans up every stream on error or completion.',
      'The promise version from `node:stream/promises` works nicely with async/await.',
      'Accepts async generator functions as transforms.',
    ],
    code: `import { pipeline } from 'node:stream/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import { createGzip } from 'node:zlib';

await pipeline(
  createReadStream('access.log'),
  createGzip(),
  createWriteStream('access.log.gz'),
);`,
  },
  {
    id: 'buffer',
    group: 'Streams & Buffers',
    stars: 4,
    difficulty: 'Easy',
    q: 'What is a Buffer in Node.js?',
    a: [
      'Fixed-size chunk of raw binary memory allocated outside the V8 heap; subclass of `Uint8Array`.',
      'Used for files, network packets, images, crypto — anywhere data is not text.',
      'Create with `Buffer.from(str, "utf8")`, `Buffer.alloc(size)`; convert with `buf.toString("base64")`.',
      'Size is fixed after creation; `Buffer.concat` joins chunks.',
      'Watch out for splitting multi-byte UTF-8 characters across chunks — use `setEncoding` or `StringDecoder`.',
    ],
  },
  {
    id: 'readfile-vs-createreadstream',
    group: 'Streams & Buffers',
    stars: 4,
    difficulty: 'Easy',
    q: 'When would you use `fs.readFile` vs `fs.createReadStream`?',
    a: [
      '`readFile` loads the whole file into memory — simple, fine for small files (configs, templates).',
      '`createReadStream` reads in chunks (64KB default) — constant memory, suitable for large files and uploads/downloads.',
      'Serving a 2GB file with `readFile` per request can crash the server with OOM.',
      'Streams also start sending bytes to the client sooner.',
    ],
  },
  {
    id: 'transform-stream',
    group: 'Streams & Buffers',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do you implement a custom Transform stream?',
    a: [
      'Extend `Transform` or pass `transform(chunk, encoding, callback)` to the constructor.',
      'Call `callback(null, output)` or `this.push(output)`; call `callback(err)` to signal errors.',
      'Optional `flush(callback)` emits remaining data at the end.',
      'In modern code an async generator inside `pipeline` is often simpler.',
    ],
    code: `import { Transform } from 'node:stream';
const upper = new Transform({
  transform(chunk, _enc, cb) {
    cb(null, chunk.toString().toUpperCase());
  },
});
process.stdin.pipe(upper).pipe(process.stdout);`,
  },
  {
    id: 'stream-modes',
    group: 'Streams & Buffers',
    stars: 2,
    difficulty: 'Medium',
    q: 'What are flowing and paused modes of a Readable stream?',
    a: [
      'Paused (default): data is pulled explicitly with `read()` on `readable` events.',
      'Flowing: data is pushed via `data` events as fast as possible.',
      'Switch to flowing by attaching a `data` listener, calling `resume()`, or `pipe()`.',
      '`pause()` or removing pipe destinations returns to paused; mixing styles is error-prone.',
    ],
  },
  {
    id: 'object-mode',
    group: 'Streams & Buffers',
    stars: 1,
    difficulty: 'Medium',
    q: 'What is object mode in streams?',
    a: [
      'By default streams carry Buffers/strings; `objectMode: true` allows any JS value per chunk.',
      'highWaterMark is then counted in objects (default 16), not bytes.',
      'Useful for row-by-row DB exports, parsed CSV records, or event pipelines.',
    ],
  },
  {
    id: 'buffer-alloc-unsafe',
    group: 'Streams & Buffers',
    stars: 1,
    difficulty: 'Medium',
    q: 'What is the difference between `Buffer.alloc` and `Buffer.allocUnsafe`?',
    a: [
      '`Buffer.alloc(n)` returns zero-filled memory — safe but slightly slower.',
      '`Buffer.allocUnsafe(n)` skips zeroing and may contain old sensitive data from memory.',
      'Only use `allocUnsafe` when you will immediately overwrite every byte.',
      'The deprecated `new Buffer()` constructor should never be used.',
    ],
  },

  // ───────────────────────── Express & HTTP/APIs ─────────────────────────
  {
    id: 'express-middleware',
    group: 'Express & HTTP/APIs',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is middleware in Express and how does it work?',
    a: [
      'Middleware = function `(req, res, next)` executed in order for matching requests.',
      'It can read/modify `req`/`res`, end the response, or call `next()` to pass control on.',
      'Forgetting `next()` or a response leaves the request hanging.',
      'Types: application-level (`app.use`), router-level, built-in (`express.json()`), third-party (cors, helmet), error-handling.',
      'Order matters: body parsers and auth must be registered before routes that need them.',
    ],
    code: `function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  req.user = verifyToken(token);
  next();
}
app.use(express.json());
app.get('/me', requireAuth, (req, res) => res.json(req.user));`,
  },
  {
    id: 'express-error-handling',
    group: 'Express & HTTP/APIs',
    stars: 5,
    difficulty: 'Medium',
    q: 'How does error handling middleware work in Express?',
    a: [
      'Error middleware has four parameters `(err, req, res, next)` and is registered after all routes.',
      'Trigger it with `next(err)` or by throwing in a sync handler.',
      'Express 5 automatically forwards rejected promises from async handlers; Express 4 needs try/catch or a wrapper.',
      'Map known errors to status codes; return a generic 500 message and never leak stack traces in production.',
      'Also add a 404 handler (normal middleware) before the error handler.',
    ],
    code: `app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  const status = err.status ?? 500;
  logger.error(err);
  res.status(status).json({
    error: status < 500 ? err.message : 'Internal Server Error',
  });
});`,
  },
  {
    id: 'rest-principles',
    group: 'Express & HTTP/APIs',
    stars: 4,
    difficulty: 'Easy',
    q: 'What are the principles of RESTful API design?',
    a: [
      'Resources identified by nouns in URLs (`/users/42/orders`), actions expressed by HTTP methods.',
      'GET read, POST create, PUT replace, PATCH partial update, DELETE remove.',
      'Stateless: each request carries everything needed (auth token etc.).',
      'Safe methods (GET, HEAD) do not change state; idempotent methods (GET, PUT, DELETE) can be retried safely.',
      'Use proper status codes, consistent JSON error format, filtering/pagination via query params.',
    ],
  },
  {
    id: 'http-status-codes',
    group: 'Express & HTTP/APIs',
    stars: 4,
    difficulty: 'Easy',
    q: 'Which HTTP status codes should a backend developer know?',
    a: [
      '2xx: 200 OK, 201 Created, 204 No Content.',
      '3xx: 301 permanent, 302/307 temporary redirect, 304 Not Modified (caching).',
      '4xx: 400 Bad Request, 401 Unauthenticated, 403 Forbidden, 404 Not Found, 409 Conflict, 422 Validation failed, 429 Too Many Requests.',
      '5xx: 500 Internal Error, 502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout.',
      '401 = "who are you?"; 403 = "I know you, but you cannot do this".',
    ],
  },
  {
    id: 'cors',
    group: 'Express & HTTP/APIs',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is CORS and how do you configure it in a Node API?',
    a: [
      'Cross-Origin Resource Sharing: browser mechanism that relaxes the same-origin policy via response headers.',
      'Server responds with `Access-Control-Allow-Origin`, `-Methods`, `-Headers`, `-Credentials`.',
      'Non-simple requests (custom headers, JSON content type, PUT/DELETE) trigger an OPTIONS preflight.',
      'With cookies (`credentials: true`) the origin cannot be `*` — echo an allow-listed origin.',
      'CORS is enforced by browsers only; it is not a server-side security control against curl/scripts.',
    ],
    code: `import cors from 'cors';
app.use(cors({
  origin: ['https://app.example.com'],
  credentials: true,
}));`,
  },
  {
    id: 'pagination',
    group: 'Express & HTTP/APIs',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do you implement pagination in an API?',
    a: [
      'Offset/limit: `?page=3&limit=20` → `OFFSET 40 LIMIT 20`; simple, supports jumping to pages.',
      'Offset gets slow on large tables and skips/duplicates rows when data changes between requests.',
      'Cursor/keyset: `?after=<lastId>` → `WHERE id > $1 ORDER BY id LIMIT 20`; fast and stable — ideal for feeds/infinite scroll.',
      'Always cap `limit`, use a deterministic sort with an indexed tie-breaker, return `nextCursor`/`hasMore`.',
    ],
  },
  {
    id: 'http-module-server',
    group: 'Express & HTTP/APIs',
    stars: 3,
    difficulty: 'Easy',
    q: 'How do you create an HTTP server without a framework?',
    a: [
      '`http.createServer((req, res) => {...})` — `req` is a Readable stream, `res` is a Writable stream.',
      'You must parse URL, method, and body manually and set headers/status yourself.',
      'Frameworks (Express, Fastify, Koa, NestJS, Hono) add routing, middleware, body parsing, and validation.',
      'Fastify is typically much faster than Express thanks to schema-based serialization.',
    ],
    code: `import http from 'node:http';
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ path: req.url }));
}).listen(3000);`,
  },
  {
    id: 'express-router',
    group: 'Express & HTTP/APIs',
    stars: 3,
    difficulty: 'Easy',
    q: 'How do you structure routes in a larger Express app?',
    a: [
      '`express.Router()` creates modular mini-apps mounted on a path: `app.use("/users", usersRouter)`.',
      'Layered structure: routes → controllers (HTTP concerns) → services (business logic) → repositories (DB).',
      'Route params `req.params`, query `req.query`, body `req.body` (needs `express.json()`).',
      'Keeps validation, auth, and business logic separate and testable.',
    ],
  },
  {
    id: 'rest-vs-graphql',
    group: 'Express & HTTP/APIs',
    stars: 3,
    difficulty: 'Medium',
    q: 'REST vs GraphQL — when would you choose each?',
    a: [
      'REST: multiple resource endpoints, simple, HTTP caching works out of the box.',
      'GraphQL: single endpoint, client specifies exact fields — avoids over/under-fetching, strongly typed schema.',
      'GraphQL costs: N+1 resolver problem (use DataLoader), harder caching, query complexity limits needed.',
      'REST suits public/simple CRUD APIs; GraphQL suits many clients with varied data needs.',
    ],
  },
  {
    id: 'websockets',
    group: 'Express & HTTP/APIs',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do you implement real-time communication in Node?',
    a: [
      'WebSockets: full-duplex persistent connection after an HTTP upgrade; libs `ws`, Socket.IO.',
      'Server-Sent Events: simple one-way server→client stream over HTTP; auto-reconnect built in.',
      'Polling/long-polling as fallback.',
      'Scaling across instances needs sticky sessions and a pub/sub backplane (Redis adapter) to broadcast.',
    ],
  },
  {
    id: 'api-versioning',
    group: 'Express & HTTP/APIs',
    stars: 2,
    difficulty: 'Easy',
    q: 'How do you version an API?',
    a: [
      'URL path (`/api/v1/users`) — most common and explicit.',
      'Header-based (`Accept: application/vnd.app.v2+json`) or custom header — cleaner URLs, harder to test.',
      'Bump major version only for breaking changes; deprecate old versions with notice and `Deprecation`/`Sunset` headers.',
    ],
  },
  {
    id: 'app-use-vs-app-get',
    group: 'Express & HTTP/APIs',
    stars: 2,
    difficulty: 'Easy',
    q: 'What is the difference between `app.use` and `app.get` in Express?',
    a: [
      '`app.use(path, fn)` matches any HTTP method and any path that starts with `path` — used for middleware.',
      '`app.get(path, fn)` matches only GET requests with an exact route match.',
      'Inside `app.use("/api", ...)`, `req.path` is relative to the mount point.',
    ],
  },

  // ───────────────────────── Security & Auth ─────────────────────────
  {
    id: 'jwt-auth',
    group: 'Security & Auth',
    stars: 5,
    difficulty: 'Medium',
    q: 'How does JWT authentication work?',
    a: [
      'JWT = base64url `header.payload.signature`; signed (HS256 secret or RS256/ES256 key pair), not encrypted.',
      'Login → server issues a short-lived access token; client sends `Authorization: Bearer <token>`; server verifies signature and `exp`.',
      'Stateless: no DB lookup per request, but revocation is hard before expiry.',
      'Use short access tokens (5–15 min) plus rotating refresh tokens stored server-side or in httpOnly cookies.',
      'Never put secrets in the payload; pin the algorithm on verify (avoid `alg: none` attacks).',
    ],
    code: `import jwt from 'jsonwebtoken';
const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
  expiresIn: '15m',
});
const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });`,
  },
  {
    id: 'session-vs-jwt',
    group: 'Security & Auth',
    stars: 5,
    difficulty: 'Medium',
    q: 'Session-based auth vs token-based (JWT) auth — trade-offs?',
    a: [
      'Sessions: server stores session data (Redis/DB); client holds an opaque session ID in an httpOnly cookie.',
      'Sessions are easy to revoke and keep tokens small, but need shared storage when scaling horizontally.',
      'JWT: self-contained, stateless, good for microservices and mobile clients; revocation needs a denylist or short expiry.',
      'Cookies need CSRF protection (`SameSite`, CSRF tokens); tokens in localStorage are exposed to XSS.',
      'Common hybrid: JWT access token + refresh token in httpOnly, Secure, SameSite cookie.',
    ],
  },
  {
    id: 'common-vulnerabilities',
    group: 'Security & Auth',
    stars: 4,
    difficulty: 'Medium',
    q: 'What are common security vulnerabilities in Node apps and how do you prevent them?',
    a: [
      'Injection (SQL/NoSQL/command): parameterized queries, never build queries or shell commands from raw input.',
      'XSS: escape output, Content-Security-Policy, httpOnly cookies.',
      'CSRF: SameSite cookies, CSRF tokens for cookie-authenticated state changes.',
      'Broken access control / IDOR: check ownership on every resource, not just authentication.',
      'Vulnerable deps: `npm audit`, Dependabot/Renovate, lockfiles; ReDoS and prototype pollution are Node-specific risks.',
      'SSRF: validate/allow-list outbound URLs that users can influence.',
    ],
  },
  {
    id: 'password-hashing',
    group: 'Security & Auth',
    stars: 4,
    difficulty: 'Easy',
    q: 'How should passwords be stored?',
    a: [
      'Never plain text or fast hashes (MD5/SHA-256) — they are brute-forced quickly on GPUs.',
      'Use slow, salted algorithms: argon2id (preferred), bcrypt, or scrypt (built into `node:crypto`).',
      'Salt is unique per password and stored with the hash; the cost factor is tuned to ~100ms+.',
      'Compare with constant-time functions (`bcrypt.compare`, `crypto.timingSafeEqual`).',
      'Hashing runs in libuv pool — use the async variants to avoid blocking.',
    ],
    code: `import bcrypt from 'bcrypt';
const hash = await bcrypt.hash(password, 12);
const ok = await bcrypt.compare(attempt, hash);`,
  },
  {
    id: 'rate-limiting',
    group: 'Security & Auth',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do you implement rate limiting?',
    a: [
      'Limits requests per client (IP, API key, user) per time window to stop brute force, scraping, and abuse.',
      'Algorithms: fixed window, sliding window, token bucket, leaky bucket.',
      'In-memory counters break with multiple instances — use a shared store like Redis.',
      'Return 429 with `Retry-After`/`RateLimit-*` headers; often also enforced at the gateway/CDN.',
      'Libraries: `express-rate-limit`, `rate-limiter-flexible`, `@fastify/rate-limit`.',
    ],
  },
  {
    id: 'input-validation',
    group: 'Security & Auth',
    stars: 4,
    difficulty: 'Easy',
    q: 'Why and how should you validate input in a Node API?',
    a: [
      'Never trust client input: body, params, query, headers, and uploaded files.',
      'Validate shape, type, length, and format at the boundary with schemas: zod, Joi, AJV/JSON Schema, class-validator.',
      'Reject unknown fields to avoid mass assignment (e.g. user setting `isAdmin`).',
      'Limit body size (`express.json({ limit: "100kb" })`) to prevent DoS.',
      'Validation ≠ sanitisation; still use parameterized queries and output escaping.',
    ],
  },
  {
    id: 'oauth2-oidc',
    group: 'Security & Auth',
    stars: 4,
    difficulty: 'Medium',
    q: 'Explain OAuth 2.0 and OpenID Connect at a high level.',
    a: [
      'OAuth 2.0 is delegated authorization: a client gets an access token to call an API on a user\'s behalf.',
      'OpenID Connect adds authentication on top: an ID token (JWT) describing who the user is.',
      'Authorization Code flow with PKCE is the standard for web/mobile apps; Client Credentials for service-to-service.',
      'Roles: resource owner, client, authorization server, resource server.',
      'Validate `state` (CSRF), token audience, issuer, and expiry.',
    ],
  },
  {
    id: 'security-headers-helmet',
    group: 'Security & Auth',
    stars: 3,
    difficulty: 'Easy',
    q: 'What does Helmet do in Express?',
    a: [
      'Middleware that sets secure HTTP headers with sensible defaults.',
      'Includes Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options, X-Frame-Options, Referrer-Policy.',
      'Also removes `X-Powered-By` so the stack is not advertised.',
      'One line: `app.use(helmet())`; tune CSP for your frontend.',
    ],
  },
  {
    id: 'secrets-management',
    group: 'Security & Auth',
    stars: 3,
    difficulty: 'Easy',
    q: 'How should secrets be handled in a Node application?',
    a: [
      'Keep secrets out of code and git; inject via environment variables or mounted files.',
      'Use a secret manager (AWS Secrets Manager, Vault, GCP Secret Manager, Doppler) in production.',
      'Rotate keys regularly; use least-privilege credentials per service.',
      'Never log secrets or tokens; redact them in logger config.',
    ],
  },
  {
    id: 'prototype-pollution',
    group: 'Security & Auth',
    stars: 2,
    difficulty: 'Hard',
    q: 'What is prototype pollution?',
    a: [
      'Attacker injects `__proto__` or `constructor.prototype` keys via JSON input into a deep merge/set function.',
      'That modifies `Object.prototype`, affecting every object — can bypass checks or lead to RCE.',
      'Prevent: schema validation, reject those keys, use `Object.create(null)` or `Map` for dictionaries, patched libs.',
      'Node flag `--disable-proto=delete` removes the `__proto__` accessor.',
    ],
  },

  // ───────────────────────── Performance & Scaling ─────────────────────────
  {
    id: 'scaling-node',
    group: 'Performance & Scaling',
    stars: 5,
    difficulty: 'Medium',
    q: 'How do you scale a Node.js application?',
    a: [
      'Vertical within a machine: use all cores with `cluster`, PM2 cluster mode, or one container per core.',
      'Horizontal: run multiple stateless instances behind a load balancer (Nginx, ALB, Kubernetes Service).',
      'Stateless means sessions, caches, and uploads live in external stores (Redis, DB, S3), not process memory.',
      'Reduce load: caching (Redis/CDN), DB indexing and pooling, async jobs via queues.',
      'Offload CPU work to worker_threads or separate services; split into microservices only when justified.',
    ],
  },
  {
    id: 'cluster-module',
    group: 'Performance & Scaling',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is the cluster module and how does it work?',
    a: [
      'Forks multiple Node processes (workers) that share the same server port, one per CPU core.',
      'The primary process distributes connections (round-robin by default on Linux) and can restart crashed workers.',
      'Workers have separate memory — no shared state; communicate via IPC messages or external stores.',
      'Production often uses PM2 cluster mode or container replicas instead of hand-written cluster code.',
    ],
    code: `import cluster from 'node:cluster';
import { availableParallelism } from 'node:os';

if (cluster.isPrimary) {
  for (let i = 0; i < availableParallelism(); i++) cluster.fork();
  cluster.on('exit', () => cluster.fork());
} else {
  (await import('./server.js')).start();
}`,
  },
  {
    id: 'worker-threads',
    group: 'Performance & Scaling',
    stars: 5,
    difficulty: 'Medium',
    q: 'What are worker_threads and when should you use them?',
    a: [
      'Run JS in parallel threads within the same process, each with its own V8 isolate and event loop.',
      'Use for CPU-bound tasks: image processing, hashing, compression, parsing large data, PDF generation.',
      'Not useful for I/O — async I/O is already efficient on the main thread.',
      'Communicate via `postMessage` (structured clone), transfer `ArrayBuffer`s, or share memory with `SharedArrayBuffer` + `Atomics`.',
      'Creating workers is costly — use a pool (e.g. Piscina).',
    ],
    code: `import { Worker } from 'node:worker_threads';
const worker = new Worker('./hash-worker.js', { workerData: { file } });
worker.on('message', (digest) => console.log(digest));
worker.on('error', console.error);`,
  },
  {
    id: 'cluster-vs-worker-vs-child',
    group: 'Performance & Scaling',
    stars: 4,
    difficulty: 'Medium',
    q: 'Compare cluster, worker_threads, and child_process.',
    a: [
      '`cluster`: multiple Node processes sharing a server port — scales HTTP throughput across cores.',
      '`worker_threads`: threads inside one process — CPU-heavy JS with cheaper communication and optional shared memory.',
      '`child_process`: run any external program or separate Node script — isolation, other languages, shell tools.',
      'Processes give crash isolation; a crashing worker thread can be handled without killing the main thread too.',
    ],
  },
  {
    id: 'child-process',
    group: 'Performance & Scaling',
    stars: 4,
    difficulty: 'Medium',
    q: 'Explain `spawn`, `exec`, `execFile`, and `fork`.',
    a: [
      '`spawn`: launches a command, streams stdout/stderr — best for long-running or large-output processes.',
      '`exec`: runs through a shell and buffers output (maxBuffer limit) — convenient but injection-prone with user input.',
      '`execFile`: like exec without a shell — safer for running binaries with arguments.',
      '`fork`: special spawn for Node scripts with a built-in IPC channel (`process.send`/`on("message")`).',
    ],
  },
  {
    id: 'caching-strategies',
    group: 'Performance & Scaling',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do you use caching to improve Node API performance?',
    a: [
      'Layers: HTTP/CDN caching (`Cache-Control`, ETag), in-process LRU cache, distributed cache (Redis/Memcached).',
      'Cache-aside pattern: read cache → on miss read DB → write cache with TTL.',
      'Invalidation is the hard part: TTLs, delete on write, or versioned keys.',
      'Prevent stampede on hot keys with request coalescing, locks, or stale-while-revalidate.',
      'In-process caches are per instance and lost on restart; Redis is shared across instances.',
    ],
    code: `async function getUser(id) {
  const cached = await redis.get('user:' + id);
  if (cached) return JSON.parse(cached);
  const user = await db.user.findUnique({ where: { id } });
  await redis.set('user:' + id, JSON.stringify(user), 'EX', 300);
  return user;
}`,
  },
  {
    id: 'message-queues',
    group: 'Performance & Scaling',
    stars: 3,
    difficulty: 'Medium',
    q: 'When and why would you use a message queue with Node?',
    a: [
      'Move slow or unreliable work (emails, video processing, webhooks, reports) out of the request path.',
      'API enqueues a job and responds fast (202 Accepted); workers process asynchronously.',
      'Benefits: retries with backoff, smoothing load spikes, decoupling services.',
      'Options: BullMQ (Redis), RabbitMQ, Kafka (event streaming), AWS SQS.',
      'Jobs should be idempotent because delivery is usually at-least-once.',
    ],
  },
  {
    id: 'load-balancing-pm2',
    group: 'Performance & Scaling',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do load balancers and process managers fit into a Node deployment?',
    a: [
      'Reverse proxy/LB (Nginx, HAProxy, cloud LB) terminates TLS, serves static files, and distributes traffic.',
      'PM2 keeps processes alive, restarts on crash, runs cluster mode, and supports zero-downtime reloads.',
      'In Kubernetes/Docker, the orchestrator handles restarts and replicas — run one Node process per container.',
      'Behind a proxy, set `app.set("trust proxy", ...)` so `req.ip` and protocol are correct.',
    ],
  },
  {
    id: 'profiling-performance',
    group: 'Performance & Scaling',
    stars: 3,
    difficulty: 'Hard',
    q: 'How do you find performance bottlenecks in a Node app?',
    a: [
      'Measure first: load test with autocannon/k6, watch latency percentiles (p95/p99), not averages.',
      'CPU profiling: `node --cpu-prof`, `--inspect` + DevTools, flame graphs (0x, clinic flame).',
      'Track event loop delay, heap usage, GC pauses, and thread pool saturation.',
      'Common culprits: N+1 DB queries, missing indexes, sync calls, large JSON serialization, no connection pooling.',
      '`perf_hooks` (`performance.now`, `PerformanceObserver`) for fine-grained timing.',
    ],
  },
  {
    id: 'http-keepalive-compression',
    group: 'Performance & Scaling',
    stars: 2,
    difficulty: 'Medium',
    q: 'How do keep-alive and compression affect Node HTTP performance?',
    a: [
      'Keep-alive reuses TCP/TLS connections, avoiding handshake cost on each request; Node 19+ http agent enables it by default.',
      'Built-in `fetch` (undici) pools connections automatically.',
      'Gzip/Brotli compression shrinks JSON responses but costs CPU — often better done at the reverse proxy/CDN.',
      'Tune server `keepAliveTimeout` above the load balancer idle timeout to avoid 502s.',
    ],
  },

  // ───────────────────────── Databases & ORMs ─────────────────────────
  {
    id: 'connection-pooling',
    group: 'Databases & ORMs',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is database connection pooling and why is it important?',
    a: [
      'A pool keeps a set of open DB connections reused across requests instead of connecting per query.',
      'Opening connections is slow (TCP + TLS + auth); pooling cuts latency and protects the DB from overload.',
      'Size the pool deliberately: instances × pool size must stay below the DB max connections.',
      'Always release connections (use `finally` or pool helpers) or the pool starves and requests hang.',
      'Serverless needs external poolers (PgBouncer, RDS Proxy, Supabase pooler) since each invocation may open connections.',
    ],
  },
  {
    id: 'parameterized-queries',
    group: 'Databases & ORMs',
    stars: 4,
    difficulty: 'Easy',
    q: 'How do you prevent SQL and NoSQL injection in Node?',
    a: [
      'Use parameterized queries/prepared statements so input is sent as data, never concatenated into SQL.',
      'ORMs and query builders parameterize by default, but raw query helpers can still be misused.',
      'NoSQL injection: objects like `{ "$gt": "" }` in a Mongo filter — validate types, sanitise operators.',
      'Least-privilege DB users limit damage if injection happens.',
    ],
    code: `// Vulnerable
await pool.query("SELECT * FROM users WHERE email = '" + email + "'");
// Safe
await pool.query('SELECT * FROM users WHERE email = $1', [email]);`,
  },
  {
    id: 'transactions',
    group: 'Databases & ORMs',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do you use database transactions in Node?',
    a: [
      'A transaction groups queries so they all commit or all roll back (ACID).',
      'All statements must run on the same connection: `BEGIN` → queries → `COMMIT`, `ROLLBACK` on error.',
      'ORMs provide helpers: Prisma `$transaction`, Sequelize/TypeORM/Knex/Drizzle transaction callbacks.',
      'Keep transactions short; avoid external HTTP calls inside them.',
      'Know isolation levels and handle serialization/deadlock errors with retries.',
    ],
    code: `const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query('UPDATE accounts SET bal = bal - $1 WHERE id = $2', [amt, from]);
  await client.query('UPDATE accounts SET bal = bal + $1 WHERE id = $2', [amt, to]);
  await client.query('COMMIT');
} catch (e) {
  await client.query('ROLLBACK');
  throw e;
} finally {
  client.release();
}`,
  },
  {
    id: 'orm-vs-query-builder',
    group: 'Databases & ORMs',
    stars: 3,
    difficulty: 'Medium',
    q: 'ORM vs query builder vs raw SQL — trade-offs?',
    a: [
      'ORM (Prisma, TypeORM, Sequelize, Mongoose for Mongo): models, relations, migrations, productivity, type safety.',
      'ORMs can hide inefficient queries (N+1) and make complex SQL awkward.',
      'Query builders (Knex, Kysely, Drizzle): composable, closer to SQL, still parameterized and typed.',
      'Raw SQL (`pg`, `mysql2`): full control and performance, more boilerplate.',
      'Many teams mix: ORM for CRUD, raw SQL for complex reports.',
    ],
  },
  {
    id: 'n-plus-one',
    group: 'Databases & ORMs',
    stars: 3,
    difficulty: 'Medium',
    q: 'What is the N+1 query problem and how do you fix it?',
    a: [
      'Fetching a list (1 query) then querying related data for each item (N queries).',
      'Shows up with lazy-loaded ORM relations and GraphQL resolvers.',
      'Fix with joins/eager loading (`include`, `populate`), `WHERE id IN (...)` batching, or DataLoader.',
      'Detect by logging query counts per request.',
    ],
  },
  {
    id: 'sql-vs-nosql',
    group: 'Databases & ORMs',
    stars: 3,
    difficulty: 'Easy',
    q: 'When would you choose SQL vs NoSQL for a Node backend?',
    a: [
      'SQL (PostgreSQL, MySQL): structured relational data, joins, strong consistency, transactions.',
      'NoSQL document (MongoDB): flexible schemas, nested documents, easy horizontal scaling.',
      'Key-value (Redis) for caching/sessions; wide-column (Cassandra) for massive write throughput.',
      'Default to Postgres unless the access pattern clearly favours another model.',
    ],
  },
  {
    id: 'migrations',
    group: 'Databases & ORMs',
    stars: 2,
    difficulty: 'Easy',
    q: 'What are database migrations?',
    a: [
      'Versioned, ordered scripts that evolve the schema; stored in git alongside code.',
      'Tools: Prisma Migrate, Knex, TypeORM, Drizzle Kit, node-pg-migrate.',
      'Run automatically in CI/CD before or during deploy.',
      'Make changes backward compatible (expand → migrate data → contract) for zero-downtime deploys.',
    ],
  },

  // ───────────────────────── Testing, Debugging & Production ─────────────────────────
  {
    id: 'graceful-shutdown',
    group: 'Testing, Debugging & Production',
    stars: 5,
    difficulty: 'Medium',
    q: 'How do you implement graceful shutdown in a Node server?',
    a: [
      'On `SIGTERM`/`SIGINT` (sent by Docker/Kubernetes/PM2), stop accepting new connections.',
      'Let in-flight requests finish (`server.close()`), then close DB pools, queues, and Redis clients.',
      'Fail readiness checks first so the load balancer stops routing traffic.',
      'Set a hard timeout to force exit if cleanup hangs.',
      'Without it, deploys drop requests and may leave partial writes.',
    ],
    code: `const server = app.listen(3000);
async function shutdown(signal) {
  console.log(signal, 'received, shutting down');
  server.close(async () => {
    await db.end();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);`,
  },
  {
    id: 'testing-node',
    group: 'Testing, Debugging & Production',
    stars: 4,
    difficulty: 'Easy',
    q: 'How do you test a Node.js backend?',
    a: [
      'Unit tests: pure functions and services in isolation; integration tests: real DB/routes; E2E: whole system.',
      'Runners: built-in `node:test` + `node:assert` (stable since Node 20), Jest, Vitest, Mocha.',
      'Supertest drives Express/HTTP apps without opening a real port.',
      'Use a disposable test DB (Docker/Testcontainers) and reset state between tests.',
      'Export the app separately from `listen()` so tests can import it.',
    ],
    code: `import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app } from '../app.js';

test('GET /health returns ok', async () => {
  const res = await request(app).get('/health');
  assert.equal(res.status, 200);
});`,
  },
  {
    id: 'logging',
    group: 'Testing, Debugging & Production',
    stars: 4,
    difficulty: 'Easy',
    q: 'What are best practices for logging in Node?',
    a: [
      'Use a structured JSON logger (pino, winston) instead of `console.log` in production.',
      'Log levels (fatal/error/warn/info/debug) configurable per environment.',
      'Attach request IDs/trace IDs for correlation across services (AsyncLocalStorage helps).',
      'Write to stdout and let the platform ship logs (ELK, Loki, Datadog, CloudWatch).',
      'Redact secrets and PII; avoid logging full request bodies.',
    ],
  },
  {
    id: 'debugging-node',
    group: 'Testing, Debugging & Production',
    stars: 3,
    difficulty: 'Easy',
    q: 'How do you debug a Node.js application?',
    a: [
      '`node --inspect app.js` (or `--inspect-brk` to pause on start) and attach Chrome DevTools (`chrome://inspect`) or VS Code.',
      'Breakpoints, step through, watch expressions, heap snapshots, CPU profiles.',
      '`debugger;` statement pauses when an inspector is attached.',
      'Use `NODE_DEBUG=http,net` for core module internals; `--trace-warnings` for warning origins.',
      'Never expose the inspector port publicly — it allows arbitrary code execution.',
    ],
  },
  {
    id: 'mocking',
    group: 'Testing, Debugging & Production',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do you mock dependencies in Node tests?',
    a: [
      'Mock external boundaries (HTTP APIs, email, payment) — not the code under test.',
      'Tools: `node:test` `mock.fn`/`mock.method`/`mock.timers`, Jest/Vitest `vi.mock`, Sinon.',
      'HTTP mocking: nock, MSW, or undici `MockAgent` for `fetch`.',
      'Dependency injection makes mocking simpler than patching module imports (ESM imports are hard to stub).',
    ],
  },
  {
    id: 'health-checks-monitoring',
    group: 'Testing, Debugging & Production',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do you monitor a Node service in production?',
    a: [
      'Health endpoints: liveness (process is up) and readiness (dependencies OK, can take traffic).',
      'Metrics: request rate, error rate, latency percentiles, event loop lag, heap, CPU (prom-client + Prometheus/Grafana).',
      'Distributed tracing with OpenTelemetry; APMs like Datadog, New Relic, Sentry for errors.',
      'Alert on symptoms (SLO breaches), not every log line.',
    ],
  },
  {
    id: 'docker-node',
    group: 'Testing, Debugging & Production',
    stars: 2,
    difficulty: 'Easy',
    q: 'What are best practices for running Node in Docker?',
    a: [
      'Use an official slim/alpine LTS image and multi-stage builds; `npm ci --omit=dev`.',
      'Copy package files first to leverage layer caching; add a `.dockerignore` for node_modules.',
      'Run as non-root (`USER node`), set `NODE_ENV=production`.',
      'Start with `node server.js` (not `npm start`) or use `--init`/tini so signals reach Node for graceful shutdown.',
    ],
  },
  {
    id: 'watch-mode',
    group: 'Testing, Debugging & Production',
    stars: 1,
    difficulty: 'Easy',
    q: 'How do you auto-restart a Node app during development?',
    a: [
      'Node 18.11+ has built-in `node --watch app.js` (stable in Node 22).',
      'nodemon is the classic tool; `tsx watch` for TypeScript.',
      'Only for development — production restarts are handled by PM2/systemd/orchestrators.',
    ],
  },
];

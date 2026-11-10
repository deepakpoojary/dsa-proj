import type { BankQuestion } from './types';

// Node.js interview bank, part 1 (questions 1-50), written so a complete
// fresher can learn each topic from scratch.
export const NODE_1: BankQuestion[] = [
  // ───────────────────────── Fundamentals ─────────────────────────
  {
    id: 'what-is-node',
    group: 'Fundamentals',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is Node.js and why is it used for backends?',
    a: [
      "# ELI5",
      "Imagine JavaScript is a chef who used to work only inside one kitchen: the web browser.",
      "Node.js is a new kitchen built for that same chef, so the chef can now cook anywhere, like on a big server computer.",
      "In this new kitchen the chef gets extra tools the browser never had: a fridge (files), a phone line (network) and a pantry list (operating system info).",
      "Back to tech: Node.js lets you run JavaScript outside the browser, so the same language can power servers, scripts and command-line tools.",
      "# What it is",
      "Node.js is a runtime environment — a program that reads and executes your JavaScript code and gives it extra abilities.",
      "It is built on V8 — Google's JavaScript engine (the same one inside Chrome) that turns JavaScript into fast machine code.",
      "It also uses libuv — a C library that talks to the operating system for files, network sockets, timers and a small pool of helper threads.",
      "Node is not a language and not a framework; Express, Fastify and NestJS are frameworks that run on top of Node.",
      "Its key design is non-blocking I/O — I/O means input/output such as reading a file, querying a database or calling an API, and non-blocking means Node does not sit idle waiting for it.",
      "It runs your JavaScript on a single main thread — a thread is one line of execution inside a program — and uses an event loop to juggle many tasks.",
      "The event loop is a forever-running cycle that checks 'has anything finished?' and runs the matching callback — a function you passed in to be called later.",
      "# How it works",
      "You run `node server.js` and Node starts the process.",
      "  V8 compiles and runs your top-level code from top to bottom.",
      "  When your code asks for I/O (e.g. a database query), Node hands the job to libuv or the OS and immediately moves on.",
      "  When the job finishes, its callback is put in a queue.",
      "  The event loop picks callbacks from the queues and runs them one at a time on the main thread.",
      "  When there is nothing left to wait for (no timers, sockets or pending work), the process exits.",
      "# Example walkthrough",
      "Line 1 imports the built-in `node:http` module; the `node:` prefix marks it as a core module, so nothing needs installing.",
      "`createServer` registers a function that runs for every incoming request.",
      "`listen(3000)` opens port 3000 and keeps the process alive waiting for connections.",
      "'Setting up...' prints first, because the listen callback only runs after the port is actually open, which happens after the synchronous code finishes.",
      "Visiting http://localhost:3000/users runs the handler, which replies with JSON; thousands of visitors can be served by this one thread because none of them blocks it.",
      "# Why it matters / when to use",
      "REST and GraphQL APIs, real-time apps (chat, live dashboards via WebSockets), and BFFs — backends-for-frontends that combine several APIs for one UI.",
      "Microservices and serverless functions (AWS Lambda, Vercel), because Node starts quickly and uses little memory.",
      "One language (JavaScript or TypeScript) for frontend and backend, so teams can share code like validation rules and types.",
      "npm — the Node package registry — has millions of ready-made libraries.",
      "# Common mistakes",
      "Calling Node a framework or a language; say 'a JavaScript runtime built on V8 and libuv'.",
      "Thinking Node is good for heavy CPU work like video encoding; long calculations block the single main thread, so use `worker_threads` or another service.",
      "Using browser-only things like `window` or `document` in Node; they do not exist there.",
      "# Say this in the interview",
      "Node.js is a JavaScript runtime built on Google's V8 engine and the libuv library. It runs JavaScript on a single thread with an event loop and non-blocking I/O, so one process can handle many concurrent connections cheaply. That makes it a great fit for I/O-heavy backends like APIs, real-time apps and microservices, and it lets teams use one language across the stack.",
      "  Follow-up: Is Node single-threaded? — Your JavaScript runs on one thread, but libuv uses a thread pool and the OS kernel for some I/O, so Node as a whole uses several threads.",
      "  Follow-up: When is Node a bad choice? — For long CPU-bound work, unless you move it to worker threads or a separate service.",
    ],
    code: `// server.mjs — run with: node server.mjs
import http from 'node:http'; // built-in module, nothing to install

const server = http.createServer((req, res) => {
  // Runs once for EVERY incoming request
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'Hello from Node', path: req.url }));
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

console.log('Setting up...');
// Output order:
// → Setting up...
// → Server running on http://localhost:3000
// Visiting /users returns → {"message":"Hello from Node","path":"/users"}`,
  },
  {
    id: 'single-threaded-concurrency',
    group: 'Fundamentals',
    stars: 5,
    difficulty: 'Medium',
    q: 'Node is single-threaded — how does it handle thousands of concurrent requests?',
    a: [
      "# ELI5",
      "Picture a restaurant with only one waiter but many tables.",
      "The waiter takes an order, gives it to the kitchen, and goes straight to the next table instead of standing at the kitchen door waiting.",
      "When a dish is ready, the kitchen rings a bell and the waiter carries it to the right table.",
      "Back to tech: the waiter is Node's main thread, the kitchen is the OS and libuv doing I/O, and the bell is the event loop running your callback when the I/O finishes.",
      "# What it is",
      "Concurrency means handling many tasks that are in progress at the same time; parallelism means literally doing several things at the same instant on different CPU cores.",
      "Node achieves concurrency without needing parallelism for your JavaScript: one thread runs your code, but it never waits for slow I/O.",
      "A typical web request spends most of its time waiting — for the database, a cache or another API — and very little time computing.",
      "While a request waits, Node's thread is free to start or finish other requests.",
      "The waiting is done by the operating system (epoll on Linux, kqueue on macOS, IOCP on Windows — kernel features that watch many sockets at once) or by libuv's thread pool for things like file access and DNS lookups.",
      "So 'single-threaded' really means 'your JavaScript runs on a single thread'; Node itself has extra threads behind the scenes.",
      "# How it works",
      "Request A arrives; its handler starts a database query.",
      "  Node registers the query's socket with the OS and returns right away; the rest of the handler is parked in a callback or a pending Promise.",
      "Request B arrives; the same thing happens — the thread is free because it is not waiting on A.",
      "The database answers A; the OS tells libuv, which queues A's callback.",
      "The event loop runs A's callback, which sends A's response.",
      "Because each step takes only microseconds of CPU, one thread can interleave thousands of requests.",
      "# Example walkthrough",
      "`fakeDbQuery` simulates a 100 ms database call using `setTimeout`, which does not block the thread.",
      "We start three requests together with `Promise.all` instead of awaiting each one before starting the next.",
      "All three 'start' lines print instantly, showing the thread did not wait.",
      "About 100 ms later all three 'done' lines print, and the total time is about 100 ms, not 300 ms, because the waits overlapped.",
      "# Why it matters / when to use",
      "It is why a small Node server can hold thousands of open connections (WebSockets, long polling, streaming) with low memory.",
      "Each connection costs only a small object, not a whole thread with its own stack (often about 1 MB each in thread-per-request servers).",
      "To use multiple CPU cores you run several Node processes (cluster module, PM2, or several containers behind a load balancer).",
      "# Common mistakes",
      "Doing CPU-heavy work (big loops, image resizing, parsing huge JSON) in a request handler; it freezes every other request. Fix: offload to `worker_threads` or a job queue.",
      "Using sync APIs like `fs.readFileSync` inside handlers; use the async `fs/promises` versions.",
      "Awaiting independent calls one after another; start them together with `Promise.all` so they wait in parallel.",
      "# Say this in the interview",
      "Node runs JavaScript on one thread but uses non-blocking I/O. When a request needs the database or network, Node hands that wait to the OS or libuv's thread pool and moves on to other requests. When the result is ready, the event loop runs the callback. Since web requests are mostly waiting, one thread can serve thousands of them, as long as nobody blocks it with heavy CPU work.",
      "  Follow-up: How do you use all CPU cores? — Run one Node process per core using the cluster module, PM2, or multiple containers behind a load balancer.",
      "  Follow-up: What threads does Node actually have? — The main JS thread, libuv's thread pool (4 by default), plus V8 helper threads for garbage collection and compilation.",
    ],
    code: `// concurrency.mjs (.mjs so top-level await works)
function fakeDbQuery(id) {
  // Simulates a slow DB call WITHOUT blocking the thread
  return new Promise((resolve) => {
    setTimeout(() => resolve({ id, name: 'user' + id }), 100);
  });
}

async function handleRequest(id) {
  console.log('start request', id);
  const user = await fakeDbQuery(id); // thread is FREE while waiting
  console.log('done request', id, user.name);
}

const t0 = Date.now();
// Start 3 "requests" concurrently on ONE thread
await Promise.all([handleRequest(1), handleRequest(2), handleRequest(3)]);
console.log('total ms ≈', Date.now() - t0);
// → start request 1
// → start request 2
// → start request 3
// → done request 1 user1   (after ~100 ms)
// → done request 2 user2
// → done request 3 user3
// → total ms ≈ 100  (not 300 — the waits overlapped)`,
  },
  {
    id: 'blocking-vs-non-blocking',
    group: 'Fundamentals',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is the difference between blocking and non-blocking code in Node?',
    a: [
      "# ELI5",
      "Blocking is like standing in front of the microwave for 3 minutes, doing nothing until it beeps.",
      "Non-blocking is pressing start, then washing dishes until you hear the beep.",
      "Both get the food hot, but in the second case you finish more chores in the same time.",
      "Back to tech: blocking code makes Node's single thread wait; non-blocking code starts the work and lets the thread do other things until the result comes back.",
      "# What it is",
      "Blocking code stops the main thread until an operation finishes, e.g. `fs.readFileSync`, `crypto.pbkdf2Sync`, or a huge `for` loop.",
      "Non-blocking code starts an operation and returns immediately; the result is delivered later through a callback, a Promise, or an event.",
      "Synchronous (sync) means 'finishes before the next line runs'; asynchronous (async) means 'finishes later, after other code has had a turn'.",
      "Most built-in I/O functions come in several forms: `fs.readFile` (callback), `readFile` from `fs/promises` (Promise) and `fs.readFileSync` (blocking).",
      "Because Node has one JavaScript thread, blocking it blocks every user of your server, not just the current request.",
      "Note: `await` does not block the thread; it pauses only the current async function and lets other code run.",
      "# How it works",
      "Blocking call:",
      "  The thread calls into the OS and sits waiting; the event loop cannot run any other callbacks or accept requests.",
      "Non-blocking call:",
      "  Node hands the job to libuv (thread pool or OS), registers a callback, and returns right away.",
      "  Your next lines keep running; other requests keep being served.",
      "  When the job completes, the callback (or Promise resolution) is queued and the event loop runs it.",
      "# Example walkthrough",
      "The script first does a blocking `readFileSync`; 'A' prints only after the file is fully read.",
      "Then it calls `readFile` from `node:fs/promises` and attaches `.then`; the call returns a Promise immediately.",
      "'C' prints before 'B' because the async read finishes later, after the synchronous code is done.",
      "The final busy loop shows CPU blocking: for 2 seconds nothing else can run, not even the 0 ms timer that is already due.",
      "# Why it matters / when to use",
      "In servers, always use non-blocking APIs inside request handlers so one slow request does not freeze everyone else.",
      "Sync APIs are fine at startup (reading a config file once before the server listens) and in small CLI scripts.",
      "Watch out for hidden CPU blockers: sync password hashing, big `JSON.stringify` calls, badly written regular expressions.",
      "# Common mistakes",
      "Thinking `async` on a function makes its body non-blocking; a CPU loop inside an async function still blocks the thread.",
      "Using `readFileSync` in a route handler because it is 'simpler'; use `await readFile(...)` instead.",
      "Forgetting that heavy computation must go to `worker_threads`, a child process, or a separate service.",
      "# Say this in the interview",
      "Blocking code makes the thread wait until an operation finishes, and since Node runs JavaScript on one thread, that stalls every request. Non-blocking code starts the operation, returns immediately, and gets the result later via a callback or Promise while the event loop keeps serving others. In servers I use the async APIs and keep CPU-heavy work off the main thread.",
      "  Follow-up: Is `await` blocking? — No, it only suspends the current async function; the thread goes back to the event loop.",
      "  Follow-up: When are sync APIs acceptable? — During startup or in one-off scripts, where nothing else is waiting.",
    ],
    code: `// blocking.mjs
import fs from 'node:fs';
import { readFile } from 'node:fs/promises';

// 1) BLOCKING: the whole thread waits here
const src = fs.readFileSync(new URL(import.meta.url), 'utf8');
console.log('A: sync read done,', src.length > 0); // → A: sync read done, true

// 2) NON-BLOCKING: starts the read and returns a Promise immediately
readFile(new URL(import.meta.url), 'utf8').then(() => {
  console.log('B: async read done'); // printed LATER
});
console.log('C: I run before B'); // → C: I run before B

// 3) CPU blocking: even a 0 ms timer must wait for this loop
setTimeout(() => console.log('D: timer finally ran'), 0);
const end = Date.now() + 2000;
while (Date.now() < end) {} // blocks for 2 s — nothing else can run
// Final order: A, C, (2 s pause), then B and D (their order depends on I/O timing)`,
  },
  {
    id: 'eventemitter',
    group: 'Fundamentals',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is EventEmitter and how is it used?',
    a: [
      "# ELI5",
      "Think of a school loudspeaker. The office announces 'Lunch is ready!' and every class that cares about lunch reacts.",
      "The office does not need to know which classes are listening; classes simply sign up for the announcements they care about.",
      "Back to tech: an EventEmitter is the loudspeaker, `emit` is the announcement, and `on` is a class signing up to hear a named announcement.",
      "# What it is",
      "`EventEmitter` is a class from the built-in `node:events` module that implements the publish/subscribe (pub/sub) pattern — one part publishes events, other parts subscribe to them.",
      "An event is just a name (a string or Symbol) plus optional data.",
      "A listener is a function registered for an event name with `on(name, fn)` (alias `addListener`).",
      "`emit(name, ...args)` calls every listener for that name, in the order they were added, passing the arguments.",
      "Other methods: `once` (listener runs one time then auto-removes), `off`/`removeListener`, `removeAllListeners`, `listenerCount`, `prependListener`.",
      "Much of Node is built on it: HTTP servers emit 'request', streams emit 'data' and 'end', `process` emits 'exit' and 'SIGTERM'.",
      "Important: `emit` is synchronous — listeners run immediately, one after another, before `emit` returns.",
      "# How it works",
      "Internally the emitter keeps a map from event name to a list of listener functions.",
      "  `on` pushes your function into the list for that name.",
      "  `emit` copies the list and calls each function in turn, with `this` set to the emitter (for normal functions).",
      "  If the event name is 'error' and there are no listeners, `emit` throws the error, which can crash the process.",
      "  If more than 10 listeners are added for one event, Node prints a MaxListenersExceededWarning, which often signals a memory leak.",
      "# Example walkthrough",
      "We create an `OrderService` class that extends `EventEmitter`, so it inherits `on` and `emit`.",
      "Two listeners subscribe to 'created': one sends an email, one updates stats.",
      "A `once` listener on 'created' runs only for the first order.",
      "Calling `createOrder(42)` emits 'created'; the three listeners run synchronously before 'after emit' prints.",
      "The second order triggers only the two `on` listeners because the `once` listener was removed.",
      "The 'error' listener is attached, so emitting an error is handled instead of crashing the process.",
      "# Why it matters / when to use",
      "Decoupling: the order code does not need to import the email or analytics code; they just listen.",
      "Building your own streams, job queues, or domain events (user.signedUp, payment.failed) inside one process.",
      "Understanding it is required to use streams, sockets and the `process` object correctly.",
      "For events across multiple servers you need a message broker (Redis pub/sub, Kafka, RabbitMQ); EventEmitter is in-process only.",
      "# Common mistakes",
      "Not handling 'error' events; always add `emitter.on('error', handler)`.",
      "Adding listeners inside a request handler and never removing them, causing leaks; use `once` or call `off`.",
      "Assuming `emit` is async; slow listeners block the code that emitted. Make listener work async or defer it with `setImmediate` if needed.",
      "Using arrow functions as listeners and expecting `this` to be the emitter; arrows keep the outer `this`.",
      "# Say this in the interview",
      "EventEmitter is Node's built-in pub/sub class. You register listeners with `on` or `once` and trigger them with `emit`, which calls listeners synchronously in registration order. Core pieces like HTTP servers, streams and `process` are built on it. I always attach an 'error' listener, because an unhandled 'error' event throws.",
      "  Follow-up: Is emit sync or async? — Synchronous; listeners run before `emit` returns.",
      "  Follow-up: How do you await a single event? — Use `await once(emitter, 'name')` from `node:events`, which returns a Promise.",
    ],
    code: `// events.mjs
import { EventEmitter } from 'node:events';

class OrderService extends EventEmitter {
  createOrder(id) {
    // ...save to DB...
    this.emit('created', { id }); // calls listeners synchronously
    console.log('after emit', id);
  }
}

const orders = new OrderService();
orders.on('created', (o) => console.log('email sent for', o.id));
orders.on('created', (o) => console.log('stats updated for', o.id));
orders.once('created', () => console.log('first order ever!'));
orders.on('error', (err) => console.error('handled:', err.message));

orders.createOrder(42);
// → email sent for 42
// → stats updated for 42
// → first order ever!
// → after emit 42
orders.createOrder(43);
// → email sent for 43
// → stats updated for 43
// → after emit 43   (the once-listener is gone)
orders.emit('error', new Error('boom')); // → handled: boom`,
  },
  {
    id: 'global-objects',
    group: 'Fundamentals',
    stars: 3,
    difficulty: 'Easy',
    q: 'What are the important global objects in Node.js?',
    a: [
      "# ELI5",
      "When you move into a furnished flat, some things are already there: a fridge, a light, a clock. You did not bring them; you just use them.",
      "Back to tech: global objects are the things Node puts in every file for you, so you can use them without importing anything.",
      "# What it is",
      "A global is a value you can use anywhere without `import` or `require`.",
      "`globalThis` — the standard name for the global object in every JavaScript environment; `global` is Node's older alias.",
      "`process` — information and control for the running program: env variables, arguments, exit codes, memory use.",
      "`console` — logging: `log`, `error`, `warn`, `table`, `time`/`timeEnd`.",
      "`Buffer` — a class for raw binary data (bytes), used for files, network packets and encodings.",
      "Timers — `setTimeout`, `setInterval`, `setImmediate`, `queueMicrotask` and their clear functions.",
      "Web-standard globals now built in: `fetch`, `URL`, `URLSearchParams`, `AbortController`, `TextEncoder`/`TextDecoder`, `structuredClone`, `crypto.randomUUID()`, `Blob`, `performance`.",
      "Module-scoped values (CommonJS only): `__dirname` (folder of the current file), `__filename` (full path), `require`, `module`, `exports` — these are not truly global; each file gets its own.",
      "In ES modules use `import.meta.dirname` and `import.meta.filename` (Node 20.11+) or `import.meta.url` instead.",
      "# How it works",
      "When Node starts, it creates the global object and attaches these built-ins to it.",
      "  When your code uses a name that is not declared locally, JavaScript looks it up through outer scopes until it reaches `globalThis`.",
      "  For CommonJS files, Node wraps each file in a function that receives `exports, require, module, __filename, __dirname` as parameters, which is why they look global.",
      "# Example walkthrough",
      "The snippet prints the Node version and platform from `process`.",
      "It builds a `Buffer` from a string and shows its bytes in hex.",
      "It uses the global classes `URL` and `structuredClone` with no imports.",
      "It prints `import.meta.dirname` for the current folder in an ES module.",
      "Finally it shows that `globalThis.setTimeout === setTimeout`, proving timers live on the global object.",
      "# Why it matters / when to use",
      "You use `process.env` for config, `console` for logs, `Buffer` for binary data and timers for scheduling in nearly every backend.",
      "Knowing which globals exist avoids installing unneeded packages (e.g. `node-fetch` or `uuid` are often no longer necessary).",
      "# Common mistakes",
      "Using `__dirname` in an ES module; it throws ReferenceError. Use `import.meta.dirname`.",
      "Adding your own variables to `global`; it creates hidden coupling and is hard to test. Pass dependencies explicitly.",
      "Expecting browser globals like `window`, `document` or `localStorage`; they do not exist in Node.",
      "# Say this in the interview",
      "Node provides globals like `globalThis`, `process`, `console`, `Buffer`, the timer functions, and web-standard APIs such as `fetch`, `URL`, `AbortController` and `structuredClone`. Values like `__dirname`, `require` and `module` look global but are actually per-file parameters of the CommonJS module wrapper; in ES modules you use `import.meta` instead.",
      "  Follow-up: Why is `__dirname` undefined in ESM? — ESM files are not wrapped in the CommonJS function, so use `import.meta.dirname` or `fileURLToPath(import.meta.url)`.",
    ],
    code: `// globals.mjs — no imports needed for any of these
console.log(process.version, process.platform); // → e.g. v22.11.0 linux

const buf = Buffer.from('Hi');
console.log(buf);                 // → <Buffer 48 69>
console.log(buf.toString('hex')); // → 4869

const url = new URL('https://api.example.com/users?page=2');
console.log(url.searchParams.get('page')); // → 2

const original = { a: 1, nested: { b: 2 } };
const copy = structuredClone(original); // deep copy
copy.nested.b = 99;
console.log(original.nested.b); // → 2 (original untouched)

console.log(crypto.randomUUID()); // → e.g. 3b241101-e2bb-4255-8caf-4136c566a962
console.log(import.meta.dirname); // → folder of this file (Node 20.11+)
console.log(globalThis.setTimeout === setTimeout); // → true`,
  },
  {
    id: 'process-object',
    group: 'Fundamentals',
    stars: 3,
    difficulty: 'Easy',
    q: 'What does the `process` object provide?',
    a: [
      "# ELI5",
      "Imagine your program is a worker, and `process` is the worker's ID badge plus walkie-talkie.",
      "The badge says who the worker is and what instructions they were given; the walkie-talkie lets the boss say 'stop now' and lets the worker report 'I'm done'.",
      "Back to tech: `process` describes the running Node program (env vars, arguments, memory) and lets it react to signals and exit with a status code.",
      "# What it is",
      "`process` is a global object representing the current Node.js process — a process is one running instance of a program, with its own memory and ID given by the OS.",
      "`process.env` — environment variables, which are key/value settings passed in from outside (e.g. `PORT`, `DATABASE_URL`); all values are strings.",
      "`process.argv` — command-line arguments as an array: [path to node, path to script, ...your args].",
      "`process.exit(code)` and `process.exitCode` — end the program; code 0 means success, anything else means failure.",
      "`process.cwd()` — current working directory, the folder you ran the command from (not necessarily where the file is).",
      "`process.pid`, `process.platform`, `process.version`, `process.uptime()`, `process.memoryUsage()`, `process.hrtime.bigint()` for precise timing.",
      "`process.stdin`, `process.stdout`, `process.stderr` — streams for input, normal output and error output.",
      "It is an EventEmitter with events like 'exit', 'SIGTERM', 'SIGINT', 'uncaughtException' and 'unhandledRejection'.",
      "A signal is a message the OS sends to a process; SIGTERM means 'please shut down', SIGINT is what Ctrl+C sends.",
      "# How it works",
      "When Node starts, it fills `process` from the OS: environment, arguments, PID, platform.",
      "  When the OS sends a signal, Node emits a matching event on `process` if you listen for it.",
      "  When the event loop has no more work, Node emits 'beforeExit' and then 'exit', and exits with `process.exitCode` (default 0).",
      "  Calling `process.exit()` stops immediately, even if writes or requests are still pending.",
      "# Example walkthrough",
      "Run with `PORT=4000 node app.mjs --verbose`.",
      "`process.env.PORT` is the string '4000', so we convert it with `Number`.",
      "`process.argv.slice(2)` drops the first two entries and leaves only `['--verbose']`.",
      "`memoryUsage().heapUsed` prints how much JavaScript memory is in use.",
      "The SIGTERM handler closes the server cleanly and sets `exitCode` instead of calling `exit()`, so pending work can finish.",
      "# Why it matters / when to use",
      "Configuration through `process.env` is the standard way to configure apps in Docker, Kubernetes and cloud platforms.",
      "Graceful shutdown: containers get SIGTERM before being killed, so you close the server and DB connections in a handler.",
      "CI scripts rely on correct exit codes to mark a build as passed or failed.",
      "# Common mistakes",
      "Treating `process.env.X` as a number or boolean; it is always a string or undefined. Parse and validate it.",
      "Calling `process.exit()` while logs or responses are still being written; set `process.exitCode` and let the process end naturally.",
      "Confusing `process.cwd()` with the file's folder; use `import.meta.dirname` for paths relative to the file.",
      "# Say this in the interview",
      "The `process` global represents the running Node program. It gives me environment variables, command-line arguments, the working directory, memory and timing info, and the standard streams. It is also an EventEmitter, so I listen for SIGTERM to shut down gracefully and set `process.exitCode` to report success or failure.",
      "  Follow-up: `process.exit()` vs `process.exitCode`? — `exit()` stops immediately and can cut off pending I/O; `exitCode` just sets the code used when Node exits naturally.",
    ],
    code: `// app.mjs — run: PORT=4000 node app.mjs --verbose
import http from 'node:http';

const port = Number(process.env.PORT ?? 3000); // env values are strings
const args = process.argv.slice(2);           // → [ '--verbose' ]
console.log('pid', process.pid, 'args', args);
console.log('heap MB', (process.memoryUsage().heapUsed / 1e6).toFixed(1)); // → e.g. 5.2

const server = http.createServer((req, res) => res.end('ok'));
server.listen(port, () => console.log('listening on', port)); // → listening on 4000

// Graceful shutdown (Docker/Kubernetes send SIGTERM before killing)
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    process.exitCode = 0; // let Node exit naturally once everything is closed
  });
});`,
  },
  {
    id: 'node-use-cases',
    group: 'Fundamentals',
    stars: 3,
    difficulty: 'Easy',
    q: 'When should you use Node.js and when should you avoid it?',
    a: [
      "# ELI5",
      "A delivery scooter is perfect for zipping many small parcels around a city quickly.",
      "But you would not use a scooter to move a piano; you would use a truck.",
      "Back to tech: Node is the scooter, great at many small I/O jobs; for heavy number-crunching (the piano) you pick a different tool or add help.",
      "# What it is",
      "I/O-bound work spends most of its time waiting for input/output (network, disk, database). CPU-bound work spends most of its time calculating.",
      "Node is excellent for I/O-bound work because its event loop handles many waits at once on one thread.",
      "Node is weaker for CPU-bound work because long calculations block that one thread, delaying every other request.",
      "Good fits: REST/GraphQL APIs, real-time apps (chat, notifications, multiplayer lobbies with WebSockets), API gateways and BFFs, streaming (file uploads, proxies), CLI tools, serverless functions, server-side rendering (Next.js).",
      "Poor fits without extra work: video transcoding, machine learning training, heavy image processing, big scientific computations, very large in-memory data crunching.",
      "Middle ground: CPU work can still be done in Node with `worker_threads`, a job queue with separate worker processes, or native add-ons/WebAssembly.",
      "# How it works",
      "To decide, ask three questions:",
      "  Is most time spent waiting on I/O? Then Node is a strong choice.",
      "  Are there occasional heavy tasks? Move them to worker threads or a queue (BullMQ) processed by separate workers.",
      "  Is the whole service mostly CPU-heavy? Consider Go, Rust, Java, or Python with native libs for that service.",
      "Also consider team skills: a JS/TS team gains a lot from one language across frontend and backend.",
      "# Example walkthrough",
      "The `/users` route is a typical I/O task: it awaits a fake DB call; while it waits, other requests are served.",
      "The `/hash-bad` route runs a synchronous 1-second loop, blocking all other users during that second.",
      "The `/hash-good` route sends the same calculation to a worker thread using a small helper, keeping the main thread free.",
      "This shows the rule: Node is great by default, but CPU work must be moved off the main thread.",
      "# Why it matters / when to use",
      "Interviewers want to see that you understand trade-offs, not just enthusiasm for one tool.",
      "In real projects you often mix languages: Node for the API layer, Python for ML, Go for a CPU-heavy service.",
      "# Common mistakes",
      "Saying 'Node is fast for everything'; it is fast for concurrent I/O, not for raw CPU work on one thread.",
      "Saying 'Node can never do CPU work'; worker threads and child processes make it possible.",
      "Choosing a technology without considering the team, ecosystem and hosting.",
      "# Say this in the interview",
      "I choose Node for I/O-heavy services like APIs, real-time features, gateways and streaming, where its non-blocking event loop handles lots of concurrent connections cheaply and TypeScript lets us share code with the frontend. I avoid it, or offload work to worker threads or a queue, for CPU-heavy tasks like video encoding or ML, because long computations block the single JavaScript thread.",
      "  Follow-up: How would you handle image resizing in a Node API? — Put a job on a queue and process it in separate worker processes or worker threads, using a native library like sharp.",
    ],
    code: `// usecases.mjs
import http from 'node:http';
import { Worker } from 'node:worker_threads';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const heavyCode = 'let x=0; for (let i=0;i<1e9;i++) x+=i; require("node:worker_threads").parentPort.postMessage(x);';

http.createServer(async (req, res) => {
  if (req.url === '/users') {
    await wait(50);                 // I/O-like wait: thread stays free
    return res.end('users list');
  }
  if (req.url === '/hash-bad') {
    let x = 0;
    for (let i = 0; i < 1e9; i++) x += i; // BLOCKS everyone for ~1 s
    return res.end(String(x));
  }
  if (req.url === '/hash-good') {
    const worker = new Worker(heavyCode, { eval: true }); // separate thread
    worker.once('message', (x) => res.end(String(x)));    // main thread stays free
    return;
  }
  res.end('ok');
}).listen(3000, () => console.log('try /users, /hash-bad, /hash-good'));`,
  },
  {
    id: 'env-config',
    group: 'Fundamentals',
    stars: 3,
    difficulty: 'Easy',
    q: 'How do you manage configuration and environment variables in Node?',
    a: [
      "# ELI5",
      "A pizza shop uses the same recipe in every city, but the address and phone number change per branch.",
      "Instead of printing a new recipe book per city, each branch keeps a small card with its own address.",
      "Back to tech: your code is the recipe and stays the same everywhere; environment variables are the small card with settings for dev, test or production.",
      "# What it is",
      "Configuration is anything that changes between environments: ports, database URLs, API keys, feature flags, log levels.",
      "An environment variable is a named string the operating system passes to a program when it starts; Node exposes them in `process.env`.",
      "The Twelve-Factor App rule: store config in the environment, not in code, so the same build can run anywhere.",
      "A `.env` file is a local text file of KEY=value lines for development; Node 20.6+ can load it natively with `node --env-file=.env app.js`, and Node 21.7+ also has `process.loadEnvFile()`.",
      "Older projects use the `dotenv` package for the same job.",
      "Secrets (passwords, tokens) should come from a secret manager in production (AWS Secrets Manager, Vault, Kubernetes Secrets), never from git.",
      "# How it works",
      "Load: env vars come from the shell, Docker (`-e` or `env_file`), Kubernetes, the hosting platform, or `--env-file` locally.",
      "  Read once at startup into a single config module.",
      "  Validate with a schema library such as zod: check required keys exist and convert strings to numbers or booleans.",
      "  Fail fast: if something is missing or invalid, crash at startup with a clear message, not later in the middle of a request.",
      "  Export a typed, frozen config object and import it elsewhere instead of reading `process.env` all over the code.",
      "# Example walkthrough",
      "The `.env` file holds local values; it is listed in `.gitignore`, while a `.env.example` with fake values is committed.",
      "We run with `node --env-file=.env config.mjs` so Node fills `process.env` before our code runs.",
      "The zod schema says PORT must be a number (coerced from the string) and defaults to 3000.",
      "`DATABASE_URL` must be a valid URL; if missing, `safeParse` fails and we print the errors and exit with code 1.",
      "On success, the frozen `config` object is typed and safe to import anywhere.",
      "# Why it matters / when to use",
      "The same Docker image can be promoted from staging to production by changing only env vars.",
      "Keeps secrets out of source control and out of logs.",
      "Validation catches typos like `DATABSE_URL` before customers do.",
      "# Common mistakes",
      "Committing `.env` with real secrets to git; add it to `.gitignore` and rotate any leaked keys.",
      "Using `process.env.ENABLE_X` directly in an `if`; the string 'false' is truthy. Parse it: `value === 'true'`.",
      "Reading `process.env` everywhere; centralize it so you can validate and test easily.",
      "Logging the full config object, leaking secrets into log systems.",
      "# Say this in the interview",
      "I keep config in environment variables following the twelve-factor approach. Locally I use a `.env` file loaded with `node --env-file` or dotenv, and in production values come from the platform or a secret manager. I read and validate everything once at startup with a schema like zod, convert types, fail fast on missing values, and export a single typed config object.",
      "  Follow-up: Why validate at startup? — So a misconfigured deploy fails immediately and visibly instead of breaking a random request later.",
    ],
    code: `// .env (git-ignored)      → PORT=4000
//                          → DATABASE_URL=postgres://localhost:5432/app
// run: node --env-file=.env config.mjs   (Node 20.6+)
import { z } from 'zod'; // npm i zod

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().default(3000), // "4000" → 4000
  DATABASE_URL: z.string().url(),
  ENABLE_CACHE: z.enum(['true', 'false']).default('false').transform((v) => v === 'true'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid config:', parsed.error.flatten().fieldErrors);
  process.exit(1); // fail fast at startup
}

export const config = Object.freeze(parsed.data);
console.log(config.PORT, typeof config.PORT); // → 4000 number
console.log(config.ENABLE_CACHE);             // → false (a real boolean)`,
  },
  {
    id: 'node-vs-browser',
    group: 'Fundamentals',
    stars: 2,
    difficulty: 'Easy',
    q: 'How does JavaScript in Node differ from JavaScript in the browser?',
    a: [
      "# ELI5",
      "The same person can speak English at home and at the office, but the things around them differ: at home there is a sofa and TV, at work there is a printer and a desk.",
      "Back to tech: the JavaScript language is the same, but the browser gives you web-page tools (DOM, window) while Node gives you server tools (files, processes, sockets).",
      "# What it is",
      "Both run the same core language (ECMAScript — the official JavaScript standard), often on the same V8 engine.",
      "The difference is the host APIs — the extra objects and functions the environment provides on top of the language.",
      "Browser only: `window`, `document` and the DOM (the tree of HTML elements), `localStorage`, cookies via `document.cookie`, `alert`.",
      "Node only: `fs` (file system), `path`, `http`/`net` servers, `child_process`, `worker_threads`, `process`, `Buffer`.",
      "Shared web standards available in both: `fetch`, `URL`, `setTimeout`, `AbortController`, `TextEncoder`, `crypto.subtle`, `structuredClone`, Web Streams.",
      "Global object: `window` in the browser, `global` in Node, and `globalThis` works in both.",
      "Security: browser code is sandboxed and cannot read your disk; Node has full access to the OS with the permissions of the user running it (Node 20+ has an optional permission model via `--permission`).",
      "Modules: browsers use ES modules only; Node supports both CommonJS (`require`) and ES modules (`import`).",
      "Version control: in the browser you must support whatever versions your users have; in Node you choose the exact version your server runs.",
      "# How it works",
      "Both have an event loop, but they differ in details:",
      "  The browser's loop also renders the page (layout and paint) between tasks.",
      "  Node's loop (libuv) has named phases — timers, poll, check, close — and Node-only queues like `process.nextTick` and `setImmediate`.",
      "# Example walkthrough",
      "The snippet detects the environment by checking for `window` and `process.versions.node`.",
      "In Node it reads its own file with `fs`, which the browser could never do.",
      "`fetch` and `URL` work the same in both places.",
      "`typeof document` is 'undefined' in Node, so touching the DOM would crash.",
      "# Why it matters / when to use",
      "When you share code (validation, utilities) between frontend and backend, stick to shared standard APIs.",
      "Server-side rendering frameworks (Next.js) run some components on the server, so using `window` there breaks the build.",
      "# Common mistakes",
      "Using `window` or `localStorage` in server code; guard with `typeof window !== 'undefined'` or move the code to the client.",
      "Importing Node modules like `fs` into frontend bundles.",
      "Assuming Node has no `fetch`; it is built in since Node 18.",
      "# Say this in the interview",
      "The language is the same, but the host APIs differ. Browsers provide the DOM, `window`, storage and run in a sandbox; Node provides file system, networking, processes and `Buffer`, with full OS access. Both share web standards like `fetch`, `URL` and timers, and both have an event loop, though Node's has its own phases plus `nextTick` and `setImmediate`. Node also supports CommonJS alongside ES modules.",
      "  Follow-up: What is the universal way to reach the global object? — `globalThis`.",
    ],
    code: `// env-check.mjs — run with: node env-check.mjs
import { readFile } from 'node:fs/promises'; // Node-only API

const isNode = typeof process !== 'undefined' && !!process.versions?.node;
const isBrowser = typeof window !== 'undefined';
console.log({ isNode, isBrowser }); // → { isNode: true, isBrowser: false }

console.log(typeof document);       // → undefined (no DOM in Node)
console.log(globalThis === global); // → true (global is Node's alias)

// Node can read files from disk; a browser cannot
const me = await readFile(new URL(import.meta.url), 'utf8');
console.log('my source has', me.split('\\n').length, 'lines');

// Shared web standards work in both environments
const u = new URL('https://example.com/a?b=1');
console.log(u.searchParams.get('b')); // → 1
console.log(typeof fetch);            // → function`,
  },
  {
    id: 'repl',
    group: 'Fundamentals',
    stars: 1,
    difficulty: 'Easy',
    q: 'What is the Node REPL?',
    a: [
      "# ELI5",
      "A calculator lets you type '2 + 2', press enter, and see 4 right away.",
      "The REPL is a calculator for JavaScript: type any code, press enter, and see the result instantly.",
      "Back to tech: the REPL is Node's interactive shell for trying code without creating a file.",
      "# What it is",
      "REPL stands for Read-Eval-Print Loop: it reads what you type, evaluates (runs) it, prints the result, and loops back for more.",
      "Start it by typing `node` with no file name in a terminal; you will see a `>` prompt.",
      "Useful features: `_` holds the last result, `_error` holds the last error, Tab autocompletes names, and the up arrow recalls history.",
      "Top-level `await` works directly in the REPL.",
      "Dot commands: `.help`, `.exit` (or Ctrl+D, or Ctrl+C twice), `.editor` for multi-line input, `.load file.js`, `.save file.js`, `.clear`.",
      "Core modules like `fs` and `os` are available without importing in the REPL.",
      "You can also build a custom REPL with the `node:repl` module, e.g. a console for your app that preloads your database models.",
      "# How it works",
      "Node starts in interactive mode instead of running a file.",
      "  Read: it waits for a line (or a complete multi-line expression).",
      "  Eval: it runs the code in a persistent context, so variables you define stay available.",
      "  Print: it shows the value using `util.inspect` (pretty formatting).",
      "  Loop: it shows the prompt again.",
      "# Example walkthrough",
      "The comments show a typical REPL session: `1 + 2` prints 3, then `_ * 10` uses the last result.",
      "`await` fetches a promise value directly.",
      "The script part creates a custom REPL with `repl.start` and puts a `db` object into its context, so typing `db.users` shows the fake data.",
      "# Why it matters / when to use",
      "Quickly test a regular expression, a date calculation or how an API behaves.",
      "Debugging and exploring a library before writing real code.",
      "Admin consoles for apps (like Rails console) built with `node:repl`.",
      "# Common mistakes",
      "Using `const` for a name and then trying to redefine it in the same session; use `let` or start a new session with `.clear`.",
      "Pasting multi-line code that breaks in the middle; use `.editor` mode, then Ctrl+D to run it.",
      "# Say this in the interview",
      "The REPL is Node's interactive Read-Eval-Print Loop, started by running `node` without a file. It is handy for quickly testing expressions or APIs, supports top-level await, `_` for the last result, and dot commands like `.editor` and `.load`. You can also embed a custom REPL in an app with the `repl` module for admin tasks.",
    ],
    code: `// In a terminal, type: node
// > 1 + 2
// 3
// > _ * 10            // _ is the last result
// 30
// > await Promise.resolve('hi')
// 'hi'
// > .exit

// custom-repl.mjs — an app console with preloaded objects
import repl from 'node:repl';

const db = { users: [{ id: 1, name: 'Asha' }] }; // pretend DB

const server = repl.start({ prompt: 'app> ' });
server.context.db = db; // make "db" available inside the REPL
// app> db.users
// [ { id: 1, name: 'Asha' } ]`,
  },

  // ───────────────────────── Event Loop & Internals ─────────────────────────
  {
    id: 'event-loop-phases',
    group: 'Event Loop & Internals',
    stars: 5,
    difficulty: 'Medium',
    q: 'Explain the phases of the Node.js event loop.',
    a: [
      "# ELI5",
      "Think of a security guard doing rounds in a building, visiting rooms in the same order every lap: the clock room, the mail room, the 'do it right after' room, the exit room.",
      "In each room the guard handles whatever jobs are waiting there, then moves to the next room.",
      "Between every single job, the guard also checks a sticky-note board of tiny urgent tasks and clears it first.",
      "Back to tech: each lap is one event loop iteration, each room is a phase with its own queue of callbacks, and the sticky-note board is the microtask queue (`process.nextTick` and Promises).",
      "# What it is",
      "The event loop is the mechanism (provided by libuv) that decides which callback runs next on Node's single JavaScript thread.",
      "A phase is one stage of the loop with its own FIFO queue — first in, first out, like a line at a shop.",
      "Timers phase: runs `setTimeout` and `setInterval` callbacks whose time has passed.",
      "Pending callbacks phase: runs some system-level I/O callbacks deferred from the previous lap (for example certain TCP errors).",
      "Idle/prepare phase: used internally by Node; you never touch it.",
      "Poll phase: gets new I/O events (data on sockets, finished file reads) and runs their callbacks; if nothing else is scheduled it waits here for I/O.",
      "Check phase: runs `setImmediate` callbacks, right after poll.",
      "Close callbacks phase: runs 'close' handlers, e.g. `socket.on('close')`.",
      "Microtasks are not a phase: the `process.nextTick` queue and then the Promise microtask queue are fully drained after every single callback, before moving on.",
      "# How it works",
      "Your main script runs first, top to bottom (this is not inside a phase).",
      "  Microtasks scheduled by the main script run right after it.",
      "Then the loop starts a lap:",
      "  Timers → pending callbacks → idle/prepare → poll → check → close callbacks.",
      "  After each callback in any phase, Node drains `nextTick` callbacks, then Promise callbacks.",
      "  In poll, if there are no immediates and no due timers, Node blocks waiting for I/O, but only until the nearest timer is due.",
      "If no timers, I/O handles or immediates remain, the loop ends and the process exits.",
      "# Example walkthrough",
      "The code reads a file; its callback runs in the poll phase.",
      "Inside it we schedule a timeout, an immediate, a nextTick and a Promise.",
      "nextTick prints first and the Promise second, because microtasks drain right after the current callback.",
      "'immediate' prints next because check comes right after poll in the same lap.",
      "'timeout' prints last because the loop must go around to the timers phase in the next lap.",
      "This order is guaranteed inside an I/O callback.",
      "# Why it matters / when to use",
      "Explains output-order puzzles that interviewers love.",
      "Helps you debug latency: a slow callback in any phase delays every other phase.",
      "Lets you choose correctly between `setImmediate`, `setTimeout` and `nextTick` when deferring work.",
      "# Common mistakes",
      "Listing microtasks as a phase; they run between callbacks, not in a phase.",
      "Thinking `setTimeout(fn, 0)` runs immediately; it runs in the next timers phase, at least 1 ms later.",
      "Mixing up the browser event loop (which renders between tasks) with Node's libuv phases.",
      "# Say this in the interview",
      "Node's event loop, implemented by libuv, cycles through phases: timers for setTimeout and setInterval, pending callbacks, idle/prepare, poll where it collects and runs I/O callbacks and may wait, check for setImmediate, and close callbacks. After every callback, Node drains the nextTick queue and then Promise microtasks. That is why inside an I/O callback setImmediate always runs before setTimeout zero.",
      "  Follow-up: Where do Promise callbacks run? — In the microtask queue, drained after each callback, after `process.nextTick` callbacks.",
      "  Follow-up: When does the process exit? — When the loop has no pending timers, I/O handles or immediates left.",
    ],
    code: `// loop-phases.mjs
import fs from 'node:fs';

console.log('1: main script');

fs.readFile(new URL(import.meta.url), () => {
  // We are now in the POLL phase (I/O callback)
  setTimeout(() => console.log('6: timeout (timers phase, next lap)'), 0);
  setImmediate(() => console.log('5: immediate (check phase)'));
  process.nextTick(() => console.log('3: nextTick (microtask)'));
  Promise.resolve().then(() => console.log('4: promise (microtask)'));
  console.log('2: inside I/O callback');
});
// → 1: main script
// → 2: inside I/O callback
// → 3: nextTick (microtask)
// → 4: promise (microtask)
// → 5: immediate (check phase)
// → 6: timeout (timers phase, next lap)`,
  },
  {
    id: 'nexttick-vs-setimmediate',
    group: 'Event Loop & Internals',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is the difference between `process.nextTick`, `setImmediate`, and `setTimeout(fn, 0)`?',
    a: [
      "# ELI5",
      "Imagine a teacher answering students in a queue.",
      "`process.nextTick` is a student saying 'one tiny thing before you move on' — the teacher answers it right now, before anyone else in line.",
      "`setImmediate` is 'put me at the end of this round' — answered after the current batch of students.",
      "`setTimeout(fn, 0)` is 'come back to me when the clock round starts' — answered at the start of the next round of checks.",
      "Back to tech: nextTick runs before the event loop continues, setImmediate runs in the check phase, and setTimeout 0 runs in the next timers phase.",
      "# What it is",
      "`process.nextTick(fn)` — queues `fn` in the nextTick queue, which runs as soon as the current operation finishes, before Promise callbacks and before any event loop phase continues.",
      "`setImmediate(fn)` — queues `fn` for the check phase, which comes right after the poll (I/O) phase.",
      "`setTimeout(fn, 0)` — queues a timer; Node turns 0 into at least 1 ms, and it runs in the timers phase once that time has passed.",
      "Priority in a single moment: synchronous code, then nextTick queue, then Promise microtasks, then event loop phases (timers, poll, check...).",
      "Comparison row — when it runs: nextTick = right after the current operation; setImmediate = check phase; setTimeout 0 = next timers phase.",
      "Comparison row — can starve I/O: nextTick yes (recursive calls never let the loop move); setImmediate no; setTimeout no.",
      "Comparison row — order between setImmediate and setTimeout 0: in the main module it is not guaranteed; inside an I/O callback setImmediate is always first.",
      "Names are confusing: nextTick is actually more immediate than setImmediate.",
      "# How it works",
      "Current callback or main script finishes.",
      "  Node drains the nextTick queue completely (including ticks added while draining).",
      "  Node drains the Promise microtask queue.",
      "  The loop moves on to the next phase; setTimeout callbacks wait for timers, setImmediate callbacks wait for check.",
      "# Example walkthrough",
      "All three are scheduled from the main script, plus a Promise.",
      "'sync' prints first because it is regular synchronous code.",
      "'nextTick' prints next, then 'promise', because microtasks run before the loop starts.",
      "'timeout' and 'immediate' come last; their relative order from the main module can vary with process startup timing.",
      "# Why it matters / when to use",
      "Use `setImmediate` to yield — break a long task into chunks so I/O can be handled between them.",
      "Use `process.nextTick` (rarely) in library code to emit events or call callbacks asynchronously but before any I/O, e.g. so users can attach listeners after constructing an object.",
      "Use `setTimeout` when you need an actual delay.",
      "In app code, `queueMicrotask` or Promises are usually preferred over `nextTick`.",
      "# Common mistakes",
      "Using recursive `process.nextTick` for loops of work; it starves I/O. Use `setImmediate`.",
      "Expecting `setTimeout(fn, 0)` to run before Promises; Promises (microtasks) always run first.",
      "Assuming setTimeout 0 vs setImmediate order is fixed in the main module; it is not.",
      "# Say this in the interview",
      "process.nextTick runs its callback right after the current operation, before Promise microtasks and before the event loop continues, so it has the highest priority. setImmediate runs in the check phase right after I/O polling, and setTimeout zero runs in the next timers phase after at least one millisecond. I use setImmediate to yield in long tasks and avoid recursive nextTick because it can starve I/O.",
      "  Follow-up: Which runs first, nextTick or a resolved Promise? — nextTick; its queue is drained before the Promise microtask queue.",
    ],
    code: `// order.mjs   (in CommonJS the result is the same)
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));
Promise.resolve().then(() => console.log('promise'));
process.nextTick(() => console.log('nextTick'));
console.log('sync');

// → sync
// → nextTick
// → promise
// → timeout     ┐ these two may swap when scheduled
// → immediate   ┘ from the main module

// Yielding with setImmediate so I/O can run between chunks:
function processInChunks(items, i = 0) {
  const end = Math.min(i + 1000, items.length);
  for (; i < end; i++) { /* work on items[i] */ }
  if (i < items.length) setImmediate(() => processInChunks(items, i));
  else console.log('all done');
}
processInChunks(Array.from({ length: 5000 })); // → all done`,
  },
  {
    id: 'memory-leaks',
    group: 'Event Loop & Internals',
    stars: 5,
    difficulty: 'Hard',
    q: 'What causes memory leaks in Node and how do you find them?',
    a: [
      "# ELI5",
      "Imagine a library where the cleaner throws away any book that nobody has on a list.",
      "If someone keeps adding book titles to a list on the wall and never crosses any off, the cleaner can never throw those books away, and the library slowly fills up.",
      "Back to tech: the garbage collector frees memory nobody references; a leak happens when your code keeps references to data it no longer needs, so memory grows until the process crashes.",
      "# What it is",
      "Memory leak — memory that your program no longer needs but cannot be freed, so usage keeps growing over time.",
      "Garbage collector (GC) — the part of V8 that automatically frees objects that are no longer reachable from roots (globals, the current call stack, active closures).",
      "So in JavaScript a leak is really an accidental reference that keeps an object reachable.",
      "Heap — the area of memory where objects live; `heapUsed` is how much of it is in use.",
      "Common causes:",
      "  Unbounded caches or maps (e.g. a global `Map` keyed by request ID that is never cleaned).",
      "  Event listeners added repeatedly and never removed (e.g. `on` inside a request handler).",
      "  Timers (`setInterval`) that are never cleared and hold big objects in their closure.",
      "  Closures — functions that remember variables from where they were created — capturing large objects longer than needed.",
      "  Global variables, including accidental ones created by assigning to an undeclared name in non-strict code.",
      "  Unresolved Promises piling up, or arrays used as queues that only grow.",
      "# How it works",
      "Detect:",
      "  Watch `process.memoryUsage().heapUsed` or container memory graphs; a sawtooth that keeps rising after each GC means a leak.",
      "  The symptom in production is often 'JavaScript heap out of memory' crashes or OOM kills (out of memory) by Docker/Kubernetes.",
      "Find:",
      "  Run with `node --inspect app.js`, open Chrome DevTools (chrome://inspect) → Memory tab.",
      "  Take a heap snapshot, generate load, take another, and use the Comparison view to see which object types grew.",
      "  Look at the Retainers panel to see what is holding the objects (e.g. a Map in a module).",
      "  Other tools: `--heapsnapshot-near-heap-limit=2`, `writeHeapSnapshot()` from `node:v8`, clinic.js heapprofiler.",
      "Fix: remove the reference — bound caches (LRU with max size and TTL), remove listeners, clear intervals, use WeakMap for per-object metadata.",
      "# Example walkthrough",
      "`leakyCache` is a module-level Map that stores every request's data and never deletes it.",
      "Each simulated request adds a 10 KB string; heapUsed keeps going up every second.",
      "The fixed version uses a tiny LRU (least recently used — evict the oldest entry) with a max size of 100, so memory stays flat.",
      "`setInterval(...).unref()` prints stats without keeping the process alive by itself.",
      "# Why it matters / when to use",
      "Leaks cause slow degradation and random crashes in long-running servers, often only after days in production.",
      "Being able to explain heap snapshots is a strong senior signal in interviews.",
      "# Common mistakes",
      "Using a plain object or Map as a cache with no size limit; use an LRU library (`lru-cache`) or Redis.",
      "Assuming high memory always means a leak; V8 lazily collects. Check whether memory keeps growing after GC under steady load.",
      "Just raising `--max-old-space-size` to hide the problem instead of finding the retainer.",
      "# Say this in the interview",
      "In Node a memory leak is an unintended reference that keeps objects reachable, so the garbage collector cannot free them. Typical causes are unbounded caches, listeners or intervals that are never removed, closures holding large data, and globals. I detect it by watching heap usage climb under steady load, then take heap snapshots with --inspect and Chrome DevTools, compare them, and follow the retainer chain to the culprit. The fix is to bound or remove the reference, e.g. an LRU cache with a size limit.",
      "  Follow-up: What is a WeakMap good for here? — It holds keys weakly, so metadata attached to an object disappears when the object itself is no longer used.",
    ],
    code: `// leak.mjs — run: node leak.mjs
const leakyCache = new Map(); // BAD: grows forever

function handleRequestLeaky(id) {
  leakyCache.set(id, 'x'.repeat(10_000)); // never deleted
}

// GOOD: Fixed: tiny LRU cache with a max size
class LRU {
  constructor(max) { this.max = max; this.map = new Map(); }
  set(k, v) {
    this.map.delete(k);
    this.map.set(k, v);
    if (this.map.size > this.max) {
      this.map.delete(this.map.keys().next().value); // evict oldest
    }
  }
}
const safeCache = new LRU(100);

let id = 0;
setInterval(() => {
  for (let i = 0; i < 1000; i++) {
    handleRequestLeaky(++id);       // comment this out → memory stays flat
    safeCache.set(id, 'x'.repeat(10_000));
  }
}, 100);

setInterval(() => {
  const mb = (process.memoryUsage().heapUsed / 1e6).toFixed(0);
  console.log('heapUsed MB', mb); // → keeps rising with the leaky cache
}, 1000).unref();`,
  },
  {
    id: 'microtasks-vs-macrotasks',
    group: 'Event Loop & Internals',
    stars: 4,
    difficulty: 'Medium',
    q: 'What are microtasks and macrotasks in Node?',
    a: [
      "# ELI5",
      "At a doctor's clinic, patients with appointments (macrotasks) are seen one by one.",
      "After each patient, the doctor first answers every quick question on the nurse's notepad (microtasks) before calling the next patient.",
      "If someone keeps adding quick questions, the next patient waits longer.",
      "Back to tech: macrotasks are event-loop callbacks like timers and I/O; microtasks are small follow-ups like Promise callbacks, and all of them run before the next macrotask.",
      "# What it is",
      "Macrotask (also called a task) — a callback scheduled into an event loop phase: `setTimeout`, `setInterval`, `setImmediate`, I/O callbacks, close events.",
      "Microtask — a callback that runs right after the current piece of code finishes, before the loop moves on: Promise `.then/.catch/.finally` callbacks, code after an `await`, and `queueMicrotask(fn)`.",
      "Node also has the `process.nextTick` queue, which is drained before the Promise microtask queue.",
      "Rule: after every macrotask, Node empties the nextTick queue, then the microtask queue, completely, including any new microtasks added along the way.",
      "Comparison row — examples: microtask = Promise callbacks, await continuations, queueMicrotask; macrotask = timers, setImmediate, I/O callbacks.",
      "Comparison row — when they run: microtask = immediately after the current callback; macrotask = in their event loop phase.",
      "Comparison row — starvation risk: an endless chain of microtasks blocks all macrotasks, including I/O.",
      "# How it works",
      "A macrotask runs (e.g. a timer callback).",
      "  While running, it may resolve Promises, which queue microtasks.",
      "  When it returns, Node runs all `nextTick` callbacks.",
      "  Then it runs all Promise microtasks, including ones added by other microtasks.",
      "  Only then does the next macrotask run.",
      "# Example walkthrough",
      "Two timeouts are scheduled; the first one also creates a Promise and a nextTick.",
      "'timeout 1' prints, then before timeout 2 can run, 'nextTick inside 1' and then 'promise inside 1' print.",
      "Then 'timeout 2' runs.",
      "The `await` example shows that the code after `await` is itself a microtask, so 'after await' prints after 'sync end'.",
      "# Why it matters / when to use",
      "Explains output-order questions and why code after `await` runs later even if the Promise is already resolved.",
      "Knowing that Promise chains can starve I/O helps you avoid freezing a server with huge synchronous Promise loops.",
      "# Common mistakes",
      "Thinking a resolved Promise's `.then` runs synchronously; it is always deferred to the microtask queue.",
      "Putting setImmediate in the microtask category; it is a macrotask (check phase).",
      "Writing infinite recursive microtasks (e.g. a function that awaits an already-resolved Promise and calls itself forever).",
      "# Say this in the interview",
      "Macrotasks are callbacks scheduled in event loop phases, like timers, I/O callbacks and setImmediate. Microtasks are Promise reactions, await continuations and queueMicrotask callbacks. After each macrotask Node drains the nextTick queue and then the whole microtask queue before moving on, which is why Promise callbacks always run before the next timer, and why endless microtasks can starve I/O.",
      "  Follow-up: Where does `process.nextTick` fit? — It has its own queue that is drained just before the Promise microtask queue.",
    ],
    code: `// micro-macro.mjs
setTimeout(() => {
  console.log('timeout 1');
  Promise.resolve().then(() => console.log('promise inside 1'));
  process.nextTick(() => console.log('nextTick inside 1'));
}, 0);
setTimeout(() => console.log('timeout 2'), 0);

async function demo() {
  console.log('before await');
  await null;                      // the rest becomes a microtask
  console.log('after await');
}
demo();
console.log('sync end');

// → before await
// → sync end
// → after await
// → timeout 1
// → nextTick inside 1
// → promise inside 1
// → timeout 2`,
  },
  {
    id: 'libuv-thread-pool',
    group: 'Event Loop & Internals',
    stars: 4,
    difficulty: 'Hard',
    q: 'What is libuv and what does its thread pool do?',
    a: [
      "# ELI5",
      "A manager (Node's main thread) has a small team of 4 helpers in the back room.",
      "Some jobs, like phone calls (network), can be handled by the building's switchboard (the operating system) without any helper.",
      "Other jobs, like digging through filing cabinets (files) or heavy calculations (hashing), are given to the helpers, and if all 4 are busy, new jobs wait in line.",
      "Back to tech: libuv is the back office; its thread pool is the 4 helpers that do blocking work so the main thread never waits.",
      "# What it is",
      "libuv — a cross-platform C library that powers Node's event loop and asynchronous I/O on Linux, macOS and Windows.",
      "It provides the event loop phases, timers, TCP/UDP sockets, file system access, child processes, signals and a thread pool.",
      "Thread pool — a fixed group of background threads (4 by default) that run blocking tasks and report back when done.",
      "Network I/O mostly does not use the pool: libuv uses the OS's non-blocking mechanisms (epoll, kqueue, IOCP) to watch many sockets with no extra threads.",
      "The pool is used for operations the OS cannot do asynchronously in a portable way:",
      "  Most `fs` operations (readFile, stat, writeFile...).",
      "  `dns.lookup` (used by default when you connect to a hostname), but not `dns.resolve*`, which uses the network.",
      "  CPU-heavy crypto: `crypto.pbkdf2`, `crypto.scrypt`, `randomBytes` (async versions), and `zlib` compression.",
      "Size can be changed with the `UV_THREADPOOL_SIZE` environment variable (maximum 1024), set before the pool is first used — best set outside the process.",
      "# How it works",
      "You call `fs.readFile(path, cb)`.",
      "  Node passes the request to libuv, which puts it in the pool's work queue.",
      "  A free pool thread does the blocking read system call.",
      "  When done, it notifies the event loop, which runs your callback on the main thread during the poll phase.",
      "If all threads are busy, extra tasks wait, so 5 slow hashes with 4 threads take about twice as long as 4.",
      "# Example walkthrough",
      "We start 8 `pbkdf2` hashes at the same time and time each one.",
      "With the default pool of 4, the first 4 finish together after about X ms, and the next 4 finish at about 2X ms.",
      "Running with `UV_THREADPOOL_SIZE=8` (and at least 8 CPU cores) makes all 8 finish together at about X ms.",
      "This proves async crypto runs on the pool and that the pool size limits parallelism.",
      "# Why it matters / when to use",
      "Explains surprising slowdowns: heavy file or crypto work can queue behind each other and delay DNS lookups too.",
      "Tuning `UV_THREADPOOL_SIZE` helps file-heavy or crypto-heavy services.",
      "For your own CPU-heavy JavaScript, the pool does not help; use `worker_threads`.",
      "# Common mistakes",
      "Saying all async I/O uses the thread pool; network sockets use OS polling instead.",
      "Saying Node is 'purely single-threaded'; libuv and V8 have extra threads.",
      "Setting `process.env.UV_THREADPOOL_SIZE` late in the code after the pool already started; it has no effect then.",
      "# Say this in the interview",
      "libuv is the C library under Node that implements the event loop and cross-platform async I/O. Network I/O uses the OS's non-blocking APIs like epoll, while operations that would block, such as most file system calls, dns.lookup, and async crypto and zlib, run on libuv's thread pool, which has 4 threads by default and can be resized with UV_THREADPOOL_SIZE. When a pool task finishes, its callback is queued back to the main thread.",
      "  Follow-up: Does the thread pool run my JavaScript? — No; it runs native C/C++ work. Your JavaScript runs on the main thread or in worker threads.",
    ],
    code: `// pool.mjs — run: node pool.mjs   then: UV_THREADPOOL_SIZE=8 node pool.mjs
import crypto from 'node:crypto';

const start = Date.now();
for (let i = 1; i <= 8; i++) {
  // async pbkdf2 runs on the libuv thread pool, not the main thread
  crypto.pbkdf2('secret', 'salt', 200_000, 64, 'sha512', () => {
    console.log('hash', i, 'done at', Date.now() - start, 'ms');
  });
}
console.log('main thread is free while hashing');

// Default pool (4 threads), example output:
// → main thread is free while hashing
// → hash 1..4 done at ~250 ms   (first batch of 4)
// → hash 5..8 done at ~500 ms   (had to wait for a free thread)
// With UV_THREADPOOL_SIZE=8 on an 8-core machine:
// → all 8 done at ~250 ms`,
  },
  {
    id: 'blocking-event-loop',
    group: 'Event Loop & Internals',
    stars: 4,
    difficulty: 'Medium',
    q: 'How can the event loop get blocked, and how do you detect and avoid it?',
    a: [
      "# ELI5",
      "A single-lane bridge lets cars cross one at a time, very quickly.",
      "If one truck stops in the middle to unload, every car behind it is stuck, even the ones in a hurry.",
      "Back to tech: Node's main thread is the single lane; any long synchronous work is the stopped truck, and every other request waits behind it.",
      "# What it is",
      "Blocking the event loop means the main thread is busy running one piece of JavaScript for so long that no other callbacks (requests, timers, I/O) can run.",
      "Common blockers:",
      "  CPU-heavy loops: sorting or transforming huge arrays, complex calculations.",
      "  `JSON.parse` / `JSON.stringify` of very large payloads (many MB).",
      "  Sync APIs: `fs.readFileSync`, `crypto.pbkdf2Sync`, `zlib.gzipSync`, `child_process.execSync`.",
      "  ReDoS — Regular expression Denial of Service: a badly written regex that takes exponential time on certain inputs, like `/(a+)+$/`.",
      "  Endless microtask or nextTick chains.",
      "Event loop lag (or delay) — how late a timer fires compared with when it should; it is the main health metric for this.",
      "# How it works",
      "Detect:",
      "  Measure lag with `monitorEventLoopDelay()` from `node:perf_hooks`; it reports percentiles like p99 in nanoseconds.",
      "  Watch event loop utilization (`performance.eventLoopUtilization()`) — the fraction of time the loop is busy.",
      "  Profile with `node --cpu-prof` or Chrome DevTools (`--inspect`) to see which function is hogging the CPU; clinic.js doctor/flame helps too.",
      "  Symptom: all endpoints slow down at once, and health checks time out, even simple ones.",
      "Avoid:",
      "  Use async APIs everywhere in request paths.",
      "  Stream big files and big JSON instead of loading them whole.",
      "  Chunk long loops and yield with `setImmediate` between chunks.",
      "  Move CPU work to `worker_threads` (a pool like Piscina) or to a separate job queue service.",
      "  Validate input sizes and use safe regexes (or a linear-time regex engine like RE2).",
      "# Example walkthrough",
      "`monitorEventLoopDelay` starts sampling the loop's delay every 20 ms.",
      "The `/block` route runs a 500 ms synchronous loop; during it, the interval cannot fire.",
      "After calling it, the printed p99 lag jumps to around 500 ms, while normally it stays near 20 ms.",
      "The `/ok` route waits with a Promise timer instead, and lag stays low.",
      "# Why it matters / when to use",
      "One blocked request degrades latency for every user on that process, and can fail health checks so the orchestrator restarts the pod.",
      "Production teams alert on event loop lag the same way they alert on CPU or memory.",
      "# Common mistakes",
      "Wrapping CPU work in `async` or a Promise and thinking it no longer blocks; it still runs on the main thread.",
      "Blaming the database for slowness when the real cause is a sync CPU hotspot; profile first.",
      "Increasing `UV_THREADPOOL_SIZE` to fix CPU-heavy JavaScript; the pool does not run your JavaScript.",
      "# Say this in the interview",
      "The event loop gets blocked whenever synchronous work runs too long on the main thread, for example heavy computation, huge JSON parsing, sync fs or crypto calls, or catastrophic regexes. I detect it by monitoring event loop delay with perf_hooks and profiling with --cpu-prof or clinic. To avoid it I use async APIs, stream large data, chunk loops with setImmediate, and move CPU-heavy work to worker threads or a background queue.",
      "  Follow-up: What is a reasonable lag value? — Healthy services usually keep p99 event loop delay in the low tens of milliseconds; sustained hundreds of ms means something is blocking.",
    ],
    code: `// lag.mjs — run, then curl localhost:3000/block and /ok
import http from 'node:http';
import { monitorEventLoopDelay } from 'node:perf_hooks';

const h = monitorEventLoopDelay({ resolution: 20 });
h.enable();

setInterval(() => {
  const p99ms = (h.percentile(99) / 1e6).toFixed(0); // ns → ms
  console.log('event loop p99 delay ms:', p99ms);
  h.reset();
}, 2000);

http.createServer(async (req, res) => {
  if (req.url === '/block') {
    const end = Date.now() + 500;
    while (Date.now() < end) {} // 500 ms of sync CPU → loop frozen
    return res.end('blocked');  // next log → p99 delay ms: ~500
  }
  if (req.url === '/ok') {
    await new Promise((r) => setTimeout(r, 500)); // async wait, loop stays free
    return res.end('ok');       // next log → p99 delay ms: ~20
  }
  res.end('hi');
}).listen(3000);`,
  },
  {
    id: 'garbage-collection',
    group: 'Event Loop & Internals',
    stars: 3,
    difficulty: 'Hard',
    q: 'How does garbage collection work in V8/Node?',
    a: [
      "# ELI5",
      "Imagine a playroom where new toys are thrown into a small toy box near the door. Most toys get bored with quickly, so the box is cleaned often and fast.",
      "Toys that survive a couple of cleanings are favourites, so they move to the big shelf, which is cleaned rarely but more carefully.",
      "Back to tech: V8 puts new objects in a small 'young' area and cleans it often; objects that survive are promoted to a big 'old' area that is cleaned less often.",
      "# What it is",
      "Garbage collection (GC) — automatic memory management: the engine finds objects your program can no longer reach and frees their memory.",
      "Reachable — an object is alive if you can get to it by following references starting from roots: global variables, the current call stack, and active closures.",
      "Generational hypothesis — the observation that most objects die young (temporary arrays, strings in a request).",
      "V8 splits the heap into generations:",
      "  Young generation (new space): small, holds new objects; cleaned by the Scavenger, a fast copying collector (a 'minor GC').",
      "  Old generation (old space): holds long-lived objects; cleaned by Mark-Sweep-Compact (a 'major GC').",
      "Orinoco — V8's GC project that makes collection parallel (several helper threads), incremental (work split into small slices) and concurrent (marking while your JS runs) to reduce pauses.",
      "Stop-the-world pause — a moment when your JavaScript is paused so the GC can work safely; V8 keeps these short, but large heaps still cause noticeable pauses.",
      "# How it works",
      "Minor GC (Scavenge):",
      "  New space is split into two halves; live objects are copied from the full half to the empty half, and everything left behind is garbage.",
      "  Objects that survive two scavenges are promoted to old space.",
      "Major GC (Mark-Sweep-Compact):",
      "  Mark: start from roots and mark every reachable object (mostly concurrently).",
      "  Sweep: free memory of unmarked objects.",
      "  Compact: move surviving objects together to reduce fragmentation (gaps of unused memory).",
      "The old space size limit can be set with `--max-old-space-size=<MB>`; when exceeded, Node crashes with 'JavaScript heap out of memory'.",
      "# Example walkthrough",
      "Run with `node --expose-gc --trace-gc gc.mjs` to see GC log lines.",
      "We allocate many short-lived arrays; the trace shows many fast 'Scavenge' lines.",
      "We keep some arrays in `keep`, so they survive and get promoted; later 'Mark-Compact' lines appear.",
      "`global.gc()` (only available with `--expose-gc`) forces a full GC so we can see heapUsed drop after `keep` is cleared.",
      "# Why it matters / when to use",
      "Understanding GC explains latency spikes, high memory use, and why leaks are about references.",
      "Tuning `--max-old-space-size` matters in containers, so Node's heap limit fits under the container memory limit.",
      "Reducing allocations in hot paths (reusing buffers, avoiding temporary objects) lowers GC pressure.",
      "# Common mistakes",
      "Calling `global.gc()` in production code; it is for debugging only and causes pauses.",
      "Thinking setting a variable to `null` immediately frees memory; it only makes the object unreachable, and GC frees it later.",
      "Forgetting that a heap limit higher than the container limit leads to the container being OOM-killed instead of a clean Node error.",
      "# Say this in the interview",
      "V8 uses generational garbage collection. New objects go into a small young generation that is cleaned frequently by a fast copying Scavenger; objects that survive are promoted to the old generation, which is cleaned by Mark-Sweep-Compact. Modern V8 does much of this in parallel, incrementally and concurrently to keep pauses short. An object is collected only when it is no longer reachable from roots, so leaks come from lingering references.",
      "  Follow-up: How do you raise the heap limit? — `node --max-old-space-size=4096 app.js` (in MB), keeping it below the container's memory limit.",
    ],
    code: `// gc.mjs — run: node --expose-gc --trace-gc gc.mjs
const mb = () => (process.memoryUsage().heapUsed / 1e6).toFixed(1) + ' MB';

// 1) Short-lived garbage → cleaned by fast minor GCs ("Scavenge" in the trace)
for (let i = 0; i < 1e6; i++) {
  const temp = [i, i + 1, i + 2]; // dies right away
}

// 2) Long-lived objects → survive and get promoted to old space
let keep = [];
for (let i = 0; i < 200_000; i++) keep.push({ i, data: 'x'.repeat(20) });
console.log('with keep:', mb());   // → e.g. with keep: 25.3 MB

keep = null;          // drop the only reference → now unreachable
global.gc();          // force a full GC (debug only, needs --expose-gc)
console.log('after gc:', mb());    // → e.g. after gc: 4.1 MB`,
  },
  {
    id: 'v8-engine',
    group: 'Event Loop & Internals',
    stars: 2,
    difficulty: 'Medium',
    q: 'What role does V8 play in Node.js?',
    a: [
      "# ELI5",
      "Think of V8 as a translator who reads your English instructions (JavaScript) and tells a machine exactly what to do in its own language (machine code).",
      "Node is the whole office around that translator: it gives the translator a phone, a filing cabinet and a mailbox (files, network, timers).",
      "Back to tech: V8 executes JavaScript; Node adds the APIs and the event loop around it.",
      "# What it is",
      "V8 — Google's open-source JavaScript and WebAssembly engine, written in C++, used in Chrome and in Node.",
      "Its jobs: parse your code, compile it to machine code, run it, and manage memory with garbage collection.",
      "JIT — just-in-time compilation: code is compiled while the program runs, using information about how it is actually used.",
      "V8's pipeline: Ignition (an interpreter that turns code into bytecode and runs it quickly), Sparkplug and Maglev (faster baseline/mid-tier compilers), and TurboFan (an optimizing compiler for hot code).",
      "Hot code — functions that run many times; V8 spends effort optimizing those.",
      "Deoptimization — if assumptions break (e.g. a function that always got numbers suddenly gets a string), V8 throws away the optimized code and falls back to slower code.",
      "Hidden classes (also called shapes or maps) and inline caches — tricks V8 uses to access object properties fast when objects have consistent shapes.",
      "What V8 does not do: file system, networking, timers or the event loop; those come from Node and libuv.",
      "# How it works",
      "Node starts and creates a V8 isolate — an independent V8 instance with its own heap.",
      "  Node registers bindings — C++ functions exposed to JavaScript (e.g. for `fs`).",
      "  V8 parses and runs your script through Ignition; counters track how often functions run.",
      "  Hot functions are compiled by Maglev/TurboFan into optimized machine code.",
      "  When you call `fs.readFile`, V8 calls into Node's C++ binding, which uses libuv.",
      "Node's version determines its V8 version, which determines which new JavaScript features are available.",
      "# Example walkthrough",
      "`process.versions.v8` prints the bundled V8 version.",
      "`add` is called with numbers many times, so V8 optimizes it for numbers.",
      "The two `Point` objects are created with the same property order, so they share a hidden class and property access stays fast.",
      "The comment shows the anti-pattern: adding properties in a different order creates different shapes and slows things down.",
      "# Why it matters / when to use",
      "Knowing V8 explains why Node can be fast, why consistent object shapes help performance, and why newer Node versions support newer JS syntax.",
      "Flags like `--max-old-space-size` and `--cpu-prof` are V8 or Node options for memory and profiling.",
      "# Common mistakes",
      "Saying V8 provides the event loop; it is libuv in Node (browsers have their own).",
      "Micro-optimizing for V8 internals before measuring; write clean code first and profile.",
      "# Say this in the interview",
      "V8 is the JavaScript engine inside Node. It parses JavaScript, compiles it to machine code using a JIT pipeline with Ignition for bytecode and optimizing compilers like TurboFan for hot code, and manages memory with its garbage collector. Node embeds V8 and adds the event loop via libuv plus APIs like fs, net and http through C++ bindings.",
      "  Follow-up: What causes deoptimization? — Changing types or object shapes that the optimized code assumed, for example passing a string to a function that always got numbers.",
    ],
    code: `// v8.mjs
console.log('V8 version:', process.versions.v8); // → e.g. 12.4.254.21-node.21

function add(a, b) {
  return a + b; // called many times with numbers → V8 optimizes it
}
let sum = 0;
for (let i = 0; i < 1e7; i++) sum = add(sum, 1);
console.log(sum); // → 10000000

class Point {
  constructor(x, y) {
    this.x = x; // same property order every time
    this.y = y; // → all Points share one hidden class (fast access)
  }
}
const p1 = new Point(1, 2);
const p2 = new Point(3, 4);
console.log(p1.x + p2.y); // → 5

// Anti-pattern: different property orders create different shapes
// const a = {}; a.x = 1; a.y = 2;
// const b = {}; b.y = 2; b.x = 1;   // different hidden class from a`,
  },
  {
    id: 'settimeout-vs-setimmediate',
    group: 'Event Loop & Internals',
    stars: 2,
    difficulty: 'Medium',
    q: 'Why is the order of `setTimeout(fn, 0)` vs `setImmediate` non-deterministic in the main module?',
    a: [
      "# ELI5",
      "Imagine a bus that leaves the stop at a fixed schedule, and you ask a friend to 'meet me at the next stop after 1 minute has passed'.",
      "If the bus is slow to leave, a minute has already passed by the first stop and your friend gets on there; if it leaves quickly, your friend has to wait for the next lap.",
      "Back to tech: whether the 1 ms timer is already due when the loop first reaches the timers phase depends on how fast the process started, so the order can change between runs.",
      "# What it is",
      "`setTimeout(fn, 0)` is really `setTimeout(fn, 1)`; Node clamps delays below 1 ms to 1 ms.",
      "Timers run in the timers phase, the first phase of each loop lap; `setImmediate` runs in the check phase, later in the lap.",
      "In the main module (your top-level script), both are scheduled before the loop starts.",
      "When the loop enters its first timers phase, it checks the clock:",
      "  If 1 ms or more has already passed since the timer was set, the timeout runs first, then the immediate in the check phase.",
      "  If less than 1 ms has passed, the timer is not due yet, the loop moves on, the immediate runs in check, and the timeout runs in the next lap.",
      "How long startup takes depends on machine load and performance, so the result is non-deterministic — not guaranteed to be the same each run.",
      "Inside an I/O callback the order is always the same: setImmediate first, because check comes right after poll, before the loop wraps back to timers.",
      "# How it works",
      "Main script schedules a timer (due in 1 ms) and an immediate.",
      "  Loop starts → timers phase: is the timer due? It depends on elapsed time.",
      "  → poll phase: no I/O pending, immediate is queued, so poll does not wait.",
      "  → check phase: immediate runs.",
      "  → next lap timers phase: timeout runs if it did not already.",
      "# Example walkthrough",
      "Part 1 schedules both from the main module; running it several times can print either order.",
      "Part 2 schedules both inside a `fs.readFile` callback (poll phase); it always prints 'immediate' before 'timeout'.",
      "# Why it matters / when to use",
      "Never write code whose correctness depends on this ordering from the main module.",
      "If you need 'run after current I/O', use `setImmediate`; if you need a real delay, use `setTimeout`.",
      "It is a classic interview question that tests whether you really know the loop phases.",
      "# Common mistakes",
      "Claiming setTimeout 0 always runs first because 'timers is the first phase'.",
      "Claiming setImmediate always runs first because 'immediate means now'.",
      "Forgetting the 1 ms clamp, which is the real reason for the race.",
      "# Say this in the interview",
      "setTimeout zero is clamped to 1 millisecond and runs in the timers phase, while setImmediate runs in the check phase. From the main module, when the loop first reaches the timers phase it may or may not be 1 ms later yet, depending on process performance, so the order varies between runs. Inside an I/O callback, setImmediate always wins because check comes right after poll, before the loop returns to timers.",
    ],
    code: `// race.mjs — run it several times
import fs from 'node:fs';

// Part 1: main module → order is NOT guaranteed
setTimeout(() => console.log('main: timeout'), 0);
setImmediate(() => console.log('main: immediate'));
// → sometimes "timeout, immediate", sometimes "immediate, timeout"

// Part 2: inside an I/O callback (poll phase) → order IS guaranteed
fs.readFile(new URL(import.meta.url), () => {
  setTimeout(() => console.log('io: timeout'), 0);
  setImmediate(() => console.log('io: immediate'));
  // → io: immediate   (check phase comes right after poll)
  // → io: timeout     (timers phase in the next lap)
});`,
  },
  {
    id: 'nexttick-starvation',
    group: 'Event Loop & Internals',
    stars: 2,
    difficulty: 'Hard',
    q: 'How can `process.nextTick` starve the event loop?',
    a: [
      "# ELI5",
      "A cashier promises to serve every 'super quick question' before the next customer in line.",
      "If one person keeps asking another quick question after each answer, forever, the line never moves.",
      "Back to tech: Node empties the whole nextTick queue before continuing the event loop; if each tick schedules another tick, the loop never gets to timers or I/O.",
      "# What it is",
      "Starvation — when some work never gets a turn because other work always takes priority.",
      "The nextTick queue is drained completely after the current operation, and that includes ticks added while draining.",
      "So a function that recursively calls `process.nextTick(itself)` keeps the queue non-empty forever.",
      "Result: timers never fire, incoming requests are never accepted, and I/O callbacks never run, even though no single callback is long.",
      "The same applies to endless Promise microtask chains (e.g. `queueMicrotask` or `.then` recursion).",
      "`setImmediate` does not have this problem: immediates added during the check phase wait for the next lap, so I/O gets a turn in between.",
      "# How it works",
      "Current operation finishes → Node starts draining the nextTick queue.",
      "  The tick callback runs and schedules another tick.",
      "  Queue is not empty, so Node runs it immediately… and so on.",
      "  The loop never advances to the timers or poll phases.",
      "With `setImmediate` instead:",
      "  Callback runs in check → schedules next immediate for the next lap.",
      "  Loop continues to close, timers and poll, so timers and I/O run between iterations.",
      "# Example walkthrough",
      "A 0 ms timer is scheduled to print 'timer fired'.",
      "`starve` uses nextTick 1,000,000 times; the timer cannot fire until all million ticks are done.",
      "`fair` does the same with setImmediate; the timer fires after only a few iterations because the loop keeps cycling.",
      "Comparing the printed counts shows the difference.",
      "# Why it matters / when to use",
      "Library authors use nextTick to defer callbacks; misusing it in loops can freeze a server without any single slow function.",
      "When breaking up long work, choose `setImmediate`, not `nextTick`.",
      "# Common mistakes",
      "Using nextTick as a 'yield' to let I/O happen; it does the opposite.",
      "Thinking async functions with `await` inside a tight loop always yield to I/O; awaiting already-resolved values only yields to microtasks, not to I/O.",
      "# Say this in the interview",
      "Node drains the entire nextTick queue, including newly added ticks, before letting the event loop continue. So if a callback recursively schedules itself with process.nextTick, the queue never empties and timers and I/O never run, which starves the loop. To break up work fairly I use setImmediate, because immediates added during the check phase wait until the next iteration.",
    ],
    code: `// starve.mjs
const t0 = Date.now();
setTimeout(() => console.log('timer fired after', Date.now() - t0, 'ms'), 0);

let ticks = 0;
function starve() {
  if (++ticks < 1_000_000) process.nextTick(starve); // queue never empties
  else console.log('nextTick loop finished');
}
starve();
// → nextTick loop finished
// → timer fired after ~300 ms (it had to wait for ALL ticks)

// Fair version (try it instead of starve()):
// let n = 0;
// function fair() { if (++n < 1_000_000) setImmediate(fair); }
// fair();
// → timer fired after ~1 ms (loop keeps cycling between immediates)`,
  },
  {
    id: 'timers-unref',
    group: 'Event Loop & Internals',
    stars: 1,
    difficulty: 'Medium',
    q: 'What do `timer.unref()` and `timer.ref()` do?',
    a: [
      "# ELI5",
      "A shop stays open as long as at least one customer is inside.",
      "`unref` is like a staff member saying 'don't keep the shop open just for me'; if all real customers leave, the shop closes even if that staff member is still around.",
      "`ref` switches back to 'please keep the shop open for me'.",
      "Back to tech: by default an active timer keeps the Node process alive; `unref()` lets the process exit even if the timer is still scheduled.",
      "# What it is",
      "Node exits when the event loop has no more 'ref'ed handles — active things like timers, servers or sockets that count as pending work.",
      "`setTimeout`/`setInterval` return a `Timeout` object; by default it is ref'ed, so the process stays alive until it fires or is cleared.",
      "`timeout.unref()` — the timer still fires if the process is alive for other reasons, but it no longer keeps the process alive by itself.",
      "`timeout.ref()` — undoes `unref`, so it keeps the process alive again.",
      "`timeout.hasRef()` — returns true or false.",
      "Servers and sockets also support `unref()`/`ref()`.",
      "# How it works",
      "Each handle has a reference flag that libuv counts.",
      "  At the end of every loop lap, libuv checks: are there any active, referenced handles or pending requests?",
      "  If none, the loop stops and the process exits, even if unref'ed timers are still scheduled.",
      "# Example walkthrough",
      "A metrics interval prints every second, and is unref'ed.",
      "A main job takes 2.5 seconds using a normal (ref'ed) timeout.",
      "The metrics line prints twice while the job is running, then the job finishes and the process exits immediately, without waiting for the interval.",
      "Without `unref()`, the interval would keep the process running forever.",
      "# Why it matters / when to use",
      "Background helpers (metrics flushers, cache cleanup intervals, heartbeat logs) should not stop a CLI tool or test runner from exiting.",
      "Shutdown timeouts: `setTimeout(() => process.exit(1), 10000).unref()` forces exit if graceful shutdown hangs, without delaying a clean exit.",
      "# Common mistakes",
      "Forgetting `unref()` on a library's internal interval, so tests hang with 'Jest did not exit'.",
      "Using `unref()` on a timer that must run (e.g. a job's only work); the process may exit before it fires.",
      "# Say this in the interview",
      "By default timers keep the Node process alive. Calling unref on a timer tells the event loop not to count it, so the process can exit if nothing else is pending, while the timer still fires if the process happens to be alive. ref reverses that. I use unref for background intervals like metrics flushing and for shutdown watchdog timers so they never block a clean exit.",
    ],
    code: `// unref.mjs
const metrics = setInterval(() => {
  console.log('flushing metrics...');
}, 1000);
metrics.unref(); // don't keep the process alive just for this
console.log('hasRef?', metrics.hasRef()); // → hasRef? false

// The "real" work keeps the process alive for 2.5 s
setTimeout(() => {
  console.log('main job done');
}, 2500);

// Output:
// → hasRef? false
// → flushing metrics...   (1 s)
// → flushing metrics...   (2 s)
// → main job done         (2.5 s) — then the process exits

// Shutdown watchdog that never delays a clean exit:
// setTimeout(() => process.exit(1), 10_000).unref();`,
  },

  // ───────────────────────── Modules & npm ─────────────────────────
  {
    id: 'commonjs-vs-esm',
    group: 'Modules & npm',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is the difference between CommonJS and ES Modules in Node?',
    a: [
      "# ELI5",
      "Two schools have different ways to borrow books from each other.",
      "School A (CommonJS) sends a runner who fetches the book right when you ask, and you get a photocopy of the page at that moment.",
      "School B (ES Modules) writes the full borrowing list at the start of the day, collects all books first, and gives you a live window into the original book, so you always see the latest page.",
      "Back to tech: CommonJS loads modules synchronously at runtime with `require`; ES Modules are analyzed ahead of time with static `import` and give live bindings.",
      "# What it is",
      "A module is one file whose variables are private unless it exports them.",
      "CommonJS (CJS) — Node's original system: `require()` to import, `module.exports` to export.",
      "ES Modules (ESM) — the official JavaScript standard used by browsers too: `import` and `export`.",
      "Comparison row — syntax: CJS `const x = require('./x')`; ESM `import x from './x.js'`.",
      "Comparison row — loading: CJS is synchronous and happens when the line runs; ESM is parsed first, all imports are linked, then code runs (loading can be asynchronous).",
      "Comparison row — static analysis: ESM imports must be at the top level, so tools can tree-shake — remove unused exports from bundles; CJS `require` can be anywhere, even in an `if`.",
      "Comparison row — exported values: CJS gives a copy of the value at require time (for primitives); ESM gives live bindings — if the exporter changes the variable, importers see the new value.",
      "Comparison row — top-level `await`: allowed in ESM, not in CJS.",
      "Comparison row — globals: CJS has `__dirname`, `__filename`, `require`; ESM uses `import.meta.dirname`, `import.meta.filename`, `import.meta.url`.",
      "Comparison row — file extensions: ESM relative imports must include the extension (`./util.js`); CJS can omit it.",
      "Comparison row — strict mode: ESM is always strict; CJS only if you write 'use strict'.",
      "How Node decides: `.mjs` is ESM, `.cjs` is CJS, and `.js` follows the nearest package.json `\"type\"` field (`\"module\"` = ESM, missing or `\"commonjs\"` = CJS).",
      "# How it works",
      "CJS: `require('./a')` resolves the path, reads the file, wraps it in a function, runs it, caches and returns `module.exports`.",
      "ESM loading happens in three steps:",
      "  Construction: find and parse every file in the import graph.",
      "  Instantiation: link exports and imports to shared memory slots (that is why bindings are live).",
      "  Evaluation: run each module's code, dependencies first.",
      "Interop:",
      "  ESM can `import` CommonJS packages; `module.exports` becomes the default export.",
      "  CJS can use `await import('./x.mjs')` (dynamic import) anywhere.",
      "  Node 22.12+ (and 20.19+) can also `require()` synchronous ESM (modules without top-level await) by default.",
      "# Example walkthrough",
      "`counter.mjs` exports a `count` variable and an `increment` function.",
      "In `main.mjs`, `count` is 0, then after `increment()` the import shows 1 — a live binding.",
      "In the CJS version, `count` was copied into a property when exported, so it stays 0 after increment.",
      "The last lines show dynamic `import()` loading a module on demand, which works in both systems.",
      "# Why it matters / when to use",
      "New projects should prefer ESM (`\"type\": \"module\"`), since it is the standard and works with modern tooling.",
      "Many older libraries are still CJS, so you must understand interop.",
      "Library authors often publish both via the package.json `exports` field.",
      "# Common mistakes",
      "Forgetting the `.js` extension in ESM relative imports, causing ERR_MODULE_NOT_FOUND.",
      "Using `__dirname` or `require` inside ESM; use `import.meta.dirname` or `createRequire` from `node:module`.",
      "Mixing `import` and `module.exports` in the same file.",
      "Expecting named imports from a CJS package to always work; Node detects them heuristically, so sometimes you must use the default import.",
      "# Say this in the interview",
      "CommonJS is Node's original module system using require and module.exports; it loads synchronously at runtime and exports copies of values. ES Modules use import and export, are statically analyzable so they support tree-shaking and top-level await, and give live bindings. Node picks the system by file extension or the package.json type field, and they interoperate: ESM can import CJS, and CJS can use dynamic import or, in recent Node versions, require synchronous ESM.",
      "  Follow-up: How do you get __dirname in ESM? — `import.meta.dirname` in Node 20.11+, or `path.dirname(fileURLToPath(import.meta.url))`.",
      "  Follow-up: What does tree-shaking need? — Static ESM imports, so a bundler can see which exports are unused.",
    ],
    code: `// ── counter.mjs (ESM) ──
export let count = 0;
export function increment() { count++; }

// ── main.mjs (ESM) ──
import { count, increment } from './counter.mjs'; // extension required
console.log(count); // → 0
increment();
console.log(count); // → 1   (live binding sees the update)

const { default: os } = await import('node:os'); // dynamic import + top-level await
console.log(os.platform()); // → e.g. linux

// ── counter.cjs (CommonJS) ──
// let count = 0;
// module.exports = { count, increment() { count++; } };
// ── main.cjs ──
// const c = require('./counter.cjs');
// c.increment();
// console.log(c.count); // → 0  (a copy was exported, not a live binding)`,
  },
  {
    id: 'module-caching',
    group: 'Modules & npm',
    stars: 4,
    difficulty: 'Medium',
    q: 'How does module caching work in Node?',
    a: [
      "# ELI5",
      "The first time you ask a librarian for a book, they go to the store room and bring it.",
      "Next time anyone asks for the same book, they hand over the same copy from the front desk instead of fetching a new one.",
      "Back to tech: Node runs a module's file only the first time it is loaded; later imports get the same cached exports object.",
      "# What it is",
      "Module caching — Node stores each loaded module after its first load, keyed by its fully resolved file path (or URL for ESM).",
      "The module's top-level code runs only once per process, no matter how many files import it.",
      "Every importer receives the same object, so modules act like singletons — one shared instance.",
      "In CommonJS the cache is visible as `require.cache`; you can delete an entry to force a reload (useful in tests, rarely in production).",
      "In ESM the cache is internal and cannot be cleared; you would need a different URL (e.g. a query string) to load a fresh copy.",
      "The key is the resolved path, so the same package installed in two different `node_modules` folders is loaded twice, as two separate instances.",
      "On case-insensitive file systems (Windows, macOS default), different casing in paths can also create duplicate instances.",
      "# How it works",
      "`require('./db')` is called.",
      "  Node resolves it to an absolute path like `/app/src/db.js`.",
      "  If that path is in the cache, it returns the cached `module.exports` immediately.",
      "  If not, it creates a new module object, adds it to the cache first (this matters for circular imports), runs the file, and returns its exports.",
      "Later requires of the same path skip straight to the cached result.",
      "# Example walkthrough",
      "`db.cjs` logs 'connecting' at the top level and exports an object with a `queries` counter.",
      "`main.cjs` requires it twice; 'connecting' prints only once.",
      "Both variables point to the same object, so a change through one is seen through the other, and `a === b` is true.",
      "Deleting the entry from `require.cache` and requiring again runs the file a second time and creates a new object.",
      "# Why it matters / when to use",
      "Shared resources like a database pool, config, or logger are usually created once in a module and reused everywhere through caching.",
      "Explains why changing a module's exported object in one place affects all importers.",
      "Explains 'two copies of React' or duplicate class instance bugs (e.g. `instanceof` failing) when a package is installed twice.",
      "# Common mistakes",
      "Expecting a module to re-run on every import, e.g. to refresh config; export a function instead if you need fresh results.",
      "Relying on module singletons across worker threads or cluster processes; each thread or process has its own cache.",
      "Mutating shared exported state accidentally, causing hidden coupling between modules.",
      "# Say this in the interview",
      "Node caches each module by its resolved path the first time it is loaded, so its top-level code runs once and every importer gets the same exports object. That is why modules behave like singletons and why a DB pool created in a module is shared. In CommonJS you can inspect or delete entries in require.cache, mainly for tests; ESM's cache is internal. Since the key is the path, duplicate installs of a package create separate instances.",
      "  Follow-up: Is the cache shared between worker threads? — No; each worker thread or process has its own module cache.",
    ],
    code: `// ── db.cjs ──
console.log('connecting to DB...'); // top-level code runs ONCE
module.exports = { queries: 0 };

// ── main.cjs ──
const a = require('./db.cjs'); // → connecting to DB...
const b = require('./db.cjs'); // (nothing printed — served from cache)

a.queries++;
console.log(b.queries); // → 1   (same object)
console.log(a === b);   // → true

// Force a reload (mainly for tests)
delete require.cache[require.resolve('./db.cjs')];
const c = require('./db.cjs'); // → connecting to DB...
console.log(c === a);  // → false (new instance)
console.log(c.queries); // → 0`,
  },
  {
    id: 'module-exports-vs-exports',
    group: 'Modules & npm',
    stars: 4,
    difficulty: 'Easy',
    q: 'What is the difference between `module.exports` and `exports`? What is the module wrapper?',
    a: [
      "# ELI5",
      "Imagine a gift box (module.exports) that is shipped to whoever asks for your module.",
      "You are also given a sticky note (exports) that says 'the gift box is over there'.",
      "You can put items into the box using the sticky note, but if you write a new address on the sticky note, the box itself does not change, and the receiver still gets the original box.",
      "Back to tech: `exports` is just a shortcut variable pointing to `module.exports`; only `module.exports` is actually returned by `require`.",
      "# What it is",
      "Module wrapper — before running a CommonJS file, Node wraps its code in a function: `(function (exports, require, module, __filename, __dirname) { ...your code... })`.",
      "This wrapper is why each file has private top-level variables, and why `require`, `module`, `exports`, `__filename` and `__dirname` are available without being true globals.",
      "`module` — an object describing the current module; `module.exports` starts as an empty object `{}`.",
      "`exports` — a parameter that initially points to the same object as `module.exports`.",
      "`require()` always returns `module.exports`, never `exports`.",
      "So `exports.foo = 1` works (it adds to the shared object), but `exports = { foo: 1 }` does nothing visible (it only reassigns the local variable).",
      "To export a single function or class, assign directly: `module.exports = MyClass`.",
      "# How it works",
      "Node reads the file's source text.",
      "  It wraps the text in the wrapper function and compiles it.",
      "  It creates `module = { exports: {} }` and calls the function with `exports = module.exports`.",
      "  Your code runs and may add properties or replace `module.exports`.",
      "  After the function finishes, Node caches the module and `require` returns `module.exports`.",
      "# Example walkthrough",
      "`good.cjs` uses `exports.add` and `exports.sub`; both are visible to `require`.",
      "`bad.cjs` reassigns `exports` to a new object; `require` returns an empty object because `module.exports` was never touched.",
      "`single.cjs` assigns a function to `module.exports`, so `require` returns the function directly.",
      "`require('module').wrapper` shows the wrapper text in older APIs; the comment shows what it looks like.",
      "# Why it matters / when to use",
      "Reading and maintaining older Node code and many npm libraries still written in CommonJS.",
      "Understanding the wrapper explains file-level scope and why `__dirname` is missing in ESM.",
      "# Common mistakes",
      "Doing `exports = something` and wondering why the import is empty; use `module.exports = something`.",
      "Mixing both: `module.exports = fn` followed by `exports.x = 1` — the second line adds to the old object that is no longer exported.",
      "Using `this` at the top level expecting `globalThis`; in CJS, top-level `this` is `module.exports`.",
      "# Say this in the interview",
      "Node wraps every CommonJS file in a function that receives exports, require, module, __filename and __dirname, which gives each file its own scope. exports is just a reference to module.exports, and require always returns module.exports. So adding properties via exports works, but reassigning exports breaks the link; to export a single value like a class you assign module.exports directly.",
    ],
    code: `// ── good.cjs ──
exports.add = (a, b) => a + b; // adds to the shared object
exports.sub = (a, b) => a - b;

// ── bad.cjs ──
exports = { mul: (a, b) => a * b }; // only reassigns the local variable!

// ── single.cjs ──
module.exports = function greet(name) { return 'Hi ' + name; };

// ── main.cjs ──
console.log(require('./good.cjs').add(2, 3)); // → 5
console.log(require('./bad.cjs'));            // → {}   (nothing exported)
console.log(require('./single.cjs')('Asha')); // → Hi Asha

// What Node actually runs for each CommonJS file:
// (function (exports, require, module, __filename, __dirname) {
//   ...your file's code...
// });
console.log(this === module.exports); // → true (top-level this in CJS)`,
  },
  {
    id: 'dependency-types',
    group: 'Modules & npm',
    stars: 4,
    difficulty: 'Easy',
    q: 'Explain dependencies, devDependencies, peerDependencies, and optionalDependencies.',
    a: [
      "# ELI5",
      "Think about baking and selling a cake.",
      "Dependencies are the ingredients inside the cake — the customer needs them.",
      "devDependencies are your mixer and oven — you need them to make the cake but they are not shipped to the customer.",
      "peerDependencies are like a cake topper that says 'this only fits a round cake you already have' — the customer must bring the matching cake.",
      "optionalDependencies are sprinkles — nice if available, but the cake is fine without them.",
      "# What it is",
      "These are sections of package.json — the file that describes your project and its packages.",
      "`dependencies` — packages your code needs at runtime in production, e.g. `express`, `zod`, `pg`. Install with `npm install express`.",
      "`devDependencies` — packages needed only for development, building or testing, e.g. `typescript`, `vitest`, `eslint`, `@types/node`. Install with `npm install -D vitest`.",
      "`peerDependencies` — used mostly by plugins and libraries to say 'I work with your copy of X, version range Y'; e.g. a React component library declares `react` as a peer so the app's single React is used. Since npm 7, missing peers are installed automatically and conflicts cause errors (`--legacy-peer-deps` skips this).",
      "`optionalDependencies` — packages that npm tries to install but ignores if they fail (e.g. a platform-specific native binary); your code must handle them being missing.",
      "Comparison row — installed for your app in production: dependencies yes; devDependencies no (with `npm ci --omit=dev`); peerDependencies provided by the host app; optional yes if possible.",
      "Comparison row — installed when someone installs your library: dependencies yes; devDependencies never; peer yes (npm 7+) but shared with the host; optional tries.",
      "# How it works",
      "`npm install` (no flags) in your project installs dependencies and devDependencies.",
      "  `npm ci --omit=dev` (or `NODE_ENV=production npm ci`) installs only production dependencies, making Docker images smaller.",
      "  When your library is installed in another project, npm installs its dependencies, skips its devDependencies, and checks peers against the host's versions.",
      "  If an optional dependency fails to build, npm logs a warning and continues.",
      "# Example walkthrough",
      "The package.json snippet shows a React UI library.",
      "`clsx` is a real runtime dependency, so it is in `dependencies`.",
      "`react` is a peer, so the library uses the app's React instead of bundling its own copy.",
      "`typescript` and `vitest` are only for building and testing, so they are devDependencies.",
      "`fsevents` is optional because it only works on macOS.",
      "The JS part shows how to safely load an optional dependency with try/catch.",
      "# Why it matters / when to use",
      "Correct categorization keeps production installs small and secure.",
      "Peer deps prevent duplicate framework instances (two Reacts break hooks).",
      "# Common mistakes",
      "Putting `typescript` or test tools in `dependencies`, bloating production images.",
      "Putting a package needed at runtime (like `dotenv` used in prod) into devDependencies, then crashing after `--omit=dev`.",
      "Libraries listing `react` as a normal dependency, causing two copies of React in the app.",
      "Using `--force` or `--legacy-peer-deps` routinely instead of fixing version conflicts.",
      "# Say this in the interview",
      "dependencies are needed at runtime in production; devDependencies are only for building, testing and linting and are skipped with npm ci --omit=dev; peerDependencies are used by plugins and libraries to require that the host app provides a compatible version of something like React, so only one copy exists; optionalDependencies are attempted but allowed to fail, and the code must handle their absence.",
    ],
    code: `// package.json of a React UI library
// {
//   "name": "my-ui-kit",
//   "dependencies":         { "clsx": "^2.1.1" },
//   "peerDependencies":     { "react": "^18.0.0 || ^19.0.0" },
//   "devDependencies":      { "typescript": "^5.6.0", "vitest": "^2.1.0" },
//   "optionalDependencies": { "fsevents": "^2.3.3" }
// }
//
// Commands:
// npm install clsx          → adds to dependencies
// npm install -D vitest     → adds to devDependencies
// npm ci --omit=dev         → production install, skips devDependencies

// Safely using an optional dependency (ESM):
let fsevents = null;
try {
  fsevents = (await import('fsevents')).default;
} catch {
  console.log('fsevents not available, using fallback'); // → on Linux/Windows
}`,
  },
  {
    id: 'semver-lockfile',
    group: 'Modules & npm',
    stars: 4,
    difficulty: 'Easy',
    q: 'Explain semantic versioning and the purpose of package-lock.json.',
    a: [
      "# ELI5",
      "A version number like 2.5.1 is like a recipe edition: the first number changes when the recipe becomes a totally different dish, the second when a new optional topping is added, the third when a typo is fixed.",
      "Your shopping list says 'any edition 2.x is fine', but the lock file is a photo of exactly which edition you bought last time, so everyone cooks with the same one.",
      "Back to tech: semver tells you what kind of change a version contains; package-lock.json records the exact versions installed so every machine gets the same tree.",
      "# What it is",
      "Semantic versioning (semver) — a version format MAJOR.MINOR.PATCH, e.g. 4.18.2.",
      "  MAJOR: breaking changes (code using the old version may stop working).",
      "  MINOR: new features that are backward compatible.",
      "  PATCH: backward-compatible bug fixes.",
      "Version ranges in package.json:",
      "  `^1.4.2` (caret, npm default) — allows minor and patch updates: >=1.4.2 <2.0.0. For 0.x versions it is stricter: `^0.4.2` means >=0.4.2 <0.5.0.",
      "  `~1.4.2` (tilde) — allows patch updates only: >=1.4.2 <1.5.0.",
      "  `1.4.2` — exactly that version.",
      "  Pre-releases like `2.0.0-beta.1` are only matched if the range mentions them.",
      "package-lock.json — a file npm generates that records the exact version, download URL and integrity hash (a checksum to detect tampering) of every installed package, including nested ones (transitive dependencies — dependencies of your dependencies).",
      "`npm install` may update the lock file within allowed ranges; `npm ci` installs exactly what the lock file says and fails if package.json and the lock disagree.",
      "# How it works",
      "You run `npm install express` → npm picks the newest version, writes `^5.x.x` into package.json and the exact version into the lock file.",
      "  A teammate clones the repo and runs `npm ci` → they get the exact same versions and hashes.",
      "  CI and Docker builds use `npm ci` for reproducible, faster installs.",
      "  To upgrade on purpose: `npm outdated` to see updates, `npm update` for in-range updates, or `npm install pkg@latest` for a new major.",
      "  Commit the lock file to git so everyone shares it.",
      "# Example walkthrough",
      "The snippet uses the real `semver` package to test ranges.",
      "`^1.4.2` accepts 1.9.0 but rejects 2.0.0, because 2.0.0 is a breaking major.",
      "`~1.4.2` accepts 1.4.9 but rejects 1.5.0.",
      "The `^0.4.2` line shows the stricter rule for 0.x versions.",
      "The comment shows what a lock file entry looks like.",
      "# Why it matters / when to use",
      "Prevents 'works on my machine' bugs caused by different installed versions.",
      "Protects builds from a dependency publishing a broken or malicious release.",
      "Tools like Dependabot or Renovate open pull requests to update locked versions safely.",
      "# Common mistakes",
      "Not committing package-lock.json, or adding it to .gitignore.",
      "Using `npm install` in CI instead of `npm ci`.",
      "Deleting the lock file to 'fix' install errors, which silently upgrades everything.",
      "Assuming every package follows semver perfectly; minor updates can still break, which is why the lock file and tests matter.",
      "# Say this in the interview",
      "Semver uses MAJOR.MINOR.PATCH: major for breaking changes, minor for compatible features, patch for compatible fixes. package.json stores ranges like caret, which allows minor and patch updates, or tilde, which allows only patches. package-lock.json pins the exact resolved versions and integrity hashes of the whole dependency tree, so with it committed and npm ci in CI, every install is reproducible.",
      "  Follow-up: npm install vs npm ci? — `npm ci` deletes node_modules and installs exactly from the lock file, failing if it is out of sync; `npm install` can update the lock file.",
    ],
    code: `// semver-demo.mjs — npm i semver
import semver from 'semver';

console.log(semver.satisfies('1.9.0', '^1.4.2')); // → true  (minor update OK)
console.log(semver.satisfies('2.0.0', '^1.4.2')); // → false (major = breaking)
console.log(semver.satisfies('1.4.9', '~1.4.2')); // → true  (patch OK)
console.log(semver.satisfies('1.5.0', '~1.4.2')); // → false (minor not allowed)
console.log(semver.satisfies('0.5.0', '^0.4.2')); // → false (0.x is stricter)

// package-lock.json entry (simplified):
// "node_modules/express": {
//   "version": "4.21.1",
//   "resolved": "https://registry.npmjs.org/express/-/express-4.21.1.tgz",
//   "integrity": "sha512-..."
// }

// In CI / Docker:
// npm ci            → exact install from the lock file
// npm ci --omit=dev → production-only install`,
  },
  {
    id: 'module-resolution',
    group: 'Modules & npm',
    stars: 3,
    difficulty: 'Medium',
    q: 'How does Node resolve a module specifier?',
    a: [
      "# ELI5",
      "When you ask for 'Room 12' in a school, the guard first checks if it is a special room everyone knows (the office), then checks the exact room number you gave, and otherwise walks to each floor's directory board until it finds the room.",
      "Back to tech: Node first checks for built-in modules, then relative or absolute paths, then searches `node_modules` folders from the current folder upward.",
      "# What it is",
      "A module specifier is the string you pass to `require()` or `import`, e.g. `'node:fs'`, `'./utils.js'`, or `'express'`.",
      "Resolution is the process of turning that string into an actual file path to load.",
      "Three kinds of specifiers:",
      "  Built-in (core) modules: `fs`, `http`, or the explicit form `node:fs`. These always win.",
      "  Relative or absolute paths: start with `./`, `../` or `/`.",
      "  Bare specifiers: package names like `express` or `lodash/merge`, looked up in `node_modules`.",
      "The package.json `exports` field — when present, it is the only list of entry points a package allows; other files are private (ERR_PACKAGE_PATH_NOT_EXPORTED).",
      "Conditional exports — `exports` can point to different files for `import` vs `require`, or for `node` vs `browser`.",
      "The `imports` field allows private aliases starting with `#`, e.g. `import db from '#db'`.",
      "# How it works",
      "Built-in check: if the name is a core module, return it.",
      "Path specifiers:",
      "  CommonJS tries the exact path, then adds extensions `.js`, `.json`, `.node`, then treats it as a folder (package.json `main`, then `index.js`).",
      "  ESM requires the exact file, including extension; no automatic extensions or index files.",
      "Bare specifiers:",
      "  Look in `./node_modules/<name>`, then `../node_modules/<name>`, and so on up to the filesystem root.",
      "  Inside the found package, use `exports` if present, else `main`, else `index.js`.",
      "If nothing is found: `MODULE_NOT_FOUND` (CJS) or `ERR_MODULE_NOT_FOUND` (ESM).",
      "# Example walkthrough",
      "`require.resolve` and `import.meta.resolve` show where a specifier would load from without running it.",
      "`node:fs` resolves to the built-in, shown as 'node:fs'.",
      "`./utils.js` resolves to an absolute path next to the current file.",
      "A bare specifier like `semver` resolves into the nearest `node_modules` folder.",
      "The package.json snippet shows an `exports` map with separate ESM and CJS entry points and an `imports` alias.",
      "# Why it matters / when to use",
      "Debugging 'Cannot find module' errors in monorepos and Docker images.",
      "Publishing libraries that work for both ESM and CJS users.",
      "Using `#` aliases to avoid long `../../../` paths.",
      "# Common mistakes",
      "Leaving out the file extension in ESM imports.",
      "Deep-importing a package's internal file that is not listed in `exports`.",
      "Not using the `node:` prefix, which makes core modules harder to tell apart from npm packages with similar names.",
      "# Say this in the interview",
      "Node first checks for core modules, then handles relative and absolute paths, and for bare package names walks up node_modules folders from the current directory. Inside a package, the exports field defines the public entry points, with conditions for import versus require; otherwise main or index.js is used. CommonJS also tries extensions and index files, while ESM requires exact file paths with extensions.",
    ],
    code: `// resolve.mjs (needs: npm i semver)
console.log(import.meta.resolve('node:fs'));  // → node:fs
console.log(import.meta.resolve('./utils.js'));
// → file:///home/me/app/utils.js (absolute URL; file need not exist yet)
console.log(import.meta.resolve('semver'));
// → file:///home/me/app/node_modules/semver/index.js

// package.json of a dual ESM/CJS library:
// {
//   "name": "my-lib",
//   "exports": {
//     ".": {
//       "import": "./dist/index.mjs",   ← used by import
//       "require": "./dist/index.cjs"   ← used by require
//     },
//     "./utils": "./dist/utils.mjs"
//   },
//   "imports": { "#db": "./src/db/index.js" }  ← import db from '#db'
// }
// import 'my-lib/dist/secret.js' → ERR_PACKAGE_PATH_NOT_EXPORTED`,
  },
  {
    id: 'package-json-fields',
    group: 'Modules & npm',
    stars: 3,
    difficulty: 'Easy',
    q: 'What are the key fields of package.json?',
    a: [
      "# ELI5",
      "package.json is like the label on a food product: name, version, ingredients, cooking instructions and which oven it needs.",
      "Back to tech: it describes your project — its identity, its dependencies, its scripts and how Node should load it.",
      "# What it is",
      "package.json is a JSON file at the root of every Node project or package; `npm init -y` creates one.",
      "`name` and `version` — the package identity; required to publish to npm.",
      "`type` — `\"module\"` makes `.js` files ES modules; missing or `\"commonjs\"` keeps them CommonJS.",
      "`main` — the old entry point when someone requires your package.",
      "`exports` — the modern, stricter entry point map; it overrides `main` and hides internal files.",
      "`scripts` — named commands run with `npm run <name>`, e.g. `dev`, `build`, `test`, `start`.",
      "`dependencies`, `devDependencies`, `peerDependencies`, `optionalDependencies` — what to install, with version ranges.",
      "`engines` — which Node versions are supported, e.g. `\"node\": \">=20\"`; npm warns on mismatch (or errors with `engine-strict`).",
      "`bin` — command-line programs your package provides, linked into `node_modules/.bin`.",
      "`files` — which files to include when publishing (keeps the package small).",
      "`private: true` — prevents accidental publishing to npm.",
      "`packageManager` — e.g. `\"pnpm@9.12.0\"`, used by Corepack to pick the right package manager version.",
      "`workspaces` — lists sub-packages in a monorepo (one repo with several packages).",
      "Also: `description`, `license`, `repository`, `keywords`, `types` (TypeScript declaration entry), `overrides` (force a nested dependency version).",
      "# How it works",
      "npm reads it on `npm install` to know what to install, then writes exact versions to package-lock.json.",
      "  Node reads `type`, `exports` and `imports` when resolving and loading modules.",
      "  `npm run x` reads `scripts.x` and runs it in a shell.",
      "  `npm publish` uses `name`, `version`, `files` and `exports` to build the tarball.",
      "# Example walkthrough",
      "The sample is a typical TypeScript API service.",
      "`private: true` and `type: module` mark it as an unpublished ESM project.",
      "`engines` says Node 20 or newer.",
      "`scripts` define dev (watch mode with tsx), build (tsc), start (run compiled code with an env file) and test.",
      "Runtime packages go in dependencies, tools in devDependencies.",
      "# Why it matters / when to use",
      "It is the first file a reviewer reads to understand a Node project.",
      "Fields like `engines`, `type` and `exports` prevent runtime surprises across environments.",
      "# Common mistakes",
      "Forgetting `\"type\": \"module\"` and getting 'Cannot use import statement outside a module'.",
      "Not setting `private: true` on apps, risking accidental publishing.",
      "Writing comments in package.json; JSON does not allow comments.",
      "# Say this in the interview",
      "package.json is the manifest of a Node project. Key fields are name and version for identity, type to choose ESM or CommonJS, main and exports for entry points, scripts for project commands, the dependency sections with semver ranges, engines for supported Node versions, bin for CLI commands, and private, files and workspaces for publishing and monorepos.",
    ],
    code: `{
  "name": "orders-api",
  "version": "1.3.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=20" },
  "packageManager": "npm@10.9.0",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node --env-file=.env dist/index.js",
    "test": "vitest run",
    "lint": "eslint ."
  },
  "dependencies": {
    "fastify": "^5.1.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/node": "^22.9.0",
    "tsx": "^4.19.2",
    "typescript": "^5.6.3",
    "vitest": "^2.1.4"
  }
}`,
  },
  {
    id: 'circular-dependencies',
    group: 'Modules & npm',
    stars: 2,
    difficulty: 'Hard',
    q: 'What happens with circular dependencies in Node modules?',
    a: [
      "# ELI5",
      "Two friends each say 'I'll finish my homework after I copy yours'. One of them has to start, so the second friend copies a half-finished page.",
      "Back to tech: when module A loads B and B loads A, one of them sees the other only partly loaded — some exports are missing or not yet initialized.",
      "# What it is",
      "A circular dependency is when modules import each other directly (A → B → A) or through a longer chain (A → B → C → A).",
      "Node does not crash or loop forever; it uses the module cache to break the cycle, but one side gets an incomplete module.",
      "In CommonJS, the second module receives the first module's `module.exports` as it is at that moment — often an empty `{}` or missing properties, so values are `undefined`.",
      "In ESM, bindings are live, so the value appears once the other module finishes; but accessing a `let`, `const` or `class` before it is initialized throws ReferenceError (the temporal dead zone — the period before a variable's declaration line has run).",
      "Function declarations in ESM are hoisted (made available before the code runs), so calling an exported `function` across a cycle usually works.",
      "# How it works",
      "CommonJS case (main requires a.cjs):",
      "  `a.cjs` starts running and is put in the cache with empty exports.",
      "  `a.cjs` requires `b.cjs`; `b.cjs` starts running.",
      "  `b.cjs` requires `a.cjs`; Node finds it in the cache and returns its partial exports.",
      "  `b.cjs` finishes; then `a.cjs` continues and sets its exports — too late for what `b` captured.",
      "Fixes:",
      "  Move shared code into a third module that both import.",
      "  Use dependency injection — pass the needed function or object as a parameter instead of importing it.",
      "  Require lazily inside the function that needs it, not at the top.",
      "  Detect cycles with tools like `madge --circular` or ESLint `import/no-cycle`.",
      "# Example walkthrough",
      "`a.cjs` sets `exports.loaded = false`, requires b, then sets `exports.loaded = true`.",
      "`b.cjs` requires a while a is half-finished, so it logs `a.loaded = false`.",
      "After everything loads, main logs both as true.",
      "This shows exactly which values are visible during the cycle.",
      "# Why it matters / when to use",
      "Cycles cause confusing `undefined is not a function` or 'Cannot access X before initialization' errors that appear only depending on import order.",
      "Large codebases (services importing each other's models) often grow cycles accidentally.",
      "# Common mistakes",
      "Fixing a cycle by reordering imports until it works; it will break again. Restructure instead.",
      "Using destructuring at the top (`const { fn } = require('./a')`) during a cycle, which captures `undefined` permanently; accessing `a.fn` later would at least see the final value.",
      "# Say this in the interview",
      "Node handles circular dependencies through the module cache: when A requires B and B requires A, B gets A's exports as they are at that moment, which is often incomplete. In CommonJS that shows up as undefined values; in ESM, live bindings help but touching a let, const or class too early throws a ReferenceError. I avoid cycles by extracting shared code into a separate module, using dependency injection or lazy requires, and detecting them with madge or ESLint.",
    ],
    code: `// ── a.cjs ──
exports.loaded = false;
const b = require('./b.cjs');        // jumps into b before a is done
console.log('in a, b.loaded =', b.loaded);
exports.loaded = true;

// ── b.cjs ──
exports.loaded = false;
const a = require('./a.cjs');        // a is only HALF loaded here
console.log('in b, a.loaded =', a.loaded);
exports.loaded = true;

// ── main.cjs ──
const a2 = require('./a.cjs');
const b2 = require('./b.cjs');
console.log('in main', a2.loaded, b2.loaded);
// → in b, a.loaded = false   (partial exports of a)
// → in a, b.loaded = true
// → in main true true`,
  },
  {
    id: 'npm-scripts',
    group: 'Modules & npm',
    stars: 2,
    difficulty: 'Easy',
    q: 'How do npm scripts work?',
    a: [
      "# ELI5",
      "A TV remote has buttons with labels like 'Netflix' or 'Volume up'; you press one button instead of doing many steps yourself.",
      "Back to tech: npm scripts are named shortcuts in package.json, so the team runs `npm run build` instead of remembering long commands.",
      "# What it is",
      "The `scripts` section in package.json maps a name to a shell command.",
      "`npm run <name>` runs it; `npm run` alone lists all scripts.",
      "Shortcuts: `npm start`, `npm test` (or `npm t`), `npm stop` and `npm restart` work without `run`.",
      "Pre and post hooks: a script named `prebuild` runs automatically before `build`, and `postbuild` after it.",
      "Lifecycle scripts: `prepare` runs after `npm install` (often used to set up git hooks with husky); `postinstall` runs after a package is installed.",
      "npm adds `node_modules/.bin` to the PATH while running scripts, so locally installed tools like `tsc`, `eslint` or `vitest` can be called by name without `npx`.",
      "Pass extra arguments after `--`: `npm test -- --watch` sends `--watch` to the test tool.",
      "Environment variables available inside scripts include `npm_package_name`, `npm_package_version` and `npm_lifecycle_event` (the script name).",
      "# How it works",
      "You run `npm run build`.",
      "  npm reads package.json, finds `prebuild`, `build` and `postbuild` if they exist.",
      "  It spawns a shell (sh on Linux/macOS, cmd.exe on Windows by default) with `node_modules/.bin` prepended to PATH.",
      "  It runs each in order; if one exits with a non-zero code, npm stops and fails.",
      "Chaining: `&&` runs the next command only if the previous succeeded; tools like `npm-run-all2` or `concurrently` run several scripts in parallel.",
      "# Example walkthrough",
      "Running `npm run build` first triggers `prebuild`, which deletes the dist folder using a Node one-liner (works on every OS).",
      "Then `build` runs `tsc` from `node_modules/.bin`.",
      "Then `postbuild` prints a message.",
      "`npm test -- --coverage` forwards `--coverage` to vitest.",
      "`check` chains lint and test with `&&`, stopping at the first failure.",
      "# Why it matters / when to use",
      "Gives every developer and the CI pipeline the same commands.",
      "Documents how to run, build and test the project in one place.",
      "# Common mistakes",
      "Using Unix-only commands like `rm -rf` or `export X=1`, which break on Windows; use Node one-liners, `rimraf`, or `cross-env`.",
      "Installing tools globally and relying on them in scripts; install them as devDependencies so versions are pinned.",
      "Forgetting `--` when passing flags, so npm itself tries to read them.",
      "Adding risky `postinstall` scripts in libraries; many teams install with `--ignore-scripts` for security.",
      "# Say this in the interview",
      "npm scripts are named shell commands in package.json run with npm run. npm puts node_modules/.bin on the PATH, so local tools work without global installs, runs pre and post hooks automatically, and fails if a command exits non-zero. Arguments after a double dash are forwarded to the tool. They give the team and CI one consistent set of commands.",
    ],
    code: `// package.json
// {
//   "scripts": {
//     "prebuild": "node -e \\"require('fs').rmSync('dist',{recursive:true,force:true})\\"",
//     "build": "tsc -p tsconfig.json",
//     "postbuild": "node -e \\"console.log('build finished')\\"",
//     "test": "vitest run",
//     "lint": "eslint .",
//     "check": "npm run lint && npm test"
//   }
// }

// $ npm run build
// → (prebuild) dist folder removed
// → (build)    tsc compiles TypeScript into dist/
// → (postbuild) build finished

// $ npm test -- --coverage   → runs: vitest run --coverage
// $ npm run check            → stops at lint if lint fails (non-zero exit)
// $ npm run                  → lists all available scripts

// Inside any script, npm sets helpful env vars:
console.log(process.env.npm_lifecycle_event); // → e.g. build
console.log(process.env.npm_package_version); // → e.g. 1.3.0`,
  },
  {
    id: 'npm-vs-npx',
    group: 'Modules & npm',
    stars: 1,
    difficulty: 'Easy',
    q: 'What is the difference between npm and npx?',
    a: [
      "# ELI5",
      "npm is like buying a tool and putting it in your toolbox to keep.",
      "npx is like borrowing a tool from a rental shop, using it once, and returning it — or grabbing the one already in your toolbox if you have it.",
      "Back to tech: npm installs and manages packages; npx runs a package's command, using the local copy if installed, or downloading it temporarily if not.",
      "# What it is",
      "npm (Node Package Manager) — installs, updates, removes and publishes packages, and runs scripts. It ships with Node.",
      "npx (package runner) — executes a command from a package; also ships with npm (since 5.2). Since npm 7 it is backed by `npm exec`.",
      "Comparison row — main job: npm manages dependencies; npx runs binaries.",
      "Comparison row — installs permanently: npm yes (into node_modules or globally); npx no, it uses a temporary cache when the package is not installed.",
      "Comparison row — typical commands: `npm install zod`, `npm run build`; `npx tsc --init`, `npx create-next-app@latest my-app`.",
      "npx first looks in the project's `node_modules/.bin`, then in the PATH, and only then offers to download the package (it asks for confirmation unless you pass `--yes`).",
      "# How it works",
      "`npx eslint .` → finds `node_modules/.bin/eslint` in your project and runs it with your pinned version.",
      "`npx cowsay hi` when not installed → npm downloads cowsay into its cache, runs it, and does not add it to package.json.",
      "`npx pkg@version` → runs a specific version, useful for project generators.",
      "# Example walkthrough",
      "The comments show the common commands and their effect.",
      "Generators like `create-next-app` are run with npx so you always use the latest version without a global install.",
      "The `-p` flag lets you pick the package when its command name differs.",
      "# Why it matters / when to use",
      "Use npx for one-off tools and generators, and to run local project tools without global installs.",
      "Avoid global installs in general, so each project controls its own tool versions.",
      "# Common mistakes",
      "Installing tools globally (`npm i -g typescript`) and getting version mismatches between projects.",
      "Running `npx` on a mistyped package name; it may download an unexpected (possibly malicious) package. Check the name carefully.",
      "# Say this in the interview",
      "npm is the package manager: it installs and manages dependencies and runs package.json scripts. npx is the package runner: it executes a package's binary, preferring the project's local node_modules/.bin, and otherwise downloads it to a temporary cache without adding it to your project. I use npx for generators like create-next-app and for running local tools without global installs.",
    ],
    code: `# npm — manage packages
npm install zod            # add to dependencies (saved in package.json)
npm install -D typescript  # add to devDependencies
npm run build              # run a script from package.json

# npx — run package binaries
npx tsc --init                         # uses local node_modules/.bin/tsc
npx create-next-app@latest my-app      # downloads temporarily, runs, nothing saved
npx --yes cowsay "hello"               # skip the install prompt
#  _______
# < hello >
#  -------
npx -p typescript tsc --version        # pick the package explicitly
# → Version 5.6.3 (example)
npm exec -- eslint .                   # npx is a shortcut for npm exec`,
  },

  // ───────────────────────── Async Patterns & Errors ─────────────────────────
  {
    id: 'callbacks-promises-async-await',
    group: 'Async Patterns & Errors',
    stars: 5,
    difficulty: 'Easy',
    q: 'Compare callbacks, Promises, and async/await.',
    a: [
      "# ELI5",
      "Callback: you give the pizza shop your phone number and say 'call me when it's ready'.",
      "Promise: the shop gives you a receipt (a token). Later the receipt turns into either a pizza or an apology note, and you decide what to do with each.",
      "async/await: you hold the receipt and simply say 'I'll wait here for it', but the shop keeps serving other customers while you wait.",
      "Back to tech: all three handle results that arrive later; Promises and async/await are newer, easier-to-read ways of doing what callbacks did.",
      "# What it is",
      "Callback — a function you pass to another function to be called when work finishes; Node style is `(err, result) => {}`.",
      "Promise — an object representing a future value, with three states: pending (waiting), fulfilled (has a value) or rejected (has an error). Once settled it never changes.",
      "You react to a Promise with `.then(onValue)`, `.catch(onError)` and `.finally(always)`, and each returns a new Promise, so you can chain.",
      "async/await — syntax built on Promises: an `async` function always returns a Promise, and `await` pauses that function until a Promise settles, giving you the value or throwing the error.",
      "Comparison row — readability: callbacks nest deeply (callback hell); Promises chain flat; async/await reads like normal top-to-bottom code.",
      "Comparison row — error handling: callbacks need `if (err)` in every step; Promises use one `.catch`; async/await uses normal `try/catch`.",
      "Comparison row — combining tasks: callbacks need manual counters; Promises and async/await have `Promise.all`, `allSettled`, `race`, `any`.",
      "Comparison row — still used where: callbacks for events and old APIs; Promises in libraries; async/await in most modern application code.",
      "# How it works",
      "A callback-based API calls your function from the event loop when the I/O finishes.",
      "A Promise wraps that: `resolve(value)` or `reject(error)` settles it, and `.then` handlers run as microtasks.",
      "`await p`:",
      "  If `p` is pending, the async function is suspended and control returns to the caller.",
      "  When `p` settles, the rest of the function is queued as a microtask and resumes.",
      "  If `p` rejected, `await` throws, so `try/catch` catches it.",
      "# Example walkthrough",
      "The same task — read a config file then parse it — is written three ways.",
      "The callback version checks `err` manually and nests the logic in the callback.",
      "The Promise version chains `.then` and has a single `.catch`.",
      "The async/await version uses `try/catch` and reads top to bottom.",
      "All three print the same `name` value from package.json.",
      "# Why it matters / when to use",
      "Modern Node APIs offer Promise versions (`node:fs/promises`, `node:timers/promises`, `node:stream/promises`), so async/await is the default for new code.",
      "You still need callbacks for event listeners and some older libraries, and Promises directly for combinators.",
      "# Common mistakes",
      "Forgetting `await`, so you get a pending Promise instead of the value.",
      "Awaiting independent tasks one by one (slow); use `Promise.all` to run them concurrently.",
      "Using `await` inside `array.forEach`; forEach does not wait. Use `for...of` or `Promise.all(array.map(...))`.",
      "Mixing styles, e.g. calling a callback and also returning a Promise, leading to double handling.",
      "# Say this in the interview",
      "Callbacks are functions called when an operation completes, using the error-first convention in Node, but they nest badly and need error checks at each step. Promises represent a future value with pending, fulfilled and rejected states, can be chained and combined, and centralize errors with catch. async/await is syntax over Promises that lets async code read like sync code with try/catch. I use async/await by default and Promise combinators for parallel work.",
      "  Follow-up: What does an async function return? — Always a Promise; returning a value resolves it and throwing rejects it.",
    ],
    code: `// three-styles.cjs — run in a folder that has a package.json
const fs = require('node:fs');
const fsp = require('node:fs/promises');

// 1) Callback (error-first)
fs.readFile('package.json', 'utf8', (err, text) => {
  if (err) return console.error('cb error', err.message);
  console.log('callback:', JSON.parse(text).name);
});

// 2) Promise chain
fsp.readFile('package.json', 'utf8')
  .then((text) => JSON.parse(text))
  .then((pkg) => console.log('promise:', pkg.name))
  .catch((err) => console.error('promise error', err.message));

// 3) async/await
async function main() {
  try {
    const pkg = JSON.parse(await fsp.readFile('package.json', 'utf8'));
    console.log('await:', pkg.name);
  } catch (err) {
    console.error('await error', err.message);
  }
}
main();
// → callback: my-app / promise: my-app / await: my-app (order may vary)`,
  },
  {
    id: 'error-handling',
    group: 'Async Patterns & Errors',
    stars: 5,
    difficulty: 'Medium',
    q: 'How do you handle errors properly in Node.js?',
    a: [
      "# ELI5",
      "In a factory, each worker checks their own part; if something is wrong they put a red tag on it and pass it to the quality desk, which decides to fix it, return it, or stop the line.",
      "Back to tech: every async step must either handle its error or pass it up; one central handler turns errors into proper responses and logs, and truly broken states shut the process down.",
      "# What it is",
      "Errors in Node arrive in different ways, and each needs its own handling:",
      "  Synchronous code: thrown with `throw`, caught with `try/catch`.",
      "  Promises / async functions: rejected Promises, caught with `try/catch` around `await` or `.catch()`.",
      "  Callbacks: passed as the first `err` argument; you must check it.",
      "  EventEmitters and streams: emitted as an 'error' event; you must listen for it.",
      "Always throw or reject with `Error` objects (or subclasses), never strings, so you keep a stack trace — the list of function calls that led to the error.",
      "Custom error classes (e.g. `NotFoundError`, `ValidationError`) carry a status code and an `isOperational` flag to separate expected failures from bugs.",
      "`cause` — a standard option (`new Error(msg, { cause: err })`) that wraps a lower-level error while keeping the original.",
      "Centralized error handler — one place (e.g. Express error middleware) that logs errors and turns them into HTTP responses.",
      "Process-level safety net — `process.on('unhandledRejection')` and `process.on('uncaughtException')` log the problem and shut down gracefully.",
      "# How it works",
      "In each layer:",
      "  Validate input early and throw a clear `ValidationError`.",
      "  Wrap lower-level errors with context: `throw new DbError('load user failed', { cause: err })`.",
      "  Do not swallow errors with empty catch blocks.",
      "In the HTTP layer:",
      "  Route handlers let errors propagate (Express 5 forwards rejected async handlers automatically; in Express 4 call `next(err)`).",
      "  The error middleware maps known errors to status codes (400, 404, 409) and unknown ones to 500 with a generic message.",
      "  Logs include the stack and a request ID, but responses never leak internal details.",
      "At the process level: log, stop accepting new requests, close resources, and exit with a non-zero code so the orchestrator restarts a clean process.",
      "# Example walkthrough",
      "`AppError` extends `Error` with `status` and `isOperational`; `NotFoundError` sets 404.",
      "The `/users/:id` handler throws `NotFoundError` for unknown ids; Express 5 sends it to the error middleware.",
      "The error middleware (four parameters) logs it and replies with JSON and the right status.",
      "An unexpected bug (like a TypeError) falls into the 500 branch with a generic message.",
      "The process handlers at the bottom log and exit for anything that escaped.",
      "# Why it matters / when to use",
      "Unhandled errors crash Node processes or leave them in a broken state.",
      "Consistent error responses make APIs predictable for clients.",
      "Good logging with context drastically shortens debugging in production.",
      "# Common mistakes",
      "Empty `catch {}` blocks that hide failures.",
      "Throwing strings (`throw 'oops'`), losing the stack trace.",
      "Forgetting `await` inside `try`, so the rejection escapes the `try/catch`.",
      "Not attaching 'error' listeners on streams or sockets, crashing the process.",
      "Sending `err.stack` to clients, leaking internal details.",
      "# Say this in the interview",
      "I handle errors at the right level for each style: try/catch for sync and awaited code, catch for Promises, checking err in callbacks, and error listeners on emitters and streams. I throw Error subclasses with status codes and an operational flag, wrap low-level errors with cause, and use one centralized handler that logs with context and returns safe responses. As a last resort, unhandledRejection and uncaughtException handlers log and trigger a graceful shutdown so a fresh process is started.",
      "  Follow-up: Why exit after uncaughtException? — The app may be in an unknown, inconsistent state, so restarting is safer than continuing.",
    ],
    code: `// errors.mjs — npm i express@5
import express from 'express';

class AppError extends Error {
  constructor(message, status = 500, options) {
    super(message, options);            // options may contain { cause }
    this.name = this.constructor.name;
    this.status = status;
    this.isOperational = true;          // expected, safe to show
  }
}
class NotFoundError extends AppError {
  constructor(what) { super(what + ' not found', 404); }
}

const app = express();
app.get('/users/:id', async (req, res) => {
  if (req.params.id !== '1') throw new NotFoundError('User'); // Express 5 forwards it
  res.json({ id: 1, name: 'Asha' });
});

// Centralized error middleware (4 params)
app.use((err, req, res, next) => {
  console.error(err);                             // log full details
  const status = err.isOperational ? err.status : 500;
  const message = err.isOperational ? err.message : 'Internal Server Error';
  res.status(status).json({ error: message });    // → {"error":"User not found"} (404)
});

process.on('unhandledRejection', (r) => { console.error('unhandled', r); process.exit(1); });
app.listen(3000);`,
  },
  {
    id: 'promise-combinators',
    group: 'Async Patterns & Errors',
    stars: 5,
    difficulty: 'Medium',
    q: 'Explain `Promise.all`, `allSettled`, `race`, and `any`.',
    a: [
      "# ELI5",
      "You send four friends to buy party items.",
      "`all`: the party starts only when everyone is back; if anyone fails, the party is cancelled right away.",
      "`allSettled`: wait for everyone to return, then look at who succeeded and who failed.",
      "`race`: react to whoever comes back first, whether with the item or with bad news.",
      "`any`: react to the first friend who comes back with the item; only give up if all of them fail.",
      "Back to tech: these four static methods take many Promises and combine them into one Promise with different rules.",
      "# What it is",
      "A combinator is a function that combines several Promises into one.",
      "All four take an iterable (e.g. an array) of Promises and start nothing themselves — the work already started when you created the Promises.",
      "`Promise.all(ps)` — fulfills with an array of all values in the original order when every Promise fulfills; rejects as soon as any one rejects (fail-fast) with that error.",
      "`Promise.allSettled(ps)` — never rejects; waits for all, then fulfills with objects like `{ status: 'fulfilled', value }` or `{ status: 'rejected', reason }`.",
      "`Promise.race(ps)` — settles the same way as the first Promise to settle, success or failure.",
      "`Promise.any(ps)` — fulfills with the first successful value; rejects only if all reject, with an `AggregateError` containing every error in `.errors`.",
      "Comparison row — all: wait for all, fail-fast; use when you need every result.",
      "Comparison row — allSettled: wait for all, never fails; use for batch jobs or reports of partial success.",
      "Comparison row — race: first to settle; use for timeouts.",
      "Comparison row — any: first success; use for redundant sources or mirrors.",
      "Empty array edge cases: `all([])` and `allSettled([])` fulfill with `[]`; `any([])` rejects with AggregateError; `race([])` stays pending forever.",
      "# How it works",
      "Each combinator attaches `.then` handlers to every input Promise.",
      "  It keeps counters and a results array.",
      "  It settles its own Promise when its rule is met (all done, first done, first success, or first failure).",
      "  The other Promises keep running — combinators do not cancel them; use AbortController for real cancellation.",
      "# Example walkthrough",
      "`delay(ms, value, fail)` creates a Promise that resolves or rejects after `ms`.",
      "`all` with one failure rejects with 'B failed' after 200 ms, even though C is still running.",
      "`allSettled` returns the status of all three after 300 ms.",
      "`race` gives 'A' because A settles first at 100 ms.",
      "`any` skips the failure and gives the first success, 'A'.",
      "The last example uses `race` to build a timeout around a slow request.",
      "# Why it matters / when to use",
      "Loading a dashboard: fetch user, orders and notifications in parallel with `all`.",
      "Sending 1,000 emails and reporting which failed: `allSettled`.",
      "Request timeout: `race` with a timer, or better, `AbortSignal.timeout(ms)`.",
      "Fastest of several replicas or CDNs: `any`.",
      "# Common mistakes",
      "Expecting `Promise.all` to cancel the others on failure; they continue running in the background.",
      "Passing functions instead of Promises (`Promise.all([fn1, fn2])`); call them: `[fn1(), fn2()]`.",
      "Using `Promise.all` on thousands of tasks at once, overloading the DB; limit concurrency with a pool like `p-limit`.",
      "Using `race` for timeouts but forgetting the losing request still uses resources.",
      "# Say this in the interview",
      "Promise.all waits for all Promises and returns their values in order, but rejects on the first failure. allSettled waits for all and never rejects, giving a status for each. race settles with whichever Promise settles first, which is handy for timeouts. any returns the first success and only rejects with an AggregateError if all fail. None of them cancel the remaining work, so for real cancellation I use AbortController.",
      "  Follow-up: How do you run 1,000 requests without overloading the server? — Process them with a concurrency limit, e.g. `p-limit` or a worker-pool loop, instead of one giant `Promise.all`.",
    ],
    code: `// combinators.mjs
const delay = (ms, value, fail = false) =>
  new Promise((resolve, reject) =>
    setTimeout(() => (fail ? reject(new Error(value + ' failed')) : resolve(value)), ms));

const make = () => [delay(100, 'A'), delay(200, 'B', true), delay(300, 'C')];

try { await Promise.all(make()); }
catch (e) { console.log('all ->', e.message); }        // → all -> B failed

console.log('allSettled ->', await Promise.allSettled(make()));
// → [ {status:'fulfilled',value:'A'}, {status:'rejected',reason:Error: B failed},
//     {status:'fulfilled',value:'C'} ]

console.log('race ->', await Promise.race(make()));    // → race -> A
console.log('any ->', await Promise.any(make()));      // → any -> A

try { await Promise.any([delay(10, 'X', true), delay(20, 'Y', true)]); }
catch (e) { console.log(e.constructor.name, e.errors.length); } // → AggregateError 2

// Timeout pattern with race
const timeout = (ms) => new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms));
try { await Promise.race([delay(5000, 'slow'), timeout(500)]); }
catch (e) { console.log(e.message); }                  // → timeout`,
  },
  {
    id: 'uncaught-exception-unhandled-rejection',
    group: 'Async Patterns & Errors',
    stars: 4,
    difficulty: 'Medium',
    q: 'What are `uncaughtException` and `unhandledRejection`, and how should you handle them?',
    a: [
      "# ELI5",
      "A circus has a safety net under the trapeze. If an acrobat falls, the net catches them, but the show stops so a doctor can check them before they perform again.",
      "Back to tech: these two events are Node's safety net for errors nobody caught. You use them to log and shut down cleanly, not to keep performing as if nothing happened.",
      "# What it is",
      "`uncaughtException` — an event on `process` emitted when a synchronous error is thrown and no `try/catch` catches it, all the way up the call stack, including errors thrown inside callbacks.",
      "`unhandledRejection` — an event on `process` emitted when a Promise is rejected and no `.catch` or `try/await` handles it by the end of that turn of the event loop.",
      "Default behavior: an uncaught exception prints the stack and exits with code 1.",
      "Since Node 15, an unhandled rejection also crashes the process by default (`--unhandled-rejections=throw`), turning it into an uncaught exception.",
      "If you add an `uncaughtException` listener, Node no longer exits automatically; you are now responsible for exiting.",
      "Why exit: after an unexpected error the app may be in an inconsistent state — half-written data, locks held, connections broken — so continuing is risky.",
      "Process manager — a tool that restarts the process when it dies (PM2, systemd, Docker restart policy, Kubernetes).",
      "# How it works",
      "Recommended handling:",
      "  Log the error with full stack (synchronously, or using a logger that flushes).",
      "  Mark the app unhealthy and stop accepting new requests: `server.close()`.",
      "  Give in-flight requests a short time to finish and close DB connections.",
      "  Exit with a non-zero code: `process.exit(1)`, with a watchdog timer in case shutdown hangs.",
      "  Let the process manager start a fresh instance.",
      "Fix the root cause in code: every Promise should have a handler, every emitter an 'error' listener.",
      "# Example walkthrough",
      "The `shutdown` function logs, closes the server, and exits with code 1.",
      "A watchdog `setTimeout(...).unref()` forces exit after 10 seconds if closing hangs.",
      "Both process events call `shutdown` with a label.",
      "The `/bug` route triggers a rejected Promise that nobody handles, which fires `unhandledRejection` and starts the graceful shutdown.",
      "# Why it matters / when to use",
      "Without these handlers, crashes may leave no useful logs.",
      "With wrong handlers (log and continue), a broken process keeps serving bad responses.",
      "Error tracking tools (Sentry, Datadog) hook into these events.",
      "# Common mistakes",
      "Using `uncaughtException` as a global try/catch and continuing to run.",
      "Calling `process.exit()` immediately without flushing logs, so the error message is lost.",
      "Creating Promises without `.catch` (e.g. fire-and-forget `sendEmail()`); add `.catch(log)`.",
      "# Say this in the interview",
      "uncaughtException fires for synchronous errors that nobody caught, and unhandledRejection fires for rejected Promises without a handler; since Node 15 both crash the process by default. I treat them as a last-resort safety net: log the error with context, stop accepting traffic, close resources with a timeout, and exit non-zero so the process manager restarts a clean instance. I never just log and keep going, because the state may be corrupt.",
    ],
    code: `// safety-net.mjs
import http from 'node:http';

const server = http.createServer((req, res) => {
  if (req.url === '/bug') {
    Promise.reject(new Error('forgot to catch this')); // no .catch → unhandled
  }
  res.end('ok');
}).listen(3000);

function shutdown(kind, err) {
  console.error('[' + kind + ']', err);              // 1) log with stack
  server.close(() => process.exit(1));               // 2) stop new requests, then exit
  setTimeout(() => process.exit(1), 10_000).unref(); // 3) watchdog if close hangs
}

process.on('uncaughtException', (err) => shutdown('uncaughtException', err));
process.on('unhandledRejection', (reason) => shutdown('unhandledRejection', reason));

// curl localhost:3000/bug
// → [unhandledRejection] Error: forgot to catch this
// → process exits with code 1; PM2/Docker/K8s starts a fresh one`,
  },
  {
    id: 'operational-vs-programmer-errors',
    group: 'Async Patterns & Errors',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is the difference between operational errors and programmer errors?',
    a: [
      "# ELI5",
      "If a delivery van gets a flat tire, that is a normal road problem: the driver calls for help, waits or takes another route.",
      "If the van was built with the steering wheel connected to the wrong wheels, that is a factory mistake: you do not keep driving; you send it back to be fixed.",
      "Back to tech: operational errors are expected problems in a correct program (network down, bad input); programmer errors are bugs in the code that must be fixed.",
      "# What it is",
      "Operational errors — failures that can happen even when the code is correct, caused by the outside world.",
      "  Examples: invalid user input, file not found, database timeout, connection refused, 404 from another API, out of disk space.",
      "  Handling: anticipate them and respond — return a 400 or 404, retry with backoff, use a fallback, show a friendly message.",
      "Programmer errors — bugs: the code is wrong.",
      "  Examples: reading a property of undefined, calling a function with the wrong type, a missing `await`, wrong logic, typos in a property name.",
      "  Handling: you cannot recover reliably at runtime; log it, return 500, and in severe cases restart the process; then fix the code.",
      "Comparison row — cause: operational = environment or input; programmer = mistake in code.",
      "Comparison row — expected: operational yes, you plan for them; programmer no.",
      "Comparison row — response: operational = handle, retry, or report to the client; programmer = log, alert, crash or 500, then fix.",
      "Comparison row — prevention: operational = validation, timeouts, retries; programmer = types (TypeScript), tests, linting, code review.",
      "Many teams mark operational errors with a flag like `isOperational = true` on a custom error class.",
      "# How it works",
      "Your centralized error handler checks the error:",
      "  If it is a known operational error, send a meaningful status and message to the client and log at warning level.",
      "  If it is unknown (likely a bug), log at error level with stack, alert, and send a generic 500.",
      "  If it happened outside any request (uncaught), shut down gracefully and let the process manager restart.",
      "# Example walkthrough",
      "`getUser` validates the id (operational: `ValidationError`) and simulates a DB miss (operational: `NotFoundError`).",
      "The `classify` function decides how to respond based on `isOperational`.",
      "Calling with 'abc' gives a 400; calling with '2' gives a 404.",
      "The buggy call reads `.name` of undefined, a TypeError, which is classified as a programmer error and becomes a 500.",
      "# Why it matters / when to use",
      "It tells you which errors to handle in code and which to fix in code.",
      "Retrying a programmer error is pointless; retrying an operational timeout often succeeds.",
      "It guides alerting: spikes in programmer errors mean a bad deploy.",
      "# Common mistakes",
      "Catching every error and returning 400, hiding real bugs.",
      "Crashing the whole process on an expected error like invalid input.",
      "Retrying non-idempotent operations (like charging a card) blindly on any error.",
      "# Say this in the interview",
      "Operational errors are runtime problems a correct program should expect, like invalid input, timeouts or a missing record; I handle them with validation, retries, fallbacks and proper status codes. Programmer errors are bugs, like reading a property of undefined; they cannot be handled meaningfully at runtime, so I log them, return a generic 500 or restart if the state is unsafe, and fix the code. I usually mark operational errors with a custom class and an isOperational flag so the central handler can tell them apart.",
    ],
    code: `// error-kinds.mjs
class AppError extends Error {
  constructor(msg, status) { super(msg); this.status = status; this.isOperational = true; }
}
class ValidationError extends AppError { constructor(m) { super(m, 400); } }
class NotFoundError extends AppError { constructor(m) { super(m, 404); } }

const users = { 1: { name: 'Asha' } };

function getUser(id) {
  if (!/^\\d+$/.test(id)) throw new ValidationError('id must be numeric'); // operational
  const user = users[id];
  if (!user) throw new NotFoundError('user not found');                  // operational
  return user;
}

function classify(fn) {
  try { return { status: 200, body: fn() }; }
  catch (err) {
    if (err.isOperational) return { status: err.status, body: err.message };
    console.error('BUG:', err.message);           // programmer error → alert + fix code
    return { status: 500, body: 'Internal Server Error' };
  }
}

console.log(classify(() => getUser('abc')));      // → { status: 400, body: 'id must be numeric' }
console.log(classify(() => getUser('2')));        // → { status: 404, body: 'user not found' }
console.log(classify(() => users[5].name));       // → BUG: Cannot read properties of undefined ...
                                                  // → { status: 500, body: 'Internal Server Error' }`,
  },
  {
    id: 'callback-hell',
    group: 'Async Patterns & Errors',
    stars: 3,
    difficulty: 'Easy',
    q: 'What is callback hell and how do you avoid it?',
    a: [
      "# ELI5",
      "Imagine instructions like: 'Go to the shop, and when you get there, buy eggs, and when you have the eggs, go home, and when you are home, crack them, and when...' — each step tucked inside the last one.",
      "It quickly becomes a giant staircase of sentences that is hard to read and easy to get wrong.",
      "Back to tech: callback hell is deeply nested callbacks, where each async step lives inside the previous step's callback.",
      "# What it is",
      "Callback hell (or the pyramid of doom) — code shaped like a sideways triangle because each async operation is nested inside the callback of the one before.",
      "Problems it causes:",
      "  Hard to read and change; the logic drifts to the right.",
      "  Error handling repeated at every level (`if (err) return cb(err)`), easy to forget.",
      "  Hard to run steps in parallel or add retries, timeouts and loops.",
      "  Risk of calling a callback twice or never.",
      "Fixes:",
      "  Use Promises and async/await (the main modern fix).",
      "  Convert old callback APIs with `util.promisify` or use the built-in Promise versions (`node:fs/promises`).",
      "  Split nested steps into small named functions.",
      "  Use `Promise.all` for independent steps.",
      "# How it works",
      "With callbacks, the only way to say 'after A, do B' is to put B inside A's callback, so every step adds a level.",
      "With Promises, each `.then` returns a new Promise, so steps chain flat.",
      "With async/await, each `await` simply sits on its own line, and one `try/catch` covers all of them.",
      "# Example walkthrough",
      "The first version reads a user, then their orders, then saves a report, each nested in the previous callback, with three error checks.",
      "The second version does the same with `await` on three lines and one `try/catch`.",
      "Both print 'report saved for Asha with 2 orders'.",
      "# Why it matters / when to use",
      "You will meet callback-style code in older codebases and libraries; knowing how to refactor it is a common task.",
      "Flat async code is easier to test, review and debug.",
      "# Common mistakes",
      "Refactoring to Promises but still nesting `.then` inside `.then`; return the Promise and chain instead.",
      "Forgetting `return` before `cb(err)`, so the code continues after an error.",
      "Turning every step sequential with `await` when some could run in parallel.",
      "# Say this in the interview",
      "Callback hell is the deeply nested, pyramid-shaped code you get when each async step is written inside the previous step's callback; it is hard to read and error handling gets repeated everywhere. I avoid it by using Promises and async/await, promisifying old APIs with util.promisify, splitting steps into small named functions, and using Promise.all for independent work.",
    ],
    code: `// callback-hell.mjs
const db = {
  getUser: (id, cb) => setTimeout(() => cb(null, { id, name: 'Asha' }), 10),
  getOrders: (u, cb) => setTimeout(() => cb(null, [1, 2]), 10),
  saveReport: (r, cb) => setTimeout(() => cb(null), 10),
};

// BAD: Pyramid of doom
db.getUser(1, (err, user) => {
  if (err) return console.error(err);
  db.getOrders(user, (err, orders) => {
    if (err) return console.error(err);
    db.saveReport({ user, orders }, (err) => {
      if (err) return console.error(err);
      console.log('report saved for', user.name, 'with', orders.length, 'orders');
    });
  });
});

// GOOD: Flat with promisify + async/await
import { promisify } from 'node:util';
const getUser = promisify(db.getUser), getOrders = promisify(db.getOrders);
const saveReport = promisify(db.saveReport);
try {
  const user = await getUser(1);
  const orders = await getOrders(user);
  await saveReport({ user, orders });
  console.log('report saved for', user.name, 'with', orders.length, 'orders');
} catch (err) { console.error(err); }
// → report saved for Asha with 2 orders   (printed twice, once per style)`,
  },
  {
    id: 'error-first-callback',
    group: 'Async Patterns & Errors',
    stars: 3,
    difficulty: 'Easy',
    q: 'What is the error-first callback pattern?',
    a: [
      "# ELI5",
      "When a teacher returns your test, the first thing on the page says either 'Problem!' or 'All good'. Only if it is all good do you look at your marks below.",
      "Back to tech: in Node's classic callbacks, the first argument is the error (or null), and the result comes after it.",
      "# What it is",
      "Error-first callback (also called a Node-style callback or 'errback') — a convention where async functions call your callback as `callback(err, result)`.",
      "If something failed, `err` is an Error object and you should ignore the other arguments.",
      "If it succeeded, `err` is `null` (or undefined) and the result follows in the next argument(s).",
      "The callback is usually the last parameter of the function: `fs.readFile(path, options, callback)`.",
      "Rules for writing such APIs:",
      "  Call the callback exactly once.",
      "  Always call it asynchronously (never sometimes sync, sometimes async) — mixing them is nicknamed 'releasing Zalgo' and causes ordering bugs.",
      "  Pass `Error` objects, not strings.",
      "This consistency is what allows `util.promisify` to convert any such function into a Promise-returning one automatically.",
      "# How it works",
      "Caller passes a function `(err, data) => {...}`.",
      "  The async function does its work.",
      "  On failure, it calls `cb(new Error(...))`.",
      "  On success, it calls `cb(null, data)`.",
      "  The caller checks `if (err)` first and returns early, otherwise uses `data`.",
      "# Example walkthrough",
      "`divideLater` follows the pattern: it uses `process.nextTick` so the callback is always async.",
      "Dividing by zero calls back with an Error; the caller prints 'error: cannot divide by zero'.",
      "Dividing 10 by 2 calls back with `null` and 5; the caller prints 'result: 5'.",
      "The `promisify` line shows how the same function becomes `await`-able for free.",
      "# Why it matters / when to use",
      "Most older Node core APIs and many npm packages use it.",
      "Recognizing it lets you safely wrap old APIs into Promises.",
      "# Common mistakes",
      "Not checking `err` and using `data` blindly.",
      "Forgetting `return` in `if (err) return cb(err)`, so the success path also runs.",
      "Throwing inside an async callback instead of passing the error; a throw there cannot be caught by the caller's try/catch.",
      "Calling the callback twice, e.g. once in a catch and once after it.",
      "# Say this in the interview",
      "In the error-first callback pattern, the callback's first argument is an Error or null, and results follow. The caller always checks the error first and returns early. A well-behaved API calls the callback exactly once and always asynchronously. Because it is a consistent convention, util.promisify can turn these functions into Promise-based ones.",
    ],
    code: `// error-first.mjs
import { promisify } from 'node:util';

function divideLater(a, b, cb) {
  process.nextTick(() => {             // always async, never sometimes-sync
    if (b === 0) return cb(new Error('cannot divide by zero'));
    cb(null, a / b);                   // err = null means success
  });
}

divideLater(10, 0, (err, result) => {
  if (err) return console.log('error:', err.message); // → error: cannot divide by zero
  console.log('result:', result);
});

divideLater(10, 2, (err, result) => {
  if (err) return console.log('error:', err.message);
  console.log('result:', result);                      // → result: 5
});

const divideAsync = promisify(divideLater);
console.log('awaited:', await divideAsync(9, 3));      // → awaited: 3`,
  },
  {
    id: 'util-promisify',
    group: 'Async Patterns & Errors',
    stars: 3,
    difficulty: 'Easy',
    q: 'What does `util.promisify` do?',
    a: [
      "# ELI5",
      "You have an old phone that only rings you back (a callback). promisify is an adapter that gives you a receipt instead, so you can wait for it the modern way.",
      "Back to tech: `util.promisify` takes a function that uses an error-first callback and returns a new function that returns a Promise.",
      "# What it is",
      "`util.promisify(fn)` is a helper in the built-in `node:util` module.",
      "Input: a function whose last parameter is an error-first callback `(err, value) => {}`.",
      "Output: a function with the same parameters minus the callback, which returns a Promise.",
      "  If the callback gets an `err`, the Promise rejects with it.",
      "  Otherwise it resolves with the value.",
      "Some functions call back with several values; for those, the function can define a custom version using `util.promisify.custom` (e.g. `setTimeout`, `dns.lookup` and `exec` do this).",
      "`util.callbackify` does the opposite: turns an async function into a callback-style function.",
      "Today many core modules already have Promise versions: `node:fs/promises`, `node:dns/promises`, `node:timers/promises`, `node:stream/promises`, so promisify is mainly for third-party or your own old code.",
      "# How it works",
      "promisify returns a wrapper function.",
      "  When called, the wrapper creates a new Promise.",
      "  It calls the original function with your arguments plus an extra callback it made.",
      "  That callback calls `reject(err)` or `resolve(value)`.",
      "  If the original function uses `this`, bind it first: `promisify(obj.method).bind(obj)` or `promisify(obj.method.bind(obj))`.",
      "# Example walkthrough",
      "We promisify the classic `fs.stat` and await it to print a file size.",
      "`execAsync` (promisified `child_process.exec`) resolves with `{ stdout, stderr }` thanks to its custom promisify version.",
      "A failing call (stat on a missing file) rejects, so the `catch` prints the ENOENT code — 'Error NO ENTry', meaning file not found.",
      "The hand-written `myPromisify` shows the idea in a few lines.",
      "# Why it matters / when to use",
      "Lets you use async/await with callback-only libraries without rewriting them.",
      "Removes callback hell in legacy code.",
      "# Common mistakes",
      "Promisifying a method without binding `this`, causing 'Cannot read properties of undefined'.",
      "Using promisify on a function that is not error-first (e.g. callback is not last, or first arg is not an error).",
      "Promisifying functions that call the callback many times (like event-style APIs); a Promise settles only once.",
      "# Say this in the interview",
      "util.promisify converts a function that takes an error-first callback as its last argument into one that returns a Promise, rejecting on err and resolving with the value. It lets me use async/await with old callback APIs. I remember to bind methods that use this, and I prefer built-in promise modules like fs/promises when they exist.",
    ],
    code: `// promisify.mjs
import { promisify } from 'node:util';
import fs from 'node:fs';
import { exec } from 'node:child_process';

const stat = promisify(fs.stat);
const execAsync = promisify(exec); // has a custom version → { stdout, stderr }

const info = await stat(new URL(import.meta.url));
console.log('size bytes:', info.size);               // → size bytes: 812 (example)

const { stdout } = await execAsync('node --version');
console.log('node is', stdout.trim());               // → node is v22.11.0 (example)

try { await stat('/no/such/file'); }
catch (err) { console.log(err.code); }                // → ENOENT

// How promisify works, in a few lines:
const myPromisify = (fn) => (...args) =>
  new Promise((resolve, reject) =>
    fn(...args, (err, value) => (err ? reject(err) : resolve(value))));
console.log((await myPromisify(fs.readdir)('.')).length >= 0); // → true`,
  },
  {
    id: 'abortcontroller',
    group: 'Async Patterns & Errors',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do you cancel async operations and add timeouts in Node?',
    a: [
      "# ELI5",
      "When you order food on an app, you get a 'Cancel order' button. Pressing it tells the restaurant, the driver and the payment system to stop.",
      "Back to tech: an AbortController is that cancel button; you give its signal to async operations, and calling `abort()` tells all of them to stop.",
      "# What it is",
      "`AbortController` — a built-in global class with a `signal` property and an `abort(reason)` method.",
      "`AbortSignal` — the object you pass to operations; it has `aborted` (boolean), `reason`, and fires an 'abort' event.",
      "Many APIs accept `{ signal }`: `fetch`, `fs.readFile`, `timers/promises` (`setTimeout`), `stream.pipeline`, `events.once`, `child_process.spawn`, and many libraries.",
      "When aborted, these operations reject with an error whose `name` is 'AbortError' (or with the reason you passed, e.g. 'TimeoutError' for timeouts).",
      "`AbortSignal.timeout(ms)` — creates a signal that aborts by itself after `ms` milliseconds; the easiest way to add a timeout.",
      "`AbortSignal.any([s1, s2])` — combines signals: aborts when any of them aborts (Node 20+), e.g. user cancellation plus a timeout.",
      "Why not just `Promise.race` with a timer: race only stops waiting; the underlying request keeps running and using resources. An abort signal actually stops the work.",
      "# How it works",
      "Create a controller (or use `AbortSignal.timeout`).",
      "  Pass `controller.signal` into each operation.",
      "  The operation checks `signal.aborted` and listens for the 'abort' event to clean up (close the socket, stop reading).",
      "  Calling `controller.abort()` sets `aborted = true`, fires the event, and the operation rejects.",
      "  Your `try/catch` checks `err.name` to tell a cancellation apart from a real failure.",
      "In your own functions, accept a `signal` option, call `signal.throwIfAborted()` between steps, and pass the signal down.",
      "# Example walkthrough",
      "Example 1: `fetch` with `AbortSignal.timeout(2000)` against a slow URL rejects with a TimeoutError after 2 seconds.",
      "Example 2: a manual controller cancels a `timers/promises` sleep after 100 ms; the error name is AbortError.",
      "Example 3: `AbortSignal.any` combines a user-cancel signal with a timeout.",
      "Example 4: a custom loop checks `signal.throwIfAborted()` on each step and passes the signal into its sleep, so the 1-second timeout stops it during item 4.",
      "# Why it matters / when to use",
      "Every outgoing HTTP call in a backend should have a timeout, or one slow dependency can pile up requests and exhaust resources.",
      "Cancel downstream work when the client disconnects (`req.on('close')`), saving DB and CPU.",
      "Stop long jobs during graceful shutdown.",
      "# Common mistakes",
      "Using `fetch` without a timeout; Node's fetch has no short default timeout.",
      "Reusing an already aborted controller; create a new one for each operation.",
      "Treating every AbortError as a failure to alert on; often it is an expected cancellation.",
      "# Say this in the interview",
      "I use AbortController and AbortSignal, which are built into Node. I pass a signal to fetch, fs, timers, streams or my own functions, and calling abort makes them stop and reject with an AbortError. For timeouts I use AbortSignal.timeout, and AbortSignal.any to combine a timeout with user cancellation. Unlike Promise.race, this actually stops the underlying work instead of just ignoring it.",
    ],
    code: `// abort.mjs
import { setTimeout as sleep } from 'node:timers/promises';

// 1) Timeout for fetch
try {
  await fetch('https://httpbin.org/delay/5', { signal: AbortSignal.timeout(2000) });
} catch (err) {
  console.log(err.name); // → TimeoutError (after ~2 s)
}

// 2) Manual cancel
const ac = new AbortController();
setTimeout(() => ac.abort(), 100);
try { await sleep(5000, null, { signal: ac.signal }); }
catch (err) { console.log(err.name); } // → AbortError

// 3) Combine user-cancel + timeout (Node 20+)
const user = new AbortController();
const signal = AbortSignal.any([user.signal, AbortSignal.timeout(1000)]);

// 4) Make your own function cancellable
async function processItems(items, { signal }) {
  for (const item of items) {
    signal.throwIfAborted();   // stop early if cancelled
    await sleep(300, null, { signal }); // pretend work; also cancellable
    console.log('done', item);
  }
}
try { await processItems([1, 2, 3, 4, 5], { signal }); }
catch (err) { console.log('stopped:', err.name); }
// → done 1 / done 2 / done 3 / stopped: AbortError  (timeout hit at 1 s)`,
  },
  {
    id: 'concurrency-limiting',
    group: 'Async Patterns & Errors',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do you limit concurrency when processing many async tasks?',
    a: [
      "# ELI5",
      "A bank has 3 counters. Even if 100 customers arrive, only 3 are served at once; the rest wait in line and move up as soon as a counter is free.",
      "Back to tech: a concurrency limit means only N async tasks run at the same time; the rest wait until a slot frees up.",
      "# What it is",
      "Concurrency limit — the maximum number of tasks allowed to be in progress at once.",
      "Running everything at once (`Promise.all(items.map(doWork))`) with thousands of items can:",
      "  exhaust the DB connection pool or open file limits,",
      "  trigger rate limits (HTTP 429 — too many requests) from external APIs,",
      "  use too much memory.",
      "Running one by one (`for...of` with `await`) is safe but slow.",
      "A limit gives the best of both: fast, but controlled.",
      "Common tools: the `p-limit` package, `p-map` with a `concurrency` option, a hand-written worker pool, or batching.",
      "Batching (chunks of N with `Promise.all` each) is simpler but slower: the next batch waits for the slowest task of the current batch.",
      "A worker pool keeps exactly N tasks running at all times, so it is more efficient.",
      "# How it works",
      "Worker pool approach:",
      "  Create N 'workers' — async functions that loop.",
      "  Each worker takes the next index from a shared counter, processes that item, and repeats until none are left.",
      "  `Promise.all` on the N workers resolves when all items are done.",
      "  Results are stored by index so the output order matches the input.",
      "Because JavaScript runs on one thread, `next++` on the shared counter is safe — no two workers can run that line at the same instant.",
      "# Example walkthrough",
      "`mapWithLimit(items, 3, fn)` starts 3 workers.",
      "Each fake task takes 100 ms; 10 items with a limit of 3 finish in about 400 ms (4 rounds), not 1,000 ms (sequential) and without 10 at once.",
      "The `active` counter shows that no more than 3 tasks ever run at the same time.",
      "The comment shows the same thing with `p-limit`.",
      "# Why it matters / when to use",
      "Bulk imports, sending emails, calling third-party APIs, resizing many images, migrations over many rows.",
      "Respecting a partner API's rate limit or your own DB pool size.",
      "# Common mistakes",
      "Creating all Promises first and then 'limiting' them; the work already started when you created them. Limit the function calls, not the Promises.",
      "Choosing a limit larger than the DB pool size, so tasks just wait for connections anyway.",
      "Letting one failure stop everything when you wanted partial success; catch per item or use allSettled-style results.",
      "# Say this in the interview",
      "Instead of firing thousands of promises with Promise.all, I cap how many run at once. I either use a library like p-limit or p-map with a concurrency option, or write a small worker pool where N async workers pull the next item from a shared index until the list is empty. That protects databases and external APIs and controls memory, while still being much faster than strictly sequential processing.",
    ],
    code: `// limit.mjs
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let active = 0, maxActive = 0;

async function fakeTask(n) {
  active++; maxActive = Math.max(maxActive, active);
  await sleep(100);            // pretend API call
  active--;
  return n * 2;
}

async function mapWithLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;                              // shared index (safe: one JS thread)
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

const t0 = Date.now();
const out = await mapWithLimit([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3, fakeTask);
console.log(out);                    // → [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]
console.log('max at once:', maxActive);          // → max at once: 3
console.log('ms:', Date.now() - t0);             // → ms: ~400

// Same with a library: import pLimit from 'p-limit';
// const limit = pLimit(3);
// await Promise.all(items.map((x) => limit(() => fakeTask(x))));`,
  },
  {
    id: 'async-iteration',
    group: 'Async Patterns & Errors',
    stars: 2,
    difficulty: 'Medium',
    q: 'What are async iterators and `for await...of`?',
    a: [
      "# ELI5",
      "A normal loop is like reading a book where all pages are already printed.",
      "An async loop is like reading a comic that arrives one page per day in the mail: you read a page, wait for the next one to arrive, then read it.",
      "Back to tech: `for await...of` loops over values that arrive over time, waiting for each one before running the loop body.",
      "# What it is",
      "Iterator — an object with a `next()` method that returns `{ value, done }`, used by `for...of`.",
      "Async iterator — the same, but `next()` returns a Promise of `{ value, done }`.",
      "Async iterable — an object with a `[Symbol.asyncIterator]()` method that returns an async iterator.",
      "`for await (const x of source)` — calls `next()`, awaits it, runs the body, and repeats until `done` is true; it can only be used inside async functions or ESM top level.",
      "Async generator — `async function*` that can both `await` and `yield`; the easiest way to create an async iterable.",
      "Built-in async iterables in Node:",
      "  Readable streams (`fs.createReadStream`, HTTP request bodies) yield chunks.",
      "  `readline.createInterface({ input })` yields lines.",
      "  `events.on(emitter, 'name')` yields events.",
      "  `setInterval` from `node:timers/promises` yields on each tick.",
      "  `fs.promises.opendir` yields directory entries.",
      "# How it works",
      "The loop calls `[Symbol.asyncIterator]()` once to get an iterator.",
      "  Each round it awaits `iterator.next()`.",
      "  If `done` is false, it runs the body with `value`, then loops.",
      "  If you `break`, `return` or throw, the loop calls `iterator.return()`, so streams get closed and generators run their `finally` blocks.",
      "  For streams, the loop also handles backpressure — reading the next chunk only after your body finishes — so memory stays low.",
      "# Example walkthrough",
      "`fetchPages` is an async generator that simulates a paginated API, yielding one page of users at a time.",
      "The first loop prints each page as it arrives.",
      "The second part reads a file line by line with `readline` and counts lines, without loading the whole file into memory.",
      "Breaking out early from the generator triggers its `finally`, printing 'cleanup'.",
      "# Why it matters / when to use",
      "Processing large files, CSVs or log files line by line.",
      "Paginating through APIs or database cursors with clean code.",
      "Consuming streams in a readable way with built-in backpressure.",
      "# Common mistakes",
      "Using `for await` on an array of Promises when you wanted them to run concurrently; it processes them one by one. Use `Promise.all` for parallelism.",
      "Forgetting that the loop body runs sequentially; slow bodies slow the whole stream.",
      "Not handling errors: wrap the loop in try/catch; stream errors are thrown inside the loop.",
      "# Say this in the interview",
      "An async iterator is like a normal iterator, but next returns a Promise, and for await...of awaits each value in turn. Async generators, written with async function star, are the easiest way to create one. In Node, readable streams, readline, events.on and timers are async iterable, so I use for await to process files line by line or paginate APIs with automatic backpressure and cleanup when I break out of the loop.",
    ],
    code: `// async-iter.mjs
import { createReadStream } from 'node:fs';
import readline from 'node:readline';

async function* fetchPages() {
  try {
    for (let page = 1; page <= 3; page++) {
      await new Promise((r) => setTimeout(r, 50)); // fake API call
      yield [page * 10 + 1, page * 10 + 2];        // one page of user ids
    }
  } finally {
    console.log('cleanup');                       // runs on finish OR break
  }
}

for await (const users of fetchPages()) {
  console.log('page', users);
  if (users[0] === 21) break;                     // stop early
}
// → page [ 11, 12 ]
// → page [ 21, 22 ]
// → cleanup

// Read this file line by line (constant memory, even for huge files)
const rl = readline.createInterface({ input: createReadStream(new URL(import.meta.url)) });
let lines = 0;
for await (const line of rl) lines++;
console.log('lines:', lines);                     // → lines: 28 (this file's line count)`,
  },
  {
    id: 'async-local-storage',
    group: 'Async Patterns & Errors',
    stars: 2,
    difficulty: 'Hard',
    q: 'What is AsyncLocalStorage and when do you use it?',
    a: [
      "# ELI5",
      "At a big hospital, each patient wears a wristband with their ID. Any nurse who touches the patient, in any room, can read the wristband without asking the front desk.",
      "Back to tech: AsyncLocalStorage gives each request its own 'wristband' (context like a request ID) that any code running for that request can read, even across `await`s and callbacks.",
      "# What it is",
      "`AsyncLocalStorage` (ALS) — a class from `node:async_hooks` that stores data tied to the current asynchronous execution flow.",
      "Async context — the chain of operations that started from one place, e.g. everything that happens because of one HTTP request: middleware, DB calls, logs.",
      "It is like thread-local storage in Java or Go's context, but for Node's single thread with interleaved requests.",
      "`als.run(store, fn)` — runs `fn` with `store` as the context; anything `fn` triggers (awaits, timers, callbacks) sees the same store.",
      "`als.getStore()` — returns the current store, or `undefined` outside any `run`.",
      "Different requests running at the same time each see their own store, even though they share one thread.",
      "Without it, you would have to pass a request ID through every function parameter (sometimes called 'prop drilling').",
      "# How it works",
      "When an async operation is created (a Promise, timer or I/O request), Node records the current context with it.",
      "  When its callback later runs, Node restores that context.",
      "  So `getStore()` inside the callback returns the store from where the operation was started.",
      "  The overhead is small in modern Node (it is optimized and used by APM tools — application performance monitoring tools like Datadog and OpenTelemetry).",
      "# Example walkthrough",
      "The HTTP server wraps every request in `als.run({ requestId })`.",
      "`log()` reads the store and prefixes each message with the request ID, without receiving it as a parameter.",
      "`loadUser()` awaits a timer, and its log line still has the correct ID after the await.",
      "Two overlapping requests get different IDs, showing that contexts do not mix.",
      "# Why it matters / when to use",
      "Request-scoped logging (correlation IDs to trace one request across logs).",
      "Distributed tracing (OpenTelemetry uses it to keep the current span).",
      "Per-request info like the current user or tenant ID for multi-tenant apps, and per-request DB transactions.",
      "Next.js uses it internally for request-scoped APIs like `headers()` and `cookies()`.",
      "# Common mistakes",
      "Calling `getStore()` outside `run` and not handling `undefined`.",
      "Storing large objects or mutable shared objects; keep the store small and per-request.",
      "Using it to hide normal dependencies that should be explicit parameters.",
      "Using `enterWith()` carelessly, which changes context for the rest of the current sync execution and can leak into other code; prefer `run()`.",
      "# Say this in the interview",
      "AsyncLocalStorage from async_hooks lets me keep context that follows an asynchronous flow, similar to thread-local storage. I wrap each request in als.run with a store containing things like a request ID or user, and any code called during that request, even after awaits, can read it with getStore. I mainly use it for correlation IDs in logs, tracing, and tenant or transaction context, without passing those values through every function.",
    ],
    code: `// als.mjs
import http from 'node:http';
import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

const als = new AsyncLocalStorage();

function log(msg) {
  const id = als.getStore()?.requestId ?? 'no-request';
  console.log('[' + id.slice(0, 8) + '] ' + msg);
}

async function loadUser() {
  log('loading user');                          // no requestId parameter needed
  await new Promise((r) => setTimeout(r, 100)); // context survives await
  log('user loaded');
}

http.createServer((req, res) => {
  als.run({ requestId: randomUUID() }, async () => {
    log('start ' + req.url);
    await loadUser();
    res.end('ok');
    log('done');
  });
}).listen(3000);
// Two overlapping requests:
// → [1a2b3c4d] start /a
// → [1a2b3c4d] loading user
// → [9f8e7d6c] start /b
// → [9f8e7d6c] loading user
// → [1a2b3c4d] user loaded   (still the right id after await)`,
  },

  // ───────────────────────── Streams & Buffers ─────────────────────────
  {
    id: 'what-are-streams',
    group: 'Streams & Buffers',
    stars: 5,
    difficulty: 'Medium',
    q: 'What are streams in Node.js and why are they useful?',
    a: [
      "# ELI5",
      "To fill a swimming pool you could carry one giant tank of water (heavy, needs a huge truck), or connect a hose and let water flow in bit by bit.",
      "With the hose, water starts arriving immediately, and you never need to hold the whole pool's worth at once.",
      "Back to tech: a stream moves data in small pieces (chunks) instead of loading everything into memory first.",
      "# What it is",
      "Stream — an object that lets you read or write data piece by piece over time, built on EventEmitter in the `node:stream` module.",
      "Chunk — one piece of data flowing through a stream, usually a Buffer (raw bytes) of up to 64 KB for file streams.",
      "Without streams, `fs.readFile` loads a whole 2 GB file into memory before you can touch it; with streams, memory stays around the chunk size no matter how big the file is.",
      "Four types: Readable (source), Writable (destination), Duplex (both), Transform (modifies data as it passes).",
      "Composability — streams can be connected like pipes: read a file → compress it → send it over HTTP.",
      "Backpressure — the built-in mechanism that slows the source down when the destination cannot keep up, so memory does not explode.",
      "Many core objects are streams: `fs.createReadStream`, HTTP request (Readable) and response (Writable), TCP sockets (Duplex), `zlib.createGzip()` (Transform), `process.stdin` and `process.stdout`.",
      "# How it works",
      "A Readable reads a chunk from its source (disk, socket) into an internal buffer.",
      "  It emits the chunk to whoever consumes it ('data' event, `pipe`, or `for await`).",
      "  The consumer writes it to a Writable, which buffers it and sends it on.",
      "  If the Writable's buffer passes its `highWaterMark` (a size threshold), `write()` returns false and the source pauses.",
      "  When the Writable empties its buffer, it emits 'drain' and the source resumes.",
      "  At the end, the Readable emits 'end' and the Writable 'finish'; errors are emitted as 'error'.",
      "`stream.pipeline()` wires all of this together and handles errors and cleanup.",
      "# Example walkthrough",
      "The server serves `big.log` gzipped to every client.",
      "`createReadStream` reads 64 KB at a time, `createGzip` compresses each chunk, and `res` (the HTTP response) sends it to the client.",
      "The client starts receiving data almost immediately, even for a multi-GB file.",
      "`pipeline` from `node:stream/promises` returns a Promise; if any step fails (missing file, client disconnects), all streams are destroyed and the catch runs.",
      "Memory stays roughly constant regardless of file size or number of clients.",
      "# Why it matters / when to use",
      "File uploads and downloads, video and audio streaming, CSV and log processing, proxies, exporting large DB query results.",
      "Lower memory use, faster time-to-first-byte, and the ability to handle data larger than RAM.",
      "# Common mistakes",
      "Reading huge files with `readFile` in a server, causing memory spikes and crashes.",
      "Using `.pipe()` without error handling; an error in one stream can leak file handles. Use `pipeline`.",
      "Forgetting to handle 'error' events, which crashes the process.",
      "Ignoring the return value of `write()` in manual writes, breaking backpressure.",
      "# Say this in the interview",
      "Streams process data incrementally in chunks instead of loading it all into memory. Node has Readable, Writable, Duplex and Transform streams, and many core objects like files, HTTP requests and responses, and sockets are streams. They keep memory constant, start producing output sooner, and compose well, for example file to gzip to HTTP response. I connect them with stream.pipeline, which also handles backpressure, errors and cleanup.",
      "  Follow-up: What is the default chunk size for file streams? — 64 KB (`highWaterMark` of 65536 bytes) for `fs.createReadStream`; 16 KB for most other byte streams.",
    ],
    code: `// stream-server.mjs — serves a huge file gzipped, using little memory
import http from 'node:http';
import { createReadStream } from 'node:fs';
import { createGzip } from 'node:zlib';
import { pipeline } from 'node:stream/promises';

http.createServer(async (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Content-Encoding': 'gzip',
  });
  try {
    // file (Readable) → gzip (Transform) → response (Writable)
    await pipeline(createReadStream('big.log'), createGzip(), res);
    console.log('sent');                       // → sent
  } catch (err) {
    console.error('stream failed:', err.code); // e.g. → stream failed: ENOENT
  }
}).listen(3000);

setInterval(() => {
  const mb = (process.memoryUsage().rss / 1e6).toFixed(0);
  console.log('RSS MB', mb); // stays roughly flat even for a 5 GB file
}, 2000).unref();`,
  },
  {
    id: 'backpressure',
    group: 'Streams & Buffers',
    stars: 5,
    difficulty: 'Hard',
    q: 'What is backpressure and how does Node handle it?',
    a: [
      "# ELI5",
      "Imagine a fast kid passing plates to a slow kid who dries them. If the fast kid never stops, plates pile up and crash to the floor.",
      "So the slow kid says 'Stop! My table is full', and later 'OK, I'm ready for more'.",
      "Back to tech: backpressure is the 'stop' and 'ready' signal from a slow writer to a fast reader, so data does not pile up in memory.",
      "# What it is",
      "Backpressure — resistance from the consumer (where data goes) when it cannot process data as fast as the producer (where data comes from) creates it.",
      "Without it, unprocessed data collects in memory buffers until the process runs out of memory.",
      "Typical cases: reading a fast SSD and writing to a slow network client; reading a DB faster than an API accepts it.",
      "`highWaterMark` — a threshold for the internal buffer size (16 KB by default for byte streams, 64 KB for file read streams, 16 objects in object mode). It is a signal level, not a hard limit.",
      "`writable.write(chunk)` returns `true` if the buffer is below highWaterMark, and `false` if you should stop writing.",
      "'drain' event — emitted by a Writable when its buffer has emptied and you can write again.",
      "`pipe()`, `stream.pipeline()` and `for await` loops handle backpressure for you automatically.",
      "# How it works",
      "Producer calls `write(chunk)`.",
      "  The Writable adds it to its buffer and starts flushing to the destination.",
      "  If the buffered size is at or above highWaterMark, `write` returns false.",
      "  A correct producer stops (a Readable pauses itself when piped) and waits for 'drain'.",
      "  As the destination accepts data, the buffer shrinks; when empty, 'drain' fires.",
      "  The producer resumes, and the cycle repeats.",
      "On the reading side, a Readable stops calling its internal `_read()` when its own buffer is full, which in turn stops pulling from the source (e.g. stops reading the TCP socket, letting TCP flow control slow the sender).",
      "# Example walkthrough",
      "`writeMillion` writes one million lines to a file.",
      "Each time `write` returns false, it awaits `once(out, 'drain')` before continuing, so memory stays small.",
      "The bad version (commented) ignores the return value; all million strings end up buffered in memory at once.",
      "Finally `out.end()` closes the file and `finished` waits until everything is flushed.",
      "The last comment shows that `pipeline` does all of this automatically.",
      "# Why it matters / when to use",
      "Large exports, file uploads to S3, proxies, ETL jobs — anywhere the source can be faster than the destination.",
      "Prevents out-of-memory crashes that appear only under real production load or with slow clients.",
      "# Common mistakes",
      "Writing in a loop and ignoring `write()`'s return value.",
      "Using `on('data')` to forward chunks to a slow destination without pausing.",
      "Setting a huge highWaterMark to 'make it faster', which just uses more memory.",
      "# Say this in the interview",
      "Backpressure is what happens when a consumer is slower than a producer, so data would pile up in memory. Node handles it with the highWaterMark threshold: write returns false when the writable's buffer is full, the producer should pause, and the writable emits drain when it can take more. pipe, pipeline and for await loops do this automatically, so I prefer them; when I write manually I always check write's return value and wait for drain.",
      "  Follow-up: Is highWaterMark a hard limit? — No, it is a threshold; you can still write past it, but you are supposed to stop when `write` returns false.",
    ],
    code: `// backpressure.mjs
import { createWriteStream } from 'node:fs';
import { once } from 'node:events';
import { finished } from 'node:stream/promises';

async function writeMillion(path) {
  const out = createWriteStream(path); // highWaterMark: 16 KB
  let pauses = 0;
  for (let i = 0; i < 1_000_000; i++) {
    const ok = out.write('line ' + i + '\\n');
    if (!ok) {                 // buffer full → respect backpressure
      pauses++;
      await once(out, 'drain'); // wait until it is emptied
    }
  }
  out.end();
  await finished(out);         // wait until everything is flushed
  console.log('paused', pauses, 'times'); // → e.g. paused 850 times
  console.log('heap MB', (process.memoryUsage().heapUsed / 1e6).toFixed(0)); // → small, e.g. 6
}
await writeMillion('out.txt');

// BAD: ignores backpressure → all 1M strings buffered in memory
// for (let i = 0; i < 1_000_000; i++) out.write('line ' + i + '\\n');

// EASIEST: pipeline handles backpressure for you
// await pipeline(source, transform, destination);`,
  },
  {
    id: 'stream-types',
    group: 'Streams & Buffers',
    stars: 4,
    difficulty: 'Easy',
    q: 'What are the four types of streams?',
    a: [
      "# ELI5",
      "Think of plumbing: a tap only gives water (Readable), a drain only takes water (Writable), a phone line lets you talk and listen at the same time (Duplex), and a water filter takes dirty water in and gives clean water out (Transform).",
      "Back to tech: these are the four stream types, defined by which direction data flows and whether output depends on input.",
      "# What it is",
      "Readable — a source you read from. Examples: `fs.createReadStream`, HTTP request on the server (`req`), `process.stdin`. You implement `_read()` to create your own.",
      "Writable — a destination you write to. Examples: `fs.createWriteStream`, HTTP response (`res`), `process.stdout`. You implement `_write()` (and optionally `_final()`).",
      "Duplex — both readable and writable, with two independent sides. Example: a TCP socket from `net` — what you write goes to the remote side; what you read comes from it.",
      "Transform — a special Duplex where the output is computed from the input. Examples: `zlib.createGzip()`, `crypto.createCipheriv()`. You implement `_transform()` (and optionally `_flush()`).",
      "PassThrough — a trivial Transform that passes data through unchanged; useful for tapping, testing or as a placeholder.",
      "All are EventEmitters and share events like 'error' and 'close'.",
      "Node also supports Web Streams (`ReadableStream`, `WritableStream`, `TransformStream`), the browser standard used by `fetch`; `Readable.fromWeb()` and `Readable.toWeb()` convert between them.",
      "# How it works",
      "Readable: has an internal read buffer; `push(chunk)` adds data, `push(null)` signals the end; consumers read via 'data', `read()`, `pipe` or `for await`.",
      "Writable: has an internal write buffer; `write(chunk)` queues data, `end()` signals no more data, and 'finish' fires when all is flushed.",
      "Duplex: has both buffers, unrelated to each other.",
      "Transform: whatever you `push` from `_transform` becomes readable output; input and output are linked.",
      "# Example walkthrough",
      "`Readable.from` creates a Readable from an array of words.",
      "A custom Transform upper-cases each chunk.",
      "A custom Writable collects chunks and logs them.",
      "`pipeline` connects them: source → transform → sink, printing 'HELLO', 'STREAM', 'WORLD'.",
      "The comment shows a Duplex example: a TCP socket.",
      "# Why it matters / when to use",
      "Knowing which type you need tells you which method to implement and how to connect streams.",
      "Interviewers often ask for examples of each from Node core.",
      "# Common mistakes",
      "Calling a TCP socket a Transform; it is Duplex because its input and output are independent.",
      "Implementing `read()` or `write()` instead of the underscore methods `_read()` and `_write()` when extending the classes.",
      "Forgetting `push(null)` in a custom Readable, so consumers never see 'end'.",
      "# Say this in the interview",
      "There are four stream types. Readable is a source, like a file read stream or an incoming HTTP request. Writable is a destination, like a file write stream or the HTTP response. Duplex is both, with independent sides, like a TCP socket. Transform is a Duplex whose output is computed from its input, like gzip or encryption. To create custom ones you implement _read, _write, or _transform.",
    ],
    code: `// stream-types.mjs
import { Readable, Writable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';

// Readable: a source
const source = Readable.from(['hello', 'stream', 'world']);

// Transform: output computed from input
const upper = new Transform({
  transform(chunk, encoding, callback) {
    callback(null, chunk.toString().toUpperCase()); // push transformed chunk
  },
});

// Writable: a destination
const sink = new Writable({
  write(chunk, encoding, callback) {
    console.log('got:', chunk.toString());
    callback(); // signal "ready for the next chunk"
  },
});

await pipeline(source, upper, sink);
// → got: HELLO
// → got: STREAM
// → got: WORLD

// Duplex example: a TCP socket (independent read and write sides)
// import net from 'node:net';
// const socket = net.connect(80, 'example.com'); socket.write('...'); socket.on('data', ...);`,
  },
  {
    id: 'pipeline-vs-pipe',
    group: 'Streams & Buffers',
    stars: 4,
    difficulty: 'Medium',
    q: 'Why prefer `stream.pipeline` over `.pipe()`?',
    a: [
      "# ELI5",
      "Imagine a line of workers passing buckets. With `.pipe()`, if one worker trips, the others don't notice: the first keeps filling buckets, the last keeps waiting forever.",
      "With `pipeline`, a supervisor watches the whole line; if anyone trips, the supervisor stops everyone, cleans up, and reports what went wrong.",
      "Back to tech: `.pipe()` does not forward errors or clean up other streams; `pipeline` destroys every stream on failure and gives you one place to handle the error.",
      "# What it is",
      "`readable.pipe(writable)` — connects two streams and handles backpressure, returning the destination so you can chain `.pipe()` calls.",
      "Problems with `.pipe()`:",
      "  Errors are not forwarded: each stream needs its own 'error' listener; an error in the middle does not reach the end.",
      "  On error, other streams are not destroyed, so file descriptors and sockets can leak (a file descriptor is the OS handle for an open file).",
      "  There is no single callback or Promise for 'everything finished or failed'.",
      "`stream.pipeline(...streams, callback)` — connects many streams, forwards backpressure, destroys all of them if any one fails or closes early, and calls the callback once with the error or nothing.",
      "`pipeline` from `node:stream/promises` — the Promise version, so you can `await` it in try/catch.",
      "It also accepts async generator functions as steps, which makes simple transforms very short.",
      "It accepts an `{ signal }` option for cancellation with AbortController.",
      "# How it works",
      "pipeline pipes each stream into the next.",
      "  It attaches error and close listeners to every stream (using `finished` internally).",
      "  If any stream errors or closes prematurely, it calls `destroy(err)` on all of them.",
      "  When the last stream finishes, or on the first error, it settles the Promise or calls the callback exactly once.",
      "# Example walkthrough",
      "The bad version uses `.pipe()` with no error listeners; if `input.txt` is missing, the read stream errors, the gzip and write streams stay open, and the unhandled 'error' event crashes the process.",
      "The good version uses `await pipeline(...)` in try/catch; a missing file is caught, and all streams are destroyed.",
      "An async generator step upper-cases the text between read and gzip.",
      "On success it prints 'pipeline ok'; on failure 'pipeline failed: ENOENT'.",
      "# Why it matters / when to use",
      "In servers, leaked streams on errors (like a client disconnecting mid-download) slowly exhaust file handles and memory.",
      "Proper error handling in streams is a frequent production bug source and a common interview topic.",
      "# Common mistakes",
      "Adding an 'error' listener only to the last stream in a `.pipe()` chain.",
      "Mixing `pipeline` with additional `.pipe()` calls on the same streams.",
      "Forgetting to await the Promise version, so errors become unhandled rejections.",
      "# Say this in the interview",
      "pipe handles backpressure but not errors: errors are not forwarded between streams, the other streams are not destroyed, so you can leak file descriptors, and there is no single completion signal. stream.pipeline, especially the promise version from stream/promises, connects any number of streams, propagates errors, destroys everything on failure, supports async generator steps and abort signals, and gives one place to await completion. So I always use pipeline.",
    ],
    code: `// pipeline.mjs
import { createReadStream, createWriteStream } from 'node:fs';
import { createGzip } from 'node:zlib';
import { pipeline } from 'node:stream/promises';

// BAD: no error forwarding, no cleanup → missing file crashes the process
// createReadStream('input.txt').pipe(createGzip()).pipe(createWriteStream('out.gz'));

// GOOD: one place for errors, all streams destroyed on failure
try {
  await pipeline(
    createReadStream('input.txt'),
    async function* (source) {           // async generator as a transform step
      for await (const chunk of source) yield chunk.toString().toUpperCase();
    },
    createGzip(),
    createWriteStream('out.txt.gz'),
  );
  console.log('pipeline ok');            // → pipeline ok (if input.txt exists)
} catch (err) {
  console.error('pipeline failed:', err.code); // → pipeline failed: ENOENT
}`,
  },
  {
    id: 'buffer',
    group: 'Streams & Buffers',
    stars: 4,
    difficulty: 'Easy',
    q: 'What is a Buffer in Node.js?',
    a: [
      "# ELI5",
      "Text is like a sentence you can read; bytes are like the tiny dots of ink that make up the letters.",
      "A Buffer is a tray holding those raw dots in order, so you can store them, send them, or turn them back into letters using the right alphabet (encoding).",
      "Back to tech: a Buffer is a fixed-size chunk of raw binary data (bytes) that Node uses for files, network data and encodings.",
      "# What it is",
      "Byte — 8 bits, a number from 0 to 255; all files and network data are ultimately bytes.",
      "`Buffer` — a global Node class representing a fixed-length sequence of bytes; it is a subclass of `Uint8Array` (a standard JavaScript typed array of 0–255 numbers).",
      "Its memory is allocated outside the normal V8 JavaScript heap, which makes it efficient for large binary data and I/O.",
      "Encoding — a rule for turning text into bytes and back: `utf8` (default; 1–4 bytes per character), `ascii`, `latin1`, `base64`, `base64url`, `hex`, `utf16le`.",
      "Creating Buffers:",
      "  `Buffer.from('héllo', 'utf8')` — from a string.",
      "  `Buffer.from([72, 105])` — from byte values.",
      "  `Buffer.alloc(10)` — 10 zero-filled bytes (safe).",
      "  `Buffer.allocUnsafe(10)` — faster but may contain old memory data; only if you overwrite every byte.",
      "Useful methods: `toString(encoding)`, `length` (bytes, not characters), `slice`/`subarray` (a view sharing the same memory), `Buffer.concat([...])`, `equals`, `readUInt32BE`/`writeInt16LE` for binary protocols.",
      "When you read a file or a socket without an encoding, you get Buffers.",
      "# How it works",
      "`Buffer.from('hi')` encodes each character into bytes using UTF-8: 'h' → 0x68, 'i' → 0x69.",
      "  Non-ASCII characters take more bytes: 'é' is 2 bytes, many emoji are 4.",
      "  `buf.toString('base64')` re-encodes the same bytes as base64 text, which is safe for JSON or HTTP headers.",
      "  `subarray` returns a new Buffer pointing at the same memory, so changing it changes the original.",
      "Buffers have a fixed size; to grow, you create a new one, e.g. with `Buffer.concat`.",
      "# Example walkthrough",
      "'héllo' has 5 characters but 6 bytes, because 'é' takes 2 bytes in UTF-8.",
      "The hex and base64 lines show the same bytes as different text forms.",
      "Decoding the base64 back gives the original string.",
      "Changing a byte in `part` (a subarray) also changes `buf`, proving they share memory.",
      "`Buffer.concat` joins chunks, as you would when collecting a request body.",
      "# Why it matters / when to use",
      "Handling file uploads, images, binary protocols, hashing and encryption, base64 encoding for tokens and data URLs.",
      "Reading stream chunks correctly, especially multi-byte characters split across chunks (use `setEncoding('utf8')` or `StringDecoder` to avoid broken characters).",
      "# Common mistakes",
      "Using `buf.length` as the number of characters; it is the number of bytes.",
      "Concatenating chunks with `+` (string conversion per chunk) can break multi-byte characters split between chunks; collect Buffers and `Buffer.concat` them, then decode once.",
      "Using deprecated `new Buffer()`; use `Buffer.from` or `Buffer.alloc`.",
      "Forgetting that `subarray` shares memory and mutating it unintentionally.",
      "# Say this in the interview",
      "A Buffer is Node's class for fixed-size raw binary data, a subclass of Uint8Array whose memory lives outside the V8 heap. It is what you get from files and sockets without an encoding. I create them with Buffer.from or Buffer.alloc, convert to text with toString using encodings like utf8, base64 or hex, and remember that length is bytes, not characters, and that subarray shares memory.",
    ],
    code: `// buffer.mjs
const buf = Buffer.from('héllo', 'utf8');
console.log(buf);                    // → <Buffer 68 c3 a9 6c 6c 6f>
console.log('héllo'.length, buf.length); // → 5 6   ("é" is 2 bytes)

console.log(buf.toString('hex'));    // → 68c3a96c6c6f
const b64 = buf.toString('base64');
console.log(b64);                    // → aMOpbGxv
console.log(Buffer.from(b64, 'base64').toString()); // → héllo

const part = buf.subarray(0, 1);     // view on the SAME memory
part[0] = 0x48;                      // 'H'
console.log(buf.toString());         // → Héllo  (original changed too)

const chunks = [Buffer.from('ab'), Buffer.from('cd')];
console.log(Buffer.concat(chunks).toString()); // → abcd

const safe = Buffer.alloc(4);        // zero-filled
console.log(safe);                   // → <Buffer 00 00 00 00>
safe.writeUInt32BE(258);
console.log(safe);                   // → <Buffer 00 00 01 02>`,
  },
  {
    id: 'readfile-vs-createreadstream',
    group: 'Streams & Buffers',
    stars: 4,
    difficulty: 'Easy',
    q: 'When would you use `fs.readFile` vs `fs.createReadStream`?',
    a: [
      "# ELI5",
      "readFile is like photocopying an entire book before you start reading: easy, but you need a big desk and wait for the whole copy.",
      "createReadStream is like reading the book page by page as you turn it: you start right away and need very little desk space.",
      "Back to tech: readFile loads the whole file into memory at once; createReadStream gives you the file in chunks.",
      "# What it is",
      "`fs.readFile(path)` (or `readFile` from `fs/promises`) — reads the entire file into one Buffer or string, then gives it to you.",
      "`fs.createReadStream(path, options)` — returns a Readable stream that emits the file in chunks (64 KB by default), and supports `start`/`end` byte ranges.",
      "Comparison row — memory: readFile needs the whole file size in memory; createReadStream needs roughly one chunk.",
      "Comparison row — time to first data: readFile waits for the whole file; createReadStream starts almost immediately.",
      "Comparison row — simplicity: readFile is one line and gives you everything; streams need pipeline or loops.",
      "Comparison row — maximum size: readFile cannot read files larger than about 2 GB into a single Buffer (the max Buffer size on many platforms); streams have no such limit.",
      "Comparison row — best for: readFile for small files you need whole (config JSON, templates, small images); createReadStream for large files, file downloads, piping to HTTP or processing line by line.",
      "# How it works",
      "readFile: opens the file, checks its size, allocates a Buffer, reads everything into it using the libuv thread pool, then resolves.",
      "createReadStream: opens the file, then reads one chunk at a time into a small buffer, pushing each to the consumer, and pausing when the consumer is slow (backpressure).",
      "With many concurrent requests, readFile multiplies memory by the number of users; streams keep it small.",
      "# Example walkthrough",
      "`loadConfig` uses readFile because `config.json` is small and must be parsed as a whole with `JSON.parse`.",
      "The `/download` route uses createReadStream piped to the response, so a 4 GB video does not fill memory and the client starts receiving data immediately.",
      "The line-counting part uses a stream with readline to process a huge log line by line.",
      "# Why it matters / when to use",
      "Picking the wrong one is a classic production issue: a server reading big files with readFile works in testing and crashes under real traffic.",
      "Range requests for video seeking use `createReadStream(path, { start, end })`.",
      "# Common mistakes",
      "Using `readFileSync` in request handlers (blocks the event loop, and loads everything).",
      "Using streams for tiny config files, adding complexity for no benefit.",
      "Not handling stream errors (missing file) — use `pipeline` and try/catch.",
      "# Say this in the interview",
      "readFile loads the entire file into memory and gives it to me at once, which is simple and fine for small files like configs or templates that I need whole. createReadStream reads the file in chunks, starts delivering data immediately, keeps memory constant and respects backpressure, so I use it for large files, downloads, and line-by-line processing, connected with pipeline for proper error handling.",
    ],
    code: `// files.mjs
import { readFile } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import readline from 'node:readline';
import http from 'node:http';

// Small file, needed whole → readFile
async function loadConfig() {
  return JSON.parse(await readFile('config.json', 'utf8'));
}

// Big file → stream it (constant memory, fast first byte)
http.createServer(async (req, res) => {
  if (req.url === '/download') {
    res.setHeader('Content-Type', 'video/mp4');
    try { await pipeline(createReadStream('movie.mp4'), res); }
    catch (err) { console.error('download failed', err.code); }
    return;
  }
  res.end(JSON.stringify(await loadConfig())); // → {"port":3000,...}
}).listen(3000);

// Huge log, line by line → stream + readline
let errors = 0;
const rl = readline.createInterface({ input: createReadStream('app.log') });
for await (const line of rl) if (line.includes('ERROR')) errors++;
console.log('error lines:', errors); // → e.g. error lines: 42`,
  },
  {
    id: 'transform-stream',
    group: 'Streams & Buffers',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do you implement a custom Transform stream?',
    a: [
      "# ELI5",
      "Think of a juice machine: fruit goes in one side, juice comes out the other. You decide what the machine does to each fruit.",
      "Sometimes a piece of fruit is cut in half between two loads; the machine keeps the leftover half until the next load arrives.",
      "Back to tech: a Transform stream receives chunks, changes them, and pushes out results; it can keep leftovers between chunks and flush them at the end.",
      "# What it is",
      "A Transform is a Duplex stream whose output is calculated from its input, like gzip or a CSV parser.",
      "You create one with `new Transform({ transform, flush })` or by extending the `Transform` class.",
      "`transform(chunk, encoding, callback)` — called for each incoming chunk.",
      "  Call `this.push(data)` zero or more times to output data.",
      "  Call `callback()` when done with this chunk, or `callback(err)` to fail, or `callback(null, data)` as a shortcut for push + done.",
      "`flush(callback)` — called once after all input has been received and before the stream ends; used to push any leftover data.",
      "`objectMode: true` (or `readableObjectMode` / `writableObjectMode` for one side) lets chunks be any JS value instead of bytes.",
      "Chunks are arbitrary slices of data: a line of text can be split across two chunks, so line-based transforms must buffer the incomplete part.",
      "Alternative: an async generator function inside `pipeline` is often simpler for one-off transforms.",
      "# How it works",
      "The writable side receives a chunk and calls your `transform`.",
      "  You process it and push results to the readable side's buffer.",
      "  Calling `callback()` tells the stream you are ready for the next chunk; until then, input waits (this is how backpressure flows through).",
      "  When the writable side ends, `flush` runs, you push the remainder, and then the readable side ends.",
      "# Example walkthrough",
      "`LineSplitter` turns raw text chunks into whole lines as objects.",
      "It keeps `this.leftover`, the incomplete line at the end of each chunk.",
      "We feed two chunks where the word 'banana' is split ('ban' + 'ana'); the output still shows complete lines.",
      "`flush` pushes the last line 'cherry', which had no trailing newline.",
      "The sink prints each line object with its number.",
      "# Why it matters / when to use",
      "Parsing CSV or NDJSON (newline-delimited JSON — one JSON object per line), masking sensitive fields in logs, converting formats, computing hashes or counts while streaming.",
      "Building reusable stream steps that plug into any pipeline.",
      "# Common mistakes",
      "Forgetting to call `callback`, which stalls the whole pipeline forever.",
      "Calling `callback` twice, which throws an error.",
      "Assuming each chunk is a full line or a full JSON object; buffer partial data.",
      "Forgetting `flush`, losing the last partial piece of data.",
      "Pushing objects without `objectMode`, which throws an invalid argument type error.",
      "# Say this in the interview",
      "I create a Transform by passing transform and optionally flush functions, or by extending the class. In transform I process each chunk, push zero or more outputs, and call the callback exactly once to signal readiness for the next chunk, which keeps backpressure working. Since chunks can split records, I buffer leftovers and push them in flush at the end. I use objectMode when emitting parsed objects, and for simple cases an async generator in pipeline is enough.",
    ],
    code: `// line-splitter.mjs
import { Transform, Readable, Writable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

class LineSplitter extends Transform {
  constructor() {
    super({ readableObjectMode: true }); // output objects, input bytes
    this.leftover = '';
    this.n = 0;
  }
  _transform(chunk, encoding, callback) {
    const lines = (this.leftover + chunk.toString()).split('\\n');
    this.leftover = lines.pop();         // last piece may be incomplete
    for (const line of lines) this.push({ n: ++this.n, line });
    callback();                          // ready for the next chunk
  }
  _flush(callback) {
    if (this.leftover) this.push({ n: ++this.n, line: this.leftover });
    callback();
  }
}

await pipeline(
  Readable.from(['apple\\nban', 'ana\\ncherry']),  // "banana" split across chunks
  new LineSplitter(),
  new Writable({
    objectMode: true,
    write(obj, _enc, cb) { console.log(obj); cb(); },
  }),
);
// → { n: 1, line: 'apple' }
// → { n: 2, line: 'banana' }
// → { n: 3, line: 'cherry' }   (pushed by _flush)`,
  },
];

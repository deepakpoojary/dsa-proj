import type { BankQuestion } from './types';

// JavaScript interview bank, questions 51-100, written as beginner-friendly
// study notes (ELI5 -> concept -> internals -> walkthrough -> interview script).
export const JAVASCRIPT_2: BankQuestion[] = [
  // ───────────────────────── Async & Event Loop (cont.) ─────────────────────────
  {
    id: 'sequential-vs-parallel-async',
    group: 'Async & Event Loop',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do you run async tasks sequentially vs in parallel?',
    a: [
      "# ELI5",
      "Imagine you need to buy bread, milk and eggs from three different shops.",
      "Sequential: you go to the bakery, wait, come back, then go to the dairy, then to the egg shop. It takes the time of all three trips added together.",
      "Parallel: you send three friends at the same time, one per shop. You are done when the slowest friend comes back.",
      "In code, each shop trip is an async task (like an HTTP call), and you choose whether to wait for each one before starting the next, or start them all at once.",
      "# What it is",
      "An async task is work that finishes later, such as a database query or network request. In JavaScript it is usually represented by a Promise — an object that will later hold either a result or an error.",
      "`await` pauses the current `async` function until a Promise settles (finishes), without blocking the rest of the program.",
      "Sequential execution: start task 2 only after task 1 finished. Total time = sum of all tasks.",
      "Parallel (more precisely, concurrent) execution: start all tasks immediately, then wait for all of them. Total time ≈ the slowest task.",
      "Limited concurrency: run at most N tasks at a time, so you do not overload a database or a third-party API.",
      "# How it works",
      "Sequential with `for...of` + `await`:",
      "  The loop starts task 1 and `await` pauses the loop until it resolves.",
      "  Only then does the loop move on and start task 2, and so on.",
      "Parallel with `Promise.all`:",
      "  `ids.map(fetchUser)` calls `fetchUser` for every id right away, so all requests are already in flight.",
      "  `Promise.all` returns one Promise that resolves with an array of results, in the same order as the input.",
      "  If ANY task rejects, `Promise.all` rejects immediately with that error (fail-fast). The other tasks keep running, but their results are ignored.",
      "`Promise.allSettled` waits for every task and gives you `{ status, value | reason }` for each, so one failure does not hide the others.",
      "Node is single-threaded for your JS code, but I/O (network, disk) happens in the background, which is why many requests can be in flight at once.",
      "# Example walkthrough",
      "`fakeFetch(id, ms)` returns a Promise that resolves with `user-<id>` after `ms` milliseconds, simulating a slow API.",
      "`sequential()` awaits each call inside the loop: 300 + 200 + 100 = about 600 ms total.",
      "`parallel()` starts all three at once and waits for the slowest: about 300 ms total.",
      "Both print the same array `['user-1', 'user-2', 'user-3']`, because `Promise.all` keeps input order, not finish order.",
      "`limited()` processes the ids in batches of 2: first batch takes 300 ms, second takes 100 ms, about 400 ms total.",
      "# Why it matters / when to use",
      "Use sequential when steps depend on each other: create a user, THEN create their wallet using the new user id.",
      "Use parallel for independent work: loading a dashboard that needs profile, orders and notifications at the same time.",
      "Use limited concurrency for big jobs: sending 10,000 emails or calling a rate-limited API (libraries like `p-limit` help).",
      "Choosing correctly can turn a 5 second endpoint into a 1 second endpoint.",
      "# Common mistakes",
      "Using `arr.forEach(async (x) => await save(x))` and expecting it to wait. `forEach` ignores the returned Promises, so code after it runs before the saves finish. Use `for...of` or `Promise.all(arr.map(...))`.",
      "Awaiting independent calls one by one (`const a = await getA(); const b = await getB();`) when they could run together. Start both first, then await `Promise.all([getA(), getB()])`.",
      "Firing 10,000 requests with one `Promise.all`, which can exhaust DB connections or get you rate-limited. Batch them or use a concurrency limiter.",
      "Forgetting that `Promise.all` fails fast; use `Promise.allSettled` when you need every result, including failures.",
      "# Say this in the interview",
      "For sequential work I use `await` inside a `for...of` loop, so each task starts after the previous one finishes and the total time is the sum. For independent tasks I start them all and `await Promise.all(...)`, so the total time is roughly the slowest task. For large batches I limit concurrency with chunks or `p-limit` to protect downstream services. I avoid `forEach` with async callbacks because it does not wait.",
      "  Follow-up: What if one parallel task fails? — `Promise.all` rejects immediately; use `Promise.allSettled` to collect all outcomes.",
      "  Follow-up: Is this true parallelism? — No, it is concurrency: JS runs on one thread, but the I/O happens in the background at the same time.",
    ],
    code: `// Simulates an API call that takes "ms" milliseconds
const fakeFetch = (id, ms) =>
  new Promise((resolve) => setTimeout(() => resolve("user-" + id), ms));
const jobs = [[1, 300], [2, 200], [3, 100]];

async function sequential() {
  const results = [];
  for (const [id, ms] of jobs) {
    results.push(await fakeFetch(id, ms)); // waits before starting the next
  }
  return results; // ~600ms total
}

async function parallel() {
  // all three start immediately; we wait for the slowest
  return Promise.all(jobs.map(([id, ms]) => fakeFetch(id, ms))); // ~300ms
}

async function limited(size = 2) {
  const results = [];
  for (let i = 0; i < jobs.length; i += size) {
    const batch = jobs.slice(i, i + size);
    results.push(...(await Promise.all(batch.map(([id, ms]) => fakeFetch(id, ms)))));
  }
  return results; // batch 1 ~300ms + batch 2 ~100ms = ~400ms
}

console.time("seq"); console.log(await sequential()); console.timeEnd("seq");
// → [ 'user-1', 'user-2', 'user-3' ]  seq: ~600ms
console.time("par"); console.log(await parallel()); console.timeEnd("par");
// → [ 'user-1', 'user-2', 'user-3' ]  par: ~300ms
console.log(await limited()); // → [ 'user-1', 'user-2', 'user-3' ]`,
  },
  {
    id: 'callback-hell',
    group: 'Async & Event Loop',
    stars: 3,
    difficulty: 'Easy',
    q: 'What is callback hell and how do you avoid it?',
    a: [
      "# ELI5",
      "Imagine a note that says: 'When the cake is baked, call me, and then when I call back, ice it, and when the icing is done, call me again, and then...'",
      "Each instruction is tucked inside the previous one, so the note keeps getting more indented and confusing.",
      "Callback hell is that note in code: steps nested inside steps, drifting to the right like a pyramid.",
      "# What it is",
      "A callback is a function you pass to another function so it can be called later, for example when a file has finished reading.",
      "Callback hell (also called the pyramid of doom) happens when several async steps depend on each other, so each callback is nested inside the previous one.",
      "Problems: hard to read, hard to reuse, and error handling must be repeated at every level.",
      "Inversion of control: you hand your callback to someone else's code and trust it to call it exactly once, with the right arguments. Bugs there can call it twice or never.",
      "Node's classic style is the error-first callback: `(err, data) => {}`. If `err` is not null, something went wrong.",
      "# How it works",
      "Step 1 starts an async operation and passes a callback.",
      "When step 1 finishes, Node calls the callback, which starts step 2 with another callback inside it.",
      "This repeats, so every dependent step adds one level of nesting and one more `if (err)` check.",
      "Promises flatten this: each step returns a Promise, and you chain `.then()` calls at the same indentation level.",
      "`async/await` goes further: the code reads top to bottom like synchronous code, and one `try/catch` handles all errors.",
      "`util.promisify(fn)` converts a Node error-first callback function into a Promise-returning one; most core modules also ship Promise versions (`fs/promises`).",
      "# Example walkthrough",
      "The first version reads a config file, then reads the file it points to, then writes output: three levels of nesting with three error checks.",
      "The second version does the same with `fs/promises` and `await`: three flat lines inside one `try/catch`.",
      "Both produce the same result; the second is far easier to read and extend.",
      "# Why it matters / when to use",
      "Older Node libraries and some event APIs still use callbacks, so you must recognise and convert them.",
      "Flat async code makes backend request handlers (validate → query DB → call payment API → respond) easy to follow and debug.",
      "# Common mistakes",
      "Forgetting to `return` after calling the callback with an error, so the code continues and the callback runs twice.",
      "Throwing inside a callback and expecting an outer `try/catch` to catch it. It will not, because the outer function already returned.",
      "Mixing styles (callbacks inside `.then`) — pick Promises/async-await and convert legacy APIs with `util.promisify`.",
      "# Say this in the interview",
      "Callback hell is deeply nested callbacks for dependent async steps. It hurts readability, duplicates error handling and gives control of your code to third-party functions. I avoid it with named functions, Promises and mainly `async/await`, and I wrap legacy callback APIs with `util.promisify`.",
      "  Follow-up: What is an error-first callback? — Node's convention where the first argument is an error (or null) and the rest are results.",
      "  Follow-up: Do Promises fully solve inversion of control? — Mostly: a Promise can only settle once, so a callback cannot be called twice.",
    ],
    code: `import fs from "node:fs";
import { readFile, writeFile } from "node:fs/promises";

// Callback hell: each step nested inside the previous one
fs.readFile("config.json", "utf8", (err, cfg) => {
  if (err) return console.error(err);
  fs.readFile(JSON.parse(cfg).input, "utf8", (err2, text) => {
    if (err2) return console.error(err2);
    fs.writeFile("out.txt", text.toUpperCase(), (err3) => {
      if (err3) return console.error(err3);
      console.log("done (callbacks)");
    });
  });
});

// Same logic, flat with async/await
async function run() {
  try {
    const cfg = JSON.parse(await readFile("config.json", "utf8"));
    const text = await readFile(cfg.input, "utf8");
    await writeFile("out.txt", text.toUpperCase());
    console.log("done (await)"); // → done (await)
  } catch (err) {
    console.error(err); // one place for every error
  }
}
run();`,
  },
  {
    id: 'settimeout-zero',
    group: 'Async & Event Loop',
    stars: 3,
    difficulty: 'Easy',
    q: 'Does `setTimeout(fn, 0)` run immediately?',
    a: [
      "# ELI5",
      "You are a chef cooking a dish. A waiter hands you a note: 'Make tea, 0 minutes delay'.",
      "You do not drop the pan. You finish the dish in front of you, then handle the urgent sticky notes on the counter, and only then pick up the tea note.",
      "`setTimeout(fn, 0)` is that note: 'as soon as possible', never 'right now'.",
      "# What it is",
      "No. `setTimeout(fn, 0)` schedules `fn` as a macrotask (also called a task) — a job placed in a queue that the event loop picks up later.",
      "The event loop is the mechanism that, whenever the call stack (the list of functions currently running) is empty, takes the next job from a queue and runs it.",
      "Microtasks (Promise `.then` callbacks, code after `await`, `queueMicrotask`) are a higher-priority queue that is emptied completely before the next macrotask runs.",
      "So a 0 ms timer runs after: the current synchronous code AND all pending microtasks.",
      "The delay is a minimum, not a guarantee. A busy thread (a long loop, heavy JSON parsing) delays it further.",
      "# How it works",
      "`setTimeout` registers a timer with the runtime (browser or Node's libuv) and returns immediately.",
      "Your synchronous code keeps running to the end, emptying the call stack.",
      "The engine drains the microtask queue (all Promise callbacks).",
      "The event loop checks timers; the expired 0 ms timer's callback is pushed onto the stack and runs.",
      "Browsers clamp nested timers (nesting depth 5 or more) to at least 4 ms, and throttle timers in background tabs even more.",
      "In Node, `setTimeout(fn, 0)` is actually treated as 1 ms; `setImmediate` runs in the check phase right after I/O.",
      "# Example walkthrough",
      "`A` prints first because it is plain synchronous code.",
      "`setTimeout` only schedules `timeout`; `Promise.resolve().then` schedules `microtask`.",
      "`B` prints next (still synchronous).",
      "The stack is empty, so microtasks run: `microtask`.",
      "Finally the timer fires: `timeout`. Output: A, B, microtask, timeout.",
      "# Why it matters / when to use",
      "Deferring work until after the current operation finishes, for example letting a response be sent before doing cleanup.",
      "Splitting a long CPU job into chunks so the event loop can serve other requests in between (yielding).",
      "In browsers, giving the UI a chance to repaint; modern alternatives include `scheduler.yield()` where supported.",
      "# Common mistakes",
      "Assuming 0 means 'immediately' and relying on it to run before a Promise callback. Promises (microtasks) always go first.",
      "Using `setTimeout` to 'wait for the DOM' or 'wait for data' instead of using the proper event or awaiting the Promise.",
      "Expecting precise timing: timers can fire late under load, so never use them for accurate clocks.",
      "# Say this in the interview",
      "No. `setTimeout(fn, 0)` queues a macrotask, so it runs only after the current synchronous code finishes and the microtask queue is drained. The delay is a minimum; browsers clamp nested timers to 4 ms and a busy thread delays it more. I use it to defer or yield work, not for precise timing.",
      "  Follow-up: `setTimeout(fn, 0)` vs `setImmediate` in Node? — In the main module their order is not guaranteed; inside an I/O callback `setImmediate` always runs first.",
      "  Follow-up: What runs before it? — All synchronous code and every queued microtask.",
    ],
    code: `console.log("A");

setTimeout(() => console.log("timeout"), 0);        // macrotask
Promise.resolve().then(() => console.log("microtask")); // microtask

console.log("B");

// Output:
// → A
// → B
// → microtask
// → timeout

// A busy thread delays the timer even more:
const start = Date.now();
setTimeout(() => console.log("waited", Date.now() - start, "ms"), 0);
while (Date.now() - start < 200) {} // blocks the thread for 200ms
// → waited 200 ms (roughly), not 0`,
  },
  {
    id: 'abortcontroller',
    group: 'Async & Event Loop',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do you cancel a fetch request or add a timeout?',
    a: [
      "# ELI5",
      "You order a pizza by phone and get an order slip with a 'cancel' button.",
      "If you change your mind, or it is taking too long, you press cancel and the shop stops making it.",
      "`AbortController` is the cancel button, and the `signal` is the slip you give the pizza shop (`fetch`) so it knows when you pressed it.",
      "# What it is",
      "`AbortController` is a built-in object (browsers and Node 15+) used to cancel async operations.",
      "It has a `signal` property — an `AbortSignal` object you pass to the operation — and an `abort()` method that triggers it.",
      "When aborted, `fetch` rejects with an error whose `name` is `AbortError`.",
      "`AbortSignal.timeout(ms)` creates a signal that aborts by itself after `ms` milliseconds; the error name is then `TimeoutError`.",
      "`AbortSignal.any([s1, s2])` combines signals: it aborts when any of them aborts (for example user cancel OR timeout).",
      "# How it works",
      "Create a controller: `const ctrl = new AbortController()`.",
      "Pass `ctrl.signal` into `fetch(url, { signal })` (or another API that accepts a signal).",
      "The operation listens to the signal's `abort` event.",
      "Calling `ctrl.abort()` flips `signal.aborted` to true and fires the event.",
      "`fetch` stops the request and its Promise rejects with the abort error, so your `catch` runs.",
      "A signal can only abort once; create a new controller for each new request.",
      "# Example walkthrough",
      "`fetchWithTimeout` uses `AbortSignal.timeout(ms)` so the request automatically gives up after the limit.",
      "In the `catch` we check `err.name` to tell a timeout apart from other network errors.",
      "The second part creates a manual controller and aborts it right away, so the `catch` prints `cancelled by user`.",
      "The third part shows that the same signal can remove an event listener with `{ signal }`.",
      "# Why it matters / when to use",
      "Backend: put a timeout on every outgoing HTTP call so a slow third-party API does not hang your request handler forever.",
      "Cancel work when the client disconnects, saving CPU and DB load.",
      "Frontend: cancel the previous search request when the user types again, avoiding race conditions where an old response overwrites a newer one.",
      "Many Node APIs accept `signal`: `fs.readFile`, `timers/promises` `setTimeout`, `child_process`, `events.once`, streams.",
      "# Common mistakes",
      "Reusing an already aborted controller: every later request fails instantly. Make a new controller per request.",
      "Treating an abort as a real failure and showing an error popup or logging it as a crash. Check `err.name` first.",
      "Assuming abort undoes server-side work: the server may already have processed the request. Abort only stops you waiting.",
      "# Say this in the interview",
      "I create an `AbortController`, pass its `signal` to `fetch`, and call `abort()` to cancel; the Promise then rejects with an `AbortError`. For timeouts I use `AbortSignal.timeout(ms)`, and `AbortSignal.any` to combine a user cancel with a timeout. I use this on every outbound call so slow dependencies cannot hang my service.",
      "  Follow-up: How did people do timeouts before? — `Promise.race` against a timer, but that did not actually stop the request.",
      "  Follow-up: What else accepts a signal? — `addEventListener`, many Node core APIs, and most modern HTTP clients.",
    ],
    code: `// 1) Automatic timeout
async function fetchWithTimeout(url, ms) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(ms) });
    return await res.json();
  } catch (err) {
    if (err.name === "TimeoutError") console.log("took longer than", ms, "ms");
    else if (err.name === "AbortError") console.log("aborted");
    else throw err; // real network error
  }
}
await fetchWithTimeout("https://httpbin.org/delay/5", 1000);
// → took longer than 1000 ms

// 2) Manual cancel
const ctrl = new AbortController();
const p = fetch("https://example.com", { signal: ctrl.signal })
  .catch((err) => console.log(err.name === "AbortError" ? "cancelled by user" : err));
ctrl.abort(); // press the cancel button
await p; // → cancelled by user

// 3) Signals also remove event listeners
const target = new EventTarget();
const ctrl2 = new AbortController();
target.addEventListener("ping", () => console.log("ping!"), { signal: ctrl2.signal });
target.dispatchEvent(new Event("ping")); // → ping!
ctrl2.abort();
target.dispatchEvent(new Event("ping")); // (nothing, listener removed)`,
  },
  {
    id: 'generators',
    group: 'Async & Event Loop',
    stars: 3,
    difficulty: 'Medium',
    q: 'What are generator functions?',
    a: [
      "# ELI5",
      "Think of a storyteller who tells one sentence each time you say 'next', then stops and waits, remembering exactly where they were.",
      "A normal function is a storyteller who must tell the whole story in one go.",
      "A generator is the pausable storyteller: it gives you one value, freezes, and continues from the same spot when you ask again.",
      "# What it is",
      "A generator function is declared with `function*`. Calling it does NOT run its body; it returns a generator object.",
      "The generator object is an iterator — an object with a `next()` method that returns `{ value, done }`.",
      "`yield value` pauses the function and hands `value` to whoever called `next()`.",
      "Generators are lazy: values are produced only when asked for, so they can represent infinite sequences without running out of memory.",
      "Generators are also iterable, so they work with `for...of` and spread `[...gen]`.",
      "# How it works",
      "Calling `idGen()` creates the generator object; no code inside has run yet.",
      "The first `next()` runs the body until the first `yield`, then pauses and returns `{ value, done: false }`.",
      "Each later `next()` resumes right after the last `yield`, with all local variables intact.",
      "When the body reaches `return` (or the end), `next()` returns `{ value: returnValue, done: true }`.",
      "`next(x)` sends `x` back in: it becomes the result of the paused `yield` expression.",
      "`gen.return(v)` ends the generator early; `gen.throw(err)` throws an error at the paused `yield`.",
      "# Example walkthrough",
      "`idGen` has an infinite loop, but it is safe because it pauses at every `yield`.",
      "`ids.next().value` gives 1, then 2: each call resumes the loop once.",
      "`take(gen, 3)` pulls only 3 values from an infinite generator, printing `[1, 2, 3]`.",
      "`chat` shows two-way communication: the value passed to `next('Ann')` becomes `name`.",
      "# Why it matters / when to use",
      "Lazy data pipelines: read and process records one by one instead of loading millions into an array.",
      "Custom iterators for your own data structures (trees, linked lists) with very little code.",
      "Unique ID or pagination sequences; historically, libraries like `co` and redux-saga used generators for async flow before `async/await` existed.",
      "# Common mistakes",
      "Expecting `idGen()` to run the code immediately. Nothing runs until `next()` (or a `for...of`).",
      "Spreading an infinite generator (`[...idGen()]`), which loops forever. Limit it with a counter or `take`.",
      "Forgetting a generator can only be iterated once; after `done: true`, create a new one.",
      "# Say this in the interview",
      "A generator is a function declared with `function*` that can pause at `yield` and resume later. Calling it returns an iterator; each `next()` runs until the next `yield` and returns `{ value, done }`. Because values are produced on demand, generators are great for lazy or infinite sequences and custom iterables.",
      "  Follow-up: Generators vs async/await? — async/await is essentially a generator plus a Promise runner built into the language.",
      "  Follow-up: What does `next(value)` do? — It resumes the generator and makes the paused `yield` evaluate to that value.",
    ],
    code: `function* idGen() {
  let id = 1;
  while (true) yield id++; // pauses here every time
}

const ids = idGen();      // nothing has run yet
console.log(ids.next());  // → { value: 1, done: false }
console.log(ids.next().value); // → 2

// Take only the first n values from any iterator
function take(gen, n) {
  const out = [];
  for (const v of gen) {
    if (out.length === n) break; // break also closes the generator
    out.push(v);
  }
  return out;
}
console.log(take(idGen(), 3)); // → [ 1, 2, 3 ]

// Two-way communication
function* chat() {
  const name = yield "What is your name?";
  return "Hello " + name;
}
const c = chat();
console.log(c.next().value);      // → What is your name?
console.log(c.next("Ann"));       // → { value: 'Hello Ann', done: true }`,
  },
  {
    id: 'async-iterators',
    group: 'Async & Event Loop',
    stars: 1,
    difficulty: 'Hard',
    q: 'What are async iterators and `for await...of`?',
    a: [
      "# ELI5",
      "Imagine a conveyor belt at a sushi restaurant. Plates arrive one at a time, and sometimes you must wait for the next one.",
      "You take a plate, eat, then wait for the next plate. You never get all plates at once.",
      "An async iterator is that belt: items arrive over time, and `for await` waits politely for each one.",
      "# What it is",
      "A normal iterator's `next()` returns `{ value, done }` right away. An async iterator's `next()` returns a Promise of `{ value, done }`.",
      "An async iterable is an object with a `[Symbol.asyncIterator]()` method that returns an async iterator.",
      "`for await (const x of source)` loops over an async iterable, awaiting each item in order. It can only be used inside an `async` function or a module's top level.",
      "`async function*` (an async generator) is the easiest way to create one: it can both `await` and `yield`.",
      "`Array.fromAsync(source)` (ES2024) collects every item into an array.",
      "# How it works",
      "`for await` calls `source[Symbol.asyncIterator]()` to get the iterator.",
      "It calls `next()`, awaits the returned Promise, and reads `{ value, done }`.",
      "If `done` is false, the loop body runs with `value`; then it calls `next()` again.",
      "When `done` is true the loop ends; on `break` or an error it calls the iterator's `return()` so resources (files, sockets) get cleaned up.",
      "# Example walkthrough",
      "`fetchPages` is an async generator that pretends to fetch page 1, 2, 3 from an API, waiting 100 ms per page.",
      "Each `yield` hands one page of items to the loop and pauses until the loop asks for more.",
      "The `for await` loop prints each page as it arrives: `page 1 [a, b]`, then page 2, then page 3.",
      "The second part reads a file line by line with `readline`, which exposes an async iterator, without loading the whole file into memory.",
      "# Why it matters / when to use",
      "Paginated APIs: hide the 'fetch next page' logic behind a simple loop.",
      "Node streams are async iterable: `for await (const chunk of req)` reads an HTTP request body piece by piece.",
      "Processing huge files or database cursors (e.g. MongoDB cursors) row by row with constant memory.",
      "# Common mistakes",
      "Using plain `for...of` on an async iterable; you get Promises or a TypeError instead of values.",
      "Using `for await` when items are independent and could be fetched in parallel; it is strictly one at a time.",
      "Forgetting that `break` triggers cleanup (good), but swallowing errors inside the loop can leave streams in a bad state; let errors propagate or handle them deliberately.",
      "# Say this in the interview",
      "An async iterator is like a normal iterator except `next()` returns a Promise, so values can arrive over time. `for await...of` awaits each value in order, and `async function*` is the easy way to create one. I use it for paginated APIs, Node streams and reading large files line by line.",
      "  Follow-up: How do you read a request body with it? — `for await (const chunk of req) body += chunk;`",
      "  Follow-up: How do you collect all values? — `await Array.fromAsync(source)`.",
    ],
    code: `import { createReadStream } from "node:fs";
import readline from "node:readline";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Async generator: simulates a paginated API
async function* fetchPages() {
  const db = [["a", "b"], ["c", "d"], ["e"]];
  for (let page = 0; page < db.length; page++) {
    await sleep(100);        // pretend network delay
    yield db[page];          // hand one page to the consumer
  }
}

for await (const items of fetchPages()) {
  console.log("page", items);
}
// → page [ 'a', 'b' ]
// → page [ 'c', 'd' ]
// → page [ 'e' ]

console.log(await Array.fromAsync(fetchPages())); // → [ [ 'a', 'b' ], [ 'c', 'd' ], [ 'e' ] ]

// Read a big file line by line with constant memory
const rl = readline.createInterface({ input: createReadStream("big.log") });
let count = 0;
for await (const line of rl) {
  if (line.includes("ERROR")) count++;
}
console.log("errors:", count);`,
  },

  // ───────────────────────── ES6+ Features ─────────────────────────
  {
    id: 'spread-vs-rest',
    group: 'ES6+ Features',
    stars: 4,
    difficulty: 'Easy',
    q: 'What is the difference between the spread and rest operators?',
    a: [
      "# ELI5",
      "Spread is like opening a bag of sweets and pouring them all out onto the table, one by one.",
      "Rest is like sweeping all the leftover sweets on the table back into one bag.",
      "Both use the same three dots `...`, but spread unpacks and rest packs.",
      "# What it is",
      "Spread (`...x` where a value is expected) expands an iterable (array, string, Set, Map) or an object into individual items.",
      "Rest (`...x` where a variable is being declared) collects the remaining items into a new array or object.",
      "Rule of thumb: on the right side of `=` or in a function call, it is spread. On the left side of `=` or in a parameter list, it is rest.",
      "Comparison:",
      "  Job — spread expands; rest collects.",
      "  Where — spread in function calls, array literals and object literals; rest in function parameters and destructuring patterns.",
      "  Result — spread produces separate values; rest produces one array (or object).",
      "  Position — spread can appear anywhere and many times; rest must be the last element and only once.",
      "# How it works",
      "Array spread `[...a, ...b]` calls each value's iterator (`Symbol.iterator`) and pushes every item into a new array.",
      "Object spread `{ ...o }` copies the object's own enumerable properties (its own keys, not inherited ones) into a new object; later keys overwrite earlier ones.",
      "Call spread `fn(...args)` passes each array item as a separate argument.",
      "Rest parameters `function f(...args)` gather all extra arguments into a real array (unlike the old `arguments` object, which is array-like and has no `map`).",
      "Rest in destructuring `const [first, ...others] = arr` puts everything after the first item into `others`.",
      "# Example walkthrough",
      "`Math.max(...nums)` spreads `[3, 9, 4]` into `Math.max(3, 9, 4)`, printing 9.",
      "`[...a, ...b]` merges two arrays into `[1, 2, 3, 4]`.",
      "`{ ...defaults, ...user }` merges objects; `user.theme` overrides the default, so theme is 'dark'.",
      "`sum(1, 2, 3)` uses a rest parameter, so `nums` is `[1, 2, 3]` and the result is 6.",
      "`const { password, ...safeUser } = dbUser` removes `password` and keeps the rest — a common backend pattern before sending JSON.",
      "The last block shows the shallow-copy trap: the copy and the original share the same nested `tags` array.",
      "# Why it matters / when to use",
      "Immutable updates: create a new object with one field changed instead of mutating, e.g. `{ ...order, status: 'paid' }`.",
      "Merging config: `{ ...defaultConfig, ...envConfig }`.",
      "Stripping sensitive fields before sending a response.",
      "Writing flexible functions like `log(level, ...messages)`.",
      "# Common mistakes",
      "Thinking spread makes a deep copy. It is shallow: nested objects are still shared. Use `structuredClone(obj)` for a deep copy.",
      "Putting rest anywhere except last: `function f(...a, b)` is a SyntaxError.",
      "Spreading a huge array into a function call (`Math.max(...hugeArray)`) can exceed the argument limit and throw RangeError; use `reduce` instead.",
      "Spreading a plain object into an array (`[...{ a: 1 }]`) throws, because plain objects are not iterable.",
      "# Say this in the interview",
      "Spread and rest share the `...` syntax but do opposite jobs. Spread expands an iterable or object into individual elements, in calls, array literals and object literals. Rest collects remaining elements into an array or object, in parameters and destructuring, and must be last. Object spread is only a shallow copy.",
      "  Follow-up: How is a rest parameter different from `arguments`? — Rest gives a real array, works in arrow functions, and only includes the extra arguments.",
      "  Follow-up: How do you deep copy? — `structuredClone(obj)`.",
    ],
    code: `// SPREAD: expand values
const nums = [3, 9, 4];
console.log(Math.max(...nums)); // → 9

const a = [1, 2], b = [3, 4];
console.log([...a, ...b]); // → [ 1, 2, 3, 4 ]

const defaults = { theme: "light", lang: "en" };
const user = { theme: "dark" };
console.log({ ...defaults, ...user }); // → { theme: 'dark', lang: 'en' }

// REST: collect values
function sum(...nums) {          // nums is a real array
  return nums.reduce((t, n) => t + n, 0);
}
console.log(sum(1, 2, 3)); // → 6

const [first, ...others] = ["a", "b", "c"];
console.log(first, others); // → a [ 'b', 'c' ]

const dbUser = { id: 1, email: "a@x.com", password: "hash" };
const { password, ...safeUser } = dbUser; // drop the password
console.log(safeUser); // → { id: 1, email: 'a@x.com' }

// Shallow copy gotcha
const original = { tags: ["x"] };
const copy = { ...original };
copy.tags.push("y");
console.log(original.tags); // → [ 'x', 'y' ]  (shared nested array!)`,
  },
  {
    id: 'destructuring',
    group: 'ES6+ Features',
    stars: 4,
    difficulty: 'Easy',
    q: 'Explain array and object destructuring.',
    a: [
      "# ELI5",
      "You receive a lunchbox with a sandwich, an apple and juice. Instead of saying 'the first thing in the box', you take each item out and put it in its own labelled spot.",
      "For a row of items (an array), you take them by position: first, second, third.",
      "For a labelled box (an object), you take them by label: 'apple', 'juice'.",
      "Destructuring is that unpacking, written in one short line.",
      "# What it is",
      "Destructuring is syntax that pulls values out of arrays or objects into separate variables.",
      "Array destructuring is by position: `const [a, b] = [1, 2]`. It works on any iterable (strings, Sets, Maps).",
      "Object destructuring is by property name: `const { name, age } = user`.",
      "Extras: skip items with empty commas (`[a, , c]`), rename (`{ name: userName }`), give defaults (`{ role = 'user' }`), and collect the rest (`...rest`).",
      "A default value is used only when the value is `undefined`, not when it is `null` or `0`.",
      "# How it works",
      "The right side is evaluated first (the array or object).",
      "For arrays, JS gets its iterator and assigns the 1st value to the 1st variable, the 2nd to the 2nd, and so on.",
      "For objects, JS reads each named property: `{ name }` means `const name = obj.name`.",
      "If the value read is `undefined` and a default exists, the default expression is evaluated and used.",
      "Nested patterns repeat this inside: `{ address: { city } }` reads `obj.address.city`.",
      "In function parameters, the argument passed in is destructured the same way.",
      "# Example walkthrough",
      "`const [x, , z] = [10, 20, 30]` skips the middle item: x is 10, z is 30.",
      "`[p, q] = [q, p]` swaps two variables without a temporary variable.",
      "`const { name: fullName, role = 'user' } = user` renames `name` and defaults `role` because it is missing.",
      "`const { address: { city } } = user` reads the nested city: 'Pune'.",
      "`createUser({ email: 'a@x.com' })` destructures its options object; `isAdmin` falls back to false.",
      "`createUser()` with no argument still works because of the `= {}` default on the whole parameter.",
      "# Why it matters / when to use",
      "Express handlers: `const { id } = req.params; const { page = 1 } = req.query;`.",
      "Functions with many options read better with a destructured options object than with 6 positional arguments.",
      "Handling multiple return values: `const [err, data] = await safeCall()`.",
      "Importing: `const { readFile } = require('node:fs/promises')` is object destructuring too.",
      "# Common mistakes",
      "Destructuring `undefined` or `null` throws TypeError (`Cannot destructure property 'x' of undefined`). Add a default: `function f({ a } = {})`.",
      "Expecting defaults to replace `null`: `const { x = 5 } = { x: null }` gives `null`.",
      "Starting a statement with `{` when assigning to existing variables: `{ a } = obj` is a syntax error; wrap it: `({ a } = obj)`.",
      "Confusing rename syntax: in `{ name: n }`, `n` is the new variable name, not a type annotation.",
      "# Say this in the interview",
      "Destructuring unpacks values from arrays by position and from objects by property name into variables. It supports skipping, renaming, default values (applied only for `undefined`), nested patterns and rest elements. I use it heavily for function options objects and request params, always with an `= {}` default to avoid destructuring `undefined`.",
      "  Follow-up: How do you swap two variables? — `[a, b] = [b, a]`.",
      "  Follow-up: When does a default apply? — Only when the value is strictly `undefined`.",
    ],
    code: `// Array destructuring (by position)
const [x, , z] = [10, 20, 30];
console.log(x, z); // → 10 30

let p = 1, q = 2;
[p, q] = [q, p];   // swap
console.log(p, q); // → 2 1

// Object destructuring (by name)
const user = { name: "Ann", address: { city: "Pune" } };
const { name: fullName, role = "user" } = user; // rename + default
console.log(fullName, role); // → Ann user

const { address: { city } } = user; // nested
console.log(city); // → Pune

// In function parameters (with a default for the whole object)
function createUser({ email, isAdmin = false } = {}) {
  return email + " admin=" + isAdmin;
}
console.log(createUser({ email: "a@x.com" })); // → a@x.com admin=false
console.log(createUser());                      // → undefined admin=false

// Defaults only apply to undefined
const { v = 5 } = { v: null };
console.log(v); // → null

// Destructuring undefined throws
try { const { id } = undefined; } catch (e) { console.log(e.name); } // → TypeError`,
  },
  {
    id: 'esm-vs-commonjs',
    group: 'ES6+ Features',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is the difference between ES modules and CommonJS?',
    a: [
      "# ELI5",
      "Imagine two ways to borrow books. In the first library (CommonJS), you walk to the shelf and grab a book whenever you need it, even in the middle of reading.",
      "In the second library (ES modules), you write your full list of books on a form at the front desk before you start, and the librarian prepares them all in advance.",
      "Because the second library knows your list up front, it can skip books nobody asked for (tree-shaking) and fetch them more cleverly.",
      "# What it is",
      "A module is a file whose variables are private unless it explicitly exports them.",
      "CommonJS (CJS) is Node's original module system: `const x = require('x')` and `module.exports = ...`.",
      "ES modules (ESM) are the official JavaScript standard: `import x from 'x'` and `export ...`. They work in browsers and Node.",
      "Comparison:",
      "  Syntax — ESM uses `import`/`export`; CJS uses `require()`/`module.exports`.",
      "  When resolved — ESM imports are static (known before the code runs); `require` runs at runtime and can be called anywhere, even inside an `if`.",
      "  Loading — ESM loads asynchronously and supports top-level `await`; CJS loads synchronously.",
      "  Bindings — ESM exports are live read-only bindings (you see later updates); CJS gives you whatever value `module.exports` held when you read it (primitives are copied).",
      "  Tree-shaking — removing unused exports from a bundle — works well with ESM, poorly with CJS.",
      "  Defaults — ESM is always in strict mode and top-level `this` is `undefined`; CJS has `__dirname`, `__filename` and `require` (ESM uses `import.meta.dirname` / `import.meta.filename` in Node 20.11+).",
      "# How it works",
      "In Node, a file is ESM if it ends in `.mjs`, or ends in `.js` and the nearest `package.json` has `type: 'module'`. `.cjs` is always CommonJS.",
      "ESM loads in phases: parse all files and find imports, link each import to its export, then evaluate the code.",
      "CJS runs `require()` like a normal function call: it reads the file, wraps it in a function, runs it and returns `module.exports`. Results are cached.",
      "ESM can import CommonJS (you get `module.exports` as the default export).",
      "CJS can load ESM with dynamic `import()`; modern Node (20.19+ / 22.12+) can also `require()` an ES module as long as it has no top-level `await`.",
      "# Example walkthrough",
      "In `counter.mjs`, `count` is exported and later changed by `increment()`.",
      "In `main.mjs`, after calling `increment()`, the imported `count` shows 1 because ESM bindings are live.",
      "In the CJS version, `n` was copied into the exports object, so `counter.n` still shows 0 after `increment()`.",
      "`__dirname` exists only in CommonJS; the ESM file uses `import.meta.dirname`.",
      "# Why it matters / when to use",
      "New Node projects should usually be ESM (`type: 'module'` in package.json), matching browsers and modern tooling.",
      "Library authors often publish both formats using the `exports` field in `package.json`.",
      "Understanding the difference explains errors like `require is not defined in ES module scope` or `Cannot use import statement outside a module`.",
      "# Common mistakes",
      "Using `__dirname` in ESM: it does not exist. Use `import.meta.dirname` (Node 20.11+).",
      "Leaving out file extensions in ESM relative imports (`./utils`). Node's ESM requires the full path: `./utils.js`.",
      "Mixing `module.exports` and `export` in the same file.",
      "Expecting `import` statements inside an `if`. Static imports must be top-level; use `await import()` for conditional loading.",
      "# Say this in the interview",
      "CommonJS uses `require` and `module.exports`, loads synchronously at runtime and exports plain values. ES modules use `import`/`export`, are statically analysable so bundlers can tree-shake, load asynchronously with top-level await, and export live read-only bindings. In Node I pick ESM for new code via the package.json `type` field and use dynamic `import()` for interop.",
      "  Follow-up: How does Node decide the format? — File extension (`.mjs`/`.cjs`) or the `type` field in the nearest package.json.",
      "  Follow-up: Can CJS load ESM? — Yes with `import()`, and recent Node versions allow `require()` of synchronous ESM.",
    ],
    code: `// ---- counter.mjs (ES module) ----
export let count = 0;
export function increment() { count++; }

// ---- main.mjs ----
import { count, increment } from "./counter.mjs"; // full extension required
increment();
console.log(count); // → 1  (live binding: sees the update)
console.log(import.meta.dirname); // folder of this file (Node 20.11+)
const { default: os } = await import("node:os"); // dynamic import + top-level await

// ---- counter.cjs (CommonJS) ----
let n = 0;
module.exports = { n, increment: () => { n++; } };

// ---- main.cjs ----
const counter = require("./counter.cjs");
counter.increment();
console.log(counter.n); // → 0  (the value was copied, not live)
console.log(__dirname); // available in CommonJS only

// package.json: { "type": "module" } makes .js files ESM`,
  },
  {
    id: 'optional-chaining-nullish',
    group: 'ES6+ Features',
    stars: 4,
    difficulty: 'Easy',
    q: 'What are optional chaining (`?.`) and nullish coalescing (`??`)?',
    a: [
      "# ELI5",
      "Optional chaining is like knocking on a door before walking in. If the house does not exist, you just leave quietly instead of crashing into the wall.",
      "Nullish coalescing is a backup plan: 'Use my answer, but if I said nothing at all, use the default.'",
      "Importantly, `??` treats 'zero' or 'empty' as a real answer; only 'nothing' (null or undefined) triggers the backup.",
      "# What it is",
      "`null` and `undefined` are called nullish values: they mean 'no value'.",
      "Optional chaining `a?.b` reads `b` only if `a` is not nullish; otherwise the whole expression becomes `undefined` instead of throwing a TypeError.",
      "Forms: `obj?.prop`, `obj?.[key]` (dynamic key) and `fn?.()` (call only if the function exists).",
      "Nullish coalescing `a ?? b` returns `a` unless it is `null` or `undefined`, in which case it returns `b`.",
      "Comparison with `||`:",
      "  `a || b` falls back for ANY falsy value: `0`, `''`, `false`, `NaN`, `null`, `undefined`.",
      "  `a ?? b` falls back ONLY for `null` and `undefined`, so `0`, `''` and `false` are kept.",
      "Logical assignment (ES2021): `x ??= 5` assigns only if `x` is nullish; `x ||= 5` if falsy; `x &&= 5` if truthy.",
      "# How it works",
      "`?.` evaluates the left side. If it is `null` or `undefined`, it stops (short-circuits) and returns `undefined`.",
      "Short-circuiting means the rest of the chain, including any function calls or side effects, is skipped.",
      "If the left side is not nullish, it continues normally.",
      "`??` evaluates the left side; if it is not nullish it returns it and never evaluates the right side.",
      "You cannot mix `??` with `||` or `&&` without parentheses; `a || b ?? c` is a SyntaxError.",
      "# Example walkthrough",
      "`user.address?.city` prints `undefined` instead of crashing because `address` is missing.",
      "`user.getName?.()` safely skips the call because `getName` is not defined.",
      "`settings.retries || 3` wrongly gives 3 when retries is 0; `settings.retries ?? 3` correctly keeps 0.",
      "`settings.timeout ??= 5000` fills in a missing timeout without overwriting existing values.",
      "The last block proves short-circuiting: `calls++` never runs, so `calls` stays 0.",
      "# Why it matters / when to use",
      "Reading deeply nested API or DB data where some fields may be missing: `order?.customer?.address?.zip`.",
      "Config defaults where `0`, `false` or empty string are valid values: `const port = config.port ?? 3000`.",
      "Optional callbacks: `options.onProgress?.(percent)`.",
      "# Common mistakes",
      "Using `||` for defaults and losing valid `0` or `false` values. Use `??`.",
      "Overusing `?.` everywhere, which hides real bugs where data SHOULD exist. Validate required data instead.",
      "Writing `obj?.a.b` and expecting it to protect `b` when `a` is missing: it only checks `obj`. Use `obj?.a?.b`.",
      "Trying to assign with optional chaining (`obj?.a = 1`), which is a SyntaxError.",
      "# Say this in the interview",
      "Optional chaining `?.` safely accesses a property, index or function call, returning `undefined` instead of throwing when the left side is null or undefined, and it short-circuits the rest of the chain. Nullish coalescing `??` provides a default only for null or undefined, unlike `||`, which also replaces 0, empty string and false. Together they make defensive data access concise.",
      "  Follow-up: Difference between `??` and `||`? — `||` checks falsy, `??` checks only nullish.",
      "  Follow-up: What is `??=`? — Assign only when the variable is currently null or undefined.",
    ],
    code: `const user = { name: "Ann" }; // no address, no getName

console.log(user.address?.city);  // → undefined (no crash)
console.log(user.getName?.());    // → undefined (call skipped)
const key = "name";
console.log(user?.[key]);         // → Ann

// Without ?. this would throw:
try { user.address.city; } catch (e) { console.log(e.name); } // → TypeError

// ?? vs ||
const settings = { retries: 0, label: "" };
console.log(settings.retries || 3);     // → 3   (wrong: 0 was valid)
console.log(settings.retries ?? 3);     // → 0   (correct)
console.log(settings.label ?? "N/A");   // → ''  (empty string kept)
console.log(settings.missing ?? "N/A"); // → N/A

// Logical assignment
settings.timeout ??= 5000;  // only set if missing
settings.retries ??= 10;    // already 0, so unchanged
console.log(settings.timeout, settings.retries); // → 5000 0

// Short-circuit: nothing after ?. runs
let calls = 0;
const nothing = null;
nothing?.foo(calls++);
console.log(calls); // → 0`,
  },
  {
    id: 'iterators-iterables',
    group: 'ES6+ Features',
    stars: 3,
    difficulty: 'Medium',
    q: 'What are iterables and iterators?',
    a: [
      "# ELI5",
      "A book is an iterable: something you can read page by page.",
      "A bookmark is an iterator: it remembers which page you are on, gives you the next page when asked, and tells you when you reach the end.",
      "You can make many bookmarks for the same book, each tracking its own position.",
      "# What it is",
      "An iterator is an object with a `next()` method that returns `{ value, done }`: `value` is the next item, `done` is true when there are no more.",
      "An iterable is an object with a method under the key `Symbol.iterator` that returns a fresh iterator.",
      "`Symbol.iterator` is a built-in symbol — a special unique key — that JS uses to find this method.",
      "This pair is called the iteration protocol: any object following it works with `for...of`, spread `[...x]`, array destructuring, `Array.from`, `Promise.all`, `new Map()` and `new Set()`.",
      "Built-in iterables: Array, String, Map, Set, TypedArray, `arguments`, NodeList. Plain objects are NOT iterable (use `Object.entries(obj)`).",
      "# How it works",
      "`for (const x of thing)` calls `thing[Symbol.iterator]()` to get an iterator.",
      "It calls `iterator.next()` repeatedly.",
      "Each `{ value, done: false }` result runs the loop body with `value`.",
      "When it gets `{ done: true }`, the loop ends.",
      "If you `break` early, it calls `iterator.return()` (if present) so the iterator can clean up.",
      "Generator functions (`function*`) create iterators automatically, which is the easiest way to implement `Symbol.iterator`.",
      "ES2025 iterator helpers add lazy methods directly on iterators: `.map()`, `.filter()`, `.take()`, `.drop()`, `.toArray()` (available in Node 22+).",
      "# Example walkthrough",
      "`manualRange` implements `next()` by hand: it returns 1, 2, 3, then `done: true`.",
      "`range` does the same with a generator method `*[Symbol.iterator]()`, which is much shorter.",
      "`for...of` over `range` prints each number.",
      "Calling `next()` manually on an array's iterator shows the raw `{ value, done }` objects.",
      "`.values()` returns an array iterator; chaining `.filter().map().take(2).toArray()` processes items lazily and stops after two results.",
      "`for...of` on a plain object throws `TypeError: ... is not iterable`.",
      "# Why it matters / when to use",
      "Making your own data structures (linked list, tree, paginated result) work with `for...of` and spread.",
      "Lazy processing of large or infinite sequences without building huge arrays.",
      "Understanding why `Map`, `Set` and strings can be spread but plain objects cannot.",
      "# Common mistakes",
      "Trying to `for...of` a plain object. Use `Object.keys`, `Object.values` or `Object.entries`.",
      "Returning the same iterator object every time from `Symbol.iterator`, so a second loop finds it already finished. Return a fresh one each call.",
      "Confusing `for...in` (keys) with `for...of` (values via the iterator).",
      "# Say this in the interview",
      "An iterable is an object with a `[Symbol.iterator]()` method that returns an iterator, and an iterator is an object whose `next()` returns `{ value, done }`. That protocol powers `for...of`, spread, destructuring and many built-ins. Arrays, strings, Maps and Sets are iterable but plain objects are not; I usually implement custom iterables with a generator.",
      "  Follow-up: Why use generators for this? — They create the iterator object and manage its state for you.",
      "  Follow-up: What are iterator helpers? — ES2025 lazy methods like `.map`, `.filter`, `.take` directly on iterators.",
    ],
    code: `// Hand-written iterator
const manualRange = {
  [Symbol.iterator]() {
    let current = 1;
    return {
      next: () => current <= 3
        ? { value: current++, done: false }
        : { value: undefined, done: true },
    };
  },
};
console.log([...manualRange]); // → [ 1, 2, 3 ]

// Same thing with a generator method
const range = {
  from: 1, to: 3,
  *[Symbol.iterator]() {
    for (let i = this.from; i <= this.to; i++) yield i;
  },
};
for (const n of range) console.log(n); // → 1, 2, 3 (one per line)

// Using an iterator directly
const it = [10, 20][Symbol.iterator]();
console.log(it.next()); // → { value: 10, done: false }
console.log(it.next()); // → { value: 20, done: false }
console.log(it.next()); // → { value: undefined, done: true }

// ES2025 iterator helpers (Node 22+): lazy pipeline
const evensDoubled = [1, 2, 3, 4, 5, 6].values()
  .filter((n) => n % 2 === 0).map((n) => n * 2).take(2).toArray();
console.log(evensDoubled); // → [ 4, 8 ]

try { for (const x of { a: 1 }) {} } catch (e) { console.log(e.name); } // → TypeError`,
  },
  {
    id: 'proxy-reflect',
    group: 'ES6+ Features',
    stars: 3,
    difficulty: 'Hard',
    q: 'What are `Proxy` and `Reflect`?',
    a: [
      "# ELI5",
      "A celebrity has a personal assistant. Anyone who wants to talk to the celebrity must go through the assistant.",
      "The assistant can check who you are, write down every request, refuse some, or answer on the celebrity's behalf.",
      "A `Proxy` is that assistant standing in front of an object. `Reflect` is the assistant's rulebook for 'just do what would normally happen'.",
      "# What it is",
      "`new Proxy(target, handler)` creates a wrapper object around `target`. Code uses the proxy instead of the original object.",
      "The handler is an object of traps — functions that intercept basic operations such as reading a property (`get`), writing (`set`), checking `in` (`has`), deleting (`deleteProperty`) and calling a function (`apply`).",
      "If a trap is not defined, the operation passes straight through to the target.",
      "`Reflect` is a built-in object with one function per trap (`Reflect.get`, `Reflect.set`, `Reflect.has`...) that performs the default behaviour. You call it inside traps to forward the operation correctly.",
      "# How it works",
      "Your code does `proxy.age = 30`.",
      "The engine sees `proxy` is a Proxy and calls `handler.set(target, 'age', 30, receiver)`; `receiver` is the object the operation was originally done on (usually the proxy).",
      "Your trap runs custom logic (validation, logging).",
      "The trap calls `Reflect.set(target, key, value, receiver)` to actually store the value, and returns true for success (returning false throws a TypeError in strict mode).",
      "Reads work the same way through the `get` trap.",
      "Proxies see every property, including ones added later and deletions, which `Object.defineProperty` getters and setters cannot.",
      "# Example walkthrough",
      "`validated` uses a `set` trap: assigning `age = 30` succeeds, but `age = 'old'` throws TypeError.",
      "Its `get` trap returns `'N/A'` for properties that do not exist instead of `undefined`.",
      "`logged` logs every property read, so `logged.name` prints `read name` and then `Ann`.",
      "`negativeArray([1, 2, 3])[-1]` uses a `get` trap to support Python-style negative indexes, returning the last item, 3.",
      "# Why it matters / when to use",
      "Validation layers and schema enforcement on config objects.",
      "Reactivity systems: Vue 3 and MobX use proxies to detect when data changes and re-render.",
      "ORMs and API clients that create methods on the fly (`db.users.findAll()` without defining `users` ahead of time).",
      "Logging, access control, and test mocks that record calls.",
      "# Common mistakes",
      "Forgetting to return `true` from the `set` trap, which throws TypeError in strict mode.",
      "Doing `target[key] = value` instead of `Reflect.set`, which can break inherited setters that rely on `receiver`.",
      "Using proxies in performance-critical hot paths: every operation goes through a function call.",
      "Expecting private class fields (`#x`) to work through a proxy; methods that read them throw TypeError when called on the proxy.",
      "# Say this in the interview",
      "A Proxy wraps an object and lets me intercept fundamental operations like get, set, has and delete through trap functions. Reflect provides the default behaviour for each trap, so inside a trap I add custom logic and then forward with `Reflect.set` or `Reflect.get`. It is used for validation, logging and reactivity systems like Vue 3, but it adds overhead.",
      "  Follow-up: Why use Reflect instead of `target[key]`? — It handles the receiver, getters and return values correctly.",
      "  Follow-up: Proxy vs `Object.defineProperty`? — A Proxy covers all properties including new ones and deletions; defineProperty works per existing property.",
    ],
    code: `// 1) Validation + defaults
const validated = new Proxy({}, {
  set(target, key, value, receiver) {
    if (key === "age" && !Number.isInteger(value)) {
      throw new TypeError("age must be an integer");
    }
    return Reflect.set(target, key, value, receiver); // default behaviour, returns true
  },
  get(target, key, receiver) {
    return key in target ? Reflect.get(target, key, receiver) : "N/A";
  },
});
validated.age = 30;
console.log(validated.age);   // → 30
console.log(validated.email); // → N/A
try { validated.age = "old"; } catch (e) { console.log(e.message); } // → age must be an integer

// 2) Logging every read
const logged = new Proxy({ name: "Ann" }, {
  get(target, key, receiver) {
    console.log("read", String(key));
    return Reflect.get(target, key, receiver);
  },
});
console.log(logged.name); // → read name   then   → Ann

// 3) Negative array indexes
const negativeArray = (arr) => new Proxy(arr, {
  get(target, key, receiver) {
    const i = Number(key);
    return Number.isInteger(i) && i < 0
      ? target[target.length + i]
      : Reflect.get(target, key, receiver);
  },
});
console.log(negativeArray([1, 2, 3])[-1]); // → 3`,
  },
  {
    id: 'modern-es-features',
    group: 'ES6+ Features',
    stars: 3,
    difficulty: 'Easy',
    q: 'Which recent ECMAScript features (ES2022 onward) should you know?',
    a: [
      "# ELI5",
      "JavaScript gets a yearly upgrade, like a phone getting a software update with a few handy new buttons.",
      "Each update adds small tools that replace long, clumsy code you used to write by hand.",
      "Knowing the recent buttons shows an interviewer you keep your toolbox up to date.",
      "# What it is",
      "ECMAScript (ES) is the official specification of JavaScript, released every June with a new year number (ES2022, ES2023, ...).",
      "ES2022:",
      "  `arr.at(-1)` reads from the end (last item).",
      "  `Object.hasOwn(obj, key)` — a safer `hasOwnProperty`.",
      "  Class fields, `#private` fields and methods, and `static {}` blocks.",
      "  Top-level `await` in modules and `new Error(msg, { cause })` to chain errors.",
      "ES2023: `findLast`/`findLastIndex`, and non-mutating copies `toSorted`, `toReversed`, `toSpliced`, `with(index, value)`.",
      "ES2024: `Object.groupBy`/`Map.groupBy`, `Promise.withResolvers`, `Array.fromAsync`, resizable `ArrayBuffer`, and the regex `v` flag.",
      "ES2025: Set methods (`union`, `intersection`, `difference`, `isSubsetOf`...), iterator helpers (`.map`, `.filter`, `.take` on iterators), `Promise.try`, `RegExp.escape`, and JSON module imports (`with { type: 'json' }`).",
      "Not ECMAScript but everywhere: `structuredClone` (deep copy), `fetch`, `AbortSignal.timeout` — these are Web/Node platform APIs.",
      "# How it works",
      "New proposals go through TC39 (the committee that designs JS) in stages 0 to 4; stage 4 means it ships in the next yearly edition.",
      "Engines like V8 (used by Chrome and Node) often ship features before the official yearly release.",
      "Check support on MDN or node.green before relying on a feature in an older Node version; Node 22+ supports nearly everything listed above.",
      "# Example walkthrough",
      "`orders.at(-1)` returns the last order without `orders[orders.length - 1]`.",
      "`toSorted` returns a sorted copy, leaving the original order untouched (first id is still 3).",
      "`Object.groupBy` groups orders by status into `{ paid: [...], pending: [...] }`.",
      "`a.union(b)` combines two Sets and `a.intersection(b)` keeps the common items.",
      "`Promise.withResolvers` gives a Promise plus its `resolve` function, so a timer can resolve it from outside.",
      "`new Error('config load failed', { cause: err })` keeps the original SyntaxError attached for debugging.",
      "`structuredClone` makes a deep copy, so changing the copy does not affect the original.",
      "# Why it matters / when to use",
      "Cleaner backend code: grouping DB rows, immutable sorting for API responses, error chaining in services.",
      "Fewer utility dependencies (lodash `groupBy`, `cloneDeep`, `last`).",
      "Interviewers use this question to see whether you keep up with the language.",
      "# Common mistakes",
      "Using new features on an older runtime and getting `is not a function`. Check your Node version.",
      "Confusing `sort` (mutates) with `toSorted` (copies).",
      "Calling `structuredClone` on objects with functions: it throws, and class instances lose their prototype (become plain objects).",
      "# Say this in the interview",
      "From ES2022 I regularly use `at()`, `Object.hasOwn`, private class fields, top-level await and error `cause`. ES2023 added non-mutating array methods like `toSorted` and `with`, ES2024 added `Object.groupBy` and `Promise.withResolvers`, and ES2025 brought Set methods, iterator helpers and `Promise.try`. I also rely on platform APIs like `structuredClone` and `fetch` in Node.",
      "  Follow-up: How does a feature get into JS? — Through the TC39 stage process; stage 4 ships in the next yearly edition.",
      "  Follow-up: What does `Promise.withResolvers` return? — `{ promise, resolve, reject }`, so you can settle a Promise from outside.",
    ],
    code: `const orders = [
  { id: 3, status: "paid", total: 30 },
  { id: 1, status: "pending", total: 10 },
  { id: 2, status: "paid", total: 20 },
];

console.log(orders.at(-1).id); // → 2  (ES2022: last item)
console.log(Object.hasOwn(orders[0], "status")); // → true

const byId = orders.toSorted((a, b) => a.id - b.id); // ES2023: copy, no mutation
console.log(byId.map((o) => o.id), orders[0].id); // → [ 1, 2, 3 ] 3

const grouped = Object.groupBy(orders, (o) => o.status); // ES2024
console.log(Object.keys(grouped)); // → [ 'paid', 'pending' ]

const a = new Set([1, 2]), b = new Set([2, 3]);
console.log([...a.union(b)], [...a.intersection(b)]); // ES2025 → [ 1, 2, 3 ] [ 2 ]

const { promise, resolve } = Promise.withResolvers(); // ES2024
setTimeout(() => resolve("ready"), 10);
console.log(await promise); // → ready

try {
  try { JSON.parse("{bad"); }
  catch (err) { throw new Error("config load failed", { cause: err }); } // ES2022
} catch (e) { console.log(e.message, "<-", e.cause.name); } // → config load failed <- SyntaxError

const original = { nested: { x: 1 } };
const copy = structuredClone(original); // platform API: deep copy
copy.nested.x = 99;
console.log(original.nested.x); // → 1`,
  },
  {
    id: 'template-literals',
    group: 'ES6+ Features',
    stars: 2,
    difficulty: 'Easy',
    q: 'What are template literals?',
    a: [
      "# ELI5",
      "Think of a birthday card with blanks: 'Happy birthday, ____! You are ____ years old.'",
      "Instead of cutting and gluing words together, you just fill the blanks.",
      "A template literal is a string with blanks that JavaScript fills in for you.",
      "# What it is",
      "A template literal is a string written between backticks instead of quotes.",
      "Interpolation: inside it, a dollar sign followed by curly braces holds any JavaScript expression, and its result is inserted into the string.",
      "Multi-line: a template literal can span several lines, and the line breaks are kept.",
      "Inserted values are converted to text with the same rules as `String(value)`.",
      "Tagged templates: a function name placed right before the opening backtick receives the pieces and values to process them itself.",
      "`String.raw` is a built-in tag that keeps backslashes as typed (no escape processing), handy for Windows paths and regexes.",
      "# How it works",
      "The engine splits the template into fixed text parts and expression parts.",
      "Each expression is evaluated left to right.",
      "Each result is converted to a string and glued between the text parts.",
      "The final result is a normal string; nothing special remains at runtime.",
      "# Example walkthrough",
      "`greeting` inserts `name` and the result of `age + 1`, giving `Hi Ann, next year you will be 31`.",
      "The ternary inside the braces picks 'adult' because age is 30.",
      "`sql` spans three lines and keeps the line breaks, so splitting on newlines gives 3 lines.",
      "Interpolating an object prints `[object Object]`, so we use `JSON.stringify` instead.",
      "An array is converted with `String(array)`, which joins items with commas.",
      "`String.raw` keeps the backslashes in the Windows path.",
      "# Why it matters / when to use",
      "Building log messages, error messages and URLs, such as `/api/users/<id>/orders` with the id inserted.",
      "Multi-line text like email bodies or HTML snippets.",
      "With tags: safe SQL builders, GraphQL `gql`, styled-components.",
      "# Common mistakes",
      "Using normal quotes and wondering why the dollar-brace text appears literally. Interpolation only works in backticks.",
      "Building SQL queries by interpolating user input, which causes SQL injection. Use parameterised queries.",
      "Interpolating objects and getting `[object Object]`; stringify them first.",
      "Unintended indentation inside multi-line templates becomes part of the string.",
      "# Say this in the interview",
      "Template literals are backtick strings that support expression interpolation and real multi-line text. Any expression can go inside the placeholder and is converted with `String()`. A tag function in front lets you process the parts, and `String.raw` skips escape processing. I never use them to build SQL from user input.",
      "  Follow-up: What does interpolating an array give? — Its items joined with commas, like `String([1, 2])` which is '1,2'.",
      "  Follow-up: What is a tagged template? — A function that receives the string parts and the values separately.",
    ],
    code: `const name = "Ann";
const age = 30;

const greeting = \`Hi \${name}, next year you will be \${age + 1}\`;
console.log(greeting); // → Hi Ann, next year you will be 31

console.log(\`Status: \${age >= 18 ? "adult" : "minor"}\`); // → Status: adult

const sql = \`SELECT *
FROM users
WHERE active = true\`;
console.log(sql.split("\\n").length); // → 3 (line breaks kept)

const user = { id: 1 };
console.log(\`user: \${user}\`);                 // → user: [object Object]
console.log(\`user: \${JSON.stringify(user)}\`); // → user: {"id":1}

console.log(\`items: \${[1, 2, 3]}\`); // → items: 1,2,3

console.log(String.raw\`C:\\new\\table\`); // → C:\\new\\table  (backslashes kept as typed)`,
  },
  {
    id: 'symbols',
    group: 'ES6+ Features',
    stars: 2,
    difficulty: 'Medium',
    q: 'What is a `Symbol` and when would you use it?',
    a: [
      "# ELI5",
      "Imagine a coat check where every ticket is truly unique, even if two tickets have the same word printed on them.",
      "Nobody can fake your ticket or accidentally grab your coat with theirs.",
      "A Symbol is that unique ticket, used as a property key that can never clash with someone else's key.",
      "# What it is",
      "`Symbol` is a primitive type (like string or number) whose every value is unique.",
      "`Symbol('id')` creates a new symbol; the text 'id' is only a description for debugging. `Symbol('id') !== Symbol('id')`.",
      "Symbols can be used as object property keys. Such keys never collide with string keys or other symbols.",
      "Symbol-keyed properties are hidden from `for...in`, `Object.keys` and `JSON.stringify`, but are not truly private: `Object.getOwnPropertySymbols` and `Reflect.ownKeys` list them.",
      "`Symbol.for('key')` uses a global registry: the same key always returns the same symbol, even across files.",
      "Well-known symbols are built-in symbols that let you customise language behaviour: `Symbol.iterator` (make an object loopable), `Symbol.asyncIterator`, `Symbol.toPrimitive` (control conversion), `Symbol.hasInstance` (customise `instanceof`).",
      "# How it works",
      "Calling `Symbol()` returns a brand-new unique value; you cannot use `new Symbol()`.",
      "Use bracket syntax to set and read: `obj[sym] = value`, `obj[sym]`.",
      "Built-in operations look up well-known symbols: `for...of` calls `obj[Symbol.iterator]()`, and `+obj` or template strings call `obj[Symbol.toPrimitive](hint)` if it exists.",
      "# Example walkthrough",
      "`a === b` is false even with the same description, proving uniqueness.",
      "`user[ID]` stores metadata; `Object.keys(user)` and `JSON.stringify` do not show it.",
      "`Object.getOwnPropertySymbols(user)` still finds it, so it is hidden, not secret.",
      "`Symbol.for('app.key')` returns the same symbol twice, so the comparison is true.",
      "`money` defines `Symbol.toPrimitive`: in math it becomes 100, in a string it becomes '$100'.",
      "Concatenating a symbol with a string throws TypeError.",
      "# Why it matters / when to use",
      "Adding metadata to objects you do not own (from a library) without risking name clashes.",
      "Making custom classes iterable or controlling how they convert to numbers and strings.",
      "Unique constants for event types or states that cannot be confused with plain strings.",
      "# Common mistakes",
      "Thinking symbols give real privacy. Use `#private` class fields for that.",
      "Expecting symbol properties to appear in JSON responses; they are silently dropped.",
      "Concatenating a symbol with a string (`'id: ' + sym`) throws TypeError; use `sym.toString()` or `sym.description`.",
      "# Say this in the interview",
      "A Symbol is a unique, immutable primitive mostly used as a collision-free property key. Symbol keys are skipped by `Object.keys`, `for...in` and JSON, though not truly private. `Symbol.for` shares symbols through a global registry, and well-known symbols like `Symbol.iterator` and `Symbol.toPrimitive` let me hook into language behaviour.",
      "  Follow-up: How do you read symbol keys? — `Object.getOwnPropertySymbols(obj)` or `Reflect.ownKeys(obj)`.",
      "  Follow-up: `Symbol()` vs `Symbol.for()`? — `Symbol()` always creates a new one; `Symbol.for()` reuses a registered one by key.",
    ],
    code: `const a = Symbol("id");
const b = Symbol("id");
console.log(a === b);       // → false (always unique)
console.log(a.description); // → id

const ID = Symbol("id");
const user = { name: "Ann", [ID]: 42 }; // symbol as a key
console.log(user[ID]);                  // → 42
console.log(Object.keys(user));         // → [ 'name' ]
console.log(JSON.stringify(user));      // → {"name":"Ann"}
console.log(Object.getOwnPropertySymbols(user)); // → [ Symbol(id) ]

console.log(Symbol.for("app.key") === Symbol.for("app.key")); // → true (registry)

// Well-known symbol: control type conversion
const money = {
  amount: 100,
  [Symbol.toPrimitive](hint) {
    return hint === "number" ? this.amount : "$" + this.amount;
  },
};
console.log(+money * 2);        // → 200
console.log(\`Total: \${money}\`); // → Total: $100

try { "id: " + a; } catch (e) { console.log(e.name); } // → TypeError`,
  },
  {
    id: 'dynamic-import',
    group: 'ES6+ Features',
    stars: 2,
    difficulty: 'Medium',
    q: 'What is dynamic `import()`?',
    a: [
      "# ELI5",
      "A normal `import` is like packing everything in your suitcase before a trip, even the snow boots you might not need.",
      "Dynamic `import()` is like having a shop at the destination: you buy the snow boots only if it actually snows.",
      "Your suitcase (startup time) stays light, and you only pay for what you use.",
      "# What it is",
      "`import(path)` is a function-like expression that loads a module at runtime and returns a Promise.",
      "The Promise resolves to the module namespace object — an object holding all the module's exports (`default` plus named exports).",
      "Unlike a static `import` statement, it can be used anywhere: inside `if` blocks, functions and loops, and the path can be a computed string.",
      "It works in both ES modules and CommonJS files, which makes it the bridge for loading ESM-only packages from CommonJS.",
      "# How it works",
      "When the line runs, the runtime resolves the path to a file or package.",
      "If that module was already loaded, the cached instance is returned (modules are evaluated once).",
      "Otherwise it reads the file, loads its own imports, runs it, and resolves the Promise with its exports.",
      "If loading fails (file missing, syntax error, error thrown at top level), the Promise rejects.",
      "Bundlers (webpack, Vite, Next.js) see `import()` and split that module into a separate chunk file that is downloaded only when needed.",
      "# Example walkthrough",
      "`loadExporter('csv')` checks the format against an allow-list, builds the path `./exporters/csv.js` and imports it only when that format is requested.",
      "The returned object is the namespace; `mod.default` is the default export.",
      "The `try/catch` handles an unknown format or a missing file.",
      "`maybeCompress` loads `node:zlib` only when compression is actually needed; later calls reuse the cached module.",
      "# Why it matters / when to use",
      "Backend: plugin systems or per-tenant modules chosen by config at runtime.",
      "Faster CLI and serverless cold starts by deferring heavy dependencies (PDF generators, image libraries) until a command needs them.",
      "Loading ESM-only packages from CommonJS code.",
      "Frontend: code splitting routes and heavy widgets (`React.lazy` is built on it).",
      "# Common mistakes",
      "Forgetting to `await` and getting a Promise instead of the module.",
      "Forgetting `.default` when the module uses a default export.",
      "Fully dynamic paths (any user string) are a security risk and prevent bundlers from creating chunks; restrict to a known list.",
      "Using it for modules needed on every request; static imports are simpler and loaded once at startup anyway.",
      "# Say this in the interview",
      "Dynamic `import()` loads a module at runtime and returns a Promise of its namespace object. Unlike static imports it can be conditional and use computed paths, and it works from CommonJS too. Bundlers use it as a code-splitting point, so I use it for heavy or rarely used features, plugin loading and faster startup.",
      "  Follow-up: Is the module loaded twice if imported twice? — No, modules are cached after the first evaluation.",
      "  Follow-up: How do you get the default export? — `const { default: x } = await import('./x.js')`.",
    ],
    code: `// Load an exporter only when that format is requested
async function loadExporter(format) {
  const allowed = ["csv", "json"];          // never import arbitrary user input
  if (!allowed.includes(format)) throw new Error("unknown format " + format);
  const mod = await import(\`./exporters/\${format}.js\`); // namespace object
  return mod.default;                       // the default export
}

try {
  const exportCsv = await loadExporter("csv");
  console.log(exportCsv([{ id: 1 }]));     // e.g. → id\\n1
} catch (err) {
  console.log("failed:", err.message);     // e.g. if the file does not exist
}

// Defer a heavy dependency until it is really needed
async function maybeCompress(data, shouldCompress) {
  if (!shouldCompress) return data;
  const { gzipSync } = await import("node:zlib"); // loaded on demand, then cached
  return gzipSync(data);
}
console.log((await maybeCompress("hello", true)).length > 0); // → true

// Works from CommonJS too (to load an ESM-only package):
// const { default: chalk } = await import("chalk");`,
  },
  {
    id: 'tagged-templates',
    group: 'ES6+ Features',
    stars: 1,
    difficulty: 'Medium',
    q: 'What are tagged template literals?',
    a: [
      "# ELI5",
      "Imagine you dictate a letter to a secretary, with some blanks filled in by other people.",
      "Before the letter goes out, the secretary inspects each filled-in part and can clean it up, translate it or check it is safe.",
      "A tag function is that secretary: it sees the fixed text and the inserted values separately and decides the final result.",
      "# What it is",
      "A tagged template is a function name written directly before a template literal, with no parentheses.",
      "The function (the tag) is called with: first, an array of the fixed string pieces; then, each interpolated value as separate arguments.",
      "There is always one more string piece than values (the pieces surround the values, and can be empty strings).",
      "The strings array also has a `.raw` property holding the pieces exactly as typed, with escapes unprocessed.",
      "The tag can return anything — a string, an object, a query — not just a string.",
      "# How it works",
      "The engine splits the template into string pieces and expressions.",
      "It evaluates every expression.",
      "It calls `tag(strings, value1, value2, ...)` instead of building a string itself.",
      "Whatever the tag returns is the value of the whole expression.",
      "The `strings` array is frozen and reused for the same call site, which libraries use for fast caching.",
      "# Example walkthrough",
      "In `upper`, for the template with one value `name`, `strings` is `['hi ', '!']` and `vals` is `['ann']`.",
      "The reduce glues piece 0, the uppercased value, then piece 1, giving 'hi ANN!'.",
      "`sql` does not glue values into the text; it returns `{ text, values }` with `$1`, `$2` placeholders, which is how safe SQL libraries prevent injection.",
      "The malicious input stays in `values`, so the database treats it as data, not code.",
      "`showRaw` returns `strings.raw[0]`, where the backslash-n is still two characters.",
      "# Why it matters / when to use",
      "Safe SQL builders (for example the `postgres` library and Prisma's `$queryRaw`) use tags to turn values into parameters.",
      "HTML escaping, i18n translation, GraphQL `gql`, CSS-in-JS like styled-components.",
      "Explains a common interview follow-up about how such libraries avoid injection.",
      "# Common mistakes",
      "Adding parentheses around the template, like calling `tag(someString)`: the function then receives one finished string, not the separate parts.",
      "Forgetting the trailing string piece when rebuilding, which drops the final text.",
      "Assuming the tag must return a string.",
      "# Say this in the interview",
      "A tagged template calls a function with the template's string pieces as an array and the interpolated values as separate arguments, so the function decides how to combine them. The strings array also exposes `.raw`. It is used for safe SQL parameterisation, HTML escaping, GraphQL and CSS-in-JS.",
      "  Follow-up: How does a SQL tag prevent injection? — It replaces values with placeholders and sends them separately as parameters.",
      "  Follow-up: What is `String.raw`? — A built-in tag that returns the raw text without processing escapes.",
    ],
    code: `function upper(strings, ...vals) {
  // strings = ['hi ', '!'], vals = ['ann']
  return strings.reduce(
    (out, s, i) => out + s + (i < vals.length ? String(vals[i]).toUpperCase() : ""),
    ""
  );
}
const name = "ann";
console.log(upper\`hi \${name}!\`); // → hi ANN!

// A tiny safe SQL tag: values become parameters, never part of the text
function sql(strings, ...values) {
  const text = strings.reduce((q, s, i) => q + "$" + i + s);
  return { text, values };
}
const userInput = "1; DROP TABLE users";
const query = sql\`SELECT * FROM users WHERE id = \${userInput} AND active = \${true}\`;
console.log(query.text);   // → SELECT * FROM users WHERE id = $1 AND active = $2
console.log(query.values); // → [ '1; DROP TABLE users', true ]

// The raw strings
function showRaw(strings) { return strings.raw[0]; }
console.log(showRaw\`line1\\nline2\`); // → line1\\nline2 (escape not processed)`,
  },

  // ───────────────────────── Arrays & Collections ─────────────────────────
  {
    id: 'map-filter-reduce',
    group: 'Arrays & Collections',
    stars: 5,
    difficulty: 'Easy',
    q: 'Explain `map`, `filter` and `reduce`.',
    a: [
      "# ELI5",
      "Imagine a fruit factory with a conveyor belt of apples.",
      "`map` is the painting machine: every apple goes in, every apple comes out painted. Same number of apples, each changed.",
      "`filter` is the inspector: only good apples pass, bad ones are removed. Same apples, fewer of them.",
      "`reduce` is the juicer: all apples go in and one glass of juice comes out. Many items become one result.",
      "In code, the apples are array items and each machine is an array method that takes your function as its instructions.",
      "# What it is",
      "These are higher-order array methods — methods that take a function (a callback) as an argument.",
      "The callback receives `(element, index, array)`.",
      "`map(cb)` returns a NEW array of the same length, where each item is whatever `cb` returned.",
      "`filter(cb)` returns a NEW array containing only the items for which `cb` returned a truthy value (a value that counts as true in an `if`).",
      "`reduce(cb, initial)` returns a SINGLE value. Its callback receives `(accumulator, element, index, array)`; the accumulator is the running result carried from one step to the next.",
      "None of them change (mutate) the original array.",
      "Comparison:",
      "  Output — `map`: array of same length; `filter`: array of same or shorter length; `reduce`: any single value (number, object, array).",
      "  Callback returns — `map`: the new item; `filter`: true/false; `reduce`: the next accumulator.",
      "# How it works",
      "`map`:",
      "  Creates a result array.",
      "  Loops over each index, calls `cb(item, i, arr)`, and stores the return value at the same index.",
      "`filter`:",
      "  Loops over each item, calls `cb`, and pushes the item into the result only if the return value is truthy.",
      "`reduce`:",
      "  Sets `acc` to the initial value (or the first item if none is given, then starts from index 1).",
      "  For each item, sets `acc = cb(acc, item, i, arr)`.",
      "  Returns the final `acc`.",
      "All three skip holes in sparse arrays (missing indexes, like in `[1, , 3]`).",
      "# Example walkthrough",
      "`orders` has three orders, two of them paid.",
      "`.filter((o) => o.paid)` keeps the 50 and 30 orders.",
      "`.map((o) => o.amt)` turns them into `[50, 30]`.",
      "`.reduce((sum, n) => sum + n, 0)` starts at 0, then 0 + 50 = 50, then 50 + 30 = 80. Result: 80.",
      "The second `reduce` builds an object counting orders by paid status: `{ paid: 2, unpaid: 1 }`.",
      "The `map` with curly braces and no `return` gives `[undefined, undefined]`.",
      "The last line shows `reduce` on an empty array without an initial value throws TypeError.",
      "# Why it matters / when to use",
      "Transforming DB rows into API response shapes (`rows.map(toDto)`).",
      "Filtering out inactive users or invalid records before processing.",
      "Calculating totals, building lookup objects (`id -> item`), grouping and counting.",
      "Readable, declarative pipelines that avoid manual index bookkeeping.",
      "# Common mistakes",
      "Forgetting to `return` inside a callback with curly braces: `arr.map((x) => { x * 2 })` gives `[undefined, ...]`.",
      "Calling `reduce` without an initial value; on an empty array it throws. Always pass one.",
      "Using `map` just to loop for side effects (logging, saving). Use `forEach` or `for...of`.",
      "Passing an async callback to `map` and forgetting it returns Promises; wrap with `await Promise.all(arr.map(async ...))`.",
      "# Say this in the interview",
      "`map` transforms every element and returns a new array of the same length, `filter` returns a new array with only the elements whose callback returns truthy, and `reduce` folds the array into a single value using an accumulator. None of them mutate the original. I always pass an initial value to `reduce`, and I chain them for readable data pipelines, switching to a single loop only for very large arrays.",
      "  Follow-up: What if `reduce` has no initial value? — The first element becomes the accumulator; on an empty array it throws TypeError.",
      "  Follow-up: Can you implement `map` with `reduce`? — Yes: push `fn(x, i)` into an accumulator array that starts as `[]`.",
    ],
    code: `const orders = [
  { amt: 50, paid: true },
  { amt: 20, paid: false },
  { amt: 30, paid: true },
];

const total = orders
  .filter((o) => o.paid)           // [{50}, {30}]
  .map((o) => o.amt)               // [50, 30]
  .reduce((sum, n) => sum + n, 0); // 0 + 50 + 30
console.log(total); // → 80

// reduce can build any shape, e.g. an object of counts
const counts = orders.reduce((acc, o) => {
  const key = o.paid ? "paid" : "unpaid";
  acc[key] = (acc[key] ?? 0) + 1;
  return acc;                      // always return the accumulator!
}, {});
console.log(counts); // → { paid: 2, unpaid: 1 }

// Originals are untouched
console.log(orders.length); // → 3

// Gotcha: missing return with curly braces
console.log([1, 2].map((x) => { x * 2; })); // → [ undefined, undefined ]

// Gotcha: empty array without an initial value
try { [].reduce((a, b) => a + b); } catch (e) { console.log(e.name); } // → TypeError`,
  },
  {
    id: 'array-method-polyfills',
    group: 'Arrays & Collections',
    stars: 4,
    difficulty: 'Medium',
    q: 'Write polyfills for `Array.prototype.map` and `reduce`.',
    a: [
      "# ELI5",
      "A polyfill is like building your own copy of a kitchen gadget because your old kitchen does not have one.",
      "To build it right, you must know exactly what the original does, including its weird edge cases.",
      "This interview question checks whether you really understand how `map` and `reduce` work inside.",
      "# What it is",
      "A polyfill is code that implements a built-in feature for environments that lack it, matching the official behaviour.",
      "`Array.prototype` is the shared object every array inherits methods from; adding `myMap` there makes it callable as `[1, 2].myMap(...)`.",
      "Inside a method called as `arr.myMap(...)`, `this` refers to `arr`, the array the method was called on.",
      "Required `map` behaviour: callback gets `(element, index, array)`, optional `thisArg` sets `this` inside the callback, returns a new array of the same length, and skips holes.",
      "Required `reduce` behaviour: callback gets `(acc, element, index, array)`; with no initial value, the first element is the starting accumulator and the loop starts at the next index; on an empty array with no initial value it throws TypeError.",
      "# How it works",
      "myMap:",
      "  Check the callback is a function, otherwise throw TypeError (like the real one).",
      "  Create a result array with the same length.",
      "  Loop over every index; `i in this` checks the index actually exists (skips holes in sparse arrays).",
      "  Call the callback with `cb.call(thisArg, this[i], i, this)` and store the result at index `i`.",
      "myReduce:",
      "  Use a rest parameter `...init` so we can tell 'no initial value' apart from 'initial value is undefined'.",
      "  If no initial value: find the first existing element, use it as the accumulator, and start after it; throw if there is none.",
      "  For each remaining existing index, set `acc = cb(acc, this[i], i, this)`.",
      "  Return `acc`.",
      "# Example walkthrough",
      "`[1, 2, 3].myMap((x) => x * 2)` returns `[2, 4, 6]`.",
      "The `thisArg` example passes `{ factor: 10 }`, so `this.factor` inside a regular function callback is 10.",
      "`[1, 2, 3].myReduce((a, b) => a + b)` has no initial value: acc starts at 1, then 3, then 6.",
      "`myReduce` with initial value 10 gives 16.",
      "Calling it on an empty array without an initial value throws TypeError, matching the real `reduce`.",
      "# Why it matters / when to use",
      "A very common machine-coding round question for JS developers.",
      "Shows understanding of `this`, prototypes, `call`, sparse arrays and edge cases.",
      "In real projects you rarely write polyfills yourself; tools like core-js handle it. Never modify built-in prototypes in production code.",
      "# Common mistakes",
      "Using an arrow function for the method: arrow functions do not get their own `this`, so `this` would not be the array.",
      "Using `init === undefined` to detect a missing initial value; `reduce(fn, undefined)` is a valid initial value. Use the argument count.",
      "Forgetting to pass index and array to the callback, or ignoring `thisArg`.",
      "Using `push` in map, which collapses holes and shifts indexes.",
      "# Say this in the interview",
      "For `map` I attach a regular function to `Array.prototype`, validate the callback, create a new array of the same length and, for each existing index, call the callback with `thisArg`, element, index and array. For `reduce` I detect whether an initial value was passed by argument count; if not, I use the first element and start at the next index, and I throw a TypeError on an empty array. Both skip holes using `i in this`.",
      "  Follow-up: Why a regular function, not an arrow? — The method needs `this` bound to the calling array.",
      "  Follow-up: Implement `filter` too? — Same loop, but push the element only when the callback returns truthy.",
    ],
    code: `Array.prototype.myMap = function (cb, thisArg) {
  if (typeof cb !== "function") throw new TypeError(cb + " is not a function");
  const out = new Array(this.length);
  for (let i = 0; i < this.length; i++) {
    if (i in this) out[i] = cb.call(thisArg, this[i], i, this); // skip holes
  }
  return out;
};

Array.prototype.myReduce = function (cb, ...init) {
  if (typeof cb !== "function") throw new TypeError(cb + " is not a function");
  let i = 0;
  let acc;
  if (init.length) {
    acc = init[0];
  } else {
    while (i < this.length && !(i in this)) i++; // find first real element
    if (i >= this.length) throw new TypeError("Reduce of empty array with no initial value");
    acc = this[i++];
  }
  for (; i < this.length; i++) {
    if (i in this) acc = cb(acc, this[i], i, this);
  }
  return acc;
};

console.log([1, 2, 3].myMap((x) => x * 2)); // → [ 2, 4, 6 ]
console.log([1, 2].myMap(function (x) { return x * this.factor; }, { factor: 10 })); // → [ 10, 20 ]
console.log([1, 2, 3].myReduce((a, b) => a + b));     // → 6
console.log([1, 2, 3].myReduce((a, b) => a + b, 10)); // → 16
try { [].myReduce((a, b) => a + b); } catch (e) { console.log(e.name); } // → TypeError`,
  },
  {
    id: 'map-vs-object',
    group: 'Arrays & Collections',
    stars: 4,
    difficulty: 'Medium',
    q: 'When should you use a `Map` instead of a plain object?',
    a: [
      "# ELI5",
      "A plain object is like a filing cabinet where every drawer label must be written as text.",
      "A `Map` is a cabinet where the label can be anything: a word, a number, even another object you tape to the drawer.",
      "The Map cabinet also counts its drawers for you and remembers the exact order you added them.",
      "# What it is",
      "Both store key-value pairs, but they are designed for different jobs.",
      "A plain object `{}` is best for records with a fixed, known shape, like `{ id, name, email }`.",
      "A `Map` is a dedicated collection for dynamic key-value data where keys are added and removed at runtime.",
      "Comparison:",
      "  Key types — Map: any value (objects, functions, numbers stay numbers); object: only strings and symbols (other keys are converted to strings).",
      "  Order — Map: always insertion order; object: integer-like keys first in ascending order, then string keys in insertion order.",
      "  Size — Map: `map.size`; object: `Object.keys(obj).length` (slower, builds an array).",
      "  Iteration — Map is directly iterable with `for...of`; objects need `Object.entries`.",
      "  Inherited keys — objects inherit from `Object.prototype` (e.g. `toString`, `constructor`), which can clash with your keys; Map has no such keys.",
      "  Performance — Map is optimised for frequent additions and deletions; objects are optimised for fixed shapes.",
      "  JSON — objects serialise directly; Map needs `Object.fromEntries(map)` first.",
      "# How it works",
      "Map stores entries in a hash table that compares keys using SameValueZero (like `===`, but `NaN` equals `NaN`).",
      "Object keys go through string conversion: `obj[1]` and `obj['1']` are the same key, and `obj[{}]` becomes `obj['[object Object]']`.",
      "V8 optimises objects with stable shapes using hidden classes (an internal description of the object's layout); constantly adding and deleting keys breaks these optimisations, which Map avoids.",
      "# Example walkthrough",
      "Two different user objects used as object keys both become the string '[object Object]', so the second overwrites the first.",
      "The same keys in a Map stay separate, so `map.size` is 2.",
      "The object with keys 'b', '2', '1' is listed as 1, 2, b (integers first), while the Map keeps insertion order.",
      "`'toString' in {}` is true even though we never added it — an inherited key; Map's `has('toString')` is false.",
      "`JSON.stringify(map)` gives `{}`; `Object.fromEntries(map)` converts it first.",
      "# Why it matters / when to use",
      "Use Map for caches, counting/frequency tables, session stores, and lookups keyed by objects or user-provided strings.",
      "Use plain objects for DTOs, config, JSON payloads and anything with a known shape.",
      "Using Map for user-provided keys avoids prototype-pollution style bugs (keys like `__proto__`).",
      "# Common mistakes",
      "Setting properties with brackets on a Map (`map['a'] = 1`): that adds a normal property, not an entry. Use `map.set` and `map.get`.",
      "Calling `JSON.stringify(map)` and getting `{}`.",
      "Using an object as a dictionary of user input without `Object.create(null)`, so keys like `constructor` behave strangely.",
      "Using objects as Map keys and expecting value equality: `map.get({ id: 1 })` fails because it is a different object reference.",
      "# Say this in the interview",
      "I use a Map when keys are dynamic, not strings, or when I add and remove entries often: it accepts any key type, keeps insertion order, has `size`, is directly iterable and has no inherited keys. Plain objects are better for fixed-shape records and JSON. For caches keyed by objects where I want automatic cleanup, I use a WeakMap.",
      "  Follow-up: How do you convert between them? — `new Map(Object.entries(obj))` and `Object.fromEntries(map)`.",
      "  Follow-up: How does Map compare keys? — SameValueZero: by reference for objects, and `NaN` equals `NaN`.",
    ],
    code: `const u1 = { id: 1 }, u2 = { id: 2 };

// Object: keys are converted to strings
const obj = {};
obj[u1] = "Ann";
obj[u2] = "Bob";               // same key "[object Object]"!
console.log(Object.keys(obj)); // → [ '[object Object]' ]

// Map: any value can be a key
const map = new Map();
map.set(u1, "Ann").set(u2, "Bob");
console.log(map.size, map.get(u1)); // → 2 Ann

// Ordering
const o = { b: 1, 2: "two", 1: "one" };
console.log(Object.keys(o)); // → [ '1', '2', 'b' ] (integers first)
const m = new Map([["b", 1], [2, "two"], [1, "one"]]);
console.log([...m.keys()]);  // → [ 'b', 2, 1 ] (insertion order)

// Inherited keys
console.log("toString" in {});          // → true (from Object.prototype)
console.log(new Map().has("toString")); // → false

// Iteration and JSON
for (const [key, value] of m) console.log(key, value); // b 1, 2 two, 1 one
console.log(JSON.stringify(m));                     // → {}
console.log(JSON.stringify(Object.fromEntries(m))); // → {"1":"one","2":"two","b":1}`,
  },
  {
    id: 'remove-duplicates',
    group: 'Arrays & Collections',
    stars: 4,
    difficulty: 'Easy',
    q: 'How do you remove duplicates from an array?',
    a: [
      "# ELI5",
      "You have a box of trading cards with many repeats. You want one of each.",
      "A `Set` is a special album with exactly one slot per card type: if you try to add a card that is already there, it is simply ignored.",
      "Pour all cards into the album, then take them back out: no duplicates left.",
      "# What it is",
      "Removing duplicates (deduplication) means producing a new array where each value appears only once, usually keeping the first-seen order.",
      "A `Set` is a built-in collection that stores only unique values and remembers insertion order.",
      "Set equality uses SameValueZero: like `===`, except `NaN` is equal to `NaN`. Objects are equal only if they are the SAME object (same reference), not if they look alike.",
      "Approaches:",
      "  `[...new Set(arr)]` — shortest and O(n) (time grows linearly with the array size). Best for primitives (numbers, strings, booleans).",
      "  `arr.filter((x, i) => arr.indexOf(x) === i)` — works but O(n^2) (time grows with the square of the size) because `indexOf` scans the array each time. Also fails for `NaN`.",
      "  For objects by a key (e.g. `id`): use a `Map` keyed by that field, or a `Set` of seen ids with `filter`.",
      "# How it works",
      "`new Set(arr)` loops over the array and adds each value; adding an existing value does nothing.",
      "The spread `[...set]` turns the Set back into an array, in first-insertion order.",
      "For objects: `new Map(arr.map((o) => [o.id, o]))` creates entries keyed by id; a later object with the same id overwrites the earlier value (but keeps the original key position), so this keeps the LAST occurrence.",
      "To keep the FIRST occurrence, track seen ids in a Set and `filter` out any id already seen.",
      "# Example walkthrough",
      "`[...new Set([1, 2, 2, 3, NaN, NaN])]` gives `[1, 2, 3, NaN]` — even the two NaNs are merged.",
      "The `indexOf` version drops BOTH NaNs, because `indexOf(NaN)` is always -1.",
      "Two objects `{ id: 1 }` written separately are different references, so the Set keeps both.",
      "`uniqueByIdKeepLast` returns Ann v2 for id 1 (the later one wins).",
      "`uniqueByIdKeepFirst` returns Ann v1 for id 1.",
      "# Why it matters / when to use",
      "Cleaning user input like tags or email lists before saving.",
      "Merging results from several API calls or DB queries that overlap.",
      "Collecting unique ids before a bulk query: `WHERE id IN (...)`.",
      "# Common mistakes",
      "Expecting a Set to dedupe objects by content. It compares references; dedupe by a key instead.",
      "Using the `indexOf` filter on large arrays, which gets very slow (O(n^2)).",
      "Forgetting the result of `new Set(arr)` is a Set, not an array; convert with spread or `Array.from`.",
      "# Say this in the interview",
      "For primitive values I use `[...new Set(arr)]`, which is O(n) and keeps first-seen order; Set uses SameValueZero so even `NaN` is deduplicated. For objects, a Set compares references, so I dedupe by a key, either with a Map keyed by id or a Set of seen ids inside `filter`. The `indexOf` filter works but is O(n^2).",
      "  Follow-up: Keep first or last occurrence? — A Map overwrite keeps the last; a seen-Set with filter keeps the first.",
      "  Follow-up: Without a Set? — Use an object or Map as a lookup of seen values while looping.",
    ],
    code: `// Primitives: Set is the easiest and O(n)
console.log([...new Set([1, 2, 2, 3, NaN, NaN])]); // → [ 1, 2, 3, NaN ]

// indexOf version: O(n^2) and loses NaN entirely
const arr = [1, 2, 2, NaN, NaN];
console.log(arr.filter((x, i) => arr.indexOf(x) === i)); // → [ 1, 2 ]

// Objects are compared by reference
console.log(new Set([{ id: 1 }, { id: 1 }]).size); // → 2

const users = [
  { id: 1, name: "Ann v1" },
  { id: 2, name: "Bob" },
  { id: 1, name: "Ann v2" },
];

// Dedupe by key, keep LAST occurrence
const uniqueByIdKeepLast = [...new Map(users.map((u) => [u.id, u])).values()];
console.log(uniqueByIdKeepLast.map((u) => u.name)); // → [ 'Ann v2', 'Bob' ]

// Dedupe by key, keep FIRST occurrence
const seen = new Set();
const uniqueByIdKeepFirst = users.filter((u) => {
  if (seen.has(u.id)) return false;
  seen.add(u.id);
  return true;
});
console.log(uniqueByIdKeepFirst.map((u) => u.name)); // → [ 'Ann v1', 'Bob' ]`,
  },
  {
    id: 'flatten-array',
    group: 'Arrays & Collections',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do you flatten a nested array? Implement it.',
    a: [
      "# ELI5",
      "Imagine boxes inside boxes inside boxes, each holding some toys.",
      "Flattening means opening every box and lining all the toys up in one single row on the floor.",
      "'Depth' is how many layers of boxes you are allowed to open.",
      "# What it is",
      "A nested array is an array that contains other arrays, e.g. `[1, [2, [3, [4]]]]`.",
      "Flattening produces a single-level array: `[1, 2, 3, 4]`.",
      "Built-in: `arr.flat(depth)` — default depth is 1; `arr.flat(Infinity)` flattens completely.",
      "`arr.flatMap(fn)` is `map` followed by `flat(1)`, useful when each item maps to zero or more results.",
      "Interviewers usually ask you to implement it yourself, either recursively or iteratively.",
      "Recursion means a function calling itself to solve a smaller version of the same problem.",
      "# How it works",
      "Recursive approach:",
      "  Loop over the items.",
      "  If an item is an array (check with `Array.isArray`) and depth allows, flatten it with depth - 1 and add its items.",
      "  Otherwise add the item as is.",
      "Iterative approach with a stack (a list where you add and remove from the end):",
      "  Put all items on the stack.",
      "  Pop one; if it is an array, push its items back on; otherwise add it to the result.",
      "  Reverse at the end, because popping processes items from last to first.",
      "The stack version avoids 'Maximum call stack size exceeded' on extremely deep nesting.",
      "# Example walkthrough",
      "`flat()` with no argument only opens one layer: `[1, 2, [3, [4]]]`.",
      "`flat(Infinity)` opens every layer: `[1, 2, 3, 4]`.",
      "`flatten(nested)` (recursive) gives `[1, 2, 3, 4]`; with depth 1 it gives `[1, 2, [3, [4]]]`, matching `flat(1)`.",
      "`flattenIterative(nested)` also gives `[1, 2, 3, 4]` without recursion.",
      "`flatMap` turns each sentence into words and merges them: `['hi', 'there', 'bye']`.",
      "# Why it matters / when to use",
      "Combining paginated results (`pages.flat()`).",
      "Collecting nested data like all comments from all posts: `posts.flatMap((p) => p.comments)`.",
      "Classic interview question testing recursion and edge cases.",
      "# Common mistakes",
      "Forgetting `flat()` only goes one level deep by default.",
      "Using `typeof x === 'object'` to detect arrays; it is also true for objects and `null`. Use `Array.isArray`.",
      "Using `concat` inside `reduce` for huge arrays, which copies the accumulator each time (slow); `push` is faster.",
      "# Say this in the interview",
      "Natively I use `arr.flat(depth)` or `flat(Infinity)`, and `flatMap` when mapping to multiple items. To implement it, I loop and recurse into items that pass `Array.isArray` while decrementing depth, otherwise push the item. For very deep inputs I use an explicit stack to avoid call stack overflows.",
      "  Follow-up: Flatten a nested object into dotted keys? — Recurse through keys and build paths like `a.b.c`.",
      "  Follow-up: Time complexity? — O(n) where n is the total number of elements across all levels.",
    ],
    code: `const nested = [1, [2, [3, [4]]]];

console.log(nested.flat());         // → [ 1, 2, [ 3, [ 4 ] ] ]  (depth 1)
console.log(nested.flat(Infinity)); // → [ 1, 2, 3, 4 ]

// Recursive implementation with depth support
function flatten(arr, depth = Infinity) {
  const result = [];
  for (const item of arr) {
    if (Array.isArray(item) && depth > 0) {
      result.push(...flatten(item, depth - 1)); // open one more layer
    } else {
      result.push(item);
    }
  }
  return result;
}
console.log(flatten(nested));    // → [ 1, 2, 3, 4 ]
console.log(flatten(nested, 1)); // → [ 1, 2, [ 3, [ 4 ] ] ]

// Iterative implementation with a stack (no recursion limit)
function flattenIterative(arr) {
  const stack = [...arr];
  const result = [];
  while (stack.length) {
    const item = stack.pop();
    if (Array.isArray(item)) stack.push(...item);
    else result.push(item);
  }
  return result.reverse(); // we processed from the end
}
console.log(flattenIterative(nested)); // → [ 1, 2, 3, 4 ]

console.log(["hi there", "bye"].flatMap((s) => s.split(" "))); // → [ 'hi', 'there', 'bye' ]`,
  },
  {
    id: 'loops-comparison',
    group: 'Arrays & Collections',
    stars: 3,
    difficulty: 'Easy',
    q: 'Compare `for...in`, `for...of`, `forEach` and `map`.',
    a: [
      "# ELI5",
      "Imagine a row of lockers with labels and things inside.",
      "`for...in` reads the labels on the lockers (the keys).",
      "`for...of` opens each locker and hands you what is inside (the values).",
      "`forEach` asks a helper to visit every locker; you cannot tell the helper to stop halfway.",
      "`map` asks a helper to visit every locker and build a new row of lockers with changed contents.",
      "# What it is",
      "Comparison:",
      "  `for...in` — loops over enumerable string KEYS of an object, including inherited ones; for arrays it gives indexes as strings ('0', '1'). Meant for plain objects.",
      "  `for...of` — loops over VALUES of any iterable (arrays, strings, Map, Set, generators). Supports `break`, `continue`, `return` and `await`.",
      "  `forEach` — array method that calls a callback for each element. Returns `undefined`. You cannot `break`, and it does not wait for async callbacks.",
      "  `map` — array method that returns a NEW array of transformed values. Use it only when you need that new array.",
      "Enumerable means the property shows up in loops; most normal properties are enumerable, built-in methods are not.",
      "# How it works",
      "`for...in` walks the object's own keys and then its prototype chain's enumerable keys.",
      "`for...of` gets an iterator via `Symbol.iterator` and calls `next()` until `done`.",
      "`forEach` and `map` are just functions that run an internal loop and call your callback; a `return` inside the callback only exits that one callback call.",
      "# Example walkthrough",
      "`for...in` on the array prints indexes '0', '1', '2' and also the custom `extra` property — a classic surprise.",
      "`for...of` prints the values 'a', 'b', 'c' and stops at 'b' thanks to `break`.",
      "`forEach` cannot be stopped: the `return` only skips the current item.",
      "`map` returns a new uppercase array and leaves the original unchanged.",
      "The async section: `for...of` with `await` processes items one at a time in order, while `forEach` with an async callback finishes before any of the saves complete.",
      "# Why it matters / when to use",
      "Use `for...of` for most array/iterable loops, especially with `await` or early exit.",
      "Use `Object.entries(obj)` with `for...of` to loop over objects safely.",
      "Use `map` to transform data (DB rows to DTOs), `forEach` for simple side effects.",
      "Need to stop early? `for...of`, `some`, `every`, `find` or `findIndex`.",
      "# Common mistakes",
      "Using `for...in` on arrays: indexes are strings, order is not guaranteed by intent, and inherited properties sneak in.",
      "Using `forEach(async ...)` and expecting it to wait.",
      "Using `map` purely for side effects and ignoring its return value.",
      "# Say this in the interview",
      "`for...in` iterates enumerable keys including inherited ones, so it is for objects, not arrays. `for...of` iterates values of any iterable and supports `break` and `await`. `forEach` runs a callback per element, returns nothing, cannot break and does not await. `map` returns a new transformed array. My default is `for...of`, and `Object.entries` for objects.",
      "  Follow-up: How do you break out of `forEach`? — You cannot cleanly; use `for...of`, `some` or `find` instead.",
      "  Follow-up: Fastest loop? — A classic `for` loop is usually fastest, but readability matters more except in hot paths.",
    ],
    code: `const arr = ["a", "b", "c"];
arr.extra = "surprise";

for (const key in arr) console.log(key);   // → '0', '1', '2', 'extra' (keys, as strings!)

for (const value of arr) {                 // values only, no 'extra'
  if (value === "c") break;
  console.log(value);                      // → a, b
}

arr.forEach((v) => {
  if (v === "b") return;                   // only skips this item, cannot stop the loop
  console.log(v);                          // → a, c
});

const upper = arr.map((v) => v.toUpperCase());
console.log(upper, arr[0]);                // → [ 'A', 'B', 'C' ] a

// Objects: use Object.entries with for...of
for (const [k, v] of Object.entries({ x: 1, y: 2 })) console.log(k, v); // → x 1, y 2

// Async: for...of waits, forEach does not
const save = (x) => new Promise((r) => setTimeout(() => r(console.log("saved", x)), 10));
async function demo() {
  for (const x of [1, 2]) await save(x);   // saved 1, saved 2, then...
  console.log("for...of done");
  [3, 4].forEach(async (x) => await save(x));
  console.log("forEach done");             // prints BEFORE saved 3 / saved 4
}
demo();`,
  },
  {
    id: 'weakmap-weakset',
    group: 'Arrays & Collections',
    stars: 3,
    difficulty: 'Medium',
    q: 'What are `Set`, `WeakMap` and `WeakSet`?',
    a: [
      "# ELI5",
      "A `Set` is a guest list where each name can appear only once.",
      "A `WeakMap` is a set of sticky notes attached to people. When a person leaves the party for good, their sticky note disappears with them automatically.",
      "A normal `Map` is like a notebook: even after the person leaves, their page stays until you tear it out yourself.",
      "# What it is",
      "`Set`: a collection of unique values (by SameValueZero), iterable in insertion order, with `add`, `has`, `delete`, `size`. ES2025 adds `union`, `intersection`, `difference`, `symmetricDifference`, `isSubsetOf`.",
      "Garbage collection (GC) is the engine automatically freeing memory used by objects that nothing can reach any more.",
      "`WeakMap`: a key-value map where keys must be objects (or non-registered symbols) and are held weakly — the map does not keep the key alive. If nothing else references the key, the GC can delete the key and its value.",
      "`WeakSet`: a set of objects held weakly; used to mark objects (e.g. 'already processed') without preventing their cleanup.",
      "Because entries can disappear at any time, WeakMap and WeakSet are NOT iterable and have no `size` or `clear`.",
      "Comparison:",
      "  Map vs WeakMap — Map: any key, iterable, has size, keeps keys alive; WeakMap: object keys only, not iterable, lets keys be collected.",
      "  Set vs WeakSet — Set: any value, iterable; WeakSet: objects only, not iterable, weakly held.",
      "# How it works",
      "A normal Map holds a strong reference to its keys, so as long as the Map lives, the keys cannot be garbage collected.",
      "A WeakMap's reference does not count: if the only remaining reference to an object is a WeakMap key, the object is unreachable.",
      "At some later GC cycle the engine frees the object and drops the WeakMap entry, including its value.",
      "You cannot observe when this happens, which is why listing the contents is not allowed.",
      "# Example walkthrough",
      "The `Set` removes the duplicate 2 and supports `has`, `size` and the ES2025 `union` method.",
      "`metadata` is a WeakMap that attaches extra data to request objects without modifying them.",
      "`processed` is a WeakSet that marks which jobs were handled.",
      "Setting `req = null` removes the last strong reference; the WeakMap entry becomes collectable automatically, avoiding a memory leak.",
      "Trying to use a string as a WeakMap key throws TypeError.",
      "# Why it matters / when to use",
      "Caching computed results per object (e.g. per request or per DOM node) without leaking memory.",
      "Storing private data for class instances (the pre-#private-fields pattern).",
      "Tracking visited objects in deep clone or graph traversal code.",
      "Sets: unique ids, tags, permission checks with fast `has`.",
      "# Common mistakes",
      "Trying to iterate or get `size` of a WeakMap: not possible by design.",
      "Using primitives (strings, numbers) as WeakMap keys: TypeError.",
      "Expecting immediate cleanup: GC timing is up to the engine.",
      "Using a normal Map as a cache keyed by objects in a long-running server, causing a slow memory leak.",
      "# Say this in the interview",
      "A Set stores unique values in insertion order. WeakMap and WeakSet hold object keys weakly, so an entry does not prevent its key from being garbage collected; once nothing else references the object, the entry disappears. Because of that they are not iterable and have no size. I use WeakMap for per-object caches and metadata to avoid memory leaks.",
      "  Follow-up: Why can't you iterate a WeakMap? — Entries can vanish at any GC, so the result would be non-deterministic.",
      "  Follow-up: What is WeakRef? — A weak reference to a single object; `deref()` returns it or `undefined` if collected.",
    ],
    code: `// Set: unique values
const ids = new Set([1, 2, 2, 3]);
console.log(ids.size, ids.has(2));               // → 3 true
console.log([...ids.union(new Set([3, 4]))]);    // → [ 1, 2, 3, 4 ] (ES2025)

// WeakMap: metadata per object, no memory leak
const metadata = new WeakMap();
let req = { url: "/users" };
metadata.set(req, { startedAt: Date.now() });
console.log(metadata.has(req)); // → true

// WeakSet: mark objects as processed
const processed = new WeakSet();
const job = { id: 7 };
processed.add(job);
console.log(processed.has(job)); // → true

req = null; // last strong reference gone:
// the WeakMap entry can now be garbage collected automatically.
// With a normal Map, the object would stay in memory forever.

// Restrictions
try { metadata.set("key", 1); } catch (e) { console.log(e.name); } // → TypeError
console.log(typeof metadata.size); // → undefined (no size, not iterable)`,
  },
  {
    id: 'mutating-vs-non-mutating',
    group: 'Arrays & Collections',
    stars: 3,
    difficulty: 'Easy',
    q: 'Which array methods mutate the original array?',
    a: [
      "# ELI5",
      "Some methods are like writing on the original page with a pen: the page is changed forever.",
      "Others are like photocopying the page and writing on the copy: the original stays clean.",
      "You need to know which is which, or you will scribble on a page someone else is still reading.",
      "# What it is",
      "To mutate means to change the array in place, so every variable pointing to it sees the change.",
      "Mutating methods: `push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`, `fill`, `copyWithin`.",
      "Non-mutating methods (return new values): `map`, `filter`, `reduce`, `slice`, `concat`, `flat`, `flatMap`, `find`, `includes`, `join`, `some`, `every`.",
      "ES2023 copy versions of the mutating ones: `toSorted`, `toReversed`, `toSpliced`, and `with(index, value)` (copy with one item replaced).",
      "Comparison of the commonly confused pair:",
      "  `slice(start, end)` — copies a portion, original untouched, `end` is exclusive.",
      "  `splice(start, deleteCount, ...items)` — removes and/or inserts in place, returns the removed items.",
      "# How it works",
      "Arrays are objects, and variables hold a reference (an address) to them, not a copy.",
      "Assigning `const b = a` copies the reference, so mutating through `b` also changes what `a` sees.",
      "Non-mutating methods allocate a new array and leave the old one alone.",
      "Spread `[...arr]` or `arr.slice()` makes a shallow copy you can safely mutate.",
      "# Example walkthrough",
      "`sorted = scores.sort(...)` sorts `scores` itself; `sorted === scores` is true.",
      "`toSorted` returns a new sorted array; the original keeps its order.",
      "`slice(1, 3)` copies items at index 1 and 2; `splice(1, 2)` removes them from the array and returns them.",
      "`with(0, 99)` returns a copy with the first item replaced.",
      "The function `addItem` mutates the caller's array through the shared reference — a common source of bugs.",
      "# Why it matters / when to use",
      "React and Redux detect changes by reference; mutating state in place means the UI does not update.",
      "In backend code, mutating a shared config or cached array affects every request that uses it.",
      "Pure functions (no side effects) are easier to test and reason about.",
      "# Common mistakes",
      "Calling `arr.sort()` on data you received as a parameter and accidentally changing the caller's data. Use `toSorted` or copy first.",
      "Mixing up `slice` and `splice`.",
      "Thinking `const` prevents mutation: `const arr = []; arr.push(1)` is allowed; `const` only prevents reassignment.",
      "# Say this in the interview",
      "Mutating methods include push, pop, shift, unshift, splice, sort, reverse, fill and copyWithin. Methods like map, filter, slice, concat and reduce return new values. ES2023 added non-mutating `toSorted`, `toReversed`, `toSpliced` and `with`. I avoid mutating shared or state data because other references see the change, which breaks React updates and causes surprising bugs.",
      "  Follow-up: `slice` vs `splice`? — `slice` copies a section; `splice` edits in place and returns removed items.",
      "  Follow-up: Does `const` make an array immutable? — No; use `Object.freeze` for a shallow read-only array.",
    ],
    code: `const scores = [30, 10, 20];

const sorted = scores.sort((a, b) => a - b); // MUTATES
console.log(scores, sorted === scores);      // → [ 10, 20, 30 ] true

const prices = [30, 10, 20];
const copy = prices.toSorted((a, b) => a - b); // ES2023: new array
console.log(prices, copy);                     // → [ 30, 10, 20 ] [ 10, 20, 30 ]

const letters = ["a", "b", "c", "d"];
console.log(letters.slice(1, 3), letters); // → [ 'b', 'c' ] [ 'a', 'b', 'c', 'd' ]
console.log(letters.splice(1, 2), letters); // → [ 'b', 'c' ] [ 'a', 'd' ]

console.log([1, 2, 3].with(0, 99)); // → [ 99, 2, 3 ]

// Shared reference trap
function addItem(list, item) {
  list.push(item);            // mutates the caller's array!
  return list;
}
const cart = ["apple"];
addItem(cart, "pear");
console.log(cart);            // → [ 'apple', 'pear' ]

const safeAdd = (list, item) => [...list, item]; // non-mutating version
console.log(safeAdd(cart, "kiwi"), cart.length); // → [ 'apple', 'pear', 'kiwi' ] 2`,
  },
  {
    id: 'array-sort-gotcha',
    group: 'Arrays & Collections',
    stars: 2,
    difficulty: 'Easy',
    q: 'Why does `[10, 9, 1].sort()` return `[1, 10, 9]`?',
    a: [
      "# ELI5",
      "Imagine sorting words in a dictionary: 'apple' comes before 'banana' because 'a' comes before 'b'.",
      "If you treat numbers like words, '10' starts with '1', so it comes before '9', just like 'ab' comes before 'b'.",
      "That is exactly what `sort()` does by default: it alphabetises numbers as if they were words.",
      "# What it is",
      "Without a compare function, `sort` converts every element to a string and compares them by UTF-16 code units (the numeric codes of the characters).",
      "So '1' < '10' < '9' in dictionary order, giving `[1, 10, 9]`.",
      "A compare function `(a, b) => number` tells sort the real order: negative means a comes first, positive means b comes first, 0 means keep their order.",
      "`(a, b) => a - b` sorts numbers ascending; `(a, b) => b - a` sorts descending.",
      "For human-language strings, use `a.localeCompare(b)` or `Intl.Collator`, which handle accents and case properly.",
      "`sort` mutates the array in place and returns the same array; `toSorted` (ES2023) returns a sorted copy.",
      "Since ES2019, `sort` is stable — items that compare equal keep their original relative order.",
      "# How it works",
      "The engine runs a sorting algorithm (V8 uses TimSort) that repeatedly compares pairs of elements.",
      "For each comparison it calls your compare function, or, if none is given, compares `String(a)` with `String(b)`.",
      "`undefined` elements are always moved to the end without calling the compare function.",
      "# Example walkthrough",
      "`[10, 9, 1].sort()` gives `[1, 10, 9]` because the strings '1', '10', '9' are in dictionary order.",
      "With `(a, b) => a - b`: 10 - 9 is positive, so 9 goes before 10; result `[1, 9, 10]`.",
      "Sorting users by age with `a.age - b.age` sorts objects by a numeric field.",
      "`localeCompare` sorts names correctly regardless of accents.",
      "Stability keeps Ann before Cid because both are 30 and Ann came first.",
      "# Why it matters / when to use",
      "Sorting prices, scores, dates or ids in API responses — the default sort would silently produce wrong order.",
      "Sorting dates: `(a, b) => a - b` works on Date objects because they convert to timestamps.",
      "# Common mistakes",
      "Calling `sort()` on numbers without a compare function.",
      "Returning a boolean from the compare function (`a > b`); it must return a negative, zero or positive number.",
      "Forgetting `sort` mutates the original array; use `toSorted` for a copy.",
      "# Say this in the interview",
      "Without a comparator, `sort` converts elements to strings and compares them by UTF-16 code units, so '10' sorts before '9'. For numbers I pass `(a, b) => a - b`, for strings `localeCompare`. Sort mutates in place and has been stable since ES2019; I use `toSorted` when I need a copy.",
      "  Follow-up: What should the compare function return? — Negative if a goes first, positive if b goes first, 0 to keep order.",
      "  Follow-up: Where do undefined values go? — Always to the end.",
    ],
    code: `console.log([10, 9, 1].sort());                 // → [ 1, 10, 9 ] (string order!)
console.log([10, 9, 1].sort((a, b) => a - b));   // → [ 1, 9, 10 ]
console.log([10, 9, 1].sort((a, b) => b - a));   // → [ 10, 9, 1 ]

const users = [
  { name: "Ann", age: 30 },
  { name: "Bob", age: 25 },
  { name: "Cid", age: 30 },
];
const byAge = users.toSorted((a, b) => a.age - b.age); // copy, original untouched
console.log(byAge.map((u) => u.name)); // → [ 'Bob', 'Ann', 'Cid' ] (stable: Ann before Cid)

console.log(["Émile", "zoe", "Adam"].sort());                     // → [ 'Adam', 'zoe', 'Émile' ]
console.log(["Émile", "zoe", "Adam"].sort((a, b) => a.localeCompare(b))); // → [ 'Adam', 'Émile', 'zoe' ]

console.log([3, undefined, 1].sort((a, b) => a - b)); // → [ 1, 3, undefined ]

// Wrong: returning a boolean
console.log([3, 1, 2].sort((a, b) => a > b)); // unreliable, do not do this`,
  },

  // ───────────────────────── DOM & Browser ─────────────────────────
  {
    id: 'event-delegation',
    group: 'DOM & Browser',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is event delegation?',
    a: [
      "# ELI5",
      "Imagine a classroom of 30 kids. Instead of giving every kid their own personal assistant to listen for questions, the teacher stands at the front and listens to the whole room.",
      "When a kid raises a hand, the teacher looks to see WHO raised it and answers that kid.",
      "New kids who join mid-year are automatically covered, because the teacher listens to the whole room.",
      "Event delegation is the teacher: one listener on a parent element handles events from all its children, now and in the future.",
      "# What it is",
      "The DOM (Document Object Model) is the browser's tree of objects representing the HTML page; each tag is a node (element) in the tree.",
      "An event listener is a function that runs when something happens to an element, like a click.",
      "Event bubbling: after an event fires on an element, it travels up through every ancestor (parent, grandparent... up to `document` and `window`).",
      "Event delegation uses bubbling: attach ONE listener to a common ancestor instead of one per child, then figure out which child was the real target.",
      "`event.target` is the element where the event actually happened (maybe a deep inner element like a `<span>`).",
      "`event.currentTarget` is the element whose listener is currently running (the parent we attached to).",
      "`element.closest(selector)` walks up from an element to find the nearest ancestor (including itself) matching a CSS selector.",
      "# How it works",
      "User clicks a `<span>` inside an `<li>` inside the `<ul id='list'>`.",
      "The browser fires the click on the `<span>` (the target).",
      "The event bubbles up: `<span>` → `<li>` → `<ul>` → ... → `document`.",
      "When it reaches the `<ul>`, our single listener runs.",
      "The listener calls `e.target.closest('li')` to find which item was clicked.",
      "It checks the found `<li>` is inside our list (`e.currentTarget.contains(item)`), then reads data like `item.dataset.id` (from the `data-id` attribute).",
      "Items added later are handled automatically, because the listener lives on the parent, not on the items.",
      "# Example walkthrough",
      "The `<ul>` starts with two items, each with a `data-id` and a delete button.",
      "One listener is attached to the `<ul>`.",
      "Clicking the text of item 1 logs `open 1`, because `closest('li')` finds the `<li>` with `data-id='1'`.",
      "Clicking a delete button: `closest('button.delete')` matches, so the item is removed and `deleted 2` is logged.",
      "The item added afterwards with `insertAdjacentHTML` also works, without adding any new listener.",
      "Clicks on empty space in the list find no `<li>`, so the function returns early.",
      "# Why it matters / when to use",
      "Long or dynamic lists (tables, chat messages, todo items, infinite scroll) where items are added and removed constantly.",
      "Fewer listeners means less memory and faster setup for big pages.",
      "Simpler cleanup: remove one listener instead of hundreds.",
      "Frameworks rely on it: React attaches its event handlers at the root container (since React 17) and dispatches to components itself.",
      "Backend parallel: the same idea as one router dispatching many routes instead of one server per URL.",
      "# Common mistakes",
      "Using `e.target` directly instead of `closest`: clicking an icon inside a button gives you the icon, not the button.",
      "Forgetting that some events do not bubble (`focus`, `blur`, `mouseenter`, `mouseleave`). Use `focusin`/`focusout`, or listen in the capture phase.",
      "Calling `stopPropagation()` deep in a child, which prevents the event reaching the delegated parent.",
      "Delegating everything to `document`, which makes every click on the page run your handler; delegate to the nearest stable container.",
      "# Say this in the interview",
      "Event delegation means attaching a single listener to a common ancestor and using event bubbling to handle events from its children. Inside the handler I use `event.target.closest(selector)` to find the relevant child and read its data attributes. It saves memory, automatically covers elements added later and simplifies cleanup. Events that do not bubble, like focus, need `focusin` or capture.",
      "  Follow-up: `target` vs `currentTarget`? — `target` is where the event happened; `currentTarget` is the element whose listener is running.",
      "  Follow-up: Why check `contains` after `closest`? — `closest` could match an ancestor outside the container if lists are nested.",
    ],
    code: `// HTML:
// <ul id="list">
//   <li data-id="1"><span>Item 1</span> <button class="delete">x</button></li>
//   <li data-id="2"><span>Item 2</span> <button class="delete">x</button></li>
// </ul>

const list = document.querySelector("#list");

list.addEventListener("click", (e) => {
  const item = e.target.closest("li");                 // which <li> was clicked?
  if (!item || !e.currentTarget.contains(item)) return; // click was not on an item

  if (e.target.closest("button.delete")) {
    item.remove();
    console.log("deleted", item.dataset.id);           // → deleted 2
    return;
  }
  console.log("open", item.dataset.id);                // → open 1
});

// Items added later work automatically, no new listener needed
list.insertAdjacentHTML(
  "beforeend",
  '<li data-id="3"><span>Item 3</span> <button class="delete">x</button></li>'
);
// Clicking "Item 3" → open 3

// Non-bubbling events: use focusin instead of focus
list.addEventListener("focusin", (e) => console.log("focused", e.target.tagName));`,
  },
  {
    id: 'event-bubbling-capturing',
    group: 'DOM & Browser',
    stars: 5,
    difficulty: 'Medium',
    q: 'Explain event bubbling and capturing.',
    a: [
      "# ELI5",
      "Imagine a letter delivered to an apartment. First it travels down: city post office → building → floor → your door. That is capturing.",
      "Then you open it at your door. That is the target phase.",
      "Then news of the letter travels back up: your neighbours on the floor hear, then the whole building, then the city. That is bubbling.",
      "Every level can choose to listen on the way down, or on the way back up (the default).",
      "# What it is",
      "When an event (like a click) happens on an element, the browser does not just notify that element; it sends the event along a path through the DOM tree.",
      "This journey is called event propagation, and it has three phases:",
      "  1. Capture phase — from `window` down through each ancestor toward the target.",
      "  2. Target phase — at the element that was actually clicked.",
      "  3. Bubble phase — from the target back up through each ancestor to `window`.",
      "By default, `addEventListener` listens in the bubble phase. Pass `{ capture: true }` (or `true` as the third argument) to listen in the capture phase.",
      "`event.target` is the element where the event started; `event.currentTarget` is the element whose listener is running right now.",
      "`event.eventPhase` tells you the phase: 1 = capturing, 2 = at target, 3 = bubbling.",
      "`stopPropagation()` stops the event moving to further elements; `stopImmediatePropagation()` also stops other listeners on the same element.",
      "Some events do not bubble: `focus`, `blur`, `mouseenter`, `mouseleave`, `load`, `scroll` on elements. They still go through the capture phase.",
      "# How it works",
      "The browser computes the propagation path once: `window`, `document`, `html`, `body`, ..., parent, target.",
      "Capture: it walks that path top-down, running capture listeners on each ancestor.",
      "Target: it runs listeners on the target itself (in modern browsers, the target's capture listeners first, then its normal ones).",
      "Bubble: if the event bubbles, it walks the path bottom-up, running normal (bubble) listeners on each ancestor.",
      "At any point, a listener can call `stopPropagation()` and the remaining steps are skipped.",
      "Default actions (following a link, submitting a form) happen after propagation, unless `preventDefault()` was called.",
      "# Example walkthrough",
      "The page has `outer` > `inner` > `button`. Each ancestor has one capture listener and one bubble listener; the button has one listener.",
      "Clicking the button prints: `capture outer`, `capture inner`, `target button`, `bubble inner`, `bubble outer`.",
      "If the inner bubble listener called `e.stopPropagation()`, `bubble outer` would not print.",
      "In every listener, `e.target` is the button, while `e.currentTarget` changes to the element whose listener is running.",
      "# Why it matters / when to use",
      "Bubbling is what makes event delegation possible (one listener on a parent for many children).",
      "Capture lets a parent intercept an event BEFORE children see it, e.g. to block clicks during a loading state or close a dropdown on any outside click.",
      "Debugging: understanding why a parent's handler fires when you click a child, or why `stopPropagation` in a child broke a global listener (analytics, modal close).",
      "Node's `EventTarget` follows the same API but with no tree, so there is no bubbling between objects there.",
      "# Common mistakes",
      "Thinking the target's listener runs first by default: capture listeners on ancestors run before it.",
      "Overusing `stopPropagation`, which silently breaks delegated handlers and third-party scripts higher up.",
      "Removing a capture listener without passing `{ capture: true }` to `removeEventListener`; the capture flag must match, or nothing is removed.",
      "Expecting `focus`/`blur` to bubble; use `focusin`/`focusout`.",
      "# Say this in the interview",
      "Events propagate in three phases: capture, from window down to the target; target; and bubble, from the target back up. Listeners run in the bubble phase by default, and `{ capture: true }` makes them run on the way down. `event.target` is where it started, `currentTarget` is the element handling it now, and `stopPropagation` halts the journey. Bubbling is what powers event delegation.",
      "  Follow-up: Which events do not bubble? — focus, blur, mouseenter, mouseleave, load and some others.",
      "  Follow-up: `stopPropagation` vs `preventDefault`? — The first stops the event travelling; the second cancels the browser's default action.",
    ],
    code: `// HTML: <div id="outer"><div id="inner"><button id="btn">Click</button></div></div>
const outer = document.getElementById("outer");
const inner = document.getElementById("inner");
const btn = document.getElementById("btn");

const log = (label) => (e) =>
  console.log(label, "| target:", e.target.id, "| currentTarget:", e.currentTarget.id);

outer.addEventListener("click", log("capture outer"), { capture: true });
inner.addEventListener("click", log("capture inner"), { capture: true });
btn.addEventListener("click", log("target button"));
inner.addEventListener("click", log("bubble inner"));   // default = bubble phase
outer.addEventListener("click", log("bubble outer"));

btn.click();
// → capture outer | target: btn | currentTarget: outer
// → capture inner | target: btn | currentTarget: inner
// → target button | target: btn | currentTarget: btn
// → bubble inner  | target: btn | currentTarget: inner
// → bubble outer  | target: btn | currentTarget: outer

// Stopping propagation in the bubble phase
inner.addEventListener("click", (e) => e.stopPropagation());
btn.click(); // "bubble outer" no longer prints

// Removing a capture listener requires the same capture flag
const handler = () => {};
outer.addEventListener("click", handler, { capture: true });
outer.removeEventListener("click", handler, { capture: true }); // must match`,
  },
  {
    id: 'web-storage-cookies',
    group: 'DOM & Browser',
    stars: 4,
    difficulty: 'Easy',
    q: 'Compare `localStorage`, `sessionStorage` and cookies.',
    a: [
      "# ELI5",
      "`localStorage` is a locker at your school that keeps your stuff until you empty it yourself, and every classroom (tab) of that school can open it.",
      "`sessionStorage` is a desk drawer in one classroom: when you leave that room (close the tab), it is emptied.",
      "Cookies are a small name badge you must show at the front gate every single time you enter (every request to the server), and the guard (server) can read and write it.",
      "# What it is",
      "All three let a website store small pieces of data in the browser.",
      "Origin = scheme + host + port (e.g. `https://shop.com:443`). Storage is isolated per origin, so one site cannot read another's data.",
      "Comparison:",
      "  Capacity — localStorage and sessionStorage: about 5 MB per origin; cookies: about 4 KB each, with a limited number per domain.",
      "  Lifetime — localStorage: until cleared by code or the user; sessionStorage: until the tab closes; cookies: until their `Expires`/`Max-Age`, or the browser session ends if neither is set.",
      "  Scope — localStorage: shared by all tabs of the origin; sessionStorage: one tab only; cookies: sent to the server on every matching request (domain + path).",
      "  Access — Storage: JavaScript only, synchronous, strings only; cookies: readable by the server, and by JS unless `HttpOnly`.",
      "Important cookie flags:",
      "  `HttpOnly` — JavaScript cannot read the cookie (protects against XSS stealing it).",
      "  `Secure` — sent only over HTTPS.",
      "  `SameSite=Strict | Lax | None` — controls whether the cookie is sent on requests coming from other sites (CSRF protection). `Lax` is the default in modern browsers; `None` requires `Secure`.",
      "For large or structured data in the browser, use IndexedDB (an asynchronous in-browser database).",
      "# How it works",
      "`localStorage.setItem('k', 'v')` writes to disk for that origin; `getItem` reads it back. Values are always strings, so objects need `JSON.stringify`/`JSON.parse`.",
      "Other tabs on the same origin receive a `storage` event when localStorage changes.",
      "Cookies are set by the server with a `Set-Cookie` response header (or by JS via `document.cookie`).",
      "On every later request to a matching URL, the browser automatically attaches a `Cookie` header with all matching cookies.",
      "That automatic sending is why cookies are perfect for sessions, and also why they enable CSRF attacks if not protected.",
      "# Example walkthrough",
      "The browser part saves a theme preference in localStorage as JSON and reads it back.",
      "sessionStorage keeps a draft only for the current tab.",
      "`document.cookie` can read cookies that are NOT `HttpOnly`; the session cookie is invisible to it.",
      "The Express part sets a session cookie with `httpOnly`, `secure`, `sameSite: 'lax'` and a 1-hour `maxAge`.",
      "The browser sends it back automatically and the server reads it from `req.cookies` (via the cookie-parser middleware).",
      "# Why it matters / when to use",
      "Auth sessions: store the session id or token in an `HttpOnly; Secure; SameSite` cookie set by the backend.",
      "UI preferences (theme, language, dismissed banners): localStorage.",
      "Per-tab temporary state (multi-step form progress): sessionStorage.",
      "Large offline data: IndexedDB.",
      "# Common mistakes",
      "Storing JWTs or session tokens in localStorage: any XSS (injected script) can read and steal them. Prefer HttpOnly cookies.",
      "Storing objects without JSON: `setItem('u', {a: 1})` saves the string '[object Object]'.",
      "Putting large data in cookies, which bloats every request and slows the site.",
      "Forgetting `Secure` and `SameSite` flags on auth cookies.",
      "Accessing `localStorage` during server-side rendering (Next.js server components) where it does not exist.",
      "# Say this in the interview",
      "localStorage holds about 5 MB per origin, persists until cleared and is shared across tabs; sessionStorage is the same but scoped to one tab and cleared on close. Cookies are small, about 4 KB, are sent with every matching request and can be read by the server. For auth I use cookies with HttpOnly, Secure and SameSite, because anything in Web Storage can be stolen by XSS.",
      "  Follow-up: How do you share data between tabs? — localStorage plus the `storage` event, or `BroadcastChannel`.",
      "  Follow-up: What does SameSite=Lax do? — Sends the cookie on same-site requests and top-level GET navigations from other sites, but not on cross-site POSTs or embedded requests.",
    ],
    code: `// ---- Browser ----
localStorage.setItem("prefs", JSON.stringify({ theme: "dark" })); // strings only
console.log(JSON.parse(localStorage.getItem("prefs")).theme);     // → dark

sessionStorage.setItem("draft", "Hello"); // lives only in this tab
console.log(sessionStorage.getItem("draft")); // → Hello

console.log(document.cookie); // → "lang=en"  (the HttpOnly session cookie is NOT visible)

window.addEventListener("storage", (e) => console.log("changed in another tab:", e.key));

// ---- Node / Express server ----
import express from "express";
import cookieParser from "cookie-parser";
const app = express();
app.use(cookieParser());

app.post("/login", (req, res) => {
  res.cookie("sid", "abc123", {
    httpOnly: true,       // JS cannot read it (XSS-safe)
    secure: true,         // HTTPS only
    sameSite: "lax",      // basic CSRF protection
    maxAge: 60 * 60 * 1000, // 1 hour
  });
  res.send("logged in");
});

app.get("/me", (req, res) => res.send("session: " + req.cookies.sid)); // → session: abc123
app.listen(3000);`,
  },
  {
    id: 'cors',
    group: 'DOM & Browser',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is CORS?',
    a: [
      "# ELI5",
      "Imagine your school only lets you take home notes from your own classroom.",
      "If you want notes from another school, that school must give you a signed permission slip saying 'yes, this student may take our notes'.",
      "The browser is the strict teacher checking slips. CORS is the permission slip, written by the OTHER server in its response headers.",
      "# What it is",
      "Origin = scheme + host + port. `https://app.com` and `https://api.app.com` are different origins; so are `http://localhost:3000` and `http://localhost:4000`.",
      "The Same-Origin Policy (SOP) is a browser security rule: JavaScript on one origin may SEND requests to another origin, but may not READ the response, unless allowed.",
      "CORS (Cross-Origin Resource Sharing) is the standard way a server says 'these other origins may read my responses', using HTTP response headers.",
      "Key headers the server sends:",
      "  `Access-Control-Allow-Origin` — which origin may read (an exact origin, or `*` for any).",
      "  `Access-Control-Allow-Methods` — allowed HTTP methods for preflighted requests.",
      "  `Access-Control-Allow-Headers` — allowed custom request headers (e.g. `Authorization`, `Content-Type`).",
      "  `Access-Control-Allow-Credentials: true` — allows cookies/auth to be included.",
      "  `Access-Control-Max-Age` — how long the browser may cache a preflight answer.",
      "A preflight is an automatic `OPTIONS` request the browser sends BEFORE the real request, asking 'may I send this?'.",
      "# How it works",
      "Simple requests (GET/HEAD/POST with only basic headers and content types like `text/plain` or form data):",
      "  The browser sends the request with an `Origin` header.",
      "  The server responds; if `Access-Control-Allow-Origin` matches, the browser hands the response to JS. Otherwise JS gets a CORS error.",
      "Non-simple requests (PUT, DELETE, PATCH, `Content-Type: application/json`, custom headers like `Authorization`):",
      "  The browser first sends `OPTIONS` with `Access-Control-Request-Method` and `Access-Control-Request-Headers`.",
      "  The server answers with the allowed origin, methods and headers.",
      "  If allowed, the browser sends the real request; if not, it never sends it.",
      "With credentials (`fetch(url, { credentials: 'include' })`), the server must reply with an explicit origin (not `*`) and `Access-Control-Allow-Credentials: true`.",
      "# Example walkthrough",
      "The Express server allows only `https://app.example.com` and lists allowed methods and headers.",
      "For an `OPTIONS` preflight it responds 204 (no content) immediately.",
      "The frontend `fetch` with `Content-Type: application/json` triggers a preflight first, then the real POST.",
      "A request from `https://evil.com` still reaches the server, but the browser hides the response because the origin is not allowed.",
      "In practice you would use the `cors` npm package, shown at the bottom.",
      "# Why it matters / when to use",
      "Any time your frontend and API run on different origins (different subdomain or port, e.g. React on 5173 and API on 3000 during development).",
      "Public APIs used from browsers must send CORS headers.",
      "Misconfigured CORS with credentials can let malicious sites read users' private data.",
      "# Common mistakes",
      "Thinking CORS protects your server. It is enforced only by browsers; curl, Postman and other servers ignore it. Use real auth.",
      "Trying to fix CORS errors in frontend code. The fix is on the server (or a same-origin proxy).",
      "Reflecting any `Origin` header back with `Allow-Credentials: true`, which lets any site read authenticated data. Use an allow-list.",
      "Forgetting to handle `OPTIONS` requests, so preflights fail with 404 or 401 (auth middleware rejecting OPTIONS).",
      "Using `*` together with credentials; browsers reject it.",
      "# Say this in the interview",
      "CORS is a browser mechanism that relaxes the same-origin policy: a server opts in to letting other origins read its responses using headers like `Access-Control-Allow-Origin`. Simple requests go straight through, while requests with methods like PUT or JSON content types trigger an OPTIONS preflight first. With cookies, the server must name the exact origin and send Allow-Credentials. It is not server security; it only controls what browsers let scripts read.",
      "  Follow-up: Why does my POST with JSON send an OPTIONS first? — `application/json` is not a simple content type, so it needs a preflight.",
      "  Follow-up: Does CORS stop CSRF? — No; a simple cross-site request is still sent with cookies. Use SameSite cookies and CSRF tokens.",
    ],
    code: `// ---- Express server on https://api.example.com ----
import express from "express";
const app = express();
const ALLOWED = new Set(["https://app.example.com"]);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin); // exact origin, not *
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    res.setHeader("Access-Control-Max-Age", "600"); // cache preflight 10 min
    res.setHeader("Vary", "Origin");
  }
  if (req.method === "OPTIONS") return res.sendStatus(204); // answer preflight
  next();
});
app.post("/orders", express.json(), (req, res) => res.json({ ok: true }));
app.listen(3000);

// ---- Frontend on https://app.example.com ----
// JSON content type → browser sends OPTIONS preflight first, then POST
const res = await fetch("https://api.example.com/orders", {
  method: "POST",
  credentials: "include",                   // send cookies
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ item: "book" }),
});
console.log(await res.json()); // → { ok: true }

// Same thing with the cors package:
// import cors from "cors";
// app.use(cors({ origin: ["https://app.example.com"], credentials: true }));`,
  },
  {
    id: 'script-async-defer',
    group: 'DOM & Browser',
    stars: 4,
    difficulty: 'Easy',
    q: 'What is the difference between `<script>`, `async` and `defer`?',
    a: [
      "# ELI5",
      "Imagine reading a recipe book (the HTML) while groceries (scripts) are delivered.",
      "Plain script: you stop reading, wait at the door for the delivery, unpack it, then go back to reading.",
      "async: you keep reading while it is delivered, but the moment it arrives you stop to unpack it, whatever page you are on. Deliveries can arrive in any order.",
      "defer: you keep reading while it is delivered, and you unpack all deliveries in order only after you finish reading the whole book.",
      "# What it is",
      "When the browser loads a page, it parses (reads and builds) the HTML from top to bottom into the DOM.",
      "Script loading strategies:",
      "  Plain `<script src>` — parsing STOPS while the script downloads and runs. Blocks rendering.",
      "  `async` — downloads in parallel with parsing; runs as soon as it finishes downloading, pausing parsing at that moment. Execution order between async scripts is NOT guaranteed.",
      "  `defer` — downloads in parallel; runs after the HTML is fully parsed, in the order the scripts appear, just before the `DOMContentLoaded` event.",
      "`type='module'` scripts are deferred by default (and can also take `async`).",
      "`async` and `defer` only apply to external scripts (with `src`), except modules where `async` also works inline.",
      "`DOMContentLoaded` is the event fired when the HTML is fully parsed and deferred scripts have run (images may still be loading).",
      "# How it works",
      "Plain script: parser reaches the tag → fetch → execute → continue parsing.",
      "async: parser continues; when the download completes, the script executes immediately (parser pauses briefly).",
      "defer: parser continues; downloads complete in the background; after parsing finishes, deferred scripts run one by one in document order; then `DOMContentLoaded` fires.",
      "A plain script in the `<head>` cannot access elements below it, because they are not parsed yet.",
      "# Example walkthrough",
      "`analytics.js` with `async` runs whenever it arrives, which is fine because it does not depend on other scripts or the DOM.",
      "`vendor.js` and `app.js` with `defer` run in order after parsing, so `app.js` can safely use the vendor library and query the DOM.",
      "The module script is automatically deferred.",
      "The inline listener logs `DOM ready` after the deferred scripts have executed.",
      "# Why it matters / when to use",
      "Page speed: blocking scripts in the `<head>` delay the first paint, hurting metrics like First Contentful Paint and LCP.",
      "Use `defer` for your app code that needs the DOM or depends on other scripts.",
      "Use `async` for independent third-party scripts (analytics, ads, chat widgets).",
      "Frameworks like Next.js manage this with their own script strategies, but the same concepts apply.",
      "# Common mistakes",
      "Using `async` for scripts that depend on each other (e.g. a library and the code using it): they may run in the wrong order.",
      "Putting a blocking script in the head and then wondering why `document.getElementById` returns null.",
      "Adding `defer` to an inline script without `src`; it is ignored (unless it is a module).",
      "# Say this in the interview",
      "A plain script blocks HTML parsing while it downloads and executes. `async` downloads in parallel and executes as soon as it is ready, in no guaranteed order, so I use it for independent scripts like analytics. `defer` downloads in parallel and executes in order after parsing, before DOMContentLoaded, so I use it for app code. Module scripts are deferred by default.",
      "  Follow-up: When does DOMContentLoaded fire relative to defer? — After all deferred scripts have run.",
      "  Follow-up: Is putting scripts at the end of body still needed? — With `defer` it is not; defer in the head starts downloading earlier.",
    ],
    code: `<!doctype html>
<html>
<head>
  <!-- Blocks parsing until downloaded and executed (avoid in head) -->
  <!-- <script src="/legacy.js"></script> -->

  <!-- Independent: runs as soon as downloaded, order not guaranteed -->
  <script async src="https://example.com/analytics.js"></script>

  <!-- App code: downloaded in parallel, run IN ORDER after parsing -->
  <script defer src="/vendor.js"></script>
  <script defer src="/app.js"></script>  <!-- can use vendor.js + the DOM -->

  <!-- Modules are deferred by default -->
  <script type="module" src="/main.js"></script>

  <script>
    document.addEventListener("DOMContentLoaded", () => {
      console.log("DOM ready"); // → logs after vendor.js, app.js and main.js ran
    });
  </script>
</head>
<body>
  <div id="root"></div>
</body>
</html>`,
  },
  {
    id: 'preventdefault-stoppropagation',
    group: 'DOM & Browser',
    stars: 3,
    difficulty: 'Easy',
    q: 'What is the difference between `preventDefault` and `stopPropagation`?',
    a: [
      "# ELI5",
      "Imagine you shout 'Fire drill!' in a classroom.",
      "`preventDefault` is like saying 'do not actually leave the building' — the usual automatic reaction is cancelled.",
      "`stopPropagation` is like saying 'do not tell the other classrooms' — the message stops spreading, but the kids in this room still do the drill.",
      "They control two completely different things.",
      "# What it is",
      "Default action: what the browser does automatically for an event, such as following a link on click, submitting a form, toggling a checkbox, or scrolling on wheel.",
      "Propagation: the event's journey through the DOM tree (capture down, bubble up) — see event bubbling.",
      "Comparison:",
      "  `preventDefault()` — cancels the default action; the event still travels to other listeners.",
      "  `stopPropagation()` — stops the event travelling to other elements; the default action still happens.",
      "  `stopImmediatePropagation()` — like stopPropagation, and also skips any remaining listeners on the SAME element.",
      "`event.defaultPrevented` is true if any listener called `preventDefault()`.",
      "# How it works",
      "During propagation, each listener can set flags on the event object.",
      "`stopPropagation()` sets a flag; after the current element's listeners finish, the browser stops moving to the next element.",
      "`stopImmediatePropagation()` stops even before the next listener on the current element.",
      "After propagation ends, the browser checks whether `preventDefault()` was called; if not, it performs the default action.",
      "Listeners registered with `{ passive: true }` promise not to call `preventDefault`; the browser ignores it if they do, which lets scrolling start immediately (important for touch and wheel events).",
      "# Example walkthrough",
      "Submitting the form calls `preventDefault()`, so the page does not reload; we send the data with `fetch` instead.",
      "The link handler calls `preventDefault()` (no navigation) but the click still bubbles, so the parent logs `card clicked`.",
      "The button handler calls `stopPropagation()`, so the card's handler never runs, but the button's default behaviour still happens.",
      "`stopImmediatePropagation()` in the first listener prevents the second listener on the same button from running.",
      "# Why it matters / when to use",
      "Single-page apps: intercept form submits and link clicks to handle them with JavaScript instead of a full page load.",
      "Custom controls: stop a click inside a dropdown from also triggering a global 'click outside closes dropdown' handler.",
      "Validation: block a form submit when fields are invalid.",
      "# Common mistakes",
      "Using `stopPropagation` when you meant to stop a navigation or form submit (that needs `preventDefault`).",
      "Thinking `return false` cancels anything in `addEventListener`; it does nothing there (it only works in jQuery and inline `onclick` attributes).",
      "Calling `preventDefault` in a passive listener (scroll/touch) and seeing a console warning instead of an effect.",
      "Overusing `stopPropagation`, which breaks delegated handlers and analytics higher up the tree.",
      "# Say this in the interview",
      "`preventDefault` cancels the browser's default action, such as a form submit or link navigation, but the event keeps propagating. `stopPropagation` stops the event from reaching other elements, but the default action still happens. `stopImmediatePropagation` also skips remaining listeners on the same element. Passive listeners cannot call preventDefault.",
      "  Follow-up: What does `return false` do? — In jQuery both; in inline `onclick` it prevents default; in addEventListener nothing.",
      "  Follow-up: How do you know if default was prevented? — Check `event.defaultPrevented`.",
    ],
    code: `// HTML:
// <form id="form"><input name="q"><button>Go</button></form>
// <div id="card"><a id="link" href="/details">Details</a><button id="like">Like</button></div>

document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();                 // no page reload
  const data = new FormData(e.target);
  await fetch("/search", { method: "POST", body: data });
  console.log("submitted via fetch");
});

document.getElementById("card").addEventListener("click", () => console.log("card clicked"));

document.getElementById("link").addEventListener("click", (e) => {
  e.preventDefault();                 // no navigation...
  console.log("link handled");        // → link handled
});                                   // ...but bubbles: → card clicked

const like = document.getElementById("like");
like.addEventListener("click", (e) => {
  e.stopPropagation();                // card handler will NOT run
  e.stopImmediatePropagation();       // the next listener on #like will NOT run either
  console.log("liked");               // → liked
});
like.addEventListener("click", () => console.log("never printed"));

// Passive listener: preventDefault is ignored (lets scrolling stay smooth)
window.addEventListener("wheel", (e) => e.preventDefault(), { passive: true });`,
  },
  {
    id: 'reflow-repaint',
    group: 'DOM & Browser',
    stars: 3,
    difficulty: 'Medium',
    q: 'What are reflow and repaint?',
    a: [
      "# ELI5",
      "Imagine arranging furniture in a room and then painting it.",
      "Reflow is moving furniture: if you make the sofa bigger, the table, chairs and lamp all have to shift. That is a lot of work.",
      "Repaint is just changing the sofa's colour: nothing moves, you only repaint.",
      "Browsers work the same way, so changing an element's size is far more expensive than changing its colour.",
      "# What it is",
      "To show a page, the browser runs a rendering pipeline:",
      "  Style — work out which CSS rules apply to each element.",
      "  Layout (reflow) — calculate each element's exact size and position.",
      "  Paint (repaint) — fill in pixels: text, colours, borders, shadows.",
      "  Composite — combine painted layers (like transparent sheets stacked up) on screen, often on the GPU (graphics card).",
      "Reflow happens when geometry changes: width, height, margin, padding, font size, adding/removing elements, changing text, resizing the window.",
      "Repaint happens when only appearance changes: colour, background, visibility, outline.",
      "Some properties, `transform` and `opacity`, can often skip layout AND paint and only re-composite, which is the cheapest.",
      "Layout thrashing: alternating between writing styles and reading layout values (`offsetHeight`, `getBoundingClientRect`, `scrollTop`) in a loop, forcing the browser to recalculate layout synchronously each time.",
      "# How it works",
      "Normally, the browser batches DOM changes and recalculates layout once, just before the next frame (roughly every 16 ms at 60 frames per second).",
      "Reading a layout property forces the browser to flush pending changes and compute layout immediately (a forced synchronous layout).",
      "If you write, read, write, read in a loop, each read triggers a full layout: 1000 items = 1000 layouts.",
      "Batching all reads first, then all writes, lets the browser do a single layout.",
      "`requestAnimationFrame` schedules writes right before the next frame, aligning with the browser's own cycle.",
      "# Example walkthrough",
      "The bad loop reads `box.offsetWidth` and then writes a width for each item, forcing a reflow per iteration.",
      "The good version reads all widths first into an array, then writes them all, causing only one reflow.",
      "Animating `left` triggers layout on every frame; animating `transform: translateX` only re-composites.",
      "Using a `DocumentFragment` builds 1000 list items off-screen and inserts them in one operation.",
      "# Why it matters / when to use",
      "Smooth 60 fps animations and scrolling, especially on low-end phones.",
      "Rendering large tables or lists without freezing the page.",
      "Good Interaction to Next Paint (INP), a Core Web Vital that measures responsiveness.",
      "# Common mistakes",
      "Animating `top`, `left`, `width` or `height` instead of `transform` and `opacity`.",
      "Reading `offsetHeight` inside a loop that also changes styles.",
      "Inserting many elements one by one into the live DOM instead of building them in a fragment or a single HTML string.",
      "Changing many inline styles one at a time instead of toggling a single CSS class.",
      "# Say this in the interview",
      "The rendering pipeline is style, layout, paint and composite. Reflow is the layout step, recalculating sizes and positions, and it is the most expensive; repaint redraws pixels without changing geometry. Layout thrashing happens when you interleave DOM writes with layout reads, forcing synchronous reflows. I batch reads before writes, use requestAnimationFrame, animate only transform and opacity, and insert DOM nodes in batches.",
      "  Follow-up: Which properties are cheapest to animate? — `transform` and `opacity`, which only need compositing.",
      "  Follow-up: What forces a synchronous layout? — Reading geometry like `offsetWidth`, `getBoundingClientRect` or `scrollTop` after a style change.",
    ],
    code: `const boxes = [...document.querySelectorAll(".box")];

// BAD: layout thrashing (read → write → read → write ...)
for (const box of boxes) {
  const w = box.offsetWidth;          // READ forces layout
  box.style.width = w + 10 + "px";    // WRITE invalidates layout
}

// GOOD: batch all reads, then all writes (one layout)
const widths = boxes.map((b) => b.offsetWidth); // reads
requestAnimationFrame(() => {
  boxes.forEach((b, i) => (b.style.width = widths[i] + 10 + "px")); // writes
});

// BAD animation: changes layout every frame
// box.style.left = x + "px";
// GOOD animation: compositor only
boxes[0].style.transform = "translateX(100px)";

// Insert many nodes with ONE DOM operation
const frag = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const li = document.createElement("li");
  li.textContent = "Item " + i;
  frag.appendChild(li);            // off-screen, no reflow yet
}
document.querySelector("ul").appendChild(frag); // single reflow

// Prefer toggling a class over many inline style changes
boxes[0].classList.add("highlighted");`,
  },
  {
    id: 'web-workers',
    group: 'DOM & Browser',
    stars: 3,
    difficulty: 'Medium',
    q: 'What are Web Workers and Service Workers?',
    a: [
      "# ELI5",
      "Imagine a shop with one cashier (the main thread) who also has to stack shelves. While stacking heavy boxes, the queue of customers waits.",
      "A Web Worker is a helper in the back room who does the heavy box-stacking, so the cashier keeps serving customers. They talk by passing notes.",
      "A Service Worker is a doorman between the shop and the warehouse: every delivery request goes through him, and he can hand out items from a local storeroom (cache) even when the warehouse is closed (offline).",
      "# What it is",
      "The main thread is the single thread where page JavaScript, rendering and user input handling all happen. If JS blocks it, the page freezes.",
      "Web Worker: a script that runs on a separate background thread. Good for CPU-heavy work like parsing big files, image processing or encryption.",
      "  Workers have no access to the DOM (`document`, `window`).",
      "  They communicate with `postMessage` and the `message` event. Data is copied with the structured clone algorithm (a deep-copy mechanism), or transferred without copying for objects like `ArrayBuffer` (transferables).",
      "Shared Worker: one worker shared by several tabs of the same origin.",
      "Service Worker: a special worker that sits between your web app and the network, acting as a programmable proxy.",
      "  It can intercept `fetch` requests, serve responses from the Cache Storage API, enable offline mode, receive push notifications and do background sync.",
      "  It is event-driven, runs independently of any open tab, requires HTTPS (except localhost) and is the core of Progressive Web Apps (PWAs).",
      "Node's equivalent of Web Workers is the `worker_threads` module.",
      "# How it works",
      "Web Worker:",
      "  Main thread creates `new Worker('worker.js')`.",
      "  Main sends data with `worker.postMessage(data)`.",
      "  The worker receives it in `onmessage`, computes, and posts back a result.",
      "  The main thread receives the result in its own `onmessage` handler; the UI never froze.",
      "Service Worker:",
      "  The page calls `navigator.serviceWorker.register('/sw.js')`.",
      "  The SW goes through `install` (pre-cache files) and `activate` (clean old caches) events.",
      "  Afterwards, every network request from pages it controls fires a `fetch` event in the SW, which can respond from cache or network.",
      "# Example walkthrough",
      "`main.js` creates a worker and sends it the number 40.",
      "`worker.js` computes Fibonacci(40), a slow calculation, without freezing the page, then posts back the result.",
      "The main thread logs `result 102334155`.",
      "`sw.js` pre-caches the app shell on install and, on `fetch`, returns a cached response if available, otherwise goes to the network.",
      "# Why it matters / when to use",
      "Web Workers: keep the UI responsive during heavy computations (CSV parsing, compression, crypto, image filters).",
      "Service Workers: offline-capable apps, faster repeat loads, push notifications.",
      "Backend parallel: in Node, use `worker_threads` for CPU-bound work so the event loop keeps serving requests.",
      "# Common mistakes",
      "Trying to touch the DOM from a worker; send results back and update the DOM in the main thread.",
      "Sending huge objects back and forth, which copies them each time; use transferables like `ArrayBuffer`.",
      "Using workers for I/O like `fetch`; async I/O already does not block, workers help with CPU work.",
      "Forgetting service worker caching makes updates 'stick': version your caches and handle `activate` cleanup.",
      "# Say this in the interview",
      "Web Workers run JavaScript on a background thread so CPU-heavy work does not block the main thread; they have no DOM access and communicate via postMessage with structured cloning or transferables. Service Workers are event-driven proxies between the app and the network, used for offline caching, push notifications and background sync, which is the basis of PWAs. In Node, the equivalent of Web Workers is worker_threads.",
      "  Follow-up: Can a worker access localStorage? — No; workers can use IndexedDB and fetch, but not localStorage or the DOM.",
      "  Follow-up: Why do Service Workers need HTTPS? — They can intercept all traffic, so they must not be injectable by a network attacker.",
    ],
    code: `// ---- main.js ----
const worker = new Worker("worker.js");
worker.onmessage = (e) => console.log("result", e.data); // → result 102334155
worker.postMessage(40);           // heavy work happens off the main thread
console.log("UI still responsive"); // → printed immediately

// ---- worker.js ----
const fib = (n) => (n < 2 ? n : fib(n - 1) + fib(n - 2));
self.onmessage = (e) => {
  self.postMessage(fib(e.data));  // no DOM access here
};

// ---- registering a service worker (main.js) ----
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}

// ---- sw.js ----
const CACHE = "app-v1";
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(["/", "/app.js", "/style.css"])));
});
self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => cached ?? fetch(e.request)) // cache first
  );
});`,
  },
  {
    id: 'intersection-observer',
    group: 'DOM & Browser',
    stars: 2,
    difficulty: 'Medium',
    q: 'What is `IntersectionObserver` used for?',
    a: [
      "# ELI5",
      "Imagine a lifeguard who only tells you when someone enters or leaves the swimming area, instead of you staring at the pool every second.",
      "`IntersectionObserver` is that lifeguard for elements on a web page: it tells you when an element comes into view or leaves it.",
      "You do no constant checking yourself; you just get a message when something changes.",
      "# What it is",
      "The viewport is the visible part of the page in the browser window.",
      "`IntersectionObserver` is a browser API that asynchronously notifies you when a target element starts or stops intersecting (overlapping) the viewport or a chosen scrolling container (the root).",
      "Options:",
      "  `root` — the container to watch against; `null` means the viewport.",
      "  `rootMargin` — grows or shrinks the root area, e.g. `'200px'` to trigger 200px before the element is visible.",
      "  `threshold` — how much of the element must be visible to trigger: 0 (any pixel) to 1 (fully visible), or an array of values.",
      "The callback receives entries with `isIntersecting`, `intersectionRatio` and `target`.",
      "Related observers: `ResizeObserver` (element size changes) and `MutationObserver` (DOM changes).",
      "# How it works",
      "You create an observer with a callback and options.",
      "You call `observer.observe(element)` for each element to watch.",
      "The browser computes intersections itself, efficiently, as part of its rendering work, without running your JS on every scroll event.",
      "When an element crosses a threshold, the browser queues your callback with a list of changed entries.",
      "You can `unobserve(element)` once done, or `disconnect()` to stop everything.",
      "# Example walkthrough",
      "Lazy images: each `<img>` has its real URL in `data-src`. When it gets within 200px of the viewport, we copy `data-src` into `src` (starting the download) and stop observing it.",
      "Infinite scroll: an invisible sentinel `<div>` at the bottom of a list; when it becomes visible, we load the next page of items.",
      "The old approach, a scroll listener calling `getBoundingClientRect` on every element, runs on the main thread on every scroll and causes layout work.",
      "# Why it matters / when to use",
      "Lazy-loading images, videos or heavy components.",
      "Infinite scroll feeds and 'load more' lists.",
      "Scroll-triggered animations and analytics (did the user actually see this ad or section?).",
      "For simple image lazy-loading, the native `loading='lazy'` attribute on `<img>` is often enough.",
      "# Common mistakes",
      "Forgetting to `unobserve` or `disconnect`, so callbacks keep firing or memory leaks in single-page apps.",
      "Assuming the callback is called only on changes: it is also called once immediately for each newly observed element with the current state.",
      "Using it for exact pixel positions; it reports threshold crossings, not continuous positions.",
      "# Say this in the interview",
      "IntersectionObserver asynchronously reports when elements enter or leave the viewport or a root container, based on thresholds and an optional root margin. I use it for lazy-loading, infinite scroll, scroll animations and visibility analytics. It is much cheaper than scroll listeners with getBoundingClientRect because the browser computes intersections off my JavaScript's critical path.",
      "  Follow-up: What is rootMargin for? — Triggering early, e.g. starting to load images 200px before they appear.",
      "  Follow-up: Native alternative for images? — `loading='lazy'` on img and iframe elements.",
    ],
    code: `// Lazy-load images: <img data-src="/photo.jpg" alt="...">
const imgObserver = new IntersectionObserver(
  (entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const img = entry.target;
      img.src = img.dataset.src;   // start the real download
      observer.unobserve(img);     // done with this one
      console.log("loaded", img.src);
    }
  },
  { rootMargin: "200px", threshold: 0 } // start 200px before it is visible
);
document.querySelectorAll("img[data-src]").forEach((img) => imgObserver.observe(img));

// Infinite scroll: <ul id="feed"></ul><div id="sentinel"></div>
let page = 1;
const feedObserver = new IntersectionObserver(async ([entry]) => {
  if (!entry.isIntersecting) return;
  const res = await fetch("/api/posts?page=" + page++);
  const posts = await res.json();
  document.getElementById("feed").insertAdjacentHTML(
    "beforeend",
    posts.map((p) => "<li>" + p.title + "</li>").join("")
  );
  if (posts.length === 0) feedObserver.disconnect(); // no more pages
});
feedObserver.observe(document.getElementById("sentinel"));`,
  },
  {
    id: 'xss-csrf',
    group: 'DOM & Browser',
    stars: 2,
    difficulty: 'Medium',
    q: 'What are XSS and CSRF and how do you prevent them?',
    a: [
      "# ELI5",
      "XSS is like someone sneaking a fake instruction into the class announcement sheet. When the teacher reads it aloud, everyone follows it, because it looks official.",
      "CSRF is like a stranger tricking you into signing a permission slip while you are holding your school ID, so the school accepts it as yours.",
      "In XSS, the attacker's code runs INSIDE your site. In CSRF, the attacker's site makes YOUR browser send a request using your logged-in cookies.",
      "# What it is",
      "XSS (Cross-Site Scripting): an attacker gets their JavaScript to run in your page, in your users' browsers, with full access to the page.",
      "  Stored XSS — malicious script saved in your database (e.g. a comment) and shown to other users.",
      "  Reflected XSS — script in a URL parameter echoed back in the page.",
      "  DOM-based XSS — frontend code puts untrusted data into the page unsafely, e.g. via `innerHTML`.",
      "  Impact: steal tokens from localStorage, read page data, perform actions as the user, show fake login forms.",
      "CSRF (Cross-Site Request Forgery): a malicious site causes the victim's browser to send a request to your site; the browser automatically attaches your site's cookies, so the request looks authenticated.",
      "  Example: a hidden form on evil.com that auto-submits `POST https://bank.com/transfer`.",
      "  The attacker cannot read the response, but the state-changing action still happens.",
      "Comparison:",
      "  Where the attack runs — XSS: attacker code runs on your site; CSRF: attacker's page triggers requests to your site.",
      "  What it abuses — XSS: your site trusting and displaying input; CSRF: the browser automatically sending cookies.",
      "# How it works",
      "Preventing XSS:",
      "  Escape output: insert user text with `textContent` (treated as text, never as HTML) instead of `innerHTML`. Frameworks like React escape by default.",
      "  Sanitise when you must render HTML, using a library like DOMPurify.",
      "  Content-Security-Policy (CSP) header: tells the browser which script sources are allowed, blocking injected inline scripts.",
      "  HttpOnly cookies so stolen script cannot read session cookies.",
      "  Validate input on the server too.",
      "Preventing CSRF:",
      "  `SameSite=Lax` or `Strict` cookies, so the browser does not send them on cross-site POSTs.",
      "  CSRF tokens: a random secret per session, included in forms or headers, which other sites cannot know.",
      "  Check the `Origin` (or `Referer`) header on state-changing requests.",
      "  Never change state with GET requests.",
      "# Example walkthrough",
      "Rendering a comment with `innerHTML` runs the attacker's `onerror` script; `textContent` shows it as harmless text.",
      "`DOMPurify.sanitize` strips dangerous attributes when you genuinely need rich HTML.",
      "The Express server sets a CSP header that only allows scripts from your own origin.",
      "The session cookie uses `httpOnly` and `sameSite: 'lax'`.",
      "The `/transfer` route rejects requests whose `Origin` is not your frontend, blocking CSRF.",
      "# Why it matters / when to use",
      "Any app that displays user-generated content (comments, profiles, chat) must prevent XSS.",
      "Any app using cookie-based sessions must prevent CSRF on state-changing endpoints.",
      "Both appear in the OWASP Top 10 list of common web vulnerabilities.",
      "# Common mistakes",
      "Escaping input when saving but rendering with `innerHTML` elsewhere; escape at output time, per context.",
      "Thinking CORS prevents CSRF: simple cross-site form posts are sent regardless of CORS.",
      "Storing auth tokens in localStorage, which turns any XSS into account takeover.",
      "Using `dangerouslySetInnerHTML` in React with unsanitised data.",
      "# Say this in the interview",
      "XSS is when attacker-controlled script runs in my page, usually from unescaped user input; I prevent it by escaping output with textContent or framework defaults, sanitising any HTML with DOMPurify, adding a Content-Security-Policy and using HttpOnly cookies. CSRF is when another site makes the user's browser send an authenticated request with their cookies; I prevent it with SameSite cookies, CSRF tokens and Origin checks, and by never changing state on GET.",
      "  Follow-up: Does a JWT in an Authorization header prevent CSRF? — Yes, because browsers do not attach it automatically, but then XSS becomes the bigger risk.",
      "  Follow-up: What does CSP do? — Restricts where scripts, styles and other resources may load from, blocking most injected scripts.",
    ],
    code: `// ---- XSS in the browser ----
const comment = '<img src=x onerror="alert(document.cookie)">'; // attacker input
const box = document.getElementById("comment");

// box.innerHTML = comment;   // DANGEROUS: the onerror script runs
box.textContent = comment;    // SAFE: shown as plain text

// If you must render rich HTML, sanitise it:
// import DOMPurify from "dompurify";
// box.innerHTML = DOMPurify.sanitize(comment); // → <img src="x"> (onerror removed)

// ---- Server side (Express) ----
import express from "express";
const app = express();

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "script-src 'self'"); // block injected scripts
  next();
});

app.post("/login", (req, res) => {
  res.cookie("sid", "abc", { httpOnly: true, secure: true, sameSite: "lax" });
  res.send("ok");
});

// CSRF defence: only accept state changes from our own frontend
app.post("/transfer", (req, res) => {
  if (req.headers.origin !== "https://app.example.com") {
    return res.status(403).send("CSRF blocked"); // → 403 for evil.com
  }
  res.send("transfer done");
});
app.listen(3000);`,
  },

  // ───────────────────────── Performance & Patterns ─────────────────────────
  {
    id: 'debounce',
    group: 'Performance & Patterns',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is debouncing? Implement `debounce`.',
    a: [
      "# ELI5",
      "Imagine a lift (elevator). When someone walks in, the doors wait a few seconds before closing.",
      "If another person walks in during that wait, the timer resets and the doors wait again.",
      "The lift only leaves once nobody has entered for a few seconds in a row.",
      "Debounce is that lift door: a function only runs after the calls STOP for a set amount of time.",
      "# What it is",
      "Debouncing is a technique that delays running a function until it has not been called for `delay` milliseconds.",
      "A burst of many rapid calls collapses into ONE call, made after the burst ends (this is the trailing-edge version, the most common).",
      "Leading-edge variant: run immediately on the first call, then ignore further calls until things have been quiet for `delay` ms.",
      "It is built with a closure — a function that remembers variables from the scope where it was created — holding a timer id.",
      "`setTimeout` schedules a function to run later and returns an id; `clearTimeout(id)` cancels that scheduled run.",
      "# How it works",
      "`debounce(fn, delay)` returns a new wrapper function and keeps a private `timer` variable in its closure.",
      "Each time the wrapper is called:",
      "  It cancels any previously scheduled run with `clearTimeout(timer)`.",
      "  It schedules a new run of `fn` after `delay` ms with `setTimeout`, saving the new timer id.",
      "If another call arrives before the delay ends, step 1 cancels the pending run, so the wait starts over.",
      "When calls stop for `delay` ms, the last scheduled timer finally fires and `fn` runs once with the LAST call's arguments.",
      "Using a regular `function` wrapper and `fn.apply(this, args)` preserves `this` and all arguments for the original function.",
      "Extras often asked: a `cancel()` method (clear the timer), `flush()` (run the pending call now) and `maxWait` (guarantee a run at least every N ms, as in lodash).",
      "# Example walkthrough",
      "`search` is debounced with 300 ms.",
      "We simulate typing 'h', 'he', 'hel', 'hell', 'hello' every 100 ms.",
      "Each call cancels the previous timer because the next keystroke comes after only 100 ms.",
      "After the last keystroke, 300 ms pass with no new call, so `search` runs once: `searching for hello`.",
      "Without debounce, we would have sent 5 API requests; with it, only 1.",
      "`saveDraft.cancel()` shows how to cancel a pending call, for example when a component unmounts.",
      "# Why it matters / when to use",
      "Search-as-you-type: call the API only when the user pauses typing.",
      "Autosave: save a document after the user stops editing for a moment.",
      "Window resize: recompute layout once the user finishes resizing.",
      "Backend: batch frequent file-change events (e.g. a file watcher) into one rebuild, or debounce cache invalidation.",
      "Reduces server load, API costs and rate-limit errors.",
      "# Common mistakes",
      "Creating the debounced function inside a render or handler, so a new timer closure is made every time and nothing is ever debounced. Create it once and reuse it.",
      "Using an arrow function wrapper and losing the caller's `this`.",
      "Forgetting to pass the arguments through, so `fn` runs with nothing.",
      "Confusing debounce with throttle: debounce waits for silence, throttle runs at a steady rate during activity.",
      "Not cancelling on cleanup (component unmount, server shutdown), so a stale call fires later.",
      "# Say this in the interview",
      "Debouncing delays a function until it has not been called for a given time, so a burst of calls becomes a single call after the burst. I implement it with a closure holding a timer: every call clears the previous timeout and sets a new one, and I use a regular function with `fn.apply(this, args)` to keep `this` and arguments. It is ideal for search inputs, autosave and resize handlers; variants add leading-edge execution, cancel and maxWait.",
      "  Follow-up: Debounce vs throttle? — Debounce runs once after the activity stops; throttle runs at most once per interval during the activity.",
      "  Follow-up: How would you add `cancel`? — Attach a method to the returned function that calls `clearTimeout(timer)`.",
    ],
    code: `function debounce(fn, delay) {
  let timer;                                  // remembered by the closure
  function debounced(...args) {
    clearTimeout(timer);                      // cancel the previous pending call
    timer = setTimeout(() => fn.apply(this, args), delay); // schedule a fresh one
  }
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}

let apiCalls = 0;
const search = debounce((query) => {
  apiCalls++;
  console.log("searching for", query);
}, 300);

// Simulate typing one letter every 100ms
["h", "he", "hel", "hell", "hello"].forEach((q, i) => {
  setTimeout(() => search(q), i * 100);
});
setTimeout(() => console.log("API calls:", apiCalls), 1000);
// → searching for hello   (only once, ~300ms after the last keystroke)
// → API calls: 1

// Cancelling a pending call (e.g. on unmount / shutdown)
const saveDraft = debounce(() => console.log("saved"), 500);
saveDraft();
saveDraft.cancel(); // "saved" is never printed

// Browser usage:
// input.addEventListener("input", debounce((e) => search(e.target.value), 300));`,
  },
  {
    id: 'throttle',
    group: 'Performance & Patterns',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is throttling? Implement `throttle` and compare it with debounce.',
    a: [
      "# ELI5",
      "Imagine a water tap that can fill only one glass per second, no matter how fast people hold out glasses.",
      "If ten people push glasses under it in one second, only one gets water that second; the next one gets water the following second.",
      "Throttle is that tap: a function runs at most once every N milliseconds, even if it is called constantly.",
      "Compare with debounce (the lift door): debounce waits until people STOP coming; throttle keeps serving at a steady pace while they keep coming.",
      "# What it is",
      "Throttling limits how often a function can run: at most once per `interval` ms.",
      "During a continuous stream of calls, the function runs regularly (e.g. every 200 ms), instead of hundreds of times or not at all.",
      "Leading edge: run on the first call immediately. Trailing edge: also run once at the end of the interval with the latest arguments, so the final state is not lost.",
      "Comparison with debounce:",
      "  When it runs — debounce: once, after calls stop for `delay`; throttle: at regular intervals while calls continue.",
      "  During a 2-second burst with a 200 ms setting — debounce: 1 call at the end; throttle: about 10 calls spread across the burst.",
      "  Best for — debounce: 'final value' events (search input, autosave, resize end); throttle: 'continuous progress' events (scroll position, mouse move, drag, progress updates).",
      "# How it works",
      "Timestamp version (leading edge):",
      "  The closure stores `last`, the time of the last run.",
      "  On each call, compare `Date.now() - last` with `interval`.",
      "  If enough time has passed, update `last` and run `fn`; otherwise ignore the call.",
      "Leading + trailing version:",
      "  Same check, but if the call is ignored, remember the latest arguments and schedule one run for when the interval ends.",
      "  This guarantees the very last call is not lost (e.g. the final scroll position).",
      "For visual updates in browsers, `requestAnimationFrame` naturally throttles to the screen's frame rate.",
      "# Example walkthrough",
      "We call the throttled `log` every 50 ms for 500 ms (10 calls) with a 200 ms interval.",
      "The simple version runs at about 0 ms, 200 ms and 400 ms: 3 runs, the rest are dropped.",
      "The leading + trailing version does the same, plus one final run with the last argument after the burst ends.",
      "A debounced version of the same burst would run only once, about 200 ms after the last call.",
      "# Why it matters / when to use",
      "Scroll and resize handlers: update a sticky header or 'scroll to top' button without running hundreds of times per second.",
      "Mouse move, drag and drop, game input.",
      "Backend: limiting how often you log, emit progress events over WebSocket, or call a rate-limited third-party API.",
      "Related backend concept: rate limiting on the server (e.g. 100 requests per minute per user) applies the same idea to incoming requests.",
      "# Common mistakes",
      "Using throttle for search input, which sends requests mid-typing; debounce fits better.",
      "Using only the leading-edge version where the final value matters (e.g. final scroll position or last slider value); add a trailing call.",
      "Creating a new throttled function on every event, so the timing state resets each time.",
      "Losing `this` and arguments by not using `fn.apply(this, args)`.",
      "# Say this in the interview",
      "Throttling ensures a function runs at most once per interval no matter how often it is called, so during continuous activity it runs at a steady rate. I implement it with a closure storing the last run time and only invoking when the interval has passed, optionally with a trailing call to capture the final arguments. Debounce, in contrast, waits for a pause and runs once at the end. I use throttle for scroll, mousemove and progress updates, and debounce for search and autosave.",
      "  Follow-up: How is requestAnimationFrame related? — It throttles visual work to once per frame, synced with repaint.",
      "  Follow-up: Why add a trailing call? — Otherwise the last event in a burst might be dropped and the UI shows a stale state.",
    ],
    code: `// Leading-edge throttle (timestamp version)
function throttle(fn, interval) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= interval) {
      last = now;
      fn.apply(this, args);
    }
  };
}

// Leading + trailing throttle: never loses the last call
function throttleTrailing(fn, interval) {
  let last = 0, timer = null, lastArgs;
  return function (...args) {
    const now = Date.now();
    const remaining = interval - (now - last);
    lastArgs = args;
    if (remaining <= 0) {
      clearTimeout(timer); timer = null;
      last = now;
      fn.apply(this, args);
    } else if (!timer) {
      timer = setTimeout(() => {
        last = Date.now(); timer = null;
        fn.apply(this, lastArgs);           // run with the latest arguments
      }, remaining);
    }
  };
}

const simple = throttle((i) => console.log("simple", i), 200);
const trailing = throttleTrailing((i) => console.log("trailing", i), 200);
for (let i = 0; i < 10; i++) {
  setTimeout(() => { simple(i); trailing(i); }, i * 50); // a call every 50ms
}
// → simple 0, simple 4, simple 8   (about every 200ms; exact ids vary with timer jitter)
// → trailing 0, ... about every 200ms ..., trailing 9   (the last call is always kept)`,
  },
  {
    id: 'memoization',
    group: 'Performance & Patterns',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is memoization? Implement `memoize`.',
    a: [
      "# ELI5",
      "Your teacher asks you 'What is 37 × 43?'. You work it out on paper: 1591. You write the answer on a sticky note.",
      "Next time anyone asks the same question, you just read the sticky note instead of calculating again.",
      "Memoization is keeping those sticky notes for a function: same question, instant answer.",
      "# What it is",
      "Memoization is caching (saving) the result of a function call, keyed by its arguments, so repeated calls with the same arguments return the saved result instead of recomputing.",
      "It trades memory (storing results) for speed (skipping work).",
      "It is only correct for pure functions: functions that always return the same output for the same input and have no side effects (they do not change anything outside, like writing to a DB).",
      "A cache key must uniquely represent the arguments. For a single primitive argument, the argument itself works; for several, people often use `JSON.stringify(args)` (simple but slow, and loses types like `undefined`, Dates and functions).",
      "Unbounded caches grow forever and leak memory; production code uses a size limit like LRU (Least Recently Used: evict the entry not used for the longest time) or a TTL (time to live: entries expire).",
      "# How it works",
      "`memoize(fn)` creates a `Map` inside a closure and returns a wrapper function.",
      "When the wrapper is called, it builds a key from the arguments.",
      "If the cache has the key, it returns the stored value immediately (a cache hit).",
      "Otherwise (a cache miss), it calls the original function, stores the result under the key, and returns it.",
      "For recursive functions like Fibonacci, the recursive calls must go through the memoized version, so subproblems are cached too — this is the top-down form of dynamic programming.",
      "# Example walkthrough",
      "`slowSquare` pretends to be expensive and counts how many times it really runs.",
      "Calling the memoized version with 4 twice runs the real function only once; `runs` is 1.",
      "Naive `fib(35)` makes about 30 million calls; the memoized `fibMemo(35)` makes only 36 real computations, because each n is computed once.",
      "`memoizeLRU` keeps at most 2 entries: adding a third evicts the least recently used one.",
      "A Map preserves insertion order, so deleting and re-setting a key moves it to the end, which is how this tiny LRU works.",
      "# Why it matters / when to use",
      "Expensive pure computations: parsing, formatting, permission calculations, pricing rules.",
      "Dynamic programming interview problems (Fibonacci, climbing stairs, coin change).",
      "React: `useMemo`, `React.memo` and `useCallback` are memoization tools for rendering.",
      "Backend caching of slow lookups uses the same idea at a larger scale (Redis cache with TTL), but remember that DB results can change, so it needs invalidation.",
      "# Common mistakes",
      "Memoizing impure functions (reading the current time, random numbers, DB data), which returns stale or wrong results.",
      "Using `JSON.stringify` keys with object arguments whose key order differs, causing cache misses, or with values JSON cannot represent.",
      "Unbounded caches in long-running servers: memory grows until the process crashes. Add a limit or TTL, or use a `WeakMap` for object keys.",
      "Memoizing cheap functions, where the cache lookup costs more than the calculation.",
      "# Say this in the interview",
      "Memoization caches a pure function's results keyed by its arguments, so repeated calls return instantly, trading memory for speed. I implement it with a closure over a Map: build a key, return the cached value on a hit, otherwise compute, store and return. In production I bound the cache with an LRU limit or TTL, or use a WeakMap for object keys, and I only memoize pure functions.",
      "  Follow-up: How does it help Fibonacci? — It turns exponential O(2^n) time into O(n) because each subproblem is computed once.",
      "  Follow-up: How do you handle multiple arguments? — Serialise them into a key, or use nested Maps / WeakMaps per argument.",
    ],
    code: `function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = args.length === 1 ? args[0] : JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);   // cache hit
    const result = fn.apply(this, args);         // cache miss: compute
    cache.set(key, result);
    return result;
  };
}

let runs = 0;
const slowSquare = (n) => { runs++; return n * n; };
const fastSquare = memoize(slowSquare);
console.log(fastSquare(4), fastSquare(4), runs); // → 16 16 1

// Memoized recursion (top-down dynamic programming)
let computations = 0;
const fibMemo = memoize((n) => {
  computations++;
  return n < 2 ? n : fibMemo(n - 1) + fibMemo(n - 2); // recursive calls hit the cache
});
console.log(fibMemo(35), computations); // → 9227465 36

// Bounded cache: tiny LRU using Map insertion order
function memoizeLRU(fn, limit = 2) {
  const cache = new Map();
  return (key) => {
    if (cache.has(key)) {
      const value = cache.get(key);
      cache.delete(key); cache.set(key, value);   // mark as recently used
      return value;
    }
    const value = fn(key);
    cache.set(key, value);
    if (cache.size > limit) cache.delete(cache.keys().next().value); // evict oldest
    return value;
  };
}
const cube = memoizeLRU((n) => n ** 3);
cube(1); cube(2); cube(3); // 1 is evicted`,
  },
  {
    id: 'observer-pubsub',
    group: 'Performance & Patterns',
    stars: 4,
    difficulty: 'Medium',
    q: 'Implement an event emitter (observer / pub-sub pattern).',
    a: [
      "# ELI5",
      "Think of a YouTube channel. Viewers press 'subscribe', and whenever a new video is published, every subscriber gets a notification.",
      "The channel does not need to know who you are or what you do with the notification; it just tells everyone on the list.",
      "You can unsubscribe at any time, and then you stop getting notifications.",
      "An event emitter is that channel in code.",
      "# What it is",
      "Observer pattern: an object (the subject) keeps a list of functions (observers/listeners) and calls all of them when something happens.",
      "Pub/sub (publish/subscribe): a variation where a middle-man (a broker or event bus) sits between publishers and subscribers, so neither knows about the other. Often across processes (Redis pub/sub, Kafka, RabbitMQ).",
      "An event emitter is a small object implementing this with named events:",
      "  `on(event, fn)` — subscribe a listener.",
      "  `off(event, fn)` — unsubscribe it.",
      "  `emit(event, ...args)` — call every listener of that event with the arguments.",
      "  `once(event, fn)` — subscribe for only the next emission.",
      "This decouples code: the part that emits does not need to import or know about the parts that react.",
      "# How it works",
      "Internally, keep a `Map` from event name to a `Set` of listener functions (a Set avoids duplicate registrations).",
      "`on` creates the Set if needed, adds the function, and returns an unsubscribe function for convenience.",
      "`emit` looks up the Set and calls each listener with the arguments; copying the Set first makes it safe if listeners unsubscribe during emit.",
      "`once` wraps the listener in a function that removes itself before calling the original.",
      "Node's built-in `EventEmitter` (from `node:events`) works the same way and calls listeners synchronously in registration order.",
      "# Example walkthrough",
      "`orders` is our emitter. Two features subscribe to `order:created`: email and analytics.",
      "`emit('order:created', { id: 1 })` calls both, printing `email for order 1` and `track order 1`.",
      "`once` registers a listener that prints only the first time.",
      "Calling the function returned by `on` (`stopTracking()`) unsubscribes analytics, so the second emit prints only the email line.",
      "The last part shows Node's built-in `EventEmitter`, which you would use in real code.",
      "# Why it matters / when to use",
      "Node core is built on it: HTTP servers, streams, sockets and `process` all emit events.",
      "Decoupling domain logic: when an order is created, send email, update analytics and notify the warehouse without the order service knowing about each one.",
      "Frontend: DOM events, state stores (Redux `subscribe`), RxJS observables.",
      "Across services, the same idea is implemented with message brokers (Kafka, RabbitMQ, Redis pub/sub).",
      "# Common mistakes",
      "Never unsubscribing, causing memory leaks and duplicate handlers (Node warns after 10 listeners on one event: `MaxListenersExceededWarning`).",
      "Passing a new anonymous function to `off`; it is a different function, so nothing is removed. Keep a reference or use the returned unsubscribe function.",
      "Assuming `emit` is asynchronous; Node's EventEmitter calls listeners synchronously, so a slow listener blocks the emitter.",
      "Emitting an `'error'` event in Node with no listener: Node throws it and can crash the process.",
      "# Say this in the interview",
      "The observer pattern has a subject keep a list of listeners and notify them on events; pub/sub adds a broker so publishers and subscribers are fully decoupled. I implement an emitter with a Map of event names to Sets of listeners, with `on` returning an unsubscribe function, `off`, `emit` and `once`. Node's EventEmitter is the built-in version, and I always clean up listeners to avoid leaks.",
      "  Follow-up: Is EventEmitter async? — No, `emit` calls listeners synchronously in registration order.",
      "  Follow-up: Observer vs pub/sub? — Observer: subjects know their observers directly; pub/sub: a broker or channel sits in between.",
    ],
    code: `class Emitter {
  #events = new Map(); // event name -> Set of listeners

  on(name, fn) {
    if (!this.#events.has(name)) this.#events.set(name, new Set());
    this.#events.get(name).add(fn);
    return () => this.off(name, fn);      // handy unsubscribe function
  }
  off(name, fn) {
    this.#events.get(name)?.delete(fn);
  }
  once(name, fn) {
    const wrapper = (...args) => { this.off(name, wrapper); fn(...args); };
    return this.on(name, wrapper);
  }
  emit(name, ...args) {
    for (const fn of [...(this.#events.get(name) ?? [])]) fn(...args); // copy = safe
  }
}

const orders = new Emitter();
orders.on("order:created", (o) => console.log("email for order", o.id));
const stopTracking = orders.on("order:created", (o) => console.log("track order", o.id));
orders.once("order:created", () => console.log("first order ever!"));

orders.emit("order:created", { id: 1 });
// → email for order 1
// → track order 1
// → first order ever!

stopTracking();
orders.emit("order:created", { id: 2 });
// → email for order 2

// Node's built-in version
import { EventEmitter } from "node:events";
const bus = new EventEmitter();
bus.on("ping", (n) => console.log("pong", n));
bus.emit("ping", 1); // → pong 1`,
  },
  {
    id: 'garbage-collection-leaks',
    group: 'Performance & Patterns',
    stars: 3,
    difficulty: 'Medium',
    q: 'How does garbage collection work in JS and what causes memory leaks?',
    a: [
      "# ELI5",
      "Imagine a playroom where toys are connected to the door by strings. A cleaner comes by regularly, starts at the door and follows every string.",
      "Any toy she can reach by following strings stays. Any toy with no string path back to the door gets thrown away.",
      "A memory leak is when you forget to cut a string to a toy you no longer need, so the cleaner can never throw it away, and the room fills up.",
      "# What it is",
      "Memory for objects lives in the heap — a large pool of memory the engine manages.",
      "Garbage collection (GC) is the engine automatically freeing objects your program can no longer use, so you never call `free` yourself.",
      "Reachability: an object is kept if it can be reached from a root. Roots include global variables, variables on the current call stack (functions currently running), and values captured by active closures.",
      "Mark-and-sweep: the GC marks everything reachable from the roots, then sweeps (frees) everything unmarked.",
      "Circular references (A points to B, B points to A) are NOT a problem: if neither is reachable from a root, both are freed.",
      "V8 (the engine in Chrome and Node) is generational: new objects go to a small young generation that is collected often and quickly; objects that survive move to the old generation, collected less often. Most of this work happens incrementally and in parallel to keep pauses short.",
      "A memory leak in JS means objects stay reachable even though you no longer need them, so the GC is not allowed to free them.",
      "# How it works",
      "Your code allocates objects as it runs.",
      "When the young generation fills up, a fast minor GC (scavenge) copies surviving objects and drops the rest.",
      "Objects that survive a couple of minor GCs are promoted to the old generation.",
      "Periodically a major GC marks reachable objects across the whole heap and sweeps the unreachable ones, sometimes compacting memory.",
      "If the old generation keeps growing because things stay reachable, Node eventually crashes with 'JavaScript heap out of memory'.",
      "# Example walkthrough",
      "`cache` is a module-level Map that grows on every request and is never cleaned: a classic server leak.",
      "The fix uses a bounded size (or an LRU library / TTL).",
      "`setInterval` keeps its callback and everything it closes over (the big buffer) alive until `clearInterval` is called.",
      "Adding an event listener on every request without removing it accumulates listeners and the objects they reference.",
      "`process.memoryUsage().heapUsed` shows heap usage; run with `node --inspect` and take heap snapshots in Chrome DevTools to find what is retaining memory.",
      "# Why it matters / when to use",
      "Node servers run for days or weeks; a tiny leak per request eventually crashes the process or causes long GC pauses and slow responses.",
      "In browsers, leaks in single-page apps make tabs slow and crash on low-memory devices.",
      "Diagnosing leaks is a common senior-level interview and on-call skill.",
      "# Common mistakes",
      "Unbounded caches or arrays at module level (grow forever).",
      "Forgotten timers (`setInterval`) and event listeners that are never removed.",
      "Accidental globals (assigning to an undeclared variable in sloppy mode).",
      "Closures that capture large objects longer than needed.",
      "Detached DOM nodes: removed from the page but still referenced from JS variables.",
      "# Say this in the interview",
      "JavaScript uses tracing garbage collection: objects reachable from roots like globals, the stack and closures are kept, and the rest are freed using mark-and-sweep, so circular references are fine. V8 is generational, collecting short-lived objects quickly in the young generation. Leaks happen when unneeded objects stay reachable: unbounded caches, forgotten timers and listeners, accidental globals, closures and detached DOM nodes. I debug with heap snapshots and fix with bounded caches, cleanup and WeakMap or WeakRef.",
      "  Follow-up: Can you force GC? — Not in normal code; `node --expose-gc` exposes `global.gc()` for testing only.",
      "  Follow-up: How do you find a leak in Node? — Compare heap snapshots over time with `--inspect` and DevTools and look at what retains the growing objects.",
    ],
    code: `// LEAK 1: unbounded module-level cache
const cache = new Map();
function handleRequest(id) {
  cache.set(id + "-" + Date.now(), { data: new Array(1000).fill("x") }); // grows forever
}

// FIX: bound it (or use an LRU library / TTL)
const MAX = 1000;
function handleRequestFixed(id) {
  if (cache.size >= MAX) cache.delete(cache.keys().next().value); // evict oldest
  cache.set(id, { data: "..." });
}

// LEAK 2: timer keeps its closure (and bigBuffer) alive forever
const bigBuffer = Buffer.alloc(50 * 1024 * 1024);
const timer = setInterval(() => console.log(bigBuffer.length), 60_000);
clearInterval(timer); // FIX: always clear timers you no longer need

// LEAK 3: adding listeners repeatedly
import { EventEmitter } from "node:events";
const bus = new EventEmitter();
function subscribe() {
  const onMsg = (m) => console.log(m);
  bus.on("msg", onMsg);
  return () => bus.off("msg", onMsg); // FIX: return and call a cleanup
}
const unsubscribe = subscribe();
unsubscribe();

// Watching memory
const mb = (n) => (n / 1024 / 1024).toFixed(1) + " MB";
console.log("heap used:", mb(process.memoryUsage().heapUsed)); // e.g. → heap used: 54.3 MB`,
  },
  {
    id: 'lazy-loading-code-splitting',
    group: 'Performance & Patterns',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do lazy loading and code splitting improve performance?',
    a: [
      "# ELI5",
      "Imagine a huge restaurant menu delivered as one 500-page book before you can even sit down.",
      "Code splitting is printing the menu as separate small booklets: starters, mains, desserts.",
      "Lazy loading is the waiter bringing the dessert booklet only when you ask for dessert.",
      "You sit down and order much faster, because you only got what you needed right now.",
      "# What it is",
      "A bundle is the JavaScript file(s) a build tool (bundler) like Vite, webpack or Next.js produces from your source code.",
      "Code splitting: breaking one big bundle into smaller chunks (separate files) that can be loaded independently.",
      "Lazy loading: delaying the loading of something until it is actually needed (a route, a modal, an image, a heavy library).",
      "Dynamic `import()` is the mechanism: bundlers create a separate chunk for each dynamically imported module.",
      "Images and iframes can be lazy-loaded natively with `loading='lazy'`.",
      "Prefetching and preloading: hints that tell the browser to download a resource early (in idle time or with high priority) so it is ready when needed.",
      "# How it works",
      "At build time, the bundler sees `import('./Chart.js')` and puts `Chart.js` and its dependencies in their own chunk file.",
      "The initial page loads only the main chunk, which is smaller, so it downloads, parses and executes faster.",
      "When the user triggers the feature (opens the chart tab), the `import()` runs, the browser fetches the chunk, and the code executes.",
      "Frameworks automate route-level splitting: Next.js creates a chunk per page automatically; React offers `React.lazy` + `Suspense` for components; Next.js offers `next/dynamic`.",
      "On the server, Node can also lazy-load heavy modules with dynamic `import()` to reduce startup time (useful for CLIs and serverless cold starts).",
      "# Example walkthrough",
      "Clicking 'Show report' runs `await import('./chart.js')`, which downloads the chart chunk only at that moment.",
      "The `{ renderChart }` named export is pulled from the module namespace and called.",
      "Hovering the button calls the same `import()` early (prefetch), so by the time the user clicks it is usually already cached.",
      "The React example uses `lazy(() => import('./AdminPanel'))` and shows a loading fallback via `Suspense` while the chunk downloads.",
      "The `<img loading='lazy'>` defers off-screen images natively.",
      "# Why it matters / when to use",
      "Faster initial load improves Core Web Vitals like LCP (Largest Contentful Paint, when the main content appears) and INP (responsiveness), plus Total Blocking Time.",
      "Users on slow mobile networks benefit most.",
      "Good candidates: admin panels, charts, rich text editors, maps, PDF viewers, date libraries with locales, rarely used routes.",
      "Serverless functions: smaller bundles and lazy imports reduce cold start time.",
      "# Common mistakes",
      "Splitting too much: dozens of tiny chunks cause many extra network requests (waterfalls).",
      "Lazy loading content that is visible immediately (above the fold), which delays it and hurts LCP.",
      "Not showing a loading state, so the UI looks frozen while the chunk downloads.",
      "Statically importing a module somewhere else too, which pulls it back into the main bundle and defeats the split.",
      "# Say this in the interview",
      "Code splitting breaks the app bundle into chunks so users download only what the current page needs, and lazy loading defers non-critical code and assets until they are used. Both are built on dynamic `import()`, which bundlers turn into separate chunks, with helpers like React.lazy and next/dynamic. This reduces initial JavaScript and improves LCP and blocking time; I pair it with prefetching on hover or idle to hide the delay.",
      "  Follow-up: What should not be lazy loaded? — Above-the-fold content and code needed for the first interaction.",
      "  Follow-up: How do you check the effect? — Bundle analyzers and Lighthouse or Web Vitals measurements before and after.",
    ],
    code: `// ---- Plain JS with dynamic import() ----
const btn = document.querySelector("#show-report");

btn.addEventListener("click", async () => {
  btn.textContent = "Loading...";
  const { renderChart } = await import("./chart.js"); // separate chunk, fetched now
  renderChart(document.querySelector("#report"));
  btn.textContent = "Show report";
});

// Prefetch on hover so the click feels instant (import() is cached)
btn.addEventListener("mouseenter", () => import("./chart.js"), { once: true });

// ---- React ----
import { lazy, Suspense } from "react";
const AdminPanel = lazy(() => import("./AdminPanel")); // own chunk

function App({ isAdmin }) {
  return (
    <Suspense fallback={<p>Loading admin tools...</p>}>
      {isAdmin && <AdminPanel />}
    </Suspense>
  );
}

// ---- Native lazy images (HTML) ----
// <img src="/hero.jpg" alt="Hero">                      above the fold: load now
// <img src="/gallery-1.jpg" alt="..." loading="lazy">  below the fold: load later`,
  },
  {
    id: 'singleton-factory',
    group: 'Performance & Patterns',
    stars: 2,
    difficulty: 'Easy',
    q: 'Explain the Singleton and Factory patterns in JavaScript.',
    a: [
      "# ELI5",
      "Singleton: a school has exactly ONE principal. Whoever asks 'who is the principal?' gets the same person.",
      "Factory: a toy factory. You say 'I want a car' or 'I want a robot', and the factory builds the right toy for you; you do not need to know how it is assembled.",
      "# What it is",
      "Design patterns are well-known, reusable solutions to common code design problems.",
      "Singleton: ensures only one instance of something exists and gives a global access point to it.",
      "  Typical uses: a database connection pool, a logger, an app config object, a cache client (Redis).",
      "  In JavaScript, ES modules (and CommonJS) are evaluated only once and cached, so exporting an already-created instance from a module is a natural singleton.",
      "Factory: a function (or method) that creates and returns objects, hiding the details of which class or configuration is used.",
      "  The caller asks for 'what' it wants; the factory decides 'how' to build it.",
      "  Factories combined with closures can give objects private state without classes.",
      "# How it works",
      "Module singleton:",
      "  `db.js` creates the pool once at module load and exports it.",
      "  Every file that imports `db.js` receives the same cached module, therefore the same pool.",
      "Lazy singleton (class version): a static field holds the instance; `getInstance()` creates it on the first call and returns the stored one afterwards.",
      "Factory:",
      "  `createNotifier(type)` uses a switch or lookup table to choose the implementation (email, SMS).",
      "  It returns objects with the same interface (`send`), so callers can treat them the same way.",
      "# Example walkthrough",
      "`Config.getInstance()` called twice returns the same object, so `a === b` is true.",
      "The module-level `pool` comment shows the more idiomatic Node approach.",
      "`createNotifier('email')` returns an object whose `send` prints an email message; `'sms'` returns an SMS one.",
      "An unknown type throws, so mistakes are caught early.",
      "`createCounter` is a closure-based factory: `count` is private, reachable only through `increment`.",
      "# Why it matters / when to use",
      "Singletons avoid opening many DB connections (creating a new pool per request would exhaust the database).",
      "In Next.js dev mode, hot reloading re-evaluates modules, so people store the singleton on `globalThis` to avoid creating multiple Prisma clients.",
      "Factories keep calling code simple and make it easy to add a new type (e.g. a push notifier) in one place.",
      "Factories also help testing: a test can ask the factory for a fake implementation.",
      "# Common mistakes",
      "Overusing singletons as hidden global state, which makes testing hard (shared state between tests) and hides dependencies. Prefer passing dependencies in (dependency injection) where practical.",
      "Assuming a module singleton is shared across processes: each Node process, worker thread or serverless instance has its own copy.",
      "Factories that grow into giant switch statements; use a lookup object or registry.",
      "# Say this in the interview",
      "A Singleton guarantees one shared instance, like a DB pool, config or logger; in JavaScript the module cache makes exporting an instance a natural singleton, or I use a static getInstance. A Factory is a function that creates objects for the caller, hiding which implementation is constructed, often returning objects with a common interface. Singletons can hurt testability because they are global state, so I keep them minimal.",
      "  Follow-up: Is a module singleton shared between cluster workers? — No, each process loads its own copy.",
      "  Follow-up: Factory vs constructor? — A factory can return different types, cached objects or private closures, and does not need `new`.",
    ],
    code: `// ---- Singleton (class with lazy instance) ----
class Config {
  static #instance;
  constructor() { this.env = process.env.NODE_ENV ?? "development"; }
  static getInstance() {
    return (Config.#instance ??= new Config()); // create once, then reuse
  }
}
const a = Config.getInstance();
const b = Config.getInstance();
console.log(a === b); // → true

// Idiomatic Node: the module itself is the singleton
// db.js:  import pg from "pg"; export const pool = new pg.Pool();  (created once)
// any.js: import { pool } from "./db.js";                          (same pool everywhere)

// ---- Factory ----
function createNotifier(type) {
  const notifiers = {
    email: () => ({ send: (to, msg) => console.log("email to " + to + ": " + msg) }),
    sms: () => ({ send: (to, msg) => console.log("sms to " + to + ": " + msg) }),
  };
  if (!notifiers[type]) throw new Error("Unknown notifier: " + type);
  return notifiers[type]();
}
createNotifier("email").send("ann@x.com", "Welcome"); // → email to ann@x.com: Welcome
createNotifier("sms").send("+911234", "OTP 4321");    // → sms to +911234: OTP 4321

// Factory + closure = private state without classes
function createCounter() {
  let count = 0;                       // private
  return { increment: () => ++count };
}
const counter = createCounter();
counter.increment();
console.log(counter.increment(), counter.count); // → 2 undefined`,
  },
  {
    id: 'requestanimationframe',
    group: 'Performance & Patterns',
    stars: 1,
    difficulty: 'Medium',
    q: 'What is `requestAnimationFrame` and why use it over `setInterval`?',
    a: [
      "# ELI5",
      "Think of a flipbook animation. Each page must be drawn right before you flip to it.",
      "`setInterval` is a friend who draws pages on a fixed timer, ignoring when you actually flip: sometimes two pages for one flip, sometimes none, so the animation stutters.",
      "`requestAnimationFrame` is a friend who waits for you to say 'flipping now!' and draws exactly one page each time.",
      "# What it is",
      "The screen refreshes at a fixed rate, often 60 times per second (about every 16.7 ms), or more on 120 Hz displays. Each refresh is a frame.",
      "`requestAnimationFrame(callback)` (rAF) asks the browser to run `callback` right before the next repaint (the moment the screen is redrawn).",
      "The callback receives a high-resolution timestamp (milliseconds) for the current frame.",
      "It runs once per call; to animate continuously, call `requestAnimationFrame` again inside the callback.",
      "`cancelAnimationFrame(id)` cancels a scheduled callback.",
      "In background tabs, rAF is paused, saving CPU and battery.",
      "Comparison with `setInterval`:",
      "  Timing — rAF syncs with the display refresh; setInterval fires on its own schedule and drifts.",
      "  Smoothness — rAF avoids dropped or doubled frames (jank); setInterval can update between frames.",
      "  Background tabs — rAF pauses; setInterval keeps running (though throttled).",
      "# How it works",
      "You call `requestAnimationFrame(step)`; the browser stores `step` in a list for the next frame.",
      "Before painting the next frame, the browser runs all queued rAF callbacks.",
      "Then it does style, layout and paint, so your changes appear in that same frame.",
      "Inside `step`, you compute the new position from the elapsed time and request the next frame.",
      "# Example walkthrough",
      "`animate` moves a box 300 px over 1000 ms.",
      "The first frame records the `start` timestamp.",
      "`progress` is the fraction of time elapsed (0 to 1), capped at 1.",
      "The box's `transform` is set to `progress * 300` pixels, so speed is the same on 60 Hz and 120 Hz screens.",
      "While `progress < 1`, it requests another frame; at the end it logs `done`.",
      "The stop button calls `cancelAnimationFrame` to end the animation early.",
      "# Why it matters / when to use",
      "JavaScript animations, canvas drawing, games, smooth scroll effects and progress indicators.",
      "Batching DOM writes to happen once per frame (a natural throttle).",
      "For simple transitions, CSS transitions and animations, or the Web Animations API, are often better.",
      "Note: rAF is a browser API; Node has no screen, so it does not exist there.",
      "# Common mistakes",
      "Moving by a fixed amount per frame (`x += 5`), which makes the animation faster on high-refresh screens. Use elapsed time.",
      "Forgetting to request the next frame, so the animation stops after one step.",
      "Doing heavy work inside the callback, which causes frames to be skipped.",
      "Animating `left`/`top` instead of `transform`, which triggers layout every frame.",
      "# Say this in the interview",
      "requestAnimationFrame schedules a callback right before the browser's next repaint, synchronised with the display's refresh rate, and passes a high-resolution timestamp. Compared to setInterval it avoids drift and jank, and it pauses in background tabs to save resources. I calculate positions from elapsed time, re-request the next frame inside the callback, and cancel it with cancelAnimationFrame.",
      "  Follow-up: Why base animation on time, not frame count? — Frame rates differ by device and load, so time keeps speed consistent.",
      "  Follow-up: Where does rAF run relative to the event loop? — In the rendering step, after tasks and microtasks, right before paint.",
    ],
    code: `// HTML: <div id="box"></div> <button id="stop">Stop</button>
const box = document.getElementById("box");
let start = null;
let frameId;

function animate(timestamp) {
  if (start === null) start = timestamp;          // first frame
  const elapsed = timestamp - start;              // ms since start
  const progress = Math.min(elapsed / 1000, 1);   // 0 → 1 over 1 second

  box.style.transform = "translateX(" + progress * 300 + "px)"; // compositor-friendly

  if (progress < 1) {
    frameId = requestAnimationFrame(animate);     // ask for the next frame
  } else {
    console.log("done");                          // → done (after ~1000ms)
  }
}
frameId = requestAnimationFrame(animate);

document.getElementById("stop").addEventListener("click", () => {
  cancelAnimationFrame(frameId);                  // stop early
  console.log("stopped");
});

// Avoid: fixed step on a timer (drifts, janky, runs in background tabs)
// setInterval(() => { x += 5; box.style.left = x + "px"; }, 16);`,
  },

  // ───────────────────────── Output-based Questions ─────────────────────────
  {
    id: 'output-event-loop-order',
    group: 'Output-based Questions',
    stars: 5,
    difficulty: 'Hard',
    q: 'What is the output order? (sync, microtasks, macrotasks, async/await)',
    a: [
      "# ELI5",
      "Imagine a chef with three kinds of work.",
      "First, the order currently in their hands: they finish it completely without stopping (synchronous code).",
      "Second, the sticky notes on the counter marked URGENT: they clear ALL of them, even new ones that appear while clearing (microtasks: Promise callbacks, code after `await`).",
      "Third, the order tickets in the queue by the door: they take only ONE, then check the urgent sticky notes again (macrotasks: `setTimeout`, `setInterval`, I/O callbacks).",
      "Output puzzles are just asking: in which pile does each line land?",
      "# What it is",
      "The call stack is the list of functions currently running; synchronous code runs there from top to bottom.",
      "Macrotask (task) queue: holds callbacks from `setTimeout`, `setInterval`, I/O, UI events (and `setImmediate` in Node).",
      "Microtask queue: holds Promise reactions (`.then`, `.catch`, `.finally`), the continuation of an `async` function after `await`, and `queueMicrotask` callbacks.",
      "The event loop rule: run all synchronous code → drain the ENTIRE microtask queue → run ONE macrotask → drain microtasks again → repeat.",
      "Key facts for puzzles:",
      "  The function you pass to `new Promise(executor)` runs synchronously, immediately.",
      "  An `async` function runs synchronously until its first `await`; everything after the `await` is scheduled as a microtask.",
      "  `setTimeout(fn, 0)` is a macrotask, so it always comes after all microtasks.",
      "  In Node, `process.nextTick` callbacks run even before Promise microtasks.",
      "# How it works",
      "Step 1 — run the script top to bottom, printing synchronous logs and queueing callbacks.",
      "Step 2 — when the script ends (stack empty), run microtasks in the order they were queued (FIFO: first in, first out).",
      "  If a microtask queues another microtask, it also runs in this same step.",
      "Step 3 — take the first macrotask (the timer) and run it.",
      "Step 4 — drain microtasks again, and so on.",
      "# Example walkthrough",
      "`console.log(1)` — synchronous → prints 1.",
      "`setTimeout(() => console.log(2), 0)` — callback goes to the macrotask queue. Macro: [2].",
      "`Promise.resolve().then(() => console.log(3))` — already resolved, so the callback goes to the microtask queue. Micro: [3].",
      "`run()` is called — its body runs synchronously and prints 4.",
      "  `await null` pauses `run`; the rest (`console.log(5)`) is queued as a microtask. Micro: [3, 5].",
      "`new Promise((res) => { console.log(6); res(); })` — the executor is synchronous → prints 6, then resolves.",
      "  `.then(() => console.log(7))` is queued because the promise is already resolved. Micro: [3, 5, 7].",
      "The script ends. Drain microtasks in order: 3, 5, 7.",
      "Run the macrotask: 2.",
      "Final output: 1, 4, 6, 3, 5, 7, 2.",
      "# Why it matters / when to use",
      "One of the most common JavaScript interview questions, testing whether you understand the event loop.",
      "Real bugs: assuming a `setTimeout` runs before a Promise callback, or code after `await` running later than expected.",
      "Backend: a long chain of microtasks or a heavy synchronous loop starves timers and I/O, making the whole Node server unresponsive.",
      "# Common mistakes",
      "Thinking the Promise executor is asynchronous; only the `.then` callbacks are.",
      "Thinking an `async` function runs entirely asynchronously; it runs synchronously until the first `await`.",
      "Thinking `setTimeout(fn, 0)` runs before Promise callbacks.",
      "Forgetting that microtasks queued during microtask processing still run before the next timer.",
      "# Say this in the interview",
      "I first print everything synchronous, remembering that Promise executors and the part of an async function before the first await are synchronous. Then I drain the microtask queue in order: then-callbacks and code after await. Only then do macrotasks like setTimeout run, one at a time, with microtasks drained after each. Here that gives 1, 4, 6, 3, 5, 7, 2.",
      "  Follow-up: Where does `process.nextTick` fit in Node? — Before Promise microtasks, after the current operation.",
      "  Follow-up: What if a `.then` callback schedules a `setTimeout`? — That timer goes to the back of the macrotask queue, after the existing one.",
    ],
    code: `console.log(1);                                        // sync → 1

setTimeout(() => console.log(2), 0);                   // macrotask queue: [2]

Promise.resolve().then(() => console.log(3));          // microtask queue: [3]

async function run() {
  console.log(4);                                      // sync (before await) → 4
  await null;                                          // rest becomes a microtask: [3, 5]
  console.log(5);
}
run();

new Promise((res) => {
  console.log(6);                                      // executor is sync → 6
  res();
}).then(() => console.log(7));                         // microtask queue: [3, 5, 7]

// Output: 1 4 6 3 5 7 2

// Bonus (Node only): nextTick runs before promise microtasks
// process.nextTick(() => console.log("tick"));
// Promise.resolve().then(() => console.log("promise"));
// → tick, promise`,
  },
  {
    id: 'output-hoisting',
    group: 'Output-based Questions',
    stars: 4,
    difficulty: 'Medium',
    q: 'What does this hoisting snippet print?',
    a: [
      "# ELI5",
      "Before a play starts, the director reads the script and writes every character's name on the cast list.",
      "Some characters (`var`) get a name tag but no costume yet: you can call their name, but they show up empty (`undefined`).",
      "Some characters (function declarations) arrive fully dressed and ready to perform from the very first scene.",
      "Some characters (`let`, `const`, `class`) are on the list but locked backstage until their scene: calling them early is an error.",
      "# What it is",
      "Hoisting: before running code in a scope, JavaScript first scans it and creates all declared variables and functions. It behaves as if declarations were moved to the top.",
      "Only declarations are hoisted, not assignments.",
      "Rules:",
      "  `var x = 1` — `x` is created at the top and initialised to `undefined`; the `= 1` happens when that line runs.",
      "  `function foo() {}` — a function declaration is hoisted with its whole body, so you can call it before the line.",
      "  `var bar = function () {}` — a function expression: only `var bar` is hoisted (as `undefined`); the function is assigned later.",
      "  `let` / `const` / `class` — hoisted but not initialised. Accessing them before their line throws ReferenceError. This zone is called the Temporal Dead Zone (TDZ).",
      "If a `var` and a function declaration share a name, the function wins during the creation phase; the `var` assignment overwrites it when its line runs.",
      "# How it works",
      "Creation phase (before any line runs):",
      "  Register `a` as `undefined`, `bar` as `undefined`, `baz` and `foo` as their functions (a function declaration beats a same-named `var`).",
      "Execution phase (line by line):",
      "  Read values as they currently are; assignments update them as their lines are reached.",
      "Calling `undefined` as a function throws TypeError ('is not a function'), which is different from using an undeclared or TDZ variable (ReferenceError).",
      "# Example walkthrough",
      "`console.log(a)` — `a` exists but is not assigned yet → prints `undefined`.",
      "`var a = 1` — now `a` is 1.",
      "`console.log(foo())` — `foo` was hoisted with its body → prints 'foo'.",
      "`console.log(typeof baz)` — at this moment `baz` is the hoisted function (the `var baz = 1` line has not run) → 'function'.",
      "`var baz = 1` runs → `baz` becomes 1, so a later `typeof baz` would be 'number'.",
      "`console.log(c)` with `let c` below → ReferenceError (TDZ); we wrap it in try/catch to keep going.",
      "`bar()` — `bar` is `undefined` (only the `var` was hoisted) → TypeError: bar is not a function.",
      "# Why it matters / when to use",
      "Classic interview question checking you understand execution contexts.",
      "Explains real bugs in older code that uses `var`, and why modern code uses `let`/`const`.",
      "Explains why helper function declarations can be placed at the bottom of a file and still be called at the top.",
      "# Common mistakes",
      "Saying `let`/`const` are not hoisted. They are hoisted but uninitialised (TDZ).",
      "Confusing TypeError (calling undefined) with ReferenceError (variable not accessible).",
      "Thinking function expressions and arrow functions behave like declarations.",
      "# Say this in the interview",
      "During the creation phase, `var` declarations are hoisted and set to undefined, function declarations are hoisted with their bodies, and let, const and class are hoisted but stay in the temporal dead zone until their line. So `a` logs undefined, `foo()` works, `typeof baz` is 'function' because the function declaration wins until the var assignment runs, and calling `bar` throws a TypeError because it is still undefined.",
      "  Follow-up: What error does accessing a `let` before declaration give? — ReferenceError: Cannot access 'x' before initialization.",
      "  Follow-up: Are arrow functions hoisted? — Only the variable that holds them, following var/let/const rules.",
    ],
    code: `console.log(a);          // → undefined (declared, not yet assigned)
var a = 1;
console.log(a);          // → 1

console.log(foo());      // → 'foo' (declaration hoisted with its body)
function foo() { return "foo"; }

console.log(typeof baz); // → 'function' (function beats var until assignment)
var baz = 1;
function baz() {}
console.log(typeof baz); // → 'number' (the assignment ran)

try {
  console.log(c);        // TDZ
} catch (e) {
  console.log(e.name);   // → ReferenceError
}
let c = 3;

bar();                   // → TypeError: bar is not a function
var bar = function () {};`,
  },
  {
    id: 'output-this',
    group: 'Output-based Questions',
    stars: 4,
    difficulty: 'Medium',
    q: 'What does this `this` snippet print?',
    a: [
      "# ELI5",
      "The word 'I' means different people depending on who is speaking.",
      "For a regular function, `this` is decided by WHO calls it: whoever is to the left of the dot at call time.",
      "For an arrow function, `this` is borrowed from wherever the arrow was written, like a child who always says 'my mum' meaning the mum in the house where they were born, no matter where they are now.",
      "# What it is",
      "`this` is a special keyword that refers to an object depending on how a function is called.",
      "Rules for regular functions (in priority order):",
      "  `new Fn()` — `this` is the new object being created.",
      "  `fn.call(obj)`, `fn.apply(obj)`, `fn.bind(obj)` — `this` is `obj` (explicit binding).",
      "  `obj.method()` — `this` is `obj`, the object before the dot (implicit binding).",
      "  Plain `fn()` — `this` is `undefined` in strict mode (which ES modules and classes always use), or the global object in old sloppy scripts.",
      "Arrow functions do not have their own `this`; they use the `this` of the surrounding scope at the place they were defined (lexical `this`), and `call`/`bind` cannot change it.",
      "An object literal `{ ... }` does NOT create a scope for `this`; an arrow function written as an object property looks outside the object.",
      "# How it works",
      "For `obj.regular()`, the engine sees a property access followed by a call, so it passes `obj` as `this`.",
      "For `obj.arrow()`, the arrow ignores the call site and uses the `this` of the code surrounding the object literal (module top level).",
      "For `obj.nested()`, the regular method gets `this = obj`; the arrow inside `map` borrows that `this`.",
      "For `const f = obj.regular; f()`, the method is detached from the object: no dot at call time, so `this` is `undefined` in strict mode, and reading `this.name` throws TypeError.",
      "# Example walkthrough",
      "`obj.regular()` → 'obj' because `obj` is left of the dot.",
      "`obj.arrow()` → in an ES module top-level `this` is `undefined`, so `typeof this` is 'undefined'. (In a CommonJS file it would be 'object', because top-level `this` there is `module.exports`.)",
      "`obj.nested()` → 'obj' because the arrow inside inherits `nested`'s `this`.",
      "`f()` → TypeError: Cannot read properties of undefined (reading 'name').",
      "`f.call(obj)` and `obj.regular.bind(obj)` fix it by setting `this` explicitly → 'obj'.",
      "`setTimeout(obj.regular, 0)` would lose `this` in the same way: the function is passed without its object.",
      "# Why it matters / when to use",
      "Passing methods as callbacks (event handlers, `setTimeout`, Express route handlers, array methods) is where `this` bugs appear.",
      "Class methods used as callbacks need `.bind(this)` or arrow-function class fields.",
      "Interviewers use this to test understanding of call-site binding vs lexical binding.",
      "# Common mistakes",
      "Using an arrow function as an object method and expecting `this` to be the object.",
      "Extracting a method (`const fn = obj.method`) or passing it as a callback and losing `this`.",
      "Thinking `bind` works on arrow functions; it cannot change their `this`.",
      "# Say this in the interview",
      "For regular functions, `this` is determined at call time: `new` binds the new object, call/apply/bind bind explicitly, a method call binds the object before the dot, and a plain call gives undefined in strict mode. Arrow functions take `this` lexically from where they are defined. So `regular()` returns 'obj', the arrow property sees the module's undefined `this`, the arrow inside the method sees 'obj', and the detached call throws a TypeError.",
      "  Follow-up: How do you fix a lost `this` in a callback? — Use `.bind(obj)`, wrap it in an arrow `() => obj.method()`, or use arrow class fields.",
      "  Follow-up: What is `this` at the top of a CommonJS module? — `module.exports` (an empty object by default).",
    ],
    code: `// Run as an ES module (strict mode; top-level this is undefined)
const obj = {
  name: "obj",
  regular() { return this.name; },            // this = caller (left of the dot)
  arrow: () => typeof this,                   // this = surrounding scope (module)
  nested() { return [1].map(() => this.name)[0]; }, // arrow borrows nested's this
};

console.log(obj.regular()); // → 'obj'
console.log(obj.arrow());   // → 'undefined' (in CommonJS: 'object')
console.log(obj.nested());  // → 'obj'

const f = obj.regular;      // detached from obj
try {
  f();
} catch (e) {
  console.log(e.name);      // → TypeError (this is undefined)
}

console.log(f.call(obj));            // → 'obj' (explicit binding)
const bound = obj.regular.bind(obj);
console.log(bound());                // → 'obj'

function Person(name) { this.name = name; }
console.log(new Person("Ann").name); // → 'Ann' (new binding)`,
  },
  {
    id: 'output-coercion',
    group: 'Output-based Questions',
    stars: 3,
    difficulty: 'Medium',
    q: 'Predict the output of these coercion expressions.',
    a: [
      "# ELI5",
      "JavaScript is like an over-helpful translator. If you mix apples and oranges, it does not refuse; it quietly converts one into the other so it can finish the job.",
      "The `+` sign loves words: if either side is (or becomes) text, it glues them together.",
      "Other maths signs (`-`, `*`, `/`) love numbers: they convert everything into numbers first.",
      "# What it is",
      "Type coercion: JavaScript automatically converting a value from one type to another (string, number, boolean) when an operator needs it.",
      "Primitive values: string, number, boolean, null, undefined, bigint, symbol. Objects and arrays are not primitives.",
      "Converting an object/array to a primitive (ToPrimitive) calls `valueOf()` and/or `toString()`. For arrays, `toString()` joins items with commas: `[]` becomes '', `[1, 2]` becomes '1,2'. Plain objects become '[object Object]'.",
      "Rules:",
      "  `+` — convert both sides to primitives; if either is a string, concatenate; otherwise add as numbers.",
      "  `-`, `*`, `/`, `%`, unary `+x` — convert to numbers. `Number('')` is 0, `Number('abc')` is NaN, `Number(true)` is 1, `Number(null)` is 0, `Number(undefined)` is NaN.",
      "  `==` (loose equality) — converts types before comparing; `===` (strict) never converts.",
      "  Special `==` rule: `null == undefined` is true, and `null`/`undefined` are not equal to anything else (not even 0).",
      "  Relational `<`, `>`, `>=` — convert to numbers, unless BOTH sides are strings, in which case they compare alphabetically.",
      "# How it works",
      "For `[] == ![]`:",
      "  `![]` runs first: an array is truthy, so `![]` is `false`.",
      "  Now `[] == false`: the boolean becomes a number, 0.",
      "  `[] == 0`: the array becomes a primitive, '' (empty string).",
      "  `'' == 0`: the string becomes a number, 0. So `0 == 0` → true.",
      "For `null >= 0`: relational comparison converts null to 0, so `0 >= 0` → true, even though `null == 0` is false (special rule).",
      "# Example walkthrough",
      "`[] + []` — both become '' → '' (empty string).",
      "`[] + {}` — '' + '[object Object]' → '[object Object]'.",
      "`'5' + 2` — a string is involved, so concatenation → '52'.",
      "`'5' - 2` — minus converts to numbers → 3.",
      "`true + 1` — true becomes 1 → 2.",
      "`[1, 2] + [3]` — '1,2' + '3' → '1,23'.",
      "`'b' + 'a' + +'a' + 'a'` — `+'a'` is NaN, so 'ba' + 'NaN' + 'a' → 'baNaNa'.",
      "`'10' > '9'` — both strings, compared character by character ('1' < '9') → false.",
      "`NaN === NaN` — NaN is never equal to anything, even itself → false; use `Number.isNaN`.",
      "# Why it matters / when to use",
      "Query params and form fields arrive as strings: `req.query.page + 1` gives '21' instead of 3. Convert with `Number()` first.",
      "Bugs from `==` comparisons are subtle; most style guides require `===`.",
      "Sorting or comparing numeric strings without converting gives wrong results.",
      "# Common mistakes",
      "Using `+` to add numbers that are actually strings from input or JSON.",
      "Using `==` and being surprised by `0 == ''` (true) or `'0' == false` (true).",
      "Checking `x == NaN` or `x === NaN`; always false. Use `Number.isNaN(x)`.",
      "Comparing numeric strings with `>`.",
      "# Say this in the interview",
      "With `+`, if either operand is or becomes a string after converting objects to primitives, it concatenates; other arithmetic operators convert to numbers. Arrays convert to their comma-joined strings and plain objects to '[object Object]'. Loose equality converts types with special rules, so `[] == ![]` is true and `null == 0` is false while `null >= 0` is true. In real code I convert explicitly and always use `===`.",
      "  Follow-up: Why is `null == 0` false but `null >= 0` true? — `==` has a special rule for null, while `>=` converts null to 0.",
      "  Follow-up: How do you safely convert a query param? — `Number(value)` or `parseInt(value, 10)`, then check `Number.isNaN`.",
    ],
    code: `console.log([] + []);            // → ''  (empty string)
console.log([] + {});            // → '[object Object]'
console.log("5" + 2);            // → '52'  (string wins with +)
console.log("5" - 2);            // → 3     (minus converts to numbers)
console.log("5" * "2");          // → 10
console.log(true + 1);           // → 2
console.log([1, 2] + [3]);       // → '1,23'
console.log("b" + "a" + +"a" + "a"); // → 'baNaNa'

console.log([] == ![]);          // → true  ([] == false → '' == 0 → 0 == 0)
console.log(null == 0);          // → false (special rule)
console.log(null >= 0);          // → true  (null becomes 0)
console.log(null == undefined);  // → true
console.log(0 == "");            // → true
console.log(0 === "");           // → false (no coercion)

console.log("10" > "9");         // → false (string comparison)
console.log(10 > "9");           // → true  (number comparison)
console.log(NaN === NaN, Number.isNaN(NaN)); // → false true

// Real backend bug: query params are strings
const page = "2";                // e.g. req.query.page
console.log(page + 1, Number(page) + 1); // → '21' 3`,
  },
  {
    id: 'output-promise-chain',
    group: 'Output-based Questions',
    stars: 3,
    difficulty: 'Hard',
    q: 'What does this promise chain print?',
    a: [
      "# ELI5",
      "Imagine a relay race. Each runner (`.then`) takes the baton (the value) from the previous one and passes a new baton on.",
      "If a runner trips (throws an error), the following runners are skipped until the medic (`.catch`) is reached.",
      "If the medic patches things up and hands over a new baton, the race continues normally from there.",
      "At the very end, the cleaner (`.finally`) always comes, whether the race went well or not, but does not touch the baton.",
      "# What it is",
      "A promise chain is a series of `.then`, `.catch` and `.finally` calls where each returns a NEW promise.",
      "Rules:",
      "  `.then(fn)` — runs `fn` with the previous value if the previous step succeeded; whatever `fn` returns becomes the next value. If `fn` throws, the next promise is rejected.",
      "  `.then` handlers are skipped while the chain is in a rejected state.",
      "  `.catch(fn)` — runs only if a previous step rejected; if `fn` returns a value normally, the chain becomes fulfilled again with that value (recovery). If it throws, the chain stays rejected.",
      "  `.finally(fn)` — runs either way, receives NO argument, and passes the previous result (or error) through unchanged, unless it throws.",
      "Returning a promise from a handler makes the chain wait for it (flattening).",
      "# How it works",
      "`Promise.resolve(1)` creates an already-fulfilled promise with value 1.",
      "Each `.then` callback is scheduled as a microtask when the previous promise settles, so steps run one after another asynchronously.",
      "When a handler throws, the engine rejects the promise returned by that `.then`, carrying the error.",
      "That rejection passes through each following `.then` (which only has a success handler) until a `.catch` handles it.",
      "# Example walkthrough",
      "`Promise.resolve(1)` → value 1.",
      "`.then((x) => x + 1)` → value 2.",
      "`.then(() => { throw new Error('boom') })` → the chain is now rejected with Error('boom').",
      "`.then(() => console.log('skipped'))` → skipped, because the chain is rejected.",
      "`.catch((e) => { console.log(e.message); return 5; })` → prints 'boom' and recovers with value 5.",
      "`.then((x) => console.log(x))` → prints 5. This handler returns `undefined`.",
      "`.finally(() => console.log('done'))` → prints 'done'.",
      "Output: boom, 5, done.",
      "The second chain shows `.finally` passing the value through: the next `.then` still receives 'kept'.",
      "# Why it matters / when to use",
      "Error handling in service code: one `.catch` at the end covers every step, and recovery lets you return fallback data.",
      "`.finally` is perfect for cleanup: releasing a DB connection, hiding a loading spinner, clearing a timeout.",
      "The same rules apply in `async/await`: a thrown error skips to the nearest `catch`, and `finally` always runs.",
      "# Common mistakes",
      "Forgetting to `return` inside `.then`, so the next step receives `undefined` or does not wait for an inner promise.",
      "Putting `.catch` in the middle and accidentally continuing the chain as if nothing failed.",
      "Expecting `.finally` to receive the value or to change it by returning something; return values of `finally` are ignored.",
      "No `.catch` at all, which causes an unhandled rejection; in Node 15+ this crashes the process by default.",
      "# Say this in the interview",
      "Each then returns a new promise. A thrown error rejects the chain, so following then handlers are skipped until a catch. If the catch returns a value, the chain recovers and the next then receives that value. finally runs regardless, receives no argument and passes the previous result through. So this prints boom, then 5, then done.",
      "  Follow-up: What if the catch rethrows? — The chain stays rejected and the next then is skipped until another catch.",
      "  Follow-up: How does `.then(success, failure)` differ from `.then().catch()`? — The two-argument form's failure handler does not catch errors thrown by its own success handler.",
    ],
    code: `Promise.resolve(1)
  .then((x) => x + 1)                         // 2
  .then(() => { throw new Error("boom"); })   // chain becomes rejected
  .then(() => console.log("skipped"))         // skipped
  .catch((e) => { console.log(e.message); return 5; }) // → boom (recovers with 5)
  .then((x) => console.log(x))                // → 5
  .finally(() => console.log("done"));        // → done

// Output: boom, 5, done

// finally passes the value through and gets no argument
Promise.resolve("kept")
  .finally((arg) => console.log("finally got:", arg)) // → finally got: undefined
  .then((v) => console.log("then got:", v));         // → then got: kept

// Same logic with async/await
async function main() {
  try {
    const x = await Promise.resolve(1);
    throw new Error("boom " + (x + 1));
  } catch (e) {
    console.log(e.message);                   // → boom 2
  } finally {
    console.log("cleanup");                   // → cleanup
  }
}
main();`,
  },
  {
    id: 'output-array-quirks',
    group: 'Output-based Questions',
    stars: 1,
    difficulty: 'Medium',
    q: 'Predict the output of these array quirks.',
    a: [
      "# ELI5",
      "Arrays in JavaScript are like a row of numbered mailboxes where some boxes can be missing entirely, and the sign saying how many boxes there are can be changed by hand.",
      "Some helpers also pass you more information than you asked for, and if your function uses that extra information, you get surprising results.",
      "# What it is",
      "`map(cb)` calls `cb(element, index, array)` — three arguments, not one.",
      "`parseInt(string, radix)` takes a second argument, the radix (number base, e.g. 10 for decimal, 2 for binary). A radix of 0 means 'guess' (decimal here); a radix of 1 is invalid and returns NaN.",
      "A sparse array has holes: indexes with no value at all (different from holding `undefined`).",
      "`length` is always the highest index + 1, and it is writable: setting it smaller deletes elements; setting it larger adds holes.",
      "A trailing comma in an array literal is ignored, so `[,,,]` has 3 holes, not 4.",
      "# How it works",
      "`['1', '2', '3'].map(parseInt)` calls:",
      "  `parseInt('1', 0)` → radix 0 means default → 1.",
      "  `parseInt('2', 1)` → radix 1 is invalid → NaN.",
      "  `parseInt('3', 2)` → '3' is not a valid binary digit → NaN.",
      "Assigning `a[10] = 4` on a 3-element array creates holes at indexes 3–9 and sets `length` to 11.",
      "Setting `a.length = 1` truncates the array, permanently deleting indexes 1 and above.",
      "Methods like `map`, `forEach` and `filter` skip holes, while `for...of` and spread treat them as `undefined`.",
      "# Example walkthrough",
      "`['1', '2', '3'].map(parseInt)` → `[1, NaN, NaN]`. The fix is `map(Number)` or `map((s) => parseInt(s, 10))`.",
      "`a[10] = 4` → `a.length` is 11.",
      "`a.length = 1` → `a` is `[1]`.",
      "`[,,,].length` → 3 because the last comma is a trailing comma.",
      "`new Array(3).map(() => 0)` → still 3 holes, because `map` skips holes; `Array.from({ length: 3 }, () => 0)` gives `[0, 0, 0]`.",
      "`new Array(3)` makes 3 holes, but `new Array('3')` makes `['3']`, and `Array.of(3)` makes `[3]`.",
      "`[1, 2, 3] + ''` → '1,2,3' because arrays convert to comma-joined strings.",
      "# Why it matters / when to use",
      "Parsing query strings or CSV values: `values.map(parseInt)` is a real-world bug.",
      "Pre-filling arrays (e.g. building a 2D grid) with `new Array(n).map(...)` silently does nothing.",
      "Using `length = 0` to clear an array in place, which affects every reference to it.",
      "# Common mistakes",
      "Passing functions with optional extra parameters directly to `map` (`parseInt`, and some library functions).",
      "Using `new Array(n).map` instead of `Array.from({ length: n }, fn)` or `new Array(n).fill(x)`.",
      "Using `delete arr[i]`, which leaves a hole instead of removing the element; use `splice` or `filter`.",
      "# Say this in the interview",
      "`map` passes element, index and array, so `map(parseInt)` uses the index as the radix: radix 0 parses '1' as 1, radix 1 is invalid and '3' is not binary, giving 1, NaN, NaN. Arrays can be sparse: assigning past the end sets length to the last index plus one, and length is writable, so shrinking it truncates. Trailing commas are ignored, so `[,,,]` has length 3.",
      "  Follow-up: How do you create an array of n zeros? — `new Array(n).fill(0)` or `Array.from({ length: n }, () => 0)`.",
      "  Follow-up: How do you clear an array in place? — `arr.length = 0` (all references see it).",
    ],
    code: `console.log(["1", "2", "3"].map(parseInt));
// → [ 1, NaN, NaN ]  calls: parseInt('1',0), parseInt('2',1), parseInt('3',2)
console.log(["1", "2", "3"].map(Number));                 // → [ 1, 2, 3 ]
console.log(["1", "2", "3"].map((s) => parseInt(s, 10))); // → [ 1, 2, 3 ]

const a = [1, 2, 3];
a[10] = 4;
console.log(a.length);   // → 11 (holes at 3..9)
a.length = 1;
console.log(a);          // → [ 1 ] (truncated)

console.log([, , ,].length); // → 3 (trailing comma ignored)

console.log(new Array(3).map(() => 0));        // → [ <3 empty items> ] (map skips holes)
console.log(Array.from({ length: 3 }, () => 0)); // → [ 0, 0, 0 ]
console.log(new Array(3).fill(0));             // → [ 0, 0, 0 ]

console.log(new Array("3"), Array.of(3));      // → [ '3' ] [ 3 ]
console.log([1, 2, 3] + "");                   // → '1,2,3'

const b = [1, 2, 3];
delete b[1];
console.log(b, b.length);                      // → [ 1, <1 empty item>, 3 ] 3`,
  },
];

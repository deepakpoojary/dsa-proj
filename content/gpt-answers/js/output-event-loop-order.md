The output is **`1, 4, 6, 3, 5, 7, 2`**. All synchronous code runs first, then the **microtask queue** is drained completely (promise callbacks and `await` continuations), and only then does the event loop pick up the next **macrotask** (the `setTimeout` callback).

## The snippet

```js
console.log(1);
setTimeout(() => console.log(2), 0);
Promise.resolve().then(() => console.log(3));
async function run() { console.log(4); await null; console.log(5); }
run();
new Promise((res) => { console.log(6); res(); }).then(() => console.log(7));
// 1 4 6 3 5 7 2
```

## The rules you need

1. **Synchronous code** runs top to bottom on the call stack.
2. **Microtasks** (`.then/.catch/.finally` callbacks, `await` continuations, `queueMicrotask`) run as soon as the call stack is empty, and the **entire** queue is drained before anything else.
3. **Macrotasks** (`setTimeout`, `setInterval`, I/O, UI events) run one at a time, each followed by another microtask drain.
4. An **`async` function body runs synchronously** until its first `await`; the rest is scheduled as a microtask.
5. A **Promise executor** (the function passed to `new Promise`) runs **synchronously**.

## Step-by-step walkthrough

### Phase 1: synchronous code

| Line | What happens | Output | Microtask queue | Macrotask queue |
|---|---|---|---|---|
| `console.log(1)` | Runs immediately | **1** | | |
| `setTimeout(..., 0)` | Callback scheduled as a macrotask | | | `log 2` |
| `Promise.resolve().then(...)` | Promise already resolved, so callback queued | | `log 3` | `log 2` |
| `run()` | Body runs synchronously: logs 4 | **4** | `log 3` | `log 2` |
| `await null` | Pauses `run`; continuation queued | | `log 3`, `resume run` | `log 2` |
| `new Promise(executor)` | Executor runs now: logs 6, then `res()` | **6** | `log 3`, `resume run` | `log 2` |
| `.then(() => log 7)` | Promise resolved, callback queued | | `log 3`, `resume run`, `log 7` | `log 2` |

Output so far: `1 4 6`

### Phase 2: drain the microtask queue (FIFO)

1. `log 3` → prints **3**
2. `resume run` → prints **5** (code after `await`)
3. `log 7` → prints **7**

Output so far: `1 4 6 3 5 7`

### Phase 3: next macrotask

The `setTimeout` callback finally runs → prints **2**.

## Final output

```js
// 1
// 4
// 6
// 3
// 5
// 7
// 2
```

## Common mistakes

- **Thinking `setTimeout(fn, 0)` runs immediately**: `0` is a *minimum* delay; it always waits for the current script and all microtasks.
- **Thinking `async` functions are fully asynchronous**: everything before the first `await` is synchronous, which is why `4` prints before `6`.
- **Thinking the Promise executor is async**: `6` logs synchronously; only `.then` callbacks are deferred.
- **Expecting `5` before `3`**: `then(3)` was queued *before* `run()` reached its `await`, and microtasks are FIFO.

## A quick variation to test yourself

```js
console.log('A');
setTimeout(() => console.log('B'), 0);
queueMicrotask(() => console.log('C'));
(async () => {
  console.log('D');
  await Promise.resolve();
  console.log('E');
})();
console.log('F');
// A D F C E B
```

## Summary

- Order of execution: **synchronous code → all microtasks → one macrotask → microtasks → ...**
- `async` bodies and Promise executors run synchronously until an `await` / `.then`.
- That gives **`1 4 6 3 5 7 2`** for this snippet.

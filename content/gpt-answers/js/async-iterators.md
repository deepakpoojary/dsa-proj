**Async iterators** are the asynchronous version of iterators: their `next()` method returns a **Promise** of `{ value, done }` instead of the object directly. The **`for await...of`** loop consumes them, awaiting each value in order, which makes it easy to process data that arrives over time — streams, paginated APIs, events.

## The protocol

| | Sync iterable | Async iterable |
| --- | --- | --- |
| Method key | `[Symbol.iterator]()` | `[Symbol.asyncIterator]()` |
| `next()` returns | `{ value, done }` | `Promise<{ value, done }>` |
| Loop | `for...of` | `for await...of` |
| Generator syntax | `function*` | `async function*` |

## Creating one with an async generator

The easiest way is an `async function*`, where you can both `await` and `yield`:

```js
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function* countdown(from) {
  for (let i = from; i > 0; i--) {
    await sleep(500);
    yield i;
  }
}

for await (const n of countdown(3)) {
  console.log(n);
}
// (500ms) 3
// (500ms) 2
// (500ms) 1
```

`for await...of` must be used inside an `async` function or at the top level of an ES module.

## Implementing the protocol manually

```js
const ticker = {
  [Symbol.asyncIterator]() {
    let count = 0;
    return {
      next() {
        return new Promise((resolve) =>
          setTimeout(() => {
            count++;
            resolve(count <= 3 ? { value: count, done: false } : { value: undefined, done: true });
          }, 100)
        );
      },
    };
  },
};

for await (const t of ticker) console.log(t); // 1, 2, 3
```

## Real-world examples

### Paginated API

```js
async function* fetchAllPages(url) {
  let next = url;
  while (next) {
    const res = await fetch(next);
    const { items, nextPage } = await res.json();
    yield* items;      // yield each item individually
    next = nextPage;   // null when done
  }
}

for await (const item of fetchAllPages('/api/products?page=1')) {
  console.log(item.name);
  if (item.id === 42) break; // stops fetching further pages
}
```

### Streaming a fetch response

```js
const res = await fetch('/big-file.txt');
const decoder = new TextDecoder();

// ReadableStream is async iterable in Node, Chrome and Firefox (Safari support is newer)
for await (const chunk of res.body) {
  console.log(decoder.decode(chunk, { stream: true }));
}
```

### Reading a file line by line in Node.js

```js
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

const rl = createInterface({ input: createReadStream('log.txt') });
for await (const line of rl) {
  if (line.includes('ERROR')) console.log(line);
}
```

## Collecting results: `Array.fromAsync` (ES2024)

```js
const nums = await Array.fromAsync(countdown(3));
console.log(nums); // [3, 2, 1]
```

## `for await` with arrays of promises

`for await...of` also works on **sync** iterables of promises, awaiting each one in order:

```js
const promises = [fetchA(), fetchB(), fetchC()];
for await (const result of promises) console.log(result);
```

Be careful: all three requests already started, and if a later one rejects before the loop reaches it, you may get an unhandled rejection. Prefer `Promise.all` for that case.

## Common pitfalls

- **Sequential by design**: each iteration waits for the previous one. For parallel work, use `Promise.all`.
- **`break` triggers cleanup**: exiting early calls the iterator's `return()`, running `finally` blocks in async generators — useful for closing connections.
- **Error handling**: wrap the loop in `try/catch`; a rejected `next()` throws inside the loop.

## Summary

- Async iterables implement `[Symbol.asyncIterator]()`; `next()` returns a Promise of `{ value, done }`.
- `for await...of` consumes them one value at a time; `async function*` creates them easily.
- Ideal for streams, paginated APIs and line-by-line processing; `Array.fromAsync` collects them into an array.

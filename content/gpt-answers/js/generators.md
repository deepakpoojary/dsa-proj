A **generator function** (declared with `function*`) is a function that can **pause and resume** its execution. Calling it doesn't run the body; it returns a **generator object** (an iterator), and each call to `next()` runs the code until the next `yield`, which hands a value back to the caller.

## Basic syntax

```js
function* idGen() {
  let id = 1;
  while (true) yield id++;
}

const g = idGen();
g.next().value; // 1
g.next().value; // 2
g.next().value; // 3
```

The infinite `while (true)` loop is safe because the generator is **lazy**: it only computes a value when asked.

## How it works

Each `next()` call returns an object `{ value, done }`:

```js
function* steps() {
  console.log('start');
  yield 'A';
  console.log('middle');
  yield 'B';
  return 'end';
}

const it = steps();     // nothing logged yet
it.next(); // logs "start"  -> { value: 'A', done: false }
it.next(); // logs "middle" -> { value: 'B', done: false }
it.next(); //               -> { value: 'end', done: true }
it.next(); //               -> { value: undefined, done: true }
```

## Generators are iterable

Because a generator object implements the iterator protocol, you can use it with `for...of`, spread and destructuring:

```js
function* range(start, end, step = 1) {
  for (let i = start; i < end; i += step) yield i;
}

for (const n of range(0, 5)) console.log(n); // 0 1 2 3 4
console.log([...range(0, 10, 3)]);           // [0, 3, 6, 9]
const [first, second] = range(10, 20);       // 10, 11
```

> Note: `for...of` ignores the `return` value — only `yield`ed values are iterated.

## Two-way communication

The value passed to `next(value)` becomes the result of the paused `yield` expression:

```js
function* conversation() {
  const name = yield 'What is your name?';
  const age = yield `Hi ${name}, how old are you?`;
  return `${name} is ${age}`;
}

const c = conversation();
c.next().value;       // 'What is your name?'
c.next('Ann').value;  // 'Hi Ann, how old are you?'
c.next(30).value;     // 'Ann is 30'
```

The first `next()` argument is ignored because there's no paused `yield` yet.

## Controlling a generator: `return()` and `throw()`

```js
function* gen() {
  try {
    yield 1;
    yield 2;
  } finally {
    console.log('cleanup');
  }
}

const a = gen();
a.next();          // { value: 1, done: false }
a.return('stop');  // logs "cleanup" -> { value: 'stop', done: true }

const b = gen();
b.next();
b.throw(new Error('boom')); // logs "cleanup", then throws Error: boom
```

## Delegation with `yield*`

```js
function* inner() { yield 'a'; yield 'b'; }
function* outer() {
  yield 1;
  yield* inner(); // yields everything from inner
  yield 2;
}
[...outer()]; // [1, 'a', 'b', 2]
```

## Common use cases

- **Custom iterables**: implement `[Symbol.iterator]` with a generator instead of writing `next()` by hand.
- **Lazy sequences / pipelines**: process large or infinite data without building arrays.
- **Tree traversal**: recursively `yield*` child nodes.
- **State machines and redux-saga**: sagas use generators to describe async flows.
- **Historically**: libraries like `co` used generators for async flow control before `async/await` existed (async/await is essentially generators + promises).

```js
// lazy pipeline: first 3 even squares
function* naturals() { let n = 1; while (true) yield n++; }
function* take(it, n) { for (const x of it) { if (n-- <= 0) return; yield x; } }

const evens = (function* () {
  for (const n of naturals()) if ((n * n) % 2 === 0) yield n * n;
})();
[...take(evens, 3)]; // [4, 16, 36]
```

## Generator vs regular function

| Feature | Regular function | Generator function |
| --- | --- | --- |
| Syntax | `function` | `function*` |
| Runs on call | Immediately, to completion | No, returns an iterator |
| Returns | One value | Many values over time (`yield`) |
| Can pause | No | Yes |
| Arrow form | Yes | No (no arrow generators) |

## Summary

- `function*` returns a lazy iterator; `yield` pauses and emits a value.
- `next(value)` resumes and can send data in; `return()`/`throw()` end or inject errors.
- Great for custom iterators, infinite/lazy sequences and controlled step-by-step flows.

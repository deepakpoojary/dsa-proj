An **iterable** is any object that defines how it can be looped over by having a `[Symbol.iterator]()` method. That method returns an **iterator**: an object with a `next()` method that returns `{ value, done }` each time it's called. Together they form the **iteration protocol** that powers `for...of`, spread, destructuring and more.

## The two protocols

| Concept | Requirement | Example |
| --- | --- | --- |
| **Iterable** | Has a `[Symbol.iterator]()` method returning an iterator | Arrays, strings, Map, Set |
| **Iterator** | Has a `next()` method returning `{ value, done }` | `arr[Symbol.iterator]()` |

## Using an iterator by hand

```js
const arr = ['a', 'b'];
const it = arr[Symbol.iterator]();

it.next(); // { value: 'a', done: false }
it.next(); // { value: 'b', done: false }
it.next(); // { value: undefined, done: true }
```

`for...of` does exactly this behind the scenes, stopping when `done` is `true`.

## Built-in iterables

- `Array`, `String`, `Map`, `Set`, `TypedArray`
- `arguments`, `NodeList` (DOM)
- Generator objects
- **Not** plain objects: `for (const x of {})` throws `TypeError: {} is not iterable`. Use `Object.keys/values/entries` instead.

## What consumes iterables

```js
const set = new Set([1, 2, 3]);

for (const n of set) console.log(n);   // for...of
const arr = [...set];                  // spread
const [first, second] = set;           // destructuring
Array.from(set);                       // Array.from
new Map([['a', 1]]);                   // Map/Set constructors
await Promise.all(set);                // Promise.all/allSettled/race/any
```

## Making your own iterable

### With a manual iterator

```js
const range = {
  from: 1,
  to: 3,
  [Symbol.iterator]() {
    let current = this.from;
    const last = this.to;
    return {
      next() {
        return current <= last
          ? { value: current++, done: false }
          : { value: undefined, done: true };
      },
    };
  },
};

console.log([...range]); // [1, 2, 3]
```

### With a generator (much shorter)

Generators automatically return iterators, so they're the idiomatic way:

```js
const range = {
  from: 1, to: 3,
  *[Symbol.iterator]() {
    for (let i = this.from; i <= this.to; i++) yield i;
  },
};
[...range]; // [1, 2, 3]
```

## Iterators can be lazy and infinite

Values are produced only when requested, so an iterator can represent an endless sequence:

```js
function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

for (const n of fibonacci()) {
  if (n > 50) break;      // break calls iterator.return() for cleanup
  console.log(n);         // 0 1 1 2 3 5 8 13 21 34
}
```

## Iterator helpers (ES2025)

Modern engines add lazy, chainable methods directly on iterators, so you don't need to convert to arrays first:

```js
const firstFiveEvenSquares = fibonacci()
  .filter((n) => n % 2 === 0)
  .map((n) => n * n)
  .take(5)
  .toArray();
// [0, 4, 64, 1156, 20736]
```

Other helpers include `drop`, `flatMap`, `reduce`, `some`, `every`, `find`, `forEach`, and `Iterator.from()`.

## Iterable vs array-like

| | Iterable | Array-like |
| --- | --- | --- |
| Defined by | `[Symbol.iterator]` | `length` + numeric indexes |
| Works with `for...of` | Yes | No (unless also iterable) |
| Convert to array | `[...x]` or `Array.from(x)` | `Array.from(x)` only |

A string is both; `{ 0: 'a', length: 1 }` is only array-like.

## Common pitfalls

- An **iterator is usually single-use**: once exhausted, iterating again yields nothing.

```js
const it = [1, 2][Symbol.iterator]();
[...it]; // [1, 2]
[...it]; // []
```

- Plain objects are not iterable — iterate `Object.entries(obj)` instead.

## Summary

- **Iterable** = has `[Symbol.iterator]()`; **iterator** = has `next()` returning `{ value, done }`.
- They power `for...of`, spread, destructuring, `Array.from`, Map/Set constructors and `Promise.all`.
- Generators are the easiest way to build custom, lazy iterables; ES2025 iterator helpers add `map`/`filter`/`take` on iterators.

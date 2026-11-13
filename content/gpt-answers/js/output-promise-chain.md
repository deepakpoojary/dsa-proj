It prints **`boom`**, then **`5`**, then **`done`**. The thrown error skips the next `.then`, the `.catch` handles it and **recovers** the chain by returning `5`, the following `.then` receives that `5`, and `.finally` always runs at the end.

## The snippet

```js
Promise.resolve(1)
  .then((x) => x + 1)
  .then(() => { throw new Error('boom'); })
  .then(() => console.log('skipped'))
  .catch((e) => { console.log(e.message); return 5; })
  .then((x) => console.log(x))
  .finally(() => console.log('done'));
```

## Key rules

- Each `.then`/`.catch`/`.finally` returns a **new promise**.
- Whatever a handler **returns** becomes the fulfillment value of the next promise.
- If a handler **throws** (or returns a rejected promise), the next promise is **rejected**.
- A rejection **skips** every `.then` success handler until it reaches a `.catch` (or a `.then` with a second argument).
- A `.catch` that returns normally turns the chain back into a **fulfilled** state.
- `.finally` receives **no argument** and passes the previous result (or rejection) through unchanged.

## Step-by-step walkthrough

| Step | Handler | Input state | What happens | Output |
|---|---|---|---|---|
| 1 | `Promise.resolve(1)` | | Fulfilled with `1` | |
| 2 | `.then(x => x + 1)` | fulfilled `1` | Returns `2` | |
| 3 | `.then(() => { throw ... })` | fulfilled `2` | Ignores `2`, throws `Error('boom')` → rejected | |
| 4 | `.then(() => log('skipped'))` | rejected | **Skipped**: no rejection handler, so the rejection passes through | |
| 5 | `.catch(e => ...)` | rejected `Error('boom')` | Logs the message, returns `5` → fulfilled | `boom` |
| 6 | `.then(x => log(x))` | fulfilled `5` | Logs `5`, returns `undefined` | `5` |
| 7 | `.finally(...)` | fulfilled `undefined` | Always runs | `done` |

## Final output

```js
// boom
// 5
// done
```

Note that `'skipped'` is **never** printed, and the value `2` from step 2 is simply discarded by step 3.

## Same logic with async/await

The chain is equivalent to:

```js
async function main() {
  try {
    let x = await Promise.resolve(1);
    x = x + 1;
    throw new Error('boom');
    console.log('skipped'); // unreachable
  } catch (e) {
    console.log(e.message); // boom
    const y = 5;
    console.log(y);         // 5
  } finally {
    console.log('done');    // done
  }
}
main();
```

## Variations worth knowing

### If `.catch` doesn't return anything

```js
Promise.reject(new Error('x'))
  .catch(() => {})            // returns undefined
  .then((v) => console.log(v)); // undefined
```

### If `.catch` rethrows

```js
Promise.reject(new Error('x'))
  .catch((e) => { throw e; })
  .then(() => console.log('not run'))
  .catch((e) => console.log('caught again:', e.message)); // caught again: x
```

### `.finally` passes values through

```js
Promise.resolve(42)
  .finally(() => 'ignored')    // return value is ignored
  .then((v) => console.log(v)); // 42
```

But if `.finally` **throws**, that error replaces the result.

### `.then(success, failure)` vs `.then().catch()`

```js
p.then(onOk, onErr); // onErr does NOT catch errors thrown inside onOk
p.then(onOk).catch(onErr); // onErr catches errors from p AND from onOk
```

## Summary

- A thrown error skips `.then` handlers until the nearest `.catch`.
- `.catch` returning a value recovers the chain; the next `.then` gets that value.
- `.finally` always runs and doesn't receive or change the value.
- Output: **`boom`, `5`, `done`**.

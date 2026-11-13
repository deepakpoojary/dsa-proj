**Callback hell** (also called the "pyramid of doom") is what happens when you chain several asynchronous operations using nested callbacks, so each step lives inside the previous step's callback. The code drifts to the right, becomes hard to read, and error handling gets duplicated at every level.

## What it looks like

```js
getUser(userId, (err, user) => {
  if (err) return handleError(err);
  getOrders(user.id, (err, orders) => {
    if (err) return handleError(err);
    getOrderDetails(orders[0].id, (err, details) => {
      if (err) return handleError(err);
      sendEmail(user.email, details, (err) => {
        if (err) return handleError(err);
        console.log('Email sent!');
      });
    });
  });
});
```

## Why it's a problem

- **Readability**: the logic is buried in deep indentation.
- **Error handling**: every level needs its own `if (err)` check (Node's **error-first callback** convention `(err, data) => {}`).
- **Hard to reuse or refactor**: steps are tightly coupled to their nesting.
- **Inversion of control**: you hand your callback to someone else's code and *trust* it to call it exactly once, with the right arguments, at the right time. A buggy library might call it twice or never.
- **No easy parallelism**: running steps concurrently and joining results is awkward.

## How to avoid it

### 1. Name and flatten your functions

Even without Promises, extracting named functions removes nesting:

```js
function onUser(err, user) {
  if (err) return handleError(err);
  getOrders(user.id, onOrders);
}
function onOrders(err, orders) {
  if (err) return handleError(err);
  // ...
}
getUser(userId, onUser);
```

### 2. Use Promises

Promises flatten the chain and centralise error handling with one `.catch()`:

```js
getUser(userId)
  .then((user) => getOrders(user.id))
  .then((orders) => getOrderDetails(orders[0].id))
  .then((details) => sendEmail(details.email, details))
  .then(() => console.log('Email sent!'))
  .catch(handleError); // catches an error from ANY step
```

### 3. Use async/await (the modern default)

Reads like synchronous code, with ordinary `try/catch`:

```js
async function notifyUser(userId) {
  try {
    const user = await getUser(userId);
    const orders = await getOrders(user.id);
    const details = await getOrderDetails(orders[0].id);
    await sendEmail(user.email, details);
    console.log('Email sent!');
  } catch (err) {
    handleError(err);
  }
}
```

### 4. Promisify old callback APIs

In Node, wrap error-first callback functions with `util.promisify`, or use the built-in promise versions:

```js
import { promisify } from 'node:util';
import fs from 'node:fs';
import { readFile } from 'node:fs/promises'; // preferred

const readFileAsync = promisify(fs.readFile);
const text = await readFileAsync('a.txt', 'utf8');
const text2 = await readFile('a.txt', 'utf8');
```

You can also write your own wrapper:

```js
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
```

## Comparison

| Approach | Readability | Error handling | Parallel work |
| --- | --- | --- | --- |
| Nested callbacks | Poor | Repeated at each level | Manual |
| Promises (`.then`) | Good | One `.catch()` | `Promise.all` |
| async/await | Best | `try/catch` | `await Promise.all` |

## Summary

- Callback hell = deeply nested callbacks for sequential async steps, causing poor readability, duplicated error handling and inversion of control.
- Fix it with named functions, **Promises**, **async/await**, and `util.promisify` for legacy callback APIs.

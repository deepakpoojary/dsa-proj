The **Singleton** pattern ensures a class or module has **only one instance** with a global point of access. The **Factory** pattern provides a function or method that **creates objects for you**, hiding the details of which concrete type gets built and how.

## Singleton pattern

Useful when exactly one shared instance should exist: a config store, logger, database connection pool, or cache.

### Easiest way in modern JS: ES modules

ES modules are evaluated **once** and cached, so any exported object is effectively a singleton:

```js
// logger.js
class Logger {
  #logs = [];
  log(message) {
    this.#logs.push(message);
    console.log(`[${this.#logs.length}] ${message}`);
  }
  get count() { return this.#logs.length; }
}

export const logger = new Logger(); // the one shared instance
```

```js
// a.js
import { logger } from './logger.js';
logger.log('from A'); // [1] from A

// b.js
import { logger } from './logger.js';
logger.log('from B'); // [2] from B  (same instance)
```

### Class-based singleton

```js
class Config {
  static #instance = null;

  constructor() {
    if (Config.#instance) return Config.#instance; // return existing instance
    this.settings = { theme: 'dark' };
    Config.#instance = this;
  }

  static getInstance() {
    return Config.#instance ?? new Config();
  }
}

const c1 = new Config();
const c2 = Config.getInstance();
console.log(c1 === c2); // true
```

### Closure (IIFE) version

```js
const Counter = (() => {
  let instance;
  function create() {
    let count = 0;
    return { increment: () => ++count };
  }
  return { getInstance: () => (instance ??= create()) };
})();

Counter.getInstance().increment(); // 1
Counter.getInstance().increment(); // 2
```

### Drawbacks

- It's **global state**: hidden dependencies make code harder to reason about.
- **Hard to test**: state leaks between tests; mocking is awkward.
- Tight coupling; prefer **dependency injection** when practical.
- In Node, the same module loaded via different paths (or duplicated packages) can produce **two instances**.

## Factory pattern

A factory **encapsulates object creation**. Callers ask for "what" they want, and the factory decides "how" and "which class".

### Simple factory function

```js
function createUser({ name, role = 'viewer' }) {
  return {
    name,
    role,
    createdAt: new Date(),
    canEdit() { return this.role === 'admin' || this.role === 'editor'; },
  };
}

const u = createUser({ name: 'Asha', role: 'editor' });
console.log(u.canEdit()); // true
```

Factory functions also enable **true privacy via closures** without `class` or `new`.

### Factory choosing between types

```js
class EmailNotifier { send(msg) { return `Email: ${msg}`; } }
class SmsNotifier   { send(msg) { return `SMS: ${msg}`; } }
class PushNotifier  { send(msg) { return `Push: ${msg}`; } }

const notifiers = {
  email: EmailNotifier,
  sms: SmsNotifier,
  push: PushNotifier,
};

function createNotifier(type) {
  const Notifier = notifiers[type];
  if (!Notifier) throw new Error(`Unknown notifier: ${type}`);
  return new Notifier();
}

console.log(createNotifier('sms').send('Your OTP is 1234')); // "SMS: Your OTP is 1234"
```

Adding a new channel means adding one map entry; callers don't change (**Open/Closed principle**).

### Where you see factories

- `document.createElement('div')`
- `React.createElement`, `Object.create`, `Array.from`
- `axios.create({ baseURL })`, `express()`
- Static factory methods like `Promise.resolve`, `Array.of`, `Response.json()`

## Singleton vs Factory

| | Singleton | Factory |
|---|---|---|
| Category | Creational | Creational |
| Goal | Exactly one instance | Flexible creation of many instances |
| Returns | The same object every time | A new (possibly different-type) object each call |
| Typical use | Config, logger, connection pool, store | UI components, parsers, notifiers, API clients |
| Main risk | Global state, testing pain | Over-abstraction for simple cases |

They can be combined: a factory can cache and return a singleton per key (e.g. one DB client per connection string).

## Summary

- **Singleton**: one shared instance; in JS, an exported module object is the simplest form.
- **Factory**: a function that builds objects, hiding constructors and selection logic.
- Use singletons sparingly (global state), and factories to decouple callers from concrete types.

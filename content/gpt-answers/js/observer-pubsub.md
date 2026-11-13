An **event emitter** is an object that lets parts of your code **subscribe** to named events and get notified when those events are **emitted**. It's the classic implementation of the **Observer / Publish-Subscribe pattern**, and it's the model behind Node's `EventEmitter` and the DOM's `addEventListener`.

## Core API

- **`on(event, listener)`**: subscribe; returns an unsubscribe function
- **`off(event, listener)`**: unsubscribe
- **`once(event, listener)`**: subscribe for a single call
- **`emit(event, ...args)`**: notify all listeners of that event

## Implementation

```js
class EventEmitter {
  #events = new Map(); // eventName -> Set of listeners

  on(event, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('listener must be a function');
    }
    if (!this.#events.has(event)) this.#events.set(event, new Set());
    this.#events.get(event).add(listener);
    return () => this.off(event, listener); // convenient unsubscribe
  }

  off(event, listener) {
    const listeners = this.#events.get(event);
    if (!listeners) return this;
    listeners.delete(listener);
    if (listeners.size === 0) this.#events.delete(event);
    return this;
  }

  once(event, listener) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      listener.apply(this, args);
    };
    return this.on(event, wrapper);
  }

  emit(event, ...args) {
    const listeners = this.#events.get(event);
    if (!listeners) return false;
    // Copy so listeners added/removed during emit don't affect this round
    for (const listener of [...listeners]) {
      listener.apply(this, args);
    }
    return true;
  }

  listenerCount(event) {
    return this.#events.get(event)?.size ?? 0;
  }
}
```

### Design notes

- A **`Set`** prevents the same listener from being registered twice and gives O(1) removal.
- **Private field `#events`** keeps internal state hidden.
- **Copying listeners before iterating** avoids bugs when a listener calls `off` (like `once` does) during emit.
- **Returning an unsubscribe function** from `on` makes cleanup easy (common in React effects).

## Usage

```js
const emitter = new EventEmitter();

const greet = (name) => console.log(`Hello, ${name}!`);
const unsubscribe = emitter.on('greet', greet);
emitter.once('greet', (name) => console.log(`(first greeting for ${name})`));

emitter.emit('greet', 'Asha');
// Hello, Asha!
// (first greeting for Asha)

emitter.emit('greet', 'Ben');
// Hello, Ben!          ← once listener is gone

unsubscribe();
console.log(emitter.emit('greet', 'Chen')); // false (no listeners)
console.log(emitter.listenerCount('greet')); // 0
```

## Real-world example: decoupled modules

```js
// store.js
export const bus = new EventEmitter();

// cart.js
export function addToCart(item) {
  // ...update state
  bus.emit('cart:updated', { count: 3, item });
}

// header.js - knows nothing about cart.js internals
bus.on('cart:updated', ({ count }) => {
  console.log(`Cart badge: ${count}`);
});
```

## Observer vs Pub/Sub

The terms are often used interchangeably, but there's a subtle difference:

| | Observer | Pub/Sub |
|---|---|---|
| Coupling | Observers register directly with the subject | Publishers and subscribers only know the broker/channel |
| Middleman | None | Event bus / message broker |
| Typical example | DOM `addEventListener`, Node `EventEmitter` | Redis Pub/Sub, Kafka, a global event bus |
| Topics | Usually events on one object | Named channels/topics |

The emitter above is the Observer pattern; using one shared instance as a global bus turns it into a simple in-process Pub/Sub.

## Pitfalls

- **Memory leaks**: forgetting to unsubscribe keeps listeners (and everything they close over) alive. Always clean up on unmount/destroy.
- **Error handling**: a throwing listener stops the remaining listeners in this simple version; wrap calls in `try/catch` if isolation matters.
- **Hidden control flow**: overusing a global bus makes it hard to trace who triggers what.
- **Synchronous by default**: `emit` runs listeners immediately; use `queueMicrotask` if you need async delivery.

## Summary

- An event emitter stores listeners per event name and calls them on `emit`.
- Core methods: `on`, `off`, `once`, `emit`, built on a `Map` of `Set`s.
- It decouples producers from consumers; remember to unsubscribe to avoid leaks.

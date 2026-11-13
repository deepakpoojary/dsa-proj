A **`Symbol`** is a primitive data type (introduced in ES6) whose every value is **unique and immutable**. Symbols are mainly used as **property keys that can never collide** with other keys, and as "well-known symbols" that let you customise built-in language behaviour like iteration.

## Creating symbols

```js
const id1 = Symbol('id');
const id2 = Symbol('id');

console.log(id1 === id2);      // false — always unique
console.log(typeof id1);       // 'symbol'
console.log(id1.description);  // 'id' (just a label for debugging)
console.log(id1.toString());   // 'Symbol(id)'

// new Symbol() // TypeError: Symbol is not a constructor
```

The string you pass is only a **description**; it doesn't affect identity.

## Use case 1: collision-free property keys

When you attach data to an object you don't own (e.g. from a library), a symbol key can't clash with existing or future string keys:

```js
const meta = Symbol('meta');

const user = { name: 'Ann', meta: 'public' };
user[meta] = { createdBy: 'system' };

console.log(user.meta);  // 'public'          — string key untouched
console.log(user[meta]); // { createdBy: 'system' }
```

## Symbols are "hidden" from normal enumeration

```js
const secret = Symbol('secret');
const obj = { visible: 1, [secret]: 2 };

Object.keys(obj);                   // ['visible']
for (const k in obj) console.log(k); // 'visible'
JSON.stringify(obj);                // '{"visible":1}'

Object.getOwnPropertySymbols(obj);  // [Symbol(secret)]
Reflect.ownKeys(obj);               // ['visible', Symbol(secret)]
```

They are **not truly private** — anyone can find them via `Object.getOwnPropertySymbols`. For real privacy use `#private` class fields.

## Use case 2: global symbols with `Symbol.for`

`Symbol.for(key)` looks up a **global registry** and returns the same symbol for the same key, even across modules or iframes:

```js
const a = Symbol.for('app.id');
const b = Symbol.for('app.id');
console.log(a === b);          // true
console.log(Symbol.keyFor(a)); // 'app.id'

console.log(Symbol('x') === Symbol.for('x')); // false
```

React uses this pattern (`Symbol.for('react.element')`) to mark elements safely.

## Use case 3: well-known symbols

Built-in symbols let your objects hook into language features:

```js
class Temperature {
  constructor(celsius) { this.celsius = celsius; }

  // Control type conversion
  [Symbol.toPrimitive](hint) {
    return hint === 'string' ? `${this.celsius}°C` : this.celsius;
  }

  // Custom label for Object.prototype.toString
  get [Symbol.toStringTag]() { return 'Temperature'; }
}

const t = new Temperature(25);
console.log(`${t}`);                         // '25°C'
console.log(t + 5);                          // 30
console.log(Object.prototype.toString.call(t)); // '[object Temperature]'
```

```js
// Make an object iterable
const team = {
  members: ['Ann', 'Bob'],
  *[Symbol.iterator]() { yield* this.members; },
};
console.log([...team]); // ['Ann', 'Bob']
```

| Well-known symbol | Customises |
| --- | --- |
| `Symbol.iterator` | `for...of`, spread, destructuring |
| `Symbol.asyncIterator` | `for await...of` |
| `Symbol.toPrimitive` | Conversion to number/string |
| `Symbol.hasInstance` | `instanceof` behaviour |
| `Symbol.toStringTag` | `Object.prototype.toString` output |

## Use case 4: unique constants / enums

```js
const Status = Object.freeze({
  ACTIVE: Symbol('active'),
  INACTIVE: Symbol('inactive'),
});
// Can't be accidentally matched by a string like 'active'
```

## Common pitfalls

- Symbols don't auto-convert to strings: `'id: ' + Symbol('x')` throws `TypeError`; use `String(sym)` or `sym.description`.
- `JSON.stringify` ignores symbol keys and symbol values.
- Object spread **does** copy own enumerable symbol properties.

## Summary

- `Symbol()` creates a unique primitive, ideal for non-colliding property keys and metadata.
- Symbol keys are skipped by `Object.keys`, `for...in` and JSON, but not truly private.
- `Symbol.for` shares symbols globally; well-known symbols like `Symbol.iterator` customise language behaviour.

When you call a function with `new`, JavaScript creates a brand-new object, links it to the function's `prototype`, runs the function with `this` pointing at that object, and returns the object (unless the function explicitly returns a different object).

## What happens step by step

When you write `new Person('Ann')`, the engine roughly does this:

1. **Creates a new empty object**: `{}`.
2. **Links its prototype**: the new object's internal `[[Prototype]]` is set to `Person.prototype`, so it inherits any methods defined there.
3. **Runs the constructor with `this` bound to the new object**: properties like `this.name = name` are added to it.
4. **Returns the result**:
   - If the constructor returns an **object** (or function), that value is returned instead.
   - Otherwise (no return, or a primitive return), the **new object** is returned.

```js
function Person(name) {
  this.name = name;
}

Person.prototype.greet = function () {
  return `Hi, I'm ${this.name}`;
};

const ann = new Person('Ann');

console.log(ann.name);                                   // "Ann"
console.log(ann.greet());                                // "Hi, I'm Ann"
console.log(Object.getPrototypeOf(ann) === Person.prototype); // true
console.log(ann instanceof Person);                      // true
```

## Implementing `new` yourself

A classic interview task is to write a function that mimics `new`:

```js
function myNew(Ctor, ...args) {
  // 1 + 2: create an object linked to Ctor.prototype
  const obj = Object.create(Ctor.prototype);

  // 3: run the constructor with `this` = obj
  const res = Ctor.apply(obj, args);

  // 4: if the constructor returned an object/function, use it
  const isObj = res !== null && (typeof res === 'object' || typeof res === 'function');
  return isObj ? res : obj;
}

const bob = myNew(Person, 'Bob');
console.log(bob.greet());          // "Hi, I'm Bob"
console.log(bob instanceof Person); // true
```

## The return value rule

```js
function ReturnsObject() {
  this.a = 1;
  return { b: 2 };       // object -> overrides `this`
}

function ReturnsPrimitive() {
  this.a = 1;
  return 42;             // primitive -> ignored
}

console.log(new ReturnsObject());    // { b: 2 }
console.log(new ReturnsPrimitive()); // ReturnsPrimitive { a: 1 }
```

## What you *can't* call with `new`

| Callable | Works with `new`? | Why |
| --- | --- | --- |
| Regular `function` | Yes | Has `[[Construct]]` and a `prototype` |
| `class` | Yes (required) | Calling without `new` throws `TypeError` |
| Arrow function | No | No `prototype`, no own `this` |
| Method shorthand `{ m() {} }` | No | Not a constructor |
| `async` / generator function | No | Not constructors |
| Built-ins like `Math.max` | No | Not constructors |

```js
const Arrow = () => {};
new Arrow(); // TypeError: Arrow is not a constructor

class Car {}
Car();       // TypeError: Class constructor Car cannot be invoked without 'new'
```

## Common pitfalls

- **Forgetting `new`** with an old-style constructor: in sloppy mode `this` becomes the global object and you leak globals; in strict mode `this` is `undefined` and you get a `TypeError`. Classes protect you from this.
- **`new.target`** lets a function detect whether it was called with `new`:

```js
function Strict() {
  if (!new.target) throw new Error('Use new Strict()');
}
```

## Summary

- `new` creates an object, links it to `Constructor.prototype`, runs the constructor with `this` = that object, and returns it.
- An explicit **object** return overrides the new instance; a primitive return is ignored.
- Arrow functions and method shorthands can't be used with `new`; classes *must* be.

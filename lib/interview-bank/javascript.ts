import type { BankQuestion } from './types';

export const JAVASCRIPT: BankQuestion[] = [
  // ───────────────────────── Basics & Types ─────────────────────────
  {
    id: 'var-let-const',
    group: 'Basics & Types',
    stars: 5,
    difficulty: 'Easy',
    q: 'What are the differences between `var`, `let` and `const`?',
    a: [
      'Scope: `var` is function-scoped; `let` and `const` are block-scoped (`{}`).',
      'Hoisting: `var` is hoisted and initialised to `undefined`; `let`/`const` are hoisted but sit in the Temporal Dead Zone until declared.',
      'Redeclaration: `var` can be redeclared in the same scope; `let`/`const` cannot (SyntaxError).',
      'A top-level `var` in a classic script becomes a property of `window`; `let`/`const` do not.',
      '`const` must be initialised and cannot be reassigned, but the object it points to can still be mutated.',
      'Rule of thumb: default to `const`, use `let` when you reassign, avoid `var`.',
    ],
  },
  {
    id: 'hoisting',
    group: 'Basics & Types',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is hoisting?',
    a: [
      'Hoisting = declarations are registered during the creation phase of a scope, before any code in it runs.',
      'Function declarations are fully hoisted (name + body), so they can be called before they appear.',
      '`var` is hoisted and initialised to `undefined`, so reading it early gives `undefined`, not an error.',
      '`let`, `const` and `class` are hoisted but uninitialised (TDZ): reading them early throws ReferenceError.',
      'Function expressions and arrow functions follow the rules of the variable they are assigned to.',
      '`import` declarations are hoisted too: modules are linked before the module body runs.',
    ],
    code: `console.log(a); // undefined
var a = 1;
greet();        // works: declaration is hoisted
function greet() {}
console.log(b); // ReferenceError (TDZ)
let b = 2;`,
  },
  {
    id: 'double-vs-triple-equals',
    group: 'Basics & Types',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is the difference between `==`, `===` and `Object.is`?',
    a: [
      '`==` (loose) converts operands to a common type before comparing; `===` (strict) compares type and value with no coercion.',
      '`Object.is` is like `===` except `Object.is(NaN, NaN)` is true and `Object.is(0, -0)` is false.',
      'Objects (arrays, functions) are compared by reference with all three: `{} === {}` is false.',
      '`null == undefined` is true but neither is loosely equal to anything else (`null == 0` is false).',
      'Use `===` everywhere; the one common exception is `x == null` to check for both null and undefined.',
    ],
    code: `0 == '0';        // true
0 === '0';       // false
'' == 0;         // true
NaN === NaN;     // false
Object.is(NaN, NaN); // true`,
  },
  {
    id: 'data-types',
    group: 'Basics & Types',
    stars: 4,
    difficulty: 'Easy',
    q: 'What are the data types in JavaScript?',
    a: [
      '7 primitives: `string`, `number`, `bigint`, `boolean`, `undefined`, `null`, `symbol`.',
      'Everything else is an `object`: plain objects, arrays, functions, dates, maps, sets, etc.',
      'Primitives are immutable and compared by value; objects are mutable and compared by reference.',
      'Calling a method on a primitive (`"abc".toUpperCase()`) temporarily wraps it in its object wrapper (autoboxing).',
      '`typeof null === "object"` is a historic bug; `typeof` of a function returns `"function"`.',
    ],
  },
  {
    id: 'null-vs-undefined',
    group: 'Basics & Types',
    stars: 4,
    difficulty: 'Easy',
    q: 'What is the difference between `null` and `undefined`?',
    a: [
      '`undefined` = a value was never assigned: uninitialised variable, missing property, missing argument, function with no return.',
      '`null` = intentional "no value", assigned explicitly by the developer.',
      '`typeof undefined` is `"undefined"`; `typeof null` is `"object"` (legacy bug).',
      '`null == undefined` is true, `null === undefined` is false.',
      'Default parameters and destructuring defaults kick in only for `undefined`, not `null`.',
      '`JSON.stringify` drops properties whose value is `undefined` but keeps `null`.',
    ],
  },
  {
    id: 'type-coercion',
    group: 'Basics & Types',
    stars: 4,
    difficulty: 'Medium',
    q: 'Explain type coercion in JavaScript.',
    a: [
      'Coercion = automatic (implicit) or manual (explicit: `Number()`, `String()`, `Boolean()`) conversion between types.',
      '`+` with any string operand concatenates; `-`, `*`, `/`, `%` always convert operands to numbers.',
      'Objects become primitives via `Symbol.toPrimitive`, then `valueOf()`, then `toString()` (order depends on hint).',
      '`==` rules: null/undefined equal only each other; booleans become numbers; string vs number compares as numbers.',
      'Gotchas: `[] + {}` is `"[object Object]"`, `"5" - 2` is 3, `"5" + 2` is `"52"`, `[] == ![]` is true.',
    ],
  },
  {
    id: 'primitive-vs-reference',
    group: 'Basics & Types',
    stars: 4,
    difficulty: 'Easy',
    q: 'How are primitives and objects passed/copied (value vs reference)?',
    a: [
      'Primitives are copied by value: changing the copy never affects the original.',
      'Variables holding objects store a reference; assigning copies the reference, so both point to the same object.',
      'JS is always pass-by-value, but for objects the value is the reference ("call by sharing").',
      'Mutating a parameter object is visible to the caller; reassigning the parameter is not.',
      '`const` freezes the binding, not the object: `const o = {}; o.x = 1` is allowed.',
    ],
    code: `function change(obj) {
  obj.a = 2;     // visible to caller
  obj = { a: 3 }; // only rebinds the local
}
const o = { a: 1 };
change(o);
o.a; // 2`,
  },
  {
    id: 'truthy-falsy',
    group: 'Basics & Types',
    stars: 3,
    difficulty: 'Easy',
    q: 'What are truthy and falsy values?',
    a: [
      'Falsy values: `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN` (plus the legacy `document.all`).',
      'Everything else is truthy, including `"0"`, `"false"`, `[]`, `{}` and functions.',
      'Used by `if`, `while`, `!`, `&&`, `||` and the ternary operator.',
      'Gotcha: `count || 10` replaces a valid `0`; use `count ?? 10` when 0 or `""` are valid values.',
    ],
  },
  {
    id: 'typeof-quirks',
    group: 'Basics & Types',
    stars: 3,
    difficulty: 'Easy',
    q: 'What does `typeof` return and what are its quirks?',
    a: [
      'Returns a string: "string", "number", "bigint", "boolean", "undefined", "symbol", "object" or "function".',
      '`typeof null` is "object" (bug kept for compatibility); check with `x === null`.',
      '`typeof []` is "object"; use `Array.isArray()` to detect arrays.',
      '`typeof NaN` is "number"; `typeof class {}` is "function".',
      '`typeof undeclaredVar` is "undefined" (no error), but `typeof` on a `let` in its TDZ throws.',
    ],
  },
  {
    id: 'nan',
    group: 'Basics & Types',
    stars: 3,
    difficulty: 'Easy',
    q: 'What is `NaN` and how do you check for it?',
    a: [
      '`NaN` (Not-a-Number) is a `number` value produced by invalid math, e.g. `Number("abc")` or `0 / 0`.',
      'It is the only value not equal to itself: `NaN === NaN` is false.',
      'Use `Number.isNaN(x)` (no coercion); global `isNaN("abc")` is true because it coerces first.',
      '`Object.is(NaN, NaN)` is true; `[NaN].includes(NaN)` is true but `[NaN].indexOf(NaN)` is -1.',
    ],
  },
  {
    id: 'strict-mode',
    group: 'Basics & Types',
    stars: 2,
    difficulty: 'Easy',
    q: 'What does `"use strict"` do?',
    a: [
      'Opts a script or function into a stricter variant of JS that turns silent errors into thrown errors.',
      'Assigning to an undeclared variable throws ReferenceError instead of creating a global.',
      '`this` is `undefined` (not the global object) in plain function calls.',
      'Writes to read-only/frozen properties throw; duplicate parameter names and `with` are forbidden.',
      'ES modules and class bodies are always strict automatically.',
    ],
  },
  {
    id: 'floating-point',
    group: 'Basics & Types',
    stars: 2,
    difficulty: 'Easy',
    q: 'Why is `0.1 + 0.2 !== 0.3`?',
    a: [
      'All numbers are IEEE 754 64-bit doubles; 0.1 and 0.2 have no exact binary representation.',
      '`0.1 + 0.2` gives `0.30000000000000004`.',
      'Compare with a tolerance: `Math.abs(a - b) < Number.EPSILON`.',
      'For money, store integers (cents) or use a decimal library; format with `toFixed` / `Intl.NumberFormat`.',
      'Integers are exact only up to `Number.MAX_SAFE_INTEGER` (2^53 - 1); beyond that use `BigInt`.',
    ],
  },

  // ───────────────────────── Scope & Closures ─────────────────────────
  {
    id: 'closures',
    group: 'Scope & Closures',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is a closure in JavaScript?',
    a: [
      'A closure = a function bundled with the lexical scope it was created in.',
      'The inner function keeps access to outer variables even after the outer function has returned.',
      'Uses: data privacy / module pattern, function factories, memoization, callbacks keeping state.',
      'Each call of the outer function creates a fresh scope, so each returned closure has its own state.',
      'Gotcha: `var` in a loop + closures all see the final value; fix with `let` (block scope) or an IIFE.',
    ],
    code: `function counter() {
  let n = 0;
  return () => ++n;
}
const c = counter();
c(); // 1
c(); // 2`,
  },
  {
    id: 'closure-loop-settimeout',
    group: 'Scope & Closures',
    stars: 5,
    difficulty: 'Medium',
    q: 'What does a `setTimeout` inside a `for` loop with `var` print, and how do you fix it?',
    a: [
      'With `var` there is one function-scoped `i`; by the time callbacks run the loop has finished, so all log the final value.',
      'With `let`, each iteration gets a fresh binding, so each callback captures its own value.',
      'Pre-ES6 fix: wrap in an IIFE passing `i` as an argument, or use `setTimeout(fn, 0, i)`.',
      'Combines two concepts: closures (capture the variable, not the value) and the event loop (callbacks run later).',
    ],
    code: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i)); // 3 3 3
}
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j)); // 0 1 2
}`,
  },
  {
    id: 'lexical-scope-chain',
    group: 'Scope & Closures',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is lexical scope and the scope chain?',
    a: [
      'Lexical (static) scope: what a function can see is decided by where it is written, not where it is called.',
      'Scope types: global, module, function and block scope.',
      'Variable lookup walks the scope chain: current scope, then each outer scope, up to global.',
      'Not found anywhere: ReferenceError (or an implicit global on assignment in sloppy mode).',
      'Inner declarations with the same name shadow outer ones.',
      'Closures are a direct consequence of lexical scoping.',
    ],
  },
  {
    id: 'temporal-dead-zone',
    group: 'Scope & Closures',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is the Temporal Dead Zone (TDZ)?',
    a: [
      'TDZ = the period from the start of a block until a `let`/`const`/`class` declaration is evaluated.',
      'The binding exists (it is hoisted) but accessing it throws ReferenceError.',
      'Even `typeof x` throws inside the TDZ, unlike for undeclared variables.',
      'Also applies to default params: `function f(a = b, b) {}` throws when `b` is read early.',
      'Purpose: catch use-before-declare bugs that `var` silently allowed.',
    ],
    code: `let x = 'outer';
{
  console.log(x); // ReferenceError, not 'outer'
  let x = 'inner';
}`,
  },
  {
    id: 'iife',
    group: 'Scope & Closures',
    stars: 3,
    difficulty: 'Easy',
    q: 'What is an IIFE and why was it used?',
    a: [
      'IIFE = Immediately Invoked Function Expression: `(function () { ... })();`.',
      'Creates a private scope so variables do not leak into the global scope.',
      'Was the backbone of the module pattern and of fixing `var`-in-loop closure bugs before ES6.',
      'Wrapping parentheses make the parser treat it as an expression, not a declaration.',
      'Today mostly replaced by ES modules and block scope; async IIFEs are still handy where top-level await is unavailable.',
    ],
  },
  {
    id: 'module-pattern',
    group: 'Scope & Closures',
    stars: 3,
    difficulty: 'Medium',
    q: 'How can closures be used to create private variables (module pattern)?',
    a: [
      'Wrap state in a function scope and return only a public API object; the state is reachable only via closures.',
      'Revealing module pattern: define everything privately, then return references to the public members.',
      'Gives real encapsulation; state cannot be modified from outside.',
      'Modern alternatives: ES module scope (unexported bindings are private) and `#private` class fields.',
    ],
    code: `const bank = (() => {
  let balance = 0;
  return {
    deposit: (n) => (balance += n),
    get balance() { return balance; },
  };
})();
bank.deposit(50); bank.balance; // 50`,
  },
  {
    id: 'block-vs-function-scope',
    group: 'Scope & Closures',
    stars: 3,
    difficulty: 'Easy',
    q: 'What is the difference between block scope and function scope?',
    a: [
      'Function scope: variables live for the whole function body (`var`, function params).',
      'Block scope: variables live only inside the nearest `{}` (`let`, `const`, `class`).',
      '`var` declared in an `if` or `for` block leaks to the enclosing function.',
      '`for (let i ...)` creates a new binding of `i` per iteration.',
      'The `catch (err)` parameter is block-scoped; in strict mode, function declarations in blocks are block-scoped.',
    ],
  },
  {
    id: 'closure-memory-leaks',
    group: 'Scope & Closures',
    stars: 2,
    difficulty: 'Hard',
    q: 'Can closures cause memory leaks?',
    a: [
      'A closure keeps its captured variables alive as long as the closure itself is reachable.',
      'Long-lived closures (event listeners, intervals, caches, globals) can retain large objects or detached DOM nodes.',
      'Engines keep only captured variables, but closures created in the same scope share one context, so one can keep data alive for another.',
      'Fix: remove listeners, clear timers, null out large references, use `WeakMap`/`WeakRef` for caches.',
    ],
  },
  {
    id: 'globalthis',
    group: 'Scope & Closures',
    stars: 1,
    difficulty: 'Easy',
    q: 'What is `globalThis`?',
    a: [
      'Standard (ES2020) way to access the global object in any environment.',
      'Equals `window` in browsers, `global` in Node.js and `self` in web workers.',
      'Top-level `var` and function declarations in classic scripts become properties of it; `let`/`const` do not.',
      'Module top-level declarations never become global properties.',
    ],
  },

  // ───────────────────────── this & Functions ─────────────────────────
  {
    id: 'this-keyword',
    group: 'this & Functions',
    stars: 5,
    difficulty: 'Medium',
    q: 'How is `this` determined in JavaScript?',
    a: [
      '`this` is set by how a function is called (call site), not where it is defined; arrow functions are the exception.',
      'Priority: `new` binding > explicit (`call`/`apply`/`bind`) > implicit (`obj.method()`) > default.',
      'Default binding: `undefined` in strict mode/modules, the global object in sloppy mode.',
      'Arrow functions have no own `this`; they use `this` from the enclosing lexical scope.',
      'Gotcha: passing `obj.method` as a callback loses `this`; fix with `bind` or an arrow wrapper.',
      'In DOM listeners with regular functions, `this` is `event.currentTarget`.',
    ],
    code: `const user = {
  name: 'Ann',
  hi() { return this.name; },
};
user.hi();          // 'Ann'
const f = user.hi;
f();                // TypeError in strict mode (this is undefined)
f.call({ name: 'Bo' }); // 'Bo'`,
  },
  {
    id: 'call-apply-bind',
    group: 'this & Functions',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is the difference between `call`, `apply` and `bind`?',
    a: [
      '`call(thisArg, a, b)` invokes immediately with arguments listed individually.',
      '`apply(thisArg, [a, b])` invokes immediately with arguments as an array (mnemonic: A for array).',
      '`bind(thisArg, a)` does not invoke; it returns a new function with `this` fixed and optional preset args (partial application).',
      'A bound function cannot be rebound by another `bind`/`call`; only `new` overrides it.',
      'None of them change `this` of arrow functions.',
      'Uses: method borrowing (`Array.prototype.slice.call(arguments)`), fixing callbacks, partial application.',
    ],
  },
  {
    id: 'arrow-vs-regular-functions',
    group: 'this & Functions',
    stars: 5,
    difficulty: 'Easy',
    q: 'How do arrow functions differ from regular functions?',
    a: [
      'No own `this`, `arguments`, `super` or `new.target`; they are taken lexically from the enclosing scope.',
      'Cannot be used as constructors (no `prototype`, `new` throws TypeError).',
      'Concise syntax with implicit return: `x => x * 2`; returning an object literal needs parentheses `() => ({})`.',
      '`call`/`apply`/`bind` cannot change their `this`.',
      'Great for callbacks (`map`, `setTimeout`, promise chains); avoid as object methods or prototype methods that need `this`.',
    ],
  },
  {
    id: 'bind-polyfill',
    group: 'this & Functions',
    stars: 4,
    difficulty: 'Hard',
    q: 'Write a polyfill for `Function.prototype.bind`.',
    a: [
      'Store the original function (`this` inside the polyfill) and the preset arguments.',
      'Return a new function that calls the original with `apply`, merging preset and call-time arguments.',
      'A full polyfill also handles `new boundFn()` by ignoring the bound `this` and linking the prototype.',
      'Follow-ups: polyfill `call` (temporarily attach fn as a Symbol key on the context) and `apply`.',
    ],
    code: `Function.prototype.myBind = function (ctx, ...preset) {
  const fn = this;
  return function (...args) {
    return fn.apply(ctx, [...preset, ...args]);
  };
};
function greet(g, p) { return g + ' ' + this.name + p; }
greet.myBind({ name: 'Ann' }, 'Hi')('!'); // 'Hi Ann!'`,
  },
  {
    id: 'new-keyword',
    group: 'this & Functions',
    stars: 4,
    difficulty: 'Medium',
    q: 'What happens when you call a function with `new`?',
    a: [
      '1. A new empty object is created whose [[Prototype]] is `Constructor.prototype`.',
      '2. The constructor runs with `this` bound to that new object.',
      '3. If the constructor returns an object (or function), that is the result; otherwise the new object is returned.',
      'Arrow functions and methods defined with shorthand syntax cannot be called with `new`.',
      'Classes must be called with `new`; calling them as plain functions throws TypeError.',
    ],
    code: `function myNew(Ctor, ...args) {
  const obj = Object.create(Ctor.prototype);
  const res = Ctor.apply(obj, args);
  const isObj = res !== null && (typeof res === 'object' || typeof res === 'function');
  return isObj ? res : obj;
}`,
  },
  {
    id: 'currying',
    group: 'this & Functions',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is currying? Implement a generic `curry`.',
    a: [
      'Currying transforms `f(a, b, c)` into `f(a)(b)(c)`: a chain of unary functions.',
      'Relies on closures to remember the arguments collected so far.',
      'Partial application is different: fix some arguments at once and get a function for the rest.',
      'Uses: reusable specialised functions, function composition, config-first APIs.',
      'Gotcha: `fn.length` ignores rest params and params after the first default value.',
    ],
    code: `const curry = (fn) =>
  function curried(...args) {
    return args.length >= fn.length
      ? fn.apply(this, args)
      : (...next) => curried.apply(this, [...args, ...next]);
  };
const add = curry((a, b, c) => a + b + c);
add(1)(2)(3); // 6
add(1, 2)(3); // 6`,
  },
  {
    id: 'higher-order-functions',
    group: 'this & Functions',
    stars: 3,
    difficulty: 'Easy',
    q: 'What is a higher-order function?',
    a: [
      'A function that takes a function as an argument and/or returns a function.',
      'Built-in examples: `map`, `filter`, `reduce`, `sort`, `addEventListener`, `setTimeout`.',
      'Custom examples: `debounce`, `throttle`, `memoize`, middleware, decorators.',
      'Possible because functions are first-class values in JS.',
    ],
  },
  {
    id: 'function-declaration-vs-expression',
    group: 'this & Functions',
    stars: 3,
    difficulty: 'Easy',
    q: 'Function declaration vs function expression?',
    a: [
      'Declaration: `function f() {}` as a statement; fully hoisted, callable before its line.',
      'Expression: `const f = function () {}`; only usable after the assignment runs.',
      'A named function expression `const f = function g() {}` exposes `g` only inside its own body (handy for recursion and stack traces).',
      'IIFEs and callbacks require expressions.',
    ],
  },
  {
    id: 'pure-functions',
    group: 'this & Functions',
    stars: 3,
    difficulty: 'Easy',
    q: 'What is a pure function?',
    a: [
      'Same input always gives the same output, and it has no side effects.',
      'Side effects include mutating arguments or outer state, I/O, DOM changes, `Date.now()`, `Math.random()`.',
      'Benefits: predictable, easy to test, safe to memoize and parallelise.',
      'React reducers and render logic are expected to be pure; use `toSorted`/spread instead of mutating.',
    ],
  },
  {
    id: 'first-class-functions',
    group: 'this & Functions',
    stars: 2,
    difficulty: 'Easy',
    q: 'What does "functions are first-class citizens" mean?',
    a: [
      'Functions are values (objects): they can be assigned to variables, stored in data structures and passed or returned.',
      'They can have properties (`fn.length`, `fn.name`, custom ones).',
      'This enables callbacks, higher-order functions, closures and functional programming patterns.',
    ],
  },
  {
    id: 'arguments-object',
    group: 'this & Functions',
    stars: 2,
    difficulty: 'Easy',
    q: 'What is the `arguments` object?',
    a: [
      'An array-like object with all arguments passed to a regular function (has `length` and indexes, no array methods).',
      'Not available in arrow functions (they see the outer function `arguments`).',
      'Convert with `Array.from(arguments)` or `[...arguments]`.',
      'Prefer rest parameters (`...args`), which give a real array.',
    ],
  },

  // ───────────────────────── Objects & Prototypes ─────────────────────────
  {
    id: 'prototypal-inheritance',
    group: 'Objects & Prototypes',
    stars: 5,
    difficulty: 'Medium',
    q: 'Explain prototypal inheritance and the prototype chain.',
    a: [
      'Every object has an internal [[Prototype]] link to another object (or `null`).',
      'Property lookup checks the object itself, then walks up the prototype chain until found or `null` is reached.',
      'Methods placed on `Constructor.prototype` are shared by all instances, saving memory.',
      'Read/set with `Object.getPrototypeOf` / `Object.create`; avoid `Object.setPrototypeOf` on hot objects (slow).',
      '`Object.hasOwn(obj, key)` checks own props only; `key in obj` includes inherited ones.',
      'Chain example: `arr` to `Array.prototype` to `Object.prototype` to `null`.',
    ],
    code: `const animal = { speak() { return this.name + ' speaks'; } };
const dog = Object.create(animal);
dog.name = 'Rex';
dog.speak();                 // 'Rex speaks'
Object.hasOwn(dog, 'speak'); // false`,
  },
  {
    id: 'shallow-vs-deep-copy',
    group: 'Objects & Prototypes',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is the difference between a shallow and a deep copy? How do you deep clone?',
    a: [
      'Shallow copy duplicates top-level properties; nested objects are still shared references.',
      'Shallow: spread `{...o}`, `Object.assign`, `[...arr]`, `arr.slice()`, `Array.from`.',
      'Deep copy duplicates every nested level so nothing is shared.',
      '`structuredClone(o)` is the native deep clone: handles Date, Map, Set, RegExp, typed arrays and cycles.',
      '`structuredClone` cannot clone functions or DOM nodes and drops class prototypes (instances become plain objects).',
      '`JSON.parse(JSON.stringify(o))` loses `undefined`, functions, Symbols, Map/Set, turns Dates into strings and throws on cycles/BigInt.',
    ],
    code: `const a = { n: 1, inner: { x: 1 } };
const shallow = { ...a };
shallow.inner.x = 99; // a.inner.x is 99 too
const deep = structuredClone(a);
deep.inner.x = 5;     // a untouched`,
  },
  {
    id: 'proto-vs-prototype',
    group: 'Objects & Prototypes',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is the difference between `__proto__` and `prototype`?',
    a: [
      '`prototype` is a property of constructor functions/classes: the object that becomes the [[Prototype]] of instances created with `new`.',
      '`__proto__` is a legacy accessor (on `Object.prototype`) that exposes an object\'s own [[Prototype]].',
      'So `new Foo().__proto__ === Foo.prototype`.',
      'Arrow functions and methods have no `prototype` property.',
      'Prefer `Object.getPrototypeOf` / `Object.setPrototypeOf` over `__proto__`.',
    ],
  },
  {
    id: 'classes-vs-prototypes',
    group: 'Objects & Prototypes',
    stars: 4,
    difficulty: 'Medium',
    q: 'Are ES6 classes just syntactic sugar over prototypes?',
    a: [
      'Mostly: methods still live on `Class.prototype` and inheritance uses the prototype chain.',
      'Differences: class bodies are always strict, classes are in the TDZ until declared, and must be called with `new`.',
      'Class methods are non-enumerable; constructor functions\' prototype methods are enumerable by default.',
      'Derived classes must call `super()` before using `this`.',
      'Extra features with no ES5 equivalent: `#private` fields/methods, static blocks, and subclassing built-ins like `Array`/`Error` properly.',
    ],
  },
  {
    id: 'object-create',
    group: 'Objects & Prototypes',
    stars: 3,
    difficulty: 'Medium',
    q: 'What does `Object.create` do?',
    a: [
      '`Object.create(proto)` creates a new object whose [[Prototype]] is `proto`, without calling a constructor.',
      '`Object.create(null)` gives a bare dictionary with no inherited keys like `toString` (safe for lookups).',
      'An optional second argument defines properties using property descriptors.',
      'Pre-ES6 inheritance: `Child.prototype = Object.create(Parent.prototype)` plus resetting `constructor`.',
    ],
  },
  {
    id: 'freeze-seal-preventextensions',
    group: 'Objects & Prototypes',
    stars: 3,
    difficulty: 'Easy',
    q: 'What is the difference between `Object.freeze`, `Object.seal` and `Object.preventExtensions`?',
    a: [
      '`preventExtensions`: cannot add new properties; can delete and modify existing ones.',
      '`seal`: cannot add or delete properties; can still modify existing values.',
      '`freeze`: cannot add, delete or modify; the object is fully read-only.',
      'All are shallow: nested objects stay mutable unless frozen recursively.',
      'Violations throw TypeError in strict mode and fail silently in sloppy mode.',
      '`const` only prevents rebinding the variable; it does not freeze the object.',
    ],
  },
  {
    id: 'object-equality',
    group: 'Objects & Prototypes',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do you compare two objects for equality?',
    a: [
      '`===` / `==` only check whether two references point to the same object.',
      'Shallow equality: same set of keys and `Object.is` on each value (React uses this for props/state).',
      'Deep equality: recursively compare keys and values, handling arrays, Dates, Maps and cycles.',
      '`JSON.stringify(a) === JSON.stringify(b)` is fragile: depends on key order and drops undefined/functions.',
      'Use a library (`lodash.isEqual`) or Node `util.isDeepStrictEqual` in practice.',
    ],
  },
  {
    id: 'private-class-fields',
    group: 'Objects & Prototypes',
    stars: 3,
    difficulty: 'Easy',
    q: 'How do private fields work in JavaScript classes?',
    a: [
      'Prefix with `#`: `#count = 0`; accessible only inside the class body, enforced by the language (SyntaxError outside).',
      'Also available: `#private()` methods, `static #x`, and `#get`/`#set` accessors.',
      '`#field in obj` is a brand check: tells whether an object has that private field.',
      'Unlike the `_name` convention or TypeScript `private`, these are truly private at runtime.',
      'Private fields are not inherited as accessible names and are not visible to `Object.keys`, JSON or Proxies.',
    ],
    code: `class Counter {
  #count = 0;
  static #instances = 0;
  constructor() { Counter.#instances++; }
  inc() { return ++this.#count; }
  static isCounter(o) { return #count in o; }
}`,
  },
  {
    id: 'property-descriptors',
    group: 'Objects & Prototypes',
    stars: 2,
    difficulty: 'Medium',
    q: 'What are property descriptors?',
    a: [
      'Each property has attributes: `value`, `writable`, `enumerable`, `configurable` (data) or `get`, `set` (accessor).',
      'Read with `Object.getOwnPropertyDescriptor(s)`; define with `Object.defineProperty(ies)`.',
      'With `defineProperty`, unspecified flags default to `false`, unlike normal assignment (all `true`).',
      '`enumerable: false` hides the property from `for...in`, `Object.keys` and JSON.',
      '`configurable: false` prevents deleting or changing the descriptor later.',
    ],
  },
  {
    id: 'getters-setters',
    group: 'Objects & Prototypes',
    stars: 2,
    difficulty: 'Easy',
    q: 'What are getters and setters?',
    a: [
      'Accessor properties defined with `get prop()` / `set prop(v)` that run code on read/write.',
      'Uses: computed/derived values, validation, lazy evaluation, keeping a stable public API.',
      'A getter without a setter makes the property read-only (assignment throws in strict mode).',
      'Vue 2 reactivity used `Object.defineProperty` getters/setters; Vue 3 uses `Proxy`.',
    ],
  },
  {
    id: 'instanceof',
    group: 'Objects & Prototypes',
    stars: 2,
    difficulty: 'Medium',
    q: 'How does `instanceof` work? Implement it.',
    a: [
      '`obj instanceof C` checks whether `C.prototype` appears anywhere in the prototype chain of `obj`.',
      'Returns false for primitives (`1 instanceof Number` is false).',
      'Can be customised with `static [Symbol.hasInstance]`.',
      'Breaks across realms (iframes): use `Array.isArray` for arrays.',
    ],
    code: `function myInstanceOf(obj, C) {
  if (obj === null || (typeof obj !== 'object' && typeof obj !== 'function')) return false;
  let proto = Object.getPrototypeOf(obj);
  while (proto) {
    if (proto === C.prototype) return true;
    proto = Object.getPrototypeOf(proto);
  }
  return false;
}`,
  },

  // ───────────────────────── Async & Event Loop ─────────────────────────
  {
    id: 'event-loop',
    group: 'Async & Event Loop',
    stars: 5,
    difficulty: 'Hard',
    q: 'Explain the JavaScript event loop.',
    a: [
      'JS runs on a single thread with one call stack; long sync work blocks everything (including rendering).',
      'Async work (timers, network, I/O) is handled by the host (browser Web APIs / Node libuv), which queues callbacks when done.',
      'Loop: run one macrotask, then drain the entire microtask queue, then (browser) render if needed, then repeat.',
      'Microtasks: promise reactions, `queueMicrotask`, `MutationObserver`. Macrotasks: `setTimeout`, `setInterval`, I/O, UI events, `MessageChannel`.',
      'Node specifics: phases (timers, poll, check...), `process.nextTick` runs before promise microtasks, `setImmediate` runs in the check phase.',
    ],
    code: `console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
console.log('D');
// A D C B`,
  },
  {
    id: 'microtask-vs-macrotask',
    group: 'Async & Event Loop',
    stars: 5,
    difficulty: 'Hard',
    q: 'What is the difference between microtasks and macrotasks?',
    a: [
      'Macrotask (task) queue: `setTimeout`, `setInterval`, I/O, UI events, `MessageChannel`, `setImmediate` (Node).',
      'Microtask queue: `.then/.catch/.finally` callbacks, code after `await`, `queueMicrotask`, `MutationObserver`.',
      'After every macrotask (and after the initial script), all microtasks run before the next macrotask or render.',
      'Microtasks queued by microtasks also run in the same drain, so an infinite microtask chain starves rendering and timers.',
      'So a resolved promise callback always runs before a `setTimeout(fn, 0)` queued earlier.',
    ],
  },
  {
    id: 'promises',
    group: 'Async & Event Loop',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is a Promise?',
    a: [
      'An object representing the eventual result of an async operation.',
      'States: `pending`, then settled as either `fulfilled` (value) or `rejected` (reason); once settled it never changes.',
      'The executor `new Promise((resolve, reject) => ...)` runs synchronously; `.then` callbacks always run async as microtasks.',
      '`.then` returns a new promise, enabling chaining; returning a promise inside `.then` waits for it.',
      '`.catch(fn)` = `.then(undefined, fn)`; `.finally` runs on both outcomes and passes the result through.',
      'Solves callback hell and inversion of control; `Promise.withResolvers()` (ES2024) exposes resolve/reject outside.',
    ],
  },
  {
    id: 'async-await',
    group: 'Async & Event Loop',
    stars: 5,
    difficulty: 'Medium',
    q: 'How does `async`/`await` work?',
    a: [
      'Syntactic sugar over promises that makes async code read like sync code.',
      'An `async` function always returns a promise; returned values are wrapped, thrown errors become rejections.',
      '`await` pauses only that function until the promise settles; the rest of the function resumes as a microtask.',
      'Handle errors with `try/catch`/`finally` around `await`.',
      'Top-level `await` is allowed in ES modules.',
      'Gotcha: `await` in a loop runs sequentially; use `Promise.all` for independent work. `forEach` does not await async callbacks.',
    ],
  },
  {
    id: 'promise-combinators',
    group: 'Async & Event Loop',
    stars: 4,
    difficulty: 'Medium',
    q: 'Difference between `Promise.all`, `allSettled`, `race` and `any`?',
    a: [
      '`all`: fulfills with an array of values when all fulfill; rejects as soon as one rejects (fail-fast).',
      '`allSettled`: waits for all; resolves with `{ status, value | reason }` for each; never rejects.',
      '`race`: settles like the first promise to settle, fulfilled or rejected (useful for timeouts).',
      '`any`: fulfills with the first fulfilled value; rejects with `AggregateError` only if all reject.',
      'None of them cancel the remaining promises; they keep running.',
      'Results keep input order, not completion order.',
    ],
  },
  {
    id: 'promise-all-polyfill',
    group: 'Async & Event Loop',
    stars: 4,
    difficulty: 'Hard',
    q: 'Implement `Promise.all`.',
    a: [
      'Return a new promise; track results by index so order matches the input.',
      'Wrap each item with `Promise.resolve` so plain values work.',
      'Resolve when the completed counter equals the input length; reject on the first rejection.',
      'Edge case: empty input resolves immediately with `[]`.',
    ],
    code: `function promiseAll(items) {
  return new Promise((resolve, reject) => {
    const list = [...items], out = [];
    let done = 0;
    if (!list.length) return resolve(out);
    list.forEach((p, i) => Promise.resolve(p).then((v) => {
      out[i] = v;
      if (++done === list.length) resolve(out);
    }, reject));
  });
}`,
  },
  {
    id: 'async-error-handling',
    group: 'Async & Event Loop',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do you handle errors in async code?',
    a: [
      'Promises: `.catch()` at the end of the chain; async/await: `try/catch` around `await`.',
      'A `try/catch` does not catch errors from un-awaited promises or from callbacks run later (e.g. inside `setTimeout`).',
      'Throwing inside a promise executor or `.then` turns into a rejection.',
      'Unhandled rejections: `unhandledrejection` event in browsers; Node crashes the process by default (since v15).',
      'Use `Error` objects (with `{ cause }` from ES2022) rather than throwing strings.',
    ],
  },
  {
    id: 'sequential-vs-parallel-async',
    group: 'Async & Event Loop',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do you run async tasks sequentially vs in parallel?',
    a: [
      'Sequential: `await` inside a `for...of` loop; total time = sum of tasks. Needed when tasks depend on each other.',
      'Parallel: start all, then `await Promise.all(...)`; total time = slowest task.',
      'Limited concurrency: process in batches or use a pool (e.g. `p-limit`) to avoid flooding APIs.',
      '`forEach(async ...)` fires all in parallel and does not wait; nothing after it awaits the results.',
    ],
    code: `// sequential
for (const id of ids) results.push(await fetchUser(id));
// parallel
const users = await Promise.all(ids.map(fetchUser));`,
  },
  {
    id: 'callback-hell',
    group: 'Async & Event Loop',
    stars: 3,
    difficulty: 'Easy',
    q: 'What is callback hell and how do you avoid it?',
    a: [
      'Deeply nested callbacks for sequential async steps (pyramid of doom): hard to read, reuse and handle errors.',
      'Also suffers inversion of control: you trust a third party to call your callback once, with the right args.',
      'Node style uses error-first callbacks `(err, data) => {}`.',
      'Fixes: named functions, Promises, async/await, `util.promisify` for callback APIs.',
    ],
  },
  {
    id: 'settimeout-zero',
    group: 'Async & Event Loop',
    stars: 3,
    difficulty: 'Easy',
    q: 'Does `setTimeout(fn, 0)` run immediately?',
    a: [
      'No. It queues a macrotask that runs after the current call stack and all pending microtasks.',
      'The delay is a minimum, not a guarantee; a busy main thread delays it further.',
      'Browsers clamp nested timers (5+ levels deep) to at least 4ms; background tabs are throttled more.',
      'Used to defer work or yield to the browser; `scheduler.yield()` or `MessageChannel` are more modern alternatives.',
    ],
  },
  {
    id: 'abortcontroller',
    group: 'Async & Event Loop',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do you cancel a fetch request or add a timeout?',
    a: [
      'Create an `AbortController`, pass `controller.signal` to `fetch`, call `controller.abort()` to cancel.',
      'The fetch promise rejects with a DOMException named `AbortError` (or `TimeoutError` for `AbortSignal.timeout`).',
      '`AbortSignal.timeout(ms)` gives a ready-made timeout; `AbortSignal.any([...])` combines signals.',
      'Signals also cancel `addEventListener` (`{ signal }`) and many Node APIs.',
      'Common use: cancel stale requests on input change or component unmount (race conditions).',
    ],
    code: `const ctrl = new AbortController();
fetch('/api', { signal: ctrl.signal })
  .catch((e) => e.name === 'AbortError' && console.log('cancelled'));
ctrl.abort();
// timeout only:
await fetch('/api', { signal: AbortSignal.timeout(5000) });`,
  },
  {
    id: 'generators',
    group: 'Async & Event Loop',
    stars: 3,
    difficulty: 'Medium',
    q: 'What are generator functions?',
    a: [
      '`function*` returns a generator object (an iterator); `yield` pauses execution and produces a value.',
      'Each `next(value)` resumes until the next `yield`; returns `{ value, done }`.',
      'Lazy: values are computed on demand, so infinite sequences are possible.',
      'Uses: custom iterators, lazy pipelines, redux-saga; historically async flow control before async/await.',
      '`return()` and `throw()` let the consumer end or inject an error into the generator.',
    ],
    code: `function* idGen() {
  let id = 1;
  while (true) yield id++;
}
const g = idGen();
g.next().value; // 1
g.next().value; // 2`,
  },
  {
    id: 'async-iterators',
    group: 'Async & Event Loop',
    stars: 1,
    difficulty: 'Hard',
    q: 'What are async iterators and `for await...of`?',
    a: [
      'Async iterables implement `[Symbol.asyncIterator]()` whose `next()` returns a promise of `{ value, done }`.',
      '`for await (const x of source)` awaits each item in order.',
      '`async function*` creates async generators.',
      'Uses: streaming responses, Node streams/readlines, paginated APIs; `Array.fromAsync` (ES2024) collects them.',
    ],
  },

  // ───────────────────────── ES6+ Features ─────────────────────────
  {
    id: 'spread-vs-rest',
    group: 'ES6+ Features',
    stars: 4,
    difficulty: 'Easy',
    q: 'What is the difference between the spread and rest operators?',
    a: [
      'Same `...` syntax, opposite jobs: spread expands, rest collects.',
      'Spread: in calls `fn(...arr)`, array literals `[...a, ...b]` (any iterable) and object literals `{...o}` (own enumerable props).',
      'Rest: in parameters `(...args)` and destructuring `const [first, ...others] = arr`; must be last.',
      'Object spread is a shallow copy; later properties override earlier ones.',
      'Rest params give a real array, unlike `arguments`.',
    ],
  },
  {
    id: 'destructuring',
    group: 'ES6+ Features',
    stars: 4,
    difficulty: 'Easy',
    q: 'Explain array and object destructuring.',
    a: [
      'Array destructuring is positional and works on any iterable: `const [a, , c] = arr`.',
      'Object destructuring is by property name: `const { name, age } = user`.',
      'Rename and default: `const { name: n = "Anon" } = user`; defaults apply only for `undefined`.',
      'Nested patterns and destructuring in function params are common: `function f({ id, ...rest }) {}`.',
      'Swap without temp: `[a, b] = [b, a]`.',
      'Destructuring `null`/`undefined` throws TypeError; guard with a default `= {}`.',
    ],
  },
  {
    id: 'esm-vs-commonjs',
    group: 'ES6+ Features',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is the difference between ES modules and CommonJS?',
    a: [
      'Syntax: ESM `import`/`export`; CJS `require()`/`module.exports`.',
      'ESM imports are static and analysable at build time, enabling tree-shaking; `require` is dynamic and runs at call time.',
      'ESM exports are live read-only bindings; CJS exports are a copied value/object.',
      'ESM is loaded asynchronously, supports top-level await, is strict by default and has top-level `this` = `undefined`.',
      'Node: ESM via `.mjs` or `"type": "module"`; modern Node (20.19+/22.12+) can `require()` sync ESM modules.',
    ],
  },
  {
    id: 'optional-chaining-nullish',
    group: 'ES6+ Features',
    stars: 4,
    difficulty: 'Easy',
    q: 'What are optional chaining (`?.`) and nullish coalescing (`??`)?',
    a: [
      '`a?.b` returns `undefined` instead of throwing when `a` is `null`/`undefined`; also `a?.[key]` and `fn?.()`.',
      'It short-circuits: the rest of the chain is not evaluated.',
      '`a ?? b` returns `b` only when `a` is `null` or `undefined`; `||` falls back on any falsy value (0, "", false).',
      '`??` cannot be mixed with `||`/`&&` without parentheses (SyntaxError).',
      'Logical assignment (ES2021): `x ??= 5`, `x ||= 5`, `x &&= 5`.',
    ],
  },
  {
    id: 'iterators-iterables',
    group: 'ES6+ Features',
    stars: 3,
    difficulty: 'Medium',
    q: 'What are iterables and iterators?',
    a: [
      'Iterable: an object with a `[Symbol.iterator]()` method that returns an iterator.',
      'Iterator: an object with `next()` returning `{ value, done }`.',
      'Consumed by `for...of`, spread, array destructuring, `Array.from`, `Promise.all`, `new Map/Set`.',
      'Built-in iterables: Array, String, Map, Set, TypedArray, `arguments`, NodeList; plain objects are not.',
      'ES2025 iterator helpers add lazy `.map()`, `.filter()`, `.take()`, `.toArray()` directly on iterators.',
    ],
    code: `const range = {
  from: 1, to: 3,
  *[Symbol.iterator]() {
    for (let i = this.from; i <= this.to; i++) yield i;
  },
};
[...range]; // [1, 2, 3]`,
  },
  {
    id: 'proxy-reflect',
    group: 'ES6+ Features',
    stars: 3,
    difficulty: 'Hard',
    q: 'What are `Proxy` and `Reflect`?',
    a: [
      '`new Proxy(target, handler)` wraps an object and intercepts operations via traps: `get`, `set`, `has`, `deleteProperty`, `apply`...',
      '`Reflect` provides the default behaviour for each trap as plain functions (`Reflect.get`, `Reflect.set`).',
      'Uses: validation, default values, logging, negative array indexes, reactivity systems (Vue 3, MobX).',
      'Unlike `defineProperty`, a proxy can see properties added later and deletions.',
      'Proxies add overhead; avoid in hot paths. Private `#fields` are not reachable through a proxy.',
    ],
    code: `const user = new Proxy({}, {
  set(t, key, val) {
    if (key === 'age' && !Number.isInteger(val)) throw new TypeError('age must be an int');
    return Reflect.set(t, key, val);
  },
  get: (t, key) => (key in t ? Reflect.get(t, key) : 'N/A'),
});`,
  },
  {
    id: 'modern-es-features',
    group: 'ES6+ Features',
    stars: 3,
    difficulty: 'Easy',
    q: 'Which recent ECMAScript features (ES2022 onward) should you know?',
    a: [
      'ES2022: `arr.at(-1)`, `Object.hasOwn`, class fields/`#private`/static blocks, top-level await, `Error` `cause`.',
      'ES2023: `findLast`/`findLastIndex`, non-mutating `toSorted`, `toReversed`, `toSpliced`, `with`.',
      'ES2024: `Object.groupBy`/`Map.groupBy`, `Promise.withResolvers`, `Array.fromAsync`, resizable ArrayBuffers.',
      'ES2025: Set methods (`union`, `intersection`, `difference`...), Iterator helpers, `Promise.try`, `RegExp.escape`, JSON modules.',
      'Also widely used: `structuredClone` (a web/Node API, not ECMAScript).',
    ],
  },
  {
    id: 'template-literals',
    group: 'ES6+ Features',
    stars: 2,
    difficulty: 'Easy',
    q: 'What are template literals?',
    a: [
      'Strings in backticks supporting interpolation with `${expr}` and real multi-line text.',
      'Any expression can be interpolated; the result is converted with `String()`.',
      'Tagged templates (`tag` followed by a template) let a function process the parts.',
      '`String.raw` returns the raw text without processing escape sequences.',
    ],
  },
  {
    id: 'symbols',
    group: 'ES6+ Features',
    stars: 2,
    difficulty: 'Medium',
    q: 'What is a `Symbol` and when would you use it?',
    a: [
      'A unique, immutable primitive: `Symbol("desc") !== Symbol("desc")`.',
      'Used as property keys that never collide with other keys (safe metadata on shared objects).',
      'Symbol keys are skipped by `for...in`, `Object.keys` and `JSON.stringify`; read via `Object.getOwnPropertySymbols`.',
      '`Symbol.for("key")` uses a global registry, so the same key returns the same symbol.',
      'Well-known symbols customise behaviour: `Symbol.iterator`, `Symbol.asyncIterator`, `Symbol.toPrimitive`, `Symbol.hasInstance`.',
    ],
  },
  {
    id: 'dynamic-import',
    group: 'ES6+ Features',
    stars: 2,
    difficulty: 'Medium',
    q: 'What is dynamic `import()`?',
    a: [
      '`import(path)` loads a module at runtime and returns a promise of its namespace object.',
      'Works in both ES modules and CommonJS; the path can be computed.',
      'Enables code splitting and lazy loading (bundlers create separate chunks; `React.lazy` builds on it).',
      'Use for heavy, rarely used or conditional features (charts, editors, locale data).',
    ],
  },
  {
    id: 'tagged-templates',
    group: 'ES6+ Features',
    stars: 1,
    difficulty: 'Medium',
    q: 'What are tagged template literals?',
    a: [
      'A function placed before a template literal receives the string parts array and the interpolated values separately.',
      'The strings array also has a `.raw` property with unprocessed escapes.',
      'Uses: HTML escaping, i18n, CSS-in-JS (styled-components), GraphQL (`gql`), SQL query builders with safe params.',
    ],
    code: `function upper(strings, ...vals) {
  return strings.reduce((out, s, i) =>
    out + s + (i < vals.length ? String(vals[i]).toUpperCase() : ''), '');
}
const name = 'ann';
upper\`hi \${name}!\`; // 'hi ANN!'`,
  },

  // ───────────────────────── Arrays & Collections ─────────────────────────
  {
    id: 'map-filter-reduce',
    group: 'Arrays & Collections',
    stars: 5,
    difficulty: 'Easy',
    q: 'Explain `map`, `filter` and `reduce`.',
    a: [
      '`map(cb)` returns a new array of the same length with each element transformed.',
      '`filter(cb)` returns a new array with only elements for which `cb` returns truthy.',
      '`reduce(cb, init)` folds the array into a single value (sum, object, grouped map...).',
      'None of them mutate the original array; all skip holes in sparse arrays.',
      'Always pass an initial value to `reduce`: on an empty array without one it throws TypeError.',
      'Chain them for readable pipelines; for huge arrays a single loop avoids intermediate arrays.',
    ],
    code: `const orders = [{ amt: 50, paid: true }, { amt: 20, paid: false }, { amt: 30, paid: true }];
const total = orders
  .filter((o) => o.paid)
  .map((o) => o.amt)
  .reduce((sum, n) => sum + n, 0); // 80`,
  },
  {
    id: 'array-method-polyfills',
    group: 'Arrays & Collections',
    stars: 4,
    difficulty: 'Medium',
    q: 'Write polyfills for `Array.prototype.map` and `reduce`.',
    a: [
      'Callbacks receive `(element, index, array)`; `map` also accepts a `thisArg`.',
      '`map` returns a new array of the same length and skips holes (`i in this`).',
      '`reduce` without an initial value uses the first element as accumulator and starts at index 1.',
      '`reduce` on an empty array with no initial value must throw TypeError.',
    ],
    code: `Array.prototype.myMap = function (cb, thisArg) {
  const out = new Array(this.length);
  for (let i = 0; i < this.length; i++)
    if (i in this) out[i] = cb.call(thisArg, this[i], i, this);
  return out;
};
Array.prototype.myReduce = function (cb, ...init) {
  if (!this.length && !init.length) throw new TypeError('Reduce of empty array');
  let i = init.length ? 0 : 1, acc = init.length ? init[0] : this[0];
  for (; i < this.length; i++) acc = cb(acc, this[i], i, this);
  return acc;
};`,
  },
  {
    id: 'map-vs-object',
    group: 'Arrays & Collections',
    stars: 4,
    difficulty: 'Medium',
    q: 'When should you use a `Map` instead of a plain object?',
    a: [
      'Map keys can be any type (objects, functions); object keys are only strings or symbols.',
      'Map preserves insertion order for all keys; objects list integer-like keys first in ascending order.',
      'Map has `size`, is directly iterable, and is optimised for frequent additions/deletions.',
      'Plain objects inherit keys like `toString` (unless `Object.create(null)`); Map has no such collisions.',
      'Objects win for fixed-shape records and JSON; Map needs `Object.fromEntries(map)` to serialize.',
    ],
  },
  {
    id: 'remove-duplicates',
    group: 'Arrays & Collections',
    stars: 4,
    difficulty: 'Easy',
    q: 'How do you remove duplicates from an array?',
    a: [
      'Primitives: `[...new Set(arr)]` or `Array.from(new Set(arr))`; O(n).',
      '`arr.filter((x, i) => arr.indexOf(x) === i)` works but is O(n^2).',
      'Set uses SameValueZero: `NaN` equals `NaN`, objects compare by reference.',
      'Objects by key: `[...new Map(arr.map((o) => [o.id, o])).values()]` (keeps the last occurrence).',
    ],
    code: `[...new Set([1, 2, 2, 3, NaN, NaN])]; // [1, 2, 3, NaN]`,
  },
  {
    id: 'flatten-array',
    group: 'Arrays & Collections',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do you flatten a nested array? Implement it.',
    a: [
      'Native: `arr.flat(depth)`; default depth 1, `Infinity` flattens fully. `flatMap` = map then flat(1).',
      'Recursive approach: for each item, recurse if it is an array, otherwise push.',
      'Iterative approach with a stack avoids recursion depth limits for very deep arrays.',
      'Follow-up: flatten a nested object into dotted keys (`{ "a.b.c": 1 }`).',
    ],
    code: `function flatten(arr, depth = Infinity) {
  return depth > 0
    ? arr.reduce((acc, x) =>
        acc.concat(Array.isArray(x) ? flatten(x, depth - 1) : [x]), [])
    : arr.slice();
}
flatten([1, [2, [3, [4]]]]); // [1, 2, 3, 4]`,
  },
  {
    id: 'loops-comparison',
    group: 'Arrays & Collections',
    stars: 3,
    difficulty: 'Easy',
    q: 'Compare `for...in`, `for...of`, `forEach` and `map`.',
    a: [
      '`for...in` iterates enumerable string keys, including inherited ones; meant for objects, not arrays.',
      '`for...of` iterates values of any iterable (arrays, strings, Map, Set); supports `break`, `continue` and `await`.',
      '`forEach` runs a callback per element, returns `undefined`, cannot `break` and does not await async callbacks.',
      '`map` returns a new transformed array; do not use it just for side effects.',
      'Need early exit? Use `for...of`, `some`, `every` or `find`.',
    ],
  },
  {
    id: 'weakmap-weakset',
    group: 'Arrays & Collections',
    stars: 3,
    difficulty: 'Medium',
    q: 'What are `Set`, `WeakMap` and `WeakSet`?',
    a: [
      '`Set` stores unique values (SameValueZero), keeps insertion order; ES2025 adds `union`, `intersection`, `difference`...',
      '`WeakMap`/`WeakSet` hold keys weakly: entries do not prevent garbage collection of the key.',
      'Weak keys must be objects (or non-registered symbols since ES2023).',
      'Not iterable and have no `size`, because contents can vanish at any time.',
      'Uses: private data per object, caching/metadata keyed by DOM nodes or objects without leaks.',
    ],
  },
  {
    id: 'mutating-vs-non-mutating',
    group: 'Arrays & Collections',
    stars: 3,
    difficulty: 'Easy',
    q: 'Which array methods mutate the original array?',
    a: [
      'Mutating: `push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`, `fill`, `copyWithin`.',
      'Non-mutating: `map`, `filter`, `slice`, `concat`, `flat`, `reduce`, `find`, `includes`, `join`.',
      'ES2023 copy versions: `toSorted`, `toReversed`, `toSpliced`, `with(index, value)`.',
      '`slice(start, end)` copies a portion; `splice(start, count, ...items)` edits in place and returns removed items.',
      'Immutability matters for React/Redux state updates and change detection.',
    ],
  },
  {
    id: 'array-sort-gotcha',
    group: 'Arrays & Collections',
    stars: 2,
    difficulty: 'Easy',
    q: 'Why does `[10, 9, 1].sort()` return `[1, 10, 9]`?',
    a: [
      'Without a comparator, `sort` converts elements to strings and compares UTF-16 code units.',
      'Numbers need a comparator: `(a, b) => a - b` ascending, `b - a` descending.',
      'Strings with locale rules: `a.localeCompare(b)` or `Intl.Collator`.',
      '`sort` mutates in place and is stable since ES2019; use `toSorted` for a copy.',
      '`undefined` values are always moved to the end.',
    ],
  },

  // ───────────────────────── DOM & Browser ─────────────────────────
  {
    id: 'event-delegation',
    group: 'DOM & Browser',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is event delegation?',
    a: [
      'Attach one listener to a common ancestor instead of one per child, and use bubbling to handle child events.',
      'Identify the source with `event.target` (often `target.closest(selector)`).',
      'Benefits: fewer listeners (memory), works for elements added later, simpler cleanup.',
      'Limits: events that do not bubble (`focus`, `blur`, `mouseenter`) need `focusin`/`focusout` or capture.',
      'React historically used delegation at the root (now on the root container since React 17).',
    ],
    code: `document.querySelector('#list').addEventListener('click', (e) => {
  const item = e.target.closest('li');
  if (!item || !e.currentTarget.contains(item)) return;
  console.log('clicked', item.dataset.id);
});`,
  },
  {
    id: 'event-bubbling-capturing',
    group: 'DOM & Browser',
    stars: 5,
    difficulty: 'Medium',
    q: 'Explain event bubbling and capturing.',
    a: [
      'Events propagate in three phases: capture (window down to target), target, bubble (target back up to window).',
      'Listeners run in the bubble phase by default; pass `{ capture: true }` (or `true`) to run during capture.',
      '`event.target` = element that triggered the event; `event.currentTarget` = element whose listener is running.',
      '`stopPropagation()` stops further propagation; `stopImmediatePropagation()` also skips other listeners on the same element.',
      'Some events do not bubble: `focus`, `blur`, `mouseenter`, `mouseleave`, `load`.',
    ],
  },
  {
    id: 'web-storage-cookies',
    group: 'DOM & Browser',
    stars: 4,
    difficulty: 'Easy',
    q: 'Compare `localStorage`, `sessionStorage` and cookies.',
    a: [
      '`localStorage`: ~5MB per origin, persists until cleared, shared across tabs of the same origin.',
      '`sessionStorage`: ~5MB, scoped to one tab and cleared when it closes.',
      'Cookies: ~4KB, sent with every matching HTTP request, can expire, readable by the server.',
      'Cookie flags: `HttpOnly` (no JS access), `Secure` (HTTPS only), `SameSite` (CSRF protection).',
      'Web Storage is synchronous and string-only; use IndexedDB for large or structured data.',
      'Do not store auth tokens in `localStorage`: any XSS can read it; prefer HttpOnly cookies.',
    ],
  },
  {
    id: 'cors',
    group: 'DOM & Browser',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is CORS?',
    a: [
      'The same-origin policy blocks scripts from reading cross-origin responses (origin = scheme + host + port).',
      'CORS lets a server opt in with headers like `Access-Control-Allow-Origin`.',
      'Non-simple requests (e.g. PUT/DELETE, JSON content type, custom headers) trigger an OPTIONS preflight first.',
      'Credentials (cookies) need `credentials: "include"`, `Access-Control-Allow-Credentials: true` and an explicit origin, not `*`.',
      'CORS is enforced by browsers only; it is not server-side security (curl/Postman ignore it).',
      'Fix CORS errors on the server or via a proxy, not in frontend code.',
    ],
  },
  {
    id: 'script-async-defer',
    group: 'DOM & Browser',
    stars: 4,
    difficulty: 'Easy',
    q: 'What is the difference between `<script>`, `async` and `defer`?',
    a: [
      'Plain `<script>`: HTML parsing stops while the script downloads and executes.',
      '`async`: downloads in parallel, executes as soon as it is ready (may interrupt parsing), order not guaranteed.',
      '`defer`: downloads in parallel, executes in order after parsing finishes, before `DOMContentLoaded`.',
      'Use `defer` for app scripts that need the DOM; `async` for independent scripts like analytics.',
      '`type="module"` scripts are deferred by default.',
    ],
  },
  {
    id: 'preventdefault-stoppropagation',
    group: 'DOM & Browser',
    stars: 3,
    difficulty: 'Easy',
    q: 'What is the difference between `preventDefault` and `stopPropagation`?',
    a: [
      '`preventDefault()` cancels the browser\'s default action (form submit, link navigation, checkbox toggle).',
      '`stopPropagation()` stops the event travelling to other elements but the default action still happens.',
      '`stopImmediatePropagation()` also prevents remaining listeners on the same element.',
      'Listeners registered with `{ passive: true }` cannot call `preventDefault` (improves scroll performance).',
      'In jQuery `return false` does both; in plain `addEventListener` it does nothing.',
    ],
  },
  {
    id: 'reflow-repaint',
    group: 'DOM & Browser',
    stars: 3,
    difficulty: 'Medium',
    q: 'What are reflow and repaint?',
    a: [
      'Rendering pipeline: style, layout (reflow), paint (repaint), composite.',
      'Reflow recalculates geometry (size/position) and is the most expensive; triggered by DOM or layout-affecting style changes.',
      'Repaint redraws pixels without layout changes (e.g. colour, visibility).',
      'Layout thrashing: alternating DOM writes and layout reads (`offsetHeight`, `getBoundingClientRect`) forces sync reflows.',
      'Fixes: batch reads then writes, use `requestAnimationFrame`, animate `transform`/`opacity` (compositor-only), use `DocumentFragment`.',
    ],
  },
  {
    id: 'web-workers',
    group: 'DOM & Browser',
    stars: 3,
    difficulty: 'Medium',
    q: 'What are Web Workers and Service Workers?',
    a: [
      'Web Workers run JS on a background thread so CPU-heavy work does not block the UI.',
      'Workers have no DOM access; they talk to the main thread with `postMessage` (structured clone) or transferables.',
      'Shared Workers can be used by multiple tabs of the same origin.',
      'Service Workers act as a network proxy: offline caching, push notifications, background sync (the basis of PWAs).',
    ],
  },
  {
    id: 'intersection-observer',
    group: 'DOM & Browser',
    stars: 2,
    difficulty: 'Medium',
    q: 'What is `IntersectionObserver` used for?',
    a: [
      'Asynchronously reports when an element enters/leaves the viewport (or a root element) by a threshold.',
      'Uses: lazy-loading images, infinite scroll, scroll-triggered animations, ad viewability.',
      'Far cheaper than scroll listeners with `getBoundingClientRect`, which run on the main thread constantly.',
      'For images, native `loading="lazy"` often suffices. Related: `ResizeObserver`, `MutationObserver`.',
    ],
  },
  {
    id: 'xss-csrf',
    group: 'DOM & Browser',
    stars: 2,
    difficulty: 'Medium',
    q: 'What are XSS and CSRF and how do you prevent them?',
    a: [
      'XSS: attacker-controlled script runs in your page (e.g. unsanitised input inserted via `innerHTML`).',
      'Prevent XSS: use `textContent`, escape output, sanitise HTML (DOMPurify), set a Content-Security-Policy, HttpOnly cookies.',
      'CSRF: a malicious site makes the browser send an authenticated request using the user\'s cookies.',
      'Prevent CSRF: `SameSite=Lax/Strict` cookies, CSRF tokens, checking `Origin` headers.',
    ],
  },

  // ───────────────────────── Performance & Patterns ─────────────────────────
  {
    id: 'debounce',
    group: 'Performance & Patterns',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is debouncing? Implement `debounce`.',
    a: [
      'Debounce delays running a function until it has not been called for `delay` ms; bursts collapse into one call.',
      'Uses: search-as-you-type, autosave, window resize end, form validation.',
      'Implementation: keep a timer in a closure; clear and restart it on every call.',
      'Preserve `this` and arguments with `fn.apply(this, args)` (use a regular function wrapper).',
      'Variants: leading-edge execution, `cancel()`/`flush()` methods, `maxWait` (lodash).',
    ],
    code: `function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
input.addEventListener('input', debounce(search, 300));`,
  },
  {
    id: 'throttle',
    group: 'Performance & Patterns',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is throttling? Implement `throttle` and compare it with debounce.',
    a: [
      'Throttle runs a function at most once every `interval` ms, no matter how often it is called.',
      'Uses: scroll/resize handlers, mousemove, rate-limiting API calls, game input.',
      'Debounce waits for a pause (runs once after the burst); throttle runs regularly during the burst.',
      'Timestamp version (below) fires on the leading edge; a timer version can also fire a trailing call.',
      'For visual updates, `requestAnimationFrame` is a natural throttle to the frame rate.',
    ],
    code: `function throttle(fn, interval) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= interval) {
      last = now;
      fn.apply(this, args);
    }
  };
}`,
  },
  {
    id: 'memoization',
    group: 'Performance & Patterns',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is memoization? Implement `memoize`.',
    a: [
      'Caching the results of a pure function keyed by its arguments, trading memory for speed.',
      'Only correct for pure functions (same input, same output, no side effects).',
      'Key choice: a single primitive arg can be the key; multiple args often use `JSON.stringify` (slow, loses types).',
      'Unbounded caches leak memory: use LRU limits or a `WeakMap` for object keys.',
      'Related: `React.memo`, `useMemo`, dynamic programming (memoized recursion, e.g. Fibonacci).',
    ],
    code: `function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (!cache.has(key)) cache.set(key, fn.apply(this, args));
    return cache.get(key);
  };
}`,
  },
  {
    id: 'observer-pubsub',
    group: 'Performance & Patterns',
    stars: 4,
    difficulty: 'Medium',
    q: 'Implement an event emitter (observer / pub-sub pattern).',
    a: [
      'Observer: subjects keep a list of subscribers and notify them on change.',
      'Pub/sub adds a broker/channel so publishers and subscribers do not know each other.',
      'API: `on(event, fn)`, `off(event, fn)`, `emit(event, ...args)`, often `once`.',
      'Return an unsubscribe function to avoid leaks.',
      'Real examples: DOM events, Node `EventEmitter`, Redux store subscriptions, RxJS.',
    ],
    code: `class Emitter {
  #events = new Map();
  on(name, fn) {
    if (!this.#events.has(name)) this.#events.set(name, new Set());
    this.#events.get(name).add(fn);
    return () => this.#events.get(name).delete(fn);
  }
  emit(name, ...args) {
    this.#events.get(name)?.forEach((fn) => fn(...args));
  }
}`,
  },
  {
    id: 'garbage-collection-leaks',
    group: 'Performance & Patterns',
    stars: 3,
    difficulty: 'Medium',
    q: 'How does garbage collection work in JS and what causes memory leaks?',
    a: [
      'Mark-and-sweep: objects reachable from roots (globals, stack, closures) survive; the rest is freed.',
      'Circular references are not a problem for mark-and-sweep (unlike reference counting).',
      'V8 is generational: short-lived objects are collected quickly in the young generation.',
      'Common leaks: accidental globals, forgotten timers/intervals, unremoved listeners, detached DOM nodes, unbounded caches, closures holding big data.',
      'Debug with DevTools heap snapshots / allocation timelines; use `WeakMap`/`WeakRef` for caches.',
    ],
  },
  {
    id: 'lazy-loading-code-splitting',
    group: 'Performance & Patterns',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do lazy loading and code splitting improve performance?',
    a: [
      'Code splitting breaks the bundle into chunks so users download only what the current page needs.',
      'Implemented with dynamic `import()`; bundlers (Vite, webpack, Next.js) create chunks automatically.',
      'Lazy loading defers non-critical resources: routes, modals, images (`loading="lazy"`), below-the-fold content.',
      'Improves initial load metrics (LCP, TTI, Total Blocking Time).',
      'Pair with prefetching on hover/idle to hide the delay when the user does need it.',
    ],
  },
  {
    id: 'singleton-factory',
    group: 'Performance & Patterns',
    stars: 2,
    difficulty: 'Easy',
    q: 'Explain the Singleton and Factory patterns in JavaScript.',
    a: [
      'Singleton: exactly one instance shared app-wide (config, DB connection, logger).',
      'ES modules are evaluated once and cached, so exporting an instance is a natural singleton.',
      'Factory: a function that creates and returns objects without `new`, hiding construction details.',
      'Factories plus closures give private state without classes.',
      'Drawback of singletons: hidden global state that makes testing harder.',
    ],
  },
  {
    id: 'requestanimationframe',
    group: 'Performance & Patterns',
    stars: 1,
    difficulty: 'Medium',
    q: 'What is `requestAnimationFrame` and why use it over `setInterval`?',
    a: [
      'Schedules a callback right before the next repaint, matching the display refresh rate.',
      'Receives a high-resolution timestamp; base animations on elapsed time, not frame count.',
      'Paused in background tabs, saving CPU/battery; `setInterval` can drift and cause jank.',
      'Cancel with `cancelAnimationFrame(id)`; call it again inside the callback for continuous animation.',
    ],
  },

  // ───────────────────────── Output-based Questions ─────────────────────────
  {
    id: 'output-event-loop-order',
    group: 'Output-based Questions',
    stars: 5,
    difficulty: 'Hard',
    q: 'What is the output order? (sync, microtasks, macrotasks, async/await)',
    a: [
      'Order: all synchronous code first, then all microtasks, then the next macrotask.',
      '`async` function body runs synchronously until the first `await`; the rest resumes as a microtask.',
      'Promise executors run synchronously; `.then` callbacks are microtasks.',
      'Output: 1, 4, 6, 3, 5, 7, 2.',
    ],
    code: `console.log(1);
setTimeout(() => console.log(2), 0);
Promise.resolve().then(() => console.log(3));
async function run() { console.log(4); await null; console.log(5); }
run();
new Promise((res) => { console.log(6); res(); }).then(() => console.log(7));
// 1 4 6 3 5 7 2`,
  },
  {
    id: 'output-hoisting',
    group: 'Output-based Questions',
    stars: 4,
    difficulty: 'Medium',
    q: 'What does this hoisting snippet print?',
    a: [
      '`var` declarations are hoisted and initialised to `undefined`.',
      'Function declarations are hoisted with their body; function expressions are not.',
      'Calling a `var` that holds a not-yet-assigned function expression throws TypeError, not ReferenceError.',
      'A function declaration and a `var` with the same name: the function wins at hoist time until the var is assigned.',
    ],
    code: `console.log(a);   // undefined
var a = 1;
console.log(foo()); // 'foo'
function foo() { return 'foo'; }
console.log(typeof baz); // 'function'
var baz = 1;
function baz() {}
bar();            // TypeError: bar is not a function
var bar = function () {};`,
  },
  {
    id: 'output-this',
    group: 'Output-based Questions',
    stars: 4,
    difficulty: 'Medium',
    q: 'What does this `this` snippet print?',
    a: [
      'Method call `obj.regular()`: `this` is `obj`.',
      'Arrow function as a property: `this` comes from the surrounding scope, not the object.',
      'Arrow inside a method inherits the method\'s `this`.',
      'Detached method called plainly: `this` is `undefined` in strict mode/modules, so property access throws.',
    ],
    code: `const obj = {
  name: 'obj',
  regular() { return this.name; },
  arrow: () => typeof this,
  nested() { return [1].map(() => this.name)[0]; },
};
obj.regular(); // 'obj'
obj.arrow();   // 'undefined' (ES module top-level this)
obj.nested();  // 'obj'
const f = obj.regular;
f();           // TypeError (this is undefined)`,
  },
  {
    id: 'output-coercion',
    group: 'Output-based Questions',
    stars: 3,
    difficulty: 'Medium',
    q: 'Predict the output of these coercion expressions.',
    a: [
      '`+` with an object/array converts it to a primitive string first, so it becomes concatenation.',
      'Other arithmetic operators convert to numbers.',
      '`[] == ![]`: `![]` is false, then both sides become 0, so true.',
      '`null` converts to 0 in relational comparisons but `null == 0` is false (special `==` rule).',
    ],
    code: `[] + [];        // ''
[] + {};        // '[object Object]'
'5' + 2;        // '52'
'5' - 2;        // 3
true + 1;       // 2
[] == ![];      // true
null == 0;      // false
null >= 0;      // true`,
  },
  {
    id: 'output-promise-chain',
    group: 'Output-based Questions',
    stars: 3,
    difficulty: 'Hard',
    q: 'What does this promise chain print?',
    a: [
      'A thrown error skips all following `.then` handlers until a `.catch`.',
      '`.catch` returning a value recovers the chain: the next `.then` receives that value.',
      '`.finally` receives no argument and passes the previous result through.',
      'Output: boom, 5, done.',
    ],
    code: `Promise.resolve(1)
  .then((x) => x + 1)
  .then(() => { throw new Error('boom'); })
  .then(() => console.log('skipped'))
  .catch((e) => { console.log(e.message); return 5; })
  .then((x) => console.log(x))
  .finally(() => console.log('done'));`,
  },
  {
    id: 'output-array-quirks',
    group: 'Output-based Questions',
    stars: 1,
    difficulty: 'Medium',
    q: 'Predict the output of these array quirks.',
    a: [
      '`map(parseInt)` passes `(value, index)`, so the index becomes the radix: `parseInt("2", 1)` and `parseInt("3", 2)` are NaN.',
      'Assigning past the end creates a sparse array; `length` becomes last index + 1.',
      'Setting `length` smaller truncates the array.',
      'Trailing commas do not add elements: `[,,,].length` is 3.',
    ],
    code: `['1', '2', '3'].map(parseInt); // [1, NaN, NaN]
const a = [1, 2, 3];
a[10] = 4;
a.length;       // 11
a.length = 1;
a;              // [1]
[,,,].length;   // 3`,
  },
];

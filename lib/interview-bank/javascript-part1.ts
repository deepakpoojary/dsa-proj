import type { BankQuestion } from './types';

export const JAVASCRIPT_1: BankQuestion[] = [
  // ───────────────────────── Basics & Types ─────────────────────────
  {
    id: 'var-let-const',
    group: 'Basics & Types',
    stars: 5,
    difficulty: 'Easy',
    q: 'What are the differences between `var`, `let` and `const`?',
    a: [
      '# ELI5',
      'Imagine three kinds of boxes for storing toys. The `var` box is an old box that leaks: toys put in it inside one room can be seen from the whole house.',
      'The `let` box stays inside the room where you opened it, and you can swap the toy inside whenever you want.',
      'The `const` box also stays in its room, but once you put a toy in it you glue the lid shut: you cannot swap the toy for a different one.',
      'Mapping back: the "room" is a block of code (anything between `{` and `}`), and the "toy" is the value the variable holds.',
      '# What it is',
      'All three keywords declare a variable, which is a named slot that holds a value.',
      'Scope means "the region of code where a name can be seen". `var` is function-scoped (visible in the whole function), while `let` and `const` are block-scoped (visible only inside the nearest `{ }`).',
      'Hoisting means the engine registers declarations before running the code. `var` is hoisted and set to `undefined`; `let`/`const` are hoisted but left uninitialised until their line runs.',
      'The Temporal Dead Zone (TDZ) is the time between entering a block and reaching the `let`/`const` line. Touching the variable during that time throws a `ReferenceError`.',
      'Comparison, row by row:',
      '  Scope: `var` = function; `let` = block; `const` = block.',
      '  Read before declaration: `var` = `undefined`; `let`/`const` = `ReferenceError` (TDZ).',
      '  Redeclare in same scope: `var` = allowed; `let`/`const` = `SyntaxError`.',
      '  Reassign: `var` = yes; `let` = yes; `const` = no (`TypeError`).',
      '  Must initialise on declaration: only `const`.',
      '  Top-level in a classic browser script creates a `window` property: only `var`.',
      '`const` freezes the binding (which value the name points to), not the value itself. A `const` object or array can still have its contents changed.',
      '# How it works',
      'When the engine enters a scope, it first runs a "creation phase":',
      '  It finds every `var` and creates it with the value `undefined` in the enclosing function.',
      '  It finds every `let`/`const` and creates them in the current block, but marks them "uninitialised".',
      'Then it runs the code line by line (the "execution phase"):',
      '  When it reaches `let x = 1`, the variable leaves the TDZ and gets its value.',
      '  When it reaches `const y = 2`, the binding is locked to that value for good.',
      'When the block ends, `let`/`const` variables from that block are no longer reachable; `var` ones live until the function ends.',
      '# Example walkthrough',
      'Inside `if (true)`, we declare `var a`, `let b` and `const c`.',
      'After the block, `a` prints `1` because `var` ignores the block and belongs to the whole function.',
      '`typeof b` prints `"undefined"` because `b` does not exist outside the block (`typeof` is safe on undeclared names).',
      '`user.name = "Bob"` works because we change the object, not the `const` binding. `user = {}` throws a `TypeError`.',
      '`count` is a `let`, so `count = count + 1` is allowed and prints `1`.',
      '# Why it matters / when to use',
      'Block scoping prevents bugs where a loop counter or temp variable leaks and gets overwritten elsewhere in a large backend handler.',
      'Using `const` by default signals "this never gets reassigned", which makes code easier to read and review.',
      'Rule of thumb: use `const` by default, `let` when you must reassign (counters, accumulators), and avoid `var` in modern code.',
      '# Common mistakes',
      'Thinking `const` makes objects immutable. Fix: use `Object.freeze(obj)` if you truly need a read-only object.',
      'Using `var` in a loop with callbacks, so every callback sees the final value. Fix: use `let`, which creates a new binding per iteration.',
      'Reading a `let` variable before its line and getting a `ReferenceError`. Fix: declare variables at the top of the block before using them.',
      '# Say this in the interview',
      '"`var` is function-scoped, hoisted with the value `undefined`, and can be redeclared. `let` and `const` are block-scoped, sit in the Temporal Dead Zone until declared, and cannot be redeclared. `const` also cannot be reassigned, though an object it points to can still be mutated. I default to `const`, use `let` when I need to reassign, and avoid `var`."',
      'Follow-up: Can you change a `const` array?',
      '  Yes, `arr.push(4)` works because the array is mutated, but `arr = []` throws because that reassigns the binding.',
      'Follow-up: Why does `let` fix the loop + `setTimeout` bug?',
      '  Because `let` in a `for` loop creates a fresh binding for every iteration, so each callback captures its own value.',
    ],
    code: `function demo() {
  if (true) {
    var a = 1;   // function-scoped: leaks out of the if-block
    let b = 2;   // block-scoped: only lives inside { }
    const c = 3; // block-scoped and cannot be reassigned
  }
  console.log(a);        // → 1
  console.log(typeof b); // → "undefined" (b does not exist here)
}
demo();

const user = { name: "Ann" };
user.name = "Bob";       // OK: mutating the object, not the binding
console.log(user.name);  // → "Bob"

try {
  user = {};             // reassigning a const binding
} catch (e) {
  console.log(e.name);   // → "TypeError"
}

let count = 0;
count = count + 1;       // let can be reassigned
console.log(count);      // → 1`,
  },
  {
    id: 'hoisting',
    group: 'Basics & Types',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is hoisting?',
    a: [
      '# ELI5',
      'Before a teacher starts a class, she reads the attendance list so she knows every student name, even those who have not walked in yet.',
      'Some students (function declarations) are already sitting in their seats, ready to answer.',
      'Some (`var`) are on the list but their seat is empty, so if you call them you get silence (`undefined`).',
      'Some (`let`/`const`) are on the list with a "do not call yet" sign; calling them early gets you told off (an error).',
      'Mapping back: the attendance pass is the engine scanning declarations before running code; this is hoisting.',
      '# What it is',
      'Hoisting is JavaScript registering all declarations in a scope before executing any line of that scope.',
      'It feels as if declarations were "moved to the top", but nothing actually moves: the engine just knows about the names early.',
      'A scope is a region of code that owns its own variables: a function body, a block `{ }`, a module, or the global level.',
      'What gets hoisted and how:',
      '  Function declarations (`function greet() {}`): name and body both hoisted, so you can call them before their line.',
      '  `var`: name hoisted and set to `undefined`.',
      '  `let`, `const`, `class`: name hoisted but uninitialised; accessing it early throws `ReferenceError` (the Temporal Dead Zone).',
      '  Function expressions (`const f = function () {}`) and arrow functions: follow the rules of the variable (`var`/`let`/`const`) they are stored in.',
      '  `import` statements: hoisted, because modules are linked before any module code runs.',
      '# How it works',
      'Every time the engine enters a scope it creates an execution context, which is an internal record of the variables and `this` for that scope.',
      'Creation phase (before any code runs):',
      '  Scan for function declarations and store the full function.',
      '  Scan for `var` declarations and store them as `undefined`.',
      '  Scan for `let`/`const`/`class` and store them as uninitialised.',
      'Execution phase: run the code top to bottom, assigning values as each line is reached.',
      'Only declarations are hoisted, never assignments. `var x = 5` hoists `var x` but the `= 5` stays on its line.',
      '# Example walkthrough',
      '`console.log(a)` prints `undefined`: `a` exists from the creation phase but has not been assigned yet.',
      '`greet()` prints `"hi"`: the whole function was stored during the creation phase.',
      '`sayBye()` throws `TypeError` because `var sayBye` is `undefined` at that moment, and you cannot call `undefined`.',
      'Reading `b` throws `ReferenceError` because `let b` is in the TDZ until its line; after the line it prints `2`.',
      '# Why it matters / when to use',
      'It explains confusing `undefined` values and errors in real code, especially in older codebases using `var`.',
      'It lets you organise files with helper function declarations at the bottom and the main logic at the top.',
      'Understanding the TDZ helps you read errors like "Cannot access X before initialization" in Node services, often caused by circular imports.',
      '# Common mistakes',
      'Believing `let`/`const` are not hoisted. They are, but they are uninitialised; that is why you get a TDZ error instead of reading an outer variable with the same name.',
      'Calling a function expression before its line. Fix: use a function declaration, or move the call below the assignment.',
      'Assuming the assignment is hoisted too. Only the declaration is; the value arrives when the line runs.',
      '# Say this in the interview',
      '"Hoisting is the engine registering declarations in a scope before running it. Function declarations are hoisted fully, so they can be called early. `var` is hoisted as `undefined`, while `let`, `const` and `class` are hoisted but stay in the Temporal Dead Zone, so reading them early throws a ReferenceError. Only declarations are hoisted, never assignments."',
      'Follow-up: Are arrow functions hoisted?',
      '  They follow their variable: `const fn = () => {}` is in the TDZ before its line, so calling it early throws.',
      'Follow-up: What does "Cannot access X before initialization" mean?',
      '  You touched a `let`/`const`/`class` while it was still in the TDZ.',
    ],
    code: `console.log(a);        // → undefined (var hoisted, value not yet assigned)
var a = 1;

greet();               // → "hi" (declaration hoisted with its body)
function greet() {
  console.log("hi");
}

try {
  sayBye();            // var sayBye is undefined right now
} catch (e) {
  console.log(e.name); // → "TypeError"
}
var sayBye = function () {
  console.log("bye");
};

try {
  console.log(b);      // b is in the Temporal Dead Zone
} catch (e) {
  console.log(e.name); // → "ReferenceError"
}
let b = 2;
console.log(b);        // → 2`,
  },
  {
    id: 'double-vs-triple-equals',
    group: 'Basics & Types',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is the difference between `==`, `===` and `Object.is`?',
    a: [
      '# ELI5',
      'Imagine checking if two fruits are "the same". A relaxed friend (`==`) says a picture of an apple and a real apple are the same because they both "mean apple".',
      'A strict friend (`===`) says they must be the same kind of thing AND look the same: a picture is not a real apple.',
      'A super-precise scientist (`Object.is`) is like the strict friend but handles two weird edge cases differently.',
      'Mapping back: `==` converts types before comparing, `===` never converts, and `Object.is` is `===` with fixes for `NaN` and `-0`.',
      '# What it is',
      '`==` is loose equality. If the two values have different types, it first converts (coerces) one or both to a common type, then compares.',
      '`===` is strict equality. If the types differ, the answer is `false` straight away; no conversion happens.',
      '`Object.is(a, b)` is "same value" equality. It works like `===` except for two cases.',
      '`NaN` means "Not a Number", a special number value produced by bad math like `0 / 0`. `-0` is negative zero, which exists in floating-point math.',
      'Comparison, row by row:',
      '  `0` vs `"0"`: `==` true (string converted to number); `===` false; `Object.is` false.',
      '  `NaN` vs `NaN`: `==` false; `===` false; `Object.is` true.',
      '  `0` vs `-0`: `==` true; `===` true; `Object.is` false.',
      '  `null` vs `undefined`: `==` true; `===` false; `Object.is` false.',
      'Objects, arrays and functions are compared by reference (which object in memory) with all three: two separate `{}` are never equal.',
      '# How it works',
      'For `===`:',
      '  If types differ, return `false`.',
      '  If both are numbers: `NaN` is never equal to anything, and `+0` equals `-0`.',
      '  If both are objects: equal only if they are the exact same object in memory.',
      'For `==` (simplified):',
      '  If types match, behave like `===`.',
      '  `null` and `undefined` are equal to each other and to nothing else.',
      '  Number vs string: convert the string to a number.',
      '  Boolean vs anything: convert the boolean to a number (`true` is 1, `false` is 0) first.',
      '  Object vs primitive: convert the object to a primitive (via `valueOf`/`toString`) and try again.',
      '# Example walkthrough',
      '`0 == "0"` is `true` because `"0"` becomes the number `0`.',
      '`"" == 0` is `true` because an empty string converts to `0`, a classic surprise.',
      '`false == "0"` is `true`: `false` becomes `0`, `"0"` becomes `0`.',
      '`[] == false` is `true`: `[]` becomes `""`, which becomes `0`, and `false` becomes `0`.',
      '`Object.is(NaN, NaN)` is `true`, while `NaN === NaN` is `false`.',
      'Two objects `a` and `b` with the same content are not `===` because they live in different places in memory.',
      '# Why it matters / when to use',
      'Backend input (query strings, form bodies, env vars) arrives as strings. `==` can make `"0"` equal `0` or `false` and hide bugs.',
      'Use `===` everywhere. The one common, accepted exception is `value == null`, which checks for both `null` and `undefined` in one go.',
      '`Object.is` is used by libraries (for example React state comparisons) where `NaN` and `-0` must be treated precisely.',
      '# Common mistakes',
      'Using `==` and getting surprises like `"" == 0`. Fix: use `===` and convert explicitly with `Number(x)` when you mean to.',
      'Checking `x === NaN`, which is always false. Fix: use `Number.isNaN(x)`.',
      'Comparing two objects with `===` and expecting true when they "look the same". Fix: compare fields, or use a deep-equal helper.',
      '# Say this in the interview',
      '"`==` performs type coercion before comparing, which leads to surprises like an empty string being loosely equal to 0. `===` compares type and value without coercion. `Object.is` is like `===` but treats `NaN` as equal to itself and distinguishes `+0` from `-0`. I always use `===`, except `x == null` to catch both null and undefined."',
      'Follow-up: Why is `null == 0` false?',
      '  Because `null` is only loosely equal to `undefined`; the `==` algorithm does not convert `null` to a number for equality.',
      'Follow-up: How are objects compared?',
      '  By reference: `===` is true only if both sides point to the same object in memory.',
    ],
    code: `console.log(0 == "0");            // → true  (string coerced to number)
console.log(0 === "0");           // → false (different types)
console.log("" == 0);             // → true  ("" becomes 0)
console.log(false == "0");        // → true  (both become 0)
console.log([] == false);         // → true  ([] -> "" -> 0)

console.log(NaN === NaN);         // → false (NaN equals nothing)
console.log(Object.is(NaN, NaN)); // → true
console.log(0 === -0);            // → true
console.log(Object.is(0, -0));    // → false

console.log(null == undefined);   // → true
console.log(null === undefined);  // → false
console.log(null == 0);           // → false

const a = { x: 1 };
const b = { x: 1 };
console.log(a === b);             // → false (different objects)
console.log(a === a);             // → true  (same reference)

// The accepted shortcut: checks null OR undefined
let input;
console.log(input == null);       // → true`,
  },
  {
    id: 'data-types',
    group: 'Basics & Types',
    stars: 4,
    difficulty: 'Easy',
    q: 'What are the data types in JavaScript?',
    a: [
      '# ELI5',
      'Think of a toy shop with shelves. Seven shelves hold simple, single items: a number block, a word card, a yes/no coin, an "empty on purpose" sign, a "not filled in" sticker, a giant number block, and a one-of-a-kind name tag.',
      'The eighth shelf holds containers: bags that can carry any mix of the other items, even other bags.',
      'Simple items can never be changed, only replaced; containers can be opened and their contents rearranged.',
      'Mapping back: the seven simple shelves are the primitive types and the container shelf is the object type.',
      '# What it is',
      'A data type tells the engine what kind of value something is and what you can do with it.',
      'JavaScript is dynamically typed: variables do not have types, values do. The same variable can hold a number now and a string later.',
      'There are 8 types: 7 primitives and 1 object type.',
      'A primitive is a simple, immutable value (it cannot be changed in place) with no methods of its own:',
      '  `number`: all regular numbers, integers and decimals, stored as 64-bit floating point. Includes `NaN`, `Infinity` and `-0`.',
      '  `bigint`: whole numbers of any size, written with an `n` suffix, like `123n`.',
      '  `string`: text, like `"hello"`.',
      '  `boolean`: `true` or `false`.',
      '  `undefined`: "no value has been assigned yet".',
      '  `null`: "intentionally empty", set on purpose by the programmer.',
      '  `symbol`: a guaranteed-unique identifier, created with `Symbol("desc")`, often used as hidden object keys.',
      '`object`: a mutable collection of key-value pairs. Arrays, functions, dates, maps, sets, regexes and class instances are all objects underneath.',
      '# How it works',
      'Primitives are copied by value: copying a primitive gives you an independent copy.',
      'Objects are stored on the heap (a big memory area), and variables hold a reference (an address) to them.',
      'When you call a method on a primitive, like `"hi".toUpperCase()`:',
      '  The engine briefly wraps the primitive in a wrapper object (`String`, `Number`, `Boolean`, ...).',
      '  It calls the method on that wrapper.',
      '  It throws the wrapper away; the original primitive never changes.',
      'You can check types with `typeof`, `Array.isArray` (for arrays) and `x === null` (because `typeof null` is a famous bug that returns `"object"`).',
      '# Example walkthrough',
      'Each `typeof` line prints the type name: `"number"`, `"bigint"`, `"string"`, `"boolean"`, `"undefined"`, `"symbol"`.',
      '`typeof null` prints `"object"`: a historic bug that cannot be fixed without breaking the web.',
      '`typeof []` prints `"object"`, so use `Array.isArray([])` which prints `true`.',
      '`typeof function () {}` prints `"function"`, even though functions are technically objects.',
      '`s.toUpperCase()` returns `"HI"` but `s` itself stays `"hi"`, showing strings are immutable.',
      'The last two lines show that a `number` loses precision above 2^53, while `bigint` stays exact.',
      '# Why it matters / when to use',
      'Validating API input: you must know whether `req.query.page` is a string or a number before using it.',
      'Money and IDs: large database IDs (over 2^53) lose precision as `number`; use `bigint` or keep them as strings.',
      'Choosing `null` vs `undefined` in API responses affects how JSON is serialised (`undefined` fields are dropped by `JSON.stringify`).',
      '# Common mistakes',
      'Assuming arrays have their own type. Fix: use `Array.isArray(x)`.',
      'Mixing `bigint` and `number` in math (`1n + 1` throws `TypeError`). Fix: convert one side explicitly with `BigInt(x)` or `Number(x)`.',
      'Forgetting that numbers are floating point, so `0.1 + 0.2` is not exactly `0.3`. Fix: work in integer cents or use a decimal library for money.',
      '# Say this in the interview',
      '"JavaScript has 8 types: seven primitives (number, bigint, string, boolean, undefined, null and symbol) and object. Primitives are immutable and copied by value, while objects, including arrays and functions, are mutable and handled by reference. The language is dynamically typed, so types belong to values, not variables."',
      'Follow-up: Why does `typeof null` return "object"?',
      '  It is a bug from the very first implementation that was kept for backwards compatibility; check with `x === null` instead.',
      'Follow-up: Is an array a separate type?',
      '  No, it is a special object with numeric keys and a `length` property; detect it with `Array.isArray`.',
    ],
    code: `console.log(typeof 42);             // → "number"
console.log(typeof 42n);            // → "bigint"
console.log(typeof "hi");           // → "string"
console.log(typeof true);           // → "boolean"
console.log(typeof undefined);      // → "undefined"
console.log(typeof Symbol("id"));   // → "symbol"
console.log(typeof null);           // → "object" (historic bug)
console.log(typeof {});             // → "object"
console.log(typeof []);             // → "object"
console.log(Array.isArray([]));     // → true
console.log(typeof function () {}); // → "function"

// Primitives are immutable: methods return NEW values
const s = "hi";
console.log(s.toUpperCase());       // → "HI"
console.log(s);                     // → "hi" (unchanged)

// Big IDs need bigint
console.log(2 ** 53 + 1);           // → 9007199254740992 (precision lost!)
console.log(2n ** 53n + 1n);        // → 9007199254740993n`,
  },
  {
    id: 'null-vs-undefined',
    group: 'Basics & Types',
    stars: 4,
    difficulty: 'Easy',
    q: 'What is the difference between `null` and `undefined`?',
    a: [
      '# ELI5',
      'Imagine a form at the doctor. A blank "middle name" line that nobody has touched yet is `undefined`: no one has filled it in.',
      'If you write "NONE" on the line, you are deliberately saying "there is no middle name": that is `null`.',
      'Both mean "no value", but one happened by default and the other was a conscious choice.',
      'Mapping back: the engine gives you `undefined` automatically; programmers write `null` on purpose.',
      '# What it is',
      '`undefined` is the default "nothing here yet" value that JavaScript itself produces.',
      '`null` is an explicit "empty on purpose" value that you assign.',
      'Comparison, row by row:',
      '  Who sets it: `undefined` = the engine; `null` = the programmer.',
      '  `typeof`: `undefined` gives `"undefined"`; `null` gives `"object"` (a historic bug).',
      '  In math: `undefined + 1` is `NaN`; `null + 1` is `1` (null converts to 0).',
      '  In JSON: `JSON.stringify` drops `undefined` fields but keeps `null` fields.',
      '  Default parameters: `undefined` triggers the default; `null` does not.',
      '  Equality: `null == undefined` is `true`; `null === undefined` is `false`.',
      '# How it works',
      'The engine produces `undefined` in these situations:',
      '  A declared variable with no value: `let x;`.',
      '  A missing object property: `obj.notThere`.',
      '  A function parameter the caller did not pass.',
      '  A function that has no `return` (or a bare `return;`).',
      '`null` only appears when someone writes it, for example a database driver returning `null` for an empty column.',
      'Modern operators treat both as "nullish":',
      '  `a ?? b` (nullish coalescing) returns `b` only if `a` is `null` or `undefined`.',
      '  `a?.b` (optional chaining) stops and returns `undefined` if `a` is `null` or `undefined`, instead of throwing.',
      '# Example walkthrough',
      '`let x;` then `console.log(x)` prints `undefined` because nothing was assigned.',
      '`greet()` with no argument uses the default `"guest"` because the parameter was `undefined`; `greet(null)` prints `Hello null` because `null` does not trigger defaults.',
      '`JSON.stringify({ a: undefined, b: null })` prints `{"b":null}`: the `undefined` field vanished.',
      '`user.profile?.city ?? "unknown"` safely returns `"unknown"` when anything on the path is missing.',
      '`0 || 10` gives `10` but `0 ?? 10` gives `0`, because `??` only replaces null and undefined.',
      '# Why it matters / when to use',
      'APIs: send `null` in JSON to say "this field exists but is empty"; omit the field (or leave it `undefined`) to say "not provided".',
      'PATCH endpoints often rely on this: `undefined` means "do not touch this column", `null` means "clear this column".',
      'Databases like PostgreSQL return `null` for empty columns, so your code must handle it.',
      '# Common mistakes',
      'Using `||` for defaults, which also replaces `0`, `""` and `false`. Fix: use `??` to only replace `null`/`undefined`.',
      'Checking `typeof x === "object"` and forgetting `null` passes that test. Fix: add `x !== null`.',
      'Assigning `undefined` on purpose to mean "empty". Fix: prefer `null` for intentional emptiness so intent is clear.',
      '# Say this in the interview',
      '"`undefined` means a value has not been assigned, and the engine produces it for uninitialised variables, missing properties and missing arguments. `null` is an intentional empty value that a developer assigns. They are loosely equal but not strictly equal, `typeof null` is \'object\' due to a historic bug, and JSON keeps `null` but drops `undefined`."',
      'Follow-up: How do you check for either one?',
      '  `x == null` or `x ?? fallback`, both of which treat `null` and `undefined` the same way.',
      'Follow-up: Which triggers a default parameter?',
      '  Only `undefined`; passing `null` keeps `null`.',
    ],
    code: `let x;
console.log(x);                 // → undefined (never assigned)
console.log({}.missing);        // → undefined (no such property)

function greet(name = "guest") {
  console.log("Hello " + name);
}
greet();                        // → "Hello guest"  (undefined -> default)
greet(null);                    // → "Hello null"   (null is a real value)

console.log(null + 1);          // → 1   (null -> 0)
console.log(undefined + 1);     // → NaN

console.log(JSON.stringify({ a: undefined, b: null })); // → {"b":null}

const user = { profile: null };
console.log(user.profile?.city ?? "unknown"); // → "unknown"

console.log(0 || 10);           // → 10 (|| replaces 0 too!)
console.log(0 ?? 10);           // → 0  (?? only replaces null/undefined)`,
  },
  {
    id: 'type-coercion',
    group: 'Basics & Types',
    stars: 4,
    difficulty: 'Medium',
    q: 'Explain type coercion in JavaScript.',
    a: [
      '# ELI5',
      'Imagine a cashier who accepts any currency. You hand over dollars when the shop uses euros, and the cashier quietly converts them without asking.',
      'Usually it is helpful, but sometimes the conversion rate surprises you and you get the wrong change.',
      'You can also convert the money yourself at a bank before paying, so there are no surprises.',
      'Mapping back: implicit coercion is the cashier converting automatically; explicit conversion is you calling `Number()` or `String()` yourself.',
      '# What it is',
      'Type coercion is JavaScript converting a value from one type to another.',
      'Explicit coercion (also called type casting) is when you ask for it: `Number("5")`, `String(5)`, `Boolean(x)`.',
      'Implicit coercion is when an operator does it for you: `"5" * 2` gives `10` because `*` needs numbers.',
      'There are only three target types: to string, to number, and to boolean.',
      'Key conversion rules:',
      '  To number: `""` is 0, `"  42 "` is 42, `"abc"` is `NaN`, `true` is 1, `false` is 0, `null` is 0, `undefined` is `NaN`, `[]` is 0.',
      '  To string: `123` is `"123"`, `null` is `"null"`, `[1,2]` is `"1,2"`, `{}` is `"[object Object]"`.',
      '  To boolean: only the falsy values (`false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN`) become `false`; everything else is `true`.',
      '# How it works',
      'The `+` operator is special:',
      '  If either side is a string (after converting objects to primitives), it joins them as strings.',
      '  Otherwise it adds them as numbers.',
      'Other math operators (`-`, `*`, `/`, `%`) always convert both sides to numbers.',
      'Comparison `==` converts types following the loose-equality rules; `===` never converts.',
      'Conditions (`if`, `while`, `&&`, `||`, `!`) convert values to booleans.',
      'Objects are first turned into primitives by calling `Symbol.toPrimitive` if present, otherwise `valueOf()` and then `toString()`.',
      '# Example walkthrough',
      '`"5" + 2` is `"52"`: one side is a string, so `+` concatenates.',
      '`"5" - 2` is `3`: `-` only works on numbers, so `"5"` becomes 5.',
      '`true + 1` is `2` because `true` becomes 1.',
      '`[] + {}` is `"[object Object]"`: `[]` becomes `""` and `{}` becomes `"[object Object]"`.',
      '`Number("12px")` is `NaN` while `parseInt("12px", 10)` is 12, because `parseInt` reads digits until it hits a non-digit.',
      'The query example shows `"5" + 10` becoming `"510"` until we convert with `Number()`.',
      '# Why it matters / when to use',
      'Query params and headers are always strings: `req.query.limit + 10` gives `"510"` instead of `15`. Convert with `Number()` first.',
      'Environment variables are strings: `process.env.DEBUG` set to `"false"` is still truthy. Compare to the exact string.',
      'Validation libraries (Zod, Joi) often do controlled coercion for you (`z.coerce.number()`).',
      '# Common mistakes',
      'Adding numbers that are secretly strings. Fix: convert explicitly with `Number(x)` and check `Number.isNaN`.',
      'Using `parseInt` without a radix. Fix: always pass `10` as the second argument.',
      'Relying on `==` and memorising weird tables. Fix: use `===` and explicit conversions.',
      '# Say this in the interview',
      '"Type coercion is converting a value to another type. It can be explicit, like `Number(x)`, or implicit, done by operators: `+` concatenates if either side is a string, other math operators convert to numbers, conditions convert to booleans, and `==` coerces before comparing. In backend code I convert input explicitly and use `===` to avoid surprises."',
      'Follow-up: What does `"3" * "4"` give?',
      '  `12`, because `*` converts both strings to numbers.',
      'Follow-up: Difference between `Number()` and `parseInt()`?',
      '  `Number` requires the whole string to be numeric (else `NaN`); `parseInt` reads leading digits and stops at the first non-digit.',
    ],
    code: `console.log("5" + 2);        // → "52" (string wins with +)
console.log("5" - 2);        // → 3    (- forces numbers)
console.log("3" * "4");      // → 12
console.log(true + 1);       // → 2    (true -> 1)
console.log(null + 1);       // → 1    (null -> 0)
console.log(undefined + 1);  // → NaN
console.log([] + {});        // → "[object Object]"

// Explicit conversion: say what you mean
console.log(Number("42"));          // → 42
console.log(Number("12px"));        // → NaN
console.log(parseInt("12px", 10));  // → 12
console.log(String(123));           // → "123"
console.log(Boolean("0"));          // → true (non-empty string)

// Typical backend bug: query params are strings
const query = { limit: "5" };
console.log(query.limit + 10);         // → "510"
console.log(Number(query.limit) + 10); // → 15`,
  },
  {
    id: 'primitive-vs-reference',
    group: 'Basics & Types',
    stars: 4,
    difficulty: 'Easy',
    q: 'How are primitives and objects passed/copied (value vs reference)?',
    a: [
      '# ELI5',
      'If I photocopy my homework and give you the copy, you can scribble on it and my original stays clean. That is copying by value.',
      'If instead I give you the address of my house, and you go there and paint the door red, my door is now red too. That is sharing a reference.',
      'Giving you a different address later does not change my house; it just points you somewhere else.',
      'Mapping back: primitives are photocopies; objects are houses, and variables hold their address.',
      '# What it is',
      'Primitives (number, string, boolean, null, undefined, symbol, bigint) are copied by value: the new variable gets its own independent copy.',
      'Objects (including arrays and functions) live on the heap, a memory area for larger data. A variable stores a reference, which is the address of that object.',
      'Copying an object variable copies the reference, not the object. Both variables now point to the same object.',
      'JavaScript always passes arguments "by value", but for objects the value being copied is the reference. This is often called "pass by sharing".',
      'Comparison, row by row:',
      '  Primitive copy: independent; changing one does not affect the other.',
      '  Object copy: shared; mutating through one variable is visible through the other.',
      '  Reassigning a parameter: never affects the caller, for both primitives and objects.',
      '  Mutating an object parameter: does affect the caller.',
      '# How it works',
      'When you write `let b = a` with a primitive:',
      '  The engine copies the actual value into `b`.',
      'When you write `let b = obj`:',
      '  The engine copies the address stored in `obj` into `b`.',
      '  `b.x = 5` follows the address and changes the shared object.',
      '  `b = {}` only changes what `b` points to; `obj` still points to the old object.',
      'When calling `fn(obj)`, the parameter is a new local variable holding a copy of that address, so the same two rules apply.',
      '# Example walkthrough',
      '`let a = 1; let b = a; b = 2;` leaves `a` as `1`: the copy is independent.',
      '`const o2 = o1; o2.x = 99;` makes `o1.x` print `99` because both names point to the same object.',
      '`mutate(user)` changes `user.name` to `"Changed"` because the function follows the shared reference.',
      '`reassign(user)` does nothing to the caller because it only points its local parameter at a new object.',
      '`{ ...o1 }` creates a new top-level object, so changing `copy.x` leaves `o1.x` alone.',
      '# Why it matters / when to use',
      'A function that modifies `req.body` or a config object passed in can change it for every other part of your app.',
      'Caching: if you return a cached object and the caller mutates it, the cache is now corrupted. Return copies or frozen objects.',
      'State management (Redux, React) relies on creating new objects instead of mutating, so that reference checks detect changes.',
      '# Common mistakes',
      'Accidentally mutating a function argument. Fix: copy first with `{ ...obj }` or `structuredClone(obj)`.',
      'Thinking `const arr2 = arr` makes a copy. Fix: use `[...arr]` or `arr.slice()`.',
      'Expecting a spread copy to be deep. Fix: nested objects are still shared; use `structuredClone` for a deep copy.',
      '# Say this in the interview',
      '"Primitives are copied by value, so each variable gets its own copy. Objects are accessed through references, so assigning or passing an object copies the reference, and both sides see mutations. Technically JavaScript is always pass-by-value, but for objects the value is a reference, so mutating a parameter affects the caller while reassigning it does not."',
      'Follow-up: Is JavaScript pass-by-reference?',
      '  No. It is pass-by-value where object values are references (pass by sharing), which is why reassigning a parameter does not affect the caller.',
      'Follow-up: How do you avoid accidental mutation?',
      '  Copy with spread or `structuredClone`, or freeze with `Object.freeze`.',
    ],
    code: `let a = 1;
let b = a;   // copy the VALUE
b = 2;
console.log(a);       // → 1 (unchanged)

const o1 = { x: 1 };
const o2 = o1;        // copy the REFERENCE
o2.x = 99;
console.log(o1.x);    // → 99 (same object)

function mutate(obj) { obj.name = "Changed"; }  // follows the reference
function reassign(obj) { obj = { name: "New" }; } // only rebinds local name

const user = { name: "Ann" };
mutate(user);
console.log(user.name); // → "Changed"
reassign(user);
console.log(user.name); // → "Changed" (caller not affected)

const copy = { ...o1 }; // new top-level object
copy.x = 5;
console.log(o1.x);    // → 99 (independent now)`,
  },
  {
    id: 'truthy-falsy',
    group: 'Basics & Types',
    stars: 3,
    difficulty: 'Easy',
    q: 'What are truthy and falsy values?',
    a: [
      '# ELI5',
      'Imagine a bouncer at a club who only asks one question: "Is there something here?" An empty cup, a zero, or a blank paper gets turned away.',
      'Anything with something in it, even a single crumb or a piece of paper saying "no", gets let in.',
      'Mapping back: when JavaScript needs a yes/no answer, it turns any value into `true` (truthy) or `false` (falsy) using a short fixed list of "empty" values.',
      '# What it is',
      'A truthy value is one that becomes `true` when converted to a boolean; a falsy value becomes `false`.',
      'This conversion happens in `if`, `while`, the ternary `? :`, `!`, `&&` and `||`.',
      'There are exactly 8 falsy values; memorise them:',
      '  `false`',
      '  `0` and `-0`',
      '  `0n` (bigint zero)',
      '  `""` (empty string)',
      '  `null`',
      '  `undefined`',
      '  `NaN`',
      'Everything else is truthy, including `"0"`, `"false"`, `" "` (a space), `[]`, `{}` and functions.',
      '# How it works',
      'When a condition is evaluated, the engine runs an internal `ToBoolean` step on the value.',
      '  If the value is in the falsy list, the condition is false.',
      '  Otherwise it is true. Objects are always truthy, no matter what is inside them.',
      '`&&` and `||` return one of the original values, not necessarily a boolean:',
      '  `a || b` returns `a` if `a` is truthy, else `b`.',
      '  `a && b` returns `a` if `a` is falsy, else `b`.',
      '`!!x` (double not) converts any value to its real boolean, same as `Boolean(x)`.',
      '# Example walkthrough',
      'The loop over `values` prints each value with its boolean: all eight falsy values print `false`.',
      '`Boolean("0")` and `Boolean([])` print `true`, which surprises many people.',
      '`0 || 10` returns `10` because `0` is falsy; `0 ?? 10` returns `0` because `??` only cares about null/undefined.',
      '`user && user.name` returns `"Ann"`, a common guard pattern (now usually written `user?.name`).',
      '# Why it matters / when to use',
      'Short guards: `if (!user) return res.status(401)` is common in Express handlers.',
      'Defaults: `const port = process.env.PORT || 3000` (fine here since `0` is not a valid port).',
      'Bugs: a quantity of `0` or a price of `0` is a valid value but falsy, so `if (!qty)` would wrongly reject it.',
      '# Common mistakes',
      'Treating `0` or `""` as "missing". Fix: check explicitly with `x === undefined` or `x == null`, or use `??`.',
      'Checking if an array is empty with `if (arr)`. Fix: `[]` is truthy; use `if (arr.length === 0)`.',
      'Expecting `"false"` (a string from an env var) to be falsy. Fix: compare `process.env.FLAG === "true"`.',
      '# Say this in the interview',
      '"When a value is used in a boolean context, JavaScript converts it to true or false. There are eight falsy values: false, 0, -0, 0n, empty string, null, undefined and NaN, and everything else is truthy, including empty arrays and objects. I am careful with `||` defaults because they also replace valid zeros and empty strings, so I use `??` for those."',
      'Follow-up: Is `[]` truthy?',
      '  Yes, all objects are truthy, even empty ones.',
      'Follow-up: What does `"" || "default"` return?',
      '  `"default"`, because the empty string is falsy.',
    ],
    code: `const values = [false, 0, -0, 0n, "", null, undefined, NaN];
for (const v of values) {
  console.log(String(v), Boolean(v)); // → every line ends with false
}

console.log(Boolean("0"));    // → true (non-empty string)
console.log(Boolean("false"));// → true
console.log(Boolean([]));     // → true (objects are always truthy)
console.log(Boolean({}));     // → true

console.log(0 || 10);         // → 10 (0 is falsy)
console.log(0 ?? 10);         // → 0  (?? keeps 0)

const user = { name: "Ann" };
console.log(user && user.name); // → "Ann"
console.log(!!"hello");       // → true

const cart = [];
if (cart.length === 0) console.log("empty cart"); // → "empty cart"`,
  },
  {
    id: 'typeof-quirks',
    group: 'Basics & Types',
    stars: 3,
    difficulty: 'Easy',
    q: 'What does `typeof` return and what are its quirks?',
    a: [
      '# ELI5',
      'Imagine a label maker that prints what kind of thing you hold up: "fruit", "toy", "book".',
      'It is mostly right, but it has two famous mistakes: it labels an empty box as "container" and labels a list as "container" too, instead of "list".',
      'So for some things you need a second, better check.',
      'Mapping back: `typeof` returns a type name as a string, but it says `"object"` for `null` and for arrays.',
      '# What it is',
      '`typeof` is an operator (not a function) that returns a string describing the type of a value.',
      'Possible results (only these 8 strings):',
      '  `"undefined"`, `"boolean"`, `"number"`, `"bigint"`, `"string"`, `"symbol"`, `"object"`, `"function"`.',
      'Quirks to remember:',
      '  `typeof null` is `"object"`: a bug from 1995 kept for backwards compatibility.',
      '  `typeof []` is `"object"`: arrays are objects. Use `Array.isArray`.',
      '  `typeof function () {}` and `typeof class {}` are `"function"`, even though functions are objects.',
      '  `typeof NaN` is `"number"`: "Not a Number" is still of type number.',
      '  `typeof undeclaredVariable` is `"undefined"` without throwing, which makes it a safe existence check.',
      '  But `typeof` on a `let`/`const` in its Temporal Dead Zone does throw a `ReferenceError`.',
      '# How it works',
      'The engine looks at the internal type tag of the value:',
      '  For primitives it returns the primitive name.',
      '  For objects, it checks if the object is callable (has an internal `[[Call]]` method); if yes it returns `"function"`, otherwise `"object"`.',
      '  In the original engine, `null` was stored with the same tag bits as objects, which caused the `"object"` result.',
      'For finer detail, use other tools:',
      '  `Array.isArray(x)` for arrays.',
      '  `x instanceof Date` or `Object.prototype.toString.call(x)` (returns `"[object Date]"`) for built-ins.',
      '# Example walkthrough',
      'Each `typeof` line shows the returned string.',
      '`typeof notDeclared` prints `"undefined"` without crashing even though `notDeclared` was never declared.',
      '`Object.prototype.toString.call([])` prints `"[object Array]"`, a precise type check.',
      'The `isObject` helper returns `true` only for real non-null, non-array objects.',
      '# Why it matters / when to use',
      'Validating JSON bodies: `typeof body.age === "number"` before using it.',
      'Writing safe library code that checks whether a global like `window` exists: `typeof window !== "undefined"` tells you if you are in a browser or Node.',
      'Checking optional callbacks: `if (typeof cb === "function") cb()`.',
      '# Common mistakes',
      'Using `typeof x === "object"` as an object check and letting `null` and arrays through. Fix: add `x !== null && !Array.isArray(x)`.',
      'Using `typeof x === "number"` to validate numbers and accepting `NaN`. Fix: use `Number.isFinite(x)`.',
      'Writing `typeof(x)` and thinking it is a function call. It works, but `typeof` is an operator; the parentheses are just grouping.',
      '# Say this in the interview',
      '"`typeof` returns a string naming the type of a value: undefined, boolean, number, bigint, string, symbol, function or object. The main quirks are that `typeof null` is \'object\' because of an old bug, arrays also report \'object\', and `NaN` reports \'number\'. So I use `x === null`, `Array.isArray` and `Number.isNaN` for those cases."',
      'Follow-up: How do you check for a plain object?',
      '  `x !== null && typeof x === "object" && !Array.isArray(x)`.',
      'Follow-up: Does `typeof` ever throw?',
      '  Only for `let`/`const`/`class` names accessed during their Temporal Dead Zone.',
    ],
    code: `console.log(typeof undefined);    // → "undefined"
console.log(typeof 1);            // → "number"
console.log(typeof NaN);          // → "number" (quirk)
console.log(typeof 1n);           // → "bigint"
console.log(typeof "a");          // → "string"
console.log(typeof Symbol());     // → "symbol"
console.log(typeof null);         // → "object" (quirk)
console.log(typeof []);           // → "object" (quirk)
console.log(typeof (() => {}));   // → "function"
console.log(typeof class {});     // → "function"

console.log(typeof notDeclared);  // → "undefined" (no error)

console.log(Object.prototype.toString.call([]));        // → "[object Array]"
console.log(Object.prototype.toString.call(new Date())); // → "[object Date]"

function isPlainObject(x) {
  return x !== null && typeof x === "object" && !Array.isArray(x);
}
console.log(isPlainObject({}));   // → true
console.log(isPlainObject(null)); // → false
console.log(isPlainObject([]));   // → false`,
  },
  {
    id: 'nan',
    group: 'Basics & Types',
    stars: 3,
    difficulty: 'Easy',
    q: 'What is `NaN` and how do you check for it?',
    a: [
      '# ELI5',
      'Imagine a calculator that, when you type "apple divided by 3", shows an error sign instead of crashing.',
      'That error sign is a strange thing: if you compare two error signs, the calculator says they are not the same, because "two broken answers" are not really equal.',
      'Mapping back: `NaN` is the "broken number" result of invalid math, and it is the only value not equal to itself.',
      '# What it is',
      '`NaN` stands for "Not a Number", but its type is actually `number`.',
      'It is the result of a numeric operation that has no meaningful answer.',
      'Common ways to get `NaN`:',
      '  `0 / 0`, `Math.sqrt(-1)`, `Infinity - Infinity`.',
      '  Converting text that is not numeric: `Number("abc")`, `parseInt("hello", 10)`.',
      '  Math with `undefined`: `undefined + 1`.',
      'Key property: `NaN !== NaN`. It is the only JavaScript value that is not equal to itself.',
      '`NaN` is "contagious": any math involving `NaN` produces `NaN`.',
      '# How it works',
      'JavaScript numbers follow the IEEE 754 standard (the floating-point format used by almost every CPU), which defines `NaN` and says it never equals anything.',
      'Ways to check for it:',
      '  `Number.isNaN(x)`: true only if `x` is the actual `NaN` value. This is the correct modern check.',
      '  Global `isNaN(x)`: first converts `x` to a number, so `isNaN("abc")` is `true` even though `"abc"` is a string. Avoid it.',
      '  `Object.is(x, NaN)`: also true only for real `NaN`.',
      '  `x !== x`: true only for `NaN`. Works, but is cryptic.',
      '  `Number.isFinite(x)`: false for `NaN`, `Infinity` and non-numbers; the best "is this a usable number?" check.',
      'Array methods differ: `[NaN].includes(NaN)` is `true` (uses SameValueZero), but `[NaN].indexOf(NaN)` is `-1` (uses `===`).',
      '# Example walkthrough',
      '`Number("abc")` gives `NaN`, and `typeof` that is `"number"`.',
      '`NaN === NaN` prints `false`, so equality checks cannot find it.',
      '`isNaN("abc")` prints `true` (misleading), while `Number.isNaN("abc")` prints `false` (correct: it is a string, not `NaN`).',
      'The `parsePage` helper returns a default page `1` when the input is not a valid number.',
      '# Why it matters / when to use',
      'Parsing user input (`?page=abc`) produces `NaN`, which then silently spreads through calculations and ends up in database queries.',
      'Always validate numbers from requests with `Number.isFinite` or `Number.isInteger` before using them.',
      '`JSON.stringify(NaN)` produces `null`, so a `NaN` field becomes `null` in API responses.',
      '# Common mistakes',
      'Writing `if (x === NaN)`, which is always false. Fix: `Number.isNaN(x)`.',
      'Using the global `isNaN` on strings. Fix: use `Number.isNaN` or `Number.isFinite`.',
      'Forgetting `NaN` is falsy and assuming `if (!x)` only catches `0`. Fix: be explicit about which values you want to reject.',
      '# Say this in the interview',
      '"`NaN` is a special numeric value meaning the result of an invalid math operation, like `0 / 0` or `Number(\'abc\')`. Its type is number, and it is the only value that is not equal to itself, so `x === NaN` never works. I check with `Number.isNaN`, or `Number.isFinite` when I want a usable number, and avoid the global `isNaN` because it coerces its argument first."',
      'Follow-up: Difference between `isNaN` and `Number.isNaN`?',
      '  `isNaN` converts the argument to a number first; `Number.isNaN` does not, so it only returns true for the real `NaN`.',
      'Follow-up: Does `includes` find `NaN`?',
      '  Yes, `[NaN].includes(NaN)` is true, but `indexOf` returns -1.',
    ],
    code: `const bad = Number("abc");
console.log(bad);                 // → NaN
console.log(typeof bad);          // → "number"
console.log(bad === NaN);         // → false (never works)
console.log(Number.isNaN(bad));   // → true  (correct)
console.log(Object.is(bad, NaN)); // → true

console.log(isNaN("abc"));        // → true  (misleading: coerces first)
console.log(Number.isNaN("abc")); // → false (a string is not NaN)

console.log(NaN + 5);             // → NaN (contagious)
console.log([NaN].includes(NaN)); // → true
console.log([NaN].indexOf(NaN));  // → -1

function parsePage(raw) {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : 1;
}
console.log(parsePage("3"));      // → 3
console.log(parsePage("abc"));    // → 1`,
  },
  {
    id: 'strict-mode',
    group: 'Basics & Types',
    stars: 2,
    difficulty: 'Easy',
    q: 'What does `"use strict"` do?',
    a: [
      '# ELI5',
      'Imagine a game with a "beginner" mode where the referee ignores small fouls, and a "pro" mode where every foul gets a whistle.',
      'In beginner mode, mistakes slip by silently and cause trouble later; in pro mode you find out right away.',
      'Mapping back: `"use strict"` switches JavaScript into pro mode, turning silent mistakes into thrown errors.',
      '# What it is',
      'Strict mode is an opt-in, stricter version of JavaScript introduced in ES5 (2009).',
      'You turn it on by putting the string `"use strict";` as the very first statement of a file or function.',
      'ES modules (files using `import`/`export`, including `.mjs` files) and all `class` bodies are always in strict mode automatically.',
      'Main changes it makes:',
      '  Assigning to an undeclared variable throws `ReferenceError` instead of silently creating a global.',
      '  In a plain function call, `this` is `undefined` instead of the global object.',
      '  Writing to a read-only property (for example on a frozen object) throws `TypeError` instead of failing silently.',
      '  Duplicate parameter names (`function f(a, a)`) are a `SyntaxError`.',
      '  `with` statements and octal literals like `010` are banned.',
      '  `delete` on a plain variable is a `SyntaxError`.',
      '  `arguments` is no longer linked to named parameters.',
      '# How it works',
      'The parser checks for the `"use strict"` directive at the start of a script or function.',
      '  If found, that whole scope (and nested functions) is compiled with strict rules.',
      '  The directive must come first; if it appears after other statements it is just an ignored string.',
      'In Node.js, CommonJS files (`require`) are sloppy by default; ES module files are strict by default.',
      'TypeScript emits `"use strict"` in compiled CommonJS output when `strict` or `alwaysStrict` is on.',
      '# Example walkthrough',
      'Inside `sloppy()`, `leaked = 1` silently creates a global variable named `leaked`.',
      'Inside `strict()`, the same line throws `ReferenceError` because the function starts with `"use strict"`.',
      '`showThis()` in strict mode prints `undefined` for `this`, instead of the global object.',
      'Assigning to `frozen.x` throws `TypeError` in strict mode; in sloppy mode it would just do nothing.',
      '# Why it matters / when to use',
      'It catches typos like `usre = getUser()` that would otherwise create globals shared across requests in a Node server.',
      'It makes `this` bugs visible (crash early) instead of accidentally changing global state.',
      'Modern code written as ES modules or TypeScript already gets it, so you rarely write the directive by hand today.',
      '# Common mistakes',
      'Putting `"use strict"` after other code. Fix: it must be the first statement.',
      'Assuming CommonJS Node files are strict. Fix: add the directive, or use ES modules (`"type": "module"` in package.json).',
      'Relying on `this` being the global object in plain functions. Fix: pass what you need explicitly.',
      '# Say this in the interview',
      '"`\'use strict\'` opts a file or function into strict mode, which turns silent errors into thrown errors. Assigning to undeclared variables throws, `this` in a plain function call is undefined instead of the global object, writes to read-only properties throw, and some unsafe syntax like `with` is banned. ES modules and class bodies are strict automatically."',
      'Follow-up: Is code in an ES module strict?',
      '  Yes, always, with no directive needed.',
      'Follow-up: What is `this` in a plain function call in strict mode?',
      '  `undefined`.',
    ],
    code: `// Run as a CommonJS script (node demo.cjs): ES modules are always strict
function sloppy() {
  leaked = 1;              // silently creates a global!
}
sloppy();
console.log(globalThis.leaked); // → 1

function strict() {
  "use strict";
  try {
    notDeclared = 1;       // undeclared assignment
  } catch (e) {
    console.log(e.name);   // → "ReferenceError"
  }
}
strict();

function showThis() {
  "use strict";
  console.log(this);       // → undefined
}
showThis();

function writeFrozen() {
  "use strict";
  const frozen = Object.freeze({ x: 1 });
  try { frozen.x = 2; } catch (e) { console.log(e.name); } // → "TypeError"
}
writeFrozen();`,
  },
  {
    id: 'floating-point',
    group: 'Basics & Types',
    stars: 2,
    difficulty: 'Easy',
    q: 'Why is `0.1 + 0.2 !== 0.3`?',
    a: [
      '# ELI5',
      'Try writing one third as a decimal: 0.3333... You can never finish, so you stop somewhere and the number is slightly off.',
      'Computers count in binary (only 0s and 1s), and in binary the numbers 0.1 and 0.2 never finish either, just like 1/3 in decimal.',
      'So the computer stores a tiny bit wrong version of each, and when you add them the small errors show up.',
      'Mapping back: `0.1 + 0.2` gives `0.30000000000000004` because of rounding in binary floating-point storage.',
      '# What it is',
      'All JavaScript `number` values are stored as 64-bit floating point numbers following the IEEE 754 standard.',
      'Floating point means the number is stored like scientific notation: a fixed number of significant digits (about 15 to 17 decimal digits) plus an exponent.',
      'Many simple decimals (0.1, 0.2, 0.3) cannot be represented exactly in binary, so the nearest possible value is stored instead.',
      'This is not a JavaScript bug: Python, Java, C and others give the same result for doubles.',
      'Related limits:',
      '  `Number.EPSILON` (about 2.22e-16) is the smallest gap between 1 and the next representable number.',
      '  `Number.MAX_SAFE_INTEGER` is 2^53 - 1 (9007199254740991); integers above that lose precision.',
      '# How it works',
      'When you write `0.1`, the engine converts it to the closest binary fraction, which is slightly more than 0.1.',
      'Same for `0.2`.',
      'Adding them gives a binary result whose nearest decimal print is `0.30000000000000004`.',
      'The literal `0.3` is stored as a slightly different binary value, so `===` returns `false`.',
      'Ways to cope:',
      '  Compare with a tolerance: `Math.abs(a - b) < Number.EPSILON`.',
      '  For money, store integer minor units (cents/paise) and only format at the end.',
      '  For display, round with `toFixed(2)` or `Intl.NumberFormat`.',
      '  For exact decimals, use a decimal library (for example `decimal.js`) or database `NUMERIC` columns.',
      '# Example walkthrough',
      '`0.1 + 0.2` prints `0.30000000000000004` and the equality check prints `false`.',
      '`nearlyEqual(0.1 + 0.2, 0.3)` prints `true` because the difference is below `Number.EPSILON`.',
      'Prices in cents (`1099 + 250`) add exactly to `1349`, which formats as `"13.49"`.',
      '`2 ** 53 + 1` prints the same as `2 ** 53`, showing integer precision loss.',
      '# Why it matters / when to use',
      'Payments and invoices: rounding errors can make totals off by a cent and fail reconciliation.',
      'Database IDs or Twitter-style snowflake IDs above 2^53 get corrupted if parsed as numbers; keep them as strings or `bigint`.',
      'Tests: assert decimals with tolerance (Jest has `toBeCloseTo`).',
      '# Common mistakes',
      'Storing money as floats like `19.99`. Fix: store `1999` cents as an integer.',
      'Comparing floats with `===`. Fix: compare with a small tolerance.',
      'Using `toFixed` for math. Fix: `toFixed` returns a string and is for display only.',
      '# Say this in the interview',
      '"JavaScript numbers are IEEE 754 double-precision floats, and decimals like 0.1 and 0.2 cannot be represented exactly in binary, so their sum is 0.30000000000000004. It is not JS-specific. For comparisons I use a tolerance like `Number.EPSILON`, and for money I store integer cents or use a decimal library."',
      'Follow-up: What is the largest safe integer?',
      '  `Number.MAX_SAFE_INTEGER`, which is 2^53 - 1; use `bigint` beyond that.',
      'Follow-up: How should money be stored?',
      '  As integer minor units (cents) or a fixed-precision `NUMERIC`/`DECIMAL` column.',
    ],
    code: `console.log(0.1 + 0.2);            // → 0.30000000000000004
console.log(0.1 + 0.2 === 0.3);    // → false

function nearlyEqual(a, b) {
  return Math.abs(a - b) < Number.EPSILON;
}
console.log(nearlyEqual(0.1 + 0.2, 0.3)); // → true

// Money: work in integer cents
const priceCents = 1099;           // $10.99
const taxCents = 250;              // $2.50
const totalCents = priceCents + taxCents;
console.log(totalCents);                   // → 1349
console.log((totalCents / 100).toFixed(2)); // → "13.49" (display only)

// Integer precision limit
console.log(Number.MAX_SAFE_INTEGER);      // → 9007199254740991
console.log(2 ** 53 === 2 ** 53 + 1);      // → true (precision lost)
console.log(2n ** 53n + 1n);               // → 9007199254740993n`,
  },

  // ───────────────────────── Scope & Closures ─────────────────────────
  {
    id: 'closures',
    group: 'Scope & Closures',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is a closure in JavaScript?',
    a: [
      '# ELI5',
      'Imagine a kid leaving home for school with a backpack. Inside the backpack is a note from home with the family wifi password.',
      'Even though the kid is far from home now, they can still read the note whenever they need it.',
      'And if mom updates the same note at home before the kid reads it... well, in JavaScript, it is the very same note, not a photocopy.',
      'Mapping back: the kid is an inner function, home is the outer function, and the backpack is the closure: the variables the function carries with it.',
      '# What it is',
      'A closure is a function bundled together with references to the variables from the place where it was created.',
      'Lexical scope means a function can see variables based on where it is written in the code, not where it is called from.',
      'When an inner function uses a variable from an outer function, it keeps access to that variable even after the outer function has finished running.',
      'Every function in JavaScript forms a closure; it only becomes interesting when the inner function outlives the outer one (returned, stored, or passed as a callback).',
      'The closure keeps a live reference to the variable, not a snapshot of its value. If the variable changes, the closure sees the new value.',
      '# How it works',
      'Each time a function runs, the engine creates an environment record, an internal object that holds that call\'s local variables.',
      'When an inner function is created, it stores a hidden link (often written `[[Environment]]`) to the environment it was created in.',
      'When the outer function returns:',
      '  Normally its environment would be thrown away by the garbage collector (the part of the engine that frees memory nobody uses).',
      '  But because the inner function still links to it, the environment stays alive.',
      'When the inner function later reads a variable:',
      '  It first looks in its own local variables.',
      '  If not found, it follows the hidden link to the outer environment, and so on up to the global scope.',
      'Each call to the outer function creates a brand new environment, so each returned inner function has its own private copy of the variables.',
      '# Example walkthrough',
      '`makeCounter()` creates a local `count = 0` and returns an object with two functions that use `count`.',
      '`makeCounter` finishes, but `count` survives because `increment` and `get` still reference it.',
      '`c1.increment()` twice then `c1.get()` prints `2`.',
      '`c2` was made by a separate call, so it has its own `count`; `c2.get()` prints `0`.',
      'Nobody outside can touch `count` directly: `c1.count` is `undefined`. This is data privacy through closures.',
      '`makeMultiplier(3)` returns a function that remembers `factor = 3`, so `triple(5)` prints `15`.',
      '# Why it matters / when to use',
      'Private state without classes: counters, caches, rate limiters that hide their internal data.',
      'Function factories: `makeMultiplier`, or middleware factories in Express like `requireRole("admin")` that return a configured `(req, res, next)` function.',
      'Callbacks and event handlers: every `setTimeout`, `.then()` or `app.get(..., handler)` callback uses variables from the surrounding code via closures.',
      'Memoisation: a function keeps a cache object in its closure to remember previous results.',
      '# Common mistakes',
      'Using `var` in a loop with async callbacks, so all callbacks share one variable. Fix: use `let`, which creates a new binding per iteration.',
      'Holding big objects in a long-lived closure (like a global event listener) and leaking memory. Fix: only capture what you need and remove listeners when done.',
      'Expecting the closure to capture a snapshot of the value. Fix: remember it captures the variable itself; copy the value into a new `const` if you need a snapshot.',
      '# Say this in the interview',
      '"A closure is a function together with the lexical environment it was created in, so it can keep accessing outer variables even after the outer function has returned. Closures hold references, not copies, so they see later updates. I use them for private state, function factories like middleware creators, memoisation, and they are what make every callback work."',
      'Follow-up: Where are closures used in Node backends?',
      '  Middleware factories (`rateLimit({ max: 100 })`), memoised config loaders, and every async callback that reads request data.',
      'Follow-up: Do closures copy variables?',
      '  No, they reference the same variable, so changes made later are visible inside the closure.',
    ],
    code: `function makeCounter() {
  let count = 0;                 // private to this call
  return {
    increment() { count++; },    // closes over count
    get() { return count; },
  };
}

const c1 = makeCounter();
const c2 = makeCounter();        // separate environment, separate count
c1.increment();
c1.increment();
console.log(c1.get());   // → 2
console.log(c2.get());   // → 0
console.log(c1.count);   // → undefined (truly private)

// Function factory
function makeMultiplier(factor) {
  return (n) => n * factor;      // remembers factor
}
const triple = makeMultiplier(3);
console.log(triple(5));  // → 15

// Express-style middleware factory (closure over "role")
function requireRole(role) {
  return (req, res, next) => (req.user.role === role ? next() : res.status(403).end());
}`,
  },
  {
    id: 'closure-loop-settimeout',
    group: 'Scope & Closures',
    stars: 5,
    difficulty: 'Medium',
    q: 'What does a `setTimeout` inside a `for` loop with `var` print, and how do you fix it?',
    a: [
      '# ELI5',
      'Imagine three kids are told: "In one minute, shout the number written on the whiteboard". The teacher writes 0, then 1, then 2, then 3, erasing each time.',
      'After a minute, all three kids look at the same whiteboard and shout "3!".',
      'If instead each kid got their own sticky note with their number, they would shout 0, 1 and 2.',
      'Mapping back: `var` is the one shared whiteboard; `let` gives each loop iteration its own sticky note.',
      '# What it is',
      'The classic puzzle: `for (var i = 0; i < 3; i++) setTimeout(() => console.log(i), 0)` prints `3 3 3`, not `0 1 2`.',
      'Two ideas combine here:',
      '  `var` is function-scoped, so there is only ONE `i` variable shared by all iterations.',
      '  `setTimeout` callbacks run later, after the loop has finished, because of the event loop (the mechanism that runs queued callbacks once the current code is done).',
      'By the time the callbacks run, the loop has already pushed `i` to `3` (the value that made `i < 3` false).',
      'Every callback is a closure over that same single `i`, so they all print `3`.',
      '# How it works',
      'Step by step with `var`:',
      '  The loop runs synchronously (all in one go): it schedules 3 callbacks and increments `i` to 0, 1, 2, then 3, then stops.',
      '  The current code finishes, and the event loop starts running the timer callbacks.',
      '  Each callback reads `i` through its closure; there is only one `i`, and it is now `3`.',
      'Step by step with `let`:',
      '  The spec says a `let` in a `for` header creates a fresh copy of `i` for every iteration, initialised from the previous one.',
      '  Each callback closes over its own iteration\'s `i`, so they print 0, 1, 2.',
      'Older fixes (before `let` existed):',
      '  Wrap the body in an IIFE (an immediately-invoked function) that takes `i` as a parameter, creating a new scope per iteration.',
      '  Pass `i` as the third argument to `setTimeout`, which forwards extra arguments to the callback.',
      '# Example walkthrough',
      'The first loop uses `var` and prints `var: 3` three times.',
      'The second loop uses `let` and prints `let: 0`, `let: 1`, `let: 2`.',
      'The third loop uses `var` but wraps the timer in an IIFE with parameter `j`, so each call has its own `j`: prints 0, 1, 2.',
      'The fourth uses `setTimeout(fn, 0, i)` to pass the current value as an argument: prints 0, 1, 2.',
      'All synchronous code finishes first, so the order is all `var` lines, then `let`, then `iife`, then `arg`, matching the order the timers were scheduled.',
      '# Why it matters / when to use',
      'The same bug happens in backend code when you loop and fire async work (`db.save(...).then(() => log(i))`) with a shared variable.',
      'It is a favourite interview question because it tests closures, scope and the event loop at once.',
      '# Common mistakes',
      'Saying it prints `0 1 2` or `2 2 2`. It prints `3 3 3` because the final increment makes `i` equal 3 before the check fails.',
      'Thinking `setTimeout(fn, 0)` runs immediately. It always waits until the current code finishes.',
      'Explaining the `let` fix as "let is not hoisted". The real reason is per-iteration bindings.',
      '# Say this in the interview',
      '"With `var` it prints 3, 3, 3. There is a single function-scoped `i`, the callbacks are closures over that same variable, and they run after the loop has finished and `i` has become 3. Using `let` fixes it because a `let` in a for-loop header creates a new binding per iteration, so each callback captures its own value. Older fixes were an IIFE or passing `i` as an argument to setTimeout."',
      'Follow-up: What if the delay is `i * 1000`?',
      '  The timings change (0s, 1s, 2s) but with `var` they still all print 3.',
      'Follow-up: Does `const` work in a `for (const i = 0; ...; i++)` loop?',
      '  No, `i++` would reassign a const and throw; `const` only works in `for...of`/`for...in` loops.',
    ],
    code: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log("var:", i), 0);
}
// → var: 3, var: 3, var: 3 (one shared i)

for (let k = 0; k < 3; k++) {
  setTimeout(() => console.log("let:", k), 0);
}
// → let: 0, let: 1, let: 2 (fresh k per iteration)

// Old-school fix: IIFE creates a new scope each time
for (var m = 0; m < 3; m++) {
  (function (j) {
    setTimeout(() => console.log("iife:", j), 0);
  })(m);
}
// → iife: 0, iife: 1, iife: 2

// Another fix: pass the value as an extra setTimeout argument
for (var n = 0; n < 3; n++) {
  setTimeout((v) => console.log("arg:", v), 0, n);
}
// → arg: 0, arg: 1, arg: 2`,
  },
  {
    id: 'lexical-scope-chain',
    group: 'Scope & Closures',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is lexical scope and the scope chain?',
    a: [
      '# ELI5',
      'Imagine nested boxes: a small box inside a medium box inside a big box. You are sitting in the small box looking for your toy car.',
      'First you search your small box. If it is not there, you look in the medium box, then the big box. You can never look inside a box that is not around you.',
      'Mapping back: each box is a scope, the search order from inside to outside is the scope chain, and the boxes are arranged by how the code is written (lexical).',
      '# What it is',
      'Scope is the set of variables a piece of code can access.',
      'Lexical scope (also called static scope) means scope is decided by where code is written in the source file, not by where or how it is called at runtime.',
      '"Lexical" just means "related to the text of the code".',
      'The scope chain is the ordered list of scopes the engine searches when looking up a variable: current scope, then its parent, then its grandparent, ending at the global scope.',
      'Kinds of scope in JavaScript:',
      '  Global scope: the outermost level.',
      '  Module scope: top level of an ES module file, private to that file.',
      '  Function scope: everything inside a function.',
      '  Block scope: inside `{ }` for `let`, `const` and `class`.',
      'Inner scopes can read outer variables; outer scopes cannot read inner ones.',
      'Shadowing is when an inner scope declares a variable with the same name as an outer one, hiding the outer one inside that scope.',
      '# How it works',
      'When the engine parses the code, it knows how scopes are nested just from the text.',
      'At runtime, each scope gets an environment record that holds its variables plus a link to its parent environment.',
      'Variable lookup for a name `x`:',
      '  Check the current environment. If found, use it.',
      '  Otherwise follow the parent link and check there.',
      '  Repeat until the global environment.',
      '  If still not found: reading throws `ReferenceError`; assigning in sloppy mode creates a global (in strict mode it throws).',
      'Because links are set at creation time, a function always uses the scope where it was defined. This is what makes closures possible.',
      '# Example walkthrough',
      '`inner` reads `a` (its own), `b` (from `outer`) and `c` (global) by walking up the chain, printing `1 2 3`.',
      '`showX` is defined at the top level, so it sees the global `x = "global"`.',
      '`callShowX` has its own `x = "local"` and calls `showX`, but `showX` still prints `"global"`: scope is decided where the function is written, not where it is called.',
      'The shadowing example prints `"inner"` inside the block and `"outer"` outside it.',
      '# Why it matters / when to use',
      'It explains why closures work and why callbacks can use variables from the function that created them.',
      'It helps you debug "why is this variable undefined here" questions in large Node files.',
      'Module scope keeps each file\'s top-level variables private, so two files can both have a `config` variable without clashing.',
      '# Common mistakes',
      'Thinking a function can see variables of whoever calls it (that would be dynamic scope, which JavaScript does not use). Fix: pass values as arguments.',
      'Accidental shadowing, like a parameter named `user` hiding the outer `user`. Fix: use distinct names; linters flag this with `no-shadow`.',
      'Confusing scope with `this`: scope is lexical, but `this` (for regular functions) depends on how the function is called.',
      '# Say this in the interview',
      '"Lexical scope means a variable\'s visibility is determined by where it is written in the source, so a function always sees the variables of the place where it was defined. When looking up a name, the engine walks the scope chain from the current scope outward to the global scope, and throws a ReferenceError if it is not found. This is what makes closures work."',
      'Follow-up: Is `this` lexically scoped?',
      '  Only in arrow functions; regular functions get `this` from how they are called.',
      'Follow-up: What is shadowing?',
      '  Declaring an inner variable with the same name as an outer one, which hides the outer one inside that scope.',
    ],
    code: `const c = 3;                // global scope

function outer() {
  const b = 2;              // outer function scope
  function inner() {
    const a = 1;            // inner function scope
    console.log(a, b, c);   // walks the chain: inner -> outer -> global
  }
  inner();
}
outer();                    // → 1 2 3

const x = "global";
function showX() {
  console.log(x);           // looks where showX was WRITTEN
}
function callShowX() {
  const x = "local";        // not visible to showX
  showX();
}
callShowX();                // → "global" (lexical, not dynamic, scope)

const name = "outer";
{
  const name = "inner";     // shadows the outer name
  console.log(name);        // → "inner"
}
console.log(name);          // → "outer"`,
  },
  {
    id: 'temporal-dead-zone',
    group: 'Scope & Closures',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is the Temporal Dead Zone (TDZ)?',
    a: [
      '# ELI5',
      'Imagine a new playground that has been built but has a "Wet Paint, Do Not Touch" sign until a certain time.',
      'Everyone knows the playground is there, but if you touch it before the sign is removed, you get in trouble.',
      'Mapping back: the playground is a `let`/`const` variable, the sign period is the Temporal Dead Zone, and getting in trouble is a `ReferenceError`.',
      '# What it is',
      'The Temporal Dead Zone (TDZ) is the period between entering a scope and the line where a `let`, `const` or `class` is declared.',
      'During this period the variable exists (it has been hoisted) but is uninitialised, so any read or write throws `ReferenceError: Cannot access \'x\' before initialization`.',
      '"Temporal" means it is about time (when the code runs), not position in the text. A function defined above the declaration can safely use the variable if it is only called after the declaration line has run.',
      'It does not apply to `var` (which is initialised to `undefined`) or function declarations (which are fully hoisted).',
      'Other places the TDZ appears:',
      '  `typeof x` on a TDZ variable throws, unlike `typeof` on an undeclared name.',
      '  Default parameters: `function f(a = b, b = 1)` throws because `b` is in its TDZ when `a` is computed.',
      '  `let x = x + 1` throws because the right side reads `x` before it is initialised.',
      '# How it works',
      'When the engine enters a block or function:',
      '  It creates bindings for all `let`/`const`/`class` declarations in that scope, marked as uninitialised.',
      '  Any access to an uninitialised binding throws.',
      'When execution reaches the declaration line, the binding is initialised (with the given value, or `undefined` for `let x;`).',
      'Because the inner binding exists from the start of the block, it shadows any outer variable with the same name for the whole block, even before its line.',
      'The TDZ exists to catch bugs: using a value before it is set almost always indicates a mistake.',
      '# Example walkthrough',
      'Reading `a` before `let a = 1` throws `ReferenceError`.',
      'Inside the block, `console.log(color)` throws even though there is an outer `color = "red"`, because the inner `let color` already shadows it.',
      '`useLater` is defined before `later` is declared but only called after, so it prints `"ready"`: the TDZ is about time, not text order.',
      '`typeof undeclaredThing` returns `"undefined"`, but `typeof z` before `let z` throws.',
      '# Why it matters / when to use',
      'In Node apps, circular imports between ES modules can hit the TDZ: module A reads an export of module B before B finished running. The fix is restructuring imports.',
      'It explains why moving a `const` helper below the code that uses it at top level breaks things.',
      'Knowing it lets you read "Cannot access X before initialization" errors instantly.',
      '# Common mistakes',
      'Saying `let`/`const` are not hoisted. They are hoisted; they are just uninitialised (in the TDZ).',
      'Relying on an outer variable inside a block that later redeclares the same name. Fix: rename or move the declaration.',
      'Using `typeof` as a "safe" check on a variable that is in the TDZ. Fix: declare first, then check.',
      '# Say this in the interview',
      '"The Temporal Dead Zone is the time from entering a scope until a `let`, `const` or `class` declaration is executed. The binding is hoisted but uninitialised, so accessing it throws a ReferenceError. It is about execution time, not position, so a function that references the variable is fine as long as it is called after the declaration runs."',
      'Follow-up: Does `typeof` protect you from the TDZ?',
      '  No, `typeof` on a TDZ variable throws a ReferenceError.',
      'Follow-up: Why does the TDZ exist?',
      '  To catch use-before-initialisation bugs and to make `const` meaningful (it should never be seen without its value).',
    ],
    code: `try {
  console.log(a);            // a is hoisted but uninitialised
} catch (e) {
  console.log(e.message);    // → "Cannot access 'a' before initialization"
}
let a = 1;

const color = "red";
{
  try {
    console.log(color);      // inner color shadows outer, still in TDZ
  } catch (e) {
    console.log(e.name);     // → "ReferenceError"
  }
  const color = "blue";
  console.log(color);        // → "blue"
}

function useLater() {
  return later;              // fine IF called after the declaration runs
}
const later = "ready";
console.log(useLater());     // → "ready" (TDZ is about time, not text)

console.log(typeof undeclaredThing); // → "undefined" (no error)
try { typeof z; } catch (e) { console.log(e.name); } // → "ReferenceError"
let z = 0;`,
  },
  {
    id: 'iife',
    group: 'Scope & Closures',
    stars: 3,
    difficulty: 'Easy',
    q: 'What is an IIFE and why was it used?',
    a: [
      '# ELI5',
      'Imagine building a sandcastle inside a big cardboard box, so your sand does not mix with your sister\'s sand in the same sandbox.',
      'You build it right away, and when you are done, you only show people the finished castle; the messy tools stay inside the box.',
      'Mapping back: the box is the IIFE\'s private function scope, and showing the castle is returning only what you want to expose.',
      '# What it is',
      'IIFE stands for Immediately Invoked Function Expression: a function that is defined and called in the same step.',
      'Syntax: `(function () { ... })();` or with an arrow: `(() => { ... })();`.',
      'The outer parentheses turn the function into an expression (a value), so it can be called immediately with `()`. Without them, `function () {}()` is a syntax error because it would be parsed as a declaration.',
      'Why it was popular (before ES6, 2015):',
      '  `var` only had function scope and there were no modules, so all scripts on a page shared one global scope.',
      '  An IIFE created a private scope so variables did not leak into globals and clash with other scripts.',
      '  It was the base of the "module pattern" for private state.',
      '  It fixed the `var` + loop + callback bug by capturing the loop variable per iteration.',
      'Today, `let`/`const` block scope and ES modules solve most of this, but IIFEs still appear.',
      '# How it works',
      'The parser sees `(` and parses what follows as an expression, creating a function value.',
      'The trailing `()` calls it right away; arguments can be passed in, like `(function (win) {})(window)`.',
      'Variables declared inside live in that call\'s scope and vanish when it ends, unless something returned keeps them alive via a closure.',
      'The return value can be stored: `const api = (() => { ... return {...}; })();`.',
      'Async IIFE: `(async () => { await main(); })();` lets you use `await` in a CommonJS file, where top-level `await` is not allowed.',
      '# Example walkthrough',
      'The first IIFE declares `secret` and prints it; outside, `typeof secret` is `"undefined"` because it never leaked.',
      '`counter` is the object returned by an IIFE; its `next()` method closes over the private `n`, printing 1 then 2.',
      'The async IIFE awaits a resolved promise and prints `"done"`. The `.catch` makes sure an error would not become an unhandled rejection.',
      '# Why it matters / when to use',
      'Running async startup code in CommonJS Node scripts: `(async () => { await db.connect(); app.listen(3000); })()`.',
      'Bundlers like Webpack and esbuild wrap modules in function wrappers similar to IIFEs; you will see them in build output.',
      'One-off initialisation that computes a `const` value with several steps.',
      '# Common mistakes',
      'Forgetting the semicolon on the previous line, so `a = b\\n(function(){})()` is parsed as calling `b`. Fix: use semicolons, or start the IIFE line with `;`.',
      'Not handling errors in an async IIFE, which causes an unhandled promise rejection. Fix: add `.catch()` or a try/catch inside.',
      'Using IIFEs in modern ES module code just for privacy. Fix: module scope is already private.',
      '# Say this in the interview',
      '"An IIFE is a function expression that is invoked immediately, like `(function () { ... })()`. Before ES6 it was the main way to create a private scope, avoid polluting globals, implement the module pattern, and capture loop variables. Today block scope and modules cover most of that, but I still use an async IIFE to run top-level async code in CommonJS."',
      'Follow-up: Why the wrapping parentheses?',
      '  They force the function to be parsed as an expression rather than a declaration, so it can be called immediately.',
      'Follow-up: Do you need IIFEs in ES modules?',
      '  Rarely; module scope is private and top-level `await` is allowed.',
    ],
    code: `(function () {
  var secret = "hidden";       // private to this IIFE
  console.log(secret);         // → "hidden"
})();
console.log(typeof secret);    // → "undefined" (did not leak)

// IIFE returning an API (the module pattern)
const counter = (() => {
  let n = 0;                   // private state
  return { next: () => ++n };
})();
console.log(counter.next());   // → 1
console.log(counter.next());   // → 2

// Async IIFE: top-level await in a CommonJS script
(async () => {
  const value = await Promise.resolve("done");
  console.log(value);          // → "done"
})().catch((err) => {
  console.error(err);          // avoid unhandled rejections
});`,
  },
  {
    id: 'module-pattern',
    group: 'Scope & Closures',
    stars: 3,
    difficulty: 'Medium',
    q: 'How can closures be used to create private variables (module pattern)?',
    a: [
      '# ELI5',
      'Think of a bank teller behind glass. You cannot reach into the vault yourself; you can only ask the teller to deposit, withdraw or tell you your balance.',
      'The teller follows the rules (for example, no withdrawing more than you have), so the money stays safe.',
      'Mapping back: the vault is a private variable inside a function, the teller window is the object of methods the function returns, and closures let those methods reach the vault.',
      '# What it is',
      'The module pattern uses a function scope plus closures to hide data and expose only a public API (the set of functions others are allowed to call).',
      'Private variables are declared inside the function; they cannot be accessed from outside.',
      'The function returns an object whose methods close over those private variables, so only those methods can read or change them.',
      'Encapsulation means hiding internal details and only allowing access through controlled methods. The module pattern achieves encapsulation without classes.',
      'Variants:',
      '  Classic module: an IIFE that runs once and returns a single object (a singleton).',
      '  Factory function: a normal function you call many times to create many independent objects, each with its own private state.',
      '  Revealing module: define all functions privately, then return an object that "reveals" chosen ones by name.',
      'Modern alternatives: ES modules (non-exported variables are private to the file) and class private fields (`#balance`).',
      '# How it works',
      'Call the outer function (or IIFE):',
      '  Its local variables are created in a fresh scope.',
      '  Inner functions are created, each linked to that scope.',
      'Return an object containing only the inner functions you want public.',
      'The outer function finishes, but the scope stays alive because the returned methods reference it.',
      'Code outside can only use the returned methods; there is no syntax to reach the private variables directly.',
      '# Example walkthrough',
      '`createAccount(100)` creates a private `balance = 100` and a private `log` array.',
      '`acct.deposit(50)` updates the private balance; `acct.getBalance()` prints `150`.',
      '`acct.withdraw(500)` throws `"Insufficient funds"`, showing the API can enforce rules.',
      '`acct.balance` is `undefined`: the data is not a property of the returned object.',
      '`acct.history()` returns a copy of `log`, so callers cannot mutate the internal array.',
      '# Why it matters / when to use',
      'Wrapping a resource in a Node service, like a rate limiter or in-memory cache, so nothing else can corrupt its internal map.',
      'Creating SDK clients: `createClient({ apiKey })` keeps the key private and exposes `get`/`post` methods.',
      'Understanding older libraries (jQuery, old browser code) that were built with this pattern.',
      '# Common mistakes',
      'Returning the internal array or object directly, which lets callers mutate private state. Fix: return a copy (`[...log]`).',
      'Expecting `this` inside returned arrow functions to point to the object. Fix: the pattern does not need `this`; use the closed-over variables.',
      'Memory cost with many instances: each object gets its own copies of the methods, unlike class methods shared on the prototype. Fine for most cases; use classes when creating many thousands.',
      '# Say this in the interview',
      '"The module pattern uses a function scope to hold private variables and returns an object of methods that close over them. Outside code can only interact through those methods, which gives real encapsulation. Today I would often use ES modules or class `#private` fields, but factory functions with closures are still a clean way to build things like clients or caches."',
      'Follow-up: Classic module vs factory function?',
      '  A classic module is an IIFE that creates one instance; a factory is a normal function you call to create many instances.',
      'Follow-up: How is this different from `#private` fields?',
      '  Private fields are per-instance slots enforced by the class syntax, with methods shared on the prototype; closures give each object its own method copies.',
    ],
    code: `function createAccount(initial) {
  let balance = initial;        // private
  const log = [];               // private

  function record(type, amount) {
    log.push(type + ":" + amount);
  }

  return {
    deposit(amount) { balance += amount; record("dep", amount); },
    withdraw(amount) {
      if (amount > balance) throw new Error("Insufficient funds");
      balance -= amount;
      record("wd", amount);
    },
    getBalance() { return balance; },
    history() { return [...log]; },   // return a copy, not the original
  };
}

const acct = createAccount(100);
acct.deposit(50);
console.log(acct.getBalance()); // → 150
try { acct.withdraw(500); } catch (e) { console.log(e.message); } // → "Insufficient funds"
console.log(acct.balance);      // → undefined (private)
console.log(acct.history());    // → [ "dep:50" ]`,
  },
  {
    id: 'block-vs-function-scope',
    group: 'Scope & Closures',
    stars: 3,
    difficulty: 'Easy',
    q: 'What is the difference between block scope and function scope?',
    a: [
      '# ELI5',
      'Imagine a house (a function) with several rooms (blocks).',
      'A note stuck on the fridge with "house rules" (function scope) is visible from every room in the house.',
      'A note left on a desk in one bedroom (block scope) is only visible inside that bedroom.',
      'Mapping back: `var` writes house-wide notes; `let` and `const` write room-only notes.',
      '# What it is',
      'A block is any code wrapped in curly braces `{ }`: the body of `if`, `for`, `while`, `try`, or a bare `{ }`.',
      'Function scope: a variable is visible anywhere inside the function where it is declared, regardless of blocks. `var` and function parameters are function-scoped.',
      'Block scope: a variable is visible only inside the nearest enclosing block. `let`, `const` and `class` are block-scoped.',
      'Comparison, row by row:',
      '  Declared with: function scope = `var`; block scope = `let`, `const`, `class`.',
      '  Boundary: function scope = the whole function body; block scope = the nearest `{ }`.',
      '  Leaks out of `if`/`for`: `var` yes; `let`/`const` no.',
      '  Loop behaviour: `var` shares one variable across iterations; `let` gets a fresh one each iteration.',
      'Function declarations inside blocks are block-scoped in strict mode (and in modules), but have odd legacy behaviour in sloppy mode; avoid declaring functions inside blocks.',
      '# How it works',
      'When a function runs, the engine creates one function-level environment where all `var` declarations from anywhere in the body live.',
      'Each time execution enters a block that contains `let`/`const`, the engine creates a new block-level environment linked to the outer one.',
      'When the block ends, that block environment is dropped (unless a closure still references it).',
      'Lookups walk from the innermost block environment outward to the function environment, then to outer scopes.',
      '# Example walkthrough',
      'Inside `scopes()`, `var fn` is declared inside an `if` block but prints `"function-scoped"` after the block.',
      '`let blk` is also declared in that block, but `typeof blk` after the block prints `"undefined"`.',
      'The `for (var i ...)` loop leaves `i` equal to `3` after the loop; the `for (let j ...)` loop leaves no `j` behind.',
      'The bare `{ }` block shows you can create a block anywhere just to limit a temporary variable.',
      '# Why it matters / when to use',
      'Smaller scopes mean fewer accidental collisions and easier reasoning in long request handlers.',
      'Per-iteration loop bindings with `let` make async callbacks inside loops behave correctly.',
      'Temporary variables (like a parsed body in a `try` block) do not leak into the rest of the function.',
      '# Common mistakes',
      'Declaring a variable with `let` inside `try { }` and then trying to use it after the block. Fix: declare it before the `try` with `let result;`.',
      'Using `var` in loops and getting the "all callbacks see the last value" bug. Fix: use `let`.',
      'Re-declaring the same `var` in two blocks thinking they are separate. Fix: they are the same variable; use `let`.',
      '# Say this in the interview',
      '"Function scope means a variable is visible throughout the function it is declared in; that is how `var` and parameters work. Block scope limits a variable to the nearest pair of curly braces; that is `let`, `const` and `class`. Block scope prevents leaks out of if and loop bodies and gives `let` a new binding per loop iteration, which is why I prefer it."',
      'Follow-up: Is a `try` block a block scope?',
      '  Yes, `let`/`const` inside `try { }` are not visible after it; declare them before the `try` if needed outside.',
      'Follow-up: Does `var` respect block scope?',
      '  No, `var` ignores blocks and is scoped to the enclosing function (or global/module).',
    ],
    code: `function scopes() {
  if (true) {
    var fn = "function-scoped";
    let blk = "block-scoped";
  }
  console.log(fn);           // → "function-scoped"
  console.log(typeof blk);   // → "undefined" (gone after the block)

  for (var i = 0; i < 3; i++) {}
  console.log(i);            // → 3 (var leaked out of the loop)

  for (let j = 0; j < 3; j++) {}
  console.log(typeof j);     // → "undefined"

  {
    const temp = 42;         // bare block to limit a temp variable
    console.log(temp);       // → 42
  }
  console.log(typeof temp);  // → "undefined"
}
scopes();

// Common fix: declare before try if you need it after
let data;
try { data = JSON.parse('{"ok":true}'); } catch { data = null; }
console.log(data);           // → { ok: true }`,
  },
  {
    id: 'closure-memory-leaks',
    group: 'Scope & Closures',
    stars: 2,
    difficulty: 'Hard',
    q: 'Can closures cause memory leaks?',
    a: [
      '# ELI5',
      'Imagine you borrow one book from the library but the librarian says you must keep the whole shelf at home as long as you hold that book.',
      'If you never return the book, the whole shelf stays in your house forever, taking up space.',
      'Mapping back: a long-lived function (the book) keeps its whole surrounding scope (the shelf) in memory. If the function is never released, neither is the data.',
      '# What it is',
      'A memory leak is memory your program no longer needs but cannot free, so usage keeps growing over time.',
      'JavaScript uses garbage collection (GC): the engine automatically frees objects that are no longer reachable from "roots" like global variables and the currently running code.',
      'Closures do not leak by themselves. They keep their captured variables reachable only as long as the closure itself is reachable.',
      'A leak happens when a closure is accidentally kept alive forever (stored in a global, a cache, an event listener or a timer) and it references large data.',
      'Typical leak sources in Node.js:',
      '  Event listeners added on every request to a long-lived emitter and never removed.',
      '  `setInterval` callbacks that are never cleared.',
      '  Global caches (a `Map` or object) that grow without limit and store closures or request objects.',
      '  Closures capturing a big object (like a whole `req` or a large buffer) when they only need one field.',
      '# How it works',
      'The garbage collector starts from roots and marks everything it can reach; anything unmarked is freed (the "mark and sweep" approach).',
      'A closure holds a reference to its environment record.',
      '  If the closure is reachable, its environment and everything in it is reachable.',
      '  V8 (the engine in Chrome and Node) usually keeps only variables that inner functions actually use, but closures created in the same scope may share one environment, so one long-lived closure can keep variables used by a sibling closure alive.',
      'So the chain is: root (e.g. emitter listener list) → closure → environment → large object. Break any link and the GC can free it.',
      'Tools to find leaks: Chrome DevTools heap snapshots (`node --inspect`), `process.memoryUsage()`, and `--heapsnapshot-signal`.',
      '# Example walkthrough',
      '`leakyHandler` creates a 10 MB buffer and registers a listener on a global `emitter` that references it; the listener is never removed.',
      'Calling `leakyHandler` 5 times adds 5 listeners, each keeping its own buffer alive: memory grows with every call.',
      '`emitter.listenerCount("tick")` prints `5`, confirming the build-up (Node also warns once there are more than 10 listeners).',
      '`safeHandler` copies only the small value it needs (`size`), uses `once` so the listener removes itself after firing, and the buffer can be collected.',
      'A `WeakMap` cache keyed by an object lets the entry disappear when the key object is no longer used elsewhere.',
      '# Why it matters / when to use',
      'Node servers run for days; a small leak per request eventually crashes the process with "JavaScript heap out of memory".',
      'Memory leaks show up as steadily rising memory graphs in production monitoring and frequent container restarts.',
      '# Common mistakes',
      'Adding listeners inside request handlers without removing them. Fix: use `once`, call `off`/`removeListener`, or use an `AbortSignal` to remove them.',
      'Forgetting `clearInterval`/`clearTimeout`. Fix: store the timer id and clear it on shutdown or when done.',
      'Unbounded caches. Fix: use an LRU cache with a max size or TTL, or a `WeakMap` when keys are objects.',
      'Capturing an entire request in a callback that is stored long-term. Fix: extract just the fields you need into local variables.',
      '# Say this in the interview',
      '"Closures do not leak on their own, but they keep their captured scope alive as long as the closure is reachable. Leaks happen when a closure is unintentionally kept alive, for example in an event listener, an uncleared interval, or a global cache, and it references large data. I avoid it by removing listeners, clearing timers, bounding caches, and capturing only what is needed, and I diagnose with heap snapshots."',
      'Follow-up: How do you find a memory leak in Node?',
      '  Run with `--inspect`, take heap snapshots in Chrome DevTools over time, and compare which objects keep growing and what retains them.',
      'Follow-up: When would you use a `WeakMap`?',
      '  To attach data to objects without preventing them from being garbage collected.',
    ],
    code: `const { EventEmitter } = require("node:events");
const emitter = new EventEmitter();   // lives for the whole process
emitter.setMaxListeners(20);          // silence the warning for this demo

function leakyHandler() {
  const big = Buffer.alloc(10 * 1024 * 1024);   // 10 MB
  emitter.on("tick", () => big.length);         // closure keeps big alive
}                                               // listener never removed!

for (let i = 0; i < 5; i++) leakyHandler();
console.log(emitter.listenerCount("tick"));     // → 5 (5 x 10 MB retained)

function safeHandler() {
  const big = Buffer.alloc(10 * 1024 * 1024);
  const size = big.length;                      // capture only what is needed
  emitter.once("done", () => console.log(size)); // auto-removed after firing
}
safeHandler();
emitter.emit("done");                           // → 10485760
console.log(emitter.listenerCount("done"));     // → 0

// WeakMap: entries vanish when the key object is no longer referenced
const meta = new WeakMap();
let req = { id: 1 };
meta.set(req, { startedAt: Date.now() });
req = null;                                     // entry is now collectable`,
  },
  {
    id: 'globalthis',
    group: 'Scope & Closures',
    stars: 1,
    difficulty: 'Easy',
    q: 'What is `globalThis`?',
    a: [
      '# ELI5',
      'Different countries have different names for the town hall: "City Hall", "Rathaus", "Mairie". If you travel a lot, you would love one word that works everywhere.',
      'Mapping back: browsers call the global object `window`, Node calls it `global`, web workers call it `self`; `globalThis` is the one name that works in all of them.',
      '# What it is',
      'The global object is a special object whose properties are available everywhere, like `setTimeout`, `console` and `JSON`.',
      'Historically each environment named it differently:',
      '  Browsers: `window` (and `self`, `frames`).',
      '  Web workers: `self`.',
      '  Node.js: `global`.',
      '`globalThis` (standardised in ES2020) is a universal reference to the global object in every JavaScript environment.',
      'It is useful when writing code that runs in several environments, like libraries shared between the browser and Node.',
      '# How it works',
      'The engine defines `globalThis` as a property of the global object that points back to itself.',
      'Reading `globalThis.x` reads the global property `x`; writing `globalThis.x = 1` creates a global property.',
      'Which declarations become properties of the global object:',
      '  `var` and function declarations at the top level of a classic browser script: yes.',
      '  `let`, `const`, `class` at the top level: no; they are global variables but not properties of the global object.',
      '  Anything at the top level of a Node CommonJS file or any ES module: no, because those have their own module scope.',
      '# Example walkthrough',
      '`globalThis === global` prints `true` in Node.',
      '`typeof window` prints `"undefined"` in Node, so code that uses `window` directly would crash there; `globalThis` is safe.',
      '`globalThis.appName = "demo"` creates a global; a function can then read `appName` without importing anything (which is exactly why globals should be rare).',
      'The `isBrowser` check uses `typeof globalThis.document` to detect the environment safely.',
      '# Why it matters / when to use',
      'Writing isomorphic code (runs in both browser and server), such as feature detection for `fetch` or `crypto`.',
      'Polyfills (code that adds a missing feature) attach themselves to `globalThis`.',
      'In Next.js and similar frameworks, a common trick is caching a database client on `globalThis` in development so hot reloads do not open new connections every time.',
      '# Common mistakes',
      'Polluting the global object with app data. Fix: prefer module exports or dependency injection; globals make testing hard.',
      'Assuming a top-level `let`/`var` in a Node module becomes a global. Fix: it is module-scoped; use `globalThis.x` explicitly if you truly need a global.',
      'Using `window` in server-side code. Fix: check `typeof window !== "undefined"` or use `globalThis`.',
      '# Say this in the interview',
      '"`globalThis` is the standard, environment-independent way to access the global object: it equals `window` in browsers, `self` in workers and `global` in Node. It is mainly useful for cross-environment libraries, polyfills and things like caching a single database client across hot reloads."',
      'Follow-up: Does a top-level `const` become a property of `globalThis`?',
      '  No, only top-level `var` and function declarations in classic scripts do.',
    ],
    code: `// In Node.js
console.log(globalThis === global);        // → true
console.log(typeof window);                // → "undefined" (no window in Node)

globalThis.appName = "demo";               // creates a global property
function readGlobal() {
  return appName;                          // found on the global object
}
console.log(readGlobal());                 // → "demo"

const isBrowser = typeof globalThis.document !== "undefined";
console.log(isBrowser);                    // → false (in Node)

// Common dev pattern: reuse one DB client across hot reloads
const g = globalThis;
g.__db = g.__db ?? { connectedAt: Date.now() };
console.log(typeof g.__db.connectedAt);    // → "number"

let notGlobal = 1;                         // module-scoped, not on globalThis
console.log(globalThis.notGlobal);         // → undefined`,
  },

  // ───────────────────────── this & Functions ─────────────────────────
  {
    id: 'this-keyword',
    group: 'this & Functions',
    stars: 5,
    difficulty: 'Medium',
    q: 'How is `this` determined in JavaScript?',
    a: [
      '# ELI5',
      'The word "me" means different people depending on who is speaking. When Sam says "me", it means Sam; when Priya says "me", it means Priya.',
      'Regular functions are like that: `this` means "whoever is calling me right now".',
      'Arrow functions are different: they are like a kid repeating what their parent said. They do not have their own "me"; they use the one from where they were written.',
      'Mapping back: for regular functions, `this` is decided at call time by how the function is called; arrow functions inherit `this` from the surrounding code.',
      '# What it is',
      '`this` is a special keyword inside a function that refers to an object: the context the function is working with.',
      'For regular functions, `this` is not fixed when the function is written; it is set each time the function is called, based on the call site (the way the call is written).',
      'There are 4 binding rules plus arrows, in order of priority (highest first):',
      '  `new` binding: `new Foo()` sets `this` to the brand-new object being created.',
      '  Explicit binding: `fn.call(obj)`, `fn.apply(obj)` or `fn.bind(obj)` set `this` to `obj`.',
      '  Implicit binding: `obj.method()` sets `this` to `obj`, the object before the dot.',
      '  Default binding: a plain call `fn()` sets `this` to `undefined` in strict mode, or the global object in sloppy mode.',
      '  Arrow functions ignore all of these and use `this` from the enclosing scope (lexical `this`).',
      'Other contexts:',
      '  At the top level of an ES module, `this` is `undefined`; in a CommonJS file it is `module.exports`.',
      '  In a DOM event listener written as a regular function, `this` is the element.',
      '  In class methods, `this` is the instance when called as `instance.method()`.',
      '# How it works',
      'When a regular function is called, the engine creates an execution context and decides `this` like this:',
      '  Was it called with `new`? Then `this` is a new object.',
      '  Was it called via `call`/`apply`, or is it a bound function? Then `this` is the provided object.',
      '  Was it called as a property of an object (`obj.fn()`)? Then `this` is that object.',
      '  Otherwise, `this` is `undefined` (strict) or `globalThis` (sloppy).',
      'Arrow functions do not get their own `this` at all; the engine looks up `this` through the scope chain like a normal variable.',
      'Important: the rule checks how the function is called, not where it is defined. Copying `obj.method` into a variable and calling it plainly loses the implicit binding.',
      '# Example walkthrough',
      '`user.greet()` prints `"Hi, Ann"`: implicit binding, `this` is `user`.',
      '`const g = user.greet; g()` throws `TypeError` (strict mode, `this` is `undefined`, so reading `this.name` fails). This is "losing `this`".',
      '`user.greet.call({ name: "Bob" })` prints `"Hi, Bob"`: explicit binding.',
      '`new Person("Cara")` creates an object with `name = "Cara"`: `new` binding.',
      'In `timer.start()`, the arrow function inside `setTimeout` uses the `this` of `start`, which is `timer`, so it prints `1`.',
      '# Why it matters / when to use',
      'Passing methods as callbacks (for example `app.get("/", controller.handle)`) loses `this` and causes "Cannot read properties of undefined" errors. Fix with `bind` or an arrow wrapper.',
      'Class-based services and controllers rely on `this` to reach injected dependencies like `this.db`.',
      'Arrow functions inside methods are the standard way to keep `this` in callbacks (`.map`, `setTimeout`, promise `.then`).',
      '# Common mistakes',
      'Using an arrow function as an object method and expecting `this` to be the object. Fix: use regular method syntax `greet() {}`.',
      'Passing `obj.method` as a callback. Fix: pass `obj.method.bind(obj)` or `() => obj.method()`.',
      'Assuming `this` refers to the function itself. It never does; it refers to the call context.',
      '# Say this in the interview',
      '"For regular functions, `this` is decided at call time. In priority order: with `new` it is the new object; with call, apply or bind it is the object you pass; when called as `obj.method()` it is `obj`; otherwise it is undefined in strict mode or the global object in sloppy mode. Arrow functions have no own `this` and take it lexically from the surrounding scope, which is why they are great for callbacks inside methods."',
      'Follow-up: Why does passing a method as a callback break `this`?',
      '  The callback is later called as a plain function, so implicit binding no longer applies; bind it or wrap it in an arrow.',
      'Follow-up: Can you change an arrow function\'s `this` with `call`?',
      '  No, `call`/`apply`/`bind` cannot change an arrow function\'s `this`.',
    ],
    code: `"use strict";
const user = {
  name: "Ann",
  greet() { return "Hi, " + this.name; },
};

console.log(user.greet());                 // → "Hi, Ann" (implicit: this = user)

const g = user.greet;                      // detached from the object
try { g(); } catch (e) { console.log(e.name); } // → "TypeError" (this is undefined)

console.log(user.greet.call({ name: "Bob" })); // → "Hi, Bob" (explicit)

function Person(name) { this.name = name; }
const p = new Person("Cara");              // new: this = fresh object
console.log(p.name);                       // → "Cara"

const timer = {
  ticks: 0,
  start() {
    setTimeout(() => {                     // arrow uses start()'s this
      this.ticks++;
      console.log(this.ticks);             // → 1
    }, 0);
  },
};
timer.start();`,
  },
  {
    id: 'call-apply-bind',
    group: 'this & Functions',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is the difference between `call`, `apply` and `bind`?',
    a: [
      '# ELI5',
      'Imagine a chef (a function) who can cook in anyone\'s kitchen. You can tell the chef "cook in Ann\'s kitchen right now, here are the ingredients one by one" (`call`).',
      'Or "cook in Ann\'s kitchen right now, here is a bag with all the ingredients" (`apply`).',
      'Or "here is a phone number: whenever someone calls it later, cook in Ann\'s kitchen" (`bind`).',
      'Mapping back: the kitchen is `this`, the ingredients are the arguments, and `bind` returns a new function to use later instead of running right away.',
      '# What it is',
      'All three are methods every function has, used to control what `this` is when the function runs.',
      'Comparison, row by row:',
      '  `fn.call(thisArg, a, b)`: calls `fn` immediately; arguments passed one by one.',
      '  `fn.apply(thisArg, [a, b])`: calls `fn` immediately; arguments passed as an array (or array-like).',
      '  `fn.bind(thisArg, a)`: does NOT call `fn`; returns a new function with `this` permanently set and optionally some arguments pre-filled.',
      'A memory trick: "Apply takes an Array, Call takes Commas".',
      'Partial application means fixing some arguments of a function now and providing the rest later; `bind` supports this.',
      'A bound function\'s `this` cannot be changed again by another `bind`, `call` or `apply`. The only exception is calling it with `new`, which still creates a new object.',
      '# How it works',
      '`call` and `apply`:',
      '  The engine runs the function right away with `this` set to `thisArg`.',
      '  In strict mode `thisArg` is used as-is; in sloppy mode `null`/`undefined` become the global object and primitives get wrapped in objects.',
      '`bind`:',
      '  The engine creates a "bound function" object that remembers the target function, `thisArg` and any pre-filled arguments.',
      '  When the bound function is later called, it calls the target with the saved `this` and the saved arguments followed by the new ones.',
      'With modern spread syntax, `fn.apply(obj, args)` can be written `fn.call(obj, ...args)`, so `apply` is less common now.',
      '# Example walkthrough',
      '`introduce.call(ann, "Hello", "!")` prints `"Hello, I am Ann!"`.',
      '`introduce.apply(ann, ["Hey", "?"])` prints `"Hey, I am Ann?"`: same, but arguments in an array.',
      '`const annHi = introduce.bind(ann, "Hi")` returns a function; calling `annHi(".")` prints `"Hi, I am Ann."`.',
      '`annHi.call(bob, "!")` still prints Ann: bound `this` cannot be overridden.',
      '`Math.max.apply(null, nums)` and `Math.max(...nums)` both print `9`.',
      '# Why it matters / when to use',
      'Fixing lost `this` when passing class methods as callbacks: `router.get("/users", controller.list.bind(controller))`.',
      'Borrowing methods: `Array.prototype.slice.call(arguments)` turns the array-like `arguments` into a real array (today you would use `Array.from`).',
      'Partial application: `const logError = log.bind(null, "ERROR")` creates a pre-configured logger.',
      '# Common mistakes',
      'Using `bind` and expecting the function to run. Fix: `bind` only returns a new function; call it afterwards.',
      'Trying to rebind an arrow function or an already-bound function. Fix: neither can change `this`; use a regular unbound function.',
      'Calling `bind` inside a render or hot loop, creating new functions each time. Fix: bind once (for example in the constructor) or use class field arrow functions.',
      '# Say this in the interview',
      '"All three set `this` explicitly. `call` invokes the function immediately with arguments listed one by one, `apply` invokes it immediately with arguments as an array, and `bind` does not invoke it but returns a new function with `this` and optionally some arguments permanently fixed. I mostly use `bind` to keep `this` when passing methods as callbacks, and spread has largely replaced `apply`."',
      'Follow-up: Can you re-bind a bound function?',
      '  No, the first bind wins; later `bind`, `call` or `apply` cannot change its `this`.',
      'Follow-up: What happens with `new` on a bound function?',
      '  The bound `this` is ignored and a new object is created, but pre-filled arguments still apply.',
    ],
    code: `function introduce(greeting, punct) {
  return greeting + ", I am " + this.name + punct;
}
const ann = { name: "Ann" };
const bob = { name: "Bob" };

console.log(introduce.call(ann, "Hello", "!"));    // → "Hello, I am Ann!"
console.log(introduce.apply(ann, ["Hey", "?"]));   // → "Hey, I am Ann?"

const annHi = introduce.bind(ann, "Hi");           // not called yet
console.log(annHi("."));                           // → "Hi, I am Ann."
console.log(annHi.call(bob, "!"));                 // → "Hi, I am Ann!" (bind wins)

const nums = [3, 9, 2];
console.log(Math.max.apply(null, nums));           // → 9
console.log(Math.max(...nums));                    // → 9 (modern way)

// Fixing a lost "this" for a callback
class Controller {
  constructor() { this.items = ["a", "b"]; }
  list() { return this.items.length; }
}
const ctrl = new Controller();
const handler = ctrl.list.bind(ctrl);              // safe to pass around
console.log(handler());                            // → 2`,
  },
  {
    id: 'arrow-vs-regular-functions',
    group: 'this & Functions',
    stars: 5,
    difficulty: 'Easy',
    q: 'How do arrow functions differ from regular functions?',
    a: [
      '# ELI5',
      'A regular function is like a full employee: it has its own ID badge (`this`), its own notebook of everything you said (`arguments`), and it can train new employees (`new`).',
      'An arrow function is like a helpful assistant who borrows the badge of whoever they are standing next to, has no notebook, and cannot train anyone.',
      'The assistant is perfect for quick tasks next to their boss, but not for being the boss.',
      'Mapping back: arrow functions are short, lightweight functions that take `this` and `arguments` from the surrounding code and cannot be constructors.',
      '# What it is',
      'Arrow functions were added in ES6 (2015) with the syntax `(a, b) => a + b`.',
      'Comparison, row by row:',
      '  `this`: regular = decided by how it is called; arrow = inherited from the enclosing scope (lexical) and cannot be changed.',
      '  `arguments` object: regular = has its own; arrow = none (use rest parameters `...args`).',
      '  `new`: regular (and `function` declarations) = can be used as constructors; arrow = `TypeError: not a constructor`.',
      '  `prototype` property: regular = has one; arrow = none.',
      '  Hoisting: function declarations are hoisted fully; arrows follow their `const`/`let` variable rules.',
      '  `call`/`apply`/`bind`: can change `this` for regular functions; cannot for arrows (arguments still work).',
      '  Syntax: arrows allow a concise body with an implicit return: `x => x * 2`.',
      '  Duplicate parameter names and use as generators (`function*`): allowed only for regular functions (generators cannot be arrows).',
      '# How it works',
      'When a regular function is called, the engine creates a new `this` binding and an `arguments` object for that call.',
      'When an arrow function is called, the engine skips both. Any mention of `this` or `arguments` inside it is looked up in the outer scope, like a normal variable.',
      'Implicit return rules:',
      '  `x => x * 2` returns the expression.',
      '  `x => { x * 2 }` returns `undefined` because braces start a block body.',
      '  To return an object literal, wrap it in parentheses: `() => ({ ok: true })`.',
      '# Example walkthrough',
      '`obj.regular()` prints `"obj"` because `this` is the object before the dot.',
      '`obj.arrow()` prints `undefined` because the arrow took `this` from the module scope, not from `obj`.',
      'Inside `obj.delayed()`, the arrow callback in `setTimeout` correctly prints `"obj"` because it inherits `this` from `delayed`.',
      '`new Arrow()` throws `TypeError` because arrows are not constructors.',
      '`sumAll(1, 2, 3)` prints `6` using rest parameters, since arrows have no `arguments`.',
      '`makeUser()` returns an object because the body is wrapped in parentheses.',
      '# Why it matters / when to use',
      'Use arrows for callbacks: `.map`, `.filter`, `setTimeout`, promise chains, and Express route handlers that do not need their own `this`.',
      'Use regular functions (or method syntax) for object methods, class prototype methods, constructors and generators.',
      'Class field arrows (`handle = () => {}`) give each instance a method permanently bound to it, handy for event handlers.',
      '# Common mistakes',
      'Defining object methods as arrows and getting `undefined` for `this`. Fix: use method shorthand `greet() {}`.',
      'Forgetting parentheses when returning an object literal. Fix: `() => ({ a: 1 })`.',
      'Using `arguments` inside an arrow and accidentally reading the outer function\'s arguments. Fix: use `...args`.',
      '# Say this in the interview',
      '"Arrow functions are a shorter syntax, but the key difference is that they do not have their own `this`, `arguments`, `super` or `prototype`: they inherit `this` lexically from where they are defined, and they cannot be used with `new`. That makes them ideal for callbacks inside methods, while regular functions are better for object methods, constructors and anything that needs dynamic `this`."',
      'Follow-up: Can you bind an arrow function?',
      '  You can call `bind`, but it cannot change `this`; only pre-filled arguments take effect.',
      'Follow-up: Why not use arrows for object methods?',
      '  Because their `this` would be the outer scope, not the object.',
    ],
    code: `const obj = {
  name: "obj",
  regular() { return this.name; },         // this = obj when called as obj.regular()
  arrow: () => this?.name,                 // arrow: this comes from the module scope
  delayed() {
    setTimeout(() => console.log(this.name), 0); // inherits delayed()'s this
  },
};
console.log(obj.regular());  // → "obj"
console.log(obj.arrow());    // → undefined
obj.delayed();               // → "obj" (printed after the current code)

const Arrow = () => {};
try { new Arrow(); } catch (e) { console.log(e.message); } // → "Arrow is not a constructor"
console.log(Arrow.prototype); // → undefined

const sumAll = (...nums) => nums.reduce((a, b) => a + b, 0); // no arguments object
console.log(sumAll(1, 2, 3)); // → 6

const makeUser = () => ({ ok: true }); // parentheses return an object
console.log(makeUser());      // → { ok: true }
const oops = () => { ok: true };       // block body + label: returns undefined
console.log(oops());          // → undefined`,
  },
  {
    id: 'bind-polyfill',
    group: 'this & Functions',
    stars: 4,
    difficulty: 'Hard',
    q: 'Write a polyfill for `Function.prototype.bind`.',
    a: [
      '# ELI5',
      'Imagine making a speed-dial button on a phone. You record "call Grandma, and say Happy Birthday first". Later, pressing the button does exactly that, plus anything extra you say.',
      'Building `bind` yourself is building that speed-dial machine: it remembers who to call (`this`) and what to say first (pre-filled arguments).',
      'Mapping back: the polyfill returns a new function that, when called, runs the original with the saved `this` and the saved arguments plus new ones.',
      '# What it is',
      'A polyfill is code that implements a built-in feature yourself, either for old environments that lack it or to show you understand how it works.',
      'The task is to add a method, often named `myBind`, to `Function.prototype` so that every function gets it, just like the real `bind`.',
      'Requirements a good answer covers:',
      '  Return a new function; do not call the original right away.',
      '  Use the saved `thisArg` as `this` when the new function is called.',
      '  Support partial application: arguments given to `myBind` come first, then arguments given at call time.',
      '  Keep the return value of the original function.',
      '  Bonus: if the bound function is called with `new`, ignore the saved `this` and create a proper instance whose prototype is the original function\'s `prototype`.',
      '  Bonus: throw a `TypeError` if `myBind` is called on something that is not a function.',
      '`Function.prototype` is the shared object that all functions inherit methods like `call` and `apply` from.',
      '# How it works',
      'Inside `myBind`, `this` is the original function (because we call it as `fn.myBind(...)`, implicit binding).',
      'Save three things in a closure: the original function, `thisArg`, and the pre-filled arguments.',
      'Return a new function `bound(...later)`:',
      '  If it was called with `new` (check `new.target`, which is set only for constructor calls), call the original with `new` and all arguments.',
      '  Otherwise, call `original.apply(thisArg, [...preset, ...later])` and return the result.',
      'Copy the `prototype` link so `instanceof` keeps working with bound constructors (the native `bind` handles this internally).',
      '# Example walkthrough',
      '`greet.myBind(ann, "Hello")` returns `bound`; nothing runs yet.',
      '`hello("!")` runs `greet` with `this = ann` and arguments `"Hello", "!"`, printing `"Hello, Ann!"`.',
      '`BoundPoint = Point.myBind(null, 1)` pre-fills `x = 1`; `new BoundPoint(2)` detects `new.target`, builds a real `Point`, so it prints `1 2 true`.',
      'Calling `myBind` on a non-function (`Function.prototype.myBind.call(42)`) throws `TypeError`.',
      '# Why it matters / when to use',
      'It is a classic interview question that tests `this`, closures, rest/spread, `apply` and `new` in one go.',
      'Understanding it explains why bound functions cannot be rebound: the saved `thisArg` is baked into the closure.',
      'In real code you just use the native `bind`; never ship your own polyfill for features every runtime supports.',
      '# Common mistakes',
      'Calling the function inside `myBind` instead of returning a new function. Fix: return `function bound(...) {}`.',
      'Forgetting to merge preset and later arguments. Fix: `[...preset, ...later]`.',
      'Using an arrow for `myBind` itself, which breaks because `this` would not be the original function. Fix: define `myBind` with `function`.',
      'Forgetting to `return` the original function\'s result. Fix: return the value of `apply`.',
      '# Say this in the interview',
      '"`bind` returns a new function that remembers a `this` value and some leading arguments. My polyfill stores the original function, `thisArg` and the preset arguments in a closure, then returns a function that calls `original.apply(thisArg, [...preset, ...args])` and returns the result. For completeness I check `new.target` so that using the bound function as a constructor creates a real instance instead of using the bound `this`."',
      'Follow-up: Why must `myBind` be a regular function, not an arrow?',
      '  Because inside it we need `this` to be the function `myBind` was called on, and arrows do not get their own `this`.',
      'Follow-up: How would you write it without rest/spread (ES5)?',
      '  Use `Array.prototype.slice.call(arguments, 1)` for preset arguments and `concat` them with the call-time `arguments`.',
    ],
    code: `Function.prototype.myBind = function (thisArg, ...preset) {
  const original = this;                       // the function being bound
  if (typeof original !== "function") {
    throw new TypeError("myBind must be called on a function");
  }
  function bound(...later) {
    const args = [...preset, ...later];
    if (new.target) {                          // called with new
      return new original(...args);            // ignore thisArg, build instance
    }
    return original.apply(thisArg, args);      // normal call
  }
  if (original.prototype) bound.prototype = original.prototype; // keep instanceof working
  return bound;
};

function greet(greeting, punct) { return greeting + ", " + this.name + punct; }
const ann = { name: "Ann" };
const hello = greet.myBind(ann, "Hello");      // nothing runs yet
console.log(hello("!"));                       // → "Hello, Ann!"

function Point(x, y) { this.x = x; this.y = y; }
const BoundPoint = Point.myBind(null, 1);      // pre-fill x = 1
const pt = new BoundPoint(2);
console.log(pt.x, pt.y, pt instanceof Point);  // → 1 2 true

try { Function.prototype.myBind.call(42); } catch (e) { console.log(e.name); } // → "TypeError"`,
  },
  {
    id: 'new-keyword',
    group: 'this & Functions',
    stars: 4,
    difficulty: 'Medium',
    q: 'What happens when you call a function with `new`?',
    a: [
      '# ELI5',
      'Think of a cookie cutter. Every time you press it into dough (`new`), you get a fresh cookie with the same shape.',
      'Then you decorate that particular cookie (the constructor sets its properties), and it comes with a little label pointing to the recipe book for shared tricks (the prototype).',
      'Mapping back: `new` creates a fresh object, links it to the constructor\'s prototype, runs the constructor with `this` set to it, and hands it back.',
      '# What it is',
      'A constructor function is a regular function meant to be called with `new` to create objects. By convention its name starts with a capital letter.',
      'The prototype is a shared object that instances inherit methods from; every regular function has a `prototype` property for this purpose.',
      '`new` runs four steps:',
      '  1. Create a brand-new empty object.',
      '  2. Link that object\'s hidden `[[Prototype]]` to `Constructor.prototype`, so it inherits shared methods.',
      '  3. Call the constructor with `this` set to the new object, passing the arguments.',
      '  4. If the constructor returns an object (or function), use that; otherwise return the new object from step 1.',
      'ES6 `class` constructors do the same thing and must be called with `new` (calling them without `new` throws).',
      '`new.target` lets a function check whether it was called with `new`.',
      '# How it works',
      'Calling `new Person("Ann")` in detail:',
      '  The engine creates `{}` and sets its prototype to `Person.prototype` (like `Object.create(Person.prototype)`).',
      '  It runs `Person` with `this` pointing to that object, so `this.name = "Ann"` adds a property.',
      '  `Person` returns nothing, so the expression evaluates to the new object.',
      'Later, `ann.sayHi()` is not found on `ann` itself, so the engine looks up the prototype chain and finds it on `Person.prototype`.',
      'Returning a primitive from a constructor (like `return 5`) is ignored; returning an object replaces the new instance.',
      'Arrow functions and methods defined with method syntax cannot be used with `new` because they lack an internal constructor behaviour.',
      '# Example walkthrough',
      '`new Person("Ann")` creates an object with `name: "Ann"`; `ann.sayHi()` prints `"Hi, I am Ann"` via the prototype.',
      '`Object.getPrototypeOf(ann) === Person.prototype` prints `true`, confirming step 2.',
      '`myNew(Person, "Bob")` re-implements the four steps manually and behaves the same.',
      '`new Weird()` returns `{ hijacked: true }` because the constructor explicitly returned an object.',
      '# Why it matters / when to use',
      'Every class instance you create in a Node backend (`new Pool()`, `new Error("x")`, `new Map()`) goes through this process.',
      'Understanding it explains why methods on the prototype are shared and memory-efficient, while properties set in the constructor are per-instance.',
      'Implementing `new` by hand is a common interview task.',
      '# Common mistakes',
      'Calling a constructor function without `new`, so `this` is `undefined` (strict) or global (sloppy). Fix: use classes, which throw if `new` is missing.',
      'Defining methods inside the constructor (`this.sayHi = function () {}`), creating a copy per instance. Fix: put them on the prototype or use class methods.',
      'Returning an object from a constructor by accident and losing the instance. Fix: do not return anything from constructors.',
      '# Say this in the interview',
      '"`new` does four things: creates an empty object, sets its prototype to the constructor\'s `prototype` property, calls the constructor with `this` bound to the new object, and returns that object unless the constructor explicitly returns another object. Classes use the same mechanism with stricter rules."',
      'Follow-up: How would you implement `new` yourself?',
      '  `const obj = Object.create(Fn.prototype); const r = Fn.apply(obj, args); return r !== null && (typeof r === "object" || typeof r === "function") ? r : obj;`',
      'Follow-up: What is `new.target`?',
      '  A value inside a function that is the constructor when called with `new` and `undefined` otherwise.',
    ],
    code: `function Person(name) {
  this.name = name;                    // step 3: set props on the new object
}
Person.prototype.sayHi = function () { // shared by all instances
  return "Hi, I am " + this.name;
};

const ann = new Person("Ann");
console.log(ann.sayHi());                                 // → "Hi, I am Ann"
console.log(Object.getPrototypeOf(ann) === Person.prototype); // → true

// Re-implementing new by hand
function myNew(Fn, ...args) {
  const obj = Object.create(Fn.prototype);  // steps 1 + 2
  const result = Fn.apply(obj, args);       // step 3
  const isObj = result !== null && (typeof result === "object" || typeof result === "function");
  return isObj ? result : obj;              // step 4
}
const bob = myNew(Person, "Bob");
console.log(bob.sayHi());                   // → "Hi, I am Bob"

function Weird() {
  this.lost = true;
  return { hijacked: true };                // object return replaces the instance
}
console.log(new Weird());                   // → { hijacked: true }`,
  },
  {
    id: 'currying',
    group: 'this & Functions',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is currying? Implement a generic `curry`.',
    a: [
      '# ELI5',
      'Imagine ordering a sandwich at a counter where the worker asks one question at a time: "Which bread?", then "Which filling?", then "Which sauce?".',
      'After each answer they remember what you said and wait for the next question. Only after the last answer do they hand you the sandwich.',
      'You could also stop after "bread" and let a friend finish the order later.',
      'Mapping back: a curried function takes arguments one at a time, remembering earlier ones (via closures) until it has enough to compute the result.',
      '# What it is',
      'Currying transforms a function that takes several arguments, like `add(a, b, c)`, into a chain of functions that each take one argument: `add(a)(b)(c)`.',
      'Arity means the number of parameters a function declares; you can read it from `fn.length`.',
      'A generic `curry` helper takes any function and returns a curried version that keeps collecting arguments until it has at least `fn.length` of them, then calls the original.',
      'Most practical `curry` helpers also allow passing several arguments at once: `add(1, 2)(3)` or `add(1)(2, 3)`.',
      'Currying vs partial application:',
      '  Currying: always produces a chain of single-argument functions (strictly one at a time).',
      '  Partial application: fixes some arguments now and returns a function for the rest, e.g. `fn.bind(null, a)`.',
      '# How it works',
      '`curry(fn)` returns a function `curried(...args)`:',
      '  If `args.length >= fn.length`, call `fn(...args)` and return the result.',
      '  Otherwise, return a new function that waits for more arguments: `(...more) => curried(...args, ...more)`.',
      'Each returned function closes over the arguments collected so far, so nothing is lost between calls.',
      'Recursion ends when enough arguments have been gathered.',
      'Limitation: `fn.length` does not count rest parameters (`...args`) or parameters with default values (and anything after them), so such functions need an explicit arity.',
      '# Example walkthrough',
      '`curriedAdd(1)(2)(3)` collects 1, then 2, then 3; once it has 3 arguments it calls `add` and prints `6`.',
      '`curriedAdd(1, 2)(3)` and `curriedAdd(1)(2, 3)` also print `6`, because the helper accepts batches.',
      '`const add10 = curriedAdd(10)` stores a reusable partially-filled function; `add10(1)(2)` prints `13`.',
      'The logger example creates `errorLog = log("ERROR")` once, then `errorLog("db")("connection lost")` prints `[ERROR] db: connection lost`.',
      '# Why it matters / when to use',
      'Creating specialised helpers from general ones: a `log(level)(module)(msg)` function lets each module build its own pre-configured logger.',
      'Functional libraries (Ramda, lodash/fp) curry everything so functions compose easily in pipelines.',
      'Middleware and validation factories: `hasRole("admin")` returning a request handler is a curried shape.',
      '# Common mistakes',
      'Relying on `fn.length` with default or rest parameters, which gives a smaller number. Fix: pass the arity explicitly, like `curry(fn, 3)`.',
      'Losing `this` inside the curried function. Fix: forward it with `fn.apply(this, args)` if methods are curried.',
      'Over-using currying in normal app code, making it harder to read. Fix: use it where reuse of partially applied functions is real.',
      '# Say this in the interview',
      '"Currying converts a function of N arguments into a sequence of functions that each take one argument, so `add(a, b, c)` becomes `add(a)(b)(c)`. A generic `curry` compares the collected arguments with `fn.length`: if there are enough it calls the function, otherwise it returns a new function that closes over the arguments so far and waits for more. It is useful for building specialised functions from general ones."',
      'Follow-up: Currying vs partial application?',
      '  Currying produces one-argument functions all the way down; partial application just fixes some arguments and returns a function for the rest.',
      'Follow-up: How do you implement infinite currying like `sum(1)(2)(3)()`?',
      '  Keep returning a function that accumulates a total, and return the total when called with no arguments.',
    ],
    code: `function curry(fn, arity = fn.length) {
  return function curried(...args) {
    if (args.length >= arity) {
      return fn.apply(this, args);              // enough args: run it
    }
    return (...more) => curried.apply(this, [...args, ...more]); // wait for more
  };
}

const add = (a, b, c) => a + b + c;
const curriedAdd = curry(add);

console.log(curriedAdd(1)(2)(3));   // → 6
console.log(curriedAdd(1, 2)(3));   // → 6
console.log(curriedAdd(1)(2, 3));   // → 6

const add10 = curriedAdd(10);       // reusable partial
console.log(add10(1)(2));           // → 13

const log = curry((level, mod, msg) => "[" + level + "] " + mod + ": " + msg);
const errorLog = log("ERROR");
console.log(errorLog("db")("connection lost")); // → "[ERROR] db: connection lost"

// Infinite currying: sum(1)(2)(3)() → 6
const sum = (a) => (b) => (b === undefined ? a : sum(a + b));
console.log(sum(1)(2)(3)());        // → 6`,
  },
  {
    id: 'higher-order-functions',
    group: 'this & Functions',
    stars: 3,
    difficulty: 'Easy',
    q: 'What is a higher-order function?',
    a: [
      '# ELI5',
      'A coffee machine that takes a "recipe card" and makes coffee according to it is more powerful than a machine that only makes one drink.',
      'Some machines even print you a new recipe card to use later.',
      'Mapping back: a higher-order function either takes a function (the recipe card) as input, or returns a new function as output, or both.',
      '# What it is',
      'A higher-order function (HOF) is a function that does at least one of these:',
      '  Takes one or more functions as arguments.',
      '  Returns a function as its result.',
      'A callback is a function you pass to another function so it can be "called back" later, like the function passed to `map` or `setTimeout`.',
      'This is possible because JavaScript functions are first-class values: they can be stored in variables, passed around and returned like any other value.',
      'Built-in HOF examples: `Array.prototype.map`, `filter`, `reduce`, `forEach`, `sort`, `setTimeout`, `Promise.prototype.then`, `addEventListener`.',
      'Custom HOF examples: `debounce`, `throttle`, `memoize`, `once`, retry wrappers, Express middleware factories.',
      '# How it works',
      'Taking a function as input:',
      '  The HOF receives the function as a normal parameter.',
      '  It decides when and how many times to call it, and with what arguments (for example `map` calls your callback once per element).',
      'Returning a function:',
      '  The HOF creates an inner function and returns it.',
      '  The inner function keeps access to the HOF\'s parameters through a closure.',
      'Wrappers (decorators) combine both: take a function, return a new function that adds behaviour (timing, logging, retries) around the original call.',
      '# Example walkthrough',
      '`[1, 2, 3, 4].filter(n => n % 2 === 0).map(n => n * 10)` keeps even numbers and multiplies them: prints `[20, 40]`.',
      '`withTiming(slowSquare)` returns a new function; calling it runs `slowSquare(4)`, logs how long it took, and returns `16`.',
      '`once(init)` returns a function that only runs `init` the first time; the second call returns the cached result without printing `"init ran"` again.',
      '# Why it matters / when to use',
      'Express middleware is built on HOFs: `app.use(fn)` takes a function, and helpers like `asyncHandler(fn)` return a wrapped function that forwards errors to `next`.',
      'Cross-cutting concerns such as logging, metrics, caching and retries can be added by wrapping functions instead of editing them.',
      'Data transformation with `map`/`filter`/`reduce` is shorter and clearer than manual loops.',
      '# Common mistakes',
      'Passing the result of a call instead of the function: `setTimeout(doWork(), 1000)`. Fix: pass `doWork` or `() => doWork()`.',
      'Passing `parseInt` directly to `map` (`["1","2","3"].map(parseInt)` gives `[1, NaN, NaN]` because `map` passes the index as the second argument, used as the radix). Fix: `map(s => parseInt(s, 10))` or `map(Number)`.',
      'Forgetting to return inside `map` callbacks with braces. Fix: `map(x => { return x * 2; })` or use the concise body.',
      '# Say this in the interview',
      '"A higher-order function takes a function as an argument, returns a function, or both. It works because functions are first-class values in JavaScript. Common examples are `map`, `filter`, `reduce` and `setTimeout`, and in backend code things like middleware factories, `asyncHandler` wrappers, debounce and memoise."',
      'Follow-up: Give a custom HOF you have written.',
      '  An `asyncHandler(fn)` that returns `(req, res, next) => fn(req, res, next).catch(next)` so async route errors reach Express error middleware.',
    ],
    code: `// Takes a function: built-in array HOFs
const result = [1, 2, 3, 4].filter((n) => n % 2 === 0).map((n) => n * 10);
console.log(result);                 // → [ 20, 40 ]

// Takes AND returns a function: a timing wrapper
function withTiming(fn) {
  return (...args) => {
    const start = performance.now();
    const out = fn(...args);
    console.log(fn.name + " took " + (performance.now() - start).toFixed(2) + "ms");
    return out;
  };
}
const slowSquare = (n) => n * n;
const timedSquare = withTiming(slowSquare);
console.log(timedSquare(4));         // → "slowSquare took 0.01ms" then 16

// once(): run a function only the first time
function once(fn) {
  let done = false, value;
  return (...args) => {
    if (!done) { value = fn(...args); done = true; }
    return value;
  };
}
const init = once(() => { console.log("init ran"); return 42; });
console.log(init());                 // → "init ran" then 42
console.log(init());                 // → 42 (no second "init ran")

console.log(["1", "2", "3"].map(parseInt)); // → [ 1, NaN, NaN ] (gotcha)`,
  },
  {
    id: 'function-declaration-vs-expression',
    group: 'this & Functions',
    stars: 3,
    difficulty: 'Easy',
    q: 'Function declaration vs function expression?',
    a: [
      '# ELI5',
      'A function declaration is like a shop listed in the town directory: everyone in town knows it exists from the morning, even before they walk past it.',
      'A function expression is like a food truck that only shows up when it arrives at its spot. Before that moment, you cannot buy from it.',
      'Mapping back: declarations are fully hoisted and usable anywhere in their scope; expressions only exist once the line assigning them has run.',
      '# What it is',
      'Function declaration: a statement that starts with the `function` keyword and has a name: `function add(a, b) { return a + b; }`.',
      'Function expression: a function created as part of an expression, usually assigned to a variable: `const add = function (a, b) { return a + b; };`.',
      'Arrow functions (`const add = (a, b) => a + b`) are always expressions.',
      'A named function expression has its own name: `const fact = function inner(n) { ... }`; the name `inner` is only visible inside the function body, which helps with recursion and stack traces.',
      'Comparison, row by row:',
      '  Hoisting: declaration = fully hoisted (callable before its line); expression = follows the variable rules (`var` gives `undefined`, `let`/`const` are in the TDZ).',
      '  Name: declaration = required; expression = optional (anonymous is allowed).',
      '  Where they can appear: declaration = as a statement; expression = anywhere a value is allowed (arguments, return values, object properties).',
      '  Immediate invocation: only expressions can be called immediately (IIFE).',
      '  Conditional definition: expressions are clearer when choosing a function at runtime.',
      '# How it works',
      'During the creation phase of a scope, the engine finds function declarations and creates the full function object right away.',
      'Function expressions are created only when execution reaches them, and are then stored in the variable.',
      'Anonymous expressions assigned to variables still get a `name` property inferred from the variable (`const foo = function () {}` has `foo.name === "foo"`), so stack traces stay readable.',
      '# Example walkthrough',
      '`declared()` works before its definition and prints `"declared"`.',
      'Calling `expressed()` before its line throws `ReferenceError` because `const expressed` is in the TDZ.',
      '`expressed()` after its line prints `"expressed"`.',
      '`factorial(5)` uses a named function expression `fact` that calls itself, printing `120`; `typeof fact` outside is `"undefined"`.',
      '`pick("upper")` returns one of two function expressions chosen at runtime.',
      '# Why it matters / when to use',
      'Declarations are handy for top-level helper functions you want to place below the main logic of a file.',
      'Expressions and arrows are used for callbacks, object methods, functions chosen at runtime and module exports like `export const handler = async (event) => {...}`.',
      'Many style guides prefer `const fn = () => {}` to make use-before-define mistakes impossible.',
      '# Common mistakes',
      'Calling a function expression before it is defined. Fix: move the call down or switch to a declaration.',
      'Declaring functions inside `if` blocks, which behaves inconsistently in sloppy mode. Fix: use an expression assigned to a variable.',
      'Assuming the inner name of a named function expression is available outside. It is not; it is only visible inside its own body.',
      '# Say this in the interview',
      '"A function declaration is a statement with a name, and it is fully hoisted, so it can be called before it appears. A function expression creates a function as a value, usually assigned to a variable, and it is only available after that assignment runs. Expressions can be anonymous, used inline as callbacks, or invoked immediately; arrow functions are always expressions."',
      'Follow-up: What is a named function expression good for?',
      '  Self-recursion and clearer stack traces, without leaking the name into the outer scope.',
    ],
    code: `console.log(declared());          // → "declared" (fully hoisted)
function declared() {
  return "declared";
}

try {
  expressed();                    // const is in the TDZ here
} catch (e) {
  console.log(e.name);            // → "ReferenceError"
}
const expressed = function () {
  return "expressed";
};
console.log(expressed());         // → "expressed"

// Named function expression: name visible only inside
const factorial = function fact(n) {
  return n <= 1 ? 1 : n * fact(n - 1);
};
console.log(factorial(5));        // → 120
console.log(typeof fact);         // → "undefined"

// Choosing a function at runtime
function pick(mode) {
  return mode === "upper" ? (s) => s.toUpperCase() : (s) => s.toLowerCase();
}
console.log(pick("upper")("hi")); // → "HI"
console.log(expressed.name);      // → "expressed" (inferred name)`,
  },
  {
    id: 'pure-functions',
    group: 'this & Functions',
    stars: 3,
    difficulty: 'Easy',
    q: 'What is a pure function?',
    a: [
      '# ELI5',
      'A calculator is "pure": if you type 2 + 2 you always get 4, and pressing the buttons does not change anything else in the room.',
      'A vending machine is "impure": the same button can give different results depending on stock, and pressing it changes the world (a can falls out, money is taken).',
      'Mapping back: a pure function always returns the same output for the same input and does not change anything outside itself.',
      '# What it is',
      'A pure function has two properties:',
      '  Deterministic: same inputs always produce the same output.',
      '  No side effects: it does not change anything outside its own body.',
      'A side effect is any observable change outside the function or dependence on outside state, such as:',
      '  Modifying a global variable or an input object.',
      '  Writing to a database, file, network or console.',
      '  Reading changing outside values like `Date.now()`, `Math.random()` or `process.env` at call time.',
      'Referential transparency means you could replace a call like `add(2, 3)` with its result `5` anywhere without changing program behaviour. Pure functions have this property.',
      'Immutability means not changing existing data and instead creating new data; pure functions rely on it when they "update" objects or arrays.',
      '# How it works',
      'To make a function pure:',
      '  Take everything it needs as parameters instead of reading globals.',
      '  Never mutate the inputs; return new objects or arrays (spread, `map`, `filter`, `toSorted`).',
      '  Push side effects (I/O, logging, time, randomness) to the edges of your program and pass the results in as arguments.',
      'A typical backend structure is a "functional core, imperative shell": pure business-logic functions in the middle, impure code (HTTP, DB) around them.',
      '# Example walkthrough',
      '`addTax(100, 0.2)` always returns `120` and touches nothing else: pure.',
      '`addToCartImpure` pushes into the passed-in array, so the caller\'s `cart` now has length 1: it mutated its input.',
      '`addToCartPure` returns a new array with spread, so `cart2` has length 1 and the original `cart1` still has length 0.',
      '`createOrderId()` uses `Date.now()`, so it returns a different value on each call: impure. `formatOrderId(now)` takes the time as a parameter: pure and easy to test.',
      '# Why it matters / when to use',
      'Testing: pure functions need no mocks or setup; you just call them with inputs and check the output.',
      'Caching (memoisation): results can be cached safely because the same input always gives the same output.',
      'Concurrency and predictability: no shared mutable state means fewer surprising bugs between simultaneous requests.',
      'Frameworks: React components and Redux reducers are expected to be pure.',
      '# Common mistakes',
      'Mutating arguments with `push`, `sort` or `splice`. Fix: use non-mutating versions like spread, `toSorted()` and `toSpliced()` (ES2023, available in Node 20+).',
      'Hiding `Date.now()` or `Math.random()` inside business logic. Fix: pass them in as parameters.',
      'Thinking all functions must be pure. Fix: real apps need side effects; just isolate them.',
      '# Say this in the interview',
      '"A pure function always returns the same output for the same inputs and has no side effects: it does not mutate its arguments or global state and does not do I/O. Pure functions are easy to test, safe to cache and easy to reason about, so I keep business logic pure and push database, network and time-dependent code to the edges."',
      'Follow-up: Is a function that logs to the console pure?',
      '  Strictly no; logging is a side effect, though it is usually harmless.',
      'Follow-up: Is `Array.prototype.sort` pure?',
      '  No, it sorts in place; use `toSorted()` or sort a copy.',
    ],
    code: `// Pure: same input -> same output, no side effects
const addTax = (price, rate) => price * (1 + rate);
console.log(addTax(100, 0.2));        // → 120

// Impure: mutates its input
function addToCartImpure(cart, item) {
  cart.push(item);                    // changes the caller's array
  return cart;
}
const cart = [];
addToCartImpure(cart, "apple");
console.log(cart.length);             // → 1 (caller affected!)

// Pure version: returns a new array
const addToCartPure = (items, item) => [...items, item];
const cart1 = [];
const cart2 = addToCartPure(cart1, "apple");
console.log(cart1.length, cart2.length); // → 0 1

// Impure (depends on time) vs pure (time passed in)
const createOrderId = () => "ORD-" + Date.now();
const formatOrderId = (now) => "ORD-" + now;
console.log(formatOrderId(1700000000000)); // → "ORD-1700000000000" every time

const nums = [3, 1, 2];
console.log(nums.toSorted(), nums);   // → [ 1, 2, 3 ] [ 3, 1, 2 ] (no mutation)`,
  },
  {
    id: 'first-class-functions',
    group: 'this & Functions',
    stars: 2,
    difficulty: 'Easy',
    q: 'What does "functions are first-class citizens" mean?',
    a: [
      '# ELI5',
      'In some clubs, only "full members" can vote, bring guests or hold a membership card. In JavaScript, functions are full members.',
      'They can be put in a backpack (stored in variables), handed to friends (passed as arguments), and even given back as gifts (returned from other functions).',
      'Mapping back: "first-class" means functions are treated like any other value, such as a number or a string.',
      '# What it is',
      'A language has first-class functions when functions can be used anywhere other values can.',
      'In JavaScript you can:',
      '  Assign a function to a variable: `const greet = () => "hi"`.',
      '  Store functions in arrays and objects: `const handlers = { GET: getUser, POST: createUser }`.',
      '  Pass a function as an argument to another function (a callback).',
      '  Return a function from another function.',
      '  Add properties to a function, because functions are objects: `greet.description = "says hi"`.',
      'This is what makes higher-order functions, callbacks, closures and functional patterns possible.',
      '# How it works',
      'In JavaScript, a function is a special kind of object that can be called.',
      '  It has normal object features: properties, a prototype (`Function.prototype`), and it can be stored by reference.',
      '  It also has an internal call behaviour, which is why `typeof fn` returns `"function"`.',
      'Because a variable holding a function just holds a reference, passing it around does not copy the code; it shares the same function object.',
      '# Example walkthrough',
      '`const shout = (s) => s.toUpperCase() + "!"` stores a function in a variable.',
      '`apply(shout, "hi")` passes `shout` as an argument; it prints `"HI!"`.',
      '`makeGreeter("Hello")` returns a new function; `hello("Ann")` prints `"Hello, Ann"`.',
      '`routes["GET /users"]()` looks up a function in an object and calls it, printing `"listing users"`.',
      '`shout.calls = 0` adds a property to a function, proving functions are objects.',
      '# Why it matters / when to use',
      'Routing tables and command dispatch: mapping strings like `"GET /users"` to handler functions.',
      'Middleware pipelines in Express or Koa: arrays of functions run in order.',
      'Dependency injection: passing a `sendEmail` function into a service so tests can pass a fake.',
      'Strategy pattern: choosing a pricing or validation function at runtime.',
      '# Common mistakes',
      'Calling the function when you meant to pass it: `onClick(handle())` vs `onClick(handle)`.',
      'Losing `this` when storing a method in a variable. Fix: bind it or use an arrow wrapper.',
      '# Say this in the interview',
      '"It means functions are values like any other: you can assign them to variables, store them in data structures, pass them as arguments, return them from functions and even attach properties to them, because they are objects. That is the foundation for callbacks, higher-order functions and closures."',
      'Follow-up: How is this different from higher-order functions?',
      '  First-class functions are the language feature; higher-order functions are functions that use that feature by taking or returning functions.',
    ],
    code: `// 1. Stored in a variable
const shout = (s) => s.toUpperCase() + "!";

// 2. Passed as an argument
const apply = (fn, value) => fn(value);
console.log(apply(shout, "hi"));          // → "HI!"

// 3. Returned from a function
function makeGreeter(greeting) {
  return (name) => greeting + ", " + name;
}
const hello = makeGreeter("Hello");
console.log(hello("Ann"));                // → "Hello, Ann"

// 4. Stored in data structures (a tiny router)
const routes = {
  "GET /users": () => "listing users",
  "POST /users": () => "creating user",
};
console.log(routes["GET /users"]());      // → "listing users"

// 5. Functions are objects: they can have properties
shout.calls = 0;
console.log(typeof shout, shout.calls);   // → "function" 0
console.log(shout.name);                  // → "shout"`,
  },
  {
    id: 'arguments-object',
    group: 'this & Functions',
    stars: 2,
    difficulty: 'Easy',
    q: 'What is the `arguments` object?',
    a: [
      '# ELI5',
      'Imagine a teacher who collects every note students pass to her in a pile, even notes she did not ask for.',
      'The pile is numbered (note 0, note 1, ...) and she knows how many there are, but it is just a pile, not a neat folder with all the folder tools.',
      'Mapping back: `arguments` is an array-like pile of everything passed to a regular function, but it is not a real array.',
      '# What it is',
      '`arguments` is a special local variable available inside regular (non-arrow) functions that holds all the arguments passed to the call.',
      'It is array-like: it has numeric indexes (`arguments[0]`) and a `length`, but it is not an `Array`, so it lacks methods like `map` and `filter`.',
      'It contains every passed argument, even ones without a matching named parameter.',
      'Arrow functions do not have their own `arguments`; inside an arrow, `arguments` refers to the enclosing regular function\'s arguments (or is a `ReferenceError` in an ES module top level).',
      'Modern replacement: rest parameters (`function f(...args)`), which give a real array and work in arrows too.',
      'In sloppy mode with simple parameters, `arguments` is "linked" to named parameters (changing one changes the other); in strict mode they are independent.',
      '# How it works',
      'When a regular function is called, the engine creates an `arguments` object for that call:',
      '  Indexes `0` to `n - 1` hold the passed values.',
      '  `length` is the number of values actually passed (not the number of declared parameters).',
      '  It is iterable, so `for...of` and spread work on it.',
      'To get a real array: `Array.from(arguments)` or `[...arguments]` (older code used `Array.prototype.slice.call(arguments)`).',
      'Engines optimise functions better when they avoid `arguments`, another reason to prefer rest parameters.',
      '# Example walkthrough',
      '`oldSum(1, 2, 3)` loops over `arguments` and prints `6`, even though it declares no parameters.',
      '`Array.isArray(arguments)` prints `false`; `Array.from(arguments)` gives a real array.',
      '`newSum(1, 2, 3)` uses rest parameters and `reduce`, printing `6`.',
      '`countArgs.length` is 2 (declared params) but `countArgs(1)` reports `1` passed argument.',
      '# Why it matters / when to use',
      'You will see `arguments` in older libraries and polyfills, so you need to read it.',
      'Variadic functions (accepting any number of arguments) like loggers or `sum` should use `...args` in new code.',
      'Understanding it explains why arrow functions behave differently inside wrappers.',
      '# Common mistakes',
      'Calling array methods directly on `arguments` (`arguments.map`) which throws. Fix: convert with `Array.from` or use rest parameters.',
      'Using `arguments` inside an arrow function and expecting the arrow\'s own arguments. Fix: use `...args`.',
      'Confusing `fn.length` (declared parameters) with `arguments.length` (passed arguments).',
      '# Say this in the interview',
      '"`arguments` is an array-like object available inside regular functions containing every argument passed to the call. It has indexes and a length but no array methods, and arrow functions do not have their own. In modern code I use rest parameters instead, which give a real array and work everywhere."',
      'Follow-up: How do you convert `arguments` to an array?',
      '  `Array.from(arguments)` or `[...arguments]`.',
    ],
    code: `function oldSum() {
  let total = 0;
  for (let i = 0; i < arguments.length; i++) {
    total += arguments[i];             // index access works
  }
  console.log(Array.isArray(arguments)); // → false (array-like only)
  console.log(Array.from(arguments));    // → [ 1, 2, 3 ]
  return total;
}
console.log(oldSum(1, 2, 3));          // → 6

// Modern way: rest parameters give a real array
const newSum = (...nums) => nums.reduce((a, b) => a + b, 0);
console.log(newSum(1, 2, 3));          // → 6

function countArgs(a, b) {
  return arguments.length;             // what was PASSED
}
console.log(countArgs.length);         // → 2 (what was DECLARED)
console.log(countArgs(1));             // → 1

function outer() {
  const inner = () => arguments[0];    // arrow uses outer's arguments
  return inner("ignored");
}
console.log(outer("from outer"));      // → "from outer"`,
  },

  // ───────────────────────── Objects & Prototypes ─────────────────────────
  {
    id: 'prototypal-inheritance',
    group: 'Objects & Prototypes',
    stars: 5,
    difficulty: 'Medium',
    q: 'Explain prototypal inheritance and the prototype chain.',
    a: [
      '# ELI5',
      'Imagine asking your mom how to bake a cake. If she does not know, she asks grandma. If grandma does not know, she asks great-grandma. If nobody knows, the answer is "I don\'t know".',
      'You did not have to learn every recipe yourself; you can borrow knowledge from the family line.',
      'Mapping back: an object that lacks a property asks its prototype, which asks its own prototype, up the chain until `null`; if no one has it, you get `undefined`.',
      '# What it is',
      'Every JavaScript object has a hidden internal link called `[[Prototype]]` pointing to another object (or to `null`).',
      'That linked object is the object\'s prototype. Properties and methods on the prototype are available to the object as if they were its own.',
      'Prototypal inheritance means objects inherit directly from other objects through these links, rather than from class blueprints as in Java or C#.',
      'The prototype chain is the sequence of links: `obj` → its prototype → that object\'s prototype → ... → `Object.prototype` → `null`.',
      'Own property: a property stored directly on the object. Inherited property: found somewhere up the chain.',
      'Ways to set or read the link:',
      '  `Object.create(proto)`: create a new object with `proto` as its prototype.',
      '  `new Fn()`: the new object\'s prototype becomes `Fn.prototype`.',
      '  `class Child extends Parent`: sets up the chain between the two classes.',
      '  `Object.getPrototypeOf(obj)` / `Object.setPrototypeOf(obj, proto)` (setting is slow, avoid in hot code).',
      '# How it works',
      'Reading a property `obj.x`:',
      '  Look for an own property `x` on `obj`. If found, return it.',
      '  Otherwise go to `obj`\'s prototype and look there.',
      '  Repeat up the chain. If you reach `null`, return `undefined`.',
      'Writing a property `obj.x = 1` (normally) creates or updates an own property on `obj`, even if `x` exists on the prototype. This is called shadowing. (Exception: if the prototype defines `x` as a setter or read-only property, that rule applies instead.)',
      'Methods on a prototype run with `this` set to the object you called them on, so shared methods can work on each object\'s own data.',
      'Because methods live once on the prototype, thousands of objects can share them without copying, saving memory.',
      '# Example walkthrough',
      '`animal` has a method `eat`; `dog = Object.create(animal)` links `dog` to `animal`.',
      '`dog.bark()` is an own method; `dog.eat()` is not found on `dog`, so the engine finds it on `animal` and prints `"Rex eats"` (with `this` = `dog`).',
      '`dog.hasOwnProperty("eat")` prints `false`, but `"eat" in dog` prints `true` because `in` checks the whole chain.',
      'The chain printout confirms `dog` → `animal` → `Object.prototype` → `null`.',
      'Setting `dog.eat = ...` shadows the inherited method only for `dog`; `animal.eat` is unchanged.',
      '# Why it matters / when to use',
      'Classes in JavaScript are built on this, so understanding it explains `extends`, `super`, method sharing and `instanceof`.',
      'Debugging: knowing why `obj.toString` exists even though you never defined it (it comes from `Object.prototype`).',
      'Security: prototype pollution attacks (for example merging untrusted JSON with a `__proto__` key) modify `Object.prototype` and affect every object; use `Object.create(null)` or `Map` for user-controlled keys and validate input.',
      '# Common mistakes',
      'Iterating with `for...in` and getting inherited keys. Fix: use `Object.keys`, or check `Object.hasOwn(obj, key)`.',
      'Mutating shared arrays or objects stored on the prototype, which affects all instances. Fix: put per-instance data in the constructor.',
      'Changing prototypes at runtime with `setPrototypeOf`, which hurts performance. Fix: set the prototype at creation with `Object.create` or classes.',
      '# Say this in the interview',
      '"Every object has an internal `[[Prototype]]` link to another object. When you read a property that is not on the object itself, the engine follows that link up the prototype chain until it finds it or reaches null. That is prototypal inheritance: objects inherit directly from other objects, methods are shared on prototypes, and ES6 classes are syntax on top of this mechanism."',
      'Follow-up: What is at the end of the chain?',
      '  Usually `Object.prototype`, whose own prototype is `null`.',
      'Follow-up: Difference between `in` and `Object.hasOwn`?',
      '  `in` checks the whole prototype chain; `Object.hasOwn` checks only the object\'s own properties.',
    ],
    code: `const animal = {
  eat() { return this.name + " eats"; },   // shared method
};

const dog = Object.create(animal);         // dog.[[Prototype]] = animal
dog.name = "Rex";
dog.bark = function () { return "Woof"; };

console.log(dog.bark());                   // → "Woof" (own)
console.log(dog.eat());                    // → "Rex eats" (inherited, this = dog)
console.log(Object.hasOwn(dog, "eat"));    // → false
console.log("eat" in dog);                 // → true (checks the chain)

// Walk the chain
let p = dog;
const chain = [];
while (p) { chain.push(p === animal ? "animal" : p === Object.prototype ? "Object.prototype" : "dog"); p = Object.getPrototypeOf(p); }
console.log(chain.join(" -> ") + " -> null"); // → "dog -> animal -> Object.prototype -> null"

// Shadowing: own property hides the inherited one
dog.eat = () => "Rex eats fast";
console.log(dog.eat());                    // → "Rex eats fast"
console.log(animal.eat.call({ name: "Cat" })); // → "Cat eats" (prototype unchanged)`,
  },
  {
    id: 'shallow-vs-deep-copy',
    group: 'Objects & Prototypes',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is the difference between a shallow and a deep copy? How do you deep clone?',
    a: [
      '# ELI5',
      'Imagine copying a folder of drawings. A shallow copy makes a new folder, but instead of copying the drawings inside sub-folders, it just puts sticky notes saying "see the original sub-folder".',
      'If someone scribbles on a drawing in that sub-folder, both folders show the scribble, because they share it.',
      'A deep copy photocopies everything, sub-folders included, so the two folders are fully independent.',
      'Mapping back: a shallow copy duplicates only the top level and shares nested objects; a deep copy duplicates every level.',
      '# What it is',
      'Shallow copy: a new top-level object or array, but nested objects/arrays inside are the same references as in the original.',
      'Deep copy: a completely independent copy, where every nested object and array is also copied.',
      'Shallow copy tools: spread `{ ...obj }` / `[...arr]`, `Object.assign({}, obj)`, `arr.slice()`, `Array.from(arr)`.',
      'Deep copy tools:',
      '  `structuredClone(value)`: built into Node 17+ and all modern browsers. Handles nested objects, arrays, `Date`, `Map`, `Set`, `RegExp`, typed arrays and circular references. Cannot clone functions, DOM nodes or class prototypes (instances come back as plain objects); throws `DataCloneError` on functions.',
      '  `JSON.parse(JSON.stringify(value))`: old trick. Loses `undefined`, functions and symbols, turns `Date` into strings, `Map`/`Set` into `{}`, `NaN`/`Infinity` into `null`, and throws on circular references and `bigint`.',
      '  Libraries such as lodash `cloneDeep` for special cases (preserving class prototypes, etc).',
      'A circular reference is when an object refers back to itself directly or indirectly (`a.self = a`).',
      '# How it works',
      'Shallow copy with spread:',
      '  Creates a new object.',
      '  Copies each own enumerable property value from the original. For primitive values this is a real copy; for objects it copies the reference.',
      '`structuredClone` uses the structured clone algorithm (the same one used for `postMessage` between workers):',
      '  Walks the whole value recursively.',
      '  Keeps a map of already-copied objects so circular references point to the new copy instead of looping forever.',
      '  Recreates supported built-in types with their real type.',
      '# Example walkthrough',
      '`shallow = { ...original }` creates a new top-level object, so `shallow.name = "B"` does not affect `original.name`.',
      'But `shallow.address.city = "Paris"` changes `original.address.city` too, because `address` is shared.',
      '`deep = structuredClone(original)` copies everything; changing `deep.address.city` leaves the original alone, and `deep.created` is still a real `Date`.',
      'The JSON approach turns `created` into a string, so `instanceof Date` prints `false`.',
      '`structuredClone` handles the circular `loop.self = loop` correctly: the copy points to itself.',
      '# Why it matters / when to use',
      'Modifying request payloads or config defaults: a shallow copy of a nested default config, then mutating a nested field, silently changes the defaults for every later request.',
      'Caches: returning deep copies prevents callers from corrupting cached data.',
      'Immutable updates in state management usually need shallow copies at each changed level, not full deep clones (cheaper).',
      '# Common mistakes',
      'Assuming spread or `Object.assign` copies deeply. Fix: use `structuredClone` for nested data.',
      'Using the JSON trick on data containing dates, `undefined` or `Map`s. Fix: use `structuredClone`.',
      'Deep-cloning huge objects on every request, hurting performance. Fix: clone only what you change, or freeze shared data.',
      'Trying to `structuredClone` objects containing functions. Fix: strip functions first or use a library.',
      '# Say this in the interview',
      '"A shallow copy creates a new top-level container but shares nested objects, so changes to nested data affect both. A deep copy recursively copies every level. For shallow copies I use spread or `Object.assign`; for deep copies I use the built-in `structuredClone`, which handles dates, maps, sets and circular references. The JSON round-trip trick loses dates, undefined, functions and fails on circular data."',
      'Follow-up: What can `structuredClone` not copy?',
      '  Functions, DOM nodes, and class prototypes (instances become plain objects); it throws a `DataCloneError` for functions.',
      'Follow-up: Is `Array.from` a deep copy?',
      '  No, it is shallow: nested arrays and objects are still shared.',
    ],
    code: `const original = {
  name: "A",
  address: { city: "London" },
  created: new Date("2024-01-01"),
};

const shallow = { ...original };          // top level copied only
shallow.name = "B";
shallow.address.city = "Paris";           // nested object is SHARED
console.log(original.name);               // → "A"
console.log(original.address.city);       // → "Paris" (oops!)

const deep = structuredClone(original);   // every level copied
deep.address.city = "Tokyo";
console.log(original.address.city);       // → "Paris" (unaffected)
console.log(deep.created instanceof Date);// → true

const viaJson = JSON.parse(JSON.stringify(original));
console.log(viaJson.created instanceof Date); // → false (became a string)

const loop = { id: 1 };
loop.self = loop;                         // circular reference
const loopCopy = structuredClone(loop);
console.log(loopCopy.self === loopCopy);  // → true
// JSON.stringify(loop) would throw: "Converting circular structure to JSON"`,
  },
  {
    id: 'proto-vs-prototype',
    group: 'Objects & Prototypes',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is the difference between `__proto__` and `prototype`?',
    a: [
      '# ELI5',
      'A cookie cutter has a little shelf attached to it holding the decorating tools every cookie it makes can borrow. That shelf is `prototype`.',
      'Every cookie carries a little arrow pointing at the shelf it can borrow from. That arrow is `__proto__`.',
      'Mapping back: `prototype` belongs to constructor functions and is the shelf of shared methods; `__proto__` belongs to every object and points to its prototype.',
      '# What it is',
      '`prototype` is a regular property that exists on functions (except arrow functions and methods). It is the object that will become the prototype of instances created with `new`.',
      '`__proto__` is an accessor (getter/setter) on `Object.prototype` that exposes an object\'s internal `[[Prototype]]` link: the object it inherits from.',
      'They are connected by `new`: for `const a = new Fn()`, `a.__proto__ === Fn.prototype`.',
      'Comparison, row by row:',
      '  Who has it: `prototype` = functions/classes; `__proto__` = (almost) every object.',
      '  What it is: `prototype` = the blueprint object for future instances; `__proto__` = the link to the object this one inherits from.',
      '  Standard way to use: `prototype` is standard; `__proto__` is legacy and deprecated, use `Object.getPrototypeOf` / `Object.setPrototypeOf` instead.',
      'Note: a function itself is also an object, so it has both: `Fn.prototype` (for its instances) and `Object.getPrototypeOf(Fn) === Function.prototype` (what the function inherits from).',
      '`Fn.prototype.constructor` points back to `Fn`.',
      '# How it works',
      'When you define `function Dog() {}`, the engine automatically creates `Dog.prototype = { constructor: Dog }`.',
      'You add shared methods to it: `Dog.prototype.bark = function () {}`.',
      'When you run `new Dog()`, the engine creates an object and sets its internal `[[Prototype]]` to `Dog.prototype`.',
      'Accessing `rex.__proto__` goes through a getter on `Object.prototype` that returns that internal link. Objects created with `Object.create(null)` have no `__proto__` accessor at all.',
      'In object literals, `{ __proto__: proto }` is special standard syntax that sets the prototype at creation.',
      '# Example walkthrough',
      '`rex = new Dog("Rex")` links `rex` to `Dog.prototype`.',
      '`Object.getPrototypeOf(rex) === Dog.prototype` prints `true` (same as `rex.__proto__ === Dog.prototype`).',
      '`rex.prototype` is `undefined`: normal objects do not have a `prototype` property.',
      '`Dog.prototype.constructor === Dog` prints `true`.',
      '`Object.getPrototypeOf(Dog) === Function.prototype` prints `true`: the function itself inherits from `Function.prototype`.',
      '`bare = Object.create(null)` has no prototype, so `bare.__proto__` is just `undefined`.',
      '# Why it matters / when to use',
      'A very common interview confusion; being clear shows you understand how classes and `new` work under the hood.',
      'Security: prototype pollution attacks use a `__proto__` key in untrusted JSON merged into objects. Validate keys, use `Object.create(null)` or `Map`.',
      'Modern code should use `Object.getPrototypeOf` for reading and `Object.create` or classes for setting.',
      '# Common mistakes',
      'Saying "every object has a `prototype` property". Only functions do; objects have a `[[Prototype]]` link.',
      'Using `__proto__` in production code. Fix: use the `Object.getPrototypeOf`/`setPrototypeOf` APIs.',
      'Replacing `Fn.prototype` with a new object and forgetting `constructor`. Fix: add `constructor: Fn` back or use classes.',
      '# Say this in the interview',
      '"`prototype` is a property on constructor functions and classes: it is the object that instances created with `new` will inherit from. `__proto__` is a legacy accessor on every object that exposes its internal `[[Prototype]]` link. They connect via `new`, so `new Fn().__proto__ === Fn.prototype`. In modern code I use `Object.getPrototypeOf` instead of `__proto__`."',
      'Follow-up: Do arrow functions have `prototype`?',
      '  No, because they cannot be used as constructors.',
    ],
    code: `function Dog(name) { this.name = name; }
Dog.prototype.bark = function () { return this.name + " says woof"; };

const rex = new Dog("Rex");
console.log(rex.bark());                                  // → "Rex says woof"
console.log(Object.getPrototypeOf(rex) === Dog.prototype); // → true
console.log(rex.__proto__ === Dog.prototype);             // → true (legacy accessor)
console.log(rex.prototype);                               // → undefined
console.log(Dog.prototype.constructor === Dog);           // → true

// A function is also an object with its own [[Prototype]]
console.log(Object.getPrototypeOf(Dog) === Function.prototype); // → true

const arrow = () => {};
console.log(arrow.prototype);                             // → undefined

const bare = Object.create(null);                         // no prototype at all
console.log(bare.__proto__);                              // → undefined
console.log(Object.getPrototypeOf(bare));                 // → null

// Literal syntax for setting a prototype at creation
const cat = { __proto__: { meow() { return "meow"; } } };
console.log(cat.meow());                                  // → "meow"`,
  },
  {
    id: 'classes-vs-prototypes',
    group: 'Objects & Prototypes',
    stars: 4,
    difficulty: 'Medium',
    q: 'Are ES6 classes just syntactic sugar over prototypes?',
    a: [
      '# ELI5',
      'Imagine an old-style recipe written as a long paragraph versus the same recipe written as a neat numbered list with safety warnings.',
      'The food that comes out is the same, but the list is easier to follow and stops you making some mistakes (like forgetting to preheat the oven).',
      'Mapping back: classes produce the same prototype-based objects as constructor functions, but with cleaner syntax and extra safety rules, plus a few features old syntax cannot express easily.',
      '# What it is',
      'Syntactic sugar means nicer syntax for something the language could already do.',
      'Mostly yes: a `class` creates a constructor function, methods go on `ClassName.prototype`, and `extends` sets up the prototype chain, exactly like the old pattern.',
      'But classes are not only sugar; they add real differences:',
      '  Must be called with `new`; calling `MyClass()` throws a `TypeError`.',
      '  Class bodies always run in strict mode.',
      '  Class methods are non-enumerable (they do not show up in `for...in`), unlike methods assigned with `Fn.prototype.x = ...`.',
      '  Class declarations are in the Temporal Dead Zone until defined (not usable before their line), unlike function declarations.',
      '  `super` for calling parent methods and constructors, using an internal `[[HomeObject]]` link.',
      '  `extends` can subclass built-ins like `Array`, `Error` and `Map` correctly, which was very hard with ES5 functions.',
      '  Private fields and methods (`#secret`) and `static` blocks have no prototype-based equivalent: they are truly private and enforced by the engine.',
      '  Public class fields (`count = 0`) are defined on each instance.',
      '# How it works',
      '`class Animal { constructor(name) {...} speak() {...} }` roughly does this:',
      '  Creates a function `Animal` that runs the constructor body (but throws if called without `new`).',
      '  Adds `speak` to `Animal.prototype` as a non-enumerable property.',
      '`class Dog extends Animal` additionally:',
      '  Sets `Object.getPrototypeOf(Dog.prototype)` to `Animal.prototype` (instances inherit methods).',
      '  Sets `Object.getPrototypeOf(Dog)` to `Animal` (static methods are inherited too).',
      '  Requires `super()` in the constructor before using `this`, because the parent creates the object.',
      '# Example walkthrough',
      'The class `Animal` and the function `AnimalFn` both produce objects whose `speak` method lives on the prototype.',
      '`typeof Animal` prints `"function"`, proving a class is a function.',
      '`Object.keys(Animal.prototype)` prints `[]` (methods non-enumerable), while `Object.keys(AnimalFn.prototype)` prints `["speak"]`.',
      'Calling `Animal("x")` without `new` throws `TypeError`; `AnimalFn("x")` would not.',
      '`new Dog("Rex").speak()` uses `super.speak()` and prints `"Rex makes a sound. Woof!"`.',
      '# Why it matters / when to use',
      'NestJS and many Node frameworks are class-based (services, controllers), so you use classes daily while the prototype chain works underneath.',
      'Custom errors (`class NotFoundError extends Error`) work properly only with class syntax.',
      'Understanding the prototype layer helps debug `this` loss and `instanceof` issues.',
      '# Common mistakes',
      'Saying classes are "exactly the same" as functions. Mention the differences above.',
      'Using `this` in a subclass constructor before calling `super()`. Fix: call `super(...)` first.',
      'Passing class methods as callbacks and losing `this`. Fix: bind in the constructor or use arrow class fields.',
      '# Say this in the interview',
      '"Largely yes: a class creates a constructor function, its methods go on the prototype, and `extends` links the prototype chains. But it is more than sugar: classes must be called with `new`, run in strict mode, have non-enumerable methods, are in the TDZ before declaration, support `super`, can properly extend built-ins like Error, and support truly private `#` fields, which prototypes alone cannot do."',
      'Follow-up: Why must you call `super()` before `this` in a subclass?',
      '  Because in derived classes the parent constructor creates and initialises the object; until it runs, `this` does not exist.',
    ],
    code: `class Animal {
  constructor(name) { this.name = name; }
  speak() { return this.name + " makes a sound."; }
}

function AnimalFn(name) { this.name = name; }
AnimalFn.prototype.speak = function () { return this.name + " makes a sound."; };

console.log(typeof Animal);                   // → "function"
console.log(new Animal("A").speak());         // → "A makes a sound."
console.log(new AnimalFn("B").speak());       // → "B makes a sound."

console.log(Object.keys(Animal.prototype));   // → [] (non-enumerable)
console.log(Object.keys(AnimalFn.prototype)); // → [ "speak" ]

try { Animal("x"); } catch (e) { console.log(e.name); } // → "TypeError"

class Dog extends Animal {
  #secret = "bones";                          // truly private field
  speak() { return super.speak() + " Woof!"; }
}
const rex = new Dog("Rex");
console.log(rex.speak());                     // → "Rex makes a sound. Woof!"
console.log(Object.getPrototypeOf(Dog.prototype) === Animal.prototype); // → true

class NotFoundError extends Error { status = 404; }
console.log(new NotFoundError("nope") instanceof Error); // → true`,
  },
  {
    id: 'object-create',
    group: 'Objects & Prototypes',
    stars: 3,
    difficulty: 'Medium',
    q: 'What does `Object.create` do?',
    a: [
      '# ELI5',
      'Imagine signing up for a library card that is linked to a specific library branch. You start with nothing of your own, but you can borrow anything from that branch.',
      'If you choose "no branch at all", you get a completely empty card with nothing to borrow.',
      'Mapping back: `Object.create(proto)` makes a new empty object whose prototype (the branch it borrows from) is `proto`; `Object.create(null)` makes an object with no prototype at all.',
      '# What it is',
      '`Object.create(proto, descriptors?)` creates a new object and sets its internal `[[Prototype]]` to `proto`.',
      'It is the most direct way to set up prototypal inheritance without constructor functions or classes.',
      'The optional second argument is an object of property descriptors (see property descriptors: settings like `writable` and `enumerable`) to define on the new object.',
      '`Object.create(null)` creates a "dictionary object": no prototype, so no inherited keys like `toString`, `constructor` or `__proto__`.',
      'Comparison with other ways of creating objects:',
      '  `{}`: prototype is `Object.prototype`.',
      '  `new Fn()`: prototype is `Fn.prototype`, and the constructor runs.',
      '  `Object.create(proto)`: prototype is `proto`, and no constructor runs.',
      '# How it works',
      'Step by step:',
      '  The engine allocates a new empty object.',
      '  Sets its `[[Prototype]]` to the given `proto` (which must be an object or `null`, otherwise it throws `TypeError`).',
      '  If descriptors were given, defines those properties (defaults: not writable, not enumerable, not configurable).',
      '  Returns the object.',
      'Before classes, it was used to wire up inheritance: `Child.prototype = Object.create(Parent.prototype)` followed by fixing `Child.prototype.constructor = Child`.',
      '# Example walkthrough',
      '`const ann = Object.create(personProto)` creates an empty object linked to `personProto`; after `ann.name = "Ann"`, `ann.greet()` prints `"Hi, I am Ann"`.',
      '`Object.getPrototypeOf(ann) === personProto` prints `true`.',
      '`withId` is created with a descriptor: `id` is `1`, read-only, and not listed by `Object.keys` (prints `[]`).',
      '`dict = Object.create(null)` has no `toString`, so `"toString" in dict` prints `false`, which makes it a safe key-value store.',
      'The ES5 inheritance example makes `Child` instances inherit `Parent` methods, printing `"parent method"`.',
      '# Why it matters / when to use',
      'Safe dictionaries for user-controlled keys, avoiding prototype pollution and collisions with names like `constructor` (though `Map` is often better).',
      'Creating objects that share behaviour from a plain object without writing a class.',
      'Understanding how classes and `new` set prototypes, and reading older inheritance code.',
      '# Common mistakes',
      'Expecting a constructor to run. Fix: `Object.create` never calls a constructor; initialise properties yourself.',
      'Forgetting that descriptor-defined properties default to read-only and non-enumerable. Fix: set `writable: true, enumerable: true` explicitly.',
      'Calling methods like `hasOwnProperty` on an `Object.create(null)` object. Fix: use `Object.hasOwn(dict, key)`.',
      '# Say this in the interview',
      '"`Object.create(proto)` creates a new empty object whose prototype is `proto`, without running any constructor. It is the most direct way to do prototypal inheritance, and the optional second argument defines properties with descriptors. `Object.create(null)` gives an object with no prototype, which is useful as a clean dictionary."',
      'Follow-up: When would you use `Object.create(null)` vs `Map`?',
      '  `Map` is usually better for dynamic keys; `Object.create(null)` is useful when you need a plain object, for example to serialise as JSON.',
    ],
    code: `const personProto = {
  greet() { return "Hi, I am " + this.name; },
};

const ann = Object.create(personProto);   // ann inherits from personProto
ann.name = "Ann";
console.log(ann.greet());                 // → "Hi, I am Ann"
console.log(Object.getPrototypeOf(ann) === personProto); // → true

// Second argument: property descriptors
const withId = Object.create({}, { id: { value: 1 } });
console.log(withId.id, Object.keys(withId)); // → 1 [] (read-only, non-enumerable)

// No prototype: a clean dictionary
const dict = Object.create(null);
dict.user = "x";
console.log("toString" in dict);          // → false
console.log(Object.hasOwn(dict, "user")); // → true

// Classic ES5 inheritance
function Parent() {}
Parent.prototype.hello = function () { return "parent method"; };
function Child() { Parent.call(this); }
Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;
console.log(new Child().hello());         // → "parent method"`,
  },
  {
    id: 'freeze-seal-preventextensions',
    group: 'Objects & Prototypes',
    stars: 3,
    difficulty: 'Easy',
    q: 'What is the difference between `Object.freeze`, `Object.seal` and `Object.preventExtensions`?',
    a: [
      '# ELI5',
      'Think of a toy box with three levels of locks.',
      'Level 1 (`preventExtensions`): you cannot put new toys in, but you can take toys out or swap them.',
      'Level 2 (`seal`): you cannot add or remove toys, but you can still repaint the ones inside.',
      'Level 3 (`freeze`): nothing changes at all: no adding, removing or repainting.',
      'Mapping back: these are increasingly strict ways to lock an object\'s properties.',
      '# What it is',
      'All three restrict changes to an object and cannot be undone.',
      'Comparison, row by row:',
      '  Add new properties: `preventExtensions` = no; `seal` = no; `freeze` = no.',
      '  Delete existing properties: `preventExtensions` = yes; `seal` = no; `freeze` = no.',
      '  Change existing values: `preventExtensions` = yes; `seal` = yes; `freeze` = no.',
      '  Reconfigure properties (change descriptors): `preventExtensions` = yes; `seal` = no; `freeze` = no.',
      '  Check with: `Object.isExtensible`, `Object.isSealed`, `Object.isFrozen`.',
      'All three are shallow: nested objects are not affected unless you lock them too.',
      'Failed changes are silently ignored in sloppy mode and throw `TypeError` in strict mode (which includes ES modules and classes).',
      '`const` is different: it stops reassignment of the variable, but does not stop changes to the object.',
      '# How it works',
      'Each object has an internal "extensible" flag and each property has a descriptor with `writable` and `configurable` attributes.',
      '  `preventExtensions` sets extensible to false.',
      '  `seal` does that and sets `configurable: false` on all own properties (so they cannot be deleted or redefined).',
      '  `freeze` does both and also sets `writable: false` on all data properties.',
      'Accessor properties (getters/setters) on a frozen object still run, so a setter could change some other, unfrozen state.',
      'To freeze deeply, recursively call `Object.freeze` on every nested object.',
      '# Example walkthrough',
      'On `pe` (preventExtensions), adding `b` is ignored, changing `a` works, deleting `a` works.',
      'On `sealed`, adding fails, deleting fails, but `sealed.a = 2` works.',
      'On `frozen`, nothing changes; in strict mode the write throws `TypeError`, which the `try` catches.',
      '`frozen.nested.x = 99` succeeds because freeze is shallow; `deepFreeze` fixes that.',
      '# Why it matters / when to use',
      'Freezing shared config or constants so no module accidentally mutates them at runtime.',
      'Freezing enum-like objects: `const Status = Object.freeze({ ACTIVE: "active" })`.',
      'Returning frozen cached data so callers cannot corrupt the cache.',
      '# Common mistakes',
      'Assuming freeze is deep. Fix: use a recursive `deepFreeze` or `structuredClone` copies.',
      'Expecting an error in sloppy mode CommonJS code. Fix: enable strict mode so violations throw.',
      'Confusing `const` with `Object.freeze`. They protect different things: the binding vs the object.',
      '# Say this in the interview',
      '"`preventExtensions` stops new properties from being added. `seal` also stops deleting or reconfiguring properties but still allows changing values. `freeze` additionally makes all values read-only. All three are shallow and irreversible, and violations throw only in strict mode, so for deep immutability you need to freeze recursively."',
      'Follow-up: How is `const` different from `Object.freeze`?',
      '  `const` prevents reassigning the variable; `freeze` prevents changing the object itself.',
    ],
    code: `"use strict";
const pe = Object.preventExtensions({ a: 1 });
try { pe.b = 2; } catch (e) { console.log("add:", e.name); } // → add: TypeError
pe.a = 10; delete pe.a;
console.log(pe);                          // → {} (change and delete allowed)

const sealed = Object.seal({ a: 1 });
try { delete sealed.a; } catch (e) { console.log("delete:", e.name); } // → delete: TypeError
sealed.a = 2;                             // changing values is allowed
console.log(sealed.a, Object.isSealed(sealed)); // → 2 true

const frozen = Object.freeze({ a: 1, nested: { x: 1 } });
try { frozen.a = 2; } catch (e) { console.log("write:", e.name); } // → write: TypeError
frozen.nested.x = 99;                     // shallow! nested still mutable
console.log(frozen.nested.x);             // → 99

function deepFreeze(obj) {
  for (const value of Object.values(obj)) {
    if (value && typeof value === "object") deepFreeze(value);
  }
  return Object.freeze(obj);
}
const config = deepFreeze({ db: { host: "localhost" } });
console.log(Object.isFrozen(config.db));  // → true`,
  },
  {
    id: 'object-equality',
    group: 'Objects & Prototypes',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do you compare two objects for equality?',
    a: [
      '# ELI5',
      'Two houses can be built from the same blueprint, with the same rooms and furniture, but they are still two different houses at two different addresses.',
      'Asking "is this the same house?" checks the address. Asking "do these houses look the same inside?" means walking through every room.',
      'Mapping back: `===` checks if two variables point to the same object (same address); comparing contents needs a deep equality check.',
      '# What it is',
      'Reference equality: `a === b` (and `==`, `Object.is`) is true only if both point to the exact same object in memory.',
      'Structural (deep) equality: two objects are "equal" if they have the same keys and the same values, recursively for nested objects.',
      'JavaScript has no built-in deep-equal operator for objects. Options:',
      '  Write a recursive `deepEqual` function.',
      '  Node.js: `util.isDeepStrictEqual(a, b)` from `node:util`, or `assert.deepStrictEqual` in tests.',
      '  Libraries: lodash `isEqual`; test frameworks: Jest/Vitest `toEqual` / `toStrictEqual`.',
      '  `JSON.stringify(a) === JSON.stringify(b)`: quick but fragile, because key order matters and it ignores `undefined`, functions, and mishandles `Date`, `Map` and `Set`.',
      'Shallow equality: compare only the top-level keys with `===` (used by React to decide re-renders).',
      '# How it works',
      'A typical `deepEqual(a, b)`:',
      '  If `Object.is(a, b)`, return true (same reference or same primitive, handles `NaN`).',
      '  If either is not an object (or is `null`), return false.',
      '  If their prototypes differ (e.g. array vs object), return false.',
      '  Get both key lists; if lengths differ, return false.',
      '  For each key, check the other object has it and recursively `deepEqual` the values.',
      'Production-quality versions also handle `Date`, `RegExp`, `Map`, `Set`, typed arrays and circular references.',
      '# Example walkthrough',
      '`a === b` prints `false` even though contents are identical; `a === a` prints `true`.',
      '`JSON.stringify` comparison prints `false` for `{x:1,y:2}` vs `{y:2,x:1}` because key order differs.',
      '`deepEqual(a, b)` walks both objects and prints `true`; comparing with `{ ...a, tags: ["z"] }` prints `false`.',
      '`isDeepStrictEqual` from Node gives the same answer and also handles dates, maps and sets.',
      '# Why it matters / when to use',
      'Tests: asserting an API response equals an expected object.',
      'Change detection: only writing to the database or cache when data actually changed.',
      'Deduplicating requests or memoising on object arguments.',
      '# Common mistakes',
      'Using `===` to compare objects or arrays by content. Fix: use a deep-equal helper.',
      'Relying on `JSON.stringify` comparisons. Fix: use `util.isDeepStrictEqual` or lodash `isEqual`.',
      'Using objects as `Map` keys or in `Set` expecting content matching. Fix: they match by reference; use a string key (like an id) instead.',
      '# Say this in the interview',
      '"`===` compares objects by reference, so two separate objects with the same content are not equal. To compare contents I use a deep equality check: in Node `util.isDeepStrictEqual`, lodash `isEqual`, or a recursive function that compares prototypes, key counts and each value. I avoid comparing `JSON.stringify` output because it depends on key order and drops some types."',
      'Follow-up: What is shallow equality?',
      '  Comparing only the top-level keys with `===`; nested objects must be the same references.',
    ],
    code: `const { isDeepStrictEqual } = require("node:util");

const a = { x: 1, y: 2, tags: ["t"] };
const b = { x: 1, y: 2, tags: ["t"] };
console.log(a === b);                     // → false (different objects)
console.log(a === a);                     // → true

console.log(JSON.stringify({ x: 1, y: 2 }) === JSON.stringify({ y: 2, x: 1 })); // → false (key order!)

function deepEqual(p, q) {
  if (Object.is(p, q)) return true;
  if (typeof p !== "object" || typeof q !== "object" || p === null || q === null) return false;
  if (Object.getPrototypeOf(p) !== Object.getPrototypeOf(q)) return false;
  const kp = Object.keys(p);
  const kq = Object.keys(q);
  if (kp.length !== kq.length) return false;
  return kp.every((k) => Object.hasOwn(q, k) && deepEqual(p[k], q[k]));
}

console.log(deepEqual(a, b));                    // → true
console.log(deepEqual(a, { ...a, tags: ["z"] })); // → false
console.log(isDeepStrictEqual(a, b));            // → true (built into Node)
console.log(isDeepStrictEqual(new Date(0), new Date(0))); // → true`,
  },
  {
    id: 'private-class-fields',
    group: 'Objects & Prototypes',
    stars: 3,
    difficulty: 'Easy',
    q: 'How do private fields work in JavaScript classes?',
    a: [
      '# ELI5',
      'Imagine a diary with a lock that only you have the key to. Friends can see the diary on your desk, but they cannot open it, and they cannot even tell what is written inside.',
      'Writing "PRIVATE" on a normal notebook (the old underscore trick) is just a polite request; anyone can still read it.',
      'Mapping back: `#field` is the locked diary, enforced by the engine; `_field` is the polite sign that is not enforced.',
      '# What it is',
      'Private class members are fields, methods, getters and setters whose names start with `#`, for example `#balance`.',
      'They can only be accessed from code inside the class body. Accessing them from outside is a `SyntaxError` at parse time (the code will not even run).',
      'They were standardised in ES2022 and work in Node 12+ (fully in modern Node).',
      'Before this, developers used conventions: `_balance` (only a naming hint), closures (factory functions), or `WeakMap`s keyed by the instance.',
      'Features:',
      '  Private fields: `#count = 0`.',
      '  Private methods: `#validate() {}`.',
      '  Static private members: `static #instances = 0`.',
      '  Brand check: `#field in obj` returns true if `obj` has that private field, a safe way to check "is this a real instance of my class".',
      'TypeScript\'s `private` keyword is different: it is only checked at compile time and the property is a normal public property at runtime. `#` is enforced at runtime.',
      '# How it works',
      'Each private name (`#balance`) is unique to the class that declares it. Even another class with a `#balance` has a different name.',
      'When an instance is created, the engine attaches the private fields to it in a hidden slot, not as normal properties.',
      'Consequences:',
      '  They do not appear in `Object.keys`, `for...in`, `JSON.stringify` or `console.log` key listings (Node may show them in the inspector).',
      '  They are not inherited through the prototype; subclasses cannot access a parent\'s `#field` directly.',
      '  Accessing `#x` on an object that does not have it throws a `TypeError`.',
      '# Example walkthrough',
      '`new Account(100)` stores `#balance = 100` privately.',
      '`acc.deposit(50)` calls the private `#validate` method, then updates the balance; `acc.balance` (a getter) prints `150`.',
      '`acc.deposit(-5)` is rejected by `#validate` and throws `"Amount must be positive"`.',
      '`Object.keys(acc)` prints `[]` and `JSON.stringify(acc)` prints `{}`: the field is invisible.',
      '`Account.isAccount(acc)` uses `#balance in obj` and prints `true`; for `{}` it prints `false`.',
      'Writing `acc.#balance` outside the class would be a `SyntaxError`, so it is shown as a comment.',
      '# Why it matters / when to use',
      'Protecting invariants (rules that must always hold), such as "balance never goes negative", by forcing all changes through methods.',
      'Hiding secrets or internal state in SDK clients (`#apiKey`, `#connectionPool`) so they are not logged or serialised by accident.',
      'Safer libraries: users cannot depend on internals, so you can change them freely.',
      '# Common mistakes',
      'Assuming TypeScript `private` hides data at runtime. Fix: use `#` when runtime privacy matters.',
      'Using `this.#x` inside a callback where `this` is not the instance. Fix: use arrow functions so `this` stays the instance.',
      'Proxies: wrapping an instance with private fields in a `Proxy` breaks private access, because `this` becomes the proxy. Be aware when using proxy-based libraries.',
      '# Say this in the interview',
      '"Private fields are class members prefixed with `#`. They are only accessible inside the class body; outside access is a syntax error, and they do not show up in keys, JSON or reflection. Each `#name` is unique to its class, so they are not inherited. Unlike TypeScript\'s `private` keyword, which is compile-time only, `#` privacy is enforced by the engine at runtime."',
      'Follow-up: How do you check if an object has a private field?',
      '  Use the ergonomic brand check `#field in obj` inside the class.',
      'Follow-up: Can a subclass read the parent\'s `#field`?',
      '  No, it must use a public or protected-by-convention method the parent exposes.',
    ],
    code: `class Account {
  #balance = 0;                    // private field
  static #count = 0;               // private static field

  constructor(initial) {
    this.#balance = initial;
    Account.#count++;
  }
  #validate(amount) {              // private method
    if (amount <= 0) throw new Error("Amount must be positive");
  }
  deposit(amount) {
    this.#validate(amount);
    this.#balance += amount;
  }
  get balance() { return this.#balance; }   // read-only public view
  static isAccount(obj) { return #balance in obj; } // brand check
}

const acc = new Account(100);
acc.deposit(50);
console.log(acc.balance);                  // → 150
try { acc.deposit(-5); } catch (e) { console.log(e.message); } // → "Amount must be positive"
console.log(Object.keys(acc));             // → []
console.log(JSON.stringify(acc));          // → {}
console.log(Account.isAccount(acc));       // → true
console.log(Account.isAccount({}));        // → false
// acc.#balance                            // SyntaxError if uncommented`,
  },
  {
    id: 'property-descriptors',
    group: 'Objects & Prototypes',
    stars: 2,
    difficulty: 'Medium',
    q: 'What are property descriptors?',
    a: [
      '# ELI5',
      'Every drawer in a cabinet has a little settings card: "can you change what is inside?", "does it show up when someone lists all drawers?", "can the drawer be removed or its settings changed?".',
      'Usually all answers are "yes", but you can set them to "no" to protect a drawer.',
      'Mapping back: every object property has a hidden descriptor that controls whether it can be written, listed and reconfigured.',
      '# What it is',
      'A property descriptor is a small object describing how a single property behaves.',
      'There are two kinds of properties:',
      '  Data property: holds a value. Descriptor keys: `value`, `writable`, `enumerable`, `configurable`.',
      '  Accessor property: runs functions on read/write. Descriptor keys: `get`, `set`, `enumerable`, `configurable`.',
      'What each flag means:',
      '  `writable`: can the value be changed with assignment?',
      '  `enumerable`: does it show up in `Object.keys`, `for...in`, `JSON.stringify` and spread?',
      '  `configurable`: can it be deleted, and can its descriptor be changed (except making a writable property non-writable)?',
      'Defaults depend on how the property is created:',
      '  Normal assignment or object literal (`obj.x = 1`): all flags `true`.',
      '  `Object.defineProperty(obj, "x", { value: 1 })`: unspecified flags default to `false`.',
      'Read descriptors with `Object.getOwnPropertyDescriptor(obj, key)` or `Object.getOwnPropertyDescriptors(obj)`.',
      '# How it works',
      'When you assign `obj.x = 5`, the engine checks the descriptor:',
      '  If `writable: false`, the write is ignored (sloppy) or throws `TypeError` (strict).',
      '  If it is an accessor, the `set` function runs instead of storing a value.',
      'When you list keys, non-enumerable properties are skipped (this is why built-in methods like `toString` do not show up).',
      '`Object.freeze` and `Object.seal` work by bulk-setting these flags on every property.',
      '# Example walkthrough',
      'Reading the descriptor of a normal property shows `{ value: 1, writable: true, enumerable: true, configurable: true }`.',
      '`defineProperty(user, "id", { value: 42 })` creates `id` with all flags `false`: it is read-only and hidden from `Object.keys` (which prints `["name"]`).',
      'Assigning `user.id = 7` in strict mode throws `TypeError`.',
      'The `fullName` accessor property computes its value from `first` and `last` on each read.',
      '# Why it matters / when to use',
      'Defining constants or IDs on objects that must not change.',
      'Hiding internal metadata from `JSON.stringify` and logs by making it non-enumerable.',
      'Libraries and ORMs use descriptors to create computed or lazily-loaded properties.',
      '# Common mistakes',
      'Forgetting that `defineProperty` defaults flags to `false`, creating accidentally read-only, hidden properties. Fix: set `writable`, `enumerable`, `configurable` explicitly.',
      'Mixing `value`/`writable` with `get`/`set` in one descriptor, which throws `TypeError`. Fix: choose data or accessor.',
      'Expecting a non-configurable property to be deletable. It cannot be deleted or redefined.',
      '# Say this in the interview',
      '"Every property has a descriptor. Data properties have `value` and `writable`; accessor properties have `get` and `set`; both have `enumerable` and `configurable`. Assigned properties default every flag to true, but `Object.defineProperty` defaults them to false. They let you create read-only, hidden or computed properties, and they are how freeze and seal work."',
      'Follow-up: Why does `toString` not show up in `for...in`?',
      '  Because built-in methods on `Object.prototype` are non-enumerable.',
    ],
    code: `"use strict";
const user = { name: "Ann" };
console.log(Object.getOwnPropertyDescriptor(user, "name"));
// → { value: "Ann", writable: true, enumerable: true, configurable: true }

Object.defineProperty(user, "id", { value: 42 }); // flags default to false
console.log(user.id);                     // → 42
console.log(Object.keys(user));           // → [ "name" ] (id is hidden)
console.log(JSON.stringify(user));        // → {"name":"Ann"}
try { user.id = 7; } catch (e) { console.log(e.name); } // → "TypeError"

const person = { first: "Ada", last: "Lovelace" };
Object.defineProperty(person, "fullName", {
  get() { return this.first + " " + this.last; },  // accessor property
  enumerable: true,
});
console.log(person.fullName);             // → "Ada Lovelace"
person.first = "Augusta";
console.log(person.fullName);             // → "Augusta Lovelace"

try {
  Object.defineProperty({}, "bad", { value: 1, get() { return 1; } });
} catch (e) {
  console.log(e.name);                    // → "TypeError" (cannot mix both kinds)
}`,
  },
  {
    id: 'getters-setters',
    group: 'Objects & Prototypes',
    stars: 2,
    difficulty: 'Easy',
    q: 'What are getters and setters?',
    a: [
      '# ELI5',
      'Imagine a thermostat. You read "the temperature" off the screen, but behind the screen a little machine measures and calculates it each time you look.',
      'When you set a new temperature, the machine checks it first: it refuses to set 500 degrees.',
      'Mapping back: a getter is code that runs when you read a property, and a setter is code that runs when you assign to it.',
      '# What it is',
      'Getters and setters are accessor properties: they look like normal properties from the outside, but reading or writing them calls a function.',
      'A getter is defined with `get name() { ... }` and runs on `obj.name`.',
      'A setter is defined with `set name(value) { ... }` and runs on `obj.name = value`.',
      'They can be defined in object literals, classes, or with `Object.defineProperty`.',
      'Common uses:',
      '  Computed values (`fullName` from `first` + `last`).',
      '  Validation on assignment (reject negative ages).',
      '  Read-only views of private data (getter without a setter).',
      '  Lazy computation and caching.',
      '# How it works',
      'When the engine reads `obj.prop`, it finds the property (possibly up the prototype chain). If it is an accessor, it calls the getter with `this` = `obj` and returns the result.',
      'When assigning `obj.prop = v`, if an accessor with a setter is found, it calls the setter with `v` instead of storing a value.',
      'If there is a getter but no setter, assignment is ignored in sloppy mode and throws `TypeError` in strict mode.',
      'In classes, getters/setters live on the prototype and are shared; the actual data is usually stored in a private field like `#celsius`.',
      'A setter must store the data under a different name; writing to the same property inside its own setter calls the setter again, causing infinite recursion.',
      '# Example walkthrough',
      '`t.celsius = 25` runs the setter, which stores 25 in `#celsius`.',
      '`t.fahrenheit` runs the getter and prints `77`, computed from the stored celsius.',
      '`t.celsius = -300` triggers validation and throws `"Below absolute zero"`.',
      '`t.fahrenheit = 212` uses the fahrenheit setter, which converts and stores `100` celsius.',
      'The object-literal `user.fullName` getter prints `"Ada Lovelace"`.',
      '# Why it matters / when to use',
      'Domain models in backend code: enforcing rules like "email must be lowercase" whenever the field is set.',
      'Exposing derived values (`order.total`) without storing redundant data.',
      'Keeping a stable public API while changing internal storage later.',
      '# Common mistakes',
      'Infinite recursion: `set name(v) { this.name = v; }`. Fix: store in a different field like `this.#name`.',
      'Doing slow work (DB calls) inside getters, which surprises callers who think it is just a property read. Fix: use an explicit method like `loadOrders()`.',
      'Expecting getters to appear in `JSON.stringify` of class instances. Class getters live on the prototype, so they are skipped. Fix: add a `toJSON()` method.',
      '# Say this in the interview',
      '"Getters and setters are accessor properties: reading the property runs the `get` function and assigning runs the `set` function. I use them for computed values, validation on assignment and read-only views over private fields. The key gotcha is storing the value under a different name, like a `#private` field, to avoid infinite recursion."',
      'Follow-up: What happens if you assign to a property that has only a getter?',
      '  It is ignored in sloppy mode and throws a `TypeError` in strict mode.',
    ],
    code: `class Temperature {
  #celsius = 0;
  get celsius() { return this.#celsius; }
  set celsius(value) {
    if (value < -273.15) throw new RangeError("Below absolute zero");
    this.#celsius = value;          // store in a DIFFERENT field
  }
  get fahrenheit() { return this.#celsius * 9 / 5 + 32; }
  set fahrenheit(f) { this.celsius = (f - 32) * 5 / 9; } // reuses validation
}

const t = new Temperature();
t.celsius = 25;                       // runs the setter
console.log(t.fahrenheit);            // → 77 (computed by the getter)
try { t.celsius = -300; } catch (e) { console.log(e.message); } // → "Below absolute zero"
t.fahrenheit = 212;
console.log(t.celsius);               // → 100

const user = {
  first: "Ada",
  last: "Lovelace",
  get fullName() { return this.first + " " + this.last; },
};
console.log(user.fullName);           // → "Ada Lovelace"
console.log(JSON.stringify(t));       // → {} (class getters live on the prototype)`,
  },
  {
    id: 'instanceof',
    group: 'Objects & Prototypes',
    stars: 2,
    difficulty: 'Medium',
    q: 'How does `instanceof` work? Implement it.',
    a: [
      '# ELI5',
      'To check if someone belongs to the Smith family, you look at their parent, then grandparent, then great-grandparent, and see whether any of them is a Smith.',
      'It does not matter what name the person uses; what matters is the family line.',
      'Mapping back: `obj instanceof Ctor` walks up `obj`\'s prototype chain looking for `Ctor.prototype`.',
      '# What it is',
      '`obj instanceof Ctor` returns `true` if `Ctor.prototype` appears anywhere in the prototype chain of `obj`.',
      'It does not check how the object was created or which constructor ran; it only checks prototype links.',
      'Classes can customise the check with a static `Symbol.hasInstance` method.',
      'Primitives always give `false` (`"hi" instanceof String` is `false`), because a primitive has no prototype chain of its own.',
      'Related tools:',
      '  `Ctor.prototype.isPrototypeOf(obj)`: the same chain check written the other way round.',
      '  `Array.isArray(x)`: reliable even across realms.',
      'A realm is a separate JavaScript global environment, such as an iframe or a Node `vm` context. Each realm has its own `Array`, `Object`, etc, so an array from another realm fails `instanceof Array`.',
      '# How it works',
      'For `obj instanceof Ctor`:',
      '  If `Ctor` has a `Symbol.hasInstance` method, call it and return its boolean result.',
      '  If `Ctor` is not callable, throw `TypeError`.',
      '  If `obj` is not an object, return `false`.',
      '  Let `target = Ctor.prototype`. Let `proto = Object.getPrototypeOf(obj)`.',
      '  Loop: if `proto === target`, return `true`; if `proto === null`, return `false`; otherwise `proto = Object.getPrototypeOf(proto)`.',
      'Because it is based on the current value of `Ctor.prototype`, replacing `Ctor.prototype` after creating an object makes old objects fail the check.',
      '# Example walkthrough',
      '`rex instanceof Dog` and `rex instanceof Animal` both print `true` because both prototypes are in the chain.',
      '`myInstanceOf(rex, Animal)` runs the manual loop and prints `true`; `myInstanceOf(rex, Array)` prints `false`.',
      '`myInstanceOf(5, Number)` prints `false` because primitives are rejected.',
      '`Object.create(Dog.prototype)` passes `instanceof Dog` even though the constructor never ran: proof it only checks the chain.',
      '`Even` uses `Symbol.hasInstance` so `2 instanceof Even` prints `true`.',
      '# Why it matters / when to use',
      'Error handling in Express middleware: `if (err instanceof ValidationError) return res.status(400)...`.',
      'Narrowing types in TypeScript: `if (x instanceof Date)` lets the compiler know `x` is a `Date`.',
      'Understanding its limits (realms, duplicated packages in `node_modules`) helps debug "instanceof returns false but it IS that class" bugs.',
      '# Common mistakes',
      'Using `instanceof Array` across realms. Fix: use `Array.isArray`.',
      'Two copies of the same library in `node_modules` create two different classes, so `instanceof` fails. Fix: dedupe dependencies or check a property such as `err.code` or `err.name`.',
      'Expecting `instanceof` to work for primitives. Fix: use `typeof` for primitives.',
      '# Say this in the interview',
      '"`obj instanceof Ctor` walks up the prototype chain of `obj` and returns true if it finds `Ctor.prototype`, unless the class defines `Symbol.hasInstance`. To implement it, I get the prototype of the object and loop with `Object.getPrototypeOf` until I either hit `Ctor.prototype` and return true, or reach null and return false. It is unreliable across realms, so for arrays I use `Array.isArray`."',
      'Follow-up: Does `instanceof` check the constructor property?',
      '  No, only the prototype chain; the `constructor` property is not used.',
    ],
    code: `function myInstanceOf(obj, Ctor) {
  if (typeof Ctor !== "function") throw new TypeError("Right side must be callable");
  if (obj === null || (typeof obj !== "object" && typeof obj !== "function")) return false;
  const target = Ctor.prototype;
  let proto = Object.getPrototypeOf(obj);
  while (proto !== null) {
    if (proto === target) return true;   // found it in the chain
    proto = Object.getPrototypeOf(proto); // go one level up
  }
  return false;                          // reached the end
}

class Animal {}
class Dog extends Animal {}
const rex = new Dog();

console.log(rex instanceof Dog, rex instanceof Animal); // → true true
console.log(myInstanceOf(rex, Animal));  // → true
console.log(myInstanceOf(rex, Array));   // → false
console.log(myInstanceOf(5, Number));    // → false (primitive)

const fake = Object.create(Dog.prototype); // constructor never ran
console.log(fake instanceof Dog);        // → true (only the chain matters)

class Even {
  static [Symbol.hasInstance](n) { return n % 2 === 0; }
}
console.log(2 instanceof Even);          // → true (custom check)`,
  },

  // ───────────────────────── Async & Event Loop ─────────────────────────
  {
    id: 'event-loop',
    group: 'Async & Event Loop',
    stars: 5,
    difficulty: 'Hard',
    q: 'Explain the JavaScript event loop.',
    a: [
      '# ELI5',
      'Picture a restaurant with only one chef (JavaScript has one main thread). The chef cooks one dish at a time and never does two things at once.',
      'Slow jobs, like baking bread for 30 minutes, are handed to helpers (the oven, the delivery guy). The chef does not stand and wait; he moves on to the next order.',
      'When a helper is done, they put a ticket on the "ready" board. Whenever the chef finishes the current dish, he checks the board: first the VIP tickets (microtasks), then the normal tickets (macrotasks), one by one.',
      'Mapping back: the chef is the call stack on the single JS thread, the helpers are the browser or Node APIs (timers, network, disk), the boards are the task queues, and the chef checking the board is the event loop.',
      '# What it is',
      'JavaScript runs your code on a single thread: one piece of code at a time. The event loop is the mechanism that lets it handle many slow operations (network, timers, files) without blocking.',
      'Key parts:',
      '  Call stack: the list of functions currently running, newest on top. JS executes whatever is on top until the stack is empty.',
      '  Host APIs: features provided by the environment, not the JS engine itself, such as `setTimeout`, `fetch`, file system and sockets. In Node these are powered by libuv, a C library that uses the operating system and a thread pool.',
      '  Macrotask queue (task queue): callbacks for timers, I/O, `setImmediate`, UI events.',
      '  Microtask queue: callbacks for promise reactions (`.then`, `await` continuations) and `queueMicrotask`. In Node, `process.nextTick` callbacks run in an even higher-priority queue before other microtasks.',
      'The rule: run synchronous code until the stack is empty, then drain ALL microtasks, then take ONE macrotask, then drain all microtasks again, and repeat.',
      'Non-blocking means the thread never sits idle waiting for slow work; it registers a callback and continues with other work.',
      '# How it works',
      'Step by step for one loop "tick":',
      '  1. Run the current script (synchronous code) on the call stack until it is empty.',
      '  2. Drain the microtask queue completely (and any microtasks those microtasks schedule).',
      '  3. (Browser) Render the page if needed.',
      '  4. Take the next ready macrotask (for example an expired timer or completed I/O), run its callback on the stack.',
      '  5. Go back to step 2.',
      'Node splits macrotasks into phases, run in this order each loop:',
      '  timers (`setTimeout`/`setInterval` callbacks whose time is up).',
      '  pending callbacks (some system errors).',
      '  poll (fetch new I/O events and run their callbacks; waits here if nothing else to do).',
      '  check (`setImmediate` callbacks).',
      '  close callbacks (`socket.on("close")`).',
      '  Between every single callback, Node drains `process.nextTick` callbacks and then promise microtasks.',
      'While a long synchronous function runs (for example a huge loop or `JSON.parse` of a 200 MB string), nothing else can run: timers fire late and HTTP requests wait.',
      '# Example walkthrough',
      '"1 sync start" prints first: it is plain synchronous code.',
      '`setTimeout(..., 0)` hands a callback to the timer system; it goes to the macrotask queue later.',
      '`Promise.resolve().then(...)` queues a microtask; `process.nextTick` queues a nextTick callback.',
      '"2 sync end" prints next, still synchronous.',
      'Stack is now empty: Node runs nextTick first ("3 nextTick"), then promise microtasks ("4 promise").',
      'Only then does the event loop reach the timers phase and print "5 timeout".',
      'Final order: 1, 2, 3, 4, 5.',
      '# Why it matters / when to use',
      'It explains why one Node process can handle thousands of concurrent connections: while waiting on the database, the thread serves other requests.',
      'It explains why CPU-heavy work (image processing, big loops, sync crypto) in a request handler slows down every user. Move it to `worker_threads`, a job queue, or another service.',
      'It is the foundation for understanding promises, `async`/`await`, and output-order puzzles in interviews.',
      '# Common mistakes',
      'Thinking `setTimeout(fn, 0)` runs immediately. It runs after current code and all microtasks, at the earliest.',
      'Thinking async means multi-threaded. Your JS callbacks still run one at a time on one thread; only the waiting happens elsewhere.',
      'Using synchronous APIs like `fs.readFileSync` inside request handlers. Fix: use `fs.promises` versions in servers.',
      'Creating infinite microtask loops (a `.then` that always schedules another), which starves timers and I/O.',
      '# Say this in the interview',
      '"JavaScript runs on a single thread with one call stack. Slow operations like timers and I/O are handed to the host environment, which in Node is libuv, and their callbacks are queued when ready. The event loop waits for the call stack to be empty, drains the entire microtask queue, which holds promise callbacks, then runs the next macrotask such as a timer or I/O callback, and repeats. That is why Node is non-blocking for I/O but CPU-heavy code blocks everything."',
      'Follow-up: What are the Node event loop phases?',
      '  Timers, pending callbacks, poll, check (`setImmediate`), close callbacks; nextTick and microtasks are drained between each callback.',
      'Follow-up: How would you handle CPU-heavy work in Node?',
      '  Offload it to `worker_threads`, a child process, or a background job queue so the main thread stays responsive.',
    ],
    code: `console.log("1 sync start");

setTimeout(() => {
  console.log("5 timeout");          // macrotask: timers phase
}, 0);

Promise.resolve().then(() => {
  console.log("4 promise");          // microtask
});

process.nextTick(() => {
  console.log("3 nextTick");         // Node: runs before promise microtasks
});

console.log("2 sync end");

// Output order:
// 1 sync start
// 2 sync end
// 3 nextTick
// 4 promise
// 5 timeout

// Blocking demo: the timer cannot fire until this loop ends
const start = Date.now();
setTimeout(() => console.log("late by", Date.now() - start, "ms"), 10);
while (Date.now() - start < 200) {}  // busy-wait blocks the single thread
// → "late by ~200 ms" (not 10)`,
  },
  {
    id: 'microtask-vs-macrotask',
    group: 'Async & Event Loop',
    stars: 5,
    difficulty: 'Hard',
    q: 'What is the difference between microtasks and macrotasks?',
    a: [
      '# ELI5',
      'At a doctor\'s office there are two lines. The "quick question" line (microtasks) and the "full appointment" line (macrotasks).',
      'After the doctor finishes with any patient, she answers EVERY quick question waiting, even new ones that arrive while she is answering, before calling the next full appointment.',
      'Mapping back: after each piece of work, the engine empties the whole microtask queue before running the next single macrotask.',
      '# What it is',
      'Both are queues of callbacks waiting to run on the single JavaScript thread; they differ in priority.',
      'Microtasks (high priority, run as soon as the call stack is empty):',
      '  Promise reactions: `.then`, `.catch`, `.finally` callbacks.',
      '  Code after `await` in an async function.',
      '  `queueMicrotask(fn)`.',
      '  `MutationObserver` callbacks (browser).',
      '  Node only: `process.nextTick` runs in its own queue, before promise microtasks.',
      'Macrotasks (also just called tasks):',
      '  `setTimeout`, `setInterval`.',
      '  `setImmediate` (Node).',
      '  I/O callbacks (network, file system), `MessageChannel` messages, UI events.',
      'Comparison, row by row:',
      '  When they run: microtasks = right after the current task, before anything else; macrotasks = one per event loop turn.',
      '  How many per turn: microtasks = all of them, until the queue is empty; macrotasks = one, then microtasks are drained again.',
      '  Risk: microtasks = can starve the loop if they keep adding more; macrotasks = let I/O and rendering happen in between.',
      '# How it works',
      'The loop, simplified:',
      '  Run one macrotask (the initial script itself counts as the first one).',
      '  When the stack empties, run microtasks until the microtask queue is empty, including any newly added ones.',
      '  (Browser: maybe render.)',
      '  Pick the next macrotask and repeat.',
      'In Node, after each macrotask callback: first all `process.nextTick` callbacks, then all promise microtasks, then move on.',
      'A resolved promise\'s `.then` callback is always asynchronous: it goes to the microtask queue even if the promise is already resolved.',
      '# Example walkthrough',
      'Synchronous lines "A" and "F" print first.',
      'Then microtasks: "C" (promise `.then`), then "D" (`queueMicrotask`), in the order they were queued.',
      'Inside "C" a new microtask "E" is queued; it still runs before any timer because microtasks are fully drained.',
      'Finally the macrotask "B" (`setTimeout`) runs.',
      'Final order: A, F, C, D, E, B.',
      '# Why it matters / when to use',
      'Predicting output order in interviews and when debugging tricky async bugs.',
      'Understanding why a long chain of `.then`/`await` without real I/O can delay timers and incoming requests.',
      'Choosing tools: `queueMicrotask` to run something right after current code; `setImmediate`/`setTimeout` to yield to the event loop so I/O can be processed (for example when chunking a big job).',
      '# Common mistakes',
      'Assuming `setTimeout(fn, 0)` runs before a promise `.then`. It never does if both were scheduled in the same task.',
      'Recursive `process.nextTick` or microtask loops that never yield, freezing I/O. Fix: use `setImmediate` to break up work.',
      'Forgetting that `await` always yields: code after `await` is a microtask, even if the awaited value is not a promise.',
      '# Say this in the interview',
      '"Both are callback queues, but microtasks, like promise callbacks, `await` continuations and `queueMicrotask`, have higher priority. After the current task finishes, the engine drains the entire microtask queue, including newly added microtasks, before taking the next macrotask, like a timer, I/O callback or `setImmediate`. In Node, `process.nextTick` runs even before promise microtasks."',
      'Follow-up: Can microtasks starve the event loop?',
      '  Yes, if each microtask schedules another, macrotasks like timers and I/O never get a turn.',
      'Follow-up: `setImmediate` vs `setTimeout(fn, 0)` in Node?',
      '  Inside an I/O callback, `setImmediate` always runs first; from the main module the order is not guaranteed.',
    ],
    code: `console.log("A");                          // sync

setTimeout(() => console.log("B"), 0);     // macrotask

Promise.resolve().then(() => {
  console.log("C");                        // microtask 1
  queueMicrotask(() => console.log("E"));  // added while draining: still before B
});

queueMicrotask(() => console.log("D"));    // microtask 2

console.log("F");                          // sync

// Output: A, F, C, D, E, B

// Node: nextTick beats promises; setImmediate vs timeout inside I/O
const fs = require("node:fs");
fs.readFile(__filename, () => {
  setTimeout(() => console.log("timeout (after I/O)"), 0);
  setImmediate(() => console.log("immediate (after I/O)")); // always first here
  process.nextTick(() => console.log("nextTick (after I/O)")); // first of all
});
// → nextTick (after I/O), immediate (after I/O), timeout (after I/O)`,
  },
  {
    id: 'promises',
    group: 'Async & Event Loop',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is a Promise?',
    a: [
      '# ELI5',
      'When you order food at a busy counter, you get a buzzer instead of food. The buzzer is a promise: "your food will come, or we will tell you something went wrong".',
      'While you wait, you can sit down and do other things. When the buzzer goes off, you either pick up your food (success) or hear "sorry, we ran out" (failure).',
      'Once it buzzes, the result is final: it cannot change from "food ready" to "ran out".',
      'Mapping back: a Promise is an object representing a value that will be available later, which ends in either success (fulfilled) or failure (rejected).',
      '# What it is',
      'A Promise is an object that represents the eventual result of an asynchronous operation (an operation that finishes later, like a database query).',
      'It has three states:',
      '  pending: still waiting.',
      '  fulfilled: finished successfully, with a value.',
      '  rejected: failed, with a reason (usually an `Error`).',
      '"Settled" means fulfilled or rejected. A promise settles only once and then never changes.',
      'You react to the result with methods that register callbacks:',
      '  `.then(onFulfilled, onRejected?)`: runs when it succeeds (or fails, if the second argument is given).',
      '  `.catch(onRejected)`: runs when it fails; same as `.then(undefined, onRejected)`.',
      '  `.finally(fn)`: runs either way, for cleanup; it does not receive or change the value.',
      'Promises replaced deeply nested callbacks ("callback hell") with flat, chainable code and centralised error handling.',
      '# How it works',
      'Creating one: `new Promise((resolve, reject) => { ... })`. The function you pass (the executor) runs immediately and synchronously.',
      '  Call `resolve(value)` to fulfil it, or `reject(error)` to reject it. Only the first call counts.',
      '  If the executor throws, the promise is rejected with that error.',
      'Chaining: every `.then` returns a NEW promise.',
      '  If your callback returns a value, the new promise fulfils with that value.',
      '  If it returns a promise, the chain waits for it (this is called "flattening" or "adoption").',
      '  If it throws, the new promise rejects, and the error skips forward to the next `.catch`.',
      'Callbacks registered with `.then` always run asynchronously as microtasks, even if the promise is already settled.',
      'A rejected promise with no handler triggers an "unhandled rejection". In Node 15+ this crashes the process by default.',
      'Helpers: `Promise.resolve(v)` and `Promise.reject(err)` create already-settled promises; `Promise.withResolvers()` (Node 22+) returns `{ promise, resolve, reject }`.',
      '# Example walkthrough',
      '`wait(100, "data")` returns a pending promise that resolves after 100 ms using `setTimeout`.',
      'The first `.then` receives `"data"` and returns `"data!"`; the second `.then` receives that and prints `"got data!"`.',
      '`failing()` rejects; the next `.then` is skipped and `.catch` prints `"caught: boom"`.',
      '`.finally` prints `"cleanup"` in both cases.',
      'The executor log "executor runs now" prints immediately, before any `.then` output, showing the executor is synchronous.',
      '# Why it matters / when to use',
      'Nearly every modern Node API returns promises: `fs/promises`, database drivers (`pg`, Prisma, Mongoose), `fetch`.',
      '`async`/`await` is built on promises, so understanding them is required to use `await` correctly.',
      'Promise combinators (`Promise.all`, etc) let you run work in parallel.',
      'Wrapping old callback APIs: `util.promisify(fn)` or `new Promise` around them.',
      '# Common mistakes',
      'Forgetting to `return` inside `.then`, so the next step gets `undefined` and does not wait. Fix: always return the inner promise or value.',
      'Nesting `.then` inside `.then` (promise hell). Fix: return the promise and chain flatly, or use `async`/`await`.',
      'No `.catch` at the end, causing unhandled rejections that crash Node. Fix: always handle errors.',
      'Wrapping something that already returns a promise in `new Promise` (the "explicit construction anti-pattern"). Fix: just return the existing promise.',
      '# Say this in the interview',
      '"A Promise is an object representing the eventual result of an async operation. It starts pending and settles exactly once, either fulfilled with a value or rejected with an error. You attach handlers with `then`, `catch` and `finally`; each `then` returns a new promise, which allows flat chaining, and errors propagate down the chain to the nearest `catch`. Handlers always run asynchronously as microtasks."',
      'Follow-up: Is the executor function synchronous?',
      '  Yes, it runs immediately when the promise is created; only the handlers run later.',
      'Follow-up: What happens to an unhandled rejection in Node?',
      '  Since Node 15 the process crashes by default, so always attach a `.catch` or use try/catch with `await`.',
    ],
    code: `function wait(ms, value) {
  return new Promise((resolve) => {
    console.log("executor runs now");        // synchronous!
    setTimeout(() => resolve(value), ms);
  });
}

wait(100, "data")
  .then((v) => v + "!")                      // returns a value -> next then
  .then((v) => console.log("got " + v))      // → "got data!"
  .finally(() => console.log("cleanup"));    // → "cleanup"

function failing() {
  return Promise.reject(new Error("boom"));
}

failing()
  .then(() => console.log("never runs"))     // skipped
  .catch((err) => console.log("caught: " + err.message)) // → "caught: boom"
  .finally(() => console.log("cleanup"));    // → "cleanup"

// Promisify an old callback API
const { promisify } = require("node:util");
const sleep = promisify(setTimeout);
sleep(50).then(() => console.log("slept"));  // → "slept"
// Printed order: "executor runs now", "caught: boom", "cleanup", "slept", "got data!", "cleanup"`,
  },
  {
    id: 'async-await',
    group: 'Async & Event Loop',
    stars: 5,
    difficulty: 'Medium',
    q: 'How does `async`/`await` work?',
    a: [
      '# ELI5',
      'Imagine reading a recipe that says "put the cake in the oven and wait 30 minutes". Instead of staring at the oven, you put a bookmark on that step and go help someone else.',
      'When the oven beeps, you come back to your bookmark and continue the recipe from exactly where you left off.',
      'Mapping back: `await` puts a bookmark in the function, lets the thread do other work, and resumes the function when the promise settles. `async` marks a function that can use bookmarks.',
      '# What it is',
      '`async`/`await` is syntax (ES2017) that lets you write promise-based code that reads like normal top-to-bottom code.',
      '`async function` (or `async () => {}`):',
      '  Always returns a promise.',
      '  A `return value` fulfils that promise with the value.',
      '  A `throw` inside it rejects that promise.',
      '`await expression`:',
      '  Pauses the async function until the promise settles, then gives you the fulfilled value.',
      '  If the promise rejects, `await` throws the error at that line, so you can use normal `try/catch`.',
      '  Awaiting a non-promise value wraps it in a resolved promise, but still pauses until the next microtask.',
      '`await` only pauses the current async function, not the whole program. The thread keeps running other code.',
      'Top-level `await` is allowed in ES modules (Node `.mjs` files or `"type": "module"`), not in CommonJS.',
      '# How it works',
      'Under the hood an async function is like a generator driven by promises:',
      '  The function runs synchronously until the first `await`.',
      '  At `await`, it saves its local variables and position, subscribes to the promise, and returns control to the caller (which receives a pending promise).',
      '  When the promise settles, the continuation (the rest of the function) is queued as a microtask.',
      '  The event loop runs that microtask, and the function resumes with the value (or the thrown error).',
      'Because each `await` waits for the previous one, two independent `await`s in a row run one after another (sequentially). To run them at the same time, start both promises first and then `await Promise.all([...])`.',
      '# Example walkthrough',
      '`getUser(1)` and `getOrders(1)` are fake async functions that resolve after a short delay.',
      'In `loadDashboard`, "start" prints, then `await getUser(1)` pauses the function; "after call" from the caller prints next because the caller is not blocked.',
      'When the user resolves, the function resumes, then awaits orders, then returns an object; the caller\'s `.then` prints `{ user: "user1", orders: 2 }`.',
      '`loadBroken` awaits a rejecting promise; the `try/catch` around the `await` catches it and prints `"handled: not found"`.',
      '`loadFast` starts both requests before awaiting, so the total time is about one delay, not two.',
      '# Why it matters / when to use',
      'It is the standard way to write Node backend code: route handlers, DB queries, calls to other services.',
      'Errors from async code can be handled with ordinary `try/catch/finally` (for example releasing a DB connection in `finally`).',
      'Much easier to read and debug than long `.then` chains, with better stack traces.',
      '# Common mistakes',
      'Forgetting `await`, so you get a pending promise instead of the data (and errors become unhandled rejections). Fix: always await or return the promise.',
      'Awaiting in a loop when calls are independent, making it slow. Fix: `await Promise.all(items.map(fn))`.',
      'Using `await` inside `forEach`, which does not wait. Fix: use `for...of` (sequential) or `Promise.all` with `map` (parallel).',
      'Thinking `await` blocks the whole server. It only pauses that one function.',
      '# Say this in the interview',
      '"`async` makes a function always return a promise, and `await` pauses that function until a promise settles, giving back its value or throwing its error so I can use try/catch. Under the hood the rest of the function is scheduled as a microtask when the promise settles, so the thread is never blocked. I take care to run independent awaits in parallel with `Promise.all`, and never use `await` inside `forEach`."',
      'Follow-up: What does an async function return if you `return 5`?',
      '  A promise that fulfils with 5.',
      'Follow-up: Why does `await` in `forEach` not work?',
      '  `forEach` ignores the promises returned by its callback, so it does not wait for them.',
    ],
    code: `const delay = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
const getUser = async (id) => delay(100, "user" + id);
const getOrders = async (id) => delay(100, ["o1", "o2"]);

async function loadDashboard(id) {
  console.log("start");
  const user = await getUser(id);       // pauses THIS function only
  const orders = await getOrders(id);   // waits for user first (sequential)
  return { user, orders: orders.length };
}
loadDashboard(1).then((r) => console.log(r)); // → { user: "user1", orders: 2 }
console.log("after call");             // prints right after "start"

async function loadBroken() {
  try {
    await Promise.reject(new Error("not found"));
  } catch (err) {
    console.log("handled: " + err.message); // → "handled: not found"
  }
}
loadBroken();

async function loadFast(id) {
  const t = Date.now();
  const [user, orders] = await Promise.all([getUser(id), getOrders(id)]); // parallel
  console.log(user, orders.length, "in ~" + (Date.now() - t) + "ms"); // → user1 2 in ~100ms
}
loadFast(1);`,
  },
  {
    id: 'promise-combinators',
    group: 'Async & Event Loop',
    stars: 4,
    difficulty: 'Medium',
    q: 'Difference between `Promise.all`, `allSettled`, `race` and `any`?',
    a: [
      '# ELI5',
      'Imagine sending four friends to buy party supplies.',
      '`all`: "Come back when everyone succeeds. If even one fails, the party is off immediately."',
      '`allSettled`: "Everyone come back and report, whether you found the item or not."',
      '`race`: "I only care about whoever comes back first, with good or bad news."',
      '`any`: "I only need one person to succeed. Only if all of them fail is it a problem."',
      'Mapping back: these four static methods take many promises and combine them into one promise with different success/failure rules.',
      '# What it is',
      'Promise combinators take an iterable (usually an array) of promises and return a single new promise.',
      'Comparison, row by row:',
      '  `Promise.all`: fulfils with an array of all values (in input order) when ALL fulfil; rejects as soon as ANY rejects (fail-fast), with that first error.',
      '  `Promise.allSettled`: always fulfils, once all have settled, with an array of `{ status: "fulfilled", value }` or `{ status: "rejected", reason }` objects. Never rejects.',
      '  `Promise.race`: settles the same way as the FIRST promise to settle, whether it fulfils or rejects.',
      '  `Promise.any`: fulfils with the FIRST fulfilled value; rejects only if ALL reject, with an `AggregateError` whose `errors` array lists every reason.',
      'Empty input: `all([])` and `allSettled([])` fulfil with `[]`; `any([])` rejects with `AggregateError`; `race([])` stays pending forever.',
      'Non-promise values in the array are treated as already-fulfilled promises.',
      '# How it works',
      'All four start listening to every input promise at once; they do not start the work themselves (the work started when each promise was created).',
      'They attach `.then` handlers to each input and keep track of results:',
      '  `all` stores each value at its index and counts completions; it resolves when the count reaches the total, or rejects on the first error.',
      '  `allSettled` records each outcome object and resolves when all are recorded.',
      '  `race` resolves or rejects with whichever handler fires first.',
      '  `any` resolves on the first success and collects errors; it rejects only when every input has failed.',
      'Important: "fail-fast" does not cancel the other operations. They keep running; their results are just ignored. To actually cancel, use an `AbortController`.',
      '# Example walkthrough',
      '`ok(100, "A")` and `ok(50, "B")` fulfil after delays, `fail(30, "X")` rejects after 30 ms.',
      '`Promise.all([A, B])` prints `["A", "B"]`: input order is kept even though B finished first.',
      '`Promise.all([A, X])` rejects after 30 ms with `"X"`, not waiting for A.',
      '`allSettled([A, X])` prints both outcome objects.',
      '`race([A, X])` rejects with `"X"` because X settles first (30 ms beats 100 ms).',
      '`any([A, X])` ignores X\'s failure and prints `"A"`.',
      '`any([X, X2])` prints `"AggregateError"` and the 2 collected errors.',
      '# Why it matters / when to use',
      '`all`: loading several things a request needs at once, such as user, permissions and settings, where any failure should fail the request.',
      '`allSettled`: batch jobs like sending 100 notification emails, where you want a report of which succeeded and which failed.',
      '`race`: adding a timeout, like `race([fetchData(), timeout(2000)])`. (Modern code often uses `AbortSignal.timeout(ms)` instead.)',
      '`any`: querying several redundant mirrors or replicas and using the first one that answers successfully.',
      '# Common mistakes',
      'Using `all` when partial failure is acceptable, so one failed item kills the whole batch. Fix: `allSettled`.',
      'Assuming `race`/`all` cancels the losers. Fix: pass an `AbortSignal` to each operation and abort it.',
      'Mixing up `race` and `any`: `race` returns the first to settle even if it is a failure; `any` waits for the first success.',
      'Running thousands of promises with `all` at once, overwhelming a DB or API. Fix: limit concurrency (for example with `p-limit`) or batch.',
      '# Say this in the interview',
      '"All four take an array of promises and return one promise. `all` fulfils with every value in order but rejects on the first failure. `allSettled` waits for everything and reports each result, never rejecting. `race` settles with whichever promise settles first, success or failure, and `any` fulfils with the first success and only rejects with an AggregateError if all fail. None of them cancel the other operations."',
      'Follow-up: How would you add a timeout to a request?',
      '  `Promise.race([request, timeoutPromise])`, or better, pass `AbortSignal.timeout(ms)` to `fetch` so the request is actually cancelled.',
      'Follow-up: Does `Promise.all` keep order?',
      '  Yes, results are in input order, regardless of completion order.',
    ],
    code: `const ok = (ms, v) => new Promise((res) => setTimeout(() => res(v), ms));
const fail = (ms, why) => new Promise((_, rej) => setTimeout(() => rej(new Error(why)), ms));

async function demo() {
  console.log(await Promise.all([ok(100, "A"), ok(50, "B")])); // → [ "A", "B" ]

  try { await Promise.all([ok(100, "A"), fail(30, "X")]); }
  catch (e) { console.log("all rejected:", e.message); }       // → all rejected: X

  const settled = await Promise.allSettled([ok(100, "A"), fail(30, "X")]);
  console.log(settled.map((r) => r.status));                   // → [ "fulfilled", "rejected" ]

  try { await Promise.race([ok(100, "A"), fail(30, "X")]); }
  catch (e) { console.log("race rejected:", e.message); }      // → race rejected: X

  console.log(await Promise.any([ok(100, "A"), fail(30, "X")])); // → "A"

  try { await Promise.any([fail(10, "X"), fail(20, "Y")]); }
  catch (e) { console.log(e.name, e.errors.length); }          // → AggregateError 2
}
demo();`,
  },
  {
    id: 'promise-all-polyfill',
    group: 'Async & Event Loop',
    stars: 4,
    difficulty: 'Hard',
    q: 'Implement `Promise.all`.',
    a: [
      '# ELI5',
      'A teacher hands out a worksheet to every student and needs all of them back, in seat order, before grading.',
      'She writes each returned sheet into the slot for that seat number, and counts how many she has. When the count equals the class size, she is done.',
      'If any student says "I lost mine", she stops waiting and reports the problem immediately.',
      'Mapping back: the polyfill stores each result at its index, counts completions, resolves when all are done, and rejects on the first error.',
      '# What it is',
      'The task is to write a function `promiseAll(iterable)` that behaves like the built-in `Promise.all`.',
      'Requirements a strong answer covers:',
      '  Return a new promise.',
      '  Results must be in the same order as the input, not the order they finish.',
      '  Resolve only when every input has fulfilled.',
      '  Reject immediately with the first rejection reason (fail-fast).',
      '  Accept plain values too (treat them as already-resolved), by wrapping each item with `Promise.resolve(item)`.',
      '  Empty input resolves immediately with `[]`.',
      '  Accept any iterable (arrays, sets, generators), not only arrays.',
      'A polyfill is your own implementation of a built-in feature; here it is mainly an interview exercise.',
      '# How it works',
      'Create `return new Promise((resolve, reject) => { ... })`.',
      'Convert the input to an array with `Array.from(iterable)` so you know the total count.',
      'If the count is 0, `resolve([])` and stop.',
      'Create a `results` array and a `completed` counter.',
      'For each item at index `i`:',
      '  `Promise.resolve(item).then(value => { results[i] = value; completed++; if (completed === total) resolve(results); }, reject)`.',
      '  Use the index `i` (not `results.push`) so the order matches the input.',
      'Calling `reject` more than once is harmless: a promise can only settle once, so later rejections and resolutions are ignored.',
      'Why a counter and not `results.length`? Assigning `results[2]` first makes `length` 3 even though only one result has arrived.',
      '# Example walkthrough',
      'Inputs are a 300 ms promise, a plain value `2`, and a 100 ms promise.',
      'The plain `2` is wrapped and settles almost immediately, stored at index 1.',
      'The 100 ms one stores `"fast"` at index 2; the 300 ms one stores `"slow"` at index 0.',
      'When `completed` reaches 3, it resolves with `["slow", 2, "fast"]`: input order, not finish order.',
      'With a rejecting promise in the list, the result rejects with `"boom"` immediately.',
      '`promiseAll([])` resolves with `[]`.',
      '# Why it matters / when to use',
      'A classic interview question that tests promises, closures over loop indexes, and edge-case thinking.',
      'The same pattern (index results, count completions) is used for writing a concurrency-limited version, such as "run 100 tasks, max 5 at a time".',
      'In real code always use the native `Promise.all`.',
      '# Common mistakes',
      'Using `results.push(value)`, which stores results in finish order. Fix: `results[i] = value`.',
      'Checking `results.length === total` instead of a counter. Fix: keep a separate `completed` count.',
      'Forgetting the empty-array case, which would leave the promise pending forever. Fix: resolve `[]` right away.',
      'Calling `.then` directly on items, which crashes on plain values. Fix: wrap with `Promise.resolve(item)`.',
      'Using `var i` in the loop with callbacks. Fix: use `let` or `forEach` so each callback has its own index.',
      '# Say this in the interview',
      '"I return a new promise, convert the input to an array and resolve immediately with an empty array if it is empty. Then for each item I wrap it with `Promise.resolve`, and on success store the value at its original index and increment a counter; when the counter equals the length I resolve with the results array. Any rejection calls the outer reject straight away, which gives fail-fast behaviour, and later calls are ignored because a promise only settles once."',
      'Follow-up: How would you implement `allSettled`?',
      '  Same structure, but both success and failure store an outcome object and increment the counter; it never rejects.',
      'Follow-up: How would you limit concurrency?',
      '  Keep a pool of N workers that each pull the next index from a shared counter until all items are processed.',
    ],
    code: `function promiseAll(iterable) {
  return new Promise((resolve, reject) => {
    const items = Array.from(iterable);
    const results = new Array(items.length);
    let completed = 0;

    if (items.length === 0) return resolve([]);   // edge case: empty input

    items.forEach((item, i) => {
      Promise.resolve(item)                       // also handles plain values
        .then((value) => {
          results[i] = value;                     // keep INPUT order
          completed++;
          if (completed === items.length) resolve(results);
        }, reject);                               // fail fast on first error
    });
  });
}

const later = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));

promiseAll([later(300, "slow"), 2, later(100, "fast")])
  .then((r) => console.log(r));                   // → [ "slow", 2, "fast" ]

promiseAll([later(50, "a"), Promise.reject(new Error("boom"))])
  .catch((e) => console.log(e.message));          // → "boom"

promiseAll([]).then((r) => console.log(r));       // → []`,
  },
  {
    id: 'async-error-handling',
    group: 'Async & Event Loop',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do you handle errors in async code?',
    a: [
      '# ELI5',
      'Imagine mailing a letter and walking away. If the letter gets lost, nobody can shout at you right then because you are already gone.',
      'So you leave a return address (a handler) on the envelope, saying "if anything goes wrong, send the problem here".',
      'Mapping back: async errors happen later, after your code has moved on, so you must attach a handler (`.catch` or `try/catch` around `await`) that will receive them.',
      '# What it is',
      'An error in async code shows up as a rejected promise rather than an immediate exception.',
      'Main tools:',
      '  `try/catch/finally` around `await` inside an `async` function: the rejection is thrown at the `await` line.',
      '  `.catch(handler)` on a promise chain.',
      '  `Promise.allSettled` when you want to handle each failure separately instead of failing everything.',
      '  Error-first callbacks for old callback APIs: `fs.readFile(path, (err, data) => {...})`, where you must check `err` first.',
      '  `EventEmitter` objects (streams, sockets) emit an `"error"` event; if no listener exists, Node throws and can crash the process.',
      'Process-level safety nets in Node:',
      '  `process.on("unhandledRejection", ...)`: a promise rejected with no handler. Since Node 15, this crashes the process by default.',
      '  `process.on("uncaughtException", ...)`: a thrown error nothing caught. Log it, then exit; the app may be in a broken state.',
      'Error cause: `new Error("Failed to load user", { cause: err })` wraps a low-level error with context while keeping the original.',
      '# How it works',
      'A `try/catch` only catches errors thrown while it is on the call stack. A callback that runs later (in `setTimeout` or an old callback API) is outside that `try`.',
      'With `await`:',
      '  If the awaited promise rejects, the engine resumes the function by throwing the rejection reason at that line.',
      '  So the surrounding `try/catch` catches it, as if it were synchronous code.',
      '  `finally` runs either way, which is ideal for cleanup like releasing a DB connection.',
      'With `.then` chains, a rejection skips every `.then` until it reaches a `.catch` (or a `.then` with a second argument).',
      'In Express 4, a rejected promise inside an async route handler is NOT passed to the error middleware automatically; you must `catch` and call `next(err)`. Express 5 forwards rejected promises from handlers to `next` automatically.',
      '# Example walkthrough',
      '`getUser(0)` rejects; `loadUser` catches it at the `await`, wraps it with `cause`, and rethrows; the caller\'s `.catch` prints `"Failed to load user 0"` and the cause `"Invalid id"`.',
      '`finally` prints `"release connection"` both on success and failure.',
      'The `badTry` example shows that `try/catch` does not catch an error thrown inside a `setTimeout` callback, because the callback runs later; so it is shown as a comment rather than run.',
      '`asyncHandler(fn)` wraps an Express route so any rejection is passed to `next`, reaching the error middleware.',
      'The `unhandledRejection` listener logs any rejection that nobody handled.',
      '# Why it matters / when to use',
      'Unhandled rejections crash Node servers in production; every async path needs a handler.',
      'Consistent error responses: centralised Express error middleware turns errors into proper HTTP statuses (400, 404, 500) with a safe message.',
      'Cleanup: `finally` prevents leaked database connections, file handles and locks.',
      '# Common mistakes',
      'Forgetting `await` inside `try`, e.g. `try { return fetchData(); }` in an async function, so the rejection escapes the `catch`. Fix: `return await fetchData();` inside try blocks.',
      'Swallowing errors with an empty `catch {}`. Fix: at least log them, and rethrow if you cannot handle them.',
      'Throwing strings instead of `Error` objects, losing the stack trace. Fix: `throw new Error("message")`.',
      'Keeping the server running after `uncaughtException`. Fix: log, then exit and let the process manager (PM2, Kubernetes) restart it.',
      '# Say this in the interview',
      '"Async errors arrive as rejected promises, so I handle them with try/catch around await, or `.catch` on promise chains, and use finally for cleanup. In Express 4 I wrap async handlers so rejections reach the error middleware via `next`, which Express 5 does automatically. I wrap errors with `cause` for context, never swallow them silently, and add `unhandledRejection` and `uncaughtException` handlers as a last line of defence that logs and exits."',
      'Follow-up: Why `return await` inside a try block?',
      '  Without `await`, the function returns the promise before it rejects, so the local `catch` never sees the error.',
      'Follow-up: Can try/catch catch an error inside a `setTimeout` callback?',
      '  No, the callback runs later on a fresh call stack; handle the error inside the callback.',
    ],
    code: `const getUser = async (id) => {
  if (id <= 0) throw new Error("Invalid id");   // becomes a rejection
  return { id, name: "Ann" };
};

async function loadUser(id) {
  try {
    return await getUser(id);                   // "return await" so catch works
  } catch (err) {
    throw new Error("Failed to load user " + id, { cause: err });
  } finally {
    console.log("release connection");          // runs on success AND failure
  }
}

loadUser(1).then((u) => console.log(u.name));   // → "release connection", "Ann"
loadUser(0).catch((e) => console.log(e.message, "|", e.cause.message));
// → "release connection", "Failed to load user 0 | Invalid id"

// try/catch cannot catch errors thrown later in a callback:
// try { setTimeout(() => { throw new Error("x"); }, 0); } catch {} // not caught!

// Express 4 helper: forward async errors to error middleware
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);  // last line of defence
});`,
  },
];

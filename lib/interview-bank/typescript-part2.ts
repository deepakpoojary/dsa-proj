import type { BankQuestion } from './types';

// TypeScript interview bank, questions 51-100, written as beginner-friendly
// revision notes (ELI5 -> definition -> mechanics -> walkthrough -> usage ->
// mistakes -> interview script).
export const TYPESCRIPT_2: BankQuestion[] = [
  {
    id: 'awaited-type',
    group: 'Utility Types',
    stars: 3,
    difficulty: 'Medium',
    q: 'What does `Awaited<T>` do?',
    a: [
      "# ELI5",
      "Imagine a gift box that contains another gift box, which contains another box, and finally a toy.",
      "Awaited is like a helper who keeps opening boxes until they reach the toy, then tells you what the toy is.",
      "If you hand the helper a toy with no box at all, they just tell you it is a toy.",
      "In code, the boxes are Promises and the toy is the final value you get after `await`.",
      "# What it is",
      "`Awaited<T>` is a built-in utility type (a ready-made type helper shipped with TypeScript since 4.5).",
      "It answers: if I `await` a value of type `T`, what type do I get back?",
      "A Promise is an object that represents a value that will arrive later; `Promise<string>` will eventually give you a `string`.",
      "`Awaited<Promise<string>>` is `string`, and `Awaited<Promise<Promise<number>>>` is `number`, because it unwraps recursively (again and again until no Promise is left).",
      "`Awaited<boolean>` is just `boolean`, since awaiting a non-Promise value returns the value itself.",
      "It also handles thenables — any object with a `then(onFulfilled)` method — because `await` treats those like Promises.",
      "# How it works",
      "TypeScript checks the type `T` you pass in:",
      "  If `T` is `null` or `undefined`, it returns it unchanged.",
      "  If `T` is an object with a `then` method, it uses `infer` to grab the type of the value passed to that callback.",
      "  It then calls `Awaited` again on that inner type, so nested Promises are flattened.",
      "  If `T` has no `then` method, it returns `T` as the final answer.",
      "This is all compile-time only; nothing is added to your JavaScript output.",
      "# Example walkthrough",
      "`fetchUser` is an `async` function, so its return type is `Promise<{ id: number; name: string }>`.",
      "`ReturnType<typeof fetchUser>` gives that Promise type; wrapping it in `Awaited` gives the plain user object type.",
      "`Deep` shows that two layers of Promise collapse to `number`.",
      "In `main`, `Promise.all` is typed with `Awaited` internally, so `[user, count]` are already unwrapped values.",
      "# Why it matters / when to use",
      "Typing the result of an async function without exporting a separate interface: `Awaited<ReturnType<typeof getOrders>>`.",
      "Writing generic helpers like a retry or cache wrapper that must return whatever the wrapped async function resolves to.",
      "Libraries like Prisma or tRPC infer result types this way, so you rarely duplicate types by hand.",
      "# Common mistakes",
      "Using `ReturnType` alone on an async function and getting `Promise<User>` instead of `User`; fix by wrapping in `Awaited`.",
      "Writing your own `T extends Promise<infer U> ? U : T` which only unwraps one level; `Awaited` handles deep nesting and thenables.",
      "Expecting `Awaited` to do anything at runtime — it is a type, so you still need to actually `await` the value.",
      "# Say this in the interview",
      "`Awaited<T>` is a built-in utility type that models what the `await` keyword does at the type level. It recursively unwraps Promises and thenables, so `Awaited<Promise<Promise<string>>>` is `string`, and non-Promise types pass through unchanged. I mostly use it as `Awaited<ReturnType<typeof fn>>` to get the resolved type of an async function.",
      "Follow-up: how is it implemented?",
      "  A recursive conditional type that uses `infer` on the argument of the `then` callback, and calls itself on the result.",
      "Follow-up: where does TypeScript use it itself?",
      "  The type definitions of `Promise.all`, `Promise.race` and async function returns use `Awaited` so results are correctly flattened.",
    ],
    code: `async function fetchUser() {
  return { id: 1, name: "Ana" };
}

// ReturnType gives the Promise; Awaited unwraps it
type UserPromise = ReturnType<typeof fetchUser>; // Promise<{ id: number; name: string }>
type User = Awaited<UserPromise>;                // { id: number; name: string }

type Deep = Awaited<Promise<Promise<number>>>;   // number (recursive)
type Plain = Awaited<boolean>;                   // boolean (no Promise to unwrap)

async function main() {
  // Promise.all is typed using Awaited, so these are plain values
  const [user, count] = await Promise.all([fetchUser(), Promise.resolve(42)]);
  const u: User = user;
  console.log(u.name, count); // → Ana 42
}

main();`,
  },
  {
    id: 'deep-partial-readonly',
    group: 'Utility Types',
    stars: 3,
    difficulty: 'Hard',
    q: 'How would you write a `DeepPartial` or `DeepReadonly` type?',
    a: [
      "# ELI5",
      "Think of a set of Russian nesting dolls: a big doll with smaller dolls inside.",
      "The normal `Partial` only puts a sticker saying optional on the biggest doll; the dolls inside are untouched.",
      "A Deep version opens every doll and puts the sticker on each one, all the way down.",
      "In code, the dolls are nested objects, and the sticker is `?` (optional) or `readonly`.",
      "# What it is",
      "`Partial<T>` makes every top-level property of `T` optional, and `Readonly<T>` makes every top-level property read-only.",
      "They are shallow — only the first level changes; nested objects keep their original rules.",
      "`DeepPartial<T>` and `DeepReadonly<T>` are custom recursive types (types that refer to themselves) that apply the change at every nesting level.",
      "They are not built into TypeScript; you write them yourself or use a library such as `type-fest`.",
      "# How it works",
      "Start with a mapped type — a type that loops over every key of `T`, written `{ [K in keyof T]: ... }`.",
      "For each property, look at its value type `T[K]`:",
      "  If it is a function, leave it alone (you do not want to recurse into functions).",
      "  If it is an array, apply the deep type to the element type and keep it an array.",
      "  If it is an object, call the deep type again on it (this is the recursion).",
      "  Otherwise it is a primitive like `string` or `number`, so return it as-is.",
      "Add the modifier: `?` for DeepPartial, `readonly` for DeepReadonly.",
      "The recursion stops naturally when it reaches primitives.",
      "# Example walkthrough",
      "`Config` has a nested `db` object with an inner `pool` object.",
      "`DeepPartial<Config>` lets `patch` contain only `db.pool.max`, skipping every other field — plain `Partial` would demand the whole `db` object.",
      "`merge` is a tiny runtime helper that combines defaults with the patch; types only check, they do not merge.",
      "`DeepReadonly<Config>` makes `frozen.db.pool.max = 5` a compile error even though it is three levels deep.",
      "# Why it matters / when to use",
      "Config overrides and test fixtures: pass only the fields you want to change.",
      "PATCH endpoints where clients send any subset of a nested resource.",
      "Immutable state (Redux-style stores) where nothing at any level should be mutated.",
      "# Common mistakes",
      "Forgetting the function check, which turns methods into weird mapped objects; add `T[K] extends Function ? T[K] : ...`.",
      "Thinking `DeepReadonly` freezes the object at runtime; it only blocks writes at compile time — use `Object.freeze` recursively for runtime safety.",
      "Very deep or circular types can hit the compiler recursion limit (error 2589); keep inputs reasonable.",
      "# Say this in the interview",
      "Built-in `Partial` and `Readonly` are shallow, so I write a recursive mapped type: for each key, if the value is an object I call the type on it again, otherwise I keep the value, and I add the `?` or `readonly` modifier. I special-case functions and arrays so methods are not mangled. It is compile-time only, so for real immutability I also freeze at runtime.",
      "Follow-up: how do you handle arrays?",
      "  Check `T[K] extends (infer U)[]` and return `DeepPartial<U>[]` (or `ReadonlyArray<DeepReadonly<U>>`).",
      "Follow-up: is there a library version?",
      "  Yes, `type-fest` ships `PartialDeep` and `ReadonlyDeep`.",
    ],
    code: `type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends (...args: any[]) => any
    ? T[K]                                  // keep functions as they are
    : T[K] extends object
      ? DeepPartial<T[K]>                   // recurse into nested objects
      : T[K];                               // primitives stay
};

type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

interface Config {
  port: number;
  db: { host: string; pool: { min: number; max: number } };
}

const defaults: Config = { port: 3000, db: { host: "localhost", pool: { min: 1, max: 10 } } };

// Only the field we want to override — allowed by DeepPartial
const patch: DeepPartial<Config> = { db: { pool: { max: 20 } } };

const merged: Config = {
  ...defaults,
  db: { ...defaults.db, pool: { ...defaults.db.pool, ...patch.db?.pool } },
};
console.log(merged.db.pool); // → { min: 1, max: 20 }

const frozen: DeepReadonly<Config> = merged;
// frozen.db.pool.max = 5;   // ✗ Error: Cannot assign to 'max' because it is a read-only property`,
  },
  {
    id: 'instancetype-constructorparameters',
    group: 'Utility Types',
    stars: 2,
    difficulty: 'Medium',
    q: 'What are `InstanceType` and `ConstructorParameters`?',
    a: [
      "# ELI5",
      "Think of a cookie cutter (the class) and the cookies it makes (the instances).",
      "`InstanceType` looks at a cookie cutter and tells you what shape of cookie it produces.",
      "`ConstructorParameters` tells you what ingredients you must hand over to make a cookie.",
      "In code, the cutter is a class (its constructor), the cookie is the object made with `new`, and the ingredients are the constructor arguments.",
      "# What it is",
      "A constructor is the special function that runs when you write `new SomeClass(...)`.",
      "In TypeScript, the name `SomeClass` used as a type means the instance (the object), while `typeof SomeClass` means the class itself (the constructor function).",
      "`InstanceType<C>` takes a constructor type and gives back the type of object that `new C()` creates.",
      "`ConstructorParameters<C>` takes a constructor type and gives back its argument types as a tuple (a fixed-length array type like `[string, number]`).",
      "They are the class equivalents of `ReturnType` and `Parameters` for normal functions.",
      "# How it works",
      "Both are conditional types using `infer`:",
      "  `InstanceType<T>` checks `T extends abstract new (...args: any) => infer R` and returns `R`.",
      "  `ConstructorParameters<T>` checks `T extends abstract new (...args: infer P) => any` and returns `P`.",
      "The `new (...) => ...` syntax is a construct signature — it describes something callable with `new`.",
      "You must pass `typeof MyClass`, not `MyClass`, because the utility needs the constructor type.",
      "# Example walkthrough",
      "`Logger` has a constructor taking a `name` and an optional `level`.",
      "`ConstructorParameters<typeof Logger>` becomes `[name: string, level?: \"info\" | \"debug\"]`.",
      "`create` is a generic factory: it accepts any class `C` plus the right arguments and returns `InstanceType<C>`.",
      "Calling `create(Logger, \"api\")` is type-checked and returns a `Logger`, so `log.log(\"hi\")` prints `[api:info] hi`.",
      "# Why it matters / when to use",
      "Dependency-injection containers and factories that build classes generically.",
      "Typing registries such as `Record<string, new () => Plugin>` and getting instance types out.",
      "Working with third-party classes whose instance type is not exported separately.",
      "# Common mistakes",
      "Writing `InstanceType<Logger>` — this errors because `Logger` as a type is already the instance; use `typeof Logger`.",
      "Forgetting `abstract` in your own constraints, which prevents passing abstract classes; use `abstract new (...args: any) => any`.",
      "# Say this in the interview",
      "`InstanceType` and `ConstructorParameters` are the class versions of `ReturnType` and `Parameters`. Given `typeof SomeClass`, the first returns the type of the object `new` creates and the second returns the constructor argument tuple. I use them in generic factories and DI containers so I can build any class while keeping full type safety.",
      "Follow-up: why `typeof`?",
      "  Because the class name in type position already means the instance type; `typeof` gives the constructor type.",
    ],
    code: `class Logger {
  constructor(public name: string, public level: "info" | "debug" = "info") {}
  log(msg: string) {
    console.log(\`[\${this.name}:\${this.level}] \${msg}\`);
  }
}

type LoggerArgs = ConstructorParameters<typeof Logger>; // [name: string, level?: "info" | "debug"]
type LoggerObj = InstanceType<typeof Logger>;           // Logger

// Generic factory: works for ANY class and checks its arguments
function create<C extends new (...args: any[]) => any>(
  Ctor: C,
  ...args: ConstructorParameters<C>
): InstanceType<C> {
  return new Ctor(...args);
}

const log: LoggerObj = create(Logger, "api");
log.log("hi");                 // → [api:info] hi
// create(Logger, 123);        // ✗ Error: number is not assignable to string
const args: LoggerArgs = ["db", "debug"];
create(Logger, ...args).log("ready"); // → [db:debug] ready`,
  },
  {
    id: 'readonly-vs-object-freeze',
    group: 'Utility Types',
    stars: 2,
    difficulty: 'Easy',
    q: 'What is the difference between `Readonly<T>` and `Object.freeze`?',
    a: [
      "# ELI5",
      "`Readonly` is like a sign on a cake saying Do not touch — it warns people, but the cake is not protected.",
      "`Object.freeze` is like putting the cake inside a locked glass case — nobody can change it, sign or no sign.",
      "The sign is checked before the party (compile time); the glass case works during the party (run time).",
      "In code: `Readonly<T>` is a TypeScript type check; `Object.freeze` is a real JavaScript function that locks the object.",
      "# What it is",
      "Compile time means when TypeScript checks your code; run time means when Node or the browser actually executes the JavaScript.",
      "`Readonly<T>`: a utility type that marks every property `readonly`, so TypeScript reports an error if you assign to it.",
      "`Object.freeze(obj)`: a JavaScript built-in that makes an object immutable (unchangeable) at run time.",
      "Comparison, row by row:",
      "  When it acts: `Readonly` at compile time only; `freeze` at run time.",
      "  Output JS: `Readonly` disappears completely; `freeze` stays as a real function call.",
      "  Depth: both are shallow — nested objects are still changeable.",
      "  Failure: `Readonly` gives a red squiggle; `freeze` silently ignores writes, or throws a `TypeError` in strict mode (ES modules and classes are always strict).",
      "  Type: `Object.freeze(x)` returns `Readonly<typeof x>`, so you get both protections at once.",
      "# How it works",
      "With `Readonly`, the type checker sees the `readonly` modifier on each property and rejects any assignment expression.",
      "After compiling, all types are erased (removed), so the JavaScript has no trace of it — any untyped code can still mutate.",
      "With `Object.freeze`, the JS engine marks each property as non-writable and non-configurable and the object as non-extensible.",
      "Any later write is ignored or throws, regardless of who does it.",
      "# Example walkthrough",
      "`settings` is typed `Readonly<Settings>`; the commented assignment would not compile.",
      "But casting to `any` bypasses the check and the value really changes, printing `9000`.",
      "`locked` is frozen; the write via `any` throws `TypeError` because the file is a module (strict mode).",
      "`locked.db.host` still changes because freeze is shallow, printing `prod-db`.",
      "# Why it matters / when to use",
      "Use `Readonly` (or `readonly` props, `as const`) for intent and to prevent mistakes in your own typed code — free at run time.",
      "Use `Object.freeze` for shared config or constants exposed to code you do not control, where run-time guarantees matter.",
      "# Common mistakes",
      "Believing `Readonly` protects data from JavaScript callers or JSON libraries — it does not exist at run time.",
      "Assuming freeze is deep; write a recursive `deepFreeze` if you need nested protection.",
      "Freezing large objects in hot paths for no reason; it adds a small cost and makes later updates require copies.",
      "# Say this in the interview",
      "`Readonly<T>` is a compile-time-only type that makes TypeScript reject assignments, and it is erased from the output. `Object.freeze` is a runtime JavaScript call that actually prevents mutation, and TypeScript types its return value as `Readonly<T>`. Both are shallow, so for nested data you need a deep version of either.",
      "Follow-up: what does freeze do in non-strict code?",
      "  The write silently fails; in strict mode it throws a `TypeError`.",
    ],
    code: `interface Settings { port: number; db: { host: string } }

const settings: Readonly<Settings> = { port: 3000, db: { host: "local" } };
// settings.port = 9000;          // ✗ compile error: read-only property
(settings as any).port = 9000;     // compiles AND works at runtime
console.log(settings.port);        // → 9000 (Readonly is gone after compile)

const locked = Object.freeze({ port: 3000, db: { host: "local" } });
// type of locked: Readonly<{ port: number; db: { host: string } }>
try {
  (locked as any).port = 1;        // modules run in strict mode → throws
} catch (e) {
  console.log((e as Error).name);  // → TypeError
}

locked.db.host = "prod-db";        // allowed: freeze is shallow
console.log(locked.db.host);       // → prod-db

export {};`,
  },
  {
    id: 'string-manipulation-types',
    group: 'Utility Types',
    stars: 1,
    difficulty: 'Easy',
    q: 'What are the intrinsic string manipulation types?',
    a: [
      "# ELI5",
      "Imagine a label maker with four buttons: ALL CAPS, all small, Capital first letter, and small first letter.",
      "You type a word, press a button, and it prints the word in that style.",
      "TypeScript has the same four buttons, but they work on types, not on real strings.",
      "So the types themselves change shape, e.g. the type `\"click\"` becomes the type `\"Click\"`.",
      "# What it is",
      "A string literal type is a type that allows exactly one string, like `\"click\"` (not any string, only that one).",
      "Intrinsic types are built into the compiler itself rather than written in TypeScript code.",
      "The four intrinsic string types are:",
      "  `Uppercase<S>` — `\"hello\"` becomes `\"HELLO\"`.",
      "  `Lowercase<S>` — `\"HELLO\"` becomes `\"hello\"`.",
      "  `Capitalize<S>` — `\"hello\"` becomes `\"Hello\"`.",
      "  `Uncapitalize<S>` — `\"Hello\"` becomes `\"hello\"`.",
      "They are most powerful combined with template literal types (string types built with backtick syntax, for example a type meaning any string that starts with on).",
      "# How it works",
      "You pass a string literal type (or a union of them) as `S`.",
      "The compiler transforms each literal's characters at compile time.",
      "For a union, each member is transformed separately: `Uppercase<\"a\" | \"b\">` is `\"A\" | \"B\"`.",
      "If `S` is the wide type `string`, the result stays `string`-like because the exact text is unknown.",
      "Nothing is emitted to JavaScript; to change real strings you still call `.toUpperCase()` etc.",
      "# Example walkthrough",
      "`EventName` is the union `\"click\" | \"focus\"`.",
      "`Handlers` builds keys `onClick` and `onFocus` by combining a template literal with `Capitalize`.",
      "The `handlers` object must have exactly those two keys or compilation fails.",
      "The `capitalize` function shows the runtime counterpart, with a return type that matches the type-level result.",
      "# Why it matters / when to use",
      "Generating handler names like `onClick` from event names, or getter names like `getName` from field names.",
      "Typing environment variable names (`Uppercase<keyof Config>`) or HTTP method constants.",
      "# Common mistakes",
      "Expecting them to change runtime values; they only affect types.",
      "Using them on plain `string` and expecting precise results; they only help with literal types.",
      "# Say this in the interview",
      "TypeScript has four compiler-intrinsic types — `Uppercase`, `Lowercase`, `Capitalize` and `Uncapitalize` — that transform string literal types. They shine with template literal types and key remapping, for example turning `\"click\"` into an `onClick` key. They are type-only, so runtime strings need the normal string methods.",
    ],
    code: `type EventName = "click" | "focus";

type Loud = Uppercase<EventName>;        // "CLICK" | "FOCUS"
type Cap = Capitalize<EventName>;        // "Click" | "Focus"
type Un = Uncapitalize<"UserId">;        // "userId"

// Combine with a template literal type to build key names
type Handlers = { [E in EventName as \`on\${Capitalize<E>}\`]: () => void };
// → { onClick: () => void; onFocus: () => void }

const handlers: Handlers = {
  onClick: () => console.log("clicked"),
  onFocus: () => console.log("focused"),
};

// Runtime counterpart with a matching return type
function capitalize<S extends string>(s: S): Capitalize<S> {
  return (s.charAt(0).toUpperCase() + s.slice(1)) as Capitalize<S>;
}

const k = capitalize("click");           // type "Click"
console.log(k);                          // → Click
handlers.onClick();                      // → clicked`,
  },
  {
    id: 'conditional-types',
    group: 'Advanced Types',
    stars: 5,
    difficulty: 'Medium',
    q: 'What are conditional types?',
    a: [
      "# ELI5",
      "Think of a sorting machine at a post office: if a package is heavier than 5 kg it goes to the truck, otherwise it goes to the bike courier.",
      "The machine asks one yes/no question and picks one of two answers.",
      "Conditional types are that machine, but for types: if this type fits a shape, use type A, otherwise use type B.",
      "The package is the input type, the weight check is `extends`, and truck/bike are the two result types.",
      "# What it is",
      "A conditional type has the form `T extends U ? X : Y`, which reads: if `T` is assignable to `U`, the result is `X`, else `Y`.",
      "Assignable means a value of type `T` could be safely used where a `U` is expected (for example `\"hi\"` is assignable to `string`).",
      "It looks like the JavaScript ternary `a ? b : c`, but it runs only inside the type checker at compile time.",
      "It is how TypeScript does if/else logic on types, and is the foundation of utilities like `Exclude`, `Extract`, `NonNullable`, `ReturnType` and `Awaited`.",
      "They are usually used with generics (type parameters like `T` that are filled in later), so the answer depends on what the caller passes.",
      "# How it works",
      "Step by step when the compiler meets `IsString<number>`:",
      "  It substitutes the generic: `number extends string ? true : false`.",
      "  It checks assignability: `number` is not assignable to `string`.",
      "  It picks the false branch: the result is `false`.",
      "If `T` is still an unknown generic (for example inside a function body), the result is deferred — kept unresolved until `T` is known.",
      "If `T` is a union and appears naked (alone) before `extends`, the check runs once per union member (distribution — see that question).",
      "You can use `infer X` inside the `extends` part to capture a piece of the type into a new variable, as in `T extends Promise<infer V> ? V : T`.",
      "Conditional types can be nested to make else-if chains, and can be recursive.",
      "# Example walkthrough",
      "`IsString<\"a\">` is `true`, `IsString<42>` is `false`.",
      "`TypeName<T>` is an else-if chain mapping types to their names, like a `typeof` at the type level.",
      "`ApiResult<T>` returns a different response shape depending on whether `T` is an array — useful for list vs single endpoints.",
      "`format` has a conditional return type; the cast is needed because TS cannot narrow a conditional type inside the function body.",
      "Calling `format(5)` returns type `string` and prints `5.00`; `format(\"x\")` returns type `number` and prints `1`.",
      "# Why it matters / when to use",
      "Typing functions whose return type depends on input (e.g. an option that changes whether the result can be `undefined`).",
      "Building reusable utility types for API layers, ORMs, validation libraries and SDKs.",
      "Extracting parts of types: response types from a fetch function, payload types from event maps, etc.",
      "# Common mistakes",
      "Expecting a conditional return type to narrow inside the function body — TS does not, so you need a cast or overloads.",
      "Being surprised by union distribution; wrap both sides in brackets `[T] extends [U]` to turn it off.",
      "Overusing them: deeply nested conditional types are hard to read and slow to compile; prefer overloads or simpler types when possible.",
      "`any` in a conditional check returns a union of both branches, which can hide bugs.",
      "# Say this in the interview",
      "A conditional type is `T extends U ? X : Y` — type-level if/else that picks a branch based on assignability. Combined with generics and `infer`, it lets a type depend on its input, and it powers built-ins like `Exclude`, `NonNullable` and `ReturnType`. Two things to know: they distribute over unions when `T` is naked, and they are deferred while `T` is still generic.",
      "Follow-up: how do you stop distribution?",
      "  Wrap in a tuple: `[T] extends [U] ? X : Y`.",
      "Follow-up: implement `NonNullable`.",
      "  `type NN<T> = T extends null | undefined ? never : T;` — the `never` branch removes members from the union.",
    ],
    code: `type IsString<T> = T extends string ? true : false;
type A = IsString<"a">;   // true
type B = IsString<42>;    // false

// else-if chain: a type-level typeof
type TypeName<T> =
  T extends string ? "string" :
  T extends number ? "number" :
  T extends boolean ? "boolean" :
  "object";
type N = TypeName<3.14>;  // "number"

// Different response shape for list vs single resources
type ApiResult<T> = T extends any[] ? { items: T; total: number } : { item: T };
type R1 = ApiResult<string[]>; // { items: string[]; total: number }
type R2 = ApiResult<string>;   // { item: string }

// Return type depends on input type
function format<T extends number | string>(v: T): T extends number ? string : number {
  // TS cannot narrow conditional types in the body, so we cast
  return (typeof v === "number" ? v.toFixed(2) : v.length) as any;
}

const s = format(5);      // type: string
const n = format("x");    // type: number
console.log(s, n);        // → 5.00 1`,
  },
  {
    id: 'mapped-types',
    group: 'Advanced Types',
    stars: 5,
    difficulty: 'Medium',
    q: 'What are mapped types?',
    a: [
      "# ELI5",
      "Imagine a teacher with a class list who makes a new sheet: for every student on the list, write a new line with a grade box.",
      "The new sheet has exactly the same names, just with a different thing next to each name.",
      "Mapped types do that with object types: for every key in an existing type, create a key in a new type with a transformed value.",
      "The class list is `keyof T`, the loop is `[K in ...]`, and the grade box is the new value type.",
      "# What it is",
      "A mapped type creates a new object type by looping over a set of keys: `{ [K in Keys]: SomeType }`.",
      "`keyof T` gives the union of property names of `T`; for `{ id: number; name: string }` it is `\"id\" | \"name\"`.",
      "`T[K]` is an indexed access type — it means the type of property `K` on `T` (like reading `obj[key]`, but for types).",
      "So `{ [K in keyof T]: T[K] }` copies `T` exactly; changing the right side or adding modifiers transforms it.",
      "Built-ins like `Partial`, `Required`, `Readonly`, `Pick` and `Record` are all mapped types.",
      "# How it works",
      "The compiler takes the key union, e.g. `\"id\" | \"name\"`.",
      "For each member `K`, it computes the value type you wrote on the right side.",
      "It applies modifiers: `?` makes the key optional, `readonly` makes it read-only, and `-?` / `-readonly` remove them.",
      "Optionally, an `as` clause renames or filters keys (key remapping, TS 4.1+).",
      "When the mapped type is over `keyof T` (called homomorphic), it preserves the original optional/readonly flags of `T`.",
      "The result is a plain object type, fully erased at run time.",
      "# Example walkthrough",
      "`User` has three fields.",
      "`Nullable<User>` maps each value to `T[K] | null`, so every field can be `null`.",
      "`Flags<User>` maps every key to `boolean` — handy for a form's touched state.",
      "`Getters<User>` uses `as` to rename keys to `getId`, `getName`, `getEmail`, each a function returning the original type.",
      "The runtime `makeFlags` creates such an object, and printing it shows all keys set to `false`.",
      "# Why it matters / when to use",
      "Deriving related types from one source of truth: DTOs, update payloads, form state, validation error maps.",
      "When the base type changes, all derived types update automatically, preventing drift between layers.",
      "Libraries use them heavily (Prisma select types, Zod inference, React Hook Form errors).",
      "# Common mistakes",
      "Confusing `[K in keyof T]` (mapped type) with an index signature `[key: string]: V`; mapped types iterate known keys.",
      "Forgetting that `keyof` on a type with a string index signature returns `string | number`, which produces wide keys.",
      "Expecting mapped types to create runtime objects — you still need code like `Object.keys` to build the value.",
      "# Say this in the interview",
      "A mapped type builds a new object type by iterating keys with `[K in keyof T]` and computing each value, usually from `T[K]`. Modifiers like `?`, `readonly`, `-?` and the `as` clause let you make fields optional, immutable, renamed or filtered. That is how `Partial`, `Readonly`, `Pick` and `Record` are implemented, and it lets me derive DTOs and form types from one model.",
      "Follow-up: implement `Readonly`.",
      "  `type MyReadonly<T> = { readonly [K in keyof T]: T[K] };`",
      "Follow-up: what does homomorphic mean?",
      "  The mapped type iterates `keyof T` directly, so it keeps the existing modifiers of `T`.",
    ],
    code: `interface User { id: number; name: string; email: string }

type Nullable<T> = { [K in keyof T]: T[K] | null };
type Flags<T> = { [K in keyof T]: boolean };
type Getters<T> = { [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K] };

type N = Nullable<User>; // { id: number | null; name: string | null; email: string | null }
type F = Flags<User>;    // { id: boolean; name: boolean; email: boolean }
type G = Getters<User>;  // { getId: () => number; getName: () => string; getEmail: () => string }

const draft: Nullable<User> = { id: null, name: "Ana", email: null };

// Runtime helper that builds a Flags object from a sample
function makeFlags<T extends object>(obj: T): Flags<T> {
  const out = {} as Flags<T>;
  for (const k of Object.keys(obj) as (keyof T)[]) out[k] = false;
  return out;
}

console.log(makeFlags({ id: 1, name: "Ana", email: "a@x.io" }));
// → { id: false, name: false, email: false }
console.log(draft.name); // → Ana`,
  },
  {
    id: 'infer-keyword',
    group: 'Advanced Types',
    stars: 4,
    difficulty: 'Hard',
    q: 'What does the `infer` keyword do?',
    a: [
      "# ELI5",
      "Imagine a chocolate-egg mold with a hole in the middle for a surprise toy.",
      "You press the mold onto any egg; if it fits, whatever sits in the hole is the toy, and now you can name it.",
      "`infer` is that hole: you describe a shape, leave a named gap, and TypeScript tells you what filled the gap.",
      "The mold is the pattern after `extends`, the hole is `infer X`, and the toy is the type captured into `X`.",
      "# What it is",
      "`infer` declares a new type variable inside the `extends` clause of a conditional type.",
      "It asks TypeScript to work out (infer) what type sits in that position if the match succeeds.",
      "That variable can then be used only in the true branch of the conditional type.",
      "The main idea is pattern matching on types: describe a shape, extract a part of it.",
      "Built-ins using it include `ReturnType`, `Parameters`, `InstanceType`, `ConstructorParameters` and `Awaited`.",
      "# How it works",
      "Given `type ElementOf<T> = T extends (infer E)[] ? E : never` and `T = string[]`:",
      "  TS tries to match `string[]` against the pattern `(infer E)[]`.",
      "  The match succeeds and `E` is bound to `string`.",
      "  The true branch returns `E`, so the result is `string`.",
      "If the match fails (e.g. `T = number`), the false branch runs and `E` is unused.",
      "You can constrain an inferred variable: `infer N extends number` (TS 4.7+) only matches if the captured type is a number.",
      "With template literal types, `infer` can split strings, such as capturing the text after a colon in a route.",
      "If the same variable is inferred in several positions, TS combines the candidates (union for return-like positions, intersection for parameter positions).",
      "# Example walkthrough",
      "`MyReturnType` matches any function and captures its return type into `R`.",
      "`Unpromise` matches `Promise<V>` and returns `V`; for non-Promises it returns `T` itself.",
      "`FirstArg` captures only the first parameter type using a rest pattern for the remainder.",
      "`RouteParam` uses a template literal pattern to pull `\"id\"` out of `\"/users/:id\"`.",
      "The last lines build a params object typed from `P` and log the user the Promise resolves to.",
      "# Why it matters / when to use",
      "Extracting types from libraries that do not export them (handler payloads, middleware types, SDK responses).",
      "Typed routers: parsing route strings like `/users/:id` into a `{ id: string }` params type (Express types and Hono do this).",
      "Unwrapping containers: Promise values, array elements, function arguments, props of a React component.",
      "# Common mistakes",
      "Using `infer` outside a conditional type's `extends` clause — that is a syntax error.",
      "Trying to use the inferred variable in the false branch; it only exists in the true branch.",
      "Choosing the wrong fallback: return `never` when no match is impossible or invalid, otherwise return a sensible default like `T`.",
      "# Say this in the interview",
      "`infer` lets me pattern-match on types inside a conditional type: I write the shape I expect, put `infer X` where the unknown part is, and in the true branch `X` holds whatever TypeScript matched. That is exactly how `ReturnType` is built: `T extends (...args: any) => infer R ? R : any`. I use it to extract payload, argument or element types from existing types instead of duplicating them.",
      "Follow-up: what is `infer X extends Y`?",
      "  A constraint on the inferred type (TS 4.7+); the match only succeeds if the captured type is assignable to `Y`.",
      "Follow-up: implement `Parameters`.",
      "  `type P<F> = F extends (...args: infer A) => any ? A : never;`",
    ],
    code: `type MyReturnType<F> = F extends (...args: any[]) => infer R ? R : never;
type Unpromise<T> = T extends Promise<infer V> ? V : T;
type FirstArg<F> = F extends (first: infer A, ...rest: any[]) => any ? A : never;
type ElementOf<T> = T extends readonly (infer E)[] ? E : never;

// Pattern-match a string: grab the part after ":"
type RouteParam<S> = S extends \`\${string}:\${infer P}\` ? P : never;

function getUser(id: number, verbose: boolean) {
  return Promise.resolve({ id, name: "Ana" });
}

type R = MyReturnType<typeof getUser>;  // Promise<{ id: number; name: string }>
type U = Unpromise<R>;                  // { id: number; name: string }
type A0 = FirstArg<typeof getUser>;     // number
type E = ElementOf<string[]>;           // string
type P = RouteParam<"/users/:id">;      // "id"

const params: Record<P, string> = { id: "42" };
getUser(Number(params.id), false).then((u: U) => console.log(u));
// → { id: 42, name: 'Ana' }`,
  },
  {
    id: 'distributive-conditional-types',
    group: 'Advanced Types',
    stars: 4,
    difficulty: 'Hard',
    q: 'What are distributive conditional types?',
    a: [
      "# ELI5",
      "Imagine a teacher who must check a basket of fruit: is it ripe?",
      "Instead of judging the whole basket at once, she checks every fruit one by one and makes a new basket from the answers.",
      "Distributive conditional types do this: when you pass a union, the condition is applied to each member separately, and the results are combined into a new union.",
      "The basket is the union type, each fruit is a union member, and the new basket is the resulting union.",
      "# What it is",
      "A union type is a type that can be one of several options, written with `|`, e.g. `string | number`.",
      "A conditional type `T extends U ? X : Y` is distributive when `T` is a naked type parameter — the bare generic `T`, not wrapped in an array, tuple, Promise etc.",
      "When such a type receives a union, TS runs the conditional once for each member and unions the results.",
      "So with `type ToArray<T> = T extends any ? T[] : never`, `ToArray<string | number>` gives `string[] | number[]`, not `(string | number)[]`.",
      "`never` is the empty union, so distributing over `never` gives `never` (zero members, zero results).",
      "# How it works",
      "Given `Exclude<\"a\" | \"b\" | \"c\", \"a\">` where `Exclude<T, U> = T extends U ? never : T`:",
      "  Split the union: check `\"a\"`, `\"b\"`, `\"c\"` separately.",
      "  `\"a\" extends \"a\"` is true, so it becomes `never`.",
      "  `\"b\" extends \"a\"` is false, so it stays `\"b\"`; same for `\"c\"`.",
      "  Join the results: `never | \"b\" | \"c\"`, and `never` disappears from unions, leaving `\"b\" | \"c\"`.",
      "To disable distribution, wrap both sides in a one-element tuple: `[T] extends [U] ? X : Y` — now `T` is no longer naked.",
      "# Example walkthrough",
      "`ToArray<string | number>` distributes into `string[] | number[]`.",
      "`ToArrayNonDist` uses the tuple trick and gives `(string | number)[]`.",
      "`MyExclude` removes `\"debug\"` from the log levels union, leaving three levels.",
      "`IsNeverWrong<never>` gives `never` because of distribution; `IsNever<never>` with the tuple trick gives `true`.",
      "At runtime, `log` accepts only the remaining levels and prints `[warn] disk 90%`.",
      "# Why it matters / when to use",
      "Filtering unions: `Exclude`, `Extract`, `NonNullable` all rely on distribution.",
      "Transforming discriminated unions member by member, e.g. adding a field to every event type in an event bus.",
      "Knowing when to turn it off avoids subtle bugs in checks like `IsNever` or `IsUnion`.",
      "# Common mistakes",
      "Getting `string[] | number[]` when you wanted `(string | number)[]`; fix with `[T] extends [any]`.",
      "Being surprised that passing `never` returns `never` instead of the false branch — use the tuple trick for never-checks.",
      "Thinking any conditional type distributes; only naked type parameters do, `T[] extends ...` or `Promise<T> extends ...` do not.",
      "# Say this in the interview",
      "When a conditional type checks a naked type parameter and receives a union, it distributes: the condition runs on each member separately and the results are unioned. That is why `Exclude<T, U> = T extends U ? never : T` filters unions — matching members become `never` and vanish. If I need to treat the union as a whole, I wrap both sides in brackets, `[T] extends [U]`.",
      "Follow-up: why does a naive `IsNever<never>` return `never`?",
      "  `never` is an empty union, so distribution runs zero times and produces `never`; the tuple wrapper fixes it.",
    ],
    code: `type ToArray<T> = T extends any ? T[] : never;          // distributive
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never; // not distributive

type A = ToArray<string | number>;         // string[] | number[]
type B = ToArrayNonDist<string | number>;  // (string | number)[]

// Exclude is just a distributive conditional
type MyExclude<T, U> = T extends U ? never : T;
type Level = "debug" | "info" | "warn" | "error";
type ProdLevel = MyExclude<Level, "debug">; // "info" | "warn" | "error"

type IsNeverWrong<T> = T extends never ? true : false;
type IsNever<T> = [T] extends [never] ? true : false;
type X1 = IsNeverWrong<never>; // never  (distributed over zero members)
type X2 = IsNever<never>;      // true

function log(level: ProdLevel, msg: string) {
  console.log(\`[\${level}] \${msg}\`);
}
log("warn", "disk 90%");  // → [warn] disk 90%
// log("debug", "x");     // ✗ Error: "debug" is not assignable to ProdLevel`,
  },
  {
    id: 'template-literal-types',
    group: 'Advanced Types',
    stars: 4,
    difficulty: 'Medium',
    q: 'What are template literal types?',
    a: [
      "# ELI5",
      "Think of a fill-in-the-blank card: Hello, ___! where the blank can only be Ana or Bo.",
      "The only valid cards are Hello, Ana! and Hello, Bo! — anything else is rejected.",
      "Template literal types build allowed strings from blanks and lists, and TypeScript checks your strings match.",
      "The card is the backtick template, the blank is a `${...}` slot, and the list of names is a union type.",
      "# What it is",
      "Template literal types (TS 4.1+) use JavaScript template-string syntax with backticks, but at the type level.",
      "A slot can hold a literal type, a union, or a wide type such as `string`, `number`, `bigint` or `boolean`.",
      "If you put unions in the slots, TS produces every combination: methods `\"GET\" | \"POST\"` and paths `\"/users\" | \"/orders\"` give four exact route strings.",
      "If you put a wide type like `number` in a slot, the result is a pattern, e.g. a type that matches `\"user_42\"` but not `\"usr_42\"`.",
      "They combine with `Capitalize`/`Uppercase` and with `infer` for parsing strings.",
      "# How it works",
      "For literal pieces, TS computes the cross product (every pairing) of the union members, giving a union of exact strings.",
      "For wide pieces like `string` or `number`, TS creates a pattern type that any matching string satisfies.",
      "When you assign a string literal, TS checks it fits the pattern or is one of the members.",
      "With `infer`, TS can split a literal, capturing the text before and after a separator such as a dot.",
      "Very large cross products are capped (around 100,000 members) to keep the compiler fast.",
      "# Example walkthrough",
      "`Route` is the four combinations of method and path.",
      "`register(\"GET /users\")` compiles and prints; `register(\"PUT /users\")` fails because PUT is not in the union.",
      "`UserId` is a pattern: `\"user_42\"` passes, `\"usr_42\"` would fail.",
      "`EventKey` builds `\"user:created\"`-style names from entity and action unions.",
      "`Split` uses `infer` to turn `\"db.host\"` into the tuple `[\"db\", \"host\"]`.",
      "# Why it matters / when to use",
      "Typing route strings, event names (`\"order:shipped\"`), CSS units like `\"10px\"` and ID prefixes.",
      "Typed config keys and environment variable names.",
      "Libraries like Express types, tRPC and Hono parse paths with them to type route params.",
      "# Common mistakes",
      "Creating huge unions from several big inputs and slowing the compiler; keep combinations small.",
      "Thinking a pattern type validates runtime input — it only checks values known at compile time; data from requests still needs validation.",
      "Forgetting that a `number` slot also accepts strings like `\"1e3\"` and `\"-0.5\"`, not just digits.",
      "# Say this in the interview",
      "Template literal types use backtick syntax at the type level to build or match strings. With literal unions they expand into every combination, and with `string` or `number` slots they become patterns, so I can type things like `\"GET /users\"` routes, `user_42`-style IDs or `onClick` handler names. Combined with `infer` they can even parse strings, which is how typed routers extract `:id` params.",
      "Follow-up: how would you type an event key like `\"user:created\"`?",
      "  A template literal with two slots, `Entity` and `Action`, separated by a colon, where both are literal unions.",
    ],
    code: `type Method = "GET" | "POST";
type Path = "/users" | "/orders";
type Route = \`\${Method} \${Path}\`;
// → "GET /users" | "GET /orders" | "POST /users" | "POST /orders"

function register(route: Route) {
  console.log("registered", route);
}
register("GET /users");     // → registered GET /users
// register("PUT /users");  // ✗ Error: not assignable to type Route

// Pattern types with wide slots
type UserId = \`user_\${number}\`;
const ok: UserId = "user_42";
// const bad: UserId = "usr_42"; // ✗ Error

type Entity = "user" | "order";
type Action = "created" | "deleted";
type EventKey = \`\${Entity}:\${Action}\`; // 4 combinations

// Parse with infer: split "a.b" into parts
type Split<S> = S extends \`\${infer A}.\${infer B}\` ? [A, B] : [S];
type Parts = Split<"db.host">;          // ["db", "host"]

const ev: EventKey = "order:created";
console.log(ok, ev);                    // → user_42 order:created`,
  },
  {
    id: 'key-remapping',
    group: 'Advanced Types',
    stars: 3,
    difficulty: 'Hard',
    q: 'What is key remapping in mapped types (`as` clause)?',
    a: [
      "# ELI5",
      "Imagine copying a class list onto a new sheet, but you write each kid's nickname and skip anyone who is absent.",
      "The new sheet is based on the old list, but names can change and some can be left out.",
      "Key remapping does this for object types: while looping over keys, you can rename a key or drop it.",
      "The rename rule is the `as` clause, and dropping a kid means mapping the key to `never`.",
      "# What it is",
      "A mapped type loops over keys: `{ [K in keyof T]: T[K] }`.",
      "Since TS 4.1 you can add `as NewKey` after the loop: `{ [K in keyof T as NewKey]: T[K] }`.",
      "`NewKey` is any type expression that produces a string, number or symbol literal — often a template literal type.",
      "If `NewKey` evaluates to `never`, that property is removed from the result (filtering).",
      "Before 4.1 you needed `Pick` plus helper types to filter; `as` makes it one step.",
      "# How it works",
      "For each key `K` from the original union:",
      "  Evaluate the `as` expression with that `K`.",
      "  If it is `never`, skip the property.",
      "  Otherwise create a property with the new name and the value type you wrote (often still `T[K]`).",
      "Because keys can be `symbol` or `number`, you often intersect with `string` (`string & K`) before using them in template literals.",
      "Remapping over `keyof T` still preserves the optional/readonly flags of the original properties.",
      "# Example walkthrough",
      "`Getters<T>` renames `name` to `getName` and `age` to `getAge`, each a function.",
      "`OnlyStrings<T>` keeps only keys whose values are strings; `age` maps to `never` and disappears.",
      "`OmitByPrefix` removes keys starting with `_`, which is useful for hiding internal fields from API responses.",
      "The runtime part builds a getters object and a DTO, printing `Ana` and `{ name: 'Ana', age: 30 }`.",
      "# Why it matters / when to use",
      "Generating event handler or getter/setter names from a model.",
      "Building public DTOs by dropping private/internal fields (`_id`, `passwordHash`).",
      "Filtering a type to keys of a certain value type, e.g. only the function-valued keys of a service.",
      "# Common mistakes",
      "Using `K` directly in a template literal when keys may be symbols; use `string & K`.",
      "Expecting `as` to filter by returning `undefined`; you must return `never`.",
      "Mixing up filtering by key vs by value: to filter by value type, check `T[K] extends X ? K : never` in the `as` clause.",
      "# Say this in the interview",
      "Key remapping is the `as` clause in a mapped type: `{ [K in keyof T as NewName]: ... }`. It lets me rename keys, usually with template literal types plus `Capitalize`, and filter keys by mapping them to `never`. I use it to generate getter or handler names and to strip internal fields when building DTOs.",
      "Follow-up: implement `Omit` with `as`.",
      "  `type MyOmit<T, K> = { [P in keyof T as P extends K ? never : P]: T[P] };`",
    ],
    code: `interface Person { name: string; age: number; _secret: string }

// Rename keys
type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};
type PG = Getters<Pick<Person, "name" | "age">>;
// → { getName: () => string; getAge: () => number }

// Filter by value type: keep only string fields
type OnlyStrings<T> = { [K in keyof T as T[K] extends string ? K : never]: T[K] };
type S = OnlyStrings<Person>; // { name: string; _secret: string }

// Filter by key name: drop "_private" keys
type OmitByPrefix<T> = { [K in keyof T as K extends \`_\${string}\` ? never : K]: T[K] };
type PublicPerson = OmitByPrefix<Person>; // { name: string; age: number }

const p: Person = { name: "Ana", age: 30, _secret: "x" };
const getters: PG = { getName: () => p.name, getAge: () => p.age };
const dto: PublicPerson = { name: p.name, age: p.age };

console.log(getters.getName()); // → Ana
console.log(dto);               // → { name: 'Ana', age: 30 }`,
  },
  {
    id: 'recursive-types',
    group: 'Advanced Types',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do you write recursive types (e.g. JSON)?',
    a: [
      "# ELI5",
      "A folder on your computer can contain files, and it can also contain other folders, which contain more files and folders.",
      "To describe a folder you say: a folder is a list of files or folders — the word folder is used inside its own definition.",
      "A recursive type does the same: the type refers to itself to describe nesting of any depth.",
      "JSON is the classic case: a JSON value can be an array of JSON values or an object of JSON values.",
      "# What it is",
      "A recursive type is a type alias or interface that mentions itself in its own definition.",
      "A type alias is a name for a type created with `type X = ...`; an interface is created with `interface X { ... }`.",
      "Interfaces have always supported self-reference; type aliases support it in unions, arrays and object types since TS 3.7.",
      "Common examples: JSON values, trees (a node has child nodes), linked lists, nested menus and comment threads.",
      "Recursive conditional types (TS 4.1+) can also process types step by step, like `DeepPartial` or string parsers.",
      "# How it works",
      "TS treats the self-reference lazily — it does not expand it fully, only as deep as needed when checking a value.",
      "For `type Json = string | number | boolean | null | Json[] | { [key: string]: Json }`:",
      "  A primitive matches one of the first four members directly.",
      "  An array is checked element by element against `Json` again.",
      "  An object is checked property by property against `Json` again.",
      "The recursion ends when values are primitives.",
      "Type-level recursion has depth limits; hitting them gives error 2589, Type instantiation is excessively deep and possibly infinite.",
      "# Example walkthrough",
      "`Json` describes any valid JSON value.",
      "`config` is a nested object with an array inside; it type-checks.",
      "The commented `bad` line fails because a `Date` object is not valid JSON.",
      "`TreeNode` is an interface with `children: TreeNode[]`, and `countNodes` recursively counts all nodes.",
      "The tree has 1 root, 2 children and 1 grandchild, so it prints `4`.",
      "# Why it matters / when to use",
      "Typing data passed to `JSON.stringify` or stored in JSONB database columns.",
      "Category trees, org charts, file systems, nested comments, menu structures.",
      "Type-level utilities like `DeepPartial`, `DeepReadonly` and dotted path types such as `\"db.host\"`.",
      "# Common mistakes",
      "Writing a recursive alias that refers to itself directly with no object, array or union wrapper (like `type X = X`), which is a circular reference error.",
      "Hitting the depth limit with complex recursive conditional types; simplify them or make them tail-recursive.",
      "Using `any` for JSON — use the `Json` type, or `unknown` plus validation, to keep safety.",
      "# Say this in the interview",
      "A recursive type refers to itself, which lets me describe structures of unlimited depth. For JSON I write a union of the primitives plus `Json[]` and `{ [key: string]: Json }`. Trees work the same way with an interface whose `children` is an array of itself; TS evaluates the recursion lazily, though very deep recursive conditional types can hit the instantiation depth limit.",
      "Follow-up: interface or type alias for recursion?",
      "  Both work today; interfaces are slightly cheaper for the compiler and give clearer error messages for object shapes.",
    ],
    code: `type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json };

const config: Json = {
  name: "api",
  ports: [80, 443],
  db: { host: "localhost", replicas: [{ host: "r1" }] },
};
// const bad: Json = { at: new Date() };  // ✗ Error: Date is not Json

interface TreeNode {
  name: string;
  children: TreeNode[]; // the type refers to itself
}

function countNodes(node: TreeNode): number {
  // 1 for this node + all nodes below it
  return 1 + node.children.reduce((sum, c) => sum + countNodes(c), 0);
}

const tree: TreeNode = {
  name: "root",
  children: [
    { name: "a", children: [{ name: "a1", children: [] }] },
    { name: "b", children: [] },
  ],
};

console.log(countNodes(tree));                   // → 4
console.log(JSON.stringify(config).length > 0);  // → true`,
  },
  {
    id: 'branded-types',
    group: 'Advanced Types',
    stars: 3,
    difficulty: 'Hard',
    q: 'What are branded (nominal / opaque) types?',
    a: [
      "# ELI5",
      "Two kids both have a plain blue water bottle; they look identical, so they keep grabbing the wrong one.",
      "So each kid sticks a name label on their bottle; now you can tell them apart even though the bottles are the same.",
      "A branded type is a plain value (like a string) with an invisible name label in the type system, so you cannot mix it up with a similar-looking value.",
      "The bottle is a `string` or `number`, and the label is a fake `__brand` property that exists only for the type checker.",
      "# What it is",
      "TypeScript is structurally typed: two types are compatible if they have the same shape, no matter what they are called.",
      "So `type UserId = string` and `type OrderId = string` are the same type, and you can pass an order ID where a user ID is expected by accident.",
      "Nominal typing (used by Java, C#) means types are compatible only if they have the same name; TS does not do this by default.",
      "A branded type fakes nominal typing: `type UserId = string & { readonly __brand: \"UserId\" }`.",
      "The `&` is an intersection type — a value must satisfy both parts — so a plain `string` no longer fits without the brand.",
      "Also called opaque types, because outside code cannot create one without going through your approved function.",
      "# How it works",
      "The brand property never exists at run time; it lives only in the type.",
      "  You create branded values through a constructor function that validates input and then casts with `as UserId`.",
      "  Everywhere else, TS sees `UserId` and `OrderId` as different because their `__brand` literals differ.",
      "  A branded value is still usable as a normal `string` (string methods, concatenation), because it is a subtype of `string`.",
      "  After compile, the cast disappears and the value is just a regular string.",
      "A stronger variant uses a `unique symbol` as the key so nobody can forge the brand by writing `__brand` themselves.",
      "# Example walkthrough",
      "`Brand<T, B>` is a reusable helper that adds a brand to any base type.",
      "`toUserId` validates the format and casts; this is the only place the cast happens.",
      "`getUser` only accepts a `UserId`, so passing a raw string or an `OrderId` fails to compile.",
      "`Cents` brands a `number` to avoid mixing cents and dollars; `addCents` keeps the brand.",
      "The program prints the loaded user id and the total cents.",
      "# Why it matters / when to use",
      "Database IDs for different tables (`UserId`, `OrderId`) so you never query with the wrong one.",
      "Units and validated data: `Cents` vs `Dollars`, `Email` (validated), `SanitizedHtml`, `HashedPassword`.",
      "Libraries like Zod (`.brand()`) and Effect provide built-in branding helpers.",
      "# Common mistakes",
      "Scattering `as UserId` casts everywhere, which defeats the purpose; keep the cast in one validated constructor.",
      "Expecting the brand to exist at run time (for example checking `id.__brand`); it is always `undefined`.",
      "Doing arithmetic on branded numbers and expecting the result to keep the brand; `a + b` gives a plain `number`, so re-brand it.",
      "# Say this in the interview",
      "TypeScript is structural, so two `string` aliases are interchangeable. Branding intersects the base type with a fake property like `{ __brand: \"UserId\" }`, which makes `UserId` and `OrderId` incompatible at compile time while still being plain strings at run time. I create branded values only through a validating function, which gives me nominal-like safety for IDs, units and validated input.",
      "Follow-up: what is the runtime cost?",
      "  None — the brand is erased; only the validation function runs.",
    ],
    code: `type Brand<T, B extends string> = T & { readonly __brand: B };

type UserId = Brand<string, "UserId">;
type OrderId = Brand<string, "OrderId">;
type Cents = Brand<number, "Cents">;

// The ONLY place we cast: validate first
function toUserId(raw: string): UserId {
  if (!/^usr_\\w+$/.test(raw)) throw new Error("invalid user id");
  return raw as UserId;
}
const toOrderId = (raw: string) => raw as OrderId;
const cents = (n: number) => Math.round(n) as Cents;

function getUser(id: UserId) {
  return { id, name: "Ana" };
}

const uid = toUserId("usr_42");
const oid = toOrderId("ord_7");

console.log(getUser(uid).id);   // → usr_42
// getUser("usr_42");           // ✗ Error: string is not assignable to UserId
// getUser(oid);                // ✗ Error: OrderId is not assignable to UserId
console.log(uid.toUpperCase()); // → USR_42 (still a normal string)

const addCents = (a: Cents, b: Cents): Cents => (a + b) as Cents; // re-brand
console.log(addCents(cents(199), cents(1))); // → 200`,
  },
  {
    id: 'mapped-type-modifiers',
    group: 'Advanced Types',
    stars: 2,
    difficulty: 'Medium',
    q: 'How do you add or remove `readonly` and `?` in mapped types?',
    a: [
      "# ELI5",
      "Think of a form where some boxes have a little optional tag and some have a do-not-edit sticker.",
      "A modifier is like a sticker gun: a plus sticker adds the tag, and a minus remover peels it off.",
      "Mapped types let you go over every box on the form and add or peel off those stickers in one go.",
      "The optional tag is `?`, the do-not-edit sticker is `readonly`, and plus/minus are `+` and `-`.",
      "# What it is",
      "A mapped type loops over keys: `{ [K in keyof T]: T[K] }`.",
      "Modifiers are keywords on each property: `readonly` (cannot be reassigned) and `?` (may be missing).",
      "In a mapped type you can add them: `readonly [K in keyof T]?: T[K]`.",
      "You can remove them with a minus: `-readonly [K in keyof T]-?: T[K]`.",
      "A plus sign (`+readonly`, `+?`) means add and is the same as writing no sign.",
      "Built-ins: `Partial` adds `?`, `Required` removes `?` with `-?`, `Readonly` adds `readonly`; there is no built-in to remove `readonly`, so people write `Mutable`.",
      "# How it works",
      "The compiler visits each key of `T`.",
      "  It starts with the key's original modifiers (homomorphic mapped types copy them).",
      "  It applies your `+`/`-` changes on top.",
      "  With `-?`, it also removes `undefined` that was added only because the property was optional.",
      "The result is a brand-new type; the original is unchanged and nothing exists at run time.",
      "# Example walkthrough",
      "`Draft` has a readonly `id` and an optional `title`.",
      "`Mutable<Draft>` removes `readonly`, so `m.id = 2` is allowed.",
      "`Complete<Draft>` (same as `Required`) removes `?`, so `title` must be present.",
      "`Frozen<Draft>` adds `readonly` to every field, so assigning to `title` fails.",
      "The logs print the updated id and the required title.",
      "# Why it matters / when to use",
      "Turning a create payload (everything optional) into a fully filled entity type after defaults are applied.",
      "Builders and test factories that need to mutate an object typed as readonly elsewhere.",
      "Exposing read-only views of internal state from a service.",
      "# Common mistakes",
      "Expecting `-readonly` to unfreeze an `Object.freeze` object at run time; it only changes the type.",
      "Forgetting that `-?` also strips `undefined` from the property type, which can be surprising with `exactOptionalPropertyTypes`.",
      "Writing the minus in the wrong place: it goes before `readonly` and before `?`, i.e. `-readonly [K in keyof T]-?:`.",
      "# Say this in the interview",
      "In a mapped type I can prefix `readonly` and `?` with `+` or `-` to add or remove them. `Partial` uses `?`, `Required` uses `-?`, `Readonly` uses `readonly`, and a common custom `Mutable<T>` uses `-readonly`. This is compile-time only and is handy for converting between input DTOs, internal entities and read-only views.",
      "Follow-up: how is `Required` written?",
      "  `type Required<T> = { [K in keyof T]-?: T[K] };`",
    ],
    code: `interface Draft {
  readonly id: number;
  title?: string;
}

type Mutable<T> = { -readonly [K in keyof T]: T[K] };   // remove readonly
type Complete<T> = { [K in keyof T]-?: T[K] };          // remove ? (like Required)
type Frozen<T> = { +readonly [K in keyof T]: T[K] };    // add readonly ("+" optional)
type Loose<T> = { [K in keyof T]+?: T[K] };             // add ? (like Partial)

const m: Mutable<Draft> = { id: 1 };
m.id = 2;                         // ✓ allowed: readonly removed
console.log(m.id);                // → 2

const c: Complete<Draft> = { id: 3, title: "Hello" };
// const c2: Complete<Draft> = { id: 3 }; // ✗ Error: title is missing
console.log(c.title.length);      // → 5 (no undefined check needed)

const f: Frozen<Draft> = { id: 4, title: "x" };
// f.title = "y";                 // ✗ Error: read-only property

const l: Loose<Draft> = {};       // everything optional
console.log(Object.keys(l).length); // → 0`,
  },
  {
    id: 'function-parameter-bivariance',
    group: 'Advanced Types',
    stars: 2,
    difficulty: 'Hard',
    q: 'What is `strictFunctionTypes` and why are method parameters bivariant?',
    a: [
      "# ELI5",
      "You hire a dog walker for your dog. A person who walks any animal is a safe choice: they can handle your dog.",
      "A person who only walks poodles is NOT safe — your dog might be a bulldog.",
      "So a helper that accepts something wider is safe to substitute, but one that accepts something narrower is not.",
      "In code: a function that takes `Animal` can stand in for one that takes `Dog`, but not the other way round; `strictFunctionTypes` enforces this.",
      "# What it is",
      "Variance describes how subtyping of parts affects subtyping of the whole. A subtype is a more specific type, like `Dog` is a subtype of `Animal`.",
      "Covariant: the relationship goes the same direction (an array of `Dog` used as an array of `Animal`; return types work this way).",
      "Contravariant: the relationship flips — a function accepting `Animal` is a subtype of a function accepting `Dog`. This is correct for parameters.",
      "Bivariant: both directions are allowed, which is convenient but unsound (can let real bugs through).",
      "`strictFunctionTypes` (on with `strict: true`) makes function-type parameters contravariant.",
      "But parameters declared with method syntax (`handle(x: Dog): void`) stay bivariant, even with the flag on.",
      "# How it works",
      "When TS checks whether function type `F` is assignable to function type `G`:",
      "  Return types are compared covariantly (`F` return must fit `G` return).",
      "  With the flag, for property-style function types (`handle: (x: Dog) => void`), each parameter of `G` must be assignable to the matching parameter of `F` (contravariant).",
      "  For method-style declarations, TS accepts the assignment if the parameters are related in either direction (bivariant).",
      "Methods are exempted on purpose: built-in types like `Array<T>` have methods such as `push(item: T)`, and strict checking would make `Dog[]` not assignable to `Animal[]`, breaking huge amounts of real code.",
      "# Example walkthrough",
      "`Animal` has `name`; `Dog` adds `bark`.",
      "`PropHandler` uses property syntax, so assigning a dog-only function to an animal handler is an error.",
      "`MethodHandler` uses method syntax, so the same unsafe assignment compiles.",
      "Calling `m.handle(cat)` then crashes at run time, because a cat has no `bark` method — the TypeError message is printed.",
      "# Why it matters / when to use",
      "Typing callbacks and event handlers safely in backend services, middleware and plugin systems.",
      "Prefer property syntax (`onEvent: (e: E) => void`) in your own interfaces to get the stricter check.",
      "Explains some puzzling compile results when a callback with a narrower parameter is accepted.",
      "# Common mistakes",
      "Assuming `strict` makes all callbacks safe; method-style declarations are still bivariant.",
      "Turning off `strictFunctionTypes` to silence errors instead of fixing the parameter type.",
      "Mixing up the direction: a handler for a wider type can replace a narrower one, not the other way around.",
      "# Say this in the interview",
      "Parameters should be contravariant: a function that accepts `Animal` can replace one that accepts `Dog`, but not the reverse. `strictFunctionTypes` enforces that for function-type properties, but method-syntax parameters stay bivariant on purpose so that common types like `Array<T>` remain covariant and existing code keeps compiling. So in my own interfaces I declare callbacks with property syntax to get the safer check.",
      "Follow-up: are arrays sound in TS?",
      "  No, arrays are covariant even though they are mutable, so you can push a `Cat` into a `Dog[]` viewed as `Animal[]`.",
    ],
    code: `interface Animal { name: string }
interface Dog extends Animal { bark(): string }

const onlyDogs = (d: Dog) => console.log(d.bark());

// Property syntax → parameters checked contravariantly (strict)
interface PropHandler { handle: (a: Animal) => void }
// const p: PropHandler = { handle: onlyDogs }; // ✗ Error under strictFunctionTypes

// Method syntax → parameters bivariant (allowed, but unsafe!)
interface MethodHandler { handle(a: Animal): void }
const m: MethodHandler = { handle: onlyDogs };  // ✓ compiles

const cat: Animal = { name: "Tom" };
try {
  m.handle(cat);                    // cat has no bark()
} catch (e) {
  console.log((e as Error).message); // → d.bark is not a function
}

// Safe direction: a wider handler can replace a narrower one
const anyAnimal = (a: Animal) => console.log("hi", a.name);
const dogHandler: (d: Dog) => void = anyAnimal; // ✓ contravariance
dogHandler({ name: "Rex", bark: () => "woof" }); // → hi Rex`,
  },
  {
    id: 'variadic-tuple-types',
    group: 'Advanced Types',
    stars: 1,
    difficulty: 'Hard',
    q: 'What are variadic tuple types?',
    a: [
      "# ELI5",
      "Imagine a train: an engine at the front, any number of carriages in the middle, and a caboose at the end.",
      "You can build a new train by gluing two trains together, and the order of carriages is kept.",
      "Variadic tuple types let TypeScript describe these glued-together lists exactly, carriage by carriage.",
      "Each carriage is a tuple element type, and gluing is the spread `...T` inside a tuple type.",
      "# What it is",
      "A tuple type is an array type with a fixed length and a known type at each position, e.g. `[string, number]`.",
      "Variadic (meaning variable number of) tuple types, added in TS 4.0, let a tuple contain a generic spread: `[...T, ...U]` where `T` and `U` are themselves tuples.",
      "Spreads can appear anywhere, not only at the end: `[first: string, ...rest: T, last: boolean]`.",
      "This lets TS type functions like `concat`, `curry`, `bind` and argument-forwarding wrappers precisely, without many overloads.",
      "Labeled tuple elements like `[id: number, name: string]` give readable names in editor hints.",
      "# How it works",
      "When you call a generic function with `T extends unknown[]`:",
      "  TS infers `T` as a tuple from the arguments (thanks to the `unknown[]` constraint and spread usage).",
      "  It substitutes the tuple into `[...T, ...U]` and flattens it into one tuple.",
      "  The result keeps each position's exact type and the total length.",
      "For a spread of a plain array type (not a tuple), the result becomes a rest element like `[string, ...number[]]`.",
      "# Example walkthrough",
      "`concat` returns `[...T, ...U]`; calling it with `[1, \"a\"]` and `[true]` gives type `[number, string, boolean]`.",
      "`as const` is not needed here because the generic spread signature makes TS infer tuples.",
      "`withLogging` wraps any function and keeps its exact argument tuple `A`, so callers still get type errors for wrong arguments.",
      "`partial` pre-fills the first argument and returns a function expecting the remaining tuple.",
      "Outputs show the concatenated array, the logged call, and the partially applied result.",
      "# Why it matters / when to use",
      "Typing middleware or decorator-style wrappers that forward arguments (`(...args: A) => R`).",
      "Typing `Promise.all`-like helpers, event emitters with argument tuples, and query builders.",
      "Avoiding long lists of overloads in library code.",
      "# Common mistakes",
      "Getting `(string | number)[]` instead of a tuple; constrain with `T extends unknown[]` and spread it so TS infers a tuple.",
      "Spreading non-tuple arrays and expecting exact lengths; plain arrays produce rest elements.",
      "Overcomplicating app code; they mostly matter in reusable helpers and libraries.",
      "# Say this in the interview",
      "Variadic tuple types, from TS 4.0, allow generic spreads inside tuple types like `[...T, ...U]`. That lets me type functions that concatenate, prepend or forward arguments while keeping exact positions and length, for example a `withLogging` wrapper typed as `(...args: A) => R` that preserves the wrapped function's parameters.",
      "Follow-up: what are labeled tuple elements?",
      "  Names on positions like `[id: number, name: string]`; they only improve readability and editor hints.",
    ],
    code: `function concat<T extends unknown[], U extends unknown[]>(a: [...T], b: [...U]): [...T, ...U] {
  return [...a, ...b];
}
const joined = concat([1, "a"], [true]); // type: [number, string, boolean]
console.log(joined);                     // → [ 1, 'a', true ]

// Forward ANY function's exact arguments
function withLogging<A extends unknown[], R>(fn: (...args: A) => R) {
  return (...args: A): R => {
    console.log("calling with", args);
    return fn(...args);
  };
}
const add = (x: number, y: number) => x + y;
const loggedAdd = withLogging(add);      // (x: number, y: number) => number
console.log(loggedAdd(2, 3));            // → calling with [ 2, 3 ]  then 5
// loggedAdd("2", 3);                    // ✗ Error: string not assignable to number

// Pre-fill the first argument, keep the rest
function partial<F, R extends unknown[], Out>(fn: (first: F, ...rest: R) => Out, first: F) {
  return (...rest: R) => fn(first, ...rest);
}
type Labeled = [id: number, name: string]; // labeled tuple
const greet = (greeting: string, ...[id, name]: Labeled) => \`\${greeting} #\${id} \${name}\`;
console.log(partial(greet, "Hi")(7, "Ana")); // → Hi #7 Ana`,
  },
  {
    id: 'access-modifiers',
    group: 'Classes & OOP',
    stars: 5,
    difficulty: 'Easy',
    q: 'What are `public`, `private`, `protected` and how do they differ from `#private` fields?',
    a: [
      "# ELI5",
      "Think of a house: the front yard is public (anyone can walk up), the bedroom is private (only you), and the family room is protected (you and your children).",
      "A `private` keyword is like a Keep Out sign on the bedroom door: polite people obey it, but the door is not locked.",
      "A `#private` field is a real locked safe inside the bedroom: nobody outside can open it, sign or no sign.",
      "The house is a class, people are other code, the sign is TypeScript's compile-time check, and the safe is JavaScript's run-time privacy.",
      "# What it is",
      "Access modifiers control which code may read or write a class member (a property or method).",
      "`public` (the default): accessible from anywhere.",
      "`private`: accessible only inside the same class's own code.",
      "`protected`: accessible inside the class and in subclasses (classes that `extends` it), but not from outside.",
      "`#field` (ECMAScript private field, a real JavaScript feature since ES2022): truly hidden at run time, only code inside the class body can touch it.",
      "Comparison, row by row:",
      "  Enforced by: `private` is checked only by the TypeScript compiler; `#field` is enforced by the JavaScript engine.",
      "  After compile: `private x` becomes a normal property anyone can read; `#x` stays hidden.",
      "  Escape hatches: `obj[\"x\"]` or `as any` bypass `private`; nothing bypasses `#x` from outside.",
      "  Visibility in logs and `JSON.stringify`: `private` fields appear; `#` fields do not.",
      "  Subclasses: `protected` exists only in TS; `#` fields are not visible to subclasses at all.",
      "# How it works",
      "During type checking, TS looks at every member access and checks it against the modifier and the location of the code.",
      "  Inside the class: everything allowed.",
      "  In a subclass: `public` and `protected` allowed, `private` errors.",
      "  Outside: only `public` allowed.",
      "Types are then erased; `private`/`protected`/`public` words vanish from the JavaScript output.",
      "`#field` is emitted as is (for modern targets) and the engine stores it in a hidden slot that property lookup cannot reach.",
      "Bracket access `obj[\"secret\"]` is allowed on `private` members as a deliberate escape hatch.",
      "# Example walkthrough",
      "`Account` has a public `owner`, a protected `balance`, a TS-private `pin` and a JS-private `#token`.",
      "`Savings` extends it and can read `balance` in `addInterest`, but would get an error on `pin`.",
      "Outside, `acc.balance` and `acc.pin` are compile errors; `acc[\"pin\"]` still works and prints `1234`.",
      "`JSON.stringify(acc)` shows `owner`, `balance` and `pin` but not `#token`.",
      "`acc.hasToken()` shows the class itself can read `#token`.",
      "# Why it matters / when to use",
      "Use `private`/`protected` to express design intent and keep a clean public API for services and repositories.",
      "Use `#private` for secrets or invariants that must not leak, e.g. API keys or internal caches in an SDK used by plain JavaScript callers.",
      "Use `protected` for template-method base classes, e.g. a base repository that subclasses customise.",
      "# Common mistakes",
      "Thinking `private` hides data at run time; it shows up in logs, `Object.keys` and JSON responses.",
      "Trying to access a `#field` from a subclass; `#` fields are per-class, use `protected` if subclasses need it.",
      "Mixing both for the same field, or forgetting that `#` fields need a modern target (ES2022) or they are downleveled to WeakMaps.",
      "# Say this in the interview",
      "`public`, `private` and `protected` are TypeScript compile-time checks: `private` is class-only, `protected` adds subclasses, and they disappear in the emitted JavaScript, so `obj[\"x\"]` or `as any` can still read them. `#field` is native JavaScript private state enforced by the runtime — not visible in JSON, keys or from subclasses. I use TS modifiers for API design and `#` when the data must be truly hidden.",
      "Follow-up: can two instances access each other's private members?",
      "  Yes, privacy is per class, not per instance — a method can read `other.pin` or `other.#token` if `other` is the same class.",
      "Follow-up: what does `private constructor` do?",
      "  It stops `new` outside the class, used for singletons and static factory methods.",
    ],
    code: `class Account {
  public owner: string;
  protected balance = 100;
  private pin = 1234;
  #token = "secret-abc";               // real JS private field

  constructor(owner: string) { this.owner = owner; }
  hasToken() { return this.#token.length > 0; } // class can read #token
}

class Savings extends Account {
  addInterest() {
    this.balance *= 1.1;               // ✓ protected is visible in subclasses
    // this.pin;                       // ✗ Error: private to Account
    return this.balance;
  }
}

const acc = new Savings("Ana");
console.log(acc.owner);                // → Ana
// acc.balance; acc.pin;               // ✗ compile errors
console.log(acc["pin"]);               // → 1234 (TS-private is not real privacy)
// acc.#token;                         // ✗ SyntaxError: not accessible outside class
console.log(acc.addInterest());        // → 110.00000000000001
console.log(JSON.stringify(acc));      // → {"owner":"Ana","balance":110.00000000000001,"pin":1234}
console.log(acc.hasToken());           // → true`,
  },
  {
    id: 'abstract-class-vs-interface',
    group: 'Classes & OOP',
    stars: 4,
    difficulty: 'Medium',
    q: 'Abstract class vs interface — when to use which?',
    a: [
      "# ELI5",
      "An interface is a job description: it lists what a worker must be able to do, but gives no training.",
      "An abstract class is a half-built training kit: it already teaches some skills, leaves blanks for others, and you cannot hire the kit itself.",
      "A worker can match many job descriptions, but can only come from one training kit.",
      "In code: interfaces describe a shape only; abstract classes share real code and force subclasses to fill in the missing methods.",
      "# What it is",
      "An interface is a compile-time contract describing properties and method signatures; it produces no JavaScript at all.",
      "An abstract class is a real class marked `abstract`: you cannot call `new` on it directly, and it may contain abstract methods (declared without a body) that subclasses must implement.",
      "Comparison, row by row:",
      "  Runtime: interface is erased; abstract class exists in the output JS as a normal class.",
      "  Implementation code: interface has none; abstract class can have constructors, fields and concrete methods.",
      "  Multiple: a class can `implements` many interfaces but `extends` only one class.",
      "  `instanceof`: works with abstract classes; impossible with interfaces.",
      "  Access modifiers and state: abstract classes can have `protected` members and fields with initial values; interfaces cannot.",
      "  Usable by plain objects: any object literal can satisfy an interface; abstract class types usually require subclass instances.",
      "# How it works",
      "Interface: TS checks that a class or object has every required member with compatible types, then erases the interface.",
      "Abstract class:",
      "  TS forbids `new AbstractClass()`.",
      "  A non-abstract subclass must implement every abstract member, or TS reports an error.",
      "  At run time, the subclass inherits real methods through the prototype chain (the link objects use to find inherited methods).",
      "Both can be combined: an abstract class can implement an interface and leave some members abstract.",
      "# Example walkthrough",
      "`Notifier` is an interface: anything with `send(to, msg)` qualifies.",
      "`BaseNotifier` is an abstract class implementing it: it provides shared `send` logic (validation and logging) and leaves `deliver` abstract.",
      "`EmailNotifier` only implements `deliver`; it inherits the rest.",
      "`smsLike` is a plain object that satisfies the interface without any class.",
      "`notifyAll` accepts the interface type, so both work; outputs show the email and sms deliveries.",
      "# Why it matters / when to use",
      "Use an interface for contracts between layers (repository, service, DTO shapes), dependency injection tokens and anything that plain objects or mocks should satisfy.",
      "Use an abstract class when several implementations share real code — template method pattern, base repository with common CRUD, base HTTP client with retry logic.",
      "Many teams combine them: depend on the interface, share code via the abstract base.",
      "# Common mistakes",
      "Using an abstract class only to describe a shape with no shared code; an interface is lighter and easier to mock.",
      "Expecting `instanceof SomeInterface` to work; interfaces do not exist at run time.",
      "Building deep inheritance hierarchies; prefer composition (passing helpers in) over long `extends` chains.",
      "# Say this in the interview",
      "An interface is a pure compile-time contract with no code, and a class can implement many of them; an abstract class is a real runtime class that can hold shared implementation, state and protected members, but cannot be instantiated and can only be extended once. I default to interfaces for contracts and dependency injection, and reach for an abstract class when several implementations share logic, like a template method.",
      "Follow-up: can an interface extend a class?",
      "  Yes, it inherits the class members' types (including private ones, which then restrict who can implement it).",
    ],
    code: `interface Notifier {
  send(to: string, msg: string): void;
}

abstract class BaseNotifier implements Notifier {
  // shared logic every notifier gets for free (template method)
  send(to: string, msg: string) {
    if (!to) throw new Error("no recipient");
    this.deliver(to, msg.trim());
  }
  protected abstract deliver(to: string, msg: string): void; // no body
}

class EmailNotifier extends BaseNotifier {
  protected deliver(to: string, msg: string) {
    console.log(\`email → \${to}: \${msg}\`);
  }
}

// const n = new BaseNotifier();      // ✗ Error: cannot create an abstract class instance

// A plain object can satisfy an interface, no class needed
const smsLike: Notifier = { send: (to, msg) => console.log(\`sms → \${to}: \${msg}\`) };

function notifyAll(list: Notifier[]) {
  for (const n of list) n.send("ana", " Order shipped ");
}

notifyAll([new EmailNotifier(), smsLike]);
// → email → ana: Order shipped
// → sms → ana:  Order shipped
console.log(new EmailNotifier() instanceof BaseNotifier); // → true`,
  },
  {
    id: 'implements-vs-extends',
    group: 'Classes & OOP',
    stars: 4,
    difficulty: 'Easy',
    q: 'What is the difference between `implements` and `extends` for classes?',
    a: [
      "# ELI5",
      "`extends` is like inheriting your parent's toolbox: you get all their tools and can add or upgrade some.",
      "`implements` is like passing a driving test: you promise you can do certain things, but nobody gives you a car — you bring your own skills.",
      "You can have only one parent toolbox, but you can pass many tests.",
      "In code: `extends` copies behaviour from a parent class; `implements` only checks you wrote the required members yourself.",
      "# What it is",
      "`class B extends A`: inheritance — `B` gets all of `A`'s methods and properties at run time, and `B` is a subtype of `A`.",
      "`class B implements I`: a compile-time check that `B` has every member described by `I` (an interface, or even a class or type used as a shape).",
      "Comparison, row by row:",
      "  Code reuse: `extends` reuses the parent's code; `implements` gives you nothing, you write everything.",
      "  Count: a class can extend one class but implement many interfaces (`implements A, B, C`).",
      "  Runtime: `extends` sets up the prototype chain and `super`; `implements` disappears after compile.",
      "  Constructor: with `extends` you must call `super()` before using `this`; with `implements` there is no parent constructor.",
      "  Interfaces can also `extends` other interfaces (even several) to combine shapes.",
      "# How it works",
      "For `extends`:",
      "  JavaScript links `B.prototype` to `A.prototype`, so method lookups fall back to `A`.",
      "  `super(...)` runs `A`'s constructor to initialise inherited fields.",
      "  You can override methods and call the parent version with `super.method()`.",
      "For `implements`:",
      "  TS compares the class's members to the interface and reports any missing or incompatible member.",
      "  It does not add anything; parameter types are not inferred from the interface either.",
      "# Example walkthrough",
      "`Serializable` and `Identifiable` are interfaces; `BaseEntity` is a class with a real `createdAt` and `touch()`.",
      "`User extends BaseEntity implements Serializable, Identifiable` inherits `touch()` and must define `id` and `serialize()` itself.",
      "Constructing a user calls `super()` first, then sets the id.",
      "`u.touch()` comes from the parent; `u.serialize()` from `User`; both print.",
      "`instanceof BaseEntity` is `true`; there is no runtime check for interfaces.",
      "# Why it matters / when to use",
      "`extends` for sharing real behaviour: base entities, base error classes (`class NotFoundError extends Error`), base controllers.",
      "`implements` for guaranteeing a class fits a contract used elsewhere: repository interfaces, payment provider interfaces, plugin APIs.",
      "Combining both is common in NestJS-style backends (`implements OnModuleInit`).",
      "# Common mistakes",
      "Expecting `implements` to give default method bodies; it never does.",
      "Expecting `implements` to infer parameter types for methods — you still must annotate them, or they become `any` under loose settings.",
      "Forgetting `super()` in a subclass constructor, which throws a ReferenceError when `this` is used.",
      "# Say this in the interview",
      "`extends` is real inheritance: the subclass gets the parent's code through the prototype chain, must call `super()`, and can extend only one class. `implements` is just a compile-time promise that the class matches an interface's shape; it copies no code, disappears at run time, and a class can implement many interfaces. I use `extends` to share behaviour and `implements` to guarantee contracts.",
      "Follow-up: can a class implement another class?",
      "  Yes, TS treats the class as a shape, but you must provide every member yourself, and private members make it impossible to implement from outside.",
    ],
    code: `interface Serializable { serialize(): string }
interface Identifiable { id: string }

class BaseEntity {
  createdAt = new Date(0);
  touch() {
    this.createdAt = new Date(1_000);
    console.log("touched at", this.createdAt.getTime());
  }
}

// one parent (extends), many contracts (implements)
class User extends BaseEntity implements Serializable, Identifiable {
  constructor(public id: string, public name: string) {
    super();                 // must run the parent constructor first
  }
  serialize() {              // required by Serializable
    return JSON.stringify({ id: this.id, name: this.name });
  }
}

const u = new User("u1", "Ana");
u.touch();                              // → touched at 1000   (inherited)
console.log(u.serialize());             // → {"id":"u1","name":"Ana"}
console.log(u instanceof BaseEntity);   // → true
// u instanceof Serializable;           // ✗ Error: interfaces only exist at compile time

// class Broken implements Serializable {} // ✗ Error: missing serialize()`,
  },
  {
    id: 'readonly-vs-const',
    group: 'Classes & OOP',
    stars: 4,
    difficulty: 'Easy',
    q: 'What is the difference between `readonly` and `const`?',
    a: [
      "# ELI5",
      "`const` is like writing a name on a box in permanent marker: that label always points to the same box, but you can still change what is inside.",
      "`readonly` is like gluing one specific item inside a box: that slot cannot be swapped out.",
      "One protects the label (the variable), the other protects a slot inside an object (a property).",
      "In code: `const` is for variables, `readonly` is for properties.",
      "# What it is",
      "`const` is a JavaScript keyword for declaring a variable that cannot be reassigned after its first value.",
      "`readonly` is a TypeScript modifier for properties (in classes, interfaces, type literals) and for array/tuple types, preventing reassignment of that property.",
      "Comparison, row by row:",
      "  Applies to: `const` → variables; `readonly` → properties, index signatures, arrays (`readonly string[]`).",
      "  Enforced by: `const` by both TS and the JS engine (reassigning throws `TypeError`); `readonly` by TS only, erased at run time.",
      "  When set: `const` must be initialised at declaration; a `readonly` class field can be set at declaration or in the constructor.",
      "  Depth: both are shallow — the object a `const` points to, or a nested object under a `readonly` property, can still be changed.",
      "Related: `as const` is a type assertion that makes a literal deeply readonly and keeps exact literal types.",
      "# How it works",
      "For `const x = {...}`, the engine forbids `x = somethingElse`, but `x.prop = 1` is fine because the binding (the name-to-value link) did not change.",
      "For `readonly prop`, TS checks every assignment to `prop` and errors unless it happens in the declaration or the constructor.",
      "After compilation, `readonly` vanishes, so JavaScript code (or `as any`) can still write the property.",
      "`readonly T[]` (or `ReadonlyArray<T>`) removes mutating methods like `push` and `splice` from the type.",
      "# Example walkthrough",
      "`config` is `const`, so reassigning it is an error, but changing `config.port` works and prints `8080`.",
      "`Point` has `readonly x`; it is set in the constructor, and `p.x = 5` is a compile error.",
      "`list` is `readonly number[]`; `list.push` does not exist on the type.",
      "`ROLES` uses `as const`, so its type is `readonly [\"admin\", \"user\"]` and `Role` becomes `\"admin\" | \"user\"`.",
      "# Why it matters / when to use",
      "Use `const` for every variable that does not need reassignment — that is most variables in modern code.",
      "Use `readonly` for IDs, timestamps, injected dependencies (`constructor(private readonly repo: Repo)`) and config objects.",
      "Use `readonly` arrays in function parameters to promise you will not mutate the caller's array.",
      "# Common mistakes",
      "Thinking `const obj` makes the object immutable — it only locks the variable binding.",
      "Thinking `readonly` protects at run time; use `Object.freeze` for that.",
      "Trying to put `readonly` on a local variable or `const` on a class property; they do not apply there.",
      "# Say this in the interview",
      "`const` is a JavaScript variable declaration that prevents reassigning the variable, enforced at run time. `readonly` is a TypeScript property modifier that prevents reassigning a property, enforced only at compile time and assignable in the constructor. Both are shallow, and for deep immutable literal values I use `as const`.",
      "Follow-up: how do you make an array parameter non-mutable?",
      "  Type it as `readonly T[]` or `ReadonlyArray<T>`, which removes `push`, `pop`, `splice` and so on.",
    ],
    code: `const config = { port: 3000 };
// config = { port: 1 };      // ✗ Error: cannot assign to a const variable
config.port = 8080;           // ✓ const does not freeze the object
console.log(config.port);     // → 8080

class Point {
  readonly x: number;
  constructor(x: number) {
    this.x = x;               // ✓ allowed in the constructor
  }
}
const p = new Point(1);
// p.x = 5;                   // ✗ Error: x is a read-only property
console.log(p.x);             // → 1

function sum(list: readonly number[]) {
  // list.push(4);            // ✗ Error: push does not exist on readonly number[]
  return list.reduce((a, b) => a + b, 0);
}
console.log(sum([1, 2, 3]));  // → 6

const ROLES = ["admin", "user"] as const; // readonly ["admin", "user"]
type Role = (typeof ROLES)[number];       // "admin" | "user"
const r: Role = "admin";
console.log(r, ROLES.length); // → admin 2`,
  },
  {
    id: 'decorators',
    group: 'Classes & OOP',
    stars: 4,
    difficulty: 'Hard',
    q: 'What are decorators in TypeScript 5?',
    a: [
      "# ELI5",
      "Think of gift wrapping at a shop: you hand over a present, the wrapper adds paper and a bow, and hands back a nicer present.",
      "The present still is what it was, but now it has something extra around it.",
      "A decorator is a gift wrapper for a class or method: you put `@something` above it, and that function wraps it with extra behaviour like logging or timing.",
      "The present is your method or class, the wrapper is the decorator function, and the bow is the added behaviour.",
      "# What it is",
      "A decorator is a function you attach with the `@name` syntax above a class, method, getter/setter, field or accessor.",
      "It runs once when the class is defined (not on every call), and can observe or replace what it decorates.",
      "TypeScript 5.0 implemented the official ECMAScript decorators proposal (Stage 3), which works without any compiler flag.",
      "The older experimental decorators (enabled with `experimentalDecorators: true`) are a different, incompatible design still used by NestJS, TypeORM and Angular.",
      "Differences, row by row:",
      "  Signature: new decorators receive `(value, context)`; legacy ones receive `(target, propertyKey, descriptor)`.",
      "  Parameter decorators (`@Inject()` on constructor params): only legacy supports them.",
      "  Metadata: legacy works with `emitDecoratorMetadata` and `reflect-metadata`; new ones use `context.metadata` (TS 5.2+, needs `Symbol.metadata`).",
      "  Flag: new ones need no flag; legacy needs `experimentalDecorators`.",
      "# How it works",
      "For a method decorator in TS 5 style:",
      "  When the class is defined, JS calls your decorator with the original method and a `context` object.",
      "  `context` tells you the member's `kind` (`\"method\"`, `\"field\"`, ...), its `name`, whether it is `static` or `private`, and gives `addInitializer`.",
      "  If you return a new function, it replaces the original method on the class.",
      "  Your replacement usually calls the original with `original.call(this, ...args)` so `this` stays correct.",
      "Multiple decorators are applied bottom-up (closest to the method first), and a decorator factory like `@retry(3)` is just a function that returns a decorator.",
      "# Example walkthrough",
      "`logged` is a TS 5 method decorator: it receives `original` and `context`, and returns a wrapper.",
      "The wrapper logs the method name and arguments, calls the original, then logs the result.",
      "`timed(label)` is a decorator factory; calling it returns the actual decorator.",
      "When `svc.add(2, 3)` runs, `timed` is the outer wrapper (applied last) and `logged` is the inner one, so you see enter, exit and the timing line.",
      "# Why it matters / when to use",
      "Cross-cutting concerns (things many methods need) without repeating code: logging, timing, caching, retries, authorization checks.",
      "Frameworks: NestJS uses `@Controller`, `@Get`, `@Injectable`; TypeORM uses `@Entity`, `@Column`; class-validator uses `@IsEmail()` — all legacy decorators today.",
      "Knowing both styles helps when upgrading projects or reading framework code.",
      "# Common mistakes",
      "Mixing styles: writing new-style decorators in a project with `experimentalDecorators: true` gives confusing type errors, and vice versa.",
      "Losing `this` by calling `original(...args)` instead of `original.call(this, ...args)`.",
      "Expecting a method decorator to run on every call; the decorator runs once at class definition — only the returned wrapper runs per call.",
      "Trying to use parameter decorators with the new standard; they are not supported there.",
      "# Say this in the interview",
      "Decorators are functions applied with `@` to classes and members that can wrap or replace them at class-definition time. TypeScript 5 supports the standard ECMAScript decorators, which take `(value, context)` and need no flag, while frameworks like NestJS and TypeORM still use the legacy `experimentalDecorators` version with parameter decorators and `reflect-metadata`. I use them for cross-cutting concerns like logging, caching and validation.",
      "Follow-up: in what order do multiple decorators run?",
      "  Decorator expressions are evaluated top to bottom, but applied bottom to top, so the one closest to the member wraps first.",
      "Follow-up: what is a decorator factory?",
      "  A function that takes options and returns a decorator, e.g. `@retry(3)`.",
    ],
    code: `// TS 5 standard decorators: no experimentalDecorators flag needed
function logged<This, A extends any[], R>(
  original: (this: This, ...args: A) => R,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: A) => R>,
) {
  const name = String(context.name);
  return function (this: This, ...args: A): R {
    console.log(\`→ \${name}(\${args.join(", ")})\`);
    const result = original.call(this, ...args); // keep "this" correct
    console.log(\`← \${name} = \${result}\`);
    return result;
  };
}

// Decorator factory: takes options, returns a decorator
function timed(label: string) {
  return function <T extends (...args: any[]) => any>(original: T, _ctx: ClassMethodDecoratorContext) {
    return function (this: unknown, ...args: any[]) {
      const start = performance.now();
      const out = original.apply(this, args);
      console.log(\`\${label} took \${(performance.now() - start).toFixed(0)}ms\`);
      return out;
    } as T;
  };
}

class MathService {
  @timed("add")   // applied second (outer wrapper)
  @logged         // applied first (inner wrapper)
  add(a: number, b: number) {
    return a + b;
  }
}

new MathService().add(2, 3);
// → → add(2, 3)
// → ← add = 5
// → add took 0ms`,
  },
  {
    id: 'parameter-properties',
    group: 'Classes & OOP',
    stars: 3,
    difficulty: 'Easy',
    q: 'What are parameter properties in constructors?',
    a: [
      "# ELI5",
      "Imagine signing up for a club: normally you fill out a form, and then a clerk copies each answer into the member book.",
      "With a shortcut form, whatever you write is automatically copied into the member book — no clerk needed.",
      "Parameter properties are that shortcut: constructor arguments are automatically saved as properties on the object.",
      "The form is the constructor's parameter list, and the member book is `this`.",
      "# What it is",
      "A constructor is the function that runs when you create an object with `new`.",
      "A parameter property is a constructor parameter prefixed with `public`, `private`, `protected` or `readonly` (or a combination like `private readonly`).",
      "TypeScript then declares a class property with that name and assigns the argument to it automatically.",
      "So `constructor(private readonly repo: UserRepo) {}` is shorthand for declaring `private readonly repo: UserRepo` and writing `this.repo = repo` in the constructor.",
      "It is TypeScript-only syntax; plain JavaScript has no equivalent.",
      "# How it works",
      "At compile time, TS sees the modifier on the parameter and:",
      "  Adds a property of that name and type to the class type.",
      "  Emits `this.name = name;` at the start of the constructor body in the JavaScript output.",
      "  Applies the modifier checks (`private`, `readonly` etc.) as with a normal property.",
      "Because it emits real code, it is not allowed under `erasableSyntaxOnly` (TS 5.8) or Node's built-in type stripping, which only remove types and cannot generate assignments.",
      "# Example walkthrough",
      "`UserService` declares `private readonly repo` and `public name` as parameter properties.",
      "No property declarations or `this.x = x` lines are written, yet `svc.name` prints `users` and `findName` can use `this.repo`.",
      "`svc.repo` is a compile error because it is private.",
      "The comment shows the JavaScript TS generates, which is the long-hand version.",
      "# Why it matters / when to use",
      "Dependency injection: NestJS and Angular services almost always look like `constructor(private readonly usersRepo: UsersRepository) {}`.",
      "Small value classes and DTOs where you would otherwise write the same name three times.",
      "# Common mistakes",
      "Forgetting the modifier: a plain `constructor(repo: Repo)` does NOT create a property, so `this.repo` is undefined.",
      "Using them in projects that run TS through type stripping (Node `--experimental-strip-types`, `erasableSyntaxOnly`); write explicit fields instead.",
      "Overusing them on classes with many parameters, which makes constructors hard to read; consider an options object.",
      "# Say this in the interview",
      "Parameter properties are a TypeScript shorthand: adding `public`, `private`, `protected` or `readonly` to a constructor parameter declares a property and assigns it automatically. It is the standard dependency injection style in NestJS, like `constructor(private readonly repo: Repo)`. One caveat is that it emits real JavaScript, so it is not allowed with `erasableSyntaxOnly` or pure type-stripping runtimes.",
      "Follow-up: what does the compiled JS look like?",
      "  A normal constructor with `this.repo = repo;` lines at the top.",
    ],
    code: `class UserRepo {
  find(id: number) { return { id, name: "Ana" }; }
}

class UserService {
  // parameter properties: declare + assign in one place
  constructor(private readonly repo: UserRepo, public name: string) {}

  findName(id: number) {
    return this.repo.find(id).name;
  }
}

const svc = new UserService(new UserRepo(), "users");
console.log(svc.name);         // → users
console.log(svc.findName(1));  // → Ana
// svc.repo;                   // ✗ Error: repo is private

// Emitted JavaScript is roughly:
// class UserService {
//   constructor(repo, name) {
//     this.repo = repo;
//     this.name = name;
//   }
// }`,
  },
  {
    id: 'override-keyword',
    group: 'Classes & OOP',
    stars: 2,
    difficulty: 'Easy',
    q: 'What does the `override` keyword do?',
    a: [
      "# ELI5",
      "Imagine replacing a recipe in your mum's cookbook with your own version, and you put a note saying this replaces mum's recipe.",
      "If someone later renames mum's recipe, your note now points at nothing, and the checker shouts that there is no recipe to replace.",
      "`override` is that note: it says this method replaces a parent method, and TypeScript checks the parent method really exists.",
      "Mum's cookbook is the parent class, your version is the subclass method.",
      "# What it is",
      "Overriding means a subclass defines a method with the same name as one in its parent class, replacing the parent's version for subclass objects.",
      "`override` (TS 4.3+) is a modifier you put on such a member: `override save() { ... }`.",
      "TS errors if a member marked `override` does not exist in the base class (parent class).",
      "With `noImplicitOverride: true` in tsconfig, TS also errors if you override a member WITHOUT writing `override`.",
      "It is compile-time only; the keyword is removed from the emitted JavaScript.",
      "# How it works",
      "When TS checks a class that `extends` another:",
      "  For each member marked `override`, it looks it up in the base class; if missing, error 4113 (not declared in the base class).",
      "  With `noImplicitOverride`, for each member that matches a base member but lacks `override`, error 4114.",
      "  The method signature must still be compatible with the base signature.",
      "This catches renames: if the base method `save` is renamed to `persist`, every `override save()` breaks loudly instead of silently becoming a new unused method.",
      "# Example walkthrough",
      "`Repo` has `save()` and `log()`.",
      "`UserRepo` overrides `save()` with the `override` keyword and calls `super.save()` to keep the parent behaviour.",
      "The commented `override delete()` would fail, since `Repo` has no `delete`.",
      "Calling `new UserRepo().save()` prints the child line, then the parent line.",
      "# Why it matters / when to use",
      "Large codebases with base classes (base controllers, repositories, error classes) where renames happen.",
      "Turn on `noImplicitOverride` in new projects so every override is explicit and reviewed.",
      "# Common mistakes",
      "Thinking `override` changes runtime behaviour; overriding happens anyway, the keyword only adds a check.",
      "Using `override` on a method that implements an interface member; it only applies to members from a base class.",
      "Forgetting `super.method()` when you meant to extend, not replace, the parent behaviour.",
      "# Say this in the interview",
      "The `override` modifier marks a member that replaces one from the base class, and TypeScript errors if the base has no such member, which catches typos and renames. With `noImplicitOverride` enabled, overriding without the keyword is also an error, so every override is explicit. It is compile-time only and erased from the output.",
    ],
    code: `class Repo {
  save() { console.log("Repo.save"); }
  log() { console.log("Repo.log"); }
}

class UserRepo extends Repo {
  override save() {          // ✓ Repo has save()
    console.log("UserRepo.save");
    super.save();            // keep the parent behaviour too
  }

  // override delete() {}    // ✗ Error 4113: not declared in base class 'Repo'

  // With "noImplicitOverride": true this line is an error (missing override):
  // log() { console.log("x"); }
}

new UserRepo().save();
// → UserRepo.save
// → Repo.save`,
  },
  {
    id: 'static-members',
    group: 'Classes & OOP',
    stars: 2,
    difficulty: 'Easy',
    q: 'How do static members and static blocks work in TS classes?',
    a: [
      "# ELI5",
      "A bakery has a counter on the wall showing how many cakes the bakery has baked in total.",
      "Each cake does not carry its own copy of that counter — there is one counter for the whole bakery.",
      "Static members are like that wall counter: they belong to the class itself, not to each object made from it.",
      "A static block is like the opening-day setup routine that runs once when the bakery opens.",
      "# What it is",
      "A class is a blueprint, and each object created with `new` is an instance.",
      "Instance members (normal properties and methods) live on each instance; you access them with `obj.x`.",
      "Static members are declared with `static` and live on the class itself; you access them with `ClassName.x`.",
      "A static initialisation block, `static { ... }` (ES2022, supported by TS 4.4+), is code that runs once when the class is defined, used for complex static setup.",
      "Static members can be `private`, `protected`, `readonly` or `#private` too.",
      "Static members cannot use the class's generic type parameters, because they are shared by all instances.",
      "# How it works",
      "When the JavaScript engine evaluates the class definition:",
      "  It creates the constructor function (the class itself).",
      "  It runs static field initialisers and static blocks in the order they are written, once.",
      "  Inside static code, `this` refers to the class itself.",
      "Instances do not get static members; `new Counter().count` is undefined and is a TS error.",
      "Subclasses inherit static members through the constructor's prototype chain, so `Child.create()` works if `Parent.create` is static.",
      "# Example walkthrough",
      "`IdGenerator` has a private static counter `next` and a static readonly `prefix` set inside a static block (reading an env var once).",
      "`IdGenerator.create()` increments the shared counter, so two calls print `id-1` and `id-2`.",
      "`Config.instance` is a classic singleton: a static field that holds the only instance, created lazily by a static method.",
      "Comparing two `getInstance()` results prints `true` because they are the same object.",
      "# Why it matters / when to use",
      "Factory methods (`User.fromRow(row)`), constants (`HttpStatus.OK`), caches and connection pools shared across instances.",
      "Singletons for config or DB clients (though modules often do this more simply).",
      "Static blocks for one-time setup like reading environment variables or building lookup tables.",
      "# Common mistakes",
      "Accessing a static through `this` inside an instance method; use `ClassName.x` (or `this.constructor` with care).",
      "Trying to use the class's type parameter `T` in a static member — not allowed.",
      "Putting per-request data in static fields on a server, which leaks between users because statics are shared across all requests.",
      "# Say this in the interview",
      "Static members belong to the class itself rather than to instances, so they are shared and accessed as `ClassName.member`. They are great for factory methods, constants and caches, and a `static { }` block runs one-time setup when the class is defined. In a server I am careful not to store per-request state in statics since every request shares them.",
      "Follow-up: are statics inherited?",
      "  Yes, a subclass constructor inherits them through the prototype chain, and inside a static method `this` refers to the class it was called on.",
    ],
    code: `class IdGenerator {
  private static next = 1;
  static readonly prefix: string;

  // static block: runs once, when the class is defined
  static {
    (this as { prefix: string }).prefix = process.env.ID_PREFIX ?? "id";
  }

  static create() {
    return \`\${IdGenerator.prefix}-\${IdGenerator.next++}\`;
  }
}

console.log(IdGenerator.create()); // → id-1
console.log(IdGenerator.create()); // → id-2 (shared counter)
// new IdGenerator().create();     // ✗ Error: create is static

class Config {
  private static instance?: Config;
  private constructor(public env: string) {}  // no "new" from outside
  static getInstance() {
    return (Config.instance ??= new Config("prod"));
  }
}

const a = Config.getInstance();
const b = Config.getInstance();
console.log(a === b, a.env);       // → true prod`,
  },
  {
    id: 'polymorphic-this',
    group: 'Classes & OOP',
    stars: 1,
    difficulty: 'Medium',
    q: 'What is the polymorphic `this` type?',
    a: [
      "# ELI5",
      "Imagine a toy builder kit where every step says return the thing you are building so you can keep going.",
      "If you are building a car with a car kit, you get back a car, not a generic vehicle — so the car-only steps are still available.",
      "The polymorphic `this` type says: return whatever specific kind of object I actually am.",
      "The kit is a base class, the car kit is a subclass, and returning the car is returning `this`.",
      "# What it is",
      "Polymorphic means taking many forms; here it means the type changes depending on which subclass you use.",
      "In a class, you can write `this` as a type (for example as a return type): `setX(): this`.",
      "It means the type of the current instance, which for a subclass object is the subclass type, not the base class.",
      "It is mainly used for fluent APIs (method chaining, where each method returns the object so you can call the next one).",
      "It also powers type guards like `isAdmin(): this is Admin` on classes.",
      "# How it works",
      "When TS checks a call like `child.method()`:",
      "  It looks at the method's declared return type `this`.",
      "  It replaces `this` with the type of the object the method was called on (here, the subclass).",
      "  So chaining keeps access to subclass-only methods.",
      "If the base method instead declared a return type of the base class name, chaining would lose the subclass methods.",
      "At run time, the method simply returns the same object with `return this;`.",
      "# Example walkthrough",
      "`QueryBuilder` has `where` and `limit`, both returning `this`.",
      "`UserQuery` extends it and adds `activeOnly`.",
      "`new UserQuery().where(\"age > 18\").activeOnly().limit(10)` type-checks because `where` returns `UserQuery`, not `QueryBuilder`.",
      "`build()` prints the final SQL-like string.",
      "# Why it matters / when to use",
      "Builder classes: query builders, HTTP request builders, config builders, test data builders.",
      "Base classes whose methods should return the subclass type for further calls.",
      "# Common mistakes",
      "Annotating the return type as the base class name, which breaks chaining for subclasses; use `this`.",
      "Returning a new instance of the base class instead of `this`, which fails the `this` return type check.",
      "# Say this in the interview",
      "The polymorphic `this` type refers to the type of the current instance, so in a subclass it becomes the subclass type. I use it as the return type in fluent builder methods so chaining keeps subclass-specific methods available. At run time it is just `return this`.",
    ],
    code: `class QueryBuilder {
  protected parts: string[] = [];
  where(cond: string): this {      // returns "whatever class I am"
    this.parts.push(\`WHERE \${cond}\`);
    return this;
  }
  limit(n: number): this {
    this.parts.push(\`LIMIT \${n}\`);
    return this;
  }
  build() {
    return \`SELECT * FROM users \${this.parts.join(" ")}\`;
  }
}

class UserQuery extends QueryBuilder {
  activeOnly(): this {
    this.parts.push("AND active = true");
    return this;
  }
}

const sql = new UserQuery()
  .where("age > 18")   // type: UserQuery (not QueryBuilder)
  .activeOnly()        // ✓ still available thanks to "this"
  .limit(10)
  .build();

console.log(sql);
// → SELECT * FROM users WHERE age > 18 AND active = true LIMIT 10`,
  },
  {
    id: 'tsconfig-key-options',
    group: 'Modules, Declarations & Config',
    stars: 5,
    difficulty: 'Medium',
    q: 'What are the most important `tsconfig.json` options?',
    a: [
      "# ELI5",
      "Think of `tsconfig.json` as the settings page for a strict school teacher who marks your homework.",
      "You tell the teacher how strict to be, which homework to mark, and which language version to translate your answers into.",
      "Without the settings page, the teacher uses lenient defaults and lets many mistakes slide.",
      "The teacher is the TypeScript compiler (`tsc`), the homework is your `.ts` files, and the translation is the JavaScript output.",
      "# What it is",
      "`tsconfig.json` is the file in your project root that tells `tsc` and your editor how to type-check and compile the project.",
      "It has top-level keys like `compilerOptions` (the settings), `include`/`exclude` (which files) and `references` (linked sub-projects).",
      "The options that matter most in interviews and real backends:",
      "  `strict: true` — turns on the whole family of strict checks; always enable it.",
      "  `target` — which JavaScript version to output, e.g. `ES2022`; newer targets mean less transformed code.",
      "  `module` — which module system to output; for Node use `NodeNext` (or `Node20`/`Node16`), for bundlers `ESNext` or `Preserve`.",
      "  `moduleResolution` — how imports are found; `NodeNext` for Node, `Bundler` for Vite/webpack/Next.js.",
      "  `outDir` / `rootDir` — where compiled JS goes, and which folder is the source root.",
      "  `lib` — which built-in type definitions exist (e.g. `ES2023`, `DOM`).",
      "  `types` — which `@types` packages are loaded globally, e.g. `[\"node\"]`.",
      "  `esModuleInterop` — makes default imports from CommonJS packages work.",
      "  `skipLibCheck` — skip type-checking `.d.ts` files in `node_modules` for faster builds.",
      "  `noEmit` — only type-check, do not produce files (used when a bundler or `tsx` runs the code).",
      "  `declaration` / `sourceMap` — produce `.d.ts` files for libraries / maps for debugging.",
      "  `paths` — import aliases like `@/lib/*`.",
      "  `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, `isolatedModules` — extra safety and tooling compatibility.",
      "# How it works",
      "When you run `tsc` (or open the editor):",
      "  It finds the nearest `tsconfig.json` and merges any file it `extends` (e.g. `@tsconfig/node22`).",
      "  It collects files from `include` minus `exclude` and follows their imports.",
      "  It type-checks using `strict`, `lib` and `types` settings.",
      "  Unless `noEmit` is set, it writes JavaScript to `outDir` using `target` and `module`.",
      "`strict` itself enables `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `noImplicitThis`, `alwaysStrict` and `useUnknownInCatchVariables`.",
      "# Example walkthrough",
      "The snippet is a solid Node 22 backend config.",
      "`target: ES2023` and `lib: [\"ES2023\"]` match what Node 22 supports natively.",
      "`module` and `moduleResolution` are `NodeNext`, so TS follows Node's real ESM/CJS rules based on `package.json` `type`.",
      "`strict` plus `noUncheckedIndexedAccess` gives maximum safety.",
      "`outDir: dist` and `rootDir: src` put `src/server.ts` at `dist/server.js`.",
      "`verbatimModuleSyntax` keeps imports predictable and forces `import type` for type-only imports.",
      "# Why it matters / when to use",
      "Wrong `module`/`moduleResolution` is the top cause of import errors like ERR_MODULE_NOT_FOUND or `require is not defined` in Node projects.",
      "`strict` catches null bugs and implicit `any` before they reach production.",
      "A shared base config (via `extends`) keeps many services in a monorepo consistent.",
      "# Common mistakes",
      "Leaving `strict` off in a new project and then struggling to turn it on later.",
      "Using `moduleResolution: node` (now called `node10`) for modern Node ESM; use `NodeNext`.",
      "Expecting `paths` aliases to work at run time; `tsc` does not rewrite them, so you need a bundler, `tsx`, or Node subpath imports (`#lib/*`).",
      "Mixing `DOM` into `lib` for a backend, which lets browser-only globals like `window` type-check by mistake.",
      "# Say this in the interview",
      "The essentials are `strict: true` for safety, `target` and `lib` for which JavaScript features you emit and can use, `module` and `moduleResolution` set to `NodeNext` for Node or `Bundler` for front-end bundlers, and `outDir`/`rootDir` for output layout. I also commonly add `skipLibCheck`, `esModuleInterop`, `noUncheckedIndexedAccess` and `verbatimModuleSyntax`, and extend a shared base like `@tsconfig/node22`.",
      "Follow-up: what does `strict` include?",
      "  `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, `strictPropertyInitialization`, `useUnknownInCatchVariables` and more.",
      "Follow-up: when do you use `noEmit`?",
      "  When another tool (esbuild, tsx, Next.js, Vite) does the compiling and `tsc` is only the type checker.",
    ],
    code: `// tsconfig.json for a Node 22 backend (comments are allowed in tsconfig)
{
  "compilerOptions": {
    "target": "ES2023",              // JS version to emit
    "lib": ["ES2023"],               // built-in APIs available (no DOM on a server)
    "module": "NodeNext",            // follow Node's ESM/CJS rules
    "moduleResolution": "NodeNext",  // resolve imports like Node does
    "types": ["node"],               // load @types/node globally

    "strict": true,                  // noImplicitAny, strictNullChecks, ...
    "noUncheckedIndexedAccess": true,// arr[i] is T | undefined
    "verbatimModuleSyntax": true,    // require "import type" for types

    "rootDir": "src",                // src/server.ts ...
    "outDir": "dist",                // ... compiles to dist/server.js
    "sourceMap": true,               // stack traces point at .ts lines
    "esModuleInterop": true,         // default-import CommonJS packages
    "skipLibCheck": true             // faster: skip checking node_modules .d.ts
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
// Run: npx tsc        → type-checks and writes dist/
//      npx tsc --noEmit → type-check only (CI)`,
  },
  {
    id: 'how-ts-compiles',
    group: 'Modules, Declarations & Config',
    stars: 4,
    difficulty: 'Medium',
    q: 'How is TypeScript compiled and what is type erasure?',
    a: [
      "# ELI5",
      "Imagine writing a letter in pencil with little notes in the margin like this word must be a name.",
      "A proofreader checks the letter using the margin notes, then erases all the notes before posting it.",
      "The person who receives the letter never sees the notes; they only get the clean letter.",
      "The letter is your JavaScript, the margin notes are TypeScript types, the proofreader is the type checker, and erasing is type erasure.",
      "# What it is",
      "Browsers and Node cannot run TypeScript's type syntax directly in general, so TS must be turned into plain JavaScript first.",
      "Compiling (also called transpiling — translating source code to another source language) has two separate jobs:",
      "  Type checking — finding type errors (only `tsc` and the editor's language service do this).",
      "  Emitting — producing JavaScript by removing types and optionally converting newer syntax for older targets.",
      "Type erasure means all type annotations, interfaces, type aliases and generics are deleted from the output; none of them exist at run time.",
      "A few TS features are not just types and DO emit code: `enum`, `namespace`, parameter properties, and legacy decorators with metadata.",
      "Tools: `tsc` (checks and emits), and fast emit-only tools — esbuild, SWC, Babel, `tsx` — which strip types without checking them.",
      "Node 22.18+ and Node 23.6+ can run `.ts` files directly by stripping types (type stripping), but they do not type-check and do not support enums or parameter properties by default.",
      "# How it works",
      "Inside `tsc`, step by step:",
      "  Scanner: reads the text and splits it into tokens (words and symbols).",
      "  Parser: builds an AST — abstract syntax tree, a tree data structure representing the code.",
      "  Binder: links names to their declarations (which `x` refers to which variable).",
      "  Checker: computes and compares types, reporting errors.",
      "  Emitter: walks the AST, drops type syntax, down-levels syntax for the `target`, and writes `.js`, `.d.ts` and `.map` files.",
      "By default, `tsc` still emits JavaScript even if there are type errors (unless `noEmitOnError` is set).",
      "Because emit-only tools handle one file at a time, `isolatedModules` is recommended so every file can be compiled without knowing the others' types.",
      "# Example walkthrough",
      "The TS input has an interface, typed parameters, a generic and a regular `enum`.",
      "The commented JS output shows the interface and all annotations gone.",
      "The `enum Role` remains as a real object because enums emit code.",
      "Running the output prints `Hello Ana` and `1`.",
      "The final line shows why `instanceof User` is impossible: `User` does not exist in the output.",
      "# Why it matters / when to use",
      "Explains why you must validate external data (HTTP bodies, env vars, DB rows) at run time — types cannot help there.",
      "Choosing a build setup: `tsc --noEmit` in CI for checking plus esbuild/tsx/SWC for speed is a common backend pattern.",
      "Understanding which features are safe with type-stripping runtimes (`erasableSyntaxOnly`).",
      "# Common mistakes",
      "Assuming a fast tool like `tsx` or esbuild catches type errors; it does not, so run `tsc --noEmit` separately.",
      "Trying to use types at run time (`typeof x === MyInterface`); they are gone.",
      "Deploying even though `tsc` reported errors, because JS was still emitted; enable `noEmitOnError` or fail CI on errors.",
      "# Say this in the interview",
      "TypeScript compilation has two parts: the checker analyses types and reports errors, and the emitter outputs JavaScript with all type syntax erased and syntax down-levelled to the target. Erasure means interfaces and annotations do not exist at run time, so external data still needs runtime validation. In practice I use tools like esbuild or tsx to strip types quickly and run `tsc --noEmit` in CI to type-check.",
      "Follow-up: which TS features emit code?",
      "  Enums, namespaces, parameter properties and legacy decorators (with `emitDecoratorMetadata`).",
      "Follow-up: does `tsc` stop emitting on errors?",
      "  Not by default; set `noEmitOnError: true` to block output when there are errors.",
    ],
    code: `// ---------- input: app.ts ----------
interface User { name: string; age: number }

enum Role { Guest, Admin }               // enums emit real code

function greet<T extends User>(u: T): string {
  return "Hello " + u.name;
}

console.log(greet({ name: "Ana", age: 30 })); // → Hello Ana
console.log(Role.Admin);                       // → 1

// ---------- output: app.js (target ES2022) ----------
// var Role;
// (function (Role) {
//   Role[Role["Guest"] = 0] = "Guest";
//   Role[Role["Admin"] = 1] = "Admin";
// })(Role || (Role = {}));
// function greet(u) {
//   return "Hello " + u.name;
// }
// console.log(greet({ name: "Ana", age: 30 }));
// console.log(Role.Admin);
//
// The interface, ": string", "<T extends User>" are all erased,
// so "x instanceof User" is impossible: User does not exist at run time.`,
  },
  {
    id: 'declaration-files',
    group: 'Modules, Declarations & Config',
    stars: 4,
    difficulty: 'Medium',
    q: 'What are `.d.ts` declaration files?',
    a: [
      "# ELI5",
      "Think of the menu at a restaurant: it tells you what dishes exist and what comes in them, but it is not the food.",
      "You can order confidently from the menu without going into the kitchen.",
      "A `.d.ts` file is a menu for JavaScript code: it lists what functions and objects exist and their types, but contains no actual code.",
      "The kitchen is the `.js` file that really runs, and TypeScript reads the menu to check your orders.",
      "# What it is",
      "A declaration file (extension `.d.ts`) contains only type information: function signatures, interfaces, types, classes without bodies, module declarations.",
      "It produces no JavaScript; it describes JavaScript that exists somewhere else.",
      "Uses:",
      "  Libraries written in TS ship `.d.ts` files next to their `.js` so users get types (`tsc` generates them with `declaration: true`).",
      "  Plain-JavaScript libraries get types from community `@types/*` packages (DefinitelyTyped).",
      "  Your own project uses them to describe globals, environment variables, untyped modules or non-code imports like `*.svg`.",
      "Built-in types like `Array`, `Promise` and DOM APIs come from `lib.*.d.ts` files shipped with TypeScript.",
      "# How it works",
      "When you `import x from \"pkg\"`, TS looks for types in this order (roughly):",
      "  The `types` (or `exports` `types` condition) field in the package's `package.json`.",
      "  A `.d.ts` file next to the resolved `.js` file (`index.d.ts` beside `index.js`).",
      "  A matching `@types/pkg` package in `node_modules/@types`.",
      "  An ambient `declare module \"pkg\"` you wrote in any included `.d.ts` file.",
      "If none is found, you get error 7016: Could not find a declaration file for module.",
      "A `.d.ts` file without any top-level `import`/`export` is a global script: its declarations become global. Adding an `export` makes it a module, so globals then need `declare global { }`.",
      "# Example walkthrough",
      "`math.js` is plain JavaScript with no types.",
      "`math.d.ts` sits next to it and declares `add` and `PI` with types but no bodies.",
      "`app.ts` imports from `./math.js`; TS uses the `.d.ts` for checking, and Node runs the `.js`.",
      "`add(2, 3)` prints `5`, while `add(\"2\", 3)` is a compile error thanks to the declaration.",
      "`types/assets.d.ts` shows a wildcard module declaration so importing `.svg` files type-checks.",
      "# Why it matters / when to use",
      "Publishing an npm package written in TS: set `declaration: true` and point `types` in `package.json` to the output.",
      "Using an old JS library without types: write a small `declare module` file instead of falling back to `any`.",
      "Typing globals, `process.env` and framework extensions (Express `Request.user`).",
      "# Common mistakes",
      "Putting real code (function bodies, values) in a `.d.ts` file — not allowed.",
      "Adding an `import` at the top of a globals file and wondering why the globals disappeared; wrap them in `declare global { }`.",
      "Declaration file not picked up because it is outside `include` in tsconfig.",
      "Hand-writing `.d.ts` files for your own TS code; let `tsc --declaration` generate them.",
      "# Say this in the interview",
      "A `.d.ts` file contains only type declarations — no runtime code — describing JavaScript that exists elsewhere. Libraries ship them so consumers get types, `@types` packages provide them for plain JS libraries, and in apps I use them to type globals, env variables or untyped modules with `declare module`. `tsc` generates them automatically with `declaration: true`.",
      "Follow-up: what does `skipLibCheck` do?",
      "  Skips type-checking all `.d.ts` files, which speeds up builds and avoids errors from conflicting library types.",
    ],
    code: `// ---- math.js (plain JavaScript, no types) ----
// export function add(a, b) { return a + b; }
// export const PI = 3.14159;

// ---- math.d.ts (sits next to math.js: types only, no code) ----
// export declare function add(a: number, b: number): number;
// export declare const PI: number;

// ---- types/assets.d.ts (let TS accept non-code imports) ----
// declare module "*.svg" {
//   const url: string;
//   export default url;
// }

// ---- app.ts ----
// import { add, PI } from "./math.js";
// console.log(add(2, 3));   // → 5   (types come from math.d.ts)
// console.log(PI.toFixed(2)); // → 3.14
// add("2", 3);              // ✗ Error: string is not assignable to number

// Generate .d.ts for your own library:
// tsconfig.json → { "compilerOptions": { "declaration": true, "outDir": "dist" } }
// package.json  → { "types": "./dist/index.d.ts" }`,
  },
  {
    id: 'declare-keyword',
    group: 'Modules, Declarations & Config',
    stars: 3,
    difficulty: 'Medium',
    q: 'What does the `declare` keyword do (ambient declarations)?',
    a: [
      "# ELI5",
      "Imagine telling a new teacher: there is a student named Sam in this class, trust me, he exists — he is just sitting in another room right now.",
      "The teacher writes Sam on the attendance list without seeing him, and stops asking who Sam is.",
      "`declare` tells TypeScript: this thing exists at run time, created somewhere else, here is its type — do not create it, just trust me.",
      "Sam is a global variable or module provided by a script tag, the runtime or a build tool.",
      "# What it is",
      "`declare` creates an ambient declaration — a type-only statement that says a value, function, class, module or namespace exists, without emitting any JavaScript for it.",
      "Ambient means surrounding: it describes things that already exist in the environment.",
      "Forms you will see:",
      "  `declare const VERSION: string;` — a global constant injected by a bundler.",
      "  `declare function gtag(...args: unknown[]): void;` — a function from a script tag.",
      "  `declare module \"legacy-lib\" { ... }` — types for an untyped package.",
      "  `declare global { ... }` — add to the global scope from inside a module file.",
      "  `declare` on a class field — tell TS a property exists without emitting an initialiser.",
      "Everything in a `.d.ts` file is implicitly ambient, so `declare` is often written there.",
      "# How it works",
      "The checker adds the declared name and type to its symbol table (its list of known names).",
      "The emitter skips the statement completely, so nothing appears in the `.js` output.",
      "If the thing does not actually exist at run time, you get a `ReferenceError` — TS trusted you.",
      "`declare module \"x\"` without a body (`declare module \"x\";`) is a shorthand that types the whole module as `any`.",
      "# Example walkthrough",
      "`__APP_VERSION__` is declared as a global string that a bundler (like Vite `define`) replaces at build time; here we define it on `globalThis` to simulate that.",
      "`declare global` adds `requestId` to the global scope type for this module.",
      "`declare module \"legacy-slugify\"` describes an untyped package; the import is commented since the package is imaginary.",
      "Logging prints the version and the global request id.",
      "# Why it matters / when to use",
      "Typing values injected by build tools (`process.env.NODE_ENV` replacements, `__DEV__` flags).",
      "Typing globals from CDN scripts (analytics, payment SDKs) and legacy JS libraries without types.",
      "Augmenting global types in Node like `globalThis.prisma` for dev hot-reload caching.",
      "# Common mistakes",
      "Using `declare` to silence errors for things that do not exist at run time, causing crashes.",
      "Putting `declare global` in a file that is not a module (no import/export); it must be in a module, so add `export {}`.",
      "Using `declare module \"pkg\";` (all `any`) permanently instead of writing real types or installing `@types/pkg`.",
      "# Say this in the interview",
      "`declare` creates an ambient declaration: it tells TypeScript that a variable, function, module or global exists at run time with a given type, but emits no JavaScript. I use it for globals injected by bundlers or script tags, `declare module` for untyped packages, and `declare global` to extend global types from a module. TS trusts it completely, so a wrong declaration only fails at run time.",
      "Follow-up: what is the difference between `declare module \"x\"` and `declare module \"x\" { ... }`?",
      "  The first makes everything from that module `any`; the second gives it real types.",
    ],
    code: `// Tell TS these exist at run time (no JS is emitted for "declare" lines)
declare const __APP_VERSION__: string;          // injected by the bundler

declare global {
  var requestId: string | undefined;            // add to globalThis' type
}

declare module "legacy-slugify" {               // types for an untyped package
  export default function slugify(s: string): string;
}

// Simulate what the bundler / runtime would provide
(globalThis as any).__APP_VERSION__ = "1.4.0";
globalThis.requestId = "req-42";

console.log(__APP_VERSION__);       // → 1.4.0
console.log(globalThis.requestId);  // → req-42

// import slugify from "legacy-slugify";  // would now type-check
// slugify(123);                         // ✗ Error: number not assignable to string

export {}; // makes this file a module so "declare global" is allowed`,
  },
  {
    id: 'module-augmentation',
    group: 'Modules, Declarations & Config',
    stars: 3,
    difficulty: 'Hard',
    q: 'What is module augmentation? How do you add a property to Express `Request`?',
    a: [
      "# ELI5",
      "Imagine a shared school notebook that lists what every student carries: bag, lunchbox, pencil.",
      "Your class starts giving every student a library card, so you add one line: and a library card.",
      "You do not rewrite the notebook; you just add a line, and now everyone knows students carry a library card.",
      "Module augmentation adds a property to a type defined in a library (like Express `Request`) without editing the library.",
      "# What it is",
      "Module augmentation is re-opening a type from another module and adding members to it.",
      "It relies on declaration merging — when TypeScript sees two `interface` declarations with the same name in the same scope, it merges them into one.",
      "You write `declare module \"some-module\" { interface Thing { newProp: X } }` in a file that is itself a module (has an import or export).",
      "For Express, the `Request` interface is defined in the `express-serve-static-core` module and also re-exported via a global `Express` namespace.",
      "Common ways to add `req.user`:",
      "  Augment the global namespace: `declare global { namespace Express { interface Request { user?: User } } }`.",
      "  Or augment the core module: `declare module \"express-serve-static-core\" { interface Request { user?: User } }`.",
      "# How it works",
      "Step by step:",
      "  Create a file such as `src/types/express.d.ts` and make sure tsconfig `include` covers it.",
      "  Add `export {}` or an import so the file is a module (required for augmentation).",
      "  Inside `declare global` or `declare module \"...\"`, re-declare the interface with only the new members.",
      "  TS merges your members into the library's interface everywhere in the project.",
      "Only interfaces (and namespaces) merge; `type` aliases cannot be augmented.",
      "It is purely type-level: you still need middleware that actually sets `req.user` at run time.",
      "# Example walkthrough",
      "The `declare global` block adds `user?: { id: string; role: string }` to Express `Request`.",
      "`auth` middleware sets `req.user` after checking a header — this is the runtime part.",
      "The `/me` handler can read `req.user?.id` with full autocomplete and no casts.",
      "A request with header `x-user: 42` responds with `{ id: \"42\", role: \"user\" }`.",
      "# Why it matters / when to use",
      "Authentication middleware attaching `user`, `session` or `tenantId` to requests.",
      "Adding custom properties to Fastify (`FastifyRequest`), Socket.IO or Next.js types.",
      "Extending third-party config or theme interfaces (e.g. a UI library theme).",
      "# Common mistakes",
      "Forgetting `export {}` so the file is a script; `declare global` then errors, or `declare module` replaces the module instead of augmenting it.",
      "The file not being included by tsconfig or by `ts-node`/`tsx` (ts-node may need `files: true`), so the type is silently missing.",
      "Making `user` required (`user: User`) when it only exists after the auth middleware; keep it optional or narrow it.",
      "Trying to augment a `type` alias; only interfaces merge.",
      "# Say this in the interview",
      "Module augmentation reopens an interface from another module with `declare module` or `declare global` and relies on declaration merging to add members. For Express I create a `.d.ts` that augments `Express.Request` with an optional `user`, make sure it is a module with `export {}` and included in tsconfig, and then the auth middleware sets it at run time. It only changes types, never behaviour.",
      "Follow-up: what is declaration merging?",
      "  Same-name interfaces (and namespaces, and enums) in the same scope combine into a single declaration.",
    ],
    code: `// src/types/express.d.ts
// import "express";            // any import/export makes this a module
// declare global {
//   namespace Express {
//     interface Request {
//       user?: { id: string; role: string };   // merged into Express Request
//     }
//   }
// }
// export {};

// src/server.ts
import express, { type Request, type Response, type NextFunction } from "express";

const app = express();

function auth(req: Request, res: Response, next: NextFunction) {
  const id = req.header("x-user");
  if (!id) return res.status(401).json({ error: "unauthorized" });
  req.user = { id, role: "user" };           // runtime part: actually set it
  next();
}

app.get("/me", auth, (req, res) => {
  res.json(req.user);                        // typed: { id; role } | undefined
});

app.listen(3000);
// curl -H "x-user: 42" localhost:3000/me
// → {"id":"42","role":"user"}`,
  },
  {
    id: 'definitely-typed',
    group: 'Modules, Declarations & Config',
    stars: 3,
    difficulty: 'Easy',
    q: 'What is DefinitelyTyped and `@types/*`?',
    a: [
      "# ELI5",
      "Imagine a toy that comes without instructions, so volunteers write instruction booklets for it and put them all in one big public library.",
      "When you buy the toy, you fetch its booklet from the library by the toy's name.",
      "DefinitelyTyped is that library of type booklets, and `@types/toyname` is how you fetch one with npm.",
      "The toy is a JavaScript package, and the booklet is its `.d.ts` type declarations.",
      "# What it is",
      "DefinitelyTyped is a huge community GitHub repository (github.com/DefinitelyTyped/DefinitelyTyped) containing type declarations for JavaScript packages that do not ship their own types.",
      "Each package's types are published to npm under the `@types` scope, e.g. `@types/express` for `express`, `@types/node` for Node's built-in modules.",
      "Scoped package names like `@types/babel__core` represent the scoped package `@babel/core` (the `@` and `/` are replaced by a double underscore).",
      "Many modern packages ship their own types (Zod, Prisma, Axios, Fastify), so they do not need an `@types` package.",
      "# How it works",
      "You install types as dev dependencies: `npm i -D @types/express`.",
      "TypeScript automatically includes every package under `node_modules/@types` as global or module types.",
      "  If tsconfig has a `types` array (e.g. `[\"node\", \"jest\"]`), only those listed are auto-included as globals.",
      "  Module imports like `import express from \"express\"` still find `@types/express` even if not listed in `types`.",
      "The `@types` version usually tracks the library's major and minor version, e.g. `@types/express@5` for Express 5.",
      "# Example walkthrough",
      "The shell lines show installing Express plus its types, and Node's types.",
      "Without `@types/express`, importing Express gives error 7016 (could not find a declaration file) under `strict`.",
      "With it, `req`, `res` and `app` are fully typed, and the handler compiles.",
      "Checking whether a package bundles types: look for a `types`/`typings` field or `.d.ts` files in its folder, or a TS icon on npmjs.com.",
      "# Why it matters / when to use",
      "Almost every Node backend installs `@types/node`, plus `@types/express`, `@types/jest`, `@types/pg` and similar.",
      "Knowing it helps fix the common could-not-find-declaration-file error quickly.",
      "# Common mistakes",
      "Installing `@types/*` as a runtime dependency; put them in `devDependencies` (unless you publish a library whose public types depend on them).",
      "Mismatched versions (e.g. `@types/express@4` with Express 5), causing wrong signatures; match majors.",
      "Installing `@types/x` for a package that already ships types, which can cause conflicts — check first.",
      "Setting `types: []` in tsconfig and then wondering why `process` or `describe` is not found.",
      "# Say this in the interview",
      "DefinitelyTyped is the community repository of type declarations for JavaScript libraries that do not ship their own, published on npm under the `@types` scope. I install them as dev dependencies, e.g. `@types/node` and `@types/express`, and TypeScript picks them up automatically. Many modern libraries bundle types themselves, so I only add `@types` when the package lacks them, and I keep versions aligned with the library.",
      "Follow-up: what if no types exist at all?",
      "  Write a small `declare module \"pkg\" { ... }` file, or `declare module \"pkg\";` as a temporary `any` fallback.",
    ],
    code: `# Install the library and its community types (types are dev-only)
npm i express
npm i -D typescript @types/express @types/node

# Does a package already ship types? Check its package.json:
npm view zod types        # → index.d.cts (bundled: no @types needed)
npm view express types    # → (empty)     → use @types/express

# tsconfig.json — restrict which @types become GLOBAL (optional)
# { "compilerOptions": { "types": ["node"] } }

# src/app.ts
# import express from "express";        // types from node_modules/@types/express
# const app = express();
# app.get("/", (req, res) => res.send("ok")); // req/res fully typed
# Without @types/express (strict mode):
# ✗ error TS7016: Could not find a declaration file for module 'express'`,
  },
  {
    id: 'module-resolution',
    group: 'Modules, Declarations & Config',
    stars: 3,
    difficulty: 'Hard',
    q: 'What are the `moduleResolution` modes and which should you use?',
    a: [
      "# ELI5",
      "Imagine giving a delivery driver an address: some drivers follow the official city map strictly, others take shortcuts the local shop owner taught them.",
      "If the driver follows a different map than the one the real delivery truck uses, packages end up at the wrong door.",
      "`moduleResolution` tells TypeScript which map to use when it looks up an `import`, so it matches the tool that actually runs your code.",
      "The address is the import path, the driver is TypeScript, and the delivery truck is Node or your bundler.",
      "# What it is",
      "Module resolution is the process of turning an import string like `\"./utils.js\"` or `\"express\"` into an actual file on disk.",
      "The `moduleResolution` option chooses which algorithm (rules) TypeScript uses so its checking matches your runtime.",
      "The modes:",
      "  `node16` / `nodenext` — Node's real rules: ESM files need file extensions in relative imports, and package.json `exports` and `imports` are respected. Use for code run by Node.",
      "  `bundler` (TS 5.0+) — for Vite, webpack, esbuild, Next.js: respects `exports` but allows extensionless relative imports.",
      "  `node10` (old name `node`) — legacy CommonJS-era rules, ignores `exports`; avoid in new projects.",
      "  `classic` — very old pre-Node TS rules; never use.",
      "Pair them: `module: NodeNext` with `moduleResolution: NodeNext`; `module: ESNext` or `Preserve` with `moduleResolution: Bundler`.",
      "# How it works",
      "For a relative import in NodeNext mode inside an ES module:",
      "  TS requires the extension you will have at run time — you write `./utils.js` even though the source file is `utils.ts`, and TS maps it to `utils.ts`.",
      "  Whether a file is ESM or CommonJS depends on its extension (`.mts`/`.cts`) or the nearest package.json `type` field.",
      "For a package import like `\"zod\"`:",
      "  TS reads the package's `exports` map, picks conditions such as `import`, `require`, `types`, `node`, and finds the matching `.d.ts`.",
      "  If a subpath is not listed in `exports`, the import is an error — exactly as Node would reject it.",
      "Bundler mode follows `exports` too but does not demand extensions, matching bundler behaviour.",
      "# Example walkthrough",
      "The tsconfig snippet uses NodeNext for a Node backend with `\"type\": \"module\"` in package.json.",
      "`import { sum } from \"./math.js\"` is correct: TS finds `math.ts`, Node later loads `math.js` from `dist`.",
      "`import { sum } from \"./math\"` fails in NodeNext (error 2835 asks for an explicit extension), which matches the ERR_MODULE_NOT_FOUND Node would throw.",
      "In a Next.js or Vite app you would choose Bundler instead, and extensionless imports are fine.",
      "# Why it matters / when to use",
      "Mismatched resolution is a top source of it compiles but crashes on start errors in Node ESM projects.",
      "Library authors must get `exports` and `types` right, and `NodeNext` reveals mistakes consumers will hit.",
      "Rule of thumb: code Node runs directly → `NodeNext`; code a bundler processes → `Bundler`.",
      "# Common mistakes",
      "Using `moduleResolution: node` (node10) in an ESM Node project, so TS accepts imports Node will reject.",
      "Writing `./math.ts` in imports; write `./math.js`, or enable `allowImportingTsExtensions` / `rewriteRelativeImportExtensions` (TS 5.7) where supported.",
      "Choosing `Bundler` for a Node server compiled by plain `tsc`, which allows extensionless imports that fail at run time.",
      "# Say this in the interview",
      "`moduleResolution` decides how TypeScript turns import specifiers into files, and it should mirror the runtime. For code Node runs I use `NodeNext`, which enforces Node's ESM rules like explicit `.js` extensions and package `exports`; for code going through Vite, webpack or Next.js I use `Bundler`. `node10` and `classic` are legacy and should not be used for new projects.",
      "Follow-up: why `.js` in a `.ts` import?",
      "  Because TS does not rewrite import paths by default; the emitted file will be `.js`, so the import must already point there.",
    ],
    code: `// package.json
// { "type": "module" }

// tsconfig.json (Node backend run by node itself)
// {
//   "compilerOptions": {
//     "module": "NodeNext",
//     "moduleResolution": "NodeNext",
//     "outDir": "dist"
//   }
// }
// Frontend / Next.js / Vite would use instead:
//   "module": "ESNext", "moduleResolution": "Bundler"

// src/math.ts
export function sum(a: number, b: number) {
  return a + b;
}

// src/index.ts
// import { sum } from "./math.js";  // ✓ NodeNext: use the RUNTIME extension
// import { sum } from "./math";     // ✗ TS2835: relative imports need an explicit extension
// import { z } from "zod";          // resolved via zod's package.json "exports"
// console.log(sum(2, 3));           // → 5

console.log(sum(2, 3)); // → 5`,
  },
  {
    id: 'esm-cjs-interop',
    group: 'Modules, Declarations & Config',
    stars: 3,
    difficulty: 'Medium',
    q: 'What do `esModuleInterop` and `allowSyntheticDefaultImports` do?',
    a: [
      "# ELI5",
      "Imagine two countries with different plug sockets: old-style (CommonJS) and new-style (ES modules).",
      "If you bring a new-style plug to an old-style socket, it will not fit unless you use an adapter.",
      "`esModuleInterop` is that adapter: it lets new-style `import x from` work with old-style packages that use `module.exports`.",
      "`allowSyntheticDefaultImports` just tells the type checker that the adapter exists, so it stops complaining.",
      "# What it is",
      "CommonJS (CJS) is Node's original module system: `const x = require(\"x\")` and `module.exports = ...`.",
      "ES modules (ESM) are the standard system: `import x from \"x\"` and `export default ...`.",
      "A CJS module has no real default export; it just has one `module.exports` object.",
      "Without interop, `import express from \"express\"` compiled to CJS becomes `require(\"express\").default`, which is `undefined`, so the app crashes.",
      "`esModuleInterop: true` makes TS emit small helpers (`__importDefault`, `__importStar`) that wrap CJS modules so default and namespace imports behave like Babel and Node do.",
      "`allowSyntheticDefaultImports: true` is type-checking only: it allows writing `import x from \"cjs-lib\"` without a declared default export, but emits nothing.",
      "Enabling `esModuleInterop` automatically turns on `allowSyntheticDefaultImports`.",
      "# How it works",
      "With `module: commonjs` and `esModuleInterop` on, `import express from \"express\"` compiles to:",
      "  `const express_1 = __importDefault(require(\"express\"));`",
      "  `__importDefault` checks the `__esModule` flag; if missing (a plain CJS module), it wraps it as `{ default: module }`.",
      "  Your code then uses `express_1.default`, which is the real function.",
      "`import * as fs from \"fs\"` uses `__importStar` to copy properties into a namespace object, so calling the namespace itself is not allowed (correct ESM behaviour).",
      "With `module: NodeNext` and real ESM output, Node itself does the interop: a CJS module's `module.exports` becomes the default import.",
      "# Example walkthrough",
      "The TS source uses a default import of Express and a namespace import of `path`.",
      "The commented output shows the `__importDefault` helper TS emits with the flag on.",
      "Without the flag, the output uses `require(\"express\").default` and calling it throws `express_1.default is not a function`.",
      "With the flag, the app starts and prints the joined path.",
      "# Why it matters / when to use",
      "Most backends still import CJS packages (Express, many older libs); interop decides whether default imports work.",
      "Turn on `esModuleInterop` in every new project — it is in the recommended configs.",
      "Library authors should keep it on so their emitted code works for both ESM and CJS consumers.",
      "# Common mistakes",
      "Turning on only `allowSyntheticDefaultImports` and assuming runtime works; it does not change emit.",
      "Using `import * as express from \"express\"` then calling `express()`, which is invalid under interop; use a default import.",
      "Copying old code that uses `import x = require(\"x\")` without knowing it is a TS-only CJS syntax.",
      "# Say this in the interview",
      "CommonJS modules have no real default export, so default-importing them used to break. `esModuleInterop` makes TypeScript emit helpers like `__importDefault` so `import express from \"express\"` works at run time and namespace imports behave like the spec. `allowSyntheticDefaultImports` only relaxes the type checker and is enabled automatically by `esModuleInterop`, which I always turn on.",
      "Follow-up: what does `__esModule` mean?",
      "  A flag that transpilers set on CJS output of ESM code, telling interop helpers the module already has a proper `default`.",
    ],
    code: `// src/app.ts (compiled with "module": "commonjs")
import express from "express";      // express is a CommonJS package
import * as path from "path";

const app = express();
console.log(path.join("api", "v1")); // → api/v1   (api\\v1 on Windows)

// ---- emitted JS WITH "esModuleInterop": true ----
// const express_1 = __importDefault(require("express"));
// const path = __importStar(require("path"));
// const app = (0, express_1.default)();   // default = module.exports ✓

// ---- emitted JS WITHOUT it ----
// const express_1 = require("express");
// const app = (0, express_1.default)();
// ✗ TypeError: express_1.default is not a function

// tsconfig.json
// { "compilerOptions": { "esModuleInterop": true } }
// (this also enables "allowSyntheticDefaultImports" for the type checker)`,
  },
  {
    id: 'type-only-imports',
    group: 'Modules, Declarations & Config',
    stars: 3,
    difficulty: 'Medium',
    q: 'What are type-only imports/exports and `verbatimModuleSyntax`?',
    a: [
      "# ELI5",
      "Imagine packing for a trip: some items you need on the trip (clothes), and some you only need while packing (a checklist).",
      "If you label the checklist as packing-only, you leave it at home and the suitcase is lighter.",
      "`import type` labels an import as packing-only: it is used for type checking, then removed so the runtime never loads it.",
      "`verbatimModuleSyntax` is the strict rule: whatever is not labeled packing-only goes in the suitcase exactly as written.",
      "# What it is",
      "`import type { User } from \"./user.js\"` imports only types; the whole statement is deleted from the JavaScript output.",
      "`import { type User, createUser } from \"./user.js\"` marks just one name as type-only; the import stays for `createUser`.",
      "`export type { User }` similarly exports a type only.",
      "`verbatimModuleSyntax: true` (TS 5.0+) makes the rule simple: imports/exports without `type` are kept exactly, and those with `type` are dropped.",
      "It replaces older flags `importsNotUsedAsValues` and `preserveValueImports`, and implies the safety of `isolatedModules`.",
      "# How it works",
      "Without these features, TS guesses: if an imported name is only used as a type, it silently removes the import (import elision).",
      "  Single-file tools like esbuild, SWC and Babel cannot see the other file, so they cannot know whether `User` is a type or value.",
      "  They might keep an import of a type, and Node then crashes with does not provide an export named User.",
      "With `verbatimModuleSyntax`:",
      "  You must write `type` for type-only names (TS errors otherwise: error 1484).",
      "  The emitter keeps non-type imports even if unused, so side-effect imports behave predictably.",
      "  Each file can be compiled in isolation correctly by any tool.",
      "In CommonJS output, it also forbids ESM `import` syntax in files that compile to CJS, requiring `import x = require()` instead — so it fits ESM projects best.",
      "# Example walkthrough",
      "`user.ts` exports an interface `User` and a function `createUser`.",
      "`app.ts` imports `User` with `type` and `createUser` normally.",
      "The commented output shows only `createUser` imported; the type import vanished.",
      "Running prints the created user object.",
      "# Why it matters / when to use",
      "Required for correct behaviour with esbuild, SWC, tsx, Vite and Node's type stripping, which compile file-by-file.",
      "Avoids accidentally importing heavy modules at run time just for their types.",
      "Prevents circular-import problems where a file only needs another file's types.",
      "# Common mistakes",
      "Importing an interface without `type` under `verbatimModuleSyntax`, which errors (`TS1484`) — add `type`.",
      "Using `import type` for a class and then calling `new` on it; type-only imports cannot be used as values.",
      "Turning on `verbatimModuleSyntax` in a CommonJS-emitting project and hitting errors on `import` syntax; it is designed for ESM output.",
      "# Say this in the interview",
      "`import type` and `export type` bring in names for type checking only and are always erased, so the runtime never loads them. `verbatimModuleSyntax` makes the emit predictable: anything without `type` is kept exactly as written and anything with `type` is dropped, which is what single-file compilers like esbuild, SWC and Node type stripping need. I enable it in ESM projects and mark type-only imports explicitly.",
      "Follow-up: what is import elision?",
      "  The old behaviour where TS silently removed imports that were only used as types.",
    ],
    code: `// ---- user.ts ----
export interface User { id: number; name: string }
export function createUser(name: string): User {
  return { id: Date.now() % 1000, name };
}

// ---- app.ts (tsconfig: "verbatimModuleSyntax": true) ----
// import type { User } from "./user.js";        // whole line erased
// import { createUser } from "./user.js";        // kept as-is
// // or combined: import { type User, createUser } from "./user.js";
//
// const u: User = createUser("Ana");
// console.log(u.name);                           // → Ana
//
// import { User } from "./user.js";              // ✗ TS1484: 'User' is a type and must be
//                                                //   imported using a type-only import

// ---- emitted app.js ----
// import { createUser } from "./user.js";
// const u = createUser("Ana");
// console.log(u.name);

const u: User = createUser("Ana");
console.log(u.name); // → Ana`,
  },
  {
    id: 'namespaces-vs-modules',
    group: 'Modules, Declarations & Config',
    stars: 2,
    difficulty: 'Easy',
    q: 'Namespaces vs ES modules?',
    a: [
      "# ELI5",
      "Namespaces are like labelled drawers in one giant cupboard: everything is in the same room, just in named drawers.",
      "ES modules are like separate rooms with doors: you must open a door (import) to take anything out, and each room decides what it shares (export).",
      "Modern buildings use rooms; the drawer system is from the time before rooms existed.",
      "In code: namespaces group code inside a global object; ES modules are separate files with `import`/`export`.",
      "# What it is",
      "A namespace (formerly internal module) is TypeScript syntax `namespace Utils { export function x() {} }` that compiles to an object wrapped in a function (an IIFE — immediately invoked function expression).",
      "An ES module is any file with a top-level `import` or `export`; it has its own scope, and only exported names are visible to others.",
      "Comparison, row by row:",
      "  Standard: ES modules are JavaScript standard; namespaces are TS-only.",
      "  Scope: modules are file-scoped; namespaces often add to a global object.",
      "  Loading: modules are loaded by Node/bundlers; namespaces rely on script order or `outFile` concatenation.",
      "  Tree-shaking (removing unused code): works with modules; namespaces are opaque objects that bundlers cannot shake.",
      "  Type stripping: namespaces with values emit code, so they are not allowed under `erasableSyntaxOnly` / Node type stripping.",
      "Namespaces still appear in `.d.ts` files to describe global libraries (e.g. `namespace Express`) and to group types.",
      "# How it works",
      "A namespace compiles to `var Utils; (function (Utils) { Utils.x = ...; })(Utils || (Utils = {}));`.",
      "  Multiple `namespace Utils` blocks merge into one object (declaration merging).",
      "  Access is via dot syntax: `Utils.x()`.",
      "An ES module compiles to `export function x() {}`, and consumers use `import { x } from \"./utils.js\"`.",
      "# Example walkthrough",
      "The `Validation` namespace exports `isEmail` and is called as `Validation.isEmail`.",
      "The module version is the same function exported from a file and imported by name.",
      "Both print `true` for a valid email; only the module version works well with tree-shaking and type stripping.",
      "# Why it matters / when to use",
      "Use ES modules for all application and library code in Node and front-end projects.",
      "Use `namespace` only inside declaration files, e.g. to augment `Express.Request` or describe a global SDK.",
      "Recognise namespaces in legacy code to plan migrations.",
      "# Common mistakes",
      "Using namespaces in new code to organise files, which adds runtime wrappers and blocks tree-shaking.",
      "Mixing namespaces and modules (`export namespace` inside a module) and creating awkward double-nested names like `Utils.Utils.x`.",
      "Confusing the old `module Foo {}` syntax (now deprecated in favour of `namespace`) with `declare module \"foo\"` for packages.",
      "# Say this in the interview",
      "Namespaces are a TypeScript-only way to group code into a named object, from before JavaScript had modules; ES modules are the standard file-based system with `import` and `export`. For modern code I always use ES modules because of tooling, tree-shaking and type-stripping support, and I only use `namespace` in declaration files, for example to augment `Express.Request`.",
    ],
    code: `// ---- Namespace style (legacy, TS-only, emits an IIFE object) ----
namespace Validation {
  export function isEmail(s: string) {
    return /^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(s);
  }
}
console.log(Validation.isEmail("ana@x.io")); // → true

// Compiles roughly to:
// var Validation;
// (function (Validation) {
//   function isEmail(s) { ... }
//   Validation.isEmail = isEmail;
// })(Validation || (Validation = {}));

// ---- ES module style (standard, tree-shakeable) ----
// validation.ts
export function isEmail(s: string) {
  return /^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(s);
}
// app.ts
// import { isEmail } from "./validation.js";
console.log(isEmail("ana@x.io"));            // → true`,
  },
  {
    id: 'project-references',
    group: 'Modules, Declarations & Config',
    stars: 2,
    difficulty: 'Hard',
    q: 'What are project references and `composite` builds?',
    a: [
      "# ELI5",
      "Imagine a big school project split among teams: the art team, the writing team and the final-poster team.",
      "The poster team waits for the others to finish, but if the art team did not change anything, nobody redoes the art.",
      "Project references split a big TypeScript codebase into smaller projects that build in order and skip work that has not changed.",
      "Each team is a sub-project with its own tsconfig, and the poster team is the app that depends on the others.",
      "# What it is",
      "Project references let one `tsconfig.json` point to other tsconfig projects with `\"references\": [{ \"path\": \"../shared\" }]`.",
      "A referenced project must have `composite: true`, which forces settings that make it safely referenceable:",
      "  `declaration: true` — it must emit `.d.ts` files that dependents read.",
      "  `rootDir` defaults to the folder containing its tsconfig, and every source file must be matched by `include`/`files`.",
      "  `incremental` — it writes a `.tsbuildinfo` file recording what was built.",
      "You build with `tsc --build` (or `tsc -b`), which understands the dependency graph.",
      "# How it works",
      "Step by step when you run `tsc -b apps/api`:",
      "  TS reads `apps/api/tsconfig.json` and follows its `references` to find all dependencies.",
      "  It sorts them so dependencies build first (e.g. `packages/shared` before `apps/api`).",
      "  For each project, it checks the `.tsbuildinfo` and file timestamps; unchanged projects are skipped.",
      "  Dependents type-check against the referenced project's `.d.ts` output instead of re-checking its source, which saves time.",
      "Editors also load projects separately, which keeps large monorepos responsive.",
      "`tsc -b --watch` rebuilds only affected projects; `tsc -b --clean` deletes outputs.",
      "# Example walkthrough",
      "`packages/shared/tsconfig.json` is composite and outputs to `dist`.",
      "`apps/api/tsconfig.json` references `../../packages/shared`.",
      "The root `tsconfig.json` has empty `files` and references both, so `tsc -b` at the root builds everything in order.",
      "The shell comments show the first build compiling both, and a second build with no changes finishing immediately.",
      "# Why it matters / when to use",
      "Monorepos with shared packages (types, utilities, SDKs) and several services or apps.",
      "Faster CI and local builds for large codebases, and clear boundaries between packages.",
      "# Common mistakes",
      "Running plain `tsc -p` instead of `tsc -b`, so references are not built and dependents see stale or missing `.d.ts` files.",
      "Forgetting `composite: true` in a referenced project, which causes an error.",
      "Importing a file from another project that is not exported via its build output, leading to rootDir errors.",
      "Circular references between projects — not allowed; extract shared code into a lower-level package.",
      "# Say this in the interview",
      "Project references split a codebase into multiple tsconfig projects that reference each other. Referenced projects set `composite: true`, which requires declaration output and enables incremental build info, and `tsc --build` builds them in dependency order, skipping unchanged ones and checking dependents against `.d.ts` files. It is the standard way to speed up TypeScript in large monorepos.",
      "Follow-up: what is the `.tsbuildinfo` file?",
      "  A cache of the previous build's file hashes and results that lets `tsc` skip unchanged work.",
    ],
    code: `// packages/shared/tsconfig.json
{
  "compilerOptions": {
    "composite": true,        // can be referenced; implies declaration + incremental
    "rootDir": "src",
    "outDir": "dist",
    "module": "NodeNext",
    "strict": true
  },
  "include": ["src"]
}

// apps/api/tsconfig.json
{
  "compilerOptions": { "outDir": "dist", "module": "NodeNext", "strict": true },
  "references": [{ "path": "../../packages/shared" }],
  "include": ["src"]
}

// tsconfig.json (repo root): a "solution" file that only references projects
{
  "files": [],
  "references": [{ "path": "packages/shared" }, { "path": "apps/api" }]
}

// $ npx tsc -b            → builds shared, then api
// $ npx tsc -b            → nothing changed: finishes almost instantly
// $ npx tsc -b --watch    → rebuilds only affected projects`,
  },
  {
    id: 'typing-react-props',
    group: 'TS with React & Node',
    stars: 5,
    difficulty: 'Easy',
    q: 'How do you type React component props?',
    a: [
      "# ELI5",
      "Think of ordering a custom pizza with an order form: size is required, toppings are optional, and the form says which choices are allowed.",
      "If you write purple as a size, the shop rejects the form before cooking.",
      "Typing props is writing that order form for a component, so wrong or missing inputs are caught before the app runs.",
      "The pizza is the component, the order form is the props type, and the rejection is a TypeScript error in your editor.",
      "# What it is",
      "A React component is a function that returns UI (JSX); props (properties) are the inputs passed to it, like function arguments.",
      "You describe props with an `interface` or `type` and annotate the function parameter: `function Button({ label }: ButtonProps)`.",
      "Optional props use `?`, and default values come from destructuring defaults: `{ size = \"md\" }`.",
      "Literal unions restrict choices: `variant: \"primary\" | \"danger\"`.",
      "Callback props are typed as functions: `onClick: (id: string) => void`.",
      "`children` (the content between opening and closing tags) is typed as `React.ReactNode`.",
      "To accept all native HTML attributes, extend `React.ComponentProps<\"button\">` (or `ComponentPropsWithoutRef<\"button\">`).",
      "`React.FC` is optional and no longer recommended by most teams; annotating the props parameter directly is the common style.",
      "# How it works",
      "When you write `<Button label=\"Save\" />`:",
      "  TS converts the JSX into a call and checks the attributes object against `ButtonProps`.",
      "  Missing required props, unknown props or wrong types become compile errors.",
      "  Inside the component, destructured props get their declared types, with defaults removing `undefined`.",
      "All of this is erased at build time; React itself does no type checking at run time.",
      "# Example walkthrough",
      "`ButtonProps` extends native button props (minus `onClick`, which we redefine), adds a required `label`, an optional `variant` union and a typed `onClick`.",
      "The component destructures `variant` with a default `\"primary\"` and spreads `...rest` onto the real `<button>` so `disabled`, `type` etc. work.",
      "`Card` shows `children: React.ReactNode` for wrapping content.",
      "Usage lines show valid calls and the errors you would get for a missing label or a wrong variant.",
      "# Why it matters / when to use",
      "Component libraries and design systems where many developers reuse components safely.",
      "Refactoring: renaming a prop instantly shows every call site that needs changes.",
      "Full-stack TS: share API response types between the backend and component props.",
      "# Common mistakes",
      "Typing props as `any` or leaving them untyped (implicit `any`), which loses all checking.",
      "Using `React.FC` and relying on its old implicit `children`; since React 18 types, `children` must be declared explicitly.",
      "Typing `children` as `JSX.Element`, which rejects strings, arrays and `null`; use `React.ReactNode`.",
      "Redeclaring HTML attributes by hand instead of extending `ComponentProps<\"button\">`.",
      "# Say this in the interview",
      "I define a props interface or type and annotate the destructured parameter, using `?` for optional props with destructuring defaults, literal unions for variants, function types for callbacks, and `React.ReactNode` for children. When wrapping a native element I extend `React.ComponentProps<\"button\">` and spread the rest. I usually skip `React.FC` and just type the props directly.",
      "Follow-up: interface or type for props?",
      "  Either works; `type` is handy for unions, `interface` for extending — teams usually pick one for consistency.",
      "Follow-up: how do you get a component's props type?",
      "  `React.ComponentProps<typeof MyComponent>`.",
    ],
    code: `import type { ComponentProps, ReactNode } from "react";

type ButtonProps = Omit<ComponentProps<"button">, "onClick"> & {
  label: string;                          // required
  variant?: "primary" | "danger";         // optional, limited choices
  onClick?: (label: string) => void;      // typed callback
};

export function Button({ label, variant = "primary", onClick, ...rest }: ButtonProps) {
  return (
    <button className={\`btn-\${variant}\`} onClick={() => onClick?.(label)} {...rest}>
      {label}
    </button>
  );
}

type CardProps = { title: string; children: ReactNode };

export function Card({ title, children }: CardProps) {
  return <section><h2>{title}</h2>{children}</section>;
}

export function Page() {
  return (
    <Card title="Settings">
      <Button label="Save" onClick={(l) => console.log("clicked", l)} />  {/* → clicked Save */}
      <Button label="Delete" variant="danger" disabled />
      {/* <Button variant="danger" />        ✗ Error: label is missing */}
      {/* <Button label="X" variant="red" /> ✗ Error: "red" not assignable */}
    </Card>
  );
}`,
  },
  {
    id: 'typing-react-hooks',
    group: 'TS with React & Node',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do you type `useState`, `useRef` and `useReducer`?',
    a: [
      "# ELI5",
      "Think of labelled storage boxes in a classroom: one box for crayons, one for the current page number, one for a list of instructions.",
      "If the label says crayons, nobody may put a sandwich in it.",
      "React hooks are those boxes, and typing them is writing the label so only the right things go in.",
      "`useState` is a box that redraws the page when changed, `useRef` is a box that does not, and `useReducer` is a box changed only through named instructions.",
      "# What it is",
      "Hooks are special React functions (names start with `use`) that let components keep state and other features.",
      "`useState<T>(initial)` returns `[value, setValue]`; TS infers `T` from the initial value, so `useState(0)` is `number` automatically.",
      "When the initial value does not show the full type (like `null` or `[]`), pass the generic: `useState<User | null>(null)` or `useState<string[]>([])`.",
      "`useRef` has two main uses:",
      "  DOM refs: `useRef<HTMLInputElement>(null)` gives a `RefObject` whose `.current` is `HTMLInputElement | null` — React fills it.",
      "  Mutable values: `useRef<number | undefined>(undefined)` for timers or previous values you change yourself, without re-rendering.",
      "`useReducer(reducer, initialState)` infers types from the reducer function, so you type the reducer's `state` and `action` parameters.",
      "A discriminated union (a union whose members share a literal field like `type`) is the best way to type actions.",
      "# How it works",
      "For `useState`:",
      "  TS reads the generic or infers from the argument.",
      "  The setter accepts either a new `T` or an updater function `(prev: T) => T`.",
      "For `useRef`, the overloads in `@types/react` decide whether `.current` is read-only-ish (DOM ref) or freely mutable, based on the generic and initial value.",
      "  With React 19 types, `useRef` requires an argument and `RefObject.current` is mutable.",
      "For `useReducer`, TS infers state and action types from the reducer, and `dispatch` only accepts valid actions; inside `switch (action.type)` each case narrows `action` to that member.",
      "# Example walkthrough",
      "`count` is inferred as `number`; `user` is explicitly `User | null`, so the code must check before reading `user.name`.",
      "`inputRef` is a DOM ref passed to `<input ref={inputRef}>`; `focus` uses optional chaining because `.current` may be `null`.",
      "`timerRef` stores a timeout ID — `ReturnType<typeof setTimeout>` works in both Node and browser typings.",
      "`reducer` handles `add` (with a `payload`) and `reset` (without); `dispatch({ type: \"add\", payload: 2 })` type-checks, a missing payload does not.",
      "# Why it matters / when to use",
      "Fetching data: `useState<Order[] | null>(null)` models loading vs loaded clearly.",
      "Forms and complex state machines (wizard steps, carts) with `useReducer` and discriminated union actions.",
      "Managing focus, scroll and timers with refs safely.",
      "# Common mistakes",
      "`useState([])` infers `never[]`, so you cannot push items later; write `useState<Item[]>([])`.",
      "`useState(null)` infers `null` forever; write `useState<User | null>(null)`.",
      "Forgetting the null check on `ref.current` before using a DOM ref.",
      "Typing actions as `{ type: string; payload?: any }`, which loses narrowing; use a discriminated union.",
      "# Say this in the interview",
      "`useState` infers from its initial value, and I pass a generic when the initial value is `null` or an empty array, like `useState<User | null>(null)`. For DOM refs I use `useRef<HTMLInputElement>(null)` and null-check `.current`; for mutable values I give the full type. For `useReducer` I type the reducer with a state type and a discriminated union of actions, so `dispatch` and each `switch` case are checked.",
      "Follow-up: how do you type a context?",
      "  `createContext<Value | null>(null)` plus a custom hook that throws if the context is `null`.",
    ],
    code: `import { useReducer, useRef, useState } from "react";

type User = { id: number; name: string };

type State = { total: number };
type Action =
  | { type: "add"; payload: number }   // discriminated union of actions
  | { type: "reset" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "add":   return { total: state.total + action.payload }; // payload: number
    case "reset": return { total: 0 };
  }
}

export function Demo() {
  const [count, setCount] = useState(0);                  // number (inferred)
  const [user, setUser] = useState<User | null>(null);    // explicit union
  const [tags, setTags] = useState<string[]>([]);         // not never[]

  const inputRef = useRef<HTMLInputElement>(null);        // DOM ref
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [state, dispatch] = useReducer(reducer, { total: 0 });

  function handle() {
    setCount((c) => c + 1);
    setUser({ id: 1, name: "Ana" });
    setTags((t) => [...t, "new"]);
    inputRef.current?.focus();                            // may be null
    timerRef.current = setTimeout(() => console.log("tick"), 100);
    dispatch({ type: "add", payload: 2 });                // → state.total: 2
    // dispatch({ type: "add" });                         // ✗ Error: payload missing
  }

  return (
    <div>
      <input ref={inputRef} />
      <button onClick={handle}>{count} {user?.name ?? "guest"} {state.total} {tags.length}</button>
    </div>
  );
}`,
  },
  {
    id: 'runtime-validation',
    group: 'TS with React & Node',
    stars: 4,
    difficulty: 'Medium',
    q: 'TS types are erased — how do you validate data from APIs at runtime?',
    a: [
      "# ELI5",
      "A delivery note says this box contains 12 eggs, but you still open the box and count them before baking.",
      "The note is a promise from someone else; counting is checking it yourself.",
      "TypeScript types are like the note — they are not there when the program runs — so for data from outside you must open the box and check, using a validator.",
      "The box is an API response or request body, and counting eggs is runtime validation with a library like Zod.",
      "# What it is",
      "Types are erased at compile time, so `const body = req.body as User` is just a promise to the compiler — no check happens.",
      "External data (HTTP request bodies, third-party API responses, env variables, DB JSON columns, `localStorage`, message queues) can be anything.",
      "Runtime validation means code that checks the actual shape and values while the program runs, and rejects or reports bad data.",
      "Options:",
      "  Schema libraries — Zod, Valibot, ArkType, TypeBox, Yup: define a schema once, validate at run time, and infer the TS type from it.",
      "  Hand-written type guards — functions returning `value is User` after checking fields.",
      "  JSON Schema + Ajv — common with Fastify and OpenAPI.",
      "  Class-based — class-validator + class-transformer (common in NestJS).",
      "The key idea is a single source of truth: the schema produces both the runtime check and the static type (`z.infer<typeof UserSchema>`).",
      "# How it works",
      "Step by step with Zod:",
      "  Define a schema: `z.object({ email: z.string().email(), age: z.number().int().min(18) })`.",
      "  Derive the type: `type User = z.infer<typeof UserSchema>`.",
      "  At the boundary (where data enters), call `UserSchema.safeParse(data)`.",
      "  It walks the data, checking each field; it returns `{ success: true, data }` (typed and possibly transformed) or `{ success: false, error }` with detailed issues.",
      "  Use `parse` instead to throw on failure.",
      "Inside the app, trust the validated type — validate once at the edges, not everywhere.",
      "# Example walkthrough",
      "`CreateUser` schema requires a valid email, an integer age of at least 18, and an optional role defaulting to `\"user\"`.",
      "`type CreateUser` is inferred, so the type and the check can never drift apart.",
      "The first `safeParse` call succeeds and prints the parsed object with the default role filled in.",
      "The second fails; we print the list of issue paths, showing both `email` and `age` were invalid.",
      "In an Express handler, you would return HTTP 400 with those issues.",
      "# Why it matters / when to use",
      "Every API endpoint should validate request bodies, params and query strings to block bad input and injection attempts.",
      "Validate third-party API responses so a provider change does not crash deep inside your code.",
      "Validate `process.env` at startup so missing config fails fast.",
      "# Common mistakes",
      "Using `as User` on `req.body` or `await res.json()` and believing it is validated.",
      "Defining the TS interface and the schema separately, so they drift; infer the type from the schema.",
      "Validating deep inside business logic instead of at the boundary, leading to duplicate checks.",
      "Leaking raw validation errors with internals to clients; map them to a clean 400 response.",
      "# Say this in the interview",
      "Because TypeScript types disappear at run time, anything crossing a trust boundary — request bodies, external API responses, env vars — must be validated in code. I use a schema library like Zod: I define the schema once, infer the TypeScript type with `z.infer`, and call `safeParse` at the edge, returning a 400 on failure. After that, the rest of the app can trust the type.",
      "Follow-up: why not just write type guards?",
      "  They work for small cases, but schemas give composability, detailed error messages, transforms and type inference without duplication.",
    ],
    code: `import { z } from "zod";

// One schema = runtime check + static type
const CreateUser = z.object({
  email: z.string().email(),
  age: z.number().int().min(18),
  role: z.enum(["user", "admin"]).default("user"),
});
type CreateUser = z.infer<typeof CreateUser>; // { email: string; age: number; role: "user" | "admin" }

const good = CreateUser.safeParse({ email: "ana@x.io", age: 30 });
if (good.success) console.log(good.data);
// → { email: 'ana@x.io', age: 30, role: 'user' }

const bad = CreateUser.safeParse({ email: "nope", age: 15.5 });
if (!bad.success) console.log(bad.error.issues.map((i) => i.path.join(".")));
// → [ 'email', 'age' ]

// In an Express route:
// app.post("/users", (req, res) => {
//   const r = CreateUser.safeParse(req.body);
//   if (!r.success) return res.status(400).json({ issues: r.error.issues });
//   const user: CreateUser = r.data;  // trusted from here on
//   res.status(201).json(user);
// });

// ✗ Not validation: const user = req.body as CreateUser;  (no check at run time)`,
  },
  {
    id: 'typing-react-events',
    group: 'TS with React & Node',
    stars: 3,
    difficulty: 'Easy',
    q: 'How do you type event handlers in React?',
    a: [
      "# ELI5",
      "When the doorbell rings, you want to know: which door, who pressed it, and was it a knock or a ring?",
      "An event object is the note that comes with the doorbell, with all those details.",
      "Typing event handlers tells TypeScript exactly what is written on that note, so you can read it safely.",
      "The doorbell is a user action (click, typing, submit), and the note is React's event object.",
      "# What it is",
      "An event handler is a function React calls when something happens, like `onClick` or `onChange`.",
      "React passes a synthetic event — React's cross-browser wrapper around the native browser event.",
      "Types come from `@types/react` and are generic over the element: `React.ChangeEvent<HTMLInputElement>`, `React.MouseEvent<HTMLButtonElement>`, `React.FormEvent<HTMLFormElement>`, `React.KeyboardEvent<HTMLInputElement>`.",
      "Handler types also exist: `React.ChangeEventHandler<HTMLInputElement>` is the same as `(e: React.ChangeEvent<HTMLInputElement>) => void`.",
      "`e.currentTarget` is the element the handler is attached to and is typed precisely; `e.target` is whatever was actually clicked and is typed loosely.",
      "Inline handlers (`onChange={(e) => ...}`) get the event type inferred automatically — this is called contextual typing.",
      "# How it works",
      "When you write `onChange={handleChange}`:",
      "  TS looks up the `onChange` prop type on `<input>`, which is `ChangeEventHandler<HTMLInputElement>`.",
      "  It checks that your function accepts that event type.",
      "  Inside, `e.currentTarget.value` is `string` because `HTMLInputElement` has a `value` property.",
      "For separately defined handlers, you must annotate the parameter, since there is no JSX context to infer from.",
      "# Example walkthrough",
      "`handleChange` is annotated with `ChangeEvent<HTMLInputElement>`, so `e.currentTarget.value` is a `string`.",
      "`handleSubmit` uses `FormEvent<HTMLFormElement>` and calls `preventDefault()` to stop a page reload.",
      "`handleKey` checks `e.key === \"Enter\"`.",
      "The inline `onClick` has its type inferred, and `e.clientX` is available because it is a `MouseEvent`.",
      "Typing then pressing Enter logs the typed name.",
      "# Why it matters / when to use",
      "Forms, search boxes, keyboard shortcuts and drag-and-drop in admin dashboards and SaaS front ends.",
      "Shared handler functions reused across components need explicit types.",
      "# Common mistakes",
      "Using `any` for the event, losing autocomplete and safety.",
      "Using the native DOM `Event` or `MouseEvent` type instead of React's `React.MouseEvent`; they are different types.",
      "Reading `e.target.value` and getting an error because `target` is just `EventTarget`; use `e.currentTarget.value`.",
      "Mixing up element generics, e.g. `ChangeEvent<HTMLInputElement>` on a `<select>` — use `HTMLSelectElement`.",
      "# Say this in the interview",
      "React handlers receive synthetic events typed by `@types/react`, generic over the element, like `React.ChangeEvent<HTMLInputElement>` or `React.FormEvent<HTMLFormElement>`. Inline handlers infer the type from the JSX prop, and separately defined ones need an annotation or a handler type such as `ChangeEventHandler`. I read values from `currentTarget` because it is precisely typed.",
      "Follow-up: how do you find the right type?",
      "  Write the handler inline once and hover over `e` in the editor to see the inferred type.",
    ],
    code: `import { useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from "react";

export function NameForm() {
  const [name, setName] = useState("");

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setName(e.currentTarget.value);          // string
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();                      // stop the full page reload
    console.log("submitted", name);          // → submitted Ana
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") console.log("enter pressed");
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={handleChange} onKeyDown={handleKey} />
      {/* inline: e is inferred as React.MouseEvent<HTMLButtonElement> */}
      <button onClick={(e) => console.log("x =", e.clientX)}>Save</button>
    </form>
  );
}`,
  },
  {
    id: 'react-children-types',
    group: 'TS with React & Node',
    stars: 3,
    difficulty: 'Medium',
    q: '`ReactNode` vs `ReactElement` vs `JSX.Element`?',
    a: [
      "# ELI5",
      "Think of a toy box: `ReactNode` is a box that accepts anything you can put on a shelf — toys, stickers, empty space.",
      "`ReactElement` is a box that accepts only actual toys (built components), nothing else.",
      "`JSX.Element` is the label on the toy produced by the JSX toy factory — practically the same as a toy.",
      "In code: `ReactNode` is anything React can render, `ReactElement` is an object created by JSX, and `JSX.Element` is the type a JSX expression produces.",
      "# What it is",
      "JSX is the HTML-like syntax in React files (`<div>Hi</div>`) that compiles into function calls creating element objects.",
      "Comparison, row by row:",
      "  `React.ReactNode` — the widest: `ReactElement | string | number | bigint | Iterable<ReactNode> | ReactPortal | boolean | null | undefined` (plus Promises in React 19 types). Use for `children` and anything renderable.",
      "  `React.ReactElement<P>` — an element object with `type`, `props` and `key`. Use when you need an actual element, e.g. to clone it or read its props.",
      "  `JSX.Element` — the type of a JSX expression; it is defined as `React.ReactElement<any, any>`. Mostly seen as the inferred return type of components.",
      "So every `JSX.Element` is a `ReactElement`, and every `ReactElement` is a `ReactNode`, but not the other way round.",
      "In React 19 types, the global `JSX` namespace is deprecated in favour of `React.JSX.Element`.",
      "# How it works",
      "When TS sees JSX like `<b>hi</b>`, it types the expression as `JSX.Element`.",
      "When you pass something as `children`, TS checks it against the declared prop type:",
      "  A string like `\"hello\"` fits `ReactNode` but not `ReactElement`.",
      "  An array of elements fits `ReactNode` but not a single `ReactElement`.",
      "  `null` fits `ReactNode` only.",
      "Component return types: function components may return any `ReactNode` in modern React types (TS 5.1+ with React 18.2+ types), so returning a string or `null` is fine.",
      "# Example walkthrough",
      "`Panel` takes `children: ReactNode`, so text, numbers, arrays and `null` are all allowed.",
      "`IconSlot` takes `icon: ReactElement`, so it can use `cloneElement` to add a prop, and a plain string would be rejected.",
      "`el` is a JSX expression, typed as `JSX.Element`, and is assignable to both other types.",
      "The comments show which assignments compile.",
      "# Why it matters / when to use",
      "Use `ReactNode` for `children` and render-prop results in almost all components.",
      "Use `ReactElement` only for APIs that manipulate elements (slots that clone, `cloneElement`, `isValidElement`).",
      "Rarely write `JSX.Element` yourself; let inference handle component return types.",
      "# Common mistakes",
      "Typing `children: JSX.Element`, which rejects strings, multiple children and `null`.",
      "Typing a component return as `JSX.Element` and then failing when it returns `null`.",
      "Expecting `ReactNode` to include plain objects; objects are not renderable and cause a runtime error.",
      "# Say this in the interview",
      "`ReactNode` is anything React can render — elements, strings, numbers, arrays, null, undefined — so it is the right type for `children`. `ReactElement` is specifically an element object with type and props, needed when you clone or inspect elements, and `JSX.Element` is just the type of a JSX expression, an alias of `ReactElement<any, any>`. The hierarchy is `JSX.Element` within `ReactElement` within `ReactNode`.",
    ],
    code: `import { cloneElement, type ReactElement, type ReactNode } from "react";

// Anything renderable: the right type for children
function Panel({ children }: { children: ReactNode }) {
  return <div className="panel">{children}</div>;
}

// Needs a real element because we clone it with extra props
function IconSlot({ icon }: { icon: ReactElement<{ size?: number }> }) {
  return cloneElement(icon, { size: 16 });
}

const el = <b>hi</b>;                   // type: JSX.Element (= ReactElement<any, any>)

export function Demo() {
  return (
    <>
      <Panel>text</Panel>               {/* ✓ string is a ReactNode */}
      <Panel>{42}{null}{[el, el]}</Panel>{/* ✓ numbers, null, arrays */}
      <IconSlot icon={el} />            {/* ✓ an element */}
      {/* <IconSlot icon="star" />      ✗ Error: string is not a ReactElement */}
    </>
  );
}

const node: ReactNode = el;             // ✓ every element is a node
// const e2: ReactElement = "text";     // ✗ Error: a string is not an element`,
  },
  {
    id: 'typing-express',
    group: 'TS with React & Node',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do you type Express handlers and request data?',
    a: [
      "# ELI5",
      "Think of a restaurant order slip with sections: table number, special instructions, and the dishes ordered.",
      "If the slip is printed with labelled sections, the kitchen knows exactly where to look and what to expect.",
      "Typing Express handlers labels each section of a request (URL params, body, query) and the reply, so TypeScript can check your code.",
      "The slip is the `Request` object, the sections are `params`, `body` and `query`, and the plate you send back is the `Response`.",
      "# What it is",
      "Express is the most popular Node.js web framework; a handler is the function `(req, res) => { ... }` that answers a route.",
      "Types come from `@types/express`; `Request` and `Response` are generic.",
      "`Request<Params, ResBody, ReqBody, Query>` — the four generics in that order:",
      "  `Params` — URL parameters like `:id` (always strings).",
      "  `ResBody` — the type of what you send with `res.json`.",
      "  `ReqBody` — the type of `req.body` (parsed by `express.json()`).",
      "  `Query` — the query string object `?page=2` (values are strings or arrays).",
      "`RequestHandler<Params, ResBody, ReqBody, Query>` types the whole handler function at once.",
      "Important: these generics are only promises — Express does not validate anything, so you still need runtime validation (e.g. Zod) for bodies and queries.",
      "# How it works",
      "Route path inference: in inline handlers, `@types/express` parses the route string, so `app.get(\"/users/:id\", (req) => req.params.id)` types `id` as `string` automatically.",
      "For separately defined handlers, you pass the generics or use `RequestHandler`.",
      "  `res.json(x)` is checked against `ResBody`.",
      "  `req.body` gets `ReqBody` (otherwise it is `any`).",
      "Express 5 (with `@types/express` v5) catches rejected Promises from async handlers and passes them to error middleware; in Express 4 you need a wrapper or `express-async-errors`.",
      "Error middleware has four parameters: `(err, req, res, next)`, typed with `ErrorRequestHandler`.",
      "# Example walkthrough",
      "`UserParams`, `CreateUserBody` and `UserDto` describe the parts of the request and response.",
      "`getUser` is a `RequestHandler<UserParams, UserDto | { error: string }>`, so `req.params.id` is a string and `res.json` must match.",
      "`createUser` validates `req.body` with Zod before trusting it, then sends a `UserDto` with status 201.",
      "The error handler logs and returns a 500 JSON body.",
      "The curl comments show a 200 for an existing user and a 400 for a bad body.",
      "# Why it matters / when to use",
      "Every Express/TypeScript API: typed handlers catch mismatched response shapes and typos in params.",
      "Sharing DTO types with a front end so both sides agree on the contract.",
      "# Common mistakes",
      "Trusting the `ReqBody` generic as validation; it is not — validate at run time.",
      "Forgetting that params and query values are strings; convert with `Number(...)` and check `isNaN`.",
      "Not calling `express.json()` middleware, so `req.body` is `undefined`.",
      "Not handling async errors in Express 4, causing unhandled rejections and hanging requests.",
      "# Say this in the interview",
      "In Express with `@types/express`, `Request` and `RequestHandler` take generics in the order params, response body, request body, query, and inline handlers even infer route params from the path string. Those generics are only compile-time promises, so I validate `req.body` and `req.query` with Zod at run time and type responses with DTOs. I type error middleware with `ErrorRequestHandler`, and in Express 5 async errors reach it automatically.",
      "Follow-up: how do you add `req.user`?",
      "  Augment `Express.Request` via `declare global` in a `.d.ts` file (module augmentation).",
    ],
    code: `import express, { type ErrorRequestHandler, type RequestHandler } from "express";
import { z } from "zod";

type UserParams = { id: string };                 // URL params are strings
type UserDto = { id: number; name: string };
const CreateUserBody = z.object({ name: z.string().min(1) });

const users = new Map<number, UserDto>([[1, { id: 1, name: "Ana" }]]);

// RequestHandler<Params, ResBody, ReqBody, Query>
const getUser: RequestHandler<UserParams, UserDto | { error: string }> = (req, res) => {
  const user = users.get(Number(req.params.id));
  if (!user) return void res.status(404).json({ error: "not found" });
  res.json(user);                                 // checked against ResBody
};

const createUser: RequestHandler = (req, res) => {
  const parsed = CreateUserBody.safeParse(req.body); // runtime validation
  if (!parsed.success) return void res.status(400).json({ error: parsed.error.issues });
  const user: UserDto = { id: users.size + 1, name: parsed.data.name };
  users.set(user.id, user);
  res.status(201).json(user);
};

const onError: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "internal" });
};

const app = express();
app.use(express.json());                          // fills req.body
app.get("/users/:id", getUser);
app.post("/users", createUser);
app.use(onError);
app.listen(3000);
// curl localhost:3000/users/1                       → {"id":1,"name":"Ana"}
// curl -X POST -H "content-type: application/json" -d "{}" localhost:3000/users → 400`,
  },
  {
    id: 'generic-components',
    group: 'TS with React & Node',
    stars: 2,
    difficulty: 'Hard',
    q: 'How do you write a generic React component?',
    a: [
      "# ELI5",
      "Imagine a display shelf that can show any kind of item — books, toys, shoes — and it remembers what kind it is showing.",
      "If you put books on it, the price sticker printer knows it is printing for books, not shoes.",
      "A generic component is that shelf: it works with any data type, and TypeScript remembers which type you gave it.",
      "The shelf is a component like `List<T>`, and the items are the array of `T` you pass in.",
      "# What it is",
      "A generic is a type parameter (like `T`) that is filled in when the function is used, so the same code works for many types while staying type-safe.",
      "A generic component is a function component with a type parameter: `function List<T>(props: ListProps<T>)`.",
      "TS infers `T` from the props you pass, e.g. from `items`, and then checks other props like `renderItem` and `getKey` using the same `T`.",
      "This avoids `any` while letting one component work for users, orders, products and so on.",
      "In `.tsx` files, arrow-function generics need a trick: write `<T,>` or `<T extends unknown>` because `<T>` looks like a JSX tag.",
      "# How it works",
      "When you render `<List items={users} ... />`:",
      "  TS infers `T = User` from the `items` prop.",
      "  It contextually types `renderItem` and `getKey`, so their parameter `u` is a `User` without annotation.",
      "  Any mismatch (e.g. accessing `u.price` on a `User`) is a compile error.",
      "You can constrain `T`: `<T extends { id: string | number }>` to guarantee every item has an `id`.",
      "You can also set it explicitly in JSX: `<List<User> items={...} />`.",
      "# Example walkthrough",
      "`ListProps<T>` ties `items`, `renderItem` and `getKey` to the same `T`.",
      "`List` maps the items, calling `getKey` for the React `key` and `renderItem` for content.",
      "`Select` is an arrow-function generic using `<T,>` and a constraint requiring `id`.",
      "In `App`, `T` is inferred as `User`, so `u.name` works; the commented `u.price` fails.",
      "# Why it matters / when to use",
      "Reusable tables, lists, dropdowns, autocompletes and form fields used across many data types in admin panels.",
      "Data-fetching wrappers like `<Query<T>>` and design-system components.",
      "# Common mistakes",
      "Writing `const List = <T>(props) => ...` in a `.tsx` file and getting a JSX parse error; use `<T,>`.",
      "Using `any[]` for items, which loses type information for callbacks.",
      "Wrapping a generic component in `React.memo` or `forwardRef` and losing the generic (they return non-generic types); cast the result or use a typed wrapper.",
      "# Say this in the interview",
      "A generic component is a function component with a type parameter, like `function List<T>(props: { items: T[]; renderItem: (item: T) => ReactNode })`. TypeScript infers `T` from the props, so callbacks are typed automatically, and I can constrain it, for example `T extends { id: string }`. In arrow functions inside `.tsx` I write `<T,>` to avoid the JSX parsing clash.",
      "Follow-up: how do you pass the type explicitly?",
      "  In JSX: `<List<User> items={users} ... />`.",
    ],
    code: `import type { ReactNode } from "react";

type ListProps<T> = {
  items: T[];
  renderItem: (item: T) => ReactNode;
  getKey: (item: T) => string | number;
};

function List<T>({ items, renderItem, getKey }: ListProps<T>) {
  return <ul>{items.map((it) => <li key={getKey(it)}>{renderItem(it)}</li>)}</ul>;
}

// Arrow-function generic in .tsx: note the "<T,>" (or use a constraint)
const Select = <T extends { id: string | number; label: string },>(
  { options, onPick }: { options: T[]; onPick: (o: T) => void },
) => (
  <select onChange={(e) => onPick(options[e.currentTarget.selectedIndex]!)}>
    {options.map((o) => <option key={o.id}>{o.label}</option>)}
  </select>
);

type User = { id: number; name: string };
const users: User[] = [{ id: 1, name: "Ana" }, { id: 2, name: "Bo" }];

export function App() {
  return (
    <>
      <List items={users} getKey={(u) => u.id} renderItem={(u) => u.name} /> {/* T = User */}
      {/* renderItem={(u) => u.price}  ✗ Error: price does not exist on User */}
      <Select options={[{ id: "a", label: "Admin" }]} onPick={(o) => console.log(o.label)} />
    </>
  );
}`,
  },
  {
    id: 'typing-env-variables',
    group: 'TS with React & Node',
    stars: 2,
    difficulty: 'Medium',
    q: 'How do you type `process.env` in Node?',
    a: [
      "# ELI5",
      "Imagine the school office keeps a list of settings on sticky notes: the bell time, the lunch menu, the Wi-Fi password.",
      "Sometimes a note falls off, or someone writes ten instead of 10.",
      "A careful teacher checks every note in the morning before class starts, so the day does not go wrong at lunchtime.",
      "`process.env` is the sticky-note list, and typing plus validating it at startup is the morning check.",
      "# What it is",
      "`process.env` is an object in Node holding environment variables — key/value settings given to the process by the OS, Docker, CI or a `.env` file.",
      "`@types/node` types it as `NodeJS.ProcessEnv`, essentially `{ [key: string]: string | undefined }`, because any variable might be missing.",
      "All values are strings; `PORT=3000` is the string `\"3000\"`, not a number.",
      "Two approaches:",
      "  Type-only: augment `NodeJS.ProcessEnv` with your keys for autocomplete — but this does not check anything at run time.",
      "  Validate at startup (recommended): parse `process.env` with a schema (Zod, envalid, `@t3-oss/env`) into a typed, frozen `env` object, and crash early if something is wrong.",
      "Node 20.6+ can load `.env` files natively with `node --env-file=.env app.js`, and Node 21.7+ has `process.loadEnvFile()`.",
      "# How it works",
      "Validation approach, step by step:",
      "  Define a schema listing each variable, its type, and defaults.",
      "  Use coercion (`z.coerce.number()`) to turn strings like `\"3000\"` into numbers.",
      "  Call `safeParse(process.env)` once at startup.",
      "  On failure, print which variables are wrong and `process.exit(1)` — fail fast instead of crashing later in a request.",
      "  Export the parsed result; the rest of the app imports `env` instead of touching `process.env`.",
      "Type-only approach: `declare global { namespace NodeJS { interface ProcessEnv { DATABASE_URL: string } } }` — TS then assumes it exists even when it does not.",
      "# Example walkthrough",
      "`EnvSchema` requires `DATABASE_URL` as a URL, coerces `PORT` to a number with default 3000, and limits `NODE_ENV` to three values.",
      "`parsed` is checked; if it fails, the field errors are printed and the process exits.",
      "`env` is typed `{ DATABASE_URL: string; PORT: number; NODE_ENV: ... }`, so `env.PORT + 1` is real math.",
      "With the shown variables, it prints `3001 development`.",
      "# Why it matters / when to use",
      "Every backend service and container depends on config; validating it prevents wasted deploys that crash on the first DB call.",
      "Separating secrets (DB passwords, API keys) from code, as twelve-factor apps recommend.",
      "# Common mistakes",
      "Assuming `process.env.PORT` is a number; it is a string or `undefined`.",
      "Only augmenting `ProcessEnv` types and believing variables are guaranteed to exist.",
      "Reading `process.env` all over the codebase instead of once in a config module.",
      "Committing `.env` files with real secrets to Git; commit a `.env.example` instead.",
      "# Say this in the interview",
      "By default `process.env` is typed as a record of `string | undefined`, since any variable may be missing and values are always strings. I validate it once at startup with a Zod schema that coerces types and applies defaults, exit immediately if it fails, and export a typed `env` object that the rest of the app uses. Augmenting `NodeJS.ProcessEnv` only adds autocomplete and is not a safety check.",
      "Follow-up: how do you load a `.env` file without dotenv?",
      "  On Node 20.6+ run `node --env-file=.env server.js`.",
    ],
    code: `// src/env.ts — validate once at startup, then import { env } everywhere
import { z } from "zod";

const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().int().default(3000),   // "3000" → 3000
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

// Simulate the environment for this demo
process.env.DATABASE_URL ??= "postgres://localhost:5432/app";
process.env.PORT ??= "3000";

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid env:", parsed.error.flatten().fieldErrors);
  process.exit(1);                                // fail fast
}

export const env = Object.freeze(parsed.data);
// env: { DATABASE_URL: string; PORT: number; NODE_ENV: "development" | "test" | "production" }

console.log(env.PORT + 1, env.NODE_ENV);          // → 3001 development

// Type-only alternative (autocomplete, NO runtime check):
// declare global { namespace NodeJS { interface ProcessEnv { DATABASE_URL: string } } }

// Run with a .env file natively (Node 20.6+): node --env-file=.env dist/server.js`,
  },
  {
    id: 'types-at-runtime',
    group: 'Tricky & Output Questions',
    stars: 5,
    difficulty: 'Medium',
    q: 'Can you check whether a value is of an interface type at runtime?',
    a: [
      "# ELI5",
      "An interface is like a description in a wanted poster: tall, red hat, carries a bag.",
      "The poster is torn down before the town wakes up, so you cannot ask the poster about someone — you must look at the person yourself.",
      "In TypeScript, interfaces are removed before the code runs, so you must check the object's actual features (does it have a name? is it a string?).",
      "The poster is the interface, and looking at the person is a runtime check written in a type guard.",
      "# What it is",
      "Short answer: no, not directly. Interfaces and type aliases are erased during compilation, so nothing like `x instanceof User` exists for an interface.",
      "`instanceof` only works with classes (real constructor functions that exist at run time).",
      "`typeof` (the JS operator) only tells you the primitive category: `\"string\"`, `\"number\"`, `\"object\"`, `\"function\"` and so on.",
      "Ways to check the shape at run time:",
      "  A user-defined type guard — a function returning `value is User` that checks fields with `typeof` and `in`.",
      "  An assertion function — `asserts value is User` — which throws if the check fails.",
      "  A discriminant field — e.g. `kind: \"user\"` — checked with `===`.",
      "  A schema library (Zod, Valibot) that validates and infers the type.",
      "  Use a class instead of an interface when `instanceof` is truly needed.",
      "# How it works",
      "A type guard's return type `value is User` is a special signature:",
      "  You write ordinary JS checks inside and return `true` or `false`.",
      "  When it returns `true` in an `if`, TS narrows (makes more specific) the variable to `User` inside that block.",
      "  TS trusts your logic — if the checks are incomplete, TS cannot know, so the guard must be correct.",
      "The `in` operator (`\"name\" in obj`) checks whether a property exists, and TS also narrows with it.",
      "Since TS 5.5, simple arrow functions like `(x) => x !== null` can infer type predicates automatically.",
      "# Example walkthrough",
      "`isUser` checks the value is a non-null object, has `id` as a number and `name` as a string.",
      "`data` comes from `JSON.parse`, so it is typed `any`; we treat it as `unknown` to force checks.",
      "Inside `if (isUser(data))`, `data.name` is allowed and prints `Ana`.",
      "The second payload lacks a string name, so the guard returns false and prints `not a user`.",
      "The commented `instanceof User` line would be a compile error: User only refers to a type.",
      "# Why it matters / when to use",
      "Handling JSON from HTTP requests, queues and webhooks, where the actual shape is unknown.",
      "Narrowing union types in business logic (e.g. `Card | BankTransfer` payments).",
      "Interviewers ask this to check you understand type erasure.",
      "# Common mistakes",
      "Writing `if (obj instanceof MyInterface)`, which does not compile.",
      "A sloppy guard like `return \"id\" in x` that returns true for wrong shapes and lies to the compiler.",
      "Using `as User` instead of checking, which hides bugs until something crashes later.",
      "# Say this in the interview",
      "Not directly: interfaces are erased at compile time, so there is nothing to check against at run time, and `instanceof` only works for classes. I write a user-defined type guard returning `value is User` that checks the fields with `typeof` and `in`, use a discriminant field for unions, or for external data use a schema library like Zod that validates and infers the type in one place.",
      "Follow-up: what is an assertion function?",
      "  A function declared `asserts value is T` that throws if invalid; after calling it, TS treats the value as `T`.",
    ],
    code: `interface User { id: number; name: string }

// User-defined type guard: real JS checks + a type predicate
function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value && typeof value.id === "number" &&
    "name" in value && typeof value.name === "string"
  );
}

// Assertion function: throws instead of returning false
function assertUser(value: unknown): asserts value is User {
  if (!isUser(value)) throw new Error("not a user");
}

const data: unknown = JSON.parse('{"id":1,"name":"Ana"}');
if (isUser(data)) {
  console.log(data.name);            // → Ana   (narrowed to User)
}

const other: unknown = JSON.parse('{"id":2}');
console.log(isUser(other) ? "user" : "not a user"); // → not a user

assertUser(data);
console.log(data.id);                // → 1     (User from here on)

// if (data instanceof User) {}      // ✗ Error: 'User' only refers to a type`,
  },
  {
    id: 'let-const-widening',
    group: 'Tricky & Output Questions',
    stars: 4,
    difficulty: 'Easy',
    q: 'What are the inferred types here: `let a = "x"`, `const b = "x"`, `const c = { d: "x" }`, `const e = [1, "a"]`?',
    a: [
      "# ELI5",
      "If you put a cup on a shelf labelled exactly this blue cup, nothing else can ever go there — that is `const b`.",
      "If the shelf is labelled any cup, you can swap cups later — that is `let a`.",
      "A box (object) whose lid you can open is labelled any cup inside, because someone might swap the cup — that is `c.d`.",
      "TypeScript picks the tightest label that is still safe for how you might change the value later; loosening the label is called widening.",
      "# What it is",
      "Type inference is TS figuring out a type without you writing it.",
      "A literal type is a type for one exact value, like `\"x\"` or `42`.",
      "Widening is when TS turns a literal type into its general type (`\"x\"` → `string`) because the value could change.",
      "The answers:",
      "  `let a = \"x\"` → `string`: `let` can be reassigned, so TS widens.",
      "  `const b = \"x\"` → `\"x\"`: a `const` can never change, so the literal type is kept.",
      "  `const c = { d: \"x\" }` → `{ d: string }`: the variable is constant, but the property `d` can still be reassigned, so it widens.",
      "  `const e = [1, \"a\"]` → `(string | number)[]`: arrays are mutable and can change length, so TS infers an array of the union of element types, not a tuple.",
      "`as const` stops widening: `{ d: \"x\" } as const` is `{ readonly d: \"x\" }` and `[1, \"a\"] as const` is `readonly [1, \"a\"]`.",
      "# How it works",
      "When TS infers the type of an initialiser:",
      "  It first computes the literal type of the expression (`\"x\"`).",
      "  If the location is mutable (a `let` variable, an object property, an array element), it widens the literal to its base type.",
      "  For arrays, it computes the best common type of the elements: here the union `string | number`.",
      "  If the location is immutable (a `const` variable with a primitive value, or anything under `as const`), it keeps the literal.",
      "Contextual typing can also prevent widening, e.g. when the target type is already a literal union.",
      "TS 5.0+ also has `const` type parameters (`<const T>`) that infer literal types in generic calls.",
      "# Example walkthrough",
      "Each declaration is annotated with what you see when hovering in the editor.",
      "Assigning `a = \"y\"` works; assigning `c.d = \"z\"` works because `d` is `string`.",
      "`setMode(c.d)` fails because `string` is not `\"light\" | \"dark\"`, which is a typical bug this question targets.",
      "Using `as const` fixes it: `c2.d` is the literal `\"light\"`, and the call compiles and prints `light`.",
      "# Why it matters / when to use",
      "Passing config objects to functions expecting literal unions (HTTP methods, status values, modes) often fails because of widening.",
      "`as const` on lookup tables and route definitions keeps exact types for derived unions.",
      "Understanding tuple vs array inference matters for functions returning pairs like `[value, setValue]`.",
      "# Common mistakes",
      "Expecting `const c = { method: \"GET\" }` to have `method: \"GET\"` — it is `string`; use `as const` or `satisfies` with a typed target.",
      "Expecting `[1, \"a\"]` to be a tuple; annotate `[number, string]` or use `as const`.",
      "Thinking `const` makes objects immutable; it only locks the variable binding.",
      "# Say this in the interview",
      "`let a` is `string` because it can be reassigned, so the literal widens. `const b` keeps the literal type `\"x\"`. For `const c`, the binding is constant but the property is mutable, so it is `{ d: string }`, and `e` is `(string | number)[]` because arrays are mutable, not tuples. `as const` prevents widening and makes everything readonly literal types.",
      "Follow-up: how do you get a tuple without `as const`?",
      "  Annotate it, `const e: [number, string] = [1, \"a\"]`, or use a generic helper with a `const` type parameter.",
    ],
    code: `let a = "x";                  // string     (let can change → widened)
const b = "x";                // "x"        (const primitive → literal kept)
const c = { d: "x" };         // { d: string }  (property is mutable → widened)
const e = [1, "a"];           // (string | number)[]  (array, not tuple)

a = "y";                      // ✓
c.d = "z";                    // ✓ property is just string

function setMode(mode: "light" | "dark") {
  console.log(mode);
}
// setMode(c.d);              // ✗ Error: string is not assignable to "light" | "dark"

const c2 = { d: "light" } as const;      // { readonly d: "light" }
const e2 = [1, "a"] as const;            // readonly [1, "a"]
setMode(c2.d);                           // → light

// const type parameter (TS 5.0+): infer literals without "as const" at call site
function tuple<const T extends readonly unknown[]>(...xs: T) { return xs; }
const t = tuple(1, "a");                 // readonly [1, "a"]
console.log(typeof a, b, e.length, e2[1], t[0]); // → string x 2 a 1`,
  },
  {
    id: 'object-keys-string',
    group: 'Tricky & Output Questions',
    stars: 4,
    difficulty: 'Medium',
    q: 'Why does `Object.keys(obj)` return `string[]` instead of `(keyof T)[]`?',
    a: [
      "# ELI5",
      "Imagine a form that asks for at least a name and an age, but people are allowed to attach extra pages.",
      "If you list everything in the folder, you might find extra pages you did not ask for.",
      "TypeScript only knows the minimum an object must have, not everything it actually has, so `Object.keys` cannot promise to return only the keys from the type.",
      "The folder is the object at run time, and the form is its TypeScript type.",
      "# What it is",
      "`Object.keys(obj)` returns an array of the object's own enumerable property names at run time.",
      "`keyof T` is the union of property names declared in the type `T`.",
      "TypeScript's type system is structural: a value with extra properties can still be assigned to a type with fewer properties.",
      "So an object typed `{ a: number }` may actually be `{ a: 1, b: \"surprise\" }` at run time.",
      "If `Object.keys` returned `(keyof T)[]`, TS would claim the keys are only `\"a\"`, which could be a lie — so the official typing is `string[]`.",
      "This is a deliberate design decision by the TS team, not a bug.",
      "# How it works",
      "Step by step how extra keys sneak in:",
      "  `const full = { a: 1, b: \"x\" }` has type `{ a: number; b: string }`.",
      "  `const narrow: { a: number } = full` is allowed (extra properties are fine for non-literal assignments).",
      "  `Object.keys(narrow)` at run time returns `[\"a\", \"b\"]`.",
      "  If typed as `\"a\"[]`, then `narrow[key]` would be typed `number` while one value is actually the string `\"x\"`.",
      "Excess property checks only apply to fresh object literals written directly, not to variables passed around.",
      "# Example walkthrough",
      "`sumValues` iterates keys and adds values, typed `{ a: number; b: number }`.",
      "We pass `withExtra`, which also has a `label` string — allowed structurally.",
      "If keys were typed `(keyof T)[]`, `obj[k]` would be `number`, but the `label` value is a string, so the sum becomes `\"3hello\"`-style garbage at run time.",
      "The safe version uses explicit known keys, so the result is `3`.",
      "`typedKeys` shows the common helper cast, used only when you are sure no extra keys exist.",
      "# Why it matters / when to use",
      "Iterating config or DTO objects safely in backend code.",
      "Explains a very common it should know the keys complaint from developers.",
      "Choosing safer patterns: `Object.entries` with validation, a `Map`, or an explicit `as const` key list.",
      "# Common mistakes",
      "Casting `Object.keys(obj) as (keyof T)[]` everywhere without thinking about extra properties.",
      "Using `for...in`, which also includes inherited enumerable properties; prefer `Object.keys`/`Object.entries`.",
      "Indexing `obj[key]` with a `string` key and getting implicit `any` errors; use a typed key list or a `Record<string, V>` type.",
      "# Say this in the interview",
      "Because TypeScript is structural, an object typed `T` can carry extra properties at run time, so `Object.keys` cannot guarantee it returns only `keyof T` — it would be unsound. The library typing therefore returns `string[]`. When I know an object has exactly its declared keys, I use a small typed helper with a cast, or better, iterate over an explicit `as const` list of keys.",
      "Follow-up: does `Object.entries` have the same issue?",
      "  Yes, it returns `[string, T[keyof T]]`-like pairs for records, and keys are still `string`.",
    ],
    code: `type Totals = { a: number; b: number };

function sumValues(obj: Totals) {
  let sum = 0;
  for (const k of Object.keys(obj)) {            // k: string, not "a" | "b"
    // If k were typed "a" | "b", obj[k] would be number... but look below
    sum += (obj as any)[k];
  }
  return sum;
}

const withExtra = { a: 1, b: 2, label: "hello" };
const t: Totals = withExtra;                     // ✓ structural: extra keys allowed
console.log(Object.keys(t));                     // → [ 'a', 'b', 'label' ]
console.log(sumValues(t));                       // → 3hello  (string concatenation!)

// Safe: iterate an explicit, known list of keys
const KEYS = ["a", "b"] as const;
const safe = KEYS.reduce((s, k) => s + t[k], 0); // k: "a" | "b", t[k]: number
console.log(safe);                               // → 3

// Common helper — only use when you KNOW there are no extra keys
const typedKeys = <T extends object>(o: T) => Object.keys(o) as (keyof T)[];
console.log(typedKeys({ x: 1, y: 2 }));          // → [ 'x', 'y' ]`,
  },
  {
    id: 'no-unchecked-indexed-access',
    group: 'Tricky & Output Questions',
    stars: 3,
    difficulty: 'Medium',
    q: 'Why does `const x = arr[10]` have type `number` instead of `number | undefined`?',
    a: [
      "# ELI5",
      "Imagine a row of 3 lockers and you ask for locker number 10.",
      "There is no locker 10, so you get nothing — but the label printer still printed a label saying you will get a book.",
      "TypeScript by default trusts that the locker exists, to keep code short; a stricter setting makes it warn you might get nothing.",
      "The lockers are an array, the label is the type `number`, and nothing is `undefined`.",
      "# What it is",
      "In JavaScript, reading an index that does not exist returns `undefined`; it does not throw an error.",
      "By default, TS types `arr[i]` on a `number[]` as `number`, assuming the index is valid.",
      "This is a deliberate trade-off: tracking every index would make common loops noisy with checks.",
      "The compiler option `noUncheckedIndexedAccess: true` (TS 4.1+) changes this so array index access and index-signature access (like `record[key]` on `Record<string, V>`) include `| undefined`.",
      "It is not part of `strict`; you enable it separately.",
      "Tuples with known length (`[number, number]`) are unaffected for valid literal indexes.",
      "# How it works",
      "Without the flag:",
      "  `const x = arr[10]` is typed `number`, so `x.toFixed()` compiles but crashes at run time with TypeError: Cannot read properties of undefined.",
      "With the flag:",
      "  `arr[10]` is typed `number | undefined`.",
      "  You must handle `undefined` with a check, `??` default, optional chaining, or the non-null assertion `!` if you are certain.",
      "  `for...of` loops and array methods like `map`/`forEach` still give plain `number`, since they only visit real elements.",
      "  Classic `for (let i = 0; i < arr.length; i++)` loops will need `arr[i]!` or a check.",
      "`arr.at(-1)` is always typed `T | undefined`, regardless of the flag.",
      "# Example walkthrough",
      "`scores` has three numbers; `scores[10]` is `undefined` at run time.",
      "The comment shows the default type `number` and the crash that would happen if we called a method on it.",
      "With the flag on (as assumed in the snippet), `x` is `number | undefined`, so we use `?? 0` to print `0`.",
      "`config[\"timeout\"]` from a `Record<string, number>` is also `number | undefined` and handled with `??`.",
      "The `for...of` loop needs no checks and prints the sum `270`.",
      "# Why it matters / when to use",
      "Prevents crashes on empty query results (`rows[0]`), missing map/record keys and parsing CSV columns.",
      "Recommended for new backend projects where data from DB/HTTP is often shorter than expected.",
      "# Common mistakes",
      "Assuming `strict: true` includes it — it does not.",
      "Spraying `!` everywhere to silence errors, which removes the safety; prefer checks or `??`.",
      "Using index loops when `for...of` or array methods would avoid the issue entirely.",
      "# Say this in the interview",
      "By default TypeScript assumes index access is in bounds, so `arr[10]` is typed `number` even though at run time it is `undefined` — a deliberate trade-off for convenience. Enabling `noUncheckedIndexedAccess`, which is not part of `strict`, adds `| undefined` to array and index-signature reads, forcing a check. I turn it on in new projects and use `for...of`, `??` or explicit checks to handle it.",
      "Follow-up: does it affect `Map.get`?",
      "  No, `Map.get` is already typed `V | undefined` regardless of the flag.",
    ],
    code: `// tsconfig.json: { "compilerOptions": { "strict": true, "noUncheckedIndexedAccess": true } }

const scores: number[] = [90, 80, 100];

const x = scores[10];
// Without the flag: x is number → x.toFixed() compiles, then crashes at run time:
//   TypeError: Cannot read properties of undefined (reading 'toFixed')
// With the flag:    x is number | undefined → must be handled
console.log(x);                              // → undefined
console.log((x ?? 0).toFixed(1));            // → 0.0

const config: Record<string, number> = { retries: 3 };
const timeout = config["timeout"] ?? 5000;   // number | undefined → number
console.log(timeout);                        // → 5000

let sum = 0;
for (const s of scores) sum += s;            // for...of: s is plain number
console.log(sum);                            // → 270

const first = scores[0];
if (first !== undefined) console.log(first); // → 90  (narrowed by the check)
console.log(scores.at(-1));                  // → 100 (always number | undefined)`,
  },
  {
    id: 'enum-reverse-mapping-output',
    group: 'Tricky & Output Questions',
    stars: 2,
    difficulty: 'Medium',
    q: 'Given `enum E { A, B = 5, C }`, what are `E.C`, `E[5]` and `Object.keys(E)`?',
    a: [
      "# ELI5",
      "Imagine numbering seats in a theatre: seat A gets 0, then someone says seat B is number 5, and the next seat C simply continues to 6.",
      "The usher also has a reverse list: if you show ticket number 5, it tells you that is seat B.",
      "A numeric enum is that seating chart: names to numbers, plus an automatic numbers-to-names reverse list.",
      "Because both lists live in the same object, listing its keys shows names and numbers together.",
      "# What it is",
      "An enum is a TypeScript feature that defines a set of named constants; unlike most TS features it emits a real JavaScript object.",
      "In a numeric enum, members without a value auto-increment from the previous member (the first defaults to 0).",
      "Numeric enums get a reverse mapping: the object also stores number → name entries.",
      "The answers:",
      "  `E.A` is `0` (default first value).",
      "  `E.B` is `5` (explicit).",
      "  `E.C` is `6` (previous value + 1).",
      "  `E[5]` is `\"B\"` (reverse mapping).",
      "  `Object.keys(E)` is `[\"0\", \"5\", \"6\", \"A\", \"B\", \"C\"]`.",
      "String enum members (`A = \"a\"`) do NOT get reverse mappings.",
      "# How it works",
      "TS compiles the enum to an IIFE (immediately invoked function) that fills an object:",
      "  `E[E[\"A\"] = 0] = \"A\"` — first sets `E.A = 0`, and the assignment expression evaluates to `0`, so it then sets `E[0] = \"A\"`.",
      "  Same for B with 5 and C with 6.",
      "So the object is `{ A: 0, \"0\": \"A\", B: 5, \"5\": \"B\", C: 6, \"6\": \"C\" }`.",
      "`Object.keys` orders keys by JavaScript rules: integer-like keys first in ascending numeric order, then string keys in insertion order.",
      "That is why the numbers `\"0\", \"5\", \"6\"` come before `\"A\", \"B\", \"C\"` even though they were inserted interleaved.",
      "# Example walkthrough",
      "The snippet declares the enum and logs each expression.",
      "`E.C` prints `6`, `E[5]` prints `B`.",
      "`Object.keys(E)` prints both numeric and name keys, so it has length 6, not 3.",
      "To get only names, filter out numeric keys with `isNaN(Number(k))`, which prints `[ 'A', 'B', 'C' ]`.",
      "The commented output shows the compiled IIFE.",
      "# Why it matters / when to use",
      "Building dropdowns or validation lists from enums: naive `Object.keys` or `Object.values` gives doubled results for numeric enums.",
      "Logging enum values: `E[value]` turns a stored number back into a readable name.",
      "Many teams prefer string enums or `as const` objects plus union types to avoid these surprises.",
      "# Common mistakes",
      "Expecting `Object.keys(E).length` to be 3 for a numeric enum.",
      "Expecting reverse mapping on string enums; `E[\"a\"]` is `undefined` there.",
      "Using `const enum` with `isolatedModules` or across package boundaries, where it is not inlined properly; it has no runtime object at all.",
      "# Say this in the interview",
      "`E.A` is 0, `E.B` is 5 and `E.C` auto-increments to 6. Numeric enums also get a reverse mapping, so `E[5]` is `\"B\"`, and `Object.keys(E)` returns six keys: `\"0\"`, `\"5\"`, `\"6\"` first because integer-like keys are ordered first, then `\"A\"`, `\"B\"`, `\"C\"`. String enums do not have reverse mappings, which is one reason many teams prefer them or `as const` objects.",
      "Follow-up: how do you get only the names?",
      "  `Object.keys(E).filter((k) => isNaN(Number(k)))`.",
    ],
    code: `enum E { A, B = 5, C }

console.log(E.A);              // → 0
console.log(E.C);              // → 6   (B is 5, so C = 5 + 1)
console.log(E[5]);             // → B   (reverse mapping: number → name)
console.log(Object.keys(E));   // → [ '0', '5', '6', 'A', 'B', 'C' ]
console.log(Object.keys(E).filter((k) => isNaN(Number(k)))); // → [ 'A', 'B', 'C' ]

// Compiled JavaScript:
// var E;
// (function (E) {
//   E[E["A"] = 0] = "A";   // E.A = 0  AND  E[0] = "A"
//   E[E["B"] = 5] = "B";
//   E[E["C"] = 6] = "C";
// })(E || (E = {}));

enum S { A = "a" }             // string enum: no reverse mapping
console.log(Object.keys(S));   // → [ 'A' ]`,
  },
  {
    id: 'is-typescript-sound',
    group: 'Tricky & Output Questions',
    stars: 1,
    difficulty: 'Hard',
    q: 'Is the TypeScript type system sound? Give examples of unsoundness.',
    a: [
      "# ELI5",
      "A security guard at a door checks badges carefully, but there are a few side doors left open on purpose so deliveries can come in quickly.",
      "Most of the time the guard catches problems, but someone could sneak in through a side door.",
      "TypeScript is a very good guard with a few deliberate side doors, chosen to keep everyday coding convenient.",
      "Sound would mean no side doors at all: if the code type-checks, it can never have a type error at run time.",
      "# What it is",
      "A type system is sound if every program it accepts is guaranteed never to have a value of the wrong type at run time.",
      "TypeScript is intentionally not sound; its design goals explicitly put usefulness and compatibility with JavaScript patterns above full soundness.",
      "Known sources of unsoundness:",
      "  `any` — turns off checking entirely and spreads to anything it touches.",
      "  Type assertions (`as`) — you can claim a value is a type it is not.",
      "  Non-null assertion (`!`) — claims a value is not `null`/`undefined` without checking.",
      "  Array covariance — a `Dog[]` can be used as an `Animal[]`, then a `Cat` pushed into it.",
      "  Method parameter bivariance — method-style parameters are checked loosely even with `strictFunctionTypes`.",
      "  Index access without `noUncheckedIndexedAccess` — `arr[99]` is typed `T` but is `undefined`.",
      "  Wrong type guards and `declare`d values — TS trusts your predicates and declarations.",
      "  Optional properties and spreads, and narrowing that is not invalidated after a callback mutates a variable.",
      "# How it works",
      "Each hole exists for a reason:",
      "  Covariant arrays keep common read-only usage of arrays easy (`function printAll(xs: Animal[])` accepts `Dog[]`).",
      "  Bivariant methods keep DOM and library types like `Array<T>.push` compatible.",
      "  Unchecked index access avoids forcing checks in every loop.",
      "  `any` and `as` are escape hatches for gradual migration from JavaScript.",
      "Compiler flags (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) and lint rules (`no-explicit-any`, `no-non-null-assertion`) close many of them.",
      "# Example walkthrough",
      "Covariance: `dogs` is passed as `Animal[]` to `addCat`, which pushes a cat; later `dogs[1].bark()` crashes.",
      "Assertion: `\"hello\" as unknown as number` compiles; calling `toFixed` on it throws.",
      "Index access: `[1, 2][5]` is typed `number` (without the flag) but is `undefined`.",
      "Narrowing: `x` is narrowed to `string`, a callback later sets it to `null`, but TS keeps the old narrowing inside the callback-calling code.",
      "Each error is caught and its message printed to show the runtime failure.",
      "# Why it matters / when to use",
      "Shows a senior-level understanding: types reduce bugs but do not replace runtime validation and tests.",
      "Guides team practices: ban `any` and `as` in reviews, enable strict flags, validate boundaries with Zod.",
      "# Common mistakes",
      "Claiming TS guarantees no runtime type errors — it does not.",
      "Using `as` to silence errors instead of fixing types or validating data.",
      "Mutating arrays received as parameters, which interacts badly with covariance; take `readonly T[]` instead.",
      "# Say this in the interview",
      "No — TypeScript is deliberately unsound to stay practical with JavaScript. Examples are `any` and `as` assertions, covariant mutable arrays where you can push a `Cat` into a `Dog[]` seen as `Animal[]`, bivariant method parameters, and unchecked index access returning `T` instead of `T | undefined`. I reduce the risk with strict flags like `noUncheckedIndexedAccess`, lint rules against `any` and non-null assertions, `readonly` arrays, and runtime validation at boundaries.",
      "Follow-up: name a sound typed language for comparison.",
      "  Languages like Elm, Haskell and (largely) Rust and OCaml aim for soundness; Flow also aimed for more soundness than TS.",
    ],
    code: `interface Animal { name: string }
interface Dog extends Animal { bark(): string }
interface Cat extends Animal { meow(): string }

// 1) Array covariance: Dog[] accepted as Animal[], then mutated
function addCat(list: Animal[]) {
  list.push({ name: "Tom", meow: () => "meow" } as Cat);
}
const dogs: Dog[] = [{ name: "Rex", bark: () => "woof" }];
addCat(dogs);                                   // ✓ compiles
try { dogs[1].bark(); } catch (e) { console.log((e as Error).message); }
// → dogs[1].bark is not a function

// 2) Type assertions lie
const n = "hello" as unknown as number;         // ✓ compiles
try { n.toFixed(1); } catch (e) { console.log((e as Error).message); }
// → n.toFixed is not a function

// 3) Unchecked index access (without noUncheckedIndexedAccess)
const nums = [1, 2];
const missing: number = nums[5];                // typed number, really undefined
console.log(missing);                           // → undefined

// 4) Narrowing is not invalidated by callbacks
let x: string | null = "hi";
const reset = () => { x = null; };
if (x !== null) {
  reset();
  try { console.log(x.length); } catch (e) { console.log((e as Error).message); }
  // TS still thinks x is string → Cannot read properties of null (reading 'length')
}`,
  },
];

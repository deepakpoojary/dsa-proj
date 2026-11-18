import type { BankQuestion } from './types';

export const PYTHON_1: BankQuestion[] = [
  // ───────────────────────── Basics & Types ─────────────────────────
  {
    id: 'interpreted-or-compiled',
    group: 'Basics & Types',
    stars: 4,
    difficulty: 'Easy',
    q: 'Is Python compiled or interpreted?',
    a: [
      'Both: CPython first compiles source to bytecode, then the interpreter (a stack-based virtual machine) executes that bytecode.',
      'Bytecode for imported modules is cached as `.pyc` files in `__pycache__` and reused if the source has not changed.',
      'There is no separate ahead-of-time compile step for the user; compilation happens on import/run.',
      'Use the `dis` module to inspect bytecode: `dis.dis(func)`.',
      'Other implementations exist: PyPy (tracing JIT), Jython (JVM), MicroPython; CPython 3.13+ also ships an experimental JIT.',
      'Python is a language spec; "slow" usually refers to CPython interpreter overhead, not the language itself.',
    ],
    code: `import dis

def add(a, b):
    return a + b

dis.dis(add)  # LOAD_FAST a, LOAD_FAST b, BINARY_OP +, RETURN_VALUE`,
  },
  {
    id: 'dynamic-strong-typing',
    group: 'Basics & Types',
    stars: 4,
    difficulty: 'Easy',
    q: 'Is Python dynamically or statically typed, and strongly or weakly typed?',
    a: [
      'Dynamically typed: types belong to objects, not variables; a name can be rebound to any type at runtime.',
      'Strongly typed: no implicit coercion between unrelated types, so `"1" + 1` raises `TypeError`.',
      'Numeric widening is allowed (`1 + 2.5` gives `3.5`) because `int`, `float`, `complex` form a numeric tower.',
      'Type hints (`x: int`) are not enforced at runtime; tools like mypy/pyright check them statically.',
      'Duck typing: code relies on what an object can do (methods it has), not on its declared class.',
      'Use `type(x)` for the exact type and `isinstance(x, T)` for checks that respect inheritance.',
    ],
    code: `x = 10
x = "ten"        # fine: dynamic
"1" + 1          # TypeError: strong typing
1 + 2.5          # 3.5: numeric promotion
isinstance(True, int)  # True: bool subclasses int`,
  },
  {
    id: 'mutable-vs-immutable',
    group: 'Basics & Types',
    stars: 5,
    difficulty: 'Easy',
    q: 'What are mutable and immutable types in Python?',
    a: [
      'Immutable: value cannot change after creation: `int`, `float`, `bool`, `str`, `bytes`, `tuple`, `frozenset`, `None`.',
      'Mutable: can be changed in place: `list`, `dict`, `set`, `bytearray`, most user-defined objects.',
      '"Changing" an immutable creates a new object: `s += "x"` rebinds `s` to a new string (check with `id()`).',
      'Only immutable (more precisely, hashable) objects can be dict keys or set members.',
      'A tuple is immutable but can hold mutable items, so its contents can still change indirectly.',
      'Mutability matters for aliasing, default arguments and thread safety.',
    ],
    code: `a = [1, 2]
b = a
b.append(3)
print(a)        # [1, 2, 3]  same object

s = "hi"
t = s
t += "!"
print(s, t)     # hi hi!  new string created`,
  },
  {
    id: 'pass-by-object-reference',
    group: 'Basics & Types',
    stars: 5,
    difficulty: 'Medium',
    q: 'Is Python pass-by-value or pass-by-reference?',
    a: [
      'Neither exactly: it is "pass by object reference" (call by sharing).',
      'The function receives a reference to the same object; the parameter is a new local name bound to it.',
      'Mutating a mutable argument (`lst.append(x)`) is visible to the caller.',
      'Rebinding the parameter (`lst = [9]`) only changes the local name; the caller is unaffected.',
      'Immutable arguments therefore behave like pass-by-value, since they cannot be mutated.',
    ],
    code: `def mutate(lst):
    lst.append(4)      # visible to caller

def rebind(lst):
    lst = [99]         # local only

nums = [1, 2, 3]
mutate(nums); rebind(nums)
print(nums)            # [1, 2, 3, 4]`,
  },
  {
    id: 'truthiness',
    group: 'Basics & Types',
    stars: 4,
    difficulty: 'Easy',
    q: 'Which values are falsy in Python, and how should you check for `None`?',
    a: [
      'Falsy: `None`, `False`, `0`, `0.0`, `0j`, `Decimal(0)`, `""`, `[]`, `()`, `{}`, `set()`, `range(0)`.',
      'Everything else is truthy by default, including `"0"`, `"False"` and `[0]`.',
      'Custom objects decide via `__bool__`, falling back to `__len__`; if neither exists they are truthy.',
      '`None` is a singleton; compare with `x is None`, not `x == None` (which can be overridden by `__eq__`).',
      '`if not x:` treats `0` and `""` the same as `None`; use `if x is None:` when 0 or empty is a valid value.',
    ],
    code: `def f(limit=None):
    if limit is None:   # correct: 0 is a valid limit
        limit = 10
    return limit

print(f(0))     # 0
print(bool([0]), bool(""), bool("0"))  # True False True`,
  },
  {
    id: 'and-or-short-circuit',
    group: 'Basics & Types',
    stars: 3,
    difficulty: 'Easy',
    q: 'What do `and` and `or` return in Python?',
    a: [
      'They return one of the operands, not necessarily a `bool`.',
      '`a or b` returns `a` if `a` is truthy, else `b`.',
      '`a and b` returns `a` if `a` is falsy, else `b`.',
      'Both short-circuit: the second operand is not evaluated if the first decides the result.',
      'Common idiom: `name = user_input or "default"` (careful: also replaces `0` and `""`).',
      '`not` always returns a real `bool`.',
    ],
    code: `print(0 or "x")       # x
print([] and 1/0)     # []  (1/0 never evaluated)
print(3 and 5)        # 5
print(not "abc")      # False`,
  },
  {
    id: 'division-operators',
    group: 'Basics & Types',
    stars: 3,
    difficulty: 'Easy',
    q: 'What is the difference between `/`, `//` and `%` in Python 3?',
    a: [
      '`/` is true division and always returns a `float`: `7 / 2 == 3.5`, `4 / 2 == 2.0`.',
      '`//` is floor division: rounds toward negative infinity, so `-7 // 2 == -4` (not -3).',
      '`%` takes the sign of the divisor so that `a == (a // b) * b + a % b`: `-7 % 2 == 1`.',
      '`int(-3.5)` truncates toward zero (`-3`), unlike `//`.',
      '`divmod(a, b)` returns `(a // b, a % b)` in one call.',
      '`round()` uses banker\'s rounding (round half to even): `round(2.5) == 2`, `round(3.5) == 4`.',
    ],
    code: `print(7 / 2, 7 // 2, 7 % 2)     # 3.5 3 1
print(-7 // 2, -7 % 2)          # -4 1
print(int(-3.5), divmod(17, 5)) # -3 (3, 2)
print(round(2.5), round(3.5))   # 2 4`,
  },
  {
    id: 'int-and-float-precision',
    group: 'Basics & Types',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do Python integers and floats differ in precision?',
    a: [
      '`int` has arbitrary precision: it grows as needed, so there is no integer overflow.',
      'Since 3.11, converting huge ints to/from `str` is capped (default 4300 digits) to avoid DoS; see `sys.set_int_max_str_digits`.',
      '`float` is an IEEE 754 64-bit double, so `0.1 + 0.2 != 0.3`.',
      'Compare floats with `math.isclose(a, b)`, not `==`.',
      'Use `decimal.Decimal` for exact base-10 money maths and `fractions.Fraction` for exact rationals.',
      '`float("nan") != float("nan")`, and `float("inf")` is a handy sentinel for min/max searches.',
    ],
    code: `import math
from decimal import Decimal

print(2 ** 100)                       # exact big int
print(0.1 + 0.2 == 0.3)               # False
print(math.isclose(0.1 + 0.2, 0.3))   # True
print(Decimal("0.1") + Decimal("0.2"))  # 0.3`,
  },

  // ───────────────────────── Strings & Collections ─────────────────────────
  {
    id: 'list-vs-tuple',
    group: 'Strings & Collections',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is the difference between a list and a tuple?',
    a: [
      '`list` is mutable (append, remove, sort in place); `tuple` is immutable.',
      'Tuples are hashable if all their items are hashable, so they can be dict keys or set members.',
      'Tuples are slightly smaller in memory and faster to create; constant tuples can be folded at compile time.',
      'Convention: lists for homogeneous sequences of variable length, tuples for fixed-size records (e.g. `(x, y)`).',
      'A one-element tuple needs a trailing comma: `(1,)`; `(1)` is just the int 1.',
      'For named fields use `collections.namedtuple` or `typing.NamedTuple`.',
    ],
    code: `point = (3, 4)
grid = {point: "A"}      # tuple as key
print(type((1)), type((1,)))  # int, tuple

nums = [3, 1, 2]
nums.sort()               # lists mutate in place`,
  },
  {
    id: 'dict-internals',
    group: 'Strings & Collections',
    stars: 4,
    difficulty: 'Medium',
    q: 'How does a Python dict work internally?',
    a: [
      'It is a hash table: the key\'s `hash()` picks a slot, and `==` confirms the match on collisions.',
      'Collisions are resolved with open addressing (perturbed probing), not chaining.',
      'Since 3.6 (CPython) the layout is "compact": a sparse index array plus a dense entries array, which saves memory.',
      'Insertion order is preserved, guaranteed by the language since Python 3.7.',
      'Average O(1) lookup, insert and delete; worst case O(n) with many collisions.',
      'The table resizes when about two thirds full; mutating a dict while iterating it raises `RuntimeError`.',
    ],
    code: `d = {"b": 1, "a": 2}
d["c"] = 3
print(list(d))          # ['b', 'a', 'c']  insertion order
print(d.get("x", 0))    # 0  no KeyError
for k, v in d.items():
    print(k, v)`,
  },
  {
    id: 'hashable',
    group: 'Strings & Collections',
    stars: 4,
    difficulty: 'Medium',
    q: 'What makes an object hashable, and why must dict keys be hashable?',
    a: [
      'Hashable = has a `__hash__` that never changes during its lifetime and an `__eq__` consistent with it.',
      'Rule: if `a == b` then `hash(a) == hash(b)` (the reverse need not hold).',
      'Immutable built-ins (`int`, `str`, `tuple` of hashables, `frozenset`) are hashable; `list`, `dict`, `set` are not.',
      'Keys must be hashable because the hash decides the bucket; if it changed, the key could never be found again.',
      'User objects hash by identity by default; defining `__eq__` without `__hash__` sets `__hash__` to `None`.',
      'Use `frozenset` or `tuple` to turn a set or list into a usable key.',
    ],
    code: `print(hash((1, 2)))      # works
try:
    {[1, 2]: "x"}
except TypeError as e:
    print(e)             # unhashable type: 'list'
print({frozenset({1, 2}): "ok"})`,
  },
  {
    id: 'set-operations',
    group: 'Strings & Collections',
    stars: 3,
    difficulty: 'Easy',
    q: 'What are sets used for, and what operations do they support?',
    a: [
      'A `set` is an unordered collection of unique, hashable items backed by a hash table.',
      'Membership `x in s` is O(1) on average versus O(n) for a list.',
      'Operators: `|` union, `&` intersection, `-` difference, `^` symmetric difference, `<=` subset.',
      '`{}` creates an empty dict; use `set()` for an empty set.',
      '`frozenset` is the immutable, hashable variant.',
      'Common uses: dedupe (`list(set(xs))` loses order; `list(dict.fromkeys(xs))` keeps it), fast lookups.',
    ],
    code: `a, b = {1, 2, 3}, {2, 3, 4}
print(a | b, a & b, a - b, a ^ b)
# {1, 2, 3, 4} {2, 3} {1} {1, 4}

xs = [3, 1, 3, 2, 1]
print(list(dict.fromkeys(xs)))  # [3, 1, 2]`,
  },
  {
    id: 'slicing',
    group: 'Strings & Collections',
    stars: 4,
    difficulty: 'Easy',
    q: 'How does slicing work in Python?',
    a: [
      'Syntax `seq[start:stop:step]`; `stop` is exclusive and every part is optional.',
      'Negative indices count from the end: `s[-1]` is the last item, `s[-3:]` the last three.',
      '`s[::-1]` returns a reversed copy.',
      'Slicing never raises `IndexError` for out-of-range bounds; it just clamps.',
      'Slicing a list returns a new shallow copy (`lst[:]` is a common copy idiom).',
      'Slice assignment can replace or delete ranges: `lst[1:3] = [9]`, `del lst[::2]`.',
    ],
    code: `s = [0, 1, 2, 3, 4, 5]
print(s[1:4], s[::2], s[-2:])   # [1, 2, 3] [0, 2, 4] [4, 5]
print(s[::-1])                   # [5, 4, 3, 2, 1, 0]
print(s[10:20])                  # []  no error
s[1:3] = ["x"]
print(s)                         # [0, 'x', 3, 4, 5]`,
  },
  {
    id: 'shallow-vs-deep-copy',
    group: 'Strings & Collections',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is the difference between assignment, a shallow copy and a deep copy?',
    a: [
      'Assignment (`b = a`) copies nothing: both names refer to the same object.',
      'Shallow copy creates a new outer container but shares the inner objects: `copy.copy(a)`, `a[:]`, `list(a)`, `a.copy()`.',
      'Deep copy recursively copies everything: `copy.deepcopy(a)`.',
      'With a shallow copy, mutating a nested list shows up in both copies.',
      '`deepcopy` handles cycles with a memo dict; classes can customise via `__copy__` / `__deepcopy__`.',
    ],
    code: `import copy
a = [[1, 2], [3]]
s = copy.copy(a)
d = copy.deepcopy(a)
a[0].append(99)
print(s)   # [[1, 2, 99], [3]]  shares inner lists
print(d)   # [[1, 2], [3]]      fully independent`,
  },
  {
    id: 'string-immutability-join',
    group: 'Strings & Collections',
    stars: 4,
    difficulty: 'Easy',
    q: 'Why should you use `str.join` instead of `+=` to build strings in a loop?',
    a: [
      '`str` is immutable, so each `+=` may create a new string and copy all previous characters: O(n^2) overall.',
      "`''.join(parts)` computes the total size once and copies each piece once: O(n).",
      'CPython sometimes optimises `s += t` in place, but that is an implementation detail; do not rely on it.',
      'Collect pieces in a list (or use a generator) and join at the end; `io.StringIO` also works.',
      "`str` holds Unicode text; `bytes` holds raw bytes; convert with `.encode()` / `.decode()`.",
    ],
    code: `words = ["a", "b", "c"]
print("-".join(words))           # a-b-c
print("".join(str(i) for i in range(5)))  # 01234

s = "hello"
# s[0] = "H"  -> TypeError: str is immutable
print("H" + s[1:])               # Hello`,
  },
  {
    id: 'collection-complexity',
    group: 'Strings & Collections',
    stars: 4,
    difficulty: 'Medium',
    q: 'What are the time complexities of common list, dict and set operations?',
    a: [
      'List: index/assign O(1), `append` amortised O(1), `pop()` O(1), `insert(0, x)` / `pop(0)` O(n), `x in lst` O(n).',
      'Dict / set: get, set, delete and `in` are O(1) on average.',
      'Sorting (`sort`, `sorted`) is Timsort: O(n log n), stable, O(n) on already-sorted data.',
      '`len()` is O(1) for all built-in containers.',
      'Use `collections.deque` for O(1) appends/pops at both ends (queues, BFS).',
      'Use `heapq` for O(log n) push/pop of the smallest item (priority queue).',
    ],
    code: `from collections import deque
q = deque([1, 2, 3])
q.appendleft(0)     # O(1)
q.popleft()         # O(1), vs list.pop(0) O(n)

seen = set()
print(5 in seen)    # O(1) average`,
  },
  {
    id: 'collections-module',
    group: 'Strings & Collections',
    stars: 4,
    difficulty: 'Easy',
    q: 'Which `collections` module types should you know?',
    a: [
      '`Counter`: counts hashables; `most_common(k)`, supports `+`/`-` between counters.',
      '`defaultdict(factory)`: missing keys are created with `factory()`, e.g. `defaultdict(list)` for grouping.',
      '`deque`: double-ended queue with O(1) ends and optional `maxlen` (sliding window, last-N items).',
      '`namedtuple`: lightweight immutable record with named fields.',
      '`OrderedDict`: has `move_to_end` and order-sensitive equality; classic for LRU caches.',
      '`ChainMap`: views several dicts as one, for layered config lookups.',
    ],
    code: `from collections import Counter, defaultdict

print(Counter("banana").most_common(2))  # [('a', 3), ('n', 2)]

groups = defaultdict(list)
for w in ["apple", "avocado", "bean"]:
    groups[w[0]].append(w)
print(dict(groups))  # {'a': ['apple', 'avocado'], 'b': ['bean']}`,
  },
  {
    id: 'sort-vs-sorted',
    group: 'Strings & Collections',
    stars: 4,
    difficulty: 'Easy',
    q: 'What is the difference between `list.sort()` and `sorted()`?',
    a: [
      '`list.sort()` sorts in place and returns `None`; it only exists on lists.',
      '`sorted(iterable)` works on any iterable and returns a new list.',
      'Both accept `key=` (a function applied to each item) and `reverse=True`.',
      'Both are stable, so you can sort by multiple keys in passes or with a tuple key.',
      'Classic bug: `lst = lst.sort()` sets `lst` to `None`.',
      'Mixed incomparable types (e.g. `int` and `str`) raise `TypeError` in Python 3.',
    ],
    code: `people = [("ann", 30), ("bob", 25), ("cy", 30)]
by_age_then_name = sorted(people, key=lambda p: (-p[1], p[0]))
print(by_age_then_name)  # [('ann', 30), ('cy', 30), ('bob', 25)]

nums = [3, 1, 2]
print(nums.sort())       # None
print(nums)              # [1, 2, 3]`,
  },

  // ───────────────────────── Functions & Scope ─────────────────────────
  {
    id: 'args-kwargs',
    group: 'Functions & Scope',
    stars: 5,
    difficulty: 'Easy',
    q: 'What are `*args` and `**kwargs`?',
    a: [
      '`*args` collects extra positional arguments into a tuple.',
      '`**kwargs` collects extra keyword arguments into a dict.',
      'The names are convention; the `*` and `**` are what matter.',
      'Parameter order: regular, `*args`, keyword-only, `**kwargs`.',
      'At a call site, `*` and `**` unpack: `f(*lst, **d)`.',
      'Typical use: wrappers/decorators that forward any arguments to another function.',
    ],
    code: `def show(a, *args, sep="-", **kwargs):
    print(a, args, sep, kwargs)

show(1, 2, 3, sep="+", x=9)  # 1 (2, 3) + {'x': 9}

nums, opts = [1, 2], {"sep": "/"}
show(*nums, **opts)           # 1 (2,) / {}`,
  },
  {
    id: 'positional-keyword-only',
    group: 'Functions & Scope',
    stars: 3,
    difficulty: 'Medium',
    q: 'What do `/` and `*` mean in a function signature?',
    a: [
      'Parameters before `/` are positional-only (Python 3.8+): they cannot be passed by name.',
      'Parameters after `*` (or after `*args`) are keyword-only: they must be passed by name.',
      'Positional-only lets library authors rename parameters without breaking callers; many built-ins use it (e.g. `len(obj, /)`).',
      'Keyword-only improves readability for flags: `connect(host, *, timeout=5)`.',
      'Violations raise `TypeError` at call time.',
    ],
    code: `def f(a, b, /, c, *, d):
    return a + b + c + d

f(1, 2, 3, d=4)      # ok
f(1, 2, c=3, d=4)    # ok
# f(a=1, b=2, c=3, d=4)  TypeError: positional-only
# f(1, 2, 3, 4)          TypeError: d is keyword-only`,
  },
  {
    id: 'mutable-default-argument',
    group: 'Functions & Scope',
    stars: 5,
    difficulty: 'Medium',
    q: 'Why are mutable default arguments dangerous?',
    a: [
      'Default values are evaluated once, when the `def` statement runs, not on each call.',
      'A mutable default (list, dict, set) is therefore shared across all calls that use it.',
      'Mutating it accumulates state between calls.',
      'Defaults are stored on the function object in `f.__defaults__`.',
      'Fix: use `None` as the default and create the object inside the function.',
      'The same applies to `datetime.now()` as a default: it is frozen at definition time.',
    ],
    code: `def add(item, bucket=[]):
    bucket.append(item)
    return bucket

print(add(1), add(2))   # [1, 2] [1, 2]  same list!

def add_ok(item, bucket=None):
    bucket = [] if bucket is None else bucket
    bucket.append(item)
    return bucket`,
  },
  {
    id: 'legb-scope',
    group: 'Functions & Scope',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is the LEGB rule?',
    a: [
      'Name lookup order: Local, Enclosing (outer functions), Global (module), Built-in.',
      'Scope is decided at compile time: if a function assigns to a name anywhere, that name is local throughout the function.',
      'Reading such a name before the assignment raises `UnboundLocalError`.',
      'Blocks like `if`, `for` and `with` do not create scopes; loop variables leak into the enclosing function.',
      'Comprehensions, lambdas, functions and classes do create their own scopes.',
      'Shadowing a built-in (`list = [...]`) hides it for the rest of that scope.',
    ],
    code: `x = "global"

def outer():
    x = "enclosing"
    def inner():
        print(x)        # enclosing
    inner()

count = 0
def bump():
    count += 1          # UnboundLocalError: count is local here`,
  },
  {
    id: 'global-nonlocal',
    group: 'Functions & Scope',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is the difference between `global` and `nonlocal`?',
    a: [
      '`global x` makes assignments to `x` inside a function rebind the module-level name.',
      '`nonlocal x` rebinds `x` in the nearest enclosing function scope (not the module).',
      '`nonlocal` raises `SyntaxError` if no enclosing function defines that name.',
      'Neither is needed just to read an outer variable or to mutate an outer mutable object.',
      'Heavy use of `global` is a code smell; prefer return values or objects holding state.',
    ],
    code: `def counter():
    n = 0
    def inc():
        nonlocal n
        n += 1
        return n
    return inc

c = counter()
print(c(), c(), c())   # 1 2 3`,
  },
  {
    id: 'closures',
    group: 'Functions & Scope',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is a closure in Python?',
    a: [
      'A closure is an inner function that remembers variables from its enclosing scope after that scope has returned.',
      'Captured variables live in "cell" objects, visible via `f.__closure__` and `f.__code__.co_freevars`.',
      'Closures capture variables, not values, so they see later changes (late binding).',
      'Use `nonlocal` to rebind a captured variable.',
      'Uses: function factories, decorators, callbacks and keeping private state without a class.',
    ],
    code: `def make_multiplier(n):
    def mul(x):
        return x * n
    return mul

double = make_multiplier(2)
print(double(5))                               # 10
print(double.__closure__[0].cell_contents)     # 2`,
  },
  {
    id: 'lambda-functions',
    group: 'Functions & Scope',
    stars: 4,
    difficulty: 'Easy',
    q: 'What are lambda functions and when should you use them?',
    a: [
      '`lambda args: expr` creates an anonymous function whose body is a single expression.',
      'No statements (no `return`, assignments, loops) and no annotations allowed.',
      'Best for short throwaway callables: `key=` in `sorted`/`max`/`min`, small callbacks.',
      'PEP 8 discourages `f = lambda x: ...`; use `def` so the function has a real name in tracebacks.',
      'Lambdas follow normal closure rules, including late binding of loop variables.',
    ],
    code: `words = ["kiwi", "fig", "banana"]
print(sorted(words, key=lambda w: len(w)))  # ['fig', 'kiwi', 'banana']
print(max(words, key=len))                  # banana (no lambda needed)`,
  },
  {
    id: 'first-class-functions',
    group: 'Functions & Scope',
    stars: 4,
    difficulty: 'Easy',
    q: 'What does it mean that functions are first-class objects, and how do `map`, `filter` and `reduce` work?',
    a: [
      'Functions are objects: they can be assigned, stored in data structures, passed as arguments and returned.',
      'A higher-order function takes or returns a function (`sorted(key=...)`, decorators).',
      '`map(f, it)` and `filter(pred, it)` return lazy iterators in Python 3, not lists.',
      '`reduce` lives in `functools` and folds an iterable into one value.',
      'Comprehensions are usually preferred over `map`/`filter` with lambdas for readability.',
      '`functools.partial` pre-fills some arguments to create a new callable.',
    ],
    code: `from functools import reduce, partial

ops = {"add": lambda a, b: a + b, "mul": lambda a, b: a * b}
print(ops["mul"](3, 4))                    # 12
print(list(map(str.upper, ["a", "b"])))    # ['A', 'B']
print(reduce(lambda a, b: a * b, [1, 2, 3, 4]))  # 24
int2 = partial(int, base=2)
print(int2("101"))                         # 5`,
  },

  // ───────────────────────── Decorators ─────────────────────────
  {
    id: 'what-is-decorator',
    group: 'Decorators',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is a decorator and how does it work?',
    a: [
      'A decorator is a callable that takes a function (or class) and returns a replacement, usually a wrapper.',
      '`@deco` above `def f` is sugar for `f = deco(f)`.',
      'It runs once, at definition time; the wrapper runs on every call.',
      'It relies on closures: the wrapper remembers the original function.',
      'Use cases: logging, timing, caching, auth checks, retries, registering handlers.',
      'The wrapper should accept `*args, **kwargs` and return the original result.',
    ],
    code: `import time
from functools import wraps

def timed(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        print(f"{func.__name__} took {time.perf_counter() - start:.4f}s")
        return result
    return wrapper`,
  },
  {
    id: 'functools-wraps',
    group: 'Decorators',
    stars: 4,
    difficulty: 'Medium',
    q: 'Why should you use `functools.wraps` in a decorator?',
    a: [
      'Without it, the decorated function reports the wrapper\'s metadata: `__name__` becomes "wrapper", the docstring is lost.',
      '`@wraps(func)` copies `__name__`, `__qualname__`, `__doc__`, `__module__`, `__annotations__` and updates `__dict__`.',
      'It also sets `__wrapped__`, so `inspect.signature` and tools can reach the original function.',
      'Correct metadata matters for debugging, logging, docs generation and frameworks that route by function name.',
    ],
    code: `from functools import wraps

def deco(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@deco
def greet():
    """Say hi."""
print(greet.__name__, greet.__doc__)  # greet Say hi.`,
  },
  {
    id: 'decorator-with-arguments',
    group: 'Decorators',
    stars: 4,
    difficulty: 'Hard',
    q: 'How do you write a decorator that takes arguments?',
    a: [
      'Add one more level: a decorator factory that takes the arguments and returns the actual decorator.',
      '`@retry(times=3)` means `f = retry(times=3)(f)`.',
      'Three nested functions: factory(args) -> decorator(func) -> wrapper(*args, **kwargs).',
      'To support both `@deco` and `@deco(...)`, check whether the first argument is callable.',
      'A class with `__init__` (args) and `__call__` (func) is an alternative.',
    ],
    code: `from functools import wraps

def repeat(times):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            return [func(*args, **kwargs) for _ in range(times)]
        return wrapper
    return decorator

@repeat(3)
def hi(): return "hi"
print(hi())  # ['hi', 'hi', 'hi']`,
  },
  {
    id: 'stacked-decorators',
    group: 'Decorators',
    stars: 3,
    difficulty: 'Medium',
    q: 'In what order are stacked decorators applied?',
    a: [
      'They are applied bottom-up: the decorator closest to `def` wraps first.',
      '`@a` then `@b` above `def f` equals `f = a(b(f))`.',
      'At call time the outermost wrapper (`a`) runs first, then `b`, then `f`.',
      'Order matters, e.g. put `@app.route` outermost so the framework registers the fully wrapped function.',
    ],
    code: `def tag(name):
    def deco(f):
        return lambda: f"<{name}>{f()}</{name}>"
    return deco

@tag("b")
@tag("i")
def text(): return "hi"
print(text())  # <b><i>hi</i></b>`,
  },
  {
    id: 'lru-cache',
    group: 'Decorators',
    stars: 4,
    difficulty: 'Medium',
    q: 'What do `functools.lru_cache` and `functools.cache` do?',
    a: [
      'They memoise a function: results are stored keyed by the call arguments.',
      '`lru_cache(maxsize=128)` evicts least-recently-used entries; `maxsize=None` is unbounded.',
      '`@cache` (3.9+) is shorthand for `lru_cache(maxsize=None)`.',
      'All arguments must be hashable; `f(1)` and `f(x=1)` are cached as different keys.',
      'Inspect and reset with `f.cache_info()` and `f.cache_clear()`.',
      'On methods it keeps `self` alive (memory leak risk); consider `functools.cached_property` instead.',
    ],
    code: `from functools import cache

@cache
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print(fib(100))         # instant thanks to memoisation
print(fib.cache_info())`,
  },

  // ───────────────────────── Iterators & Generators ─────────────────────────
  {
    id: 'iterable-vs-iterator',
    group: 'Iterators & Generators',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is the difference between an iterable and an iterator?',
    a: [
      'Iterable: any object with `__iter__` (or `__getitem__`) that can produce an iterator: list, str, dict, file.',
      'Iterator: an object with `__next__` that returns the next item and raises `StopIteration` when done; its `__iter__` returns itself.',
      '`iter(x)` gets an iterator from an iterable; `next(it)` advances it.',
      'A `for` loop calls `iter()` once, then `next()` repeatedly until `StopIteration`.',
      'Iterators are single-pass and stateful; iterables like lists can be looped many times.',
      'Every iterator is iterable, but not every iterable is an iterator.',
    ],
    code: `nums = [1, 2, 3]       # iterable
it = iter(nums)          # iterator
print(next(it), next(it), next(it))  # 1 2 3
# next(it)  -> StopIteration
print(iter(it) is it)    # True`,
  },
  {
    id: 'generators-yield',
    group: 'Iterators & Generators',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is a generator and how does `yield` work?',
    a: [
      'A function containing `yield` returns a generator object when called; the body does not run yet.',
      'Each `next()` runs the body until the next `yield`, hands back that value and pauses, keeping all local state.',
      'When the function returns, `StopIteration` is raised; a `return value` becomes `StopIteration.value`.',
      'Generators are lazy: values are produced on demand, so memory stays O(1) even for huge or infinite streams.',
      'They are the easiest way to write an iterator (no class with `__iter__`/`__next__` needed).',
      'Typical uses: reading large files line by line, pipelines, infinite sequences.',
    ],
    code: `def countdown(n):
    print("start")
    while n > 0:
        yield n
        n -= 1

g = countdown(3)       # nothing printed yet
print(next(g))         # start, then 3
print(list(g))         # [2, 1]`,
  },
  {
    id: 'generator-expression-vs-list-comp',
    group: 'Iterators & Generators',
    stars: 4,
    difficulty: 'Easy',
    q: 'What is the difference between a generator expression and a list comprehension?',
    a: [
      '`[x * x for x in data]` builds the whole list in memory immediately.',
      '`(x * x for x in data)` creates a lazy generator that yields one item at a time.',
      'A generator expression uses constant memory regardless of input size.',
      'It can be consumed only once and supports no indexing or `len()`.',
      'As the sole argument, the extra parentheses can be dropped: `sum(x * x for x in data)`.',
      'Use a list when you need to reuse, index or know the size of the result.',
    ],
    code: `import sys
lst = [x for x in range(1_000_000)]
gen = (x for x in range(1_000_000))
print(sys.getsizeof(lst))   # ~8 MB
print(sys.getsizeof(gen))   # ~200 bytes
print(sum(x * x for x in range(10)))  # 285`,
  },
  {
    id: 'generator-exhaustion',
    group: 'Iterators & Generators',
    stars: 3,
    difficulty: 'Easy',
    q: 'What happens if you iterate over a generator twice?',
    a: [
      'The second pass yields nothing: a generator is exhausted after one full iteration.',
      'No error is raised; the loop simply does not run, which makes this a silent bug.',
      'Same for `map`, `filter`, `zip`, file objects and other iterators.',
      'Fix: recreate the generator, materialise it with `list()`, or use `itertools.tee` for parallel consumption.',
      '`x in gen` also consumes the generator up to the match.',
    ],
    code: `squares = (x * x for x in range(3))
print(list(squares))   # [0, 1, 4]
print(list(squares))   # []

nums = map(int, ["1", "2"])
print(sum(nums), sum(nums))  # 3 0`,
  },
  {
    id: 'yield-from',
    group: 'Iterators & Generators',
    stars: 3,
    difficulty: 'Medium',
    q: 'What does `yield from` do?',
    a: [
      '`yield from iterable` yields every item of the sub-iterable, replacing a `for x in it: yield x` loop.',
      'With a sub-generator it also forwards `send()`, `throw()` and `close()` to it.',
      'The expression evaluates to the sub-generator\'s `return` value.',
      'Handy for recursive generators such as flattening nested lists or walking trees.',
    ],
    code: `def flatten(items):
    for x in items:
        if isinstance(x, list):
            yield from flatten(x)
        else:
            yield x

print(list(flatten([1, [2, [3, 4]], 5])))  # [1, 2, 3, 4, 5]`,
  },
  {
    id: 'generator-send',
    group: 'Iterators & Generators',
    stars: 2,
    difficulty: 'Hard',
    q: 'How do `send()`, `throw()` and `close()` work on generators?',
    a: [
      '`yield` is an expression: `x = yield value` receives whatever is passed to `gen.send(x)`.',
      'A fresh generator must be primed with `next(gen)` (or `send(None)`) before sending a real value.',
      '`gen.throw(exc)` raises the exception at the paused `yield`.',
      '`gen.close()` raises `GeneratorExit` inside the generator so `finally` blocks run.',
      'This two-way protocol was the basis of old-style coroutines before `async`/`await`.',
    ],
    code: `def averager():
    total = count = 0
    avg = None
    while True:
        x = yield avg
        total += x; count += 1
        avg = total / count

a = averager(); next(a)
print(a.send(10), a.send(20))  # 10.0 15.0`,
  },
  {
    id: 'itertools',
    group: 'Iterators & Generators',
    stars: 3,
    difficulty: 'Medium',
    q: 'Which `itertools` functions are most useful?',
    a: [
      'Infinite: `count(start, step)`, `cycle(it)`, `repeat(x, n)`.',
      'Combining/slicing: `chain(a, b)`, `chain.from_iterable`, `islice(it, stop)`, `zip_longest`.',
      'Combinatorics: `product`, `permutations`, `combinations`, `combinations_with_replacement`.',
      '`groupby(it, key)` groups consecutive equal keys only, so sort by the same key first.',
      '`accumulate` gives running totals; `pairwise` (3.10) gives overlapping pairs; `batched(it, n)` (3.12) gives chunks.',
      'All return lazy iterators, so they compose without building intermediate lists.',
    ],
    code: `from itertools import islice, count, groupby, combinations, batched

print(list(islice(count(10, 5), 3)))       # [10, 15, 20]
print(list(combinations("abc", 2)))        # [('a','b'), ('a','c'), ('b','c')]
print([(k, len(list(g))) for k, g in groupby("aabccc")])  # [('a',2),('b',1),('c',3)]
print(list(batched(range(5), 2)))          # [(0, 1), (2, 3), (4,)]`,
  },

  // ───────────────────────── Comprehensions & Idioms ─────────────────────────
  {
    id: 'comprehensions',
    group: 'Comprehensions & Idioms',
    stars: 5,
    difficulty: 'Easy',
    q: 'What kinds of comprehensions does Python have, and how do they work?',
    a: [
      'List `[e for x in it]`, set `{e for x in it}`, dict `{k: v for x in it}`, and generator `(e for x in it)`.',
      'A trailing `if` filters: `[x for x in xs if x > 0]`.',
      'A conditional expression transforms: `[x if x > 0 else 0 for x in xs]` (the `if/else` goes before `for`).',
      'Nested loops read left to right like nested `for` statements: `[(i, j) for i in a for j in b]`.',
      'Comprehensions have their own scope, so the loop variable does not leak (3.12 inlines them for speed but keeps that isolation).',
      'Keep them short; switch to a regular loop when logic gets complex or has side effects.',
    ],
    code: `nums = [3, -1, 4, -5]
print([n * 2 for n in nums if n > 0])        # [6, 8]
print([n if n > 0 else 0 for n in nums])     # [3, 0, 4, 0]
print({w: len(w) for w in ["hi", "yo!"]})    # {'hi': 2, 'yo!': 3}
matrix = [[1, 2], [3, 4]]
print([x for row in matrix for x in row])    # [1, 2, 3, 4]`,
  },
  {
    id: 'unpacking',
    group: 'Comprehensions & Idioms',
    stars: 4,
    difficulty: 'Easy',
    q: 'How does iterable unpacking work in Python?',
    a: [
      'Assign an iterable to several names at once: `a, b = 1, 2`; counts must match or `ValueError` is raised.',
      'Swap without a temp: `a, b = b, a` (right side is built as a tuple first).',
      'Starred target captures the rest as a list: `first, *rest = items`, `*init, last = items`.',
      'Unpacking nests: `(a, b), c = (1, 2), 3`; use `_` for values you ignore.',
      'In literals: `[*a, *b]` merges sequences, `{**d1, **d2}` merges dicts (later keys win); `d1 | d2` also works (3.9+).',
    ],
    code: `a, b = 1, 2
a, b = b, a
first, *middle, last = [1, 2, 3, 4, 5]
print(first, middle, last)      # 1 [2, 3, 4] 5

defaults = {"debug": False, "port": 80}
print({**defaults, "port": 8080})  # {'debug': False, 'port': 8080}`,
  },
  {
    id: 'enumerate-zip',
    group: 'Comprehensions & Idioms',
    stars: 4,
    difficulty: 'Easy',
    q: 'How do `enumerate` and `zip` work?',
    a: [
      '`enumerate(it, start=0)` yields `(index, item)` pairs; replaces `for i in range(len(xs))`.',
      '`zip(a, b, ...)` yields tuples of items in lockstep and stops at the shortest input.',
      '`zip(..., strict=True)` (3.10+) raises `ValueError` if lengths differ.',
      '`itertools.zip_longest(..., fillvalue=x)` pads the shorter ones instead.',
      '`zip(*matrix)` transposes rows into columns; `dict(zip(keys, values))` builds a dict.',
      'Both return lazy iterators.',
    ],
    code: `names = ["ann", "bob"]
ages = [30, 25]
for i, (n, a) in enumerate(zip(names, ages), start=1):
    print(i, n, a)          # 1 ann 30 / 2 bob 25

print(dict(zip(names, ages)))        # {'ann': 30, 'bob': 25}
print(list(zip(*[[1, 2], [3, 4]])))  # [(1, 3), (2, 4)]`,
  },
  {
    id: 'walrus-operator',
    group: 'Comprehensions & Idioms',
    stars: 3,
    difficulty: 'Medium',
    q: 'What is the walrus operator `:=`?',
    a: [
      'An assignment expression (Python 3.8+): assigns a value and returns it in the same expression.',
      'Avoids computing a value twice or splitting a loop awkwardly: `while (chunk := f.read(1024)):`.',
      'Useful in comprehensions to reuse a computed value in both the filter and the output.',
      'Inside a comprehension, the target binds in the enclosing scope, not the comprehension scope.',
      'Cannot be used as a bare top-level statement (`x := 5` is a SyntaxError); parenthesise where needed.',
    ],
    code: `data = [1, 5, 12, 7]
if (n := len(data)) > 3:
    print(f"too long ({n})")

results = [y for x in data if (y := x * 2) > 10]
print(results, y)   # [24, 14] 14`,
  },
  {
    id: 'f-strings',
    group: 'Comprehensions & Idioms',
    stars: 3,
    difficulty: 'Easy',
    q: 'What can f-strings do?',
    a: [
      'f-strings (3.6+) embed expressions: `f"{name} is {age + 1}"`; evaluated at runtime and faster than `%` or `.format`.',
      'Format spec after a colon: `{x:.2f}`, `{n:,}`, `{n:08b}`, `{s:>10}`, `{d:%Y-%m-%d}`.',
      'Conversions: `{x!r}` uses `repr`, `{x!s}` uses `str`.',
      'Self-documenting `{x=}` (3.8+) prints `x=<value>`, great for debugging.',
      'Since 3.12 (PEP 701) you can reuse the same quote type, use backslashes and write comments inside the braces.',
      'Literal braces are written `{{` and `}}`; for logging, prefer `logger.info("%s", x)` (lazy formatting).',
    ],
    code: `price, qty, name = 1234.5, 3, "pen"
print(f"{name!r}: {price:,.2f} x {qty}")  # 'pen': 1,234.50 x 3
print(f"{qty=}")                            # qty=3
print(f"{255:#x} {5:03d} {{literal}}")      # 0xff 005 {literal}`,
  },
  {
    id: 'eafp-vs-lbyl',
    group: 'Comprehensions & Idioms',
    stars: 3,
    difficulty: 'Easy',
    q: 'What is EAFP versus LBYL?',
    a: [
      'LBYL ("Look Before You Leap"): check conditions first, e.g. `if key in d: d[key]`.',
      'EAFP ("Easier to Ask Forgiveness than Permission"): just try it and catch the exception.',
      'EAFP is considered more Pythonic and avoids race conditions between check and use (e.g. a file deleted after `os.path.exists`).',
      'EAFP is cheap when exceptions are rare; LBYL can be better when failure is the common path.',
      'Catch the narrowest exception possible (`KeyError`, not bare `except`).',
    ],
    code: `config = {"port": 80}

# LBYL
port = config["port"] if "port" in config else 8000

# EAFP
try:
    port = config["port"]
except KeyError:
    port = 8000`,
  },
  {
    id: 'chained-comparisons-ternary',
    group: 'Comprehensions & Idioms',
    stars: 3,
    difficulty: 'Easy',
    q: 'How do chained comparisons and the conditional expression work in Python?',
    a: [
      '`a < b < c` means `a < b and b < c`, with `b` evaluated only once.',
      'Any comparison operators chain, so `a == b == c` and even `1 < x != 5` are valid.',
      'Conditional expression: `x if cond else y` (Python has no `?:`).',
      '`any(it)` / `all(it)` short-circuit over an iterable; `all([])` is `True`, `any([])` is `False`.',
      'Prefer `if x in (1, 2, 3)` over `x == 1 or x == 2 or x == 3`.',
    ],
    code: `age = 25
print(18 <= age < 65)               # True
status = "adult" if age >= 18 else "minor"
print(status)                        # adult
print(any(n > 10 for n in [1, 20]))  # True
print(all([]), any([]))              # True False`,
  },

  // ───────────────────────── Output-based gotchas ─────────────────────────
  {
    id: 'is-vs-equals',
    group: 'Output-based gotchas',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is the difference between `is` and `==`?',
    a: [
      '`==` compares values by calling `__eq__`.',
      '`is` compares identity: whether both names point to the same object (`id(a) == id(b)`).',
      'Two equal lists are `==` but not `is`.',
      'Use `is` only for singletons: `None`, `True`, `False`, `NotImplemented`, `Ellipsis` or sentinel objects.',
      'Using `is` with literals (e.g. `x is 1`) gives a `SyntaxWarning` and depends on caching details.',
    ],
    code: `a = [1, 2]
b = [1, 2]
c = a
print(a == b, a is b)   # True False
print(a is c)           # True
print(None is None)     # True`,
  },
  {
    id: 'integer-caching',
    group: 'Output-based gotchas',
    stars: 4,
    difficulty: 'Medium',
    q: 'Why is `a is b` True for 256 but can be False for 257?',
    a: [
      'CPython pre-allocates small ints from -5 to 256; every use of those values refers to the same object.',
      'Larger ints are created fresh at runtime, so two equal values can be different objects.',
      'Constants in the same code object may be shared by the compiler, so `a = 257; b = 257` in one script can still give `True`.',
      'Strings that look like identifiers are often interned, so `is` may "work" for them too; `sys.intern` forces it.',
      'All of this is a CPython implementation detail: always compare values with `==`.',
    ],
    code: `a, b = int("256"), int("256")
print(a is b)   # True  (small-int cache)

a, b = int("257"), int("257")
print(a is b)   # False (separate objects)
print(a == b)   # True`,
  },
  {
    id: 'late-binding-closures',
    group: 'Output-based gotchas',
    stars: 4,
    difficulty: 'Hard',
    q: 'What does `[f() for f in [lambda: i for i in range(3)]]` return, and why?',
    a: [
      'It returns `[2, 2, 2]`, not `[0, 1, 2]`.',
      'Closures capture the variable `i`, not its value at creation time (late binding).',
      'All three lambdas look up `i` when called, after the loop finished with `i == 2`.',
      'Fix 1: bind the current value with a default argument: `lambda i=i: i`.',
      'Fix 2: use a factory function or `functools.partial` to create a fresh scope per value.',
    ],
    code: `funcs = [lambda: i for i in range(3)]
print([f() for f in funcs])      # [2, 2, 2]

funcs = [lambda i=i: i for i in range(3)]
print([f() for f in funcs])      # [0, 1, 2]`,
  },
  {
    id: 'list-multiplication-aliasing',
    group: 'Output-based gotchas',
    stars: 4,
    difficulty: 'Medium',
    q: 'Why does modifying one row of `[[0] * 3] * 3` change every row?',
    a: [
      '`*` on a list repeats references, not copies.',
      '`[[0] * 3] * 3` contains the same inner list object three times.',
      'Mutating `grid[0][0]` mutates that shared list, visible through every row.',
      '`[0] * 3` itself is fine because ints are immutable; assigning `row[0] = 1` replaces the slot.',
      'Fix: build each row separately with a comprehension: `[[0] * 3 for _ in range(3)]`.',
    ],
    code: `grid = [[0] * 3] * 3
grid[0][0] = 1
print(grid)   # [[1, 0, 0], [1, 0, 0], [1, 0, 0]]

grid = [[0] * 3 for _ in range(3)]
grid[0][0] = 1
print(grid)   # [[1, 0, 0], [0, 0, 0], [0, 0, 0]]`,
  },
  {
    id: 'modify-list-while-iterating',
    group: 'Output-based gotchas',
    stars: 3,
    difficulty: 'Medium',
    q: 'What happens if you remove items from a list while iterating over it?',
    a: [
      'The loop uses an internal index; removing an item shifts later items left, so the next one is skipped.',
      'No error is raised for lists, which makes the bug silent.',
      'Changing a dict or set size during iteration raises `RuntimeError`.',
      'Fix: build a new list (`[x for x in xs if keep(x)]`), iterate over a copy (`for x in xs[:]`), or iterate backwards.',
    ],
    code: `nums = [1, 2, 2, 3, 4]
for n in nums:
    if n % 2 == 0:
        nums.remove(n)
print(nums)    # [1, 2, 3]  one 2 survived

nums = [1, 2, 2, 3, 4]
print([n for n in nums if n % 2])  # [1, 3]`,
  },
  {
    id: 'tuple-plus-equals',
    group: 'Output-based gotchas',
    stars: 3,
    difficulty: 'Hard',
    q: 'What happens with `t = (1, [2]); t[1] += [3]`?',
    a: [
      'It raises `TypeError: \'tuple\' object does not support item assignment`.',
      'But the list is still modified: `t` becomes `(1, [2, 3])`.',
      '`t[1] += [3]` runs as `tmp = t[1].__iadd__([3])` (mutates the list in place) then `t[1] = tmp` (fails).',
      'Shows that `+=` on mutables is an in-place mutation plus a rebinding.',
      'Use `t[1].append(3)` or `t[1].extend([3])` to avoid the error.',
    ],
    code: `t = (1, [2])
try:
    t[1] += [3]
except TypeError as e:
    print(e)
print(t)   # (1, [2, 3])`,
  },
  {
    id: 'dict-key-equality-collision',
    group: 'Output-based gotchas',
    stars: 3,
    difficulty: 'Medium',
    q: 'What does `{1: "a", True: "b", 1.0: "c"}` evaluate to?',
    a: [
      'It evaluates to `{1: \'c\'}`.',
      '`1 == True == 1.0` and they all have the same hash, so they are the same dict key.',
      'The first inserted key object (`1`) is kept; each later assignment only replaces the value.',
      '`bool` is a subclass of `int`, so `True + True == 2` and `sum([True, False, True]) == 2`.',
      'Same effect in sets: `{1, True, 1.0}` is `{1}`.',
    ],
    code: `d = {1: "a", True: "b", 1.0: "c"}
print(d)                 # {1: 'c'}
print({1, True, 1.0})    # {1}
print(True + True)       # 2`,
  },
];

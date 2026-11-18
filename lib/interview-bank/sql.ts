import type { BankQuestion } from './types';

// SQL interview bank: vendor-neutral SQL (notes call out MySQL / PostgreSQL differences).
export const SQL_BANK: BankQuestion[] = [
  // ───────────────────────── Basics ─────────────────────────
  {
    id: 'sql-command-categories',
    group: 'Basics',
    stars: 4,
    difficulty: 'Easy',
    q: 'What are DDL, DML, DCL and TCL?',
    a: [
      'DDL (Data Definition): defines structure: `CREATE`, `ALTER`, `DROP`, `TRUNCATE`, `RENAME`.',
      'DML (Data Manipulation): works on rows: `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `MERGE` (some list `SELECT` separately as DQL).',
      'DCL (Data Control): permissions: `GRANT`, `REVOKE`.',
      'TCL (Transaction Control): `BEGIN`/`START TRANSACTION`, `COMMIT`, `ROLLBACK`, `SAVEPOINT`.',
      'In MySQL and Oracle, DDL causes an implicit commit; PostgreSQL supports transactional DDL (can be rolled back).',
    ],
  },
  {
    id: 'delete-truncate-drop',
    group: 'Basics',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is the difference between `DELETE`, `TRUNCATE` and `DROP`?',
    a: [
      '`DELETE` is DML: removes rows one by one, supports `WHERE`, fires row triggers, is fully logged.',
      '`TRUNCATE` is DDL: removes all rows by deallocating pages; no `WHERE`, much faster, usually resets identity/auto-increment.',
      '`DROP` removes the table itself: data, structure, indexes, constraints and triggers.',
      '`DELETE` can always be rolled back in a transaction; `TRUNCATE` can be rolled back in PostgreSQL / SQL Server but implicitly commits in MySQL / Oracle.',
      '`TRUNCATE` fails if the table is referenced by a foreign key (unless `CASCADE` in PostgreSQL).',
    ],
    code: `DELETE FROM orders WHERE created_at < '2020-01-01';
TRUNCATE TABLE logs;
DROP TABLE IF EXISTS temp_import;`,
  },
  {
    id: 'constraints',
    group: 'Basics',
    stars: 4,
    difficulty: 'Easy',
    q: 'What constraints does SQL support?',
    a: [
      '`NOT NULL`: column must always have a value.',
      '`UNIQUE`: no two rows share the value (multiple NULLs are usually allowed).',
      '`PRIMARY KEY`: `UNIQUE` + `NOT NULL`, one per table.',
      '`FOREIGN KEY`: value must exist in the referenced table; supports `ON DELETE CASCADE / SET NULL / RESTRICT`.',
      '`CHECK`: arbitrary boolean condition per row (enforced in MySQL only since 8.0.16).',
      '`DEFAULT`: value used when an insert omits the column.',
    ],
    code: `CREATE TABLE employee (
  id      INT PRIMARY KEY,
  email   VARCHAR(255) NOT NULL UNIQUE,
  salary  NUMERIC(10,2) CHECK (salary > 0),
  dept_id INT REFERENCES department(id) ON DELETE SET NULL,
  status  VARCHAR(10) DEFAULT 'active'
);`,
  },
  {
    id: 'primary-vs-unique-key',
    group: 'Basics',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is the difference between a primary key and a unique key?',
    a: [
      'Both enforce uniqueness and are backed by a unique index.',
      'A table has exactly one primary key but can have many unique keys.',
      'Primary key columns are implicitly `NOT NULL`; unique columns can hold NULLs (usually multiple, since NULL is not equal to NULL).',
      'In MySQL InnoDB and SQL Server (default) the primary key is the clustered index that orders the table data.',
      'Foreign keys normally reference the primary key, though they may reference any unique key.',
    ],
  },
  {
    id: 'foreign-key',
    group: 'Basics',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is a foreign key and what do the referential actions do?',
    a: [
      'A foreign key is a column (or set) whose values must match a key in a parent table: enforces referential integrity.',
      '`ON DELETE CASCADE`: deleting the parent deletes the children.',
      '`ON DELETE SET NULL`: children keep living with the FK set to NULL.',
      '`RESTRICT` / `NO ACTION` (default): block the parent delete/update while children exist.',
      'Index the FK column: PostgreSQL does not do it automatically, and unindexed FKs make parent deletes and joins slow (MySQL InnoDB auto-creates one).',
    ],
    code: `CREATE TABLE orders (
  id          INT PRIMARY KEY,
  customer_id INT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);`,
  },
  {
    id: 'candidate-composite-surrogate-keys',
    group: 'Basics',
    stars: 4,
    difficulty: 'Easy',
    q: 'What are super, candidate, alternate, composite, natural and surrogate keys?',
    a: [
      'Super key: any set of columns that uniquely identifies a row.',
      'Candidate key: a minimal super key (no column can be removed); a table may have several.',
      'Primary key: the chosen candidate key; the others become alternate keys (enforced with `UNIQUE`).',
      'Composite key: a key made of two or more columns, e.g. `(student_id, course_id)` in a join table.',
      'Natural key comes from the data (email, ISBN); surrogate key is artificial (auto-increment, UUID) with no business meaning.',
      'Surrogates are stable and compact; keep a `UNIQUE` constraint on the natural key anyway.',
    ],
  },
  {
    id: 'char-vs-varchar',
    group: 'Basics',
    stars: 3,
    difficulty: 'Easy',
    q: 'What is the difference between `CHAR`, `VARCHAR` and `TEXT`?',
    a: [
      '`CHAR(n)` is fixed length, padded with spaces; good for fixed codes like country `CHAR(2)`.',
      '`VARCHAR(n)` stores only the actual length plus a small length prefix.',
      '`TEXT` is for large unbounded strings; in MySQL it cannot have a default and needs a prefix length to be indexed.',
      'In PostgreSQL `VARCHAR` and `TEXT` perform identically; `CHAR(n)` is never faster.',
      'Use `DECIMAL`/`NUMERIC` for money, never `FLOAT` (binary rounding errors).',
    ],
  },
  {
    id: 'auto-increment-vs-uuid',
    group: 'Basics',
    stars: 3,
    difficulty: 'Medium',
    q: 'Auto-increment IDs or UUIDs as primary keys?',
    a: [
      'Auto-increment (`AUTO_INCREMENT`, `SERIAL`, `GENERATED AS IDENTITY`): small (4-8 bytes), sequential, index-friendly.',
      'Sequential IDs leak information (row counts, growth) and are guessable in URLs.',
      'UUIDs can be generated anywhere (client, many shards) without coordination.',
      'Random UUIDv4 keys fragment a clustered B-tree (random inserts, page splits) and are 16 bytes.',
      'Middle ground: time-ordered UUIDv7 / ULID, or an internal bigint PK plus a public UUID column.',
    ],
  },
  {
    id: 'alter-table',
    group: 'Basics',
    stars: 2,
    difficulty: 'Easy',
    q: 'How do you add, modify and drop columns on an existing table?',
    a: [
      'Use `ALTER TABLE ... ADD COLUMN`, `DROP COLUMN`, `RENAME COLUMN`.',
      'Changing type: `ALTER COLUMN ... TYPE` (PostgreSQL) vs `MODIFY COLUMN` (MySQL).',
      'Adding a column with a non-volatile default is instant in PostgreSQL 11+ and MySQL 8 (INSTANT algorithm).',
      'Type changes and some constraint additions can rewrite or lock the whole table: plan migrations on big tables.',
      'Add `NOT NULL` safely in steps: add nullable, backfill in batches, then set `NOT NULL`.',
    ],
    code: `ALTER TABLE users ADD COLUMN phone VARCHAR(20);
ALTER TABLE users ALTER COLUMN phone TYPE VARCHAR(32); -- PostgreSQL
ALTER TABLE users MODIFY COLUMN phone VARCHAR(32);     -- MySQL
ALTER TABLE users DROP COLUMN phone;`,
  },

  // ───────────────────────── Querying ─────────────────────────
  {
    id: 'where-vs-having',
    group: 'Querying',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is the difference between `WHERE` and `HAVING`?',
    a: [
      '`WHERE` filters individual rows before grouping; `HAVING` filters groups after `GROUP BY`.',
      'Aggregates (`COUNT`, `SUM`...) cannot appear in `WHERE` but can in `HAVING`.',
      '`HAVING` without `GROUP BY` treats the whole result as one group.',
      'Put non-aggregate conditions in `WHERE`: fewer rows reach the grouping step, and indexes can be used.',
    ],
    code: `SELECT dept_id, AVG(salary) AS avg_sal
FROM employee
WHERE status = 'active'        -- row filter
GROUP BY dept_id
HAVING AVG(salary) > 50000;    -- group filter`,
  },
  {
    id: 'logical-order-of-execution',
    group: 'Querying',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is the logical order of execution of a `SELECT` query?',
    a: [
      '`FROM` / `JOIN` (+ `ON`) -> `WHERE` -> `GROUP BY` -> `HAVING` -> `SELECT` -> `DISTINCT` -> `ORDER BY` -> `LIMIT`/`OFFSET`.',
      'Window functions are evaluated during `SELECT`, after `HAVING`, so they cannot be used in `WHERE`.',
      'That is why a `SELECT` alias cannot be used in `WHERE` but can be used in `ORDER BY`.',
      'MySQL and PostgreSQL allow aliases in `GROUP BY` as an extension; standard SQL does not.',
      'This is the logical order only; the optimizer may physically reorder steps (e.g. push filters into joins).',
    ],
  },
  {
    id: 'group-by-rules',
    group: 'Querying',
    stars: 4,
    difficulty: 'Easy',
    q: 'How does `GROUP BY` work and what columns can you select with it?',
    a: [
      '`GROUP BY` collapses rows with equal values in the grouping columns into one output row per group.',
      'Every selected column must be in `GROUP BY` or inside an aggregate (or be functionally dependent on the grouped PK).',
      'MySQL with `ONLY_FULL_GROUP_BY` off returns an arbitrary value for non-grouped columns: a classic bug source.',
      '`COUNT(*)` counts rows; `COUNT(col)` skips NULLs; `COUNT(DISTINCT col)` counts unique non-null values.',
      '`ROLLUP` / `CUBE` / `GROUPING SETS` add subtotal rows.',
    ],
    code: `SELECT dept_id, COUNT(*) AS headcount, MAX(salary) AS top
FROM employee
GROUP BY dept_id;`,
  },
  {
    id: 'distinct-vs-group-by',
    group: 'Querying',
    stars: 3,
    difficulty: 'Easy',
    q: 'What is the difference between `DISTINCT` and `GROUP BY`?',
    a: [
      '`SELECT DISTINCT a, b` removes duplicate rows across the selected columns.',
      '`GROUP BY a, b` with no aggregates gives the same result and usually the same plan.',
      'Use `GROUP BY` when you need aggregates per group; `DISTINCT` just to de-duplicate.',
      'PostgreSQL has `DISTINCT ON (col)` to keep the first row per value according to `ORDER BY`.',
      'A `DISTINCT` added to "fix" duplicates often hides a wrong join.',
    ],
  },
  {
    id: 'null-handling',
    group: 'Querying',
    stars: 5,
    difficulty: 'Medium',
    q: 'How does SQL treat NULL?',
    a: [
      'NULL means unknown/missing; any comparison with NULL (`=`, `<>`, `<`) yields UNKNOWN, not TRUE or FALSE.',
      'Use `IS NULL` / `IS NOT NULL`; `col = NULL` never matches.',
      'Three-valued logic: `WHERE` keeps only TRUE rows, so UNKNOWN rows are dropped.',
      'Aggregates ignore NULLs (`AVG` divides by non-null count); `COUNT(*)` does not.',
      '`NOT IN (subquery)` returns no rows if the subquery yields any NULL: prefer `NOT EXISTS`.',
      '`GROUP BY` and `DISTINCT` treat all NULLs as one group; `IS DISTINCT FROM` gives NULL-safe comparison (`<=>` in MySQL).',
    ],
    code: `SELECT * FROM t WHERE col = NULL;      -- 0 rows, always
SELECT * FROM t WHERE col IS NULL;     -- correct
SELECT NULL = NULL;                    -- NULL (unknown)`,
  },
  {
    id: 'coalesce-nullif',
    group: 'Querying',
    stars: 4,
    difficulty: 'Easy',
    q: 'What do `COALESCE`, `NULLIF` and `IFNULL` do?',
    a: [
      '`COALESCE(a, b, c)` returns the first non-NULL argument; standard SQL, works everywhere.',
      '`IFNULL(a, b)` (MySQL) and `ISNULL(a, b)` (SQL Server) are 2-argument vendor versions.',
      '`NULLIF(a, b)` returns NULL if `a = b`, else `a`.',
      'Classic use: avoid divide-by-zero with `x / NULLIF(y, 0)`.',
      'Wrapping an indexed column in `COALESCE` in `WHERE` usually prevents index use.',
    ],
    code: `SELECT name,
       COALESCE(phone, email, 'n/a') AS contact,
       revenue / NULLIF(orders, 0)   AS avg_order
FROM customers;`,
  },
  {
    id: 'case-expression',
    group: 'Querying',
    stars: 4,
    difficulty: 'Easy',
    q: 'How does the `CASE` expression work?',
    a: [
      'Searched form: `CASE WHEN cond THEN x ... ELSE y END`; first true branch wins.',
      'Simple form: `CASE col WHEN 1 THEN ... END` compares one value for equality.',
      'Without `ELSE`, unmatched rows get NULL.',
      'Usable anywhere an expression is: `SELECT`, `WHERE`, `ORDER BY`, `GROUP BY`, inside aggregates.',
      'Conditional aggregation: `SUM(CASE WHEN ... THEN 1 ELSE 0 END)` (PostgreSQL also has `COUNT(*) FILTER (WHERE ...)`).',
    ],
    code: `SELECT name,
       CASE WHEN salary >= 100000 THEN 'high'
            WHEN salary >= 50000  THEN 'mid'
            ELSE 'low' END AS band
FROM employee;`,
  },
  {
    id: 'like-wildcards',
    group: 'Querying',
    stars: 3,
    difficulty: 'Easy',
    q: 'How do `LIKE` wildcards work and when can `LIKE` use an index?',
    a: [
      '`%` matches any sequence (including empty); `_` matches exactly one character.',
      '`LIKE \'abc%\'` (prefix) can use a B-tree index; `LIKE \'%abc\'` or `\'%abc%\'` cannot.',
      'Case sensitivity depends on collation: MySQL default is case-insensitive, PostgreSQL is case-sensitive (use `ILIKE`).',
      'Escape literal `%` / `_` with `ESCAPE`.',
      'For substring/full-text search use full-text indexes or PostgreSQL `pg_trgm` trigram indexes.',
    ],
    code: `SELECT * FROM users WHERE email LIKE 'admin%';   -- index ok
SELECT * FROM users WHERE name  LIKE '_a%';      -- 2nd char is a
SELECT * FROM t WHERE code LIKE '50!%' ESCAPE '!';`,
  },
  {
    id: 'in-vs-exists',
    group: 'Querying',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is the difference between `IN` and `EXISTS`?',
    a: [
      '`IN` checks a value against a list or subquery result set.',
      '`EXISTS` checks whether a (usually correlated) subquery returns at least one row; it stops at the first match.',
      'Modern optimizers turn both into a semi-join, so performance is usually the same for the positive case.',
      'Key difference is `NOT IN` vs `NOT EXISTS`: `NOT IN` returns nothing if the subquery contains a NULL.',
      'Rule: use `EXISTS` / `NOT EXISTS` for subqueries, `IN` for short literal lists.',
    ],
    code: `SELECT c.* FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);

SELECT c.* FROM customers c
WHERE c.id IN (SELECT customer_id FROM orders);`,
  },
  {
    id: 'order-by-limit-pagination',
    group: 'Querying',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do you paginate results, and why is `OFFSET` slow on deep pages?',
    a: [
      '`LIMIT n OFFSET m` (MySQL/PostgreSQL) or `OFFSET m ROWS FETCH NEXT n ROWS ONLY` (standard / SQL Server).',
      'Always pair with a deterministic `ORDER BY` (add a unique tiebreaker like `id`).',
      '`OFFSET 100000` still reads and discards 100000 rows: cost grows linearly with page depth.',
      'Keyset (seek) pagination: `WHERE (created_at, id) < (:last_ts, :last_id)` uses the index and is O(page size).',
      'Keyset cannot jump to arbitrary page numbers; it is ideal for infinite scroll / cursors.',
    ],
    code: `-- keyset pagination
SELECT * FROM posts
WHERE (created_at, id) < ('2024-05-01 10:00', 9876)
ORDER BY created_at DESC, id DESC
LIMIT 20;`,
  },
  {
    id: 'between-and-dates',
    group: 'Querying',
    stars: 2,
    difficulty: 'Easy',
    q: 'What is the pitfall of `BETWEEN` with timestamps?',
    a: [
      '`BETWEEN a AND b` is inclusive on both ends.',
      'With timestamps, `BETWEEN \'2024-01-01\' AND \'2024-01-31\'` misses everything after midnight on Jan 31.',
      'Use half-open ranges: `ts >= \'2024-01-01\' AND ts < \'2024-02-01\'`.',
      'Avoid `WHERE DATE(ts) = ...` or `YEAR(ts) = ...`: function on column blocks index use.',
    ],
    code: `SELECT * FROM orders
WHERE created_at >= '2024-01-01'
  AND created_at <  '2024-02-01';`,
  },

  // ───────────────────────── Joins ─────────────────────────
  {
    id: 'join-types',
    group: 'Joins',
    stars: 5,
    difficulty: 'Easy',
    q: 'What are the different types of joins?',
    a: [
      '`INNER JOIN`: only rows with a match on both sides.',
      '`LEFT JOIN`: all rows from the left, matched right rows or NULLs.',
      '`RIGHT JOIN`: mirror of `LEFT`; usually rewritten as `LEFT` for readability.',
      '`FULL OUTER JOIN`: all rows from both sides, NULLs where unmatched (MySQL lacks it: emulate with `LEFT` `UNION` `RIGHT`).',
      '`CROSS JOIN`: Cartesian product, m x n rows.',
      'Self join, semi join (`EXISTS`) and anti join (`NOT EXISTS`) are patterns built on these.',
    ],
    code: `SELECT e.name, d.name AS dept
FROM employee e
LEFT JOIN department d ON d.id = e.dept_id;`,
  },
  {
    id: 'left-join-where-vs-on',
    group: 'Joins',
    stars: 4,
    difficulty: 'Medium',
    q: 'In a `LEFT JOIN`, what is the difference between filtering in `ON` and in `WHERE`?',
    a: [
      'A condition in `ON` decides which right rows match; unmatched left rows are still kept with NULLs.',
      'A condition on the right table in `WHERE` runs after the join and removes the NULL rows.',
      'So `LEFT JOIN ... WHERE right.col = x` silently becomes an `INNER JOIN`.',
      'For inner joins, `ON` vs `WHERE` makes no difference to the result.',
    ],
    code: `-- keeps all customers, counts only 2024 orders
SELECT c.id, COUNT(o.id)
FROM customers c
LEFT JOIN orders o
  ON o.customer_id = c.id AND o.created_at >= '2024-01-01'
GROUP BY c.id;`,
  },
  {
    id: 'self-join',
    group: 'Joins',
    stars: 4,
    difficulty: 'Easy',
    q: 'What is a self join and when do you use it?',
    a: [
      'A self join joins a table to itself using two different aliases.',
      'Used for hierarchies stored in one table (employee -> manager).',
      'Also used to compare rows within a table (pairs, consecutive rows, duplicates).',
      'Use `LEFT JOIN` if rows without a partner (e.g. the CEO) must be kept.',
    ],
    code: `SELECT e.name AS employee, m.name AS manager
FROM employee e
LEFT JOIN employee m ON m.id = e.manager_id;`,
  },
  {
    id: 'semi-anti-join',
    group: 'Joins',
    stars: 4,
    difficulty: 'Medium',
    q: 'What are semi joins and anti joins?',
    a: [
      'Semi join: return rows of A that have at least one match in B, each A row at most once.',
      'Written with `EXISTS` or `IN`; a plain `JOIN` would duplicate A rows for multiple matches.',
      'Anti join: return rows of A with no match in B.',
      'Anti join forms: `NOT EXISTS` (preferred), `LEFT JOIN ... WHERE b.id IS NULL`, or `NOT IN` (NULL trap).',
    ],
    code: `-- anti join: products never ordered
SELECT p.* FROM products p
WHERE NOT EXISTS (
  SELECT 1 FROM order_items oi WHERE oi.product_id = p.id
);`,
  },
  {
    id: 'cross-join',
    group: 'Joins',
    stars: 2,
    difficulty: 'Easy',
    q: 'What is a `CROSS JOIN` and when is it useful?',
    a: [
      'Returns every combination of rows: Cartesian product, |A| x |B| rows.',
      'Accidental cross joins happen when a join condition is forgotten (old comma syntax).',
      'Useful to generate combinations: every store x every date, every size x colour.',
      'Commonly paired with a calendar table and `LEFT JOIN` to fill gaps with zeros.',
    ],
    code: `SELECT s.id, d.day
FROM stores s
CROSS JOIN calendar d
WHERE d.day >= '2024-01-01' AND d.day < '2024-02-01';`,
  },
  {
    id: 'join-vs-subquery',
    group: 'Joins',
    stars: 4,
    difficulty: 'Medium',
    q: 'Join or subquery: which is better?',
    a: [
      'Use a join when you need columns from both tables.',
      'Use `EXISTS` / `IN` subqueries when you only filter by the other table (no duplicate rows).',
      'Modern optimizers (PostgreSQL, MySQL 8) often rewrite subqueries into joins, so plans are frequently identical.',
      'Correlated subqueries in `SELECT` can run once per row: watch out on large tables.',
      'Pick the clearer form, then check `EXPLAIN` rather than relying on folklore.',
    ],
  },
  {
    id: 'join-algorithms',
    group: 'Joins',
    stars: 3,
    difficulty: 'Hard',
    q: 'What physical join algorithms do databases use?',
    a: [
      'Nested loop: for each outer row, probe the inner side; great when the inner side is indexed and the outer is small.',
      'Hash join: build a hash table on the smaller input, probe with the other; good for large unsorted equi-joins (MySQL 8.0.18+).',
      'Merge join: both inputs sorted on the join key, walk them together; good when already ordered by an index.',
      'The optimizer chooses based on statistics and row estimates; bad estimates lead to bad join choices.',
      'Run `ANALYZE` to refresh statistics when plans go wrong.',
    ],
  },

  // ───────────────────────── Subqueries & CTEs ─────────────────────────
  {
    id: 'correlated-subquery',
    group: 'Subqueries & CTEs',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is a correlated subquery?',
    a: [
      'A subquery that references a column from the outer query, so logically it runs once per outer row.',
      'A non-correlated subquery is independent and can be evaluated once.',
      'Common use: compare each row to an aggregate of its own group.',
      'Can be slow on large data; often rewritable with a join to a grouped derived table or a window function.',
    ],
    code: `-- employees earning above their department average
SELECT e.name, e.salary
FROM employee e
WHERE e.salary > (
  SELECT AVG(salary) FROM employee x WHERE x.dept_id = e.dept_id
);`,
  },
  {
    id: 'subquery-types',
    group: 'Subqueries & CTEs',
    stars: 3,
    difficulty: 'Easy',
    q: 'Where can subqueries appear and what kinds are there?',
    a: [
      'Scalar subquery: returns one value, usable in `SELECT` or comparisons; errors if it returns more than one row.',
      'Row/table subquery: used with `IN`, `EXISTS`, `ANY`, `ALL`.',
      'Derived table: a subquery in `FROM`; needs an alias (required in MySQL / PostgreSQL).',
      '`LATERAL` (PostgreSQL, MySQL 8.0.14+) lets a `FROM` subquery reference earlier tables: great for top-N per row.',
    ],
  },
  {
    id: 'cte',
    group: 'Subqueries & CTEs',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is a CTE (`WITH` clause) and why use it?',
    a: [
      'A Common Table Expression is a named temporary result defined with `WITH name AS (...)` and visible only to that statement.',
      'Improves readability: break a complex query into named steps; a CTE can be referenced multiple times.',
      'Can be recursive (`WITH RECURSIVE`) for hierarchies and series.',
      'PostgreSQL 12+ inlines CTEs by default; `AS MATERIALIZED` forces a one-time computation (older versions always materialized).',
      'MySQL supports CTEs only from 8.0.',
    ],
    code: `WITH dept_avg AS (
  SELECT dept_id, AVG(salary) AS avg_sal
  FROM employee GROUP BY dept_id
)
SELECT e.name, e.salary, d.avg_sal
FROM employee e JOIN dept_avg d USING (dept_id)
WHERE e.salary > d.avg_sal;`,
  },
  {
    id: 'recursive-cte',
    group: 'Subqueries & CTEs',
    stars: 4,
    difficulty: 'Hard',
    q: 'How does a recursive CTE work?',
    a: [
      'Two parts joined by `UNION ALL`: an anchor query (starting rows) and a recursive query that references the CTE itself.',
      'Each iteration feeds the rows produced by the previous one; stops when an iteration returns no rows.',
      'Uses: org charts, category trees, bill of materials, graph traversal, generating number/date series.',
      'Guard against cycles with a depth limit or a visited-path column (PostgreSQL 14 has `CYCLE` clause).',
      'MySQL caps depth with `cte_max_recursion_depth` (default 1000).',
    ],
    code: `WITH RECURSIVE chain AS (
  SELECT id, name, manager_id, 1 AS lvl
  FROM employee WHERE manager_id IS NULL      -- anchor
  UNION ALL
  SELECT e.id, e.name, e.manager_id, c.lvl + 1
  FROM employee e JOIN chain c ON e.manager_id = c.id
)
SELECT * FROM chain ORDER BY lvl;`,
  },
  {
    id: 'cte-vs-subquery-vs-temp-table',
    group: 'Subqueries & CTEs',
    stars: 3,
    difficulty: 'Medium',
    q: 'CTE vs subquery vs temporary table: when do you use each?',
    a: [
      'Subquery / derived table: inline, single use, fine for small steps.',
      'CTE: same scope as a subquery but named and reusable within the statement; better readability.',
      'Temporary table: persists for the session, can be indexed and analysed, reused across many statements.',
      'Use a temp table when an intermediate result is large and reused, or when the optimizer misestimates a complex CTE.',
    ],
  },

  // ───────────────────────── Window Functions ─────────────────────────
  {
    id: 'window-functions-intro',
    group: 'Window Functions',
    stars: 5,
    difficulty: 'Medium',
    q: 'What are window functions and how do they differ from `GROUP BY`?',
    a: [
      'A window function computes a value over a set of related rows but keeps every input row (no collapsing).',
      'Syntax: `fn() OVER (PARTITION BY ... ORDER BY ... frame)`.',
      '`PARTITION BY` splits rows into groups; `ORDER BY` defines order within each partition.',
      'Families: ranking (`ROW_NUMBER`, `RANK`), offset (`LAG`, `LEAD`, `FIRST_VALUE`), aggregate (`SUM`, `AVG` over a window).',
      'Evaluated after `WHERE`/`GROUP BY`/`HAVING`, so filter on them via a CTE or subquery (or `QUALIFY` in some engines).',
      'Supported in MySQL 8+ and all PostgreSQL versions you will meet.',
    ],
    code: `SELECT name, dept_id, salary,
       AVG(salary) OVER (PARTITION BY dept_id) AS dept_avg
FROM employee;`,
  },
  {
    id: 'row-number-rank-dense-rank',
    group: 'Window Functions',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is the difference between `ROW_NUMBER`, `RANK` and `DENSE_RANK`?',
    a: [
      '`ROW_NUMBER`: unique sequential number, ties broken arbitrarily: 1, 2, 3, 4.',
      '`RANK`: ties share a rank and leave gaps: 1, 2, 2, 4.',
      '`DENSE_RANK`: ties share a rank, no gaps: 1, 2, 2, 3.',
      'Use `DENSE_RANK` for "Nth highest distinct value", `ROW_NUMBER` for de-duplication and exactly N rows per group.',
      '`NTILE(n)` splits ordered rows into n buckets (quartiles, percentiles).',
    ],
    code: `SELECT name, salary,
  ROW_NUMBER() OVER (ORDER BY salary DESC) AS rn,   -- 1,2,3,4
  RANK()       OVER (ORDER BY salary DESC) AS rnk,  -- 1,2,2,4
  DENSE_RANK() OVER (ORDER BY salary DESC) AS drnk  -- 1,2,2,3
FROM employee;`,
  },
  {
    id: 'lag-lead',
    group: 'Window Functions',
    stars: 5,
    difficulty: 'Medium',
    q: 'What do `LAG` and `LEAD` do?',
    a: [
      '`LAG(col, n, default)` reads the value n rows before the current row in the window order; `LEAD` reads n rows after.',
      'Default offset is 1; default value for missing rows is NULL.',
      'Classic uses: day-over-day change, time between events, detecting consecutive values.',
      'Avoids a self join on "previous row".',
    ],
    code: `SELECT day, revenue,
       revenue - LAG(revenue) OVER (ORDER BY day) AS change,
       LEAD(day) OVER (ORDER BY day)              AS next_day
FROM daily_sales;`,
  },
  {
    id: 'running-total',
    group: 'Window Functions',
    stars: 5,
    difficulty: 'Medium',
    q: 'How do you compute running totals and moving averages?',
    a: [
      'Aggregate window with `ORDER BY`: `SUM(x) OVER (ORDER BY day)` gives a running total.',
      'Add `PARTITION BY` to restart the total per group (per customer, per month).',
      'Moving average: specify a frame like `ROWS BETWEEN 6 PRECEDING AND CURRENT ROW`.',
      'Default frame with `ORDER BY` is `RANGE ... CURRENT ROW`, which includes all peer rows with the same order value; use `ROWS` for strict row-by-row.',
    ],
    code: `SELECT day, amount,
  SUM(amount) OVER (ORDER BY day ROWS UNBOUNDED PRECEDING) AS running_total,
  AVG(amount) OVER (ORDER BY day
                    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS ma_7d
FROM daily_sales;`,
  },
  {
    id: 'window-frames',
    group: 'Window Functions',
    stars: 3,
    difficulty: 'Hard',
    q: 'What is a window frame and how do `ROWS` and `RANGE` differ?',
    a: [
      'The frame is the subset of the partition an aggregate sees, relative to the current row.',
      '`ROWS` counts physical rows: `ROWS BETWEEN 2 PRECEDING AND CURRENT ROW` is exactly 3 rows.',
      '`RANGE` is value-based: includes all rows whose order value falls in the range, so ties are grouped together.',
      'No `ORDER BY` in `OVER`: frame is the whole partition. With `ORDER BY` but no frame: `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`.',
      'Gotcha: `LAST_VALUE` with the default frame returns the current row; use `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`.',
    ],
    code: `SELECT day, amount,
  LAST_VALUE(amount) OVER (
    ORDER BY day
    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
  ) AS last_amount
FROM daily_sales;`,
  },
  {
    id: 'first-value-percent-rank',
    group: 'Window Functions',
    stars: 2,
    difficulty: 'Medium',
    q: 'What do `FIRST_VALUE`, `NTH_VALUE`, `PERCENT_RANK` and `CUME_DIST` return?',
    a: [
      '`FIRST_VALUE(col)` / `NTH_VALUE(col, n)`: value from the first / nth row of the frame.',
      '`PERCENT_RANK()`: (rank - 1) / (rows - 1), from 0 to 1.',
      '`CUME_DIST()`: fraction of rows with value <= current, from just above 0 to 1.',
      'Useful for "compare to the top earner in dept" or percentile bands.',
    ],
    code: `SELECT name, dept_id, salary,
  FIRST_VALUE(name) OVER (PARTITION BY dept_id ORDER BY salary DESC) AS top_earner,
  PERCENT_RANK()    OVER (ORDER BY salary) AS pct
FROM employee;`,
  },

  // ───────────────────────── Classic Query Problems ─────────────────────────
  {
    id: 'second-highest-salary',
    group: 'Classic Query Problems',
    stars: 5,
    difficulty: 'Easy',
    q: 'How do you find the second highest salary?',
    a: [
      'Take the max of salaries below the overall max: works everywhere and returns NULL if none exists.',
      'Alternative: `ORDER BY salary DESC LIMIT 1 OFFSET 1` on distinct salaries.',
      'Use `DISTINCT` (or `DENSE_RANK`) so duplicate top salaries do not count twice.',
      'Wrap the `LIMIT` version in a scalar subquery to return NULL instead of an empty set.',
    ],
    code: `SELECT MAX(salary) AS second_highest
FROM employee
WHERE salary < (SELECT MAX(salary) FROM employee);

-- or
SELECT (SELECT DISTINCT salary FROM employee
        ORDER BY salary DESC LIMIT 1 OFFSET 1) AS second_highest;`,
  },
  {
    id: 'nth-highest-salary',
    group: 'Classic Query Problems',
    stars: 5,
    difficulty: 'Medium',
    q: 'How do you find the Nth highest salary?',
    a: [
      '`DENSE_RANK` over salary descending, then filter rank = N; handles ties correctly.',
      '`LIMIT 1 OFFSET N-1` on `DISTINCT` salaries also works (OFFSET cannot be an expression in MySQL, compute N-1 first).',
      'Correlated version: salary where exactly N-1 distinct salaries are greater (O(n^2), mention only).',
      'Clarify with interviewer: distinct values (`DENSE_RANK`) or positions (`ROW_NUMBER`)?',
    ],
    code: `WITH ranked AS (
  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk
  FROM employee
)
SELECT DISTINCT salary FROM ranked WHERE rnk = 3;  -- N = 3`,
  },
  {
    id: 'find-duplicates',
    group: 'Classic Query Problems',
    stars: 5,
    difficulty: 'Easy',
    q: 'How do you find duplicate rows?',
    a: [
      'Group by the columns that define a duplicate and keep groups with `COUNT(*) > 1`.',
      'To see the full duplicate rows, join back or use `COUNT(*) OVER (PARTITION BY ...)`.',
      'Decide first what "duplicate" means (email only? email + name?).',
    ],
    code: `SELECT email, COUNT(*) AS cnt
FROM users
GROUP BY email
HAVING COUNT(*) > 1;

-- full rows
SELECT * FROM (
  SELECT u.*, COUNT(*) OVER (PARTITION BY email) AS cnt FROM users u
) t WHERE cnt > 1;`,
  },
  {
    id: 'delete-duplicates',
    group: 'Classic Query Problems',
    stars: 5,
    difficulty: 'Medium',
    q: 'How do you delete duplicate rows but keep one?',
    a: [
      'Number rows within each duplicate group with `ROW_NUMBER()` and delete those with `rn > 1`.',
      'Keep the lowest `id` (or latest timestamp) by choosing the `ORDER BY` inside the window.',
      'MySQL cannot delete from a table it selects from directly: use a self-join `DELETE` or a derived table.',
      'Afterwards add a `UNIQUE` constraint so duplicates cannot come back.',
    ],
    code: `-- PostgreSQL / standard
DELETE FROM users WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) AS rn
    FROM users
  ) t WHERE rn > 1
);

-- MySQL self-join form
DELETE u1 FROM users u1
JOIN users u2 ON u1.email = u2.email AND u1.id > u2.id;`,
  },
  {
    id: 'employee-earning-more-than-manager',
    group: 'Classic Query Problems',
    stars: 5,
    difficulty: 'Easy',
    q: 'How do you find employees who earn more than their manager?',
    a: [
      'Self join the employee table: one alias for the employee, one for the manager.',
      'Join on `e.manager_id = m.id` and compare salaries.',
      'Inner join naturally excludes employees without a manager.',
    ],
    code: `SELECT e.name AS employee
FROM employee e
JOIN employee m ON m.id = e.manager_id
WHERE e.salary > m.salary;`,
  },
  {
    id: 'highest-salary-per-department',
    group: 'Classic Query Problems',
    stars: 5,
    difficulty: 'Medium',
    q: 'How do you find the employee(s) with the highest salary in each department?',
    a: [
      'Window approach: `RANK()` partitioned by department, keep rank 1 (keeps ties).',
      'Group approach: compute `MAX(salary)` per dept and join back on (dept, salary).',
      'Use `ROW_NUMBER` instead of `RANK` if exactly one row per department is required.',
    ],
    code: `SELECT dept, name, salary FROM (
  SELECT d.name AS dept, e.name, e.salary,
         RANK() OVER (PARTITION BY e.dept_id ORDER BY e.salary DESC) AS rnk
  FROM employee e JOIN department d ON d.id = e.dept_id
) t
WHERE rnk = 1;`,
  },
  {
    id: 'top-n-per-group',
    group: 'Classic Query Problems',
    stars: 5,
    difficulty: 'Medium',
    q: 'How do you get the top N rows per group (e.g. top 3 salaries per department)?',
    a: [
      'Rank inside each partition, then filter in an outer query: window functions cannot go in `WHERE`.',
      '`DENSE_RANK` gives top 3 distinct salary levels; `ROW_NUMBER` gives exactly 3 rows.',
      'Alternative in PostgreSQL / MySQL 8: `LATERAL` join with `ORDER BY ... LIMIT 3` per group, fast with an index on (dept_id, salary).',
    ],
    code: `WITH r AS (
  SELECT e.*,
         DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rnk
  FROM employee e
)
SELECT dept_id, name, salary FROM r WHERE rnk <= 3
ORDER BY dept_id, salary DESC;`,
  },
  {
    id: 'customers-who-never-ordered',
    group: 'Classic Query Problems',
    stars: 5,
    difficulty: 'Easy',
    q: 'How do you find customers who never placed an order?',
    a: [
      'Anti join: `NOT EXISTS` is the clearest and NULL-safe.',
      '`LEFT JOIN ... WHERE o.id IS NULL` is the equivalent join form.',
      'Avoid `NOT IN` if `orders.customer_id` can be NULL: the result would be empty.',
    ],
    code: `SELECT c.name
FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);

SELECT c.name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL;`,
  },
  {
    id: 'department-wise-count-and-avg',
    group: 'Classic Query Problems',
    stars: 4,
    difficulty: 'Easy',
    q: 'How do you list each department with its employee count and average salary, including empty departments?',
    a: [
      'Start from `department` and `LEFT JOIN` employees so empty departments survive.',
      'Use `COUNT(e.id)`, not `COUNT(*)`, so empty departments show 0 instead of 1.',
      '`AVG` of no rows is NULL; wrap in `COALESCE` if 0 is wanted.',
    ],
    code: `SELECT d.name,
       COUNT(e.id)                AS headcount,
       COALESCE(AVG(e.salary), 0) AS avg_salary
FROM department d
LEFT JOIN employee e ON e.dept_id = d.id
GROUP BY d.id, d.name
ORDER BY headcount DESC;`,
  },
  {
    id: 'consecutive-days-gaps-islands',
    group: 'Classic Query Problems',
    stars: 4,
    difficulty: 'Hard',
    q: 'How do you find users who logged in on 3+ consecutive days (gaps and islands)?',
    a: [
      'Trick: for consecutive dates, `date - ROW_NUMBER()` is constant, so it identifies an "island".',
      'De-duplicate to one row per user per day first.',
      'Group by (user, island key) and keep islands with `COUNT(*) >= 3`.',
      'Alternative for a fixed N: compare with `LAG(day, 2)` and check the gap is exactly 2 days.',
      'Date arithmetic differs: `day - rn * INTERVAL \'1 day\'` (PostgreSQL), `DATE_SUB(day, INTERVAL rn DAY)` (MySQL).',
    ],
    code: `WITH d AS (SELECT DISTINCT user_id, CAST(login_at AS DATE) AS day FROM logins),
g AS (
  SELECT user_id, day,
         day - CAST(ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY day) AS INT) AS grp
  FROM d                                   -- PostgreSQL: date - int = date
)
SELECT user_id, MIN(day) AS start_day, COUNT(*) AS streak
FROM g GROUP BY user_id, grp
HAVING COUNT(*) >= 3;`,
  },
  {
    id: 'consecutive-numbers',
    group: 'Classic Query Problems',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do you find values that appear at least three times consecutively?',
    a: [
      'Use `LAG`/`LEAD` to look at the previous and next row in id order.',
      'Keep rows where current equals both neighbours; select `DISTINCT` values.',
      'Self join version: `l1.id = l2.id - 1 AND l2.id = l3.id - 1` (assumes gap-free ids).',
    ],
    code: `SELECT DISTINCT num FROM (
  SELECT num,
         LAG(num)  OVER (ORDER BY id) AS prev,
         LEAD(num) OVER (ORDER BY id) AS next
  FROM logs
) t
WHERE num = prev AND num = next;`,
  },
  {
    id: 'cumulative-sum-per-group',
    group: 'Classic Query Problems',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do you compute a cumulative sum of sales per customer over time?',
    a: [
      '`SUM() OVER (PARTITION BY customer ORDER BY date)` restarts the total for each customer.',
      'Use a `ROWS` frame so same-day orders accumulate one by one rather than together.',
      'Pre-window alternative: correlated subquery summing earlier rows (O(n^2)).',
    ],
    code: `SELECT customer_id, order_date, amount,
       SUM(amount) OVER (
         PARTITION BY customer_id
         ORDER BY order_date, id
         ROWS UNBOUNDED PRECEDING
       ) AS cumulative
FROM orders;`,
  },
  {
    id: 'pivot-rows-to-columns',
    group: 'Classic Query Problems',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do you pivot rows into columns (e.g. sales per quarter as columns)?',
    a: [
      'Portable approach: conditional aggregation with `SUM(CASE WHEN ... END)` per output column.',
      'PostgreSQL alternative: `FILTER (WHERE ...)` or `crosstab()` from `tablefunc`; SQL Server has `PIVOT`.',
      'Columns must be known in advance; dynamic pivots need generated SQL.',
      'Unpivot (columns to rows) with `UNION ALL` or a `LATERAL (VALUES ...)` join.',
    ],
    code: `SELECT product,
  SUM(CASE WHEN quarter = 'Q1' THEN amount ELSE 0 END) AS q1,
  SUM(CASE WHEN quarter = 'Q2' THEN amount ELSE 0 END) AS q2,
  SUM(CASE WHEN quarter = 'Q3' THEN amount ELSE 0 END) AS q3,
  SUM(CASE WHEN quarter = 'Q4' THEN amount ELSE 0 END) AS q4
FROM sales
GROUP BY product;`,
  },
  {
    id: 'employees-above-dept-average',
    group: 'Classic Query Problems',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do you find employees who earn more than their department average?',
    a: [
      'Window approach: compute `AVG(salary) OVER (PARTITION BY dept_id)` and filter outside.',
      'Correlated subquery approach also works but recalculates per row.',
      'Join to a grouped derived table is the third common form.',
    ],
    code: `SELECT name, dept_id, salary FROM (
  SELECT e.*, AVG(salary) OVER (PARTITION BY dept_id) AS dept_avg
  FROM employee e
) t
WHERE salary > dept_avg;`,
  },
  {
    id: 'month-over-month-growth',
    group: 'Classic Query Problems',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do you calculate month-over-month revenue growth?',
    a: [
      'Aggregate revenue per month first, then apply `LAG` over month order.',
      'Growth % = (current - previous) / previous * 100; guard with `NULLIF(prev, 0)`.',
      'Truncate dates with `DATE_TRUNC(\'month\', ts)` (PostgreSQL) or `DATE_FORMAT(ts, \'%Y-%m-01\')` (MySQL).',
    ],
    code: `WITH m AS (
  SELECT DATE_TRUNC('month', created_at) AS month, SUM(amount) AS revenue
  FROM orders GROUP BY 1
)
SELECT month, revenue,
  ROUND(100.0 * (revenue - LAG(revenue) OVER (ORDER BY month))
        / NULLIF(LAG(revenue) OVER (ORDER BY month), 0), 2) AS growth_pct
FROM m ORDER BY month;`,
  },
  {
    id: 'latest-record-per-group',
    group: 'Classic Query Problems',
    stars: 5,
    difficulty: 'Medium',
    q: 'How do you get the latest order for each customer?',
    a: [
      '`ROW_NUMBER()` partitioned by customer ordered by date desc, keep `rn = 1`.',
      'PostgreSQL shortcut: `SELECT DISTINCT ON (customer_id) ... ORDER BY customer_id, created_at DESC`.',
      'Group + join back on `MAX(created_at)` works too but can return ties.',
      'An index on `(customer_id, created_at DESC)` makes this fast.',
    ],
    code: `SELECT * FROM (
  SELECT o.*,
         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC) AS rn
  FROM orders o
) t WHERE rn = 1;

-- PostgreSQL
SELECT DISTINCT ON (customer_id) * FROM orders
ORDER BY customer_id, created_at DESC;`,
  },
  {
    id: 'rank-scores',
    group: 'Classic Query Problems',
    stars: 3,
    difficulty: 'Easy',
    q: 'How do you rank scores so ties share a rank with no gaps?',
    a: [
      'That is exactly `DENSE_RANK()`.',
      'Without window functions: count distinct scores greater than or equal to the current score.',
    ],
    code: `SELECT score, DENSE_RANK() OVER (ORDER BY score DESC) AS rank_no
FROM scores;

-- no window functions
SELECT s.score,
  (SELECT COUNT(DISTINCT s2.score) FROM scores s2 WHERE s2.score >= s.score) AS rank_no
FROM scores s ORDER BY s.score DESC;`,
  },
  {
    id: 'customers-bought-all-products',
    group: 'Classic Query Problems',
    stars: 3,
    difficulty: 'Hard',
    q: 'How do you find customers who bought every product (relational division)?',
    a: [
      'Count distinct products per customer and compare with the total product count.',
      'Double `NOT EXISTS` is the textbook relational-division form: no product the customer has not bought.',
      'Count approach is easier to write and explain in interviews.',
    ],
    code: `SELECT customer_id
FROM purchases
GROUP BY customer_id
HAVING COUNT(DISTINCT product_id) = (SELECT COUNT(*) FROM products);`,
  },
  {
    id: 'percentage-of-total',
    group: 'Classic Query Problems',
    stars: 3,
    difficulty: 'Easy',
    q: 'How do you show each category\'s share of total sales as a percentage?',
    a: [
      'Group per category, then divide by the grand total using `SUM(SUM(x)) OVER ()`.',
      'Empty `OVER ()` means the window is the whole result set.',
      'Multiply by `100.0` (not `100`) to avoid integer division.',
    ],
    code: `SELECT category,
       SUM(amount) AS sales,
       ROUND(100.0 * SUM(amount) / SUM(SUM(amount)) OVER (), 2) AS pct
FROM sales
GROUP BY category;`,
  },
  {
    id: 'retention-repeat-customers',
    group: 'Classic Query Problems',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do you find customers who ordered in two consecutive months?',
    a: [
      'Reduce to one row per customer per month.',
      'Use `LAG(month)` per customer and check the gap is exactly one month.',
      'Self-join alternative: join months where `m2.month = m1.month + INTERVAL \'1 month\'`.',
    ],
    code: `WITH m AS (
  SELECT DISTINCT customer_id, DATE_TRUNC('month', created_at) AS month
  FROM orders
)
SELECT DISTINCT customer_id FROM (
  SELECT customer_id, month,
         LAG(month) OVER (PARTITION BY customer_id ORDER BY month) AS prev
  FROM m
) t
WHERE month = prev + INTERVAL '1 month';`,
  },
  {
    id: 'swap-or-update-with-case',
    group: 'Classic Query Problems',
    stars: 2,
    difficulty: 'Easy',
    q: 'How do you swap two values in a column with a single `UPDATE` (e.g. m <-> f)?',
    a: [
      'Use a `CASE` expression in the `SET` clause: one statement, one pass, no temp value.',
      'All `SET` expressions see the old row values, so swapping two columns (`SET a = b, b = a`) also works in PostgreSQL (not in MySQL, which applies left to right).',
    ],
    code: `UPDATE employee
SET gender = CASE gender WHEN 'm' THEN 'f' WHEN 'f' THEN 'm' ELSE gender END;`,
  },
  {
    id: 'median',
    group: 'Classic Query Problems',
    stars: 2,
    difficulty: 'Hard',
    q: 'How do you compute the median salary?',
    a: [
      'PostgreSQL: `PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY salary)`.',
      'Portable: number rows ascending and count; average the middle one or two rows.',
      'MySQL has no built-in median aggregate; use the `ROW_NUMBER` + `COUNT` method.',
    ],
    code: `SELECT AVG(salary) AS median FROM (
  SELECT salary,
         ROW_NUMBER() OVER (ORDER BY salary) AS rn,
         COUNT(*)     OVER ()                AS cnt
  FROM employee
) t
WHERE rn IN (FLOOR((cnt + 1) / 2.0), CEIL((cnt + 1) / 2.0));`,
  },

  // ───────────────────────── Indexes & Performance ─────────────────────────
  {
    id: 'what-is-index',
    group: 'Indexes & Performance',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is an index and how does a B-tree index work?',
    a: [
      'An index is a separate sorted data structure that maps key values to row locations, like a book index.',
      'B+tree: balanced tree, internal nodes guide the search, leaves hold sorted keys linked left to right.',
      'Lookups are O(log n): typically 3-4 page reads even for millions of rows.',
      'Linked leaves make range scans, `ORDER BY` and prefix `LIKE` efficient.',
      'Cost: extra storage and slower `INSERT`/`UPDATE`/`DELETE` because every index must be maintained.',
      'Other types: hash (equality only), GIN (arrays, JSONB, full-text), GiST/BRIN (geo, huge append-only tables) in PostgreSQL.',
    ],
    code: `CREATE INDEX idx_orders_customer ON orders (customer_id);
CREATE UNIQUE INDEX idx_users_email ON users (email);`,
  },
  {
    id: 'clustered-vs-nonclustered',
    group: 'Indexes & Performance',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is the difference between a clustered and a non-clustered index?',
    a: [
      'Clustered index: the table rows themselves are stored in index order; only one per table.',
      'Non-clustered (secondary) index: separate structure whose leaves point to the row.',
      'InnoDB: the primary key is the clustered index; secondary indexes store the PK value, so lookups go secondary -> PK -> row.',
      'PostgreSQL has no maintained clustered index: tables are heaps and all indexes point to tuple ids (`CLUSTER` is a one-time reorder).',
      'A wide or random PK in InnoDB bloats every secondary index and causes page splits.',
    ],
  },
  {
    id: 'composite-index-leftmost-prefix',
    group: 'Indexes & Performance',
    stars: 5,
    difficulty: 'Medium',
    q: 'How does a composite index work and what is the leftmost prefix rule?',
    a: [
      'A composite index on `(a, b, c)` is sorted by `a`, then `b` within `a`, then `c`.',
      'It can serve filters on `a`, `(a, b)`, `(a, b, c)`, but not `b` or `c` alone.',
      'A range condition on a column stops the use of later columns for seeking: `a = 1 AND b > 5 AND c = 3` seeks on a, b only.',
      'Order columns: equality filters first, then range / sort columns.',
      'Also supports `ORDER BY a, b` without a sort step.',
      'MySQL 8 skip scan and PostgreSQL can sometimes use non-leading columns, but much less efficiently.',
    ],
    code: `CREATE INDEX idx_o ON orders (customer_id, status, created_at);
-- uses index fully
SELECT * FROM orders WHERE customer_id = 7 AND status = 'paid'
  AND created_at > '2024-01-01';
-- cannot seek (no leading column)
SELECT * FROM orders WHERE status = 'paid';`,
  },
  {
    id: 'covering-index',
    group: 'Indexes & Performance',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is a covering index?',
    a: [
      'An index that contains every column a query needs, so the table itself is never read.',
      'Shown as `Using index` in MySQL `EXPLAIN`, `Index Only Scan` in PostgreSQL.',
      'Add non-key payload columns with `INCLUDE (...)` (PostgreSQL 11+, SQL Server).',
      'PostgreSQL index-only scans also need the visibility map to be current (regular `VACUUM`).',
      'Trade-off: wider indexes cost more space and write time.',
    ],
    code: `CREATE INDEX idx_cov ON orders (customer_id) INCLUDE (total, created_at);
SELECT total, created_at FROM orders WHERE customer_id = 42;`,
  },
  {
    id: 'when-indexes-hurt',
    group: 'Indexes & Performance',
    stars: 4,
    difficulty: 'Medium',
    q: 'When do indexes not help or even hurt?',
    a: [
      'Write-heavy tables: every insert/update/delete must update all indexes.',
      'Low-selectivity columns (boolean, status with 2 values): a full scan is often cheaper.',
      'Small tables: a sequential scan beats index lookups.',
      'Queries that return a large fraction of rows: random I/O of index lookups is worse than a scan.',
      'Unused or duplicate indexes waste memory and slow writes; audit them (`pg_stat_user_indexes`, `sys.schema_unused_indexes`).',
      'Index use is defeated by functions on the column, leading wildcards, implicit type casts.',
    ],
  },
  {
    id: 'explain-plan',
    group: 'Indexes & Performance',
    stars: 5,
    difficulty: 'Medium',
    q: 'How do you use `EXPLAIN` to analyse a slow query?',
    a: [
      '`EXPLAIN` shows the planned execution: access method, join order, join algorithm, estimated rows.',
      '`EXPLAIN ANALYZE` actually runs the query and shows real times and row counts (careful with writes).',
      'Red flags: full scans (`Seq Scan`, `type: ALL`) on big tables, `Using filesort`, `Using temporary`, nested loops over large inputs.',
      'Compare estimated vs actual rows: big mismatches mean stale statistics (`ANALYZE`).',
      'PostgreSQL: `EXPLAIN (ANALYZE, BUFFERS)` adds I/O detail; MySQL 8: `EXPLAIN FORMAT=TREE` / `EXPLAIN ANALYZE`.',
    ],
    code: `EXPLAIN ANALYZE
SELECT * FROM orders WHERE customer_id = 42 ORDER BY created_at DESC LIMIT 10;`,
  },
  {
    id: 'sargable-queries',
    group: 'Indexes & Performance',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is a SARGable query?',
    a: [
      'SARGable = Search ARGument-able: the predicate can use an index seek.',
      'Applying a function or arithmetic to the indexed column breaks it: `WHERE YEAR(created_at) = 2024`.',
      'Rewrite as a range on the raw column: `created_at >= \'2024-01-01\' AND created_at < \'2025-01-01\'`.',
      'Implicit casts (comparing a `VARCHAR` column to a number) can disable the index too.',
      'Leading wildcard `LIKE \'%x\'` and `OR` across different columns are other common non-SARGable patterns.',
      'If you must filter on an expression, create an expression/functional index on it.',
    ],
    code: `-- bad: index on created_at unusable
SELECT * FROM orders WHERE DATE(created_at) = '2024-03-01';
-- good
SELECT * FROM orders
WHERE created_at >= '2024-03-01' AND created_at < '2024-03-02';
-- or an expression index (PostgreSQL)
CREATE INDEX ON users (LOWER(email));`,
  },
  {
    id: 'n-plus-one',
    group: 'Indexes & Performance',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is the N+1 query problem and how do you fix it?',
    a: [
      'One query loads N parents, then the code issues one extra query per parent for its children: N+1 round trips.',
      'Typical with ORMs and lazy loading (looping over posts and reading `post.author`).',
      'Fix with a join, or a second batched query `WHERE parent_id IN (...)` (eager loading: `include`, `prefetch_related`, `JOIN FETCH`).',
      'GraphQL resolvers fix it with a DataLoader that batches keys per tick.',
      'Detect it via query logs / APM showing many identical queries per request.',
    ],
    code: `-- N+1
SELECT * FROM posts LIMIT 20;
SELECT * FROM users WHERE id = 1;  -- repeated 20 times
-- fixed
SELECT * FROM users WHERE id IN (1, 2, 3 /* ... */);`,
  },
  {
    id: 'query-optimization-checklist',
    group: 'Indexes & Performance',
    stars: 5,
    difficulty: 'Medium',
    q: 'How would you optimize a slow SQL query?',
    a: [
      'Measure first: find it via slow query log / `pg_stat_statements`, then run `EXPLAIN ANALYZE`.',
      'Add or fix indexes for `WHERE`, `JOIN` and `ORDER BY` columns; make predicates SARGable.',
      'Select only needed columns (no `SELECT *`) to enable covering indexes and cut I/O.',
      'Filter early, avoid row-by-row correlated subqueries, replace deep `OFFSET` with keyset pagination.',
      'Keep statistics fresh (`ANALYZE`), and check for lock waits rather than slow execution.',
      'Beyond the query: caching, read replicas, materialized views, partitioning.',
    ],
  },
  {
    id: 'select-star',
    group: 'Indexes & Performance',
    stars: 3,
    difficulty: 'Easy',
    q: 'Why is `SELECT *` discouraged in production code?',
    a: [
      'Transfers unnecessary data over the network and through memory.',
      'Prevents index-only (covering) scans.',
      'Breaks or silently changes behaviour when columns are added, reordered or renamed.',
      'Can pull large `TEXT`/`BLOB`/JSON columns that are stored off-page (extra reads).',
      'Fine for ad-hoc exploration and `EXISTS (SELECT * ...)`.',
    ],
  },

  // ───────────────────────── Transactions & Concurrency ─────────────────────────
  {
    id: 'acid',
    group: 'Transactions & Concurrency',
    stars: 5,
    difficulty: 'Easy',
    q: 'What are the ACID properties?',
    a: [
      'Atomicity: all statements in a transaction succeed or none do (rollback via undo log).',
      'Consistency: a transaction moves the DB from one valid state to another; constraints always hold.',
      'Isolation: concurrent transactions do not see each other\'s partial work; strength set by isolation level.',
      'Durability: once committed, data survives crashes (write-ahead / redo log flushed to disk).',
      'Example: a bank transfer debits and credits in one transaction so money is never lost or created.',
    ],
    code: `BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;  -- or ROLLBACK on error`,
  },
  {
    id: 'read-phenomena',
    group: 'Transactions & Concurrency',
    stars: 5,
    difficulty: 'Medium',
    q: 'What are dirty reads, non-repeatable reads and phantom reads?',
    a: [
      'Dirty read: reading another transaction\'s uncommitted changes, which may later be rolled back.',
      'Non-repeatable read: reading the same row twice gives different values because another transaction committed an update in between.',
      'Phantom read: re-running a range query returns new/missing rows because another transaction inserted or deleted matching rows.',
      'Lost update: two transactions read-modify-write the same row and one overwrites the other.',
      'Write skew: two transactions read overlapping data and write disjoint rows, breaking an invariant (only Serializable prevents it).',
    ],
  },
  {
    id: 'isolation-levels',
    group: 'Transactions & Concurrency',
    stars: 5,
    difficulty: 'Medium',
    q: 'What are the SQL isolation levels?',
    a: [
      'Read Uncommitted: allows dirty reads (PostgreSQL treats it as Read Committed).',
      'Read Committed: each statement sees only committed data; default in PostgreSQL, Oracle, SQL Server.',
      'Repeatable Read: rows read stay the same for the transaction; default in MySQL InnoDB.',
      'Serializable: result equals some serial order; prevents all anomalies, at the cost of locks or retries.',
      'MVCC implementations prevent phantoms already at Repeatable Read (PostgreSQL snapshot; InnoDB via next-key locks for locking reads).',
      'Higher isolation means fewer anomalies but more blocking or serialization failures to retry.',
    ],
    code: `SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
BEGIN;
-- ...
COMMIT;`,
  },
  {
    id: 'mvcc',
    group: 'Transactions & Concurrency',
    stars: 3,
    difficulty: 'Hard',
    q: 'What is MVCC?',
    a: [
      'Multi-Version Concurrency Control keeps several versions of a row so readers see a consistent snapshot.',
      'Readers do not block writers and writers do not block readers.',
      'PostgreSQL stores old versions in the table itself (dead tuples) and cleans them with `VACUUM`.',
      'InnoDB keeps old versions in undo logs and rebuilds them on demand.',
      'Writers on the same row still conflict: the second waits for a row lock.',
    ],
  },
  {
    id: 'locking',
    group: 'Transactions & Concurrency',
    stars: 4,
    difficulty: 'Medium',
    q: 'What types of locks do databases use?',
    a: [
      'Shared (S / read) lock: many holders allowed, blocks writers.',
      'Exclusive (X / write) lock: one holder, blocks other locks.',
      'Granularity: row-level (InnoDB, PostgreSQL) vs table-level; finer locks give more concurrency.',
      'Explicit row locks: `SELECT ... FOR UPDATE` (exclusive) and `FOR SHARE` / `LOCK IN SHARE MODE`.',
      'InnoDB gap / next-key locks lock ranges between index entries to stop phantom inserts.',
      '`FOR UPDATE SKIP LOCKED` lets workers pull jobs from a queue table without blocking each other.',
    ],
    code: `BEGIN;
SELECT * FROM jobs WHERE status = 'queued'
ORDER BY id LIMIT 1
FOR UPDATE SKIP LOCKED;
-- process, then UPDATE jobs SET status = 'done' ...
COMMIT;`,
  },
  {
    id: 'deadlocks',
    group: 'Transactions & Concurrency',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is a deadlock and how do you prevent it?',
    a: [
      'Two transactions each hold a lock the other needs, so both wait forever.',
      'Databases detect the cycle and abort one transaction (victim) with a deadlock error.',
      'Prevent by acquiring locks in a consistent order (e.g. always update lower `id` first).',
      'Keep transactions short, and index the columns used to find rows to lock (fewer rows locked).',
      'Application must catch the deadlock / serialization error and retry the transaction.',
    ],
    code: `-- T1: UPDATE accounts SET ... WHERE id = 1; then id = 2
-- T2: UPDATE accounts SET ... WHERE id = 2; then id = 1   -> deadlock
-- fix: both lock in id order
SELECT * FROM accounts WHERE id IN (1, 2) ORDER BY id FOR UPDATE;`,
  },
  {
    id: 'optimistic-vs-pessimistic',
    group: 'Transactions & Concurrency',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is the difference between optimistic and pessimistic locking?',
    a: [
      'Pessimistic: lock the row up front (`SELECT ... FOR UPDATE`) so nobody else can change it until commit.',
      'Optimistic: no lock; store a `version` (or `updated_at`) and update only if it is unchanged.',
      'If the optimistic update affects 0 rows, someone else won: reload and retry or report a conflict.',
      'Pessimistic suits high contention and short transactions; optimistic suits low contention and long user think-time (web forms).',
      'Both prevent lost updates; optimistic never holds locks across user interaction.',
    ],
    code: `-- optimistic
UPDATE product
SET stock = stock - 1, version = version + 1
WHERE id = 7 AND version = 12;   -- 0 rows => conflict, retry`,
  },
  {
    id: 'savepoints',
    group: 'Transactions & Concurrency',
    stars: 2,
    difficulty: 'Easy',
    q: 'What is a savepoint?',
    a: [
      'A named marker inside a transaction you can roll back to without aborting the whole transaction.',
      '`SAVEPOINT s1;` ... `ROLLBACK TO SAVEPOINT s1;` ... `RELEASE SAVEPOINT s1;`.',
      'ORMs use savepoints to implement nested transactions.',
      'In PostgreSQL, after an error the transaction is aborted unless you roll back to a savepoint.',
    ],
    code: `BEGIN;
INSERT INTO orders (...) VALUES (...);
SAVEPOINT before_items;
INSERT INTO order_items (...) VALUES (...);  -- fails
ROLLBACK TO SAVEPOINT before_items;
COMMIT;`,
  },
  {
    id: 'race-condition-counter',
    group: 'Transactions & Concurrency',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do you safely decrement stock when many requests run concurrently?',
    a: [
      'Read-then-write in the app (`SELECT stock`, then `UPDATE stock = x - 1`) causes lost updates and overselling.',
      'Do it atomically in one statement with the check in `WHERE`.',
      'Check affected rows: 0 means out of stock.',
      'Alternatives: `SELECT ... FOR UPDATE` then update, or optimistic versioning.',
      'A `CHECK (stock >= 0)` constraint is a last line of defence.',
    ],
    code: `UPDATE product
SET stock = stock - 1
WHERE id = 7 AND stock > 0;   -- atomic; 0 rows = sold out`,
  },

  // ───────────────────────── Design ─────────────────────────
  {
    id: 'normalization',
    group: 'Design',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is normalization? Explain 1NF, 2NF, 3NF and BCNF.',
    a: [
      'Normalization organises tables to remove redundancy and update/insert/delete anomalies.',
      '1NF: atomic values, no repeating groups or lists in a column, each row unique.',
      '2NF: 1NF + no partial dependency: non-key columns depend on the whole composite key, not part of it.',
      '3NF: 2NF + no transitive dependency: non-key columns depend only on the key ("the key, the whole key, nothing but the key").',
      'BCNF: every determinant is a candidate key; stricter 3NF for tables with overlapping candidate keys.',
      'Most OLTP schemas aim for 3NF.',
    ],
  },
  {
    id: 'denormalization',
    group: 'Design',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is denormalization and when should you use it?',
    a: [
      'Deliberately adding redundancy (duplicated columns, precomputed totals) to make reads faster.',
      'Fewer joins and cheaper aggregates on hot read paths (e.g. `comment_count` on `posts`).',
      'Cost: more storage and the risk of inconsistency; must be kept in sync by app code, triggers or jobs.',
      'Common in OLAP / data warehouses (star schema) and read-heavy systems.',
      'Normalize first, denormalize specific paths once measurements justify it.',
    ],
  },
  {
    id: 'views-vs-materialized-views',
    group: 'Design',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is the difference between a view and a materialized view?',
    a: [
      'A view is a stored query; it holds no data and runs the query every time it is read.',
      'Views simplify complex queries and restrict access to specific columns/rows.',
      'A materialized view stores the result physically, so reads are fast but data can be stale.',
      'Refresh with `REFRESH MATERIALIZED VIEW` (PostgreSQL; `CONCURRENTLY` needs a unique index).',
      'MySQL has no materialized views: emulate with a summary table refreshed by jobs or triggers.',
      'Simple views can be updatable; materialized views are not directly writable.',
    ],
    code: `CREATE VIEW active_users AS
  SELECT id, name FROM users WHERE status = 'active';

CREATE MATERIALIZED VIEW daily_revenue AS
  SELECT DATE(created_at) AS day, SUM(amount) AS total
  FROM orders GROUP BY 1;
REFRESH MATERIALIZED VIEW daily_revenue;`,
  },
  {
    id: 'stored-procedures-functions-triggers',
    group: 'Design',
    stars: 3,
    difficulty: 'Medium',
    q: 'What are stored procedures, functions and triggers?',
    a: [
      'Stored procedure: named routine executed with `CALL`; can run multiple statements and (in most DBs) control transactions.',
      'Function: returns a value or table and can be used inside queries; should not have side effects.',
      'Trigger: code that runs automatically `BEFORE`/`AFTER` `INSERT`/`UPDATE`/`DELETE` on a table.',
      'Pros: logic near the data, fewer round trips, enforced invariants (audit logs, `updated_at`).',
      'Cons: hidden logic, harder to test, version and debug; vendor lock-in.',
    ],
    code: `-- PostgreSQL trigger to maintain updated_at
CREATE FUNCTION touch() RETURNS trigger AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_touch BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION touch();`,
  },
  {
    id: 'union-vs-union-all',
    group: 'Design',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is the difference between `UNION` and `UNION ALL`?',
    a: [
      '`UNION` combines results and removes duplicates (requires a sort or hash step).',
      '`UNION ALL` keeps all rows including duplicates and is faster.',
      'Both need the same number of columns with compatible types; column names come from the first query.',
      'Use `UNION ALL` unless you actually need de-duplication.',
      'Related set operators: `INTERSECT` and `EXCEPT` (`MINUS` in Oracle; MySQL only from 8.0.31).',
    ],
    code: `SELECT email FROM customers
UNION        -- distinct emails
SELECT email FROM newsletter_subscribers;`,
  },
  {
    id: 'sql-injection',
    group: 'Design',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is SQL injection and how do prepared statements prevent it?',
    a: [
      'SQL injection: user input concatenated into SQL is parsed as code, e.g. `\' OR \'1\'=\'1` bypasses a login check.',
      'Prepared / parameterized statements send the SQL and values separately; values are never parsed as SQL.',
      'Placeholders: `?` (MySQL, JDBC) or `$1` (PostgreSQL); ORMs and query builders parameterize by default.',
      'Identifiers (table/column names, `ORDER BY` direction) cannot be parameters: whitelist them.',
      'Defence in depth: least-privilege DB users, input validation, no raw SQL error messages to clients.',
    ],
    code: `-- vulnerable (string concatenation in app code)
-- "SELECT * FROM users WHERE email = '" + email + "'"

-- safe: parameterized
SELECT * FROM users WHERE email = $1;   -- value bound separately`,
  },
  {
    id: 'oltp-vs-olap',
    group: 'Design',
    stars: 4,
    difficulty: 'Easy',
    q: 'What is the difference between OLTP and OLAP?',
    a: [
      'OLTP: many small, short transactions (insert order, update balance); low latency, high concurrency.',
      'OLAP: few large analytical queries scanning millions of rows (aggregates, reports).',
      'OLTP schemas are normalized and row-oriented (PostgreSQL, MySQL).',
      'OLAP uses denormalized star/snowflake schemas and columnar storage (BigQuery, Snowflake, Redshift, ClickHouse).',
      'Data moves from OLTP to OLAP via ETL/ELT or change data capture.',
    ],
  },
  {
    id: 'partitioning-vs-sharding',
    group: 'Design',
    stars: 4,
    difficulty: 'Hard',
    q: 'What is the difference between partitioning and sharding?',
    a: [
      'Partitioning splits one big table into smaller pieces inside the same database server.',
      'Types: range (by date), list (by region), hash (spread evenly).',
      'Benefits: partition pruning skips irrelevant partitions; old data dropped instantly with `DROP PARTITION`.',
      'Sharding splits data across multiple database servers by a shard key (e.g. `user_id`) to scale writes and storage.',
      'Sharding costs: cross-shard joins and transactions are hard, resharding is painful, a bad shard key creates hotspots.',
      'Scale vertically, add read replicas and caching before sharding.',
    ],
    code: `-- PostgreSQL declarative range partitioning
CREATE TABLE events (id BIGINT, created_at DATE, payload JSONB)
  PARTITION BY RANGE (created_at);
CREATE TABLE events_2024 PARTITION OF events
  FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');`,
  },
  {
    id: 'replication',
    group: 'Design',
    stars: 3,
    difficulty: 'Medium',
    q: 'What is database replication and what is replication lag?',
    a: [
      'Replication copies data from a primary to one or more replicas, usually by shipping the write-ahead / binary log.',
      'Read replicas scale reads and provide failover; writes still go to the primary.',
      'Asynchronous replication is fast but replicas lag behind; synchronous waits for replica acknowledgement.',
      'Lag causes stale reads: a user may not see their own write. Fix by reading-your-writes from the primary.',
    ],
  },
  {
    id: 'one-to-many-many-to-many',
    group: 'Design',
    stars: 4,
    difficulty: 'Easy',
    q: 'How do you model one-to-one, one-to-many and many-to-many relationships?',
    a: [
      'One-to-many: foreign key on the "many" side (`orders.customer_id`).',
      'Many-to-many: a junction table with two FKs and a composite primary key (`student_course(student_id, course_id)`).',
      'One-to-one: FK with a `UNIQUE` constraint, or share the same primary key.',
      'Junction tables can carry relationship attributes (`enrolled_at`, `grade`).',
    ],
    code: `CREATE TABLE student_course (
  student_id INT REFERENCES student(id),
  course_id  INT REFERENCES course(id),
  enrolled_at DATE,
  PRIMARY KEY (student_id, course_id)
);`,
  },
  {
    id: 'sql-vs-nosql',
    group: 'Design',
    stars: 4,
    difficulty: 'Medium',
    q: 'When would you choose a relational database over NoSQL?',
    a: [
      'Relational: structured data, relationships, joins, strong consistency and multi-row ACID transactions.',
      'NoSQL (document, key-value, wide-column, graph): flexible schema, simple access patterns, easy horizontal scaling.',
      'Pick SQL for payments, inventory, anything needing integrity constraints.',
      'Pick NoSQL for huge write throughput, caches, sessions, event logs, or data modelled per access pattern.',
      'Lines blur: PostgreSQL has JSONB; many NoSQL stores now offer transactions.',
    ],
  },
];

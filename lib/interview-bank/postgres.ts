import type { BankQuestion } from './types';

// PostgreSQL-specific interview bank. Generic SQL (joins, window functions,
// normalization, classic query puzzles) lives in the SQL bank.
export const POSTGRES: BankQuestion[] = [
  // ───────────────────────── Architecture ─────────────────────────
  {
    id: 'why-postgres',
    group: 'Architecture',
    stars: 4,
    difficulty: 'Easy',
    q: 'Why would you pick PostgreSQL for a new project?',
    a: [
      'Open source (PostgreSQL License), no single vendor owns it, huge community and managed offerings (RDS, Cloud SQL, Neon, Supabase).',
      'Strong correctness: full ACID, transactional DDL, strict type checking, real `CHECK`/`EXCLUDE` constraints.',
      'Rich types: `jsonb`, arrays, ranges, `uuid`, `inet`, enums, composite types, so it can cover many document-store use cases.',
      'Extensible: custom types, operators, index methods and extensions like PostGIS, pgvector, TimescaleDB, Citus.',
      'Advanced SQL: CTEs, window functions, `LATERAL`, `MERGE`, `ON CONFLICT` upserts, full-text search.',
      'Trade-off: process-per-connection model needs a pooler at scale, and vacuum must be understood and tuned.',
    ],
  },
  {
    id: 'postgres-vs-mysql',
    group: 'Architecture',
    stars: 4,
    difficulty: 'Medium',
    q: 'How does PostgreSQL differ from MySQL (InnoDB)?',
    a: [
      'Process model: Postgres forks one OS process per connection; MySQL uses one thread per connection.',
      'MVCC: Postgres keeps old row versions in the table heap (needs `VACUUM`); InnoDB updates in place and keeps old versions in undo logs.',
      'Storage: Postgres tables are heaps with separate indexes; InnoDB tables are clustered on the primary key, and secondary indexes store the PK.',
      'Postgres has transactional DDL (`ALTER TABLE` can be rolled back); MySQL DDL causes an implicit commit.',
      'Postgres is stricter about types and has richer features (`jsonb` + GIN, partial/expression indexes, more index types, extensions).',
      'Default isolation: Postgres is Read Committed; InnoDB is Repeatable Read.',
    ],
  },
  {
    id: 'process-model',
    group: 'Architecture',
    stars: 4,
    difficulty: 'Medium',
    q: 'Describe the PostgreSQL process architecture.',
    a: [
      'The `postmaster` is the parent process: it listens on the port and forks a new backend process for every client connection.',
      'Each backend parses, plans and executes that session\'s queries, with its own private memory (`work_mem`, catalog caches).',
      'All processes share memory: `shared_buffers`, WAL buffers, the lock table and proc array.',
      'Background processes: checkpointer, background writer, WAL writer, autovacuum launcher + workers, stats/logical replication workers, archiver.',
      'Parallel queries spawn extra background workers (`max_parallel_workers_per_gather`).',
      'Consequence: connections are heavyweight, so thousands of idle connections waste RAM; use a pooler.',
    ],
  },
  {
    id: 'shared-buffers',
    group: 'Architecture',
    stars: 3,
    difficulty: 'Medium',
    q: 'What are `shared_buffers`, `work_mem` and `effective_cache_size`?',
    a: [
      '`shared_buffers`: Postgres\'s own page cache (8 KB pages) shared by all backends; typical start is ~25% of RAM.',
      'Postgres also relies on the OS page cache, so data is often cached twice ("double buffering"); that is why it is not set to 80% of RAM.',
      '`work_mem`: memory per sort/hash operation per query node, not per connection; too low spills to disk, too high risks OOM with many connections.',
      '`maintenance_work_mem`: memory for `VACUUM`, `CREATE INDEX`, `ALTER TABLE ADD FOREIGN KEY`.',
      '`effective_cache_size`: only a planner hint about total cache (shared buffers + OS); it allocates nothing.',
    ],
    code: `SHOW shared_buffers;
SET work_mem = '64MB';  -- per session
-- spills show up in EXPLAIN ANALYZE as:
-- Sort Method: external merge  Disk: 10240kB`,
  },
  {
    id: 'wal',
    group: 'Architecture',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is the Write-Ahead Log (WAL) and why does Postgres need it?',
    a: [
      'Rule: a change is written to the WAL (sequential log) and flushed to disk before the modified data page is written.',
      'On commit only the WAL must be fsynced; dirty data pages are flushed later, which turns random writes into sequential ones.',
      'Crash recovery replays WAL from the last checkpoint to rebuild any changes not yet in the data files (durability).',
      'The same WAL stream powers streaming replication, PITR backups and logical decoding.',
      'Lives in `pg_wal/` as 16 MB segment files; `wal_level` controls detail (`minimal`, `replica`, `logical`).',
      '`synchronous_commit = off` skips waiting for the WAL flush: faster, but a crash can lose the last few commits (no corruption).',
    ],
  },
  {
    id: 'checkpoints',
    group: 'Architecture',
    stars: 3,
    difficulty: 'Medium',
    q: 'What is a checkpoint?',
    a: [
      'A checkpoint flushes all dirty pages from `shared_buffers` to the data files and records a point in the WAL.',
      'Crash recovery only needs to replay WAL after the last checkpoint, and older WAL segments can be recycled.',
      'Triggered by `checkpoint_timeout` (default 5 min) or when WAL grows past `max_wal_size`.',
      '`checkpoint_completion_target` (default 0.9) spreads the writes over the interval to avoid I/O spikes.',
      'Frequent checkpoints = more I/O plus more full-page writes; "checkpoints are occurring too frequently" in logs means raise `max_wal_size`.',
    ],
  },
  {
    id: 'toast',
    group: 'Architecture',
    stars: 2,
    difficulty: 'Medium',
    q: 'What is TOAST?',
    a: [
      'TOAST = The Oversized-Attribute Storage Technique, for values too big to fit in an 8 KB page.',
      'When a row exceeds ~2 KB, large variable-length values (`text`, `jsonb`, `bytea`) are compressed and/or moved to a side TOAST table.',
      'The main row keeps a pointer; the value is fetched (de-TOASTed) only when the column is actually read.',
      'Max size of a single field is 1 GB.',
      'Practical impact: `SELECT *` on wide rows costs extra I/O; updating a big `jsonb` rewrites the whole value.',
    ],
  },

  // ───────────────────────── MVCC & Vacuum ─────────────────────────
  {
    id: 'mvcc',
    group: 'MVCC & Vacuum',
    stars: 5,
    difficulty: 'Medium',
    q: 'How does MVCC work in PostgreSQL?',
    a: [
      'Multi-Version Concurrency Control: readers never block writers and writers never block readers.',
      'Every row version (tuple) has hidden columns `xmin` (txn that created it) and `xmax` (txn that deleted/updated it).',
      'An `UPDATE` does not overwrite: it marks the old tuple\'s `xmax` and inserts a new tuple version.',
      'Each query/transaction takes a snapshot; a tuple is visible if its `xmin` committed before the snapshot and its `xmax` did not.',
      'Old versions stay in the table as dead tuples until `VACUUM` removes them.',
      'Only writers to the same row block each other (row lock on update).',
    ],
    code: `SELECT xmin, xmax, ctid, * FROM accounts WHERE id = 1;
UPDATE accounts SET balance = 50 WHERE id = 1;
SELECT xmin, xmax, ctid, * FROM accounts WHERE id = 1;
-- new xmin and new ctid: a new tuple was written`,
  },
  {
    id: 'dead-tuples',
    group: 'MVCC & Vacuum',
    stars: 4,
    difficulty: 'Medium',
    q: 'What are dead tuples and where do they come from?',
    a: [
      'A dead tuple is a row version no longer visible to any running or future transaction.',
      'Created by every `UPDATE` (old version) and `DELETE`, and by rolled-back inserts.',
      'They still occupy space in table and index pages, so scans read more pages.',
      'They can only be removed once no transaction with an older snapshot still needs them.',
      'Long-running transactions or abandoned `idle in transaction` sessions hold the xmin horizon back and block cleanup.',
      'Monitor with `pg_stat_user_tables.n_dead_tup`.',
    ],
    code: `SELECT relname, n_live_tup, n_dead_tup, last_autovacuum
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC LIMIT 10;`,
  },
  {
    id: 'vacuum-vs-vacuum-full',
    group: 'MVCC & Vacuum',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is the difference between `VACUUM` and `VACUUM FULL`?',
    a: [
      '`VACUUM` marks dead tuple space reusable for future inserts/updates, updates the visibility map and free space map, and freezes old tuples.',
      'Plain `VACUUM` runs concurrently with reads and writes (takes only `SHARE UPDATE EXCLUSIVE`) but usually does not shrink the file on disk.',
      '`VACUUM FULL` rewrites the whole table into a new compact file and returns space to the OS.',
      '`VACUUM FULL` holds an `ACCESS EXCLUSIVE` lock (blocks even `SELECT`) and needs extra disk for the copy.',
      '`VACUUM ANALYZE` also refreshes planner statistics.',
      'For online compaction use the `pg_repack` extension instead of `VACUUM FULL`.',
    ],
    code: `VACUUM (VERBOSE, ANALYZE) orders;
VACUUM FULL orders;  -- locks the table, rewrites it`,
  },
  {
    id: 'autovacuum',
    group: 'MVCC & Vacuum',
    stars: 4,
    difficulty: 'Medium',
    q: 'How does autovacuum work and how do you tune it?',
    a: [
      'A launcher process starts workers (`autovacuum_max_workers`, default 3) that vacuum and analyze tables as needed.',
      'A table is vacuumed when dead tuples > `autovacuum_vacuum_threshold` (50) + `autovacuum_vacuum_scale_factor` (0.2) x rows.',
      'The 20% default is too lazy for big tables: a 100M-row table waits for 20M dead rows; lower the scale factor per table.',
      'Workers are throttled by `autovacuum_vacuum_cost_limit`/`cost_delay`; raise the limit on fast disks so vacuum keeps up.',
      'Since PG 13 inserts also trigger vacuum (`autovacuum_vacuum_insert_threshold`), helping append-only tables get index-only scans.',
      'Never disable autovacuum: you get bloat and eventually transaction ID wraparound.',
    ],
    code: `ALTER TABLE events SET (
  autovacuum_vacuum_scale_factor = 0.01,
  autovacuum_analyze_scale_factor = 0.02
);`,
  },
  {
    id: 'table-bloat',
    group: 'MVCC & Vacuum',
    stars: 3,
    difficulty: 'Medium',
    q: 'What is table and index bloat and how do you fix it?',
    a: [
      'Bloat = space occupied by dead tuples or empty space that vacuum freed but the file never shrank.',
      'Causes: heavy updates/deletes, autovacuum not keeping up, long-running transactions holding back cleanup.',
      'Symptoms: table/index much larger than its live data, slower sequential and index scans, more cache misses.',
      'Measure with `pgstattuple` extension or bloat-estimate queries on `pg_class` + `pg_stats`.',
      'Fix tables online with `pg_repack`; fix indexes with `REINDEX INDEX CONCURRENTLY` (PG 12+).',
      'Prevent it: tune autovacuum per table, kill idle-in-transaction sessions (`idle_in_transaction_session_timeout`), use fillfactor for HOT.',
    ],
  },
  {
    id: 'txid-wraparound',
    group: 'MVCC & Vacuum',
    stars: 3,
    difficulty: 'Hard',
    q: 'What is transaction ID wraparound and how is it prevented?',
    a: [
      'Transaction IDs are 32-bit, so only ~2 billion XIDs can be "in the past" relative to any current XID.',
      'Without action, very old rows would suddenly appear to be in the future and become invisible (data loss).',
      'Freezing: `VACUUM` marks sufficiently old tuples as frozen, meaning visible to everyone regardless of XID.',
      'Autovacuum forces an anti-wraparound vacuum when a table\'s `relfrozenxid` age exceeds `autovacuum_freeze_max_age` (200M), even if autovacuum is "off".',
      'If age approaches ~2 billion, Postgres refuses new XIDs (effectively read-only) until a manual vacuum runs.',
      'Monitor `age(datfrozenxid)`; the usual culprits are long-running transactions, stale replication slots and orphaned prepared transactions.',
    ],
    code: `SELECT datname, age(datfrozenxid) AS xid_age
FROM pg_database ORDER BY xid_age DESC;`,
  },
  {
    id: 'hot-updates',
    group: 'MVCC & Vacuum',
    stars: 2,
    difficulty: 'Hard',
    q: 'What is a HOT (Heap-Only Tuple) update?',
    a: [
      'Normally every `UPDATE` creates a new tuple, so every index on the table needs a new entry pointing to it.',
      'HOT update: if no indexed column changed and the new version fits on the same page, indexes are not touched.',
      'The old tuple points to the new one on the same page via a chain; index entries still point to the chain head.',
      'Dead HOT tuples can be pruned during normal page access, without a full `VACUUM`.',
      'Encourage HOT by leaving free space with `fillfactor` (e.g. 80-90) and avoiding indexes on frequently updated columns.',
      'Check the ratio with `n_tup_hot_upd` vs `n_tup_upd` in `pg_stat_user_tables`.',
    ],
    code: `ALTER TABLE sessions SET (fillfactor = 85);
SELECT relname, n_tup_upd, n_tup_hot_upd
FROM pg_stat_user_tables;`,
  },
  {
    id: 'visibility-map',
    group: 'MVCC & Vacuum',
    stars: 2,
    difficulty: 'Hard',
    q: 'What are the visibility map and free space map?',
    a: [
      'Visibility map (VM): 2 bits per heap page, "all-visible" and "all-frozen".',
      'All-visible pages let index-only scans skip the heap and let vacuum skip pages with nothing to clean.',
      'All-frozen pages let anti-wraparound vacuums skip pages entirely.',
      'Free space map (FSM): tracks free space per page so inserts/updates can find room to reuse.',
      'Both are maintained by `VACUUM`, which is why vacuum frequency affects index-only scan performance.',
    ],
  },

  // ───────────────────────── Transactions & Locking ─────────────────────────
  {
    id: 'pg-isolation-levels',
    group: 'Transactions & Locking',
    stars: 5,
    difficulty: 'Medium',
    q: 'How do the isolation levels behave in PostgreSQL specifically?',
    a: [
      'Default is Read Committed: each statement sees a fresh snapshot of committed data.',
      '`READ UNCOMMITTED` is accepted but behaves exactly like Read Committed: Postgres never allows dirty reads.',
      'Repeatable Read is snapshot isolation: one snapshot for the whole transaction, so no non-repeatable reads and no phantoms.',
      'In Repeatable Read, updating a row changed by a concurrent committed txn raises a serialization failure (`40001`) instead of silently overwriting.',
      'Serializable adds SSI on top of snapshots to also prevent write skew.',
      'At Repeatable Read and Serializable the application must be ready to retry on `40001`.',
    ],
    code: `BEGIN ISOLATION LEVEL REPEATABLE READ;
SELECT sum(balance) FROM accounts;
-- same result for the rest of the txn
COMMIT;`,
  },
  {
    id: 'serializable-ssi',
    group: 'Transactions & Locking',
    stars: 3,
    difficulty: 'Hard',
    q: 'How does Serializable Snapshot Isolation (SSI) work in Postgres?',
    a: [
      'Serializable guarantees the result equals some serial order of the transactions.',
      'Postgres implements it optimistically: no extra blocking, it tracks read/write dependencies with predicate (SIRead) locks.',
      'When it detects a dangerous cycle of rw-dependencies, one transaction is aborted with `could not serialize access` (`40001`).',
      'Prevents write skew, e.g. two doctors each checking "someone else is on call" and both going off call.',
      'Costs: some false-positive aborts and memory for predicate locks; read-only transactions can use `DEFERRABLE` to avoid aborts.',
      'Rule: wrap serializable transactions in a retry loop.',
    ],
  },
  {
    id: 'row-level-locks',
    group: 'Transactions & Locking',
    stars: 4,
    difficulty: 'Medium',
    q: 'What row-level lock modes does Postgres have?',
    a: [
      '`FOR UPDATE`: strongest; blocks other updates, deletes and all other row locks. Taken implicitly by `DELETE` and key-changing `UPDATE`.',
      '`FOR NO KEY UPDATE`: taken by normal `UPDATE`s that do not change key columns; does not block `FOR KEY SHARE`.',
      '`FOR SHARE`: others can read-lock too but cannot modify the row.',
      '`FOR KEY SHARE`: weakest; taken by foreign-key checks, only blocks deletes and key changes.',
      'Row locks are stored in the tuple header (`xmax`), not in shared memory, so locking millions of rows is fine.',
      'Plain `SELECT` takes no row locks at all.',
    ],
  },
  {
    id: 'table-level-locks',
    group: 'Transactions & Locking',
    stars: 4,
    difficulty: 'Hard',
    q: 'Which table-level locks matter in practice?',
    a: [
      '`ACCESS SHARE`: taken by `SELECT`; only conflicts with `ACCESS EXCLUSIVE`.',
      '`ROW EXCLUSIVE`: taken by `INSERT`/`UPDATE`/`DELETE`; writers do not block each other at table level.',
      '`SHARE UPDATE EXCLUSIVE`: `VACUUM`, `ANALYZE`, `CREATE INDEX CONCURRENTLY`.',
      '`SHARE`: plain `CREATE INDEX`, blocks writes but not reads.',
      '`ACCESS EXCLUSIVE`: most `ALTER TABLE`, `DROP`, `TRUNCATE`, `VACUUM FULL`; blocks everything including `SELECT`.',
      'Lock queue trap: a waiting `ACCESS EXCLUSIVE` blocks every later query behind it, so set `lock_timeout` for DDL.',
    ],
    code: `SET lock_timeout = '3s';
ALTER TABLE users ADD COLUMN nickname text;`,
  },
  {
    id: 'skip-locked-job-queue',
    group: 'Transactions & Locking',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do you build a job queue in Postgres with `SELECT ... FOR UPDATE SKIP LOCKED`?',
    a: [
      'Each worker selects pending jobs and locks them with `FOR UPDATE`.',
      '`SKIP LOCKED` makes other workers skip rows already locked instead of waiting, so workers never fight over the same job.',
      'Lock, process and mark done in one transaction; if the worker crashes, the txn rolls back and the job is released.',
      'Index the pending rows (partial index on `status = \'pending\'`) to keep polling cheap.',
      '`NOWAIT` is the alternative that errors immediately instead of skipping.',
      'Used by libraries like Que, GoodJob, graphile-worker, pg-boss, Oban.',
    ],
    code: `UPDATE jobs SET status = 'running'
WHERE id = (
  SELECT id FROM jobs
  WHERE status = 'pending'
  ORDER BY created_at
  FOR UPDATE SKIP LOCKED
  LIMIT 1
)
RETURNING *;`,
  },
  {
    id: 'advisory-locks',
    group: 'Transactions & Locking',
    stars: 3,
    difficulty: 'Medium',
    q: 'What are advisory locks?',
    a: [
      'Application-defined locks on an arbitrary 64-bit number (or two 32-bit numbers); Postgres just enforces mutual exclusion.',
      'Not tied to any row or table, so they are useful for "only one instance runs this cron/migration" logic.',
      'Session-level (`pg_advisory_lock`) are held until unlocked or disconnect; transaction-level (`pg_advisory_xact_lock`) release at commit/rollback.',
      '`pg_try_advisory_lock` returns false instead of waiting.',
      'Pitfall: session-level locks with a transaction-mode pooler (PgBouncer) can leak to another client; prefer xact locks there.',
    ],
    code: `SELECT pg_try_advisory_lock(hashtext('nightly-report'));
-- ... do the work ...
SELECT pg_advisory_unlock(hashtext('nightly-report'));`,
  },
  {
    id: 'deadlock-detection',
    group: 'Transactions & Locking',
    stars: 4,
    difficulty: 'Medium',
    q: 'How does Postgres detect and handle deadlocks?',
    a: [
      'A deadlock: txn A waits on a lock held by B while B waits on a lock held by A.',
      'After waiting `deadlock_timeout` (default 1s), a backend runs the deadlock detector on the wait-for graph.',
      'If a cycle is found, one transaction is aborted with `deadlock detected` (`40P01`) and the others proceed.',
      'Prevention: always lock rows in a consistent order (e.g. `ORDER BY id` before `FOR UPDATE`), keep transactions short.',
      'Investigate with `log_lock_waits = on` and the `pg_locks` + `pg_stat_activity` views (`pg_blocking_pids()`).',
    ],
    code: `SELECT pid, pg_blocking_pids(pid) AS blocked_by, query
FROM pg_stat_activity
WHERE cardinality(pg_blocking_pids(pid)) > 0;`,
  },
  {
    id: 'idle-in-transaction',
    group: 'Transactions & Locking',
    stars: 3,
    difficulty: 'Medium',
    q: 'Why are long-running and `idle in transaction` sessions dangerous?',
    a: [
      'They keep their snapshot open, holding back the xmin horizon so vacuum cannot remove any newer dead tuples (database-wide bloat).',
      'They keep holding every lock they acquired, which can block DDL and pile up queues.',
      'Common cause: app opens a transaction, then does slow network work or forgets to commit.',
      'Guard rails: `idle_in_transaction_session_timeout`, `statement_timeout`, `transaction_timeout` (PG 17).',
      'Find them in `pg_stat_activity` where `state = \'idle in transaction\'` ordered by `xact_start`.',
    ],
    code: `SELECT pid, now() - xact_start AS age, state, query
FROM pg_stat_activity
WHERE state LIKE 'idle in transaction%'
ORDER BY age DESC;`,
  },

  // ───────────────────────── Indexes ─────────────────────────
  {
    id: 'index-types',
    group: 'Indexes',
    stars: 5,
    difficulty: 'Medium',
    q: 'What index types does PostgreSQL offer and when do you use each?',
    a: [
      'B-tree (default): equality and range (`<`, `>`, `BETWEEN`), `ORDER BY`, prefix `LIKE \'abc%\'`. Use for 90% of cases.',
      'Hash: equality only; WAL-logged and crash-safe since PG 10, but rarely better than B-tree.',
      'GIN: inverted index for values containing many elements: `jsonb`, arrays, full-text `tsvector`, trigrams.',
      'GiST: balanced tree framework for geometric/range/nearest-neighbour queries (PostGIS, ranges, exclusion constraints).',
      'SP-GiST: space-partitioned trees (quadtrees, radix tries) for non-balanced data like IPs, points, text prefixes.',
      'BRIN: tiny block-range summaries (min/max) for huge tables naturally ordered by a column, like time-series.',
    ],
  },
  {
    id: 'btree-index',
    group: 'Indexes',
    stars: 4,
    difficulty: 'Medium',
    q: 'How does a B-tree index work in Postgres and what are multicolumn index rules?',
    a: [
      'Balanced tree of sorted keys; leaf entries hold the key and a TID (`ctid`) pointing to the heap tuple.',
      'Lookups are O(log n) and leaves are linked, so range scans and ordered output are cheap.',
      'Multicolumn `(a, b)`: efficient for `a = ?` and `a = ? AND b = ?`, not for `b = ?` alone (leftmost-prefix rule).',
      'PG 18 adds skip scan for B-tree, but put equality columns first and range columns last anyway.',
      'Deduplication (PG 13+) stores repeated keys once, shrinking indexes on low-cardinality columns.',
      'Every index slows writes and takes space; drop unused ones (`pg_stat_user_indexes.idx_scan = 0`).',
    ],
    code: `CREATE INDEX ON orders (customer_id, created_at);
-- uses index: WHERE customer_id = 7 AND created_at > now() - '7 days'::interval
-- poor fit : WHERE created_at > now() - '7 days'::interval`,
  },
  {
    id: 'gin-index',
    group: 'Indexes',
    stars: 4,
    difficulty: 'Medium',
    q: 'When do you use a GIN index?',
    a: [
      'GIN = Generalized Inverted Index: maps each element (key, array item, lexeme) to the rows containing it.',
      'Use for `jsonb` containment `@>`, key existence `?`, array operators `@>`/`&&`, full-text `@@`, and `pg_trgm` `LIKE \'%x%\'`.',
      '`jsonb_path_ops` operator class is smaller and faster but supports only `@>` (and jsonpath), not `?`.',
      'Fast lookups, but slower to build and update; `fastupdate` buffers inserts in a pending list.',
      'Not useful for range or ordering queries.',
    ],
    code: `CREATE INDEX ON products USING gin (attrs jsonb_path_ops);
SELECT * FROM products WHERE attrs @> '{"color": "red"}';

CREATE INDEX ON posts USING gin (tags);
SELECT * FROM posts WHERE tags @> ARRAY['postgres'];`,
  },
  {
    id: 'gist-brin',
    group: 'Indexes',
    stars: 3,
    difficulty: 'Hard',
    q: 'When would you choose GiST or BRIN over B-tree?',
    a: [
      'GiST supports "overlaps", "contains" and distance operators, which B-tree cannot express.',
      'GiST use cases: PostGIS geometries, range types (`tstzrange &&`), KNN `ORDER BY location <-> point`, exclusion constraints.',
      'BRIN stores min/max per block range (default 128 pages), so it is kilobytes for a table of hundreds of GB.',
      'BRIN only works well when the column correlates with physical order, e.g. append-only `created_at` in logs/events.',
      'BRIN is lossy: it returns candidate block ranges that are then rechecked, so it is slower per query than B-tree but far cheaper to keep.',
    ],
    code: `CREATE INDEX ON events USING brin (created_at);

CREATE EXTENSION btree_gist;
ALTER TABLE bookings ADD CONSTRAINT no_overlap
  EXCLUDE USING gist (room_id WITH =, during WITH &&);`,
  },
  {
    id: 'partial-index',
    group: 'Indexes',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is a partial index?',
    a: [
      'An index with a `WHERE` clause that only includes rows matching the predicate.',
      'Smaller and faster to maintain when queries target a small subset, e.g. unprocessed jobs or non-deleted rows.',
      'Planner uses it only if the query\'s `WHERE` implies the index predicate.',
      'A partial unique index enforces uniqueness on a subset, e.g. one active subscription per user, or unique email among non-deleted users.',
    ],
    code: `CREATE INDEX ON jobs (created_at) WHERE status = 'pending';

CREATE UNIQUE INDEX one_active_sub
  ON subscriptions (user_id) WHERE active;`,
  },
  {
    id: 'expression-index',
    group: 'Indexes',
    stars: 3,
    difficulty: 'Medium',
    q: 'What is an expression (functional) index?',
    a: [
      'An index on the result of an expression rather than a raw column.',
      'The query must use the exact same expression for the planner to match it.',
      'Classic use: case-insensitive lookup with `lower(email)`, or indexing a `jsonb` field `(data->>\'sku\')`.',
      'Functions used must be `IMMUTABLE` (e.g. `now()` cannot be used).',
      'Run `ANALYZE` after creating it: Postgres collects statistics on the expression too.',
      'Alternatives: the `citext` type, or a stored generated column with a regular index.',
    ],
    code: `CREATE UNIQUE INDEX users_email_lower ON users (lower(email));
SELECT * FROM users WHERE lower(email) = lower('A@x.com');`,
  },
  {
    id: 'covering-index-include',
    group: 'Indexes',
    stars: 3,
    difficulty: 'Medium',
    q: 'What is a covering index with `INCLUDE`, and what is an index-only scan?',
    a: [
      'Index-only scan: answers the query from the index alone, without visiting the heap.',
      'Requires every referenced column to be in the index and the heap page to be marked all-visible in the visibility map.',
      '`INCLUDE (cols)` (PG 11+) adds non-key payload columns to B-tree leaves: they are not searchable but avoid heap fetches.',
      '`INCLUDE` columns do not affect uniqueness, so you can have `UNIQUE (id) INCLUDE (name)`.',
      'In `EXPLAIN ANALYZE`, check `Heap Fetches`: a high number means vacuum is behind and the visibility map is stale.',
    ],
    code: `CREATE INDEX ON orders (customer_id) INCLUDE (total, status);
EXPLAIN ANALYZE
SELECT total, status FROM orders WHERE customer_id = 42;
-- Index Only Scan ... Heap Fetches: 0`,
  },
  {
    id: 'create-index-concurrently',
    group: 'Indexes',
    stars: 5,
    difficulty: 'Medium',
    q: 'Why use `CREATE INDEX CONCURRENTLY` and what are its caveats?',
    a: [
      'Plain `CREATE INDEX` takes a `SHARE` lock that blocks all writes for the whole build.',
      '`CONCURRENTLY` builds without blocking reads or writes (only `SHARE UPDATE EXCLUSIVE`).',
      'It is slower: two table scans and waits for existing transactions to finish.',
      'Cannot run inside a transaction block, so migration tools must run it outside a transaction.',
      'If it fails, it leaves an `INVALID` index that is still maintained on writes; drop it and retry.',
      'Same idea: `REINDEX ... CONCURRENTLY` and `DROP INDEX CONCURRENTLY`.',
    ],
    code: `CREATE INDEX CONCURRENTLY idx_orders_user ON orders (user_id);
-- find leftovers from failed builds
SELECT indexrelid::regclass FROM pg_index WHERE NOT indisvalid;`,
  },
  {
    id: 'index-not-used',
    group: 'Indexes',
    stars: 4,
    difficulty: 'Medium',
    q: 'Why might Postgres not use your index?',
    a: [
      'Low selectivity: if the query returns a large fraction of rows, a sequential scan is genuinely cheaper.',
      'Function or cast on the column (`WHERE date(created_at) = ...`, implicit type mismatch) without a matching expression index.',
      'Leading wildcard `LIKE \'%x\'` cannot use a B-tree (use `pg_trgm` GIN), and non-C collations need `text_pattern_ops` for prefix `LIKE`.',
      'Multicolumn index where the query skips the leading column.',
      'Stale statistics: run `ANALYZE`; or tiny tables where a seq scan is a few pages.',
      'Cost settings: `random_page_cost` default 4 assumes spinning disks; set ~1.1 on SSDs.',
    ],
  },
  {
    id: 'foreign-key-index',
    group: 'Indexes',
    stars: 3,
    difficulty: 'Easy',
    q: 'Does Postgres automatically index foreign keys?',
    a: [
      'No. Postgres automatically indexes `PRIMARY KEY` and `UNIQUE` constraints, but not the referencing column of a foreign key.',
      'Without an index, deleting/updating a parent row does a sequential scan of the child table for each row.',
      'Joins from parent to child are also slower without it.',
      'Add an index on the FK column in most cases, unless the table is tiny or the parent is never deleted.',
    ],
    code: `CREATE TABLE order_items (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id bigint NOT NULL REFERENCES orders(id)
);
CREATE INDEX ON order_items (order_id);`,
  },

  // ───────────────────────── Query Planning ─────────────────────────
  {
    id: 'explain-analyze',
    group: 'Query Planning',
    stars: 5,
    difficulty: 'Medium',
    q: 'How do you read `EXPLAIN ANALYZE` output?',
    a: [
      '`EXPLAIN` shows the estimated plan; `EXPLAIN ANALYZE` actually runs the query and adds real timings and row counts.',
      'Read the tree from the innermost/most indented nodes up; each node feeds its parent.',
      '`cost=startup..total` is in arbitrary planner units; `actual time` is ms per loop, multiply by `loops`.',
      'Compare estimated `rows` with actual `rows`: a large mismatch means bad statistics and likely a bad plan.',
      'Add `BUFFERS` to see shared hit (cache) vs read (disk) pages.',
      'Careful: `ANALYZE` executes writes too, so wrap `UPDATE`/`DELETE` in `BEGIN; ... ROLLBACK;`.',
    ],
    code: `EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders WHERE customer_id = 42;
-- Index Scan using orders_customer_id_idx on orders
--   (cost=0.43..8.45 rows=1 width=64)
--   (actual time=0.02..0.03 rows=3 loops=1)
--   Buffers: shared hit=4`,
  },
  {
    id: 'scan-types',
    group: 'Query Planning',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is the difference between Seq Scan, Index Scan, Index Only Scan and Bitmap Heap Scan?',
    a: [
      'Seq Scan: reads every page of the table in order; best when many rows match or the table is small.',
      'Index Scan: walks the index and fetches each matching heap tuple; best for few rows, gives ordered output.',
      'Index Only Scan: answers from the index without heap access (needs all columns in the index + all-visible pages).',
      'Bitmap Index Scan + Bitmap Heap Scan: collects matching TIDs into a bitmap, then reads heap pages in physical order once each.',
      'Bitmap scans suit medium selectivity and can combine indexes with `BitmapAnd`/`BitmapOr`.',
      '`Rows Removed by Filter` in a seq scan is a hint an index could help.',
    ],
  },
  {
    id: 'join-algorithms',
    group: 'Query Planning',
    stars: 4,
    difficulty: 'Hard',
    q: 'What join algorithms does the Postgres planner use?',
    a: [
      'Nested Loop: for each outer row, look up matching inner rows; great when the outer side is small and the inner has an index.',
      'Hash Join: builds a hash table of the smaller input, then probes it with the other; good for large unsorted equi-joins; needs `work_mem`.',
      'Merge Join: both inputs sorted on the join key, then walked together; good for large inputs already sorted (via index).',
      'Only Nested Loop handles non-equality join conditions.',
      'A Nested Loop with a huge `loops` count usually means the planner underestimated the outer rows.',
      'For diagnosis only you can disable one with `SET enable_nestloop = off;`, never in production config.',
    ],
  },
  {
    id: 'statistics-analyze',
    group: 'Query Planning',
    stars: 4,
    difficulty: 'Medium',
    q: 'How does the planner estimate row counts, and what does `ANALYZE` do?',
    a: [
      '`ANALYZE` samples rows and stores per-column stats in `pg_statistic` (readable via `pg_stats`).',
      'Stats include null fraction, distinct count, most common values with frequencies and a histogram.',
      'Planner multiplies selectivities assuming columns are independent, which breaks for correlated columns (city + zip).',
      '`CREATE STATISTICS` adds extended stats (dependencies, ndistinct, MCV) for column combinations.',
      'Raise `ALTER TABLE ... ALTER COLUMN ... SET STATISTICS 1000` for skewed columns (default target 100).',
      'Autovacuum runs `ANALYZE` automatically; run it manually after bulk loads.',
    ],
    code: `CREATE STATISTICS addr_stats (dependencies, ndistinct)
  ON city, zip FROM addresses;
ANALYZE addresses;`,
  },
  {
    id: 'pg-stat-statements',
    group: 'Query Planning',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is `pg_stat_statements` and how do you use it to find slow queries?',
    a: [
      'An extension that aggregates statistics for every normalized query shape (literals replaced by `$1`).',
      'Tracks calls, total/mean execution time, rows, shared buffer hits/reads, temp usage.',
      'Must be in `shared_preload_libraries` and then `CREATE EXTENSION pg_stat_statements`.',
      'Sort by `total_exec_time` to find what costs the most overall, not just the slowest single query.',
      'Pair with `auto_explain` to log plans of queries over a duration, and `log_min_duration_statement`.',
    ],
    code: `SELECT query, calls,
       round(total_exec_time) AS total_ms,
       round(mean_exec_time, 2) AS mean_ms
FROM pg_stat_statements
ORDER BY total_exec_time DESC LIMIT 10;`,
  },
  {
    id: 'prepared-statements-plans',
    group: 'Query Planning',
    stars: 2,
    difficulty: 'Hard',
    q: 'How does Postgres choose between custom and generic plans for prepared statements?',
    a: [
      'A prepared statement is parsed once; the first 5 executions get custom plans built with the actual parameter values.',
      'After that, Postgres compares a generic (parameter-agnostic) plan cost with the average custom cost and may switch to generic.',
      'Generic plans save planning time but can be terrible for skewed data (one value matches 90% of rows).',
      '`plan_cache_mode = force_custom_plan` (or `force_generic_plan`) overrides the heuristic.',
      'ORMs and drivers use prepared statements implicitly, so this explains "query fast in psql, slow from the app".',
    ],
  },
  {
    id: 'slow-query-checklist',
    group: 'Query Planning',
    stars: 4,
    difficulty: 'Medium',
    q: 'A query is slow in production. How do you approach it?',
    a: [
      'Find it: `pg_stat_statements` or slow-query log (`log_min_duration_statement`).',
      'Run `EXPLAIN (ANALYZE, BUFFERS)` and find the node where time and rows explode.',
      'Check estimate vs actual rows; if off, `ANALYZE` or add extended statistics.',
      'Look for seq scans with big `Rows Removed by Filter`, sorts spilling to disk, nested loops with huge loop counts.',
      'Fix: add or adjust an index, rewrite the query (avoid functions on indexed columns, `OR` to `UNION`), raise `work_mem` for that query.',
      'Also rule out locks (`pg_stat_activity.wait_event`) and bloat before blaming the plan.',
    ],
  },

  // ───────────────────────── Data Types & Features ─────────────────────────
  {
    id: 'json-vs-jsonb',
    group: 'Data Types & Features',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is the difference between `json` and `jsonb`?',
    a: [
      '`json` stores the exact input text: keeps whitespace, key order and duplicate keys; re-parsed on every access.',
      '`jsonb` stores a decomposed binary format: slightly slower to write, much faster to query.',
      '`jsonb` removes duplicate keys (last wins) and does not preserve key order or whitespace.',
      'Only `jsonb` supports GIN indexing and containment/existence operators (`@>`, `?`, `?|`, `?&`).',
      'Use `jsonb` by default; `json` only if you must keep the exact original text.',
      'Operators: `->` returns json, `->>` returns text, `#>` path, `@?`/`@@` for SQL/JSON path.',
    ],
    code: `SELECT data->'address'->>'city' FROM users
WHERE data @> '{"plan": "pro"}';

UPDATE users
SET data = jsonb_set(data, '{plan}', '"free"')
WHERE id = 1;`,
  },
  {
    id: 'jsonb-vs-columns',
    group: 'Data Types & Features',
    stars: 3,
    difficulty: 'Medium',
    q: 'When should you use `jsonb` columns versus normal columns?',
    a: [
      'Use real columns for fields you filter, join, sort or constrain on regularly: typed, smaller, better statistics.',
      'Use `jsonb` for sparse, variable or user-defined attributes and for storing external API payloads.',
      'Planner has no per-key statistics inside `jsonb`, so estimates on JSON predicates are often poor.',
      'Updating any key rewrites the whole value (and TOAST), which is costly for large documents.',
      'Hybrid is common: core fields as columns, extras in `jsonb`, with expression or GIN indexes for hot keys.',
    ],
  },
  {
    id: 'arrays',
    group: 'Data Types & Features',
    stars: 2,
    difficulty: 'Easy',
    q: 'How do arrays work in PostgreSQL?',
    a: [
      'Any type can be an array: `text[]`, `int[]`; arrays are 1-indexed.',
      'Operators: `@>` contains, `<@` contained by, `&&` overlap; `= ANY(arr)` checks membership.',
      '`unnest()` turns an array into rows; `array_agg()` does the reverse.',
      'GIN indexes accelerate `@>` and `&&`.',
      'Good for small tag lists; use a join table if you need FKs, per-item attributes or heavy per-item updates.',
    ],
    code: `SELECT * FROM posts WHERE 'sql' = ANY(tags);
SELECT * FROM posts WHERE tags && ARRAY['pg', 'sql'];
SELECT id, unnest(tags) AS tag FROM posts;
SELECT * FROM users WHERE id = ANY($1::int[]);`,
  },
  {
    id: 'uuid-serial-identity',
    group: 'Data Types & Features',
    stars: 4,
    difficulty: 'Medium',
    q: 'Should primary keys be `serial`, `IDENTITY` or `uuid`?',
    a: [
      '`serial`/`bigserial` is legacy shorthand: an `integer` column with a default from an owned sequence.',
      '`GENERATED ALWAYS AS IDENTITY` is the SQL-standard replacement: cleaner permissions, cannot be overwritten accidentally.',
      'Prefer `bigint` over `int` to avoid running out at 2.1 billion.',
      '`uuid` (16 bytes): globally unique, generatable by clients, non-guessable, good for distributed systems and public IDs.',
      'Random UUIDv4 scatters inserts across the B-tree (page splits, poor cache locality); time-ordered UUIDv7 avoids that (`uuidv7()` built in from PG 18).',
      '`gen_random_uuid()` is built in since PG 13.',
    ],
    code: `CREATE TABLE users (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  public_id uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE
);`,
  },
  {
    id: 'sequences',
    group: 'Data Types & Features',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do sequences behave, and why do IDs have gaps?',
    a: [
      'A sequence is a special single-row object generating numbers via `nextval()`, `currval()`, `setval()`.',
      '`nextval()` is never rolled back: a rolled-back insert still consumes the number, causing gaps.',
      'Sequences cache values per session (`CACHE n`) and are not transactional, so concurrency is cheap.',
      'Crashes can also skip values; never rely on IDs being gapless or strictly in commit order.',
      'After manual inserts with explicit IDs, fix the sequence with `setval`.',
      'Need gapless invoice numbers? Use a counter row updated under a row lock.',
    ],
    code: `SELECT setval(
  pg_get_serial_sequence('users', 'id'),
  (SELECT max(id) FROM users)
);`,
  },
  {
    id: 'enum-type',
    group: 'Data Types & Features',
    stars: 2,
    difficulty: 'Easy',
    q: 'What are ENUM types and what are their trade-offs?',
    a: [
      '`CREATE TYPE mood AS ENUM (...)` makes a type with a fixed ordered set of labels, stored in 4 bytes.',
      'Values sort in declaration order, not alphabetically.',
      '`ALTER TYPE ... ADD VALUE` is cheap, but removing or renaming-with-reorder values requires recreating the type.',
      'Alternatives: `text` + `CHECK (status IN (...))`, or a lookup table with an FK (most flexible).',
      'Good for small, stable sets (days of week); a lookup table is better when values change or carry attributes.',
    ],
    code: `CREATE TYPE order_status AS ENUM ('pending', 'paid', 'shipped');
ALTER TYPE order_status ADD VALUE 'refunded';`,
  },
  {
    id: 'generated-columns',
    group: 'Data Types & Features',
    stars: 2,
    difficulty: 'Easy',
    q: 'What are generated columns?',
    a: [
      'A column always computed from other columns of the same row: `GENERATED ALWAYS AS (expr) STORED`.',
      'Stored generated columns (PG 12+) are computed on write and can be indexed; PG 18 adds `VIRTUAL` (computed on read).',
      'The expression must be immutable and reference only the current row (no subqueries, no `now()`).',
      'You cannot insert into or update them directly.',
      'Common uses: a `tsvector` for search, normalized/lowercased values, totals.',
    ],
    code: `ALTER TABLE articles ADD COLUMN search tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', title || ' ' || body)
  ) STORED;`,
  },
  {
    id: 'upsert-on-conflict',
    group: 'Data Types & Features',
    stars: 5,
    difficulty: 'Medium',
    q: 'How does `INSERT ... ON CONFLICT` (upsert) work?',
    a: [
      'Atomic insert-or-update with no race between "check" and "insert", unlike select-then-insert.',
      'Needs a conflict target: columns with a unique index/constraint, or `ON CONSTRAINT name`.',
      '`DO NOTHING` skips the row; `DO UPDATE SET ...` updates the existing row.',
      '`EXCLUDED` refers to the row you tried to insert.',
      'Add a `WHERE` to `DO UPDATE` to update only when something changed; `RETURNING` works too.',
      '`MERGE` (PG 15+) handles more complex insert/update/delete logic but is not race-free like `ON CONFLICT`.',
    ],
    code: `INSERT INTO page_views (page, views)
VALUES ('/home', 1)
ON CONFLICT (page)
DO UPDATE SET views = page_views.views + EXCLUDED.views
RETURNING views;`,
  },
  {
    id: 'returning-clause',
    group: 'Data Types & Features',
    stars: 3,
    difficulty: 'Easy',
    q: 'What does the `RETURNING` clause do?',
    a: [
      'Returns rows affected by `INSERT`, `UPDATE`, `DELETE` (and `MERGE` from PG 17) in the same statement.',
      'Avoids a second round trip to fetch generated IDs, defaults or computed values.',
      'Combine with data-modifying CTEs to move rows between tables atomically.',
      'PG 18 adds `OLD` and `NEW` aliases to return before and after values.',
    ],
    code: `WITH moved AS (
  DELETE FROM jobs WHERE status = 'done'
  RETURNING *
)
INSERT INTO jobs_archive SELECT * FROM moved;`,
  },
  {
    id: 'cte-materialization',
    group: 'Data Types & Features',
    stars: 3,
    difficulty: 'Hard',
    q: 'Are CTEs an optimization fence in PostgreSQL?',
    a: [
      'Before PG 12, every CTE (`WITH`) was always materialized: computed once and treated as a fence, so filters were not pushed into it.',
      'Since PG 12, a non-recursive, side-effect-free CTE referenced once is inlined like a subquery.',
      'CTEs referenced more than once are still materialized by default.',
      'Override with `AS MATERIALIZED` (force a fence, e.g. to compute an expensive part once) or `AS NOT MATERIALIZED`.',
      'Data-modifying CTEs (`INSERT/UPDATE/DELETE ... RETURNING`) always execute exactly once.',
    ],
    code: `WITH recent AS NOT MATERIALIZED (
  SELECT * FROM orders WHERE created_at > now() - interval '1 day'
)
SELECT * FROM recent WHERE customer_id = 42;`,
  },
  {
    id: 'listen-notify',
    group: 'Data Types & Features',
    stars: 2,
    difficulty: 'Medium',
    q: 'What is `LISTEN`/`NOTIFY`?',
    a: [
      'Built-in pub/sub: sessions `LISTEN channel`; any session can `NOTIFY channel, \'payload\'` or call `pg_notify()`.',
      'Notifications are delivered only on commit, and are dropped if the transaction rolls back.',
      'Payload is limited to ~8000 bytes; send an ID and let the listener fetch the row.',
      'Not durable: if no one is listening, the message is lost; it is a wake-up signal, not a queue.',
      'Listeners need a dedicated session connection, so it does not work through transaction-mode PgBouncer.',
      'Common pattern: a trigger calls `pg_notify` and a worker wakes to process a jobs table.',
    ],
    code: `LISTEN new_order;
-- in another session / trigger:
SELECT pg_notify('new_order', '123');`,
  },
  {
    id: 'full-text-search',
    group: 'Data Types & Features',
    stars: 3,
    difficulty: 'Medium',
    q: 'How does full-text search work in PostgreSQL?',
    a: [
      '`tsvector`: a document normalized to lexemes (stemmed, stop words removed) with positions.',
      '`tsquery`: the search expression; build it with `to_tsquery`, `plainto_tsquery` or `websearch_to_tsquery`.',
      'Match with `@@`; rank with `ts_rank` or `ts_rank_cd`; highlight with `ts_headline`.',
      'Store the `tsvector` in a generated column and index it with GIN for speed.',
      'Language configs (`english`, `simple`) control stemming; use `setweight` to rank titles above bodies.',
      'Fine for app search; Elasticsearch/OpenSearch is better for fuzzy relevance tuning, facets and huge scale.',
    ],
    code: `CREATE INDEX ON articles USING gin (search);
SELECT title, ts_rank(search, q) AS rank
FROM articles, websearch_to_tsquery('english', 'postgres index') q
WHERE search @@ q
ORDER BY rank DESC LIMIT 10;`,
  },
  {
    id: 'extensions',
    group: 'Data Types & Features',
    stars: 3,
    difficulty: 'Easy',
    q: 'What are Postgres extensions and which ones are commonly used?',
    a: [
      'Packages that add types, functions, operators or index methods, installed with `CREATE EXTENSION`.',
      '`pgvector`: `vector` type with HNSW/IVFFlat indexes for embedding similarity search (RAG, recommendations).',
      '`PostGIS`: geospatial types and functions with GiST indexes.',
      '`pg_trgm`: trigram similarity for fuzzy search and fast `LIKE \'%x%\'` / `ILIKE` via GIN/GiST.',
      '`pg_stat_statements` (query stats), `pgcrypto`, `citext`, `uuid-ossp`, `postgres_fdw`, `pg_partman`, `TimescaleDB`, `Citus`.',
      'Managed services only allow a whitelisted set of extensions.',
    ],
    code: `CREATE EXTENSION vector;
CREATE TABLE docs (id bigint PRIMARY KEY, embedding vector(1536));
CREATE INDEX ON docs USING hnsw (embedding vector_cosine_ops);
SELECT id FROM docs ORDER BY embedding <=> $1 LIMIT 5;`,
  },
  {
    id: 'pg-trgm',
    group: 'Data Types & Features',
    stars: 2,
    difficulty: 'Medium',
    q: 'How do you make `LIKE \'%term%\'` or fuzzy search fast?',
    a: [
      'B-tree cannot help a leading wildcard; it only supports prefix matches.',
      '`pg_trgm` splits strings into 3-character trigrams and indexes them with GIN or GiST.',
      'Then `LIKE`, `ILIKE` and regex queries with any wildcard position can use the index.',
      'Also gives similarity search: `%` operator, `similarity()`, `word_similarity()` for typo-tolerant matching.',
      'Needs at least 3 characters in the search term to be selective.',
    ],
    code: `CREATE EXTENSION pg_trgm;
CREATE INDEX ON users USING gin (name gin_trgm_ops);
SELECT * FROM users WHERE name ILIKE '%deep%';
SELECT name FROM users WHERE name % 'jonh' ORDER BY similarity(name, 'jonh') DESC;`,
  },

  // ───────────────────────── Scaling & Ops ─────────────────────────
  {
    id: 'connection-pooling',
    group: 'Scaling & Ops',
    stars: 5,
    difficulty: 'Medium',
    q: 'Why are Postgres connections expensive, and how does PgBouncer help?',
    a: [
      'Each connection is a forked process using several MB of RAM plus per-query `work_mem`; setup costs a fork and auth.',
      'Hundreds of active backends cause contention (locks, snapshots, CPU context switches), so throughput drops past roughly a few x CPU cores.',
      'PgBouncer sits in front and multiplexes many client connections onto a small pool of server connections.',
      'Session mode: client keeps a server connection until disconnect (safe, little gain).',
      'Transaction mode: server connection returned after each transaction (most common); breaks session state like `SET`, session advisory locks, `LISTEN`.',
      'Serverless/edge apps especially need a pooler (PgBouncer, Supavisor, RDS Proxy); PgBouncer 1.21+ supports protocol-level prepared statements.',
    ],
  },
  {
    id: 'streaming-vs-logical-replication',
    group: 'Scaling & Ops',
    stars: 4,
    difficulty: 'Hard',
    q: 'What is the difference between streaming (physical) and logical replication?',
    a: [
      'Streaming replication ships raw WAL bytes; the standby is a byte-for-byte copy of the whole cluster.',
      'Physical standbys are read-only, must run the same major version, and copy everything (all databases).',
      'Logical replication decodes WAL into row changes and uses publications/subscriptions per table.',
      'Logical works across major versions and allows selective tables, so it is used for zero-downtime upgrades and data integration.',
      'Logical does not replicate DDL or sequence values (as of PG 17), and requires a replica identity (usually the PK) for updates/deletes.',
      'Both use replication slots; an abandoned slot retains WAL forever and can fill the disk.',
    ],
    code: `-- publisher
CREATE PUBLICATION app_pub FOR TABLE users, orders;
-- subscriber
CREATE SUBSCRIPTION app_sub
  CONNECTION 'host=primary dbname=app user=repl'
  PUBLICATION app_pub;`,
  },
  {
    id: 'read-replicas',
    group: 'Scaling & Ops',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do read replicas work and what are the pitfalls?',
    a: [
      'Hot standbys receive WAL via streaming replication and serve read-only queries.',
      'Replication is asynchronous by default, so replicas lag: a user may not see their own write (read-your-writes problem).',
      'Fix by routing a user\'s reads to the primary right after writes, or by checking replica LSN.',
      '`synchronous_commit` with `synchronous_standby_names` waits for replicas: no data loss on failover, but higher write latency.',
      'Long queries on replicas can be cancelled by recovery conflicts; `hot_standby_feedback = on` helps but can bloat the primary.',
      'Monitor lag with `pg_stat_replication` (`replay_lag`) on the primary.',
    ],
    code: `SELECT client_addr, state, write_lag, replay_lag
FROM pg_stat_replication;`,
  },
  {
    id: 'declarative-partitioning',
    group: 'Scaling & Ops',
    stars: 4,
    difficulty: 'Medium',
    q: 'How does declarative partitioning work and when should you use it?',
    a: [
      'A parent table is split by `RANGE`, `LIST` or `HASH` on a partition key into child tables.',
      'Partition pruning: the planner skips partitions that cannot match the `WHERE`, at plan time and at execution time.',
      'Biggest win is data lifecycle: drop or detach an old month instantly instead of a huge `DELETE` + vacuum.',
      'Primary keys/unique constraints must include the partition key.',
      'Queries without the partition key scan all partitions; too many partitions (thousands) increases planning overhead.',
      'Worth it for very large, time-based tables (logs, events, metrics); automate creation with `pg_partman`.',
    ],
    code: `CREATE TABLE events (
  id bigint, created_at timestamptz NOT NULL, payload jsonb
) PARTITION BY RANGE (created_at);

CREATE TABLE events_2026_11 PARTITION OF events
  FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');

ALTER TABLE events DETACH PARTITION events_2026_11 CONCURRENTLY;`,
  },
  {
    id: 'sharding-citus',
    group: 'Scaling & Ops',
    stars: 3,
    difficulty: 'Hard',
    q: 'How do you scale Postgres writes beyond one machine?',
    a: [
      'First exhaust vertical scaling, query/index tuning, pooling, caching and read replicas; one big node goes very far.',
      'Postgres has no built-in sharding: partitioning splits tables within a single server.',
      'Citus extension distributes tables across worker nodes by a distribution column (e.g. `tenant_id`) and parallelizes queries.',
      'Co-locate related tables on the same shard key so joins stay local; reference tables are replicated to every node.',
      'Alternatives: application-level sharding, or distributed Postgres-compatible databases (CockroachDB, YugabyteDB, Aurora Limitless).',
      'Costs: cross-shard transactions and joins are slower, and resharding is operationally hard.',
    ],
    code: `CREATE EXTENSION citus;
SELECT create_distributed_table('orders', 'tenant_id');`,
  },
  {
    id: 'backups-pitr',
    group: 'Scaling & Ops',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is the difference between `pg_dump` and physical backups with PITR?',
    a: [
      '`pg_dump` is a logical backup: SQL or custom-format dump of one database, consistent via a snapshot.',
      'Logical dumps are portable across major versions and allow restoring single tables, but are slow for large DBs and only capture one moment.',
      'Physical backup: a base backup of the data directory (`pg_basebackup`) plus continuous WAL archiving.',
      'Point-in-Time Recovery (PITR): restore the base backup and replay WAL up to a chosen time, e.g. just before a bad `DELETE`.',
      'Tools: pgBackRest, Barman, WAL-G; managed services do this automatically.',
      'A backup is only real once you have tested restoring it.',
    ],
    code: `pg_dump -Fc -d app -f app.dump
pg_restore -d app_restored -j 4 app.dump

# PITR recovery target (postgresql.conf)
# recovery_target_time = '2026-11-18 09:59:00+00'`,
  },
  {
    id: 'zero-downtime-migrations',
    group: 'Scaling & Ops',
    stars: 4,
    difficulty: 'Hard',
    q: 'How do you run schema migrations on a busy Postgres table without downtime?',
    a: [
      'Set `lock_timeout` (and retry) so a blocked DDL does not queue up every other query behind it.',
      '`ADD COLUMN` with a constant default is instant since PG 11; volatile defaults still rewrite the table.',
      'Create indexes with `CREATE INDEX CONCURRENTLY` outside a transaction.',
      'Add constraints as `NOT VALID`, then `VALIDATE CONSTRAINT` separately (validation takes a weaker lock).',
      'For `NOT NULL`: add a `CHECK (col IS NOT NULL) NOT VALID`, validate it, then `SET NOT NULL` skips the full scan.',
      'Changing a column type rewrites the table: use expand/contract (new column, backfill in batches, switch reads, drop old).',
    ],
    code: `SET lock_timeout = '2s';
ALTER TABLE orders ADD CONSTRAINT orders_user_fk
  FOREIGN KEY (user_id) REFERENCES users(id) NOT VALID;
ALTER TABLE orders VALIDATE CONSTRAINT orders_user_fk;`,
  },
  {
    id: 'row-level-security',
    group: 'Scaling & Ops',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is Row-Level Security (RLS)?',
    a: [
      'RLS adds per-row filters enforced by the database: users only see/modify rows a policy allows.',
      'Enable with `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`; with no policies, the default is deny-all for non-owners.',
      '`USING` filters rows for reads/updates/deletes; `WITH CHECK` validates new rows on insert/update.',
      'Table owners and superusers bypass RLS unless you `FORCE ROW LEVEL SECURITY`; roles with `BYPASSRLS` also bypass it.',
      'Common for multi-tenant apps: set the tenant in a session variable or JWT claim (Supabase uses `auth.uid()`).',
      'Policy expressions run per row, so index the columns they reference.',
    ],
    code: `ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON notes
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

SET app.tenant_id = '6f1c...';`,
  },
  {
    id: 'roles-privileges',
    group: 'Scaling & Ops',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do roles and privileges work in PostgreSQL?',
    a: [
      'Users and groups are both roles; a role with `LOGIN` acts as a user, others act as groups.',
      'Privileges are granted per object: `GRANT SELECT, INSERT ON table`, `USAGE ON SCHEMA`, `CONNECT ON DATABASE`.',
      'Roles inherit privileges of roles they are members of (`GRANT readonly TO alice`).',
      '`ALTER DEFAULT PRIVILEGES` applies grants to tables created in the future.',
      'Since PG 15, `PUBLIC` no longer has `CREATE` on the `public` schema.',
      'Least privilege: the app role should not own tables or be superuser; run migrations with a separate owner role.',
    ],
    code: `CREATE ROLE readonly NOLOGIN;
GRANT USAGE ON SCHEMA public TO readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO readonly;
CREATE ROLE analyst LOGIN PASSWORD 'secret' IN ROLE readonly;`,
  },
  {
    id: 'major-version-upgrade',
    group: 'Scaling & Ops',
    stars: 2,
    difficulty: 'Medium',
    q: 'How do you upgrade PostgreSQL to a new major version?',
    a: [
      'Minor versions (17.1 to 17.2) only need new binaries and a restart; data format is unchanged.',
      'Major versions change the on-disk format, so you cannot just restart with new binaries.',
      '`pg_dump`/`pg_restore`: simple but downtime grows with database size.',
      '`pg_upgrade --link`: rewrites catalogs and hard-links data files, minutes of downtime; run `ANALYZE` afterwards (PG 18 keeps stats).',
      'Logical replication to a new-version cluster then switchover gives near-zero downtime.',
    ],
  },
];

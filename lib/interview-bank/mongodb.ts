import type { BankQuestion } from './types';

export const MONGODB: BankQuestion[] = [
  // ───────────────────────── Fundamentals ─────────────────────────
  {
    id: 'what-is-mongodb',
    group: 'Fundamentals',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is MongoDB and what are its key features?',
    a: [
      'MongoDB is an open-source, document-oriented NoSQL database that stores data as JSON-like documents (BSON).',
      'Flexible schema: documents in the same collection can have different fields and shapes.',
      'Rich query language with secondary indexes, aggregation pipeline, text and geospatial search.',
      'High availability through replica sets (automatic failover).',
      'Horizontal scaling through sharding (data partitioned across many servers).',
      'Default storage engine is WiredTiger (document-level concurrency, compression).',
    ],
  },
  {
    id: 'document-model',
    group: 'Fundamentals',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is a document and how do databases, collections and documents relate?',
    a: [
      'A document is a set of field/value pairs, similar to a JSON object; values can be nested documents or arrays.',
      'A collection is a group of documents, roughly analogous to an SQL table but without a fixed schema.',
      'A database is a container of collections; one `mongod` can host many databases.',
      'Mapping: database -> database, table -> collection, row -> document, column -> field, join -> embedding or `$lookup`.',
      'Collections and databases are created lazily on first insert.',
      'Every document needs a unique `_id` field within its collection.',
    ],
    code: `use shop                      // switch/create db lazily
db.users.insertOne({
  name: 'Asha',
  address: { city: 'Pune', zip: '411001' },
  tags: ['admin', 'beta']
})`,
  },
  {
    id: 'bson',
    group: 'Fundamentals',
    stars: 4,
    difficulty: 'Easy',
    q: 'What is BSON and why does MongoDB use it instead of JSON?',
    a: [
      'BSON = Binary JSON: the binary-encoded serialization MongoDB uses for storage and network transfer.',
      'Supports more types than JSON: `ObjectId`, `Date`, `Decimal128`, `Int32`, `Int64`, `Double`, `BinData`, `Timestamp`, regex.',
      'Length-prefixed, so fields can be skipped quickly while traversing (fast scanning).',
      'Slightly larger than JSON in some cases because it stores type and length metadata.',
      'Extended JSON (EJSON) is the text form that preserves BSON types, e.g. `{ "$oid": "..." }`.',
      'Max BSON document size is 16 MB.',
    ],
  },
  {
    id: 'sql-vs-nosql',
    group: 'Fundamentals',
    stars: 5,
    difficulty: 'Medium',
    q: 'SQL vs MongoDB: when would you choose MongoDB?',
    a: [
      'SQL: fixed schema, normalized tables, joins, strong multi-row transactions are the default design.',
      'MongoDB: flexible schema, data modelled around access patterns, related data often embedded in one document.',
      'Choose MongoDB for evolving or semi-structured data, catalogs, content, user profiles, IoT/events, real-time apps.',
      'Choose MongoDB when you need easy horizontal scaling (sharding) and high write throughput.',
      'Prefer SQL for highly relational data with many ad-hoc joins, complex reporting, or strict relational integrity (FKs).',
      'MongoDB does support ACID multi-document transactions (4.0+), but needing them everywhere hints at a relational fit.',
    ],
  },
  {
    id: 'objectid',
    group: 'Fundamentals',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is `_id` and how is an `ObjectId` structured?',
    a: [
      '`_id` is the mandatory primary key of every document; it is unique per collection and always indexed.',
      'If you do not supply one, the driver generates an `ObjectId`.',
      '`ObjectId` is 12 bytes: 4-byte Unix timestamp (seconds), 5-byte random value (per process), 3-byte incrementing counter.',
      'Because it starts with a timestamp, ObjectIds are roughly ordered by creation time; `getTimestamp()` extracts it.',
      '`_id` can be any non-array type: string, number, UUID, or a compound document.',
      '`_id` is immutable: you cannot update it once the document is inserted.',
    ],
    code: `const id = new ObjectId();
id.getTimestamp();   // ISODate(...) of creation
db.orders.find({ _id: ObjectId('65a1f0c2e4b0a1b2c3d4e5f6') })`,
  },
  {
    id: 'cap-theorem-mongodb',
    group: 'Fundamentals',
    stars: 3,
    difficulty: 'Medium',
    q: 'Where does MongoDB sit in the CAP theorem?',
    a: [
      'MongoDB is usually classified as CP: during a partition it favours consistency over availability.',
      'A replica set has a single primary for writes; if the primary cannot reach a majority it steps down and writes stop until a new primary is elected.',
      'Reads with `readPreference: secondary` trade consistency for availability (may return stale data).',
      'Consistency is tunable per operation using write concern, read concern and read preference.',
      'With `w: majority` + `readConcern: majority` you get durable, non-rollback reads.',
    ],
  },
  {
    id: 'mongodb-data-types',
    group: 'Fundamentals',
    stars: 3,
    difficulty: 'Easy',
    q: 'Which BSON data types should you know, and why does `Decimal128` matter?',
    a: [
      'Common types: String, Int32, Int64 (Long), Double, Decimal128, Boolean, Date, ObjectId, Array, Object, Null, BinData, UUID.',
      'Numbers in mongosh default to Double; use `NumberInt()`/`NumberLong()` for integers.',
      'Use `Decimal128` (`NumberDecimal()`) for money to avoid floating-point rounding errors.',
      'Store dates as `Date`, not strings, so range queries and date operators work.',
      '`$type` lets you query by BSON type, e.g. `{ age: { $type: "string" } }`.',
    ],
    code: `db.accounts.insertOne({
  balance: NumberDecimal('1050.75'),
  createdAt: new Date()
})
db.users.find({ age: { $type: 'string' } })`,
  },
  {
    id: 'capped-collections',
    group: 'Fundamentals',
    stars: 2,
    difficulty: 'Medium',
    q: 'What are capped collections and time series collections?',
    a: [
      'Capped collection: fixed-size collection that preserves insertion order and overwrites the oldest documents when full (circular buffer).',
      'Good for logs/caches; you cannot delete individual documents or grow documents beyond capacity.',
      'Time series collection (5.0+): optimised storage for measurements with a `timeField` and optional `metaField`.',
      'Time series data is stored internally in buckets, giving big compression and query gains.',
      'Time series collections support `expireAfterSeconds` for automatic deletion.',
    ],
    code: `db.createCollection('logs', { capped: true, size: 10485760, max: 5000 })
db.createCollection('metrics', {
  timeseries: { timeField: 'ts', metaField: 'sensorId', granularity: 'minutes' },
  expireAfterSeconds: 86400 * 30
})`,
  },

  // ───────────────────────── CRUD & Queries ─────────────────────────
  {
    id: 'crud-operations',
    group: 'CRUD & Queries',
    stars: 5,
    difficulty: 'Easy',
    q: 'What are the basic CRUD methods in MongoDB?',
    a: [
      'Create: `insertOne()`, `insertMany()` (ordered by default; `{ ordered: false }` continues past errors).',
      'Read: `find(filter, projection)` returns a cursor; `findOne()` returns the first match or `null`.',
      'Update: `updateOne()`, `updateMany()` with update operators; `replaceOne()` swaps the whole document (except `_id`).',
      'Delete: `deleteOne()`, `deleteMany()`; `deleteMany({})` removes all docs but keeps indexes (`drop()` removes the collection).',
      'Write results report counts such as `matchedCount`, `modifiedCount`, `deletedCount`, `insertedId(s)`.',
    ],
    code: `db.users.insertOne({ name: 'Ravi', age: 28 })
db.users.find({ age: { $gte: 18 } }, { name: 1, _id: 0 })
db.users.updateOne({ name: 'Ravi' }, { $set: { age: 29 } })
db.users.deleteMany({ active: false })`,
  },
  {
    id: 'query-operators',
    group: 'CRUD & Queries',
    stars: 5,
    difficulty: 'Easy',
    q: 'What are the common query operators?',
    a: [
      'Comparison: `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`, `$nin`.',
      'Logical: `$and`, `$or`, `$nor`, `$not`; multiple fields in one filter are an implicit AND.',
      'Element: `$exists` (field present) and `$type` (BSON type).',
      'Evaluation: `$regex`, `$expr` (use aggregation expressions, e.g. compare two fields), `$mod`, `$text`.',
      'Array: `$all`, `$size`, `$elemMatch`.',
      'Dot notation queries nested fields and array elements: `"address.city"`, `"items.0.sku"`.',
    ],
    code: `db.products.find({
  price: { $gte: 100, $lte: 500 },
  category: { $in: ['phone', 'tablet'] },
  $or: [{ stock: { $gt: 0 } }, { preorder: true }]
})
db.orders.find({ $expr: { $gt: ['$spent', '$budget'] } })`,
  },
  {
    id: 'projection',
    group: 'CRUD & Queries',
    stars: 4,
    difficulty: 'Easy',
    q: 'What is projection and what are its rules?',
    a: [
      'Projection (second arg of `find`) chooses which fields are returned, reducing network and memory use.',
      '`1` includes, `0` excludes; you cannot mix inclusion and exclusion in one projection.',
      'The only exception is `_id`, which is included by default and can be excluded alongside inclusions.',
      'Array projection: `$slice` (first/last N elements), `$elemMatch`, and positional `$`.',
      'Projections can also use aggregation expressions (4.4+), e.g. computed fields.',
    ],
    code: `db.users.find({}, { name: 1, email: 1, _id: 0 })
db.posts.find({}, { title: 1, comments: { $slice: -5 } })`,
  },
  {
    id: 'update-operators',
    group: 'CRUD & Queries',
    stars: 5,
    difficulty: 'Easy',
    q: 'What are the main update operators?',
    a: [
      '`$set` sets a field value; `$unset` removes a field.',
      '`$inc` increments atomically; `$mul` multiplies; `$min`/`$max` update only if smaller/larger.',
      '`$rename` renames a field; `$currentDate` sets the current date.',
      'Arrays: `$push` (append, with `$each`, `$slice`, `$sort`, `$position`), `$addToSet` (append if absent), `$pull` (remove matches), `$pop` (first/last).',
      'Positional: `$` (first matched element), `$[]` (all elements), `$[id]` with `arrayFilters` (matching elements).',
      'Without operators, an update body would be a replacement; `updateOne` rejects that, use `replaceOne` instead.',
    ],
    code: `db.users.updateOne({ _id: id }, {
  $set: { 'profile.city': 'Delhi' },
  $inc: { loginCount: 1 },
  $addToSet: { tags: 'premium' },
  $pull: { roles: 'guest' }
})`,
  },
  {
    id: 'upsert',
    group: 'CRUD & Queries',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is an upsert?',
    a: [
      'Upsert = update if a match exists, otherwise insert a new document (`{ upsert: true }`).',
      'The inserted document is built from the equality fields of the filter plus the update operators.',
      '`$setOnInsert` sets fields only when an insert happens (e.g. `createdAt`).',
      'Concurrent upserts on the same filter can create duplicates unless a unique index backs the filter field.',
      'The result exposes `upsertedId` / `upsertedCount` when an insert occurred.',
    ],
    code: `db.stats.updateOne(
  { page: '/home', day: '2026-11-18' },
  { $inc: { views: 1 }, $setOnInsert: { createdAt: new Date() } },
  { upsert: true }
)`,
  },
  {
    id: 'array-queries-elemmatch',
    group: 'CRUD & Queries',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do you query arrays, and when do you need `$elemMatch`?',
    a: [
      '`{ tags: "red" }` matches if any element equals "red".',
      '`{ tags: ["red", "blue"] }` matches the exact array (order matters); `$all` matches regardless of order.',
      'Multiple conditions on an array of documents without `$elemMatch` can be satisfied by different elements.',
      '`$elemMatch` requires a single element to satisfy all conditions together.',
      '`$size` matches exact array length (cannot take a range; store a counter for that).',
    ],
    code: `// any element qty>5 AND any (maybe other) element price<10
db.orders.find({ 'items.qty': { $gt: 5 }, 'items.price': { $lt: 10 } })
// the SAME element must match both
db.orders.find({ items: { $elemMatch: { qty: { $gt: 5 }, price: { $lt: 10 } } } })`,
  },
  {
    id: 'array-filters-positional',
    group: 'CRUD & Queries',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do you update specific elements inside an array?',
    a: [
      '`$` updates the first element matched by the query filter.',
      '`$[]` updates every element of the array.',
      '`$[ident]` with `arrayFilters` updates all elements matching a condition.',
      'They can be nested for arrays inside arrays, e.g. `"grades.$[g].scores.$[s]"`.',
    ],
    code: `db.orders.updateOne(
  { _id: id },
  { $set: { 'items.$[it].status': 'shipped' } },
  { arrayFilters: [{ 'it.qty': { $gt: 0 } }] }
)`,
  },
  {
    id: 'cursors',
    group: 'CRUD & Queries',
    stars: 3,
    difficulty: 'Medium',
    q: 'What is a cursor in MongoDB?',
    a: [
      '`find()` returns a cursor, a pointer to the result set that fetches documents in batches.',
      'The first batch is up to 101 docs; later batches are up to 16 MB (configurable via `batchSize`).',
      'Cursor methods: `sort()`, `limit()`, `skip()`, `project()`, `hint()`, `toArray()`, async iteration.',
      'Idle server cursors time out after 10 minutes by default.',
      'In Node, prefer `for await (const doc of cursor)` over `toArray()` for large results to avoid loading everything in memory.',
    ],
    code: `const cursor = db.collection('logs').find({ level: 'error' }).sort({ ts: -1 });
for await (const doc of cursor) {
  process(doc);
}`,
  },
  {
    id: 'pagination',
    group: 'CRUD & Queries',
    stars: 5,
    difficulty: 'Medium',
    q: 'How do you paginate efficiently: `skip`/`limit` vs range-based?',
    a: [
      '`skip(n).limit(k)` is simple but the server still walks the skipped documents, so deep pages get slower (O(n)).',
      'Range-based (keyset/cursor) pagination filters past the last seen key: `{ _id: { $gt: lastId } }` + `limit`.',
      'Range-based uses the index directly and stays fast at any depth; it is stable under inserts.',
      'For a non-unique sort field, sort on a compound key (e.g. `createdAt` + `_id`) to break ties.',
      'Drawback of keyset: no random "jump to page 50"; fits infinite scroll / next-prev.',
      'Always sort deterministically when paginating, or results can repeat or skip.',
    ],
    code: `// page 1
db.posts.find().sort({ _id: 1 }).limit(20)
// next page: pass the last _id from the previous page
db.posts.find({ _id: { $gt: lastId } }).sort({ _id: 1 }).limit(20)`,
  },
  {
    id: 'find-one-and-update',
    group: 'CRUD & Queries',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is `findOneAndUpdate` and how is it different from `updateOne`?',
    a: [
      '`findOneAndUpdate` atomically modifies one document and returns the document itself.',
      '`updateOne` returns only a write result (counts), not the document.',
      'By default it returns the document before the update; use `returnDocument: "after"` (Mongoose: `{ new: true }`).',
      'Supports `sort`, `projection` and `upsert`, useful for queues and counters (claim-a-job pattern).',
      'Siblings: `findOneAndReplace`, `findOneAndDelete`.',
    ],
    code: `const job = await jobs.findOneAndUpdate(
  { status: 'pending' },
  { $set: { status: 'running', startedAt: new Date() } },
  { sort: { priority: -1 }, returnDocument: 'after' }
);`,
  },
  {
    id: 'bulk-write',
    group: 'CRUD & Queries',
    stars: 3,
    difficulty: 'Medium',
    q: 'What is `bulkWrite` and when would you use it?',
    a: [
      '`bulkWrite` sends many insert/update/replace/delete operations in a single round trip batch.',
      'Massively reduces network overhead for imports, syncs and batch jobs.',
      '`ordered: true` (default) stops at the first error; `ordered: false` continues and can run faster.',
      'Not atomic as a whole: each operation is atomic on its own document unless wrapped in a transaction.',
      'MongoDB 8.0 adds a server-level `bulkWrite` command that can span multiple collections.',
    ],
    code: `await products.bulkWrite([
  { insertOne: { document: { sku: 'A1', qty: 10 } } },
  { updateOne: { filter: { sku: 'B2' }, update: { $inc: { qty: -1 } } } },
  { deleteOne: { filter: { sku: 'C3' } } }
], { ordered: false });`,
  },
  {
    id: 'count-distinct',
    group: 'CRUD & Queries',
    stars: 2,
    difficulty: 'Easy',
    q: 'What is the difference between `countDocuments`, `estimatedDocumentCount` and `distinct`?',
    a: [
      '`countDocuments(filter)` runs an accurate count via an aggregation; can be slow on big unindexed filters.',
      '`estimatedDocumentCount()` reads collection metadata: very fast, no filter, may be inaccurate after unclean shutdown or with orphans in sharded clusters.',
      'The old `count()` is deprecated in drivers.',
      '`distinct(field, filter)` returns unique values of a field as an array (subject to the 16 MB result limit).',
    ],
    code: `db.users.countDocuments({ active: true })
db.users.estimatedDocumentCount()
db.users.distinct('country', { active: true })`,
  },

  // ───────────────────────── Aggregation ─────────────────────────
  {
    id: 'aggregation-pipeline',
    group: 'Aggregation',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is the aggregation pipeline?',
    a: [
      'A pipeline is an array of stages; documents flow through each stage which transforms them.',
      'Used for filtering, grouping, reshaping, joining and computing analytics on the server.',
      'Common stages: `$match`, `$project`, `$group`, `$sort`, `$limit`, `$skip`, `$unwind`, `$lookup`, `$addFields`/`$set`, `$facet`, `$count`.',
      'Each stage has a 100 MB memory limit; `allowDiskUse` spills to disk (default true for many ops since 6.0).',
      'The result is a cursor; `$out` / `$merge` write results to a collection.',
      'Place `$match` and `$sort` early so they can use indexes.',
    ],
    code: `db.orders.aggregate([
  { $match: { status: 'paid' } },
  { $group: { _id: '$customerId', total: { $sum: '$amount' } } },
  { $sort: { total: -1 } },
  { $limit: 5 }
])`,
  },
  {
    id: 'group-stage',
    group: 'Aggregation',
    stars: 5,
    difficulty: 'Medium',
    q: 'How does `$group` work and which accumulators are common?',
    a: [
      '`$group` groups documents by the `_id` expression (a field, compound object, or `null` for all docs).',
      'Accumulators: `$sum`, `$avg`, `$min`, `$max`, `$count`, `$first`, `$last`, `$push`, `$addToSet`.',
      'Newer ones: `$top`, `$bottom`, `$topN`, `$firstN`, `$maxN` (5.2+).',
      '`{ $sum: 1 }` counts documents per group.',
      'Output contains only `_id` and the accumulated fields; use `$project` to reshape.',
      '`$group` is a blocking stage and cannot use indexes (except some `$first` optimisations after `$sort`).',
    ],
    code: `db.sales.aggregate([
  { $group: {
      _id: { year: { $year: '$date' }, region: '$region' },
      revenue: { $sum: { $multiply: ['$price', '$qty'] } },
      orders: { $sum: 1 },
      avgTicket: { $avg: '$price' }
  } }
])`,
  },
  {
    id: 'match-project',
    group: 'Aggregation',
    stars: 4,
    difficulty: 'Easy',
    q: 'What do `$match`, `$project` and `$addFields` do?',
    a: [
      '`$match` filters documents with normal query syntax; at the start of a pipeline it can use indexes.',
      '`$project` includes, excludes, renames or computes fields (reshapes the document).',
      '`$addFields` (alias `$set`) adds/overwrites fields while keeping all others.',
      '`$unset` stage removes fields.',
      'Use `$expr` inside `$match` to compare fields or use aggregation expressions.',
    ],
    code: `db.users.aggregate([
  { $match: { active: true } },
  { $addFields: { fullName: { $concat: ['$first', ' ', '$last'] } } },
  { $project: { fullName: 1, email: 1, _id: 0 } }
])`,
  },
  {
    id: 'unwind',
    group: 'Aggregation',
    stars: 4,
    difficulty: 'Medium',
    q: 'What does `$unwind` do?',
    a: [
      '`$unwind` deconstructs an array field, emitting one document per element.',
      'Docs with a missing/empty array are dropped unless `preserveNullAndEmptyArrays: true`.',
      '`includeArrayIndex` adds the element index as a field.',
      'Typical use: `$unwind` then `$group` to aggregate over array items (e.g. sales per product).',
      'Can blow up document count, so `$match`/`$project` first to keep it small.',
    ],
    code: `db.orders.aggregate([
  { $unwind: '$items' },
  { $group: { _id: '$items.sku', sold: { $sum: '$items.qty' } } },
  { $sort: { sold: -1 } }
])`,
  },
  {
    id: 'lookup',
    group: 'Aggregation',
    stars: 5,
    difficulty: 'Medium',
    q: 'How does `$lookup` perform a join?',
    a: [
      '`$lookup` does a left outer join with another collection in the same database.',
      'Simple form: `from`, `localField`, `foreignField`, `as` (result is an array field).',
      'Pipeline form: `let` + `pipeline` lets you join on multiple conditions and filter/project the joined docs.',
      '5.0+ allows `localField`/`foreignField` together with `pipeline`.',
      'Index the `foreignField` on the joined collection, otherwise each lookup scans it.',
      'Since 5.1 the `from` collection can be sharded.',
    ],
    code: `db.orders.aggregate([
  { $lookup: {
      from: 'users', localField: 'userId', foreignField: '_id', as: 'user'
  } },
  { $unwind: '$user' },
  { $project: { amount: 1, 'user.name': 1 } }
])`,
  },
  {
    id: 'facet-bucket',
    group: 'Aggregation',
    stars: 3,
    difficulty: 'Hard',
    q: 'What are `$facet`, `$bucket` and `$bucketAuto`?',
    a: [
      '`$facet` runs several sub-pipelines on the same input and returns all results in one document.',
      'Classic use: search results + total count + filter facets in one query.',
      '`$bucket` groups docs into ranges defined by `boundaries` (with a `default` bucket for out-of-range).',
      '`$bucketAuto` picks boundaries automatically to spread docs evenly into N buckets.',
      'Sub-pipelines in `$facet` cannot use indexes, so `$match` before it.',
    ],
    code: `db.products.aggregate([
  { $match: { category: 'laptop' } },
  { $facet: {
      results: [{ $sort: { price: 1 } }, { $skip: 0 }, { $limit: 20 }],
      total: [{ $count: 'n' }],
      byPrice: [{ $bucket: { groupBy: '$price', boundaries: [0, 500, 1000, 2000], default: '2000+' } }]
  } }
])`,
  },
  {
    id: 'aggregation-optimization',
    group: 'Aggregation',
    stars: 4,
    difficulty: 'Hard',
    q: 'How do you optimise an aggregation pipeline?',
    a: [
      'Put `$match` as early as possible so it filters with an index and reduces docs for later stages.',
      '`$sort` + `$limit` at the start can use an index and the optimiser coalesces them (top-k sort).',
      'Project away unneeded fields early to reduce memory, but let the optimiser handle dependency analysis.',
      'Avoid `$unwind` + `$group` on huge arrays when array operators (`$filter`, `$reduce`, `$size`) can do it in-document.',
      'Index the foreign field of `$lookup`; filter the joined side in the lookup pipeline.',
      'Use `explain("executionStats")` on the aggregate to inspect index use and stage cost.',
    ],
  },
  {
    id: 'aggregation-vs-mapreduce',
    group: 'Aggregation',
    stars: 2,
    difficulty: 'Medium',
    q: 'Aggregation pipeline vs map-reduce?',
    a: [
      'Map-reduce runs JavaScript `map`/`reduce` functions on the server; it is deprecated since 5.0.',
      'The aggregation pipeline is native C++, much faster, and can use indexes.',
      'Anything map-reduce did can be expressed with stages like `$group`, `$merge` and `$accumulator`/`$function`.',
      'Server-side JS (`$where`, `$function`, map-reduce) is also deprecated in 8.0 and often disabled for security.',
    ],
  },
  {
    id: 'merge-out',
    group: 'Aggregation',
    stars: 2,
    difficulty: 'Medium',
    q: 'What is the difference between `$out` and `$merge`?',
    a: [
      'Both write pipeline results to a collection and must be the last stage.',
      '`$out` replaces the whole target collection atomically.',
      '`$merge` incrementally merges into an existing collection: `whenMatched` (replace/merge/keepExisting/pipeline) and `whenNotMatched` (insert/discard).',
      '`$merge` is ideal for on-demand materialized views (e.g. daily rollups).',
      '`$merge` can write to another database or a sharded collection.',
    ],
    code: `db.orders.aggregate([
  { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$amount' } } },
  { $merge: { into: 'daily_revenue', whenMatched: 'replace', whenNotMatched: 'insert' } }
])`,
  },
  {
    id: 'top-n-per-group',
    group: 'Aggregation',
    stars: 3,
    difficulty: 'Hard',
    q: 'How do you get the top N documents per group (e.g. latest 3 orders per user)?',
    a: [
      'Classic approach: `$sort` then `$group` with `$push`, then `$slice` the array.',
      'Since 5.2 `$topN`/`$firstN` accumulators do it directly and with less memory.',
      'An index on the group + sort fields lets the initial `$sort` avoid an in-memory sort.',
      'Alternative: `$setWindowFields` (5.0+) with `$rank` or `$documentNumber` then `$match`.',
    ],
    code: `db.orders.aggregate([
  { $group: {
      _id: '$userId',
      latest: { $topN: { n: 3, sortBy: { createdAt: -1 }, output: { id: '$_id', amount: '$amount' } } }
  } }
])`,
  },
  {
    id: 'set-window-fields',
    group: 'Aggregation',
    stars: 2,
    difficulty: 'Hard',
    q: 'What is `$setWindowFields`?',
    a: [
      'A stage (5.0+) that computes window functions over a partition without collapsing documents (like SQL window functions).',
      'Defined with `partitionBy`, `sortBy` and `output` fields.',
      'Supports running totals, moving averages, `$rank`, `$denseRank`, `$shift`, `$derivative`.',
      'Windows can be document-based (`documents: [-2, 0]`) or range-based (time/value ranges).',
    ],
    code: `db.sales.aggregate([
  { $setWindowFields: {
      partitionBy: '$store', sortBy: { date: 1 },
      output: { runningTotal: { $sum: '$amount', window: { documents: ['unbounded', 'current'] } } }
  } }
])`,
  },

  // ───────────────────────── Schema Design ─────────────────────────
  {
    id: 'embed-vs-reference',
    group: 'Schema Design',
    stars: 5,
    difficulty: 'Medium',
    q: 'When do you embed documents vs reference them?',
    a: [
      'Core rule: data that is accessed together should be stored together.',
      'Embed for one-to-one and one-to-few relations, data owned by the parent, and data read with the parent (e.g. addresses).',
      'Embedding gives single-read access and single-document atomic updates.',
      'Reference when the child set is large/unbounded, shared by many parents, or updated/queried independently.',
      'Reference for many-to-many relations (arrays of ids on one or both sides).',
      'Trade-off: embedding duplicates data and risks large docs; referencing needs extra queries or `$lookup`.',
    ],
    code: `// embedded (one-to-few)
{ _id: 1, name: 'Asha', addresses: [{ city: 'Pune' }, { city: 'Goa' }] }
// referenced (one-to-many, unbounded)
{ _id: 'p1', title: 'Post' }
{ _id: 'c9', postId: 'p1', text: 'Nice!' }`,
  },
  {
    id: 'one-to-many-patterns',
    group: 'Schema Design',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do you model one-to-few, one-to-many and one-to-squillions?',
    a: [
      'One-to-few (a handful of addresses): embed an array of subdocuments in the parent.',
      'One-to-many (hundreds/thousands of parts): store an array of child `_id`s in the parent (child referencing).',
      'One-to-squillions (millions of log entries): store the parent id in each child (parent referencing).',
      'Decide by cardinality, read/write ratio, and whether children are accessed independently.',
      'Two-way referencing speeds reads both ways at the cost of non-atomic updates on two docs.',
    ],
  },
  {
    id: 'document-size-limit',
    group: 'Schema Design',
    stars: 4,
    difficulty: 'Easy',
    q: 'What is the 16 MB document limit and how do you deal with it?',
    a: [
      'A single BSON document can be at most 16 MB.',
      'It exists to prevent excessive RAM and bandwidth use per document.',
      'Hitting it usually signals an unbounded array or over-embedding: split into separate docs or use the bucket pattern.',
      'Store large files with GridFS, which splits files into 255 KB chunks in `fs.chunks` + metadata in `fs.files`.',
      'Or store files in object storage (S3) and keep only the URL in MongoDB (most common in practice).',
      'Nesting depth is limited to 100 levels.',
    ],
  },
  {
    id: 'schema-design-patterns',
    group: 'Schema Design',
    stars: 4,
    difficulty: 'Hard',
    q: 'Explain common schema design patterns: bucket, subset, extended reference, computed, polymorphic.',
    a: [
      'Bucket: group many small items (e.g. sensor readings per hour) into one doc to cut doc count and index size.',
      'Subset: embed only the most-used part of a big set (latest 10 reviews), keep the rest in another collection.',
      'Extended reference: copy a few frequently read fields of the referenced doc (e.g. customer name in order) to avoid joins.',
      'Computed: precompute and store aggregates (totals, counts) on write instead of recalculating on every read.',
      'Polymorphic: store different shapes in one collection with a type discriminator field (e.g. `type: "book" | "movie"`).',
      'Others: attribute (key/value array for sparse fields), outlier, schema versioning, archive.',
    ],
    code: `// bucket pattern: one doc per sensor per hour
{ sensorId: 7, hour: ISODate('2026-11-18T10:00Z'),
  count: 3, sum: 64.2,
  readings: [{ t: 0, v: 21.3 }, { t: 60, v: 21.4 }, { t: 120, v: 21.5 }] }`,
  },
  {
    id: 'attribute-pattern',
    group: 'Schema Design',
    stars: 2,
    difficulty: 'Medium',
    q: 'What is the attribute pattern?',
    a: [
      'Moves many sparse or varying fields into an array of `{ k, v }` pairs.',
      'Lets one compound index on `attrs.k` + `attrs.v` serve queries on any attribute.',
      'Useful for products with category-specific specs (size, color, voltage...).',
      'Query with `$elemMatch` so key and value match in the same element.',
    ],
    code: `{ sku: 'TV1', attrs: [{ k: 'size', v: 55 }, { k: 'hdr', v: true }] }
db.products.createIndex({ 'attrs.k': 1, 'attrs.v': 1 })
db.products.find({ attrs: { $elemMatch: { k: 'size', v: 55 } } })`,
  },
  {
    id: 'schema-validation',
    group: 'Schema Design',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do you enforce a schema in MongoDB?',
    a: [
      'Use collection-level validation with `$jsonSchema` (or query operators) in `validator`.',
      '`validationLevel`: `strict` (all inserts/updates) or `moderate` (only already-valid docs).',
      '`validationAction`: `error` (reject) or `warn` (log only).',
      'Can be added to existing collections via `collMod`.',
      'App-level validation (Mongoose, Zod) is still common, but DB validation protects from every client.',
    ],
    code: `db.createCollection('users', { validator: { $jsonSchema: {
  bsonType: 'object', required: ['email', 'age'],
  properties: {
    email: { bsonType: 'string', pattern: '^.+@.+$' },
    age: { bsonType: 'int', minimum: 0 }
  } } } })`,
  },
  {
    id: 'schema-anti-patterns',
    group: 'Schema Design',
    stars: 4,
    difficulty: 'Medium',
    q: 'What are common MongoDB schema anti-patterns?',
    a: [
      'Unbounded arrays: arrays that grow forever (comments, logs) bloat docs, slow updates and can hit 16 MB.',
      'Massive number of collections (e.g. one per user): each collection + index costs files and memory.',
      'Bloated documents: storing rarely used large fields with hot data, hurting working-set cache.',
      'Unnecessary indexes: every index slows writes and uses RAM.',
      'Separating data that is always read together, forcing `$lookup` on every request.',
      'Case-insensitive queries without a case-insensitive (collation) index.',
    ],
  },
  {
    id: 'many-to-many',
    group: 'Schema Design',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do you model a many-to-many relationship?',
    a: [
      'Store an array of referenced ids on one side (e.g. `student.courseIds`) when that side is bounded.',
      'Optionally store ids on both sides for fast reads both ways (must update both).',
      'For huge or attribute-rich relations, use a junction collection (e.g. `enrollments` with `studentId`, `courseId`, `grade`).',
      'Multikey indexes on the id arrays make "who has X" queries fast.',
    ],
    code: `{ _id: 's1', name: 'Neha', courseIds: ['c1', 'c2'] }
db.students.createIndex({ courseIds: 1 })
db.students.find({ courseIds: 'c1' })`,
  },
  {
    id: 'denormalization',
    group: 'Schema Design',
    stars: 3,
    difficulty: 'Medium',
    q: 'Why is denormalization common in MongoDB and what is the trade-off?',
    a: [
      'MongoDB optimises for reads by shaping data to the query; duplicating fields avoids joins.',
      'Good candidates: fields read often and changed rarely (names, product titles in orders).',
      'Cost: updates must touch every copy, so writes are more expensive and consistency is eventual unless done in a transaction.',
      'Sometimes duplicates are intentional history (price at the time of order should not change).',
      'Keep the authoritative copy in one place and sync copies via app logic, change streams or batch jobs.',
    ],
  },

  // ───────────────────────── Indexes & Performance ─────────────────────────
  {
    id: 'what-are-indexes',
    group: 'Indexes & Performance',
    stars: 5,
    difficulty: 'Easy',
    q: 'What are indexes in MongoDB and how do they work?',
    a: [
      'Indexes are B-tree structures storing sorted field values pointing to documents.',
      'Without an index MongoDB does a collection scan (`COLLSCAN`) of every document.',
      'Indexes speed up filtering, sorting and range queries (`IXSCAN`).',
      'Every collection has a unique index on `_id` by default.',
      'Costs: slower writes (each index updated), extra disk and RAM; ideally indexes fit in memory.',
      'Since 4.2 index builds use an optimised process that only briefly locks the collection.',
    ],
    code: `db.users.createIndex({ email: 1 }, { unique: true })
db.users.getIndexes()
db.users.dropIndex('email_1')`,
  },
  {
    id: 'compound-index-esr',
    group: 'Indexes & Performance',
    stars: 5,
    difficulty: 'Hard',
    q: 'What is a compound index and what is the ESR rule?',
    a: [
      'A compound index indexes several fields in a specific order, e.g. `{ status: 1, createdAt: -1 }`.',
      'Prefix rule: the index supports queries on any left prefix (`status`, or `status`+`createdAt`), not `createdAt` alone.',
      'ESR rule for field order: Equality fields first, then Sort fields, then Range fields.',
      'Equality first narrows the scan; sort next lets the index provide order without an in-memory sort; range last.',
      'Sort direction matters for multi-field sorts: index `{a:1,b:-1}` supports `{a:1,b:-1}` and `{a:-1,b:1}` but not `{a:1,b:1}`.',
      'Max 32 fields in a compound index.',
    ],
    code: `// query: status = 'paid', amount > 100, sort by createdAt desc
db.orders.createIndex({ status: 1, createdAt: -1, amount: 1 })  // E, S, R
db.orders.find({ status: 'paid', amount: { $gt: 100 } }).sort({ createdAt: -1 })`,
  },
  {
    id: 'multikey-index',
    group: 'Indexes & Performance',
    stars: 3,
    difficulty: 'Medium',
    q: 'What is a multikey index?',
    a: [
      'An index on an array field; MongoDB creates an index entry for each array element automatically.',
      'Makes queries like `{ tags: "mongodb" }` fast.',
      'A compound index can include at most one array field per document (no parallel arrays).',
      'Multikey indexes cannot be covering for the array field and can be large for big arrays.',
      'Shard keys cannot be multikey.',
    ],
  },
  {
    id: 'special-indexes',
    group: 'Indexes & Performance',
    stars: 4,
    difficulty: 'Medium',
    q: 'What are text, geospatial and hashed indexes?',
    a: [
      'Text index: tokenizes and stems strings for `$text` search with relevance score; one text index per collection.',
      'For serious full-text search on Atlas, use Atlas Search (Lucene) via `$search` instead.',
      '`2dsphere`: geospatial index on GeoJSON points/polygons for `$near`, `$geoWithin`, `$geoIntersects`.',
      '`2d`: legacy flat-plane coordinates.',
      'Hashed index: indexes a hash of the value; used for hashed sharding; supports equality only, not ranges.',
    ],
    code: `db.articles.createIndex({ title: 'text', body: 'text' })
db.articles.find({ $text: { $search: 'mongodb index' } })
db.places.createIndex({ location: '2dsphere' })
db.places.find({ location: { $near: {
  $geometry: { type: 'Point', coordinates: [73.85, 18.52] }, $maxDistance: 2000 } } })`,
  },
  {
    id: 'ttl-index',
    group: 'Indexes & Performance',
    stars: 4,
    difficulty: 'Easy',
    q: 'What is a TTL index?',
    a: [
      'A single-field index on a `Date` field with `expireAfterSeconds`; MongoDB deletes docs once expired.',
      'A background TTL monitor runs about every 60 seconds, so deletion is not instant.',
      'Use cases: sessions, OTPs, password-reset tokens, logs, caches.',
      'Set `expireAfterSeconds: 0` and store the exact expiry time in the field to expire at a specific moment.',
      'Docs without the field or with a non-date value never expire.',
    ],
    code: `db.sessions.createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 })
// expire at an exact time
db.otps.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })`,
  },
  {
    id: 'unique-partial-sparse',
    group: 'Indexes & Performance',
    stars: 4,
    difficulty: 'Medium',
    q: 'What are unique, partial and sparse indexes?',
    a: [
      'Unique: rejects duplicate values; a missing field counts as `null`, so only one doc may lack it.',
      'Sparse: only indexes docs that contain the field.',
      'Partial: only indexes docs matching a `partialFilterExpression`; more flexible than sparse and preferred.',
      'Unique + partial enforces uniqueness only on a subset (e.g. unique email among non-deleted users).',
      'A query must include the partial filter condition for the planner to use a partial index.',
    ],
    code: `db.users.createIndex(
  { email: 1 },
  { unique: true, partialFilterExpression: { deleted: false } }
)`,
  },
  {
    id: 'wildcard-index',
    group: 'Indexes & Performance',
    stars: 2,
    difficulty: 'Medium',
    q: 'What is a wildcard index?',
    a: [
      'Indexes all fields (or all subfields of a path) without knowing names in advance: `{ "$**": 1 }` or `{ "attrs.$**": 1 }`.',
      'Useful for user-defined or highly variable fields.',
      'Supports one field per query predicate; not a replacement for well-designed compound indexes.',
      'Since 7.0, compound wildcard indexes combine a wildcard with normal fields.',
    ],
    code: `db.products.createIndex({ 'specs.$**': 1 })
db.products.find({ 'specs.ram': 16 })`,
  },
  {
    id: 'explain',
    group: 'Indexes & Performance',
    stars: 5,
    difficulty: 'Medium',
    q: 'How do you use `explain()` to analyse a query?',
    a: [
      'Verbosity modes: `queryPlanner` (chosen plan), `executionStats` (actual run stats), `allPlansExecution`.',
      'Look at stage: `COLLSCAN` = full scan (bad on big collections), `IXSCAN` = index used, `FETCH` = reading docs, `SORT` = in-memory sort.',
      'Compare `nReturned`, `totalKeysExamined`, `totalDocsExamined`: ideally all three are close.',
      'High docs examined vs returned means a poor or missing index.',
      '`executionTimeMillis` gives total time; `rejectedPlans` shows alternatives the planner considered.',
    ],
    code: `db.orders.find({ status: 'paid' }).sort({ createdAt: -1 })
  .explain('executionStats')
// check: winningPlan.stage, totalDocsExamined vs nReturned`,
  },
  {
    id: 'covered-queries',
    group: 'Indexes & Performance',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is a covered query?',
    a: [
      'A query answered entirely from the index without reading documents.',
      'Requires all filter fields and all projected fields to be in the index.',
      'Must exclude `_id` in the projection unless `_id` is part of the index.',
      'In `explain`, `totalDocsExamined: 0` and no `FETCH` stage confirm it is covered.',
      'Cannot cover on multikey array fields.',
    ],
    code: `db.users.createIndex({ email: 1, name: 1 })
db.users.find({ email: 'a@x.com' }, { name: 1, _id: 0 })  // covered`,
  },
  {
    id: 'index-intersection-selection',
    group: 'Indexes & Performance',
    stars: 2,
    difficulty: 'Hard',
    q: 'What is index intersection and how does the query planner choose an index?',
    a: [
      'Index intersection: MongoDB can combine two indexes (AND_SORTED/AND_HASH) to answer one query.',
      'In practice it is rarely chosen; a proper compound index is almost always better.',
      'The planner runs candidate plans in a trial period and picks the one that returns results with the least work.',
      'The winning plan is cached per query shape and re-evaluated when it degrades or indexes change.',
      'You can force an index with `hint()`; `planCacheClear` resets cached plans.',
    ],
  },
  {
    id: 'profiler-slow-queries',
    group: 'Indexes & Performance',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do you find and fix slow queries in MongoDB?',
    a: [
      'Slow ops (default > 100 ms, `slowms`) are logged in the `mongod` log.',
      'Database profiler: level 0 off, 1 slow ops only, 2 all ops; results go to `system.profile`.',
      '`db.currentOp()` shows running ops; `db.killOp()` stops one.',
      'Atlas offers Performance Advisor and Query Profiler that suggest indexes.',
      'Fix with indexes (ESR), projections, range pagination, and keeping the working set in RAM.',
      'Use `$indexStats` to find unused indexes to drop.',
    ],
    code: `db.setProfilingLevel(1, { slowms: 50 })
db.system.profile.find().sort({ ts: -1 }).limit(5)
db.orders.aggregate([{ $indexStats: {} }])`,
  },
  {
    id: 'index-tradeoffs',
    group: 'Indexes & Performance',
    stars: 3,
    difficulty: 'Medium',
    q: 'Why not index every field?',
    a: [
      'Every insert/update/delete must also update every affected index, slowing writes.',
      'Indexes consume disk and, more importantly, WiredTiger cache memory.',
      'Low-selectivity fields (booleans, status with 2 values) give little benefit alone.',
      'Too many indexes can make the planner choose sub-optimal plans and lengthen plan evaluation.',
      'Index for your real query patterns; one good compound index can replace several single-field ones.',
    ],
  },

  // ───────────────────────── Transactions & Consistency ─────────────────────────
  {
    id: 'single-document-atomicity',
    group: 'Transactions & Consistency',
    stars: 5,
    difficulty: 'Medium',
    q: 'Are operations in MongoDB atomic?',
    a: [
      'Every write is atomic at the single-document level, including embedded docs and arrays.',
      'Multiple update operators in one `updateOne` apply together or not at all.',
      '`updateMany` is atomic per document, not across all matched documents.',
      'This is why embedding related data often removes the need for transactions.',
      'Use conditional updates (filter on current state/version) for optimistic concurrency.',
    ],
    code: `// atomic stock decrement, only if enough stock
db.products.updateOne(
  { _id: pid, stock: { $gte: 2 } },
  { $inc: { stock: -2 } }
)  // modifiedCount 0 => not enough stock`,
  },
  {
    id: 'multi-document-transactions',
    group: 'Transactions & Consistency',
    stars: 5,
    difficulty: 'Hard',
    q: 'How do multi-document transactions work in MongoDB?',
    a: [
      'ACID transactions across multiple documents/collections: replica sets since 4.0, sharded clusters since 4.2.',
      'Require a replica set or sharded cluster (not a standalone `mongod`).',
      'Run inside a client session; `withTransaction()` handles commit and retries on transient errors.',
      'Default max runtime is 60 seconds (`transactionLifetimeLimitSeconds`); keep them short.',
      'They have performance cost (locks, cache pressure); prefer schema design that keeps atomic data in one doc.',
      'Uses snapshot isolation; conflicting writes cause a `WriteConflict` transient error and retry.',
    ],
    code: `const session = client.startSession();
await session.withTransaction(async () => {
  await accounts.updateOne({ _id: a }, { $inc: { bal: -100 } }, { session });
  await accounts.updateOne({ _id: b }, { $inc: { bal: 100 } }, { session });
});
await session.endSession();`,
  },
  {
    id: 'write-concern',
    group: 'Transactions & Consistency',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is write concern?',
    a: [
      'Write concern sets how many replica set members must acknowledge a write before it is reported successful.',
      '`w: 0` no acknowledgment (fire and forget); `w: 1` primary only; `w: "majority"` majority of voting members.',
      'Default is `w: "majority"` since 5.0.',
      '`j: true` requires the write to be in the on-disk journal.',
      '`wtimeout` limits how long to wait (the write is not rolled back on timeout).',
      'Writes acknowledged with `w: 1` can be rolled back after a failover; majority writes cannot.',
    ],
    code: `db.orders.insertOne(doc, { writeConcern: { w: 'majority', j: true, wtimeout: 5000 } })`,
  },
  {
    id: 'read-concern',
    group: 'Transactions & Consistency',
    stars: 3,
    difficulty: 'Hard',
    q: 'What is read concern?',
    a: [
      'Read concern controls the consistency and isolation of data returned by reads.',
      '`local` (default): latest data on the node, may later be rolled back.',
      '`available`: like local; on sharded clusters may return orphan docs, lowest latency.',
      '`majority`: only data acknowledged by a majority, so it will never be rolled back.',
      '`linearizable`: reflects all majority writes completed before the read (primary only, slow).',
      '`snapshot`: point-in-time view, used in transactions.',
    ],
  },
  {
    id: 'read-preference',
    group: 'Transactions & Consistency',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is read preference?',
    a: [
      'Read preference decides which replica set member a read is routed to.',
      '`primary` (default), `primaryPreferred`, `secondary`, `secondaryPreferred`, `nearest`.',
      'Reading from secondaries can return stale data due to replication lag.',
      '`maxStalenessSeconds` excludes secondaries that lag too much.',
      'Tag sets route reads to specific members (e.g. same region, analytics node).',
      'Secondary reads are for analytics / geo-locality, not a primary scaling strategy (use sharding).',
    ],
    code: `mongodb://h1,h2,h3/app?replicaSet=rs0&readPreference=secondaryPreferred&maxStalenessSeconds=90`,
  },
  {
    id: 'causal-consistency',
    group: 'Transactions & Consistency',
    stars: 2,
    difficulty: 'Hard',
    q: 'What is causal consistency in MongoDB?',
    a: [
      'Guarantees read-your-own-writes, monotonic reads/writes and writes-follow-reads within a causally consistent session.',
      'Matters when reads may go to secondaries that have not yet received your earlier write.',
      'Enabled via `startSession({ causalConsistency: true })` (default true for sessions).',
      'Full guarantees need `readConcern: "majority"` and `writeConcern: "majority"`.',
      'Works by passing `operationTime` / `clusterTime` so a node waits until it has caught up.',
    ],
  },
  {
    id: 'retryable-writes',
    group: 'Transactions & Consistency',
    stars: 3,
    difficulty: 'Medium',
    q: 'What are retryable writes and retryable reads?',
    a: [
      'Drivers automatically retry certain writes once on network errors or primary failover.',
      'Enabled by default (`retryWrites=true`) in modern drivers, on replica sets and sharded clusters.',
      'The server uses a transaction id to make the retry idempotent, so the write is not applied twice.',
      'Applies to single-document ops like `insertOne`, `updateOne`, `findOneAndUpdate`, and `bulkWrite` without multi-updates; not `updateMany`/`deleteMany`.',
      'Retryable reads (`retryReads=true`) retry read operations once as well.',
    ],
  },

  // ───────────────────────── Replication & Sharding ─────────────────────────
  {
    id: 'replica-set',
    group: 'Replication & Sharding',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is a replica set?',
    a: [
      'A group of `mongod` processes holding the same data for redundancy and high availability.',
      'One primary accepts all writes; secondaries replicate from it asynchronously.',
      'If the primary fails, an election promotes a secondary automatically (typically within ~10-12 s).',
      'Minimum recommended production setup: 3 data-bearing members.',
      'Supports up to 50 members, of which at most 7 vote.',
      'Special members: hidden, delayed, priority 0, arbiter.',
    ],
    code: `rs.initiate({ _id: 'rs0', members: [
  { _id: 0, host: 'db1:27017' },
  { _id: 1, host: 'db2:27017' },
  { _id: 2, host: 'db3:27017' }
] })
rs.status()`,
  },
  {
    id: 'elections',
    group: 'Replication & Sharding',
    stars: 3,
    difficulty: 'Hard',
    q: 'How do replica set elections work?',
    a: [
      'Members send heartbeats every 2 seconds; if the primary is unreachable for `electionTimeoutMillis` (10 s default), an election starts.',
      'A candidate needs votes from a majority of voting members to become primary.',
      'Uses a Raft-like protocol (protocol version 1) with terms to avoid split brain.',
      'Members with higher `priority` and the most recent oplog are preferred; priority 0 members never become primary.',
      'With no majority reachable (e.g. 2 of 4 nodes), no primary exists and the set is read-only.',
      'An odd number of voting members avoids ties.',
    ],
  },
  {
    id: 'oplog',
    group: 'Replication & Sharding',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is the oplog?',
    a: [
      'The operations log: a special capped collection `local.oplog.rs` recording every data change on the primary.',
      'Secondaries tail the oplog and replay the operations to stay in sync.',
      'Oplog entries are idempotent (e.g. `$inc` recorded as the resulting `$set`).',
      'The oplog window is how far back it reaches; if a secondary lags beyond it, it needs a full resync.',
      'Change streams are built on top of the oplog.',
    ],
  },
  {
    id: 'arbiter',
    group: 'Replication & Sharding',
    stars: 2,
    difficulty: 'Medium',
    q: 'What is an arbiter and why is it discouraged?',
    a: [
      'An arbiter is a replica set member that votes in elections but holds no data and cannot become primary.',
      'It is a cheap way to get an odd number of voters (e.g. Primary + Secondary + Arbiter).',
      'Discouraged: with a PSA set, if a data node fails, `w: majority` writes cannot be acknowledged and cache pressure grows.',
      'Prefer a third data-bearing member for real redundancy.',
    ],
  },
  {
    id: 'sharding',
    group: 'Replication & Sharding',
    stars: 5,
    difficulty: 'Hard',
    q: 'What is sharding and what are the components of a sharded cluster?',
    a: [
      'Sharding = horizontal scaling by partitioning a collection across multiple shards based on a shard key.',
      'Shards: each is a replica set holding a subset of the data.',
      '`mongos`: query router; apps connect to it and it routes queries to the right shards.',
      'Config servers (a replica set): store metadata, i.e. which chunk ranges live on which shard.',
      'Targeted queries include the shard key and hit one shard; scatter-gather queries hit all shards (slower).',
      'Shard when data or write throughput outgrows a single replica set, not prematurely.',
    ],
    code: `sh.enableSharding('shop')   // optional since 6.0
sh.shardCollection('shop.orders', { customerId: 'hashed' })
sh.status()`,
  },
  {
    id: 'shard-key-selection',
    group: 'Replication & Sharding',
    stars: 5,
    difficulty: 'Hard',
    q: 'How do you choose a good shard key?',
    a: [
      'High cardinality: many distinct values so data can be split into many chunks.',
      'Low frequency: no single value dominates (avoid hot keys).',
      'Non-monotonic: an ever-increasing key (timestamp, ObjectId) sends all inserts to one shard (hot shard).',
      'Matches the main query pattern so most queries are targeted to one shard.',
      'Compound keys (e.g. `{ tenantId: 1, _id: 1 }`) often balance distribution and targeting.',
      'Since 5.0 you can `reshardCollection`; 4.4 allows refining a key by adding suffix fields.',
    ],
  },
  {
    id: 'hashed-vs-ranged',
    group: 'Replication & Sharding',
    stars: 4,
    difficulty: 'Hard',
    q: 'Hashed vs ranged sharding?',
    a: [
      'Ranged: chunks hold contiguous ranges of shard key values.',
      'Ranged is efficient for range queries (targeted), but monotonic keys create a hot shard.',
      'Hashed: shard key value is hashed, spreading writes evenly even for monotonic keys like ObjectId.',
      'Hashed turns range queries on the key into scatter-gather queries.',
      'Zone sharding (on ranged keys) pins ranges to specific shards, e.g. data residency by region.',
    ],
  },
  {
    id: 'chunks-balancer',
    group: 'Replication & Sharding',
    stars: 3,
    difficulty: 'Hard',
    q: 'What are chunks, the balancer and jumbo chunks?',
    a: [
      'A chunk is a contiguous range of shard key values; the default range size is 128 MB.',
      'The balancer (on the config server primary) migrates data between shards to keep them even.',
      'Since 6.0 the balancer balances on data size per shard rather than chunk count, and auto-splitting is gone.',
      'A jumbo chunk exceeds the max size but cannot be split because all docs share the same shard key value.',
      'Jumbo chunks cannot be moved by the balancer, causing imbalance; fix by refining the shard key or resharding.',
      'Root cause of jumbo chunks: low-cardinality or high-frequency shard keys.',
    ],
  },

  // ───────────────────────── Mongoose & Ops ─────────────────────────
  {
    id: 'mongoose-schema-model',
    group: 'Mongoose & Ops',
    stars: 5,
    difficulty: 'Easy',
    q: 'What is Mongoose and what are schemas and models?',
    a: [
      'Mongoose is an ODM (Object Data Modeling) library for MongoDB in Node.js.',
      'A Schema defines field types, defaults, validation, indexes, virtuals, methods and hooks.',
      'A Model is a class compiled from a schema; it maps to a collection (name pluralised and lowercased).',
      'Documents are instances of a model with `save()`, validation and change tracking.',
      'Adds app-level structure on top of schemaless MongoDB; the native driver is lighter and faster.',
      '`timestamps: true` adds `createdAt`/`updatedAt` automatically.',
    ],
    code: `const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  age: { type: Number, min: 0 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });
const User = mongoose.model('User', userSchema);
await User.create({ email: 'A@x.com', age: 25 });`,
  },
  {
    id: 'mongoose-middleware',
    group: 'Mongoose & Ops',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is Mongoose middleware (hooks)?',
    a: [
      'Pre and post hooks that run around operations such as `save`, `validate`, `deleteOne`, `find`, `findOneAndUpdate`, `aggregate`.',
      'Document middleware: `this` is the document (`save`, `validate`).',
      'Query middleware: `this` is the query (`find`, `updateOne`); `save` hooks do not run on `updateOne`/`findOneAndUpdate`.',
      'Common use: hashing passwords before save, soft-delete filters, audit logs.',
      'Use regular `function` (not arrow) so `this` binds; async hooks need no `next()` in recent versions.',
    ],
    code: `userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});
userSchema.pre(/^find/, function () {
  this.where({ deleted: false });
});`,
  },
  {
    id: 'populate-vs-lookup',
    group: 'Mongoose & Ops',
    stars: 5,
    difficulty: 'Medium',
    q: 'What is `populate()` and how is it different from `$lookup`?',
    a: [
      '`populate()` replaces referenced ObjectIds (`ref`) with the actual documents.',
      'It runs separate queries from the app (one extra query per populated path), not a server-side join.',
      '`$lookup` performs the join inside MongoDB in a single aggregation round trip.',
      '`populate` is convenient and returns hydrated Mongoose docs; `$lookup` is better for heavy, filtered or analytic joins.',
      'Deep or nested populates cause many queries: watch performance (N+1 style issues).',
    ],
    code: `const postSchema = new Schema({
  title: String,
  author: { type: Schema.Types.ObjectId, ref: 'User' }
});
const posts = await Post.find().populate('author', 'name email').lean();`,
  },
  {
    id: 'mongoose-lean',
    group: 'Mongoose & Ops',
    stars: 4,
    difficulty: 'Easy',
    q: 'What does `lean()` do in Mongoose?',
    a: [
      '`lean()` returns plain JavaScript objects instead of full Mongoose documents.',
      'Much faster and uses less memory: no change tracking, getters/setters or hydration.',
      'Lost features: `save()`, virtuals, getters, instance methods and defaults on the result.',
      'Ideal for read-only API responses; skip it when you plan to modify and save the doc.',
    ],
    code: `const users = await User.find({ active: true }).select('name email').lean();`,
  },
  {
    id: 'mongoose-virtuals-methods',
    group: 'Mongoose & Ops',
    stars: 3,
    difficulty: 'Easy',
    q: 'What are virtuals, instance methods and statics in Mongoose?',
    a: [
      'Virtuals are computed properties not stored in MongoDB (e.g. `fullName` from first + last).',
      'Virtuals are excluded from JSON output unless `toJSON: { virtuals: true }` is set.',
      'Virtual populate links to children without storing their ids in the parent.',
      'Instance methods (`schema.methods`) act on one document, e.g. `comparePassword()`.',
      'Statics (`schema.statics`) are model-level helpers, e.g. `User.findByEmail()`.',
    ],
    code: `userSchema.virtual('fullName').get(function () {
  return this.first + ' ' + this.last;
});
userSchema.methods.comparePassword = function (pw) {
  return bcrypt.compare(pw, this.password);
};`,
  },
  {
    id: 'connection-pooling',
    group: 'Mongoose & Ops',
    stars: 4,
    difficulty: 'Medium',
    q: 'How does connection pooling work with the MongoDB Node driver?',
    a: [
      'The `MongoClient` maintains a pool of TCP connections reused across operations.',
      '`maxPoolSize` defaults to 100; `minPoolSize` keeps warm connections.',
      'Create one client per process at startup and reuse it; never connect per request.',
      'In serverless (Lambda, Vercel), cache the client in a module-level variable to reuse it across invocations.',
      'Ops wait in a queue when the pool is exhausted (`waitQueueTimeoutMS`).',
    ],
    code: `// lib/db.js
let clientPromise;
export function getClient() {
  clientPromise ??= new MongoClient(process.env.MONGODB_URI, { maxPoolSize: 20 }).connect();
  return clientPromise;
}`,
  },
  {
    id: 'change-streams',
    group: 'Mongoose & Ops',
    stars: 3,
    difficulty: 'Medium',
    q: 'What are change streams?',
    a: [
      'Change streams let apps subscribe to real-time data changes on a collection, database or whole cluster.',
      'Built on the oplog; require a replica set or sharded cluster.',
      'Can be filtered with an aggregation pipeline (e.g. only `insert` events).',
      'Each event has a resume token so you can resume after a disconnect without losing events.',
      '`fullDocument: "updateLookup"` returns the current document for updates; 6.0+ supports pre/post images.',
      'Use cases: notifications, cache invalidation, syncing to search/analytics, event-driven microservices.',
    ],
    code: `const stream = orders.watch([{ $match: { operationType: 'insert' } }]);
for await (const change of stream) {
  notify(change.fullDocument);
  saveToken(change._id);   // resume token
}`,
  },
  {
    id: 'atlas-backups',
    group: 'Mongoose & Ops',
    stars: 3,
    difficulty: 'Easy',
    q: 'What is MongoDB Atlas and how do you back up MongoDB?',
    a: [
      'Atlas is MongoDB\'s fully managed cloud DBaaS on AWS, Azure and GCP.',
      'Provides automated replica sets, sharding, scaling, monitoring, Atlas Search, Vector Search and backups.',
      'Atlas backups: continuous cloud backups with point-in-time restore.',
      'Self-managed: `mongodump`/`mongorestore` (logical, fine for small data), filesystem snapshots (large data).',
      'For consistency with `mongodump` on a replica set, use `--oplog`.',
      'Always test restores; a backup that has never been restored is not proven.',
    ],
    code: `mongodump --uri="mongodb://localhost:27017/shop" --out=/backups/2026-11-18
mongorestore --uri="mongodb://localhost:27017" /backups/2026-11-18`,
  },
  {
    id: 'mongodb-security',
    group: 'Mongoose & Ops',
    stars: 4,
    difficulty: 'Medium',
    q: 'How do you secure a MongoDB deployment?',
    a: [
      'Enable authentication (SCRAM-SHA-256, x.509, LDAP/OIDC) and never expose an unauthenticated instance.',
      'Use role-based access control: least-privilege users per app (e.g. `readWrite` on one db).',
      'Bind to private interfaces (`bindIp`), use firewalls / IP access lists, and VPC peering.',
      'Encrypt in transit with TLS; encrypt at rest (WiredTiger encryption / cloud KMS).',
      'Queryable Encryption / CSFLE encrypt sensitive fields client-side.',
      'Enable auditing and keep the server patched.',
    ],
    code: `db.createUser({
  user: 'appUser', pwd: passwordPrompt(),
  roles: [{ role: 'readWrite', db: 'shop' }]
})`,
  },
  {
    id: 'nosql-injection',
    group: 'Mongoose & Ops',
    stars: 4,
    difficulty: 'Medium',
    q: 'What is NoSQL (operator) injection in MongoDB and how do you prevent it?',
    a: [
      'If request bodies are passed straight into filters, attackers can send operators like `{ "$ne": null }`.',
      'Example: `{ password: { "$ne": "" } }` in a login query can bypass the password check.',
      '`$where` and `$function` run JavaScript and allow code injection; avoid them (and disable server JS).',
      'Validate and cast input types (Zod/Joi, `String(x)`) so values cannot be objects.',
      'Strip keys starting with `$` or containing `.` (e.g. `express-mongo-sanitize`); Mongoose `sanitizeFilter` helps.',
      'Never build `$regex` from raw input without escaping (ReDoS and broad matching).',
    ],
    code: `// vulnerable: body = { email: 'a@x.com', password: { $ne: '' } }
await User.findOne({ email: req.body.email, password: req.body.password });
// safe
const email = String(req.body.email);
mongoose.set('sanitizeFilter', true);`,
  },
  {
    id: 'mongoose-validation-errors',
    group: 'Mongoose & Ops',
    stars: 3,
    difficulty: 'Medium',
    q: 'How do Mongoose validation and duplicate-key errors work?',
    a: [
      'Built-in validators: `required`, `min`/`max`, `enum`, `match`, `minLength`/`maxLength`; plus custom `validate`.',
      'Validation runs on `save()`/`create()`; for updates you must pass `runValidators: true`.',
      '`unique: true` is not a validator: it creates a unique index, and violations surface as MongoDB error code `11000`.',
      'Handle `ValidationError` (400) and `E11000` duplicate key (409) separately in error middleware.',
      'Disable `autoIndex` in production and build indexes deliberately.',
    ],
    code: `try {
  await User.create({ email });
} catch (err) {
  if (err.code === 11000) return res.status(409).json({ error: 'Email taken' });
  if (err.name === 'ValidationError') return res.status(400).json(err.errors);
  throw err;
}`,
  },
];

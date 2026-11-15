**ANN (Approximate Nearest Neighbour) indexes** are data structures that find vectors *close* to a query without comparing against every stored vector. **HNSW** uses a layered graph you can navigate quickly, while **IVF** groups vectors into clusters and searches only the most promising ones. Both trade a small amount of accuracy (recall) for very large speed-ups.

## Why approximate?

Exact k-nearest-neighbour search compares the query with all N vectors. With 100 million 1024-dimensional vectors, that is about 100 billion multiply-adds per query, which is far too slow for interactive use. ANN indexes usually reach **95-99% recall** in a few milliseconds.

## HNSW (Hierarchical Navigable Small World)

HNSW builds a **multi-layer proximity graph**:

```
Layer 2:   A ─────────────── F            (few nodes, long jumps)
           │                 │
Layer 1:   A ──── C ──── E ── F            (more nodes)
           │      │      │    │
Layer 0:   A─B─C─D─E─F─G─H─I─J            (all nodes, short links)
```

**Search:** start at an entry point on the top layer, greedily move to whichever neighbour is closest to the query, then drop down a layer and repeat. The bottom layer gives the final, fine-grained neighbours.

**Key parameters:**
- `M`: links per node. Higher means better recall and more memory.
- `ef_construction`: candidate list size while building. Higher means a better graph and a slower build.
- `ef_search`: candidate list size at query time. This is the main knob for trading recall against latency.

**Pros:** excellent recall/latency trade-off, no training step, supports incremental inserts.
**Cons:** memory-hungry (the graph plus full vectors live in RAM), slow to build, and deletes are awkward.

## IVF (Inverted File Index)

IVF runs **k-means** to split the vector space into `nlist` clusters (Voronoi cells). Each vector is stored in the list of its nearest centroid.

**Search:** find the `nprobe` centroids closest to the query, then scan only the vectors in those clusters.

```
query → compare with 4,096 centroids → pick nprobe = 16 → scan ~0.4% of the data
```

**Pros:** lower memory, fast to build, and combines well with compression.
**Cons:** needs a training step on representative data, and recall drops if a true neighbour sits in a cluster you did not probe.

### IVF-PQ

**Product Quantization (PQ)** compresses each vector into a few bytes by splitting it into sub-vectors and storing codebook IDs. **IVF-PQ** can hold billions of vectors in memory, at some cost to accuracy. Systems often re-rank the shortlist with full-precision vectors to recover it.

## Comparison

| Aspect | Flat (brute force) | HNSW | IVF / IVF-PQ |
|---|---|---|---|
| Recall | 100% | Very high | Medium-high (depends on `nprobe`) |
| Query speed | Slow at scale | Very fast | Fast |
| Memory | Vectors only | High (vectors + graph) | Low with PQ |
| Build time | None | Slow | Medium (needs training) |
| Best for | Small datasets, ground truth | Low-latency, in-RAM workloads | Very large datasets, memory limits |

Disk-based indexes such as **DiskANN** keep most of the graph on SSD so that billion-scale indexes stay affordable.

## Example: FAISS

```python
import faiss
import numpy as np

d = 768
xb = np.random.rand(200_000, d).astype("float32")   # database vectors
xq = np.random.rand(5, d).astype("float32")          # queries

# HNSW: no training needed
hnsw = faiss.IndexHNSWFlat(d, 32)      # M = 32
hnsw.hnsw.efSearch = 64
hnsw.add(xb)
D, I = hnsw.search(xq, 10)

# IVF: train k-means first
quantizer = faiss.IndexFlatL2(d)
ivf = faiss.IndexIVFFlat(quantizer, d, 1024)   # nlist = 1024
ivf.train(xb)
ivf.add(xb)
ivf.nprobe = 16                                # clusters scanned per query
D, I = ivf.search(xq, 10)
```

## Practical tips

- **Measure recall**: compare ANN results against brute-force results on a sample of queries while you tune.
- **Watch filtered search**: strict metadata filters can disconnect HNSW graph traversal. Prefer engines with filter-aware search, or fall back to exact search when the filter is very selective.
- **Plan for updates**: IVF centroids can drift as data changes, so retrain periodically.

## Summary

- ANN indexes find "nearly the best" neighbours very fast instead of scanning everything.
- HNSW gives top recall and latency at the cost of memory; IVF (often with PQ) scales cheaply to huge datasets.
- Tune `ef_search` or `nprobe` against measured recall for your workload.

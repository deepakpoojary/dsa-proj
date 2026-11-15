A **vector database** stores data as high-dimensional numeric vectors (embeddings) and is optimised to quickly find the vectors that are *most similar* to a query vector. Similarity search works by embedding the query with the same model, then returning the stored vectors that are closest to it according to a distance metric such as cosine similarity.

## What gets stored

An **embedding model** converts text, images or audio into a fixed-length vector (for example 768 or 1536 floats). The model is trained so that inputs with similar *meaning* end up close together in this vector space:

- "How do I reset my password?" and "I forgot my login credentials" → nearby vectors
- "How do I reset my password?" and "Best pizza in Naples" → far apart

A vector database stores each vector together with:

- an **ID**
- the original content (or a pointer to it)
- **metadata** such as source, date, tenant or access permissions

## How similarity search works

1. **Index time:** split documents into chunks, embed each chunk, and insert the vectors plus metadata.
2. **Query time:** embed the user's query with the *same* model.
3. **Search:** find the **k nearest neighbours** (top-k) to the query vector.
4. **Return** the matching chunks, usually to feed an LLM in a RAG pipeline.

### Distance metrics

| Metric | Measures | Notes |
|---|---|---|
| Cosine similarity | Angle between vectors | Most common for text embeddings |
| Dot product | Angle and magnitude | Equals cosine when vectors are normalised |
| Euclidean (L2) | Straight-line distance | Common for image embeddings |

Use whatever metric the embedding model was trained for.

### Exact vs approximate search

Comparing the query to every stored vector (**brute-force kNN**) is exact but costs O(N × d) per query. That is fine for tens of thousands of vectors, but too slow for hundreds of millions. Vector databases therefore build **ANN (Approximate Nearest Neighbour)** indexes such as **HNSW** (graph-based) or **IVF** (cluster-based), which return almost all of the true neighbours in milliseconds.

## Example: brute-force search in NumPy

```python
import numpy as np

def normalize(x):
    return x / np.linalg.norm(x, axis=-1, keepdims=True)

# 10,000 document embeddings, 384 dimensions each
docs = normalize(np.random.rand(10_000, 384).astype("float32"))
query = normalize(np.random.rand(384).astype("float32"))

scores = docs @ query               # cosine similarity (vectors are normalised)
top_k = np.argsort(-scores)[:5]     # indices of the 5 most similar docs
print(top_k, scores[top_k])
```

## Example: pgvector in Postgres

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE docs (
  id bigserial PRIMARY KEY,
  content text,
  tenant_id int,
  embedding vector(1536)
);

-- <=> is cosine distance; smaller means more similar
SELECT id, content
FROM docs
WHERE tenant_id = 42
ORDER BY embedding <=> $1
LIMIT 5;
```

## Popular options

- **Postgres + pgvector**: easiest if you already run Postgres
- **Dedicated databases**: Qdrant, Weaviate, Milvus, Pinecone, Chroma
- **Search engines with vector support**: Elasticsearch, OpenSearch
- **Libraries** (not full databases): FAISS, hnswlib

## Common pitfalls

- **Mixing embedding models**: query and documents must use the same model; switching models means re-embedding everything.
- **Ignoring metadata filters**: multi-tenant apps must filter by tenant or permissions at query time.
- **Relying on vectors alone**: embeddings can miss exact matches such as error codes or SKUs, so many systems add keyword search (**hybrid search**).
- **Poor chunking**: retrieval quality depends heavily on how documents are split.

## Summary

- A vector database stores embeddings plus metadata and answers "what is most similar to this?"
- Similarity search embeds the query and returns the nearest vectors by cosine, dot product or L2 distance.
- At scale, ANN indexes like HNSW and IVF give a small loss in accuracy in exchange for a large gain in speed.

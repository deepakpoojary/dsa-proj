**Hybrid search** combines **keyword (lexical) search**, usually BM25, with **semantic vector search**, then merges both result lists into a single ranking. It is used because each method catches what the other misses, so the combination gives noticeably better retrieval, especially for RAG.

## The two halves

### BM25 (lexical search)

BM25 scores documents by **term matches**. It rewards rare terms (IDF), accounts for term frequency, and normalises for document length.

- Strong at **exact matches**: error codes (`ERR_CONN_RESET`), product SKUs, names, acronyms, rare jargon
- Weak at **synonyms and paraphrases**: "car" will not match "automobile"

### Vector search (semantic search)

Embeds the query and documents, then finds nearest neighbours.

- Strong at **meaning**: "how do I get my money back" matches "refund policy"
- Weak at **exact tokens**: embeddings may blur `v2.3.1` and `v2.4.0`, or ignore a rare ID entirely

| Query type | BM25 | Vectors |
|---|---|---|
| "error 0x80070005" | Excellent | Often poor |
| "why is my app slow after login" | Weak | Good |
| Person or product names | Good | Mixed |
| Paraphrased questions | Weak | Excellent |
| Domain jargon not seen in training | Good | Weak |

## How the results are merged

### Reciprocal Rank Fusion (RRF)

The most popular method. It uses only **ranks**, so you do not need to normalise BM25 scores (unbounded) against cosine scores (between -1 and 1).

```
RRF(doc) = Σ over each result list of 1 / (k + rank(doc)),   with k ≈ 60
```

```python
def reciprocal_rank_fusion(result_lists, k=60, top_n=10):
    """result_lists: list of ranked doc-id lists, e.g. [bm25_ids, vector_ids]."""
    scores = {}
    for ranked in result_lists:
        for rank, doc_id in enumerate(ranked, start=1):
            scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank)
    return sorted(scores, key=scores.get, reverse=True)[:top_n]

bm25_ids   = ["d7", "d2", "d9", "d1"]
vector_ids = ["d2", "d4", "d7", "d5"]
print(reciprocal_rank_fusion([bm25_ids, vector_ids]))
# ['d2', 'd7', 'd4', 'd9', ...]: docs found by both methods rise to the top
```

### Weighted score fusion

Normalise each score (for example min-max), then compute `alpha * vector_score + (1 - alpha) * bm25_score`. This is tunable but more sensitive to score distributions. Some engines expose it as an `alpha` parameter.

## A typical RAG retrieval pipeline

```
           ┌─► BM25 search ─── top 50 ─┐
query ─────┤                           ├─► RRF fusion ─► reranker ─► top 5 ─► LLM
           └─► vector search ─ top 50 ─┘
```

Hybrid search maximises **recall**; a **cross-encoder reranker** then restores **precision**.

## Where you get it

- **Elasticsearch / OpenSearch**: BM25 plus kNN with RRF
- **Weaviate, Qdrant, Milvus, Pinecone, Vespa**: built-in hybrid or sparse-plus-dense queries
- **Postgres**: `tsvector` full-text search plus `pgvector`, fused in SQL or in application code
- **Learned sparse models** such as SPLADE: a "neural BM25" that expands terms and can replace or complement BM25

## When it helps most

- Technical docs, logs and code, which are full of identifiers
- E-commerce search with SKUs and brand names
- Legal and medical text with precise terminology
- Any corpus with many short or keyword-style user queries

## Pitfalls

- **Extra infrastructure**: two indexes to keep in sync
- **Tuning**: the RRF `k`, the weights, and how many candidates to take from each side
- **Evaluate it**: measure recall@k with and without hybrid on a labelled query set. It almost always helps, but confirm on your own data.

## Summary

- Hybrid search = BM25 for exact terms plus vectors for meaning, merged with RRF or weighted scores.
- It improves recall because the two methods fail in different ways.
- Pair it with a reranker for the best RAG retrieval quality.

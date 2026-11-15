Semantic search for an e-commerce catalog combines **vector search** (to understand intent like "comfy shoes for standing all day") with **keyword search** (for brands, SKUs and exact terms), plus **structured filters** extracted from the query and a **ranking layer** that blends relevance with business signals, all within a tight latency budget.

## 1. Requirements

**Functional**

- Natural-language queries, typos, synonyms ("sneakers" vs "trainers")
- Filters: price, size, color, brand, availability
- Personalised, business-aware ranking

**Non-functional**

- p95 latency around 100-200 ms
- Millions of products, thousands of queries per second at peak
- Price and stock updates reflected within minutes

## 2. Architecture

```text
                     INDEXING
Catalog DB ──> Product docs ──> Embedding model ──> ANN index (HNSW)
 (CDC stream)   (title, attrs,                      + BM25 index
                 description,                       + filterable fields
                 reviews)

                     QUERY
User query ──> Query understanding ──> Hybrid retrieval ──> Ranking ──> Results
               (spell-fix, filters,    (BM25 + vectors,    (reranker +
                embedding)              hard filters,       business signals,
                                        RRF merge)          personalisation)
```

## 3. Indexing

- Build a **product document**: title, brand, category path, key attributes, short description, maybe top review phrases
- Embed with a text embedding model fine-tuned or evaluated on your domain; optionally add **image embeddings** (CLIP-style) for visual queries
- Store vectors in an ANN index (HNSW) in a search engine or vector DB that also supports **filters and BM25** (e.g. OpenSearch, Elasticsearch, Vespa, or Postgres with pgvector for smaller catalogs)
- Keep price, stock and popularity as filterable/sortable fields updated via a **change-data-capture stream**; re-embed only when text changes

## 4. Query understanding

Turn free text into a structured query:

```python
# "red running shoes under $80 for women"
parsed = {
    "text": "running shoes",
    "filters": {"color": "red", "gender": "women", "price_max": 80},
}
```

- Use rules plus a small NER model or a fast LLM call with structured output
- **Cache** results for frequent queries (the head of the query distribution is very repetitive)
- Spell correction and synonym expansion for the keyword side

## 5. Hybrid retrieval

```python
def search(query, user, k=50):
    q = understand(query)                       # cached for popular queries
    q_vec = embed(q["text"])                    # cached embedding
    filters = {**q["filters"], "in_stock": True, "region": user.region}

    lexical = bm25_search(q["text"], filters, k=200)
    semantic = vector_search(q_vec, filters, k=200)   # filtered ANN (HNSW)

    candidates = reciprocal_rank_fusion([lexical, semantic])[:200]
    return rank(candidates, query, user)[:k]
```

- **Keyword** handles exact matches: brand names, model numbers, SKUs
- **Vectors** handle intent, synonyms and descriptive queries
- **Reciprocal rank fusion (RRF)** merges the lists without calibrating scores
- Apply filters **during** ANN search to avoid empty results

## 6. Ranking

A second stage reorders the top ~200 candidates:

- **Cross-encoder reranker** or learning-to-rank model (e.g. gradient-boosted trees) using features: text relevance, semantic score, CTR, conversion rate, rating, price, margin, recency, stock
- **Personalisation**: user's past categories, brands, size
- **Business rules**: boost promotions, diversify brands, demote out-of-stock

Keep heavy models off the hot path or use small, distilled ones to stay within budget.

## 7. Latency budget (example)

| Step | Budget |
|---|---|
| Query understanding (cached or small model) | 10-30 ms |
| Embedding (cached or small model) | 5-15 ms |
| Hybrid retrieval with filters | 20-40 ms |
| Ranking | 20-50 ms |
| Network and assembly | 20 ms |

## 8. Evaluation

**Offline**

- Labelled query-product relevance sets (human judges or LLM-assisted labelling with review)
- Metrics: **NDCG@10**, recall@k, MRR, zero-result rate

**Online (A/B tests)**

- Click-through rate, add-to-cart, conversion, revenue per search
- Zero-result and reformulation rates, search exit rate

## 9. Edge cases and pitfalls

- SKU or exact-model queries must not be "semantically" diluted; detect and boost exact matches
- Negation and numbers ("not leather", "under $50") are weak in embeddings; handle them as filters
- Cold-start products lack behavioural signals; rely on content relevance
- Multilingual catalogs need multilingual embeddings
- Re-embedding the whole catalog when changing models needs a blue-green index

## Summary

- Index products in both an ANN vector index and a BM25 index with filterable fields kept fresh via CDC.
- Parse queries into text plus filters, run hybrid retrieval merged with RRF, then rerank with relevance, business and personalisation signals.
- Stay within a ~100-200 ms budget with caching and small models, and evaluate with NDCG offline and conversion metrics in A/B tests.

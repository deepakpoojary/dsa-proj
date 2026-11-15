**Reranking** is a second-stage step in retrieval: a fast retriever first fetches a broad set of candidate documents, then a slower, more accurate model re-scores those candidates and reorders them by true relevance to the query. It improves RAG because the LLM receives fewer, better chunks, which leads to more accurate and better-grounded answers.

## Why first-stage retrieval is not enough

Vector search uses **bi-encoders**: the query and each document are embedded **separately**, and relevance is just the cosine similarity between two vectors.

- **Pros:** document vectors are precomputed, so search over millions of items takes milliseconds.
- **Cons:** the whole meaning of a document is squeezed into one vector, and the model never sees query and document together. Results are "topically similar" rather than "actually answers the question".

For example, for "Does the Pro plan include SSO?", a bi-encoder may rank a general "Pro plan pricing" page above the paragraph that actually says "SSO is available on Enterprise only".

## How a reranker works

Most rerankers are **cross-encoders**: a transformer that takes `[query] + [document]` as **one input** and outputs a relevance score.

```
Bi-encoder:     embed(query) · embed(doc)          → cheap, coarse
Cross-encoder:  model(query + doc) → 0.93          → expensive, precise
```

Because attention runs across the query and document tokens together, the model can check negations, specific entities and whether the passage really answers the question.

Cross-encoders cannot precompute anything, so you only run them on a **shortlist**:

```
Query ─► Hybrid/vector retrieval (top 50-100, high recall)
      ─► Reranker (score each pair)
      ─► Top 3-8 chunks (high precision) ─► LLM prompt
```

## Example with sentence-transformers

```python
from sentence_transformers import CrossEncoder

reranker = CrossEncoder("BAAI/bge-reranker-v2-m3")

query = "Does the Pro plan include SSO?"
candidates = [
    "The Pro plan costs $20 per user per month.",
    "SSO via SAML is available on the Enterprise plan only.",
    "Pro includes priority support and audit logs.",
]

scores = reranker.predict([(query, doc) for doc in candidates])
ranked = sorted(zip(candidates, scores), key=lambda x: x[1], reverse=True)

for doc, score in ranked:
    print(f"{score:.3f}  {doc}")
# The SSO/Enterprise sentence now ranks first.
```

## Types of rerankers

| Type | Examples | Quality | Latency and cost |
|---|---|---|---|
| Cross-encoder (open source) | bge-reranker, mxbai-rerank | High | Low-medium, self-hosted |
| Hosted rerank API | Cohere Rerank, Voyage, Jina | High | Per-call pricing |
| LLM as reranker (listwise) | Prompt an LLM to order passages | Very high | Highest |
| Late interaction | ColBERT | High | Medium, needs a special index |

## Why it improves RAG

- **Higher precision at the top**: the chunks the LLM sees are the most relevant ones.
- **You can retrieve wider**: fetch 100 candidates for recall without flooding the prompt.
- **Fewer tokens**: sending 5 good chunks instead of 20 mediocre ones lowers cost and latency.
- **Less "lost in the middle"**: LLMs pay less attention to content buried in long contexts, and reranking puts the key evidence first.
- **Fewer hallucinations**: cleaner context means the model is less likely to latch onto irrelevant text.

## Trade-offs and tips

- Reranking adds roughly **50-300 ms**, depending on model size, candidate count and hardware. Batch the pairs and limit the candidate count.
- Use a **score threshold** to drop clearly irrelevant chunks, and let the system answer "not found" when nothing passes.
- Rerankers have **maximum input lengths**, so chunk sizes must fit.
- **Evaluate it**: compare nDCG@k, recall@k and answer quality with and without reranking.

## Summary

- Retrieve broadly with fast bi-encoders or hybrid search, then rerank a shortlist with a cross-encoder.
- Reading the query and document together gives much more accurate relevance.
- RAG gets fewer, better chunks, which means better answers at lower token cost.

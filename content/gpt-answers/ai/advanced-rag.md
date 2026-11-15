**Query rewriting**, **HyDE** and **multi-query retrieval** are pre-retrieval techniques that use an LLM to transform the user's question into something that retrieves better. They target a core RAG problem: users phrase questions very differently from how documents are written, so a raw query often misses the relevant chunks.

## 1. Query rewriting

An LLM rewrites the query into a **clear, standalone, search-friendly** form.

The most common use is **conversational RAG**: follow-up questions depend on chat history.

```
History:  "Tell me about the Pro plan."
User:     "Does it support SSO?"
Rewritten: "Does the Pro plan support single sign-on (SSO)?"
```

Without the rewrite, "Does it support SSO?" has no subject and retrieves generic SSO docs.

Other uses:
- Fixing typos and expanding abbreviations ("k8s" → "Kubernetes")
- Adding domain vocabulary that matches your docs
- Extracting **metadata filters** ("invoices from 2025" → `year = 2025`)

```python
REWRITE_PROMPT = """Rewrite the user's last message as a standalone search query.
Resolve pronouns using the chat history. Return only the query.

History:
{history}

Last message: {question}"""
```

## 2. HyDE (Hypothetical Document Embeddings)

Questions and answers look different in embedding space: a short question is not necessarily close to a long explanatory paragraph. **HyDE** bridges the gap:

1. Ask the LLM to write a **hypothetical answer** (it may contain factual errors; that is fine).
2. **Embed the hypothetical answer** instead of, or together with, the question.
3. Search the vector index with that embedding.

```
Question: "Why is my Postgres query slow after adding a JSONB column?"
          ↓ LLM
Fake doc: "Queries on JSONB columns can be slow without a GIN index.
           Use CREATE INDEX ... USING gin (data) and the @> operator..."
          ↓ embed → vector search → real docs about GIN indexes on JSONB
```

**Why it works:** the fake answer uses the same vocabulary and style as real documents, so it lands near them in vector space.

**Caveats:** it adds a full LLM generation (latency and cost), and if the LLM knows nothing about your private domain, the fake answer can steer retrieval in the wrong direction.

## 3. Multi-query retrieval

Generate **several variations** of the question, retrieve for each, then merge.

```
Original: "How do I make my API faster?"
  ├─ "API latency optimization techniques"
  ├─ "caching strategies for REST endpoints"
  └─ "database query performance for web backends"
       ↓ retrieve top-k for each
       ↓ deduplicate + Reciprocal Rank Fusion
       → final ranked list
```

```python
def multi_query_retrieve(question, llm, retriever, n=3, k=10):
    variants = llm(f"Write {n} different search queries for: {question}").splitlines()
    queries = [question] + [v.strip() for v in variants if v.strip()]

    scores = {}
    for q in queries:
        for rank, doc in enumerate(retriever.search(q, k=k), start=1):
            scores[doc.id] = scores.get(doc.id, 0) + 1 / (60 + rank)   # RRF
    return sorted(scores, key=scores.get, reverse=True)[:k]
```

A close relative is **query decomposition**: break a multi-part question ("Compare our 2024 and 2025 refund policies") into sub-questions, retrieve for each, then combine the results.

## Comparison

| Technique | Fixes | Extra cost | Risk |
|---|---|---|---|
| Query rewriting | Vague or contextual follow-ups, typos | 1 small LLM call | Rewrite may drop intent |
| HyDE | Mismatch between question and document style | 1 generation call | Hallucinated content misleads search |
| Multi-query | Ambiguous or broad questions, low recall | 1 LLM call plus N searches | More noise, so pair with a reranker |
| Decomposition | Multi-hop and comparison questions | Several LLM calls and searches | More complex orchestration |

## Related techniques

- **Step-back prompting**: also retrieve for a more general version of the question.
- **Routing**: classify the query and send it to the right index or tool (docs, SQL, web).
- **Agentic RAG**: let an agent decide when and what to retrieve, iterating until it has enough.

## Practical advice

- Use a **small, fast model** for rewriting to keep latency low.
- Always combine with **reranking** to filter the extra candidates.
- **Measure** recall@k and answer quality before and after; these techniques do not always help, and their gains vary by dataset.

## Summary

- Query rewriting makes queries standalone and searchable; HyDE searches with a hypothetical answer; multi-query searches with several phrasings and fuses the results.
- All three trade extra LLM calls for better retrieval recall.
- Adopt them only when evals show a real improvement.

RAG systems usually fail in one of two places: **retrieval** (the right information is not found or not passed to the model) or **generation** (the model has the right information but misuses or ignores it). Fixing them starts with tracing each failure to its stage, then applying a targeted fix such as better chunking, hybrid search, reranking or stricter grounding.

## First step: diagnose where it broke

For every bad answer, inspect the trace and ask:

```
Is the answer in the corpus at all?
  └─ No  → content/ingestion problem
  └─ Yes → Was the right chunk retrieved in the top k?
              └─ No  → retrieval problem
              └─ Yes → Did it reach the prompt (after reranking/truncation)?
                          └─ No  → context assembly problem
                          └─ Yes → generation problem
```

## Common failure modes and fixes

### 1. Missing or stale content
The answer simply is not indexed, or the index holds an outdated version.
- **Fix:** audit ingestion coverage, schedule incremental re-indexing, store `updated_at` metadata, and prefer recent documents.
- Teach the model to say **"I don't have that information"** instead of guessing.

### 2. Retrieval misses (low recall)
The relevant chunk exists but is not in the top k.
- Exact terms (IDs, codes, names) get lost in embeddings → add **hybrid search** (BM25 plus vectors).
- The user's wording differs from the document's wording → **query rewriting**, multi-query retrieval or **HyDE**.
- A weak or generic embedding model → try a stronger or domain-tuned model.
- k is too small → retrieve more candidates, then **rerank**.

### 3. Bad chunking
Chunks cut an answer in half, or lose the context that makes them meaningful (for example a table row with no header, or "it" with no subject).
- **Fix:** structure-aware chunking (split by headings or sections), modest overlap, and **contextual chunk headers** (prepend the document title and section path).
- **Parent-document retrieval:** match on small chunks, but send the larger parent section to the LLM.

### 4. Noisy context and "lost in the middle"
Too many loosely related chunks dilute attention; models tend to overlook content in the middle of long contexts.
- **Fix:** a **cross-encoder reranker**, a relevance score threshold, fewer and better chunks, and the most relevant ones placed first.

### 5. Unfaithful answers (hallucination)
The model adds facts from its own training data or contradicts the context.
- **Fix:** an explicit instruction such as "answer only from the context; if it is not there, say so", required **citations** per claim, a lower temperature, and a **groundedness check** (an LLM judge or NLI model) before returning.

### 6. Conflicting sources
Two documents disagree, for example an old policy and a new one.
- **Fix:** metadata such as version, date and authority, filtering or boosting by recency, and prompting the model to surface the conflict.

### 7. Multi-hop questions
The answer needs facts from several documents ("Which team owns the service that failed last Tuesday?").
- **Fix:** **query decomposition** into sub-questions, iterative or agentic retrieval, or a knowledge graph.

### 8. Permission leaks and security
A user retrieves documents they should not see, or a poisoned document injects instructions.
- **Fix:** **ACL filters at query time** (never only in the prompt), treat retrieved text as untrusted data, and sanitise ingested content.

## Quick reference

| Symptom | Likely cause | Fix |
|---|---|---|
| "I don't know" but the doc exists | Retrieval miss | Hybrid search, query rewriting, larger k |
| Half-correct answer | Chunk split the answer | Better chunking, parent-document retrieval |
| Confident wrong answer | Noisy context or hallucination | Reranker, citations, groundedness check |
| Outdated answer | Stale index or conflicts | Re-indexing, recency metadata |
| Fails on complex questions | Multi-hop | Decomposition, agentic retrieval |

## Example: a grounding prompt

```python
SYSTEM = """Answer using ONLY the sources below.
Cite sources like [1], [2] after each claim.
If the sources do not contain the answer, reply: "I couldn't find this in the documentation."
"""

def build_prompt(question, chunks):
    sources = "\n\n".join(f"[{i+1}] {c.text}" for i, c in enumerate(chunks))
    return f"{SYSTEM}\n\nSources:\n{sources}\n\nQuestion: {question}"
```

## Prevent regressions

- Keep an **eval set** that includes past failures, and run it on every change.
- Track retrieval metrics (recall@k) and generation metrics (faithfulness) separately.
- Log traces in production and review low-rated answers regularly.

## Summary

- Diagnose first: decide whether it is a content, retrieval, context or generation failure.
- Typical fixes: hybrid search, query rewriting, smarter chunking, reranking, grounding prompts with citations, and fresh, permission-aware indexes.
- Lock in improvements with an eval set built from real failures.

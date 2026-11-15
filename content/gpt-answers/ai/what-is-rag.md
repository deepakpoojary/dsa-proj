**Retrieval-Augmented Generation (RAG)** is a pattern where, at query time, you **retrieve relevant information** from an external knowledge source and **insert it into the prompt** so the LLM generates an answer grounded in that information. It gives models access to private, up-to-date knowledge without retraining them.

## Why RAG Exists

LLMs on their own:

- Only know what was in their training data (with a **knowledge cutoff**).
- Do not know your company's documents, tickets or database.
- May **hallucinate** when they lack information.
- Cannot cite where an answer came from.

RAG addresses all four by giving the model the right context for each question.

## Architecture

```
            INDEXING (offline)
 ┌──────────┐   ┌────────┐   ┌──────────┐   ┌──────────────┐
 │Documents │──►│ Chunk  │──►│  Embed   │──►│ Vector store │
 └──────────┘   └────────┘   └──────────┘   └──────┬───────┘
                                                    │
            QUERYING (online)                       │
 ┌──────────┐   ┌──────────┐   ┌────────────────┐   │
 │ Question │──►│  Embed   │──►│ Retrieve top-k │◄──┘
 └──────────┘   └──────────┘   └───────┬────────┘
                                       ▼
                              ┌────────────────┐   ┌──────────┐
                              │ Rerank / filter│──►│   LLM    │──► Answer + citations
                              └────────────────┘   └──────────┘
```

### Indexing

1. **Load** documents (PDFs, wikis, tickets, web pages).
2. **Chunk** them into passages (e.g. 300-800 tokens with overlap).
3. **Embed** each chunk into a vector.
4. **Store** vectors, text and metadata in a vector database (pgvector, Qdrant, Pinecone, etc.).

### Querying

1. **Embed** the user's question.
2. **Retrieve** the most similar chunks, often with **hybrid search** (vector + keyword/BM25).
3. **Rerank** candidates with a cross-encoder for precision.
4. **Generate**: put the chunks into the prompt with instructions to answer only from them and cite sources.

## Minimal Example

```python
from openai import OpenAI
import numpy as np

client = OpenAI()

def embed(texts):
    res = client.embeddings.create(model="text-embedding-3-small", input=texts)
    return np.array([d.embedding for d in res.data])

# --- indexing ---
chunks = ["Refunds are processed within 5 business days.",
          "Premium plans include 24/7 phone support.",
          "You can export data as CSV from Settings > Export."]
chunk_vecs = embed(chunks)

# --- querying ---
def answer(question, k=2):
    q = embed([question])[0]
    sims = chunk_vecs @ q / (np.linalg.norm(chunk_vecs, axis=1) * np.linalg.norm(q))
    top = [chunks[i] for i in np.argsort(sims)[::-1][:k]]
    context = "\n".join(f"- {c}" for c in top)
    prompt = (f"Answer using only this context. If it is not there, say you don't know.\n"
              f"Context:\n{context}\n\nQuestion: {question}")
    out = client.responses.create(model="gpt-4.1-mini", input=prompt)
    return out.output_text

print(answer("How long do refunds take?"))
```

In production, a vector database replaces the in-memory NumPy search.

## Benefits

- **Fresh knowledge**: update the index, not the model.
- **Private data** without sending it into training.
- **Fewer hallucinations** and **citations** for trust.
- **Access control**: filter retrieved documents by user permissions.
- **Cheaper** than fine-tuning for knowledge-heavy use cases.

## Where RAG Fails

| Failure | Typical fix |
|---|---|
| Relevant chunk not retrieved | Better chunking, hybrid search, query rewriting |
| Irrelevant chunks retrieved | Reranking, metadata filters |
| Answer ignores context | Stronger instructions, better ordering, smaller context |
| Question needs many documents | Multi-step or agentic retrieval |
| Stale index | Incremental re-indexing pipelines |

## Evaluating RAG

Measure the two halves separately:

- **Retrieval**: recall@k, precision@k, MRR on labelled question/chunk pairs.
- **Generation**: faithfulness (grounded in context), answer relevance, correctness. Tools like Ragas or LLM-as-judge setups help.

## Summary

- RAG retrieves relevant knowledge at query time and feeds it to the LLM as context.
- Pipeline: chunk, embed, store, then retrieve, rerank and generate with citations.
- It is the standard way to build LLM apps on private or changing data; quality depends heavily on retrieval and should be evaluated separately from generation.

You chunk documents by splitting them into **coherent, self-contained passages**, small enough to embed and retrieve precisely but large enough to carry meaning, usually a few hundred tokens with some overlap, and you attach metadata to each chunk. The best strategy depends on your document structure, so validate it with retrieval evals.

## Why Chunking Matters

- Embedding a whole document into one vector **dilutes** its meaning; specific facts become hard to match.
- LLM context is limited and costly, so you want to retrieve only the relevant parts.
- Poor chunk boundaries split ideas in half, so neither chunk answers the question.

Chunking is often the single biggest lever on RAG quality.

## The Size Trade-off

| Chunk size | Pros | Cons |
|---|---|---|
| Small (100-200 tokens) | Precise matches | Missing surrounding context |
| Medium (300-800 tokens) | Good balance, common default | Needs tuning per corpus |
| Large (1000+ tokens) | Rich context | Diluted embeddings, more noise, higher cost |

Add **overlap** (10-20% of chunk size) so sentences near boundaries appear in both neighbouring chunks.

## Chunking Strategies

### 1. Fixed-Size

Split every N tokens. Simple and fast, but ignores structure and can cut sentences.

### 2. Recursive Character / Token Splitting

Try to split on the largest natural separator first (sections, then paragraphs, then sentences, then words) while staying under the size limit. A strong default.

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,          # characters here; token-based splitters also exist
    chunk_overlap=120,
    separators=["\n## ", "\n### ", "\n\n", "\n", ". ", " "],
)
chunks = splitter.split_text(markdown_text)
```

### 3. Structure-Aware

Use the document's own structure:

- **Markdown / HTML**: split by headings; keep the heading path with each chunk.
- **Code**: split by function or class using a parser.
- **PDFs**: respect pages, sections and tables (layout-aware parsers help).
- **Tables**: keep rows with their headers, or convert to text descriptions.

### 4. Semantic Chunking

Embed sentences and start a new chunk where similarity between consecutive sentences drops, so each chunk covers one topic. Better boundaries, more compute.

### 5. Contextual Chunking

Prepend a short context to each chunk before embedding, e.g. the document title, section path or an LLM-generated one-line summary of where the chunk fits. This greatly helps chunks like "Revenue grew 3% over the previous quarter" that are ambiguous on their own.

### 6. Parent-Child (Small-to-Big)

Index **small chunks** for precise matching, but return their **larger parent section** to the LLM for context.

```
Parent section (1,500 tokens) ──► sent to the LLM
   ├── child chunk 1 (300 tokens) ──► embedded & searched
   ├── child chunk 2
   └── child chunk 3
```

## Attach Metadata

Store with each chunk:

```python
{
    "text": chunk_text,
    "doc_id": "hr-policy-2026",
    "title": "Leave Policy",
    "section": "Parental Leave > Eligibility",
    "page": 4,
    "updated_at": "2026-09-01",
    "access_group": "employees",
}
```

Metadata enables **filtering** (by date, product, permissions), **citations**, and **re-indexing** when a document changes.

## How to Choose and Tune

1. Start with recursive splitting at ~500-800 tokens and ~15% overlap.
2. Respect structure where it exists (headings, code, tables).
3. Build a small eval set of questions with known relevant passages.
4. Measure **recall@k** and **MRR** while varying size, overlap and strategy.
5. Check the embedding model's max input length; chunks beyond it are silently truncated.

## Common Pitfalls

- One-size-fits-all chunking across very different document types.
- Losing headings, so chunks lack context.
- Splitting tables or code blocks mid-way.
- Ignoring duplicates and boilerplate (headers, footers, navigation).
- Never re-evaluating after changing the embedding model.

## Summary

- Chunk into coherent passages (often 300-800 tokens with 10-20% overlap) and attach rich metadata.
- Prefer recursive or structure-aware splitting; add contextual headers and parent-child retrieval for better results.
- Tune chunking empirically with retrieval metrics on your own data.

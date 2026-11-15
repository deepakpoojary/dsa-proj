**Embeddings** are dense numeric vectors that represent the meaning of data such as text, images or code. Items with similar meaning end up close together in vector space, so you can compare meaning with simple math like cosine similarity.

## The Intuition

An embedding model maps input to a fixed-length list of numbers, for example 768 or 1536 dimensions:

```
"How do I reset my password?"   -> [0.021, -0.113, 0.087, ..., 0.004]
"I forgot my login credentials" -> [0.019, -0.108, 0.091, ..., 0.010]   (close)
"Best pizza in Naples"          -> [-0.140, 0.052, -0.033, ..., 0.077]  (far)
```

No individual number has an obvious meaning, but the **geometry** does: distance encodes semantic similarity. The two password questions share almost no words, yet their vectors are close. That is what makes embeddings better than keyword matching for many tasks.

## How They Are Created

- Text is tokenized and passed through a transformer encoder (or a decoder adapted for embeddings).
- Token representations are pooled into one vector.
- Models are trained with **contrastive learning**: pull related pairs (question and answer, query and relevant passage) together and push unrelated pairs apart.

Embedding models are **separate from chat models**: they are smaller, cheaper and only output vectors.

## Measuring Similarity

| Metric | Formula idea | Notes |
|---|---|---|
| **Cosine similarity** | Angle between vectors | Most common; ignores magnitude |
| **Dot product** | Sum of element products | Equals cosine when vectors are normalised |
| **Euclidean distance** | Straight-line distance | Smaller = more similar |

## Example

```python
from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer("all-MiniLM-L6-v2")   # 384-dim open model

docs = [
    "Reset your password from the account settings page.",
    "Our refund policy allows returns within 30 days.",
    "Shipping usually takes 3-5 business days.",
]
doc_vecs = model.encode(docs, normalize_embeddings=True)

query_vec = model.encode("I can't log in to my account", normalize_embeddings=True)
scores = util.cos_sim(query_vec, doc_vecs)[0]

best = scores.argmax().item()
print(docs[best], float(scores[best]))   # -> the password reset doc
```

## Common Use Cases

- **Semantic search**: find documents by meaning rather than exact words.
- **RAG**: retrieve relevant chunks to feed an LLM.
- **Clustering and topic discovery**: group support tickets or feedback.
- **Deduplication**: detect near-identical content.
- **Recommendations**: "items similar to this one".
- **Classification**: train a light classifier on top of embeddings, or compare against label embeddings.
- **Multimodal search**: models like CLIP put images and text in the same space.

## Storing and Searching Embeddings

At scale you use a **vector database** or index with **approximate nearest neighbour (ANN)** search:

- Algorithms: **HNSW** (graph-based, popular), IVF, product quantisation.
- Tools: **pgvector** (Postgres), FAISS, Qdrant, Pinecone, Weaviate, Milvus, Elasticsearch/OpenSearch vector fields.

## Choosing an Embedding Model

- **Quality on your domain**: check benchmarks like MTEB, then test on your own queries.
- **Dimensions**: more dims can mean better quality but more storage and slower search; some models support truncated (Matryoshka) embeddings.
- **Max input length**, multilingual support, cost and whether you can self-host.

## Common Pitfalls

- Mixing embeddings from **different models** in one index; vectors are not comparable.
- Forgetting to **re-embed** everything when switching models.
- Embedding very long documents as one vector; meaning gets diluted, so chunk first.
- Assuming high similarity means correctness; embeddings capture topic similarity, not truth.

## Summary

- Embeddings turn data into vectors where **distance reflects meaning**.
- They power semantic search, RAG, clustering, recommendations and more.
- Use the same model for queries and documents, store them in a vector index, and evaluate on your own data.

The **KV cache** stores the attention **Key** and **Value** tensors for tokens a transformer has already processed, so they do not have to be recomputed for every new token. It is the main reason LLM text generation is fast enough to be practical, and its memory footprint is one of the biggest constraints on inference throughput and context length.

## Why It Is Needed

LLMs generate one token at a time. At each step, the new token attends to **all previous tokens**, which requires their Keys and Values in every layer.

Without a cache:

```
step 1: compute K,V for tokens 1..100   (prompt)
step 2: compute K,V for tokens 1..101   (recomputes 100 tokens)
step 3: compute K,V for tokens 1..102   (recomputes 101 tokens)
...
```

That is quadratic redundant work. With a cache:

```
prefill: compute K,V for tokens 1..100 -> store in cache
step 1:  compute K,V for token 101 only -> append; attend over cache
step 2:  compute K,V for token 102 only -> append; attend over cache
```

Past Keys and Values never change (thanks to causal masking), so caching them is exact, not an approximation.

## How It Works in Code

```python
# Simplified single-layer decode step with a KV cache
def decode_step(x_new, cache, Wq, Wk, Wv):
    q = x_new @ Wq                       # query for the new token only
    k = x_new @ Wk
    v = x_new @ Wv
    cache["K"] = torch.cat([cache["K"], k], dim=0)   # append, never recompute
    cache["V"] = torch.cat([cache["V"], v], dim=0)
    scores = q @ cache["K"].T / math.sqrt(k.size(-1))
    return torch.softmax(scores, dim=-1) @ cache["V"]
```

In Hugging Face Transformers this is handled automatically (`use_cache=True`, `past_key_values`).

## The Memory Cost

Approximate size per sequence:

```
KV bytes = 2 (K and V) x layers x kv_heads x head_dim x seq_len x bytes_per_value
```

Example: a 70B-class model with 80 layers, 8 KV heads (GQA), head_dim 128, FP16 (2 bytes), 128K tokens:

```
2 x 80 x 8 x 128 x 131072 x 2 bytes ≈ 43 GB for ONE sequence
```

This is why long contexts and large batch sizes quickly exhaust GPU memory, and why decode is usually **memory-bandwidth-bound**: each step reads the whole cache.

## Optimisations

| Technique | What it does |
|---|---|
| **Multi-Query / Grouped-Query Attention (MQA/GQA)** | Share K/V across query heads, shrinking the cache 4-8x or more |
| **PagedAttention** (vLLM) | Store the cache in fixed-size blocks like OS virtual memory; avoids fragmentation, enables high batch sizes |
| **KV cache quantisation** | Store K/V in FP8 or INT4 to halve or quarter memory |
| **Prefix caching** | Reuse the cache for shared prompt prefixes across requests |
| **Sliding-window / eviction** | Keep only recent or important tokens for very long sequences |
| **Offloading** | Move cold cache blocks to CPU memory or disk |

## Why It Matters to Engineers

- **Throughput**: more free memory means more concurrent sequences per GPU, lowering cost per token.
- **Latency**: time-to-first-token depends on prefill; caching shared prefixes cuts it.
- **Prompt caching in APIs**: hosted providers reuse the KV cache of repeated prompt prefixes and pass on the savings as discounted cached-input tokens.
- **Capacity planning**: when self-hosting, KV cache size often determines max context and batch size more than model weights do.

## Summary

- The KV cache stores past tokens' Keys and Values so each decode step computes only the new token.
- It turns quadratic recomputation into incremental work, making generation fast.
- Its memory grows linearly with sequence length and batch size, so techniques like **GQA, PagedAttention, quantisation and prefix caching** are central to efficient LLM serving.

The **transformer** is a neural network architecture built from stacked blocks of **self-attention** and **feed-forward layers**. Self-attention lets every token look at every other relevant token in the sequence and decide how much each one matters, which is what allows LLMs to model long-range context.

## High-Level Architecture

The original 2017 transformer had an encoder and a decoder. Most modern LLMs are **decoder-only**:

```
 tokens ──► token embeddings + positional info
              │
     ┌────────▼─────────┐
     │  Transformer     │   x N layers (e.g. 32-120)
     │  block           │
     │  ┌────────────┐  │
     │  │ LayerNorm  │  │
     │  │ Masked     │  │
     │  │ Self-Attn  │──┼── + residual
     │  ├────────────┤  │
     │  │ LayerNorm  │  │
     │  │ Feed-Fwd   │──┼── + residual
     │  └────────────┘  │
     └────────┬─────────┘
              ▼
       linear + softmax ──► next-token probabilities
```

Each block has:

- **Self-attention**: mixes information *between* tokens.
- **Feed-forward network (MLP)**: transforms each token *individually*; stores much of the model's knowledge.
- **Residual connections** and **layer normalisation**: keep training of very deep stacks stable.

## How Self-Attention Works

For each token vector `x`, the model computes three projections:

- **Query (Q)**: what this token is looking for.
- **Key (K)**: what this token offers.
- **Value (V)**: the information it will pass along.

Attention scores are dot products of a query with all keys, scaled and normalised:

```
Attention(Q, K, V) = softmax(Q Kᵀ / √d_k) V
```

Intuition: in "The animal didn't cross the street because **it** was tired", the query for "it" matches strongly with the key for "animal", so the output for "it" pulls in information from "animal".

### Code

```python
import math
import torch

def self_attention(x, Wq, Wk, Wv, causal=True):
    Q, K, V = x @ Wq, x @ Wk, x @ Wv                # (seq, d_k)
    scores = Q @ K.T / math.sqrt(K.size(-1))        # (seq, seq) similarity
    if causal:                                       # decoder: no peeking ahead
        n = scores.size(0)
        mask = torch.triu(torch.ones(n, n, dtype=torch.bool), diagonal=1)
        scores = scores.masked_fill(mask, float("-inf"))
    weights = torch.softmax(scores, dim=-1)          # each row sums to 1
    return weights @ V                               # weighted mix of values
```

### Multi-Head Attention

Instead of one attention operation, the model runs **many heads in parallel**, each with its own Q/K/V projections. Different heads learn different patterns: syntax, coreference, nearby words, code bracket matching. Their outputs are concatenated and projected back.

### Causal Masking

Decoder-only LLMs apply a **causal mask** so token *i* can only attend to tokens *0..i*. This matches the generation task: you cannot look at words you have not written yet.

### Positional Information

Attention by itself ignores order, so position is injected. The original paper used sinusoidal encodings; modern LLMs mostly use **RoPE** (rotary position embeddings), which also helps extend context length.

## Why Transformers Won

| | RNN / LSTM | Transformer |
|---|---|---|
| Training parallelism | Sequential, slow | Fully parallel across positions |
| Long-range dependencies | Fade over distance | Direct connection between any two tokens |
| Scaling | Hard | Scales predictably with data and compute |
| Cost per sequence | O(n) | O(n²) attention |

## Limitations and Modern Tweaks

- **Quadratic cost** in sequence length: addressed by **FlashAttention** (memory-efficient kernels), sliding-window or sparse attention.
- **KV cache memory** at inference: reduced with **grouped-query attention (GQA)** or multi-query attention.
- **Capacity vs compute**: **Mixture-of-Experts** replaces the dense MLP with routed experts so only part of the model runs per token.

## Summary

- A transformer is a stack of blocks combining **self-attention**, **feed-forward layers**, residuals and normalisation.
- Self-attention computes `softmax(QKᵀ/√d)V`, letting each token weigh every other token.
- Multi-head attention, causal masks and positional encodings make it work for language generation.
- Parallelism and scalability are why transformers underpin virtually all modern LLMs.

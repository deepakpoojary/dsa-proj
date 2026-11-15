The **context window** is the maximum number of tokens a model can consider in a single request, including the system prompt, conversation history, retrieved documents, tool definitions **and** the generated output. If you exceed it, the request usually fails with an error, or your framework silently drops content and the model "forgets" it.

## What Counts Toward the Window

```
┌──────────────────── context window (e.g. 200K tokens) ───────────────────┐
│ system prompt │ tool schemas │ chat history │ RAG docs │ user msg │ OUTPUT │
└──────────────────────────────────────────────────────────────────────────┘
```

Everything the model sees and everything it writes must fit. A useful formula:

```
prompt_tokens + max_output_tokens <= context_window
```

## Typical Sizes

Context windows have grown fast. Today you will see roughly:

- **8K-32K** tokens on small or older open models.
- **128K-200K** tokens on many mainstream models.
- **1M+** tokens on some frontier models.

As a reference, 100K tokens is roughly a 300-page book.

## What Happens When You Exceed It

| Situation | Behaviour |
|---|---|
| Raw API call | Request rejected with an error such as "prompt is too long" |
| Output budget too large | Error, or the output is cut off when the limit is hit |
| Chat frameworks / apps | Often **truncate** oldest messages or summarise them silently |
| Self-hosted models | Error, or degraded output if run beyond the trained length |

The practical symptom for users: the assistant "forgets" instructions or facts from early in a long conversation.

## Even Inside the Limit, Quality Can Drop

- **Lost in the middle**: models tend to use information at the start and end of a long prompt better than material buried in the middle.
- **Distraction**: irrelevant content dilutes attention and can reduce accuracy.
- **Cost and latency**: every request re-sends the whole context, and attention cost grows with length.

A bigger window is a capability, not a reason to stuff everything in.

## Strategies to Stay Within It

1. **Trim history**: keep the last N turns plus the system prompt.
2. **Summarise**: compress older turns into a running summary.
3. **RAG**: store documents externally and retrieve only the relevant chunks.
4. **Chunk and map-reduce**: process a long document in parts, then combine results.
5. **Structured memory**: save key facts to a store and re-inject them when needed.
6. **Context editing**: drop stale tool results in agent loops.

```python
def fit_history(messages, count_tokens, budget):
    """Keep system prompt + most recent messages that fit the token budget."""
    system, rest = messages[0], messages[1:]
    kept, used = [], count_tokens(system)
    for msg in reversed(rest):             # newest first
        t = count_tokens(msg)
        if used + t > budget:
            break
        kept.append(msg)
        used += t
    return [system] + list(reversed(kept))

history = fit_history(history, count_tokens, budget=context_window - max_output_tokens)
```

## Common Pitfalls

- Forgetting that tool definitions and images also consume tokens.
- Setting `max_tokens` so high that the prompt no longer fits.
- Assuming the model remembers earlier sessions (it does not; only what is in the window).
- Putting critical instructions in the middle of a huge prompt.

## Summary

- The context window is the token budget for input **plus** output in one request.
- Exceeding it causes errors or silent truncation, so earlier content is lost.
- Long contexts still suffer from cost, latency and "lost in the middle" effects.
- Manage it with trimming, summarisation, RAG and careful prompt ordering.

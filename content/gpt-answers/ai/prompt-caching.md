**Prompt caching** lets an LLM provider or inference server reuse the work it already did on an identical **prompt prefix** from a previous request. Cached tokens skip recomputation, so they are billed at a steep discount and the response starts much faster, especially for long prompts.

## How It Works

When a model processes a prompt (the **prefill** phase), it computes attention Keys and Values for every token: the **KV cache**. Normally that state is discarded after the request. With prompt caching, the provider keeps it for a short time keyed by the exact prefix.

```
Request 1: [ system prompt | tools | 50-page manual ] [ question A ]
            └──────── computed & cached ────────────┘   computed

Request 2: [ system prompt | tools | 50-page manual ] [ question B ]
            └──────── cache HIT: reused ────────────┘   computed
```

Only the new suffix needs prefill, so time-to-first-token and input cost drop.

## Key Rules

- **Exact prefix match**: caching works from the start of the prompt up to the first difference. Any change, even one character or a timestamp at the top, invalidates everything after it.
- **Minimum length**: providers only cache prompts above a threshold (often around 1K tokens).
- **Short TTL**: caches typically live for minutes and are refreshed on each hit; some providers offer longer TTLs for a fee.
- **Automatic vs explicit**: some APIs cache automatically; others require you to mark cache breakpoints.

## Structure Prompts for Cache Hits

Put **stable content first** and **variable content last**:

1. Tool definitions
2. System prompt and instructions
3. Large reference documents / few-shot examples
4. Conversation history
5. The new user message

## Example: Explicit Cache Breakpoint

Some APIs let you mark the end of the cacheable prefix:

```python
response = client.messages.create(
    model=MODEL,
    max_tokens=1024,
    system=[
        {"type": "text", "text": "You answer questions about the attached product manual."},
        {
            "type": "text",
            "text": product_manual_text,                 # ~40K tokens, same every call
            "cache_control": {"type": "ephemeral"},      # cache everything up to here
        },
    ],
    messages=[{"role": "user", "content": user_question}],   # changes every call
)

usage = response.usage
print(usage.cache_creation_input_tokens, usage.cache_read_input_tokens)
```

The first call writes the cache (sometimes at a small premium); later calls within the TTL read it cheaply. Providers with automatic caching report something like a `cached_tokens` field instead.

## Benefits

| Metric | Effect |
|---|---|
| Input cost | Cached tokens commonly discounted by 50-90% |
| Latency | Much lower time-to-first-token for long prompts |
| Throughput | Less GPU compute per request |

Output tokens are not affected; you still pay full price for generation.

## Great Use Cases

- Chatbots with long system prompts or policies.
- Q&A over the same large document or codebase.
- Agents that resend the same tool definitions and growing history each turn.
- Few-shot prompts with many examples.
- Batch jobs applying the same instructions to many inputs.

## Self-Hosted Equivalent

Inference servers such as **vLLM** and SGLang support **automatic prefix caching**, reusing KV blocks across requests that share a prefix, which is especially effective for multi-turn chat and shared system prompts.

## Common Pitfalls

- Putting dynamic values (dates, user names, request ids) at the **top** of the prompt.
- Reordering tools or JSON keys non-deterministically between requests.
- Traffic too sparse to hit the cache before it expires.
- Not monitoring cache-read tokens, so regressions go unnoticed.
- Confusing it with **response caching** (storing whole answers for identical questions), which is a separate application-level technique.

## Summary

- Prompt caching reuses the computed KV state of an identical prompt prefix across requests.
- It cuts input cost and time-to-first-token significantly for long, repeated prompts.
- Order prompts from most stable to most variable and monitor cache-hit metrics to get the benefit.

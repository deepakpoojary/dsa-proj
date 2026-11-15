You reduce latency in an LLM app mainly by **streaming** the response, **generating fewer output tokens**, using **smaller or faster models** where possible, **caching** (both prompt prefixes and full responses), and **parallelising** independent steps instead of chaining them.

## Where the time goes

```text
Total latency = network + queueing
              + prefill (process input tokens)   -> drives time to first token (TTFT)
              + decode  (generate output tokens) -> roughly proportional to output length
              + your own steps (retrieval, tools, guardrails)
```

Output tokens are generated one at a time, so **output length usually dominates** total latency. Input tokens are processed in parallel and are much cheaper in time.

## 1. Stream the response

Streaming does not make generation faster, but it shows the first words after a few hundred milliseconds instead of making the user wait for the whole answer. Perceived latency drops dramatically.

## 2. Generate fewer tokens

- Ask for concise answers in the prompt ("answer in 3 bullet points")
- Set a sensible `max_tokens`
- Use compact output formats (short JSON keys, no repeated input)
- For reasoning models, lower the **reasoning effort** or thinking budget on simple tasks

## 3. Use the right model

- Small/fast models for classification, extraction, routing and simple answers
- Large models only for steps that need them (see model routing)
- Fine-tune a small model if it can match the large model on your task

## 4. Prompt caching

Providers can reuse the processed prefix (KV cache) of a prompt. Keep the **static part first and identical** across requests (system prompt, tool definitions, long documents) and put the variable part at the end. This cuts TTFT and cost for long prompts.

## 5. Parallelise

Run independent work concurrently instead of sequentially:

```python
import asyncio

async def handle(query):
    # Retrieval, intent classification and a safety check do not depend on each other
    docs, intent, safe = await asyncio.gather(
        retrieve(query),
        classify_intent(query),       # small, fast model
        moderation_check(query),
    )
    if not safe:
        return refusal()
    return await generate_answer(query, docs, intent)  # streamed to the client
```

Also reduce the number of **sequential LLM calls** in agent loops: combine steps, allow parallel tool calls, and avoid unnecessary "planning" calls.

## 6. Cache full responses

- **Exact cache**: same normalised input returns a stored answer
- **Semantic cache**: embed the query and reuse an answer for very similar questions (use a strict similarity threshold to avoid wrong answers)

## 7. Optimise the pipeline around the model

- Retrieve fewer, better chunks (a reranker plus small top-k means a shorter prompt)
- Keep HTTP connections warm and reuse clients
- Deploy in a region close to users and the model provider
- Run guardrails in parallel with generation where safe

## 8. If you self-host

- Use an optimised server (vLLM, SGLang, TensorRT-LLM) with continuous batching
- **Quantisation** (FP8, INT4) for faster, smaller models
- **Speculative decoding**: a small draft model proposes tokens and the large model verifies them in one pass
- Balance batch size: larger batches raise throughput but can increase per-request latency

## Quick reference

| Technique | Improves | Effort |
|---|---|---|
| Streaming | Perceived latency (TTFT) | Low |
| Shorter outputs | Total latency and cost | Low |
| Smaller model / routing | Total latency and cost | Medium |
| Prompt caching | TTFT on long prompts | Low |
| Parallel calls | End-to-end latency | Medium |
| Response caching | Repeated queries | Medium |
| Speculative decoding, quantisation | Self-hosted throughput and latency | High |

## Summary

- Stream for perceived speed, and cut output tokens since they dominate generation time.
- Route easy work to smaller models, use prompt and response caching, and parallelise independent steps.
- Measure TTFT and p95 latency per step to know what to optimise first.

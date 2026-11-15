You handle rate limits, timeouts and retries by **retrying only transient errors** with **exponential backoff and jitter** (respecting `retry-after`), setting **timeouts** on every call, **throttling** your own traffic to stay under limits, and having **fallbacks** when retries are exhausted.

## Understand the limits

LLM providers enforce limits such as:

- **RPM**: requests per minute
- **TPM**: tokens per minute (input + output)
- **Concurrency** or daily quotas on some tiers

Exceeding them returns **HTTP 429 Too Many Requests**. Overloaded providers may return **503** or a provider-specific overload code (e.g. 529). Responses often include headers like `retry-after` and remaining-quota headers.

## Which errors to retry

| Error | Retry? | Why |
|---|---|---|
| 429 rate limit | Yes, with backoff | Temporary quota exhaustion |
| 500, 502, 503, overload | Yes, with backoff | Transient server problems |
| Network error / timeout | Yes, limited | Usually transient |
| 400 bad request | No | Your request is invalid; fix it |
| 401 / 403 | No | Auth or permission problem |
| Context length exceeded | No | Truncate or summarise the input |

## Exponential backoff with jitter

Wait longer after each failure, and add randomness so many clients don't retry in sync (the "thundering herd").

```python
import random, time

RETRYABLE = {429, 500, 502, 503, 504, 529}

def call_with_retry(fn, max_attempts=5, base=0.5, cap=30.0):
    for attempt in range(max_attempts):
        try:
            return fn()
        except APIError as e:
            if e.status not in RETRYABLE or attempt == max_attempts - 1:
                raise
            # Prefer the server's hint when it is provided
            retry_after = e.headers.get("retry-after")
            if retry_after:
                delay = float(retry_after)
            else:
                delay = min(cap, base * 2 ** attempt)
                delay = random.uniform(0, delay)   # "full jitter"
            time.sleep(delay)
```

Most official SDKs already retry 429 and 5xx a couple of times; configure `max_retries` and `timeout` rather than stacking your own retries on top blindly.

## Timeouts

- Set a timeout on **every** LLM call; never wait forever
- Size it to the expected output length (long generations need longer timeouts)
- Use **streaming** so you can detect a stalled stream (no tokens for N seconds) separately from a slow but healthy response
- Set an overall **deadline** for the user request so retries don't exceed what the user will tolerate

## Stay under the limits proactively

- **Client-side rate limiting**: a token bucket that tracks both requests and estimated tokens
- **Queues**: put background jobs (batch summarisation, embeddings) on a queue with controlled concurrency
- **Prioritisation**: interactive user traffic first, background jobs later
- **Batch API** for offline work, which has separate, larger quotas
- Request higher limits or spread load across projects, regions or deployments when needed

## Fallbacks when retries fail

- Switch to a **secondary model or provider** (keep prompts portable and evaluated on both)
- Return a **cached** or simplified answer
- Degrade gracefully: "We're experiencing high demand, please try again"
- Use a **circuit breaker** to stop hammering a failing provider for a short period

## Idempotency for agents

If an LLM call triggers side effects (sending email, issuing a refund), a retry might repeat the action. Use **idempotency keys** and make tool execution safe to repeat.

## Monitor

Track 429 rate, retry counts, timeout rate, latency including retries, and fallback usage. Rising 429s are an early signal to raise limits or add throttling.

## Summary

- Retry only 429, 5xx and network errors, using exponential backoff with jitter and honouring `retry-after`.
- Put timeouts and an overall deadline on every call, and throttle or queue traffic to stay under RPM/TPM limits.
- Add fallbacks, circuit breakers and idempotent side effects, and monitor retry and 429 rates.

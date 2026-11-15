In an LLM application you should log a full **trace** of every request (prompt version, inputs, retrieved context, tool calls, model outputs and parameters) and monitor **latency, token usage, cost, errors** and **quality signals** such as user feedback and online eval scores, while redacting sensitive data.

## Why LLM observability is different

Traditional monitoring tells you if a request **failed**. LLM apps usually fail **silently**: the request returns 200, but the answer is wrong, hallucinated or off-tone. You need enough data to replay and judge what the model saw and said.

## What to log (per request trace)

- **Request metadata**: request ID, user/session ID (pseudonymised), feature, timestamp
- **Prompt**: template ID and **version**, rendered system and user messages
- **Model config**: model name and version, temperature, max tokens, tools enabled
- **Retrieval**: query, retrieved chunk IDs, scores, reranker output
- **Tool calls**: tool name, arguments, results, duration, errors
- **Output**: final response, finish reason (stop, length, tool call, content filter)
- **Usage**: input, output and cached tokens, cost
- **Timing**: per-step durations, time to first token, total latency
- **Guardrails**: which checks ran and whether they triggered

Structure it as a **trace with spans** for each step:

```text
trace: chat_request (2.4s, $0.0031)
 ├─ span: query_rewrite   (model-small, 180ms)
 ├─ span: retrieval       (hybrid, 95ms, 8 chunks)
 ├─ span: rerank          (60ms, top 3)
 ├─ span: llm_generate    (model-large, TTFT 450ms, 1.9s, 1,820 in / 240 out tokens)
 └─ span: output_guard    (40ms, passed)
```

```python
from opentelemetry import trace

tracer = trace.get_tracer("chat-app")

def answer(query, user_id):
    with tracer.start_as_current_span("chat_request") as span:
        span.set_attribute("prompt.version", "support_v13")
        with tracer.start_as_current_span("retrieval") as r:
            docs = retrieve(query)
            r.set_attribute("retrieval.doc_ids", [d.id for d in docs])
        with tracer.start_as_current_span("llm_generate") as g:
            resp = llm(query, docs)
            g.set_attribute("llm.model", resp.model)
            g.set_attribute("llm.tokens.input", resp.usage.input_tokens)
            g.set_attribute("llm.tokens.output", resp.usage.output_tokens)
        return resp.text
```

Tools such as Langfuse, LangSmith, Arize Phoenix, Helicone or general APM tools with OpenTelemetry GenAI conventions provide this out of the box.

## What to monitor (dashboards and alerts)

| Area | Metrics |
|---|---|
| Performance | TTFT, total latency p50/p95/p99, latency per step |
| Reliability | Error rate, 429s, timeouts, retries, fallback usage |
| Cost | Tokens in/out, cost per request, per feature, per customer; cache hit rate |
| Quality | Thumbs up/down, regenerations, edits, escalations to humans, online eval scores |
| Safety | Guardrail trigger rate, refusals, prompt-injection detections, PII detections |
| Retrieval | Empty-result rate, average relevance score, "I don't know" rate |
| Agents | Steps per task, tool error rate, task completion rate, loops |

## Online evaluation

- Run **LLM-as-a-judge** or heuristic checks on a **sample** of production traces (e.g. faithfulness, relevance)
- Track scores over time to detect **drift** after model, prompt or data changes
- Route low-scoring or negatively-rated traces to a **human review queue**
- Add confirmed failures to your offline eval dataset

## Privacy and security

- **Redact PII and secrets** before storing prompts and outputs
- Restrict access to logs that contain user content
- Set **retention** limits and support deletion requests
- Pseudonymise user identifiers

## Alerts worth having

- Cost per hour above budget
- p95 latency or error rate spike
- Sudden increase in negative feedback or guardrail triggers
- Provider outage or elevated 429s

## Summary

- Log a full trace per request: prompt version, context, tool calls, output, model parameters, tokens and timings.
- Monitor latency, errors, cost and quality signals, and run online evals on sampled traffic to catch silent failures.
- Redact sensitive data and feed production failures back into your eval set.

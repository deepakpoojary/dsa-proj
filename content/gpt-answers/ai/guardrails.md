**Guardrails** are checks and constraints placed around an LLM that keep its inputs, outputs and actions **safe, on-topic, correctly formatted and within policy**. You implement them as layered validators (classifiers, rules, schema checks and moderation models) that run before and after the model call, plus permission limits on what an agent can do.

## Why you need them

The model itself is probabilistic and can be manipulated. Guardrails turn "the prompt asks it nicely" into **enforced rules**, protecting against:

- Prompt injection and jailbreaks
- Harmful or toxic content
- Leaking PII, secrets or the system prompt
- Hallucinated or off-policy answers
- Malformed output that breaks downstream code
- Dangerous agent actions

## Where guardrails sit

```text
User input
   │
   ▼
[Input guardrails]  -> injection/jailbreak detection, topic check, PII redaction, length limit
   │
   ▼
   LLM  <-->  [Action guardrails] -> tool allow-list, permissions, human approval
   │
   ▼
[Output guardrails] -> moderation, PII/secret scan, groundedness, schema validation
   │
   ▼
User / downstream system
```

## Types of guardrails

### Input

- **Prompt-injection / jailbreak detection** with a classifier or small model
- **Topic or scope check**: is this request in-domain?
- **PII redaction** before sending data to a third-party model
- **Size limits** to prevent abuse and cost spikes

### Output

- **Content moderation**: hate, violence, self-harm, sexual content
- **Data leakage**: PII, API keys, system prompt contents
- **Groundedness**: claims supported by retrieved sources (for RAG)
- **Format validation**: valid JSON matching a schema
- **Business rules**: no medical/legal advice, no promises about refunds, competitor mentions

### Actions (agents)

- **Least privilege**: only the tools and scopes needed
- **Allow-lists and argument validation** (e.g. refund amount below a cap)
- **Human-in-the-loop** approval for irreversible or high-value actions
- **Sandboxing** for code execution

## Example: schema plus moderation

```python
from pydantic import BaseModel, Field, ValidationError

class SupportReply(BaseModel):
    intent: str = Field(pattern="^(refund|shipping|account|other)$")
    reply: str = Field(max_length=1200)
    escalate: bool

def guarded_reply(user_msg: str) -> SupportReply:
    if injection_classifier(user_msg) > 0.9:
        return SupportReply(intent="other", reply="Sorry, I can't help with that.", escalate=False)

    clean_msg = redact_pii(user_msg)

    for attempt in range(2):
        raw = llm(clean_msg, response_format="json")
        try:
            out = SupportReply.model_validate_json(raw)
        except ValidationError as e:
            clean_msg += f"\n\nYour previous output was invalid: {e}. Return valid JSON."
            continue
        if moderation(out.reply).flagged or contains_secret(out.reply):
            break
        return out

    # Safe fallback when checks keep failing
    return SupportReply(intent="other", reply="Let me connect you with a human agent.", escalate=True)
```

## Implementation options

- **Rules and regex**: fast, cheap, good for secrets and simple patterns
- **Moderation APIs** offered by model providers
- **Small classifier models** (e.g. Llama Guard style safety models, injection detectors)
- **Structured outputs** or constrained decoding to guarantee schema-valid JSON
- **Frameworks**: Guardrails AI, NeMo Guardrails and similar libraries that compose validators

## What to do when a guardrail fires

| Response | When |
|---|---|
| Block with a safe message | Clearly harmful or out-of-scope input |
| Retry with feedback | Format or schema errors |
| Fall back to a safe template | Uncertain or ungrounded answers |
| Escalate to a human | High-stakes or ambiguous cases |
| Log and alert | Every trigger, for review and tuning |

## Trade-offs and pitfalls

- **Latency**: each check adds time; run independent checks in parallel and use small models
- **False positives** frustrate legitimate users; evaluate guardrails on labelled data
- **Streaming** makes output checks harder; check chunks or buffer sensitive content
- Guardrails are **defence in depth**, not a guarantee; prompt injection in particular cannot be fully solved by filters, so limit what the model can do

## Summary

- Guardrails are enforced checks on inputs, outputs and agent actions that keep an LLM app safe and reliable.
- Implement them with rules, moderation models, classifiers, schema validation and least-privilege tool design.
- Decide how to handle failures (block, retry, fall back, escalate) and evaluate guardrails for latency and false positives.

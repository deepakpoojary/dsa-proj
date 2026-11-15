The most reliable way is to use the provider's **native structured-output feature** (JSON-schema mode or constrained decoding), which guarantees the response matches your schema, and then still **validate** it in code. If that is not available, combine tool/function calling or careful prompting with schema validation and automatic retries.

## Levels of Reliability

| Approach | Guarantees valid JSON? | Guarantees schema? |
|---|---|---|
| Prompt only ("respond in JSON") | No | No |
| JSON mode | Yes (syntax) | No |
| Tool / function calling with schema | Usually | Mostly |
| **Structured outputs / constrained decoding** | **Yes** | **Yes** |

Constrained decoding works by masking out any token that would break the grammar of your schema at each generation step, so invalid output is impossible.

## Option 1: Native Structured Outputs

Define the schema once (Pydantic in Python, Zod in TypeScript) and pass it to the SDK:

```python
from pydantic import BaseModel, Field
from typing import Literal
from openai import OpenAI

class Ticket(BaseModel):
    category: Literal["billing", "shipping", "account", "other"]
    urgent: bool
    summary: str = Field(description="One sentence summary of the issue")

client = OpenAI()
resp = client.responses.parse(
    model="gpt-4.1-mini",
    input=[
        {"role": "system", "content": "Classify the support email."},
        {"role": "user", "content": "I was charged twice and need it fixed today!"},
    ],
    text_format=Ticket,
)
ticket: Ticket = resp.output_parsed
print(ticket.category, ticket.urgent)   # billing True
```

Other major providers offer equivalent features (JSON-schema response formats or strict tool schemas).

```ts
import { z } from "zod";

const Ticket = z.object({
  category: z.enum(["billing", "shipping", "account", "other"]),
  urgent: z.boolean(),
  summary: z.string(),
});
// Pass the schema to your SDK's structured-output option, then:
const parsed = Ticket.parse(JSON.parse(rawText)); // throws if invalid
```

## Option 2: Tool / Function Calling

Describe a "tool" whose arguments are the fields you want. The model returns arguments as JSON that matches the schema. This is common in agent frameworks and works across many providers.

## Option 3: Prompt + Validate + Retry

When nothing else is available:

```python
import json
from pydantic import ValidationError

def extract(llm, text, max_retries=2):
    prompt = f"""Return ONLY a JSON object matching:
{{"category": "billing|shipping|account|other", "urgent": true|false, "summary": string}}

<email>{text}</email>"""
    for _ in range(max_retries + 1):
        raw = llm(prompt, temperature=0)
        try:
            return Ticket.model_validate_json(raw)
        except ValidationError as e:
            prompt += f"\n\nYour last output was invalid: {e}. Return corrected JSON only."
    raise RuntimeError("Could not get valid JSON")
```

## Self-Hosted Models

Use grammar-constrained generation libraries and servers: **Outlines**, **XGrammar**, **llama.cpp grammars**, or guided decoding in **vLLM** / SGLang.

## Schema Design Tips

- Use **enums** for categorical fields instead of free text.
- Keep schemas **flat and small**; deep nesting increases errors.
- Add **descriptions** to fields; the model reads them.
- Allow `null` or an `"unknown"` value so the model does not invent data.
- Put a `reasoning` field **before** the answer field if you want the model to think first.
- Keep **temperature low** for extraction.

## Common Pitfalls

- Trusting "valid JSON" as "correct data": the schema can be satisfied with wrong values, so still evaluate accuracy.
- Responses cut off by `max_tokens`, producing truncated JSON; check the stop reason.
- Parsing JSON wrapped in Markdown code fences when using prompt-only methods.
- Schema features not supported by a provider's strict mode (some keywords are ignored or rejected).

## Summary

- Prefer native **structured outputs / constrained decoding** for schema-guaranteed JSON.
- Fall back to tool calling, then to prompt + validation + retry.
- Always validate with Pydantic or Zod, design simple schemas with enums and nullables, and evaluate the values, not just the format.

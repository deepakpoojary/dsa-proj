A **system prompt** is a developer-defined instruction that sets the model's role, rules, tone and capabilities for an entire conversation. A **user message** is an individual turn from the end user. The key differences are **who writes it, how long it applies, and how much priority the model gives it**.

## Roles in a Chat Request

Most chat APIs structure a conversation as a list of role-tagged messages:

```python
response = client.chat.completions.create(
    model=MODEL,
    messages=[
        {"role": "system", "content": (
            "You are a support assistant for Acme Bank. "
            "Answer only questions about Acme products. "
            "Never give investment advice. Reply in under 120 words."
        )},
        {"role": "user", "content": "How do I freeze my debit card?"},
        {"role": "assistant", "content": "Open the app, go to Cards, then tap Freeze."},
        {"role": "user", "content": "And unfreeze it?"},
    ],
)
```

Some APIs take the system prompt as a separate top-level parameter rather than a message, but the concept is the same. Some platforms also use a "developer" role for the same purpose.

## System Prompt vs User Message

| Aspect | System prompt | User message |
|---|---|---|
| Written by | Developer / operator | End user (or your app on their behalf) |
| Scope | Whole conversation | That turn |
| Typical content | Role, rules, tone, format, tool usage policy, background | Questions, tasks, data |
| Priority | Higher: models are trained to follow it over conflicting user instructions | Lower |
| Visibility | Usually hidden from end users | Visible |
| Changes | Rarely, versioned like code | Every turn |

## What to Put in a System Prompt

- **Role and audience**: "You are a senior Python reviewer helping junior developers."
- **Behaviour rules**: scope limits, escalation paths, refusal guidance.
- **Style**: tone, length, language, formatting conventions.
- **Tool guidance**: when to call which tool and how to handle errors.
- **Stable context**: product facts, policies, glossary.
- **Output format**: e.g. always Markdown, or JSON for certain request types.

Keep **per-request data** (the document to summarise, the user's question) in the user turn.

## Why the Separation Matters

1. **Instruction hierarchy**: models are trained to prioritise system instructions, so users cannot easily override your rules with "ignore the above".
2. **Consistency**: behaviour stays stable across many turns.
3. **Maintainability**: one place to update behaviour, version and test.
4. **Efficiency**: a fixed system prompt is an ideal **prompt-caching** prefix, reducing cost and latency.

## It Is Not a Security Boundary

Even with higher priority, system prompts can sometimes be leaked or circumvented through **prompt injection** or clever jailbreaks. Therefore:

- **Never put secrets** (API keys, passwords, internal URLs) in a system prompt.
- Enforce permissions and business rules **in code**, not just in instructions.
- Assume users may eventually see the system prompt.

## Writing Tips

- Be specific and explain the *why* behind important rules.
- Prefer positive instructions ("Answer in British English") over long lists of prohibitions.
- Avoid contradictions between the system prompt and later user instructions your app injects.
- Test with an eval set, including adversarial inputs that try to override rules.

## Summary

- The system prompt is the developer's persistent, high-priority instruction layer; user messages are per-turn inputs.
- Put stable role, rules and format in the system prompt and variable data in user messages.
- Treat it as configuration, not security: keep secrets out and enforce critical rules in code.

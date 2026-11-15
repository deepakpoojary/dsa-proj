**Function calling** (also called **tool use**) is an LLM capability where, instead of only replying with text, the model returns a **structured request** to call a function you defined, with a tool name and JSON arguments. Your application runs the function and sends the result back, so the model can use real data or take actions it could not do on its own.

## Why it matters

LLMs on their own cannot:
- access **live or private data** (weather, your database, a user's orders)
- reliably **calculate** or run code
- **take actions** (send email, create tickets, book meetings)

Tool use connects the model's reasoning to your code and APIs. It is the foundation of **AI agents**.

## How it works

```
1. You send:   user message + list of tool definitions (name, description, JSON Schema)
2. Model:      decides a tool is needed → returns tool_call { name, arguments }
3. Your app:   validates args, executes the function
4. You send:   tool result back to the model
5. Model:      uses the result to answer, or calls another tool
```

The key point: **the model never executes anything itself**. It only *proposes* calls. Your code decides whether and how to run them, which keeps you in control of security and side effects.

## Example (provider-agnostic Python)

```python
import json

# 1. Describe the tool with a JSON Schema
tools = [{
    "name": "get_order_status",
    "description": "Look up the shipping status of a customer's order by order ID.",
    "input_schema": {
        "type": "object",
        "properties": {
            "order_id": {"type": "string", "description": "e.g. ORD-12345"}
        },
        "required": ["order_id"],
    },
}]

# 2. Your real implementation
def get_order_status(order_id: str) -> dict:
    return {"order_id": order_id, "status": "shipped", "eta": "2026-11-18"}

TOOLS = {"get_order_status": get_order_status}

messages = [{"role": "user", "content": "Where is my order ORD-12345?"}]

# 3. The loop: call the model until it stops requesting tools
for _ in range(5):                                  # safety limit
    response = llm.chat(messages=messages, tools=tools)
    messages.append(response.message)

    if not response.tool_calls:
        print(response.text)                        # final answer
        break

    for call in response.tool_calls:
        try:
            result = TOOLS[call.name](**call.arguments)
        except Exception as e:
            result = {"error": str(e)}              # let the model recover
        messages.append({
            "role": "tool",
            "tool_call_id": call.id,
            "content": json.dumps(result),
        })
```

The model would answer something like: *"Your order ORD-12345 has shipped and should arrive by November 18."*

The exact message format differs slightly between providers (OpenAI, Anthropic, Gemini), but the pattern is the same.

## Useful features

- **Parallel tool calls**: the model requests several independent calls in one turn.
- **Tool choice control**: `auto` (model decides), `required`/`any` (must call a tool), or force a specific tool.
- **Structured output**: forcing a single "tool" with a schema is a reliable way to get valid JSON.
- **Strict schema mode**: some APIs guarantee that arguments match your schema exactly.

## Best practices

- **Write descriptions for the model**: say what the tool does, when to use it, and what each parameter means.
- **Keep the toolset small and distinct**: overlapping tools confuse the model.
- **Validate arguments** before execution; never trust them blindly.
- **Return useful errors** so the model can retry or correct itself.
- **Keep results concise**: large outputs eat context.
- **Guard side effects**: require confirmation for destructive actions and enforce permissions in code.
- **Limit iterations** to prevent infinite loops.

## Common pitfalls

| Pitfall | Fix |
|---|---|
| Model calls the wrong tool | Clearer names and descriptions, fewer tools |
| Invalid or missing args | JSON Schema with `required`, strict mode, validation |
| Hallucinated values (e.g. a made-up ID) | Tell the model to ask the user when information is missing |
| Huge tool outputs | Paginate, summarise or truncate |
| Prompt injection through tool results | Treat tool output as untrusted data |

## Summary

- Function calling lets an LLM request structured calls to your functions; your app executes them and returns the results.
- It gives models live data and the ability to act, and it is the building block of agents.
- You control execution, so validate inputs, handle errors, and guard risky actions.

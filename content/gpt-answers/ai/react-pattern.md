**ReAct** (short for **Reason + Act**) is an agent pattern where the LLM alternates between **thinking about the problem** and **taking actions with tools**, using each tool result to inform its next thought. The cycle is **Thought → Action → Observation**, repeated until the model can give a final answer.

It was introduced in the 2022 paper *"ReAct: Synergizing Reasoning and Acting in Language Models"* (Yao et al.) and became the basis for most modern tool-using agents.

## The loop

```
Question
   │
   ▼
Thought:      What do I know? What do I need next?
Action:       call a tool (search, calculator, API...)
Observation:  tool result is appended to the context
   │
   └── repeat until ──► Final Answer
```

## Example trace

**Question:** *"What is the population of the capital of the country that hosted the 2016 Summer Olympics?"*

```
Thought: I need the country that hosted the 2016 Summer Olympics.
Action: search("2016 Summer Olympics host")
Observation: The 2016 Summer Olympics were held in Rio de Janeiro, Brazil.

Thought: The country is Brazil. Its capital is Brasília. I need its population.
Action: search("Brasília population")
Observation: Brasília has a population of about 2.8 million (city proper).

Thought: I have enough information to answer.
Final Answer: Brasília, Brazil's capital, has about 2.8 million people.
```

Each **observation grounds** the next reasoning step in real data instead of the model's memory.

## Why it works better

| Approach | Problem |
|---|---|
| Reasoning only (chain-of-thought) | Can reason well but **hallucinates facts**; no way to check |
| Acting only (tools, no reasoning) | Calls tools without a plan; poor at multi-step tasks |
| **ReAct** | Reasoning decides *which* action; observations correct the reasoning |

Benefits:
- **Grounded answers** from real tool outputs
- **Error recovery**: if a search returns nothing, the model can rethink and try another query
- **Interpretability**: the thought trace shows *why* each action was taken

## Implementation: then and now

**Original style:** the prompt asks the model to output literal `Thought:` / `Action:` text, which your code parses with regex.

**Modern style:** you use the API's native **tool calling**. The model's reasoning happens in its normal text or internal reasoning, and actions come back as structured tool calls. The loop is the same, it is just more robust.

```python
def react_agent(question, llm, tools, max_steps=8):
    messages = [
        {"role": "system", "content": "Think step by step. Use tools when you need facts. "
                                      "When you have enough information, answer directly."},
        {"role": "user", "content": question},
    ]
    for _ in range(max_steps):
        reply = llm.chat(messages, tools=tools)          # Thought (+ maybe Action)
        messages.append(reply.message)
        if not reply.tool_calls:
            return reply.text                            # Final Answer
        for call in reply.tool_calls:
            observation = tools.run(call.name, call.arguments)   # Action
            messages.append({"role": "tool", "tool_call_id": call.id,
                             "content": str(observation)})       # Observation
    return "Could not finish within the step limit."
```

Frameworks such as LangGraph, LlamaIndex and the provider agent SDKs ship ReAct-style agents out of the box.

## Limitations and fixes

- **Loops and repetition**: the model keeps calling the same tool. Fix with a max-steps limit and duplicate-call detection.
- **Context growth**: every observation is appended. Fix by truncating or summarising tool outputs and compacting history.
- **Latency and cost**: one LLM call per step. Use parallel tool calls and smaller models for simple steps.
- **Poor planning on long tasks**: add an explicit planning step (plan-and-execute) or sub-agents.
- **Untrusted observations**: tool results can contain prompt injections, so treat them as data.

## Summary

- ReAct interleaves **reasoning** and **acting**: Thought → Action → Observation, repeated.
- Tool observations ground the model's reasoning, which reduces hallucinations and enables multi-step problem solving.
- Today it is implemented with native tool calling, plus step limits and context management.

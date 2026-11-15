A **workflow** runs LLM calls and tools along a **predefined path that your code controls**; an **agent** lets the **LLM decide the path itself**, choosing which tools to call and when to stop. You need an autonomous agent only when the steps **cannot be known in advance** and vary a lot from task to task. Otherwise, a workflow is cheaper, faster, more predictable and easier to test.

## The difference

```
Workflow (code decides the path):
  input ─► classify ─► retrieve docs ─► draft answer ─► check policy ─► output

Agent (LLM decides the path):
  goal ─► [LLM: what next?] ─► tool ─► observe ─► [LLM: what next?] ─► ... ─► done
```

| Aspect | Workflow | Agent |
|---|---|---|
| Control flow | Fixed in code | Chosen by the model at runtime |
| Predictability | High | Lower |
| Cost and latency | Lower, bounded | Higher, variable |
| Testing and debugging | Easy, step by step | Harder, behaviour varies |
| Handles novel situations | Poorly | Well |
| Failure mode | Breaks on unexpected input | Wanders, loops, takes wrong actions |

## Common workflow patterns

These cover most real-world LLM applications:

1. **Prompt chaining**: step A's output feeds step B (outline → draft → polish).
2. **Routing**: classify the input and send it to a specialised prompt or model (billing vs technical support).
3. **Parallelisation**: run independent calls at once (check several guardrails, or vote across multiple answers).
4. **Orchestrator-workers**: an LLM splits a task into subtasks for workers, but within a bounded structure.
5. **Evaluator-optimizer**: one call generates and another critiques, iterating a fixed number of times.

```python
# A routing + chaining workflow: predictable and easy to test
def handle_ticket(ticket: str) -> str:
    category = llm(f"Classify as BILLING, TECH or OTHER:\n{ticket}").strip()

    if category == "BILLING":
        context = billing_db.lookup(extract_customer_id(ticket))
        draft = llm(f"Answer this billing question using:\n{context}\n\n{ticket}")
    elif category == "TECH":
        docs = search_docs(ticket, k=5)
        draft = llm(f"Answer using these docs:\n{docs}\n\n{ticket}")
    else:
        return route_to_human(ticket)

    return draft if passes_policy_check(draft) else route_to_human(ticket)
```

## When you need an agent

Choose an agent when **all** of these hold:

- **Open-ended problems**: the number and order of steps depend on what is discovered along the way (debugging, research, data exploration).
- **Rich feedback** is available: tests, tool results or search results tell the agent whether it is making progress.
- **Errors are recoverable or gated**: actions can be undone, sandboxed, or approved by a human.
- **The value justifies the cost**: the task is worth extra tokens and latency.

Typical agent use cases:
- **Coding**: "fix this failing test" (files and steps unknown up front)
- **Deep research**: follow leads across many sources
- **IT or ops troubleshooting**: investigate logs, form hypotheses, test them
- **Computer or browser use**: navigate unfamiliar interfaces

## When a workflow is better

- The process is **well understood** (document extraction, ticket triage, report generation).
- You need **compliance, auditability or strict SLAs**.
- **Latency or cost** budgets are tight.
- Mistakes are **expensive and irreversible**.

## A practical progression

```
1. Single LLM call (+ retrieval, + good prompt)     ← try this first
2. Workflow (chaining, routing, parallel steps)     ← most production apps live here
3. Agent with limited tools and guardrails          ← only when needed
4. Multi-agent system                               ← rarely, for parallel breadth
```

Move up a level only when **evals show** the simpler approach cannot reach the required quality.

## Hybrid designs are common

Many real systems mix both: a **workflow skeleton** with an **agentic step inside** (for example, a fixed pipeline where one stage is a bounded research agent), or an **agent that calls deterministic workflows as tools**. This keeps most of the system predictable while allowing flexibility where it matters.

## Summary

- Workflows follow code-defined paths and are predictable, cheap and testable; agents let the LLM choose the path dynamically.
- Use an agent only for open-ended tasks with good feedback signals and recoverable errors.
- Start with the simplest solution, and add autonomy step by step when evals justify it.

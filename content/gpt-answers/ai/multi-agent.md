Use a **multi-agent system** when a task naturally splits into **independent subtasks that can run in parallel**, when the total context is **too large for one model's window**, or when different parts need **different tools, permissions or expertise**. For most problems, a single well-equipped agent is simpler, cheaper and easier to debug, so treat multi-agent as an optimisation you justify with evals.

## What it is

A multi-agent system has several LLM-driven agents, each with its own **prompt, tools and context window**, that coordinate to complete a task. The most common shape is an **orchestrator** (lead agent) that delegates to **worker sub-agents**:

```
                ┌──────────────────┐
     Task ────► │   Orchestrator   │ ──► final answer
                └──┬─────┬──────┬──┘
          subtask  │     │      │  subtask
                   ▼     ▼      ▼
              ┌──────┐┌──────┐┌──────┐
              │Worker││Worker││Worker│   (run in parallel,
              │  A   ││  B   ││  C   │    separate contexts)
              └──────┘└──────┘└──────┘
                   └─────┴──────┴──► condensed results back to orchestrator
```

## When it makes sense

### 1. Parallelisable, breadth-first work
*"Compare the pricing, security posture and API features of 8 vendors."* Each sub-agent researches one vendor at the same time, which cuts wall-clock time sharply.

### 2. Context isolation
Each worker can read a large amount of material (dozens of pages, a big code area) and return a **short summary**. The orchestrator's context stays clean instead of filling with raw data.

### 3. Specialisation and least privilege
- A "SQL analyst" agent with read-only database access
- A "browser" agent with web access but no internal data
- A "writer" agent with no tools at all

Separating them limits the damage if one is compromised, for example through prompt injection from a web page.

### 4. Checks and balances
A **generator plus critic/reviewer** pair, where one agent drafts and another evaluates against criteria. This often improves quality on code, writing or plans.

## Common patterns

| Pattern | How it works | Good for |
|---|---|---|
| Orchestrator-workers | Lead agent splits work and merges results | Research, large analyses |
| Pipeline / hand-off | Agent A → Agent B → Agent C | Staged processes, triage then specialist |
| Evaluator-optimizer | Generator and critic iterate | Quality-sensitive outputs |
| Debate / voting | Several agents answer, then compare or vote | Hard reasoning, reducing errors |
| Hierarchical | Managers of managers | Very large tasks (rarely needed) |

## Example: orchestrator with parallel workers

```python
import asyncio

async def research_worker(topic: str) -> str:
    # Each worker has its own context and tools (e.g. web search)
    return await run_agent(
        goal=f"Research {topic}. Return a 200-word summary with sources.",
        tools=[web_search, fetch_page],
    )

async def orchestrator(question: str) -> str:
    plan = await llm(f"Split into 3-6 independent research subtopics, one per line:\n{question}")
    subtopics = [s for s in plan.splitlines() if s.strip()]

    summaries = await asyncio.gather(*(research_worker(t) for t in subtopics))

    return await llm(f"Question: {question}\n\nFindings:\n" + "\n\n".join(summaries)
                     + "\n\nWrite a final answer citing sources.")
```

## When NOT to use it

- **Tightly coupled tasks**: if every step depends on the previous one (for example most coding edits), splitting adds hand-off overhead and loses context.
- **Simple tasks**: one agent with good tools will do.
- **Tight budgets**: multi-agent runs can use several times more tokens than a single agent.
- **Low-latency needs**: coordination adds round trips.

## Challenges

- **Information loss at hand-offs**: workers need precise instructions and output formats.
- **Duplicate or conflicting work**: define clear boundaries for each subtask.
- **Debugging**: you need tracing across agents to see who did what.
- **Error propagation**: a bad worker summary can mislead the orchestrator.
- **Cost control**: cap the number of workers, steps and tokens.

## Decision checklist

1. Can a single agent with better tools or prompts solve it? Try that first.
2. Are the subtasks **genuinely independent**?
3. Does parallelism or context isolation give a **measurable** gain in quality or speed?
4. Is the extra token cost acceptable?

## Summary

- Use multi-agent systems for parallel, separable work, context isolation, specialised permissions, or generator-critic loops.
- Avoid them for tightly coupled or simple tasks; they cost more tokens and are harder to debug.
- Default to one agent, and add more only when evals prove the benefit.

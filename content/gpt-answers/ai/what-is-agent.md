An **AI agent** is a system where an LLM works **autonomously in a loop**: it decides what to do next, uses tools to act on its environment, observes the results, and keeps going until it reaches a goal. A **chatbot** mostly maps one user message to one reply; an agent plans and executes **multi-step tasks** with little or no human guidance between steps.

## Core components

```
           ┌──────────────────────────────┐
  Goal ──► │            LLM               │ ◄── memory / state
           │  (reason, plan, decide)      │
           └──────────┬───────────────────┘
                      │ tool calls
                      ▼
           ┌──────────────────────────────┐
           │ Tools: search, code, APIs,   │
           │ files, browser, databases    │
           └──────────┬───────────────────┘
                      │ observations (results)
                      └──────► back to the LLM ... until done
```

1. **Model**: the reasoning engine that decides the next step.
2. **Tools**: functions or APIs the agent can call to read data or take actions.
3. **Memory / state**: conversation history, scratchpad, and long-term stored knowledge.
4. **Control loop**: run, observe, decide again, with **stop conditions** (goal met, step limit, need for human input).

## The agent loop in code

```python
def run_agent(goal, llm, tools, max_steps=20):
    messages = [{"role": "user", "content": goal}]
    for step in range(max_steps):
        reply = llm.chat(messages, tools=tools)
        messages.append(reply.message)

        if not reply.tool_calls:           # model decided it's done
            return reply.text

        for call in reply.tool_calls:      # act
            result = tools.execute(call)   # observe
            messages.append(tool_result(call.id, result))

    return "Stopped: step limit reached"
```

## Chatbot vs agent

| Aspect | Chatbot | Agent |
|---|---|---|
| Interaction | One turn → one response | Many internal steps per task |
| Control flow | Fixed: user drives each step | Dynamic: the LLM chooses the next step |
| Tools | None or a single lookup | Many tools, chained together |
| Actions | Produces text | Changes things (files, tickets, emails, code) |
| Autonomy | Low | Medium to high |
| Predictability | High | Lower, so it needs guardrails |
| Cost and latency | Low | Higher (many LLM calls) |

**Example:** asked "Our checkout tests are failing, fix it":
- A **chatbot** explains common causes of test failures.
- An **agent** runs the tests, reads the error, opens the relevant files, edits the code, reruns the tests, and reports what it changed.

## Real-world examples

- **Coding agents**: modify a codebase and run tests until they pass.
- **Research agents**: search the web, read sources, synthesise a report.
- **Customer-support agents**: look up orders, issue refunds within policy, escalate edge cases.
- **Ops agents**: investigate alerts by querying logs and metrics.

## Strengths and weaknesses

**Strengths**
- Handles open-ended tasks where the steps are not known in advance
- Adapts to new information and recovers from errors
- Automates whole workflows, not just answers

**Weaknesses**
- **Compounding errors**: a wrong step early can derail the whole run
- **Cost and latency** from many LLM calls and large contexts
- **Safety**: real actions mean real consequences, and prompt injection becomes dangerous
- **Harder to test and debug** than deterministic code

## When to build an agent

Start simple. If the steps are known, a **workflow** (a fixed sequence of LLM calls) is cheaper and more reliable. Use an agent when:
- the path to a solution varies a lot between tasks,
- there is a feedback signal (tests, tool results) the agent can use to self-correct, and
- mistakes are recoverable or can be gated by human approval.

## Summary

- An agent = an LLM + tools + memory, running in a loop that it controls until the goal is met.
- A chatbot responds; an agent **acts**, deciding its own multi-step path.
- More capability brings more cost, unpredictability and risk, so add limits, observability and human checkpoints.

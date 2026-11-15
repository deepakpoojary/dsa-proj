Agents handle **short-term memory** through the model's **context window** (the current conversation, tool calls and intermediate results) and **long-term memory** through **external storage** (vector databases, key-value stores, files) that persists across sessions and is retrieved back into the prompt when relevant. LLMs are stateless, so all "memory" is something your system explicitly stores and re-injects.

## Short-term memory (working memory)

This is everything in the current prompt:
- system instructions
- the conversation so far
- tool calls and their results
- the agent's scratchpad, plan or to-do list

**The problem:** context windows are finite and costly. Long agent runs with large tool outputs fill them quickly, and quality often drops in very long contexts.

### Managing short-term memory

- **Sliding window**: keep only the last N turns.
- **Summarisation / compaction**: replace old turns with an LLM-written summary.
- **Trim tool outputs**: store large results externally and keep only a short summary or reference in context.
- **Structured state**: keep key facts (goal, decisions, open tasks) in a compact object instead of raw history.
- **Sub-agents**: offload subtasks to a separate context and return only the result.

```python
def compact_history(messages, llm, keep_last=10):
    if len(messages) <= keep_last:
        return messages
    old, recent = messages[:-keep_last], messages[-keep_last:]
    summary = llm(f"Summarise the key facts, decisions and open tasks:\n{old}")
    return [{"role": "system", "content": f"Earlier context summary: {summary}"}] + recent
```

## Long-term memory (persistent)

Stored outside the model and survives restarts and new sessions.

### Types of long-term memory

| Type | What it stores | Example |
|---|---|---|
| **Episodic** | Past interactions and events | "Last week the user debugged a Redis timeout" |
| **Semantic** | Facts and preferences | "User prefers TypeScript; company uses AWS" |
| **Procedural** | How to do things: rules, learned skills | "Always run lint before committing in this repo" |

### Storage options

- **Vector database**: semantic search over memories ("what do I know about the user's deployment setup?")
- **Relational or key-value store**: structured facts such as user profile and settings
- **Files or documents**: notes, instruction files, saved skills
- **Knowledge graphs**: entities and relationships

### The write and read cycle

```
          ┌───────── Write path ─────────┐
Conversation ─► extract salient facts ─► dedupe / update ─► memory store
                                                              │
          ┌───────── Read path ──────────┐                     │
New task ─► query memory (semantic + filters) ◄────────────────┘
          ─► inject top memories into the prompt ─► LLM
```

```python
def remember(user_id, conversation, llm, store):
    facts = llm("Extract durable facts or preferences worth remembering, as a JSON list:\n"
                + conversation)
    for fact in json.loads(facts):
        store.upsert(user_id=user_id, text=fact, embedding=embed(fact))

def recall(user_id, query, store, k=5):
    return store.search(embedding=embed(query), filter={"user_id": user_id}, k=k)
```

The memory can be written **automatically** (the agent extracts facts after each session) or **explicitly** (the agent has a `save_memory` tool and decides itself). Libraries and services such as Mem0, Letta and LangGraph's memory store offer ready-made versions.

## Challenges

- **What to remember**: saving everything creates noise; saving too little loses context.
- **Staleness and contradictions**: preferences change, so update or expire memories and timestamp them.
- **Retrieval quality**: irrelevant memories pollute the prompt.
- **Privacy**: memories may contain PII, so support viewing, editing and deleting them, and respect data regulations.
- **Memory poisoning**: a prompt injection could plant false "memories", so validate what gets written.
- **Isolation**: always scope memories per user or tenant.

## Quick comparison

| | Short-term | Long-term |
|---|---|---|
| Where | Context window | External store |
| Lifetime | One session or task | Across sessions |
| Size | Limited by tokens | Effectively unlimited |
| Access | Automatic (in the prompt) | Must be retrieved |
| Main risk | Overflow, lost details | Stale, irrelevant or leaked data |

## Summary

- Short-term memory is the context window, managed by trimming, summarising and keeping structured state.
- Long-term memory is external storage (episodic, semantic, procedural) that is written selectively and retrieved into the prompt.
- Good memory design balances relevance, freshness, cost and privacy.

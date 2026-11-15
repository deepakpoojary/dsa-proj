A good prompt is **clear, specific and complete**: it tells the model exactly what task to do, gives it the context it needs, specifies the output format, and shows examples when the pattern is not obvious. Think of it as briefing a smart new colleague who knows nothing about your project.

## The Core Ingredients

### 1. A Clear Task

State the goal directly with an action verb. "Summarise this contract in 5 bullet points for a non-lawyer" beats "Can you look at this?".

### 2. Context

Explain *who* the output is for, *why* you need it, and any background the model cannot guess: product details, definitions, constraints, the user's skill level.

### 3. Constraints

Length, tone, language, what to include and what to avoid. Prefer telling the model what **to do** rather than only what not to do.

### 4. Output Format

Specify the structure: bullet list, table, JSON schema, Markdown headings, word limit. For machine-readable output, use the provider's structured-output feature.

### 5. Examples (Few-Shot)

One to five high-quality examples are often the fastest way to communicate style or tricky formats.

### 6. Clear Separation of Instructions and Data

Wrap inputs in delimiters such as XML-style tags so the model knows what is instruction and what is content.

## Before and After

**Weak prompt:**

```
Write about our new feature.
```

**Strong prompt:**

```
You are a product marketing writer for a B2B project-management app.

Task: Write a release announcement for the feature described below.
Audience: existing customers who are team leads, not engineers.
Tone: friendly, confident, no hype words like "revolutionary".
Format:
- A headline (max 10 words)
- 2 short paragraphs (max 120 words total)
- 3 bullet points listing concrete benefits

<feature_notes>
{{feature_notes}}
</feature_notes>

If the notes are missing key details, write the best version you can
and list open questions at the end under "Questions:".
```

## Prompt Structure Template

```python
def build_prompt(task, context, rules, output_format, examples, data):
    return f"""{task}

## Context
{context}

## Rules
{rules}

## Output format
{output_format}

## Examples
{examples}

<input>
{data}
</input>"""
```

Put **stable instructions** in the system prompt and **variable data** in the user message; this also helps with prompt caching.

## Advanced Techniques

| Technique | Use when |
|---|---|
| **Role / persona** in system prompt | You need consistent expertise or tone |
| **Few-shot examples** | Format or labelling is subtle |
| **Chain-of-thought / reasoning** | Multi-step logic or math |
| **Prompt chaining** | A task has distinct stages (extract, then analyse, then write) |
| **Structured output** | Code needs to parse the result |
| **Grounding with RAG** | Answers must come from specific documents |

## Iterate Like an Engineer

1. Write a first version.
2. Build a small **eval set** (20-100 realistic inputs with expected properties).
3. Run, inspect failures, adjust one thing at a time.
4. Version prompts in source control and re-run evals when changing models.

## Common Pitfalls

- **Vagueness**: the model fills gaps with generic assumptions.
- **Conflicting instructions**: "be detailed" and "keep it short" in the same prompt.
- **Too many rules**: important instructions get diluted; prioritise.
- **Over-relying on CAPS and threats**: modern models respond better to explanations of *why* a rule matters.
- **No examples for unusual formats**.
- **Testing on one input** and assuming it generalises.

## Summary

- A good prompt has a clear task, rich context, explicit constraints, a defined output format and examples when needed.
- Separate instructions from data with delimiters, and keep stable instructions in the system prompt.
- Treat prompting as iterative engineering: measure with evals and refine.

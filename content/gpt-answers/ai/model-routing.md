**Model routing** sends each request to the most suitable model (for example a small, cheap model for easy questions and a large model for hard ones), while **cascading** tries a cheap model first and **escalates** to a stronger one only when the cheap answer isn't good enough. Both reduce cost and latency without giving up much quality.

## Why it works

Real traffic is uneven: most requests are simple (greetings, FAQs, classification), and only a minority need the strongest model. Sending everything to the flagship model wastes money and time.

## Routing

A **router** looks at the request before any answer is generated and chooses a model.

```text
               ┌──> small model   (FAQ, classification, extraction)
request ─> router ─> medium model  (normal Q&A, summarisation)
               └──> large model   (complex reasoning, coding, long documents)
```

Ways to build the router:

- **Rules**: by feature, input length, language, customer tier
- **Classifier**: a small model trained to predict difficulty or category
- **Embedding similarity**: compare the query to labelled examples of easy vs hard requests
- **LLM router**: a cheap model call that outputs a route
- **Learned routers** trained on which model won on past requests

```python
def route(request: str) -> str:
    if len(request) < 200 and intent_classifier(request) in {"greeting", "faq", "order_status"}:
        return "small-model"
    if needs_code_or_math(request):
        return "large-model"
    return "medium-model"

answer = call_llm(model=route(user_input), prompt=user_input)
```

## Cascading

Generate with the cheap model, check the result, and escalate only if it fails.

```python
def cascade(prompt: str) -> str:
    draft = call_llm("small-model", prompt)
    # Confidence checks: schema valid, tests pass, judge score, self-reported confidence
    if is_valid_json(draft) and judge_score(prompt, draft) >= 0.8:
        return draft
    return call_llm("large-model", prompt)   # only hard cases pay the higher price
```

Common **confidence signals**:

- Output passes schema validation or unit tests
- Token log-probabilities above a threshold
- The model's self-assessment or an "I'm not sure" flag
- An LLM judge or verifier score
- Agreement between multiple cheap samples

## Routing vs cascading

| | Routing | Cascading |
|---|---|---|
| Decision time | Before generation | After a cheap attempt |
| Extra latency | Router call only (small) | Escalated requests pay for two generations |
| Cost | Pays once per request | Pays twice for escalated requests |
| Needs | Accurate difficulty prediction | Reliable quality check on the output |
| Best for | Clearly separable request types | Tasks with verifiable outputs |

Many systems combine them: route by task type, then cascade within a route.

## Other routing goals

- **Failover**: route to another provider or region when one is down or rate-limited
- **Latency tiers**: fast model for interactive use, slower and stronger model for background jobs
- **Specialisation**: a code model for code, a vision model for images, a fine-tuned model for a domain
- **Data residency**: route sensitive requests to a self-hosted or in-region model

## Trade-offs and pitfalls

- **Router mistakes**: a hard question sent to a small model gives a bad answer; measure routing accuracy
- **Complexity**: more models means more prompts, evals and monitoring
- **Prompt portability**: each model may need its own tuned prompt
- **Evaluation per route**: check quality for every path, not only the overall average

## Summary

- Routing picks a model per request upfront; cascading tries a cheap model and escalates on low confidence.
- Both exploit the fact that most traffic is easy, cutting cost and latency significantly.
- They require good difficulty or confidence signals, per-route evals and monitoring of escalation rates.

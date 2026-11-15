An AI customer-support agent is an **LLM with tools and a knowledge base**, wrapped in an orchestrator that classifies requests, retrieves policies, takes **permission-limited actions** (order lookup, refunds, tickets), enforces **guardrails**, and **hands off to humans** when confidence is low or stakes are high.

## 1. Requirements

**Functional**

- Answer questions about products, orders, billing and policies
- Perform actions: track orders, update addresses, issue refunds within limits, open tickets
- Work across chat and email; escalate to human agents with context

**Non-functional**

- Fast first response (streamed chat), high correctness of actions
- Never act outside policy; full audit trail
- Measurable impact: resolution rate, CSAT, cost per conversation

## 2. Architecture

```text
Customer (chat / email)
        │
        ▼
  Channel gateway ──> Auth (who is the customer?)
        │
        ▼
  Orchestrator ───────────────┐
   1. Intent + risk classifier│
   2. Route                   │
        │                     │
   ┌────┴─────┬──────────────┐│
   ▼          ▼              ▼▼
 FAQ path   Agent loop      Human handoff
 (RAG,      (LLM + tools)   (ticket + summary)
 small LLM)     │
                ├── Knowledge base (RAG over help center, policies)
                ├── Tools: get_order, track_shipment, update_address,
                │          issue_refund, create_ticket
                └── Guardrails + policy engine
        │
        ▼
  Logging, tracing, evals, analytics
```

## 3. Request flow

1. **Identify the customer** via the logged-in session or email verification.
2. **Classify intent and risk** with a small model: FAQ, order status, refund, complaint, legal threat, etc.
3. **Route**: simple FAQs go to a cheap RAG path; actionable or multi-step requests go to the agent; sensitive cases (legal, safety, very angry customers) go straight to a human.
4. **Agent loop**: the LLM retrieves policy, calls tools, and drafts a reply.
5. **Guardrails** check the reply and any action before it is executed or sent.
6. **Respond** or **hand off** with a summary.

## 4. Tools and permissions

Tools are scoped to the authenticated customer; the model never supplies the customer ID itself.

```python
TOOLS = [
    {"name": "get_order", "description": "Get an order for the current customer",
     "parameters": {"order_id": "string"}},
    {"name": "issue_refund", "description": "Refund an order. Max $100 without approval.",
     "parameters": {"order_id": "string", "amount": "number", "reason": "string"}},
    {"name": "create_ticket", "description": "Escalate to a human agent",
     "parameters": {"summary": "string", "priority": "string"}},
]

def execute_tool(name, args, session):
    if name == "issue_refund":
        order = orders.get(args["order_id"], customer_id=session.customer_id)  # ownership check
        if args["amount"] > min(order.total, REFUND_AUTO_LIMIT):
            return request_human_approval(order, args)                      # human in the loop
        return payments.refund(order, args["amount"], idempotency_key=f"{session.id}:{order.id}")
    ...
```

Key principles:

- **Least privilege** and server-side authorisation on every tool
- **Hard policy limits** in code, not only in the prompt
- **Idempotency keys** so retries never double-refund
- **Confirmation** from the customer before irreversible actions

## 5. Knowledge and memory

- **RAG** over the help center, policies and product docs, with versioning so answers reflect current policy
- **Conversation state**: messages, extracted entities (order ID), actions taken
- **Customer context**: plan, recent orders, open tickets, injected as structured data

## 6. Guardrails

- Prompt-injection detection on customer messages
- Output checks: no promises outside policy, no legal or medical advice, tone, PII leakage
- Groundedness check on policy answers
- Rate limits and abuse detection

## 7. Human handoff

Trigger when: the customer asks for a human, confidence is low, repeated failures, negative sentiment, high-value or legal issues. Pass a **structured summary** (issue, steps taken, customer data) so the human doesn't start over. Human agents' resolutions become training and eval data.

## 8. Evaluation

| Layer | Metric |
|---|---|
| Classification | Intent accuracy, routing accuracy |
| Answers | Faithfulness to policy, correctness, tone (LLM judge + human review) |
| Actions | Correct tool and arguments, policy violations (should be zero) |
| Business | Resolution without human, escalation rate, CSAT, handle time, cost per conversation |

Build evals by **replaying historical tickets**, plus simulated customers (an LLM playing the user) for multi-turn scenarios. Run them in CI on every prompt or model change.

## 9. Operations

- Trace every conversation and tool call; audit log for actions
- Stream responses; parallelise retrieval and customer-data lookups
- Model routing: small model for classification and FAQs, stronger model for the agent loop
- Gradual rollout: start with suggestions to human agents ("copilot mode"), then automate low-risk intents

## Summary

- Combine an intent/risk router, a RAG knowledge base and an LLM agent with permission-scoped, policy-limited tools.
- Enforce guardrails in code, require approval for risky actions, and hand off to humans with a summary.
- Evaluate with replayed tickets and track resolution rate, CSAT, policy violations and cost.

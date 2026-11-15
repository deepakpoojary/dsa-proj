An AI engineer should handle **bias and fairness**, **privacy and PII**, **security** (prompt injection, data leakage), **hallucination and harmful content**, **transparency**, and **regulatory compliance**, building them into the system as concrete engineering controls rather than treating them as an afterthought.

## 1. Bias and fairness

LLMs learn from internet-scale data and can reproduce stereotypes or treat groups differently.

- **Test for disparities**: run the same prompts with varied names, genders, ethnicities or dialects and compare outputs (counterfactual testing)
- **Avoid protected attributes** in decisions such as hiring, lending or pricing, and watch for proxies (postcode, name)
- **Human oversight** for high-stakes decisions; AI should assist, not decide alone
- **Diverse evaluation data** that reflects your real user population, including other languages

```python
# Simple counterfactual fairness check for a resume screener
template = "Rate this candidate 1-10 for a backend role: {name}, 5 years Python, AWS, led a team of 4."
names = ["Emily", "Lakisha", "Mohammed", "Wei", "Carlos", "Greg"]
scores = {n: rate(template.format(name=n)) for n in names}
assert max(scores.values()) - min(scores.values()) <= 1, f"Possible bias: {scores}"
```

## 2. Privacy and PII

- **Data minimisation**: send only what the model needs
- **Redact or pseudonymise PII** (names, emails, phone numbers, IDs) before prompts, logs and analytics
- **Provider terms**: use enterprise agreements with no training on your data and appropriate retention; consider self-hosting or in-region processing for sensitive data
- **Retention and deletion**: honour deletion requests across logs, vector stores and caches
- **Avoid training on user data** without consent; never put secrets in prompts

```python
import re

EMAIL = re.compile(r"[\w.+-]+@[\w-]+\.[\w.]+")
PHONE = re.compile(r"\+?\d[\d\s-]{8,}\d")

def redact(text: str) -> str:
    text = EMAIL.sub("[EMAIL]", text)
    return PHONE.sub("[PHONE]", text)
# In production, use a dedicated PII detection library or model as well as regex.
```

## 3. Security

- **Prompt injection** (direct and via retrieved documents, emails or web pages)
- **Data exfiltration** through tools, links or markdown rendering
- **Least-privilege tools**, server-side authorisation, human approval for risky actions
- **Permission-aware retrieval** so RAG never surfaces documents a user can't access
- **Output handling**: never execute or render model output without validation

## 4. Hallucination and harmful content

- Ground answers in retrieved sources with **citations**
- Teach the system to say **"I don't know"**
- **Content moderation** on inputs and outputs
- Extra caution in medical, legal and financial domains, with disclaimers and escalation

## 5. Transparency and accountability

- Tell users they are interacting with AI
- Label AI-generated content where required
- Explain limitations and provide a way to reach a human or appeal a decision
- Keep **audit logs** of decisions and actions; document models and datasets (model cards, data sheets)

## 6. Compliance

| Area | Examples | Engineering impact |
|---|---|---|
| Data protection | GDPR, CCPA | Consent, minimisation, deletion, data residency |
| AI regulation | EU AI Act | Risk classification, documentation, human oversight, transparency duties |
| Sector rules | HIPAA, financial regulations | Access controls, audit trails, approved vendors |
| Copyright and licensing | Model and dataset licences | Check usage rights for data and model outputs |

## 7. Make it continuous

- Include fairness, safety and privacy cases in your **eval suite** and CI
- **Red-team** before launch and periodically after
- Monitor guardrail triggers, complaints and drift in production
- Provide feedback channels and an incident-response process

## Common pitfalls

- Logging raw prompts with PII "temporarily"
- Relying on the system prompt alone for safety
- Testing fairness once at launch and never again
- Ignoring the vector store and caches when deleting user data

## Summary

- Handle bias with counterfactual tests and human oversight, and protect privacy with minimisation, PII redaction and proper provider terms.
- Secure against prompt injection and data leakage, ground answers, moderate content and be transparent with users.
- Build compliance (GDPR, EU AI Act, sector rules) into evals, monitoring and documentation as an ongoing process.

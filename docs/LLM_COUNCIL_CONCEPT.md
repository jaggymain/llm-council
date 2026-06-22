# LLM Council — Concept & Rationale

A companion to `LLM_COUNCIL_BUILD_PLAN.md`. That doc is the *what* and *how*. This is the *why*.

---

## What we're building

An iPhone app that answers a question by convening a **council of LLMs** rather than trusting one. You ask once; several different models answer independently; they critique and rank each other's answers blind; a designated "chairman" model synthesises a final answer. You — the human — stay in the loop throughout: reviewing every raw answer, curating which ones count, and deciding when (and whether) to accept the synthesis.

It's based on Andrej Karpathy's open-source `llm-council` project, re-shaped into a shippable, multi-provider mobile app.

---

## Why a council at all

A single LLM gives you one answer with one set of blind spots, and no signal about whether it's confident-but-wrong. The council pattern attacks that directly:

- **Cross-checking.** Different models, trained differently, make different mistakes. Where they agree, you can trust more; where they diverge, you've found the contested ground worth your attention.
- **Blind peer review.** In the ranking stage, model identities are hidden, so models can't favour their own provider's family. You get a more honest assessment of which answer is actually strongest.
- **Synthesis over selection.** The chairman doesn't just pick a winner — it composes the best of several answers into one, ideally better than any single contributor.

The original instinct was to chain models sequentially (A checks B checks C). We rejected that early because of **anchoring**: each model would defer to the previous answer rather than reason fresh. The parallel-then-critique design exists precisely to avoid that, which is why we kept Karpathy's structure.

---

## The human-in-the-loop principle

This is the part that makes it *yours* and not just a prettier Karpathy clone. The app is built so the human is a participant, not a spectator:

- You see **every** raw council answer, not just the final verdict.
- You **curate** — drop weak answers before they enter the ranking, shaping the jury.
- You **gate the chairman** — synthesis runs only when you trigger it, so you read first and spend deliberately.
- You can **pin a raw answer** over the synthesis if you think one model nailed it and the chairman muddied it.
- You can **loop back** — re-run, edit the question, or change the council and go again.

The chairman's answer is a recommendation you can interrogate, not an oracle you must accept.

---

## Why these architectural choices

**Thin client, fat backend.** All orchestration lives on a hosted backend; the phone just sends a question and walks you through stages. This is forced by two realities — API keys can't ship safely inside an App Store binary, and Apple won't let you change orchestration logic without resubmitting the app. Keeping the council server-side means it's a concern you can evolve freely.

**Two providers (Nebius + OpenRouter).** Both speak the OpenAI API format, so routing between them is trivial — but together they give the council real diversity: strong proprietary models (GPT, Claude) via OpenRouter alongside open-weight models (DeepSeek, Qwen, Llama) via Nebius. That diversity is the whole point; a council of near-identical models would mostly agree with itself.

**Bring-your-own-key (BYOK).** Users supply their own provider keys and pay for their own inference. This sidesteps the central economic trap of a council app: every question fans out to 4–5 model calls, so if *you* paid for inference across a public user base, costs would balloon and abuse would be trivial. BYOK pushes that cost to the person making the request, where it belongs.

**Paid download, not subscription.** Because the user already pays providers directly via BYOK, the app's price is for *the software* — the orchestration, the council UX, the synthesis — not for consumable inference. A one-time paid download fits that cleanly and means Apple takes its commission once (15% under the Small Business Program), with no in-app purchase machinery and no per-query Apple tax.

**Expo / React Native, not Swift.** This is a four-screen, text-in/text-out app with no heavy graphics — exactly the case where Swift's native-polish advantage barely shows. Meanwhile React Native lets us work in the existing TypeScript/React skillset, reuse Karpathy's frontend logic as reference, and reach TestFlight fast. It still produces a genuine native app (a real `.ipa`, App Store-distributed) — the same end product as Swift, reached via a more efficient path for this stack.

---

## The honest tensions

Worth holding in view rather than hiding:

- **BYOK narrows the audience.** Realistically this is a tool for developers and AI-literate users, since the general public doesn't hold provider keys. That's an accepted trade for keeping the economics and App Store rules clean.
- **Council economics are inherently expensive.** The 4–5x fan-out per question is the cost of the cross-checking benefit. BYOK is what makes that sustainable.
- **Open-model ranking is fragile.** Weaker models follow the strict ranking format less reliably, so the parser needs hardening. Hybrid (cloud + open) council mitigates this.
- **Apple's rules shift.** Guideline 3.1.1 and the US external-purchase situation move month to month; verify at submission rather than trusting any fixed snapshot.

---

## In one line

We're turning a single-answer question into a deliberated one — many models, blind peer review, human-curated, synthesised — delivered as a native iPhone app where the user brings their own keys and stays in control of the verdict.

See `LLM_COUNCIL_BUILD_PLAN.md` for the element-by-element build steps.

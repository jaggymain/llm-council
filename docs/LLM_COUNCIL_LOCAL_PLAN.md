# LLM Council — Local Build Plan (your fork, explicit commands)

Repo: https://github.com/jaggymain/llm-council
Run everything on `localhost`, OpenRouter-only. Commands are macOS / zsh, run from a normal Terminal. Lines starting `#` are comments — don't paste them as commands.

Assumed location: `~/llm-council`. Adjust if you cloned elsewhere.

---

## Phase 0 — Prerequisites (one-time)

Install uv (Python package manager):
\`\`\`
curl -LsSf https://astral.sh/uv/install.sh | sh
\`\`\`
Restart the terminal, then verify:
\`\`\`
uv --version
\`\`\`

Check Node + npm (need Node 18+):
\`\`\`
node --version
npm --version
\`\`\`
If missing, install via Homebrew:
\`\`\`
brew install node
\`\`\`

OpenRouter: create an account at https://openrouter.ai, generate an API key (starts \`sk-or-v1-...\`), and load a few dollars of credit. Keep the key handy for Phase 1.

---

## Phase 1 — Run your fork as-is (baseline)

Clone and enter:
\`\`\`
cd ~
git clone https://github.com/jaggymain/llm-council.git
cd llm-council
\`\`\`

Install backend deps:
\`\`\`
uv sync
\`\`\`

Install frontend deps:
\`\`\`
cd frontend
npm install
cd ..
\`\`\`

Create the \`.env\` (replace with your real key):
\`\`\`
cat > .env << 'EOF'
OPENROUTER_API_KEY=sk-or-v1-REPLACE_WITH_YOUR_KEY
EOF
\`\`\`

Open the model config to check/edit slugs:
\`\`\`
open -e backend/config.py
\`\`\`
Confirm the \`COUNCIL_MODELS\` slugs are currently live on OpenRouter (model names change). Defaults are:
\`\`\`
COUNCIL_MODELS = [
    "openai/gpt-5.1",
    "google/gemini-3-pro-preview",
    "anthropic/claude-sonnet-4.5",
    "x-ai/grok-4",
]
CHAIRMAN_MODEL = "google/gemini-3-pro-preview"
\`\`\`

Make the start script executable and run it:
\`\`\`
chmod +x start.sh
./start.sh
\`\`\`

If \`start.sh\` doesn't work, run the two halves manually in two terminal tabs:
\`\`\`
# Tab 1 — backend
cd ~/llm-council
uv run python -m backend.main
\`\`\`
\`\`\`
# Tab 2 — frontend
cd ~/llm-council/frontend
npm run dev
\`\`\`

Open the app:
\`\`\`
open http://localhost:5173
\`\`\`
Ask a question; confirm all three stages run.

**Checkpoint: working council in the browser. This is your baseline — leave it on \`master\`.**

---

## Phase 2 — Set up a working branch + cheaper dev loop

Create a branch for your changes:
\`\`\`
git checkout -b human-in-the-loop
\`\`\`

Trim the council to 2 models while developing (cheaper + faster). Edit \`backend/config.py\`:
\`\`\`
open -e backend/config.py
\`\`\`
Set, for example:
\`\`\`
COUNCIL_MODELS = [
    "anthropic/claude-sonnet-4.5",
    "openai/gpt-5.1",
]
CHAIRMAN_MODEL = "anthropic/claude-sonnet-4.5"
\`\`\`
Restore to a diverse 4 later (Phase 4).

---

## Phase 3 — Add human-in-the-loop (do these WITH Claude Code)

Open Claude Code in the repo root so it can see the existing \`CLAUDE.md\`:
\`\`\`
cd ~/llm-council
claude
\`\`\`

Then work through the sub-steps below one at a time, asking Claude Code to make each change. After each, restart the app (\`./start.sh\`) and test in the browser before moving on.

**3a. Split the stages so they don't auto-chain.**
Ask Claude Code to separate the combined run in \`backend/\` (council logic + \`main.py\` routes) into three independently-callable endpoints, persisting outputs to \`data/conversations/\` between calls:
- \`POST /conversations/{id}/stage1\` → \`{question}\` → council raw answers.
- \`POST /conversations/{id}/stage2\` → \`{dropped_ids: []}\` → rankings, excluding dropped answers.
- \`POST /conversations/{id}/stage3\` → \`{pinned_answer_id?: str}\` → chairman synthesis, or the pinned raw answer.

**3b. Curate before ranking.**
Frontend Stage 1: add keep / drop per answer; pass dropped ids into the stage2 call.

**3c. Gate the chairman.**
Frontend: chairman runs only on an explicit "Synthesise" tap.

**3d. Un-anonymise for your eyes.**
Surface the existing server-side model->label mapping to the frontend; show model names in bold in the rankings view.

**3e. Pin a raw answer.**
Frontend Stage 3: add "pin a council answer" to keep a raw answer instead of synthesis; wire to \`pinned_answer_id\`.

**3f. Robustness.**
Harden the Stage 2 \`FINAL RANKING:\` parser against malformed output; isolate per-model failures so one bad call doesn't kill the council.

Commit after each working sub-step, e.g.:
\`\`\`
git add -A
git commit -m "3a: split council into stage1/2/3 endpoints"
\`\`\`

**Checkpoint: review all answers -> drop weak ones -> trigger ranking -> trigger/override synthesis, all locally.**

---

## Phase 4 — Polish (optional)

- Stage stepper UI: Compose > Council > Rankings > Chairman, with back-navigation.
- Re-run / edit-question controls on the Chairman view.
- Restore \`COUNCIL_MODELS\` to a diverse 4 in \`backend/config.py\`.

---

## Phase 5 — Commit & tag

\`\`\`
git add -A
git commit -m "Human-in-the-loop council: curate, gate, pin"
git tag v0.1-local-poc
\`\`\`
Optionally push your branch:
\`\`\`
git push -u origin human-in-the-loop
git push --tags
\`\`\`

---

## Explicitly NOT in this plan (later, separate work)

- Nebius as a second provider.
- BYOK / per-request user keys (key stays in local \`.env\` here).
- AWS App Runner / ECR deployment.
- The Expo iPhone app.
- App Store prep.

---

## Quick reference — start/stop

Start:
\`\`\`
cd ~/llm-council && ./start.sh
\`\`\`
Stop: press \`Ctrl-C\` in the terminal running it. If you ran manually, \`Ctrl-C\` in both tabs.

If a port is stuck:
\`\`\`
# backend default 8001, frontend default 5173
lsof -ti:8001 | xargs kill -9
lsof -ti:5173 | xargs kill -9
\`\`\`

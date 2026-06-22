# Frontend Modernization — shadcn/ui + "Studio" Brand

**Date:** 2026-06-22
**Status:** Approved (design), pending implementation plan
**Scope:** `frontend/` only. No backend or API changes.

## Goal

Replace the current hand-written per-component CSS with a modern, polished UI built on
**Tailwind CSS + shadcn/ui**, themed in the **"Studio"** brand direction (near-black +
electric violet accent, Inter typography, generous whitespace), with a **light/dark toggle**.

The app keeps all existing behavior: 3-stage council deliberation, streaming progressive
updates, conversation list, anonymized peer rankings. This is a presentation-layer
redesign — data shapes, API calls, and streaming event handling stay intact.

## Brand: "Studio"

| Token | Light | Dark |
|---|---|---|
| Background | `#ffffff` / `#fafafa` | `#0a0a0b` / `#18181b` |
| Foreground | `#18181b` | `#fafafa` |
| Primary (accent) | violet `#7c3aed` | violet `#a855f7` |
| Primary foreground | `#ffffff` | `#0a0a0b` |
| Border | `#ececf0` | `#27272a` |
| Muted text | `#a1a1aa` | `#71717a` |
| Success (stage ✓) | `#16a34a` | `#4ade80` |

- **Type:** Inter (UI), with `font-feature-settings` for tighter headings (`letter-spacing: -0.02em`).
- **Radius:** `--radius: 0.75rem` (cards 14px, controls 10–12px, pills 8px).
- **Accent gradient** for the logo mark and brand dot: `linear-gradient(135deg,#7c3aed,#a855f7)`.
- Dark mode via shadcn's `.dark` class on `<html>`, toggled by a theme switch persisted to `localStorage`.

## Tech Approach

- **Tailwind CSS v4** (current; uses `@import "tailwindcss"` + `@theme`, no `tailwind.config.js` content array needed) integrated into the existing **Vite + React 19** app.
- **shadcn/ui** via the CLI (`npx shadcn@latest init`), components copied into `frontend/src/components/ui/`. We own the code; no runtime UI dependency lock-in.
- Keep `react-markdown`; style its output with Tailwind `prose`-like utilities scoped to a `.markdown` wrapper (replacing the global `.markdown-content` rules).
- Path alias `@/` → `frontend/src` (shadcn expects this; add to `vite.config.js` and `jsconfig.json`).
- **No TypeScript migration** — stay on `.jsx` to keep the change focused. shadcn supports JSX output.

### shadcn components to add
`button`, `card`, `tabs`, `scroll-area`, `badge`, `textarea`, `tooltip`, `skeleton`,
`separator`, `dropdown-menu` (for the theme/menu), `sonner` (optional, for error toasts).

## Component Mapping

Existing component → redesigned with these primitives. File paths stay the same; CSS files
are deleted and replaced by Tailwind classes (and small local `ui/` primitives).

### `App.jsx` (shell)
- Root grid: fixed-width sidebar + flex main, full height. Add `ThemeProvider` (lightweight
  context + `localStorage`, sets `.dark` on `<html>`).
- No logic changes to streaming/state handlers.

### `Sidebar.jsx`
- Header: gradient logo mark (rounded square) + "LLM Council" wordmark; theme toggle button
  in the top-right of the header.
- "+ New Conversation" → shadcn `Button` (primary, full width).
- Conversation list → `ScrollArea`; each item a hover/active row with title + muted
  "N messages" meta. Active item gets a subtle violet-tinted background + left accent.
- Empty state styled with muted text.

### `ChatInterface.jsx`
- **Empty (no conversation / no messages):** centered hero — gradient mark, "Welcome to
  LLM Council", subtitle, and a "3-stage deliberation" badge. Composer shown below.
- **User message:** right-aligned dark bubble (`16px 16px 4px 16px` radius), max-width ~75%.
- **Assistant turn:** brand label row (gradient dot + "LLM Council") above the stage cards.
- **Composer:** always-visible pinned input row — `Textarea` (auto-grow, Enter to send /
  Shift+Enter newline, preserved) + primary send `Button`. Disabled state while loading.
- **Loading states:** each in-flight stage renders a `Card` with a `Skeleton` + step label
  (e.g. "Stage 1 · collecting responses…") instead of the current bare spinner. Replaces the
  card in place when its data arrives (drives off existing `loading.stageN` flags).

### `Stage1.jsx` — "Individual responses"
- Wrapped in a stage `Card`: header row with `STAGE 1` step label, title, and a green
  ✓ badge ("N models") once complete.
- Tabs → shadcn `Tabs`/pills; active tab near-black. Body renders the selected model's
  markdown in the `.markdown` wrapper. Model id shown as a small muted caption.

### `Stage2.jsx` — "Peer rankings"
- Stage `Card`, `STAGE 2` label, "anonymized" sub-note preserved (the explanation that
  models saw "Response A/B/C" and names are bolded only for readability — keep this text).
- Per-evaluator `Tabs`; de-anonymized markdown body (existing `deAnonymizeText` logic kept).
- "Extracted Ranking" → compact ordered list / badges under the evaluation.
- **Aggregate "street cred" leaderboard:** ranked rows with a rank chip, model name, a
  violet progress bar (relative to best `average_rank`), and `avg X.XX · N votes` meta.
  Rank 1 row gets a violet-tinted background + filled chip. This is the visual centerpiece.

### `Stage3.jsx` — "Chairman's synthesis"
- Violet-tinted `Card` (soft `#faf8ff`→white gradient in light; violet-900 tint in dark) with
  `STAGE 3` label, "Chairman's synthesis" title, ✓ final badge, and a "Chairman: <model>"
  caption. Markdown body in the `.markdown` wrapper. Replaces the current green box.

## Data Flow

Unchanged. The streaming handler in `App.jsx` still mutates `currentConversation.messages`
with `stage1/stage2/stage3/metadata/loading`. Redesigned components consume the exact same
props (`responses`, `rankings`, `labelToModel`, `aggregateRankings`, `finalResponse`).
Only rendering changes.

## Error Handling

- Stream `error` events: keep console logging; additionally surface a non-blocking toast
  (`sonner`) so failures aren't silent. Existing optimistic-message rollback stays.
- Graceful degradation preserved: partial stages render whatever arrived.

## Out of Scope (YAGNI)

- TypeScript migration.
- Backend/API/config changes (council models, ports, storage).
- Persisting metadata to storage (still ephemeral per existing design).
- Configurable council/chairman UI, export, analytics — future ideas, not this pass.
- Mobile-specific layout beyond basic responsive sidebar collapse (sidebar stays fixed; a
  proper mobile drawer can be a follow-up).

## Testing / Verification

No automated UI tests exist today; this pass won't add a framework. Verification is manual:

1. `npm run build` succeeds (Tailwind + shadcn wired correctly).
2. `npm run dev` — visually verify against the approved mockup:
   - Sidebar list, new-conversation, active highlighting, theme toggle (light↔dark persists).
   - Send a message; watch all three stages stream in with skeleton→content transitions.
   - Stage 1/2 tabs switch; Stage 2 leaderboard renders with bars; Stage 3 synthesis card.
   - Empty state hero renders for a fresh conversation.
3. Confirm Enter-to-send / Shift+Enter-newline still work.

## Implementation Order (for the plan)

1. Wire Tailwind v4 + path alias + `shadcn init`; add base theme tokens & dark mode plumbing.
2. App shell + ThemeProvider + theme toggle.
3. Sidebar.
4. ChatInterface shell (empty state, user bubble, composer, loading skeletons).
5. Stage 1, then Stage 3 (simpler), then Stage 2 (leaderboard — most work).
6. Delete dead `*.css` files and the old `.markdown-content` global rules.
7. Build + manual verification pass.

# Frontend shadcn/ui "Studio" Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the frontend's hand-written per-component CSS with Tailwind CSS v4 + shadcn/ui primitives, themed in the "Studio" brand (near-black + electric violet, Inter, light/dark toggle), with zero changes to behavior or the backend.

**Architecture:** Add Tailwind v4 via the official Vite plugin and initialize shadcn/ui (components copied into `src/components/ui/`). A small `ThemeProvider` toggles a `.dark` class on `<html>` and persists to `localStorage`. Each existing component (`App`, `Sidebar`, `ChatInterface`, `Stage1/2/3`) is rewritten to consume the **same props** but render Tailwind/shadcn markup. The streaming/state logic in `App.jsx` is untouched.

**Tech Stack:** Vite 7, React 19, Tailwind CSS v4 (`@tailwindcss/vite`), shadcn/ui (button, card, badge, textarea, skeleton), `lucide-react` icons, `clsx` + `tailwind-merge` (`cn` helper), `react-markdown` (kept).

## Global Constraints

- **Scope:** `frontend/` only. Do NOT touch `backend/`, API contracts, ports (backend 8001, frontend 5173), or `config.py`.
- **No TypeScript migration.** All files stay `.jsx`/`.js`.
- **Props are frozen.** Redesigned components consume the exact existing props: `Stage1({responses})`, `Stage2({rankings, labelToModel, aggregateRankings})`, `Stage3({finalResponse})`, `Sidebar({conversations, currentConversationId, onSelectConversation, onNewConversation})`, `ChatInterface({conversation, onSendMessage, isLoading})`.
- **Preserve behaviors:** Enter-to-send / Shift+Enter-newline; optimistic message + rollback; graceful partial-stage rendering; the Stage 2 "anonymized" explanatory copy.
- **Brand tokens (Studio):** primary violet `#7c3aed` (light) / `#a855f7` (dark); near-black foreground; Inter font; `--radius: 0.75rem`; accent gradient `linear-gradient(135deg,#7c3aed,#a855f7)`.
- **Commit messages:** plain conventional-commit style, no author trailer (the env's "Authored by" trailer is blocked by the safety classifier).
- **Verification per task:** `npm run build` must succeed (run from `frontend/`). There is no unit-test framework and we are not adding one; the "test" cycle is a successful build plus the visual check noted in each task.

---

### Task 1: Tailwind v4 + shadcn init + Studio theme

Stand up the styling toolchain and the theme tokens. End state: `npm run build` succeeds and a Tailwind utility class renders.

**Files:**
- Modify: `frontend/package.json` (deps added by installers)
- Modify: `frontend/vite.config.js`
- Create: `frontend/jsconfig.json`
- Create: `frontend/components.json` (written by `shadcn init`)
- Create: `frontend/src/lib/utils.js` (written by `shadcn init`)
- Create: `frontend/src/components/ui/*` (written by `shadcn add`)
- Replace: `frontend/src/index.css`

**Interfaces:**
- Produces: `@/` path alias → `frontend/src`; `cn(...)` from `@/lib/utils`; shadcn primitives `@/components/ui/{button,card,badge,textarea,skeleton}`; Tailwind theme color utilities `bg-background text-foreground border-border bg-primary text-primary-foreground bg-card text-muted-foreground bg-accent text-accent-foreground text-success bg-sidebar`.

- [ ] **Step 1: Install Tailwind v4 + Vite plugin**

```bash
cd frontend
npm install tailwindcss @tailwindcss/vite
```

- [ ] **Step 2: Add the alias + Tailwind plugin to `vite.config.js`**

Replace the file with:

```js
import { defineConfig } from 'vite'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 3: Create `frontend/jsconfig.json`** (lets shadcn + editors resolve `@/`)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

- [ ] **Step 4: Replace `frontend/src/index.css`** with Tailwind + Studio tokens + markdown styles

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
  --radius: 0.75rem;
  --background: #ffffff;
  --foreground: #18181b;
  --card: #ffffff;
  --card-foreground: #18181b;
  --primary: #7c3aed;
  --primary-foreground: #ffffff;
  --secondary: #f4f4f5;
  --secondary-foreground: #18181b;
  --muted: #f4f4f5;
  --muted-foreground: #71717a;
  --accent: #f4f0ff;
  --accent-foreground: #6d28d9;
  --border: #ececf0;
  --input: #e4e4e7;
  --ring: #7c3aed;
  --success: #16a34a;
  --sidebar: #fafafa;
}

.dark {
  --background: #0a0a0b;
  --foreground: #fafafa;
  --card: #18181b;
  --card-foreground: #fafafa;
  --primary: #a855f7;
  --primary-foreground: #0a0a0b;
  --secondary: #27272a;
  --secondary-foreground: #fafafa;
  --muted: #27272a;
  --muted-foreground: #a1a1aa;
  --accent: #2e1065;
  --accent-foreground: #ddd6fe;
  --border: #27272a;
  --input: #27272a;
  --ring: #a855f7;
  --success: #4ade80;
  --sidebar: #111113;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-success: var(--success);
  --color-sidebar: var(--sidebar);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
}

@layer base {
  * {
    border-color: var(--border);
  }
  html, body, #root {
    height: 100%;
  }
  body {
    margin: 0;
    background: var(--background);
    color: var(--foreground);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
  }
}

/* Markdown rendering (replaces old .markdown-content global) */
.markdown {
  font-size: 0.875rem;
  line-height: 1.65;
  color: var(--foreground);
}
.markdown > :first-child { margin-top: 0; }
.markdown > :last-child { margin-bottom: 0; }
.markdown p { margin: 0 0 0.75rem; }
.markdown h1, .markdown h2, .markdown h3 { margin: 1rem 0 0.5rem; font-weight: 600; letter-spacing: -0.01em; }
.markdown ul, .markdown ol { margin: 0 0 0.75rem; padding-left: 1.25rem; }
.markdown li { margin: 0.2rem 0; }
.markdown code { background: var(--muted); padding: 0.1rem 0.35rem; border-radius: 6px; font-size: 0.85em; }
.markdown pre { background: var(--muted); padding: 0.75rem; border-radius: 10px; overflow-x: auto; margin: 0 0 0.75rem; }
.markdown pre code { background: none; padding: 0; }
.markdown a { color: var(--primary); text-decoration: underline; }
.markdown strong { font-weight: 600; }
.markdown blockquote { border-left: 3px solid var(--border); padding-left: 0.75rem; color: var(--muted-foreground); margin: 0 0 0.75rem; }
```

- [ ] **Step 5: Add Inter via `index.html`** — insert in `<head>` of `frontend/index.html`, and set the title:

```html
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    <title>LLM Council</title>
```

(Delete the old `<title>frontend</title>` line.)

- [ ] **Step 6: Initialize shadcn/ui**

```bash
cd frontend
npx shadcn@latest init
```

When prompted: base color **Neutral**, CSS variables **yes**, and accept the detected Vite + Tailwind v4 setup. This creates `components.json` and `src/lib/utils.js` (the `cn` helper) and installs `clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react`. If init offers to overwrite `index.css`, decline (we already wrote our tokens) — or re-apply Step 4 after init if it overwrote the file.

- [ ] **Step 7: Add the shadcn primitives we use**

```bash
cd frontend
npx shadcn@latest add button card badge textarea skeleton
```

These land in `frontend/src/components/ui/`.

- [ ] **Step 8: Smoke-test the toolchain** — temporarily render a Tailwind class. In `frontend/src/App.jsx`, change the root `<div className="app">` to `<div className="app bg-primary text-primary-foreground">` (revert in Task 2). Then build:

Run: `cd frontend && npm run build`
Expected: build completes with no errors; `dist/` is produced.

- [ ] **Step 9: Visual check**

Run: `cd frontend && npm run dev`, open http://localhost:5173
Expected: the app background is violet (proves Tailwind + tokens are live). Then revert the temporary classes from Step 8 back to `className="app"`.

- [ ] **Step 10: Commit**

```bash
cd /Users/nickw/llm-council
git add frontend/package.json frontend/package-lock.json frontend/vite.config.js frontend/jsconfig.json frontend/components.json frontend/src/lib frontend/src/components/ui frontend/src/index.css frontend/index.html
git commit -m "build: add Tailwind v4 + shadcn/ui with Studio theme tokens"
```

---

### Task 2: ThemeProvider, theme toggle, and App shell

Add light/dark plumbing and restyle the top-level layout.

**Files:**
- Create: `frontend/src/components/theme-provider.jsx`
- Create: `frontend/src/components/theme-toggle.jsx`
- Modify: `frontend/src/App.jsx`
- Delete: `frontend/src/App.css`

**Interfaces:**
- Produces: `<ThemeProvider>` wrapper exporting `useTheme()` → `{ theme: 'light'|'dark', toggle }`; `<ThemeToggle />` button. Sidebar (Task 3) renders `<ThemeToggle />`.
- Consumes: nothing new.

- [ ] **Step 1: Create `frontend/src/components/theme-provider.jsx`**

```jsx
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({ theme: 'light', toggle: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('llmcouncil-theme') || 'light'
  );

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('llmcouncil-theme', theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

- [ ] **Step 2: Create `frontend/src/components/theme-toggle.jsx`**

```jsx
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from './theme-provider';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label="Toggle theme"
      className="h-8 w-8 text-muted-foreground"
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
```

- [ ] **Step 3: Rewrite `frontend/src/App.jsx`** — wrap in `ThemeProvider`, restyle the shell, drop `./App.css`. Keep ALL existing state/handlers/streaming logic exactly. Only change the import line and the returned JSX wrapper:

Change the imports at top: remove `import './App.css';` and add:

```jsx
import { ThemeProvider } from './components/theme-provider';
```

Replace the `return ( ... )` block (the outer `<div className="app">…</div>`) with:

```jsx
  return (
    <ThemeProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
        <Sidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
        />
        <ChatInterface
          conversation={currentConversation}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </ThemeProvider>
  );
```

- [ ] **Step 4: Delete the old stylesheet**

```bash
rm frontend/src/App.css
```

- [ ] **Step 5: Build**

Run: `cd frontend && npm run build`
Expected: build succeeds (no missing `App.css`/import errors).

- [ ] **Step 6: Visual check** — `npm run dev`; the toggle isn't wired into the sidebar yet (Task 3), but confirm no console errors and the layout still splits sidebar/main.

- [ ] **Step 7: Commit**

```bash
cd /Users/nickw/llm-council
git add frontend/src/App.jsx frontend/src/components/theme-provider.jsx frontend/src/components/theme-toggle.jsx
git rm frontend/src/App.css
git commit -m "feat(ui): add theme provider, dark-mode toggle, and restyled app shell"
```

---

### Task 3: Sidebar

**Files:**
- Modify: `frontend/src/components/Sidebar.jsx`
- Delete: `frontend/src/components/Sidebar.css`

**Interfaces:**
- Consumes: `conversations` (`[{id, title?, message_count}]`), `currentConversationId`, `onSelectConversation(id)`, `onNewConversation()`; `<ThemeToggle/>` from Task 2; `cn` from `@/lib/utils`; `Button` from `@/components/ui/button`.

- [ ] **Step 1: Rewrite `frontend/src/components/Sidebar.jsx`**

```jsx
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ThemeToggle from './theme-toggle';

export default function Sidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
}) {
  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <div
            className="h-7 w-7 rounded-lg"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}
          />
          <span className="text-[15px] font-bold tracking-[-0.02em]">LLM Council</span>
        </div>
        <ThemeToggle />
      </div>

      <div className="px-3 pb-3 pt-1">
        <Button onClick={onNewConversation} className="w-full justify-center gap-1.5">
          <Plus className="h-4 w-4" /> New Conversation
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {conversations.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            No conversations yet
          </p>
        ) : (
          conversations.map((conv) => {
            const active = conv.id === currentConversationId;
            return (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={cn(
                  'mb-1 w-full rounded-lg border-l-2 px-3 py-2.5 text-left transition-colors',
                  active
                    ? 'border-primary bg-accent'
                    : 'border-transparent hover:bg-muted'
                )}
              >
                <div className="truncate text-sm font-medium text-foreground">
                  {conv.title || 'New Conversation'}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {conv.message_count} messages
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Delete old stylesheet**

```bash
rm frontend/src/components/Sidebar.css
```

- [ ] **Step 3: Build** — `cd frontend && npm run build`; expected success.

- [ ] **Step 4: Visual check** — `npm run dev`: sidebar shows gradient mark, theme toggle (click it — whole app flips light/dark and persists on reload), violet-accented active conversation, hover states on others.

- [ ] **Step 5: Commit**

```bash
cd /Users/nickw/llm-council
git add frontend/src/components/Sidebar.jsx
git rm frontend/src/components/Sidebar.css
git commit -m "feat(ui): redesign sidebar with shadcn button, theme toggle, active states"
```

---

### Task 4: ChatInterface shell — empty state, user bubble, composer, loading skeletons

Rewrite the chat container. Stage components are restyled in Tasks 5–7; this task imports them as-is (they still render with old CSS until then, which is fine — build stays green).

**Files:**
- Modify: `frontend/src/components/ChatInterface.jsx`
- Delete: `frontend/src/components/ChatInterface.css`

**Interfaces:**
- Consumes: `conversation` (`{messages:[...]}` or null), `onSendMessage(content)`, `isLoading`; `Stage1/2/3`; `Button`, `Textarea`, `Card`, `Skeleton` from `@/components/ui/*`.
- Produces: an exported `<StageLoading label=...>` is NOT shared — keep it local to this file.

- [ ] **Step 1: Rewrite `frontend/src/components/ChatInterface.jsx`**

```jsx
import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { ArrowUp } from 'lucide-react';
import Stage1 from './Stage1';
import Stage2 from './Stage2';
import Stage3 from './Stage3';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function StageLoading({ label }) {
  return (
    <Card className="mb-3.5 gap-0 p-4">
      <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <Skeleton className="mb-2 h-3 w-3/4" />
      <Skeleton className="mb-2 h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </Card>
  );
}

function Composer({ onSendMessage, isLoading }) {
  const [input, setInput] = useState('');

  const submit = (e) => {
    e?.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit(e);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="flex items-end gap-2 border-t border-border bg-background px-4 py-3"
    >
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={isLoading}
        rows={1}
        placeholder="Ask the council… (Enter to send, Shift+Enter for new line)"
        className="max-h-40 min-h-[44px] flex-1 resize-none rounded-xl"
      />
      <Button
        type="submit"
        size="icon"
        disabled={!input.trim() || isLoading}
        className="h-11 w-11 shrink-0 rounded-xl"
        aria-label="Send"
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
    </form>
  );
}

export default function ChatInterface({ conversation, onSendMessage, isLoading }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  if (!conversation) {
    return (
      <main className="flex flex-1 items-center justify-center bg-background">
        <Hero subtitle="Create a new conversation to get started" />
      </main>
    );
  }

  const empty = conversation.messages.length === 0;

  return (
    <main className="flex flex-1 flex-col overflow-hidden bg-background">
      <div className="flex-1 overflow-y-auto">
        {empty ? (
          <div className="flex h-full items-center justify-center">
            <Hero subtitle="Ask a question to consult the LLM Council" />
          </div>
        ) : (
          <div className="mx-auto w-full max-w-3xl px-4 py-6">
            {conversation.messages.map((msg, index) =>
              msg.role === 'user' ? (
                <div key={index} className="mb-6 flex justify-end">
                  <div className="markdown max-w-[75%] rounded-[16px_16px_4px_16px] bg-foreground px-4 py-2.5 text-background">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div key={index} className="mb-8">
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-primary">
                    <span
                      className="h-[18px] w-[18px] rounded-md"
                      style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}
                    />
                    LLM Council
                  </div>

                  {msg.loading?.stage1 && <StageLoading label="Stage 1 · collecting responses…" />}
                  {msg.stage1 && <Stage1 responses={msg.stage1} />}

                  {msg.loading?.stage2 && <StageLoading label="Stage 2 · peer rankings…" />}
                  {msg.stage2 && (
                    <Stage2
                      rankings={msg.stage2}
                      labelToModel={msg.metadata?.label_to_model}
                      aggregateRankings={msg.metadata?.aggregate_rankings}
                    />
                  )}

                  {msg.loading?.stage3 && <StageLoading label="Stage 3 · final synthesis…" />}
                  {msg.stage3 && <Stage3 finalResponse={msg.stage3} />}
                </div>
              )
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <Composer onSendMessage={onSendMessage} isLoading={isLoading} />
    </main>
  );
}

function Hero({ subtitle }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 text-center">
      <div
        className="h-12 w-12 rounded-xl"
        style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}
      />
      <h2 className="text-2xl font-bold tracking-[-0.02em]">Welcome to LLM Council</h2>
      <p className="text-muted-foreground">{subtitle}</p>
      <span className="mt-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
        3-stage deliberation
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Delete old stylesheet**

```bash
rm frontend/src/components/ChatInterface.css
```

- [ ] **Step 3: Build** — `cd frontend && npm run build`; expected success.

- [ ] **Step 4: Visual check** — `npm run dev`: select a conversation → user bubbles right-aligned dark, council label with gradient dot, pinned composer at bottom; send a message and confirm the three skeleton cards appear and get replaced as each stage streams in. Empty conversation shows the centered hero with the badge.

- [ ] **Step 5: Commit**

```bash
cd /Users/nickw/llm-council
git add frontend/src/components/ChatInterface.jsx
git rm frontend/src/components/ChatInterface.css
git commit -m "feat(ui): redesign chat shell with hero, bubbles, pinned composer, skeletons"
```

---

### Task 5: Stage 1 — Individual responses card

**Files:**
- Modify: `frontend/src/components/Stage1.jsx`
- Delete: `frontend/src/components/Stage1.css`

**Interfaces:**
- Consumes: `responses` = `[{model, response}]`; `Card`, `Badge` from `@/components/ui/*`; `cn` from `@/lib/utils`. Local helper `shortName(model)` = `model.split('/')[1] || model`.

- [ ] **Step 1: Rewrite `frontend/src/components/Stage1.jsx`**

```jsx
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const shortName = (m) => m.split('/')[1] || m;

export default function Stage1({ responses }) {
  const [active, setActive] = useState(0);
  if (!responses || responses.length === 0) return null;

  return (
    <Card className="mb-3.5 gap-0 overflow-hidden p-0">
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
          Stage 1
        </span>
        <span className="text-sm font-semibold">Individual responses</span>
        <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-success">
          <Check className="h-3.5 w-3.5" /> {responses.length} models
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 px-4 pt-3">
        {responses.map((r, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={cn(
              'rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
              active === i
                ? 'bg-foreground text-background'
                : 'bg-secondary text-muted-foreground hover:bg-muted'
            )}
          >
            {shortName(r.model)}
          </button>
        ))}
      </div>

      <div className="px-4 pb-4 pt-3">
        <div className="mb-1.5 text-xs text-muted-foreground">{responses[active].model}</div>
        <div className="markdown">
          <ReactMarkdown>{responses[active].response}</ReactMarkdown>
        </div>
      </div>
    </Card>
  );
}
```

- [ ] **Step 2: Delete old stylesheet** — `rm frontend/src/components/Stage1.css`

- [ ] **Step 3: Build** — `cd frontend && npm run build`; expected success.

- [ ] **Step 4: Visual check** — `npm run dev`: Stage 1 renders as a card with the STAGE 1 label, ✓ models badge, pill tabs that switch the markdown body.

- [ ] **Step 5: Commit**

```bash
cd /Users/nickw/llm-council
git add frontend/src/components/Stage1.jsx
git rm frontend/src/components/Stage1.css
git commit -m "feat(ui): redesign Stage 1 as a stage card with pill tabs"
```

---

### Task 6: Stage 3 — Chairman's synthesis card

**Files:**
- Modify: `frontend/src/components/Stage3.jsx`
- Delete: `frontend/src/components/Stage3.css`

**Interfaces:**
- Consumes: `finalResponse` = `{model, response}`; local `shortName`.

- [ ] **Step 1: Rewrite `frontend/src/components/Stage3.jsx`**

```jsx
import ReactMarkdown from 'react-markdown';
import { Check } from 'lucide-react';

const shortName = (m) => m.split('/')[1] || m;

export default function Stage3({ finalResponse }) {
  if (!finalResponse) return null;

  return (
    <div className="mb-3.5 rounded-[14px] border border-primary/30 bg-accent/40 p-4">
      <div className="flex items-center gap-2.5">
        <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-primary/70">
          Stage 3
        </span>
        <span className="text-sm font-semibold text-accent-foreground">
          Chairman&apos;s synthesis
        </span>
        <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-success">
          <Check className="h-3.5 w-3.5" /> final
        </span>
      </div>
      <div className="mt-1 text-xs text-muted-foreground">
        Chairman: {shortName(finalResponse.model)}
      </div>
      <div className="markdown mt-2">
        <ReactMarkdown>{finalResponse.response}</ReactMarkdown>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Delete old stylesheet** — `rm frontend/src/components/Stage3.css`

- [ ] **Step 3: Build** — `cd frontend && npm run build`; expected success.

- [ ] **Step 4: Visual check** — `npm run dev`: Stage 3 renders as a violet-tinted card with the chairman caption and synthesized markdown; readable in both light and dark.

- [ ] **Step 5: Commit**

```bash
cd /Users/nickw/llm-council
git add frontend/src/components/Stage3.jsx
git rm frontend/src/components/Stage3.css
git commit -m "feat(ui): redesign Stage 3 as a violet synthesis card"
```

---

### Task 7: Stage 2 — Peer rankings + "street cred" leaderboard

The most involved component. Preserve the de-anonymization logic and the explanatory copy verbatim; add the leaderboard with relative bars.

**Files:**
- Modify: `frontend/src/components/Stage2.jsx`
- Delete: `frontend/src/components/Stage2.css`

**Interfaces:**
- Consumes: `rankings` = `[{model, ranking, parsed_ranking:[label]}]`, `labelToModel` = `{ "Response A": "vendor/model", ... }`, `aggregateRankings` = `[{model, average_rank, rankings_count}]` (already sorted best-first); `Card`, `Badge`; local `shortName`, `deAnonymizeText`, `barWidth`.

- [ ] **Step 1: Rewrite `frontend/src/components/Stage2.jsx`**

```jsx
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const shortName = (m) => m.split('/')[1] || m;

function deAnonymizeText(text, labelToModel) {
  if (!labelToModel) return text;
  let result = text;
  Object.entries(labelToModel).forEach(([label, model]) => {
    result = result.replace(new RegExp(label, 'g'), `**${shortName(model)}**`);
  });
  return result;
}

// Lower average_rank is better → wider bar. Normalized across the list, floored at 30%.
function barWidth(agg, all) {
  const avgs = all.map((a) => a.average_rank);
  const min = Math.min(...avgs);
  const max = Math.max(...avgs);
  if (max === min) return 100;
  const t = (agg.average_rank - min) / (max - min); // 0 = best
  return Math.round((1 - t) * 70 + 30);
}

export default function Stage2({ rankings, labelToModel, aggregateRankings }) {
  const [active, setActive] = useState(0);
  if (!rankings || rankings.length === 0) return null;

  return (
    <Card className="mb-3.5 gap-0 overflow-hidden p-0">
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
          Stage 2
        </span>
        <span className="text-sm font-semibold">Peer rankings · anonymized</span>
        <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-success">
          <Check className="h-3.5 w-3.5" /> scored
        </span>
      </div>

      <p className="px-4 pt-3 text-xs leading-relaxed text-muted-foreground">
        Each model evaluated all responses (anonymized as Response A, B, C, etc.) and provided
        rankings. Below, model names are shown in <strong className="text-foreground">bold</strong>{' '}
        for readability, but the original evaluation used anonymous labels.
      </p>

      <div className="flex flex-wrap gap-1.5 px-4 pt-3">
        {rankings.map((r, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={cn(
              'rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
              active === i
                ? 'bg-foreground text-background'
                : 'bg-secondary text-muted-foreground hover:bg-muted'
            )}
          >
            {shortName(rankings[i].model)}
          </button>
        ))}
      </div>

      <div className="px-4 pb-3 pt-3">
        <div className="mb-1.5 text-xs text-muted-foreground">{rankings[active].model}</div>
        <div className="markdown">
          <ReactMarkdown>
            {deAnonymizeText(rankings[active].ranking, labelToModel)}
          </ReactMarkdown>
        </div>

        {rankings[active].parsed_ranking?.length > 0 && (
          <div className="mt-3 rounded-lg bg-secondary px-3 py-2.5">
            <div className="mb-1.5 text-xs font-semibold">Extracted ranking</div>
            <ol className="ml-4 list-decimal text-xs text-muted-foreground">
              {rankings[active].parsed_ranking.map((label, i) => (
                <li key={i}>
                  {labelToModel?.[label] ? shortName(labelToModel[label]) : label}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {aggregateRankings?.length > 0 && (
        <div className="border-t border-border px-4 py-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
            Aggregate · street cred
          </div>
          <p className="mb-2 mt-0.5 text-xs text-muted-foreground">
            Combined across all peer evaluations (lower average rank is better).
          </p>
          <div className="space-y-1.5">
            {aggregateRankings.map((agg, i) => {
              const top = i === 0;
              return (
                <div
                  key={i}
                  className={cn(
                    'flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm',
                    top ? 'bg-accent' : 'bg-secondary/60'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-[22px] w-[22px] items-center justify-center rounded-[7px] text-[11px] font-bold',
                      top ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="font-semibold">{shortName(agg.model)}</span>
                  <span className="ml-auto flex w-[70px] items-center">
                    <span className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                      <span
                        className="block h-full rounded-full bg-primary"
                        style={{ width: `${barWidth(agg, aggregateRankings)}%` }}
                      />
                    </span>
                  </span>
                  <span className="w-[120px] shrink-0 text-right text-[11px] text-muted-foreground">
                    avg {agg.average_rank.toFixed(2)} · {agg.rankings_count} votes
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
```

- [ ] **Step 2: Delete old stylesheet** — `rm frontend/src/components/Stage2.css`

- [ ] **Step 3: Build** — `cd frontend && npm run build`; expected success.

- [ ] **Step 4: Visual check** — `npm run dev` on a conversation that has Stage 2 data: tabs switch evaluations; de-anonymized bold model names appear; "Extracted ranking" lists models; the leaderboard shows ranked rows with violet bars (rank 1 widest + tinted), avg/votes on the right. Confirm bars vary (not all 100%).

- [ ] **Step 5: Commit**

```bash
cd /Users/nickw/llm-council
git add frontend/src/components/Stage2.jsx
git rm frontend/src/components/Stage2.css
git commit -m "feat(ui): redesign Stage 2 with pill tabs and street-cred leaderboard"
```

---

### Task 8: Cleanup pass + final verification

**Files:**
- Inspect/remove: any leftover `.css` imports; stray `react.svg`/`vite.svg` references are fine to leave.

- [ ] **Step 1: Confirm no dead CSS imports remain**

Run: `cd frontend && grep -rn "\.css'" src` (expect only `import './index.css'` in `main.jsx`)
Expected: the only match is `src/main.jsx`. If any component still imports a deleted `.css`, remove that import line.

- [ ] **Step 2: Confirm old global class is gone**

Run: `cd frontend && grep -rn "markdown-content" src`
Expected: no matches (all replaced by `markdown`). If any remain, change them to `className="markdown"`.

- [ ] **Step 3: Lint**

Run: `cd frontend && npm run lint`
Expected: no errors. Fix any unused-import/undefined warnings the rewrite introduced.

- [ ] **Step 4: Production build**

Run: `cd frontend && npm run build`
Expected: success, no warnings about missing modules.

- [ ] **Step 5: Full manual verification** (`npm run dev`) against the spec checklist:
  - Sidebar: list, new-conversation, active highlight, theme toggle persists across reload.
  - Send a message: all three stages stream in with skeleton→content transitions.
  - Stage 1/2 tabs switch; Stage 2 leaderboard bars render; Stage 3 synthesis card.
  - Empty-state hero renders for a fresh conversation.
  - Enter sends; Shift+Enter inserts a newline.
  - Toggle dark mode and re-check every surface for contrast.

- [ ] **Step 6: Commit any cleanup**

```bash
cd /Users/nickw/llm-council
git add -A frontend/src
git commit -m "chore(ui): remove dead CSS references after shadcn redesign"
```

(If Steps 1–2 found nothing to change and lint/build are clean, skip this commit.)

---

## Self-Review notes

- **Spec coverage:** brand tokens (Task 1), Tailwind v4 + shadcn (Task 1), `@/` alias (Task 1), light/dark toggle (Task 2), App shell (Task 2), Sidebar (Task 3), ChatInterface empty/bubble/composer/skeletons (Task 4), Stage 1 (Task 5), Stage 3 (Task 6), Stage 2 + leaderboard (Task 7), dead-CSS removal (Tasks 2–8). Error toast was deliberately dropped in favor of preserved console logging + existing rollback (spec marked `sonner` optional and the shadcn sonner wrapper depends on `next-themes`, which doesn't fit a Vite app) — graceful partial rendering is preserved.
- **Props frozen:** every rewritten component keeps its original prop names/shape; `App.jsx` passes them unchanged.
- **Naming consistency:** `shortName`, `deAnonymizeText`, `barWidth`, `StageLoading`, `Composer`, `Hero`, `useTheme`, `ThemeToggle` used consistently; `.markdown` wrapper class consistent across all stages and `index.css`.

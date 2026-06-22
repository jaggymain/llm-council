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

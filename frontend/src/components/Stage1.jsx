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

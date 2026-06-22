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

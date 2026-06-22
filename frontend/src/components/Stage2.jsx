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
            {shortName(r.model)}
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

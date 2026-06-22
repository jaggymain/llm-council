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

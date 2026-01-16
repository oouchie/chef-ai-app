'use client';

import { ChatSession } from '@/types';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  isOpen,
  onClose,
}: SidebarProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getSessionPreview = (session: ChatSession) => {
    const lastMessage = session.messages[session.messages.length - 1];
    if (!lastMessage) return 'New conversation';
    return lastMessage.content.slice(0, 50) + (lastMessage.content.length > 50 ? '...' : '');
  };

  // Group sessions by date
  const groupedSessions = sessions.reduce((acc, session) => {
    const date = formatDate(session.updatedAt);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(session);
    return acc;
  }, {} as Record<string, ChatSession[]>);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-50 w-72 glass-strong border-r border-white/20 transform transition-transform duration-300 ease-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md shadow-primary/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <h2 className="font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Chat History</h2>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2.5 btn-glass rounded-xl hover:shadow-glow-primary transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* New chat button */}
        <div className="p-4">
          <button
            onClick={onNewSession}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 btn-gradient rounded-xl font-semibold hover:shadow-glow-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Conversation
          </button>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {sessions.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <span className="text-3xl">💬</span>
              </div>
              <p className="text-sm font-medium text-muted">No conversations yet</p>
              <p className="text-xs text-muted/70 mt-1">Start chatting to see your history</p>
            </div>
          ) : (
            <div className="space-y-5">
              {Object.entries(groupedSessions).map(([date, dateSessions]) => (
                <div key={date}>
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 px-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary to-accent"></span>
                    {date}
                  </h3>
                  <div className="space-y-1.5">
                    {dateSessions.map((session) => (
                      <div
                        key={session.id}
                        className={`group flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                          currentSessionId === session.id
                            ? 'glass-card border-l-3 border-l-primary shadow-glow-primary bg-gradient-to-r from-primary/5 to-accent/5'
                            : 'hover:glass-card border border-transparent hover:border-white/20'
                        }`}
                        onClick={() => onSelectSession(session.id)}
                      >
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${
                          currentSessionId === session.id
                            ? 'bg-gradient-to-br from-primary to-accent shadow-sm'
                            : 'bg-gradient-to-br from-primary/10 to-accent/10'
                        }`}>
                          {currentSessionId === session.id ? '🗨️' : '💬'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm truncate ${
                            currentSessionId === session.id ? 'text-primary' : ''
                          }`}>
                            {session.title}
                          </p>
                          <p className="text-xs text-muted truncate mt-0.5 leading-relaxed">
                            {getSessionPreview(session)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(session.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-gradient-to-r from-primary/5 via-transparent to-accent/5">
          <p className="text-xs text-center text-muted">
            Powered by{' '}
            <a
              href="https://1865freemoney.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hover:underline"
            >
              1865 Free Money
            </a>
          </p>
          <p className="text-xs text-center text-muted/70 mt-1">
            Digital Excellence
          </p>
        </div>
      </aside>
    </>
  );
}

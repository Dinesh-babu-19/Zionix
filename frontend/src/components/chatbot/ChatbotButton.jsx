import React from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';

export default function ChatbotButton({ isOpen, onClick, unreadCount }) {
  return (
    <button
      onClick={onClick}
      aria-label={isOpen ? "Close Zionix assistant" : "Open Zionix assistant"}
      aria-expanded={isOpen}
      className={`fixed bottom-6 right-6 z-50 flex items-center justify-center p-3.5 rounded-full shadow-2xl transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-secondary/40 select-none group ${
        isOpen
          ? 'bg-slate-800 text-slate-200 rotate-90 scale-90'
          : 'bg-gradient-to-tr from-primary via-[#0a1a3a] to-primary-container text-amber-200 hover:scale-105 hover:shadow-amber-500/10'
      }`}
    >
      <div className="relative flex items-center justify-center">
        {isOpen ? (
          <span className="text-xl font-bold leading-none">✕</span>
        ) : (
          <>
            <MessageSquare className="w-6 h-6 text-amber-300 transition-transform group-hover:scale-110" />
            <Sparkles className="w-3.5 h-3.5 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
          </>
        )}
      </div>

      {!isOpen && (
        <span className="sr-only">Open Zionix Assistant</span>
      )}
    </button>
  );
}

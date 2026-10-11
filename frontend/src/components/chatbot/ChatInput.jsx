import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

export default function ChatInput({ onSendMessage, isLoading, isOpen }) {
  const [text, setText] = useState('');
  const inputRef = useRef(null);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    onSendMessage(trimmed);
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 bg-white border-t border-slate-200/80 rounded-b-2xl relative"
    >
      <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-secondary/30 focus-within:border-secondary transition-all">
        <input
          ref={inputRef}
          type="text"
          value={text}
          maxLength={500}
          disabled={isLoading}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isLoading ? "Zionaviel is responding..." : "Ask about Scripture, devotionals, prayer..."}
          aria-label="Ask Zionaviel assistant a question"
          className="flex-1 bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none disabled:opacity-60"
        />

        <button
          type="submit"
          disabled={!text.trim() || isLoading}
          aria-label="Send message"
          className="p-1.5 rounded-lg bg-primary text-amber-200 hover:bg-primary-container disabled:opacity-40 disabled:cursor-not-allowed transition-all focus:outline-none active:scale-95 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between mt-1.5 px-1 text-[10px] text-slate-400">
        <span>Grounded in Zionaviel scripture & devotionals</span>
        {text.length > 350 && (
          <span className={text.length >= 480 ? 'text-red-500 font-semibold' : ''}>
            {text.length}/500
          </span>
        )}
      </div>
    </form>
  );
}

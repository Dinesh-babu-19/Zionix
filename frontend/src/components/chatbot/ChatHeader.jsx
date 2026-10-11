import React from 'react';
import { Sparkles, RotateCcw, X } from 'lucide-react';

export default function ChatHeader({ onClose, onReset }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-primary via-[#081b40] to-primary-container text-white border-b border-white/10 rounded-t-2xl select-none">
      <div className="flex items-center space-x-2.5">
        <div className="w-9 h-9 rounded-full bg-secondary/30 border border-secondary/50 flex items-center justify-center shadow-inner">
          <Sparkles className="w-5 h-5 text-amber-300" />
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <h2 className="text-sm font-semibold tracking-wide text-white">How can we help?</h2>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Online" />
          </div>
          <p className="text-xs text-amber-200/80 font-normal leading-tight">
            Explore Zionaviel, Scripture, devotionals & prayer
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-1">
        <button
          onClick={onReset}
          title="Start new conversation"
          aria-label="Start new conversation"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-300/40"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={onClose}
          title="Close chat"
          aria-label="Close chat"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-300/40"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

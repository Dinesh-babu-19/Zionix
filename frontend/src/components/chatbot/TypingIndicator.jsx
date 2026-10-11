import React from 'react';
import { Sparkles } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <div className="flex items-start space-x-2 my-2 animate-fadeIn">
      <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
        <Sparkles className="w-3.5 h-3.5 text-secondary" />
      </div>
      <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-sm">
        <div className="flex items-center space-x-1.5 py-1">
          <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce"></div>
          <span className="text-xs text-slate-400 font-medium ml-1">Searching Zionix...</span>
        </div>
      </div>
    </div>
  );
}

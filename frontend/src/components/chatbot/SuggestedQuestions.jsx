import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function SuggestedQuestions({ questions, onSelectQuestion }) {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="mt-2 mb-3 pl-9">
      <p className="text-[11px] font-medium text-slate-500 mb-1.5 flex items-center space-x-1">
        <HelpCircle className="w-3 h-3 text-secondary" />
        <span>Related questions:</span>
      </p>
      <div className="flex flex-col space-y-1.5">
        {questions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => onSelectQuestion(q)}
            className="text-left text-xs bg-slate-50 hover:bg-amber-50 active:bg-amber-100 text-slate-700 hover:text-amber-950 border border-slate-200/80 hover:border-amber-300 rounded-lg px-2.5 py-1.5 transition-all focus:outline-none focus:ring-1 focus:ring-amber-500/40"
          >
            "{q}"
          </button>
        ))}
      </div>
    </div>
  );
}

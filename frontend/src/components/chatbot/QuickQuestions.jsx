import React from 'react';
import { BookOpen, Sun, Heart, Compass, Search, Sparkles } from 'lucide-react';

const categoryIcons = {
  Scripture: BookOpen,
  Devotionals: Sun,
  Prayer: Heart,
  Gospel: Compass,
  General: Sparkles
};

export default function QuickQuestions({ questions, onSelectQuestion }) {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="my-3 px-1">
      <div className="flex items-center space-x-1.5 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        <Sparkles className="w-3.5 h-3.5 text-secondary" />
        <span>Suggested Questions</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {questions.map((item, idx) => {
          const Icon = categoryIcons[item.category] || BookOpen;
          return (
            <button
              key={idx}
              onClick={() => onSelectQuestion(item.question)}
              className="text-left text-xs bg-white hover:bg-amber-50/80 active:bg-amber-100/90 text-slate-700 hover:text-amber-950 border border-slate-200 hover:border-amber-300/80 rounded-xl px-2.5 py-1.5 transition-all shadow-2xs hover:shadow-xs flex items-center space-x-1.5 group focus:outline-none focus:ring-2 focus:ring-secondary/30"
            >
              <Icon className="w-3 h-3 text-secondary shrink-0 group-hover:scale-110 transition-transform" />
              <span className="line-clamp-1">{item.question}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

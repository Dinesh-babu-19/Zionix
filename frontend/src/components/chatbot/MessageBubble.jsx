import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Compass } from 'lucide-react';

export default function MessageBubble({ message, onNavigate }) {
  const navigate = useNavigate();
  const isUser = message.role === 'user';

  const handleActionClick = (path) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  // Basic markdown parser for bolding, line breaks, and internal link formatting
  const renderFormattedText = (text) => {
    if (!text) return null;

    // Split paragraphs
    const paragraphs = text.split('\n\n');

    return paragraphs.map((para, pIdx) => {
      // Parse markdown bold **bold**
      const parts = para.split(/(\*\*.*?\*\*)/g);

      return (
        <p key={pIdx} className={pIdx > 0 ? "mt-2" : ""}>
          {parts.map((part, idx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={idx} className="font-semibold text-slate-900">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className={`flex items-start space-x-2 my-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary to-primary-container text-amber-300 border border-amber-300/30 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      )}

      <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
            isUser
              ? 'bg-primary text-white rounded-tr-xs shadow-xs'
              : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs shadow-xs'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="space-y-1">{renderFormattedText(message.content)}</div>
          )}
        </div>

        {/* Action navigation buttons */}
        {!isUser && message.actions && message.actions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {message.actions.map((act, idx) => (
              <button
                key={idx}
                onClick={() => handleActionClick(act.path)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-amber-100/70 hover:from-amber-100 hover:to-amber-200 text-amber-900 border border-amber-300/60 rounded-full text-xs font-medium shadow-2xs hover:shadow-xs transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              >
                <Compass className="w-3 h-3 text-secondary" />
                <span>{act.label}</span>
                <ArrowRight className="w-2.5 h-2.5 text-secondary" />
              </button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span className={`text-[10px] text-slate-400 mt-1 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {message.timestamp
            ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : ''}
        </span>
      </div>
    </div>
  );
}

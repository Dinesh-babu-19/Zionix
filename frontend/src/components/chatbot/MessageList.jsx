import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import QuickQuestions from './QuickQuestions';
import SuggestedQuestions from './SuggestedQuestions';
import TypingIndicator from './TypingIndicator';
import { Sparkles } from 'lucide-react';

export default function MessageList({
  messages,
  isLoading,
  quickQuestions,
  onSelectQuestion,
  onNavigate
}) {
  const scrollRef = useRef(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const lastMessage = messages[messages.length - 1];
  const hasUserMessages = messages.some(m => m.role === 'user');

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-3.5 py-3 space-y-1 text-slate-800 bg-[#fbfbf9]"
      style={{ scrollBehavior: 'smooth' }}
    >
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-amber-50/90 to-amber-100/40 border border-amber-200/70 rounded-2xl p-3.5 mb-3 text-slate-800 shadow-2xs">
        <div className="flex items-start space-x-2.5">
          <div className="w-7 h-7 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-secondary" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-900 tracking-wide">
              Welcome to Zionaviel
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              How can I help you explore Scripture, devotionals, prayer, or the gospel? Select a topic below or type your question.
            </p>
          </div>
        </div>
      </div>

      {/* Initial Quick Questions (show if no user message yet) */}
      {!hasUserMessages && (
        <QuickQuestions
          questions={quickQuestions}
          onSelectQuestion={onSelectQuestion}
        />
      )}

      {/* Render Conversation Messages */}
      {messages.map((msg, index) => (
        <React.Fragment key={index}>
          <MessageBubble
            message={msg}
            onNavigate={onNavigate}
          />
        </React.Fragment>
      ))}

      {/* Typing Indicator */}
      {isLoading && <TypingIndicator />}

      {/* Suggested Follow-up Questions for the last assistant response */}
      {!isLoading && lastMessage && lastMessage.role === 'assistant' && lastMessage.relatedQuestions && lastMessage.relatedQuestions.length > 0 && (
        <SuggestedQuestions
          questions={lastMessage.relatedQuestions}
          onSelectQuestion={onSelectQuestion}
        />
      )}
    </div>
  );
}

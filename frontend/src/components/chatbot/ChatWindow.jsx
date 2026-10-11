import React, { useEffect, useRef } from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

export default function ChatWindow({
  isOpen,
  onClose,
  onReset,
  messages,
  isLoading,
  quickQuestions,
  onSendMessage,
  onNavigate
}) {
  const windowRef = useRef(null);

  // Listen for Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={windowRef}
      role="dialog"
      aria-label="Zionix Website Assistant"
      aria-modal="false"
      className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[380px] h-[490px] sm:h-[530px] max-h-[calc(100vh-48px)] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden animate-fadeIn transition-all duration-200"
      style={{
        boxShadow: '0 16px 40px -10px rgba(4, 21, 52, 0.3), 0 0 1px 1px rgba(117, 91, 0, 0.12)'
      }}
    >
      <ChatHeader onClose={onClose} onReset={onReset} />

      <MessageList
        messages={messages}
        isLoading={isLoading}
        quickQuestions={quickQuestions}
        onSelectQuestion={onSendMessage}
        onNavigate={onNavigate}
      />

      <ChatInput
        isOpen={isOpen}
        isLoading={isLoading}
        onSendMessage={onSendMessage}
      />
    </div>
  );
}

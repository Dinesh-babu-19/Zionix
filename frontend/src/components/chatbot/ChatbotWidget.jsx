import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatbotButton from './ChatbotButton';
import ChatWindow from './ChatWindow';

const DEFAULT_QUICK_QUESTIONS = [
  { category: "Scripture", question: "Where can I read the Bible?" },
  { category: "Scripture", question: "Can I search for a Bible verse?" },
  { category: "Devotionals", question: "What is the Morning Reflection?" },
  { category: "Devotionals", question: "Where can I find previous reflections?" },
  { category: "Prayer", question: "How can I submit a prayer request?" },
  { category: "Prayer", question: "Can I make my prayer private?" },
  { category: "Gospel", question: "Where can I learn about salvation?" },
  { category: "Gospel", question: "What Christian foundations does Zionix cover?" }
];

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [quickQuestions, setQuickQuestions] = useState(DEFAULT_QUICK_QUESTIONS);
  const navigate = useNavigate();

  // Lazy fetch quick questions on first open
  const fetchQuestions = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/quick-questions');
      if (res.ok) {
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          setQuickQuestions(data.questions);
        }
      }
    } catch (err) {
      // Gracefully use default questions
    }
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      fetchQuestions();
    }
    setIsOpen(prev => !prev);
  };

  const handleReset = () => {
    setMessages([]);
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleSendMessage = async (userText) => {
    if (!userText || isLoading) return;

    const userMessage = {
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Build safe conversation history for context
      const historyPayload = messages.slice(-4).map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: historyPayload
        })
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMessage = {
          role: 'assistant',
          content: data.reply || "I'm here to help you explore Zionix.",
          actions: data.actions || [],
          relatedQuestions: data.relatedQuestions || [],
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        const errData = await res.json().catch(() => ({}));
        const fallbackText = errData.error || "Something went wrong while processing your question. Please try again.";
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: fallbackText,
            actions: [{ label: "Explore Zionix", path: "/" }],
            relatedQuestions: ["Where can I read the Bible?", "What is the Scripture of the Day?"],
            timestamp: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "Unable to reach the server. Please check your internet connection and try again.",
          actions: [{ label: "Explore Zionix", path: "/" }],
          relatedQuestions: ["Where can I read the Bible?", "What is the Scripture of the Day?"],
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <ChatbotButton
          isOpen={false}
          onClick={handleToggle}
        />
      )}

      <ChatWindow
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onReset={handleReset}
        messages={messages}
        isLoading={isLoading}
        quickQuestions={quickQuestions}
        onSendMessage={handleSendMessage}
        onNavigate={handleNavigate}
      />
    </>
  );
}

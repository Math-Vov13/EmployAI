'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { MessageList, Message } from './MessageList';
import { MessageInput } from './MessageInput';

interface ChatInterfaceProps {
  documentId: string;
  documentTitle: string;
}

export function ChatInterface({ documentId, documentTitle }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendMessage = async (userMessage: string) => {
    setLoading(true);
    setError('');

    // Add user message to chat
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);

    try {
      // Prepare chat history (exclude timestamps for API)
      const chatHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch('/api/chat/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          message: userMessage,
          chatHistory,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to get response from AI');
        setLoading(false);
        return;
      }

      // Add AI response to chat
      const aiMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full h-[600px] flex flex-col">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-t-lg">
        <h3 className="font-semibold text-lg">AI Assistant</h3>
        <p className="text-sm opacity-90">Chatting about: {documentTitle}</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} />
      </div>

      {/* Input */}
      <MessageInput onSendMessage={handleSendMessage} disabled={loading} />
    </Card>
  );
}
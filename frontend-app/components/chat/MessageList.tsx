'use client';

import { useEffect, useRef } from 'react';
import { Card, CardBody } from '@heroui/react';
import { Avatar } from '@heroui/react';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="text-6xl mb-4">💬</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Start a conversation
        </h3>
        <p className="text-gray-500 max-w-md">
          Ask me anything about this document! I can summarize it, answer questions, or help you find specific information.
        </p>
        <div className="mt-6 text-sm text-gray-400">
          <p className="mb-2">Try asking:</p>
          <ul className="text-left space-y-1">
            <li>• "Summarize this document"</li>
            <li>• "What are the key points?"</li>
            <li>• "Tell me about [specific topic]"</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex gap-3 ${
            message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          <Avatar
            size="sm"
            name={message.role === 'user' ? 'You' : 'AI'}
            className={
              message.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
            }
          />

          <Card
            className={`max-w-[80%] ${
              message.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            <CardBody className="py-3 px-4">
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              {message.timestamp && (
                <p
                  className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString()}
                </p>
              )}
            </CardBody>
          </Card>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

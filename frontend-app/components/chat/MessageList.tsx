"use client";

import { useEffect, useRef } from "react";
import { format } from "date-fns";

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="text-6xl mb-4">💬</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Start a conversation
        </h3>
        <p className="text-gray-500">
          Ask questions about the document and get AI-powered answers
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[80%] rounded-lg p-4 ${
              message.role === "user"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-900"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold">
                {message.role === "user" ? "👤 You" : "🤖 AI Assistant"}
              </span>
              <span className="text-xs opacity-70">
                {format(message.timestamp, "HH:mm")}
              </span>
            </div>
            <div className="text-sm whitespace-pre-wrap wrap-break-words">
              {message.content}
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

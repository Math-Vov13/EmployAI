"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MarkdownMessage } from "./MarkdownMessage";

interface ToolCall {
  name: string;
  args: any;
  timestamp: Date;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
}

interface ChatMessagesProps {
  messages: Message[];
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  if (messages.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">💬</div>
        <h2 className="text-2xl font-bold mb-2">Start a Conversation</h2>
        <p className="text-gray-600 mb-4">
          Ask me anything about your documents!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 max-w-2xl mx-auto">
          <Card className="cursor-pointer hover:bg-gray-50">
            <CardContent className="p-4">
              <p className="font-medium text-sm">"Summarize the key points"</p>
              <p className="text-xs text-gray-500 mt-1">Get a quick overview</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-gray-50">
            <CardContent className="p-4">
              <p className="font-medium text-sm">
                "What does this document say about..."
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Ask specific questions
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200"
              }`}
            >
              {message.toolCalls && message.toolCalls.length > 0 && (
                <div className="mb-3 space-y-1">
                  {message.toolCalls.map((tool, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-xs bg-gray-100 dark:bg-gray-800 rounded px-2 py-1"
                    >
                      <span className="text-gray-500">🔧</span>
                      <span className="font-mono font-semibold text-purple-600 dark:text-purple-400">
                        {tool.name}
                      </span>
                      {tool.args && Object.keys(tool.args).length > 0 && (
                        <span className="text-gray-500 truncate max-w-xs">
                          ({JSON.stringify(tool.args).substring(0, 50)}
                          {JSON.stringify(tool.args).length > 50 ? "..." : ""})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <MarkdownMessage
                content={message.content}
                isUser={message.role === "user"}
              />
              <p
                className={`text-xs mt-2 ${message.role === "user" ? "text-blue-100" : "text-gray-400"}`}
              >
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

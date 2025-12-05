"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { FiMessageSquare } from "react-icons/fi";

interface Message {
  role: string;
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  userId: string;
  documentId: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

interface User {
  name: string;
  email: string;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  user: User | null;
  onConversationSelect: (conversation: Conversation) => void;
  onNewConversation?: () => void;
}

export function ChatSidebar({
  conversations,
  currentConversation,
  user,
  onConversationSelect,
  onNewConversation,
}: ChatSidebarProps) {
  const router = useRouter();

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard")}
          className="w-full justify-start"
        >
          ← Dashboard
        </Button>
      </div>

      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-lg">Conversations</h2>
          {onNewConversation && (
            <Button
              size="sm"
              variant="outline"
              onClick={onNewConversation}
              className="text-xs"
            >
              + New
            </Button>
          )}
        </div>
        <p className="text-xs text-gray-500">Your chat history</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {conversations.length === 0 ? (
            <div className="text-center py-8">
              <FiMessageSquare className="mx-auto text-gray-400 text-3xl mb-2" />
              <p className="text-sm text-gray-500">No conversations yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Start chatting to create your first conversation
              </p>
            </div>
          ) : (
            conversations.map((conv) => {
              const lastMessage =
                conv.messages[conv.messages.length - 1]?.content || "";
              const title =
                conv.messages[0]?.content.substring(0, 50) + "..." ||
                "New Chat";

              return (
                <Card
                  key={conv.id}
                  className={`mb-2 cursor-pointer hover:bg-gray-50 ${
                    currentConversation?.id === conv.id
                      ? "border-blue-500 bg-blue-50"
                      : ""
                  }`}
                  onClick={() => onConversationSelect(conv)}
                >
                  <CardContent className="p-3">
                    <p className="font-medium text-sm truncate">{title}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {lastMessage}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(conv.updatedAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-gray-200">
        {user && (
          <div className="text-sm">
            <p className="font-medium">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        )}
      </div>
    </div>
  );
}

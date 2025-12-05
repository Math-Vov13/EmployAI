"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { FiMessageSquare } from "react-icons/fi";

interface Conversation {
  id: string;
  resourceId?: string;
  title?: string;
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
  onConversationSelect?: (conversation: Conversation) => void;
  onNewConversation?: () => void;
}

export function ChatSidebar({
  conversations,
  currentConversation,
  user,
  onConversationSelect,
  onNewConversation,
}: Readonly<ChatSidebarProps>) {
  const router = useRouter();

  const handleConversationClick = (conversation: Conversation) => {
    // If callback provided (old behavior), use it
    if (onConversationSelect) {
      onConversationSelect(conversation);
    } else {
      // Otherwise navigate to the conversation route (new behavior)
      router.push(`/chat/${conversation.id}`);
    }
  };

  const handleNewChat = () => {
    if (onNewConversation) {
      onNewConversation();
    } else {
      router.push("/chat");
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard")}
          className="w-full justify-start"
        >
          ← Dashboard
        </Button>
      </div>

      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-lg">Conversations</h2>
          <Button
            size="sm"
            variant="outline"
            onClick={handleNewChat}
            className="text-xs"
          >
            + New
          </Button>
        </div>
        <p className="text-xs text-gray-500">Your chat history</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {!conversations || conversations.length === 0 ? (
            <div className="text-center py-8">
              <FiMessageSquare className="mx-auto text-gray-400 text-3xl mb-2" />
              <p className="text-sm text-gray-500">No conversations yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Start chatting to create your first conversation
              </p>
            </div>
          ) : (
            conversations.map((conv) => {
              // Use Mastra thread title or fallback
              const title = conv.title || "New Chat";
              const displayTitle =
                title.length > 50 ? title.substring(0, 50) + "..." : title;

              return (
                <Card
                  key={conv.id}
                  className={`mb-2 cursor-pointer hover:bg-gray-50 !p-3 !py-3 !gap-0 ${
                    currentConversation?.id === conv.id
                      ? "border-blue-500 !bg-blue-50"
                      : "!bg-gray-50 border-gray-200"
                  }`}
                  onClick={() => handleConversationClick(conv)}
                >
                  <div>
                    <p className="font-medium text-sm truncate text-gray-900">
                      {displayTitle}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(conv.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 flex-shrink-0">
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

"use client";

import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiMessageSquare, FiPlus } from "react-icons/fi";

interface Conversation {
  id: string;
  resourceId?: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
}

// Generate UUID v4
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    fetchUser();
    fetchConversations();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch("/api-client/users/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api-client/chat");
      if (response.ok) {
        const data = await response.json();
        const threads = data.threads || [];
        setConversations(threads);
      } else {
        console.error("Failed to fetch conversations:", response.status);
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    }
  };

  const handleNewConversation = () => {
    const newConversationId = generateUUID();
    router.push(`/chat/${newConversationId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ChatSidebar
        conversations={conversations}
        currentConversation={null}
        user={user}
      />

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-8">
            <FiMessageSquare className="mx-auto text-gray-300 text-6xl mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to Chat
            </h1>
            <p className="text-gray-600 text-lg">
              Select a conversation from the sidebar or start a new one
            </p>
          </div>

          <Button
            size="lg"
            onClick={handleNewConversation}
            className="text-lg px-8 py-6"
          >
            <FiPlus className="mr-2" />
            Start New Conversation
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardContent className="p-6">
                <div className="text-2xl mb-2">💡</div>
                <p className="font-medium text-sm mb-1">
                  Ask about your documents
                </p>
                <p className="text-xs text-gray-500">
                  Get insights and summaries from uploaded files
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardContent className="p-6">
                <div className="text-2xl mb-2">🔍</div>
                <p className="font-medium text-sm mb-1">Search and analyze</p>
                <p className="text-xs text-gray-500">
                  Find specific information across your documents
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardContent className="p-6">
                <div className="text-2xl mb-2">📝</div>
                <p className="font-medium text-sm mb-1">Get summaries</p>
                <p className="text-xs text-gray-500">
                  Quick overviews of lengthy documents
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardContent className="p-6">
                <div className="text-2xl mb-2">🤝</div>
                <p className="font-medium text-sm mb-1">
                  Interactive assistance
                </p>
                <p className="text-xs text-gray-500">
                  Have a conversation about your content
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

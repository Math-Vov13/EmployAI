"use client";

import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { useEffect, useState } from "react";

interface Document {
  id: string;
  title: string;
  fileName: string;
  mimeType: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  userId: string;
  documentId: string;
  messages: {
    role: string;
    content: string;
    timestamp: string;
  }[];
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
  const [user, setUser] = useState<any>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string>(generateUUID());

  useEffect(() => {
    fetchUser();
    fetchDocuments();
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

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api-client/documents");
      if (response.ok) {
        const data = await response.json();
        const mappedDocs = (data.documents || []).map((doc: any) => ({
          id: doc.id,
          title: doc.title,
          fileName: doc.filename || doc.fileName,
          mimeType: doc.mimetype || doc.mimeType,
        }));
        setDocuments(mappedDocs);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api-client/chat");
      if (response.ok) {
        const data = await response.json();
        setConversations(data.chats || []);
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    }
  };

  const loadChatHistory = async (historyId: string) => {
    try {
      const response = await fetch(
        `/api-client/chat/history?id=${historyId}`,
      );
      if (response.ok) {
        const data = await response.json();
        if (data.messages && data.messages.length > 0) {
          const loadedMessages: Message[] = data.messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.timestamp),
          }));
          setMessages(loadedMessages);
          setConversationId(data.threadId);
        }
      }
    } catch (err) {
      console.error("Error loading chat history:", err);
    }
  };

  const handleDocumentSelect = async (document: Document) => {
    if (selectedDocuments.find((d) => d.id === document.id)) {
      setSelectedDocuments(selectedDocuments.filter((d) => d.id !== document.id));
    } else if (selectedDocuments.length < 5) {
      setSelectedDocuments([...selectedDocuments, document]);

      if (selectedDocuments.length === 0) {
        await loadChatHistory(document.id);
      }
    }
  };

  const handleRemoveDocument = (documentId: string) => {
    setSelectedDocuments(selectedDocuments.filter((d) => d.id !== documentId));
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setCurrentConversation(conversation);
    setConversationId(conversation.id);
    const loadedMessages: Message[] = conversation.messages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
      timestamp: new Date(msg.timestamp),
    }));
    setMessages(loadedMessages);
  };

  const handleNewConversation = () => {
    setConversationId(generateUUID());
    setMessages([]);
    setCurrentConversation(null);
    setSelectedDocuments([]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setLoading(true);

    const assistantMessage: Message = {
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const payload = {
        prompt: inputMessage,
        conversation_id: conversationId, // Note: underscore format
        documentIds: selectedDocuments.length > 0
          ? selectedDocuments.map((d) => d.id)
          : undefined, // Send undefined if no documents selected (optional field)
      };

      console.log("Sending chat request:", payload);
      console.log("ConversationId state:", conversationId);
      console.log("Selected documents:", selectedDocuments);

      const response = await fetch("/api-client/chat/completion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Server error: ${response.status} ${response.statusText}`,
        );
      }

      if (!response.body) {
        throw new Error("No response body received from server");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";
      let hasReceivedContent = false;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter((line) => line.trim());

          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);

              if (parsed.type === "text-delta" && parsed.payload?.text) {
                accumulatedText += parsed.payload.text;
                hasReceivedContent = true;

                setMessages((prev) => {
                  const updated = [...prev];
                  const lastIndex = updated.length - 1;
                  if (lastIndex >= 0 && updated[lastIndex].role === "assistant") {
                    updated[lastIndex] = {
                      ...updated[lastIndex],
                      content: accumulatedText,
                    };
                  }
                  return updated;
                });
              } else if (parsed.type === "error") {
                throw new Error(parsed.payload?.message || "Agent error occurred");
              } else if (parsed.text) {
                accumulatedText += parsed.text;
                hasReceivedContent = true;

                setMessages((prev) => {
                  const updated = [...prev];
                  const lastIndex = updated.length - 1;
                  if (lastIndex >= 0 && updated[lastIndex].role === "assistant") {
                    updated[lastIndex] = {
                      ...updated[lastIndex],
                      content: accumulatedText,
                    };
                  }
                  return updated;
                });
              }
            } catch (parseError) {
              if (line.length > 0 && !line.startsWith("{")) {
                accumulatedText += line;
                hasReceivedContent = true;

                setMessages((prev) => {
                  const updated = [...prev];
                  const lastIndex = updated.length - 1;
                  if (lastIndex >= 0 && updated[lastIndex].role === "assistant") {
                    updated[lastIndex] = {
                      ...updated[lastIndex],
                      content: accumulatedText,
                    };
                  }
                  return updated;
                });
              }
            }
          }
        }
      } catch (streamError) {
        console.error("Error reading stream:", streamError);
        throw new Error(
          `Stream error: ${streamError instanceof Error ? streamError.message : "Unknown streaming error"}`,
        );
      }

      if (!hasReceivedContent || accumulatedText.trim().length === 0) {
        throw new Error("No content received from AI assistant");
      }

      // Refresh conversations list to show the updated/new conversation
      await fetchConversations();
    } catch (err) {
      console.error("Error sending message:", err);

      setMessages((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (lastIndex >= 0 && updated[lastIndex].role === "assistant") {
          const errorMsg =
            err instanceof Error
              ? err.message
              : "Sorry, I encountered an error. Please try again.";

          updated[lastIndex] = {
            ...updated[lastIndex],
            content: `❌ Error: ${errorMsg}\n\nPlease try again or contact support if the issue persists.`,
          };
        }
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ChatSidebar
        conversations={conversations}
        currentConversation={currentConversation}
        user={user}
        onConversationSelect={handleConversationSelect}
        onNewConversation={handleNewConversation}
      />

      <div className="flex-1 flex flex-col">
        <ChatHeader
          selectedDocuments={selectedDocuments}
          documents={documents}
          loadingDocuments={loadingDocuments}
          drawerOpen={drawerOpen}
          onDrawerOpenChange={setDrawerOpen}
          onDocumentSelect={handleDocumentSelect}
          onRemoveDocument={handleRemoveDocument}
          onClearAll={() => setSelectedDocuments([])}
        />

        <ChatMessages messages={messages} />

        <ChatInput
          inputMessage={inputMessage}
          loading={loading}
          selectedDocuments={selectedDocuments}
          onInputChange={setInputMessage}
          onSend={handleSendMessage}
          onKeyPress={handleKeyPress}
        />
      </div>
    </div>
  );
}

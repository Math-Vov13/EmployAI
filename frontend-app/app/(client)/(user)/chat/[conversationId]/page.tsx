"use client";

import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Document {
  id: string;
  title: string;
  fileName: string;
  mimeType: string;
}

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

interface Conversation {
  id: string;
  resourceId?: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ConversationPage() {
  const params = useParams();
  const conversationId = params.conversationId as string;

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

  useEffect(() => {
    fetchUser();
    fetchDocuments();
    fetchConversations();
  }, []);

  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      // Find and set current conversation
      const conv = conversations.find((c) => c.id === conversationId);
      if (conv) {
        setCurrentConversation(conv);
      }
      // Load messages for this conversation
      loadChatHistory(conversationId);
    }
  }, [conversationId, conversations.length]);

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
        const threads = data.threads || [];
        setConversations(threads);
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    }
  };

  const loadChatHistory = async (historyId: string) => {
    try {
      const response = await fetch(`/api-client/chat/history?id=${historyId}`);
      if (response.ok) {
        const data = await response.json();

        if (data.messages && data.messages.length > 0) {
          // Filter out tool-call, tool-result, and tool messages - only keep text messages
          const filteredMessages = data.messages.filter((msg: any) => {
            // Skip tool role messages entirely
            if (msg.role === "tool") return false;

            // Skip messages with tool-call or tool-result type
            if (msg.type === "tool-call" || msg.type === "tool-result")
              return false;

            // Check content array for tool types
            if (Array.isArray(msg.content)) {
              const hasOnlyToolContent = msg.content.every(
                (part: any) =>
                  part.type === "tool-call" || part.type === "tool-result",
              );
              if (hasOnlyToolContent) return false;
            }

            return true;
          });

          const loadedMessages: Message[] = filteredMessages.map((msg: any) => {
            // Mastra content can be string or array of content parts
            let content = "";
            if (typeof msg.content === "string") {
              content = msg.content;
            } else if (Array.isArray(msg.content)) {
              // Extract text from content parts array (skip tool-related parts)
              content = msg.content
                .map((part: any) => {
                  if (typeof part === "string") return part;
                  if (part.type === "text" && part.text) return part.text;
                  return "";
                })
                .filter((text: string) => text.length > 0)
                .join("\n");
            } else if (
              msg.content &&
              typeof msg.content === "object" &&
              msg.content.text
            ) {
              content = msg.content.text;
            }

            return {
              role: msg.role === "user" ? "user" : "assistant",
              content,
              timestamp: new Date(msg.createdAt || msg.timestamp || new Date()),
            };
          });

          // Filter out messages with empty content
          const nonEmptyMessages = loadedMessages.filter(
            (msg) => msg.content.trim().length > 0,
          );
          setMessages(nonEmptyMessages);
        } else {
          setMessages([]);
        }
      } else {
        console.error("Failed to load chat history:", response.status);
      }
    } catch (err) {
      console.error("Error loading chat history:", err);
    }
  };

  const handleDocumentSelect = (document: Document) => {
    if (selectedDocuments.find((d) => d.id === document.id)) {
      setSelectedDocuments(
        selectedDocuments.filter((d) => d.id !== document.id),
      );
    } else if (selectedDocuments.length < 5) {
      setSelectedDocuments([...selectedDocuments, document]);
    }
  };

  const handleRemoveDocument = (documentId: string) => {
    setSelectedDocuments(selectedDocuments.filter((d) => d.id !== documentId));
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
        conversation_id: conversationId,
        documentIds:
          selectedDocuments.length > 0
            ? selectedDocuments.map((d) => d.id)
            : undefined,
      };

      const response = await fetch("/api-client/chat/completion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `Server error: ${response.status} ${response.statusText}`,
        );
      }

      if (!response.body) {
        throw new Error("No response body received from server");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";
      let hasReceivedContent = false;
      const toolCalls: ToolCall[] = [];

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter((line) => line.trim());

          for (const line of lines) {
            // Skip lines that don't look like JSON
            if (!line.startsWith("{")) {
              continue;
            }

            try {
              const parsed = JSON.parse(line);

              // Only process text-delta events
              if (parsed.type === "text-delta" && parsed.payload?.text) {
                const textToAdd = parsed.payload.text;
                accumulatedText += textToAdd;
                hasReceivedContent = true;

                setMessages((prev) => {
                  const updated = [...prev];
                  const lastIndex = updated.length - 1;
                  if (
                    lastIndex >= 0 &&
                    updated[lastIndex].role === "assistant"
                  ) {
                    updated[lastIndex] = {
                      ...updated[lastIndex],
                      content: accumulatedText,
                    };
                  }
                  return updated;
                });
              } else if (parsed.type === "error") {
                console.error("Stream error:", parsed);
                throw new Error(
                  parsed.payload?.message || "Agent error occurred",
                );
              } else if (parsed.type === "tool-call") {
                console.log("🔧 Tool call:", parsed);
                const toolCall: ToolCall = {
                  name:
                    parsed.toolName || parsed.payload?.toolName || "unknown",
                  args: parsed.args || parsed.payload?.args || {},
                  timestamp: new Date(),
                };
                toolCalls.push(toolCall);

                setMessages((prev) => {
                  const updated = [...prev];
                  const lastIndex = updated.length - 1;
                  if (
                    lastIndex >= 0 &&
                    updated[lastIndex].role === "assistant"
                  ) {
                    updated[lastIndex] = {
                      ...updated[lastIndex],
                      toolCalls: [...toolCalls],
                    };
                  }
                  return updated;
                });
              }
              // Ignore all other event types (tool-result, file data, etc.)
            } catch (parseError) {
              // Silently ignore parse errors - don't add raw text to message
              console.debug("Skipping non-JSON line:", line.substring(0, 50));
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

      // Refresh conversations list
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

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
    if (selectedDocuments.some((d) => d.id === document.id)) {
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

  // Helper: Update assistant message content
  const updateAssistantContent = (content: string) => {
    setMessages((prev) => {
      const updated = [...prev];
      const lastIndex = updated.length - 1;
      if (lastIndex >= 0 && updated[lastIndex].role === "assistant") {
        updated[lastIndex] = { ...updated[lastIndex], content };
      }
      return updated;
    });
  };

  // Helper: Update assistant message tool calls
  const updateAssistantToolCalls = (toolCalls: ToolCall[]) => {
    setMessages((prev) => {
      const updated = [...prev];
      const lastIndex = updated.length - 1;
      if (lastIndex >= 0 && updated[lastIndex].role === "assistant") {
        updated[lastIndex] = {
          ...updated[lastIndex],
          toolCalls: [...toolCalls],
        };
      }
      return updated;
    });
  };

  // Helper: Process text-delta event
  const handleTextDelta = (parsed: any, accumulatedText: string): string => {
    const newText = accumulatedText + parsed.payload.text;
    updateAssistantContent(newText);
    return newText;
  };

  // Helper: Process tool-call event
  const handleToolCall = (parsed: any, toolCalls: ToolCall[]) => {
    const toolCall: ToolCall = {
      name: parsed.toolName || parsed.payload?.toolName || "unknown",
      args: parsed.args || parsed.payload?.args || {},
      timestamp: new Date(),
    };
    toolCalls.push(toolCall);
    updateAssistantToolCalls(toolCalls);
  };

  // Helper: Process stream event
  const processStreamEvent = (
    parsed: any,
    accumulatedText: string,
    toolCalls: ToolCall[],
  ): { text: string; hasContent: boolean } => {
    if (parsed.type === "text-delta" && parsed.payload?.text) {
      return {
        text: handleTextDelta(parsed, accumulatedText),
        hasContent: true,
      };
    }
    if (parsed.type === "error") {
      console.error("Stream error:", parsed);
      throw new Error(parsed.payload?.message || "Agent error occurred");
    }
    if (parsed.type === "tool-call") {
      console.log("🔧 Tool call:", parsed);
      handleToolCall(parsed, toolCalls);
    }
    return { text: accumulatedText, hasContent: false };
  };

  // Helper: Process response stream
  const processResponseStream = async (
    reader: ReadableStreamDefaultReader<Uint8Array>,
  ) => {
    const decoder = new TextDecoder();
    let accumulatedText = "";
    let hasReceivedContent = false;
    const toolCalls: ToolCall[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter((line) => line.trim());

      for (const line of lines) {
        if (!line.startsWith("{")) continue;

        try {
          const parsed = JSON.parse(line);
          const result = processStreamEvent(parsed, accumulatedText, toolCalls);
          accumulatedText = result.text;
          hasReceivedContent = hasReceivedContent || result.hasContent;
        } catch (parseError) {
          console.debug(
            "Skipping non-JSON line:",
            parseError,
            line.substring(0, 50),
          );
        }
      }
    }

    if (!hasReceivedContent || accumulatedText.trim().length === 0) {
      throw new Error("No content received from AI assistant");
    }
  };

  // Helper: Handle error in message
  const handleMessageError = (err: unknown) => {
    console.error("Error sending message:", err);
    const errorMsg =
      err instanceof Error
        ? err.message
        : "Sorry, I encountered an error. Please try again.";

    setMessages((prev) => {
      const updated = [...prev];
      const lastIndex = updated.length - 1;
      if (lastIndex >= 0 && updated[lastIndex].role === "assistant") {
        updated[lastIndex] = {
          ...updated[lastIndex],
          content: `❌ Error: ${errorMsg}\n\nPlease try again or contact support if the issue persists.`,
        };
      }
      return updated;
    });
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

      try {
        await processResponseStream(response.body.getReader());
      } catch (streamError) {
        console.error("Error reading stream:", streamError);
        throw new Error(
          `Stream error: ${streamError instanceof Error ? streamError.message : "Unknown streaming error"}`,
        );
      }

      await fetchConversations();
    } catch (err) {
      handleMessageError(err);
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

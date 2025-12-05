"use client";

import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { FiMessageSquare, FiPlus } from "react-icons/fi";

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

function ChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("c");
  const preSelectedDocId = searchParams.get("doc"); // Document to auto-select

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
  const [activeConversationId, setActiveConversationId] = useState<string>(
    conversationId || crypto.randomUUID(),
  );

  // Fetch initial data
  useEffect(() => {
    fetchUser();
    fetchDocuments();
    fetchConversations();
  }, []);

  // Handle conversation ID changes from URL
  useEffect(() => {
    if (conversationId) {
      setActiveConversationId(conversationId);
      // Find and set current conversation
      const conv = conversations.find((c) => c.id === conversationId);
      if (conv) {
        setCurrentConversation(conv);
        loadChatHistory(conversationId);
      } else {
        // New conversation with this ID
        setCurrentConversation(null);
        setMessages([]);
      }
    }
  }, [conversationId, conversations]);

  // Auto-select document from URL parameter
  useEffect(() => {
    if (
      preSelectedDocId &&
      documents.length > 0 &&
      selectedDocuments.length === 0
    ) {
      const docToSelect = documents.find((d) => d.id === preSelectedDocId);
      if (docToSelect) {
        setSelectedDocuments([docToSelect]);
        // Remove doc param from URL after selection
        const newUrl = new URL(globalThis.location.href);
        newUrl.searchParams.delete("doc");
        router.replace(newUrl.pathname + newUrl.search, { scroll: false });
      }
    }
  }, [preSelectedDocId, documents, selectedDocuments]);

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
              // IMPORTANT: Don't load toolCalls from history to prevent "Thinking..." loop
              // toolCalls are only for real-time streaming, not historical display
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
      }
    } catch (err) {
      console.error("Error loading chat history:", err);
    }
  };

  const handleConversationSelect = (conversation: Conversation) => {
    // Update URL without page reload - sidebar stays mounted!
    router.push(`/chat?c=${conversation.id}`, { scroll: false });
  };

  const handleNewConversation = () => {
    const newId = crypto.randomUUID();
    setActiveConversationId(newId);
    setCurrentConversation(null);
    setMessages([]);
    setSelectedDocuments([]);
    router.push(`/chat?c=${newId}`, { scroll: false });
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

  // Helper: Update assistant message with accumulated text
  const updateAssistantMessage = (text: string) => {
    setMessages((prev) => {
      const updated = [...prev];
      const lastIndex = updated.length - 1;
      if (lastIndex >= 0 && updated[lastIndex].role === "assistant") {
        updated[lastIndex] = {
          ...updated[lastIndex],
          content: text,
        };
      }
      return updated;
    });
  };

  // Helper: Update assistant message with tool calls
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

  // Helper: Process a single stream event
  const processStreamEvent = (
    parsed: any,
    accumulatedText: string,
    toolCalls: ToolCall[],
  ): { text: string; hasContent: boolean } => {
    if (parsed.type === "text-delta" && parsed.payload?.text) {
      const newText = accumulatedText + parsed.payload.text;
      updateAssistantMessage(newText);
      return { text: newText, hasContent: true };
    }

    if (parsed.type === "error") {
      console.error("Stream error:", parsed);
      throw new Error(parsed.payload?.message || "Agent error occurred");
    }

    if (parsed.type === "tool-call") {
      const toolCall: ToolCall = {
        name: parsed.toolName || parsed.payload?.toolName || "unknown",
        args: parsed.args || parsed.payload?.args || {},
        timestamp: new Date(),
      };
      toolCalls.push(toolCall);
      updateAssistantToolCalls(toolCalls);
    }

    return { text: accumulatedText, hasContent: false };
  };

  // Helper: Process stream lines
  const processStreamLines = (
    lines: string[],
    accumulatedText: string,
    toolCalls: ToolCall[],
  ): { text: string; hasContent: boolean } => {
    let currentText = accumulatedText;
    let hasContent = false;

    for (const line of lines) {
      if (!line.trim() || !line.startsWith("{")) continue;

      try {
        const parsed = JSON.parse(line);
        const result = processStreamEvent(parsed, currentText, toolCalls);
        currentText = result.text;
        hasContent = hasContent || result.hasContent;
      } catch {
        // Silently skip non-JSON lines - they are expected in the stream
        console.debug("Skipping non-JSON line:", line.substring(0, 50));
      }
    }

    return { text: currentText, hasContent };
  };

  // Helper: Stream response from server
  const streamChatResponse = async (response: Response): Promise<void> => {
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

        const result = processStreamLines(lines, accumulatedText, toolCalls);
        accumulatedText = result.text;
        hasReceivedContent = hasReceivedContent || result.hasContent;
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
  };

  // Helper: Send message to API
  const sendMessageToAPI = async (payload: any): Promise<Response> => {
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

    return response;
  };

  // Helper: Handle send error
  const handleSendError = (err: unknown) => {
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
        conversation_id: activeConversationId,
        documentIds:
          selectedDocuments.length > 0
            ? selectedDocuments.map((d) => d.id)
            : undefined,
      };

      await streamChatResponse(await sendMessageToAPI(payload));
      await fetchConversations();
    } catch (err) {
      handleSendError(err);
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

  // Show welcome screen if no conversation selected
  if (!conversationId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ChatSidebar
          conversations={conversations}
          currentConversation={null}
          user={user}
          onConversationSelect={handleConversationSelect}
          onNewConversation={handleNewConversation}
        />

        <div className="ml-64 flex-1 flex items-center justify-center p-8">
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

  // Show chat interface when conversation is selected
  return (
    <div className="min-h-screen bg-gray-50">
      <ChatSidebar
        conversations={conversations}
        currentConversation={currentConversation}
        user={user}
        onConversationSelect={handleConversationSelect}
        onNewConversation={handleNewConversation}
      />

      <div className="ml-64 flex flex-col min-h-screen">
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

export default function ChatPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatPageContent />
    </Suspense>
  );
}

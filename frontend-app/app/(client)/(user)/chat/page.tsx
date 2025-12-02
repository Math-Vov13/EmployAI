"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FiFile,
  FiFileText,
  FiMessageSquare,
  FiSend,
  FiTrash2,
  FiX,
} from "react-icons/fi";

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
  title: string;
  lastMessage: string;
  timestamp: Date;
}

export default function ChatPage() {
  const router = useRouter();
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
    // TODO: Implement conversation history fetching
    // For now, using placeholder data
    setConversations([]);
  };

  const handleDocumentSelect = (document: Document) => {
    if (selectedDocuments.find((d) => d.id === document.id)) {
      // Remove document
      setSelectedDocuments(selectedDocuments.filter((d) => d.id !== document.id));
    } else if (selectedDocuments.length < 5) {
      // Add document (max 5)
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

    try {
      const response = await fetch("/api-client/chat/completion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: inputMessage,
          documentIds: selectedDocuments.map((d) => d.id),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter((line) => line.trim());

          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.text) {
                assistantMessage += parsed.text;
              }
            } catch {
              // If not JSON, treat as plain text
              assistantMessage += line;
            }
          }
        }
      }

      const aiMessage: Message = {
        role: "assistant",
        content: assistantMessage || "I apologize, but I couldn't generate a response.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Error sending message:", err);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
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

  const getFileIcon = (mimeType: string) => {
    if (mimeType?.includes("pdf")) return <FiFile className="text-red-600" />;
    return <FiFileText className="text-blue-600" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar - Chat History */}
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
          <h2 className="font-semibold text-lg">Conversations</h2>
          <p className="text-xs text-gray-500 mt-1">Your chat history</p>
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
              conversations.map((conv) => (
                <Card
                  key={conv.id}
                  className="mb-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => setCurrentConversation(conv)}
                >
                  <CardContent className="p-3">
                    <p className="font-medium text-sm truncate">{conv.title}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {conv.lastMessage}
                    </p>
                  </CardContent>
                </Card>
              ))
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

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">EmployAI Chat</h1>
              <p className="text-sm text-gray-600">
                {selectedDocuments.length === 0
                  ? "Ask me anything - I'll search through all documents"
                  : `Chatting about ${selectedDocuments.length} selected document${selectedDocuments.length > 1 ? "s" : ""}`}
              </p>
            </div>
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
              <DrawerTrigger asChild>
                <Button variant="outline">
                  <FiFile className="mr-2" />
                  Documents ({selectedDocuments.length}/5)
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mx-auto w-full max-w-2xl">
                  <DrawerHeader>
                    <DrawerTitle>Select Documents</DrawerTitle>
                    <DrawerDescription>
                      Choose up to 5 documents to chat about. Leave empty for
                      AI to search all documents.
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className="p-4 pb-0">
                    {loadingDocuments ? (
                      <div className="flex justify-center py-8">
                        <Spinner className="size-8" />
                      </div>
                    ) : (
                      <ScrollArea className="h-[400px]">
                        <div className="space-y-2">
                          {documents.map((doc) => {
                            const isSelected = selectedDocuments.some(
                              (d) => d.id === doc.id,
                            );
                            return (
                              <Card
                                key={doc.id}
                                className={`cursor-pointer transition-colors ${
                                  isSelected
                                    ? "bg-blue-50 border-blue-500"
                                    : "hover:bg-gray-50"
                                }`}
                                onClick={() => handleDocumentSelect(doc)}
                              >
                                <CardContent className="p-4 flex items-center gap-3">
                                  <div className="text-2xl">
                                    {getFileIcon(doc.mimeType)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">
                                      {doc.title}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                      {doc.fileName}
                                    </p>
                                  </div>
                                  {isSelected && (
                                    <div className="bg-blue-500 text-white rounded-full p-1">
                                      <FiFile className="size-4" />
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                  <DrawerFooter>
                    <DrawerClose asChild>
                      <Button variant="outline">Done</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </div>
              </DrawerContent>
            </Drawer>
          </div>

          {/* Selected Documents */}
          {selectedDocuments.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex items-center gap-2 text-sm"
                >
                  {getFileIcon(doc.mimeType)}
                  <span className="font-medium">{doc.title}</span>
                  <button
                    onClick={() => handleRemoveDocument(doc.id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FiX className="size-4" />
                  </button>
                </div>
              ))}
              {selectedDocuments.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDocuments([])}
                  className="text-red-600 hover:text-red-800"
                >
                  <FiTrash2 className="mr-1 size-4" />
                  Clear all
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">💬</div>
                <h2 className="text-2xl font-bold mb-2">
                  Start a Conversation
                </h2>
                <p className="text-gray-600 mb-4">
                  Ask me anything about your documents!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 max-w-2xl mx-auto">
                  <Card className="cursor-pointer hover:bg-gray-50">
                    <CardContent className="p-4">
                      <p className="font-medium text-sm">
                        "Summarize the key points"
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Get a quick overview
                      </p>
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
            ) : (
              messages.map((message, index) => (
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
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p
                      className={`text-xs mt-2 ${message.role === "user" ? "text-blue-100" : "text-gray-400"}`}
                    >
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Spinner className="size-4" />
                    <span className="text-sm text-gray-600">
                      AI is thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={loading || !inputMessage.trim()}
              >
                <FiSend className="mr-2" />
                Send
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {selectedDocuments.length === 0
                ? "💡 Tip: I'll search through all your documents to find relevant information"
                : `💡 Focused on: ${selectedDocuments.map((d) => d.title).join(", ")}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

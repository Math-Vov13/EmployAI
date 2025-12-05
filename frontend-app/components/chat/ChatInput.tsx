"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FiSend } from "react-icons/fi";

interface Document {
  id: string;
  title: string;
  fileName: string;
  mimeType: string;
}

interface ChatInputProps {
  inputMessage: string;
  loading: boolean;
  selectedDocuments: Document[];
  onInputChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

export function ChatInput({
  inputMessage,
  loading,
  selectedDocuments,
  onInputChange,
  onSend,
  onKeyPress,
}: ChatInputProps) {
  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={onKeyPress}
            disabled={loading}
            className="flex-1"
          />
          <Button onClick={onSend} disabled={loading || !inputMessage.trim()}>
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
  );
}

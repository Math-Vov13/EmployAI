"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { FiFile, FiInfo } from "react-icons/fi";
import { ChatInterface } from "./ChatInterface";

interface Document {
  id: string;
  title: string;
  description: string;
  fileName: string;
}

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documents: Document[];
}

export function ChatDialog({ open, onOpenChange, documents }: ChatDialogProps) {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>("");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  // Reset selection when dialog opens
  useEffect(() => {
    if (open && documents.length > 0 && !selectedDocumentId) {
      setSelectedDocumentId(documents[0].id);
      setSelectedDocument(documents[0]);
    }
  }, [open, documents]);

  const handleDocumentChange = (documentId: string) => {
    setSelectedDocumentId(documentId);
    const doc = documents.find((d) => d.id === documentId);
    setSelectedDocument(doc || null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl">Chat with AI Assistant</DialogTitle>
          <p className="text-sm text-gray-600 mt-2">
            Ask questions about your documents and get instant answers
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-hidden px-6 pb-6">
          {documents.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <Card className="max-w-md">
                <CardContent className="text-center py-8">
                  <div className="text-4xl mb-4 text-gray-400 flex justify-center">
                    <FiFile />
                  </div>
                  <p className="text-gray-700 mb-4">
                    No documents available to chat with
                  </p>
                  <p className="text-sm text-gray-500">
                    Upload a document first to start chatting
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-full flex flex-col gap-4">
              {/* Document Selector */}
              <div className="flex items-center gap-4">
                <label
                  htmlFor="document-select"
                  className="text-sm font-medium text-gray-700 whitespace-nowrap"
                >
                  Select Document:
                </label>
                <Select
                  value={selectedDocumentId}
                  onValueChange={handleDocumentChange}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Choose a document..." />
                  </SelectTrigger>
                  <SelectContent>
                    {documents.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id}>
                        <div className="flex items-center gap-2">
                          <FiFile className="text-blue-600" />
                          <span>{doc.title}</span>
                          <span className="text-xs text-gray-500">
                            ({doc.fileName})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Document Info */}
              {selectedDocument && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl text-blue-600">
                        <FiFile />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900">
                          {selectedDocument.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {selectedDocument.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {selectedDocument.fileName}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Chat Interface */}
              {selectedDocument && (
                <div className="flex-1 min-h-0">
                  <ChatInterface
                    documentId={selectedDocument.id}
                    documentTitle={selectedDocument.title}
                  />
                </div>
              )}

              {/* Help Info */}
              <Card className="bg-gray-50">
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <div className="text-lg text-blue-500">
                      <FiInfo />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-600">
                        <strong>Tip:</strong> The AI assistant only has access
                        to the selected document. Ask specific questions about
                        its content for the best results.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

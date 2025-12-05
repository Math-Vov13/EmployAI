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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { FiFile, FiFileText, FiTrash2, FiX } from "react-icons/fi";

interface Document {
  id: string;
  title: string;
  fileName: string;
  mimeType: string;
}

interface ChatHeaderProps {
  selectedDocuments: Document[];
  documents: Document[];
  loadingDocuments: boolean;
  drawerOpen: boolean;
  onDrawerOpenChange: (open: boolean) => void;
  onDocumentSelect: (document: Document) => void;
  onRemoveDocument: (documentId: string) => void;
  onClearAll: () => void;
}

const getFileIcon = (mimeType: string) => {
  if (mimeType?.includes("pdf")) return <FiFile className="text-red-600" />;
  return <FiFileText className="text-blue-600" />;
};

export function ChatHeader({
  selectedDocuments,
  documents,
  loadingDocuments,
  drawerOpen,
  onDrawerOpenChange,
  onDocumentSelect,
  onRemoveDocument,
  onClearAll,
}: ChatHeaderProps) {
  const getSubtitleText = () => {
    if (selectedDocuments.length === 0) {
      return "Ask me anything - I'll search through all documents";
    }
    const documentText =
      selectedDocuments.length > 1 ? "documents" : "document";
    return `Chatting about ${selectedDocuments.length} selected ${documentText}`;
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">EmployAI Chat</h1>
          <p className="text-sm text-gray-600">{getSubtitleText()}</p>
        </div>
        <Drawer open={drawerOpen} onOpenChange={onDrawerOpenChange}>
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
                  Choose up to 5 documents to chat about. Leave empty for AI to
                  search all documents.
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
                            onClick={() => onDocumentSelect(doc)}
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
                onClick={() => onRemoveDocument(doc.id)}
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
              onClick={onClearAll}
              className="text-red-600 hover:text-red-800"
            >
              <FiTrash2 className="mr-1 size-4" />
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

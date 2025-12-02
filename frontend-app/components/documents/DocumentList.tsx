"use client";

import { Spinner } from "@/components/ui/spinner";
import { DocumentCard } from "./DocumentCard";

type Document = {
  id: string;
  title: string;
  description: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  status: string;
  tags: string[];
  createdAt: Date | string;
  uploadedBy: {
    email: string;
    role: string;
  };
};

interface DocumentListProps {
  documents: Document[];
  loading?: boolean;
  onDownload?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
  emptyMessage?: string;
}

export function DocumentList({
  documents,
  loading = false,
  onDownload,
  onDelete,
  showActions = true,
  emptyMessage = "No documents found",
}: DocumentListProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Spinner className="size-8" />
        <p className="text-sm text-gray-600">Loading documents...</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-6xl mb-4">📂</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          {emptyMessage}
        </h3>
        <p className="text-gray-500">
          {showActions
            ? "Upload your first document to get started"
            : "Check back later for new documents"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((document) => (
        <DocumentCard
          key={document.id}
          document={document}
          onDownload={onDownload}
          onDelete={onDelete}
          showActions={showActions}
        />
      ))}
    </div>
  );
}

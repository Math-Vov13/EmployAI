"use client";

import {
  formatFileSize,
  getFileTypeName,
} from "@/app/lib/storage/file-validation";
import { DocumentPreview } from "@/components/documents/DocumentPreview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiXCircle } from "react-icons/fi";

interface Document {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  status: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  uploadedBy?: {
    id: string;
    email: string;
    role: string;
  };
}

export default function DocumentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetchDocument();
    }
  }, [id]);

  const fetchDocument = async () => {
    try {
      const response = await fetch(`/api-client/documents/${id}`);
      if (response.ok) {
        const data = await response.json();
        setDocument(data.document);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to load document");
      }
    } catch (err) {
      console.error("Error fetching document:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api-client/documents/${id}/download`);
      if (response.ok) {
        // Get the file as a blob
        const blob = await response.blob();

        // Create a download link
        const url = globalThis.URL.createObjectURL(blob);
        const link = globalThis.document.createElement("a");
        link.href = url;
        link.download = document?.fileName || "download";
        globalThis.document.body.appendChild(link);
        link.click();

        // Cleanup
        globalThis.URL.revokeObjectURL(url);
        link.remove();
      } else {
        alert("Failed to download document");
      }
    } catch (err) {
      console.error("Error downloading document:", err);
      alert("Failed to download document");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Spinner className="size-8" />
          <p className="text-sm text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <div className="text-4xl mb-4 text-red-500 flex justify-center">
              <FiXCircle />
            </div>
            <p className="text-gray-700 mb-4">
              {error || "Document not found"}
            </p>
            <Button onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="mb-2"
          >
            ← Back to Dashboard
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader className="flex flex-col items-start gap-3 p-6">
            <div className="flex items-center justify-between w-full">
              <h1 className="text-3xl font-bold">{document.title}</h1>
              <Badge variant="default">{document.status}</Badge>
            </div>
          </CardHeader>

          <CardContent className="px-6 pb-6">
            {/* Document Preview */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-3">
                Preview
              </h3>
              <DocumentPreview
                documentId={document.id}
                fileName={document.fileName}
                mimeType={document.mimeType}
              />
            </div>

            {/* Description */}
            {document.description && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">
                  Description
                </h3>
                <p className="text-gray-700">{document.description}</p>
              </div>
            )}

            {/* Tags */}
            {document.tags && document.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {document.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* File Information */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-600 mb-3">
                File Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">File name:</span>
                  <p className="font-medium">{document.fileName}</p>
                </div>
                <div>
                  <span className="text-gray-600">File type:</span>
                  <p className="font-medium">
                    {getFileTypeName(document.mimeType)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">File size:</span>
                  <p className="font-medium">
                    {formatFileSize(document.fileSize)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Uploaded:</span>
                  <p className="font-medium">
                    {format(new Date(document.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            </div>

            {/* Uploaded By */}
            {document.uploadedBy && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">
                  Uploaded By
                </h3>
                <p className="text-gray-700">{document.uploadedBy.email}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <Button size="lg" onClick={handleDownload} className="flex-1">
                Download Document
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="flex-1"
                onClick={() => {
                  // Generate new conversation ID and redirect with document pre-selected
                  const newConversationId = crypto.randomUUID();
                  router.push(
                    `/chat?c=${newConversationId}&doc=${document.id}`,
                  );
                }}
              >
                Chat with AI
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

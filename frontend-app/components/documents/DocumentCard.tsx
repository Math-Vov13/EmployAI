"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatFileSize } from "@/app/lib/storage/file-validation";
import { format } from "date-fns";
import Link from "next/link";

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

interface DocumentCardProps {
  document: Document;
  onDownload?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export function DocumentCard({
  document,
  onDownload,
  onDelete,
  showActions = true,
}: DocumentCardProps) {
  const createdDate =
    typeof document.createdAt === "string"
      ? new Date(document.createdAt)
      : document.createdAt;

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("pdf")) return "📄";
    if (mimeType.includes("word") || mimeType.includes("document")) return "📝";
    if (mimeType.includes("text")) return "📃";
    if (mimeType.includes("image")) return "🖼️";
    return "📎";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ONLINE":
        return "bg-green-100 text-green-800 border-green-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "DELETED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader className="flex gap-3">
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getFileIcon(document.mimeType)}</span>
            <div className="flex-1">
              <Link href={`/documents/${document.id}`}>
                <h4 className="text-lg font-semibold hover:text-blue-600 transition-colors">
                  {document.title}
                </h4>
              </Link>
              <p className="text-sm text-gray-500">{document.fileName}</p>
            </div>
          </div>
        </div>
        <Badge className={getStatusColor(document.status)}>
          {document.status}
        </Badge>
      </CardHeader>

      <CardContent className="py-2 px-4">
        <p className="text-sm text-gray-700 line-clamp-2 mb-3">
          {document.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-3">
          {document.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{formatFileSize(document.fileSize)}</span>
          <span>{format(createdDate, "MMM d, yyyy")}</span>
        </div>

        <div className="text-xs text-gray-500 mt-2">
          Uploaded by: {document.uploadedBy.email}
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="gap-2 pt-2">
          <Button
            size="sm"
            variant="default"
            onClick={() => onDownload?.(document.id)}
            className="flex-1"
          >
            Download
          </Button>
          <Link href={`/chat/${document.id}`} className="flex-1">
            <Button size="sm" variant="secondary" className="w-full">
              Chat
            </Button>
          </Link>
          {onDelete && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(document.id)}
            >
              Delete
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

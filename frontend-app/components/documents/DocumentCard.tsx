"use client";

import { formatFileSize } from "@/app/lib/storage/file-validation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { format } from "date-fns";
import Link from "next/link";
import { FiFile, FiFileText, FiImage, FiPaperclip } from "react-icons/fi";

type Document = {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  status: string;
  tags?: string[];
  createdAt: Date | string;
  uploadedBy?: {
    email: string;
    role: string;
  };
};

interface DocumentCardProps {
  document: Document;
  onDownload?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
  canDelete?: boolean;
}

export function DocumentCard({
  document,
  onDownload,
  onDelete,
  showActions = true,
  canDelete = false,
}: Readonly<DocumentCardProps>) {
  const createdDate =
    typeof document.createdAt === "string"
      ? new Date(document.createdAt)
      : document.createdAt;

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("pdf")) return <FiFile className="text-red-600" />;
    if (mimeType.includes("word") || mimeType.includes("document"))
      return <FiFileText className="text-blue-600" />;
    if (mimeType.includes("text"))
      return <FiFileText className="text-gray-600" />;
    if (mimeType.includes("image"))
      return <FiImage className="text-purple-600" />;
    return <FiPaperclip className="text-gray-500" />;
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
    <Card className="w-full hover:shadow-lg transition-shadow flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="text-2xl flex-shrink-0 mt-1">
            {getFileIcon(document.mimeType)}
          </div>
          <div className="flex-1 min-w-0">
            <Link href={`/documents/${document.id}`} className="block">
              <h4 className="text-lg font-semibold hover:text-blue-600 transition-colors">
                {document.title.length > 25
                  ? `${document.title.substring(0, 25)}...`
                  : document.title}
              </h4>
            </Link>
            <p className="text-sm text-gray-500 mt-1">
              {document.fileName.length > 25
                ? `${document.fileName.substring(0, 25)}...`
                : document.fileName}
            </p>
          </div>
          <div className="flex-shrink-0 ml-2">
            <Badge
              className={`${getStatusColor(document.status)} whitespace-nowrap`}
            >
              {document.status}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 flex-1 flex flex-col">
        {document.description && (
          <p className="text-sm text-gray-700">
            {document.description.length > 100
              ? `${document.description.substring(0, 100)}...`
              : document.description}
          </p>
        )}

        {document.tags && document.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {document.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Spacer to push content to bottom */}
        <div className="flex-1"></div>

        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-2">
            <span>{formatFileSize(document.fileSize)}</span>
            <span>{format(createdDate, "MMM d, yyyy")}</span>
          </div>

          {document.uploadedBy && (
            <div className="text-xs text-gray-500">
              <span className="font-medium">Uploaded by:</span>{" "}
              {document.uploadedBy.email}
            </div>
          )}
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="flex gap-2 pt-4 mt-auto">
          <Button
            size="sm"
            variant="default"
            onClick={() => onDownload?.(document.id)}
            className="flex-1"
          >
            Download
          </Button>
          {onDelete && canDelete && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(document.id)}
              className="flex-shrink-0"
            >
              Delete
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

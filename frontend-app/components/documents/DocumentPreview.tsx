"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useEffect, useState } from "react";
import {
  FiDownload,
  FiFile,
  FiFileText,
  FiImage,
  FiMusic,
  FiVideo,
} from "react-icons/fi";

interface DocumentPreviewProps {
  documentId: string;
  fileName: string;
  mimeType: string;
}

export function DocumentPreview({
  documentId,
  fileName,
  mimeType,
}: Readonly<DocumentPreviewProps>) {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [textContent, setTextContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPreview();
    return () => {
      // Cleanup blob URL on unmount
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [documentId]);

  const loadPreview = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api-client/documents/${documentId}/download`,
      );
      if (!response.ok) {
        throw new Error("Failed to load document");
      }

      const blob = await response.blob();

      // For text files, read the content
      if (isTextFile(mimeType)) {
        const text = await blob.text();
        setTextContent(text);
      } else {
        // For binary files, create a blob URL
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      }
    } catch (err) {
      console.error("Error loading preview:", err);
      setError("Failed to load preview");
    } finally {
      setLoading(false);
    }
  };

  const isTextFile = (mime: string): boolean => {
    return (
      mime.startsWith("text/") ||
      mime === "application/json" ||
      mime === "application/xml" ||
      mime === "application/javascript"
    );
  };

  const isImage = (mime: string): boolean => {
    return mime.startsWith("image/");
  };

  const isPDF = (mime: string): boolean => {
    return mime === "application/pdf";
  };

  const isVideo = (mime: string): boolean => {
    return mime.startsWith("video/");
  };

  const isAudio = (mime: string): boolean => {
    return mime.startsWith("audio/");
  };

  const canPreview = (): boolean => {
    return (
      isImage(mimeType) ||
      isPDF(mimeType) ||
      isVideo(mimeType) ||
      isAudio(mimeType) ||
      isTextFile(mimeType)
    );
  };

  const getFileIcon = () => {
    if (isImage(mimeType)) return <FiImage className="size-16 text-blue-500" />;
    if (isPDF(mimeType)) return <FiFileText className="size-16 text-red-500" />;
    if (isVideo(mimeType))
      return <FiVideo className="size-16 text-purple-500" />;
    if (isAudio(mimeType))
      return <FiMusic className="size-16 text-green-500" />;
    if (isTextFile(mimeType))
      return <FiFileText className="size-16 text-gray-500" />;
    return <FiFile className="size-16 text-gray-400" />;
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(
        `/api-client/documents/${documentId}/download`,
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = globalThis.URL.createObjectURL(blob);
        const link = globalThis.document.createElement("a");
        link.href = url;
        link.download = fileName || "download";
        globalThis.document.body.appendChild(link);
        link.click();
        globalThis.URL.revokeObjectURL(url);
        link.remove();
      }
    } catch (err) {
      console.error("Error downloading:", err);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <Spinner className="size-8" />
            <p className="text-sm text-gray-600">Loading preview...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="flex justify-center mb-4">{getFileIcon()}</div>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadPreview}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!canPreview()) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="flex justify-center mb-4">{getFileIcon()}</div>
            <p className="text-gray-600 mb-2">Preview not available</p>
            <p className="text-sm text-gray-500 mb-4">
              This file type cannot be previewed in the browser
            </p>
            <Button onClick={handleDownload} className="gap-2">
              <FiDownload className="size-4" />
              Download to view
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        {/* PDF Preview */}
        {isPDF(mimeType) && previewUrl && (
          <div className="w-full">
            <iframe
              src={previewUrl}
              className="w-full h-[600px] border-0 rounded-lg"
              title="PDF Preview"
            />
          </div>
        )}

        {/* Image Preview */}
        {isImage(mimeType) && previewUrl && (
          <div className="flex items-center justify-center bg-gray-50 p-4 rounded-lg">
            <img
              src={previewUrl}
              alt={fileName}
              className="max-w-full max-h-[600px] object-contain rounded"
            />
          </div>
        )}

        {/* Video Preview */}
        {isVideo(mimeType) && previewUrl && (
          <div className="w-full">
            <video
              src={previewUrl}
              controls
              className="w-full max-h-[600px] rounded-lg"
            >
              <track
              kind="captions"
              src={`/api-client/documents/${documentId}/captions.vtt`}
              srcLang="en"
              label="English captions"
              default
              />
              Your browser does not support video playback.
            </video>
          </div>
        )}

        {/* Audio Preview */}
        {isAudio(mimeType) && previewUrl && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="flex justify-center mb-6">{getFileIcon()}</div>
                <audio src={previewUrl} controls className="mx-auto">
                <track
                  kind="captions"
                  src={`/api-client/documents/${documentId}/captions.vtt`}
                  srcLang="en"
                  label="English captions"
                  default
                />
                Your browser does not support audio playback.
                </audio>
            </div>
          </div>
        )}

        {/* Text/Code Preview */}
        {isTextFile(mimeType) && textContent && (
          <div className="p-4">
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto max-h-[600px] overflow-y-auto text-sm font-mono">
              <code>{textContent}</code>
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

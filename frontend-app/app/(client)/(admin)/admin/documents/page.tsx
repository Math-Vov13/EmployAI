"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

interface Document {
  id: string;
  title: string;
  description: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  status: string;
  tags: string[];
  uploadedBy: {
    id: string;
    email: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}

function AdminDocumentsContent() {
  const searchParams = useSearchParams();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>(
    searchParams.get("status") || "all",
  );
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null,
  );
  const [updating, setUpdating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [statusFilter]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const url = "/api-client/documents";

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch documents");

      const data = await res.json();

      // Map server response to expected Document interface
      const mappedDocuments = (data.documents || []).map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        description: doc.metadata?.description || "",
        fileName: doc.filename || "unknown",
        fileSize: doc.size || 0,
        mimeType: doc.mimetype || "",
        status: doc.metadata?.status || "PENDING",
        tags: doc.metadata?.tags || [],
        uploadedBy: {
          id: doc.creatorId,
          email: "user@example.com",
          role: "USER",
        },
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      }));

      // Apply status filter on client side
      if (statusFilter && statusFilter !== "all") {
        setDocuments(
          mappedDocuments.filter(
            (doc: Document) => doc.status === statusFilter,
          ),
        );
      } else {
        setDocuments(mappedDocuments);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (documentId: string, newStatus: string) => {
    try {
      setUpdating(true);

      // Use the PATCH endpoint for updating document metadata
      const res = await fetch(`/api-client/documents/${documentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metadata: { status: newStatus },
        }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      await fetchDocuments();
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update document status");
    } finally {
      setUpdating(false);
    }
  };

  const openDocumentModal = (document: Document) => {
    setSelectedDocument(document);
    setIsOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ONLINE":
        return "success";
      case "PENDING":
        return "warning";
      case "DELETED":
        return "danger";
      default:
        return "default";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Document Management
          </h1>
          <p className="text-gray-600 mt-2">Review and manage all documents</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <span className="text-sm font-medium text-gray-700">
              Filter by status:
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => setStatusFilter("all")}
              >
                All ({documents.length})
              </Button>
              <Button
                size="sm"
                variant={statusFilter === "PENDING" ? "secondary" : "outline"}
                onClick={() => setStatusFilter("PENDING")}
              >
                Pending
              </Button>
              <Button
                size="sm"
                variant={statusFilter === "APPROVED" ? "default" : "outline"}
                onClick={() => setStatusFilter("APPROVED")}
              >
                Approved
              </Button>
              <Button
                size="sm"
                variant={
                  statusFilter === "REJECTED" ? "destructive" : "outline"
                }
                onClick={() => setStatusFilter("REJECTED")}
              >
                Rejected
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardContent className="p-0">
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No documents found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>DOCUMENT</TableHead>
                  <TableHead>UPLOADER</TableHead>
                  <TableHead>SIZE</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead>UPLOADED</TableHead>
                  <TableHead>ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{doc.title}</p>
                        <p className="text-sm text-gray-500">{doc.fileName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{doc.uploadedBy.email}</p>
                        <Badge variant="outline">{doc.uploadedBy.role}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {formatFileSize(doc.fileSize)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          getStatusColor(doc.status) === "success"
                            ? "default"
                            : getStatusColor(doc.status) === "warning"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {doc.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDocumentModal(doc)}
                      >
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Document Details Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Document Details</DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Title</p>
                <p className="text-lg font-semibold">
                  {selectedDocument.title}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Description</p>
                <p className="text-gray-900">{selectedDocument.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">File Name</p>
                  <p className="text-gray-900">{selectedDocument.fileName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">File Size</p>
                  <p className="text-gray-900">
                    {formatFileSize(selectedDocument.fileSize)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {selectedDocument.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">Uploaded By</p>
                <p className="text-gray-900">
                  {selectedDocument.uploadedBy.email}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600">
                  Current Status
                </p>
                <Badge
                  className="mt-1"
                  variant={
                    getStatusColor(selectedDocument.status) === "success"
                      ? "default"
                      : getStatusColor(selectedDocument.status) === "warning"
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {selectedDocument.status}
                </Badge>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-gray-600 mb-3">
                  Change Status
                </p>
                <div className="flex gap-2 flex-wrap">
                  {selectedDocument.status !== "APPROVED" && (
                    <Button
                      variant="default"
                      onClick={() =>
                        handleStatusChange(selectedDocument.id, "APPROVED")
                      }
                      disabled={updating}
                    >
                      ✅ Approve
                    </Button>
                  )}
                  {selectedDocument.status !== "PENDING" && (
                    <Button
                      variant="secondary"
                      onClick={() =>
                        handleStatusChange(selectedDocument.id, "PENDING")
                      }
                      disabled={updating}
                    >
                      ⏳ Set Pending
                    </Button>
                  )}
                  {selectedDocument.status !== "REJECTED" && (
                    <Button
                      variant="destructive"
                      onClick={() =>
                        handleStatusChange(selectedDocument.id, "REJECTED")
                      }
                      disabled={updating}
                    >
                      ❌ Reject
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminDocumentsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-96">
          <Spinner className="size-8" />
        </div>
      }
    >
      <AdminDocumentsContent />
    </Suspense>
  );
}

"use client";

import { ChatDialog } from "@/components/chat/ChatDialog";
import { DocumentFilters } from "@/components/documents/DocumentFilters";
import { DocumentList } from "@/components/documents/DocumentList";
import { DocumentUploadForm } from "@/components/documents/DocumentUploadForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiMessageSquare } from "react-icons/fi";
import { toast } from "sonner";

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
  uploadedBy?: {
    email: string;
    role: string;
  };
}

interface Tag {
  id: string;
  name: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const [documents, setDocuments] = useState<Document[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchSession();
    fetchDocuments();
    fetchTags();
  }, [selectedTag]);

  const fetchSession = async () => {
    try {
      const response = await fetch("/api-client/users/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error("Error fetching session:", err);
    }
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const url = "/api-client/documents";

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();

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
          createdAt: doc.createdAt,
          uploadedBy: {
            id: doc.creatorId || doc.uploadedBy?.id,
            email: doc.uploadedBy?.email || "unknown@example.com",
            role: doc.uploadedBy?.role || "USER",
          },
        }));

        // Apply tag filter on client side if needed
        if (selectedTag && selectedTag !== "all") {
          setDocuments(
            mappedDocuments.filter((doc: Document) =>
              doc.tags?.includes(selectedTag),
            ),
          );
        } else {
          setDocuments(mappedDocuments);
        }
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch("/api-client/tags");
      if (response.ok) {
        const data = await response.json();
        setTags(data.tags || []);
      } else {
        setTags([]);
      }
    } catch (err) {
      console.error("Error fetching tags:", err);
      setTags([]);
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const response = await fetch(`/api-client/documents/${id}/download`);
      if (response.ok) {
        // Get the blob from response
        const blob = await response.blob();
        const filename =
          response.headers
            .get("Content-Disposition")
            ?.split("filename=")[1]
            ?.replaceAll('"', "") || "download";

        // Create download link
        const url = globalThis.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = decodeURIComponent(filename);
        document.body.appendChild(a);
        a.click();
        globalThis.URL.revokeObjectURL(url);
        a.remove();
        toast.success("Document downloaded successfully");
      } else {
        toast.error("Failed to download document");
      }
    } catch (err) {
      console.error("Error downloading document:", err);
      toast.error("Failed to download document");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      const response = await fetch(`/api-client/documents/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Refresh documents list
        fetchDocuments();
        toast.success("Document deleted successfully");
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete document");
      }
    } catch (err) {
      console.error("Error deleting document:", err);
      toast.error("Failed to delete document");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api-client/auth/logout", { method: "POST" });
      toast.success("Logged out successfully");
      router.push("/sign-in");
    } catch (err) {
      console.error("Error logging out:", err);
      toast.error("Failed to logout");
    }
  };

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold">EmployAI</h1>
              {user && (
                <p className="text-sm text-gray-600">Welcome, {user.name}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => router.push("/chat")}>
                <FiMessageSquare />
                Chat AI
              </Button>
              <Button variant="default" onClick={() => setIsOpen(true)}>
                Upload Document
              </Button>
              <Button variant="ghost" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Documents</h2>
          <p className="text-gray-600">
            Browse and manage your documents. Upload new files or download
            existing ones.
          </p>
        </div>

        {/* Filters */}
        <DocumentFilters
          tags={tags}
          selectedTag={selectedTag}
          onTagChange={setSelectedTag}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Documents List */}
        <DocumentList
          documents={filteredDocuments}
          loading={loading}
          onDownload={handleDownload}
          onDelete={handleDelete}
          showActions={true}
          currentUserId={user?.id}
          currentUserRole={user?.role}
        />
      </main>

      {/* Upload Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload New Document</DialogTitle>
          </DialogHeader>
          <div className="pb-6">
            <DocumentUploadForm
              onSuccess={() => {
                setIsOpen(false);
                fetchDocuments();
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DocumentList } from '@/components/documents/DocumentList';
import { DocumentUploadForm } from '@/components/documents/DocumentUploadForm';
import { DocumentFilters } from '@/components/documents/DocumentFilters';

interface Document {
  id: string;
  title: string;
  description: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  status: string;
  tags: string[];
  createdAt: string;
  uploadedBy: {
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
  const [selectedTag, setSelectedTag] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchSession();
    fetchDocuments();
    fetchTags();
  }, [selectedTag]);

  const fetchSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error('Error fetching session:', err);
    }
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const url = selectedTag
        ? `/api/documents?tag=${encodeURIComponent(selectedTag)}`
        : '/api/documents';

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags');
      if (response.ok) {
        const data = await response.json();
        setTags(data.tags);
      }
    } catch (err) {
      console.error('Error fetching tags:', err);
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const response = await fetch(`/api/documents/${id}/download`);
      if (response.ok) {
        const data = await response.json();
        window.open(data.downloadUrl, '_blank');
      } else {
        alert('Failed to generate download link');
      }
    } catch (err) {
      console.error('Error downloading document:', err);
      alert('Failed to download document');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh documents list
        fetchDocuments();
        alert('Document deleted successfully');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete document');
      }
    } catch (err) {
      console.error('Error deleting document:', err);
      alert('Failed to delete document');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                EmployAI
              </h1>
              {user && (
                <p className="text-sm text-gray-600">Welcome, {user.email}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Documents
          </h2>
          <p className="text-gray-600">
            Browse and manage your documents. Upload new files or download existing ones.
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
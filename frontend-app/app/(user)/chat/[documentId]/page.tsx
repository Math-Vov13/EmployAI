'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@heroui/button';
import { Card, CardBody } from '@heroui/card';
import { Spinner } from '@heroui/spinner';
import { ChatInterface } from '@/components/chat/ChatInterface';

interface Document {
  id: string;
  title: string;
  description: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const documentId = params.documentId as string;
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (documentId) {
      fetchDocument();
    }
  }, [documentId]);

  const fetchDocument = async () => {
    try {
      const response = await fetch(`/api/documents/${documentId}`);
      if (response.ok) {
        const data = await response.json();
        setDocument(data.document);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to load document');
      }
    } catch (err) {
      console.error('Error fetching document:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" label="Loading..." />
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardBody className="text-center py-8">
            <p className="text-xl mb-4">❌</p>
            <p className="text-gray-700 mb-4">{error || 'Document not found'}</p>
            <Button color="primary" onPress={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Button
                variant="light"
                onPress={() => router.push('/dashboard')}
                size="sm"
              >
                ← Back to Dashboard
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="flat"
                color="primary"
                size="sm"
                onPress={() => router.push(`/documents/${documentId}`)}
              >
                View Document
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Document Info */}
        <Card className="mb-6">
          <CardBody className="p-4">
            <div className="flex items-start gap-4">
              <div className="text-3xl">📄</div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-1">{document.title}</h1>
                <p className="text-gray-600 text-sm mb-2">{document.description}</p>
                <p className="text-gray-500 text-xs">{document.fileName}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Chat Interface */}
        <ChatInterface documentId={documentId} documentTitle={document.title} />

        {/* Info Card */}
        <Card className="mt-6">
          <CardBody className="p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">How to use the AI Assistant</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Ask questions about the document content</li>
                  <li>• Request summaries of specific sections</li>
                  <li>• Get explanations of complex topics</li>
                  <li>• Extract key information and insights</li>
                </ul>
                <p className="text-xs text-gray-500 mt-3">
                  <strong>Note:</strong> The AI only has access to the content of this specific document. Responses are generated based solely on the document text.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </main>
    </div>
  );
}

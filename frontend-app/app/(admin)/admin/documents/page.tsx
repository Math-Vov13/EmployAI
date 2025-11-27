'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { Spinner } from '@heroui/spinner';
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from '@heroui/table';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@heroui/modal';
import { Select, SelectItem } from '@heroui/select';

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>(
    searchParams.get('status') || 'all'
  );
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [updating, setUpdating] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    fetchDocuments();
  }, [statusFilter]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const url =
        statusFilter && statusFilter !== 'all'
          ? `/api/admin/documents?status=${statusFilter}`
          : '/api/admin/documents';

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch documents');

      const data = await res.json();
      setDocuments(data.documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (documentId: string, newStatus: string) => {
    try {
      setUpdating(true);
      const res = await fetch(`/api/admin/documents/${documentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      await fetchDocuments();
      onClose();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update document status');
    } finally {
      setUpdating(false);
    }
  };

  const openDocumentModal = (document: Document) => {
    setSelectedDocument(document);
    onOpen();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONLINE':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'DELETED':
        return 'danger';
      default:
        return 'default';
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
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
          <p className="text-gray-600 mt-2">Review and manage all documents</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardBody className="p-4">
          <div className="flex gap-4 items-center">
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                color={statusFilter === 'all' ? 'primary' : 'default'}
                variant={statusFilter === 'all' ? 'solid' : 'flat'}
                onPress={() => setStatusFilter('all')}
              >
                All ({documents.length})
              </Button>
              <Button
                size="sm"
                color={statusFilter === 'PENDING' ? 'warning' : 'default'}
                variant={statusFilter === 'PENDING' ? 'solid' : 'flat'}
                onPress={() => setStatusFilter('PENDING')}
              >
                Pending
              </Button>
              <Button
                size="sm"
                color={statusFilter === 'ONLINE' ? 'success' : 'default'}
                variant={statusFilter === 'ONLINE' ? 'solid' : 'flat'}
                onPress={() => setStatusFilter('ONLINE')}
              >
                Online
              </Button>
              <Button
                size="sm"
                color={statusFilter === 'DELETED' ? 'danger' : 'default'}
                variant={statusFilter === 'DELETED' ? 'solid' : 'flat'}
                onPress={() => setStatusFilter('DELETED')}
              >
                Deleted
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardBody className="p-0">
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No documents found</p>
            </div>
          ) : (
            <Table aria-label="Documents table" removeWrapper>
              <TableHeader>
                <TableColumn>DOCUMENT</TableColumn>
                <TableColumn>UPLOADER</TableColumn>
                <TableColumn>SIZE</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>UPLOADED</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
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
                        <Chip size="sm" variant="flat" color="primary">
                          {doc.uploadedBy.role}
                        </Chip>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{formatFileSize(doc.fileSize)}</span>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" color={getStatusColor(doc.status)}>
                        {doc.status}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        onPress={() => openDocumentModal(doc)}
                      >
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Document Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h3 className="text-xl font-bold">Document Details</h3>
              </ModalHeader>
              <ModalBody>
                {selectedDocument && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Title</p>
                      <p className="text-lg font-semibold">{selectedDocument.title}</p>
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
                          <Chip key={tag} size="sm" variant="flat">
                            {tag}
                          </Chip>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600">Uploaded By</p>
                      <p className="text-gray-900">{selectedDocument.uploadedBy.email}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600">Current Status</p>
                      <Chip color={getStatusColor(selectedDocument.status)} className="mt-1">
                        {selectedDocument.status}
                      </Chip>
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium text-gray-600 mb-3">
                        Change Status
                      </p>
                      <div className="flex gap-2">
                        {selectedDocument.status !== 'ONLINE' && (
                          <Button
                            color="success"
                            onPress={() =>
                              handleStatusChange(selectedDocument.id, 'ONLINE')
                            }
                            isDisabled={updating}
                          >
                            ✅ Approve
                          </Button>
                        )}
                        {selectedDocument.status !== 'PENDING' && (
                          <Button
                            color="warning"
                            onPress={() =>
                              handleStatusChange(selectedDocument.id, 'PENDING')
                            }
                            isDisabled={updating}
                          >
                            ⏳ Set Pending
                          </Button>
                        )}
                        {selectedDocument.status !== 'DELETED' && (
                          <Button
                            color="danger"
                            onPress={() =>
                              handleStatusChange(selectedDocument.id, 'DELETED')
                            }
                            isDisabled={updating}
                          >
                            🗑️ Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

export default function AdminDocumentsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-96"><Spinner size="lg" /></div>}>
      <AdminDocumentsContent />
    </Suspense>
  );
}

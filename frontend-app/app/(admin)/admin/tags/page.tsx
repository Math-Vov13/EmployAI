'use client';

import { useEffect, useState } from 'react';
import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { Spinner } from '@heroui/spinner';
import { Input } from '@heroui/input';
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

interface Tag {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface Document {
  tags: string[];
}

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [updating, setUpdating] = useState(false);

  // Create Tag Modal
  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();
  const [createName, setCreateName] = useState('');

  // Edit Tag Modal
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const [editName, setEditName] = useState('');

  // Delete Confirmation Modal
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  useEffect(() => {
    fetchTags();
    fetchDocuments();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tags');
      if (!res.ok) throw new Error('Failed to fetch tags');

      const data = await res.json();
      setTags(data.tags);
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/admin/documents');
      if (!res.ok) throw new Error('Failed to fetch documents');

      const data = await res.json();
      setDocuments(data.documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const getTagUsageCount = (tagName: string): number => {
    return documents.filter((doc) => doc.tags.includes(tagName)).length;
  };

  const handleCreateTag = async () => {
    try {
      setUpdating(true);
      const res = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: createName }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create tag');
      }

      await fetchTags();
      onCreateClose();
      setCreateName('');
    } catch (error) {
      console.error('Error creating tag:', error);
      alert(error instanceof Error ? error.message : 'Failed to create tag');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateTag = async () => {
    if (!selectedTag) return;

    try {
      setUpdating(true);
      const res = await fetch(`/api/admin/tags/${selectedTag.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update tag');
      }

      await fetchTags();
      await fetchDocuments();
      onEditClose();
    } catch (error) {
      console.error('Error updating tag:', error);
      alert(error instanceof Error ? error.message : 'Failed to update tag');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteTag = async () => {
    if (!selectedTag) return;

    try {
      setUpdating(true);
      const res = await fetch(`/api/admin/tags/${selectedTag.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete tag');
      }

      await fetchTags();
      onDeleteClose();
    } catch (error) {
      console.error('Error deleting tag:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete tag');
    } finally {
      setUpdating(false);
    }
  };

  const openEditModal = (tag: Tag) => {
    setSelectedTag(tag);
    setEditName(tag.name);
    onEditOpen();
  };

  const openDeleteModal = (tag: Tag) => {
    setSelectedTag(tag);
    onDeleteOpen();
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
          <h1 className="text-3xl font-bold text-gray-900">Tag Management</h1>
          <p className="text-gray-600 mt-2">Manage document tags and categories</p>
        </div>
        <Button color="primary" onPress={onCreateOpen}>
          ➕ Create Tag
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{tags.length}</p>
            <p className="text-sm text-gray-600">Total Tags</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {tags.filter((tag) => getTagUsageCount(tag.name) > 0).length}
            </p>
            <p className="text-sm text-gray-600">Tags in Use</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-600">
              {tags.filter((tag) => getTagUsageCount(tag.name) === 0).length}
            </p>
            <p className="text-sm text-gray-600">Unused Tags</p>
          </CardBody>
        </Card>
      </div>

      {/* Tags Display */}
      <Card>
        <CardBody className="p-6">
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => {
              const usageCount = getTagUsageCount(tag.name);
              return (
                <Card
                  key={tag.id}
                  className="hover:shadow-md transition-shadow"
                  isPressable={false}
                >
                  <CardBody className="p-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Chip color="primary" variant="flat" size="lg">
                            {tag.name}
                          </Chip>
                          {usageCount > 0 && (
                            <Chip size="sm" color="success" variant="flat">
                              {usageCount} docs
                            </Chip>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          Created {new Date(tag.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          color="primary"
                          variant="flat"
                          onPress={() => openEditModal(tag)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          variant="flat"
                          onPress={() => openDeleteModal(tag)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
          {tags.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No tags found</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Tags Table */}
      <Card>
        <CardBody className="p-0">
          {tags.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No tags found</p>
            </div>
          ) : (
            <Table aria-label="Tags table" removeWrapper>
              <TableHeader>
                <TableColumn>TAG NAME</TableColumn>
                <TableColumn>DOCUMENTS USING</TableColumn>
                <TableColumn>CREATED</TableColumn>
                <TableColumn>LAST UPDATED</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {tags.map((tag) => {
                  const usageCount = getTagUsageCount(tag.name);
                  return (
                    <TableRow key={tag.id}>
                      <TableCell>
                        <Chip color="primary" variant="flat">
                          {tag.name}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{usageCount}</span>
                          {usageCount > 0 && (
                            <Chip size="sm" color="success" variant="dot">
                              In use
                            </Chip>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {new Date(tag.createdAt).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {new Date(tag.updatedAt).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            color="primary"
                            variant="flat"
                            onPress={() => openEditModal(tag)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            color="danger"
                            variant="flat"
                            onPress={() => openDeleteModal(tag)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Create Tag Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h3 className="text-xl font-bold">Create New Tag</h3>
              </ModalHeader>
              <ModalBody>
                <Input
                  label="Tag Name"
                  placeholder="Enter tag name"
                  value={createName}
                  onValueChange={setCreateName}
                  isRequired
                  maxLength={50}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleCreateTag}
                  isDisabled={!createName.trim() || updating}
                >
                  Create Tag
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Tag Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h3 className="text-xl font-bold">Edit Tag</h3>
              </ModalHeader>
              <ModalBody>
                {selectedTag && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Current Name</p>
                      <Chip color="primary" variant="flat">
                        {selectedTag.name}
                      </Chip>
                    </div>
                    <Input
                      label="New Tag Name"
                      placeholder="Enter new tag name"
                      value={editName}
                      onValueChange={setEditName}
                      isRequired
                      maxLength={50}
                    />
                    {getTagUsageCount(selectedTag.name) > 0 && (
                      <Card className="bg-blue-50">
                        <CardBody className="p-3">
                          <p className="text-sm text-blue-800">
                            ℹ️ This tag is used by {getTagUsageCount(selectedTag.name)}{' '}
                            document(s). Renaming will update all documents.
                          </p>
                        </CardBody>
                      </Card>
                    )}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleUpdateTag}
                  isDisabled={!editName.trim() || updating}
                >
                  Update Tag
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h3 className="text-xl font-bold text-red-600">Delete Tag</h3>
              </ModalHeader>
              <ModalBody>
                {selectedTag && (
                  <div>
                    {getTagUsageCount(selectedTag.name) > 0 ? (
                      <div>
                        <p className="mb-4 text-red-600 font-medium">
                          ⚠️ Cannot delete this tag
                        </p>
                        <Card className="bg-red-50">
                          <CardBody className="p-4">
                            <Chip color="primary" variant="flat" className="mb-2">
                              {selectedTag.name}
                            </Chip>
                            <p className="text-sm text-gray-700">
                              This tag is being used by{' '}
                              {getTagUsageCount(selectedTag.name)} document(s).
                            </p>
                            <p className="text-sm text-gray-700 mt-2">
                              Please remove this tag from all documents before deleting it.
                            </p>
                          </CardBody>
                        </Card>
                      </div>
                    ) : (
                      <div>
                        <p className="mb-4">
                          Are you sure you want to delete this tag? This action cannot be
                          undone.
                        </p>
                        <Card className="bg-gray-50">
                          <CardBody className="p-4">
                            <Chip color="primary" variant="flat">
                              {selectedTag.name}
                            </Chip>
                          </CardBody>
                        </Card>
                      </div>
                    )}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  {getTagUsageCount(selectedTag?.name || '') > 0 ? 'Close' : 'Cancel'}
                </Button>
                {selectedTag && getTagUsageCount(selectedTag.name) === 0 && (
                  <Button color="danger" onPress={handleDeleteTag} isDisabled={updating}>
                    Delete Tag
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

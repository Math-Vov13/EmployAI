"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { FiAlertTriangle, FiInfo, FiPlus } from "react-icons/fi";

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
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");

  // Edit Tag Modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState("");

  // Delete Confirmation Modal
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    fetchTags();
    fetchDocuments();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      // Tags API not yet implemented, use empty array for now
      setTags([]);
    } catch (error) {
      console.error("Error fetching tags:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetch("/api-client/documents");
      if (!res.ok) throw new Error("Failed to fetch documents");

      const data = await res.json();

      // Map documents to include tags from metadata
      const mappedDocuments = (data.documents || []).map((doc: any) => ({
        tags: doc.metadata?.tags || [],
      }));
      setDocuments(mappedDocuments);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const getTagUsageCount = (tagName: string): number => {
    return documents.filter((doc) => doc.tags.includes(tagName)).length;
  };

  const handleCreateTag = async () => {
    try {
      setUpdating(true);
      // Tags API not yet implemented
      alert(
        "Tag management is not yet available. This feature is coming soon.",
      );
      setIsCreateOpen(false);
      setCreateName("");
    } catch (error) {
      console.error("Error creating tag:", error);
      alert(error instanceof Error ? error.message : "Failed to create tag");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateTag = async () => {
    if (!selectedTag) return;

    try {
      setUpdating(true);
      // Tags API not yet implemented
      alert(
        "Tag management is not yet available. This feature is coming soon.",
      );
      setIsEditOpen(false);
    } catch (error) {
      console.error("Error updating tag:", error);
      alert(error instanceof Error ? error.message : "Failed to update tag");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteTag = async () => {
    if (!selectedTag) return;

    try {
      setUpdating(true);
      // Tags API not yet implemented
      alert(
        "Tag management is not yet available. This feature is coming soon.",
      );
      setIsDeleteOpen(false);
    } catch (error) {
      console.error("Error deleting tag:", error);
      alert(error instanceof Error ? error.message : "Failed to delete tag");
    } finally {
      setUpdating(false);
    }
  };

  const openEditModal = (tag: Tag) => {
    setSelectedTag(tag);
    setEditName(tag.name);
    setIsEditOpen(true);
  };

  const openDeleteModal = (tag: Tag) => {
    setSelectedTag(tag);
    setIsDeleteOpen(true);
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
          <h1 className="text-3xl font-bold text-gray-900">Tag Management</h1>
          <p className="text-gray-600 mt-2">
            Manage document tags and categories
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <FiPlus className="mr-2" /> Create Tag
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{tags.length}</p>
            <p className="text-sm text-gray-600">Total Tags</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {tags.filter((tag) => getTagUsageCount(tag.name) > 0).length}
            </p>
            <p className="text-sm text-gray-600">Tags in Use</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-600">
              {tags.filter((tag) => getTagUsageCount(tag.name) === 0).length}
            </p>
            <p className="text-sm text-gray-600">Unused Tags</p>
          </CardContent>
        </Card>
      </div>

      {/* Tags Display */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => {
              const usageCount = getTagUsageCount(tag.name);
              return (
                <Card
                  key={tag.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="text-base px-3 py-1">
                            {tag.name}
                          </Badge>
                          {usageCount > 0 && (
                            <Badge variant="secondary">{usageCount} docs</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          Created {new Date(tag.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditModal(tag)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openDeleteModal(tag)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          {tags.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No tags found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tags Table */}
      <Card>
        <CardContent className="p-0">
          {tags.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No tags found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>TAG NAME</TableHead>
                  <TableHead>DOCUMENTS USING</TableHead>
                  <TableHead>CREATED</TableHead>
                  <TableHead>LAST UPDATED</TableHead>
                  <TableHead>ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tags.map((tag) => {
                  const usageCount = getTagUsageCount(tag.name);
                  return (
                    <TableRow key={tag.id}>
                      <TableCell>
                        <Badge variant="outline">{tag.name}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {usageCount}
                          </span>
                          {usageCount > 0 && (
                            <Badge variant="default">In use</Badge>
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
                            variant="outline"
                            onClick={() => openEditModal(tag)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openDeleteModal(tag)}
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
        </CardContent>
      </Card>

      {/* Create Tag Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tag-name">Tag Name</Label>
              <Input
                id="tag-name"
                placeholder="Enter tag name"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                maxLength={50}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateTag}
              disabled={!createName.trim() || updating}
            >
              Create Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Tag Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
          </DialogHeader>
          {selectedTag && (
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Current Name
                </p>
                <Badge variant="outline">{selectedTag.name}</Badge>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tag-name">New Tag Name</Label>
                <Input
                  id="edit-tag-name"
                  placeholder="Enter new tag name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={50}
                />
              </div>
              {getTagUsageCount(selectedTag.name) > 0 && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-3">
                    <p className="text-sm text-blue-800 flex items-start gap-2">
                      <FiInfo className="mt-0.5 flex-shrink-0" /> This tag is
                      used by {getTagUsageCount(selectedTag.name)} document(s).
                      Renaming will update all documents.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateTag}
              disabled={!editName.trim() || updating}
            >
              Update Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Tag</DialogTitle>
          </DialogHeader>
          {selectedTag && (
            <div className="py-4">
              {getTagUsageCount(selectedTag.name) > 0 ? (
                <div>
                  <p className="mb-4 text-red-600 font-medium flex items-center gap-2">
                    <FiAlertTriangle /> Cannot delete this tag
                  </p>
                  <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-4">
                      <Badge variant="outline" className="mb-2">
                        {selectedTag.name}
                      </Badge>
                      <p className="text-sm text-gray-700">
                        This tag is being used by{" "}
                        {getTagUsageCount(selectedTag.name)} document(s).
                      </p>
                      <p className="text-sm text-gray-700 mt-2">
                        Please remove this tag from all documents before
                        deleting it.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div>
                  <p className="mb-4">
                    Are you sure you want to delete this tag? This action cannot
                    be undone.
                  </p>
                  <Card className="bg-gray-50">
                    <CardContent className="p-4">
                      <Badge variant="outline">{selectedTag.name}</Badge>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>
              {getTagUsageCount(selectedTag?.name || "") > 0
                ? "Close"
                : "Cancel"}
            </Button>
            {selectedTag && getTagUsageCount(selectedTag.name) === 0 && (
              <Button
                variant="destructive"
                onClick={handleDeleteTag}
                disabled={updating}
              >
                Delete Tag
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

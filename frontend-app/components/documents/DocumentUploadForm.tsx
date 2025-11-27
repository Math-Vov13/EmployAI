'use client';

import { useState, useEffect } from 'react';
import { Button } from '@heroui/react';
import { Input } from '@heroui/react';
import { Textarea } from '@heroui/react';
import { Select, SelectItem } from '@heroui/react';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { getAllowedFileExtensions, formatFileSize, getMaxFileSize } from '@/app/lib/storage/file-validation';

interface Tag {
  id: string;
  name: string;
}

interface DocumentUploadFormProps {
  onSuccess?: () => void;
}

export function DocumentUploadForm({ onSuccess }: DocumentUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTags, setLoadingTags] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch tags on mount
  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags');
      if (response.ok) {
        const data = await response.json();
        setTags(data.tags);
      }
    } catch (err) {
      console.error('Error fetching tags:', err);
    } finally {
      setLoadingTags(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Auto-fill title from filename if title is empty
      if (!title) {
        const fileNameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '');
        setTitle(fileNameWithoutExt);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!file) {
      setError('Please select a file');
      return;
    }

    if (selectedTags.size === 0) {
      setError('Please select at least one tag');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('tags', JSON.stringify(Array.from(selectedTags)));

      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to upload document');
        setLoading(false);
        return;
      }

      setSuccess('Document uploaded successfully! It will be reviewed by an admin.');
      setFile(null);
      setTitle('');
      setDescription('');
      setSelectedTags(new Set());

      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <h3 className="text-xl font-semibold">Upload Document</h3>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* File Input */}
          <div>
            <label htmlFor="file-input" className="block text-sm font-medium mb-2">
              Select File
            </label>
            <input
              id="file-input"
              type="file"
              onChange={handleFileChange}
              accept={getAllowedFileExtensions()}
              disabled={loading}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {file && (
              <p className="text-sm text-gray-600 mt-1">
                Selected: {file.name} ({formatFileSize(file.size)})
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Max size: {formatFileSize(getMaxFileSize())}. Allowed: PDF, Word, Text, Images
            </p>
          </div>

          {/* Title */}
          <Input
            label="Document Title"
            placeholder="Enter document title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            isDisabled={loading}
            variant="bordered"
          />

          {/* Description */}
          <Textarea
            label="Description"
            placeholder="Describe this document"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            isDisabled={loading}
            variant="bordered"
            minRows={3}
          />

          {/* Tags */}
          <Select
            label="Tags"
            placeholder="Select tags"
            selectedKeys={selectedTags}
            onSelectionChange={(keys) => setSelectedTags(keys as Set<string>)}
            selectionMode="multiple"
            isDisabled={loading || loadingTags}
            variant="bordered"
            isRequired
          >
            {tags.map((tag) => (
              <SelectItem key={tag.name}>
                {tag.name}
              </SelectItem>
            ))}
          </Select>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            color="primary"
            size="lg"
            isLoading={loading}
            className="w-full font-semibold"
          >
            {loading ? 'Uploading...' : 'Upload Document'}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Uploaded documents will be reviewed by an admin before becoming visible to other users.
          </p>
        </form>
      </CardBody>
    </Card>
  );
}

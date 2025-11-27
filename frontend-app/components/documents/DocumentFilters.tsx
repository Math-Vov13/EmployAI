'use client';

import { Select, SelectItem } from '@heroui/select';
import { Input } from '@heroui/input';

interface Tag {
  id: string;
  name: string;
}

interface DocumentFiltersProps {
  tags: Tag[];
  selectedTag: string;
  onTagChange: (tag: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function DocumentFilters({
  tags,
  selectedTag,
  onTagChange,
  searchQuery,
  onSearchChange,
}: DocumentFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1">
        <Input
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          variant="bordered"
          startContent={
            <span className="text-gray-400">🔍</span>
          }
        />
      </div>

      <div className="w-full md:w-64">
        <Select
          label="Filter by tag"
          placeholder="All tags"
          selectedKeys={selectedTag ? [selectedTag] : []}
          onSelectionChange={(keys) => {
            const selected = Array.from(keys)[0] as string;
            onTagChange(selected || '');
          }}
          variant="bordered"
          items={[{ id: '', name: 'All tags' }, ...tags.map(t => ({ id: t.name, name: t.name }))]}
        >
          {(item: {id: string; name: string}) => (
            <SelectItem key={item.id}>
              {item.name}
            </SelectItem>
          )}
        </Select>
      </div>
    </div>
  );
}

import React, { useEffect, useState, useCallback } from 'react';
import { useMediaStore } from '../../stores/mediaStore';
import { Media } from '../../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, Search, Trash2, Copy, Check } from 'lucide-react';

interface MediaLibraryProps {
  onSelect?: (media: Media) => void;
  selectable?: boolean;
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({
  onSelect,
  selectable = false,
}) => {
  const { media, isLoading, fetchMedia, uploadMedia, deleteMedia, pagination } = useMediaStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleSearch = useCallback(() => {
    fetchMedia({ search: searchQuery });
  }, [fetchMedia, searchQuery]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      await uploadMedia(files[0]);
      setUploadDialogOpen(false);
    } catch {
      // Error is handled by the store
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this media?')) {
      await deleteMedia(id);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleSelect = (mediaItem: Media) => {
    if (selectable && onSelect) {
      onSelect(mediaItem);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button variant="outline" onClick={handleSearch}>
            <Search size={18} />
          </Button>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload size={18} className="mr-2" />
              Upload
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Media</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload size={48} className="text-gray-400 mb-4" />
                  <p className="text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-400">PNG, JPG, GIF, WebP, SVG up to 10MB</p>
                </label>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : media.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No media found</p>
          <p className="text-sm">Upload some images to get started</p>
        </div>
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {media.map((item) => (
              <Card
                key={item._id}
                className={`overflow-hidden cursor-pointer transition-all ${
                  selectable ? 'hover:ring-2 hover:ring-blue-500' : ''
                }`}
                onClick={() => handleSelect(item)}
              >
                <CardContent className="p-0">
                  <div className="aspect-square relative group">
                    <img
                      src={item.url}
                      alt={item.originalName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyUrl(item.url);
                          }}
                        >
                          {copiedUrl === item.url ? (
                            <Check size={14} />
                          ) : (
                            <Copy size={14} />
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item._id);
                          }}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-xs truncate" title={item.originalName}>
                      {item.originalName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(item.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === 1}
            onClick={() => fetchMedia({ page: pagination.page - 1 })}
          >
            Previous
          </Button>
          <span className="flex items-center text-sm text-gray-500">
            Page {pagination.page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === pagination.pages}
            onClick={() => fetchMedia({ page: pagination.page + 1 })}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default MediaLibrary;

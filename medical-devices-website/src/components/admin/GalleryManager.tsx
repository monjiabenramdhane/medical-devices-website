'use client';

import { useState } from 'react';
import { ImageUpload } from './ImageUpload';
import { X, GripVertical } from 'lucide-react';

export interface GalleryImage {
  id?: string;
  url: string;
  alt: string;
  order: number;
}

interface GalleryManagerProps {
  images: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
  maxImages?: number;
}

export function GalleryManager({ images, onChange, maxImages = 10 }: GalleryManagerProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleAddImage = (url: string) => {
    const newImage: GalleryImage = {
      url,
      alt: '',
      order: images.length,
    };
    onChange([...images, newImage]);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    // Reorder remaining images
    const reorderedImages = newImages.map((img, i) => ({ ...img, order: i }));
    onChange(reorderedImages);
  };

  const handleUpdateAlt = (index: number, alt: string) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], alt };
    onChange(newImages);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedItem = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedItem);

    // Update order
    const reorderedImages = newImages.map((img, i) => ({ ...img, order: i }));
    onChange(reorderedImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Gallery Images ({images.length}/{maxImages})
        </label>
      </div>

      {/* Existing Images */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {images.map((image, index) => (
            <div
              key={index}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className="relative border-2 border-gray-300 rounded-lg p-4 bg-white hover:border-blue-500 transition-colors cursor-move"
            >
              <div className="absolute top-2 left-2 bg-gray-900 bg-opacity-75 text-white px-2 py-1 rounded text-xs font-semibold">
                #{index + 1}
              </div>
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors z-10"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="absolute top-2 right-10 bg-gray-900 bg-opacity-75 text-white rounded p-1">
                <GripVertical className="h-4 w-4" />
              </div>
              <img
                src={image.url}
                alt={image.alt || `Gallery image ${index + 1}`}
                className="w-full h-48 object-cover rounded mb-2"
              />
              <input
                type="text"
                placeholder="Alt text"
                value={image.alt}
                onChange={(e) => handleUpdateAlt(index, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          ))}
        </div>
      )}

      {/* Add New Image */}
      {canAddMore && (
        <div>
          <ImageUpload
            value=""
            onChange={handleAddImage}
            folder="gallery"
            label="Add Image to Gallery"
          />
        </div>
      )}

      {!canAddMore && (
        <p className="text-sm text-gray-500">
          Maximum number of images reached. Remove an image to add a new one.
        </p>
      )}
    </div>
  );
}
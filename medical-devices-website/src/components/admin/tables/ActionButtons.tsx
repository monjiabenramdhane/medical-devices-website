'use client';

import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ActionButtonsProps {
  editUrl: string;
  deleteUrl?: string; // API endpoint to delete
  onDelete?: () => Promise<void>; // Or a direct handler
  resourceName?: string;
}

export default function ActionButtons({ editUrl, deleteUrl, onDelete, resourceName = 'item' }: ActionButtonsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!onDelete && !deleteUrl) return;
    
    if (confirm(`Are you sure you want to delete this ${resourceName}?`)) {
      setIsDeleting(true);
      try {
        if (onDelete) {
          await onDelete();
        } else if (deleteUrl) {
          const params = new URLSearchParams();
          // params.append('id', ...); // Usually ID is in URL
          
          const res = await fetch(deleteUrl, { method: 'DELETE' });
          if (!res.ok) throw new Error('Delete failed');
        }
        router.refresh();
      } catch (error) {
        console.error('Delete failed', error);
        alert('Failed to delete item');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Link 
        href={editUrl}
        className="p-2 text-[#193660] hover:bg-blue-50 rounded-lg transition-colors"
        title="Edit"
      >
        <Pencil className="h-4 w-4" />
      </Link>
      
      {onDelete && (
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

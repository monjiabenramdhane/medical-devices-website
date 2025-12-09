'use client';

import { Edit2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface ProductActionsProps {
  productId: string;
}

export function ProductActions({ productId }: ProductActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      router.refresh();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/admin/products/${productId}`}
        className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm text-primary hover:bg-primary/10 transition-colors"
      >
        <Edit2 className="w-4 h-4" />
        Edit
      </Link>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" />
        {isDeleting ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  );
}

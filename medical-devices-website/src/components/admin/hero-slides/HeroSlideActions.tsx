'use client';

import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeroSlideService } from '@/services/heroSlide.service';

interface HeroSlideActionsProps {
  slideId: string;
}

export function HeroSlideActions({ slideId }: HeroSlideActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this hero slide?')) {
      setIsDeleting(true);
      try {
        await HeroSlideService.delete(slideId);
        router.refresh();
      } catch (error) {
        console.error('Failed to delete hero slide:', error);
        alert('Failed to delete hero slide');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="flex justify-end space-x-4">
      <Link
        href={`/admin/hero-slides/${slideId}`}
        className="text-[#02445b] hover:text-blue-900"
        title="Edit"
      >
        <EditIcon className="inline h-4 w-4" />
      </Link>
      <button
        className="text-red-600 hover:text-red-900 disabled:opacity-50"
        onClick={handleDelete}
        disabled={isDeleting}
        title="Delete"
      >
        <Trash2 className="inline h-4 w-4" />
      </button>
    </div>
  );
}

function EditIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
      </svg>
    )
  }

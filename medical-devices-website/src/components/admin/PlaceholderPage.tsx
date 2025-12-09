'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';

interface PlaceholderPageProps {
  title: string;
  backUrl: string;
}

export default function PlaceholderPage({ title, backUrl }: PlaceholderPageProps) {
  const params = useParams();
  const isNew = !params.id;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link 
          href={backUrl}
          className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to list
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? `Create ${title}` : `Edit ${title}`}
        </h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="mx-auto h-12 w-12 text-gray-400 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <span className="text-xl font-bold">🛠️</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          The form to {isNew ? 'create a new' : 'edit this'} {title.toLowerCase()} is currently under development.
        </p>
      </div>
    </div>
  );
}

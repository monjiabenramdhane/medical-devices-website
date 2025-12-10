import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { HomeSectionForm } from '@/components/admin/forms/HomeSectionForm';
import { notFound } from 'next/navigation';

export default async function EditHomeSectionPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  
  const section = await prisma.homeSection.findUnique({
    where: { id },
  });

  if (!section) notFound();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Home Section</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <HomeSectionForm initialData={section} isEdit />
      </div>
    </div>
  );
}
import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { BrandForm } from '@/components/admin/forms/BrandForm';
import { notFound } from 'next/navigation';

export default async function EditBrandPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  
  const brand = await prisma.brand.findUnique({
    where: { id },
  });

  if (!brand) notFound();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Brand</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <BrandForm initialData={brand} isEdit />
      </div>
    </div>
  );
}

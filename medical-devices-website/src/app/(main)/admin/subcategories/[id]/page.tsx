import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { SubcategoryForm } from '@/components/admin/forms/SubcategoryForm';
import { notFound } from 'next/navigation';

export default async function EditSubcategoryPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  
  const subcategory = await prisma.subcategory.findUnique({
    where: { id },
    include: {
      equipmentType: {
        include: { brand: true },
      },
    },
  });

  if (!subcategory) notFound();

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#02445b]  mb-8">Edit Subcategory</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <SubcategoryForm initialData={subcategory} isEdit />
      </div>
    </div>
  );
}
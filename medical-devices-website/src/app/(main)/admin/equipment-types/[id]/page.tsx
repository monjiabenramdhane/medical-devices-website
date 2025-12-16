import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { EquipmentTypeForm } from '@/components/admin/forms/EquipmentTypeForm';
import { notFound } from 'next/navigation';

export default async function EditEquipmentTypePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  
  const equipmentType = await prisma.equipmentType.findUnique({
    where: { id },
    include: { brand: true },
  });

  if (!equipmentType) notFound();

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#02445b]  mb-8">Edit Equipment Type</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <EquipmentTypeForm initialData={equipmentType} isEdit />
      </div>
    </div>
  );
}
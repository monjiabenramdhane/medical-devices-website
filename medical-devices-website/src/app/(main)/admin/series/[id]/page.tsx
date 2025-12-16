import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { SeriesForm } from '@/components/admin/forms/SeriesForm';
import { notFound } from 'next/navigation';

export default async function EditSeriesPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  
  const series = await prisma.series.findUnique({
    where: { id },
    include: {
      subcategory: {
        include: {
          equipmentType: {
            include: { brand: true },
          },
        },
      },
    },
  });

  if (!series) notFound();

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#02445b]  mb-8">Edit Series</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <SeriesForm initialData={series} isEdit />
      </div>
    </div>
  );
}
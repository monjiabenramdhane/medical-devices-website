import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { ProductForm } from '@/components/admin/forms/ProductForm';
import { notFound } from 'next/navigation';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  await requireAdmin();
  
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      brand: true,
      equipmentType: true,
      subcategory: true,
      series: true,
      gallery: {
        orderBy: { order: 'asc' },
      },
      sections: {
        orderBy: { order: 'asc' },
      },
      specifications: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!product) notFound();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Product</h1>
      <ProductForm initialData={product} isEdit />
    </div>
  );
}

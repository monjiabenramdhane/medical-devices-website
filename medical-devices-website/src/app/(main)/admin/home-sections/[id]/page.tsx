import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { HomeSectionForm } from '@/components/admin/forms/HomeSectionForm';
import { notFound } from 'next/navigation';
import { ProductService } from '@/services/product.service';
import { BrandService } from '@/services/brand.service';

export default async function EditHomeSectionPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  
  const [sectionRaw, allProductsRaw, allBrandsRaw] = await Promise.all([
    prisma.homeSection.findUnique({
      where: { id },
      include: {
        products: true,
        brands: true,
      }
    }),
    ProductService.getAll({ isActive: true }),
    BrandService.getAll(true),
  ]);

  if (!sectionRaw) notFound();

  // Serialize data to avoid "Props must be serializable" warnings/errors
  const section = JSON.parse(JSON.stringify(sectionRaw));
  const allProducts = JSON.parse(JSON.stringify(allProductsRaw));
  const allBrands = JSON.parse(JSON.stringify(allBrandsRaw));

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#02445b]  mb-8">Edit Home Section</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <HomeSectionForm 
          initialData={section} 
          isEdit 
          allProducts={allProducts} 
          allBrands={allBrands} 
        />
      </div>
    </div>
  );
}
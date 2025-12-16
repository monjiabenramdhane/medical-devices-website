import { requireAdmin } from '@/lib/auth-helpers';
import { HomeSectionForm } from '@/components/admin/forms/HomeSectionForm';
import { ProductService } from '@/services/product.service';
import { BrandService } from '@/services/brand.service';

export default async function NewHomeSectionPage() {
  await requireAdmin();

  const [allProductsRaw, allBrandsRaw] = await Promise.all([
    ProductService.getAll({ isActive: true }),
    BrandService.getAll(true),
  ]);

  const allProducts = JSON.parse(JSON.stringify(allProductsRaw));
  const allBrands = JSON.parse(JSON.stringify(allBrandsRaw));

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#02445b]  mb-8">Create Home Section</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <HomeSectionForm 
          allProducts={allProducts}
          allBrands={allBrands}
        />
      </div>
    </div>
  );
}
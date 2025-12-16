import { requireAdmin } from '@/lib/auth-helpers';
import { ProductForm } from '@/components/admin/forms/ProductForm';

export default async function NewProductPage() {
  await requireAdmin();

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#02445b]  mb-8">Create Product</h1>
      <ProductForm />
    </div>
  );
}
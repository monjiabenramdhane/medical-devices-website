import { requireAdmin } from '@/lib/auth-helpers';
import { BrandForm } from '@/components/admin/forms/BrandForm';

export default async function NewBrandPage() {
  await requireAdmin();

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#02445b]  mb-8">Create Brand</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <BrandForm />
      </div>
    </div>
  );
}
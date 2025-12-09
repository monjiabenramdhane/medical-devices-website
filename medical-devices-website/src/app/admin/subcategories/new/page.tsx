import { requireAdmin } from '@/lib/auth-helpers';
import { SubcategoryForm } from '@/components/admin/forms/SubcategoryForm';

export default async function NewSubcategoryPage() {
  await requireAdmin();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Subcategory</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <SubcategoryForm />
      </div>
    </div>
  );
}
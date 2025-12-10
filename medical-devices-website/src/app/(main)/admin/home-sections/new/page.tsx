import { requireAdmin } from '@/lib/auth-helpers';
import { HomeSectionForm } from '@/components/admin/forms/HomeSectionForm';

export default async function NewHomeSectionPage() {
  await requireAdmin();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Home Section</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <HomeSectionForm />
      </div>
    </div>
  );
}
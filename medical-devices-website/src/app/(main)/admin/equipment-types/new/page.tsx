import { requireAdmin } from '@/lib/auth-helpers';
import { EquipmentTypeForm } from '@/components/admin/forms/EquipmentTypeForm';

export default async function NewEquipmentTypePage() {
  await requireAdmin();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Equipment Type</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <EquipmentTypeForm />
      </div>
    </div>
  );
}
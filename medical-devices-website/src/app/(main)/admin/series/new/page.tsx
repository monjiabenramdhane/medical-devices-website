import { requireAdmin } from '@/lib/auth-helpers';
import { SeriesForm } from '@/components/admin/forms/SeriesForm';

export default async function NewSeriesPage() {
  await requireAdmin();

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#02445b]  mb-8">Create Series</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <SeriesForm />
      </div>
    </div>
  );
}

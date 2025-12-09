import { requireAdmin } from '@/lib/auth-helpers';
import { HeroSlideForm } from '@/components/admin/forms/HeroSlideForm';

export default async function NewHeroSlidePage() {
  await requireAdmin();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Create Hero Slide
      </h1>
      <div className="bg-white rounded-lg shadow p-6">
        <HeroSlideForm />
      </div>
    </div>
  );
}
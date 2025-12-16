import { requireAdmin } from '@/lib/auth-helpers';
import { HeroSlideService } from '@/services/heroSlide.service';
import { HeroSlideForm } from '@/components/admin/forms/HeroSlideForm';
import { notFound } from 'next/navigation';

export default async function EditHeroSlidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const slide = await HeroSlideService.getById(id);

  if (!slide) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#02445b]  mb-8">
        Edit Hero Slide
      </h1>
      <div className="bg-white rounded-lg shadow p-6">
        <HeroSlideForm initialData={slide} isEdit />
      </div>
    </div>
  );
}
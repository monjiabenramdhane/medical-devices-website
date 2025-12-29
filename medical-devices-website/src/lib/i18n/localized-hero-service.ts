import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';
import { type Locale, DEFAULT_LOCALE } from './types';

export async function getLocalizedHeroSlides(locale: Locale) {
  return unstable_cache(
    async () => {
      const slides = await prisma.heroSlide.findMany({
        where: { isActive: true },
        include: {
          hero_slide_translations: {
            where: { locale: { in: [locale, DEFAULT_LOCALE] } },
          },
        },
        orderBy: { order: 'asc' },
      });

      return slides.map((slide: any) => {
        const translation =
          slide.hero_slide_translations.find((t: any) => t.locale === locale) ||
          slide.hero_slide_translations.find((t: any) => t.locale === DEFAULT_LOCALE);

        return {
          ...slide,
          title: translation?.title || slide.title,
          subtitle: translation?.subtitle || slide.subtitle,
          description: translation?.description || slide.description,
          ctaText: translation?.ctaText || slide.ctaText,
        };
      });
    },
    ['hero-slides', locale],
    { tags: ['hero'] }
  )();
}
import { prisma } from '@/lib/prisma';
import { cache } from 'react';
import { type Locale, DEFAULT_LOCALE } from './types';

export const getLocalizedHeroSlides = cache(async (locale: Locale) => {
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
});
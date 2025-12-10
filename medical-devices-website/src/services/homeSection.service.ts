
import { DEFAULT_LOCALE } from '@/lib/i18n/types';
import { prisma } from '@/lib/prisma';
import { HomeSection } from '@prisma/client';

export const HomeSectionService = {
  getByKey: async (key: string): Promise<HomeSection | null> => {
    return prisma.homeSection.findUnique({
      where: {
        sectionKey: key,
        isActive: true,
      },
    });
  },

  getAll: async (activeOnly = true): Promise<HomeSection[]> => {
    return prisma.homeSection.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { order: 'asc' },
    });
  },

  getLocalizedByKey: async (key: string, locale: string = DEFAULT_LOCALE): Promise<HomeSection | null> => {
    const section = await prisma.homeSection.findUnique({
      where: { sectionKey: key, isActive: true },
      include: {
        home_section_translations: {
          where: { locale },
        },
      },
    });

    if (!section) return null;

    const translation = section.home_section_translations[0];
    return {
      ...section,
      title: translation?.title || section.title,
      subtitle: translation?.subtitle ?? section.subtitle,
      content: translation?.content || section.content,
      ctaText: translation?.ctaText ?? section.ctaText,
      imageUrl: translation?.imageUrl ?? section.imageUrl,
      imageAlt: translation?.imageAlt ?? section.imageAlt,
    };
    
  },
};

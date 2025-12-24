import { prisma } from '@/lib/prisma';
import type { HeroSlide, CreateHeroSlideInput, UpdateHeroSlideInput } from '@/types';
import { translateService } from '@/lib/translation/libretranslate';
import { DEFAULT_LOCALE } from '@/lib/i18n/types';

export class HeroSlideService {
  static async getAll(activeOnly: boolean = false): Promise<HeroSlide[]> {
    return prisma.heroSlide.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      include: {
        hero_slide_translations: true,
      },
      orderBy: { order: 'asc' },
    });
  }

  static async getById(id: string): Promise<HeroSlide | null> {
    return prisma.heroSlide.findUnique({
      where: { id },
      include: {
        hero_slide_translations: true,
      },
    });
  }

  static async create(data: CreateHeroSlideInput): Promise<HeroSlide> {
    // Process translations and auto-fill missing locales
    const { localizedData } = await translateService.processHeroSlideContent(data);

    // Prepare the main data using the default locale (English)
    const mainDetails = localizedData[DEFAULT_LOCALE] || localizedData[Object.keys(localizedData)[0]] || data;

    return prisma.heroSlide.create({
      data: {
        ...data,
        title: mainDetails.title || data.title,
        subtitle: mainDetails.subtitle || data.subtitle,
        description: mainDetails.description || data.description,
        ctaText: mainDetails.ctaText || data.ctaText,
        order: data.order ?? 0,
        isActive: data.isActive ?? true,
        hero_slide_translations: {
          create: Object.entries(localizedData).map(([locale, content]) => ({
            locale,
            title: content.title || data.title,
            subtitle: content.subtitle,
            description: content.description,
            ctaText: content.ctaText,
          })),
        },
      },
      include: {
        hero_slide_translations: true,
      },
    });
  }

  static async update(id: string, data: UpdateHeroSlideInput): Promise<HeroSlide> {
    // Process translations and auto-fill missing locales
    const { localizedData } = await translateService.processHeroSlideContent(data as any);

    // Prepare the main data using the default locale (English)
    const mainDetails = localizedData[DEFAULT_LOCALE] || localizedData[Object.keys(localizedData)[0]] || data;

    // Preparation for translation update
    const translationsData = Object.entries(localizedData).map(([locale, content]) => ({
      heroSlideId: id,
      locale,
      title: content.title || (data as any).title,
      subtitle: content.subtitle,
      description: content.description,
      ctaText: content.ctaText,
    }));

    const slide = await prisma.heroSlide.update({
      where: { id },
      data: {
        ...data,
        title: mainDetails.title,
        subtitle: mainDetails.subtitle,
        description: mainDetails.description,
        ctaText: mainDetails.ctaText,
      },
      include: {
        hero_slide_translations: true,
      },
    });

    // Update translations: delete and recreate
    await prisma.hero_slide_translations.deleteMany({
      where: { heroSlideId: id },
    });

    await prisma.hero_slide_translations.createMany({
      data: translationsData,
    });

    return slide;
  }

  static async delete(id: string): Promise<HeroSlide> {
    return prisma.heroSlide.delete({
      where: { id },
    });
  }

  static async getLocalized(locale: string = 'en'): Promise<HeroSlide[]> {
    const slides = await prisma.heroSlide.findMany({
      where: { isActive: true },
      include: {
        hero_slide_translations: {
          where: { locale },
        },
      },
      orderBy: { order: 'asc' },
    });

    return slides.map(slide => {
      const translation = slide.hero_slide_translations[0];
      return {
        ...slide,
        title: translation?.title || slide.title,
        subtitle: translation?.subtitle || slide.subtitle,
        description: translation?.description || slide.description,
        ctaText: translation?.ctaText || slide.ctaText,
      };
    });
  }
}
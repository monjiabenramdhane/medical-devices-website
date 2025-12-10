import { prisma } from '@/lib/prisma';
import type { HeroSlide, CreateHeroSlideInput, UpdateHeroSlideInput } from '@/types';

export class HeroSlideService {
  static async getAll(activeOnly: boolean = false): Promise<HeroSlide[]> {
    return prisma.heroSlide.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { order: 'asc' },
    });
  }

  static async getById(id: string): Promise<HeroSlide | null> {
    return prisma.heroSlide.findUnique({
      where: { id },
    });
  }

  static async create(data: CreateHeroSlideInput): Promise<HeroSlide> {
    return prisma.heroSlide.create({
      data: {
        ...data,
        order: data.order ?? 0,
        isActive: data.isActive ?? true,
      },
    });
  }

  static async update(id: string, data: UpdateHeroSlideInput): Promise<HeroSlide> {
    return prisma.heroSlide.update({
      where: { id },
      data,
    });
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
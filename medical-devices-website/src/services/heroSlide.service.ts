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
}
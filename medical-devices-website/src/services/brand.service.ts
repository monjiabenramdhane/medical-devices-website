import { prisma } from '@/lib/prisma';
import { cache } from 'react';
import type { Brand, CreateBrandInput, UpdateBrandInput } from '@/types';

// Cached version of getAll with optimized field selection
const getCachedBrands = cache(async (activeOnly: boolean) => {
  return prisma.brand.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      logoAlt: true,
      order: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      // Omit: description, equipmentTypes - not needed for list view
    },
    orderBy: { order: 'asc' },
  });
});

export class BrandService {
  static async getAll(activeOnly: boolean = false): Promise<Brand[]> {
    return getCachedBrands(activeOnly);
  }

  static async getBySlug(slug: string): Promise<Brand | null> {
    return prisma.brand.findUnique({
      where: { slug },
      include: {
        equipmentTypes: {
          where: { isActive: true },
          include: {
            subcategories: {
              where: { isActive: true },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  static async getById(id: string): Promise<Brand | null> {
    return prisma.brand.findUnique({
      where: { id },
      include: {
        equipmentTypes: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  static async create(data: CreateBrandInput): Promise<Brand> {
    return prisma.brand.create({
      data: {
        ...data,
        order: data.order ?? 0,
        isActive: data.isActive ?? true,
      },
    });
  }

  static async update(id: string, data: UpdateBrandInput): Promise<Brand> {
    return prisma.brand.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string): Promise<Brand> {
    return prisma.brand.delete({
      where: { id },
    });
  }
}
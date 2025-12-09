import { prisma } from '@/lib/prisma';
import type { Brand, CreateBrandInput, UpdateBrandInput } from '@/types';

export class BrandService {
  static async getAll(activeOnly: boolean = false): Promise<Brand[]> {
    return prisma.brand.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      include: {
        equipmentTypes: {
          where: activeOnly ? { isActive: true } : undefined,
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });
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
import { prisma } from '@/lib/prisma';
import type { Product, CreateProductInput, UpdateProductInput, Gamme, Specialty } from '@/types';

export class ProductService {
  static async getAll(filters?: {
    brandId?: string;
    equipmentTypeId?: string;
    subcategoryId?: string;
    seriesId?: string;
    gamme?: Gamme;
    specialty?: Specialty;
    isFeatured?: boolean;
    isActive?: boolean;
    limit?: number;
    skip?: number;
  }): Promise<Product[]> {
    const where: any = {};

    if (filters?.brandId) where.brandId = filters.brandId;
    if (filters?.equipmentTypeId) where.equipmentTypeId = filters.equipmentTypeId;
    if (filters?.subcategoryId) where.subcategoryId = filters.subcategoryId;
    if (filters?.seriesId) where.seriesId = filters.seriesId;
    if (filters?.gamme) where.gamme = filters.gamme;
    if (filters?.specialty) where.specialty = filters.specialty;
    if (filters?.isFeatured !== undefined) where.isFeatured = filters.isFeatured;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;

    return prisma.product.findMany({
      where,
      include: {
        brand: true,
        equipmentType: true,
        subcategory: {
          include: {
            equipmentType: true,
          },
        },
        series: true,
        gallery: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
      take: filters?.limit,
      skip: filters?.skip,
    });
  }

  static async getBySlug(slug: string, brandSlug: string): Promise<Product | null> {
    return prisma.product.findFirst({
      where: {
        slug,
        brand: { slug: brandSlug },
      },
      include: {
        brand: true,
        equipmentType: true,
        subcategory: true,
        series: true,
        gallery: {
          orderBy: { order: 'asc' },
        },
        sections: {
          orderBy: { order: 'asc' },
        },
        specifications: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  static async getById(id: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { id },
      include: {
        brand: true,
        equipmentType: true,
        subcategory: true,
        series: true,
        gallery: {
          orderBy: { order: 'asc' },
        },
        sections: {
          orderBy: { order: 'asc' },
        },
        specifications: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  static async create(data: CreateProductInput): Promise<Product> {
    return prisma.product.create({
      data: {
        ...data,
        order: data.order ?? 0,
        isFeatured: data.isFeatured ?? false,
        isActive: data.isActive ?? true,
      },
      include: {
        brand: true,
        equipmentType: true,
        subcategory: true,
        series: true,
      },
    });
  }

  static async update(id: string, data: UpdateProductInput): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data,
      include: {
        brand: true,
        equipmentType: true,
        subcategory: true,
        series: true,
      },
    });
  }

  static async delete(id: string): Promise<Product> {
    return prisma.product.delete({
      where: { id },
    });
  }

  static async getFeatured(limit: number = 6): Promise<Product[]> {
    return this.getAll({
      isFeatured: true,
      isActive: true,
      limit,
    });
  }
}
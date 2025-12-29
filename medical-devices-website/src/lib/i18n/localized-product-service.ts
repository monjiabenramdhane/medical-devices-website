import { prisma } from '@/lib/prisma';
import { type Locale, DEFAULT_LOCALE } from './types';
import { unstable_cache } from 'next/cache';
import { Prisma, Gamme, Specialty } from '@prisma/client';

// Define the shape of the product with all included relations
type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    brand: {
      include: {
        translations: true;
      };
    };
    translations: true;
    equipmentType: true;
    subcategory: true;
    series: true;
    gallery: true;
    sections: true;
    specifications: true;
  };
}>;

type ProductTranslation = ProductWithRelations['translations'][number];
type BrandTranslation = ProductWithRelations['brand']['translations'][number];

/**
 * Get localized product with fallback to default locale
 */
export async function getLocalizedProduct(slug: string, locale: Locale) {
  return unstable_cache(
    async () => {
      // 1. Fetch core product with primary translations and heavy assets
      const product = await prisma.product.findFirst({
        where: { slug },
        include: {
          translations: {
            where: { locale: { in: [locale, DEFAULT_LOCALE] } },
          },
          gallery: { orderBy: { order: 'asc' } },
          sections: { orderBy: { order: 'asc' } },
          specifications: { orderBy: { order: 'asc' } },
          brand: true,
          equipmentType: true,
          subcategory: true,
          series: true,
        },
      });

      if (!product) return null;

      // 2. Fetch translations for relations in parallel to avoid complex joins
      const [brandTrans, etTrans, subTrans, seriesTrans] = await Promise.all([
        product.brandId ? prisma.brandTranslation.findMany({
          where: { brandId: product.brandId, locale: { in: [locale, DEFAULT_LOCALE] } }
        }) : Promise.resolve([]),
        product.equipmentTypeId ? prisma.equipmentTypeTranslation.findMany({
          where: { equipmentTypeId: product.equipmentTypeId, locale: { in: [locale, DEFAULT_LOCALE] } }
        }) : Promise.resolve([]),
        product.subcategoryId ? prisma.subcategoryTranslation.findMany({
          where: { subcategoryId: product.subcategoryId, locale: { in: [locale, DEFAULT_LOCALE] } }
        }) : Promise.resolve([]),
        product.seriesId ? prisma.seriesTranslation.findMany({
          where: { seriesId: product.seriesId, locale: { in: [locale, DEFAULT_LOCALE] } }
        }) : Promise.resolve([]),
      ]);

      // Helper for finding translations
      const findTrans = (arr: any[]) =>
        arr.find((t) => t.locale === locale) || arr.find((t) => t.locale === DEFAULT_LOCALE);

      const translation = findTrans(product.translations);
      const brandTranslation = findTrans(brandTrans);

      // Localize relations
      const equipmentType = product.equipmentType ? {
        ...product.equipmentType,
        name: findTrans(etTrans)?.name || product.equipmentType.name,
        description: findTrans(etTrans)?.description || product.equipmentType.description,
      } : null;

      const subcategory = product.subcategory ? {
        ...product.subcategory,
        name: findTrans(subTrans)?.name || product.subcategory.name,
        description: findTrans(subTrans)?.description || product.subcategory.description,
      } : null;

      const series = product.series ? {
        ...product.series,
        name: findTrans(seriesTrans)?.name || product.series.name,
        description: findTrans(seriesTrans)?.description || product.series.description,
      } : null;

      return {
        ...product,
        name: translation?.name || product.name,
        shortDescription: translation?.shortDescription || product.shortDescription,
        fullDescription: translation?.fullDescription || product.fullDescription,
        heroImageAlt: translation?.heroImageAlt || product.heroImageAlt,
        metaTitle: translation?.metaTitle || product.metaTitle,
        metaDescription: translation?.metaDescription || product.metaDescription,
        metaKeywords: translation?.metaKeywords || product.metaKeywords,
        brand: {
          ...product.brand,
          name: brandTranslation?.name || product.brand.name,
          description: brandTranslation?.description || product.brand.description,
          metaTitle: brandTranslation?.metaTitle || product.brand.metaTitle,
          metaDescription: brandTranslation?.metaDescription || product.brand.metaDescription,
        },
        equipmentType,
        subcategory,
        series,
        sections: product.sections,
        specifications: product.specifications,
        gallery: product.gallery,
      };
    },
    ['product-details', slug, locale],
    { tags: ['product'] }
  )();
}

/**
 * Get localized products list with filtering
 */
export async function getLocalizedProducts(
  locale: Locale,
  filters?: {
    brandId?: string;
    limit?: number;
    isFeatured?: boolean;
    brandSlug?: string;
    gamme?: Gamme;
    specialty?: Specialty;
    search?: string;
  }
) {
  return unstable_cache(
    async () => {
      const where: Prisma.ProductWhereInput = {
        isActive: true,
      };

      if (filters?.brandId) where.brandId = filters.brandId;
      if (filters?.brandSlug) where.brand = { slug: filters.brandSlug };
      if (filters?.isFeatured !== undefined) where.isFeatured = filters.isFeatured;
      if (filters?.gamme) where.gamme = filters.gamme;
      if (filters?.specialty) where.specialty = filters.specialty;

      if (filters?.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { shortDescription: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      // 1. Fetch products with basic relations (no deep translation joins)
      const products = await prisma.product.findMany({
        where,
        include: {
          brand: true,
          translations: {
            where: { locale: { in: [locale, DEFAULT_LOCALE] } },
          },
          equipmentType: true,
          subcategory: true,
          series: true,
        },
        take: filters?.limit,
        orderBy: [
          { isFeatured: 'desc' },
          { order: 'asc' },
        ],
      });

      // 2. Fetch distinct brand translations in bulk to avoid N+1
      const brandIds = [...new Set(products.map(p => p.brandId).filter(Boolean))];
      const brandTranslations = await prisma.brandTranslation.findMany({
        where: {
          brandId: { in: brandIds as string[] },
          locale: { in: [locale, DEFAULT_LOCALE] }
        }
      });

      const findTrans = (arr: any[]) =>
        arr.find((t) => t.locale === locale) || arr.find((t) => t.locale === DEFAULT_LOCALE);

      return products.map((product) => {
        const translation = findTrans(product.translations);
        const bTranslations = brandTranslations.filter(t => t.brandId === product.brandId);
        const brandTranslation = findTrans(bTranslations);

        return {
          ...product,
          name: translation?.name || product.name,
          shortDescription: translation?.shortDescription || product.shortDescription,
          heroImageAlt: translation?.heroImageAlt || product.heroImageAlt,
          brand: {
            ...product.brand,
            name: brandTranslation?.name || product.brand.name,
            description: brandTranslation?.description || product.brand.description,
          },
        };
      });
    },
    ['products-list', locale, JSON.stringify(filters || {})],
    { tags: ['products'] }
  )();
}

import { prisma } from '@/lib/prisma';
import { type Locale, DEFAULT_LOCALE } from './types';
import { cache } from 'react';
import { Prisma } from '@prisma/client';

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
export const getLocalizedProduct = cache(
  async (slug: string, locale: Locale) => {
    const product = await prisma.product.findFirst({
      where: { slug },
      include: {
        brand: {
          include: {
            translations: {
              where: { locale: { in: [locale, DEFAULT_LOCALE] } },
            },
          },
        },
        translations: {
          where: { locale: { in: [locale, DEFAULT_LOCALE] } },
        },
        equipmentType: true,
        subcategory: {
          include: {
            equipmentType: true,
          },
        },
        series: true,
        gallery: { orderBy: { order: 'asc' } },
        sections: { orderBy: { order: 'asc' } },
        specifications: { orderBy: { order: 'asc' } },
      },
    });

    if (!product) return null;

    console.log(`[getLocalizedProduct] Fetching for ${product.slug} in ${locale}`);
    console.log(`[getLocalizedProduct] Translations found: ${product.translations.length}`);
    product.translations.forEach((t: ProductTranslation) => console.log(` - ${t.locale}: ${t.name}`));

    // Get translation for current locale or fallback
    const translation =
      product.translations.find((t: ProductTranslation) => t.locale === locale) ||
      product.translations.find((t: ProductTranslation) => t.locale === DEFAULT_LOCALE);

    const brandTranslation =
      product.brand.translations.find((t: BrandTranslation) => t.locale === locale) ||
      product.brand.translations.find((t: BrandTranslation) => t.locale === DEFAULT_LOCALE);

    return {
      ...product,
      name: translation?.name || product.name,
      shortDescription: translation?.shortDescription || product.shortDescription,
      fullDescription: translation?.fullDescription || product.fullDescription,
      metaTitle: translation?.metaTitle || product.metaTitle,
      metaDescription: translation?.metaDescription || product.metaDescription,
      brand: {
        ...product.brand,
        description: brandTranslation?.description || product.brand.description,
        metaTitle: brandTranslation?.metaTitle || product.brand.metaTitle,
        metaDescription: brandTranslation?.metaDescription || product.brand.metaDescription,
      },
      equipmentType: product.equipmentType,
      subcategory: product.subcategory,
      series: product.series,
      sections: product.sections,
      specifications: product.specifications,
      gallery: product.gallery,
    };
  }
);

/**
 * Get localized products list
 */
export const getLocalizedProducts = cache(
  async (locale: Locale, filters?: { brandId?: string; limit?: number; isFeatured?: boolean }) => {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        brandId: filters?.brandId,
        isFeatured: filters?.isFeatured,
      },
      include: {
        brand: true,
        translations: {
          where: { locale: { in: [locale, DEFAULT_LOCALE] } },
        },
      },
      take: filters?.limit,
      orderBy: { order: 'asc' },
    });

    return products.map((product) => {
      // We can infer the type here from the query, but explicit typing helps clarity
      const translations = product.translations;

      const translation =
        translations.find((t) => t.locale === locale) ||
        translations.find((t) => t.locale === DEFAULT_LOCALE);

      return {
        ...product,
        name: translation?.name || product.name,
        shortDescription: translation?.shortDescription || product.shortDescription,
      };
    });
  }
);

import { DEFAULT_LOCALE } from '@/lib/i18n/types';
import { prisma } from '@/lib/prisma';
import { cache } from 'react';
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

  getLocalizedByKey: cache(async (key: string, locale: string = DEFAULT_LOCALE) => {
    // Optimized query to reduce payload
    const section = await prisma.homeSection.findUnique({
      where: { sectionKey: key, isActive: true },
      include: {
        home_section_translations: {
          where: { locale },
        },
        products: {
          where: { isActive: true },
          include: {
            brand: {
              select: { id: true, name: true, slug: true },
            },
            equipmentType: {
              select: { id: true, name: true },
            },
            // Omit: gallery, subcategory, series, fullDescription, specifications
            translations: {
              where: { locale },
            }
          },
          orderBy: { order: 'asc' },
        },
        brands: {
          where: { isActive: true },
          include: {
            translations: {
              where: { locale },
            }
          },
          orderBy: { order: 'asc' },
        }
      },
    });

    if (!section) return null;

    const translation = section.home_section_translations[0];

    // Map localized fields for products
    const localizedProducts = section.products.map((product: any) => {
      const prodTranslation = product.translations[0];
      return {
        ...product,
        name: prodTranslation?.name || product.name,
        shortDescription: prodTranslation?.shortDescription || product.shortDescription,
        fullDescription: prodTranslation?.fullDescription || product.fullDescription,
        metaTitle: prodTranslation?.metaTitle || product.metaTitle,
        metaDescription: prodTranslation?.metaDescription || product.metaDescription,
        heroImageAlt: prodTranslation?.heroImageAlt || product.heroImageAlt,
        // Cleanup translations array nicely, though mostly internal
        translations: undefined
      };
    });

    // Map localized fields for brands
    const localizedBrands = section.brands.map((brand: any) => {
      const brandTranslation = brand.translations[0];
      return {
        ...brand,
        name: brandTranslation?.name || brand.name, // Usually brand name shouldn't change, but schema allows it
        description: brandTranslation?.description || brand.description,
        metaTitle: brandTranslation?.metaTitle || brand.metaTitle,
        metaDescription: brandTranslation?.metaDescription || brand.metaDescription,
        translations: undefined
      };
    });

    return {
      ...section,
      title: translation?.title || section.title,
      subtitle: translation?.subtitle ?? section.subtitle,
      content: translation?.content || section.content,
      ctaText: translation?.ctaText ?? section.ctaText,
      imageUrl: translation?.imageUrl ?? section.imageUrl,
      imageAlt: translation?.imageAlt ?? section.imageAlt,
      products: localizedProducts,
      brands: localizedBrands,
    };
  }),
};

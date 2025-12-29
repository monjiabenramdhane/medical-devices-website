
import { prisma } from '@/lib/prisma';
import { DEFAULT_LOCALE } from './types';
import { unstable_cache } from 'next/cache';

export interface LocalizedBrand {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    logoUrl: string;
    logoAlt: string;
    websiteUrl: string | null;
    heroImageUrl: string | null;
    heroImageAlt: string | null;
    equipmentTypes: LocalizedEquipmentType[];
    metaTitle: string | null;
    metaDescription: string | null;
}

export interface LocalizedEquipmentType {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    iconUrl: string | null;
    heroImageUrl: string | null;
    heroImageAlt: string | null;
    subcategories: LocalizedSubcategory[];
    brand?: { name: string; slug: string; logoUrl: string, logoAlt: string };
}

export interface LocalizedSubcategory {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    heroImageUrl: string | null;
    heroImageAlt: string | null;
    series: LocalizedSeries[];
    products: any[];
    productCount?: number;
    seriesCount?: number;
    equipmentType?: { name: string; slug: string; brand: { name: string; slug: string; logoUrl?: string } };
}

export interface LocalizedSeries {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    imageAlt: string | null;
    productCount: number;
}


export async function getLocalizedBrands(locale: string = DEFAULT_LOCALE): Promise<LocalizedBrand[]> {
    return unstable_cache(
        async () => {
            const brands = await prisma.brand.findMany({
                where: { isActive: true },
                orderBy: { order: 'asc' },
                include: {
                    translations: {
                        where: { locale: { in: [locale, DEFAULT_LOCALE] } }
                    },
                    equipmentTypes: {
                        where: { isActive: true },
                        select: { id: true }
                    }
                }
            });

            const findTrans = (arr: any[]) =>
                arr.find((t) => t.locale === locale) || arr.find((t) => t.locale === DEFAULT_LOCALE);

            return brands.map(b => {
                const t = findTrans(b.translations);
                return {
                    id: b.id,
                    slug: b.slug,
                    name: t?.name || b.name,
                    description: t?.description || b.description,
                    logoUrl: b.logoUrl,
                    logoAlt: b.logoAlt,
                    websiteUrl: b.websiteUrl,
                    heroImageUrl: null,
                    heroImageAlt: null,
                    metaTitle: t?.metaTitle || b.metaTitle,
                    metaDescription: t?.metaDescription || b.metaDescription,
                    equipmentTypes: b.equipmentTypes.map(et => ({ ...et } as any))
                };
            });
        },
        ['localized-brands', locale],
        { tags: ['brands'] }
    )();
}

export async function getLocalizedBrand(slug: string, locale: string = DEFAULT_LOCALE): Promise<LocalizedBrand | null> {
    return unstable_cache(
        async () => {
            const brand = await prisma.brand.findUnique({
                where: { slug },
                include: {
                    translations: {
                        where: { locale: { in: [locale, DEFAULT_LOCALE] } }
                    },
                    equipmentTypes: {
                        where: { isActive: true },
                        orderBy: { order: 'asc' },
                        include: {
                            translations: {
                                where: { locale: { in: [locale, DEFAULT_LOCALE] } }
                            }
                        }
                    }
                }
            });

            if (!brand) return null;

            const findTrans = (arr: any[]) =>
                arr.find((t) => t.locale === locale) || arr.find((t) => t.locale === DEFAULT_LOCALE);

            const t = findTrans(brand.translations);

            const localizedETs = await Promise.all(brand.equipmentTypes.map(async (et) => {
                const etT = findTrans(et.translations);
                const subCount = await prisma.subcategory.count({
                    where: { equipmentTypeId: et.id, isActive: true }
                });

                return {
                    id: et.id,
                    slug: et.slug,
                    name: etT?.name || et.name,
                    description: etT?.description || et.description,
                    iconUrl: et.iconUrl,
                    heroImageUrl: et.heroImageUrl,
                    heroImageAlt: et.heroImageAlt,
                    subcategories: Array(subCount).fill({}),
                };
            }));

            return {
                id: brand.id,
                slug: brand.slug,
                name: t?.name || brand.name,
                description: t?.description || brand.description,
                logoUrl: brand.logoUrl,
                logoAlt: brand.logoAlt,
                websiteUrl: brand.websiteUrl,
                heroImageUrl: brand.heroImageUrl,
                heroImageAlt: brand.heroImageAlt,
                metaTitle: t?.metaTitle || brand.metaTitle,
                metaDescription: t?.metaDescription || brand.metaDescription,
                equipmentTypes: localizedETs
            };
        },
        ['localized-brand', slug, locale],
        { tags: ['brands'] }
    )();
}

export async function getLocalizedEquipmentType(
    brandSlug: string,
    equipmentSlug: string,
    locale: string = DEFAULT_LOCALE
): Promise<LocalizedEquipmentType | null> {
    return unstable_cache(
        async () => {
            const et = await prisma.equipmentType.findFirst({
                where: {
                    slug: equipmentSlug,
                    brand: { slug: brandSlug },
                    isActive: true
                },
                include: {
                    brand: true,
                    translations: {
                        where: { locale: { in: [locale, DEFAULT_LOCALE] } }
                    },
                    subcategories: {
                        where: { isActive: true },
                        orderBy: { order: 'asc' },
                    }
                }
            });

            if (!et) return null;

            // Fetch related translations in parallel
            const [brandTrans, subTrans] = await Promise.all([
                prisma.brandTranslation.findMany({
                    where: { brandId: et.brandId, locale: { in: [locale, DEFAULT_LOCALE] } }
                }),
                prisma.subcategoryTranslation.findMany({
                    where: {
                        subcategory: { equipmentTypeId: et.id },
                        locale: { in: [locale, DEFAULT_LOCALE] }
                    }
                })
            ]);

            const findTrans = (arr: any[]) =>
                arr.find((t) => t.locale === locale) || arr.find((t) => t.locale === DEFAULT_LOCALE);

            const brandT = findTrans(brandTrans);
            const etT = findTrans(et.translations);

            const localizedSubcategories = await Promise.all(et.subcategories.map(async (sub) => {
                const subTranslations = subTrans.filter(t => t.subcategoryId === sub.id);
                const subT = findTrans(subTranslations);

                // Keep the counts as separate cheap queries or batch them if there are many
                // For now, keeping as is since N is usually small for subcategories
                const prodCount = await prisma.product.count({ where: { subcategoryId: sub.id, isActive: true } });
                const seriesCount = await prisma.series.count({ where: { subcategoryId: sub.id, isActive: true } });

                return {
                    id: sub.id,
                    slug: sub.slug,
                    name: subT?.name || sub.name,
                    description: subT?.description || sub.description,
                    heroImageUrl: sub.heroImageUrl,
                    heroImageAlt: subT?.heroImageAlt || sub.heroImageAlt,
                    productCount: prodCount,
                    seriesCount: seriesCount,
                    series: [],
                    products: []
                } as LocalizedSubcategory;
            }));

            return {
                id: et.id,
                slug: et.slug,
                name: etT?.name || et.name,
                description: etT?.description || et.description,
                iconUrl: et.iconUrl,
                heroImageUrl: et.heroImageUrl,
                heroImageAlt: et.heroImageAlt,
                subcategories: localizedSubcategories,
                brand: {
                    name: brandT?.name || et.brand.name,
                    slug: et.brand.slug,
                    logoUrl: et.brand.logoUrl,
                    logoAlt: et.brand.logoAlt
                }
            };
        },
        ['localized-equipment-type', brandSlug, equipmentSlug, locale],
        { tags: ['brands', 'equipment-types'] }
    )();
}

export async function getLocalizedSubcategory(
    brandSlug: string,
    equipmentSlug: string,
    subcategorySlug: string,
    locale: string = DEFAULT_LOCALE
): Promise<LocalizedSubcategory | null> {
    return unstable_cache(
        async () => {
            const sub = await prisma.subcategory.findFirst({
                where: {
                    slug: subcategorySlug,
                    equipmentType: {
                        slug: equipmentSlug,
                        brand: { slug: brandSlug }
                    },
                    isActive: true
                },
                include: {
                    translations: { where: { locale: { in: [locale, DEFAULT_LOCALE] } } },
                    equipmentType: true,
                    series: {
                        where: { isActive: true },
                        orderBy: { order: 'asc' },
                    }
                }
            });

            if (!sub) return null;

            // Fetch related entities and translations in parallel
            const [brand, etTrans, brandTrans, seriesTrans] = await Promise.all([
                prisma.brand.findUnique({ where: { id: sub.equipmentType.brandId } }),
                prisma.equipmentTypeTranslation.findMany({
                    where: { equipmentTypeId: sub.equipmentTypeId, locale: { in: [locale, DEFAULT_LOCALE] } }
                }),
                prisma.brandTranslation.findMany({
                    where: { brandId: sub.equipmentType.brandId, locale: { in: [locale, DEFAULT_LOCALE] } }
                }),
                prisma.seriesTranslation.findMany({
                    where: {
                        series: { subcategoryId: sub.id },
                        locale: { in: [locale, DEFAULT_LOCALE] }
                    }
                })
            ]);

            const findTrans = (arr: any[]) =>
                arr.find((t) => t.locale === locale) || arr.find((t) => t.locale === DEFAULT_LOCALE);

            const subT = findTrans(sub.translations);
            const et = sub.equipmentType;
            const etT = findTrans(etTrans);
            const brandT = findTrans(brandTrans);

            // Localize series and get product counts
            const localizedSeries = await Promise.all(sub.series.map(async (ser) => {
                const serTranslations = seriesTrans.filter(t => t.seriesId === ser.id);
                const serT = findTrans(serTranslations);
                const prodCount = await prisma.product.count({ where: { seriesId: ser.id, isActive: true } });
                return {
                    id: ser.id,
                    slug: ser.slug,
                    name: serT?.name || ser.name,
                    description: serT?.description || ser.description,
                    imageUrl: ser.imageUrl,
                    imageAlt: serT?.imageAlt || ser.imageAlt,
                    productCount: prodCount
                } as LocalizedSeries;
            }));

            // Products - Keep this separate but avoid the deep brand join here too if possible
            const products = await prisma.product.findMany({
                where: { subcategoryId: sub.id, isActive: true },
                orderBy: { order: 'asc' },
                include: {
                    translations: { where: { locale: { in: [locale, DEFAULT_LOCALE] } } },
                    brand: true // Brand is needed for the logo/name in product cards
                },
                take: 50
            });

            const localizedProducts = products.map(p => {
                const t = findTrans(p.translations);
                return {
                    id: p.id,
                    slug: p.slug,
                    name: t?.name || p.name,
                    shortDescription: t?.shortDescription || p.shortDescription,
                    heroImageUrl: p.heroImageUrl,
                    heroImageAlt: p.heroImageAlt || t?.name || p.name,
                    gamme: p.gamme,
                    brand: p.brand
                };
            });

            return {
                id: sub.id,
                slug: sub.slug,
                name: subT?.name || sub.name,
                description: subT?.description || sub.description,
                heroImageUrl: sub.heroImageUrl,
                heroImageAlt: subT?.heroImageAlt || sub.heroImageAlt,
                series: localizedSeries,
                products: localizedProducts,
                equipmentType: {
                    name: etT?.name || et.name,
                    slug: et.slug,
                    brand: {
                        name: brandT?.name || brand?.name || '',
                        slug: brand?.slug || '',
                        logoUrl: brand?.logoUrl
                    }
                }
            };
        },
        ['localized-subcategory', brandSlug, equipmentSlug, subcategorySlug, locale],
        { tags: ['brands', 'subcategories', 'products'] }
    )();
}

export async function getLocalizedSeries(
    brandSlug: string,
    equipmentSlug: string,
    subcategorySlug: string,
    seriesSlug: string,
    locale: string = DEFAULT_LOCALE
): Promise<LocalizedSeries & { subcategory: any, products: any[] } | null> {
    return unstable_cache(
        async () => {
            const series = await prisma.series.findFirst({
                where: {
                    slug: seriesSlug,
                    subcategory: {
                        slug: subcategorySlug,
                        equipmentType: {
                            slug: equipmentSlug,
                            brand: { slug: brandSlug }
                        }
                    },
                    isActive: true
                },
                include: {
                    translations: { where: { locale: { in: [locale, DEFAULT_LOCALE] } } },
                    subcategory: {
                        include: {
                            translations: { where: { locale: { in: [locale, DEFAULT_LOCALE] } } },
                            equipmentType: true
                        }
                    },
                    products: {
                        where: { isActive: true },
                        orderBy: { order: 'asc' },
                        include: {
                            translations: { where: { locale: { in: [locale, DEFAULT_LOCALE] } } },
                            brand: true,
                        }
                    }
                }
            });

            if (!series || !series.subcategory) return null;

            const sub = series.subcategory;
            const et = sub.equipmentType;

            // Fetch Brand and all missing translations in parallel
            const [brand, brandTrans, etTrans] = await Promise.all([
                prisma.brand.findUnique({ where: { id: et.brandId } }),
                prisma.brandTranslation.findMany({
                    where: { brandId: et.brandId, locale: { in: [locale, DEFAULT_LOCALE] } }
                }),
                prisma.equipmentTypeTranslation.findMany({
                    where: { equipmentTypeId: et.id, locale: { in: [locale, DEFAULT_LOCALE] } }
                })
            ]);

            const findTrans = (arr: any[]) =>
                arr.find((t) => t.locale === locale) || arr.find((t) => t.locale === DEFAULT_LOCALE);

            const serT = findTrans(series.translations);
            const subT = findTrans(sub.translations);
            const etT = findTrans(etTrans);
            const brandT = findTrans(brandTrans);

            const localizedProducts = series.products.map(p => {
                const t = findTrans(p.translations);
                return {
                    id: p.id,
                    slug: p.slug,
                    name: t?.name || p.name,
                    shortDescription: t?.shortDescription || p.shortDescription,
                    heroImageUrl: p.heroImageUrl,
                    heroImageAlt: p.heroImageAlt || t?.name || p.name,
                    gamme: p.gamme,
                    specialty: p.specialty,
                    brand: p.brand
                };
            });

            return {
                id: series.id,
                slug: series.slug,
                name: serT?.name || series.name,
                description: serT?.description || series.description,
                imageUrl: series.imageUrl,
                imageAlt: serT?.imageAlt || series.imageAlt,
                productCount: series.products.length,
                subcategory: {
                    name: subT?.name || sub.name,
                    slug: sub.slug,
                    equipmentType: {
                        name: etT?.name || et.name,
                        slug: et.slug,
                        brand: {
                            name: brandT?.name || brand?.name || '',
                            slug: brand?.slug || ''
                        }
                    }
                },
                products: localizedProducts
            };
        },
        ['localized-series', brandSlug, equipmentSlug, subcategorySlug, seriesSlug, locale],
        { tags: ['brands', 'series', 'products'] }
    )();
}

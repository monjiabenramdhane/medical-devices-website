
import { prisma } from '@/lib/prisma';
import { DEFAULT_LOCALE } from './types';

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
    // Brand translations existed, so we can check if standard client works for base fields
    // But to be safe and consistent with heroImageUrl (if we wanted it in list), let's use standard logic if we don't need new fields.
    // The user didn't ask for hero in the list page, just "hero of each page" (detail pages).
    // The list page uses logo.

    // Safe to use standard Prisma for list view as it uses existing fields mostly
    const brands = await prisma.brand.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
        include: {
            translations: true,
            equipmentTypes: {
                where: { isActive: true },
                select: { id: true }
            }
        }
    });

    return brands.map(b => {
        const t = b.translations.find(tr => tr.locale === locale);
        return {
            id: b.id,
            slug: b.slug,
            name: t?.name || b.name,
            description: t?.description || b.description,
            logoUrl: b.logoUrl,
            logoAlt: b.logoAlt,
            websiteUrl: b.websiteUrl,
            heroImageUrl: null, // List view doesn't need it
            heroImageAlt: null,
            metaTitle: t?.metaTitle || b.metaTitle,
            metaDescription: t?.metaDescription || b.metaDescription,
            equipmentTypes: b.equipmentTypes.map(et => ({ ...et } as any))
        };
    });
}

export async function getLocalizedBrand(slug: string, locale: string = DEFAULT_LOCALE): Promise<LocalizedBrand | null> {
    const brand = await prisma.brand.findUnique({
        where: { slug },
        include: {
            translations: {
                where: { locale }
            },
            equipmentTypes: {
                where: { isActive: true },
                orderBy: { order: 'asc' },
                include: {
                    translations: {
                        where: { locale }
                    }
                }
            }
        }
    });

    if (!brand) return null;

    const t = brand.translations[0];

    // Map equipment types and fetch subcategory counts
    const localizedETs = await Promise.all(brand.equipmentTypes.map(async (et) => {
        const etT = et.translations[0];
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
            subcategories: Array(subCount).fill({}), // placeholder as expected by existing UI
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
}

export async function getLocalizedEquipmentType(
    brandSlug: string,
    equipmentSlug: string,
    locale: string = DEFAULT_LOCALE
): Promise<LocalizedEquipmentType | null> {
    const et = await prisma.equipmentType.findFirst({
        where: {
            slug: equipmentSlug,
            brand: { slug: brandSlug },
            isActive: true
        },
        include: {
            brand: {
                include: {
                    translations: {
                        where: { locale }
                    }
                }
            },
            translations: {
                where: { locale }
            },
            subcategories: {
                where: { isActive: true },
                orderBy: { order: 'asc' },
                include: {
                    translations: {
                        where: { locale }
                    }
                }
            }
        }
    });

    if (!et) return null;

    const brandT = et.brand.translations[0];
    const etT = et.translations[0];

    const localizedSubcategories = await Promise.all(et.subcategories.map(async (sub) => {
        const subT = sub.translations[0];
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
            series: [], // empty as per previous logic
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
}

export async function getLocalizedSubcategory(
    brandSlug: string,
    equipmentSlug: string,
    subcategorySlug: string,
    locale: string = DEFAULT_LOCALE
): Promise<LocalizedSubcategory | null> {
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
            translations: { where: { locale } },
            equipmentType: {
                include: {
                    brand: { include: { translations: { where: { locale } } } },
                    translations: { where: { locale } }
                }
            },
            series: {
                where: { isActive: true },
                orderBy: { order: 'asc' },
                include: { translations: { where: { locale } } }
            }
        }
    });

    if (!sub) return null;

    const subT = sub.translations[0];
    const et = sub.equipmentType;
    const etT = et.translations[0];
    const brand = et.brand;
    const brandT = brand.translations[0];

    // Localize series and get product counts
    const localizedSeries = await Promise.all(sub.series.map(async (ser) => {
        const serT = ser.translations[0];
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

    // Products
    const products = await prisma.product.findMany({
        where: { subcategoryId: sub.id, isActive: true },
        orderBy: { order: 'asc' },
        include: {
            translations: { where: { locale } },
            brand: true
        },
        take: 50
    });

    const localizedProducts = products.map(p => {
        const t = p.translations[0];
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
                name: brandT?.name || brand.name,
                slug: brand.slug,
                logoUrl: brand.logoUrl
            }
        }
    };
}

export async function getLocalizedSeries(
    brandSlug: string,
    equipmentSlug: string,
    subcategorySlug: string,
    seriesSlug: string,
    locale: string = DEFAULT_LOCALE
): Promise<LocalizedSeries & { subcategory: any, products: any[] } | null> {
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
            translations: { where: { locale } },
            subcategory: {
                include: {
                    translations: { where: { locale } },
                    equipmentType: {
                        include: {
                            brand: { include: { translations: { where: { locale } } } }
                        }
                    }
                }
            },
            products: {
                where: { isActive: true },
                orderBy: { order: 'asc' },
                include: {
                    translations: { where: { locale } },
                    brand: true,
                    gallery: { orderBy: { order: 'asc' }, take: 1 } // for thumbnail
                }
            }
        }
    });

    if (!series || !series.subcategory) return null;

    const serT = series.translations[0];
    const sub = series.subcategory;
    const subT = sub.translations[0];
    const et = sub.equipmentType;
    const brand = et.brand;
    const brandT = brand.translations[0];

    const localizedProducts = series.products.map(p => {
        const t = p.translations[0];
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
                name: et.name, // Not fully localized here, can if needed
                slug: et.slug,
                brand: {
                    name: brandT?.name || brand.name,
                    slug: brand.slug
                }
            }
        },
        products: localizedProducts
    };
}

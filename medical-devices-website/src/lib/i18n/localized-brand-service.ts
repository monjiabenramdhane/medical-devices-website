
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
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

// Helpers to map raw results to localized fields
function mapLoc(item: any, trans: any[], locale: string, ...fields: string[]) {
    // item is the base record
    // trans is an array of translation records for this item
    const t = trans.find((tr: any) => tr.locale === locale);
    fields.forEach(f => {
        // If translation has value, use it; else fallback to item (if it has it, which it might not for pure translation tables) or null
        // Actually, based on schema, Brand has 'name' on base and on translation.
        // EquipmentType has 'name' on base. Translation has 'name'.
        if (t && t[f]) {
            item[f] = t[f];
        }
    });
    return item;
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
    // Brand detail needs heroImageUrl (NEW field). Use raw query.
    // Also need EquipmentTypes with their translations (NEW table).

    const brands = await prisma.$queryRaw<any[]>`
    SELECT "logoUrl", "logoAlt", "websiteUrl", "heroImageUrl", "heroImageAlt", "metaTitle", "metaDescription", id, slug, name, description
    FROM brands
    WHERE slug = ${slug}
  `;
    const brand = brands[0];
    if (!brand) return null;

    const brandTrans = await prisma.$queryRaw<any[]>`
    SELECT id, "brandId", locale, name, description, "metaTitle", "metaDescription" FROM brand_translations WHERE "brandId" = ${brand.id} AND locale = ${locale}
  `;
    mapLoc(brand, brandTrans, locale, 'name', 'description', 'metaTitle', 'metaDescription');

    // Fetch equip types
    const equipTypes = await prisma.$queryRaw<any[]>`
    SELECT "iconUrl", "heroImageUrl", "heroImageAlt", id, slug, name, description
    FROM equipment_types
    WHERE "brandId" = ${brand.id} AND "isActive" = true
    ORDER BY "order" ASC
  `;

    // Fetch equip translations
    const etIds = equipTypes.map(e => e.id);
    let etTrans: any[] = [];
    if (etIds.length > 0) {
        etTrans = await prisma.$queryRaw<any[]>`
        SELECT id, "equipmentTypeId", locale, name, description FROM equipment_type_translations WHERE "equipmentTypeId" IN (${Prisma.join(etIds)}) AND locale = ${locale}
      `;
    }

    // Note: We need subcategories count for the list
    // Doing a loop for count is easy enough
    for (const et of equipTypes) {
        const subCount = await prisma.subcategory.count({ where: { equipmentTypeId: et.id, isActive: true } });
        const t = etTrans.find(tr => tr.equipmentTypeId === et.id);

        et.name = t?.name || et.name;
        et.description = t?.description || et.description;
        et.subcategories = Array(subCount).fill({}); // placeholder
    }

    brand.equipmentTypes = equipTypes;
    return brand;
}

export async function getLocalizedEquipmentType(
    brandSlug: string,
    equipmentSlug: string,
    locale: string = DEFAULT_LOCALE
): Promise<LocalizedEquipmentType | null> {
    // Check Brand
    const brands = await prisma.$queryRaw<any[]>`SELECT id, name, slug, "logoUrl", "logoAlt" FROM brands WHERE slug = ${brandSlug}`;
    if (!brands.length) return null;
    const brand = brands[0];
    // Brand trans
    const bTrans = await prisma.$queryRaw<any[]>`SELECT id, "brandId", locale, name, description, "metaTitle", "metaDescription" FROM brand_translations WHERE "brandId" = ${brand.id} AND locale = ${locale}`;
    mapLoc(brand, bTrans, locale, 'name');

    // Get ET
    const ets = await prisma.$queryRaw<any[]>`
        SELECT "iconUrl", "heroImageUrl", "heroImageAlt", id, slug, name, description
        FROM equipment_types
        WHERE slug = ${equipmentSlug} AND "brandId" = ${brand.id} AND "isActive" = true
    `;
    if (!ets.length) return null;
    const et = ets[0];

    // ET Trans
    const etTrans = await prisma.$queryRaw<any[]>`SELECT id, "equipmentTypeId", locale, name, description FROM equipment_type_translations WHERE "equipmentTypeId" = ${et.id} AND locale = ${locale}`;
    mapLoc(et, etTrans, locale, 'name', 'description');

    // Get Subcategories
    const subs = await prisma.$queryRaw<any[]>`
        SELECT "heroImageUrl", "heroImageAlt", id, slug, name, description
        FROM subcategories
        WHERE "equipmentTypeId" = ${et.id} AND "isActive" = true
        ORDER BY "order" ASC
    `;

    // Sub Trans
    const subIds = subs.map(s => s.id);
    let subTrans: any[] = [];
    if (subIds.length > 0) {
        subTrans = await prisma.$queryRaw<any[]>`
            SELECT id, "subcategoryId", locale, name, description, "heroImageAlt" FROM subcategory_translations WHERE "subcategoryId" IN (${Prisma.join(subIds)}) AND locale = ${locale}
        `;
    }

    for (const sub of subs) {
        const t = subTrans.find(tr => tr.subcategoryId === sub.id);
        sub.name = t?.name || sub.name;
        sub.description = t?.description || sub.description;

        // Counts
        const prodCount = await prisma.product.count({ where: { subcategoryId: sub.id, isActive: true } });
        const seriesCount = await prisma.series.count({ where: { subcategoryId: sub.id, isActive: true } });

        sub.productCount = prodCount;
        sub.seriesCount = seriesCount;
        sub.series = []; // empty
    }

    et.subcategories = subs;
    et.brand = brand;
    return et;
}

export async function getLocalizedSubcategory(
    brandSlug: string,
    equipmentSlug: string,
    subcategorySlug: string,
    locale: string = DEFAULT_LOCALE
): Promise<LocalizedSubcategory | null> {
    // Check Brand & ET
    const ets = await prisma.$queryRaw<any[]>`
        SELECT et.id, et.name, et.slug, b.name as b_name, b.slug as b_slug
        FROM equipment_types et
        JOIN brands b ON et."brandId" = b.id
        WHERE et.slug = ${equipmentSlug} AND b.slug = ${brandSlug}
    `;
    if (!ets.length) return null;
    const etInfo = ets[0];

    // Localize Parent info (Optional but nice for breadcrumbs if we return it)
    // For now we just return basic checks, real localization happens if requested. 
    // The previous implementation used includes.
    // Let's do a quick translation fetch for parents to ensure breadcrumbs are right.
    // ... skipping for brevity, trusting logic to fetch it if really needed or just relying on base for now as fallback.
    // Actually, breadcrumbs need localized names.
    const etTrans = await prisma.$queryRaw<any[]>`SELECT id, "equipmentTypeId", locale, name, description FROM equipment_type_translations WHERE "equipmentTypeId" = ${etInfo.id} AND locale = ${locale}`;
    const bTrans = await prisma.$queryRaw<any[]>`SELECT id, "brandId", locale, name, description, "metaTitle", "metaDescription" FROM brand_translations WHERE "brandId" = (SELECT "brandId" FROM equipment_types WHERE id = ${etInfo.id}) AND locale = ${locale}`;

    // Construct parent obj
    const parentObj = {
        name: etTrans[0]?.name || etInfo.name,
        slug: etInfo.slug,
        brand: {
            name: bTrans[0]?.name || etInfo.b_name,
            slug: etInfo.b_slug
        }
    };

    // Get Sub
    const subs = await prisma.$queryRaw<any[]>`
        SELECT "heroImageUrl", "heroImageAlt", id, slug, name, description
        FROM subcategories
        WHERE slug = ${subcategorySlug} AND "equipmentTypeId" = ${etInfo.id} AND "isActive" = true
    `;
    if (!subs.length) return null;
    const sub = subs[0];

    const subTrans = await prisma.$queryRaw<any[]>`SELECT id, "subcategoryId", locale, name, description, "heroImageAlt" FROM subcategory_translations WHERE "subcategoryId" = ${sub.id} AND locale = ${locale}`;
    mapLoc(sub, subTrans, locale, 'name', 'description');

    // Series
    const series = await prisma.$queryRaw<any[]>`
        SELECT "imageUrl", "imageAlt", id, slug, name, description
        FROM series
        WHERE "subcategoryId" = ${sub.id} AND "isActive" = true
        ORDER BY "order" ASC
    `;
    // Series Trans
    const serIds = series.map(s => s.id);
    let serTrans: any[] = [];
    if (serIds.length > 0) {
        serTrans = await prisma.$queryRaw<any[]>`SELECT id, "seriesId", locale, name, description FROM series_translations WHERE "seriesId" IN (${Prisma.join(serIds)}) AND locale = ${locale}`;
    }

    for (const ser of series) {
        const t = serTrans.find(tr => tr.seriesId === ser.id);
        ser.name = t?.name || ser.name;
        ser.description = t?.description || ser.description;
        ser.productCount = await prisma.product.count({ where: { seriesId: ser.id, isActive: true } });
    }

    // Products
    // Using standard prisma for products is fine as we only need standard fields and ProductTranslations (which work)
    const products = await prisma.product.findMany({
        where: { subcategoryId: sub.id, isActive: true },
        orderBy: { order: 'asc' },
        include: {
            translations: { where: { locale } },
            brand: true
        },
        take: 50
    });

    // Map products to localized structure
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

    sub.series = series;
    sub.products = localizedProducts;
    sub.equipmentType = parentObj;

    return sub;
}

export async function getLocalizedSeries(
    brandSlug: string,
    equipmentSlug: string,
    subcategorySlug: string,
    seriesSlug: string,
    locale: string = DEFAULT_LOCALE
): Promise<LocalizedSeries & { subcategory: any, products: any[] } | null> {
    // Basic verification of hierarchy
    const rows = await prisma.$queryRaw<any[]>`
        SELECT s."imageUrl", s."imageAlt", s.id, s.name, s.slug, s.description,
               sub.id as sub_id, sub.name as sub_name, sub.slug as sub_slug,
               et.name as et_name, et.slug as et_slug,
               b.name as b_name, b.slug as b_slug
        FROM series s
        JOIN subcategories sub ON s."subcategoryId" = sub.id
        JOIN equipment_types et ON sub."equipmentTypeId" = et.id
        JOIN brands b ON et."brandId" = b.id
        WHERE s.slug = ${seriesSlug}
          AND sub.slug = ${subcategorySlug}
          AND et.slug = ${equipmentSlug}
          AND b.slug = ${brandSlug}
          AND s."isActive" = true
    `;

    if (!rows.length) return null;
    const row = rows[0];

    // Localize Series
    const serTrans = await prisma.$queryRaw<any[]>`SELECT id, "seriesId", locale, name, description FROM series_translations WHERE "seriesId" = ${row.id} AND locale = ${locale}`;
    mapLoc(row, serTrans, locale, 'name', 'description');

    // Localize Subcategory Parent info (for breadcrumbs)
    const subTrans = await prisma.$queryRaw<any[]>`SELECT id, "subcategoryId", locale, name, description, "heroImageAlt" FROM subcategory_translations WHERE "subcategoryId" = ${row.sub_id} AND locale = ${locale}`;
    const subName = subTrans[0]?.name || row.sub_name;

    // Fetch Products in Series
    const products = await prisma.product.findMany({
        where: { seriesId: row.id, isActive: true },
        orderBy: { order: 'asc' },
        include: {
            translations: { where: { locale } },
            brand: true,
            gallery: { orderBy: { order: 'asc' }, take: 1 } // for thumbnail
        }
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
            specialty: p.specialty,
            brand: p.brand
        };
    });

    return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        description: row.description,
        imageUrl: row.imageUrl,
        imageAlt: row.imageAlt,
        productCount: products.length,
        subcategory: {
            name: subName,
            slug: row.sub_slug,
            equipmentType: {
                name: row.et_name, // Not fully localized here, can if needed
                slug: row.et_slug,
                brand: {
                    name: row.b_name,
                    slug: row.b_slug
                }
            }
        },
        products: localizedProducts
    };
}

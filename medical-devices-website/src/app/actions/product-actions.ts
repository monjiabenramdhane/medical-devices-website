'use server';

import { getLocalizedProducts } from '@/lib/i18n/localized-product-service';
import { Locale } from '@/lib/i18n/types';
import { Gamme, Specialty } from '@prisma/client';

export interface ProductFilterParams {
    brand?: string;
    gamme?: string;
    specialty?: string;
    search?: string;
}

export async function fetchFilteredProducts(locale: Locale, params: ProductFilterParams) {
    try {
        const products = await getLocalizedProducts(locale, {
            brandSlug: params.brand,
            gamme: params.gamme ? (params.gamme.toUpperCase() as Gamme) : undefined,
            specialty: params.specialty ? (params.specialty.toUpperCase() as Specialty) : undefined,
            search: params.search,
            limit: 50,
        });

        return products;
    } catch (error) {
        console.error('Error fetching filtered products:', error);
        return [];
    }
}

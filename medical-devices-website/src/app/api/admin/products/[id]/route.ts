import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { translateService } from '@/lib/translation/libretranslate';
import { DEFAULT_LOCALE } from '@/lib/i18n/types';
import type { ApiResponse } from '@/types';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const product = await prisma.product.findUnique({
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
                translations: true,
            },
        });

        if (!product) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json<ApiResponse>({
            success: true,
            data: product,
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Failed to fetch product' },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await requireAdmin();

        const body = await req.json();
        const { gallery, ...productData } = body;

        // Process translations and auto-fill missing locales
        const { localizedData } = await translateService.processProductContent(productData);

        // Prepare the main product data using the default locale (English)
        const mainDetails = localizedData[DEFAULT_LOCALE] || localizedData[Object.keys(localizedData)[0]] || productData;

        // Prepare translation entries
        const translationsData = Object.entries(localizedData).map(([locale, content]) => ({
            productId: id,
            locale,
            name: content.name || '',
            shortDescription: content.shortDescription,
            fullDescription: content.fullDescription,
            metaTitle: content.metaTitle,
            metaDescription: content.metaDescription,
            heroImageAlt: content.heroImageAlt ?? null,
            metaKeywords: content.metaKeywords ?? null,
        }));

        // Validating data before update?
        // Basic update of main fields
        const product = await prisma.product.update({
            where: { id },
            data: {
                ...productData,
                // Overwrite text fields with the default locale version
                name: mainDetails.name,
                shortDescription: mainDetails.shortDescription,
                fullDescription: mainDetails.fullDescription,
                metaTitle: mainDetails.metaTitle,
                metaDescription: mainDetails.metaDescription,
                heroImageAlt: mainDetails.heroImageAlt,
                metaKeywords: mainDetails.metaKeywords,

                // Handle optional relationships
                equipmentTypeId: productData.equipmentTypeId || null,
                subcategoryId: productData.subcategoryId || null,
                seriesId: productData.seriesId || null,
            },
        });

        // Update Translations: Delete existing and create new ones to ensure consistency
        // This handles both adding new supported locales and updating content
        await prisma.productTranslation.deleteMany({
            where: { productId: id },
        });

        await prisma.productTranslation.createMany({
            data: translationsData,
        });

        // Update gallery if provided
        if (gallery && Array.isArray(gallery)) {
            // Delete existing gallery images
            await prisma.productImage.deleteMany({
                where: { productId: id },
            });

            // Create new gallery images
            if (gallery.length > 0) {
                await prisma.productImage.createMany({
                    data: gallery.map((img: any, index: number) => ({
                        productId: id,
                        url: img.url,
                        alt: img.alt || '',
                        order: index,
                    })),
                });
            }
        }

        // Fetch complete product with gallery and translations
        const completeProduct = await prisma.product.findUnique({
            where: { id },
            include: {
                brand: true,
                equipmentType: true,
                subcategory: true,
                series: true,
                gallery: {
                    orderBy: { order: 'asc' },
                },
                translations: true,
            },
        });

        // Revalidate cache
        revalidateTag('product');
        revalidateTag('products');
        revalidateTag('brands');

        return NextResponse.json<ApiResponse>({
            success: true,
            data: completeProduct,
            message: 'Product updated successfully',
        });
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Failed to update product' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await requireAdmin();

        // Prisma will cascade delete related gallery images, sections, and specifications
        // translations are also cascade deleted as per schema
        await prisma.product.delete({
            where: { id },
        });

        // Revalidate cache
        revalidateTag('product');
        revalidateTag('products');
        revalidateTag('brands');

        return NextResponse.json<ApiResponse>({
            success: true,
            message: 'Product deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Failed to delete product' },
            { status: 500 }
        );
    }
}

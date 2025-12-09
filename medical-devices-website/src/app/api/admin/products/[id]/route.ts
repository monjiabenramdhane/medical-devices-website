import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
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

        // Update product
        const product = await prisma.product.update({
            where: { id },
            data: {
                ...productData,
                // Handle optional relationships
                equipmentTypeId: productData.equipmentTypeId || null,
                subcategoryId: productData.subcategoryId || null,
                seriesId: productData.seriesId || null,
            },
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

        // Fetch complete product with gallery
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
            },
        });

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
        await prisma.product.delete({
            where: { id },
        });

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

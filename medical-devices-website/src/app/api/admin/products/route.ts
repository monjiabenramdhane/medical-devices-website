import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { translateService } from '@/lib/translation/libretranslate';
import { DEFAULT_LOCALE } from '@/lib/i18n/types';
import type { ApiResponse } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get('brandId');
    const equipmentTypeId = searchParams.get('equipmentTypeId');
    const subcategoryId = searchParams.get('subcategoryId');
    const seriesId = searchParams.get('seriesId');

    const where: any = {};
    if (brandId) where.brandId = brandId;
    if (equipmentTypeId) where.equipmentTypeId = equipmentTypeId;
    if (subcategoryId) where.subcategoryId = subcategoryId;
    if (seriesId) where.seriesId = seriesId;

    const products = await prisma.product.findMany({
      where,
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
      orderBy: { order: 'asc' },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const { gallery, ...productData } = body;

    // Process translations and auto-fill missing locales
    const { localizedData } = await translateService.processProductContent(productData);

    // Prepare the main product data using the default locale (English)
    const mainDetails = localizedData[DEFAULT_LOCALE] || localizedData[Object.keys(localizedData)[0]] || productData;

    // Prepare translation entries
    const translationsData = Object.entries(localizedData).map(([locale, content]) => ({
      locale,
      name: content.name || '',
      shortDescription: content.shortDescription,
      fullDescription: content.fullDescription,
      metaTitle: content.metaTitle,
      metaDescription: content.metaDescription,
    }));

    // Create product
    const product = await prisma.product.create({
      data: {
        ...productData,
        // Overwrite text fields with the default locale version
        name: mainDetails.name,
        shortDescription: mainDetails.shortDescription,
        fullDescription: mainDetails.fullDescription,
        metaTitle: mainDetails.metaTitle,
        metaDescription: mainDetails.metaDescription,

        order: productData.order ?? 0,
        isFeatured: productData.isFeatured ?? false,
        isActive: productData.isActive ?? true,

        equipmentTypeId: productData.equipmentTypeId || null,
        subcategoryId: productData.subcategoryId || null,
        seriesId: productData.seriesId || null,

        translations: {
          create: translationsData,
        },
      },
    });

    // Create gallery images if provided
    if (gallery && Array.isArray(gallery) && gallery.length > 0) {
      await prisma.productImage.createMany({
        data: gallery.map((img: any, index: number) => ({
          productId: product.id,
          url: img.url,
          alt: img.alt || '',
          order: index,
        })),
      });
    }

    // Fetch complete product with gallery
    const completeProduct = await prisma.product.findUnique({
      where: { id: product.id },
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
    revalidateTag('products');
    revalidateTag('brands');

    return NextResponse.json<ApiResponse>(
      { success: true, data: completeProduct, message: 'Product created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
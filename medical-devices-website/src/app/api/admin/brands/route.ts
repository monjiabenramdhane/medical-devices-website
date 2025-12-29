import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@/types';
import { translateService } from '@/lib/translation/libretranslate';
import { DEFAULT_LOCALE } from '@/lib/i18n/types';

export async function GET(req: NextRequest) {
  try {
    const brands = await prisma.brand.findMany({
      include: {
        equipmentTypes: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: brands,
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch brands' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();

    // Process translations and auto-fill missing locales
    const { localizedData } = await translateService.processBrandContent(body);

    // Prepare the main brand data using the default locale (English)
    const mainDetails = localizedData[DEFAULT_LOCALE] || localizedData[Object.keys(localizedData)[0]] || body;

    const brand = await prisma.brand.create({
      data: {
        name: mainDetails.name || body.name,
        slug: body.slug,
        description: mainDetails.description || body.description,
        logoUrl: body.logoUrl,
        logoAlt: body.logoAlt,
        websiteUrl: body.websiteUrl,
        heroImageUrl: body.heroImageUrl,
        heroImageAlt: body.heroImageAlt,
        metaTitle: mainDetails.metaTitle || body.metaTitle,
        metaDescription: mainDetails.metaDescription || body.metaDescription,
        order: body.order ?? 0,
        isActive: body.isActive ?? true,
        translations: {
          create: Object.entries(localizedData).map(([locale, content]) => ({
            locale,
            name: content.name || body.name,
            description: content.description,
            metaTitle: content.metaTitle,
            metaDescription: content.metaDescription,
          })),
        },
      },
    });

    // Revalidate cache
    revalidateTag('brands');

    return NextResponse.json<ApiResponse>(
      { success: true, data: brand, message: 'Brand created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating brand:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to create brand' },
      { status: 500 }
    );
  }
}
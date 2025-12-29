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
    const subcategoryId = searchParams.get('subcategoryId');

    const where = subcategoryId ? { subcategoryId } : {};

    const series = await prisma.series.findMany({
      where,
      include: {
        subcategory: {
          include: {
            equipmentType: {
              include: {
                brand: true,
              },
            },
          },
        },
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: series,
    });
  } catch (error) {
    console.error('Error fetching series:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch series' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();

    // Process translations and auto-fill missing locales
    const { localizedData } = await translateService.processSeriesContent(body);

    // Prepare the main data using the default locale (English)
    const mainDetails = localizedData[DEFAULT_LOCALE] || localizedData[Object.keys(localizedData)[0]] || body;

    const series = await prisma.series.create({
      data: {
        name: mainDetails.name || body.name,
        slug: body.slug,
        description: mainDetails.description || body.description,
        imageUrl: body.imageUrl,
        imageAlt: mainDetails.imageAlt || body.imageAlt,
        order: body.order ?? 0,
        isActive: body.isActive ?? true,
        subcategoryId: body.subcategoryId || null,
        translations: {
          create: Object.entries(localizedData).map(([locale, content]) => ({
            locale,
            name: content.name || body.name,
            description: content.description,
            imageAlt: content.imageAlt,
          })),
        },
      },
      include: {
        subcategory: {
          include: {
            equipmentType: {
              include: {
                brand: true,
              },
            },
          },
        },
      },
    });

    // Revalidate cache
    revalidateTag('series');
    revalidateTag('subcategories');
    revalidateTag('equipment-types');
    revalidateTag('brands');

    return NextResponse.json<ApiResponse>(
      { success: true, data: series, message: 'Series created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating series:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to create series' },
      { status: 500 }
    );
  }
}
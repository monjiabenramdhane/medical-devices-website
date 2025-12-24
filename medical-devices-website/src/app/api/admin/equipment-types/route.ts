import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@/types';
import { translateService } from '@/lib/translation/libretranslate';
import { DEFAULT_LOCALE } from '@/lib/i18n/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get('brandId');

    const where = brandId ? { brandId } : {};

    const equipmentTypes = await prisma.equipmentType.findMany({
      where,
      include: {
        brand: true,
        subcategories: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: equipmentTypes,
    });
  } catch (error) {
    console.error('Error fetching equipment types:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch equipment types' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();

    // Process translations and auto-fill missing locales
    const { localizedData } = await translateService.processEquipmentTypeContent(body);

    // Prepare the main data using the default locale (English)
    const mainDetails = localizedData[DEFAULT_LOCALE] || localizedData[Object.keys(localizedData)[0]] || body;

    const equipmentType = await prisma.equipmentType.create({
      data: {
        name: mainDetails.name || body.name,
        slug: body.slug,
        description: mainDetails.description || body.description,
        iconUrl: body.iconUrl,
        heroImageUrl: body.heroImageUrl,
        heroImageAlt: body.heroImageAlt,
        order: body.order ?? 0,
        isActive: body.isActive ?? true,
        brandId: body.brandId,
        translations: {
          create: Object.entries(localizedData).map(([locale, content]) => ({
            locale,
            name: content.name || body.name,
            description: content.description,
          })),
        },
      },
      include: {
        brand: true,
      },
    });

    return NextResponse.json<ApiResponse>(
      { success: true, data: equipmentType, message: 'Equipment type created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating equipment type:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to create equipment type' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@/types';
import { translateService } from '@/lib/translation/libretranslate';
import { DEFAULT_LOCALE } from '@/lib/i18n/types';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const series = await prisma.series.findUnique({
      where: { id },
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

    if (!series) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Series not found' },
        { status: 404 }
      );
    }

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


export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    const body = await req.json();

    // Process translations and auto-fill missing locales
    const { localizedData } = await translateService.processSeriesContent(body);

    // Prepare the main data using the default locale (English)
    const mainDetails = localizedData[DEFAULT_LOCALE] || localizedData[Object.keys(localizedData)[0]] || body;

    // Preparation for translation update
    const translationsData = Object.entries(localizedData).map(([locale, content]) => ({
      seriesId: id,
      locale,
      name: content.name || body.name,
      description: content.description,
      imageAlt: content.imageAlt,
    }));

    const series = await prisma.series.update({
      where: { id },
      data: {
        name: mainDetails.name || body.name,
        slug: body.slug,
        description: mainDetails.description || body.description,
        imageUrl: body.imageUrl,
        imageAlt: mainDetails.imageAlt || body.imageAlt,
        order: body.order,
        isActive: body.isActive,
        subcategoryId: body.subcategoryId || null,
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

    // Update translations: delete and recreate
    await prisma.seriesTranslation.deleteMany({
      where: { seriesId: id },
    });

    await prisma.seriesTranslation.createMany({
      data: translationsData,
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: series,
      message: 'Series updated successfully',
    });
  } catch (error) {
    console.error('Error updating series:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update series' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await context.params;

    await prisma.series.delete({
      where: { id },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Series deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting series:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to delete series' },
      { status: 500 }
    );
  }
}
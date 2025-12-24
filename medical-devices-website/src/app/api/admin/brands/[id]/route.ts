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
    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        equipmentTypes: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!brand) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Brand not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: brand,
    });
  } catch (error) {
    console.error('Error fetching brand:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch brand' },
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
    const { localizedData } = await translateService.processBrandContent(body);

    // Prepare the main brand data using the default locale (English)
    const mainDetails = localizedData[DEFAULT_LOCALE] || localizedData[Object.keys(localizedData)[0]] || body;

    // Preparation for translation update
    const translationsData = Object.entries(localizedData).map(([locale, content]) => ({
      brandId: id,
      locale,
      name: content.name || body.name,
      description: content.description,
      metaTitle: content.metaTitle,
      metaDescription: content.metaDescription,
    }));

    const brand = await prisma.brand.update({
      where: { id },
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
        order: body.order,
        isActive: body.isActive,
      },
    });

    // Update translations: delete and recreate
    await prisma.brandTranslation.deleteMany({
      where: { brandId: id },
    });

    await prisma.brandTranslation.createMany({
      data: translationsData,
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: brand,
      message: 'Brand updated successfully',
    });
  } catch (error) {
    console.error('Error updating brand:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update brand' },
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

    await prisma.brand.delete({
      where: { id },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Brand deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting brand:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to delete brand' },
      { status: 500 }
    );
  }
}
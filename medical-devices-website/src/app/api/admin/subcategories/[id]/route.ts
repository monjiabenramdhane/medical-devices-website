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
    const subcategory = await prisma.subcategory.findUnique({
      where: { id },
      include: {
        equipmentType: {
          include: {
            brand: true,
          },
        },
      },
    });

    if (!subcategory) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Subcategory not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: subcategory,
    });
  } catch (error) {
    console.error('Error fetching subcategory:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch subcategory' },
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
    const { localizedData } = await translateService.processSubcategoryContent(body);

    // Prepare the main data using the default locale (English)
    const mainDetails = localizedData[DEFAULT_LOCALE] || localizedData[Object.keys(localizedData)[0]] || body;

    // Preparation for translation update
    const translationsData = Object.entries(localizedData).map(([locale, content]) => ({
      subcategoryId: id,
      locale,
      name: content.name || body.name,
      description: content.description,
      heroImageAlt: content.heroImageAlt,
    }));

    const subcategory = await prisma.subcategory.update({
      where: { id },
      data: {
        name: mainDetails.name || body.name,
        slug: body.slug,
        description: mainDetails.description || body.description,
        heroImageUrl: body.heroImageUrl,
        heroImageAlt: mainDetails.heroImageAlt || body.heroImageAlt,
        order: body.order,
        isActive: body.isActive,
        equipmentTypeId: body.equipmentTypeId,
      },
      include: {
        equipmentType: {
          include: {
            brand: true,
          },
        },
      },
    });

    // Update translations: delete and recreate
    await prisma.subcategoryTranslation.deleteMany({
      where: { subcategoryId: id },
    });

    await prisma.subcategoryTranslation.createMany({
      data: translationsData,
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: subcategory,
      message: 'Subcategory updated successfully',
    });
  } catch (error) {
    console.error('Error updating subcategory:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update subcategory' },
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

    await prisma.subcategory.delete({
      where: { id },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Subcategory deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to delete subcategory' },
      { status: 500 }
    );
  }
}
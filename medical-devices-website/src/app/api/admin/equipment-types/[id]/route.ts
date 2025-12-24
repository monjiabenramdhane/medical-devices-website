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
    const equipmentType = await prisma.equipmentType.findUnique({
      where: { id },
      include: {
        brand: true,
        subcategories: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!equipmentType) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Equipment type not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: equipmentType,
    });
  } catch (error) {
    console.error('Error fetching equipment type:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch equipment type' },
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
    const { localizedData } = await translateService.processEquipmentTypeContent(body);

    // Prepare the main data using the default locale (English)
    const mainDetails = localizedData[DEFAULT_LOCALE] || localizedData[Object.keys(localizedData)[0]] || body;

    // Preparation for translation update
    const translationsData = Object.entries(localizedData).map(([locale, content]) => ({
      equipmentTypeId: id,
      locale,
      name: content.name || body.name,
      description: content.description,
    }));

    const equipmentType = await prisma.equipmentType.update({
      where: { id },
      data: {
        name: mainDetails.name || body.name,
        slug: body.slug,
        description: mainDetails.description || body.description,
        iconUrl: body.iconUrl,
        heroImageUrl: body.heroImageUrl,
        heroImageAlt: body.heroImageAlt,
        order: body.order,
        isActive: body.isActive,
        brandId: body.brandId,
      },
      include: {
        brand: true,
      },
    });

    // Update translations: delete and recreate
    await prisma.equipmentTypeTranslation.deleteMany({
      where: { equipmentTypeId: id },
    });

    await prisma.equipmentTypeTranslation.createMany({
      data: translationsData,
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: equipmentType,
      message: 'Equipment type updated successfully',
    });
  } catch (error) {
    console.error('Error updating equipment type:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update equipment type' },
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

    await prisma.equipmentType.delete({
      where: { id },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Equipment type deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting equipment type:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to delete equipment type' },
      { status: 500 }
    );
  }
}
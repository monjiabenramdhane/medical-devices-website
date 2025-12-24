
import { NextRequest, NextResponse } from 'next/server';
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
    const section = await prisma.homeSection.findUnique({
      where: { id },
      include: {
        products: true,
        brands: true,
      }
    });

    if (!section) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Home section not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: section,
    });
  } catch (error) {
    console.error('Error fetching home section:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch home section' },
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
    const { productIds, brandIds, ...data } = body;

    // Process translations and auto-fill missing locales
    const { localizedData } = await translateService.processHomeSectionContent(data);

    // Prepare the main data using the default locale (English)
    const mainDetails = localizedData[DEFAULT_LOCALE] || localizedData[Object.keys(localizedData)[0]] || data;

    // Get current section to check key
    const currentSection = await prisma.homeSection.findUnique({
      where: { id },
      select: { sectionKey: true }
    });

    const isFeaturedSection = currentSection?.sectionKey === 'featuredProducts';

    // Execute update
    const section = await prisma.homeSection.update({
      where: { id },
      data: {
        ...data,
        title: mainDetails.title,
        subtitle: mainDetails.subtitle,
        content: mainDetails.content || '',
        ctaText: mainDetails.ctaText,
        imageUrl: mainDetails.imageUrl,
        imageAlt: mainDetails.imageAlt,
        products: productIds ? {
          set: productIds.map((id: string) => ({ id })),
        } : undefined,
        brands: brandIds ? {
          set: brandIds.map((id: string) => ({ id })),
        } : undefined,
      },
      include: {
        products: true,
        brands: true,
      }
    });

    // Preparation for translation update
    const translationsData = Object.entries(localizedData).map(([locale, content]) => ({
      id: crypto.randomUUID(), // Keep manual ID generation
      homeSectionId: id,
      locale,
      title: content.title || data.title,
      subtitle: content.subtitle || data.subtitle,
      content: content.content || data.content || '',
      ctaText: content.ctaText || data.ctaText,
      imageUrl: content.imageUrl || data.imageUrl,
      imageAlt: content.imageAlt || data.imageAlt,
      updatedAt: new Date(), // Keep manual timestamp
    }));

    // Update translations: delete and recreate instead of complex upsert loop
    await prisma.home_section_translations.deleteMany({
      where: { homeSectionId: id },
    });

    await prisma.home_section_translations.createMany({
      data: translationsData,
    });

    // Sync isFeatured status if this is the "featuredProducts" section
    // AND we have a valid productIds list (meaning we are in 'link products' mode)
    if (isFeaturedSection && productIds) {
      // 1. Set isFeatured=true for all IDs in the list
      await prisma.product.updateMany({
        where: { id: { in: productIds } },
        data: { isFeatured: true, updatedAt: new Date() } // Manual updatedAt
      });

      // 2. Set isFeatured=false for all OTHER products (global sync)
      await prisma.product.updateMany({
        where: { id: { notIn: productIds }, isFeatured: true }, // Optimized to only touch currently featured items
        data: { isFeatured: false, updatedAt: new Date() } // Manual updatedAt
      });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: section, // Return section directly as result is now section
      message: 'Home section updated successfully',
    });
  } catch (error) {
    console.error('Error updating home section:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update home section' },
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

    await prisma.homeSection.delete({
      where: { id },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Home section deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting home section:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to delete home section' },
      { status: 500 }
    );
  }
}
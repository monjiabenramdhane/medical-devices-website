
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { translateService } from '@/lib/translation/libretranslate';
import { SUPPORTED_LOCALES } from '@/lib/i18n/types';
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

    // Process translations
    const { localizedData } = await translateService.processHomeSectionContent(data);

    // Get current section to check key
    const currentSection = await prisma.homeSection.findUnique({
      where: { id },
      select: { sectionKey: true }
    });

    const isFeaturedSection = currentSection?.sectionKey === 'featuredProducts';

    // Execute update without transaction wrapper to avoid P2028 with stale client
    const section = await prisma.homeSection.update({
      where: { id },
      data: {
        ...data,
        products: productIds ? {
          set: productIds.map((id: string) => ({ id })),
        } : undefined,
        brands: brandIds ? {
          set: brandIds.map((id: string) => ({ id })),
        } : undefined,
        // Upsert translations
        home_section_translations: {
          upsert: SUPPORTED_LOCALES.map(locale => ({
            where: {
              homeSectionId_locale: {
                homeSectionId: id,
                locale,
              },
            },
            create: {
              id: crypto.randomUUID(), // Manual ID generation
              locale,
              title: localizedData[locale].title || data.title,
              subtitle: localizedData[locale].subtitle || data.subtitle,
              content: localizedData[locale].content || data.content || '',
              ctaText: localizedData[locale].ctaText || data.ctaText,
              imageUrl: localizedData[locale].imageUrl || data.imageUrl,
              imageAlt: localizedData[locale].imageAlt || data.imageAlt,
              updatedAt: new Date(), // Manual timestamp
            },
            update: {
              title: localizedData[locale].title || data.title,
              subtitle: localizedData[locale].subtitle || data.subtitle,
              content: localizedData[locale].content || data.content || '',
              ctaText: localizedData[locale].ctaText || data.ctaText,
              imageUrl: localizedData[locale].imageUrl || data.imageUrl,
              imageAlt: localizedData[locale].imageAlt || data.imageAlt,
              updatedAt: new Date(), // Manual timestamp
            },
          })),
        }
      },
      include: {
        products: true,
        brands: true,
      }
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
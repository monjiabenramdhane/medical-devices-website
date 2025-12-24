import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { translateService } from '@/lib/translation/libretranslate';
import { DEFAULT_LOCALE } from '@/lib/i18n/types';
import type { ApiResponse } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const sections = await prisma.homeSection.findMany({
      orderBy: { order: 'asc' },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: sections,
    });
  } catch (error) {
    console.error('Error fetching home sections:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch home sections' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const { productIds, brandIds, ...data } = body;

    // Process translations and auto-fill missing locales
    const { localizedData } = await translateService.processHomeSectionContent(data);

    // Prepare the main data using the default locale (English)
    const mainDetails = localizedData[DEFAULT_LOCALE] || localizedData[Object.keys(localizedData)[0]] || data;

    const section = await prisma.homeSection.create({
      data: {
        ...data,
        title: mainDetails.title || data.title,
        subtitle: mainDetails.subtitle || data.subtitle,
        content: mainDetails.content || data.content || '',
        ctaText: mainDetails.ctaText || data.ctaText,
        imageUrl: mainDetails.imageUrl || data.imageUrl,
        imageAlt: mainDetails.imageAlt || data.imageAlt,
        order: data.order ?? 0,
        isActive: data.isActive ?? true,
        // Connect relations if IDs are provided
        products: productIds?.length ? {
          connect: productIds.map((id: string) => ({ id })),
        } : undefined,
        brands: brandIds?.length ? {
          connect: brandIds.map((id: string) => ({ id })),
        } : undefined,
        // Create translations
        home_section_translations: {
          create: Object.entries(localizedData).map(([locale, content]) => ({
            id: crypto.randomUUID(), // Keep manual ID generation as per existing code
            locale,
            title: content.title || data.title,
            subtitle: content.subtitle || data.subtitle,
            content: content.content || data.content || '',
            ctaText: content.ctaText || data.ctaText,
            imageUrl: content.imageUrl || data.imageUrl,
            imageAlt: content.imageAlt || data.imageAlt,
            updatedAt: new Date(), // Keep manual timestamp
          })),
        }
      },
      include: {
        products: true,
        brands: true,
      }
    });

    return NextResponse.json<ApiResponse>(
      { success: true, data: section, message: 'Home section created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating home section:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to create home section' },
      { status: 500 }
    );
  }
}
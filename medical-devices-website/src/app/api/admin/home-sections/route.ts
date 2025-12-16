import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { translateService } from '@/lib/translation/libretranslate';
import { SUPPORTED_LOCALES } from '@/lib/i18n/types';
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

    // Process translations
    const { localizedData } = await translateService.processHomeSectionContent(data);

    const section = await prisma.homeSection.create({
      data: {
        ...data,
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
          create: SUPPORTED_LOCALES.map(locale => ({
            id: crypto.randomUUID(), // Manual ID generation
            locale,
            title: localizedData[locale].title || data.title,
            subtitle: localizedData[locale].subtitle || data.subtitle,
            content: localizedData[locale].content || data.content || '',
            ctaText: localizedData[locale].ctaText || data.ctaText,
            imageUrl: localizedData[locale].imageUrl || data.imageUrl,
            imageAlt: localizedData[locale].imageAlt || data.imageAlt,
            updatedAt: new Date(), // Manual timestamp to bypass Prisma Client stale schema issue
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
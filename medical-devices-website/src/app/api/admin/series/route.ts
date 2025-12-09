import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
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
    const series = await prisma.series.create({
      data: {
        ...body,
        order: body.order ?? 0,
        isActive: body.isActive ?? true,
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
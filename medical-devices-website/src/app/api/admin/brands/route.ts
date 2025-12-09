import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const brands = await prisma.brand.findMany({
      include: {
        equipmentTypes: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });
    
    return NextResponse.json<ApiResponse>({
      success: true,
      data: brands,
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch brands' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    
    const body = await req.json();
    const brand = await prisma.brand.create({
      data: {
        ...body,
        order: body.order ?? 0,
        isActive: body.isActive ?? true,
      },
    });
    
    return NextResponse.json<ApiResponse>(
      { success: true, data: brand, message: 'Brand created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating brand:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to create brand' },
      { status: 500 }
    );
  }
}
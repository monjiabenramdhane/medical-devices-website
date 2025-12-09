import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const equipmentTypeId = searchParams.get('equipmentTypeId');

    const where = equipmentTypeId ? { equipmentTypeId } : {};

    const subcategories = await prisma.subcategory.findMany({
      where,
      include: {
        equipmentType: {
          include: {
            brand: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    });
    
    return NextResponse.json<ApiResponse>({
      success: true,
      data: subcategories,
    });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch subcategories' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    
    const body = await req.json();
    const subcategory = await prisma.subcategory.create({
      data: {
        ...body,
        order: body.order ?? 0,
        isActive: body.isActive ?? true,
      },
      include: {
        equipmentType: {
          include: {
            brand: true,
          },
        },
      },
    });
    
    return NextResponse.json<ApiResponse>(
      { success: true, data: subcategory, message: 'Subcategory created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating subcategory:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to create subcategory' },
      { status: 500 }
    );
  }
}

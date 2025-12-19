import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@/types';

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
    const subcategory = await prisma.subcategory.update({
      where: { id },
      data: body,
      include: {
        equipmentType: {
          include: {
            brand: true,
          },
        },
      },
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
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
    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        equipmentTypes: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!brand) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Brand not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: brand,
    });
  } catch (error) {
    console.error('Error fetching brand:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch brand' },
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
    const brand = await prisma.brand.update({
      where: { id },
      data: body,
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      data: brand,
      message: 'Brand updated successfully',
    });
  } catch (error) {
    console.error('Error updating brand:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update brand' },
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

    await prisma.brand.delete({
      where: { id },
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Brand deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting brand:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to delete brand' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@/types';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const series = await prisma.series.findUnique({
      where: { id: params.id },
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
    
    if (!series) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Series not found' },
        { status: 404 }
      );
    }
    
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

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    
    const body = await req.json();
    const series = await prisma.series.update({
      where: { id: params.id },
      data: {
        ...body,
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
    
    return NextResponse.json<ApiResponse>({
      success: true,
      data: series,
      message: 'Series updated successfully',
    });
  } catch (error) {
    console.error('Error updating series:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update series' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    
    await prisma.series.delete({
      where: { id: params.id },
    });
    
    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Series deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting series:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to delete series' },
      { status: 500 }
    );
  }
}
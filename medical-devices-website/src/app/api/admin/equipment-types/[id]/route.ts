import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@/types';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const equipmentType = await prisma.equipmentType.findUnique({
      where: { id: params.id },
      include: {
        brand: true,
        subcategories: {
          orderBy: { order: 'asc' },
        },
      },
    });
    
    if (!equipmentType) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Equipment type not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json<ApiResponse>({
      success: true,
      data: equipmentType,
    });
  } catch (error) {
    console.error('Error fetching equipment type:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch equipment type' },
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
    const equipmentType = await prisma.equipmentType.update({
      where: { id: params.id },
      data: body,
      include: {
        brand: true,
      },
    });
    
    return NextResponse.json<ApiResponse>({
      success: true,
      data: equipmentType,
      message: 'Equipment type updated successfully',
    });
  } catch (error) {
    console.error('Error updating equipment type:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update equipment type' },
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
    
    await prisma.equipmentType.delete({
      where: { id: params.id },
    });
    
    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Equipment type deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting equipment type:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to delete equipment type' },
      { status: 500 }
    );
  }
}
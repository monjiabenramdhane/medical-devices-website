import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@/types';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const section = await prisma.homeSection.findUnique({
      where: { id: params.id },
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
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    
    const body = await req.json();
    const section = await prisma.homeSection.update({
      where: { id: params.id },
      data: body,
    });
    
    return NextResponse.json<ApiResponse>({
      success: true,
      data: section,
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
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    
    await prisma.homeSection.delete({
      where: { id: params.id },
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
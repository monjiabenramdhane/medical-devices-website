import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { HeroSlideService } from '@/services/heroSlide.service';
import type { ApiResponse } from '@/types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const slide = await HeroSlideService.getById(id);

    if (!slide) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Hero slide not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: slide,
    });
  } catch (error) {
    console.error('Error fetching hero slide:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch hero slide' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireAdmin();

    const body = await req.json();
    const slide = await HeroSlideService.update(id, body);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: slide,
      message: 'Hero slide updated successfully',
    });
  } catch (error) {
    console.error('Error updating hero slide:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update hero slide' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireAdmin();

    await HeroSlideService.delete(id);

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Hero slide deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting hero slide:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to delete hero slide' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { HeroSlideService } from '@/services/heroSlide.service';
import type { ApiResponse } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const slides = await HeroSlideService.getAll();
    
    return NextResponse.json<ApiResponse>({
      success: true,
      data: slides,
    });
  } catch (error) {
    console.error('Error fetching hero slides:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch hero slides' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    
    const body = await req.json();
    const slide = await HeroSlideService.create(body);
    
    return NextResponse.json<ApiResponse>(
      { success: true, data: slide, message: 'Hero slide created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating hero slide:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to create hero slide' },
      { status: 500 }
    );
  }
}
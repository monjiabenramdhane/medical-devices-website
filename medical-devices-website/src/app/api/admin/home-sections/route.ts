import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const sections = await prisma.homeSection.findMany({
      orderBy: { order: 'asc' },
    });
    
    return NextResponse.json<ApiResponse>({
      success: true,
      data: sections,
    });
  } catch (error) {
    console.error('Error fetching home sections:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch home sections' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    
    const body = await req.json();
    const section = await prisma.homeSection.create({
      data: {
        ...body,
        order: body.order ?? 0,
        isActive: body.isActive ?? true,
      },
    });
    
    return NextResponse.json<ApiResponse>(
      { success: true, data: section, message: 'Home section created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating home section:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to create home section' },
      { status: 500 }
    );
  }
}
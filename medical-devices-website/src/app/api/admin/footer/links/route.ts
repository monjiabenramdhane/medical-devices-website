import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@/types';

export async function POST(req: NextRequest) {
    try {
        await requireAdmin();
        const body = await req.json();
        const { translations, sectionId, ...mainData } = body;

        if (!sectionId) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: 'Section ID is required' },
                { status: 400 }
            );
        }

        const link = await prisma.footerLink.create({
            data: {
                ...mainData,
                footerSectionId: sectionId,
                translations: {
                    create: translations
                }
            },
            include: {
                translations: true,
            },
        });

        return NextResponse.json<ApiResponse>(
            { success: true, data: link, message: 'Footer link created successfully' },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating footer link:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Failed to create footer link' },
            { status: 500 }
        );
    }
}

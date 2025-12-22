import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@/types';

export async function GET(req: NextRequest) {
    try {
        // We assume there is only one footer config for now.
        const footerConfig = await prisma.footerConfig.findFirst();
        if (!footerConfig) {
            return NextResponse.json<ApiResponse>({ success: true, data: [] });
        }

        const sections = await prisma.footerSection.findMany({
            where: { footerConfigId: footerConfig.id },
            include: {
                translations: true,
                links: {
                    include: {
                        translations: true
                    },
                    orderBy: { order: 'asc' }
                }
            },
            orderBy: { order: 'asc' },
        });

        return NextResponse.json<ApiResponse>({
            success: true,
            data: sections,
        });
    } catch (error) {
        console.error('Error fetching footer sections:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Failed to fetch footer sections' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        await requireAdmin();
        const body = await req.json();
        const { translations, ...mainData } = body;

        // Ensure Footer Config exists
        let footerConfig = await prisma.footerConfig.findFirst();
        if (!footerConfig) {
            footerConfig = await prisma.footerConfig.create({ data: {} });
        }

        const section = await prisma.footerSection.create({
            data: {
                ...mainData,
                footerConfigId: footerConfig.id,
                translations: {
                    create: translations
                }
            },
            include: {
                translations: true,
            },
        });

        return NextResponse.json<ApiResponse>(
            { success: true, data: section, message: 'Footer section created successfully' },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating footer section:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Failed to create footer section' },
            { status: 500 }
        );
    }
}

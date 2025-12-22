import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@/types';

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin();
        const { id } = await context.params;
        const body = await req.json();
        const { translations, ...mainData } = body;

        const section = await prisma.footerSection.update({
            where: { id },
            data: {
                ...mainData,
            },
        });

        if (translations && Array.isArray(translations)) {
            for (const t of translations) {
                await prisma.footerSectionTranslation.upsert({
                    where: {
                        footerSectionId_locale: {
                            footerSectionId: id,
                            locale: t.locale
                        }
                    },
                    update: { title: t.title },
                    create: {
                        footerSectionId: id,
                        locale: t.locale,
                        title: t.title
                    }
                });
            }
        }

        return NextResponse.json<ApiResponse>({
            success: true,
            data: section,
            message: 'Footer section updated successfully',
        });
    } catch (error) {
        console.error('Error updating footer section:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Failed to update footer section' },
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

        await prisma.footerSection.delete({
            where: { id },
        });

        return NextResponse.json<ApiResponse>({
            success: true,
            message: 'Footer section deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting footer section:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Failed to delete footer section' },
            { status: 500 }
        );
    }
}

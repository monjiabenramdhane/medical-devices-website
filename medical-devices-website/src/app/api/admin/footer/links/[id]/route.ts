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
        const { translations, sectionId, ...mainData } = body; // sectionId might change if moving link?

        const link = await prisma.footerLink.update({
            where: { id },
            data: {
                ...mainData,
                footerSectionId: sectionId || undefined,
            },
        });

        if (translations && Array.isArray(translations)) {
            for (const t of translations) {
                await prisma.footerLinkTranslation.upsert({
                    where: {
                        footerLinkId_locale: {
                            footerLinkId: id,
                            locale: t.locale
                        }
                    },
                    update: { label: t.label },
                    create: {
                        footerLinkId: id,
                        locale: t.locale,
                        label: t.label
                    }
                });
            }
        }

        return NextResponse.json<ApiResponse>({
            success: true,
            data: link,
            message: 'Footer link updated successfully',
        });
    } catch (error) {
        console.error('Error updating footer link:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Failed to update footer link' },
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

        await prisma.footerLink.delete({
            where: { id },
        });

        return NextResponse.json<ApiResponse>({
            success: true,
            message: 'Footer link deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting footer link:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Failed to delete footer link' },
            { status: 500 }
        );
    }
}

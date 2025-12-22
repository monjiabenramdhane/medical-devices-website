import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import type { ApiResponse } from '@/types';

export async function GET(req: NextRequest) {
    try {
        const footerConfig = await prisma.footerConfig.findFirst({
            include: {
                translations: true,
            },
        });

        return NextResponse.json<ApiResponse>({
            success: true,
            data: footerConfig,
        });
    } catch (error) {
        console.error('Error fetching footer config:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Failed to fetch footer config' },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        await requireAdmin();
        const body = await req.json();
        const { translations, ...mainData } = body;

        // UPSERT singleton
        let footerConfig = await prisma.footerConfig.findFirst();

        if (!footerConfig) {
            footerConfig = await prisma.footerConfig.create({
                data: {
                    ...mainData,
                }
            });
        } else {
            footerConfig = await prisma.footerConfig.update({
                where: { id: footerConfig.id },
                data: {
                    ...mainData,
                },
            });
        }

        // Handle Translations
        if (translations && Array.isArray(translations)) {
            for (const t of translations) {
                await prisma.footerConfigTranslation.upsert({
                    where: {
                        footerConfigId_locale: {
                            footerConfigId: footerConfig.id,
                            locale: t.locale
                        }
                    },
                    update: {
                        name: t.name,
                        address: t.address,
                        companyDescription: t.companyDescription,
                        copyrightText: t.copyrightText,
                    },
                    create: {
                        footerConfigId: footerConfig.id,
                        locale: t.locale,
                        name: t.name,
                        address: t.address,
                        companyDescription: t.companyDescription,
                        copyrightText: t.copyrightText,
                    }
                })
            }
        }

        // Return updated data
        const updatedFooterConfig = await prisma.footerConfig.findFirst({
            include: {
                translations: true,
            },
        });

        return NextResponse.json<ApiResponse>({
            success: true,
            data: updatedFooterConfig,
            message: 'Footer settings updated successfully',
        });
    } catch (error) {
        console.error('Error updating footer config:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: 'Failed to update footer config' },
            { status: 500 }
        );
    }
}

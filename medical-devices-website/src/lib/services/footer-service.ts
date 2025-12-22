import { prisma } from '@/lib/prisma';
import { getLocale } from '@/lib/i18n/locale-resolver';
import type { LocalizedFooterConfig, LocalizedFooterSection, LocalizedFooterLink } from '@/types';

export const getLocalizedFooter = async (): Promise<LocalizedFooterConfig | null> => {
    const locale = await getLocale();

    // Fetch Singleton FooterConfig
    const footerConfig = await prisma.footerConfig.findFirst({
        include: {
            translations: {
                where: { locale },
            },
            sections: {
                where: { isActive: true },
                orderBy: { order: 'asc' },
                include: {
                    translations: {
                        where: { locale },
                    },
                    links: {
                        where: { isActive: true },
                        orderBy: { order: 'asc' },
                        include: {
                            translations: {
                                where: { locale },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!footerConfig) return null;

    const translation = footerConfig.translations[0];

    const localizedSections: LocalizedFooterSection[] = footerConfig.sections.map((section) => {
        const sectionTranslation = section.translations[0];
        const localizedLinks: LocalizedFooterLink[] = section.links.map((link) => {
            const linkTranslation = link.translations[0];
            return {
                id: link.id,
                label: linkTranslation?.label || link.url,
                url: link.url,
                order: link.order,
            };
        });

        return {
            id: section.id,
            title: sectionTranslation?.title || 'Untitled Section',
            order: section.order,
            links: localizedLinks,
        };
    });

    return {
        email: footerConfig.email,
        phone: footerConfig.phone,
        facebookUrl: footerConfig.facebookUrl,
        twitterUrl: footerConfig.twitterUrl,
        linkedinUrl: footerConfig.linkedinUrl,
        instagramUrl: footerConfig.instagramUrl,
        name: translation?.name || null,
        address: translation?.address || null,
        companyDescription: translation?.companyDescription || null,
        copyrightText: translation?.copyrightText || null,
        sections: localizedSections,
    };
};

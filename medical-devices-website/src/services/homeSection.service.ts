
import { prisma } from '@/lib/prisma';
import { HomeSection } from '@prisma/client';

export const HomeSectionService = {
    getByKey: async (key: string): Promise<HomeSection | null> => {
        return prisma.homeSection.findUnique({
            where: {
                sectionKey: key,
                isActive: true,
            },
        });
    },

    getAll: async (activeOnly = true): Promise<HomeSection[]> => {
        return prisma.homeSection.findMany({
            where: activeOnly ? { isActive: true } : {},
            orderBy: { order: 'asc' },
        });
    },
};

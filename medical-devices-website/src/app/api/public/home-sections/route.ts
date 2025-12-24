import { NextResponse } from 'next/server';
import { getLocale } from '@/lib/i18n/locale-resolver';
import { HomeSectionService } from '@/services/homeSection.service';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const key = searchParams.get('key');
        const locale = await getLocale();

        if (key) {
            const section = await HomeSectionService.getLocalizedByKey(key, locale);
            return NextResponse.json(section);
        }

        const sections = await HomeSectionService.getAll(true);
        return NextResponse.json(sections);
    } catch (error) {
        console.error('Error fetching home sections:', error);
        return NextResponse.json(
            { error: 'Failed to fetch home sections' },
            { status: 500 }
        );
    }
}

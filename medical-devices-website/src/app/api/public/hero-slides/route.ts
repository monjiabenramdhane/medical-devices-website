import { NextResponse } from 'next/server';
import { getLocale } from '@/lib/i18n/locale-resolver';
import { getLocalizedHeroSlides } from '@/lib/i18n/localized-hero-service';

export async function GET() {
    try {
        const locale = await getLocale();
        const slides = await getLocalizedHeroSlides(locale);
        return NextResponse.json(slides);
    } catch (error) {
        console.error('Error fetching hero slides:', error);
        return NextResponse.json(
            { error: 'Failed to fetch hero slides' },
            { status: 500 }
        );
    }
}

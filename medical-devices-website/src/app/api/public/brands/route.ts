import { NextResponse } from 'next/server';
import { BrandService } from '@/services/brand.service';

export async function GET() {
    try {
        const brands = await BrandService.getAll(true);
        return NextResponse.json(brands);
    } catch (error) {
        console.error('Error fetching brands:', error);
        return NextResponse.json(
            { error: 'Failed to fetch brands' },
            { status: 500 }
        );
    }
}

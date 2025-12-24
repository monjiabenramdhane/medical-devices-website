import { NextResponse } from 'next/server';
import { ProductService } from '@/services/product.service';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
        const featured = searchParams.get('featured') === 'true';

        const products = featured
            ? await ProductService.getFeatured(limit || 6)
            : await ProductService.getAll({ isActive: true, limit });

        return NextResponse.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}

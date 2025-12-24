import { NextResponse } from 'next/server';
import { ProductService } from '@/services/product.service';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const { searchParams } = new URL(request.url);
        const brandSlug = searchParams.get('brand');

        if (!brandSlug) {
            return NextResponse.json(
                { error: 'Brand slug is required' },
                { status: 400 }
            );
        }

        const product = await ProductService.getBySlug(slug, brandSlug);

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json(
            { error: 'Failed to fetch product' },
            { status: 500 }
        );
    }
}

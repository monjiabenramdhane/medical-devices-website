'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImageUpload } from '../ImageUpload';
import type { HomeSection, CreateHomeSectionInput, Product, Brand } from '@/types';

interface HomeSectionFormProps {
  initialData?: HomeSection;
  isEdit?: boolean;
  allProducts: Product[];
  allBrands: Brand[];
}

type LinkedContentType = 'none' | 'products' | 'brands';

export function HomeSectionForm({ initialData, isEdit = false, allProducts, allBrands }: HomeSectionFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize content type based on existing data
  const [linkedContentType, setLinkedContentType] = useState<LinkedContentType>(() => {
    if (initialData?.products && initialData.products.length > 0) return 'products';
    if (initialData?.brands && initialData.brands.length > 0) return 'brands';
    return 'none';
  });

  const featuredOnly = allProducts.filter(p => p.isFeatured === true);  
  const featuredIds = featuredOnly.map(p => p.id);

  const [formData, setFormData] = useState<CreateHomeSectionInput>({
    sectionKey: initialData?.sectionKey || '',
    title: initialData?.title || '',
    subtitle: initialData?.subtitle || '',
    content: initialData?.content || '',
    imageUrl: initialData?.imageUrl || '',
    imageAlt: initialData?.imageAlt || '',
    ctaText: initialData?.ctaText || '',
    ctaLink: initialData?.ctaLink || '',
    order: initialData?.order || 0,
    isActive: initialData?.isActive ?? true,
    productIds: Array.from(new Set([
      ...featuredIds
    ])),
    brandIds: initialData?.brands?.map(b => b.id) || [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const url = isEdit
        ? `/api/admin/home-sections/${initialData?.id}`
        : '/api/admin/home-sections';
      
      const method = isEdit ? 'PUT' : 'POST';

      // Clean up IDs based on selected type before sending
      const payload = {
        ...formData,
        productIds: linkedContentType === 'products' ? formData.productIds : [],
        brandIds: linkedContentType === 'brands' ? formData.brandIds : [],
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save home section');

      router.push('/admin/home-sections');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleProduct = (productId: string) => {
    const current = formData.productIds || [];
    const updated = current.includes(productId)
      ? current.filter(id => id !== productId)
      : [...current, productId];
    setFormData({ ...formData, productIds: updated });
  };

  const toggleBrand = (brandId: string) => {
    const current = formData.brandIds || [];
    const updated = current.includes(brandId)
      ? current.filter(id => id !== brandId)
      : [...current, brandId];
    setFormData({ ...formData, brandIds: updated });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg" role="alert">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="sectionKey" className="block text-sm font-medium text-gray-700 mb-2">
              Section Key * (Unique identifier)
            </label>
            <input
              type="text"
              id="sectionKey"
              required
              value={formData.sectionKey}
              onChange={(e) => setFormData({ ...formData, sectionKey: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., about, mission, values"
              disabled={isEdit} // Optional: Lock key on edit if desired, but request was about toggles
            />
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-6">
          <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-2">
            Subtitle
          </label>
          <input
            type="text"
            id="subtitle"
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="mt-6">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Content
          </label>
          <textarea
            id="content"
            rows={6}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Linked Content</h3>
        
        {/* Toggle Controls */}
        <div className="flex space-x-4 mb-6">
            <button
                type="button"
                onClick={() => !isEdit && setLinkedContentType('none')}
                disabled={isEdit}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    linkedContentType === 'none'
                        ? 'bg-gray-800 text-white'
                        : isEdit 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
                No Details
            </button>
            <button
                type="button"
                onClick={() => !isEdit && setLinkedContentType('products')}
                disabled={isEdit}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    linkedContentType === 'products'
                        ? 'bg-[#02445b] text-white'
                        : isEdit
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
                Link Products
            </button>
            <button
                type="button"
                onClick={() => !isEdit && setLinkedContentType('brands')}
                disabled={isEdit}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    linkedContentType === 'brands'
                        ? 'bg-[#02445b] text-white'
                        : isEdit
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
                Link Brands
            </button>
        </div>
        
        {linkedContentType === 'products' && (
            <div className="mb-6 animate-fadeIn">
            <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Products to Display
            </label>
            <div className="max-h-60 overflow-y-auto border rounded-lg p-4 bg-gray-50 grid grid-cols-1 md:grid-cols-2 gap-2">
                {allProducts.map(product => (
                <label key={product.id} className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${formData.productIds?.includes(product.id) ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-100'}`}>
                    <input
                    type="checkbox"
                    checked={formData.productIds?.includes(product.id) || false}
                    onChange={() => toggleProduct(product.id)}
                    className="rounded border-gray-300 text-[#02445b] focus:ring-[#02445b]"
                    />
                    <span className="text-sm text-gray-700">{product.name}</span>
                </label>
                ))}
                {allProducts.length === 0 && <p className="text-sm text-gray-500">No products available.</p>}
            </div>
            <p className="mt-2 text-xs text-gray-500">{formData.productIds?.length || 0} products selected</p>
            </div>
        )}

        {linkedContentType === 'brands' && (
            <div className="animate-fadeIn">
            <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Brands to Display
            </label>
            <div className="max-h-60 overflow-y-auto border rounded-lg p-4 bg-gray-50 grid grid-cols-1 md:grid-cols-2 gap-2">
                {allBrands.map(brand => (
                <label key={brand.id} className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${formData.brandIds?.includes(brand.id) ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-100'}`}>
                    <input
                    type="checkbox"
                    checked={formData.brandIds?.includes(brand.id) || false}
                    onChange={() => toggleBrand(brand.id)}
                    className="rounded border-gray-300 text-[#02445b] focus:ring-[#02445b]"
                    />
                    <span className="text-sm text-gray-700">{brand.name}</span>
                </label>
                ))}
                {allBrands.length === 0 && <p className="text-sm text-gray-500">No brands available.</p>}
            </div>
            <p className="mt-2 text-xs text-gray-500">{formData.brandIds?.length || 0} brands selected</p>
            </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Image (Optional)</h3>
        
        <ImageUpload
          value={formData.imageUrl || ''}
          onChange={(url) => setFormData({ ...formData, imageUrl: url })}
          folder="home-sections"
          label="Section Image"
        />

        {formData.imageUrl && (
          <div className="mt-4">
            <label htmlFor="imageAlt" className="block text-sm font-medium text-gray-700 mb-2">
              Image Alt Text
            </label>
            <input
              type="text"
              id="imageAlt"
              value={formData.imageAlt}
              onChange={(e) => setFormData({ ...formData, imageAlt: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Call to Action (Optional)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="ctaText" className="block text-sm font-medium text-gray-700 mb-2">
              CTA Text
            </label>
            <input
              type="text"
              id="ctaText"
              value={formData.ctaText}
              onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="ctaLink" className="block text-sm font-medium text-gray-700 mb-2">
              CTA Link
            </label>
            <input
              type="text"
              id="ctaLink"
              value={formData.ctaLink}
              onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2">
              Display Order
            </label>
            <input
              type="number"
              id="order"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-[#02445b] focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Active
            </label>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-[#02445b] text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isLoading ? 'Saving...' : isEdit ? 'Update Section' : 'Create Section'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
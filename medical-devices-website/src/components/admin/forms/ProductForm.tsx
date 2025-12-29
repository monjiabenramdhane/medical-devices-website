'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ImageUpload } from '../ImageUpload';
import { GalleryManager, type GalleryImage } from '../GalleryManager';
import type { Product, CreateProductInput, Brand, EquipmentType, Subcategory, Series, Gamme, Specialty } from '@/types';

interface ProductFormProps {
  initialData?: Product;
  isEdit?: boolean;
}

export function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Options state
  const [brands, setBrands] = useState<Brand[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  // const [seriesList, setSeriesList] = useState<Series[]>([]);

  const [formData, setFormData] = useState<CreateProductInput & { gallery: GalleryImage[] }>({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    shortDescription: initialData?.shortDescription || '',
    fullDescription: initialData?.fullDescription || '',
    gamme: initialData?.gamme || undefined,
    specialty: initialData?.specialty || undefined,
    heroImageUrl: initialData?.heroImageUrl || '',
    heroImageAlt: initialData?.heroImageAlt || '',
    isFeatured: initialData?.isFeatured || false,
    isActive: initialData?.isActive ?? true,
    order: initialData?.order || 0,
    brandId: initialData?.brandId || '',
    equipmentTypeId: initialData?.equipmentTypeId || '',
    subcategoryId: initialData?.subcategoryId || '',
    seriesId: initialData?.seriesId || '',
    metaTitle: initialData?.metaTitle || '',
    metaDescription: initialData?.metaDescription || '',
    metaKeywords: initialData?.metaKeywords || '',
    gallery: initialData?.gallery?.map(img => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      order: img.order,
    })) || [],
  });

  // Fetch options on mount
  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    if (formData.brandId) {
      fetchEquipmentTypes(formData.brandId);
    }
  }, [formData.brandId]);

  useEffect(() => {
    if (formData.equipmentTypeId) {
      fetchSubcategories(formData.equipmentTypeId);
    }
  }, [formData.equipmentTypeId]);

  // useEffect(() => {
  //   if (formData.subcategoryId) {
  //     fetchSeries(formData.subcategoryId);
  //   }
  // }, [formData.subcategoryId]);

  const fetchBrands = async () => {
    try {
      const res = await fetch('/api/admin/brands');
      const data = await res.json();
      setBrands(data.data || []);
    } catch (err) {
      console.error('Failed to fetch brands:', err);
    }
  };

  const fetchEquipmentTypes = async (brandId: string) => {
    try {
      const res = await fetch(`/api/admin/equipment-types?brandId=${brandId}`);
      const data = await res.json();
      setEquipmentTypes(data.data || []);
    } catch (err) {
      console.error('Failed to fetch equipment types:', err);
    }
  };

  const fetchSubcategories = async (equipmentTypeId: string) => {
    try {
      const res = await fetch(`/api/admin/subcategories?equipmentTypeId=${equipmentTypeId}`);
      const data = await res.json();
      setSubcategories(data.data || []);
    } catch (err) {
      console.error('Failed to fetch subcategories:', err);
    }
  };

  // const fetchSeries = async (subcategoryId: string) => {
  //   try {
  //     const res = await fetch(`/api/admin/series?subcategoryId=${subcategoryId}`);
  //     const data = await res.json();
  //     setSeriesList(data.data || []);
  //   } catch (err) {
  //     console.error('Failed to fetch series:', err);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const url = isEdit
        ? `/api/admin/products/${initialData?.id}`
        : '/api/admin/products';
      
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save product');
      }

      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg" role="alert">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-[#02445b]  mb-4">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
              Slug *
            </label>
            <input
              type="text"
              id="slug"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-6">
          <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-2">
            Short Description
          </label>
          <textarea
            id="shortDescription"
            rows={3}
            value={formData.shortDescription}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="mt-6">
          <label htmlFor="fullDescription" className="block text-sm font-medium text-gray-700 mb-2">
            Full Description
          </label>
          <textarea
            id="fullDescription"
            rows={6}
            value={formData.fullDescription}
            onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Hierarchy */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-[#02445b]  mb-4">Product Hierarchy</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="brandId" className="block text-sm font-medium text-gray-700 mb-2">
              Brand *
            </label>
            <select
              id="brandId"
              required
              value={formData.brandId}
              onChange={(e) => setFormData({ ...formData, brandId: e.target.value, equipmentTypeId: '', subcategoryId: ''
                // , seriesId: ''
               })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Brand</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="equipmentTypeId" className="block text-sm font-medium text-gray-700 mb-2">
              Equipment Type
            </label>
            <select
              id="equipmentTypeId"
              value={formData.equipmentTypeId}
              onChange={(e) => setFormData({ ...formData, equipmentTypeId: e.target.value, subcategoryId: ''
                // , seriesId: ''
               })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!formData.brandId}
            >
              <option value="">Select Equipment Type</option>
              {equipmentTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="subcategoryId" className="block text-sm font-medium text-gray-700 mb-2">
              Subcategory
            </label>
            <select
              id="subcategoryId"
              value={formData.subcategoryId}
              onChange={(e) => setFormData({ ...formData, subcategoryId: e.target.value
                //  ,seriesId: '' 
                })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!formData.equipmentTypeId}
            >
              <option value="">Select Subcategory</option>
              {subcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* <div>
            <label htmlFor="seriesId" className="block text-sm font-medium text-gray-700 mb-2">
              Series (Optional)
            </label>
            <select
              id="seriesId"
              value={formData.seriesId}
              onChange={(e) => setFormData({ ...formData, seriesId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!formData.subcategoryId}
            >
              <option value="">Select Series</option>
              {seriesList.map((series) => (
                <option key={series.id} value={series.id}>
                  {series.name}
                </option>
              ))}
            </select>
          </div> */}
        </div>
      </div>

      {/* Classification */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-[#02445b]  mb-4">Classification</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="gamme" className="block text-sm font-medium text-gray-700 mb-2">
              Gamme (Range)
            </label>
            <select
              id="gamme"
              value={formData.gamme || ''}
              onChange={(e) => setFormData({ ...formData, gamme: e.target.value as Gamme || undefined })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Gamme</option>
              <option value="HIGH">High Range</option>
              <option value="MEDIUM">Medium Range</option>
              <option value="LOW">Entry level</option>
            </select>
          </div>

          <div>
            <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-2">
              Specialty
            </label>
            <select
              id="specialty"
              value={formData.specialty || ''}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value as Specialty || undefined })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Specialty</option>
              <option value="CARDIOLOGY">Cardiology</option>
              <option value="GENERALIST">Generalist</option>
              <option value="ORTHOPEDIC">Orthopedic</option>
              <option value="NEUROLOGY">Neurology</option>
              <option value="OBSTETRICS">Obstetrics</option>
              <option value="EMERGENCY">Emergency</option>
              <option value="PEDIATRIC">Pediatric</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-[#02445b]  mb-4">Images</h3>
        
        <ImageUpload
          value={formData.heroImageUrl}
          onChange={(url) => setFormData({ ...formData, heroImageUrl: url })}
          folder="products/hero"
          label="Hero Image *"
        />

        <div className="mt-4">
          <label htmlFor="heroImageAlt" className="block text-sm font-medium text-gray-700 mb-2">
            Hero Image Alt Text *
          </label>
          <input
            type="text"
            id="heroImageAlt"
            required
            value={formData.heroImageAlt}
            onChange={(e) => setFormData({ ...formData, heroImageAlt: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="mt-6">
          <GalleryManager
            images={formData.gallery}
            onChange={(gallery) => setFormData({ ...formData, gallery })}
            maxImages={10}
          />
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-[#02445b]  mb-4">Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              id="isFeatured"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="h-4 w-4 text-[#02445b] focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-700">
              Featured Product
            </label>
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

      {/* SEO */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-[#02445b]  mb-4">SEO</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-2">
              Meta Title
            </label>
            <input
              type="text"
              id="metaTitle"
              value={formData.metaTitle}
              onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-2">
              Meta Description
            </label>
            <textarea
              id="metaDescription"
              rows={3}
              value={formData.metaDescription}
              onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="metaKeywords" className="block text-sm font-medium text-gray-700 mb-2">
              Meta Keywords
            </label>
            <input
              type="text"
              id="metaKeywords"
              value={formData.metaKeywords}
              onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="keyword1, keyword2, keyword3"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-[#02445b] text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isLoading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
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
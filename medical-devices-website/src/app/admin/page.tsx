import { prisma } from '@/lib/prisma';

// I'll use raw tailwind for cards if I'm not sure about components. 
// I see src/components/common, let's check basic structure. 
// Actually, I'll stick to raw tailwind for layout to be safe and consistent with the "design aesthetics".

import Link from 'next/link';
import { 
  Package, 
  Tag, 
  FileText, 
  Image as ImageIcon 
} from 'lucide-react';

async function getStats() {
  const [
    productsCount,
    brandsCount,
    homeSectionsCount,
    heroSlidesCount,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.brand.count(),
    prisma.homeSection.count(),
    prisma.heroSlide.count(),
  ]);

  return {
    productsCount,
    brandsCount,
    homeSectionsCount,
    heroSlidesCount,
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Products Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Products</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.productsCount}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        {/* Brands Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Brands</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.brandsCount}</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <Tag className="h-6 w-6 text-purple-600" />
          </div>
        </div>

        {/* Home Sections Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Home Sections</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.homeSectionsCount}</p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-lg">
            <FileText className="h-6 w-6 text-indigo-600" />
          </div>
        </div>

        {/* Hero Slides Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Hero Slides</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.heroSlidesCount}</p>
          </div>
          <div className="p-3 bg-pink-50 rounded-lg">
            <ImageIcon className="h-6 w-6 text-pink-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
           <Link href="/admin/products/new" className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all group">
             <h3 className="font-medium text-gray-900 group-hover:text-blue-600">Add New Product</h3>
             <p className="text-sm text-gray-500 mt-1">Create a new product listing</p>
           </Link>
           <Link href="/admin/brands/new" className="block p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-md transition-all group">
             <h3 className="font-medium text-gray-900 group-hover:text-purple-600">Add New Brand</h3>
             <p className="text-sm text-gray-500 mt-1">Register a new manufacturer</p>
           </Link>
           <Link href="/admin/hero-slides/new" className="block p-4 border border-gray-200 rounded-lg hover:border-pink-500 hover:shadow-md transition-all group">
             <h3 className="font-medium text-gray-900 group-hover:text-pink-600">Add Hero Slide</h3>
             <p className="text-sm text-gray-500 mt-1">Update the homepage carousel</p>
           </Link>
        </div>
      </div>
    </div>
  );
}

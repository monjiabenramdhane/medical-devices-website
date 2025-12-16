'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ExternalLink, LogOut, LayoutDashboard, Image, FileText, Tag, Package, Layers, FolderTree, ShoppingBag } from 'lucide-react';

interface AdminNavigationProps {
  userEmail: string;
}

export function AdminNavigation({ userEmail }: AdminNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white">
            <div className="flex items-center justify-between h-16 px-6 bg-gray-800">
              <h1 className="text-xl font-bold">Admin Panel</h1>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="px-4 py-6 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
              <Link
                href="/admin"
                className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <LayoutDashboard className="h-5 w-5 mr-3" />
                Dashboard
              </Link>

              <div className="pt-4 pb-2">
                <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Content
                </h3>
              </div>

              <Link
                href="/admin/hero-slides"
                className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Image className="h-5 w-5 mr-3" />
                Hero Slides
              </Link>
              <Link
                href="/admin/home-sections"
                className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <FileText className="h-5 w-5 mr-3" />
                Home Sections
              </Link>

              <div className="pt-4 pb-2">
                <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Products
                </h3>
              </div>

              <Link
                href="/admin/brands"
                className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Tag className="h-5 w-5 mr-3" />
                Brands
              </Link>
              <Link
                href="/admin/equipment-types"
                className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Package className="h-5 w-5 mr-3" />
                Equipment Types
              </Link>
              <Link
                href="/admin/subcategories"
                className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Layers className="h-5 w-5 mr-3" />
                Subcategories
              </Link>
              <Link
                href="/admin/series"
                className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <FolderTree className="h-5 w-5 mr-3" />
                Series
              </Link>
              <Link
                href="/admin/products"
                className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <ShoppingBag className="h-5 w-5 mr-3" />
                Products
              </Link>
            </nav>

            <div className="absolute bottom-0 left-0 right-0 border-t border-gray-800 p-4 bg-gray-900">
              <div className="mb-3">
                <p className="text-xs text-gray-400 mb-1">Logged in as:</p>
                <p className="text-sm font-medium truncate">{userEmail}</p>
              </div>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center w-full px-4 py-2 mb-2 rounded-lg bg-[#02445b] hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Website
              </a>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="flex items-center w-full px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
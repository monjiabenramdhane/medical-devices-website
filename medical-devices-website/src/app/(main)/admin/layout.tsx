import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import {
  LayoutDashboard,
  Image,
  FileText,
  Tag,
  Package,
  Layers,
  FolderTree,
  ShoppingBag,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';
import { AdminNavigation } from '@/components/admin/AdminNavigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return children;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-gray-900 text-white" role="navigation" aria-label="Admin navigation">
        <div className="flex-1 flex flex-col min-h-0">
          {/* Sidebar Header */}
          <div className="flex items-center h-16 flex-shrink-0 px-6 bg-gray-800">
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <Link
              href="/admin"
              className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
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
            >
              <Image className="h-5 w-5 mr-3" />
              Hero Slides
            </Link>
            <Link
              href="/admin/home-sections"
              className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <FileText className="h-5 w-5 mr-3" />
              Home Sections
            </Link>
            <Link
              href="/admin/footer"
              className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <FileText className="h-5 w-5 mr-3" />
              Footer
            </Link>

            <div className="pt-4 pb-2">
              <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Products
              </h3>
            </div>

            <Link
              href="/admin/brands"
              className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Tag className="h-5 w-5 mr-3" />
              Brands
            </Link>
            <Link
              href="/admin/equipment-types"
              className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Package className="h-5 w-5 mr-3" />
              Equipment Types
            </Link>
            <Link
              href="/admin/subcategories"
              className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Layers className="h-5 w-5 mr-3" />
              Subcategories
            </Link>
            {/* <Link
              href="/admin/series"
              className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <FolderTree className="h-5 w-5 mr-3" />
              Series
            </Link> */}
            <Link
              href="/admin/products"
              className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <ShoppingBag className="h-5 w-5 mr-3" />
              Products
            </Link>
          </nav>

          {/* Sidebar Footer */}
          <div className="flex-shrink-0 border-t border-gray-800 p-4">
             <div className="mb-3">
               <p className="text-xs text-gray-400 mb-1">Logged in as:</p>
               <p className="text-sm font-medium truncate">{session.user?.email}</p>
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
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="text-lg font-bold text-[#02445b] ">Admin Panel</h1>
            <AdminNavigation userEmail={session.user?.email || ''} />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-100">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

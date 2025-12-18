'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Menu, X, ChevronDown, UserIcon } from 'lucide-react';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';

interface HeaderClientProps {
  translations: Record<string, string>;
}

export function HeaderClient({ translations }: HeaderClientProps) {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  const t = (key: string, fallback: string) => translations[key] || fallback;

  return (
    <header className="bg-[#ebf6f2] shadow-sm sticky top-0 z-50">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img
                src="/images/logo.png"
                alt="Medical Devices"
                className="h-12 w-auto"
                onError={(e) => {
                  e.currentTarget.src = '/images/placeholder.jpg';
                }}
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-8">
            <Link
              href="/"
              className="text-base font-medium text-gray-700 hover:text-[#02445b] transition-colors"
            >
              {t('nav.home', 'Home')}
            </Link>
            <Link
              href="/brands"
              className="text-base font-medium text-gray-700 hover:text-[#02445b] transition-colors"
            >
              {t('nav.brands', 'Brands')}
            </Link>
            <Link
              href="/products"
              className="text-base font-medium text-gray-700 hover:text-[#02445b] transition-colors"
            >
              {t('nav.products', 'Products')}
            </Link>
            
            <div className="relative group">
              <button className="flex items-center text-base font-medium text-gray-700 hover:text-[#02445b] transition-colors">
                {t('nav.services', 'Services')}
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {/* Dropdown menu would go here */}
            </div>

            <Link
              href="/about"
              className="text-base font-medium text-gray-700 hover:text-[#02445b] transition-colors"
            >
              {t('nav.about', 'About Us')}
            </Link>

            <Link
              href="/contact"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-3xl text-white bg-[#02445b] hover:bg-[#02445b]/90 transition-colors"
            >
              {t('nav.contact', 'Contact')}
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center px-2 py-2 border rounded-full border-transparent text-sm font-medium text-white bg-[#02445b] hover:bg-[#02445b]/90 transition-colors"
              >
                <UserIcon className="h-5 w-5"/>
                <span className="sr-only">{t('nav.admin', 'Admin Dashboard')}</span>
              </Link>
            )}

            <LanguageSwitcher />
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center gap-4">
            <LanguageSwitcher />
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-[#02445b] hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link
                href="/products"
                className="text-base font-medium text-gray-700 hover:text-[#02445b] transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.products', 'Products')}
              </Link>
              <Link
                href="/services"
                className="text-base font-medium text-gray-700 hover:text-[#02445b] transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link
                href="/research"
                className="text-base font-medium text-gray-700 hover:text-[#02445b] transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Research
              </Link>
              <Link
                href="/about"
                className="text-base font-medium text-gray-700 hover:text-[#02445b] transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.about', 'About Us')}
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-base font-medium text-[#02445b] hover:text-blue-700 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.admin', 'Admin Dashboard')}
                </Link>
              )}
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#02445b] hover:bg-blue-700 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.contact', 'Contact')}
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

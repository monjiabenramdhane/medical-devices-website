import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { getLocale } from '@/lib/i18n/locale-resolver';
import { getTranslationsByCategory } from '@/lib/i18n/translation-service';

export async function Footer() {
  const currentYear = new Date().getFullYear();
  const locale = await getLocale();
  const translations = await getTranslationsByCategory(locale, 'footer');

  const t = (key: string, fallback: string) => translations[key] || fallback;

  return (
    <footer className="bg-gray-900 text-white" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <img
              src="/images/logo-white.png"
              alt="Medical Devices Group"
              className="h-10 w-auto mb-4"
              // Server component cannot use onError directly for image fallback like client component
              // In production, use next/image or handle at source
            />
            <p className="text-sm text-gray-400 mb-4">
              Leading provider of medical devices and solutions across Africa and beyond.
            </p>
            <div className="flex space-x-4">
              {/* Social icons kept static for now as they are links */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Products
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/products"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  All Products
                </Link>
              </li>
              {/* Other static links... could be localized if needed */}
              <li>
                <Link
                  href="/brands"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Our Brands
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Services
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/services/installation"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Installation
                </Link>
              </li>
              <li>
                <Link
                  href="/services/maintenance"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Maintenance
                </Link>
              </li>
              <li>
                <Link
                  href="/services/training"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Training
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {t('nav.about', 'About Us')}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {t('nav.contact', 'Contact')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <p className="text-sm text-gray-400 text-center">
            {t('footer.rights', `© ${currentYear} Medical Devices Group. All rights reserved.`)}
          </p>
        </div>
      </div>
    </footer>
  );
}
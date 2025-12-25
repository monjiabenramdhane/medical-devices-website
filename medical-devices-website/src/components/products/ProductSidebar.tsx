'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Filter } from 'lucide-react';
import { Specialty } from '@prisma/client';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

interface ProductSidebarProps {
  brands: { id: string; name: string; slug: string }[];
  selectedParams: { brand?: string; gamme?: string; specialty?: string };
  translations: { ui: Record<string, string>; specialty: Record<string, string> };
}

export function ProductSidebar({ brands, selectedParams, translations }: ProductSidebarProps) {
  const { brand: selectedBrand, gamme: selectedGamme, specialty: selectedSpecialty } = selectedParams;
  const { ui: uiTranslations, specialty: specialtyTranslations } = translations;

  const t = (key: string, fallback: string) => uiTranslations[key] || fallback;
  const tSpec = (key: string, fallback: string) => specialtyTranslations[key] || fallback;
  const tSpecialty = (val: Specialty) => tSpec(`specialty.${val.toLowerCase()}`, val);

  const SPECIALTIES = Object.values(Specialty).filter(s => s !== Specialty.OTHER);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Helper to update cookies
  const setCookie = (name: string, value?: string) => {
    if (value) {
      document.cookie = `${name}=${value}; path=/; max-age=${60 * 60 * 24 * 30}`;
    } else {
      document.cookie = `${name}=; path=/; max-age=0`;
    }
  };

  // Build URL and handle click
  const handleClick = (param: 'brand' | 'gamme' | 'specialty', value?: string) => {
    // Update cookie
    setCookie(param, value);

    // Build new query params
    const newParams = new URLSearchParams(searchParams.toString());
    if (value) {
      newParams.set(param, value);
    } else {
      newParams.delete(param);
    }

    // Navigate to updated URL
    router.push(`${pathname}?${newParams.toString()}`);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 sticky top-4">
      <div className="flex items-center mb-6">
        <Filter className="h-5 w-5 text-gray-400 mr-2" />
        <h2 className="text-lg font-semibold text-[#02445b]">{t('ui.filters', 'Filters')}</h2>
      </div>

      {/* Brand Filter */}
      <div className="mb-6">
        <h3 className="text-md font-semibold text-[#466c65] bg-[#ebf6f2] p-2 rounded-lg mb-3">{t('ui.brand', 'Brand')}</h3>
        <div className="space-y-2 px-2">
          <button
            onClick={() => handleClick('brand')}
            className={`block text-sm ${!selectedBrand ? 'text-[#02445b] font-semibold' : 'text-gray-600 hover:text-[#02445b]'}`}
          >
            {t('ui.allBrands', 'All Brands')}
          </button>
          {brands.map(brand => (
            <button
              key={brand.id}
              onClick={() => handleClick('brand', brand.slug)}
              className={`block text-sm ${selectedBrand === brand.slug ? 'text-[#02445b] font-semibold' : 'text-gray-600 hover:text-[#02445b]'}`}
            >
              {brand.name}
            </button>
          ))}
        </div>
      </div>

      {/* Gamme Filter */}
      <div className="mb-6">
        <h3 className="text-md font-semibold text-[#466c65] bg-[#ebf6f2] p-2 rounded-lg mb-3">{t('ui.range', 'Range')}</h3>
        <div className="space-y-2 px-2">
          <button
            onClick={() => handleClick('gamme')}
            className={`block text-sm ${!selectedGamme ? 'text-[#02445b] font-semibold' : 'text-gray-600 hover:text-[#02445b]'}`}
          >
            {t('ui.allRanges', 'All Ranges')}
          </button>
          {['HIGH', 'MEDIUM', 'LOW'].map(level => (
            <button
              key={level}
              onClick={() => handleClick('gamme', level.toLowerCase())}
              className={`block text-sm ${selectedGamme?.toUpperCase() === level ? 'text-[#02445b] font-semibold' : 'text-gray-600 hover:text-[#02445b]'}`}
            >
              {t(`ui.gamme.${level.toLowerCase()}`, level)}
            </button>
          ))}
        </div>
      </div>

      {/* Specialty Filter */}
      <div className="mb-6">
        <h3 className="text-md font-semibold text-[#466C65] bg-[#ebf6f2] p-2 rounded-lg mb-3">{t('ui.specialty', 'Specialty')}</h3>
        <div className="space-y-2 px-2">
          <button
            onClick={() => handleClick('specialty')}
            className={`block text-sm ${!selectedSpecialty ? 'text-[#02445b] font-semibold' : 'text-gray-600 hover:text-[#02445b]'}`}
          >
            {t('ui.allSpecialties', 'All Specialties')}
          </button>
          {SPECIALTIES.map(spec => (
            <button
              key={spec}
              onClick={() => handleClick('specialty', spec.toLowerCase())}
              className={`block text-sm ${selectedSpecialty?.toUpperCase() === spec ? 'text-[#02445b] font-semibold' : 'text-gray-600 hover:text-[#02445b]'}`}
            >
              {tSpecialty(spec)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

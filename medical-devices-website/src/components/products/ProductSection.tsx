'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Modal from '@/components/ui/Modal';

interface Props {
  product: any;
  uiTranslations: Record<string, string>;
  specialtyTranslations: Record<string, string>;
  currentUrl: string;
}

export default function ProductSection({ product, uiTranslations, specialtyTranslations, currentUrl }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(product.heroImageUrl);

  const images = [
    product.heroImageUrl,
    ...(product.gallery?.map((i: any) => i.url) || [])
  ];

  // Translation helpers moved inside Client Component
  const t = (key: string, fallback: string) => uiTranslations[key] || fallback;
  const tGamme = (val: string) => uiTranslations[`ui.gamme.${val?.toLowerCase()}`] || val;
  const tSpecialty = (val: string) => specialtyTranslations[`specialty.${val?.toLowerCase()}`] || val;

  const getAlt = (url: string) => {
    if (url === product.heroImageUrl) return product.heroImageAlt || product.name;
    const found = product.gallery?.find((img: any) => img.url === url);
    return found?.alt || `${product.name} - ${t('ui.galleryImage', 'view')}`;
  };

  const navigate = (dir: number) => {
    const index = images.indexOf(activeImage);
    const next = (index + dir + images.length) % images.length;
    setActiveImage(images[next]);
  };

  const startX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(delta) < 50) return;
    delta > 0 ? navigate(-1) : navigate(1);
  };

  // Modern keyboard navigation for active image
  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, activeImage]);

  // JSON-LD for SEO - Enhanced
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: images,
    description: product.metaDescription || product.shortDescription || product.fullDescription || '',
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: product.brand?.name || 'Medical Devices'
    },
    offers: {
      "@type": "Offer",
      url: currentUrl,
      priceCurrency: "EUR",
      price: "0",
      availability: "https://schema.org/InStock"
    }
  };

  return (
    <section
      itemScope
      itemType="https://schema.org/Product"
      className="py-12 bg-white"
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 items-start">

          {/* Image Gallery */}
          <div className="lg:col-span-1 mb-10 lg:mb-0">
            <div
              className="group relative aspect-[1/1] bg-slate-50 rounded-2xl overflow-hidden cursor-zoom-in shadow-sm hover:shadow-md transition-all duration-500"
              onClick={() => { setActiveImage(product.heroImageUrl); setIsModalOpen(true); }}
            >
              <Image
                src={product.heroImageUrl}
                alt={product.heroImageAlt || product.name}
                fill
                fetchPriority="high"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 40vw, 33vw"
                itemProp="image"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
            </div>

            {product.gallery?.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-6">
                {product.gallery.map((image: any) => (
                  <button
                    key={image.id}
                    onClick={() => { setActiveImage(image.url); setIsModalOpen(true); }}
                    className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                      activeImage === image.url ? 'border-[#02445b] shadow-sm' : 'border-transparent hover:border-slate-300'
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt || `${product.name} gallery`}
                      fill
                      sizes="(max-width: 768px) 20vw, 10vw"
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:col-span-1">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {product.gamme && (
                <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-[#02445b] bg-[#02445b]/10 border border-[#02445b]/20">
                  {tGamme(product.gamme)}
                </span>
              )}
              {product.specialty && (
                <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-100">
                  {tSpecialty(product.specialty)}
                </span>
              )}
            </div>

            <h1 itemProp="name" className="text-4xl md:text-5xl font-extrabold text-[#02445b] tracking-tight mb-4">
              {product.name}
            </h1>

            {product.brand && (
              <div itemProp="brand" itemScope itemType="https://schema.org/Brand" className="mb-8">
                <p className="text-xl text-slate-500 font-medium">
                  {t('ui.by', 'by')}{' '}
                  <Link 
                    href={`/brands/${product.brand.slug}`} 
                    className="text-[#02445b] hover:text-[#0a668a] transition-colors underline underline-offset-8 decoration-slate-200 hover:decoration-[#02445b] font-bold"
                    itemProp="url"
                  >
                    <span itemProp="name">{product.brand.name}</span>
                  </Link>
                </p>
              </div>
            )}

            <div className="space-y-8">
              {product.shortDescription && (
                <p itemProp="description" className="text-xl leading-relaxed text-slate-600 font-light">
                  {product.shortDescription}
                </p>
              )}

              {product.fullDescription && (
                <div className="prose prose-slate max-w-none text-slate-700 bg-slate-50/50 p-8 rounded-3xl border border-slate-100 shadow-sm transition-all hover:bg-slate-50">
                  <p className="whitespace-pre-line leading-relaxed">{product.fullDescription}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modern Premium Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        closeLabel={t('ui.closeModal', 'Close modal')}
      >
        <div className="relative group flex flex-col items-center justify-center h-full max-h-[90vh]">
          <div className="relative w-full aspect-[4/3] md:aspect-auto md:h-[75vh] flex items-center justify-center bg-white/5 rounded-2xl overflow-hidden">
            <Image
              src={activeImage}
              alt={getAlt(activeImage)}
              fill
              sizes="100vw"
              priority
              className="object-contain p-4 md:p-8 animate-in fade-in zoom-in duration-500"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            />
            
            {/* Desktop Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); navigate(-1); }} 
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all transform hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100 focus:opacity-100"
                  aria-label={t('ui.prevImage', 'Previous image')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); navigate(1); }} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all transform hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100 focus:opacity-100"
                  aria-label={t('ui.nextImage', 'Next image')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
 
          <div className="mt-6 text-center space-y-2">
            <div className="inline-flex px-4 py-1 bg-white/10 backdrop-blur-md rounded-full text-white/80 text-sm font-medium border border-white/10">
              {images.indexOf(activeImage) + 1} / {images.length}
            </div>
            <p className="text-white/90 text-xl font-medium tracking-wide max-w-2xl px-4 line-clamp-2">
              {getAlt(activeImage)}
            </p>
          </div>
        </div>
      </Modal>
    </section>
  );
}

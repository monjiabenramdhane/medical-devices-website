'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
} from 'lucide-react';
import type { HeroSlide } from '@/types';

interface HeroCarouselProps {
  slides: HeroSlide[];
}

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
  };

  const toggleAutoplay = () => {
    setIsAutoPlaying((prev) => !prev);
  };

  if (!slides.length) return null;

  const currentSlide = slides[currentIndex];

  return (
    <section
      className="relative bg-[#c8e6ee]/70 overflow-hidden"
      aria-label="Hero carousel"
      aria-roledescription="carousel"
    >
      <div className="relative min-h-[500px] lg:min-h-[600px] flex items-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:px-8 lg:py-0 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            {/* TEXT + CONTROLS */}
            <div className="text-left z-10">
              {currentSlide.subtitle && (
                <p className="text-[#02445b] font-semibold text-sm uppercase mb-2">
                  {currentSlide.subtitle}
                </p>
              )}

              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-[#02445b] mb-4">
                {currentSlide.title}
              </h1>

              <p className="text-lg text-gray-600 mb-6 max-w-2xl">
                {currentSlide.description}
              </p>

              {currentSlide.ctaText && currentSlide.ctaLink && (
                <Link
                  href={currentSlide.ctaLink}
                  className="inline-flex items-center px-6 py-3 mb-10
                             rounded-3xl bg-[#02445b] text-white font-medium
                             hover:bg-[#02445b]/90 transition-colors shadow-lg"
                >
                  {currentSlide.ctaText}
                </Link>
              )}

              {/* ✅ CONTROLS ROW */}
              {slides.length > 1 && (
                <div className="flex items-center gap-4">
                  {/* Pagination */}
                  <div className="flex items-center gap-2">
                    {slides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === currentIndex
                            ? 'bg-[#02445b] w-6'
                            : 'bg-[#02445b]/40 hover:bg-[#02445b]'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                        aria-current={index === currentIndex}
                      />
                    ))}
                  </div>
                  {/* Play / Pause */}
                  <button
                    onClick={toggleAutoplay}
                    className="flex items-center gap-2 p-1 bg-white/50 backdrop-blur-sm rounded-full hover:bg-white transition shadow-sm"
                    aria-label={isAutoPlaying ? 'Pause autoplay' : 'Play autoplay'}
                  >
                    {isAutoPlaying ? (
                      <Pause className="w-4 h-4 text-[#02445b]" />
                    ) : (
                      <Play className="w-4 h-4 text-[#02445b]" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* IMAGE */}
            <div className="relative h-64 lg:h-[500px] xl:h-[600px] w-full">
              {slides.map((slide, index) => (
                <div 
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentIndex ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <Image
                    src={slide.imageUrl}
                    alt={slide.imageAlt || slide.title}
                    fill
                    priority={index === 0}
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ARROWS */}
        {slides.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20
                         bg-white/80 p-3 rounded-full shadow-lg hover:bg-white transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6 text-[#02445b]" />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20
                         bg-white/80 p-3 rounded-full shadow-lg hover:bg-white transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6 text-[#02445b]" />
            </button>
          </>
        )}
      </div>
    </section>
  );
}

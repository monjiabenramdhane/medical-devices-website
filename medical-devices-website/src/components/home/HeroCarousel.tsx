'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
      className="relative bg-gray-100 overflow-hidden"
      aria-label="Hero carousel"
      aria-roledescription="carousel"
    >
      <div className="relative h-[500px] lg:h-[600px]">
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              
              {/* TEXT + CONTROLS */}
              <div className="text-left">
                {currentSlide.subtitle && (
                  <p className="text-[#193660] font-semibold text-sm uppercase mb-2">
                    {currentSlide.subtitle}
                  </p>
                )}

                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4">
                  {currentSlide.title}
                </h1>

                <p className="text-lg text-gray-600 mb-6 max-w-2xl">
                  {currentSlide.description}
                </p>

                {currentSlide.ctaText && currentSlide.ctaLink && (
                  <Link
                    href={currentSlide.ctaLink}
                    className="inline-flex items-center px-5 py-2 mb-10
                               rounded-3xl bg-[#193660] text-white font-medium
                               hover:bg-[#193660]/90 transition-colors"
                  >
                    {currentSlide.ctaText}
                  </Link>
                )}

                {/* ✅ CONTROLS ROW */}
                {slides.length > 1 && (
                  <div className="flex items-center gap-2">
                    {/* Pagination */}
                    <div className="flex items-center gap-2">
                      {slides.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToSlide(index)}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            index === currentIndex
                              ? 'bg-[#193660]'
                              : 'bg-[#193660]/40 hover:bg-[#193660] w-2 h-2'
                          }`}
                          aria-label={`Go to slide ${index + 1}`}
                          aria-current={index === currentIndex}
                        />
                      ))}
                    </div>
                    {/* Play / Pause */}
                    <button
                      onClick={toggleAutoplay}
                      className="flex items-center gap-2 bg-transparent rounded-full transition"
                      aria-label={isAutoPlaying ? 'Pause autoplay' : 'Play autoplay'}
                    >
                      {isAutoPlaying ? (
                        <Pause className="w-5 h-5 text-[#193660]" />
                      ) : (
                        <Play className="w-5 h-5 text-[#193660]" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* IMAGE */}
              <div className="relative h-64 lg:h-[600px]">
                <img
                  src={currentSlide.imageUrl}
                  alt={currentSlide.imageAlt}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ARROWS (optional – still centered vertically) */}
        {slides.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2
                         bg-white/80 p-2 rounded-full shadow hover:bg-white"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2
                         bg-white/80 p-2 rounded-full shadow hover:bg-white"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>
    </section>
  );
}
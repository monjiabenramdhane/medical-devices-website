'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

  if (!slides || slides.length === 0) {
    return null;
  }

  const currentSlide = slides[currentIndex];

  return (
    <section
      className="relative bg-gray-100 overflow-hidden"
      aria-label="Hero carousel"
      aria-roledescription="carousel"
    >
      <div className="relative h-[500px] lg:h-[600px]">
        {/* Slide Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Text Content */}
              <div className="text-left">
                {currentSlide.subtitle && (
                  <p className="text-blue-600 font-semibold text-sm uppercase tracking-wide mb-2">
                    {currentSlide.subtitle}
                  </p>
                )}
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4">
                  {currentSlide.title}
                </h1>
                <p className="text-lg text-gray-600 mb-8 max-w-2xl">
                  {currentSlide.description}
                </p>
                {currentSlide.ctaText && currentSlide.ctaLink && (
                  <Link
                    href={currentSlide.ctaLink}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    {currentSlide.ctaText}
                  </Link>
                )}
              </div>

              {/* Image */}
              <div className="relative h-64 lg:h-96">
                <img
                  src={currentSlide.imageUrl}
                  alt={currentSlide.imageAlt}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {slides.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors z-10"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6 text-gray-900" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors z-10"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6 text-gray-900" />
            </button>
          </>
        )}

        {/* Indicators */}
        {slides.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex
                    ? 'bg-blue-600'
                    : 'bg-white/60 hover:bg-white'
                }`}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === currentIndex}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
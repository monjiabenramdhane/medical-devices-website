import { getLocale } from '@/lib/i18n/locale-resolver';
import { getLocalizedHeroSlides } from '@/lib/i18n/localized-hero-service';
import { HeroCarousel } from './HeroCarousel';

export async function HeroSection() {
  const locale = await getLocale();
  const heroSlides = await getLocalizedHeroSlides(locale);

  if (!heroSlides || heroSlides.length === 0) return null;

  return <HeroCarousel slides={heroSlides} />;
}

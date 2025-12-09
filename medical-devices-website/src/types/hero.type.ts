export interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string | null;
  description: string;
  ctaText?: string | null;
  ctaLink?: string | null;
  imageUrl: string;
  imageAlt: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateHeroSlideInput {
  title: string;
  subtitle?: string;
  description: string;
  ctaText?: string;
  ctaLink?: string;
  imageUrl: string;
  imageAlt: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateHeroSlideInput extends Partial<CreateHeroSlideInput> {}
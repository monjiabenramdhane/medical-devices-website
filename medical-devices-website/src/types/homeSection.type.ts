
import { Product } from './product.type';
import { Brand } from './brand.type';

export interface HomeSection {
  id: string;
  sectionKey: string;
  title: string;
  subtitle?: string | null;
  content: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  products?: Product[];
  brands?: Brand[];
}

export interface CreateHomeSectionInput {
  sectionKey: string;
  title: string;
  subtitle?: string;
  content: string;
  imageUrl?: string;
  imageAlt?: string;
  ctaText?: string;
  ctaLink?: string;
  order?: number;
  isActive?: boolean;
  productIds?: string[];
  brandIds?: string[];
}

export interface UpdateHomeSectionInput extends Partial<CreateHomeSectionInput> { }
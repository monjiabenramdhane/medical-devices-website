import { Brand } from "./brand.type";
import { EquipmentType } from "./equipmentType.type";
import { Series } from "./series.type";
import { Subcategory } from "./subcategory.type";

export const Gamme = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW'
} as const;

export type Gamme = (typeof Gamme)[keyof typeof Gamme];

export const Specialty = {
  CARDIOLOGY: 'CARDIOLOGY',
  GENERALIST: 'GENERALIST',
  ORTHOPEDIC: 'ORTHOPEDIC',
  NEUROLOGY: 'NEUROLOGY',
  OBSTETRICS: 'OBSTETRICS',
  EMERGENCY: 'EMERGENCY',
  PEDIATRIC: 'PEDIATRIC',
  OTHER: 'OTHER'
} as const;

export type Specialty = (typeof Specialty)[keyof typeof Specialty];

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  order: number;
  productId: string;
  createdAt: Date;
}

export interface ProductSection {
  id: string;
  title: string;
  content: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
  order: number;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductSpecification {
  id: string;
  category: string;
  name: string;
  value: string;
  order: number;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  fullDescription?: string | null;
  gamme?: Gamme | null;
  specialty?: Specialty | null;
  heroImageUrl: string;
  heroImageAlt: string;
  isFeatured: boolean;
  isActive: boolean;
  order: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  brandId: string;
  brand?: Brand;
  equipmentTypeId?: string | null;
  equipmentType?: EquipmentType | null;
  subcategoryId?: string | null;
  subcategory?: Subcategory | null;
  seriesId?: string | null;
  series?: Series | null;
  gallery?: ProductImage[];
  sections?: ProductSection[];
  specifications?: ProductSpecification[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductInput {
  name: string;
  slug: string;
  shortDescription?: string;
  fullDescription?: string;
  gamme?: Gamme;
  specialty?: Specialty;
  heroImageUrl: string;
  heroImageAlt: string;
  isFeatured?: boolean;
  isActive?: boolean;
  order?: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  brandId: string;
  equipmentTypeId?: string;
  subcategoryId?: string;
  seriesId?: string;
}

export interface UpdateProductInput extends Partial<CreateProductInput> { }
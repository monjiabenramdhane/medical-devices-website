import { Product } from "./product.type";
import { Subcategory } from "./subcategory.type";

export interface Series {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  order: number;
  isActive: boolean;
  subcategoryId?: string | null;
  subcategory?: Subcategory | null;
  products?: Product[];
  createdAt?: Date;
  updatedAt?: Date | null;
}

export interface CreateSeriesInput {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
  order?: number;
  isActive?: boolean;
  subcategoryId?: string;
}

export interface UpdateSeriesInput extends Partial<CreateSeriesInput> { }
import { Brand } from "./brand.type";
import { Subcategory } from "./subcategory.type";

export interface EquipmentType {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  iconUrl?: string | null;
  order: number;
  isActive: boolean;
  brandId: string;
  brand?: Brand;
  subcategories?: Subcategory[];
  createdAt?: Date;
  updatedAt?: Date | null;
}

export interface CreateEquipmentTypeInput {
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  order?: number;
  isActive?: boolean;
  brandId: string;
}

export interface UpdateEquipmentTypeInput extends Partial<CreateEquipmentTypeInput> { }
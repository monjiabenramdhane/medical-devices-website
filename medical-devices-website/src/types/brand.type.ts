import { EquipmentType } from "./equipmentType.type";

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl: string;
  logoAlt: string;
  websiteUrl?: string | null;
  order: number;
  isActive: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  createdAt: Date;
  updatedAt: Date;
  equipmentTypes?: EquipmentType[];
}

export interface CreateBrandInput {
  name: string;
  slug: string;
  description?: string;
  logoUrl: string;
  logoAlt: string;
  websiteUrl?: string;
  order?: number;
  isActive?: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

export interface UpdateBrandInput extends Partial<CreateBrandInput> {}

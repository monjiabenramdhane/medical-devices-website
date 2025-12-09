import { EquipmentType } from "./equipmentType.type";
import { Series } from "./series.type";

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  order: number;
  isActive: boolean;
  equipmentTypeId: string;
  equipmentType?: EquipmentType;
  series?: Series[];
  createdAt?: Date;
  updatedAt?: Date | null;
}

export interface CreateSubcategoryInput {
  name: string;
  slug: string;
  description?: string;
  order?: number;
  isActive?: boolean;
  equipmentTypeId: string;
}

export interface UpdateSubcategoryInput extends Partial<CreateSubcategoryInput> { }
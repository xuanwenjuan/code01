import { CategoryStatus } from '../common/enums';

export interface CategoryFilterParams {
  name?: string;
  code?: string;
  status?: CategoryStatus;
  parentId?: number | null;
  page?: number;
  pageSize?: number;
}

export interface CreateCategoryDto {
  name: string;
  code: string;
  parentId?: number | null;
  sort?: number;
  icon?: string;
  description?: string;
  status?: CategoryStatus;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

export interface CategoryTree {
  id: number;
  name: string;
  code: string;
  parentId: number | null;
  level: number;
  sort: number;
  icon?: string;
  description?: string;
  status: CategoryStatus;
  children: CategoryTree[];
}

export interface CategoryPath {
  id: number;
  name: string;
  code: string;
}

export interface CategoryStats {
  id: number;
  name: string;
  code: string;
  status: CategoryStatus;
  equipmentCount: number;
}
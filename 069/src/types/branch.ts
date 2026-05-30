import { PaginationParams, DateRangeParams } from './common';

export enum BranchType {
  HUB = 'hub',
  DELIVERY = 'delivery',
  TRANSFER = 'transfer'
}

export enum BranchStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CLOSED = 'closed'
}

export interface BranchBase {
  name: string;
  code: string;
  type: BranchType;
  parentId?: number;
  address: string;
  province: string;
  city: string;
  district?: string;
  contactPerson: string;
  contactPhone: string;
  sortOrder?: number;
  remark?: string;
}

export interface Branch extends BranchBase {
  id: number;
  status: BranchStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface BranchCreateInput extends Omit<BranchBase, 'id' | 'status' | 'createdAt' | 'updatedAt'> {}

export interface BranchUpdateInput extends Partial<BranchCreateInput> {
  status?: BranchStatus;
}

export interface BranchListParams extends PaginationParams {
  type?: BranchType;
  status?: BranchStatus;
  keyword?: string;
  includeChildren?: boolean;
}

export interface BranchTreeParams {
  type?: BranchType;
  status?: BranchStatus;
  parentId?: number;
  keyword?: string;
  includeInactive?: boolean;
}

export interface BranchStats {
  childCount: number;
  vehicleCount: number;
  orderCount: number;
  pendingOrderCount: number;
  status: BranchStatus;
  name: string;
}

export interface BranchTreeNode extends Branch {
  children: BranchTreeNode[];
  level: number;
  hasChildren: boolean;
}

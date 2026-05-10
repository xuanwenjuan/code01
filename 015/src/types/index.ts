import {
  SUPPLY_CATEGORIES,
  CONDITION_LEVELS,
  OPERATION_TYPES,
  SUPPLY_STATUS,
  CATEGORIES_NEED_USAGE_YEARS,
  DEFAULT_CLUBS
} from './constants';

export type SupplyCategory = typeof SUPPLY_CATEGORIES[number];
export type ConditionLevel = typeof CONDITION_LEVELS[number];
export type OperationType = typeof OPERATION_TYPES[number];
export type SupplyStatus = typeof SUPPLY_STATUS[number];
export type CategoryNeedsUsageYears = typeof CATEGORIES_NEED_USAGE_YEARS[number];
export type ClubName = typeof DEFAULT_CLUBS[number];

export interface Category {
  readonly id: string;
  readonly name: SupplyCategory;
  readonly description: string;
  readonly createdAt: string;
}

export interface Supply {
  readonly id: string;
  readonly name: string;
  readonly manager: string;
  readonly category: SupplyCategory;
  readonly storageYear: number;
  readonly stockQuantity: number;
  readonly applicableClubs: ClubName[];
  readonly conditionLevel: ConditionLevel;
  readonly remainingUsageYears?: number;
  readonly borrowableQuantity: number;
  readonly status: SupplyStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface OperationLog {
  readonly id: string;
  readonly operationTime: string;
  readonly operator: string;
  readonly content: string;
  readonly supplyId: string;
  readonly supplyName: string;
  readonly quantityChange: number;
  readonly stockBefore: number;
  readonly stockAfter: number;
  readonly borrowableBefore: number;
  readonly borrowableAfter: number;
  readonly operationType: OperationType;
  readonly notes?: string;
}

export interface FilterConditions {
  readonly category?: SupplyCategory;
  readonly minStock?: number;
  readonly maxStock?: number;
  readonly storageYear?: number;
  readonly conditionLevel?: ConditionLevel;
  readonly minRemainingYears?: number;
  readonly maxRemainingYears?: number;
  readonly keyword?: string;
  readonly status?: SupplyStatus;
}

export interface ToastMessage {
  readonly id: string;
  readonly type: 'success' | 'error' | 'info' | 'warning';
  readonly message: string;
}

export interface FormError {
  readonly field: string;
  readonly message: string;
}

export interface SupplyStats {
  readonly total: number;
  readonly totalStock: number;
  readonly borrowable: number;
  readonly byCategory: Record<SupplyCategory, number>;
  readonly ageingCount: number;
  readonly byCondition: Record<ConditionLevel, number>;
  readonly byStatus: Record<SupplyStatus, number>;
}

export interface AgeingWarning {
  readonly supply: Supply;
  readonly reasons: string[];
  readonly level: 'warning' | 'danger';
}

export type TabType = 'supplies' | 'category' | 'borrow' | 'logs';

export interface AppState {
  readonly activeTab: TabType;
  readonly lastRefreshTime: string;
}

export interface BorrowOperation {
  readonly supplyId: string;
  readonly quantity: number;
  readonly operator: string;
  readonly notes?: string;
}

export interface ReturnOperation {
  readonly supplyId: string;
  readonly quantity: number;
  readonly operator: string;
  readonly newConditionLevel: ConditionLevel;
  readonly notes?: string;
}

export interface ScrapOperation {
  readonly supplyId: string;
  readonly quantity: number;
  readonly operator: string;
  readonly notes?: string;
}

export type StorageOperationResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
};

export interface ValidationRule {
  readonly field: string;
  readonly value: unknown;
  readonly rules: {
    readonly required?: boolean;
    readonly minLength?: number;
    readonly maxLength?: number;
    readonly min?: number;
    readonly max?: number;
    readonly pattern?: RegExp;
    readonly custom?: (value: unknown) => string | null;
  };
}

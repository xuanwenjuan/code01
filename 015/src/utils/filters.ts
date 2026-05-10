import {
  Supply,
  FilterConditions,
  AgeingWarning,
  SupplyStats,
  SupplyCategory,
  ConditionLevel,
  SupplyStatus
} from '../types';
import {
  AGEING_WARNING_THRESHOLDS,
  SUPPLY_CATEGORIES,
  CONDITION_LEVELS,
  SUPPLY_STATUS
} from '../types/constants';

export function filterSupplies(supplies: Supply[], conditions: FilterConditions): Supply[] {
  return supplies.filter((supply) => {
    if (conditions.status && supply.status !== conditions.status) {
      return false;
    }

    if (conditions.category && supply.category !== conditions.category) {
      return false;
    }

    if (conditions.minStock !== undefined && supply.stockQuantity < conditions.minStock) {
      return false;
    }

    if (conditions.maxStock !== undefined && supply.stockQuantity > conditions.maxStock) {
      return false;
    }

    if (conditions.storageYear && supply.storageYear !== conditions.storageYear) {
      return false;
    }

    if (conditions.conditionLevel && supply.conditionLevel !== conditions.conditionLevel) {
      return false;
    }

    if (conditions.minRemainingYears !== undefined) {
      if (supply.remainingUsageYears === undefined || supply.remainingUsageYears < conditions.minRemainingYears) {
        return false;
      }
    }

    if (conditions.maxRemainingYears !== undefined) {
      if (supply.remainingUsageYears !== undefined && supply.remainingUsageYears > conditions.maxRemainingYears) {
        return false;
      }
    }

    if (conditions.keyword) {
      const keyword = conditions.keyword.toLowerCase().trim();
      const searchFields = [
        supply.name,
        supply.manager,
        ...supply.applicableClubs
      ].join(' ').toLowerCase();
      if (!searchFields.includes(keyword)) {
        return false;
      }
    }

    return true;
  });
}

export function checkAgeingWarnings(supply: Supply): AgeingWarning | null {
  const reasons: string[] = [];
  let level: 'warning' | 'danger' = 'warning';

  if (supply.remainingUsageYears !== undefined) {
    if (supply.remainingUsageYears <= 0) {
      reasons.push('使用年限已到期');
      level = 'danger';
    } else if (supply.remainingUsageYears <= AGEING_WARNING_THRESHOLDS.REMAINING_YEARS) {
      reasons.push(`使用年限剩余 ${supply.remainingUsageYears} 年`);
    }
  }

  if (supply.conditionLevel === AGEING_WARNING_THRESHOLDS.CONDITION_LEVEL) {
    reasons.push('完好等级较差');
    level = 'danger';
  }

  const currentYear = new Date().getFullYear();
  const storageYears = currentYear - supply.storageYear;
  if (storageYears >= AGEING_WARNING_THRESHOLDS.STORAGE_YEARS) {
    reasons.push(`入库已 ${storageYears} 年`);
    if (storageYears >= 10) {
      level = 'danger';
    }
  }

  if (reasons.length > 0) {
    return {
      supply,
      reasons,
      level
    };
  }

  return null;
}

export function getAgeingWarnings(supplies: Supply[]): AgeingWarning[] {
  return supplies
    .map(supply => checkAgeingWarnings(supply))
    .filter((warning): warning is AgeingWarning => warning !== null);
}

export function getDangerWarnings(supplies: Supply[]): AgeingWarning[] {
  return getAgeingWarnings(supplies).filter(w => w.level === 'danger');
}

export function getStats(supplies: Supply[]): SupplyStats {
  const byCategory = {} as Record<SupplyCategory, number>;
  const byCondition = {} as Record<ConditionLevel, number>;
  const byStatus = {} as Record<SupplyStatus, number>;

  SUPPLY_CATEGORIES.forEach(cat => { byCategory[cat] = 0; });
  CONDITION_LEVELS.forEach(level => { byCondition[level] = 0; });
  SUPPLY_STATUS.forEach(status => { byStatus[status] = 0; });

  let totalStock = 0;
  let borrowable = 0;

  supplies.forEach((s) => {
    byCategory[s.category]++;
    byCondition[s.conditionLevel]++;
    byStatus[s.status]++;
    totalStock += s.stockQuantity;
    borrowable += s.borrowableQuantity;
  });

  const ageingCount = getAgeingWarnings(supplies).length;

  return {
    total: supplies.length,
    totalStock,
    borrowable,
    byCategory,
    ageingCount,
    byCondition,
    byStatus
  };
}

export function sortSupplies(supplies: Supply[], sortBy: keyof Supply, ascending: boolean = true): Supply[] {
  return [...supplies].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return ascending ? aVal - bVal : bVal - aVal;
    }

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return ascending ? aVal.localeCompare(bVal, 'zh-CN') : bVal.localeCompare(aVal, 'zh-CN');
    }

    return 0;
  });
}

export function getUniqueStorageYears(supplies: Supply[]): number[] {
  const years = new Set(supplies.map(s => s.storageYear));
  return Array.from(years).sort((a, b) => b - a);
}

export function searchSupplies(supplies: Supply[], keyword: string): Supply[] {
  if (!keyword.trim()) return supplies;
  return filterSupplies(supplies, { keyword });
}

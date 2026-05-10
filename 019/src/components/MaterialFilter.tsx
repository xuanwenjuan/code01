import React from 'react';
import { FilterParams, MaterialCategory } from '../types';

interface MaterialFilterProps {
  filters: FilterParams;
  categories: MaterialCategory[];
  onChange: (filters: FilterParams) => void;
  onReset: () => void;
}

export const MaterialFilter: React.FC<MaterialFilterProps> = ({
  filters,
  categories,
  onChange,
  onReset,
}) => {
  const handleChange = (key: keyof FilterParams, value: string | number | boolean | undefined) => {
    const newFilters = { ...filters };
    if (value === '' || value === undefined) {
      delete newFilters[key];
    } else {
      (newFilters as Record<string, unknown>)[key] = value;
    }
    onChange(newFilters);
  };

  return (
    <div className="filter-bar">
      <div className="filter-item">
        <label className="filter-label">分类</label>
        <select
          className="filter-select"
          value={filters.category || ''}
          onChange={(e) => handleChange('category', e.target.value as MaterialCategory | '')}
        >
          <option value="">全部</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-item">
        <label className="filter-label">最小库存</label>
        <input
          type="number"
          className="filter-input"
          value={filters.minStock ?? ''}
          onChange={(e) =>
            handleChange('minStock', e.target.value === '' ? undefined : parseInt(e.target.value))
          }
          placeholder="最小值"
          min="0"
        />
      </div>

      <div className="filter-item">
        <label className="filter-label">最大库存</label>
        <input
          type="number"
          className="filter-input"
          value={filters.maxStock ?? ''}
          onChange={(e) =>
            handleChange('maxStock', e.target.value === '' ? undefined : parseInt(e.target.value))
          }
          placeholder="最大值"
          min="0"
        />
      </div>

      <div className="filter-item">
        <label className="filter-label">入库年份</label>
        <select
          className="filter-select"
          value={filters.importYear || ''}
          onChange={(e) =>
            handleChange('importYear', e.target.value === '' ? '' : parseInt(e.target.value))
          }
        >
          <option value="">全部</option>
          {[2026, 2025, 2024, 2023, 2022].map((year) => (
            <option key={year} value={year}>
              {year}年
            </option>
          ))}
        </select>
      </div>

      <div className="filter-item">
        <label className="filter-label">最小纯度(%)</label>
        <input
          type="number"
          className="filter-input"
          value={filters.minPurity ?? ''}
          onChange={(e) =>
            handleChange('minPurity', e.target.value === '' ? undefined : parseInt(e.target.value))
          }
          placeholder="0-100"
          min="0"
          max="100"
        />
      </div>

      <div className="filter-item">
        <label className="filter-label">最大纯度(%)</label>
        <input
          type="number"
          className="filter-input"
          value={filters.maxPurity ?? ''}
          onChange={(e) =>
            handleChange('maxPurity', e.target.value === '' ? undefined : parseInt(e.target.value))
          }
          placeholder="0-100"
          min="0"
          max="100"
        />
      </div>

      <div className="filter-item">
        <label className="filter-label">临期提醒</label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <input
            type="checkbox"
            checked={filters.expiryWarning || false}
            onChange={(e) => handleChange('expiryWarning', e.target.checked)}
          />
          <span>仅显示临期</span>
        </label>
      </div>

      <div className="filter-item" style={{ justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary btn-sm" onClick={onReset}>
          重置筛选
        </button>
      </div>
    </div>
  );
};

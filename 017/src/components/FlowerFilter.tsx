import React from 'react';
import { FilterParams, FreshnessLevel, FlowerStatus } from '@/types';
import { useApp } from '@/context/AppContext';
import FormItem from './common/FormItem';
import Input from './common/Input';
import Select from './common/Select';

interface FlowerFilterProps {
  filters: FilterParams;
  onFilterChange: (filters: FilterParams) => void;
  onReset: () => void;
}

const FlowerFilter: React.FC<FlowerFilterProps> = ({ filters, onFilterChange, onReset }) => {
  const { categories } = useApp();

  const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }));
  const freshnessOptions = Object.values(FreshnessLevel).map(f => ({ value: f, label: f }));
  const statusOptions = Object.values(FlowerStatus).map(s => ({ value: s, label: s }));

  return (
    <div className="filter-section">
      <div className="filter-grid">
        <FormItem label="搜索">
          <Input
            value={filters.searchKeyword || ''}
            onChange={(v) => onFilterChange({ ...filters, searchKeyword: v || undefined })}
            placeholder="搜索花卉名称、产地..."
          />
        </FormItem>
        <FormItem label="分类">
          <Select
            value={filters.categoryId || ''}
            onChange={(v) => onFilterChange({ ...filters, categoryId: v || undefined })}
            options={categoryOptions}
            placeholder="全部分类"
          />
        </FormItem>
        <FormItem label="状态">
          <Select
            value={filters.status || ''}
            onChange={(v) => onFilterChange({ ...filters, status: (v as FlowerStatus) || undefined })}
            options={statusOptions}
            placeholder="全部状态"
          />
        </FormItem>
        <FormItem label="库存">
          <div className="input-range">
            <Input
              type="number"
              value={filters.stockMin ?? ''}
              onChange={(v) => onFilterChange({ ...filters, stockMin: v ? parseInt(v) : undefined })}
              placeholder="最小"
              min={0}
            />
            <span className="range-separator">-</span>
            <Input
              type="number"
              value={filters.stockMax ?? ''}
              onChange={(v) => onFilterChange({ ...filters, stockMax: v ? parseInt(v) : undefined })}
              placeholder="最大"
              min={0}
            />
          </div>
        </FormItem>
        <FormItem label="入库年限">
          <div className="input-range">
            <Input
              type="number"
              value={filters.storageYearsMin ?? ''}
              onChange={(v) => onFilterChange({ ...filters, storageYearsMin: v ? parseFloat(v) : undefined })}
              placeholder="最小"
              min={0}
            />
            <span className="range-separator">-</span>
            <Input
              type="number"
              value={filters.storageYearsMax ?? ''}
              onChange={(v) => onFilterChange({ ...filters, storageYearsMax: v ? parseFloat(v) : undefined })}
              placeholder="最大"
              min={0}
            />
          </div>
        </FormItem>
        <FormItem label="新鲜度">
          <Select
            value={filters.freshness || ''}
            onChange={(v) => onFilterChange({ ...filters, freshness: (v as FreshnessLevel) || undefined })}
            options={freshnessOptions}
            placeholder="全部新鲜度"
          />
        </FormItem>
        <FormItem label="保鲜期剩余">
          <div className="input-range">
            <Input
              type="number"
              value={filters.shelfLifeRemainingMin ?? ''}
              onChange={(v) => onFilterChange({ ...filters, shelfLifeRemainingMin: v ? parseInt(v) : undefined })}
              placeholder="最小天数"
              min={0}
            />
            <span className="range-separator">-</span>
            <Input
              type="number"
              value={filters.shelfLifeRemainingMax ?? ''}
              onChange={(v) => onFilterChange({ ...filters, shelfLifeRemainingMax: v ? parseInt(v) : undefined })}
              placeholder="最大天数"
              min={0}
            />
          </div>
        </FormItem>
        <div className="filter-actions">
          <button className="btn btn-secondary" onClick={onReset}>重置筛选</button>
        </div>
      </div>
    </div>
  );
};

export default FlowerFilter;

import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Flower, FreshnessLevel, MAX_PRICE, MAX_STORAGE_YEARS, MAX_STOCK_QUANTITY, MAX_SHELF_LIFE_DAYS } from '@/types';
import { useApp } from '@/context/AppContext';
import { 
  validatePrice, 
  validateStorageYears, 
  validateAndSanitizeStockQuantity,
  validateShelfLife 
} from '@/utils/helpers';
import FormItem from './common/FormItem';
import Input from './common/Input';
import Select from './common/Select';

export interface FlowerFormRef {
  handleSubmit: () => boolean;
}

interface FlowerFormProps {
  flower?: Flower;
  onSubmit: (data: Omit<Flower, 'id' | 'createdAt' | 'updatedAt' | 'isExpired'>) => void;
}

interface FormState {
  name: string;
  origin: string;
  categoryId: string;
  storageYears: string;
  stock: string;
  price: string;
  freshness: string;
  shelfLifeRemaining: string;
}

interface FormErrors {
  name?: string;
  origin?: string;
  categoryId?: string;
  storageYears?: string;
  stock?: string;
  price?: string;
  freshness?: string;
  shelfLifeRemaining?: string;
}

const FlowerForm = forwardRef<FlowerFormRef, FlowerFormProps>(({ flower, onSubmit }, ref) => {
  const { categories } = useApp();
  
  const [formState, setFormState] = useState<FormState>({
    name: '',
    origin: '',
    categoryId: '',
    storageYears: '',
    stock: '',
    price: '',
    freshness: '',
    shelfLifeRemaining: ''
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (flower) {
      setFormState({
        name: flower.name,
        origin: flower.origin,
        categoryId: flower.categoryId,
        storageYears: flower.storageYears.toString(),
        stock: flower.stock.toString(),
        price: flower.price.toString(),
        freshness: flower.freshness,
        shelfLifeRemaining: flower.shelfLifeRemaining.toString()
      });
    } else {
      setFormState({
        name: '',
        origin: '',
        categoryId: '',
        storageYears: '',
        stock: '',
        price: '',
        freshness: '',
        shelfLifeRemaining: ''
      });
    }
  }, [flower]);

  const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }));
  const freshnessOptions = Object.values(FreshnessLevel).map(f => ({ value: f, label: f }));

  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};

    if (!formState.name.trim()) {
      errors.name = '请输入花卉名称';
    } else if (formState.name.length > 100) {
      errors.name = '花卉名称不能超过100个字符';
    }

    if (!formState.origin.trim()) {
      errors.origin = '请输入产地';
    } else if (formState.origin.length > 100) {
      errors.origin = '产地不能超过100个字符';
    }

    if (!formState.categoryId) {
      errors.categoryId = '请选择分类';
    }

    const storageYearsResult = validateStorageYears(formState.storageYears);
    if (!storageYearsResult.success) {
      errors.storageYears = storageYearsResult.message;
    }

    const stockResult = validateAndSanitizeStockQuantity(formState.stock, true);
    if (!stockResult.success) {
      errors.stock = stockResult.message;
    }

    const priceResult = validatePrice(formState.price);
    if (!priceResult.success) {
      errors.price = priceResult.message;
    }

    if (!formState.freshness) {
      errors.freshness = '请选择新鲜度';
    }

    const shelfLifeResult = validateShelfLife(formState.shelfLifeRemaining);
    if (!shelfLifeResult.success) {
      errors.shelfLifeRemaining = shelfLifeResult.message;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formState, flower]);

  const submitForm = useCallback((): boolean => {
    if (!validateForm()) return false;

    const category = categories.find(c => c.id === formState.categoryId);
    if (!category) return false;

    const storageYearsResult = validateStorageYears(formState.storageYears);
    const stockResult = validateAndSanitizeStockQuantity(formState.stock || '0');
    const priceResult = validatePrice(formState.price);
    const shelfLifeResult = validateShelfLife(formState.shelfLifeRemaining);

    if (!storageYearsResult.success || !stockResult.success || 
        !priceResult.success || !shelfLifeResult.success) {
      return false;
    }

    onSubmit({
      name: formState.name.trim(),
      origin: formState.origin.trim(),
      categoryId: formState.categoryId,
      categoryName: category.name,
      storageYears: storageYearsResult.data!,
      stock: flower ? parseInt(formState.stock) : stockResult.data!,
      price: priceResult.data!,
      freshness: formState.freshness as FreshnessLevel,
      shelfLifeRemaining: shelfLifeResult.data!
    });
    return true;
  }, [validateForm, categories, formState, flower, onSubmit]);

  useImperativeHandle(ref, () => ({
    handleSubmit: submitForm
  }), [submitForm]);

  return (
    <div className="form-grid">
      <FormItem label="花卉名称" required error={formErrors.name}>
        <Input
          value={formState.name}
          onChange={(v) => setFormState({ ...formState, name: v })}
          placeholder="请输入花卉名称"
        />
      </FormItem>
      <FormItem label="产地" required error={formErrors.origin}>
        <Input
          value={formState.origin}
          onChange={(v) => setFormState({ ...formState, origin: v })}
          placeholder="请输入产地"
        />
      </FormItem>
      <FormItem label="分类" required error={formErrors.categoryId}>
        <Select
          value={formState.categoryId}
          onChange={(v) => setFormState({ ...formState, categoryId: v })}
          options={categoryOptions}
          placeholder="请选择分类"
        />
      </FormItem>
      <FormItem label="入库年限（年）" required error={formErrors.storageYears}>
        <Input
          type="number"
          value={formState.storageYears}
          onChange={(v) => setFormState({ ...formState, storageYears: v })}
          placeholder="请输入入库年限"
          min={0}
        />
      </FormItem>
      <FormItem label="库存数量" required error={formErrors.stock}>
        <Input
          type="number"
          value={formState.stock}
          onChange={(v) => setFormState({ ...formState, stock: v })}
          placeholder="请输入库存数量"
          min={0}
        />
      </FormItem>
      <FormItem label="售价（元）" required error={formErrors.price}>
        <Input
          type="number"
          value={formState.price}
          onChange={(v) => setFormState({ ...formState, price: v })}
          placeholder="请输入售价"
          min={0}
        />
      </FormItem>
      <FormItem label="新鲜度" required error={formErrors.freshness}>
        <Select
          value={formState.freshness}
          onChange={(v) => setFormState({ ...formState, freshness: v })}
          options={freshnessOptions}
          placeholder="请选择新鲜度"
        />
      </FormItem>
      <FormItem label="保鲜期剩余（天）" required error={formErrors.shelfLifeRemaining}>
        <Input
          type="number"
          value={formState.shelfLifeRemaining}
          onChange={(v) => setFormState({ ...formState, shelfLifeRemaining: v })}
          placeholder="请输入保鲜期剩余天数"
          min={0}
        />
      </FormItem>
    </div>
  );
});

FlowerForm.displayName = 'FlowerForm';

export default FlowerForm;
import { Category, DEFAULT_CATEGORIES, StorageSchema } from '../types';

const STORAGE_KEY = 'store_categories';
const STORAGE_VERSION = 1;

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const readStorage = (): Category[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  
  try {
    const parsed = JSON.parse(data);
    
    if (parsed.version && Array.isArray(parsed.data)) {
      return parsed.data as Category[];
    }
    
    if (Array.isArray(parsed)) {
      return parsed as Category[];
    }
    
    return [];
  } catch {
    return [];
  }
};

const writeStorage = (categories: Category[]): void => {
  const schema: StorageSchema<Category[]> = {
    version: STORAGE_VERSION,
    data: categories,
    lastUpdated: new Date().toISOString()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schema));
};

export const getCategories = (): Category[] => {
  const existing = readStorage();
  if (existing.length > 0) {
    return existing;
  }
  
  const initialCategories: Category[] = DEFAULT_CATEGORIES.map((name, index): Category => ({
    id: `cat_${index + 1}`,
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));
  
  writeStorage(initialCategories);
  return initialCategories;
};

export const saveCategories = (categories: Category[]): void => {
  writeStorage(categories);
};

export const addCategory = (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Category => {
  const categories = getCategories();
  const newCategory: Category = {
    ...category,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  categories.push(newCategory);
  saveCategories(categories);
  return newCategory;
};

export const updateCategory = (id: string, updates: Partial<Category>): Category | null => {
  const categories = getCategories();
  const index = categories.findIndex((c): boolean => c.id === id);
  if (index === -1) return null;
  categories[index] = { 
    ...categories[index], 
    ...updates,
    updatedAt: new Date().toISOString()
  };
  saveCategories(categories);
  return categories[index];
};

export const deleteCategory = (id: string): boolean => {
  const categories = getCategories();
  const filtered = categories.filter((c): boolean => c.id !== id);
  if (filtered.length === categories.length) return false;
  saveCategories(filtered);
  return true;
};

export const getCategoryById = (id: string): Category | undefined => {
  const categories = getCategories();
  return categories.find((c): boolean => c.id === id);
};

export const getCategoryName = (id: string): string => {
  const category = getCategoryById(id);
  return category?.name || '未知分类';
};

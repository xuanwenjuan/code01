import { Category, Material, OperationLog, MaterialCategory } from '../types';

const CATEGORIES_KEY = 'coffee_shop_categories';
const MATERIALS_KEY = 'coffee_shop_materials';
const LOGS_KEY = 'coffee_shop_logs';

const defaultCategories: Category[] = [
  { id: '1', name: '咖啡豆', description: '各种咖啡豆及咖啡粉', createdAt: new Date().toISOString() },
  { id: '2', name: '奶品', description: '牛奶、奶油等乳制品', createdAt: new Date().toISOString() },
  { id: '3', name: '糖浆', description: '各种风味糖浆', createdAt: new Date().toISOString() },
  { id: '4', name: '器具', description: '咖啡制作器具', createdAt: new Date().toISOString() },
  { id: '5', name: '耗材', description: '一次性杯子、吸管等', createdAt: new Date().toISOString() },
];

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error(`Error reading from localStorage: ${key}`, error);
  }
  return defaultValue;
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error writing to localStorage: ${key}`, error);
  }
}

export function getCategories(): Category[] {
  const stored = getFromStorage<Category[]>(CATEGORIES_KEY, []);
  if (stored.length === 0) {
    saveToStorage(CATEGORIES_KEY, defaultCategories);
    return defaultCategories;
  }
  return stored;
}

export function saveCategories(categories: Category[]): void {
  saveToStorage(CATEGORIES_KEY, categories);
}

export function addCategory(category: Omit<Category, 'id' | 'createdAt'>): Category {
  const categories = getCategories();
  const newCategory: Category = {
    ...category,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  categories.push(newCategory);
  saveCategories(categories);
  return newCategory;
}

export function updateCategory(id: string, updates: Partial<Category>): Category | null {
  const categories = getCategories();
  const index = categories.findIndex((c) => c.id === id);
  if (index === -1) return null;
  categories[index] = { ...categories[index], ...updates };
  saveCategories(categories);
  return categories[index];
}

export function deleteCategory(id: string): boolean {
  const categories = getCategories();
  const index = categories.findIndex((c) => c.id === id);
  if (index === -1) return false;
  categories.splice(index, 1);
  saveCategories(categories);
  return true;
}

export function getMaterials(): Material[] {
  return getFromStorage<Material[]>(MATERIALS_KEY, []);
}

export function saveMaterials(materials: Material[]): void {
  saveToStorage(MATERIALS_KEY, materials);
}

export function addMaterial(material: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>): Material {
  const materials = getMaterials();
  const now = new Date().toISOString();
  const newMaterial: Material = {
    ...material,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
  materials.push(newMaterial);
  saveMaterials(materials);
  return newMaterial;
}

export function updateMaterial(id: string, updates: Partial<Material>): Material | null {
  const materials = getMaterials();
  const index = materials.findIndex((m) => m.id === id);
  if (index === -1) return null;
  materials[index] = {
    ...materials[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveMaterials(materials);
  return materials[index];
}

export function deleteMaterial(id: string): boolean {
  const materials = getMaterials();
  const index = materials.findIndex((m) => m.id === id);
  if (index === -1) return false;
  materials.splice(index, 1);
  saveMaterials(materials);
  return true;
}

export function getMaterialById(id: string): Material | undefined {
  const materials = getMaterials();
  return materials.find((m) => m.id === id);
}

export function getLogs(): OperationLog[] {
  return getFromStorage<OperationLog[]>(LOGS_KEY, []);
}

export function saveLogs(logs: OperationLog[]): void {
  saveToStorage(LOGS_KEY, logs);
}

export function addLog(log: Omit<OperationLog, 'id' | 'operationTime'>): OperationLog {
  const logs = getLogs();
  const newLog: OperationLog = {
    ...log,
    id: generateId(),
    operationTime: new Date().toISOString(),
  };
  logs.unshift(newLog);
  saveLogs(logs);
  return newLog;
}

export function getCategoryNames(): MaterialCategory[] {
  const categories = getCategories();
  return categories.map((c) => c.name);
}

export function getExpiringMaterials(days: number = 30): Material[] {
  const materials = getMaterials();
  const now = new Date();
  const warningDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  
  return materials.filter((m) => {
    const expiry = new Date(m.expiryDate);
    return expiry <= warningDate && expiry >= now;
  });
}

export function getExpiredMaterials(): Material[] {
  const materials = getMaterials();
  const now = new Date();
  
  return materials.filter((m) => {
    const expiry = new Date(m.expiryDate);
    return expiry < now;
  });
}

export function getLowStockMaterials(threshold: number = 10): Material[] {
  const materials = getMaterials();
  return materials.filter((m) => m.stock <= threshold);
}

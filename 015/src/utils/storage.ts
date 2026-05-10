import { StorageOperationResult } from '../types';

export class StorageManager {
  private static instance: StorageManager;

  private constructor() {}

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`[StorageManager] Error reading ${key}:`, error);
      return defaultValue;
    }
  }

  set<T>(key: string, value: T): StorageOperationResult<T> {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return { success: true, data: value };
    } catch (error) {
      console.error(`[StorageManager] Error writing ${key}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown storage error';
      return { success: false, error: errorMessage };
    }
  }

  remove(key: string): StorageOperationResult<void> {
    try {
      localStorage.removeItem(key);
      return { success: true, data: undefined };
    } catch (error) {
      console.error(`[StorageManager] Error removing ${key}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown storage error';
      return { success: false, error: errorMessage };
    }
  }

  clear(): StorageOperationResult<void> {
    try {
      localStorage.clear();
      return { success: true, data: undefined };
    } catch (error) {
      console.error('[StorageManager] Error clearing storage:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown storage error';
      return { success: false, error: errorMessage };
    }
  }

  exists(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }
}

export const storage = StorageManager.getInstance();

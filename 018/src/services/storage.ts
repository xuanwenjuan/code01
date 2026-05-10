import { 
  Book, 
  BookCategory, 
  OperationLog, 
  BookCondition, 
  BookStatus, 
  BookFormData, 
  LogFormData,
  FilterOptions,
  BookStatistics,
  OperationType
} from '../types';

const STORAGE_KEYS = {
  BOOKS: 'bookstore_books',
  CATEGORIES: 'bookstore_categories',
  LOGS: 'bookstore_logs'
} as const;

const DEFAULT_CATEGORIES: readonly string[] = ['小说', '社科', '教辅', '绘本', '传记'];

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getCurrentDateString(): string {
  return new Date().toISOString();
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function getInitialCategories(): BookCategory[] {
  const currentDate = getCurrentDateString();
  return DEFAULT_CATEGORIES.map((name: string, index: number) => ({
    id: generateId() + index,
    name,
    createdAt: currentDate,
    updatedAt: currentDate
  }));
}

function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    const parsed = JSON.parse(item) as T;
    return parsed;
  } catch (error) {
    console.error(`Failed to parse localStorage item: ${key}`, error);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save to localStorage: ${key}`, error);
    throw new Error('数据保存失败，请检查浏览器存储权限');
  }
}

export const categoryService = {
  getAll(): BookCategory[] {
    const categories = getFromStorage<BookCategory[]>(STORAGE_KEYS.CATEGORIES, []);
    if (categories.length === 0) {
      const initial = getInitialCategories();
      saveToStorage(STORAGE_KEYS.CATEGORIES, initial);
      return initial;
    }
    return categories;
  },
  
  getById(id: string): BookCategory | undefined {
    return this.getAll().find((cat: BookCategory) => cat.id === id);
  },
  
  exists(name: string, excludeId?: string): boolean {
    const categories = this.getAll();
    return categories.some(
      (cat: BookCategory) => cat.name === name && cat.id !== excludeId
    );
  },
  
  create(name: string): BookCategory {
    if (this.exists(name)) {
      throw new Error('分类名称已存在');
    }
    
    const categories = this.getAll();
    const currentDate = getCurrentDateString();
    const newCategory: BookCategory = {
      id: generateId(),
      name,
      createdAt: currentDate,
      updatedAt: currentDate
    };
    
    categories.push(newCategory);
    saveToStorage(STORAGE_KEYS.CATEGORIES, categories);
    return newCategory;
  },
  
  update(id: string, name: string): BookCategory {
    const categories = this.getAll();
    const index = categories.findIndex((cat: BookCategory) => cat.id === id);
    if (index === -1) {
      throw new Error('分类不存在');
    }
    
    if (this.exists(name, id)) {
      throw new Error('分类名称已存在');
    }
    
    categories[index] = {
      ...categories[index],
      name,
      updatedAt: getCurrentDateString()
    };
    
    saveToStorage(STORAGE_KEYS.CATEGORIES, categories);
    return categories[index];
  },
  
  delete(id: string): void {
    const books = bookService.getAll();
    const hasBooks = books.some((book: Book) => book.categoryId === id);
    if (hasBooks) {
      throw new Error('该分类下存在图书，无法删除');
    }
    
    const categories = this.getAll().filter((cat: BookCategory) => cat.id !== id);
    saveToStorage(STORAGE_KEYS.CATEGORIES, categories);
  }
};

export const bookService = {
  getAll(): Book[] {
    return getFromStorage<Book[]>(STORAGE_KEYS.BOOKS, []);
  },
  
  getById(id: string): Book | undefined {
    return this.getAll().find((book: Book) => book.id === id);
  },
  
  filter(filters: FilterOptions): Book[] {
    let books = this.getAll();
    
    if (filters.categoryId) {
      books = books.filter((book: Book) => book.categoryId === filters.categoryId);
    }
    if (filters.minStock !== undefined) {
      books = books.filter((book: Book) => book.stock >= filters.minStock!);
    }
    if (filters.maxStock !== undefined) {
      books = books.filter((book: Book) => book.stock <= filters.maxStock!);
    }
    if (filters.entryYear) {
      books = books.filter((book: Book) => book.entryYear === filters.entryYear);
    }
    if (filters.condition) {
      books = books.filter((book: Book) => book.condition === filters.condition);
    }
    if (filters.minStorageYearsRemaining !== undefined) {
      books = books.filter((book: Book) => book.storageYearsRemaining >= filters.minStorageYearsRemaining!);
    }
    if (filters.maxStorageYearsRemaining !== undefined) {
      books = books.filter((book: Book) => book.storageYearsRemaining <= filters.maxStorageYearsRemaining!);
    }
    if (filters.status) {
      books = books.filter((book: Book) => book.status === filters.status);
    }
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      books = books.filter((book: Book) => 
        book.name.toLowerCase().includes(searchLower) ||
        book.author.toLowerCase().includes(searchLower)
      );
    }
    
    return books;
  },
  
  create(bookData: BookFormData): Book {
    const books = this.getAll();
    const currentDate = getCurrentDateString();
    const newBook: Book = {
      ...bookData,
      id: generateId(),
      createdAt: currentDate,
      updatedAt: currentDate
    };
    
    books.push(newBook);
    saveToStorage(STORAGE_KEYS.BOOKS, books);
    return newBook;
  },
  
  update(id: string, bookData: Partial<Book>): Book {
    const books = this.getAll();
    const index = books.findIndex((book: Book) => book.id === id);
    if (index === -1) {
      throw new Error('图书不存在');
    }
    
    books[index] = {
      ...books[index],
      ...bookData,
      updatedAt: getCurrentDateString()
    };
    
    saveToStorage(STORAGE_KEYS.BOOKS, books);
    return books[index];
  },
  
  delete(id: string): void {
    const books = this.getAll().filter((book: Book) => book.id !== id);
    saveToStorage(STORAGE_KEYS.BOOKS, books);
  },
  
  restock(id: string, quantity: number): { book: Book; stockBefore: number; stockAfter: number } {
    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new Error('入库数量必须是大于0的数字');
    }
    if (!Number.isInteger(quantity)) {
      throw new Error('入库数量必须是整数');
    }
    
    const book = this.getById(id);
    if (!book) {
      throw new Error('图书不存在');
    }
    
    const stockBefore = book.stock;
    const stockAfter = book.stock + quantity;
    
    if (stockAfter > 999999) {
      throw new Error('库存数量超出最大值限制');
    }
    
    const updatedBook = this.update(id, {
      stock: stockAfter
    });
    
    return { book: updatedBook, stockBefore, stockAfter };
  },
  
  sell(id: string, quantity: number): { book: Book; stockBefore: number; stockAfter: number } {
    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new Error('售卖数量必须是大于0的数字');
    }
    if (!Number.isInteger(quantity)) {
      throw new Error('售卖数量必须是整数');
    }
    
    const book = this.getById(id);
    if (!book) {
      throw new Error('图书不存在');
    }
    if (book.stock < quantity) {
      throw new Error(`库存不足，当前库存: ${book.stock}，请求售卖: ${quantity}`);
    }
    if (book.status !== '正常') {
      throw new Error('该图书已下架，无法售卖');
    }
    
    const stockBefore = book.stock;
    const stockAfter = book.stock - quantity;
    
    const updatedBook = this.update(id, {
      stock: stockAfter
    });
    
    return { book: updatedBook, stockBefore, stockAfter };
  },
  
  updateCondition(id: string, condition: BookCondition): Book {
    const book = this.getById(id);
    if (!book) {
      throw new Error('图书不存在');
    }
    
    return this.update(id, {
      condition
    });
  },
  
  removeDefective(id: string): Book {
    const book = this.getById(id);
    if (!book) {
      throw new Error('图书不存在');
    }
    if (book.status === '下架') {
      throw new Error('该图书已下架');
    }
    
    return this.update(id, {
      status: '下架'
    });
  },
  
  restore(id: string): Book {
    const book = this.getById(id);
    if (!book) {
      throw new Error('图书不存在');
    }
    if (book.status === '正常') {
      throw new Error('该图书未下架');
    }
    
    return this.update(id, {
      status: '正常'
    });
  },
  
  getStatistics(): BookStatistics {
    const books = this.getAll();
    return {
      total: books.length,
      totalStock: books.reduce((sum: number, book: Book) => sum + book.stock, 0),
      totalValue: books.reduce((sum: number, book: Book) => sum + book.stock * book.price, 0),
      activeCount: books.filter((book: Book) => book.status === '正常').length,
      inactiveCount: books.filter((book: Book) => book.status === '下架').length,
      lowStockCount: books.filter((book: Book) => book.stock <= 5 && book.status === '正常').length,
      agingCount: books.filter((book: Book) => book.storageYearsRemaining <= 1 && book.status === '正常').length
    };
  },

  getAgingBooks(): Book[] {
    const books = this.getAll();
    return books.filter((book: Book) => book.storageYearsRemaining <= 1 && book.status === '正常');
  },

  getLowStockBooks(): Book[] {
    const books = this.getAll();
    return books.filter((book: Book) => book.stock <= 5 && book.status === '正常');
  }
};

export const logService = {
  getAll(): OperationLog[] {
    return getFromStorage<OperationLog[]>(STORAGE_KEYS.LOGS, []);
  },
  
  getByType(operationType: string): OperationLog[] {
    return this.getAll().filter((log: OperationLog) => log.operationType === operationType);
  },
  
  getByBook(bookId: string): OperationLog[] {
    return this.getAll().filter((log: OperationLog) => log.bookId === bookId);
  },
  
  getByCategory(categoryId: string): OperationLog[] {
    return this.getAll().filter((log: OperationLog) => log.categoryId === categoryId);
  },
  
  create(logData: LogFormData): OperationLog {
    const logs = this.getAll();
    const newLog: OperationLog = {
      ...logData,
      id: generateId(),
      operationTime: getCurrentDateString()
    };
    
    logs.unshift(newLog);
    
    if (logs.length > 1000) {
      logs.splice(1000);
    }
    
    saveToStorage(STORAGE_KEYS.LOGS, logs);
    return newLog;
  },
  
  clear(): void {
    saveToStorage(STORAGE_KEYS.LOGS, []);
  },
  
  getFormattedTime(dateString: string): string {
    return formatDate(dateString);
  }
};

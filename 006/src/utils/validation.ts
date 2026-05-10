import { Book, FormError } from '../types'

export const validateBookForm = (book: Partial<Book>): FormError[] => {
  const errors: FormError[] = []
  
  if (!book.name || book.name.trim() === '') {
    errors.push({ field: 'name', message: '图书名称不能为空' })
  }
  
  if (!book.author || book.author.trim() === '') {
    errors.push({ field: 'author', message: '作者不能为空' })
  }
  
  if (!book.publisher || book.publisher.trim() === '') {
    errors.push({ field: 'publisher', message: '出版社不能为空' })
  }
  
  if (!book.isbn || book.isbn.trim() === '') {
    errors.push({ field: 'isbn', message: 'ISBN编号不能为空' })
  } else if (!/^\d{10}(\d{3})?$/.test(book.isbn.replace(/-/g, ''))) {
    errors.push({ field: 'isbn', message: 'ISBN编号格式不正确' })
  }
  
  if (book.stock === undefined || book.stock === null) {
    errors.push({ field: 'stock', message: '库存数量不能为空' })
  } else if (book.stock < 0) {
    errors.push({ field: 'stock', message: '库存数量不能为负数' })
  }
  
  if (!book.shelf || book.shelf.trim() === '') {
    errors.push({ field: 'shelf', message: '存放书架不能为空' })
  }
  
  if (!book.entryYear) {
    errors.push({ field: 'entryYear', message: '入库年限不能为空' })
  } else if (book.entryYear < 1900 || book.entryYear > new Date().getFullYear()) {
    errors.push({ field: 'entryYear', message: '入库年限不合法' })
  }
  
  if (!book.category) {
    errors.push({ field: 'category', message: '图书分类不能为空' })
  }
  
  if (!book.borrowLevel) {
    errors.push({ field: 'borrowLevel', message: '借阅等级不能为空' })
  }
  
  return errors
}

export const validateBorrowForm = (
  borrower: string,
  operator: string,
  borrowCount: number,
  availableStock: number,
  maxLimit: number,
  currentBorrowed: number
): FormError[] => {
  const errors: FormError[] = []
  
  if (!borrower || borrower.trim() === '') {
    errors.push({ field: 'borrower', message: '借阅人不能为空' })
  }
  
  if (!operator || operator.trim() === '') {
    errors.push({ field: 'operator', message: '经办人不能为空' })
  }
  
  if (borrowCount <= 0) {
    errors.push({ field: 'borrowCount', message: '借阅数量必须大于0' })
  } else if (borrowCount > availableStock) {
    errors.push({ field: 'borrowCount', message: '借阅数量超过可用库存' })
  }
  
  if (maxLimit === 0) {
    errors.push({ field: 'borrowCount', message: '该图书不可借阅' })
  } else if (currentBorrowed + borrowCount > maxLimit) {
    errors.push({ field: 'borrowCount', message: `借阅等级限制，最多可借${maxLimit}本，已借${currentBorrowed}本` })
  }
  
  return errors
}

export const validateReturnForm = (
  operator: string
): FormError[] => {
  const errors: FormError[] = []
  
  if (!operator || operator.trim() === '') {
    errors.push({ field: 'operator', message: '经办人不能为空' })
  }
  
  return errors
}

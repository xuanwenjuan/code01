import React, { useState, useMemo, useCallback } from 'react'
import { useLibrary } from '../contexts/LibraryContext'
import { useToast } from './common'
import { Modal, FormField, Input, Select, Button, DataTable, ConfirmDialog } from './common'
import { Book, BookCategory, BorrowLevel, FormError, OldBookAlert } from '../types'
import { BOOK_CATEGORIES, BORROW_LEVELS, OLD_BOOK_ALERT_YEARS } from '../constants'
import { validateBookForm } from '../utils/validation'

interface BookFormProps {
  book?: Book | null
  onSubmit: (book: Partial<Book>) => void
  onCancel: () => void
}

const BookForm: React.FC<BookFormProps> = ({ book, onSubmit, onCancel }) => {
  const isEdit = !!book
  const [formData, setFormData] = useState<Partial<Book>>({
    name: book?.name || '',
    author: book?.author || '',
    publisher: book?.publisher || '',
    isbn: book?.isbn || '',
    stock: book?.stock ?? 0,
    shelf: book?.shelf || '',
    entryYear: book?.entryYear ?? new Date().getFullYear(),
    category: book?.category || '文学类',
    borrowLevel: book?.borrowLevel || '可借',
    isDamaged: book?.isDamaged || false
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = useCallback((field: keyof Book, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }, [])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    
    const validationErrors: FormError[] = validateBookForm(formData as Partial<Book>)
    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {}
      validationErrors.forEach((err: FormError) => {
        errorMap[err.field] = err.message
      })
      setErrors(errorMap)
      return
    }

    onSubmit(formData)
  }, [formData, onSubmit])

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="图书名称" required error={errors.name}>
          <Input
            value={formData.name || ''}
            onChange={e => handleChange('name', e.target.value)}
            error={!!errors.name}
            placeholder="请输入图书名称"
          />
        </FormField>

        <FormField label="作者" required error={errors.author}>
          <Input
            value={formData.author || ''}
            onChange={e => handleChange('author', e.target.value)}
            error={!!errors.author}
            placeholder="请输入作者"
          />
        </FormField>

        <FormField label="出版社" required error={errors.publisher}>
          <Input
            value={formData.publisher || ''}
            onChange={e => handleChange('publisher', e.target.value)}
            error={!!errors.publisher}
            placeholder="请输入出版社"
          />
        </FormField>

        <FormField label="ISBN编号" required error={errors.isbn}>
          <Input
            value={formData.isbn || ''}
            onChange={e => handleChange('isbn', e.target.value)}
            error={!!errors.isbn}
            placeholder="请输入ISBN编号"
          />
        </FormField>

        <FormField label="库存数量" required error={errors.stock}>
          <Input
            type="number"
            value={formData.stock ?? 0}
            onChange={e => handleChange('stock', parseInt(e.target.value, 10) || 0)}
            error={!!errors.stock}
            placeholder="请输入库存数量"
            min="0"
          />
        </FormField>

        <FormField label="存放书架" required error={errors.shelf}>
          <Input
            value={formData.shelf || ''}
            onChange={e => handleChange('shelf', e.target.value)}
            error={!!errors.shelf}
            placeholder="如：A区-3层"
          />
        </FormField>

        <FormField label="入库年限" required error={errors.entryYear}>
          <Input
            type="number"
            value={formData.entryYear ?? new Date().getFullYear()}
            onChange={e => handleChange('entryYear', parseInt(e.target.value, 10) || 0)}
            error={!!errors.entryYear}
            placeholder="请输入入库年限"
            min="1900"
            max={new Date().getFullYear()}
          />
          {formData.entryYear && (new Date().getFullYear() - formData.entryYear) >= OLD_BOOK_ALERT_YEARS && (
            <p className="text-yellow-600 text-sm mt-1">
              ⚠️ 该图书入库已超过 {OLD_BOOK_ALERT_YEARS} 年
            </p>
          )}
        </FormField>

        <FormField label="图书分类" required error={errors.category}>
          <Select
            value={formData.category || ''}
            onChange={e => handleChange('category', e.target.value as BookCategory)}
            error={!!errors.category}
          >
            <option value="">请选择分类</option>
            {BOOK_CATEGORIES.map((cat: BookCategory) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Select>
        </FormField>

        <FormField label="借阅等级" required error={errors.borrowLevel}>
          <Select
            value={formData.borrowLevel || ''}
            onChange={e => handleChange('borrowLevel', e.target.value as BorrowLevel)}
            error={!!errors.borrowLevel}
          >
            <option value="">请选择借阅等级</option>
            {BORROW_LEVELS.map((level: BorrowLevel) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </Select>
        </FormField>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit" variant="primary">
          {isEdit ? '保存修改' : '添加图书'}
        </Button>
      </div>
    </form>
  )
}

export const BookManagement: React.FC = () => {
  const { books, addBook, updateBook, deleteBook, borrowRecords, checkAndShowOldBookAlerts } = useLibrary()
  const { showToast } = useToast()
  
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Book | null>(null)
  const [searchKeyword, setSearchKeyword] = useState<string>('')
  const [oldBookAlert, setOldBookAlert] = useState<OldBookAlert | null>(null)

  const filteredBooks = useMemo(() => {
    if (!searchKeyword.trim()) return books
    const keyword = searchKeyword.toLowerCase()
    return books.filter((book: Book) =>
      book.name.toLowerCase().includes(keyword) ||
      book.author.toLowerCase().includes(keyword) ||
      book.isbn.toLowerCase().includes(keyword) ||
      book.publisher.toLowerCase().includes(keyword)
    )
  }, [books, searchKeyword])

  const handleAdd = useCallback(() => {
    setEditingBook(null)
    setIsModalOpen(true)
  }, [])

  const handleEdit = useCallback((book: Book) => {
    setEditingBook(book)
    setIsModalOpen(true)
  }, [])

  const handleDelete = useCallback((book: Book) => {
    setDeleteConfirm(book)
  }, [])

  const confirmDelete = useCallback(() => {
    if (!deleteConfirm) return
    
    const result = deleteBook(deleteConfirm.id)
    if (result.success) {
      showToast(result.message, 'success')
    } else {
      showToast(result.message, 'error')
    }
    setDeleteConfirm(null)
  }, [deleteConfirm, deleteBook, showToast])

  const handleSubmit = useCallback((formData: Partial<Book>) => {
    if (editingBook) {
      const result = updateBook(editingBook.id, formData)
      if (result.success) {
        showToast(result.message, 'success')
      } else {
        showToast(result.message, 'error')
      }
    } else {
      const bookData = {
        name: formData.name || '',
        author: formData.author || '',
        publisher: formData.publisher || '',
        isbn: formData.isbn || '',
        stock: formData.stock ?? 0,
        shelf: formData.shelf || '',
        entryYear: formData.entryYear ?? new Date().getFullYear(),
        category: formData.category || '文学类',
        borrowLevel: formData.borrowLevel || '可借',
        isDamaged: formData.isDamaged || false
      }
      
      const result = addBook(bookData)
      if (result.success) {
        showToast(result.message, 'success')
        
        if (result.oldBookAlerts.length > 0) {
          setOldBookAlert(result.oldBookAlerts[0])
        }
      } else {
        showToast(result.message, 'error')
      }
    }
    setIsModalOpen(false)
    setEditingBook(null)
  }, [editingBook, updateBook, addBook, showToast])

  const getBorrowedCount = useCallback((bookId: string) => {
    return borrowRecords
      .filter((r) => r.bookId === bookId && !r.returnDate)
      .reduce((sum: number, r) => sum + r.borrowCount, 0)
  }, [borrowRecords])

  const columns = [
    {
      key: 'name' as keyof Book,
      header: '图书名称'
    },
    {
      key: 'author' as keyof Book,
      header: '作者'
    },
    {
      key: 'category' as keyof Book,
      header: '分类'
    },
    {
      key: 'stock' as keyof Book,
      header: '库存',
      render: (item: Book) => {
        const borrowed = getBorrowedCount(item.id)
        return `${item.stock} (借出${borrowed})`
      }
    },
    {
      key: 'shelf' as keyof Book,
      header: '书架'
    },
    {
      key: 'borrowLevel' as keyof Book,
      header: '借阅等级'
    },
    {
      key: 'status' as keyof Book,
      header: '状态',
      render: (item: Book) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.status === '破损'
              ? 'bg-red-100 text-red-800'
              : item.status === '在借'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {item.status}
        </span>
      )
    },
    {
      key: 'actions' as string,
      header: '操作',
      render: (item: Book) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleEdit(item)}
          >
            编辑
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(item)}
          >
            删除
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">图书信息管理</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="text"
            placeholder="搜索图书名称/作者/ISBN..."
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            className="w-full sm:w-64"
          />
          <Button variant="success" onClick={handleAdd}>
            添加图书
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">
            图书列表 ({filteredBooks.length})
          </h3>
        </div>
        <DataTable columns={columns} data={filteredBooks} />
      </div>

      <Modal
        isOpen={isModalOpen}
        title={editingBook ? '编辑图书' : '添加图书'}
        onClose={() => {
          setIsModalOpen(false)
          setEditingBook(null)
        }}
        size="lg"
      >
        <BookForm
          book={editingBook}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false)
            setEditingBook(null)
          }}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="确认删除"
        message={`确定要删除图书"${deleteConfirm?.name}"吗？此操作不可撤销。`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
        confirmText="删除"
        confirmVariant="danger"
      />

      <Modal
        isOpen={!!oldBookAlert}
        title="老旧图书提醒"
        onClose={() => setOldBookAlert(null)}
        size="md"
      >
        {oldBookAlert && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📚</span>
                <div>
                  <h4 className="font-semibold text-yellow-800">{oldBookAlert.book.name}</h4>
                  <p className="text-sm text-yellow-700">
                    该图书已入库 {oldBookAlert.years} 年，超过 {OLD_BOOK_ALERT_YEARS} 年预警阈值
                  </p>
                </div>
              </div>
              <div className="mt-3 text-sm text-yellow-600">
                <p>作者：{oldBookAlert.book.author}</p>
                <p>出版社：{oldBookAlert.book.publisher}</p>
                <p>入库年限：{oldBookAlert.book.entryYear}年</p>
              </div>
              <p className="mt-3 text-xs text-yellow-500">
                建议：请考虑对老旧图书进行归档处理或更新版本
              </p>
            </div>
            <div className="flex justify-end">
              <Button variant="primary" onClick={() => setOldBookAlert(null)}>
                我知道了
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

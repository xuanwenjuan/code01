import React, { useState, useMemo, useCallback } from 'react'
import { useLibrary } from '../contexts/LibraryContext'
import { useToast } from './common'
import { Modal, FormField, Input, Button, DataTable } from './common'
import { Book, BorrowRecord, BorrowLevel, FormError } from '../types'
import { MAX_BORROW_LIMIT } from '../constants'
import { validateBorrowForm, validateReturnForm } from '../utils/validation'

type TabType = 'borrow' | 'return' | 'damaged'
type ModalType = 'borrow' | 'return' | 'damaged' | null

interface BorrowForm {
  borrower: string
  operator: string
  borrowCount: number
}

interface ReturnForm {
  operator: string
  isDamaged: boolean
}

interface DamagedForm {
  operator: string
  remark: string
}

interface TableColumn<T> {
  key: keyof T | string
  header: string
  render?: (item: T) => React.ReactNode
}

export const BorrowManagement: React.FC = () => {
  const { books, borrowRecords, borrowBook, returnBook, markBookDamaged } = useLibrary()
  const { showToast } = useToast()
  
  const [activeTab, setActiveTab] = useState<TabType>('borrow')
  const [modalType, setModalType] = useState<ModalType>(null)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [selectedRecord, setSelectedRecord] = useState<BorrowRecord | null>(null)
  
  const [borrowForm, setBorrowForm] = useState<BorrowForm>({
    borrower: '',
    operator: '',
    borrowCount: 1
  })
  
  const [returnForm, setReturnForm] = useState<ReturnForm>({
    operator: '',
    isDamaged: false
  })
  
  const [damagedForm, setDamagedForm] = useState<DamagedForm>({
    operator: '',
    remark: ''
  })
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const availableBooks = useMemo((): Book[] => {
    return books.filter((book: Book) => 
      book.status === '可借' && 
      book.borrowLevel !== '不可借'
    )
  }, [books])

  const activeRecords = useMemo((): BorrowRecord[] => {
    return [...borrowRecords]
      .filter((record: BorrowRecord) => !record.returnDate)
      .sort((a: BorrowRecord, b: BorrowRecord) => 
        new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime()
      )
  }, [borrowRecords])

  const handleOpenBorrow = useCallback((book: Book): void => {
    setSelectedBook(book)
    setBorrowForm({ borrower: '', operator: '', borrowCount: 1 })
    setFormErrors({})
    setModalType('borrow')
  }, [])

  const handleOpenReturn = useCallback((record: BorrowRecord): void => {
    setSelectedRecord(record)
    setReturnForm({ operator: '', isDamaged: false })
    setFormErrors({})
    setModalType('return')
  }, [])

  const handleOpenDamaged = useCallback((book: Book): void => {
    setSelectedBook(book)
    setDamagedForm({ operator: '', remark: '' })
    setFormErrors({})
    setModalType('damaged')
  }, [])

  const handleBorrowSubmit = useCallback((e: React.FormEvent): void => {
    e.preventDefault()
    if (!selectedBook) return

    const currentBorrowed: number = borrowRecords
      .filter((r: BorrowRecord) => r.bookId === selectedBook.id && !r.returnDate)
      .reduce((sum: number, r: BorrowRecord) => sum + r.borrowCount, 0)

    const errors: FormError[] = validateBorrowForm(
      borrowForm.borrower,
      borrowForm.operator,
      borrowForm.borrowCount,
      selectedBook.stock,
      MAX_BORROW_LIMIT[selectedBook.borrowLevel],
      currentBorrowed
    )

    if (errors.length > 0) {
      const errorMap: Record<string, string> = {}
      errors.forEach((err: FormError) => { errorMap[err.field] = err.message })
      setFormErrors(errorMap)
      return
    }

    const result = borrowBook({
      bookId: selectedBook.id,
      borrower: borrowForm.borrower,
      operator: borrowForm.operator,
      borrowCount: borrowForm.borrowCount
    })

    if (result.success) {
      showToast(result.message, 'success')
      setModalType(null)
      setSelectedBook(null)
    } else {
      showToast(result.message, 'error')
    }
  }, [selectedBook, borrowRecords, borrowForm, borrowBook, showToast])

  const handleReturnSubmit = useCallback((e: React.FormEvent): void => {
    e.preventDefault()
    if (!selectedRecord) return

    const errors: FormError[] = validateReturnForm(returnForm.operator)
    if (errors.length > 0) {
      const errorMap: Record<string, string> = {}
      errors.forEach((err: FormError) => { errorMap[err.field] = err.message })
      setFormErrors(errorMap)
      return
    }

    const result = returnBook({
      recordId: selectedRecord.id,
      operator: returnForm.operator,
      isDamaged: returnForm.isDamaged
    })

    if (result.success) {
      showToast(result.message, 'success')
      setModalType(null)
      setSelectedRecord(null)
    } else {
      showToast(result.message, 'error')
    }
  }, [selectedRecord, returnForm, returnBook, showToast])

  const handleDamagedSubmit = useCallback((e: React.FormEvent): void => {
    e.preventDefault()
    if (!selectedBook) return

    if (!damagedForm.operator.trim()) {
      setFormErrors({ operator: '经办人不能为空' })
      return
    }

    const result = markBookDamaged({
      bookId: selectedBook.id,
      operator: damagedForm.operator,
      remark: damagedForm.remark || '常规破损登记'
    })

    if (result.success) {
      showToast(result.message, 'success')
      setModalType(null)
      setSelectedBook(null)
    } else {
      showToast(result.message, 'error')
    }
  }, [selectedBook, damagedForm, markBookDamaged, showToast])

  const borrowColumns: TableColumn<Book>[] = [
    { key: 'name' as keyof Book, header: '图书名称' },
    { key: 'author' as keyof Book, header: '作者' },
    { key: 'category' as keyof Book, header: '分类' },
    { key: 'stock' as keyof Book, header: '可借库存' },
    { key: 'borrowLevel' as keyof Book, header: '借阅等级' },
    { 
      key: 'limit' as string, 
      header: '单次最大', 
      render: (item: Book): number => MAX_BORROW_LIMIT[item.borrowLevel as BorrowLevel] 
    },
    {
      key: 'actions' as string,
      header: '操作',
      render: (item: Book): React.ReactNode => (
        <Button
          size="sm"
          variant="success"
          onClick={() => handleOpenBorrow(item)}
        >
          借阅
        </Button>
      )
    }
  ]

  const returnColumns: TableColumn<BorrowRecord>[] = [
    { key: 'bookName' as keyof BorrowRecord, header: '图书名称' },
    { key: 'borrower' as keyof BorrowRecord, header: '借阅人' },
    { key: 'operator' as keyof BorrowRecord, header: '经办人' },
    { key: 'borrowCount' as keyof BorrowRecord, header: '借阅数量' },
    { key: 'borrowDate' as keyof BorrowRecord, header: '借阅日期' },
    { key: 'dueDate' as keyof BorrowRecord, header: '应还日期' },
    {
      key: 'isOverdue' as keyof BorrowRecord,
      header: '状态',
      render: (item: BorrowRecord): React.ReactNode => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.isOverdue
              ? 'bg-red-100 text-red-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {item.isOverdue ? '已逾期' : '正常'}
        </span>
      )
    },
    {
      key: 'actions' as string,
      header: '操作',
      render: (item: BorrowRecord): React.ReactNode => (
        <Button
          size="sm"
          variant="primary"
          onClick={() => handleOpenReturn(item)}
        >
          归还
        </Button>
      )
    }
  ]

  const damagedColumns: TableColumn<Book>[] = [
    { key: 'name' as keyof Book, header: '图书名称' },
    { key: 'author' as keyof Book, header: '作者' },
    { key: 'category' as keyof Book, header: '分类' },
    { key: 'stock' as keyof Book, header: '库存' },
    { key: 'shelf' as keyof Book, header: '书架' },
    {
      key: 'status' as keyof Book,
      header: '状态',
      render: (item: Book): React.ReactNode => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.status === '破损'
              ? 'bg-red-100 text-red-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {item.status === '破损' ? '已破损' : '正常'}
        </span>
      )
    },
    {
      key: 'actions' as string,
      header: '操作',
      render: (item: Book): React.ReactNode => (
        <Button
          size="sm"
          variant="danger"
          onClick={() => handleOpenDamaged(item)}
          disabled={item.status === '破损'}
        >
          破损登记
        </Button>
      )
    }
  ]

  const hasOverdueRecords: boolean = useMemo(() => {
    return activeRecords.some((r: BorrowRecord) => r.isOverdue)
  }, [activeRecords])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">图书借阅与归还</h2>
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'borrow' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('borrow')}
            type="button"
          >
            借阅登记
          </Button>
          <Button
            variant={activeTab === 'return' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('return')}
            type="button"
          >
            归还入库
          </Button>
          <Button
            variant={activeTab === 'damaged' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('damaged')}
            type="button"
          >
            破损登记
          </Button>
        </div>
      </div>

      {activeTab === 'borrow' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              可借图书 ({availableBooks.length})
            </h3>
          </div>
          <DataTable columns={borrowColumns} data={availableBooks} />
        </div>
      )}

      {activeTab === 'return' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              待归还图书 ({activeRecords.length})
            </h3>
            {hasOverdueRecords && (
              <span className="text-red-500 text-sm">
                ⚠️ 存在逾期图书，请及时处理
              </span>
            )}
          </div>
          <DataTable columns={returnColumns} data={activeRecords} />
        </div>
      )}

      {activeTab === 'damaged' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              所有图书 ({books.length})
            </h3>
          </div>
          <DataTable columns={damagedColumns} data={books} />
        </div>
      )}

      <Modal
        isOpen={modalType === 'borrow'}
        title="借阅登记"
        onClose={() => { setModalType(null); setSelectedBook(null) }}
        size="md"
      >
        {selectedBook && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">{selectedBook.name}</h4>
              <p className="text-sm text-gray-600">作者：{selectedBook.author}</p>
              <p className="text-sm text-gray-600">可借库存：{selectedBook.stock}</p>
              <p className="text-sm text-gray-600">
                借阅等级：{selectedBook.borrowLevel} (单次最多{MAX_BORROW_LIMIT[selectedBook.borrowLevel]}本)
              </p>
            </div>
            <form onSubmit={handleBorrowSubmit}>
              <FormField label="借阅人" required error={formErrors.borrower}>
                <Input
                  value={borrowForm.borrower}
                  onChange={e => setBorrowForm(prev => ({ ...prev, borrower: e.target.value }))}
                  error={!!formErrors.borrower}
                  placeholder="请输入借阅人姓名"
                />
              </FormField>
              <FormField label="经办人" required error={formErrors.operator}>
                <Input
                  value={borrowForm.operator}
                  onChange={e => setBorrowForm(prev => ({ ...prev, operator: e.target.value }))}
                  error={!!formErrors.operator}
                  placeholder="请输入经办人姓名"
                />
              </FormField>
              <FormField label="借阅数量" required error={formErrors.borrowCount}>
                <Input
                  type="number"
                  min="1"
                  max={Math.min(selectedBook.stock, MAX_BORROW_LIMIT[selectedBook.borrowLevel])}
                  value={borrowForm.borrowCount}
                  onChange={e => setBorrowForm(prev => ({ 
                    ...prev, 
                    borrowCount: parseInt(e.target.value, 10) || 1 
                  }))}
                  error={!!formErrors.borrowCount}
                />
              </FormField>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={() => { setModalType(null); setSelectedBook(null) }}>
                  取消
                </Button>
                <Button type="submit" variant="success">
                  确认借阅
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={modalType === 'return'}
        title="归还入库"
        onClose={() => { setModalType(null); setSelectedRecord(null) }}
        size="md"
      >
        {selectedRecord && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${selectedRecord.isOverdue ? 'bg-red-50' : 'bg-gray-50'}`}>
              <h4 className="font-semibold text-gray-700 mb-2">{selectedRecord.bookName}</h4>
              <p className="text-sm text-gray-600">借阅人：{selectedRecord.borrower}</p>
              <p className="text-sm text-gray-600">借阅日期：{selectedRecord.borrowDate}</p>
              <p className="text-sm text-gray-600">应还日期：{selectedRecord.dueDate}</p>
              <p className="text-sm text-gray-600">借阅数量：{selectedRecord.borrowCount}</p>
              {selectedRecord.isOverdue && (
                <p className="text-sm text-red-600 font-medium mt-2">⚠️ 此图书已逾期</p>
              )}
            </div>
            <form onSubmit={handleReturnSubmit}>
              <FormField label="经办人" required error={formErrors.operator}>
                <Input
                  value={returnForm.operator}
                  onChange={e => setReturnForm(prev => ({ ...prev, operator: e.target.value }))}
                  error={!!formErrors.operator}
                  placeholder="请输入经办人姓名"
                />
              </FormField>
              <FormField label="是否破损">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDamaged"
                    checked={returnForm.isDamaged}
                    onChange={e => setReturnForm(prev => ({ ...prev, isDamaged: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isDamaged" className="text-sm text-gray-700">
                    归还时发现图书有破损
                  </label>
                </div>
              </FormField>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={() => { setModalType(null); setSelectedRecord(null) }}>
                  取消
                </Button>
                <Button type="submit" variant="primary">
                  确认归还
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={modalType === 'damaged'}
        title="破损登记"
        onClose={() => { setModalType(null); setSelectedBook(null) }}
        size="md"
      >
        {selectedBook && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">{selectedBook.name}</h4>
              <p className="text-sm text-gray-600">作者：{selectedBook.author}</p>
              <p className="text-sm text-gray-600">分类：{selectedBook.category}</p>
              <p className="text-sm text-gray-600">存放书架：{selectedBook.shelf}</p>
            </div>
            <form onSubmit={handleDamagedSubmit}>
              <FormField label="经办人" required error={formErrors.operator}>
                <Input
                  value={damagedForm.operator}
                  onChange={e => setDamagedForm(prev => ({ ...prev, operator: e.target.value }))}
                  error={!!formErrors.operator}
                  placeholder="请输入经办人姓名"
                />
              </FormField>
              <FormField label="破损说明">
                <textarea
                  value={damagedForm.remark}
                  onChange={e => setDamagedForm(prev => ({ ...prev, remark: e.target.value }))}
                  placeholder="请描述破损情况（可选）"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </FormField>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={() => { setModalType(null); setSelectedBook(null) }}>
                  取消
                </Button>
                <Button type="submit" variant="danger">
                  确认登记
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  )
}

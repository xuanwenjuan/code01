import React, { useMemo, useState, useCallback } from 'react'
import { useLibrary } from '../contexts/LibraryContext'
import { DataTable, Input, Select, Button } from './common'
import { Book, BookCategory, BorrowLevel, FilterCriteria, BorrowRecord } from '../types'
import { BOOK_CATEGORIES, BORROW_LEVELS } from '../constants'

const initialFilter: FilterCriteria = {
  category: '',
  minStock: '',
  maxStock: '',
  entryYear: '',
  borrowLevel: '',
  isOverdue: ''
}

interface TableColumn {
  key: keyof Book | string
  header: string
  render?: (item: Book) => React.ReactNode
}

export const SearchAndFilter: React.FC = () => {
  const { books, borrowRecords } = useLibrary()
  const [filter, setFilter] = useState<FilterCriteria>(initialFilter)

  const getActiveBorrowRecords = useCallback((bookId: string): BorrowRecord[] => {
    return borrowRecords.filter(
      (record: BorrowRecord) => record.bookId === bookId && !record.returnDate
    )
  }, [borrowRecords])

  const hasOverdue = useCallback((bookId: string): boolean => {
    return borrowRecords.some(
      (record: BorrowRecord) => record.bookId === bookId && !record.returnDate && record.isOverdue
    )
  }, [borrowRecords])

  const filteredBooks = useMemo((): Book[] => {
    return books.filter((book: Book) => {
      if (filter.category && book.category !== filter.category) {
        return false
      }

      if (filter.minStock && book.stock < parseInt(filter.minStock, 10)) {
        return false
      }

      if (filter.maxStock && book.stock > parseInt(filter.maxStock, 10)) {
        return false
      }

      if (filter.entryYear && book.entryYear !== parseInt(filter.entryYear, 10)) {
        return false
      }

      if (filter.borrowLevel && book.borrowLevel !== filter.borrowLevel) {
        return false
      }

      if (filter.isOverdue) {
        const overdue: boolean = hasOverdue(book.id)
        if (filter.isOverdue === 'true' && !overdue) return false
        if (filter.isOverdue === 'false' && overdue) return false
      }

      return true
    })
  }, [books, filter, hasOverdue])

  const handleReset = useCallback((): void => {
    setFilter(initialFilter)
  }, [])

  const handleChange = useCallback((field: keyof FilterCriteria, value: string): void => {
    setFilter((prev: FilterCriteria) => ({ ...prev, [field]: value }))
  }, [])

  const columns: TableColumn[] = [
    { key: 'name', header: '图书名称' },
    { key: 'author', header: '作者' },
    { key: 'publisher', header: '出版社' },
    { key: 'isbn', header: 'ISBN' },
    { key: 'category', header: '分类' },
    { key: 'stock', header: '库存' },
    { key: 'entryYear', header: '入库年限' },
    { key: 'shelf', header: '书架' },
    { key: 'borrowLevel', header: '借阅等级' },
    {
      key: 'status',
      header: '状态',
      render: (item: Book): React.ReactNode => {
        const hasOverdueBook: boolean = hasOverdue(item.id)
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              item.status === '破损'
                ? 'bg-red-100 text-red-800'
                : hasOverdueBook
                ? 'bg-yellow-100 text-yellow-800'
                : item.status === '在借'
                ? 'bg-orange-100 text-orange-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {item.status}
            {hasOverdueBook && item.status !== '破损' ? ' (有逾期)' : ''}
          </span>
        )
      }
    },
    {
      key: 'activeRecords',
      header: '未归还',
      render: (item: Book): number => getActiveBorrowRecords(item.id).length
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">图书筛选查询</h2>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">筛选条件</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              图书分类
            </label>
            <Select
              value={filter.category}
              onChange={e => handleChange('category', e.target.value as BookCategory | '')}
            >
              <option value="">全部分类</option>
              {BOOK_CATEGORIES.map((cat: BookCategory) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              借阅等级
            </label>
            <Select
              value={filter.borrowLevel}
              onChange={e => handleChange('borrowLevel', e.target.value as BorrowLevel | '')}
            >
              <option value="">全部等级</option>
              {BORROW_LEVELS.map((level: BorrowLevel) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              入库年限
            </label>
            <Input
              type="number"
              placeholder="如：2024"
              value={filter.entryYear}
              onChange={e => handleChange('entryYear', e.target.value)}
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              最小库存
            </label>
            <Input
              type="number"
              placeholder="最小库存数"
              value={filter.minStock}
              onChange={e => handleChange('minStock', e.target.value)}
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              最大库存
            </label>
            <Input
              type="number"
              placeholder="最大库存数"
              value={filter.maxStock}
              onChange={e => handleChange('maxStock', e.target.value)}
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              是否有逾期
            </label>
            <Select
              value={filter.isOverdue}
              onChange={e => handleChange('isOverdue', e.target.value)}
            >
              <option value="">全部</option>
              <option value="true">有逾期</option>
              <option value="false">无逾期</option>
            </Select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="secondary" onClick={handleReset}>
            重置筛选
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">
            查询结果 ({filteredBooks.length})
          </h3>
        </div>
        <DataTable columns={columns} data={filteredBooks} />
      </div>
    </div>
  )
}

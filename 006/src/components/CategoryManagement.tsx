import React, { useState, useMemo } from 'react'
import { BOOK_CATEGORIES } from '../constants'
import { useLibrary } from '../contexts/LibraryContext'
import { DataTable, Button } from './common'
import { BookCategory, Book } from '../types'

interface CategoryStats {
  name: BookCategory
  totalCount: number
  availableCount: number
  inBorrowCount: number
  damagedCount: number
}

interface TableColumn {
  key: keyof CategoryStats | string
  header: string
  render?: (item: CategoryStats) => React.ReactNode
}

interface BookTableColumn {
  key: keyof Book | string
  header: string
  render?: (item: Book) => React.ReactNode
}

export const CategoryManagement: React.FC = () => {
  const { books } = useLibrary()
  const [selectedCategory, setSelectedCategory] = useState<BookCategory | null>(null)

  const categoryStats = useMemo((): CategoryStats[] => {
    return BOOK_CATEGORIES.map((category: BookCategory) => {
      const categoryBooks: Book[] = books.filter((book: Book) => book.category === category)
      return {
        name: category,
        totalCount: categoryBooks.length,
        availableCount: categoryBooks.filter(
          (book: Book) => book.status === '可借'
        ).length,
        inBorrowCount: categoryBooks.filter(
          (book: Book) => book.status === '在借'
        ).length,
        damagedCount: categoryBooks.filter((book: Book) => book.status === '破损').length
      }
    })
  }, [books])

  const selectedBooks = useMemo((): Book[] => {
    if (!selectedCategory) return []
    return books.filter((book: Book) => book.category === selectedCategory)
  }, [selectedCategory, books])

  const columns: TableColumn[] = [
    {
      key: 'name' as keyof CategoryStats,
      header: '分类名称'
    },
    {
      key: 'totalCount' as keyof CategoryStats,
      header: '图书总数'
    },
    {
      key: 'availableCount' as keyof CategoryStats,
      header: '可借数量'
    },
    {
      key: 'inBorrowCount' as keyof CategoryStats,
      header: '在借数量'
    },
    {
      key: 'damagedCount' as keyof CategoryStats,
      header: '破损数量'
    },
    {
      key: 'actions' as string,
      header: '操作',
      render: (item: CategoryStats): React.ReactNode => (
        <Button
          size="sm"
          variant="primary"
          onClick={() => setSelectedCategory(item.name)}
        >
          查看详情
        </Button>
      )
    }
  ]

  const bookColumns: BookTableColumn[] = [
    {
      key: 'name' as keyof Book,
      header: '图书名称'
    },
    {
      key: 'author' as keyof Book,
      header: '作者'
    },
    {
      key: 'stock' as keyof Book,
      header: '库存'
    },
    {
      key: 'borrowLevel' as keyof Book,
      header: '借阅等级'
    },
    {
      key: 'status' as keyof Book,
      header: '状态',
      render: (item: Book): React.ReactNode => (
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
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">图书分类管理</h2>
        <div className="text-sm text-gray-500">
          共 {BOOK_CATEGORIES.length} 个分类
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">分类统计</h3>
        <DataTable columns={columns} data={categoryStats} />
      </div>

      {selectedCategory && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              {selectedCategory} - 图书列表
            </h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              返回
            </Button>
          </div>
          <DataTable columns={bookColumns} data={selectedBooks} />
        </div>
      )}
    </div>
  )
}

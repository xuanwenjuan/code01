import React, { useState, useMemo } from 'react'
import { useLibrary } from '../contexts/LibraryContext'
import { CategoryManagement } from './CategoryManagement'
import { BookManagement } from './BookManagement'
import { BorrowManagement } from './BorrowManagement'
import { OperationLogs } from './OperationLogs'
import { SearchAndFilter } from './SearchAndFilter'
import { Book, BorrowRecord, OperationLog } from '../types'

type PageType = 'dashboard' | 'category' | 'books' | 'borrow' | 'logs' | 'search'

interface MenuItem {
  key: PageType
  label: string
  icon: string
}

const menuItems: MenuItem[] = [
  { key: 'dashboard', label: '首页概览', icon: '📊' },
  { key: 'category', label: '图书分类', icon: '📁' },
  { key: 'books', label: '图书信息', icon: '📚' },
  { key: 'borrow', label: '借阅归还', icon: '🔄' },
  { key: 'logs', label: '操作日志', icon: '📋' },
  { key: 'search', label: '筛选查询', icon: '🔍' }
]

const Dashboard: React.FC = () => {
  const { books, borrowRecords, operationLogs } = useLibrary()

  const totalBooks = books.length
  const availableBooks = books.filter((b: Book) => b.status === '可借').length
  const inBorrowBooks = books.filter((b: Book) => b.status === '在借').length
  const damagedBooks = books.filter((b: Book) => b.status === '破损').length
  const activeBorrows = borrowRecords.filter((r: BorrowRecord) => !r.returnDate).length
  const overdueBorrows = borrowRecords.filter((r: BorrowRecord) => !r.returnDate && r.isOverdue).length
  const totalLogs = operationLogs.length

  const stats: Array<{ label: string; value: number; color: string; icon: string }> = [
    { label: '图书总数', value: totalBooks, color: 'bg-blue-500', icon: '📚' },
    { label: '可借图书', value: availableBooks, color: 'bg-green-500', icon: '✅' },
    { label: '在借图书', value: inBorrowBooks, color: 'bg-yellow-500', icon: '📖' },
    { label: '破损图书', value: damagedBooks, color: 'bg-red-500', icon: '🔴' },
    { label: '逾期数量', value: overdueBorrows, color: 'bg-orange-500', icon: '⚠️' },
    { label: '操作日志', value: totalLogs, color: 'bg-purple-500', icon: '📋' }
  ]

  const recentLogs: OperationLog[] = useMemo(() => {
    return [...operationLogs].slice(0, 5)
  }, [operationLogs])

  const pendingReturns: BorrowRecord[] = useMemo(() => {
    return [...borrowRecords]
      .filter((r: BorrowRecord) => !r.returnDate)
      .slice(0, 5)
  }, [borrowRecords])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">首页概览</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat: { label: string; value: number; color: string; icon: string }) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg shadow p-6 flex items-center gap-4"
          >
            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-2xl`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">最近操作日志</h3>
          {recentLogs.length === 0 ? (
            <p className="text-gray-500 text-center py-4">暂无操作记录</p>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log: OperationLog) => (
                <div key={log.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        log.operationType === '借阅'
                          ? 'bg-green-100 text-green-800'
                          : log.operationType === '归还'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {log.operationType}
                    </span>
                    <span className="text-sm text-gray-700">{log.bookName}</span>
                  </div>
                  <span className="text-xs text-gray-400">{log.operationDate}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">待归还图书</h3>
          {pendingReturns.length === 0 ? (
            <p className="text-gray-500 text-center py-4">暂无待归还图书</p>
          ) : (
            <div className="space-y-3">
              {pendingReturns.map((record: BorrowRecord) => (
                <div key={record.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-700">{record.bookName}</span>
                    <span className="text-xs text-gray-400">- {record.borrower}</span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      record.isOverdue
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {record.isOverdue ? '已逾期' : '正常'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const Layout: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)

  const renderPage = (): React.ReactNode => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'category':
        return <CategoryManagement />
      case 'books':
        return <BookManagement />
      case 'borrow':
        return <BorrowManagement />
      case 'logs':
        return <OperationLogs />
      case 'search':
        return <SearchAndFilter />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              type="button"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-gray-800">📚 校园图书档案登记管理系统</h1>
          </div>
        </div>
      </header>

      <div className="flex">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
          style={{ top: '56px' }}
        >
          <nav className="p-4 space-y-2">
            {menuItems.map((item: MenuItem) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setCurrentPage(item.key)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentPage === item.key
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          {renderPage()}
        </main>
      </div>
    </div>
  )
}

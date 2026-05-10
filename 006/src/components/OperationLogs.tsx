import React, { useMemo, useState, useCallback } from 'react'
import { useLibrary } from '../contexts/LibraryContext'
import { DataTable, Input, Select } from './common'
import { OperationLog, OperationType } from '../types'
import { OPERATION_TYPES } from '../constants'

interface TableColumn {
  key: keyof OperationLog | string
  header: string
  render?: (item: OperationLog) => React.ReactNode
}

export const OperationLogs: React.FC = () => {
  const { operationLogs } = useLibrary()
  const [searchKeyword, setSearchKeyword] = useState<string>('')
  const [filterType, setFilterType] = useState<OperationType | ''>('')

  const filteredLogs = useMemo((): OperationLog[] => {
    let result: OperationLog[] = [...operationLogs]

    if (filterType) {
      result = result.filter((log: OperationLog) => log.operationType === filterType)
    }

    if (searchKeyword.trim()) {
      const keyword: string = searchKeyword.toLowerCase()
      result = result.filter((log: OperationLog) =>
        log.bookName.toLowerCase().includes(keyword) ||
        log.operator.toLowerCase().includes(keyword) ||
        log.bookCategory.toLowerCase().includes(keyword)
      )
    }

    return result
  }, [operationLogs, searchKeyword, filterType])

  const handleFilterChange = useCallback((value: string): void => {
    setFilterType(value as OperationType | '')
  }, [])

  const columns: TableColumn[] = [
    {
      key: 'operationType' as keyof OperationLog,
      header: '操作类型',
      render: (item: OperationLog): React.ReactNode => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.operationType === '借阅'
              ? 'bg-green-100 text-green-800'
              : item.operationType === '归还'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {item.operationType}
        </span>
      )
    },
    { key: 'bookName' as keyof OperationLog, header: '图书名称' },
    { key: 'bookCategory' as keyof OperationLog, header: '图书分类' },
    { key: 'operator' as keyof OperationLog, header: '经办人' },
    { key: 'operationDate' as keyof OperationLog, header: '操作日期' },
    { key: 'borrowCount' as keyof OperationLog, header: '操作数量' },
    { key: 'remainingStock' as keyof OperationLog, header: '剩余存量' },
    {
      key: 'isOverdue' as keyof OperationLog,
      header: '是否逾期',
      render: (item: OperationLog): React.ReactNode => (
        item.isOverdue ? (
          <span className="text-red-500 font-medium">是</span>
        ) : (
          <span className="text-gray-500">否</span>
        )
      )
    },
    { key: 'bookStatusChange' as keyof OperationLog, header: '状态变更' },
    { key: 'remark' as keyof OperationLog, header: '备注' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">操作履历日志</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select
            value={filterType}
            onChange={e => handleFilterChange(e.target.value)}
            className="w-full sm:w-40"
          >
            <option value="">全部操作类型</option>
            {OPERATION_TYPES.map((type: OperationType) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </Select>
          <Input
            type="text"
            placeholder="搜索图书名称/经办人/分类..."
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            className="w-full sm:w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">
            日志记录 ({filteredLogs.length})
          </h3>
        </div>
        <DataTable columns={columns} data={filteredLogs} />
      </div>
    </div>
  )
}

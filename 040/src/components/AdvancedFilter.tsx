import React, { useCallback, useMemo } from 'react'
import {
  Card,
  Space,
  Button,
  Checkbox,
  InputNumber,
  Input,
  DatePicker,
  Tag,
  Collapse,
  Typography,
  Empty,
  Slider,
  Tooltip,
  message,
} from 'antd'
import type { RangePickerProps } from 'antd/es/date-picker'
import type { PanelProps } from 'antd/es/collapse'
import {
  FilterOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  CheckOutlined,
  CloseOutlined,
  InboxOutlined,
} from '@ant-design/icons'
import type { DeviceStatus, MonitorStatus, LoadLevel, FilterParams } from '@/types'
import { DEVICE_STATUS_MAP, MONITOR_STATUS_MAP, LOAD_LEVEL_MAP } from '@/constants'
import { useDataStore } from '@/store/dataStore'
import { useFilterStore } from '@/store/filterStore'
import { calculateLoadRate } from '@/utils'

const { RangePicker } = DatePicker
const { Text } = Typography

interface AdvancedFilterProps {
  onFilter?: () => void
}

const AdvancedFilter: React.FC<AdvancedFilterProps> = ({ onFilter }) => {
  const { areas, devices } = useDataStore()
  const {
    deviceFilters,
    setDeviceFilter,
    resetDeviceFilters,
    toggleAreaFilter,
    toggleDeviceStatusFilter,
    toggleMonitorStatusFilter,
  } = useFilterStore()

  const handleRangeChange: RangePickerProps['onChange'] = (dates) => {
    if (dates && dates[0] && dates[1]) {
      setDeviceFilter({
        startTime: dates[0].toISOString(),
        endTime: dates[1].toISOString(),
      })
    } else {
      setDeviceFilter({
        startTime: null,
        endTime: null,
      })
    }
  }

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (deviceFilters.areaIds.length > 0) count += deviceFilters.areaIds.length
    if (deviceFilters.deviceStatuses.length > 0) count += deviceFilters.deviceStatuses.length
    if (deviceFilters.monitorStatuses.length > 0) count += deviceFilters.monitorStatuses.length
    if (deviceFilters.minPower !== null || deviceFilters.maxPower !== null) count++
    if (deviceFilters.minLoadRate !== null || deviceFilters.maxLoadRate !== null) count++
    if (deviceFilters.startTime !== null || deviceFilters.endTime !== null) count++
    if (deviceFilters.keyword) count++
    return count
  }, [deviceFilters])

  const hasActiveFilters = activeFilterCount > 0

  const powerRange = useMemo(() => {
    if (devices.length === 0) return { min: 0, max: 1000 }
    const powers = devices.map((d) => d.currentPower)
    return {
      min: Math.floor(Math.min(...powers)),
      max: Math.ceil(Math.max(...powers)),
    }
  }, [devices])

  const handleQuickSelectLoadLevel = useCallback(
    (level: LoadLevel) => {
      const currentIsSelected =
        (level === 'low' && deviceFilters.maxLoadRate === 30 && deviceFilters.minLoadRate === null) ||
        (level === 'normal' && deviceFilters.minLoadRate === 30 && deviceFilters.maxLoadRate === 80) ||
        (level === 'high' && deviceFilters.minLoadRate === 80 && deviceFilters.maxLoadRate === 100) ||
        (level === 'overload' && deviceFilters.minLoadRate === 100)

      if (currentIsSelected) {
        setDeviceFilter({ minLoadRate: null, maxLoadRate: null })
      } else {
        if (level === 'low') {
          setDeviceFilter({ minLoadRate: null, maxLoadRate: 30 })
        } else if (level === 'normal') {
          setDeviceFilter({ minLoadRate: 30, maxLoadRate: 80 })
        } else if (level === 'high') {
          setDeviceFilter({ minLoadRate: 80, maxLoadRate: 100 })
        } else if (level === 'overload') {
          setDeviceFilter({ minLoadRate: 100, maxLoadRate: null })
        }
      }
    },
    [deviceFilters.minLoadRate, deviceFilters.maxLoadRate, setDeviceFilter]
  )

  const handleLoadRateSliderChange = useCallback(
    (value: [number, number]) => {
      setDeviceFilter({
        minLoadRate: value[0] === 0 ? null : value[0],
        maxLoadRate: value[1] === 100 ? null : value[1],
      })
    },
    [setDeviceFilter]
  )

  const currentLoadRateRange: [number, number] = [
    deviceFilters.minLoadRate ?? 0,
    deviceFilters.maxLoadRate ?? 100,
  ]

  const handleClearAll = useCallback(() => {
    resetDeviceFilters()
    message.info('已清除所有筛选条件')
    onFilter?.()
  }, [resetDeviceFilters, onFilter])

  const handleApplyFilter = useCallback(() => {
    message.success(`已应用 ${activeFilterCount} 个筛选条件`)
    onFilter?.()
  }, [activeFilterCount, onFilter])

  const getLoadLevelSelected = (level: LoadLevel): boolean => {
    return (
      (level === 'low' && deviceFilters.maxLoadRate === 30 && deviceFilters.minLoadRate === null) ||
      (level === 'normal' && deviceFilters.minLoadRate === 30 && deviceFilters.maxLoadRate === 80) ||
      (level === 'high' && deviceFilters.minLoadRate === 80 && deviceFilters.maxLoadRate === 100) ||
      (level === 'overload' && deviceFilters.minLoadRate === 100)
    )
  }

  const selectedFilterLabels = useMemo(() => {
    const labels: { key: string; label: React.ReactNode; onClose: () => void }[] = []

    deviceFilters.areaIds.forEach((areaId) => {
      const area = areas.find((a) => a.id === areaId)
      if (area) {
        labels.push({
          key: `area-${areaId}`,
          label: `区域: ${area.name}`,
          onClose: () => toggleAreaFilter(areaId),
        })
      }
    })

    deviceFilters.deviceStatuses.forEach((status) => {
      labels.push({
        key: `status-${status}`,
        label: `状态: ${DEVICE_STATUS_MAP[status].text}`,
        onClose: () => toggleDeviceStatusFilter(status),
      })
    })

    deviceFilters.monitorStatuses.forEach((status) => {
      labels.push({
        key: `monitor-${status}`,
        label: `监控: ${MONITOR_STATUS_MAP[status].text}`,
        onClose: () => toggleMonitorStatusFilter(status),
      })
    })

    if (deviceFilters.minLoadRate !== null || deviceFilters.maxLoadRate !== null) {
      const min = deviceFilters.minLoadRate ?? 0
      const max = deviceFilters.maxLoadRate ?? 100
      labels.push({
        key: 'load',
        label: `负载率: ${min}% - ${max}%`,
        onClose: () => setDeviceFilter({ minLoadRate: null, maxLoadRate: null }),
      })
    }

    if (deviceFilters.minPower !== null || deviceFilters.maxPower !== null) {
      const min = deviceFilters.minPower ?? 0
      const max = deviceFilters.maxPower ?? '∞'
      labels.push({
        key: 'power',
        label: `功率: ${min}kW - ${max}kW`,
        onClose: () => setDeviceFilter({ minPower: null, maxPower: null }),
      })
    }

    if (deviceFilters.keyword) {
      labels.push({
        key: 'keyword',
        label: `关键词: ${deviceFilters.keyword}`,
        onClose: () => setDeviceFilter({ keyword: '' }),
      })
    }

    return labels
  }, [
    deviceFilters,
    areas,
    toggleAreaFilter,
    toggleDeviceStatusFilter,
    toggleMonitorStatusFilter,
    setDeviceFilter,
  ])

  const filterItems: PanelProps[] = [
    {
      key: '1',
      label: (
        <Space>
          <ThunderboltOutlined />
          <span>基础筛选</span>
          {(deviceFilters.areaIds.length > 0 ||
            deviceFilters.deviceStatuses.length > 0 ||
            deviceFilters.monitorStatuses.length > 0) && (
            <Badge count="●" color="#1890ff" offset={[4, 4]}>
              <span />
            </Badge>
          )}
        </Space>
      ),
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              所属区域 ({deviceFilters.areaIds.length} 已选)
            </Text>
            {areas.length > 0 ? (
              <Checkbox.Group value={deviceFilters.areaIds}>
                <Space wrap size={[8, 8]}>
                  {areas.map((area) => (
                    <Checkbox key={area.id} value={area.id}>
                      <Tag color="blue">{area.name}</Tag>
                    </Checkbox>
                  ))}
                </Space>
              </Checkbox.Group>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无区域数据"
                imageStyle={{ height: 40 }}
              />
            )}
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              设备状态 ({deviceFilters.deviceStatuses.length} 已选)
            </Text>
            <Checkbox.Group value={deviceFilters.deviceStatuses}>
              <Space wrap size={[8, 8]}>
                {(Object.keys(DEVICE_STATUS_MAP) as DeviceStatus[]).map((status) => {
                  const { text, color } = DEVICE_STATUS_MAP[status]
                  return (
                    <Checkbox key={status} value={status}>
                      <Tag color={color}>{text}</Tag>
                    </Checkbox>
                  )
                })}
              </Space>
            </Checkbox.Group>
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              监控状态 ({deviceFilters.monitorStatuses.length} 已选)
            </Text>
            <Checkbox.Group value={deviceFilters.monitorStatuses}>
              <Space wrap size={[8, 8]}>
                {(Object.keys(MONITOR_STATUS_MAP) as MonitorStatus[]).map((status) => {
                  const { text, color } = MONITOR_STATUS_MAP[status]
                  return (
                    <Checkbox key={status} value={status}>
                      <Tag color={color}>{text}</Tag>
                    </Checkbox>
                  )
                })}
              </Space>
            </Checkbox.Group>
          </div>
        </Space>
      ),
    },
    {
      key: '2',
      label: (
        <Space>
          <InboxOutlined />
          <span>功率与负载筛选</span>
          {(deviceFilters.minPower !== null ||
            deviceFilters.maxPower !== null ||
            deviceFilters.minLoadRate !== null ||
            deviceFilters.maxLoadRate !== null) && (
            <Badge count="●" color="#faad14" offset={[4, 4]}>
              <span />
            </Badge>
          )}
        </Space>
      ),
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              功率范围 (kW) - 数据范围: {powerRange.min} ~ {powerRange.max}
            </Text>
            <Space wrap>
              <Space>
                <InputNumber
                  placeholder="最小值"
                  value={deviceFilters.minPower}
                  onChange={(v) => setDeviceFilter({ minPower: v })}
                  min={0}
                  step={10}
                  style={{ width: 150 }}
                />
                <span>~</span>
                <InputNumber
                  placeholder="最大值"
                  value={deviceFilters.maxPower}
                  onChange={(v) => setDeviceFilter({ maxPower: v })}
                  min={0}
                  step={10}
                  style={{ width: 150 }}
                />
              </Space>
              {(deviceFilters.minPower !== null || deviceFilters.maxPower !== null) && (
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={() => setDeviceFilter({ minPower: null, maxPower: null })}
                >
                  清除
                </Button>
              )}
            </Space>
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              负载率范围 (%)
            </Text>
            <Tooltip title="拖动滑块选择负载率范围，点击快速选择按钮也可以">
              <Slider
                range
                min={0}
                max={100}
                step={5}
                value={currentLoadRateRange}
                onChange={handleLoadRateSliderChange}
                marks={{
                  0: '0%',
                  30: '30%',
                  80: '80%',
                  100: '100%',
                }}
                style={{ margin: '0 20px' }}
              />
            </Tooltip>
            <Space>
              <InputNumber
                placeholder="最小值"
                value={deviceFilters.minLoadRate}
                onChange={(v) => setDeviceFilter({ minLoadRate: v })}
                min={0}
                max={100}
                step={5}
                style={{ width: 150 }}
              />
              <span>~</span>
              <InputNumber
                placeholder="最大值"
                value={deviceFilters.maxLoadRate}
                onChange={(v) => setDeviceFilter({ maxLoadRate: v })}
                min={0}
                max={100}
                step={5}
                style={{ width: 150 }}
              />
            </Space>
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              快速选择负载级别
            </Text>
            <Space wrap size={[8, 8]}>
              {(Object.keys(LOAD_LEVEL_MAP) as LoadLevel[]).map((level) => {
                const { text, color } = LOAD_LEVEL_MAP[level]
                const isSelected = getLoadLevelSelected(level)
                return (
                  <Button
                    key={level}
                    type={isSelected ? 'primary' : 'default'}
                    size="small"
                    icon={isSelected ? <CheckOutlined /> : undefined}
                    onClick={() => handleQuickSelectLoadLevel(level)}
                    style={{
                      background: isSelected ? undefined : `var(--ant-${color}-1, #f5f5f5)`,
                      borderColor: isSelected ? undefined : `var(--ant-${color}-3, #d9d9d9)`,
                    }}
                  >
                    {text}
                  </Button>
                )
              })}
              {(deviceFilters.minLoadRate !== null || deviceFilters.maxLoadRate !== null) && (
                <Button
                  type="text"
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={() => setDeviceFilter({ minLoadRate: null, maxLoadRate: null })}
                >
                  清除
                </Button>
              )}
            </Space>
          </div>
        </Space>
      ),
    },
    {
      key: '3',
      label: (
        <Space>
          <ClockCircleOutlined />
          <span>时间与关键词</span>
          {(deviceFilters.startTime !== null ||
            deviceFilters.endTime !== null ||
            deviceFilters.keyword) && (
            <Badge count="●" color="#722ed1" offset={[4, 4]}>
              <span />
            </Badge>
          )}
        </Space>
      ),
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              时间范围
            </Text>
            <Space wrap>
              <RangePicker
                showTime
                onChange={handleRangeChange}
                style={{ width: 320 }}
              />
              {(deviceFilters.startTime !== null || deviceFilters.endTime !== null) && (
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={() =>
                    setDeviceFilter({ startTime: null, endTime: null })
                  }
                >
                  清除
                </Button>
              )}
            </Space>
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>
              关键词搜索
            </Text>
            <Space wrap>
              <Input
                placeholder="搜索设备名称、编号、制造商、型号..."
                prefix={<SearchOutlined />}
                value={deviceFilters.keyword}
                onChange={(e) => setDeviceFilter({ keyword: e.target.value })}
                allowClear
                style={{ maxWidth: 400 }}
              />
            </Space>
          </div>
        </Space>
      ),
    },
  ]

  return (
    <Card
      title={
        <Space>
          <FilterOutlined />
          <span>高级筛选</span>
          {hasActiveFilters && (
            <Tag color="blue">
              <Space size={4}>
                <span>{activeFilterCount} 个条件</span>
              </Space>
            </Tag>
          )}
        </Space>
      }
      extra={
        <Space>
          {hasActiveFilters && (
            <Button icon={<ReloadOutlined />} onClick={handleClearAll}>
              清除所有筛选
            </Button>
          )}
          <Button type="primary" onClick={handleApplyFilter} icon={<CheckOutlined />}>
            应用筛选
          </Button>
        </Space>
      }
    >
      {hasActiveFilters && selectedFilterLabels.length > 0 && (
        <Card
          size="small"
          style={{ marginBottom: 16, background: '#f0f5ff' }}
          bordered={false}
        >
          <Space size={[8, 8]} wrap>
            <Text type="secondary">已选筛选条件：</Text>
            {selectedFilterLabels.map((item) => (
              <Tag
                key={item.key}
                color="blue"
                closable
                onClose={(e) => {
                  e.preventDefault()
                  item.onClose()
                }}
              >
                {item.label}
              </Tag>
            ))}
          </Space>
        </Card>
      )}

      <Collapse defaultActiveKey={['1']} items={filterItems} accordion />
    </Card>
  )
}

export default AdvancedFilter

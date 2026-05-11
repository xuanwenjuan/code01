import React from 'react'
import { Card, Space, Button, Checkbox, InputNumber, Input, DatePicker, Tag, Collapse, Typography } from 'antd'
import type { RangePickerProps } from 'antd/es/date-picker'
import type { PanelProps } from 'antd/es/collapse'
import { FilterOutlined, ReloadOutlined, ThunderboltOutlined } from '@ant-design/icons'
import type { DeviceStatus, MonitorStatus, LoadLevel } from '@/types'
import { DEVICE_STATUS_MAP, MONITOR_STATUS_MAP, LOAD_LEVEL_MAP } from '@/constants'
import { useDataStore } from '@/store/dataStore'
import { useFilterStore } from '@/store/filterStore'

const { RangePicker } = DatePicker
const { Text } = Typography

interface AdvancedFilterProps {
  onFilter?: () => void
}

const AdvancedFilter: React.FC<AdvancedFilterProps> = ({ onFilter }) => {
  const { areas } = useDataStore()
  const { deviceFilters, setDeviceFilter, resetDeviceFilters, toggleAreaFilter, toggleDeviceStatusFilter, toggleMonitorStatusFilter } = useFilterStore()

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

  const hasActiveFilters =
    deviceFilters.areaIds.length > 0 ||
    deviceFilters.deviceStatuses.length > 0 ||
    deviceFilters.monitorStatuses.length > 0 ||
    deviceFilters.minPower !== null ||
    deviceFilters.maxPower !== null ||
    deviceFilters.minLoadRate !== null ||
    deviceFilters.maxLoadRate !== null ||
    deviceFilters.startTime !== null ||
    deviceFilters.endTime !== null ||
    deviceFilters.keyword !== ''

  const filterItems: PanelProps[] = [
    {
      key: '1',
      label: (
        <Space>
          <ThunderboltOutlined />
          <span>基础筛选</span>
          {deviceFilters.areaIds.length > 0 && <Tag color="blue">{deviceFilters.areaIds.length}</Tag>}
          {deviceFilters.deviceStatuses.length > 0 && <Tag color="green">{deviceFilters.deviceStatuses.length}</Tag>}
          {deviceFilters.monitorStatuses.length > 0 && <Tag color="orange">{deviceFilters.monitorStatuses.length}</Tag>}
        </Space>
      ),
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>所属区域</Text>
            <Space wrap size={[8, 8]}>
              {areas.map((area) => (
                <Checkbox
                  key={area.id}
                  checked={deviceFilters.areaIds.includes(area.id)}
                  onChange={() => toggleAreaFilter(area.id)}
                >
                  <Tag color="blue">{area.name}</Tag>
                </Checkbox>
              ))}
            </Space>
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>设备状态</Text>
            <Space wrap size={[8, 8]}>
              {(Object.keys(DEVICE_STATUS_MAP) as DeviceStatus[]).map((status) => (
                <Checkbox
                  key={status}
                  checked={deviceFilters.deviceStatuses.includes(status)}
                  onChange={() => toggleDeviceStatusFilter(status)}
                >
                  {DEVICE_STATUS_MAP[status].text}
                </Checkbox>
              ))}
            </Space>
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>监控状态</Text>
            <Space wrap size={[8, 8]}>
              {(Object.keys(MONITOR_STATUS_MAP) as MonitorStatus[]).map((status) => (
                <Checkbox
                  key={status}
                  checked={deviceFilters.monitorStatuses.includes(status)}
                  onChange={() => toggleMonitorStatusFilter(status)}
                >
                  {MONITOR_STATUS_MAP[status].text}
                </Checkbox>
              ))}
            </Space>
          </div>
        </Space>
      ),
    },
    {
      key: '2',
      label: (
        <Space>
          <ThunderboltOutlined />
          <span>功率与负载筛选</span>
          {(deviceFilters.minPower !== null || deviceFilters.maxPower !== null) && <Tag color="blue">功率</Tag>}
          {(deviceFilters.minLoadRate !== null || deviceFilters.maxLoadRate !== null) && <Tag color="orange">负载</Tag>}
        </Space>
      ),
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>功率范围 (kW)</Text>
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
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>负载率范围 (%)</Text>
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
            <Text strong style={{ display: 'block', marginBottom: 8 }}>快速选择负载级别</Text>
            <Space wrap size={[8, 8]}>
              {(Object.keys(LOAD_LEVEL_MAP) as LoadLevel[]).map((level) => {
                const { text, color } = LOAD_LEVEL_MAP[level]
                return (
                  <Button
                    key={level}
                    type={
                      (level === 'low' && deviceFilters.maxLoadRate === 30 && deviceFilters.minLoadRate === null) ||
                      (level === 'normal' && deviceFilters.minLoadRate === 30 && deviceFilters.maxLoadRate === 80) ||
                      (level === 'high' && deviceFilters.minLoadRate === 80 && deviceFilters.maxLoadRate === 100) ||
                      (level === 'overload' && deviceFilters.minLoadRate === 100)
                        ? 'primary'
                        : 'default'
                    }
                    size="small"
                    onClick={() => {
                      if (level === 'low') {
                        setDeviceFilter({ minLoadRate: null, maxLoadRate: 30 })
                      } else if (level === 'normal') {
                        setDeviceFilter({ minLoadRate: 30, maxLoadRate: 80 })
                      } else if (level === 'high') {
                        setDeviceFilter({ minLoadRate: 80, maxLoadRate: 100 })
                      } else if (level === 'overload') {
                        setDeviceFilter({ minLoadRate: 100, maxLoadRate: null })
                      }
                    }}
                  >
                    {text}
                  </Button>
                )
              })}
            </Space>
          </div>
        </Space>
      ),
    },
    {
      key: '3',
      label: (
        <Space>
          <ThunderboltOutlined />
          <span>时间与关键词</span>
          {(deviceFilters.startTime !== null || deviceFilters.endTime !== null) && <Tag color="purple">时间</Tag>}
          {deviceFilters.keyword !== '' && <Tag color="cyan">关键词</Tag>}
        </Space>
      ),
      children: (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>时间范围</Text>
            <RangePicker
              showTime
              onChange={handleRangeChange}
              style={{ width: 320 }}
            />
          </div>

          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>关键词搜索</Text>
            <Input
              placeholder="搜索设备名称、编号、制造商..."
              value={deviceFilters.keyword}
              onChange={(e) => setDeviceFilter({ keyword: e.target.value })}
              allowClear
              style={{ maxWidth: 400 }}
            />
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
          {hasActiveFilters && <Tag color="red">有筛选条件</Tag>}
        </Space>
      }
      extra={
        <Space>
          {hasActiveFilters && (
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                resetDeviceFilters()
                onFilter?.()
              }}
            >
              清除所有筛选
            </Button>
          )}
          <Button type="primary" onClick={onFilter}>
            应用筛选
          </Button>
        </Space>
      }
    >
      <Collapse
        defaultActiveKey={['1']}
        items={filterItems}
        accordion
      />
    </Card>
  )
}

export default AdvancedFilter

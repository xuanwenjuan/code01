import React, { useState } from 'react'
import { Dropdown, Button, Space, Input, List } from 'antd'
import { EnvironmentOutlined, SearchOutlined } from '@ant-design/icons'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentCity } from '@/store/slices/appSlice'
import { mockCities } from '@/mock/data'

const CitySelector = () => {
  const dispatch = useDispatch()
  const currentCity = useSelector((state) => state.app.currentCity)
  const [searchText, setSearchText] = useState('')

  const filteredCities = mockCities.filter((city) =>
    city.includes(searchText)
  )

  const handleCitySelect = (city) => {
    dispatch(setCurrentCity(city))
    setSearchText('')
  }

  const menu = {
    items: [
      {
        key: 'search',
        label: (
          <Input
            placeholder="搜索城市"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            style={{ marginBottom: 8 }}
          />
        ),
        disabled: true,
      },
      {
        type: 'divider',
      },
      {
        key: 'hot',
        label: <span style={{ color: '#8c8c8c', fontSize: '12px', padding: '0 12px' }}>热门城市</span>,
        disabled: true,
      },
      ...filteredCities.slice(0, 15).map((city) => ({
        key: city,
        label: city,
        onClick: () => handleCitySelect(city),
      })),
    ],
  }

  return (
    <Dropdown menu={menu} placement="bottomLeft" trigger={['click']}>
      <Button type="text" icon={<EnvironmentOutlined />}>
        <Space size="small">
          <span>{currentCity}</span>
        </Space>
      </Button>
    </Dropdown>
  )
}

export default CitySelector

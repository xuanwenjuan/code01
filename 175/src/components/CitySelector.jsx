import { useState } from 'react'
import { Modal, Tabs, Tag, Button } from 'antd'
import { EnvironmentOutlined } from '@ant-design/icons'
import { useCity } from '@/hooks/useCity'

const hotCities = ['北京', '上海', '广州', '深圳', '杭州', '南京', '成都', '武汉', '西安', '重庆']

function CitySelector() {
  const [open, setOpen] = useState(false)
  const { currentCity, cityList, changeCity } = useCity()

  const handleCityClick = (city) => {
    changeCity(city)
    setOpen(false)
  }

  const groupByInitial = (cities) => {
    const groups = {}
    cities.forEach((city) => {
      const initial = city.pinyin[0].toUpperCase()
      if (!groups[initial]) {
        groups[initial] = []
      }
      groups[initial].push(city)
    })
    return groups
  }

  const groupedCities = groupByInitial(cityList)

  return (
    <>
      <Button
        type="text"
        icon={<EnvironmentOutlined />}
        onClick={() => setOpen(true)}
        style={{ color: '#fff' }}
      >
        {currentCity}
      </Button>
      <Modal
        title="选择城市"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={600}
      >
        <Tabs
          defaultActiveKey="hot"
          items={[
            {
              key: 'hot',
              label: '热门城市',
              children: (
                <div style={{ padding: '16px 0' }}>
                  {hotCities.map((city) => (
                    <Tag.CheckableTag
                      key={city}
                      checked={currentCity === city}
                      onChange={() => handleCityClick(city)}
                      style={{ margin: '8px', fontSize: 14, padding: '8px 16px' }}
                    >
                      {city}
                    </Tag.CheckableTag>
                  ))}
                </div>
              )
            },
            {
              key: 'all',
              label: '全部城市',
              children: (
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {Object.keys(groupedCities)
                    .sort()
                    .map((letter) => (
                      <div key={letter} style={{ marginBottom: 16 }}>
                        <div style={{ fontWeight: 'bold', marginBottom: 8 }}>{letter}</div>
                        {groupedCities[letter].map((city) => (
                          <Tag.CheckableTag
                            key={city.id}
                            checked={currentCity === city.name}
                            onChange={() => handleCityClick(city.name)}
                            style={{ margin: '4px', padding: '4px 12px' }}
                          >
                            {city.name}
                          </Tag.CheckableTag>
                        ))}
                      </div>
                    ))}
                </div>
              )
            }
          ]}
        />
      </Modal>
    </>
  )
}

export default CitySelector

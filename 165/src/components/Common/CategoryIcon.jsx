import * as Icons from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { memo } from 'react'

const CategoryIcon = memo(({ category }) => {
  const navigate = useNavigate()
  const IconComponent = Icons[category.icon] || Icons.AppstoreOutlined

  const handleClick = () => {
    navigate(`/services?category=${category.id}`)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        padding: 16,
        borderRadius: 8,
        transition: 'all 0.3s',
      }}
      onClick={handleClick}
      onMouseEnter={e => {
        e.currentTarget.style.backgroundColor = '#f5f5f5'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.backgroundColor = 'transparent'
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          backgroundColor: category.color + '15',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
        }}
      >
        <IconComponent style={{ fontSize: 28, color: category.color }} />
      </div>
      <span style={{ fontSize: 14, color: '#333' }}>{category.name}</span>
    </div>
  )
})

CategoryIcon.displayName = 'CategoryIcon'

export default CategoryIcon

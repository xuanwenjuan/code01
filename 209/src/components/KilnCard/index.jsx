import { Card, Image, Tag } from 'antd'

const KilnCard = ({ kiln, onClick }) => {
  return (
    <Card
      hoverable
      className="pottery-card kiln-card"
      onClick={() => onClick?.(kiln)}
      styles={{ body: { padding: 0 } }}
      cover={
        <div style={{ position: 'relative' }}>
          <Image
            src={kiln.image}
            alt={kiln.name}
            height={200}
            style={{ objectFit: 'cover' }}
            preview={false}
          />
          <div className="kiln-overlay">
            <h3 style={{ color: 'white', margin: 0, fontSize: 18 }}>{kiln.name}</h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', margin: '4px 0 0', fontSize: 13 }}>
              {kiln.location} · {kiln.history}
            </p>
          </div>
        </div>
      }
    >
      <div style={{ padding: 16 }}>
        <p style={{
          margin: '0 0 12px',
          color: '#666',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: 44
        }}>
          {kiln.description}
        </p>
        <div>
          {kiln.specialties?.map((item, index) => (
            <Tag key={index} color="brown" style={{ marginBottom: 4 }}>
              {item}
            </Tag>
          ))}
        </div>
      </div>
    </Card>
  )
}

export default KilnCard

import React, { useEffect, useState } from 'react'
import { Modal, Card, Button, Row, Col } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { fetchEcoKnowledge } from '../store/slices/dataSlice'
import LoadingState from './LoadingState'

const EcoKnowledgeModal = ({ visible, onClose }) => {
  const dispatch = useDispatch()
  const { ecoKnowledge, loading } = useSelector(state => state.data)
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    if (visible && ecoKnowledge.length === 0) {
      dispatch(fetchEcoKnowledge())
    }
  }, [visible, dispatch, ecoKnowledge.length])

  const currentKnowledge = ecoKnowledge[selectedIndex]

  if (loading.ecoKnowledge) {
    return <LoadingState />
  }

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>🌿</span>
          <span>草木染环保小知识</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={700}
      footer={[
        <Button key="close" onClick={onClose}>
          关闭
        </Button>
      ]}
    >
      {ecoKnowledge.length > 0 && (
        <div>
          <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
            {ecoKnowledge.map((item, index) => (
              <Col xs={8} key={item.id}>
                <Card
                  hoverable
                  style={{
                    textAlign: 'center',
                    cursor: 'pointer',
                    borderColor: selectedIndex === index ? '#2d5a27' : '#f0f0f0',
                    background: selectedIndex === index ? '#f6ffed' : 'white'
                  }}
                  onClick={() => setSelectedIndex(index)}
                  bodyStyle={{ padding: '16px 8px' }}
                >
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
                  <div style={{ 
                    fontSize: 12, 
                    color: selectedIndex === index ? '#2d5a27' : '#666',
                    fontWeight: selectedIndex === index ? 600 : 400
                  }}>
                    {item.title}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {currentKnowledge && (
            <Card style={{ background: '#fafafa' }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ 
                  fontSize: 48, 
                  lineHeight: 1,
                  flexShrink: 0
                }}>
                  {currentKnowledge.icon}
                </div>
                <div>
                  <h3 style={{ 
                    color: '#2d5a27', 
                    marginBottom: 12,
                    fontSize: 18
                  }}>
                    {currentKnowledge.title}
                  </h3>
                  <p style={{ 
                    color: '#333', 
                    lineHeight: 1.8,
                    fontSize: 14,
                    margin: 0
                  }}>
                    {currentKnowledge.content}
                  </p>
                </div>
              </div>
            </Card>
          )}

          <div style={{ 
            marginTop: 16, 
            textAlign: 'center', 
            color: '#999', 
            fontSize: 12 
          }}>
            点击上方卡片查看更多环保知识
          </div>
        </div>
      )}
    </Modal>
  )
}

export default EcoKnowledgeModal

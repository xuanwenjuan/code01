import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { 
  Row, Col, Card, Tag, Steps, Descriptions, Button, Space, 
  Divider, Timeline, List, Typography, FloatButton, Badge,
  Tooltip
} from 'antd'
import { 
  ArrowLeftOutlined, EnvironmentOutlined, CalendarOutlined,
  InfoCircleOutlined, BulbOutlined
} from '@ant-design/icons'
import { fetchMaterials } from '../store/slices/dataSlice'
import LoadingState from '../components/LoadingState'
import EmptyState from '../components/EmptyState'
import EcoKnowledgeModal from '../components/EcoKnowledgeModal'

const { Title, Text } = Typography

const MaterialDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { materials, loading } = useSelector(state => state.data)
  
  const [ecoModalVisible, setEcoModalVisible] = useState(false)
  const [showTip, setShowTip] = useState(true)

  useEffect(() => {
    if (materials.length === 0) {
      dispatch(fetchMaterials())
    }
  }, [dispatch, materials.length])

  const material = materials.find(m => m.id === parseInt(id))

  if (loading.materials) {
    return <LoadingState />
  }

  if (!material) {
    return <EmptyState description="染材不存在" />
  }

  const stepIcons = {
    1: '🌱',
    2: '💧',
    3: '🔄',
    4: '🔍',
    5: '⚗️',
    6: '🎨',
    7: '✨'
  }

  const relatedTips = [
    '染材采收后应及时处理，避免新鲜材料腐烂变质',
    '炮制过程中产生的废渣可以作为有机肥料',
    '传统炮制工艺注重时令，不同季节采收的染材色素含量不同',
    '天然染材炮制过程不添加化学助剂，对环境友好'
  ]

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/')}
            style={{ color: 'white', marginBottom: 16, paddingLeft: 0 }}
          >
            返回首页
          </Button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <div 
              className="dye-color-swatch"
              style={{ 
                width: 100, 
                height: 100, 
                borderWidth: 4,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}
            />
            <div>
              <h1 style={{ color: 'white', marginBottom: 8 }}>{material.name}</h1>
              <Space wrap>
                <Tag color="green">{material.category}</Tag>
                <Tag color="blue">
                  <EnvironmentOutlined style={{ marginRight: 4 }} />
                  产地：{material.origin}
                </Tag>
                <Tag color="orange">
                  <CalendarOutlined style={{ marginRight: 4 }} />
                  {material.season}
                </Tag>
              </Space>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col xs={24} md={16}>
            <Card title="染材介绍" style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: '#333' }}>
                {material.description}
              </p>
              <Divider style={{ margin: '16px 0' }} />
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Tag color="processing" icon={<InfoCircleOutlined />}>
                  特性：{material.properties}
                </Tag>
              </div>
            </Card>

            <Card 
              title={
                <Space>
                  <span>炮制工艺</span>
                  <Tooltip title="传统草木染工艺遵循自然规律，是祖先留给我们的宝贵财富">
                    <BulbOutlined style={{ color: '#faad14' }} />
                  </Tooltip>
                </Space>
              } 
              style={{ marginBottom: 24 }}
            >
              <Timeline
                mode="left"
                items={material.processing.map(step => ({
                  color: '#2d5a27',
                  dot: (
                    <span style={{ 
                      fontSize: 20, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      {stepIcons[step.step] || '📝'}
                    </span>
                  ),
                  label: (
                    <Tag color="green" style={{ margin: 0 }}>
                      步骤 {step.step}
                    </Tag>
                  ),
                  children: (
                    <Card size="small" style={{ marginBottom: 8 }}>
                      <Title level={5} style={{ marginBottom: 4 }}>
                        {step.title}
                      </Title>
                      <Text type="secondary" style={{ lineHeight: 1.6 }}>
                        {step.desc}
                      </Text>
                    </Card>
                  )
                }))}
              />
            </Card>

            {showTip && (
              <Card 
                type="inner" 
                style={{ 
                  marginBottom: 24, 
                  background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
                  borderColor: '#b7eb8f'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <span style={{ fontSize: 32 }}>💡</span>
                    <div>
                      <div style={{ fontWeight: 600, color: '#389e0d', marginBottom: 8 }}>
                        炮制小贴士
                      </div>
                      <List
                        size="small"
                        dataSource={relatedTips}
                        renderItem={item => (
                          <List.Item style={{ border: 'none', padding: '4px 0' }}>
                            <Text style={{ color: '#5b8c00' }}>• {item}</Text>
                          </List.Item>
                        )}
                      />
                    </div>
                  </div>
                  <Button 
                    type="text" 
                    size="small" 
                    onClick={() => setShowTip(false)}
                    style={{ color: '#5b8c00' }}
                  >
                    收起
                  </Button>
                </div>
              </Card>
            )}
          </Col>
          <Col xs={24} md={8}>
            <Card title="基本信息" style={{ marginBottom: 24 }}>
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="名称">{material.name}</Descriptions.Item>
                <Descriptions.Item label="分类">{material.category}</Descriptions.Item>
                <Descriptions.Item label="产地">{material.origin}</Descriptions.Item>
                <Descriptions.Item label="采收季节">{material.season}</Descriptions.Item>
                <Descriptions.Item label="特性">{material.properties}</Descriptions.Item>
                <Descriptions.Item label="染色颜色">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div 
                      style={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: 4, 
                        background: material.color 
                      }}
                    />
                    <span>{material.color}</span>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="炮制步骤">
                  <Badge count={material.processing.length} color="#2d5a27" />
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card 
              title="相关教程" 
              style={{ marginBottom: 24 }}
              extra={
                <Button type="link" size="small" onClick={() => navigate('/tutorials')}>
                  更多
                </Button>
              }
            >
              <List
                size="small"
                dataSource={[
                  { title: `${material.name}染色入门`, level: '入门' },
                  { title: `${material.name}染液提取技术`, level: '进阶' },
                  { title: `${material.name}色牢度提升技巧`, level: '高级' }
                ]}
                renderItem={item => (
                  <List.Item 
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate('/tutorials')}
                  >
                    <List.Item.Meta
                      title={item.title}
                      description={
                        <Tag 
                          color={item.level === '入门' ? 'green' : item.level === '进阶' ? 'orange' : 'red'}
                          style={{ margin: 0 }}
                        >
                          {item.level}
                        </Tag>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </div>

      <FloatButton
        icon={<span style={{ fontSize: 20 }}>🌿</span>}
        description="环保知识"
        type="primary"
        style={{ right: 24, bottom: 24 }}
        onClick={() => setEcoModalVisible(true)}
      />

      <EcoKnowledgeModal 
        visible={ecoModalVisible} 
        onClose={() => setEcoModalVisible(false)} 
      />
    </div>
  )
}

export default MaterialDetail

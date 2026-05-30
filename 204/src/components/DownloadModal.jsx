import React, { useState } from 'react'
import { Modal, List, Button, Tag, Progress, message, Select } from 'antd'
import { DownloadOutlined, FileTextOutlined, FileExcelOutlined, FileWordOutlined, VideoCameraOutlined } from '@ant-design/icons'

const fileTypeIcons = {
  pdf: <FileTextOutlined style={{ color: '#f5222d' }} />,
  excel: <FileExcelOutlined style={{ color: '#52c41a' }} />,
  doc: <FileWordOutlined style={{ color: '#1890ff' }} />,
  video: <VideoCameraOutlined style={{ color: '#722ed1' }} />
}

const fileTypeColors = {
  pdf: 'red',
  excel: 'green',
  doc: 'blue',
  video: 'purple'
}

const DownloadModal = ({ visible, onClose, materials, tutorialTitle }) => {
  const [downloadingId, setDownloadingId] = useState(null)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [filterType, setFilterType] = useState('all')

  const segments = [...new Set(materials.map(m => m.segment))]
  
  const filteredMaterials = filterType === 'all' 
    ? materials 
    : materials.filter(m => m.segment === filterType)

  const handleDownload = (material) => {
    setDownloadingId(material.id)
    setDownloadProgress(0)
    
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setDownloadingId(null)
          message.success(`${material.title} 下载完成`)
          return 0
        }
        return prev + Math.random() * 20
      })
    }, 300)
  }

  const handleBatchDownload = () => {
    message.info(`开始批量下载 ${filteredMaterials.length} 个文件`)
    filteredMaterials.forEach((material, index) => {
      setTimeout(() => {
        message.success(`${material.title} 下载完成`)
      }, (index + 1) * 1000)
    })
  }

  return (
    <Modal
      title={`下载素材 - ${tutorialTitle}`}
      open={visible}
      onCancel={onClose}
      width={700}
      footer={[
        <Button key="close" onClick={onClose}>关闭</Button>,
        <Button 
          key="batch" 
          type="primary" 
          icon={<DownloadOutlined />}
          onClick={handleBatchDownload}
          disabled={filteredMaterials.length === 0}
        >
          批量下载 ({filteredMaterials.length})
        </Button>
      ]}
    >
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          共 {materials.length} 个素材文件
        </div>
        <Select
          value={filterType}
          onChange={setFilterType}
          style={{ width: 200 }}
          placeholder="按分段筛选"
        >
          <Select.Option value="all">全部分段</Select.Option>
          {segments.map(seg => (
            <Select.Option key={seg} value={seg}>{seg}</Select.Option>
          ))}
        </Select>
      </div>

      {segments.map(segment => {
        const segmentMaterials = filteredMaterials.filter(m => m.segment === segment)
        if (segmentMaterials.length === 0) return null
        
        return (
          <div key={segment} style={{ marginBottom: 24 }}>
            <div style={{ 
              marginBottom: 12, 
              paddingBottom: 8,
              borderBottom: '1px solid #f0f0f0',
              fontWeight: 500,
              color: '#2d5a27'
            }}>
              📁 {segment}
            </div>
            <List
              dataSource={segmentMaterials}
              renderItem={material => (
                <List.Item
                  key={material.id}
                  actions={[
                    downloadingId === material.id ? (
                      <div style={{ width: 120 }}>
                        <Progress 
                          percent={Math.min(100, Math.floor(downloadProgress))} 
                          size="small"
                          showInfo={false}
                        />
                      </div>
                    ) : (
                      <Button 
                        type="primary" 
                        size="small"
                        icon={<DownloadOutlined />}
                        onClick={() => handleDownload(material)}
                      >
                        下载
                      </Button>
                    )
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <div style={{ 
                        fontSize: 24, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        background: '#f5f5f5',
                        borderRadius: 8
                      }}>
                        {fileTypeIcons[material.type]}
                      </div>
                    }
                    title={
                      <span>
                        {material.title}
                        <Tag 
                          color={fileTypeColors[material.type]} 
                          style={{ marginLeft: 8, fontSize: 11 }}
                        >
                          {material.type.toUpperCase()}
                        </Tag>
                      </span>
                    }
                    description={material.size}
                  />
                </List.Item>
              )}
            />
          </div>
        )
      })}

      {filteredMaterials.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
          该分段暂无素材文件
        </div>
      )}
    </Modal>
  )
}

export default DownloadModal

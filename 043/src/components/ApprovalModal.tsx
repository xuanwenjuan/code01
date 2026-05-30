import { useState } from 'react'
import { Modal, Form, Input, Select, DatePicker, InputNumber, Button, Space, message, Steps, Tag } from 'antd'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { useAppStore } from '@/store'
import type { Approval, LeaveDetails, ReimbursementDetails, SuppliesDetails } from '@/types'
import dayjs from 'dayjs'

const { TextArea } = Input
const { Step } = Steps

interface ApprovalModalProps {
  approval: Approval | null
  onClose: () => void
}

const ApprovalModal = ({ approval, onClose }: ApprovalModalProps) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const { updateApprovalStatus, currentUser } = useAppStore()

  const isViewerMode = !!approval
  const isMyApproval = approval?.currentApproverId === currentUser?.id && approval?.status === 'pending'

  const handleApprove = async (status: 'approved' | 'rejected') => {
    if (!approval) return
    
    try {
      const values = await form.validateFields()
      setLoading(true)
      
      updateApprovalStatus(approval.id, status, values.comment)
      message.success(status === 'approved' ? '审批通过' : '已驳回')
      onClose()
    } catch (error) {
      console.error('Validation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusTag = (status: Approval['status']) => {
    const colorMap = {
      pending: 'orange',
      approved: 'green',
      rejected: 'red'
    }
    const labelMap = {
      pending: '待审批',
      approved: '已通过',
      rejected: '已驳回'
    }
    return <Tag color={colorMap[status]}>{labelMap[status]}</Tag>
  }

  const renderLeaveDetails = (details: LeaveDetails) => (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      <div>
        <strong>请假类型：</strong>{details.leaveType}
      </div>
      <div>
        <strong>开始时间：</strong>{details.startDate}
      </div>
      <div>
        <strong>结束时间：</strong>{details.endDate}
      </div>
      <div>
        <strong>请假天数：</strong>{details.days} 天
      </div>
      <div>
        <strong>请假原因：</strong>{details.reason}
      </div>
    </Space>
  )

  const renderReimbursementDetails = (details: ReimbursementDetails) => (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      <div>
        <strong>报销总金额：</strong>¥{details.amount}
      </div>
      <div>
        <strong>报销项目：</strong>
        <ul>
          {details.items.map((item, index) => (
            <li key={index}>
              {item.name} - ¥{item.amount} - {item.description}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <strong>报销原因：</strong>{details.reason}
      </div>
    </Space>
  )

  const renderSuppliesDetails = (details: SuppliesDetails) => (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      <div>
        <strong>申领物品：</strong>
        <ul>
          {details.items.map((item, index) => (
            <li key={index}>
              {item.name} - {item.quantity} {item.unit}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <strong>申领原因：</strong>{details.reason}
      </div>
    </Space>
  )

  const renderDetails = () => {
    if (!approval) return null
    switch (approval.type) {
      case 'leave':
        return renderLeaveDetails(approval.details as LeaveDetails)
      case 'reimbursement':
        return renderReimbursementDetails(approval.details as ReimbursementDetails)
      case 'supplies':
        return renderSuppliesDetails(approval.details as SuppliesDetails)
    }
  }

  return (
    <Modal
      title={isViewerMode ? '审批详情' : '新建审批'}
      open={!!approval}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      {approval && (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>审批标题：</strong>{approval.title}
            </div>
            {getStatusTag(approval.status)}
          </div>

          <div>
            <strong>申请人：</strong>{approval.applicantName}
          </div>
          <div>
            <strong>所属部门：</strong>{approval.departmentName}
          </div>
          <div>
            <strong>当前审批人：</strong>{approval.currentApproverName}
          </div>
          <div>
            <strong>申请时间：</strong>{approval.createdAt}
          </div>

          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
            <h4>审批明细</h4>
            {renderDetails()}
          </div>

          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
            <h4>审批流程</h4>
            <Steps direction="vertical" size="small">
              {approval.approvalFlow.map((flow, index) => (
                <Step
                  key={index}
                  title={flow.approverName}
                  description={
                    <Space direction="vertical" size={0}>
                      {flow.status !== 'pending' && (
                        <span>{flow.status === 'approved' ? '已通过' : '已驳回'}</span>
                      )}
                      {flow.approvedAt && <span>时间：{flow.approvedAt}</span>}
                      {flow.comment && <span>备注：{flow.comment}</span>}
                    </Space>
                  }
                  status={flow.status === 'approved' ? 'finish' : flow.status === 'rejected' ? 'error' : 'process'}
                />
              ))}
            </Steps>
          </div>

          {isMyApproval && (
            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
              <Form form={form} layout="vertical">
                <Form.Item
                  name="comment"
                  label="审批意见"
                  rules={[{ required: true, message: '请输入审批意见' }]}
                >
                  <TextArea rows={3} placeholder="请输入审批意见..." />
                </Form.Item>
                <Form.Item style={{ marginBottom: 0 }}>
                  <Space>
                    <Button
                      type="primary"
                      icon={<CheckOutlined />}
                      onClick={() => handleApprove('approved')}
                      loading={loading}
                    >
                      通过
                    </Button>
                    <Button
                      danger
                      icon={<CloseOutlined />}
                      onClick={() => handleApprove('rejected')}
                      loading={loading}
                    >
                      驳回
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </div>
          )}
        </Space>
      )}
    </Modal>
  )
}

export default ApprovalModal

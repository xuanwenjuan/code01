import { Form, Select, Input, Button, Row, Col, Space } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useAppStore } from '@/store';
import type { TableMode } from '@/types';

const { Option } = Select;

interface FilterPanelProps {
  mode: TableMode;
}

export function FilterPanel({ mode }: FilterPanelProps) {
  const [form] = Form.useForm();
  const jobs = useAppStore(state => state.jobs);
  const setFilterCriteria = useAppStore(state => state.setFilterCriteria);
  const resetFilter = useAppStore(state => state.resetFilter);

  const handleSearch = () => {
    const values = form.getFieldsValue();
    setFilterCriteria(values);
  };

  const handleReset = () => {
    form.resetFields();
    resetFilter();
  };

  const activeJobs = jobs.filter(j => j.status !== '已关闭');

  return (
    <Form
      form={form}
      layout="inline"
      onFinish={handleSearch}
      style={{ marginBottom: 16 }}
    >
      <Row gutter={[16, 8]} style={{ width: '100%' }}>
        <Col xs={24} sm={12} md={8} lg={6} xl={5}>
          <Form.Item name="department" label="部门" style={{ marginBottom: 0 }}>
            <Select
              placeholder="请选择部门"
              allowClear
              style={{ width: '100%' }}
              options={[
                { label: '技术研发', value: '技术研发' },
                { label: '市场营销', value: '市场营销' },
                { label: '职能管理', value: '职能管理' },
                { label: '产品运营', value: '产品运营' }
              ]}
            />
          </Form.Item>
        </Col>

        {mode === 'resume' && (
          <Col xs={24} sm={12} md={8} lg={6} xl={5}>
            <Form.Item name="jobId" label="应聘职位" style={{ marginBottom: 0 }}>
              <Select
                placeholder="请选择职位"
                allowClear
                style={{ width: '100%' }}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {activeJobs.map(job => (
                  <Option key={job.id} value={job.id}>
                    {job.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        )}

        <Col xs={24} sm={12} md={8} lg={6} xl={5}>
          <Form.Item name="status" label="状态" style={{ marginBottom: 0 }}>
            <Select
              placeholder="请选择状态"
              allowClear
              style={{ width: '100%' }}
              options={
                mode === 'job'
                  ? [
                      { label: '招聘中', value: '招聘中' },
                      { label: '已暂停', value: '已暂停' },
                      { label: '已关闭', value: '已关闭' }
                    ]
                  : [
                      { label: '初筛', value: '初筛' },
                      { label: '面试中', value: '面试中' },
                      { label: '已录用', value: '已录用' },
                      { label: '已淘汰', value: '已淘汰' }
                    ]
              }
            />
          </Form.Item>
        </Col>

        {mode === 'resume' && (
          <Col xs={24} sm={12} md={8} lg={6} xl={5}>
            <Form.Item name="education" label="学历" style={{ marginBottom: 0 }}>
              <Select
                placeholder="请选择学历"
                allowClear
                style={{ width: '100%' }}
                options={[
                  { label: '博士', value: '博士' },
                  { label: '硕士', value: '硕士' },
                  { label: '本科', value: '本科' },
                  { label: '大专', value: '大专' },
                  { label: '高中及以下', value: '高中及以下' }
                ]}
              />
            </Form.Item>
          </Col>
        )}

        {mode === 'resume' && (
          <Col xs={24} sm={12} md={8} lg={6} xl={5}>
            <Form.Item name="experience" label="工作经验" style={{ marginBottom: 0 }}>
              <Select
                placeholder="请选择经验"
                allowClear
                style={{ width: '100%' }}
                options={[
                  { label: '应届毕业生', value: '应届毕业生' },
                  { label: '1-3年', value: '1-3年' },
                  { label: '3-5年', value: '3-5年' },
                  { label: '5-10年', value: '5-10年' },
                  { label: '10年以上', value: '10年以上' }
                ]}
              />
            </Form.Item>
          </Col>
        )}

        <Col xs={24} sm={12} md={8} lg={6} xl={5}>
          <Form.Item name="keyword" label="关键词" style={{ marginBottom: 0 }}>
            <Input placeholder="名称/学校/技能" allowClear />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6} xl={4}>
          <Form.Item style={{ marginBottom: 0 }}>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                搜索
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}

import { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, Select, Input, Form, message, Switch } from 'antd';

const { Option } = Select;
import { PlusOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import { useAppStore } from '@/store';
import ModalForm from '@/components/ModalForm';
import type { Project, Department } from '@/types';
import mockApi from '@/mock';
import './index.scss';

const { Option } = Select;

interface ProjectFormData {
  name: string;
  departmentId: string;
  description: string;
  price: number;
  duration: number;
  status: 'active' | 'inactive';
}

const ProjectsPage = () => {
  const { projects, departments, setProjects, setDepartments, addProject, updateProject } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterDept, setFilterDept] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const deptRes = mockApi.getDepartments();
        const projRes = mockApi.getProjects();
        setDepartments(deptRes.data);
        setProjects(projRes.data);
      } catch (error) {
        message.error('数据加载失败');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [setDepartments, setProjects]);

  const filteredProjects = projects.filter((project) => {
    const matchSearch = project.name.includes(searchText) || project.description.includes(searchText);
    const matchDept = filterDept ? project.departmentId === filterDept : true;
    return matchSearch && matchDept;
  });

  const handleAdd = () => {
    setEditingProject(null);
    setModalVisible(true);
  };

  const handleEdit = (record: Project) => {
    setEditingProject(record);
    setModalVisible(true);
  };

  const handleSubmit = (values: ProjectFormData) => {
    if (editingProject) {
      updateProject(editingProject.id, values);
      message.success('项目更新成功');
    } else {
      const newProject: Project = {
        ...values,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      addProject(newProject);
      message.success('项目添加成功');
    }
    setModalVisible(false);
  };

  const handleStatusChange = (record: Project, checked: boolean) => {
    updateProject(record.id, { status: checked ? 'active' : 'inactive' });
    message.success('状态更新成功');
  };

  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text: string) => <span className="project-name">{text}</span>
    },
    {
      title: '所属科室',
      dataIndex: 'departmentId',
      key: 'departmentId',
      width: 120,
      render: (id: string) => {
        const dept = departments.find(d => d.id === id);
        return <Tag color="blue">{dept?.name || '-'}</Tag>;
      }
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price: number) => <span className="price">¥{price.toLocaleString()}</span>
    },
    {
      title: '时长(分钟)',
      dataIndex: 'duration',
      key: 'duration',
      width: 110
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string, record: Project) => (
        <Switch
          checked={status === 'active'}
          checkedChildren="启用"
          unCheckedChildren="停用"
          onChange={(checked) => handleStatusChange(record, checked)}
        />
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right' as const,
      render: (_: unknown, record: Project) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        >
          编辑
        </Button>
      )
    }
  ];

  return (
    <div className="projects-page">
      <Card className="page-card">
        <div className="page-header">
          <h2 className="page-title">科室项目管理</h2>
          <Space wrap size="middle">
            <Input
              placeholder="搜索项目"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
            />
            <Select
              placeholder="选择科室"
              value={filterDept || undefined}
              onChange={setFilterDept}
              allowClear
              style={{ width: 150 }}
            >
              {departments.map((dept) => (
                <Select.Option key={dept.id} value={dept.id}>
                  {dept.name}
                </Select.Option>
              ))}
            </Select>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增项目
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={filteredProjects}
          rowKey="id"
          loading={loading}
          scroll={{ x: 800 }}
          locale={{
            emptyText: <div className="empty-state">暂无项目数据</div>
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`
          }}
        />
      </Card>

      <ModalForm<ProjectFormData>
        title={editingProject ? '编辑项目' : '新增项目'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        initialValues={editingProject || { status: 'active' }}
        width={500}
      >
        <Form.Item
          name="name"
          label="项目名称"
          rules={[{ required: true, message: '请输入项目名称' }]}
        >
          <Input placeholder="请输入项目名称" />
        </Form.Item>
        <Form.Item
          name="departmentId"
          label="所属科室"
          rules={[{ required: true, message: '请选择科室' }]}
        >
          <Select placeholder="请选择科室">
            {departments.map((dept) => (
              <Option key={dept.id} value={dept.id}>
                {dept.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="description" label="项目描述">
          <Input.TextArea rows={3} placeholder="请输入项目描述" />
        </Form.Item>
        <Form.Item
          name="price"
          label="价格"
          rules={[{ required: true, message: '请输入价格' }]}
        >
          <Input type="number" placeholder="请输入价格" prefix="¥" />
        </Form.Item>
        <Form.Item
          name="duration"
          label="时长(分钟)"
          rules={[{ required: true, message: '请输入时长' }]}
        >
          <Input type="number" placeholder="请输入时长" />
        </Form.Item>
        <Form.Item name="status" label="状态" valuePropName="checked">
          <Switch checkedChildren="启用" unCheckedChildren="停用" />
        </Form.Item>
      </ModalForm>
    </div>
  );
};

export default ProjectsPage;

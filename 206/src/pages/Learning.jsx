import { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Select,
  Input,
  Space,
  Button,
  Card,
  Tag,
  Pagination,
  Tabs,
} from 'antd';
import { SearchOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTutorials } from '../store/slices/tutorialSlice';
import TutorialCard from '../components/TutorialCard';
import PageLoader from '../components/PageLoader';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

const { Search } = Input;
const { Option } = Select;

const categories = [
  { value: '入门', label: '入门' },
  { value: '进阶', label: '进阶' },
  { value: '创新', label: '创新' },
  { value: '传统', label: '传统' },
];

const levels = [
  { value: '初级', label: '初级' },
  { value: '中级', label: '中级' },
  { value: '高级', label: '高级' },
];

const Learning = () => {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.tutorial);
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    keyword: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('all');
  const pageSize = 8;

  useEffect(() => {
    dispatch(fetchTutorials());
  }, [dispatch]);

  useEffect(() => {
    const filtered = {};
    if (filters.category) filtered.category = filters.category;
    if (filters.level) filtered.level = filters.level;
    dispatch(fetchTutorials(filtered));
    setCurrentPage(1);
  }, [filters.category, filters.level, dispatch]);

  const filteredList = list.filter((item) => {
    if (!filters.keyword) return true;
    const keyword = filters.keyword.toLowerCase();
    return (
      item.title.toLowerCase().includes(keyword) ||
      item.description.toLowerCase().includes(keyword) ||
      item.instructor.toLowerCase().includes(keyword)
    );
  });

  const tabFilteredList =
    activeTab === 'all'
      ? filteredList
      : filteredList.filter((item) => item.category === activeTab);

  const paginatedList = tabFilteredList.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleReset = () => {
    setFilters({
      category: '',
      level: '',
      keyword: '',
    });
    setCurrentPage(1);
    setActiveTab('all');
  };

  const tabItems = [
    { key: 'all', label: '全部' },
    ...categories.map((cat) => ({ key: cat.value, label: cat.label })),
  ];

  if (loading) {
    return <PageLoader text="加载教程中..." />;
  }

  if (error) {
    return <ErrorState message="加载失败" onRetry={() => dispatch(fetchTutorials())} />;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">学习中心</h1>
        <p className="mt-2 text-gray-500">
          跟随大师学习苏绣技艺，从入门到精通
        </p>
      </div>

      <Card className="mb-8">
        <Space direction="vertical" size="large" className="w-full">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={10}>
              <Search
                placeholder="搜索教程名称、描述或讲师"
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={(value) => {
                  setFilters((prev) => ({ ...prev, keyword: value }));
                  setCurrentPage(1);
                }}
              />
            </Col>
            <Col xs={12} sm={8} md={5}>
              <Select
                placeholder="选择分类"
                allowClear
                size="large"
                className="w-full"
                value={filters.category || undefined}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, category: value || '' }))
                }
              >
                {categories.map((cat) => (
                  <Option key={cat.value} value={cat.value}>
                    {cat.label}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={12} sm={8} md={5}>
              <Select
                placeholder="选择难度"
                allowClear
                size="large"
                className="w-full"
                value={filters.level || undefined}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, level: value || '' }))
                }
              >
                {levels.map((level) => (
                  <Option key={level.value} value={level.value}>
                    {level.label}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={8} md={4}>
              <Button
                icon={<ReloadOutlined />}
                size="large"
                onClick={handleReset}
                className="w-full"
              >
                重置筛选
              </Button>
            </Col>
          </Row>
          <div className="flex items-center gap-2">
            <FilterOutlined className="text-gray-400" />
            <span className="text-sm text-gray-500">
              共找到 {tabFilteredList.length} 个教程
            </span>
          </div>
        </Space>
      </Card>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        className="mb-8"
      />

      {paginatedList.length > 0 ? (
        <>
          <Row gutter={[24, 24]} className="mb-8">
            {paginatedList.map((tutorial) => (
              <Col xs={24} sm={12} lg={6} key={tutorial.id}>
                <TutorialCard tutorial={tutorial} />
              </Col>
            ))}
          </Row>
          <div className="flex justify-center">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={tabFilteredList.length}
              onChange={setCurrentPage}
              showSizeChanger={false}
            />
          </div>
        </>
      ) : (
        <EmptyState
          description="暂无符合条件的教程"
          actionText="重置筛选"
          onAction={handleReset}
        />
      )}
    </div>
  );
};

export default Learning;

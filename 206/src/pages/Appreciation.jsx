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
} from 'antd';
import { SearchOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { fetchEmbroideries } from '../store/slices/embroiderySlice';
import EmbroideryCard from '../components/EmbroideryCard';
import PageLoader from '../components/PageLoader';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

const { Search } = Input;
const { Option } = Select;

const Appreciation = () => {
  const dispatch = useDispatch();
  const { list, stitchTypes, themes, loading, error } = useSelector(
    (state) => state.embroidery
  );
  const [filters, setFilters] = useState({
    theme: '',
    stitchType: '',
    master: '',
    keyword: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    dispatch(fetchEmbroideries());
  }, [dispatch]);

  useEffect(() => {
    const filtered = {};
    if (filters.theme) filtered.theme = filters.theme;
    if (filters.stitchType) filtered.stitchType = filters.stitchType;
    if (filters.master) filtered.master = filters.master;
    dispatch(fetchEmbroideries(filtered));
    setCurrentPage(1);
  }, [filters.theme, filters.stitchType, filters.master, dispatch]);

  const filteredList = list.filter((item) => {
    if (!filters.keyword) return true;
    const keyword = filters.keyword.toLowerCase();
    return (
      item.name.toLowerCase().includes(keyword) ||
      item.description.toLowerCase().includes(keyword) ||
      item.masterName.toLowerCase().includes(keyword)
    );
  });

  const paginatedList = filteredList.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleReset = () => {
    setFilters({
      theme: '',
      stitchType: '',
      master: '',
      keyword: '',
    });
    setCurrentPage(1);
  };

  const masters = [...new Set(list.map((item) => item.masterName))];

  if (loading) {
    return <PageLoader text="加载绣品中..." />;
  }

  if (error) {
    return <ErrorState message="加载失败" onRetry={() => dispatch(fetchEmbroideries())} />;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">绣品鉴赏</h1>
        <p className="mt-2 text-gray-500">
          探索精美的苏绣作品，感受传统工艺的魅力
        </p>
      </div>

      <Card className="mb-8">
        <Space direction="vertical" size="large" className="w-full">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={8}>
              <Search
                placeholder="搜索绣品名称、描述或大师"
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={(value) => {
                  setFilters((prev) => ({ ...prev, keyword: value }));
                  setCurrentPage(1);
                }}
              />
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Select
                placeholder="选择题材"
                allowClear
                size="large"
                className="w-full"
                value={filters.theme || undefined}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, theme: value || '' }))
                }
              >
                {themes.map((theme) => (
                  <Option key={theme.id} value={theme.name}>
                    {theme.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Select
                placeholder="选择针法"
                allowClear
                size="large"
                className="w-full"
                value={filters.stitchType || undefined}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, stitchType: value || '' }))
                }
              >
                {stitchTypes.map((stitch) => (
                  <Option key={stitch.id} value={stitch.name}>
                    {stitch.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Select
                placeholder="选择大师"
                allowClear
                size="large"
                className="w-full"
                value={filters.master || undefined}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, master: value || '' }))
                }
              >
                {masters.map((master) => (
                  <Option key={master} value={master}>
                    {master}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={12} sm={8} md={4}>
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
              共找到 {filteredList.length} 件绣品
            </span>
            {(filters.theme || filters.stitchType || filters.master || filters.keyword) && (
              <Space size={[8, 8]} wrap className="ml-2">
                {filters.theme && (
                  <Tag
                    closable
                    onClose={() => setFilters((prev) => ({ ...prev, theme: '' }))}
                    color="gold"
                  >
                    题材：{filters.theme}
                  </Tag>
                )}
                {filters.stitchType && (
                  <Tag
                    closable
                    onClose={() => setFilters((prev) => ({ ...prev, stitchType: '' }))}
                    color="blue"
                  >
                    针法：{filters.stitchType}
                  </Tag>
                )}
                {filters.master && (
                  <Tag
                    closable
                    onClose={() => setFilters((prev) => ({ ...prev, master: '' }))}
                    color="green"
                  >
                    大师：{filters.master}
                  </Tag>
                )}
                {filters.keyword && (
                  <Tag
                    closable
                    onClose={() => setFilters((prev) => ({ ...prev, keyword: '' }))}
                    color="magenta"
                  >
                    关键词：{filters.keyword}
                  </Tag>
                )}
              </Space>
            )}
          </div>
        </Space>
      </Card>

      {paginatedList.length > 0 ? (
        <>
          <Row gutter={[24, 24]} className="mb-8">
            {paginatedList.map((embroidery) => (
              <Col xs={24} sm={12} lg={6} key={embroidery.id}>
                <EmbroideryCard embroidery={embroidery} />
              </Col>
            ))}
          </Row>
          <div className="flex justify-center">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredList.length}
              onChange={setCurrentPage}
              showSizeChanger={false}
            />
          </div>
        </>
      ) : (
        <EmptyState
          description="暂无符合条件的绣品"
          actionText="重置筛选"
          onAction={handleReset}
        />
      )}
    </div>
  );
};

export default Appreciation;

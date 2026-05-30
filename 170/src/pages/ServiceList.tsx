import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Row, Col, Select, Slider, Radio, Pagination, Button, Input, Card, Tag, Statistic } from 'antd';
import { SearchOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import ServiceCard from '../components/common/ServiceCard';
import EmptyState from '../components/common/EmptyState';
import { mockServices, mockTechnicians } from '../mock';
import type { Service } from '../types';

const { Option } = Select;
const { Search } = Input;

const categoryOptions = [
  { value: 'all', label: '全部服务', icon: '🎀' },
  { value: 'nail', label: '美甲', icon: '💅' },
  { value: 'eyelash', label: '美睫', icon: '👁️' },
  { value: 'care', label: '手足护理', icon: '🖐️' },
];

const priceRangeOptions = [
  { label: '不限', value: [0, 1000] },
  { label: '¥0-200', value: [0, 200] },
  { label: '¥200-400', value: [200, 400] },
  { label: '¥400-600', value: [400, 600] },
  { label: '¥600+', value: [600, 1000] },
];

const sortOptions = [
  { value: 'default', label: '综合排序' },
  { value: 'sales', label: '销量优先' },
  { value: 'rating', label: '好评优先' },
  { value: 'distance', label: '距离最近' },
  { value: 'price-asc', label: '价格最低' },
  { value: 'price-desc', label: '价格最高' },
];

const ServiceList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState<string>('default');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [technicianFilter, setTechnicianFilter] = useState<string>('all');
  const [activePriceTab, setActivePriceTab] = useState<number>(0);

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const technicianParam = searchParams.get('technician');
    if (categoryParam) {
      setCategory(categoryParam);
    }
    if (technicianParam) {
      setTechnicianFilter(technicianParam);
    }
  }, [searchParams]);

  const categoryStats = useMemo(() => {
    const stats = { all: mockServices.length, nail: 0, eyelash: 0, care: 0 };
    mockServices.forEach((s) => {
      if (s.category === 'nail') stats.nail++;
      else if (s.category === 'eyelash') stats.eyelash++;
      else if (s.category === 'care') stats.care++;
    });
    return stats;
  }, []);

  const filteredServices = useMemo(() => {
    let result = [...mockServices];

    if (category !== 'all') {
      result = result.filter((service) => service.category === category);
    }

    if (technicianFilter !== 'all') {
      result = result.filter((service) => service.technicianId === technicianFilter);
    }

    result = result.filter(
      (service) => service.price >= priceRange[0] && service.price <= priceRange[1]
    );

    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      result = result.filter(
        (service) =>
          service.name.toLowerCase().includes(keyword) ||
          service.description.toLowerCase().includes(keyword) ||
          service.tags.some((tag) => tag.toLowerCase().includes(keyword))
      );
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'sales':
        result.sort((a, b) => b.salesCount - a.salesCount);
        break;
      case 'distance':
        result.sort((a, b) => {
          const techA = mockTechnicians.find((t) => t.id === a.technicianId);
          const techB = mockTechnicians.find((t) => t.id === b.technicianId);
          return (techA?.distance || 0) - (techB?.distance || 0);
        });
        break;
      default:
        break;
    }

    return result;
  }, [category, priceRange, sortBy, searchKeyword, technicianFilter]);

  const paginatedServices = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredServices.slice(start, start + pageSize);
  }, [filteredServices, page, pageSize]);

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setPage(1);
    const params = new URLSearchParams(searchParams);
    if (value === 'all') {
      params.delete('category');
    } else {
      params.set('category', value);
    }
    setSearchParams(params);
  };

  const handlePriceTabClick = (index: number) => {
    setActivePriceTab(index);
    setPriceRange(priceRangeOptions[index].value as [number, number]);
    setPage(1);
  };

  const handleSliderChange = (value: [number, number]) => {
    setPriceRange(value);
    setActivePriceTab(0);
    setPage(1);
  };

  const handleTechnicianChange = (value: string) => {
    setTechnicianFilter(value);
    setPage(1);
    const params = new URLSearchParams(searchParams);
    if (value === 'all') {
      params.delete('technician');
    } else {
      params.set('technician', value);
    }
    setSearchParams(params);
  };

  const handleReset = () => {
    setCategory('all');
    setPriceRange([0, 1000]);
    setActivePriceTab(0);
    setSortBy('default');
    setSearchKeyword('');
    setTechnicianFilter('all');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#333' }}>
          服务列表
        </h1>
        <p style={{ color: '#999', margin: 0 }}>
          精选优质服务，专业美甲师上门服务
        </p>
      </div>

      <Card
        style={{
          marginBottom: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        }}
        bodyStyle={{ padding: '24px' }}
      >
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
            <Search
              placeholder="搜索服务名称、标签..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onSearch={(value) => setSearchKeyword(value)}
              style={{ flex: 1, maxWidth: '450px' }}
            />
            <Button
              size="large"
              icon={<ReloadOutlined />}
              onClick={handleReset}
              style={{ height: '40px' }}
            >
              重置筛选
            </Button>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <span
              style={{
                fontWeight: '500',
                color: '#333',
                minWidth: '80px',
              }}
            >
              <FilterOutlined style={{ marginRight: '6px' }} />
              服务类型：
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {categoryOptions.map((opt) => (
                <Tag.CheckableTag
                  key={opt.value}
                  checked={category === opt.value}
                  onChange={() => handleCategoryChange(opt.value)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    border: category === opt.value ? '1px solid #ff85c0' : '1px solid #d9d9d9',
                    background: category === opt.value ? '#fff0f6' : '#fff',
                    color: category === opt.value ? '#ff85c0' : '#666',
                  }}
                >
                  {opt.icon} {opt.label}
                  <span style={{ marginLeft: '4px', fontSize: '12px', opacity: 0.8 }}>
                    ({categoryStats[opt.value as keyof typeof categoryStats]})
                  </span>
                </Tag.CheckableTag>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'flex-start',
              marginBottom: '12px',
            }}
          >
            <span
              style={{
                fontWeight: '500',
                color: '#333',
                minWidth: '80px',
                paddingTop: '8px',
              }}
            >
              价格区间：
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {priceRangeOptions.map((opt, index) => (
                  <Button
                    key={index}
                    type={activePriceTab === index ? 'primary' : 'default'}
                    size="small"
                    onClick={() => handlePriceTabClick(index)}
                    style={{
                      borderRadius: '16px',
                      background: activePriceTab === index ? 'linear-gradient(135deg, #ff85c0 0%, #ff6b9d 100%)' : '#fff',
                      border: activePriceTab === index ? 'none' : '1px solid #d9d9d9',
                    }}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Slider
                  range
                  min={0}
                  max={1000}
                  step={50}
                  value={priceRange}
                  onChange={(value) => handleSliderChange(value as [number, number])}
                  style={{ flex: 1 }}
                  tooltip={{ formatter: (value) => `¥${value}` }}
                />
                <span
                  style={{
                    whiteSpace: 'nowrap',
                    color: '#ff4d4f',
                    fontWeight: '500',
                    minWidth: '120px',
                    textAlign: 'right',
                  }}
                >
                  ¥{priceRange[0]} - ¥{priceRange[1]}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <span
              style={{
                fontWeight: '500',
                color: '#333',
                minWidth: '80px',
              }}
            >
              美甲师：
            </span>
            <Select
              value={technicianFilter}
              onChange={handleTechnicianChange}
              style={{ width: '180px' }}
              size="large"
            >
              <Option value="all">全部美甲师</Option>
              {mockTechnicians.map((tech) => (
                <Option key={tech.id} value={tech.id}>
                  {tech.name} - {tech.title}
                </Option>
              ))}
            </Select>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '16px',
            borderTop: '1px solid #f0f0f0',
          }}
        >
          <div style={{ color: '#999' }}>
            共找到 <span style={{ color: '#ff85c0', fontWeight: 'bold' }}>{filteredServices.length}</span> 个服务
          </div>
          <Radio.Group value={sortBy} onChange={(e) => setSortBy(e.target.value)} size="middle">
            {sortOptions.map((opt) => (
              <Radio.Button key={opt.value} value={opt.value}>
                {opt.label}
              </Radio.Button>
            ))}
          </Radio.Group>
        </div>
      </Card>

      {paginatedServices.length > 0 ? (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            {paginatedServices.map((service: Service) => (
              <Col xs={24} sm={12} md={8} lg={6} key={service.id}>
                <ServiceCard service={service} />
              </Col>
            ))}
          </Row>

          <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
            <Pagination
              current={page}
              pageSize={pageSize}
              total={filteredServices.length}
              onChange={setPage}
              showSizeChanger={false}
              showQuickJumper
              showTotal={(total) => `共 ${total} 条记录`}
              size="large"
            />
          </div>
        </>
      ) : (
        <Card
          style={{
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
          }}
        >
          <EmptyState
            description="没有找到符合条件的服务"
            actionText="重置筛选条件"
            onAction={handleReset}
          />
        </Card>
      )}
    </div>
  );
};

export default ServiceList;

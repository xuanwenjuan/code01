import { useState, useEffect, useCallback } from 'react';
import {
  Carousel,
  Row,
  Col,
  Card,
  Tag,
  Button,
  Space,
  Divider,
  Input,
  Select,
  Tabs,
  Empty,
  Spin,
  message,
  Tooltip,
} from 'antd';
import {
  RightOutlined,
  SearchOutlined,
  ReloadOutlined,
  FireOutlined,
  FilterOutlined,
  ArrowUpOutlined,
  StarOutlined,
  ClockCircleOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  mockBanners,
  mockStitchTypes,
  mockEmbroideries,
  mockTutorials,
  mockMasters,
  mockThemes,
} from '../data/mockData';
import EmbroideryCard from '../components/EmbroideryCard';
import TutorialCard from '../components/TutorialCard';
import ErrorState from '../components/ErrorState';

const { Search } = Input;
const { Option } = Select;

const hotSearchKeywords = [
  '齐针',
  '套针',
  '山水',
  '花鸟',
  '沈寿',
  '入门教程',
  '乱针绣',
  '金线绣',
  '富春山居图',
  '百鸟朝凤',
];

const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [embroideries, setEmbroideries] = useState([]);
  const [tutorials, setTutorials] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedStitch, setSelectedStitch] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [tutorialSortBy, setTutorialSortBy] = useState('hot');
  const [activeFilterTab, setActiveFilterTab] = useState('all');
  const [searchHistory, setSearchHistory] = useState(
    JSON.parse(localStorage.getItem('searchHistory') || '[]')
  );

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      try {
        const success = Math.random() > 0.05;
        if (success) {
          setEmbroideries(mockEmbroideries);
          setTutorials(mockTutorials);
          setLoading(false);
        } else {
          throw new Error('数据加载失败，请稍后重试');
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }, 800);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredEmbroideries = embroideries.filter((item) => {
    if (activeFilterTab !== 'all' && item.theme !== activeFilterTab) return false;
    if (selectedStitch && !item.stitchTypes.includes(selectedStitch)) return false;
    if (selectedTheme && item.theme !== selectedTheme) return false;
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      return (
        item.name.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword) ||
        item.masterName.toLowerCase().includes(keyword) ||
        item.stitchTypes.some((s) => s.toLowerCase().includes(keyword)) ||
        item.theme.toLowerCase().includes(keyword)
      );
    }
    return true;
  });

  const filteredTutorials = tutorials
    .filter((item) => {
      if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase();
        return (
          item.title.toLowerCase().includes(keyword) ||
          item.description.toLowerCase().includes(keyword) ||
          item.instructor.toLowerCase().includes(keyword) ||
          item.category.toLowerCase().includes(keyword)
        );
      }
      return true;
    })
    .sort((a, b) => {
      switch (tutorialSortBy) {
        case 'hot':
          return b.students - a.students;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

  const handleSearch = (value) => {
    if (!value.trim()) return;
    setSearchKeyword(value);
    const newHistory = [
      value,
      ...searchHistory.filter((h) => h !== value),
    ].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    message.success('搜索：' + value);
  };

  const handleHotSearchClick = (keyword) => {
    setSearchKeyword(keyword);
    handleSearch(keyword);
  };

  const handleClearSearch = () => {
    setSearchKeyword('');
    setSelectedStitch('');
    setSelectedTheme('');
    setActiveFilterTab('all');
  };

  const handleStitchClick = (stitchName) => {
    if (selectedStitch === stitchName) {
      setSelectedStitch('');
    } else {
      setSelectedStitch(stitchName);
      setSearchKeyword(stitchName);
    }
  };

  const handleEmbroideryCardClick = (id) => {
    navigate('/embroidery/' + id);
  };

  const handleTutorialCardClick = (id) => {
    navigate('/tutorial/' + id);
  };

  const handleViewMoreEmbroideries = () => {
    const params = new URLSearchParams();
    if (selectedStitch) params.set('stitchType', selectedStitch);
    if (selectedTheme) params.set('theme', selectedTheme);
    if (searchKeyword) params.set('keyword', searchKeyword);
    const queryString = params.toString();
    navigate('/appreciation' + (queryString ? '?' + queryString : ''));
  };

  const handleViewMoreTutorials = () => {
    navigate('/learning');
  };

  const themeTabs = [
    { key: 'all', label: '全部' },
    ...mockThemes.map((theme) => ({ key: theme.name, label: theme.name })),
  ];

  if (loading) {
    return (
      <div className="flex min-h-[600px] items-center justify-center">
        <Spin size="large" description="加载中..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[600px]">
        <ErrorState
          message={error}
          subMessage="请检查网络连接后重试"
          onRetry={loadData}
        />
      </div>
    );
  }

  return (
    <div>
      <Carousel autoplay effect="fade" className="mb-12">
        {mockBanners.map((banner) => (
          <div key={banner.id} className="relative h-[500px] overflow-hidden">
            <img
              src={banner.image}
              alt={banner.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent">
              <div className="absolute left-20 top-1/2 -translate-y-1/2 text-white">
                <h1 className="mb-4 text-5xl font-bold">{banner.title}</h1>
                <p className="mb-8 text-xl text-amber-100">{banner.subtitle}</p>
                <Button
                  type="primary"
                  size="large"
                  className="bg-amber-600 border-amber-600"
                  onClick={() => navigate(banner.link)}
                >
                  立即探索
                </Button>
              </div>
            </div>
          </div>
        ))}
      </Carousel>

      <div className="mx-auto max-w-7xl px-6">
        <section className="mb-12">
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <div className="max-w-3xl mx-auto">
              <Search
                placeholder="搜索针法、题材、绣品、教程、大师..."
                allowClear
                enterButton={
                  <Button type="primary" className="bg-amber-600 border-amber-600">
                    <SearchOutlined /> 搜索
                  </Button>
                }
                size="large"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onSearch={handleSearch}
                className="mb-4"
              />
              <div className="flex items-start gap-4">
                <div className="flex items-center gap-2 text-amber-600 whitespace-nowrap">
                  <FireOutlined className="text-red-500" />
                  <span className="text-sm font-medium">热门搜索：</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {hotSearchKeywords.map((keyword, index) => (
                    <Tooltip key={keyword} title="点击搜索">
                      <Tag
                        color={index < 3 ? 'red' : 'gold'}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleHotSearchClick(keyword)}
                      >
                        {index < 3 && <FireOutlined className="mr-1" />}
                        {keyword}
                      </Tag>
                    </Tooltip>
                  ))}
                </div>
              </div>
              {searchHistory.length > 0 && (
                <div className="flex items-start gap-4 mt-3 pt-3 border-t border-amber-200">
                  <span className="text-sm text-gray-500 whitespace-nowrap">搜索历史：</span>
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.slice(0, 6).map((keyword) => (
                      <Tag
                        key={keyword}
                        className="cursor-pointer hover:bg-amber-100 transition-colors"
                        onClick={() => handleHotSearchClick(keyword)}
                      >
                        {keyword}
                      </Tag>
                    ))}
                    <Button
                      type="text"
                      size="small"
                      className="text-gray-400 h-auto p-0"
                      onClick={() => {
                        setSearchHistory([]);
                        localStorage.removeItem('searchHistory');
                      }}
                    >
                      清空
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </section>

        <section className="mb-16">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">苏绣针法</h2>
              <p className="mt-2 text-gray-500">
                点击针法标签可筛选相关绣品，感受千年工艺的魅力
              </p>
            </div>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleClearSearch}
                disabled={!selectedStitch && !selectedTheme && !searchKeyword}
              >
                清除筛选
              </Button>
            </Space>
          </div>

          <Row gutter={[16, 16]} className="mb-8">
            {mockStitchTypes.map((stitch) => (
              <Col xs={12} sm={8} md={6} key={stitch.id}>
                <Card
                  hoverable
                  className={`h-full text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                    selectedStitch === stitch.name
                      ? 'border-amber-500 bg-amber-50'
                      : ''
                  }`}
                  onClick={() => handleStitchClick(stitch.name)}
                >
                  <div
                    className={`mb-4 flex h-16 w-16 items-center justify-center mx-auto rounded-full ${
                      selectedStitch === stitch.name
                        ? 'bg-amber-500'
                        : 'bg-amber-100'
                    }`}
                  >
                    <AppstoreOutlined
                      className={`text-2xl ${
                        selectedStitch === stitch.name ? 'text-white' : ''
                      }`}
                    />
                  </div>
                  <h3
                    className={`mb-2 text-lg font-semibold ${
                      selectedStitch === stitch.name ? 'text-amber-600' : ''
                    }`}
                  >
                    {stitch.name}
                  </h3>
                  <p className="text-sm text-gray-500">{stitch.description}</p>
                  {selectedStitch === stitch.name && (
                    <Tag color="gold" className="mt-2">
                      已选中
                    </Tag>
                  )}
                </Card>
              </Col>
            ))}
          </Row>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FilterOutlined className="text-amber-600" />
              <span className="font-medium text-gray-700">题材筛选：</span>
            </div>
            <Tabs
              activeKey={activeFilterTab}
              onChange={setActiveFilterTab}
              items={themeTabs}
              className="mb-0"
            />
          </div>
        </section>

        <Divider className="my-12" />

        <section className="mb-16">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">名家绣品</h2>
              <p className="mt-2 text-gray-500">
                {selectedStitch || selectedTheme || searchKeyword
                  ? '已筛选出 ' + filteredEmbroideries.length + ' 件相关绣品'
                  : '欣赏大师作品，领略苏绣艺术之美'}
              </p>
            </div>
            <Button
              type="text"
              className="text-amber-600"
              onClick={handleViewMoreEmbroideries}
            >
              查看更多 <RightOutlined />
            </Button>
          </div>

          {filteredEmbroideries.length > 0 ? (
            <Row gutter={[24, 24]}>
              {filteredEmbroideries.slice(0, 4).map((embroidery) => (
                <Col xs={24} sm={12} lg={6} key={embroidery.id}>
                  <div onClick={() => handleEmbroideryCardClick(embroidery.id)}>
                    <EmbroideryCard embroidery={embroidery} />
                  </div>
                </Col>
              ))}
            </Row>
          ) : (
            <Card className="text-center py-12">
              <Empty description="暂无符合条件的绣品" />
              <Button
                type="primary"
                className="mt-4 bg-amber-600"
                onClick={handleClearSearch}
              >
                清除筛选条件
              </Button>
            </Card>
          )}
        </section>

        <Divider className="my-12" />

        <section className="mb-16">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">非遗传承人</h2>
              <p className="mt-2 text-gray-500">认识守护苏绣技艺的大师们</p>
            </div>
          </div>
          <Row gutter={[24, 24]}>
            {mockMasters.map((master) => (
              <Col xs={24} sm={12} lg={6} key={master.id}>
                <Card
                  hoverable
                  className="text-center transition-all duration-300 hover:shadow-lg cursor-pointer"
                  onClick={() => {
                    setSearchKeyword(master.name);
                    handleSearch(master.name);
                  }}
                >
                  <div className="mb-4">
                    <img
                      src={master.avatar}
                      alt={master.name}
                      className="mx-auto h-24 w-24 rounded-full border-4 border-amber-100 object-cover"
                    />
                  </div>
                  <h3 className="mb-1 text-xl font-semibold">{master.name}</h3>
                  <Tag color="gold" className="mb-3">
                    {master.title}
                  </Tag>
                  <p className="mb-3 text-sm text-gray-500 line-clamp-2">
                    {master.bio}
                  </p>
                  <div className="text-amber-600">
                    <Space>
                      <span>作品数：{master.worksCount}</span>
                    </Space>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </section>

        <Divider className="my-12" />

        <section className="mb-16">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">精品教程推荐</h2>
              <p className="mt-2 text-gray-500">
                {searchKeyword
                  ? '搜索结果：' + filteredTutorials.length + ' 个相关教程'
                  : '从零开始学习苏绣，大师亲授'}
              </p>
            </div>
            <Space>
              <Select
                value={tutorialSortBy}
                onChange={setTutorialSortBy}
                size="large"
                style={{ width: 140 }}
                suffixIcon={<ArrowUpOutlined />}
              >
                <Option value="hot">
                  <FireOutlined /> 热度优先
                </Option>
                <Option value="rating">
                  <StarOutlined /> 评分优先
                </Option>
                <Option value="newest">
                  <ClockCircleOutlined /> 最新发布
                </Option>
              </Select>
              <Button
                type="text"
                className="text-amber-600"
                onClick={handleViewMoreTutorials}
              >
                查看更多 <RightOutlined />
              </Button>
            </Space>
          </div>

          {filteredTutorials.length > 0 ? (
            <Row gutter={[24, 24]}>
              {filteredTutorials.slice(0, 4).map((tutorial, index) => (
                <Col xs={24} sm={12} lg={6} key={tutorial.id}>
                  <div className="relative">
                    {index === 0 && tutorialSortBy === 'hot' && (
                      <div className="absolute -top-2 -left-2 z-10 bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                        <FireOutlined /> 最热
                      </div>
                    )}
                    <div onClick={() => handleTutorialCardClick(tutorial.id)}>
                      <TutorialCard tutorial={tutorial} />
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          ) : (
            <Card className="text-center py-12">
              <Empty description="暂无符合条件的教程" />
              <Button
                type="primary"
                className="mt-4 bg-amber-600"
                onClick={handleClearSearch}
              >
                清除搜索
              </Button>
            </Card>
          )}
        </section>

        <section className="mb-16 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 p-12">
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={12}>
              <h2 className="mb-4 text-3xl font-bold text-gray-800">
                开启您的苏绣学习之旅
              </h2>
              <p className="mb-6 text-gray-600">
                无论您是零基础的爱好者，还是有一定基础的学习者，我们都能为您提供最合适的学习内容。
                加入我们，一起传承这项千年非遗技艺。
              </p>
              <Space>
                <Button
                  type="primary"
                  size="large"
                  className="bg-amber-600 border-amber-600"
                  onClick={() => navigate('/learning')}
                >
                  开始学习
                </Button>
                <Button size="large" onClick={() => navigate('/register')}>
                  免费注册
                </Button>
              </Space>
            </Col>
            <Col xs={24} md={12} className="text-center">
              <div className="inline-block rounded-lg bg-white p-8 shadow-lg">
                <div className="grid grid-cols-3 gap-8">
                  <div>
                    <div className="text-3xl font-bold text-amber-600">
                      {mockTutorials.length}+
                    </div>
                    <div className="text-sm text-gray-500">精品教程</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-amber-600">
                      {mockEmbroideries.length}+
                    </div>
                    <div className="text-sm text-gray-500">名家绣品</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-amber-600">
                      {mockMasters.length}
                    </div>
                    <div className="text-sm text-gray-500">非遗大师</div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </section>
      </div>
    </div>
  );
};

export default Home;

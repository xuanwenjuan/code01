import { useState } from 'react';
import { Input, AutoComplete, Tag, Avatar } from 'antd';
import { SearchOutlined, FileTextOutlined, PictureOutlined, UserOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSearchResults, clearSearchResults, logOperation } from '@/store/platformSlice';
import './GlobalSearch.css';

const { Search } = Input;

const iconMap = {
  work: <PictureOutlined style={{ color: '#1890ff' }} />,
  case: <FileTextOutlined style={{ color: '#52c41a' }} />,
  technique: <PlayCircleOutlined style={{ color: '#d4af37' }} />,
  artisan: <UserOutlined style={{ color: '#722ed1' }} />,
};

const colorMap = {
  work: 'blue',
  case: 'green',
  technique: 'gold',
  artisan: 'purple',
};

const GlobalSearch = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [keyword, setKeyword] = useState('');
  const { searchResults, searchLoading } = useSelector(state => state.platform);

  const handleSearch = value => {
    if (value.trim()) {
      dispatch(fetchSearchResults(value));
      dispatch(logOperation({
        action: 'search',
        detail: `搜索关键词: ${value}`,
      }));
    } else {
      dispatch(clearSearchResults());
    }
  };

  const handleSelect = item => {
    const [type, id] = item.value.split('_');
    dispatch(logOperation({
      action: 'click_search_result',
      itemId: Number(id),
      itemType: type,
      detail: `点击搜索结果: ${item.label}`,
    }));
    if (type === 'work') {
      navigate(`/work/${id}`);
    } else if (type === 'case') {
      navigate(`/case/${id}`);
    } else if (type === 'technique') {
      navigate(`/technique/${id}`);
    } else if (type === 'artisan') {
      navigate('/');
    }
    setKeyword('');
    dispatch(clearSearchResults());
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && keyword.trim()) {
      dispatch(logOperation({
        action: 'search_enter',
        detail: `搜索关键词: ${keyword}`,
      }));
      navigate(`/search?q=${encodeURIComponent(keyword)}`);
      setKeyword('');
    }
  };

  const buildOptions = () => {
    const options = [];
    
    if (searchResults.works.length > 0) {
      options.push({
        label: <div className="option-group-title">作品 ({searchResults.works.length})</div>,
        options: searchResults.works.slice(0, 3).map(w => ({
          value: `work_${w.id}`,
          label: (
            <div className="option-item">
              <Avatar size="small" src={w.image} icon={<PictureOutlined />} />
              <span className="option-text">{w.name}</span>
              <Tag color={colorMap[w.type]} size="small">{w.typeName}</Tag>
            </div>
          ),
        })),
      });
    }

    if (searchResults.cases.length > 0) {
      options.push({
        label: <div className="option-group-title">案例 ({searchResults.cases.length})</div>,
        options: searchResults.cases.slice(0, 3).map(c => ({
          value: `case_${c.id}`,
          label: (
            <div className="option-item">
              <Avatar size="small" src={c.cover} icon={<FileTextOutlined />} />
              <span className="option-text">{c.title}</span>
              <Tag color={colorMap[c.type]} size="small">{c.typeName}</Tag>
            </div>
          ),
        })),
      });
    }

    if (searchResults.techniques.length > 0) {
      options.push({
        label: <div className="option-group-title">工艺 ({searchResults.techniques.length})</div>,
        options: searchResults.techniques.slice(0, 3).map(t => ({
          value: `technique_${t.id}`,
          label: (
            <div className="option-item">
              <Avatar size="small" icon={<PlayCircleOutlined />} style={{ background: '#d4af37' }} />
              <span className="option-text">{t.name}</span>
              <Tag color={colorMap[t.type]} size="small">{t.typeName}</Tag>
            </div>
          ),
        })),
      });
    }

    if (searchResults.artisans.length > 0) {
      options.push({
        label: <div className="option-group-title">传承人 ({searchResults.artisans.length})</div>,
        options: searchResults.artisans.slice(0, 3).map(a => ({
          value: `artisan_${a.id}`,
          label: (
            <div className="option-item">
              <Avatar size="small" src={a.avatar} icon={<UserOutlined />} />
              <span className="option-text">{a.name}</span>
              <Tag color={colorMap[a.type]} size="small">{a.typeName}</Tag>
            </div>
          ),
        })),
      });
    }

    return options;
  };

  return (
    <div className="global-search">
      <AutoComplete
        classNames={{ popup: { root: 'search-dropdown' } }}
        options={buildOptions()}
        onSelect={handleSelect}
        onSearch={handleSearch}
        notFoundContent={searchLoading ? '搜索中...' : null}
        open={keyword.length > 0 && searchResults.total > 0}
      >
        <Search
          placeholder="搜索作品、案例、工艺、传承人..."
          allowClear
          enterButton
          size="large"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          onSearch={handleSearch}
          prefix={<SearchOutlined />}
          loading={searchLoading}
        />
      </AutoComplete>
      {searchResults.total > 0 && (
        <div
          className="view-all-results"
          onClick={() => {
            navigate(`/search?q=${encodeURIComponent(keyword)}`);
            setKeyword('');
            dispatch(clearSearchResults());
          }}
        >
          查看全部 {searchResults.total} 条结果 →
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;

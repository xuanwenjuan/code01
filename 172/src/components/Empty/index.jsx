import { Empty as AntEmpty, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const Empty = ({ description = '暂无数据', showButton = true, buttonText = '去逛逛', onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate('/');
    }
  };

  return (
    <div style={{ padding: 60, textAlign: 'center' }}>
      <AntEmpty description={description}>
        {showButton && (
          <Button type="primary" onClick={handleClick}>
            {buttonText}
          </Button>
        )}
      </AntEmpty>
    </div>
  );
};

export default Empty;

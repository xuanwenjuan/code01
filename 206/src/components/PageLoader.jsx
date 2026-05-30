import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const PageLoader = ({ text = '加载中...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Spin
        indicator={
          <LoadingOutlined
            style={{
              fontSize: 48,
              color: '#d97706',
            }}
            spin
          />
        }
        size="large"
      />
      <p className="mt-4 text-gray-500">{text}</p>
    </div>
  );
};

export default PageLoader;

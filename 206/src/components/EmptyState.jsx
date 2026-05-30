import { Empty, Button } from 'antd';

const EmptyState = ({ description, icon, actionText, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Empty
        image={icon || Empty.PRESENTED_IMAGE_SIMPLE}
        description={description || '暂无数据'}
        imageStyle={{
          height: 80,
        }}
      />
      {actionText && onAction && (
        <Button type="primary" className="mt-4 bg-amber-600" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;

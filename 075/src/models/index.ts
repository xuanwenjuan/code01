
import sequelize from '../config/database';
import User from './User';
import AssetCategory from './AssetCategory';
import Asset from './Asset';
import AssetApplication from './AssetApplication';
import AssetInventory from './AssetInventory';
import OperationLog from './OperationLog';

const initModels = async () => {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');
    
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('模型同步完成');
    }
  } catch (error) {
    console.error('数据库连接失败:', error);
  }
};

export {
  sequelize,
  initModels,
  User,
  AssetCategory,
  Asset,
  AssetApplication,
  AssetInventory,
  OperationLog
};

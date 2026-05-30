import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface RoomCategoryAttributes {
  id: number;
  name: string;
  parentId?: number;
  level: number;
  sort: number;
  description?: string;
  status: boolean;
  icon?: string;
}

interface RoomCategoryCreationAttributes extends Optional<RoomCategoryAttributes, 'id' | 'parentId' | 'level' | 'sort' | 'description' | 'status' | 'icon'> {}

class RoomCategory extends Model<RoomCategoryAttributes, RoomCategoryCreationAttributes> implements RoomCategoryAttributes {
  public id!: number;
  public name!: string;
  public parentId?: number;
  public level!: number;
  public sort!: number;
  public description?: string;
  public status!: boolean;
  public icon?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RoomCategory.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      comment: '分类ID'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '分类名称'
    },
    parentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      comment: '父分类ID'
    },
    level: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      comment: '层级'
    },
    sort: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '排序'
    },
    description: {
      type: DataTypes.TEXT,
      comment: '描述'
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '状态'
    },
    icon: {
      type: DataTypes.STRING(255),
      comment: '图标'
    }
  },
  {
    sequelize,
    tableName: 'room_categories',
    modelName: 'RoomCategory',
    comment: '房型分类表'
  }
);

export default RoomCategory;

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class ActivityCategory extends Model {
  public id!: number;
  public name!: string;
  public parentId!: number | null;
  public description!: string;
  public sortOrder!: number;
  public status!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ActivityCategory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      references: {
        model: 'activity_categories',
        key: 'id'
      }
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: '1: 启用, 0: 停办'
    }
  },
  {
    sequelize,
    modelName: 'ActivityCategory',
    tableName: 'activity_categories'
  }
);

export default ActivityCategory;

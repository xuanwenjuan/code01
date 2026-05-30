import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface AreaAttributes {
  id: number;
  name: string;
  code: string;
  description?: string;
  parentId?: number;
  sortOrder: number;
  isActive: boolean;
}

interface AreaCreationAttributes extends Optional<AreaAttributes, 'id' | 'sortOrder' | 'isActive'> {}

class Area extends Model<AreaAttributes, AreaCreationAttributes> implements AreaAttributes {
  public id!: number;
  public name!: string;
  public code!: string;
  public description?: string;
  public parentId?: number;
  public sortOrder!: number;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Area.init(
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
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'parent_id'
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'sort_order'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    }
  },
  {
    sequelize,
    modelName: 'Area',
    tableName: 'areas',
    timestamps: true
  }
);

export default Area;

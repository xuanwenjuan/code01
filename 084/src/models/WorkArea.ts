import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface WorkAreaAttributes {
  id: number;
  name: string;
  parentId?: number;
  areaType: 'main_road' | 'residential' | 'commercial' | 'park';
  level: number;
  sort: number;
  status: 'active' | 'suspended';
  description?: string;
}

class WorkArea extends Model<WorkAreaAttributes> implements WorkAreaAttributes {
  public id!: number;
  public name!: string;
  public parentId?: number;
  public areaType!: 'main_road' | 'residential' | 'commercial' | 'park';
  public level!: number;
  public sort!: number;
  public status!: 'active' | 'suspended';
  public description?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

WorkArea.init(
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
      defaultValue: null
    },
    areaType: {
      type: DataTypes.ENUM('main_road', 'residential', 'commercial', 'park'),
      allowNull: false
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    sort: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('active', 'suspended'),
      allowNull: false,
      defaultValue: 'active'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'WorkArea',
    tableName: 'work_areas',
    timestamps: true
  }
);

WorkArea.hasMany(WorkArea, { as: 'children', foreignKey: 'parentId' });
WorkArea.belongsTo(WorkArea, { as: 'parent', foreignKey: 'parentId' });

export default WorkArea;
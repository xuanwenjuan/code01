import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Department extends Model {
  public id!: number;
  public name!: string;
  public parentId!: number | null;
  public sortOrder!: number;
  public managerId!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Department.init(
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
        model: 'departments',
        key: 'id'
      }
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    managerId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'Department',
    tableName: 'departments'
  }
);

export default Department;

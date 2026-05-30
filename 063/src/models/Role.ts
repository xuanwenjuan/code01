import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Role extends Model {
  public id!: number;
  public name!: string;
  public code!: string;
  public description?: string;
  public status!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '角色名称'
    },
    code: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
      comment: '角色编码'
    },
    description: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '角色描述'
    },
    status: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      comment: '状态：1-启用，0-停用'
    }
  },
  {
    sequelize,
    modelName: 'Role',
    tableName: 'roles',
    comment: '角色表'
  }
);

export default Role;
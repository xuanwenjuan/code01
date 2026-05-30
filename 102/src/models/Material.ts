import { DataTypes, Model } from 'sequelize';
import sequelize from '../database';
import MaterialCategory from './MaterialCategory';

export interface MaterialAttributes {
  id?: number;
  categoryId: number;
  name: string;
  code: string;
  specification?: string;
  unit: string;
  unitPrice: number;
  stock: number;
  lockedStock: number;
  availableStock: number;
  minStock: number;
  origin?: string;
  description?: string;
  status: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

class Material extends Model<MaterialAttributes> implements MaterialAttributes {
  public id!: number;
  public categoryId!: number;
  public name!: string;
  public code!: string;
  public specification?: string;
  public unit!: string;
  public unitPrice!: number;
  public stock!: number;
  public lockedStock!: number;
  public availableStock!: number;
  public minStock!: number;
  public origin?: string;
  public description?: string;
  public status!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly category?: MaterialCategory;
}

Material.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '分类ID',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '原料名称',
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '原料编码',
    },
    specification: {
      type: DataTypes.STRING(200),
      comment: '规格',
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '单位',
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '单价',
    },
    stock: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '库存数量',
    },
    lockedStock: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '锁定库存数量',
    },
    availableStock: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '可用库存数量',
    },
    minStock: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: '最低库存',
    },
    origin: {
      type: DataTypes.STRING(100),
      comment: '产地',
    },
    description: {
      type: DataTypes.TEXT,
      comment: '描述',
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '状态',
    },
  },
  {
    sequelize,
    modelName: 'Material',
    tableName: 'materials',
    indexes: [
      { fields: ['categoryId'] },
      { fields: ['status'] },
    ],
  }
);

Material.belongsTo(MaterialCategory, {
  foreignKey: 'categoryId',
  as: 'category',
});

MaterialCategory.hasMany(Material, {
  foreignKey: 'categoryId',
  as: 'materials',
});

Material.beforeCreate((material) => {
  material.availableStock = Number(material.stock) - Number(material.lockedStock);
});

Material.beforeUpdate((material) => {
  material.availableStock = Number(material.stock) - Number(material.lockedStock);
});

export default Material;

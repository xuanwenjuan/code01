import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export enum BranchType {
  TRUNK_LINE = 'trunk_line',
  PROVINCIAL_BRANCH = 'provincial_branch',
  CITY_DELIVERY = 'city_delivery'
}

export enum BranchStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CLOSED = 'closed'
}

export interface BranchAttributes {
  id: number;
  name: string;
  code: string;
  type: BranchType;
  parentId?: number;
  address: string;
  province: string;
  city: string;
  district?: string;
  contactPerson: string;
  contactPhone: string;
  status: BranchStatus;
  sortOrder: number;
  remark?: string;
}

export interface BranchCreationAttributes extends Optional<BranchAttributes, 'id' | 'status' | 'sortOrder'> {}

class Branch extends Model<BranchAttributes, BranchCreationAttributes> implements BranchAttributes {
  public id!: number;
  public name!: string;
  public code!: string;
  public type!: BranchType;
  public parentId?: number;
  public address!: string;
  public province!: string;
  public city!: string;
  public district?: string;
  public contactPerson!: string;
  public contactPhone!: string;
  public status!: BranchStatus;
  public sortOrder!: number;
  public remark?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly parent?: Branch;
  public readonly children?: Branch[];
}

Branch.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '网点名称'
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '网点编码'
    },
    type: {
      type: DataTypes.ENUM(...Object.values(BranchType)),
      allowNull: false,
      comment: '网点类型:干线线路、省内支线、同城配送'
    },
    parentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      comment: '上级网点ID'
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '详细地址'
    },
    province: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '省份'
    },
    city: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '城市'
    },
    district: {
      type: DataTypes.STRING(50),
      comment: '区县'
    },
    contactPerson: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '联系人'
    },
    contactPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: '联系电话'
    },
    status: {
      type: DataTypes.ENUM(...Object.values(BranchStatus)),
      defaultValue: BranchStatus.ACTIVE,
      comment: '状态:运营中、停运、已注销'
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '排序'
    },
    remark: {
      type: DataTypes.TEXT,
      comment: '备注'
    }
  },
  {
    sequelize,
    tableName: 'branches',
    modelName: 'Branch'
  }
);

Branch.belongsTo(Branch, { foreignKey: 'parentId', as: 'parent' });
Branch.hasMany(Branch, { foreignKey: 'parentId', as: 'children' });

export default Branch;

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface RegionAttributes {
  id: number;
  name: string;
  code: string;
  parentId: number | null;
  level: number;
  sortOrder: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface RegionCreationAttributes extends Optional<RegionAttributes, 'id' | 'createdAt' | 'updatedAt' | 'level'> {}

class Region extends Model<RegionAttributes, RegionCreationAttributes> implements RegionAttributes {
  public id!: number;
  public name!: string;
  public code!: string;
  public parentId!: number | null;
  public level!: number;
  public sortOrder!: number;
  public status!: 'active' | 'inactive';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static async getRegionChain(regionId: number): Promise<Region[]> {
    const chain: Region[] = [];
    let currentId: number | null = regionId;

    while (currentId) {
      const region = await Region.findByPk(currentId);
      if (region) {
        chain.unshift(region);
        currentId = region.parentId;
      } else {
        break;
      }
    }

    return chain;
  }
}

Region.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    parentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'parent_id',
      defaultValue: null,
    },
    level: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
    },
    sortOrder: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      field: 'sort_order',
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
    },
  },
  {
    sequelize,
    tableName: 'regions',
    timestamps: true,
  }
);

Region.hasMany(Region, { foreignKey: 'parentId', as: 'children'});
Region.belongsTo(Region, { foreignKey: 'parentId', as: 'parent'});

export default Region;

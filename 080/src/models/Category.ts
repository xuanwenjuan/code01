import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface CategoryAttributes {
  id: number;
  name: string;
  parentId: number | null;
  level: number;
  sortOrder: number;
  icon?: string;
  commissionRate: number;
  status: 'active' | 'inactive';
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryCreationAttributes extends Optional<CategoryAttributes, 'id' | 'createdAt' | 'updatedAt' | 'level' | 'isDeleted'> {}

class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
  public id!: number;
  public name!: string;
  public parentId!: number | null;
  public level!: number;
  public sortOrder!: number;
  public icon?: string;
  public commissionRate!: number;
  public status!: 'active' | 'inactive';
  public isDeleted!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static async isCategoryChainActive(categoryId: number): Promise<{ valid: boolean; invalidCategory?: Category }> {
    const category = await Category.findByPk(categoryId);
    if (!category || category.isDeleted || category.status !== 'active') {
      return { valid: false, invalidCategory: category || undefined };
    }

    if (category.parentId) {
      const parentCheck = await Category.isCategoryChainActive(category.parentId);
      if (!parentCheck.valid) {
        return parentCheck;
      }
    }

    return { valid: true };
  }

  public static async getCategoryChain(categoryId: number): Promise<Category[]> {
    const chain: Category[] = [];
    let currentId: number | null = categoryId;

    while (currentId) {
      const category = await Category.findByPk(currentId);
      if (category) {
        chain.unshift(category);
        currentId = category.parentId;
      } else {
        break;
      }
    }

    return chain;
  }
}

Category.init(
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
    icon: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    commissionRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'commission_rate',
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_deleted',
    },
  },
  {
    sequelize,
    tableName: 'categories',
    timestamps: true,
  }
);

Category.hasMany(Category, { foreignKey: 'parentId', as: 'children'});
Category.belongsTo(Category, { foreignKey: 'parentId', as: 'parent'});

export default Category;

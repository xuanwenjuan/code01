import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface MaterialCategoryAttributes {
  id: number;
  name: string;
  code: string;
  parentId?: number;
  level: number;
  path?: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  isPurchasable: boolean;
  createdBy?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface MaterialCategoryCreationAttributes extends Optional<MaterialCategoryAttributes, 'id' | 'createdAt' | 'updatedAt' | 'level' | 'sortOrder' | 'isActive' | 'isPurchasable'> {}

class MaterialCategory extends Model<MaterialCategoryAttributes, MaterialCategoryCreationAttributes> implements MaterialCategoryAttributes {
  public id!: number;
  public name!: string;
  public code!: string;
  public parentId?: number;
  public level!: number;
  public path?: string;
  public description?: string;
  public sortOrder!: number;
  public isActive!: boolean;
  public isPurchasable!: boolean;
  public createdBy?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly children?: MaterialCategory[];
  public readonly parent?: MaterialCategory;

  public static async checkCategoryChainPurchasable(categoryId: number): Promise<{ isPurchasable: boolean; blockedCategory?: string }> {
    const category = await this.findByPk(categoryId, {
      include: [
        {
          model: this,
          as: 'parent',
          include: [{ all: true, nested: true }],
        },
      ],
    });

    if (!category) {
      return { isPurchasable: false };
    }

    if (!category.isPurchasable) {
      return { isPurchasable: false, blockedCategory: category.name };
    }

    let currentParent = category.parent;
    while (currentParent) {
      if (!(currentParent as MaterialCategory).isPurchasable) {
        return { isPurchasable: false, blockedCategory: (currentParent as MaterialCategory).name };
      }
      currentParent = (currentParent as MaterialCategory).parent;
    }

    return { isPurchasable: true };
  }

  public static async buildTree(parentId: number | null = null, includeInactive: boolean = false): Promise<MaterialCategory[]> {
    const where: any = { parentId };
    if (!includeInactive) {
      where.isActive = true;
    }

    const categories = await this.findAll({
      where,
      order: [['sortOrder', 'ASC'], ['id', 'ASC']],
    });

    const result: MaterialCategory[] = [];
    for (const category of categories) {
      const children = await this.buildTree(category.id, includeInactive);
      (category as any).dataValues.children = children;
      result.push(category);
    }

    return result;
  }
}

MaterialCategory.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '类目名称',
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '类目编码',
    },
    parentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      comment: '父类目ID',
      references: {
        model: 'material_categories',
        key: 'id',
      },
    },
    level: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 1,
      comment: '类目层级',
    },
    path: {
      type: DataTypes.STRING(500),
      comment: '类目路径',
    },
    description: {
      type: DataTypes.TEXT,
      comment: '类目描述',
    },
    sortOrder: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      comment: '排序权重',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '是否启用',
    },
    isPurchasable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: '是否可采购(停采标识)',
    },
    createdBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      comment: '创建人ID',
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'material_categories',
    modelName: 'MaterialCategory',
    timestamps: true,
    indexes: [
      { fields: ['parentId'] },
      { fields: ['code'] },
      { fields: ['level'] },
      { fields: ['sortOrder'] },
      { fields: ['isActive'] },
      { fields: ['isPurchasable'] },
    ],
  }
);

MaterialCategory.hasMany(MaterialCategory, {
  as: 'children',
  foreignKey: 'parentId',
});

MaterialCategory.belongsTo(MaterialCategory, {
  as: 'parent',
  foreignKey: 'parentId',
});

export default MaterialCategory;

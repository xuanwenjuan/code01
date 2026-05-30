import { Request, Response } from 'express';
import { Op, Transaction } from 'sequelize';
import { Recipe, RecipeItem, Ingredient, Product, sequelize } from '../models';
import { ResponseUtil } from '../utils/response';
import { BadRequestException, NotFoundException, ForbiddenException } from '../exceptions/HttpException';
import { UserRole } from '../types';

export const createRecipe = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();

  try {
    const { productId, name, description, version, storeId, items } = req.body;

    if (!productId || !name) {
      throw new BadRequestException('缺少必填参数');
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      throw new BadRequestException('产品不存在');
    }

    const recipe = await Recipe.create(
      {
        productId,
        name,
        description,
        version,
        storeId: storeId || req.user?.storeId,
        status: 'active'
      },
      { transaction }
    );

    if (items && items.length > 0) {
      const recipeItems = items.map((item: any) => ({
        recipeId: recipe.id,
        ingredientId: item.ingredientId,
        quantity: item.quantity,
        unit: item.unit,
        remark: item.remark
      }));

      await RecipeItem.bulkCreate(recipeItems, { transaction });
    }

    await transaction.commit();

    const result = await Recipe.findByPk(recipe.id, {
      include: [{ model: RecipeItem, as: 'items', include: [{ model: Ingredient, as: 'ingredient' }] }]
    });

    res.status(201).json(ResponseUtil.created(result, '配方创建成功'));
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const updateRecipe = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { name, description, version, status, items } = req.body;

    const recipe = await Recipe.findByPk(id, { transaction });
    if (!recipe) {
      throw new NotFoundException('配方不存在');
    }

    if (req.user?.role !== UserRole.SUPER_ADMIN && recipe.storeId && recipe.storeId !== req.user?.storeId) {
      throw new ForbiddenException('无权操作此配方');
    }

    await recipe.update(
      {
        name: name || recipe.name,
        description: description !== undefined ? description : recipe.description,
        version: version !== undefined ? version : recipe.version,
        status: status || recipe.status
      },
      { transaction }
    );

    if (items && items.length > 0) {
      await RecipeItem.destroy({
        where: { recipeId: id },
        transaction
      });

      const recipeItems = items.map((item: any) => ({
        recipeId: recipe.id,
        ingredientId: item.ingredientId,
        quantity: item.quantity,
        unit: item.unit,
        remark: item.remark
      }));

      await RecipeItem.bulkCreate(recipeItems, { transaction });
    }

    await transaction.commit();

    const result = await Recipe.findByPk(id, {
      include: [{ model: RecipeItem, as: 'items', include: [{ model: Ingredient, as: 'ingredient' }] }]
    });

    res.json(ResponseUtil.success(result, '配方更新成功'));
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const deleteRecipe = async (req: Request, res: Response) => {
  const { id } = req.params;

  const recipe = await Recipe.findByPk(id);
  if (!recipe) {
    throw new NotFoundException('配方不存在');
  }

  if (req.user?.role !== UserRole.SUPER_ADMIN && recipe.storeId && recipe.storeId !== req.user?.storeId) {
    throw new ForbiddenException('无权操作此配方');
  }

  await recipe.update({ status: 'inactive' });

  res.json(ResponseUtil.success(null, '配方已停用'));
};

export const getRecipe = async (req: Request, res: Response) => {
  const { id } = req.params;

  const recipe = await Recipe.findByPk(id, {
    include: [
      { model: RecipeItem, as: 'items', include: [{ model: Ingredient, as: 'ingredient' }] },
      { model: Product, as: 'product' }
    ]
  });

  if (!recipe) {
    throw new NotFoundException('配方不存在');
  }

  if (req.user?.role !== UserRole.SUPER_ADMIN && recipe.storeId && recipe.storeId !== req.user?.storeId) {
    throw new ForbiddenException('无权查看此配方');
  }

  res.json(ResponseUtil.success(recipe));
};

export const getRecipeList = async (req: Request, res: Response) => {
  const { productId, status, storeId, page = 1, pageSize = 10 } = req.query;

  const where: any = {};
  if (productId) {
    where.productId = productId;
  }
  if (status) {
    where.status = status;
  }
  if (req.user?.storeId) {
    where.storeId = req.user.storeId;
  } else if (storeId) {
    where.storeId = storeId;
  }

  const { count, rows } = await Recipe.findAndCountAll({
    where,
    include: [{ model: Product, as: 'product' }],
    order: [['createdAt', 'DESC']],
    limit: Number(pageSize),
    offset: (Number(page) - 1) * Number(pageSize)
  });

  res.json(ResponseUtil.pagination(rows, count, Number(page), Number(pageSize)));
};

export const addRecipeItem = async (req: Request, res: Response) => {
  const { recipeId } = req.params;
  const { ingredientId, quantity, unit, remark } = req.body;

  const recipe = await Recipe.findByPk(recipeId);
  if (!recipe) {
    throw new NotFoundException('配方不存在');
  }

  if (req.user?.role !== UserRole.SUPER_ADMIN && recipe.storeId && recipe.storeId !== req.user?.storeId) {
    throw new ForbiddenException('无权操作此配方');
  }

  const ingredient = await Ingredient.findByPk(ingredientId);
  if (!ingredient) {
    throw new BadRequestException('原料不存在');
  }

  const item = await RecipeItem.create({
    recipeId: Number(recipeId),
    ingredientId,
    quantity,
    unit,
    remark
  });

  res.status(201).json(ResponseUtil.created(item, '配方原料添加成功'));
};

export const updateRecipeItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { quantity, unit, remark } = req.body;

  const item = await RecipeItem.findByPk(id, {
    include: [{ model: Recipe, as: 'recipe' }]
  });

  if (!item) {
    throw new NotFoundException('配方原料不存在');
  }

  if (req.user?.role !== UserRole.SUPER_ADMIN && item.recipe?.storeId && item.recipe.storeId !== req.user?.storeId) {
    throw new ForbiddenException('无权操作此配方');
  }

  await item.update({
    quantity: quantity !== undefined ? quantity : item.quantity,
    unit: unit !== undefined ? unit : item.unit,
    remark: remark !== undefined ? remark : item.remark
  });

  res.json(ResponseUtil.success(item, '配方原料更新成功'));
};

export const deleteRecipeItem = async (req: Request, res: Response) => {
  const { id } = req.params;

  const item = await RecipeItem.findByPk(id, {
    include: [{ model: Recipe, as: 'recipe' }]
  });

  if (!item) {
    throw new NotFoundException('配方原料不存在');
  }

  if (req.user?.role !== UserRole.SUPER_ADMIN && item.recipe?.storeId && item.recipe.storeId !== req.user?.storeId) {
    throw new ForbiddenException('无权操作此配方');
  }

  await item.destroy();

  res.json(ResponseUtil.success(null, '配方原料删除成功'));
};

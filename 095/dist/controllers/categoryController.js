"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchUpdateCategoryStatus = exports.deleteCategory = exports.updateCategory = exports.getCategoryById = exports.getCategoryList = exports.getCategoryTree = exports.createCategory = exports.getCategoryChain = exports.hasDiscontinuedAncestor = exports.updateCategoryValidation = exports.createCategoryValidation = void 0;
const express_validator_1 = require("express-validator");
const Category_1 = __importDefault(require("../models/Category"));
const response_1 = require("../utils/response");
const errorHandler_1 = require("../middleware/errorHandler");
const types_1 = require("../types");
const sequelize_1 = require("sequelize");
exports.createCategoryValidation = [
    (0, express_validator_1.body)('name').notEmpty().withMessage('类目名称不能为空').trim().isLength({ min: 1, max: 100 }).withMessage('类目名称长度应在1-100字符之间'),
    (0, express_validator_1.body)('parentId').optional().isInt({ min: 1 }).withMessage('父类目ID必须为正整数'),
    (0, express_validator_1.body)('sortOrder').optional().isInt({ min: 0 }).withMessage('排序必须是非负整数'),
    (0, express_validator_1.body)('description').optional().isLength({ max: 500 }).withMessage('描述长度不能超过500字符'),
    (0, express_validator_1.body)('status').optional().isIn(Object.values(types_1.CategoryStatus)).withMessage('状态值无效，有效值：' + Object.values(types_1.CategoryStatus).join(', ')),
];
exports.updateCategoryValidation = [
    (0, express_validator_1.param)('id').isInt({ min: 1 }).withMessage('类目ID必须为正整数'),
    ...exports.createCategoryValidation,
];
const hasDescendant = async (parentId, childId, visited = new Set()) => {
    if (visited.has(parentId))
        return false;
    visited.add(parentId);
    const children = await Category_1.default.findAll({ where: { parentId } });
    for (const child of children) {
        if (child.id === childId) {
            return true;
        }
        const hasNested = await hasDescendant(child.id, childId, new Set(visited));
        if (hasNested) {
            return true;
        }
    }
    return false;
};
const hasDiscontinuedAncestor = async (categoryId) => {
    if (!categoryId)
        return false;
    const category = await Category_1.default.findByPk(categoryId);
    if (!category)
        return false;
    if (category.status === types_1.CategoryStatus.DISCONTINUED) {
        return true;
    }
    if (category.parentId) {
        return await (0, exports.hasDiscontinuedAncestor)(category.parentId);
    }
    return false;
};
exports.hasDiscontinuedAncestor = hasDiscontinuedAncestor;
const getCategoryChain = async (categoryId) => {
    const chain = [];
    let currentId = categoryId;
    while (currentId) {
        const category = await Category_1.default.findByPk(currentId);
        if (!category)
            break;
        chain.unshift(category);
        currentId = category.parentId;
    }
    return chain;
};
exports.getCategoryChain = getCategoryChain;
const buildCategoryTree = (categories, parentId = null, level = 0, maxDepth = 10) => {
    if (level >= maxDepth)
        return [];
    return categories
        .filter((cat) => cat.parentId === parentId)
        .sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) {
            return a.sortOrder - b.sortOrder;
        }
        return a.id - b.id;
    })
        .map((cat) => {
        const children = buildCategoryTree(categories, cat.id, level + 1, maxDepth);
        return {
            ...cat.toJSON(),
            level: cat.level,
            children,
            hasChildren: children.length > 0,
        };
    });
};
const buildCategoryTreeWithStatus = (categories, parentId = null, statusFilter) => {
    return categories
        .filter((cat) => {
        if (cat.parentId !== parentId)
            return false;
        if (statusFilter && cat.status !== statusFilter)
            return false;
        return true;
    })
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((cat) => {
        const children = buildCategoryTreeWithStatus(categories, cat.id, statusFilter);
        return {
            ...cat.toJSON(),
            children,
        };
    });
};
const createCategory = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return next(new errorHandler_1.AppError(errors.array()[0].msg, 400));
        }
        const { name, parentId, sortOrder, description, status } = req.body;
        let level = 1;
        if (parentId) {
            const parent = await Category_1.default.findByPk(parentId);
            if (!parent) {
                return next(new errorHandler_1.AppError('父类目不存在', 404));
            }
            level = parent.level + 1;
        }
        const category = await Category_1.default.create({
            name,
            parentId: parentId || null,
            level,
            sortOrder: sortOrder || 0,
            description,
            status: status || types_1.CategoryStatus.ACTIVE,
        });
        res.json((0, response_1.successResponse)(category, '类目创建成功'));
    }
    catch (error) {
        next(error);
    }
};
exports.createCategory = createCategory;
const getCategoryTree = async (req, res, next) => {
    try {
        const { status, maxDepth = '10' } = req.query;
        const where = {};
        if (status) {
            where.status = status;
        }
        const categories = await Category_1.default.findAll({
            where,
            order: [['sortOrder', 'ASC'], ['id', 'ASC']],
        });
        const tree = buildCategoryTree(categories, null, 0, parseInt(maxDepth));
        res.json((0, response_1.successResponse)(tree));
    }
    catch (error) {
        next(error);
    }
};
exports.getCategoryTree = getCategoryTree;
const getCategoryList = async (req, res, next) => {
    try {
        const { page = 1, pageSize = 10, name, status, parentId, level } = req.query;
        const where = {};
        if (name)
            where.name = { [sequelize_1.Op.like]: `%${name}%` };
        if (status)
            where.status = status;
        if (parentId !== undefined)
            where.parentId = parentId === 'null' ? null : Number(parentId);
        if (level)
            where.level = Number(level);
        const { count, rows } = await Category_1.default.findAndCountAll({
            where,
            offset: (Number(page) - 1) * Number(pageSize),
            limit: Number(pageSize),
            order: [['sortOrder', 'ASC'], ['id', 'ASC']],
            include: [{ model: Category_1.default, as: 'parent', attributes: ['id', 'name', 'status'] }],
        });
        res.json((0, response_1.paginatedResponse)(rows, count, Number(page), Number(pageSize)));
    }
    catch (error) {
        next(error);
    }
};
exports.getCategoryList = getCategoryList;
const getCategoryById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const category = await Category_1.default.findByPk(id, {
            include: [{ model: Category_1.default, as: 'parent', attributes: ['id', 'name', 'status'] }],
        });
        if (!category) {
            return next(new errorHandler_1.AppError('类目不存在', 404));
        }
        const chain = await (0, exports.getCategoryChain)(category.id);
        res.json((0, response_1.successResponse)({
            ...category.toJSON(),
            categoryChain: chain.map(c => ({ id: c.id, name: c.name, status: c.status })),
        }));
    }
    catch (error) {
        next(error);
    }
};
exports.getCategoryById = getCategoryById;
const updateCategory = async (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return next(new errorHandler_1.AppError(errors.array()[0].msg, 400));
        }
        const { id } = req.params;
        const { name, parentId, sortOrder, description, status } = req.body;
        const category = await Category_1.default.findByPk(id);
        if (!category) {
            return next(new errorHandler_1.AppError('类目不存在', 404));
        }
        if (status === types_1.CategoryStatus.DISCONTINUED && category.status !== types_1.CategoryStatus.DISCONTINUED) {
            const { Product } = await Promise.resolve().then(() => __importStar(require('../models')));
            const productCount = await Product.count({ where: { categoryId: id } });
            if (productCount > 0) {
                return next(new errorHandler_1.AppError(`该类目下还有 ${productCount} 个产品，请先处理产品后再下架类目`, 400));
            }
        }
        let level = category.level;
        if (parentId !== undefined && parentId !== category.parentId) {
            if (parentId === null) {
                level = 1;
            }
            else {
                if (Number(parentId) === category.id) {
                    return next(new errorHandler_1.AppError('不能将自己设为父类目', 400));
                }
                const parent = await Category_1.default.findByPk(parentId);
                if (!parent) {
                    return next(new errorHandler_1.AppError('父类目不存在', 404));
                }
                if (parent.status === types_1.CategoryStatus.DISCONTINUED) {
                    return next(new errorHandler_1.AppError('父类目已停产，不能设为父类目', 400));
                }
                const hasCycle = await hasDescendant(parentId, category.id);
                if (hasCycle) {
                    return next(new errorHandler_1.AppError('设置的父类目会导致循环引用', 400));
                }
                level = parent.level + 1;
            }
        }
        await category.update({
            name,
            parentId: parentId === undefined ? category.parentId : (parentId || null),
            level,
            sortOrder: sortOrder !== undefined ? sortOrder : category.sortOrder,
            description: description !== undefined ? description : category.description,
            status: status !== undefined ? status : category.status,
        });
        res.json((0, response_1.successResponse)(category, '类目更新成功'));
    }
    catch (error) {
        next(error);
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const category = await Category_1.default.findByPk(id);
        if (!category) {
            return next(new errorHandler_1.AppError('类目不存在', 404));
        }
        const childCount = await Category_1.default.count({ where: { parentId: id } });
        if (childCount > 0) {
            return next(new errorHandler_1.AppError(`该类目下还有 ${childCount} 个子类目，请先处理子类目后再操作`, 400));
        }
        const { Product } = await Promise.resolve().then(() => __importStar(require('../models')));
        const productCount = await Product.count({ where: { categoryId: id } });
        if (productCount > 0) {
            return next(new errorHandler_1.AppError(`该类目下还有 ${productCount} 个产品，请先处理产品后再操作`, 400));
        }
        await category.update({ status: types_1.CategoryStatus.DISCONTINUED });
        res.json((0, response_1.successResponse)(null, '类目已下架'));
    }
    catch (error) {
        next(error);
    }
};
exports.deleteCategory = deleteCategory;
const batchUpdateCategoryStatus = async (req, res, next) => {
    try {
        const { ids, status } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return next(new errorHandler_1.AppError('请选择要操作的类目', 400));
        }
        if (!Object.values(types_1.CategoryStatus).includes(status)) {
            return next(new errorHandler_1.AppError('状态值无效', 400));
        }
        if (status === types_1.CategoryStatus.DISCONTINUED) {
            for (const id of ids) {
                const childCount = await Category_1.default.count({ where: { parentId: id } });
                if (childCount > 0) {
                    return next(new errorHandler_1.AppError(`类目ID ${id} 下还有子类目，请先处理子类目后再操作`, 400));
                }
            }
        }
        await Category_1.default.update({ status }, { where: { id: { [sequelize_1.Op.in]: ids } } });
        res.json((0, response_1.successResponse)(null, `批量更新${ids.length}个类目状态成功`));
    }
    catch (error) {
        next(error);
    }
};
exports.batchUpdateCategoryStatus = batchUpdateCategoryStatus;
//# sourceMappingURL=categoryController.js.map
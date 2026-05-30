
import { body, query, param } from 'express-validator';
import { AssetStatus, ApplicationType, ApplicationStatus, InventoryResult } from '../types';

export const commonValidators = {
  page: query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('页码必须大于0'),
  
  pageSize: query('pageSize')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每页数量必须在1-100之间'),
  
  id: param('id')
    .isInt({ min: 1 })
    .withMessage('ID必须为正整数'),
  
  ids: body('ids')
    .isArray({ min: 1 })
    .withMessage('ID列表不能为空')
    .custom((value) => {
      return value.every((id: any) => typeof id === 'number' && id > 0);
    })
    .withMessage('ID列表必须包含有效的正整数'),
  
  keyword: query('keyword')
    .optional()
    .isLength({ max: 100 })
    .withMessage('关键词长度不能超过100个字符'),
  
  startDate: query('startDate')
    .optional()
    .isISO8601()
    .withMessage('开始日期格式不正确'),
  
  endDate: query('endDate')
    .optional()
    .isISO8601()
    .withMessage('结束日期格式不正确'),
  
  status: query('status')
    .optional()
    .isIn(Object.values(AssetStatus))
    .withMessage('状态值不正确'),
  
  department: query('department')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('部门名称长度必须在1-50个字符'),
  
  categoryId: query('categoryId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('分类ID必须为正整数')
};

export const categoryValidators = {
  name: body('name')
    .isLength({ min: 1, max: 50 })
    .withMessage('分类名称长度必须在1-50个字符'),
  
  code: body('code')
    .isLength({ min: 1, max: 20 })
    .withMessage('分类编码长度必须在1-20个字符'),
  
  parentId: body('parentId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('父分类ID必须为正整数'),
  
  sort: body('sort')
    .optional()
    .isInt({ min: 0 })
    .withMessage('排序值必须大于等于0'),
  
  description: body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('描述长度不能超过500个字符'),
  
  isActive: body('isActive')
    .optional()
    .isBoolean()
    .withMessage('状态必须为布尔值')
};

export const assetValidators = {
  assetCode: body('assetCode')
    .isLength({ min: 1, max: 30 })
    .withMessage('资产编码长度必须在1-30个字符'),
  
  name: body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('资产名称长度必须在1-100个字符'),
  
  categoryId: body('categoryId')
    .isInt({ min: 1 })
    .withMessage('分类ID必须为正整数'),
  
  specModel: body('specModel')
    .optional()
    .isLength({ max: 100 })
    .withMessage('规格型号长度不能超过100个字符'),
  
  brand: body('brand')
    .optional()
    .isLength({ max: 50 })
    .withMessage('品牌长度不能超过50个字符'),
  
  purchaseDate: body('purchaseDate')
    .isISO8601()
    .withMessage('采购日期格式不正确'),
  
  purchasePrice: body('purchasePrice')
    .isFloat({ min: 0 })
    .withMessage('采购价格必须大于等于0'),
  
  depreciationRate: body('depreciationRate')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('折旧率必须在0-100之间'),
  
  department: body('department')
    .optional()
    .isLength({ max: 50 })
    .withMessage('部门长度不能超过50个字符'),
  
  storageLocation: body('storageLocation')
    .optional()
    .isLength({ max: 100 })
    .withMessage('存放位置长度不能超过100个字符'),
  
  responsiblePerson: body('responsiblePerson')
    .optional()
    .isLength({ max: 20 })
    .withMessage('负责人长度不能超过20个字符'),
  
  status: body('status')
    .optional()
    .isIn(Object.values(AssetStatus))
    .withMessage('状态值不正确'),
  
  warrantyDate: body('warrantyDate')
    .optional()
    .isISO8601()
    .withMessage('保修日期格式不正确'),
  
  description: body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('描述长度不能超过1000个字符')
};

export const applicationValidators = {
  type: body('type')
    .isIn(Object.values(ApplicationType))
    .withMessage('申请类型不正确'),
  
  assetId: body('assetId')
    .isInt({ min: 1 })
    .withMessage('资产ID必须为正整数'),
  
  targetDepartment: body('targetDepartment')
    .optional()
    .isLength({ max: 50 })
    .withMessage('目标部门长度不能超过50个字符'),
  
  reason: body('reason')
    .isLength({ min: 1, max: 500 })
    .withMessage('申请原因长度必须在1-500个字符'),
  
  expectedReturnDate: body('expectedReturnDate')
    .optional()
    .isISO8601()
    .withMessage('预计归还日期格式不正确'),
  
  status: body('status')
    .optional()
    .isIn([ApplicationStatus.APPROVED, ApplicationStatus.REJECTED])
    .withMessage('审批状态不正确'),
  
  approvalRemark: body('approvalRemark')
    .optional()
    .isLength({ max: 500 })
    .withMessage('审批意见长度不能超过500个字符'),
  
  applicationIds: body('applicationIds')
    .isArray({ min: 1 })
    .withMessage('申请ID列表不能为空')
    .custom((value) => {
      return value.every((id: any) => typeof id === 'number' && id > 0);
    })
    .withMessage('申请ID列表必须包含有效的正整数'),
  
  batchStatus: body('status')
    .isIn([ApplicationStatus.APPROVED, ApplicationStatus.REJECTED])
    .withMessage('批量审批状态不正确')
};

export const inventoryValidators = {
  inventoryDate: body('inventoryDate')
    .isISO8601()
    .withMessage('盘点日期格式不正确'),
  
  assetId: body('assetId')
    .isInt({ min: 1 })
    .withMessage('资产ID必须为正整数'),
  
  bookStatus: body('bookStatus')
    .optional()
    .isIn(Object.values(AssetStatus))
    .withMessage('账面状态值不正确'),
  
  actualStatus: body('actualStatus')
    .optional()
    .isIn(Object.values(AssetStatus))
    .withMessage('实际状态值不正确'),
  
  result: body('result')
    .isIn(Object.values(InventoryResult))
    .withMessage('盘点结果值不正确'),
  
  remark: body('remark')
    .optional()
    .isLength({ max: 500 })
    .withMessage('备注长度不能超过500个字符'),
  
  assets: body('assets')
    .isArray({ min: 1 })
    .withMessage('盘点资产列表不能为空')
    .custom((value) => {
      return value.every((item: any) => 
        typeof item.assetId === 'number' && 
        item.assetId > 0 && 
        Object.values(InventoryResult).includes(item.result)
      );
    })
    .withMessage('盘点资产列表格式不正确')
};

export const authValidators = {
  username: body('username')
    .isLength({ min: 3, max: 20 })
    .withMessage('用户名长度必须在3-20个字符')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('用户名只能包含字母、数字和下划线'),
  
  password: body('password')
    .isLength({ min: 6, max: 20 })
    .withMessage('密码长度必须在6-20个字符'),
  
  realName: body('realName')
    .isLength({ min: 1, max: 20 })
    .withMessage('真实姓名长度必须在1-20个字符'),
  
  phone: body('phone')
    .optional()
    .matches(/^1[3-9]\d{9}$/)
    .withMessage('手机号格式不正确'),
  
  email: body('email')
    .optional()
    .isEmail()
    .withMessage('邮箱格式不正确'),
  
  role: body('role')
    .optional()
    .isIn(['asset_admin', 'department_head', 'general_user'])
    .withMessage('角色值不正确')
};

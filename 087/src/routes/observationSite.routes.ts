import { Router } from 'express';
import { body, query } from 'express-validator';
import observationSiteController from '../controllers/observationSite.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { UserRole, SiteStatus } from '../types';

const router = Router();

router.use(authMiddleware);

router.post(
  '/',
  roleMiddleware(UserRole.ADMIN, UserRole.MAINTENANCE),
  [
    body('siteCode').notEmpty().withMessage('站点编号不能为空').isLength({ max: 50 }).withMessage('站点编号不能超过50个字符'),
    body('name').notEmpty().withMessage('站点名称不能为空').isLength({ max: 100 }).withMessage('站点名称不能超过100个字符'),
    body('address').notEmpty().withMessage('地址不能为空').isLength({ max: 255 }).withMessage('地址不能超过255个字符'),
    body('district').notEmpty().withMessage('辖区不能为空').isLength({ max: 100 }).withMessage('辖区不能超过100个字符'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('经度必须在-180到180之间'),
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('纬度必须在-90到90之间'),
    body('altitude').optional().isFloat({ min: -500, max: 9000 }).withMessage('海拔值必须在-500到9000米之间'),
    body('buildDate').isISO8601().withMessage('建站日期格式不正确'),
    body('contactPerson').optional().isLength({ max: 50 }).withMessage('联系人不能超过50个字符'),
    body('contactPhone').optional().isMobilePhone('zh-CN').withMessage('手机号格式不正确'),
    body('remark').optional().isLength({ max: 500 }).withMessage('备注不能超过500个字符')
  ],
  validate,
  observationSiteController.createSite
);

router.put(
  '/:id',
  roleMiddleware(UserRole.ADMIN, UserRole.MAINTENANCE),
  [
    body('siteCode').optional().isLength({ max: 50 }).withMessage('站点编号不能超过50个字符'),
    body('name').optional().isLength({ max: 100 }).withMessage('站点名称不能超过100个字符'),
    body('address').optional().isLength({ max: 255 }).withMessage('地址不能超过255个字符'),
    body('district').optional().isLength({ max: 100 }).withMessage('辖区不能超过100个字符'),
    body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('经度必须在-180到180之间'),
    body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('纬度必须在-90到90之间'),
    body('altitude').optional().isFloat({ min: -500, max: 9000 }).withMessage('海拔值必须在-500到9000米之间'),
    body('buildDate').optional().isISO8601().withMessage('建站日期格式不正确')
  ],
  validate,
  observationSiteController.updateSite
);

router.delete(
  '/:id',
  roleMiddleware(UserRole.ADMIN),
  observationSiteController.deleteSite
);

router.get('/:id', observationSiteController.getSiteById);

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('页码必须为正整数'),
    query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间')
  ],
  validate,
  observationSiteController.getSiteList
);

router.patch(
  '/:id/status',
  roleMiddleware(UserRole.ADMIN, UserRole.MAINTENANCE),
  [
    body('status').isIn(Object.values(SiteStatus)).withMessage('状态值无效')
  ],
  validate,
  observationSiteController.updateStatus
);

router.patch(
  '/:id/inspection-date',
  roleMiddleware(UserRole.ADMIN, UserRole.MAINTENANCE, UserRole.INSPECTION),
  observationSiteController.updateInspectionDate
);

router.get('/needing-inspection/list', observationSiteController.getSitesNeedingInspection);

router.get('/overdue-inspection/list', observationSiteController.getOverdueInspectionSites);

router.get('/statistics/data', observationSiteController.getSiteStatistics);

router.get('/districts/list', observationSiteController.getDistrictList);

export default router;

import { Request, Response, NextFunction } from 'express';
import OperationLog from '../models/OperationLog';

interface OperationLogConfig {
  module: string;
  operation: string;
  logParams?: boolean;
  logResult?: boolean;
}

const moduleMapping: Record<string, string> = {
  '/api/auth': '认证模块',
  '/api/users': '用户管理',
  '/api/categories': '诊疗项目分类',
  '/api/treatments': '诊疗项目管理',
  '/api/staff': '医护人员管理',
  '/api/schedules': '排班管理',
  '/api/patients': '患者管理',
  '/api/appointments': '预约管理',
  '/api/records': '诊疗记录',
  '/api/billings': '收费账单',
  '/api/logs': '操作日志',
};

const operationMapping: Record<string, string> = {
  POST: '新增',
  PUT: '修改',
  PATCH: '更新',
  DELETE: '删除',
  GET: '查询',
};

export const operationLogMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();
  const originalSend = res.send;
  let responseData: any;

  res.send = function (data: any) {
    responseData = data;
    return originalSend.call(this, data);
  };

  res.on('finish', async () => {
    try {
      const duration = Date.now() - startTime;
      const path = req.path;
      
      let module = '其他';
      for (const [key, value] of Object.entries(moduleMapping)) {
        if (path.startsWith(key)) {
          module = value;
          break;
        }
      }

      let operation = operationMapping[req.method] || '未知';
      if (path.includes('/login')) operation = '登录';
      if (path.includes('/logout')) operation = '登出';
      if (path.includes('/register')) operation = '注册';
      if (path.includes('/status')) operation = '更新状态';

      let params = '';
      if (Object.keys(req.body).length > 0) {
        const body = { ...req.body };
        if (body.password) delete body.password;
        if (body.oldPassword) delete body.oldPassword;
        if (body.newPassword) delete body.newPassword;
        params = JSON.stringify(body);
      } else if (Object.keys(req.query).length > 0) {
        params = JSON.stringify(req.query);
      }

      let result = '';
      if (responseData) {
        try {
          const parsed = typeof responseData === 'string' 
            ? JSON.parse(responseData) 
            : responseData;
          result = JSON.stringify({
            success: parsed.success,
            code: parsed.code,
            message: parsed.message,
          });
        } catch {
          result = responseData.substring(0, 500);
        }
      }

      await OperationLog.create({
        userId: req.user?.userId,
        username: req.user?.username,
        module,
        operation,
        method: req.method,
        url: req.originalUrl,
        ip: req.headers['x-forwarded-for'] as string || req.ip,
        params: params.substring(0, 2000),
        result,
        status: res.statusCode < 400 ? 'success' : 'fail',
        errorMessage: res.statusCode >= 400 ? result : undefined,
        duration,
      });
    } catch (error) {
      console.error('记录操作日志失败:', error);
    }
  });

  next();
};

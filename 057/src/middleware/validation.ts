import { Request, Response, NextFunction } from 'express';
import { Schema, ValidationOptions } from 'joi';
import { BadRequestException } from '../exceptions/HttpException';

interface ExtendedValidationOptions extends ValidationOptions {
  stripUnknown?: boolean;
}

const defaultOptions: ExtendedValidationOptions = {
  abortEarly: false,
  stripUnknown: true,
  convert: true,
};

export const validate = (
  schema: Schema,
  property: 'body' | 'query' | 'params' = 'body',
  options: ExtendedValidationOptions = {}
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], {
      ...defaultOptions,
      ...options,
    });
    
    if (error) {
      const errors = error.details
        .map(detail => {
          const field = detail.path.join('.');
          const message = detail.message.replace(/"/g, '');
          return `${field}: ${message}`;
        })
        .join('; ');
      
      throw new BadRequestException(errors);
    }
    
    req[property] = value;
    
    next();
  };
};

export const validateId = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName];
    const parsedId = parseInt(id);
    
    if (isNaN(parsedId) || parsedId <= 0 || !Number.isInteger(parsedId)) {
      throw new BadRequestException(`参数 ${paramName} 必须是正整数`);
    }
    
    next();
  };
};

export const validatePagination = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;
  
  if (page < 1) {
    throw new BadRequestException('page 必须大于等于1');
  }
  
  if (pageSize < 1 || pageSize > 100) {
    throw new BadRequestException('pageSize 必须在1-100之间');
  }
  
  next();
};

export const validateYearMonth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const year = parseInt(req.query.year as string);
  const month = parseInt(req.query.month as string);
  
  if (!year || year < 2000 || year > 2100) {
    throw new BadRequestException('年份参数不正确，必须在2000-2100之间');
  }
  
  if (!month || month < 1 || month > 12) {
    throw new BadRequestException('月份参数不正确，必须在1-12之间');
  }
  
  next();
};

export const validateEmployeeId = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const employeeId = req.user?.employeeId;
  if (!employeeId) {
    throw new BadRequestException('用户未关联员工信息');
  }
  next();
};

export const validateDateRange = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { startDate, endDate } = req.query;
  
  if (startDate && endDate) {
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    
    if (isNaN(start.getTime())) {
      throw new BadRequestException('startDate 不是有效的日期格式');
    }
    
    if (isNaN(end.getTime())) {
      throw new BadRequestException('endDate 不是有效的日期格式');
    }
    
    if (start > end) {
      throw new BadRequestException('开始日期不能大于结束日期');
    }
  }
  
  next();
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateIdCard = (idCard: string): boolean => {
  const idCardRegex = /(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
  return idCardRegex.test(idCard);
};

export const validatePositiveNumber = (value: number): boolean => {
  return !isNaN(value) && value > 0;
};

export const validatePositiveInteger = (value: number): boolean => {
  return Number.isInteger(value) && value > 0;
};

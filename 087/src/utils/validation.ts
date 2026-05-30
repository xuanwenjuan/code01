import { Request } from 'express';
import { ValidationException } from '../exceptions/http.exception';

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date' | 'email';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: any[];
  custom?: (value: any) => boolean | string;
}

export class ValidationUtil {
  static validate(req: Request, rules: ValidationRule[]) {
    const errors: string[] = [];
    const data = { ...req.params, ...req.query, ...req.body };

    for (const rule of rules) {
      const value = data[rule.field];
      
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${rule.field} 是必填项`);
        continue;
      }

      if (value === undefined || value === null) continue;

      if (rule.type) {
        const typeValid = this.validateType(value, rule.type);
        if (!typeValid) {
          errors.push(`${rule.field} 必须是 ${rule.type} 类型`);
          continue;
        }
      }

      if (rule.minLength !== undefined && typeof value === 'string' && value.length < rule.minLength) {
        errors.push(`${rule.field} 长度不能少于 ${rule.minLength} 个字符`);
      }

      if (rule.maxLength !== undefined && typeof value === 'string' && value.length > rule.maxLength) {
        errors.push(`${rule.field} 长度不能超过 ${rule.maxLength} 个字符`);
      }

      if (rule.min !== undefined && typeof value === 'number' && value < rule.min) {
        errors.push(`${rule.field} 不能小于 ${rule.min}`);
      }

      if (rule.max !== undefined && typeof value === 'number' && value > rule.max) {
        errors.push(`${rule.field} 不能大于 ${rule.max}`);
      }

      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        errors.push(`${rule.field} 格式不正确`);
      }

      if (rule.enum && !rule.enum.includes(value)) {
        errors.push(`${rule.field} 必须是 ${rule.enum.join(', ')} 中的一个`);
      }

      if (rule.custom) {
        const result = rule.custom(value);
        if (result !== true) {
          errors.push(typeof result === 'string' ? result : `${rule.field} 验证失败`);
        }
      }
    }

    if (errors.length > 0) {
      throw new ValidationException(errors.join('; '));
    }
  }

  private static validateType(value: any, type: string): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'date':
        return !isNaN(new Date(value).getTime());
      case 'email':
        return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      default:
        return true;
    }
  }

  static validateId(id: string): number {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId) || parsedId <= 0) {
      throw new ValidationException('ID 必须是正整数');
    }
    return parsedId;
  }

  static validatePagination(page: number, pageSize: number) {
    if (page < 1) {
      throw new ValidationException('页码必须大于等于1');
    }
    if (pageSize < 1 || pageSize > 100) {
      throw new ValidationException('每页数量必须在1-100之间');
    }
  }

  static validateDateRange(startDate?: string, endDate?: string) {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start > end) {
        throw new ValidationException('开始日期不能大于结束日期');
      }
    }
  }
}

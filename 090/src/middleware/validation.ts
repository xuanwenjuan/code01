import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ResponseUtil } from '../utils/response';

export function validateBody(type: any) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const instance = plainToInstance(type, req.body);
    const errors = await validate(instance, {
      whitelist: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: false
    });

    if (errors.length > 0) {
      const formattedErrors = formatErrors(errors);
      res.status(400).json(ResponseUtil.badRequest(formattedErrors));
      return;
    }

    req.body = instance;
    next();
  };
}

export function validateQuery(type: any) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const instance = plainToInstance(type, req.query);
    const errors = await validate(instance, {
      whitelist: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: false
    });

    if (errors.length > 0) {
      const formattedErrors = formatErrors(errors);
      res.status(400).json(ResponseUtil.badRequest(formattedErrors));
      return;
    }

    next();
  };
}

export function validateParams(type: any) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const instance = plainToInstance(type, req.params);
    const errors = await validate(instance, {
      whitelist: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: false
    });

    if (errors.length > 0) {
      const formattedErrors = formatErrors(errors);
      res.status(400).json(ResponseUtil.badRequest(formattedErrors));
      return;
    }

    next();
  };
}

function formatErrors(errors: ValidationError[]): string {
  const messages: string[] = [];
  
  for (const error of errors) {
    if (error.constraints) {
      for (const [, message] of Object.entries(error.constraints)) {
        messages.push(message);
      }
    }
    if (error.children && error.children.length > 0) {
      const childMessages = formatNestedErrors(error.children, error.property);
      messages.push(...childMessages);
    }
  }

  return messages.join('; ');
}

function formatNestedErrors(errors: ValidationError[], parentPath: string): string[] {
  const messages: string[] = [];
  
  for (const error of errors) {
    const path = `${parentPath}.${error.property}`;
    if (error.constraints) {
      for (const [, message] of Object.entries(error.constraints)) {
        messages.push(`${path}: ${message}`);
      }
    }
    if (error.children && error.children.length > 0) {
      const childMessages = formatNestedErrors(error.children, path);
      messages.push(...childMessages);
    }
  }

  return messages;
}

export class IdParamDto {
  id!: string;
}

export class PageQueryDto {
  page?: number;
  pageSize?: number;
}

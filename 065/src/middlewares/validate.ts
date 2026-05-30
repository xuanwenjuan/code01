import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { BadRequestException } from '../exceptions/HttpException';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate({
      body: req.body,
      query: req.query,
      params: req.params,
    }, {
      abortEarly: false,
      allowUnknown: true,
    });

    if (error) {
      const errors = error.details.map(detail => detail.message).join(', ');
      throw new BadRequestException(`参数验证失败: ${errors}`);
    }

    next();
  };
};
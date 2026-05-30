import Joi from 'joi';
import { BadRequestException } from '../exceptions/http.exception';

export const validate = (schema: Joi.ObjectSchema, data: any) => {
  const { error } = schema.validate(data, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => detail.message);
    throw new BadRequestException(errors.join(', '));
  }
};

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(10)
});

export const idSchema = Joi.object({
  id: Joi.number().integer().min(1).required()
});

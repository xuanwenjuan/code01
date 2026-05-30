import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { BadRequestException } from '../exceptions/base.exception';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      next();
      return;
    }

    const errorMessages = errors
      .array()
      .map((err) => `${err.param}: ${err.msg}`)
      .join('; ');

    next(new BadRequestException(errorMessages));
  };
};

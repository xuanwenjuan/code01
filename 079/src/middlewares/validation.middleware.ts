import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import { ResponseUtil } from '../utils/response'

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false
    })

    if (error) {
      const errors = error.details.map((detail) => detail.message)
      res.status(400).json(ResponseUtil.badRequest('参数验证失败: ' + errors.join(', ')))
      return
    }

    next()
  }
}

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.query, {
      abortEarly: false,
      allowUnknown: false
    })

    if (error) {
      const errors = error.details.map((detail) => detail.message)
      res.status(400).json(ResponseUtil.badRequest('查询参数验证失败: ' + errors.join(', ')))
      return
    }

    next()
  }
}

export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.params, {
      abortEarly: false,
      allowUnknown: false
    })

    if (error) {
      const errors = error.details.map((detail) => detail.message)
      res.status(400).json(ResponseUtil.badRequest('路径参数验证失败: ' + errors.join(', ')))
      return
    }

    next()
  }
}

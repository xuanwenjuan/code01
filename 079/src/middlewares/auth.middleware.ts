import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config'
import { ResponseUtil } from '../utils/response'
import { UserRole, JwtPayload } from '../types'
import { User } from '../models'

export interface AuthRequest extends Request {
  user?: JwtPayload
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json(ResponseUtil.unauthorized('未提供认证令牌'))
      return
    }

    const token = authHeader.split(' ')[1]

    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload

    const user = await User.findByPk(decoded.userId)
    if (!user || !user.status) {
      res.status(401).json(ResponseUtil.unauthorized('用户不存在或已被禁用'))
      return
    }

    req.user = decoded
    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json(ResponseUtil.unauthorized('令牌已过期'))
      return
    }
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json(ResponseUtil.unauthorized('无效的令牌'))
      return
    }
    res.status(401).json(ResponseUtil.unauthorized('认证失败'))
  }
}

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(ResponseUtil.unauthorized('未登录'))
      return
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json(ResponseUtil.forbidden('权限不足'))
      return
    }

    next()
  }
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  })
}

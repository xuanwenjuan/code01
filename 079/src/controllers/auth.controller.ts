import { Response } from 'express'
import { User, Dealer } from '../models'
import { ResponseUtil } from '../utils/response'
import { generateToken, AuthRequest } from '../middlewares/auth.middleware'
import { AppError } from '../middlewares/error.middleware'
import { UserRole } from '../types'
import bcrypt from 'bcryptjs'

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  const { username, password } = req.body

  const user = await User.findOne({ where: { username } })
  if (!user) {
    throw new AppError('用户名或密码错误', 400)
  }

  const isValidPassword = await user.comparePassword(password)
  if (!isValidPassword) {
    throw new AppError('用户名或密码错误', 400)
  }

  if (!user.status) {
    throw new AppError('账号已被禁用', 400)
  }

  await user.update({ lastLoginAt: new Date() })

  const token = generateToken({
    userId: user.id,
    username: user.username,
    role: user.role
  })

  res.json(
    ResponseUtil.success(
      {
        token,
        user: {
          id: user.id,
          username: user.username,
          realName: user.realName,
          phone: user.phone,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        }
      },
      '登录成功'
    )
  )
}

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  const { username, password, realName, phone, email, companyName } = req.body

  const existingUser = await User.findOne({ where: { username } })
  if (existingUser) {
    throw new AppError('用户名已存在', 400)
  }

  const existingPhone = await User.findOne({ where: { phone } })
  if (existingPhone) {
    throw new AppError('手机号已被注册', 400)
  }

  const user = await User.create({
    username,
    password,
    realName,
    phone,
    email,
    role: UserRole.DEALER,
    status: true
  })

  await Dealer.create({
    userId: user.id,
    companyName,
    creditLimit: 0,
    currentBalance: 0,
    rebateRate: 0,
    totalPurchaseAmount: 0,
    level: 1,
    status: true
  })

  res.json(ResponseUtil.success(null, '注册成功，请等待审核'))
}

export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findByPk(req.user!.userId, {
    attributes: { exclude: ['password'] },
    include: [{ model: Dealer, as: 'dealer' }]
  })

  if (!user) {
    throw new AppError('用户不存在', 404)
  }

  res.json(ResponseUtil.success(user, '获取成功'))
}

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  const { oldPassword, newPassword } = req.body

  const user = await User.findByPk(req.user!.userId)
  if (!user) {
    throw new AppError('用户不存在', 404)
  }

  const isValidPassword = await user.comparePassword(oldPassword)
  if (!isValidPassword) {
    throw new AppError('原密码错误', 400)
  }

  await user.update({ password: newPassword })

  res.json(ResponseUtil.success(null, '密码修改成功'))
}

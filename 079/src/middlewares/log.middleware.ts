import { Request, Response, NextFunction } from 'express'
import { OperationLog } from '../models'
import { AuthRequest } from './auth.middleware'
import { OperationModule, OperationAction } from '../types'
import { Logger } from '../utils/logger'

export const operationLog = (module: OperationModule, action: OperationAction) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): void => {
    const startTime = Date.now()
    const originalSend = res.send
    let responseBody = ''

    res.send = function (body?: any): Response {
      responseBody = typeof body === 'string' ? body : JSON.stringify(body)
      return originalSend.call(this, body)
    }

    res.on('finish', async () => {
      const duration = Date.now() - startTime
      const status = res.statusCode >= 200 && res.statusCode < 400

      try {
        await OperationLog.create({
          userId: req.user?.userId,
          username: req.user?.username,
          module,
          action,
          method: req.method,
          url: req.originalUrl,
          ip: req.ip || req.socket.remoteAddress || '',
          params: JSON.stringify({
            body: req.body,
            query: req.query,
            params: req.params
          }),
          result: responseBody.substring(0, 2000),
          status,
          errorMsg: status ? undefined : `HTTP ${res.statusCode}`,
          duration
        })
      } catch (error) {
        Logger.error('Failed to save operation log', error)
      }
    })

    next()
  }
}

export const logOperation = async (
  module: OperationModule,
  action: OperationAction,
  req: AuthRequest,
  success: boolean,
  extra?: {
    params?: any
    result?: string
    errorMsg?: string
    duration?: number
  } = {}
): Promise<void> => {
  try {
    await OperationLog.create({
      userId: req.user?.userId,
      username: req.user?.username,
      module,
      action,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.socket.remoteAddress || '',
      params: extra.params ? JSON.stringify(extra.params) : undefined,
      result: extra.result?.substring(0, 2000),
      status: success,
      errorMsg: extra.errorMsg,
      duration: extra.duration
    })
  } catch (error) {
    Logger.error('Failed to save operation log', error)
  }
}

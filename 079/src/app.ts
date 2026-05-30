import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { config } from './config'
import { connectDatabase, syncDatabase } from './database'
import { notFoundHandler, errorHandler, AppError } from './middlewares/error.middleware'
import { ResponseUtil } from './utils/response'
import { Logger } from './utils/logger'
import TaskService from './services/task.service'

import authRoutes from './routes/auth.routes'
import categoryRoutes from './routes/category.routes'
import supplierRoutes from './routes/supplier.routes'
import brandRoutes from './routes/brand.routes'
import productRoutes from './routes/product.routes'
import orderRoutes from './routes/order.routes'
import settlementRoutes from './routes/settlement.routes'

const app = express()

app.use(helmet())
app.use(cors())
app.use(morgan('combined'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/health', (req: Request, res: Response) => {
  res.json(ResponseUtil.success({ status: 'ok' }, 'Service is running'))
})

app.use('/api/auth', authRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/suppliers', supplierRoutes)
app.use('/api/brands', brandRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/settlements', settlementRoutes)

app.use(notFoundHandler)
app.use((err: Error | AppError, req: Request, res: Response, next: NextFunction) => {
  Logger.error(`Error: ${err.message}`, { stack: err.stack })
  errorHandler(err, req, res, next)
})

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase()
    await syncDatabase()

    TaskService.init()

    app.listen(config.port, () => {
      Logger.info(`Server is running on port ${config.port}`)
      Logger.info(`Environment: ${config.nodeEnv}`)
    })
  } catch (error) {
    Logger.error('Failed to start server', error)
    process.exit(1)
  }
}

process.on('SIGTERM', () => {
  Logger.info('SIGTERM received, shutting down gracefully')
  TaskService.stop()
  process.exit(0)
})

process.on('SIGINT', () => {
  Logger.info('SIGINT received, shutting down gracefully')
  TaskService.stop()
  process.exit(0)
})

startServer()

export default app

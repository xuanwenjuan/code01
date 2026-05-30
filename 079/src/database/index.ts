import { Sequelize } from 'sequelize'
import { config } from '../config'
import { Logger } from '../utils/logger'

const sequelize = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: 'mysql',
    timezone: '+08:00',
    logging: (sql) => Logger.debug(sql),
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
)

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate()
    Logger.info('数据库连接成功')
  } catch (error) {
    Logger.error('数据库连接失败', error)
    process.exit(1)
  }
}

export const syncDatabase = async (): Promise<void> => {
  try {
    await sequelize.sync({ alter: config.nodeEnv === 'development' })
    Logger.info('数据库同步完成')
  } catch (error) {
    Logger.error('数据库同步失败', error)
    process.exit(1)
  }
}

export { sequelize }
export default sequelize

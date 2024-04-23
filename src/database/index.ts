import { Dialect, Sequelize } from 'sequelize'
import config from './config'

export const db = new Sequelize(
  `${process.env.POSTGRES_DB}`,
  `${process.env.POSTGRES_USER}`,
  `${process.env.POSTGRES_PASSWORD}`,
  {
    host: process.env.HOST,
    dialect: config.dialect as Dialect,
    pool: { ...config.pool },
  },
)

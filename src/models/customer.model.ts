import { DataTypes, ModelDefined } from 'sequelize'
import { db } from '../database'
import { Customer as CustomerInterface } from './customer.dto'

export const customer: ModelDefined<
  CustomerInterface,
  Omit<CustomerInterface, 'id'>
> = db.define('customer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  lastname: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  firstname: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
})

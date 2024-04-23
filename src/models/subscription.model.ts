import { DataTypes, ModelDefined } from 'sequelize'
import { db } from '../database'
import { Subscription as SubscriptionInterface } from './subscription.dto'

export const Subscription: ModelDefined<
  SubscriptionInterface,
  Omit<SubscriptionInterface, 'id'>
> = db.define('Subscription', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
})

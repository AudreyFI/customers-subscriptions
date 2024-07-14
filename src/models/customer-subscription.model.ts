import { DataTypes, ModelDefined } from 'sequelize'
import { db } from '../database'
import { customer } from './customer.model'
import { subscription } from './subscription.model'
import { CustomerSubscription as CustomerSubscriptionInterface } from '../models/customer-subscription.dto'

export const customerSubscription: ModelDefined<
  CustomerSubscriptionInterface,
  Omit<CustomerSubscriptionInterface, 'id'>
> = db.define('customer_subscription', {
  paymentDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
})

subscription.belongsToMany(customer, {
  through: 'customer_subscription',
  foreignKey: 'subscriptionId',
})

customer.belongsToMany(subscription, {
  through: 'customer_subscription',
  foreignKey: 'customerId',
})

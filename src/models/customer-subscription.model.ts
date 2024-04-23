import { DataTypes, ModelDefined } from 'sequelize'
import { db } from '../database'
import { Customer } from './customer.model'
import { Subscription } from './subscription.model'
import { CustomerSubscription as CustomerSubscriptionInterface } from '../models/customer-subscription.dto'

export const CustomerSubscription: ModelDefined<
  CustomerSubscriptionInterface,
  Omit<CustomerSubscriptionInterface, 'id'>
> = db.define('Customer_subscription', {
  paymentDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
})

Subscription.belongsToMany(Customer, {
  through: 'Customer_subscription',
  foreignKey: 'subscriptionId',
})
Customer.belongsToMany(Subscription, {
  through: 'Customer_subscription',
  foreignKey: 'customerId',
})

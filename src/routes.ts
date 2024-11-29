import { Router } from 'express'
import Container from 'typedi'
import { CustomerController } from './controllers/customer'
import { CustomerSubscriptionController } from './controllers/customer-subscription'
import { SubscriptionController } from './controllers/subscription'
import {
  processState,
  shouldTriggerProcess,
} from './domain/subscription/subscription-state'

const customerController = Container.get(CustomerController)
const subscriptionController = Container.get(SubscriptionController)
const customerSubscriptionController = Container.get(
  CustomerSubscriptionController,
)

const routes = Router()

routes
  .route('/customer')
  .get(customerController.getAll.bind(customerController))
routes
  .route('/customer/:id')
  .get(customerController.get.bind(customerController))
routes
  .route('/customer')
  .post(customerController.create.bind(customerController))
routes
  .route('/customer')
  .put(customerController.update.bind(customerController))
routes
  .route('/customer/:id')
  .delete(customerController.delete.bind(customerController))

routes
  .route('/subscription')
  .get(subscriptionController.getAll.bind(subscriptionController))
routes
  .route('/subscription/:id')
  .get(subscriptionController.get.bind(subscriptionController))
routes
  .route('/subscription')
  .post(subscriptionController.create.bind(subscriptionController))

routes
  .route('/subscription/:id')
  .delete(subscriptionController.delete.bind(subscriptionController))

routes
  .route('/customer-subscription/customer/:customerId')
  .get(
    customerSubscriptionController.getAllByCustomer.bind(
      customerSubscriptionController,
    ),
  )
routes
  .route('/customer-subscription')
  .get(
    customerSubscriptionController.getAll.bind(customerSubscriptionController),
  )
routes
  .route('/customer-subscription')
  .post(
    customerSubscriptionController.addSubscription.bind(
      customerSubscriptionController,
    ),
  )
routes
  .route('/customer-subscription')
  .put(
    customerSubscriptionController.updateSubscription.bind(
      customerSubscriptionController,
    ),
  )
routes
  .route('/customer-subscription')
  .delete(
    customerSubscriptionController.deleteSubscription.bind(
      customerSubscriptionController,
    ),
  )
routes
  .route('/customer-subscription/check-validity')
  .get(
    customerSubscriptionController.checkSubscriptionValidity.bind(
      customerSubscriptionController,
      processState,
      shouldTriggerProcess,
    ),
  )

export default routes

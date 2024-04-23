import 'reflect-metadata'
import express from 'express'
import routes from './routes'
import { db } from './database'
import { Customer } from './models/customer.model'
import { Subscription } from './models/subscription.model'
import { CustomerSubscription } from './models/customer-subscription.model'

const app = express()
app.use(express.json())
app.use('/', routes)

const init = async () => {
  try {
    await db.authenticate()
    console.log('Database connected!')

    await Customer.sync()
    await Subscription.sync()
    await CustomerSubscription.sync()

    app.listen(3001, () => {
      console.log('Server is running on port 3001')
      console.log(`*^!@4=> Process id: ${process.pid}`)
    })
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

init()

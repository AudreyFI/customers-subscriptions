import 'reflect-metadata'
import express from 'express'
import routes from './routes'
import { db } from './database'
import { synchronizeModels } from './models/synchonization'

const app = express()
app.use(express.json())
app.use('/', routes)

const init = async () => {
  try {
    await db.authenticate()
    console.log('Database connected!')

    await synchronizeModels()

    app.listen(3001, () => {
      console.log('Server is running on port 3001')
      console.log(`*^!@4=> Process id: ${process.pid}`)
      registerProcessEvents()
    })
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

init()

function registerProcessEvents() {
  process.on('uncaughtException', (error: Error) => {
    console.error('UncaughtException', error)
  })

  process.on('unhandledRejection', (reason, promise) => {
    console.info(reason, promise)
  })

  process.on('SIGINT', async () => {
    await gracefulShutdown()
  })

  process.on('SIGTERM', async () => {
    await gracefulShutdown()
  })
}

async function gracefulShutdown() {
  console.info('Starting graceful shutdown')
  process.exit(0)
}

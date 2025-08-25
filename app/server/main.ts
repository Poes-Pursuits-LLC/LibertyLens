import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

import { apiRouter } from './routers/api.router'

const main = new Hono()

// Global middleware
main.use('*', logger())
main.use('*', cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}))

// Mount routers
main.route('/api', apiRouter)

// Root route
main.get('/', (c) => {
  return c.json({
    message: 'Liberty Lens API Server',
    version: '1.0.0',
    endpoints: {
      api: '/api'
    }
  })
})

// 404 handler
main.notFound((c) => {
  return c.json({
    error: 'Not Found',
    message: `Route ${c.req.path} not found`
  }, 404)
})

// Error handler
main.onError((err, c) => {
  console.error(`${err}`)
  return c.json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  }, 500)
})

export type AppType = typeof main

export { main }

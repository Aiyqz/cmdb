import Fastify from 'fastify'
import cors from '@fastify/cors'
import prisma from './lib/prisma.js'

const fastify = Fastify({ logger: true })

// Register CORS
fastify.register(cors, {
  origin: '*',
})

// Health check
fastify.get('/health', async () => {
  return { status: 'ok' }
})

// Routes
fastify.register(import('./routes/services.js'), { prefix: '/api/services' })
fastify.register(import('./routes/dependencies.js'), { prefix: '/api/dependencies' })
fastify.register(import('./routes/credentials.js'), { prefix: '/api/credentials' })
fastify.register(import('./routes/configs.js'), { prefix: '/api/configs' })
fastify.register(import('./routes/health.js'), { prefix: '/api/health' })

// Start
const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' })
    console.log('Backend running on http://localhost:3001')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()

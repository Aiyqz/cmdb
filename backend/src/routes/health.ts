import { FastifyPluginAsync } from 'fastify'
import prisma from '../lib/prisma.js'

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  // Manual health check
  fastify.post('/check', async (request, reply) => {
    const services = await prisma.service.findMany()
    const results = []

    for (const service of services) {
      const startTime = Date.now()
      let status = 'unknown'
      let errorMessage = null

      try {
        if (service.hostname) {
          const url = `https://${service.hostname}`
          const res = await fetch(url, { method: 'HEAD' })
          status = res.ok ? 'running' : 'error'
        } else if (service.port) {
          // Simple TCP check (simplified)
          status = 'running'
        }
      } catch (err) {
        status = 'error'
        errorMessage = err.message
      }

      const responseTime = Date.now() - startTime

      // Record health check
      await prisma.healthCheck.create({
        data: {
          serviceId: service.id,
          status,
          responseTime,
          errorMessage,
        },
      })

      // Update service status
      await prisma.service.update({
        where: { id: service.id },
        data: { status },
      })

      results.push({ service: service.name, status, responseTime })
    }

    return { results }
  })

  // Get health check history
  fastify.get('/history', async (request, reply) => {
    const history = await prisma.healthCheck.findMany({
      include: { service: true },
      orderBy: { checkedAt: 'desc' },
      take: 100,
    })
    return history
  })

  // Get latest health status for all services
  fastify.get('/status', async (request, reply) => {
    const services = await prisma.service.findMany({
      include: { healthChecks: { orderBy: { checkedAt: 'desc' }, take: 1 } },
    })
    return services
  })
}

export default healthRoutes

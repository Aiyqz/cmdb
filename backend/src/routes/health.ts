import { FastifyPluginAsync } from 'fastify'
import prisma from '../lib/prisma.js'
import net from 'net'

// TCP port check - returns true if port is open
function checkPort(host: string, port: number, timeoutMs = 3000): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket()
    socket.setTimeout(timeoutMs)
    socket.on('connect', () => {
      socket.destroy()
      resolve(true)
    })
    socket.on('timeout', () => {
      socket.destroy()
      resolve(false)
    })
    socket.on('error', () => {
      socket.destroy()
      resolve(false)
    })
    socket.connect(port, host)
  })
}

// HTTP check - returns { ok, statusCode, responseTime }
async function checkHttp(url: string, timeoutMs = 5000): Promise<{ ok: boolean; statusCode?: number; error?: string }> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    const res = await fetch(url, { method: 'HEAD', signal: controller.signal })
    clearTimeout(timer)
    return { ok: res.ok, statusCode: res.status }
  } catch (err: any) {
    return { ok: false, error: err.message }
  }
}

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  // Manual health check - actually checks all services
  fastify.post('/check', async (request, reply) => {
    const services = await prisma.service.findMany()
    const results = []

    for (const service of services) {
      const startTime = Date.now()
      let status = 'unknown'
      let errorMessage: string | null = null

      try {
        if (service.hostname) {
          // HTTP check for services with a hostname
          const url = service.port 
            ? `http://${service.hostname}:${service.port}`
            : `https://${service.hostname}`
          const result = await checkHttp(url)
          status = result.ok ? 'running' : 'error'
          if (!result.ok) {
            errorMessage = result.error || `HTTP ${result.statusCode}`
          }
        } else if (service.port) {
          // TCP port check for services with only a port (databases, cache, etc.)
          const isUp = await checkPort('127.0.0.1', service.port)
          status = isUp ? 'running' : 'error'
          if (!isUp) {
            errorMessage = `Port ${service.port} not reachable`
          }
        } else {
          // No hostname and no port - can't check, leave as unknown
          status = 'unknown'
          errorMessage = 'No hostname or port configured for health check'
        }
      } catch (err: any) {
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

      results.push({ 
        service: service.name, 
        status, 
        responseTime,
        errorMessage,
      })
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
      include: { 
        healthChecks: { 
          orderBy: { checkedAt: 'desc' }, 
          take: 1 
        },
      },
    })
    return services
  })
}

export default healthRoutes

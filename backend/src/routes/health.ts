import { FastifyPluginAsync } from 'fastify'
import prisma from '../lib/prisma.js'
import net from 'net'

// TCP port check - returns true if port is open
function checkPort(host: string, port: number, timeoutMs = 3000): Promise<{ ok: boolean; responseTime: number }> {
  const startTime = Date.now()
  return new Promise((resolve) => {
    const socket = new net.Socket()
    socket.setTimeout(timeoutMs)
    socket.on('connect', () => {
      const responseTime = Date.now() - startTime
      socket.destroy()
      resolve({ ok: true, responseTime })
    })
    socket.on('timeout', () => {
      socket.destroy()
      resolve({ ok: false, responseTime: Date.now() - startTime })
    })
    socket.on('error', () => {
      socket.destroy()
      resolve({ ok: false, responseTime: Date.now() - startTime })
    })
    socket.connect(port, host)
  })
}

// HTTP check - tries HEAD first, falls back to GET
// Returns { reachable, statusCode, error } — reachable=true means the server responded (even with 4xx/5xx)
async function checkHttp(url: string, timeoutMs = 5000): Promise<{ reachable: boolean; statusCode?: number; error?: string }> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    // Try HEAD first
    let res = await fetch(url, { method: 'HEAD', signal: controller.signal })
    clearTimeout(timer)
    // Any HTTP response (even 4xx/5xx) means the server is running
    return { reachable: true, statusCode: res.status }
  } catch {
    // HEAD failed, try GET as fallback
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), timeoutMs)
      const res = await fetch(url, { method: 'GET', signal: controller.signal })
      clearTimeout(timer)
      return { reachable: true, statusCode: res.status }
    } catch (err: any) {
      return { reachable: false, error: err.message }
    }
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
        if (service.port) {
          // For services with a port, TCP check is the most reliable
          // Use hostname if available, otherwise 127.0.0.1
          let host = service.hostname || '127.0.0.1'
          if (host === 'localhost') host = '127.0.0.1'
          let tcpResult = await checkPort(host, service.port)

          // If IPv4 fails and host is localhost/127.0.0.1, try IPv6 ::1
          if (!tcpResult.ok && (host === '127.0.0.1' || host === 'localhost')) {
            tcpResult = await checkPort('::1', service.port)
          }

          if (tcpResult.ok) {
            // Port is open → service is running
            // Optionally do HTTP check for more info, but don't fail on 4xx/5xx
            status = 'running'

            // If hostname exists, try HTTP for additional info (non-blocking)
            if (service.hostname) {
              const url = service.port
                ? `http://${service.hostname}:${service.port}`
                : `https://${service.hostname}`
              const httpResult = await checkHttp(url)
              if (!httpResult.reachable) {
                // TCP port is open but HTTP failed — still running, just note it
                errorMessage = `TCP port open, HTTP probe failed: ${httpResult.error}`
              } else if (httpResult.statusCode && httpResult.statusCode >= 400) {
                // Server responded with error code but it IS running
                errorMessage = `HTTP ${httpResult.statusCode} (service running, method may not be supported)`
              }
            }
          } else {
            // Port not reachable
            status = 'error'
            errorMessage = `Port ${service.port} not reachable on ${host}`
          }
        } else if (service.hostname) {
          // Services with hostname but no port (e.g., Cloudflare Tunnel domain)
          const url = service.hostname.startsWith('http') 
            ? service.hostname 
            : `https://${service.hostname}`
          const httpResult = await checkHttp(url)

          if (httpResult.reachable) {
            // Got any HTTP response → service is running
            status = 'running'
            if (httpResult.statusCode && httpResult.statusCode >= 400) {
              errorMessage = `HTTP ${httpResult.statusCode}`
            }
          } else {
            status = 'error'
            errorMessage = httpResult.error || 'Connection failed'
          }
        } else {
          // No hostname and no port - can't check
          status = 'unknown'
          errorMessage = 'No hostname or port configured'
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

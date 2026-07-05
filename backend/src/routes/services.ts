import { FastifyPluginAsync } from 'fastify'
import prisma from '../lib/prisma.js'

const servicesRoutes: FastifyPluginAsync = async (fastify) => {
  // Get all services
  fastify.get('/', async (request, reply) => {
    const services = await prisma.service.findMany({
      include: { dependencies: true, dependedBy: true },
    })
    return services
  })

  // Get service by ID
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const service = await prisma.service.findUnique({
      where: { id },
      include: { 
        dependencies: { include: { dependsOn: true } }, 
        dependedBy: { include: { service: true } }, 
        credentials: true, 
        configs: true, 
        healthChecks: { orderBy: { checkedAt: 'desc' }, take: 10 },
      },
    })
    if (!service) {
      reply.code(404).send({ error: 'Service not found' })
      return
    }
    return service
  })

  // Create service
  fastify.post('/', async (request, reply) => {
    const data = request.body as any
    const service = await prisma.service.create({
      data: {
        name: data.name,
        type: data.type,
        hostname: data.hostname,
        port: data.port,
        status: data.status || 'unknown',
        description: data.description,
        location: data.location,
      },
    })
    reply.code(201).send(service)
  })

  // Update service
  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const data = request.body as any
    const service = await prisma.service.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        hostname: data.hostname,
        port: data.port,
        status: data.status,
        description: data.description,
        location: data.location,
      },
    })
    return service
  })

  // Delete service
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    await prisma.service.delete({ where: { id } })
    reply.code(204).send()
  })
}

export default servicesRoutes

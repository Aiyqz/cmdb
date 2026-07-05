import { FastifyPluginAsync } from 'fastify'
import prisma from '../lib/prisma.js'

const configsRoutes: FastifyPluginAsync = async (fastify) => {
  // Get all configs
  fastify.get('/', async (request, reply) => {
    const configs = await prisma.config.findMany({
      include: { service: true },
    })
    return configs
  })

  // Get configs by service ID
  fastify.get('/service/:serviceId', async (request, reply) => {
    const { serviceId } = request.params as { serviceId: string }
    const configs = await prisma.config.findMany({
      where: { serviceId },
    })
    return configs
  })

  // Create config
  fastify.post('/', async (request, reply) => {
    const data = request.body as any
    const config = await prisma.config.create({
      data: {
        serviceId: data.serviceId,
        key: data.key,
        value: data.value,
      },
    })
    reply.code(201).send(config)
  })

  // Update config
  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const data = request.body as any
    const config = await prisma.config.update({
      where: { id },
      data: {
        key: data.key,
        value: data.value,
      },
    })
    return config
  })

  // Delete config
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    await prisma.config.delete({ where: { id } })
    reply.code(204).send()
  })
}

export default configsRoutes

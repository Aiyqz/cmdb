import { FastifyPluginAsync } from 'fastify'
import prisma from '../lib/prisma.js'

const dependenciesRoutes: FastifyPluginAsync = async (fastify) => {
  // Get all dependencies
  fastify.get('/', async (request, reply) => {
    const deps = await prisma.dependency.findMany({
      include: { service: true, dependsOn: true },
    })
    return deps
  })

  // Create dependency
  fastify.post('/', async (request, reply) => {
    const data = request.body as any
    const dep = await prisma.dependency.create({
      data: {
        serviceId: data.serviceId,
        dependsOnId: data.dependsOnId,
      },
    })
    reply.code(201).send(dep)
  })

  // Delete dependency
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    await prisma.dependency.delete({ where: { id } })
    reply.code(204).send()
  })
}

export default dependenciesRoutes

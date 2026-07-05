import { FastifyPluginAsync } from 'fastify'
import prisma from '../lib/prisma.js'

const credentialsRoutes: FastifyPluginAsync = async (fastify) => {
  // Get all credentials
  fastify.get('/', async (request, reply) => {
    const creds = await prisma.credential.findMany({
      include: { service: true },
    })
    return creds
  })

  // Get credentials by service ID
  fastify.get('/service/:serviceId', async (request, reply) => {
    const { serviceId } = request.params as { serviceId: string }
    const creds = await prisma.credential.findMany({
      where: { serviceId },
    })
    return creds
  })

  // Create credential
  fastify.post('/', async (request, reply) => {
    const data = request.body as any
    const cred = await prisma.credential.create({
      data: {
        serviceId: data.serviceId,
        key: data.key,
        value: data.value,
        type: data.type,
      },
    })
    reply.code(201).send(cred)
  })

  // Update credential
  fastify.put('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const data = request.body as any
    const cred = await prisma.credential.update({
      where: { id },
      data: {
        key: data.key,
        value: data.value,
        type: data.type,
      },
    })
    return cred
  })

  // Delete credential
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    await prisma.credential.delete({ where: { id } })
    reply.code(204).send()
  })
}

export default credentialsRoutes

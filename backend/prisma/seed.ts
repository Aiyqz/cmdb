import { PrismaClient } from '@prisma/client'

// Seed data - example services for demo purposes
const services = [
  {
    name: 'Web App',
    type: 'web',
    hostname: 'app.example.com',
    port: 3000,
    status: 'running',
    description: 'Main web application',
    location: 'server-01',
  },
  {
    name: 'API Gateway',
    type: 'web',
    hostname: 'api.example.com',
    port: 8080,
    status: 'running',
    description: 'API Gateway (Nginx reverse proxy)',
    location: 'server-01',
  },
  {
    name: 'PostgreSQL',
    type: 'database',
    hostname: null,
    port: 5432,
    status: 'running',
    description: 'Primary database (Docker container)',
    location: 'server-01',
  },
  {
    name: 'Redis',
    type: 'cache',
    hostname: null,
    port: 6379,
    status: 'running',
    description: 'Cache server (Docker container)',
    location: 'server-01',
  },
  {
    name: 'Cloudflare Tunnel',
    type: 'tunnel',
    hostname: null,
    port: null,
    status: 'running',
    description: 'Cloudflare Tunnel connector',
    location: 'server-01',
  },
  {
    name: 'Docker',
    type: 'docker',
    hostname: null,
    port: null,
    status: 'running',
    description: 'Container runtime',
    location: 'server-01',
  },
]

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Clean existing data
  await prisma.healthCheck.deleteMany()
  await prisma.credential.deleteMany()
  await prisma.config.deleteMany()
  await prisma.dependency.deleteMany()
  await prisma.service.deleteMany()

  for (const service of services) {
    const created = await prisma.service.create({
      data: service,
    })
    console.log(`Created service: ${created.name}`)
  }

  // Add dependency: API Gateway depends on Web App
  const webApp = await prisma.service.findFirst({ where: { name: 'Web App' } })
  const apiGateway = await prisma.service.findFirst({ where: { name: 'API Gateway' } })
  if (apiGateway && webApp) {
    await prisma.dependency.create({
      data: {
        serviceId: apiGateway.id,
        dependsOnId: webApp.id,
      },
    })
    console.log('Added dependency: API Gateway -> Web App')
  }

  // Add dependency: Web App depends on PostgreSQL
  const postgres = await prisma.service.findFirst({ where: { name: 'PostgreSQL' } })
  if (webApp && postgres) {
    await prisma.dependency.create({
      data: {
        serviceId: webApp.id,
        dependsOnId: postgres.id,
      },
    })
    console.log('Added dependency: Web App -> PostgreSQL')
  }

  // Add dependency: Web App depends on Redis
  const redis = await prisma.service.findFirst({ where: { name: 'Redis' } })
  if (webApp && redis) {
    await prisma.dependency.create({
      data: {
        serviceId: webApp.id,
        dependsOnId: redis.id,
      },
    })
    console.log('Added dependency: Web App -> Redis')
  }

  // Add dependency: PostgreSQL depends on Docker
  const docker = await prisma.service.findFirst({ where: { name: 'Docker' } })
  if (postgres && docker) {
    await prisma.dependency.create({
      data: {
        serviceId: postgres.id,
        dependsOnId: docker.id,
      },
    })
    console.log('Added dependency: PostgreSQL -> Docker')
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

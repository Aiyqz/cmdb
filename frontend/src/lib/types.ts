export type ServiceType = 'web' | 'database' | 'docker' | 'proxy' | 'tunnel' | 'network' | 'cache'
export type ServiceStatus = 'running' | 'error' | 'stopped' | 'unknown'

export interface HealthCheck {
  id: string
  serviceId: string
  status: 'up' | 'down' | 'timeout'
  responseTime: number | null
  errorMessage: string | null
  checkedAt: string
}

export interface Service {
  id: string
  name: string
  type: ServiceType
  hostname: string | null
  port: number | null
  description: string | null
  status: ServiceStatus
  location: string | null
  healthChecks: HealthCheck[]
  dependencies: Dependency[]
  dependedBy: Dependency[]
  credentials: Credential[]
  configs: Config[]
}

export interface Dependency {
  id: string
  serviceId: string
  dependsOnId: string
  description: string | null
  dependsOn?: Service
  service?: Service
}

export interface Credential {
  id: string
  serviceId: string
  username: string
  passwordHash: string
  keyType: string | null
}

export interface Config {
  id: string
  serviceId: string
  key: string
  value: string
}

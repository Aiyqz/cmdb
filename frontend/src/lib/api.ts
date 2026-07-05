// API configuration
// In development, Vite proxy handles /api -> http://localhost:3001
// In production, set VITE_API_BASE_URL env variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export const api = {
  get: async (path: string) => {
    const res = await fetch(`${API_BASE_URL}${path}`)
    return res.json()
  },
  post: async (path: string, body?: any) => {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })
    return res.json()
  },
  put: async (path: string, body: any) => {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return res.json()
  },
  delete: async (path: string) => {
    const res = await fetch(`${API_BASE_URL}${path}`, { method: 'DELETE' })
    return res
  },
}

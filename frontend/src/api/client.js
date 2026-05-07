import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // Add trailing slash for POST/PUT/PATCH only (to match FastAPI router paths)
  // DELETE excluded - no body to lose, and redirect causes auth issues
  if (config.url && ['POST', 'PUT', 'PATCH'].includes(config.method?.toUpperCase())) {
    const hasQuery = config.url.includes('?')
    if (!config.url.endsWith('/') && !hasQuery) {
      config.url = config.url + '/'
    }
  }
  return config
})

export default api

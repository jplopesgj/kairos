import axios from 'axios'

const baseUrl = import.meta.env.VITE_API_URL

const axiosClient = axios.create({
  baseURL: baseUrl,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
})

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || (error.request ? 'Não foi possível conectar à API.' : 'Não foi possível concluir a operação.')
    return Promise.reject(new Error(message))
  },
)

async function request(method, path, data) {
  const response = await axiosClient.request({ method, url: path, data })
  return response.status === 204 ? null : response.data
}

export const httpClient = {
  get: (path) => request('get', path),
  post: (path, body) => request('post', path, body),
  put: (path, body) => request('put', path, body),
  delete: (path) => request('delete', path),
}

export function queryString(params = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value)
  })
  const value = query.toString()
  return value ? `?${value}` : ''
}

export { baseUrl }

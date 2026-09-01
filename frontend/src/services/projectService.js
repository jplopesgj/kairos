import { httpClient } from './httpClient'

export const projectService = {
  list: () => httpClient.get('/projects'),
  create: (payload) => httpClient.post('/projects', payload),
  update: (id, payload) => httpClient.put(`/projects/${id}`, payload),
  remove: (id) => httpClient.delete(`/projects/${id}`),
}

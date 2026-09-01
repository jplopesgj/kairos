import { baseUrl, httpClient, queryString } from './httpClient'

export const timeEntryService = {
  list: (filters) => httpClient.get(`/time-entries${queryString(filters)}`),
  create: (payload) => httpClient.post('/time-entries', payload),
  update: (id, payload) => httpClient.put(`/time-entries/${id}`, payload),
  remove: (id) => httpClient.delete(`/time-entries/${id}`),
  active: () => httpClient.get('/timer/active'),
  start: (projectId) => httpClient.post('/timer/start', { project_id: Number(projectId) }),
  stop: () => httpClient.post('/timer/stop'),
  exportUrl: (filters) => `${baseUrl}/time-entries/export${queryString(filters)}`,
}

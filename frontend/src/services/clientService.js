import { httpClient } from './httpClient'

export const clientService = {
  list: () => httpClient.get('/clients'),
  create: (payload) => httpClient.post('/clients', payload),
  update: (id, payload) => httpClient.put(`/clients/${id}`, payload),
  remove: (id) => httpClient.delete(`/clients/${id}`),
}

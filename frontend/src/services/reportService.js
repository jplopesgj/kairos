import { httpClient, queryString } from './httpClient'

export const reportService = {
  summary: (filters) => httpClient.get(`/reports/summary${queryString(filters)}`),
}

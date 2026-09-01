import { dateInputValue } from './formatters'

export const emptyEntry = () => ({ project_id: '', work_date: dateInputValue(), start_time: '09:00', end_time: '10:00', description: '' })
export const emptyProject = () => ({ client_id: '', name: '', description: '', hourly_rate: '0' })
export const emptyClient = () => ({ name: '', email: '', notes: '' })

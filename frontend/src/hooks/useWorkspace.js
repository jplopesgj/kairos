import { useCallback, useEffect, useMemo, useState } from 'react'
import { clientService } from '../services/clientService'
import { projectService } from '../services/projectService'
import { reportService } from '../services/reportService'
import { timeEntryService } from '../services/timeEntryService'
import { dateInputValue } from '../lib/formatters'

const initialReport = { total_minutes: 0, total_amount: 0, by_project: [] }

export function useWorkspace(range) {
  const [clients, setClients] = useState([])
  const [projects, setProjects] = useState([])
  const [entries, setEntries] = useState([])
  const [activeTimer, setActiveTimer] = useState(null)
  const [report, setReport] = useState(initialReport)
  const [timerProject, setTimerProject] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null)

  const dates = useMemo(() => {
    const end = new Date()
    const start = new Date(end)
    if (range === 'week') start.setDate(end.getDate() - 6)
    if (range === 'today') start.setDate(end.getDate())
    if (range === 'month') start.setDate(1)
    return { from: dateInputValue(start), to: dateInputValue(end) }
  }, [range])

  const refresh = useCallback(async () => {
    setBusy(true)
    try {
      const [clientData, projectData, entryData, activeData, reportData] = await Promise.all([
        clientService.list(), projectService.list(), timeEntryService.list(dates), timeEntryService.active(), reportService.summary(dates),
      ])
      setClients(clientData)
      setProjects(projectData)
      setEntries(entryData)
      setActiveTimer(activeData)
      setReport(reportData)
      setTimerProject((current) => current || String(projectData.find((project) => project.is_active)?.id || projectData[0]?.id || ''))
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setBusy(false)
    }
  }, [dates])

  useEffect(() => { refresh() }, [refresh])
  useEffect(() => {
    if (!message) return undefined
    const timeout = setTimeout(() => setMessage(null), 4200)
    return () => clearTimeout(timeout)
  }, [message])

  const runAction = useCallback(async (action, successMessage) => {
    try {
      await action()
      setMessage({ type: 'success', text: successMessage })
      await refresh()
      return true
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
      return false
    }
  }, [refresh])

  return {
    clients, projects, entries, activeTimer, report, timerProject, setTimerProject, dates, busy, message, refresh,
    startTimer: () => runAction(() => timeEntryService.start(timerProject), 'Timer iniciado.'),
    stopTimer: () => runAction(() => timeEntryService.stop(), 'Lançamento salvo.'),
    createEntry: (payload) => runAction(() => timeEntryService.create(payload), 'Lançamento adicionado.'),
    updateEntry: (id, payload) => runAction(() => timeEntryService.update(id, payload), 'Lançamento atualizado.'),
    deleteEntry: (id) => runAction(() => timeEntryService.remove(id), 'Lançamento excluído.'),
    createProject: (payload) => runAction(() => projectService.create(payload), 'Projeto criado.'),
    updateProject: (id, payload) => runAction(() => projectService.update(id, payload), 'Projeto atualizado.'),
    deleteProject: (id) => runAction(() => projectService.remove(id), 'Projeto excluído.'),
    createClient: (payload) => runAction(() => clientService.create(payload), 'Cliente criado.'),
    updateClient: (id, payload) => runAction(() => clientService.update(id, payload), 'Cliente atualizado.'),
    deleteClient: (id) => runAction(() => clientService.remove(id), 'Cliente excluído.'),
  }
}

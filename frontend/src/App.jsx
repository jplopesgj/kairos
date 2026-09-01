import { useState } from 'react'
import { AppShell } from './components/layout/AppShell'
import { useWorkspace } from './hooks/useWorkspace'
import { ClientsPage } from './pages/ClientsPage'
import { DashboardPage } from './pages/DashboardPage'
import { EntriesPage } from './pages/EntriesPage'
import { ProjectsPage } from './pages/ProjectsPage'

function App() {
  const [page, setPage] = useState('dashboard')
  const [range, setRange] = useState('month')
  const [editingEntry, setEditingEntry] = useState(null)
  const workspace = useWorkspace(range)

  const editEntry = (entry) => {
    setEditingEntry(entry)
    setPage('entries')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const clearEntryEdit = () => setEditingEntry(null)
  const deleteEntry = (entry) => {
    if (window.confirm('Excluir este lançamento?')) workspace.deleteEntry(entry.id)
  }
  const deleteProject = (projectId) => workspace.deleteProject(projectId)
  const deleteClient = (clientId) => workspace.deleteClient(clientId)

  return <AppShell page={page} setPage={setPage} busy={workspace.busy} message={workspace.message} onRefresh={workspace.refresh}>
    {page === 'dashboard' && <DashboardPage activeTimer={workspace.activeTimer} projects={workspace.projects} timerProject={workspace.timerProject} setTimerProject={workspace.setTimerProject} startTimer={workspace.startTimer} stopTimer={workspace.stopTimer} report={workspace.report} range={range} setRange={setRange} entries={workspace.entries} onEditEntry={editEntry} onDeleteEntry={deleteEntry} />}
    {page === 'entries' && <EntriesPage entries={workspace.entries} projects={workspace.projects} dates={workspace.dates} range={range} setRange={setRange} onCreate={workspace.createEntry} onUpdate={workspace.updateEntry} onEditEntry={editEntry} onDelete={deleteEntry} editingEntry={editingEntry} onClearEdit={clearEntryEdit} />}
    {page === 'projects' && <ProjectsPage projects={workspace.projects} clients={workspace.clients} onCreate={workspace.createProject} onUpdate={workspace.updateProject} onDelete={deleteProject} />}
    {page === 'clients' && <ClientsPage clients={workspace.clients} onCreate={workspace.createClient} onUpdate={workspace.updateClient} onDelete={deleteClient} />}
  </AppShell>
}

export default App

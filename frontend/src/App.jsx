import { useCallback, useEffect, useMemo, useState } from 'react'
import { Activity, ArrowDownToLine, BriefcaseBusiness, CalendarDays, Check, CircleHelp, Clock3, FolderKanban, Menu, Pause, Pencil, Plus, Play, RefreshCw, Trash2, Users, X } from 'lucide-react'
import { api, dateInputValue, formatCurrency, formatMinutes } from './lib/api'

const emptyEntry = { project_id: '', work_date: dateInputValue(), start_time: '09:00', end_time: '10:00', description: '' }
const emptyProject = { client_id: '', name: '', description: '', hourly_rate: '0' }
const emptyClient = { name: '', email: '', notes: '' }

function App() {
  const [page, setPage] = useState('dashboard')
  const [clients, setClients] = useState([])
  const [projects, setProjects] = useState([])
  const [entries, setEntries] = useState([])
  const [active, setActive] = useState(null)
  const [report, setReport] = useState({ total_minutes: 0, total_amount: 0, by_project: [] })
  const [range, setRange] = useState('month')
  const [entryForm, setEntryForm] = useState(emptyEntry)
  const [projectForm, setProjectForm] = useState(emptyProject)
  const [clientForm, setClientForm] = useState(emptyClient)
  const [editingEntry, setEditingEntry] = useState(null)
  const [timerProject, setTimerProject] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null)

  const dates = useMemo(() => {
    const end = new Date()
    const start = new Date(end)
    if (range === 'week') start.setDate(end.getDate() - 6)
    else if (range === 'today') start.setDate(end.getDate())
    else start.setDate(1)
    return { from: dateInputValue(start), to: dateInputValue(end) }
  }, [range])

  const load = useCallback(async () => {
    setBusy(true)
    try {
      const query = `?from=${dates.from}&to=${dates.to}`
      const [clientData, projectData, entryData, activeData, reportData] = await Promise.all([
        api.get('/clients'), api.get('/projects'), api.get(`/time-entries${query}`), api.get('/timer/active'), api.get(`/reports/summary${query}`),
      ])
      setClients(clientData); setProjects(projectData); setEntries(entryData); setActive(activeData); setReport(reportData)
      if (!timerProject && projectData[0]) setTimerProject(String(projectData[0].id))
    } catch (error) { setMessage({ type: 'error', text: error.message }) }
    finally { setBusy(false) }
  }, [dates, timerProject])

  useEffect(() => { load() }, [load])
  useEffect(() => { if (!message) return undefined; const timer = setTimeout(() => setMessage(null), 4200); return () => clearTimeout(timer) }, [message])

  const submit = async (action, success) => {
    try { await action(); setMessage({ type: 'success', text: success }); await load() }
    catch (error) { setMessage({ type: 'error', text: error.message }) }
  }

  const startTimer = () => submit(() => api.post('/timer/start', { project_id: Number(timerProject) }), 'Timer iniciado.')
  const stopTimer = () => submit(() => api.post('/timer/stop'), 'Lançamento salvo.')
  const saveEntry = (event) => {
    event.preventDefault()
    const action = editingEntry ? api.put(`/time-entries/${editingEntry.id}`, entryForm) : api.post('/time-entries', entryForm)
    submit(() => action, editingEntry ? 'Lançamento atualizado.' : 'Lançamento adicionado.')
    setEntryForm(emptyEntry); setEditingEntry(null)
  }
  const removeEntry = (entry) => { if (window.confirm('Excluir este lançamento?')) submit(() => api.delete(`/time-entries/${entry.id}`), 'Lançamento excluído.') }
  const saveClient = (event) => { event.preventDefault(); submit(() => api.post('/clients', clientForm), 'Cliente criado.'); setClientForm(emptyClient) }
  const saveProject = (event) => { event.preventDefault(); submit(() => api.post('/projects', { ...projectForm, client_id: Number(projectForm.client_id), hourly_rate: Number(projectForm.hourly_rate) }), 'Projeto criado.'); setProjectForm(emptyProject) }
  const edit = (entry) => { setEditingEntry(entry); setEntryForm({ project_id: String(entry.project_id), work_date: entry.work_date?.slice(0, 10), start_time: entry.start_time?.slice(0, 5), end_time: entry.end_time?.slice(0, 5) || '', description: entry.description || '' }); setPage('entries'); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Clock3 size={20} /></div><span>kairos</span></div>
      <div className="side-label">Workspace</div>
      <nav>
        <NavItem active={page === 'dashboard'} icon={<Activity size={18} />} label="Visão geral" onClick={() => setPage('dashboard')} />
        <NavItem active={page === 'entries'} icon={<CalendarDays size={18} />} label="Lançamentos" onClick={() => setPage('entries')} />
        <NavItem active={page === 'projects'} icon={<FolderKanban size={18} />} label="Projetos" onClick={() => setPage('projects')} />
        <NavItem active={page === 'clients'} icon={<Users size={18} />} label="Clientes" onClick={() => setPage('clients')} />
      </nav>
      <div className="sidebar-bottom"><div className="tip"><CircleHelp size={17} /><div><strong>Uma coisa de cada vez</strong><p>Registre seu trabalho enquanto ele acontece.</p></div></div></div>
    </aside>
    <main className="main-content">
      <header className="topbar"><button className="mobile-menu" aria-label="Abrir menu"><Menu size={21} /></button><div className="breadcrumb">Meu workspace <span>/</span> {page === 'dashboard' ? 'Visão geral' : page === 'entries' ? 'Lançamentos' : page === 'projects' ? 'Projetos' : 'Clientes'}</div><button className="icon-button" onClick={load} title="Atualizar"><RefreshCw size={17} className={busy ? 'spin' : ''} /></button></header>
      {message && <div className={`toast ${message.type}`}>{message.type === 'success' ? <Check size={17} /> : <X size={17} />}{message.text}</div>}
      {page === 'dashboard' && <Dashboard {...{ active, projects, timerProject, setTimerProject, startTimer, stopTimer, report, range, setRange, entries, edit, removeEntry, dates }} />}
      {page === 'entries' && <EntriesPage {...{ entries, projects, entryForm, setEntryForm, saveEntry, editingEntry, setEditingEntry, edit, removeEntry, dates, range, setRange }} />}
      {page === 'projects' && <ProjectsPage {...{ projects, clients, projectForm, setProjectForm, saveProject }} />}
      {page === 'clients' && <ClientsPage {...{ clients, clientForm, setClientForm, saveClient }} />}
    </main>
  </div>
}

function NavItem({ active, icon, label, onClick }) { return <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>{icon}<span>{label}</span>{active && <i />}</button> }

function Dashboard({ active, projects, timerProject, setTimerProject, startTimer, stopTimer, report, range, setRange, entries, edit, removeEntry }) {
  return <div className="page"><div className="page-heading"><div><p className="eyebrow">{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date())}</p><h1>Bom dia, vamos trabalhar?</h1><p className="subtitle">Acompanhe seu tempo sem tirar o foco do que importa.</p></div><div className="period-tabs">{[['today', 'Hoje'], ['week', '7 dias'], ['month', 'Este mês']].map(([id, label]) => <button key={id} className={range === id ? 'selected' : ''} onClick={() => setRange(id)}>{label}</button>)}</div></div>
    <section className="timer-card"><div className="timer-copy"><div className={`status-dot ${active ? 'running' : ''}`} /><div><p className="card-kicker">{active ? 'TRABALHO EM ANDAMENTO' : 'PRONTO PARA COMEÇAR?'}</p><h2>{active ? active.project?.name : 'O que você vai fazer agora?'}</h2>{active ? <p className="timer-start">Começou às {active.start_time?.slice(0, 5)} · {active.project?.client?.name}</p> : <select value={timerProject} onChange={(e) => setTimerProject(e.target.value)}><option value="">Selecione um projeto</option>{projects.filter((p) => p.is_active).map((p) => <option key={p.id} value={p.id}>{p.name} · {p.client?.name}</option>)}</select>}</div></div><div className="timer-action">{active ? <><LiveTimer startedAt={active.start_time} /><button className="stop-button" onClick={stopTimer}><Pause size={17} fill="currentColor" /> Parar timer</button></> : <button className="start-button" disabled={!timerProject} onClick={startTimer}><Play size={17} fill="currentColor" /> Iniciar timer</button>}</div></section>
    <div className="stat-grid"><Stat icon={<Clock3 />} label="Horas registradas" value={formatMinutes(report.total_minutes)} detail="no período selecionado" /><Stat icon={<BriefcaseBusiness />} label="Valor estimado" value={formatCurrency(report.total_amount)} detail="com base nas taxas" /><Stat icon={<FolderKanban />} label="Projetos ativos" value={projects.filter((p) => p.is_active).length} detail={`${projects.length} projetos no total`} /></div>
    <div className="content-grid"><section className="panel"><div className="panel-heading"><div><h2>Resumo por projeto</h2><p>Onde seu tempo está indo</p></div><ArrowDownToLine size={18} className="muted" /></div>{report.by_project?.length ? <div className="project-summary">{report.by_project.map((item) => <div className="summary-row" key={item.project_id}><div className="summary-icon"><FolderKanban size={16} /></div><div className="summary-name"><strong>{item.project}</strong><span>{item.client}</span></div><div className="summary-bar"><i style={{ width: `${Math.min(100, (item.minutes / Math.max(report.total_minutes, 1)) * 100)}%` }} /></div><div className="summary-time">{formatMinutes(item.minutes)}<small>{formatCurrency(item.amount)}</small></div></div>)}</div> : <EmptyState text="Ainda não há horas neste período." />}</section><section className="panel"><div className="panel-heading"><div><h2>Últimos lançamentos</h2><p>Seus registros mais recentes</p></div></div>{entries.length ? <div className="recent-list">{entries.slice(0, 5).map((entry) => <div className="recent-row" key={entry.id}><div className="date-badge"><strong>{new Date(`${entry.work_date}T12:00:00`).getDate()}</strong><span>{new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(`${entry.work_date}T12:00:00`)).replace('.', '')}</span></div><div className="recent-info"><strong>{entry.project?.name}</strong><span>{entry.description || 'Sem descrição'}</span></div><strong className="recent-time">{entry.duration_minutes ? formatMinutes(entry.duration_minutes) : 'ativo'}</strong><button className="mini-action" onClick={() => edit(entry)} aria-label="Editar"><Pencil size={14} /></button><button className="mini-action danger" onClick={() => removeEntry(entry)} aria-label="Excluir"><Trash2 size={14} /></button></div>)}</div> : <EmptyState text="Seus lançamentos aparecerão aqui." />}</section></div>
  </div>
}

function LiveTimer({ startedAt }) { const [seconds, setSeconds] = useState(0); useEffect(() => { const tick = () => { const [h, m, s] = startedAt.split(':').map(Number); const start = new Date(); start.setHours(h, m, s || 0, 0); setSeconds(Math.max(0, Math.floor((Date.now() - start.getTime()) / 1000))) }; tick(); const id = setInterval(tick, 1000); return () => clearInterval(id) }, [startedAt]); return <strong className="live-time">{String(Math.floor(seconds / 3600)).padStart(2, '0')}:{String(Math.floor(seconds / 60) % 60).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}</strong> }
function Stat({ icon, label, value, detail }) { return <div className="stat-card"><div className="stat-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></div> }
function EmptyState({ text }) { return <div className="empty"><Clock3 size={22} /><p>{text}</p></div> }

function EntriesPage({ entries, projects, entryForm, setEntryForm, saveEntry, editingEntry, setEditingEntry, edit, removeEntry, dates, range, setRange }) {
  return <div className="page"><div className="page-heading compact"><div><p className="eyebrow">CONTROLE DE TEMPO</p><h1>Lançamentos</h1><p className="subtitle">Adicione, revise e mantenha seus registros em dia.</p></div><div className="period-tabs">{[['today', 'Hoje'], ['week', '7 dias'], ['month', 'Este mês']].map(([id, label]) => <button key={id} className={range === id ? 'selected' : ''} onClick={() => setRange(id)}>{label}</button>)}</div></div><section className="panel form-panel"><div className="panel-heading"><div><h2>{editingEntry ? 'Editar lançamento' : 'Novo lançamento'}</h2><p>Registre um período já trabalhado.</p></div>{editingEntry && <button className="text-button" onClick={() => { setEditingEntry(null); setEntryForm(emptyEntry) }}>Cancelar</button>}</div><form className="entry-form" onSubmit={saveEntry}><Field label="Projeto"><select required value={entryForm.project_id} onChange={(e) => setEntryForm({ ...entryForm, project_id: e.target.value })}><option value="">Selecione...</option>{projects.filter((p) => p.is_active).map((p) => <option key={p.id} value={p.id}>{p.name} · {p.client?.name}</option>)}</select></Field><Field label="Data"><input required type="date" value={entryForm.work_date} onChange={(e) => setEntryForm({ ...entryForm, work_date: e.target.value })} /></Field><Field label="Início"><input required type="time" value={entryForm.start_time} onChange={(e) => setEntryForm({ ...entryForm, start_time: e.target.value })} /></Field><Field label="Fim"><input required type="time" value={entryForm.end_time} onChange={(e) => setEntryForm({ ...entryForm, end_time: e.target.value })} /></Field><Field label="Descrição" wide><input placeholder="Em que você trabalhou?" value={entryForm.description} onChange={(e) => setEntryForm({ ...entryForm, description: e.target.value })} /></Field><button className="primary-button" type="submit">{editingEntry ? 'Salvar alterações' : <><Plus size={17} /> Adicionar</>}</button></form></section><section className="panel"><div className="panel-heading"><div><h2>Histórico</h2><p>{entries.length} lançamento(s) no período</p></div></div><div className="table-wrap"><table><thead><tr><th>Data</th><th>Projeto</th><th>Horário</th><th>Duração</th><th>Valor</th><th></th></tr></thead><tbody>{entries.map((entry) => <tr key={entry.id}><td>{new Intl.DateTimeFormat('pt-BR').format(new Date(`${entry.work_date}T12:00:00`))}</td><td><strong>{entry.project?.name}</strong><small>{entry.project?.client?.name}</small></td><td>{entry.start_time?.slice(0, 5)} — {entry.end_time?.slice(0, 5) || 'agora'}</td><td>{entry.duration_minutes ? formatMinutes(entry.duration_minutes) : <span className="running-label">Em andamento</span>}</td><td>{entry.amount !== null ? formatCurrency(entry.amount) : '—'}</td><td className="actions"><button className="mini-action" onClick={() => edit(entry)}><Pencil size={14} /></button><button className="mini-action danger" onClick={() => removeEntry(entry)}><Trash2 size={14} /></button></td></tr>)}</tbody></table>{!entries.length && <EmptyState text="Nenhum lançamento encontrado." />}</div><div className="export-row"><a className="secondary-button" href={api.csvUrl(dates)}><ArrowDownToLine size={16} /> Exportar CSV</a></div></section></div>
}

function ProjectsPage({ projects, clients, projectForm, setProjectForm, saveProject }) { return <div className="page"><div className="page-heading compact"><div><p className="eyebrow">ORGANIZAÇÃO</p><h1>Projetos</h1><p className="subtitle">Defina uma taxa para cada trabalho.</p></div></div><div className="content-grid"><section className="panel form-panel"><div className="panel-heading"><div><h2>Novo projeto</h2><p>Comece a organizar seu trabalho.</p></div></div><form className="stack-form" onSubmit={saveProject}><Field label="Cliente"><select required value={projectForm.client_id} onChange={(e) => setProjectForm({ ...projectForm, client_id: e.target.value })}><option value="">Selecione...</option>{clients.filter((c) => c.is_active).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field><Field label="Nome do projeto"><input required value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} placeholder="Ex.: Site institucional" /></Field><Field label="Valor por hora"><input required type="number" min="0" step="0.01" value={projectForm.hourly_rate} onChange={(e) => setProjectForm({ ...projectForm, hourly_rate: e.target.value })} /></Field><Field label="Descrição"><textarea rows="3" value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} /></Field><button className="primary-button" type="submit"><Plus size={17} /> Criar projeto</button></form></section><section className="panel"><div className="panel-heading"><div><h2>Seus projetos</h2><p>{projects.length} projeto(s) cadastrado(s)</p></div></div><div className="cards-list">{projects.map((p) => <div className="project-card" key={p.id}><div className="summary-icon"><FolderKanban size={17} /></div><div><strong>{p.name}</strong><span>{p.client?.name}</span></div><div className="project-rate">{formatCurrency(p.hourly_rate)}<small>/ hora</small></div></div>)}{!projects.length && <EmptyState text="Cadastre seu primeiro projeto." />}</div></section></div></div> }
function ClientsPage({ clients, clientForm, setClientForm, saveClient }) { return <div className="page"><div className="page-heading compact"><div><p className="eyebrow">ORGANIZAÇÃO</p><h1>Clientes</h1><p className="subtitle">Tenha todos os seus trabalhos no lugar certo.</p></div></div><div className="content-grid"><section className="panel form-panel"><div className="panel-heading"><div><h2>Novo cliente</h2><p>Um nome já é suficiente para começar.</p></div></div><form className="stack-form" onSubmit={saveClient}><Field label="Nome"><input required value={clientForm.name} onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })} placeholder="Ex.: Empresa Acme" /></Field><Field label="E-mail"><input type="email" value={clientForm.email} onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })} placeholder="contato@empresa.com" /></Field><Field label="Observações"><textarea rows="3" value={clientForm.notes} onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })} /></Field><button className="primary-button" type="submit"><Plus size={17} /> Criar cliente</button></form></section><section className="panel"><div className="panel-heading"><div><h2>Seus clientes</h2><p>{clients.length} cliente(s) cadastrado(s)</p></div></div><div className="cards-list">{clients.map((c) => <div className="client-card" key={c.id}><div className="avatar">{c.name.charAt(0).toUpperCase()}</div><div><strong>{c.name}</strong><span>{c.email || 'Sem e-mail'} · {c.projects_count || 0} projeto(s)</span></div></div>)}{!clients.length && <EmptyState text="Cadastre seu primeiro cliente." />}</div></section></div></div> }
function Field({ label, children, wide }) { return <label className={wide ? 'field wide' : 'field'}><span>{label}</span>{children}</label> }

export default App

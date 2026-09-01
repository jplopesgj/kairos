import { Activity, CalendarDays, Check, CircleHelp, Clock3, FolderKanban, Menu, RefreshCw, Users, X } from 'lucide-react'
import { NavItem } from './NavItem'

const pageLabels = { dashboard: 'Visão geral', entries: 'Lançamentos', projects: 'Projetos', clients: 'Clientes' }

export function AppShell({ page, setPage, busy, message, onRefresh, children }) {
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-name">Kair<Clock3 size={20} strokeWidth={2.8} />s</span></div>
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
      <header className="topbar"><button className="mobile-menu" aria-label="Abrir menu"><Menu size={21} /></button><div className="breadcrumb">Meu workspace <span>/</span> {pageLabels[page]}</div><button className="icon-button" onClick={onRefresh} title="Atualizar"><RefreshCw size={17} className={busy ? 'spin' : ''} /></button></header>
      {message && <div className={`toast ${message.type}`}>{message.type === 'success' ? <Check size={17} /> : <X size={17} />}{message.text}</div>}
      {children}
    </main>
  </div>
}

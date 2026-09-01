import { useEffect, useState } from 'react'
import { ArrowDownToLine, Check, Pencil, Plus, Trash2 } from 'lucide-react'
import { EmptyState } from '../components/common/EmptyState'
import { Field } from '../components/common/Field'
import { emptyEntry } from '../lib/formDefaults'
import { formatCurrency, formatMinutes } from '../lib/formatters'
import { timeEntryService } from '../services/timeEntryService'

export function EntriesPage({ entries, projects, dates, range, setRange, onCreate, onUpdate, onEditEntry, onDelete, editingEntry, onClearEdit }) {
  const [form, setForm] = useState(emptyEntry())

  useEffect(() => {
    if (!editingEntry) return
    setForm({
      project_id: String(editingEntry.project_id),
      work_date: editingEntry.work_date?.slice(0, 10),
      start_time: editingEntry.start_time?.slice(0, 5),
      end_time: editingEntry.end_time?.slice(0, 5) || '',
      description: editingEntry.description || '',
    })
  }, [editingEntry])

  const handleSubmit = (event) => {
    event.preventDefault()
    const action = editingEntry ? onUpdate(editingEntry.id, form) : onCreate(form)
    Promise.resolve(action).then((success) => {
      if (success) { setForm(emptyEntry()); onClearEdit() }
    })
  }

  const cancel = () => { setForm(emptyEntry()); onClearEdit() }

  return <div className="page">
    <div className="page-heading compact"><div><p className="eyebrow">CONTROLE DE TEMPO</p><h1>Lançamentos</h1><p className="subtitle">Adicione, revise e mantenha seus registros em dia.</p></div><PeriodTabs range={range} setRange={setRange} /></div>
    <section className="panel form-panel"><div className="panel-heading"><div><h2>{editingEntry ? 'Editar lançamento' : 'Novo lançamento'}</h2><p>Registre um período já trabalhado.</p></div>{editingEntry && <button className="text-button" type="button" onClick={cancel}>Cancelar</button>}</div>
      <form className="entry-form" onSubmit={handleSubmit}><Field label="Projeto"><select required value={form.project_id} onChange={(event) => setForm({ ...form, project_id: event.target.value })}><option value="">Selecione...</option>{projects.filter((project) => project.is_active).map((project) => <option key={project.id} value={project.id}>{project.name} · {project.client?.name}</option>)}</select></Field><Field label="Data"><input required type="date" value={form.work_date} onChange={(event) => setForm({ ...form, work_date: event.target.value })} /></Field><Field label="Início"><input required type="time" value={form.start_time} onChange={(event) => setForm({ ...form, start_time: event.target.value })} /></Field><Field label="Fim"><input required type="time" value={form.end_time} onChange={(event) => setForm({ ...form, end_time: event.target.value })} /></Field><Field label="Descrição" wide><input placeholder="Em que você trabalhou?" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field><button className="primary-button" type="submit">{editingEntry ? <><Check size={17} /> Salvar alterações</> : <><Plus size={17} /> Adicionar</>}</button></form>
    </section>
    <section className="panel"><div className="panel-heading"><div><h2>Histórico</h2><p>{entries.length} lançamento(s) no período</p></div></div><div className="table-wrap"><table><thead><tr><th>Data</th><th>Projeto</th><th>Descrição</th><th>Horário</th><th>Duração</th><th>Valor</th><th /></tr></thead><tbody>{entries.map((entry) => <tr key={entry.id}><td>{new Intl.DateTimeFormat('pt-BR').format(new Date(`${entry.work_date}T12:00:00`))}</td><td><strong>{entry.project?.name}</strong><small>{entry.project?.client?.name}</small></td><td className="description-cell" title={entry.description || ''}>{entry.description || '—'}</td><td>{entry.start_time?.slice(0, 5)} — {entry.end_time?.slice(0, 5) || 'agora'}</td><td>{entry.duration_minutes !== null ? formatMinutes(entry.duration_minutes) : <span className="running-label">Em andamento</span>}</td><td>{entry.amount !== null ? formatCurrency(entry.amount) : '—'}</td><td className="actions"><button className="mini-action" onClick={() => onEditEntry(entry)} aria-label="Editar"><Pencil size={14} /></button><button className="mini-action danger" onClick={() => onDelete(entry)} aria-label="Excluir"><Trash2 size={14} /></button></td></tr>)}</tbody></table>{!entries.length && <EmptyState text="Nenhum lançamento encontrado." />}</div><div className="export-row"><a className="secondary-button" href={timeEntryService.exportUrl(dates)}><ArrowDownToLine size={16} /> Exportar CSV</a></div></section>
  </div>
}

function PeriodTabs({ range, setRange }) { return <div className="period-tabs">{[['today', 'Hoje'], ['week', '7 dias'], ['month', 'Este mês']].map(([id, label]) => <button key={id} className={range === id ? 'selected' : ''} onClick={() => setRange(id)}>{label}</button>)}</div> }

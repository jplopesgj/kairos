import { Clock3 } from 'lucide-react'

export function EmptyState({ text }) {
  return <div className="empty"><Clock3 size={22} /><p>{text}</p></div>
}

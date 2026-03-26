import { useApp } from '../../context/useApp'
import {
  Users, Briefcase, CalendarDays, TrendingUp,
  FileText, AlertCircle, CheckCircle, Clock
} from 'lucide-react'
import '../client/Dashboard.css'

export default function AdminDashboard() {
  const { users, cases, tasks, appointments } = useApp()

  const clients = users.filter(u => u.role === 'client')
  const myPendingTasks = tasks.filter(t => t.status === 'pending')
  
  // Calculate stats dynamically
  const stats = [
    { icon: Users, label: 'Clientes Activos', value: clients.length.toString(), color: 'primary' },
    { icon: Briefcase, label: 'Casos Abiertos', value: cases.filter(c => c.status !== 'Cerrado').length.toString(), color: 'warning' },
    { icon: CheckCircle, label: 'Resueltos este Mes', value: cases.filter(c => c.status === 'Cerrado').length.toString(), color: 'success' },
    { icon: CalendarDays, label: 'Citas Próximas', value: appointments.length.toString(), color: 'info' },
  ]

  const recentClients = clients.map(c => ({
    name: c.name,
    cases: cases.filter(caseItem => caseItem.clientId === c.id).length,
    status: 'Activo',
    lastActivity: 'Hoy'
  })).slice(0, 3)

  const priorityBadge = (p) => p === 'Alta' ? 'danger' : p === 'Media' ? 'warning' : 'info'

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Panel de Administración</h1>
          <p className="page-subtitle">Resumen global de la actividad del despacho.</p>
        </div>
      </div>

      <div className="stats-cards">
        {stats.map(s => (
          <div className={`stat-card card stat-${s.color}`} key={s.label}>
            <div className={`stat-card-icon bg-${s.color}`}><s.icon size={22} /></div>
            <div className="stat-card-info">
              <span className="stat-card-value">{s.value}</span>
              <span className="stat-card-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Pending Tasks */}
        <div className="card">
          <div className="card-header">
            <h3><AlertCircle size={18} /> Tareas Pendientes</h3>
          </div>
          <div className="case-list">
            {myPendingTasks.length === 0 ? <p className="text-center" style={{padding: '1rem'}}>No hay tareas pendientes.</p> : myPendingTasks.map((t, i) => (
              <div className="case-item" key={i}>
                <div className="case-info">
                  <span className="case-title">{t.title}</span>
                  <span className="case-meta">Vencimiento: {t.due}</span>
                </div>
                {t.priority && <span className={`badge badge--${priorityBadge(t.priority)}`}>{t.priority}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Clients */}
        <div className="card">
          <div className="card-header">
            <h3><Users size={18} /> Clientes Recientes</h3>
            <button className="btn btn-ghost btn-sm">Ver todos</button>
          </div>
          <div className="case-list">
            {recentClients.map((c, i) => (
              <div className="case-item" key={i}>
                <div className="case-info">
                  <span className="case-title">{c.name}</span>
                  <span className="case-meta">{c.cases} caso(s) • Última actividad: {c.lastActivity}</span>
                </div>
                <span className="badge badge--success">{c.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


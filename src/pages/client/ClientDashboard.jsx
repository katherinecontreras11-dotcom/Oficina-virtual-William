import { useApp } from '../../context/useApp'
import {
  Briefcase, FileText, CalendarDays, MessageSquare,
  TrendingUp, Clock, CheckCircle, AlertCircle
} from 'lucide-react'
import './Dashboard.css'

export default function ClientDashboard() {
  const { user, cases, appointments } = useApp()

  const myCases = cases.filter(c => c.clientId === user?.id)
  const myAppointments = appointments.filter(a => a.clientId === user?.id)

  const activeCases = myCases.filter(c => c.status !== 'Cerrado')
  const closedCases = myCases.filter(c => c.status === 'Cerrado')

  const nextAppointmentDate = myAppointments.length > 0 
    ? myAppointments[0].date 
    : 'No hay citas'

  const statCards = [
    { icon: Briefcase, label: 'Casos Activos', value: activeCases.length.toString(), color: 'primary' },
    { icon: CheckCircle, label: 'Resueltos', value: closedCases.length.toString(), color: 'success' },
    { icon: CalendarDays, label: 'Próxima Cita', value: nextAppointmentDate, color: 'info' },
    { icon: FileText, label: 'Documentos', value: '0', color: 'warning' },
  ]

  const recentCases = myCases.slice(0, 3)

  // Derive some activities from cases and appointments
  const recentActivity = []
  if (myCases.length > 0) {
    recentActivity.push({ icon: AlertCircle, text: `Actualización en caso ${myCases[0].id}`, time: 'Reciente' })
  }
  if (myAppointments.length > 0) {
    recentActivity.push({ icon: CalendarDays, text: `Cita programada para ${myAppointments[0].date}`, time: 'Reciente' })
  }
  recentActivity.push({ icon: MessageSquare, text: 'Bienvenido al portal legal.', time: 'Hoy' })

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Bienvenido de vuelta, {user?.name}. Aquí está un resumen de su actividad.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-cards">
        {statCards.map(s => (
          <div className={`stat-card card stat-${s.color}`} key={s.label}>
            <div className={`stat-card-icon bg-${s.color}`}>
              <s.icon size={22} />
            </div>
            <div className="stat-card-info">
              <span className="stat-card-value">{s.value}</span>
              <span className="stat-card-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="dashboard-grid">
        {/* Recent Cases */}
        <div className="card">
          <div className="card-header">
            <h3><Briefcase size={18} /> Casos Recientes</h3>
            <button className="btn btn-ghost btn-sm">Ver todos</button>
          </div>
          <div className="case-list">
            {recentCases.length === 0 ? <p style={{padding: '1rem'}}>No hay casos activos.</p> : recentCases.map(c => (
              <div className="case-item" key={c.id}>
                <div className="case-info">
                  <span className="case-id">{c.id}</span>
                  <span className="case-title">{c.title}</span>
                  <span className="case-meta">{c.date}</span>
                </div>
                <span className={`badge badge--${c.status === 'Resuelto' ? 'success' : c.status === 'Activo' ? 'warning' : 'info'}`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="card">
          <div className="card-header">
            <h3><Clock size={18} /> Actividad Reciente</h3>
          </div>
          <div className="activity-feed">
            {recentActivity.map((a, i) => (
              <div className="activity-item" key={i}>
                <div className="activity-icon">
                  <a.icon size={16} />
                </div>
                <div className="activity-content">
                  <p>{a.text}</p>
                  <span className="activity-time">{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


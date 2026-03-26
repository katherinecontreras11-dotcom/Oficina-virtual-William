import React, { useState, useEffect } from 'react'
import { useApp } from '../../context/useApp'
import { CalendarDays, Clock, Video, MapPin, Plus, X } from 'lucide-react'
import VideoCallButton from '../../components/VideoCallButton'
import '../client/Dashboard.css'

// Función para generar horarios 24/7 cada 15 minutos
const generateHours24 = () => {
  const hoursArray = []
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 60; j += 15) {
      const hour = String(i).padStart(2, '0')
      const minute = String(j).padStart(2, '0')
      const displayHour = i === 0 ? 12 : i > 12 ? i - 12 : i
      const period = i >= 12 ? 'PM' : 'AM'
      hoursArray.push({
        value: `${hour}:${minute}`,
        display: `${String(displayHour).padStart(2, '0')}:${minute} ${period}`
      })
    }
  }
  return hoursArray
}

const hours24 = generateHours24()

export default function ClientAppointments() {
  const { user, cases, appointments, addAppointment, users } = useApp()
  const [showModal, setShowModal] = useState(false)
  const myCases = cases.filter(c => String(c.clientId) === String(user?.id))
  const caseOptions = myCases.map(c => c.id)

  const defaultLawyerId = users.find((u) => u.role === 'admin')?.id || ''
  const [newAppt, setNewAppt] = useState({ date: '', time: '', lawyerId: String(defaultLawyerId), type: 'Videollamada', caseId: caseOptions[0] || '' })

  const myAppointments = appointments.filter(a => String(a.clientId) === String(user?.id))
  
  // Debug: Mostrar estado actual
  console.log('[ClientAppointments RENDER]', {
    userId: user?.id,
    userIdType: typeof user?.id,
    totalAppointments: appointments.length,
    filteredCount: myAppointments.length,
    first3Appointments: appointments.slice(0, 3).map(a => ({ 
      clientId: a.clientId, 
      clientIdType: typeof a.clientId,
      isMatch: Number(a.clientId) === Number(user?.id)
    }))
  })
  
  // Diagnóstico - Verificar que el filtro está funcionando
  useEffect(() => {
    if (user?.id) {
      console.log('[ClientAppointments] Citas filtradas:', {
        userId: user.id,
        totalAppointments: appointments.length,
        filteredAppointments: myAppointments.length,
        details: myAppointments.map(a => ({ id: a.id, clientId: a.clientId, date: a.date, time: a.time }))
      })
    }
  }, [appointments, user?.id])

  const handleSubmit = (e) => {
    e.preventDefault()
    // Parsear la fecha sin problemas de zona horaria
    const [year, month, day] = newAppt.date.split('-')
    const formattedDate = new Date(year, month - 1, day).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    const appt = {
      ...newAppt,
      clientId: String(user.id),
      lawyerId: String(newAppt.lawyerId),
      date: formattedDate,
      status: 'Pendiente'
    }
    addAppointment(appt)
    setShowModal(false)
    setNewAppt({ date: '', time: '', lawyerId: String(defaultLawyerId), type: 'Videollamada', caseId: caseOptions[0] || '' })
  }

  const getLawyerName = (id) => users.find(u => u.id === id)?.name

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mis Citas</h1>
          <p className="page-subtitle">Solicite y administre sus citas con el equipo legal.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Solicitar Cita
        </button>
      </div>

      <div className="appointments-grid">
        {myAppointments.length === 0 ? <p>No tiene citas programadas.</p> : myAppointments.map((a, i) => (
          <div className="card appointment-card" key={i}>
            <div className="appointment-header">
              <div className={`appointment-type ${a.type === 'Videollamada' ? 'type-video' : 'type-presential'}`}>
                {a.type === 'Videollamada' ? <Video size={16} /> : <MapPin size={16} />}
                {a.type}
              </div>
              <span className={`badge badge--${a.status === 'Confirmada' ? 'success' : 'warning'}`}>
                {a.status}
              </span>
            </div>

            <div className="appointment-body">
              <div className="appointment-datetime">
                <div className="appointment-date">
                  <CalendarDays size={18} />
                  <span>{a.date}</span>
                </div>
                <div className="appointment-time">
                  <Clock size={18} />
                  <span>{a.time}</span>
                </div>
              </div>

              <div className="appointment-details">
                <p><strong>Abogado:</strong> {getLawyerName(a.lawyerId)}</p>
                {a.caseId && <p><strong>Caso:</strong> <span className="case-id">{a.caseId}</span></p>}
              </div>
            </div>

            {a.type === 'Videollamada' && (
              <div className="appointment-actions">
                <VideoCallButton appointment={a} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal - Solicitar Cita */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Solicitar Nueva Cita</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Fecha</label>
                <input
                  type="date"
                  className="form-input"
                  value={newAppt.date}
                  onChange={(e) => setNewAppt({ ...newAppt, date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Hora</label>
                <select
                  className="form-input"
                  value={newAppt.time}
                  onChange={(e) => setNewAppt({ ...newAppt, time: e.target.value })}
                  required
                >
                  <option value="">Seleccione una hora</option>
                  {hours24.map((hour, idx) => (
                    <option key={idx} value={hour.value}>{hour.display}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Abogado</label>
                <select
                  className="form-input"
                  value={newAppt.lawyerId}
                  onChange={(e) => setNewAppt({ ...newAppt, lawyerId: String(e.target.value) })}
                >
                  {users.filter((u) => u.role === 'admin').map((lawyer) => (
                    <option key={lawyer.id} value={String(lawyer.id)}>{lawyer.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Tipo de Cita</label>
                <select
                  className="form-input"
                  value={newAppt.type}
                  onChange={(e) => setNewAppt({ ...newAppt, type: e.target.value })}
                >
                  <option value="Videollamada">Videollamada</option>
                  <option value="Presencial">Presencial</option>
                </select>
              </div>

              {caseOptions.length > 0 && <div className="form-group">
                <label className="form-label">Expediente Asociado</label>
                <select
                  className="form-input"
                  value={newAppt.caseId}
                  onChange={(e) => setNewAppt({ ...newAppt, caseId: e.target.value })}
                >
                  {caseOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>}

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  <Plus size={16} /> Solicitar Cita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}


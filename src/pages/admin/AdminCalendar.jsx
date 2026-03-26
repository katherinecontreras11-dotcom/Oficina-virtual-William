import React, { useState, useRef, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { CalendarDays, Clock, Video, MapPin, Plus, Edit, Trash2, X, Save } from 'lucide-react'
import VideoCallButton from '../../components/VideoCallButton'
import '../client/Dashboard.css'

const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie']
const hours = (() => {
  const hoursArray = []
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 60; j += 15) {
      hoursArray.push(`${String(i).padStart(2, '0')}:${String(j).padStart(2, '0')}`)
    }
  }
  return hoursArray
})()

export default function AdminCalendar() {
  const { appointments, users, cases, addAppointment, updateAppointment, deleteAppointment } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedAppt, setSelectedAppt] = useState(null)
  
  // Refs para el focus automático en los modales
  const clientSelectRef = useRef(null)
  const editClientSelectRef = useRef(null)

  const clients = users.filter(u => u.role === 'client')
  const upcomingToday = appointments.filter(a => a.status !== 'Cancelada')
  const getClientName = (id) => users.find(u => u.id === id)?.name || 'Cliente desconocido'

  const [newAppt, setNewAppt] = useState({
    date: '', time: '', clientId: String(clients[0]?.id || ''), type: 'Videollamada', caseId: '', status: 'Pendiente'
  })

  const [editData, setEditData] = useState({
    date: '', time: '', clientId: '', type: '', caseId: '', status: ''
  })

  // Effect para hacer focus en el modal de nueva cita
  useEffect(() => {
    if (showModal && clientSelectRef.current) {
      clientSelectRef.current.focus()
    }
  }, [showModal])

  // Effect para hacer focus en el modal de editar cita
  useEffect(() => {
    if (showEditModal && editClientSelectRef.current) {
      editClientSelectRef.current.focus()
    }
  }, [showEditModal])

  // Effect para desabilitar scroll cuando hay modal abierto
  useEffect(() => {
    if (showModal || showEditModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showModal, showEditModal])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validación: Verificar que clientId es válido
    if (!newAppt.clientId || Number(newAppt.clientId) === 0) {
      alert('Por favor, seleccione un cliente válido')
      return
    }
    
    // Parsear la fecha sin problemas de zona horaria
    const [year, month, day] = newAppt.date.split('-')
    const formattedDate = new Date(year, month - 1, day).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    
    const appointmentToAdd = {
      ...newAppt,
      clientId: Number(newAppt.clientId),
      lawyerId: 1,
      date: formattedDate,
      caseId: newAppt.caseId || undefined
    }
    
    console.log('[AdminCalendar] Creating appointment:', {
      originalClientId: newAppt.clientId,
      originalClientIdType: typeof newAppt.clientId,
      convertedClientId: appointmentToAdd.clientId,
      convertedClientIdType: typeof appointmentToAdd.clientId,
      fullAppointment: appointmentToAdd
    })
    
    console.log('[AdminCalendar] Calling addAppointment...')
    addAppointment(appointmentToAdd)
    console.log('[AdminCalendar] addAppointment completed')
    setShowModal(false)
    setNewAppt({ date: '', time: '', clientId: String(clients[0]?.id || ''), type: 'Videollamada', caseId: '', status: 'Pendiente' })
  }

  // Edit
  const handleEditOpen = (appt) => {
    setSelectedAppt(appt)
    setEditData({
      date: '',
      time: appt.time,
      clientId: String(appt.clientId),
      type: appt.type,
      caseId: appt.caseId || '',
      status: appt.status
    })
    setShowEditModal(true)
  }

  const handleEditSubmit = (e) => {
    e.preventDefault()
    const updatedData = {
      time: editData.time,
      clientId: Number(editData.clientId),
      type: editData.type,
      status: editData.status,
      caseId: editData.caseId || undefined
    }
    if (editData.date) {
      const [year, month, day] = editData.date.split('-')
      updatedData.date = new Date(year, month - 1, day).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    }
    updateAppointment(selectedAppt.id, updatedData)
    setShowEditModal(false)
    setSelectedAppt(null)
  }

  // Delete
  const handleDeleteOpen = (appt) => {
    setSelectedAppt(appt)
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = () => {
    deleteAppointment(selectedAppt.id)
    setShowDeleteConfirm(false)
    setSelectedAppt(null)
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Calendario</h1>
          <p className="page-subtitle">Vista semanal de asesorías y audiencias programadas.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={18} /> Nueva Cita</button>
      </div>

      <div className="calendar-layout">
        {/* Weekly Grid */}
        <div className="card calendar-grid-card">
          <div className="calendar-grid">
            <div className="calendar-corner" />
            {days.map(d => (
              <div className="calendar-day-header" key={d}>{d}</div>
            ))}

            {hours.map(h => (
              <React.Fragment key={`row-${h}`}>
                <div className="calendar-hour">{h}</div>
                {days.map(d => {
                  const apt = appointments.find(a => a.time.startsWith(h.substring(0, 2)) && d === 'Lun')
                  return (
                    <div className={`calendar-cell ${apt ? 'has-event' : ''}`} key={`${d}-${h}`}>
                      {apt && (
                        <div className={`calendar-event ${apt.type === 'Videollamada' ? 'event-video' : 'event-presential'}`}>
                          <span className="event-client">{getClientName(apt.clientId)}</span>
                          <span className="event-type">
                            {apt.type === 'Videollamada' ? <Video size={12} /> : <MapPin size={12} />}
                            {apt.type}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Today's appointments */}
        <div className="card">
          <div className="card-header">
            <h3><CalendarDays size={18} /> Próximas Citas</h3>
          </div>
          <div className="case-list">
            {upcomingToday.length === 0 ? <p className="text-center" style={{padding: '1rem'}}>No hay citas próximas.</p> : upcomingToday.map((a, i) => (
              <div className="case-item" key={i} style={{display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap'}}>
                <div className="case-info" style={{flex: 1, minWidth: '200px'}}>
                  <span className="case-title">{getClientName(a.clientId)}</span>
                  <span className="case-meta">
                    <Clock size={12} /> {a.date} {a.time} • {a.type} {a.caseId ? `• ${a.caseId}` : ''}
                  </span>
                </div>
                {a.type === 'Videollamada' && (
                  <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                    <VideoCallButton appointment={a} />
                  </div>
                )}
                <span className={`badge badge--${a.status === 'Confirmada' ? 'success' : a.status === 'Cancelada' ? 'danger' : 'warning'}`}>
                  {a.status}
                </span>
                <span className={`badge badge--${a.status === 'Confirmada' ? 'success' : a.status === 'Cancelada' ? 'danger' : 'warning'}`}>
                  {a.status}
                </span>
                <div className="action-btns" style={{display: 'flex', gap: '0.25rem', marginLeft: '0.25rem'}}>
                  <button className="btn btn-ghost btn-sm" title="Editar" onClick={() => handleEditOpen(a)}><Edit size={14} /></button>
                  <button className="btn btn-ghost btn-sm" title="Eliminar" onClick={() => handleDeleteOpen(a)} style={{color: '#ef4444'}}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal - Nueva Cita */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nueva Cita</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Cliente</label>
                <select ref={clientSelectRef} className="form-input" value={newAppt.clientId} onChange={(e) => setNewAppt({...newAppt, clientId: e.target.value})} required>
                  <option value="">Seleccione un cliente</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                <div className="form-group">
                  <label className="form-label">Fecha</label>
                  <input type="date" className="form-input" value={newAppt.date} onChange={(e) => setNewAppt({...newAppt, date: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Hora</label>
                  <select className="form-input" value={newAppt.time} onChange={(e) => setNewAppt({...newAppt, time: e.target.value})} required>
                    <option value="">Seleccione</option>
                    {hours.map((hour, i) => <option key={i} value={hour}>{hour}</option>)}
                  </select>
                </div>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                <div className="form-group">
                  <label className="form-label">Tipo de Cita</label>
                  <select className="form-input" value={newAppt.type} onChange={(e) => setNewAppt({...newAppt, type: e.target.value})}>
                    <option value="Videollamada">Videollamada</option>
                    <option value="Presencial">Presencial</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Estado</label>
                  <select className="form-input" value={newAppt.status} onChange={(e) => setNewAppt({...newAppt, status: e.target.value})}>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Confirmada">Confirmada</option>
                  </select>
                </div>
              </div>
              {cases.length > 0 && (
                <div className="form-group">
                  <label className="form-label">Expediente Asociado (opcional)</label>
                  <select className="form-input" value={newAppt.caseId} onChange={(e) => setNewAppt({...newAppt, caseId: e.target.value})}>
                    <option value="">Sin expediente</option>
                    {cases.filter(c => !newAppt.clientId || c.clientId === Number(newAppt.clientId)).map(c => (
                      <option key={c.id} value={c.id}>{c.id} — {c.title}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary"><Plus size={16} /> Crear Cita</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Editar Cita */}
      {showEditModal && selectedAppt && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Cita</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowEditModal(false)}><X size={20} /></button>
            </div>
            <form className="modal-form" onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label className="form-label">Cliente</label>
                <select ref={editClientSelectRef} className="form-input" value={editData.clientId} onChange={(e) => setEditData({...editData, clientId: e.target.value})} required>
                  <option value="">Seleccione un cliente</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                <div className="form-group">
                  <label className="form-label">Nueva Fecha (dejar vacío para mantener: {selectedAppt.date})</label>
                  <input type="date" className="form-input" value={editData.date} onChange={(e) => setEditData({...editData, date: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Hora</label>
                  <select className="form-input" value={editData.time} onChange={(e) => setEditData({...editData, time: e.target.value})} required>
                    {hours.map((hour, i) => <option key={i} value={hour}>{hour}</option>)}
                  </select>
                </div>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                <div className="form-group">
                  <label className="form-label">Tipo de Cita</label>
                  <select className="form-input" value={editData.type} onChange={(e) => setEditData({...editData, type: e.target.value})}>
                    <option value="Videollamada">Videollamada</option>
                    <option value="Presencial">Presencial</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Estado</label>
                  <select className="form-input" value={editData.status} onChange={(e) => setEditData({...editData, status: e.target.value})}>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Confirmada">Confirmada</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>
              </div>
              {cases.length > 0 && (
                <div className="form-group">
                  <label className="form-label">Expediente Asociado</label>
                  <select className="form-input" value={editData.caseId} onChange={(e) => setEditData({...editData, caseId: e.target.value})}>
                    <option value="">Sin expediente</option>
                    {cases.filter(c => !editData.clientId || c.clientId === Number(editData.clientId)).map(c => (
                      <option key={c.id} value={c.id}>{c.id} — {c.title}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary"><Save size={16} /> Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Confirmar Eliminación */}
      {showDeleteConfirm && selectedAppt && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()} style={{maxWidth: '450px'}}>
            <div className="modal-header">
              <h3>Confirmar Eliminación</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowDeleteConfirm(false)}><X size={20} /></button>
            </div>
            <div style={{padding: '1.5rem'}}>
              <p style={{margin: 0, fontSize: '0.95rem', lineHeight: '1.6'}}>
                ¿Está seguro de que desea eliminar la cita con <strong>{getClientName(selectedAppt.clientId)}</strong> del <strong>{selectedAppt.date}</strong> a las <strong>{selectedAppt.time}</strong>?
              </p>
            </div>
            <div className="modal-actions" style={{borderTop: '1px solid var(--border, #e5e7eb)', padding: '1rem 1.5rem'}}>
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleDeleteConfirm} style={{backgroundColor: '#ef4444', borderColor: '#ef4444'}}>
                <Trash2 size={16} /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

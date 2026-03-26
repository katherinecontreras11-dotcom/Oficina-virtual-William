import { useState, useMemo } from 'react'
import { useApp } from '../../context/useApp'
import { Briefcase, Plus, Search, Filter, Edit, Eye, Trash2, X, Save, Upload, FileText, AlertCircle, Download } from 'lucide-react'
import '../client/Dashboard.css'

const statusBadge = (s) => {
  const lower = String(s).toLowerCase()
  if (lower === 'closed' || lower === 'resuelto') return 'success'
  if (lower === 'active' || lower === 'activo' || lower === 'en curso') return 'warning'
  return 'info'
}

const priorityBadge = (p) => {
  const lower = String(p).toLowerCase()
  if (lower === 'alta' || lower === 'high') return 'danger'
  if (lower === 'media' || lower === 'medium') return 'warning'
  return 'info'
}

const displayStatus = (s) => {
  const lower = String(s).toLowerCase()
  if (lower === 'closed') return 'Resuelto'
  if (lower === 'pending') return 'Pendiente'
  if (lower === 'active') return 'Activo'
  return s
}

const displayPriority = (p) => {
  const lower = String(p).toLowerCase()
  if (lower === 'alta' || lower === 'high') return 'Alta'
  if (lower === 'media' || lower === 'medium') return 'Media'
  if (lower === 'baja' || lower === 'low') return 'Baja'
  return p
}

export default function AdminCases() {
  const { cases, users, addCase, updateCase, deleteCase, addLawyerDocument, deleteLawyerDocument, deleteClientDocument } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedCase, setSelectedCase] = useState(null)
  const [search, setSearch] = useState('')
  const [pdfError, setPdfError] = useState('')

  const clients = users.filter(u => u.role === 'client')
  const admin = users.find(u => u.role === 'admin')

  const [newCase, setNewCase] = useState({
    title: '', clientId: clients[0]?.id || '', status: 'Activo', priority: 'Media', description: '', pdfFile: null
  })

  const [editData, setEditData] = useState({
    title: '', clientId: '', status: '', priority: '', description: '', progress: 0
  })

  // Transformar casos de MongoDB para mostrar
  const transformedCases = useMemo(() => {
    return cases.map(c => ({
      ...c,
      displayStatus: displayStatus(c.status),
      displayPriority: displayPriority(c.priority),
      clientIdForDisplay: c.clientId instanceof Object ? c.clientId._id || c.clientId.id : c.clientId
    }))
  }, [cases])

  const filteredCases = transformedCases.filter(c => 
    c.id.toLowerCase().includes(search.toLowerCase()) ||
    c.title.toLowerCase().includes(search.toLowerCase())
  )

  const handlePdfChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (file.type !== 'application/pdf') {
      setPdfError('Solo se aceptan archivos en formato PDF')
      e.target.value = ''
      return
    }
    
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setPdfError('El archivo no debe superar 10MB')
      e.target.value = ''
      return
    }
    
    setPdfError('')
    setNewCase({...newCase, pdfFile: file})
  }

  const handleAddLawyerDoc = (e, caseId) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (file.type !== 'application/pdf') {
      setPdfError('Solo se aceptan archivos en formato PDF')
      e.target.value = ''
      return
    }
    
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setPdfError('El archivo no debe superar 10MB')
      e.target.value = ''
      return
    }
    
    setPdfError('')
    
    // Leer el archivo como base64
    const reader = new FileReader()
    reader.onload = (event) => {
      const base64Content = event.target.result
      addLawyerDocument(caseId, {
        name: file.name,
        size: file.size,
        type: 'application/pdf',
        content: base64Content
      })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const downloadDocument = (doc) => {
    try {
      if (!doc.content) {
        alert('Este documento no tiene contenido para descargar')
        return
      }

      const link = document.createElement('a')
      link.href = doc.content
      link.download = doc.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      alert(`📥 Documento "${doc.name}" descargado exitosamente`)
    } catch (error) {
      console.error('Error al descargar:', error)
      alert('Error al descargar el documento')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const caseData = {
      title: newCase.title,
      clientId: newCase.clientId,
      status: newCase.status.toLocaleLowerCase() === 'activo' ? 'active' : 'pending',
      priority: newCase.priority.toLowerCase(),
      progress: 0,
      date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
      description: newCase.description
    }
    const result = await addCase(caseData)
    if (result?.success || result === undefined) {
      setShowModal(false)
      setNewCase({ title: '', clientId: clients[0]?.id || '', status: 'Activo', priority: 'Media', description: '', pdfFile: null })
      setPdfError('')
    }
  }

  // View
  const handleView = (c) => {
    setSelectedCase(c)
    setShowViewModal(true)
  }

  // Edit
  const handleEditOpen = (c) => {
    setSelectedCase(c)
    setEditData({
      title: c.title,
      clientId: c.clientIdForDisplay || c.clientId,
      status: c.displayStatus,
      priority: c.displayPriority,
      description: c.description || '',
      progress: c.progress || 0
    })
    setShowEditModal(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    const result = await updateCase(selectedCase.id, {
      title: editData.title,
      clientId: editData.clientId,
      status: editData.status.toLowerCase() === 'activo' ? 'active' : 'pending',
      priority: editData.priority.toLowerCase(),
      description: editData.description,
      progress: Number(editData.progress)
    })
    if (result?.success || result === undefined) {
      setShowEditModal(false)
      setSelectedCase(null)
    }
  }

  // Delete
  const handleDeleteOpen = (c) => {
    setSelectedCase(c)
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = async () => {
    const result = await deleteCase(selectedCase.id)
    if (result?.success || result === undefined) {
      setShowDeleteConfirm(false)
      setSelectedCase(null)
    }
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestión de Expedientes</h1>
          <p className="page-subtitle">Administración completa de casos del despacho.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={18} /> Nuevo Expediente</button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="table-search">
            <Search size={16} />
            <input type="text" placeholder="Buscar expediente..." className="form-input" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-ghost btn-sm"><Filter size={16} /> Filtrar</button>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Expediente</th>
                <th>Título</th>
                <th>Cliente</th>
                <th>Abogado</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.length === 0 ? (
                <tr><td colSpan="7" className="text-center" style={{padding: '2rem'}}>No se encontraron expedientes.</td></tr>
              ) : filteredCases.map(c => {
                const clientObj = users.find(u => u.id === c.clientIdForDisplay || u.id === c.clientId)
                return (
                  <tr key={c.id}>
                    <td><span className="case-id">{c.id}</span></td>
                    <td className="fw-600">{c.title}</td>
                    <td>{clientObj ? clientObj.name : 'Sin asignar'}</td>
                    <td>{admin?.name || 'Lic. Rodríguez'}</td>
                    <td><span className={`badge badge--${priorityBadge(c.displayPriority)}`}>{c.displayPriority}</span></td>
                    <td><span className={`badge badge--${statusBadge(c.displayStatus)}`}>{c.displayStatus}</span></td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-ghost btn-sm" title="Ver" onClick={() => handleView(c)}><Eye size={16} /></button>
                        <button className="btn btn-ghost btn-sm" title="Editar" onClick={() => handleEditOpen(c)}><Edit size={16} /></button>
                        <button className="btn btn-ghost btn-sm" title="Eliminar" onClick={() => handleDeleteOpen(c)} style={{color: '#ef4444'}}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Nuevo Expediente */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nuevo Expediente</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Título del Caso</label>
                <input type="text" className="form-input" placeholder="Ej. Demanda Laboral v. Corp" value={newCase.title} onChange={(e) => setNewCase({...newCase, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Cliente</label>
                <select className="form-input" value={newCase.clientId} onChange={(e) => setNewCase({...newCase, clientId: e.target.value})}>
                  {clients.length === 0 ? <option value="">No hay clientes registrados</option> : clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                <div className="form-group">
                  <label className="form-label">Prioridad</label>
                  <select className="form-input" value={newCase.priority} onChange={(e) => setNewCase({...newCase, priority: e.target.value})}>
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Estado</label>
                  <select className="form-input" value={newCase.status} onChange={(e) => setNewCase({...newCase, status: e.target.value})}>
                    <option value="Activo">Activo</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Curso">En Curso</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea className="form-input" rows="3" placeholder="Descripción del caso..." value={newCase.description} onChange={(e) => setNewCase({...newCase, description: e.target.value})}></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">Documento PDF</label>
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '2px dashed var(--border, #e5e7eb)', borderRadius: '0.5rem', backgroundColor: 'var(--bg-secondary, rgba(0,0,0,0.02))'}}>
                  <input type="file" accept=".pdf" onChange={handlePdfChange} style={{display: 'none'}} id="pdf-input" />
                  <label htmlFor="pdf-input" style={{flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer'}}>
                    <Upload size={18} style={{color: 'var(--text-secondary)'}} />
                    <div>
                      <p style={{margin: 0, fontWeight: 500, fontSize: '0.9rem'}}>
                        {newCase.pdfFile ? `Archivo: ${newCase.pdfFile.name}` : 'Haz clic para subir un archivo PDF'}
                      </p>
                      <p style={{margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.8rem'}}>Solo PDF, máximo 10MB</p>
                    </div>
                  </label>
                </div>
                {pdfError && (
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', color: '#ef4444', fontSize: '0.85rem'}}>
                    <AlertCircle size={16} />
                    {pdfError}
                  </div>
                )}
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary"><Plus size={16} /> Crear Expediente</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Ver Expediente */}
      {showViewModal && selectedCase && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalles del Expediente</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowViewModal(false)}><X size={20} /></button>
            </div>
            <div style={{padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                <span className="case-id" style={{fontSize: '1rem', padding: '0.25rem 0.75rem'}}>{selectedCase.id}</span>
                <span className={`badge badge--${statusBadge(selectedCase.status)}`}>{selectedCase.status}</span>
                <span className={`badge badge--${priorityBadge(selectedCase.priority)}`}>{selectedCase.priority}</span>
              </div>

              <div>
                <h2 style={{margin: '0 0 0.25rem 0', fontSize: '1.25rem'}}>{selectedCase.title}</h2>
                <span style={{color: 'var(--text-secondary)', fontSize: '0.875rem'}}>Fecha: {selectedCase.date}</span>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                <div>
                  <label className="form-label" style={{fontWeight: 600, marginBottom: '0.25rem'}}>Cliente</label>
                  <p style={{margin: 0, color: 'var(--text-secondary)'}}>
                    {users.find(u => u.id === selectedCase.clientId)?.name || 'Sin asignar'}
                  </p>
                </div>
                <div>
                  <label className="form-label" style={{fontWeight: 600, marginBottom: '0.25rem'}}>Abogado</label>
                  <p style={{margin: 0, color: 'var(--text-secondary)'}}>{admin?.name || 'Lic. Rodríguez'}</p>
                </div>
              </div>

              <div>
                <label className="form-label" style={{fontWeight: 600, marginBottom: '0.5rem'}}>Progreso</label>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                  <div style={{flex: 1, background: 'var(--bg-secondary, rgba(0,0,0,0.05))', borderRadius: '999px', height: '8px', overflow: 'hidden'}}>
                    <div style={{width: `${selectedCase.progress || 0}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: '999px', transition: 'width 0.3s'}} />
                  </div>
                  <span style={{fontWeight: 600, fontSize: '0.875rem'}}>{selectedCase.progress || 0}%</span>
                </div>
              </div>

              {selectedCase.description && (
                <div>
                  <label className="form-label" style={{fontWeight: 600, marginBottom: '0.25rem'}}>Descripción</label>
                  <p style={{margin: 0, color: 'var(--text-secondary)', lineHeight: '1.6'}}>{selectedCase.description}</p>
                </div>
              )}

              {/* Documentos del Cliente */}
              <div>
                <label className="form-label" style={{fontWeight: 600, marginBottom: '0.75rem', display: 'block'}}>📄 Documentos del Cliente</label>
                {selectedCase.clientDocuments && selectedCase.clientDocuments.length > 0 ? (
                  <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem'}}>
                    {selectedCase.clientDocuments.map(doc => (
                      <div key={doc.id} style={{display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', backgroundColor: 'var(--bg-secondary, rgba(0,0,0,0.02))', borderRadius: '0.375rem', border: '1px solid var(--border, #e5e7eb)'}}>
                        <FileText size={16} style={{color: '#ef4444'}} />
                        <div style={{flex: 1}}>
                          <p style={{margin: 0, fontSize: '0.9rem', fontWeight: 500}}>{doc.name}</p>
                          <p style={{margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)'}}>
                            {(doc.size / 1024).toFixed(1)} KB • {doc.uploadedAt}
                          </p>
                        </div>
                        <button 
                          onClick={() => downloadDocument(doc)}
                          className="btn btn-ghost btn-sm" 
                          title="Descargar"
                          style={{color: '#6366f1'}}
                        >
                          <Download size={16} />
                        </button>
                        <button 
                          onClick={() => deleteClientDocument(selectedCase.id, doc.id)}
                          className="btn btn-ghost btn-sm" 
                          title="Eliminar"
                          style={{color: '#ef4444'}}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Sin documentos</p>
                )}
              </div>

              {/* Documentos del Abogado */}
              <div>
                <label className="form-label" style={{fontWeight: 600, marginBottom: '0.75rem', display: 'block'}}>📋 Mis Documentos</label>
                {selectedCase.lawyerDocuments && selectedCase.lawyerDocuments.length > 0 ? (
                  <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem'}}>
                    {selectedCase.lawyerDocuments.map(doc => (
                      <div key={doc.id} style={{display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', backgroundColor: 'var(--bg-secondary, rgba(0,0,0,0.02))', borderRadius: '0.375rem', border: '1px solid var(--border, #e5e7eb)'}}>
                        <FileText size={16} style={{color: '#6366f1'}} />
                        <div style={{flex: 1}}>
                          <p style={{margin: 0, fontSize: '0.9rem', fontWeight: 500}}>{doc.name}</p>
                          <p style={{margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)'}}>
                            {(doc.size / 1024).toFixed(1)} KB • {doc.uploadedAt}
                          </p>
                        </div>
                        <button 
                          onClick={() => downloadDocument(doc)}
                          className="btn btn-ghost btn-sm" 
                          title="Descargar"
                          style={{color: '#6366f1'}}
                        >
                          <Download size={16} />
                        </button>
                        <button 
                          onClick={() => deleteLawyerDocument(selectedCase.id, doc.id)}
                          className="btn btn-ghost btn-sm" 
                          title="Eliminar"
                          style={{color: '#ef4444'}}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem'}}>Sin documentos</p>
                )}
                
                <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', border: '2px dashed var(--border, #e5e7eb)', borderRadius: '0.5rem', backgroundColor: 'var(--bg-secondary, rgba(0,0,0,0.02))'}}>
                  <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={(e) => handleAddLawyerDoc(e, selectedCase.id)}
                    style={{display: 'none'}} 
                    id={`lawyer-pdf-${selectedCase.id}`}
                  />
                  <label htmlFor={`lawyer-pdf-${selectedCase.id}`} style={{flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
                    <Upload size={16} style={{color: 'var(--text-secondary)'}} />
                    <p style={{margin: 0, fontWeight: 500, fontSize: '0.85rem'}}>Subir documento</p>
                  </label>
                </div>
                {pdfError && (
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', color: '#ef4444', fontSize: '0.85rem'}}>
                    <AlertCircle size={16} />
                    {pdfError}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-actions" style={{borderTop: '1px solid var(--border, #e5e7eb)', padding: '1rem 1.5rem'}}>
              <button className="btn btn-secondary" onClick={() => setShowViewModal(false)}>Cerrar</button>
              <button className="btn btn-primary" onClick={() => { setShowViewModal(false); handleEditOpen(selectedCase) }}><Edit size={16} /> Editar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Editar Expediente */}
      {showEditModal && selectedCase && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Expediente — {selectedCase.id}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowEditModal(false)}><X size={20} /></button>
            </div>
            <form className="modal-form" onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label className="form-label">Título del Caso</label>
                <input type="text" className="form-input" value={editData.title} onChange={(e) => setEditData({...editData, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Cliente</label>
                <select className="form-input" value={editData.clientId} onChange={(e) => setEditData({...editData, clientId: e.target.value})}>
                  {clients.length === 0 ? <option value="">No hay clientes</option> : clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                <div className="form-group">
                  <label className="form-label">Prioridad</label>
                  <select className="form-input" value={editData.priority} onChange={(e) => setEditData({...editData, priority: e.target.value})}>
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Estado</label>
                  <select className="form-input" value={editData.status} onChange={(e) => setEditData({...editData, status: e.target.value})}>
                    <option value="Activo">Activo</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Curso">En Curso</option>
                    <option value="Resuelto">Resuelto</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Progreso (%)</label>
                <input type="number" className="form-input" min="0" max="100" value={editData.progress} onChange={(e) => setEditData({...editData, progress: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea className="form-input" rows="3" value={editData.description} onChange={(e) => setEditData({...editData, description: e.target.value})}></textarea>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary"><Save size={16} /> Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Confirmar Eliminación */}
      {showDeleteConfirm && selectedCase && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()} style={{maxWidth: '450px'}}>
            <div className="modal-header">
              <h3>Confirmar Eliminación</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowDeleteConfirm(false)}><X size={20} /></button>
            </div>
            <div style={{padding: '1.5rem'}}>
              <p style={{margin: 0, fontSize: '0.95rem', lineHeight: '1.6'}}>
                ¿Está seguro de que desea eliminar el expediente <strong>{selectedCase.id} — {selectedCase.title}</strong>?
                Esta acción no se puede deshacer.
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


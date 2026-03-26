import { useState } from 'react'
import { useApp } from '../../context/useApp'
import { Users, Plus, Search, Mail, Phone, Eye, EyeOff, Edit, Trash2, X, Save, Lock } from 'lucide-react'
import '../client/Dashboard.css'

export default function AdminClients() {
  const { users, cases, registerUser, updateProfile, deleteUser } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  const [newClient, setNewClient] = useState({ name: '', email: '', password: '', phone: '' })
  const [editData, setEditData] = useState({ name: '', email: '', password: '', phone: '' })
  const [showPasswordNew, setShowPasswordNew] = useState(false)
  const [showPasswordEdit, setShowPasswordEdit] = useState(false)

  const clientsList = users.filter(u => u.role === 'client').map(c => ({
    ...c,
    casesCount: cases.filter(caseItem => caseItem.clientId === c.id).length,
    status: 'Activo',
    joined: 'Reciente'
  })).filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!newClient.name.trim() || !newClient.email.trim() || !newClient.password.trim()) {
      setError('Todos los campos obligatorios deben ser completados.')
      return
    }

    // Agregar @wil.com automáticamente al email
    const fullEmail = newClient.email.trim() + '@wil.com'
    const result = await registerUser(newClient.name.trim(), fullEmail, newClient.password.trim())
    if (result.success) {
      // Reset form fields
      setNewClient({ name: '', email: '', password: '', phone: '' })
      // Reset password visibility
      setShowPasswordNew(false)
      // Close modal
      setShowModal(false)
      console.log('[AdminClients] Cliente registrado exitosamente')
    } else {
      setError(result.message || 'Error al registrar cliente')
      console.error('[AdminClients] Error:', result.message)
    }
  }

  // View
  const handleView = (client) => {
    setSelectedClient(client)
    setShowViewModal(true)
  }

  // Edit
  const handleEditOpen = (client) => {
    setSelectedClient(client)
    // Extraer solo la parte antes de @wil.com para el campo de edición
    const emailWithoutDomain = client.email.replace('@wil.com', '')
    setEditData({ name: client.name, email: emailWithoutDomain, password: client.password || '', phone: client.phone || '' })
    setShowEditModal(true)
    setError('')
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!editData.name.trim() || !editData.email.trim()) {
      setError('Nombre y correo son obligatorios.')
      return
    }
    // Agregar @wil.com automáticamente al email
    const fullEmail = editData.email.trim() + '@wil.com'
    // Check duplicate email (exclude current client)
    const duplicate = users.find(u => u.email === fullEmail && u.id !== selectedClient.id)
    if (duplicate) {
      setError('El correo ya está registrado por otro usuario.')
      return
    }
    const result = await updateProfile(selectedClient.id, { name: editData.name, email: fullEmail, password: editData.password, phone: editData.phone })
    if (result?.success || result === undefined) {
      setShowEditModal(false)
      setSelectedClient(null)
    }
  }

  // Delete
  const handleDeleteOpen = (client) => {
    setSelectedClient(client)
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = () => {
    deleteUser(selectedClient.id)
    setShowDeleteConfirm(false)
    setSelectedClient(null)
  }

  const clientCases = selectedClient ? cases.filter(c => c.clientId === selectedClient.id) : []

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestión de Clientes</h1>
          <p className="page-subtitle">Directorio completo de clientes del despacho.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={18} /> Nuevo Cliente</button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="table-search">
            <Search size={16} />
            <input type="text" placeholder="Buscar cliente..." className="form-input" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Contacto</th>
                <th>Casos</th>
                <th>Estado</th>
                <th>Desde</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientsList.length === 0 ? (
                <tr><td colSpan="6" className="text-center" style={{padding: '2rem'}}>No se encontraron clientes.</td></tr>
              ) : clientsList.map((c, i) => (
                <tr key={i}>
                  <td>
                    <div className="client-name">
                      <div className="client-avatar" style={c.avatar?.length > 10 ? { backgroundImage: `url(${c.avatar})`, backgroundSize: 'cover', color: 'transparent' } : {}}>
                        {c.avatar?.length <= 10 && c.avatar}
                      </div>
                      <span className="fw-600">{c.name}</span>
                    </div>
                  </td>
                  <td>
                    <div className="client-contact">
                      <span><Mail size={14} /> {c.email}</span>
                      <span><Phone size={14} /> {c.phone || 'Sin teléfono'}</span>
                    </div>
                  </td>
                  <td>{c.casesCount}</td>
                  <td>
                    <span className={`badge badge--${c.status === 'Activo' ? 'success' : 'danger'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>{c.joined}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn btn-ghost btn-sm" title="Ver" onClick={() => handleView(c)}><Eye size={16} /></button>
                      <button className="btn btn-ghost btn-sm" title="Editar" onClick={() => handleEditOpen(c)}><Edit size={16} /></button>
                      <button className="btn btn-ghost btn-sm" title="Eliminar" onClick={() => handleDeleteOpen(c)} style={{color: '#ef4444'}}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Nuevo Cliente */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Registrar Nuevo Cliente</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>

            {error && (
              <div style={{
                padding: '0.75rem 1rem', marginBottom: '1rem', borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#dc2626',
                fontSize: '0.875rem', border: '1px solid rgba(239, 68, 68, 0.2)'
              }}>{error}</div>
            )}

            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nombre Completo *</label>
                <input type="text" className="form-input" placeholder="Ej. María García" value={newClient.name} onChange={(e) => setNewClient({...newClient, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Correo Electrónico *</label>
                <div style={{display: 'flex', alignItems: 'center', border: '1px solid var(--border, #d1d5db)', borderRadius: '8px', overflow: 'hidden'}}>
                  <input type="text" className="form-input" style={{border: 'none', flex: 1, borderRadius: 0}} placeholder="usuario" value={newClient.email} onChange={(e) => setNewClient({...newClient, email: e.target.value})} required />
                  <span style={{padding: '0 12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', fontWeight: 500, backgroundColor: 'var(--bg-secondary, rgba(0,0,0,0.02)'}}> @wil.com</span>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Contraseña *</label>
                <div style={{position: 'relative'}}>
                  <Lock size={18} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none'}} />
                  <input type={showPasswordNew ? "text" : "password"} className="form-input" style={{paddingLeft: '40px', paddingRight: '40px'}} placeholder="Contraseña de acceso" value={newClient.password} onChange={(e) => setNewClient({...newClient, password: e.target.value})} required />
                  <button type="button" onClick={() => setShowPasswordNew(!showPasswordNew)} style={{position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px'}}>
                    {showPasswordNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input type="text" className="form-input" placeholder="+1 555-0000" value={newClient.phone} onChange={(e) => setNewClient({...newClient, phone: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary"><Plus size={16} /> Registrar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Ver Cliente */}
      {showViewModal && selectedClient && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalles del Cliente</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowViewModal(false)}><X size={20} /></button>
            </div>
            <div style={{padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem'}}>
                <div className="client-avatar" style={{
                  width: '56px', height: '56px', fontSize: '1.5rem',
                  ...(selectedClient.avatar?.length > 10 ? { backgroundImage: `url(${selectedClient.avatar})`, backgroundSize: 'cover', color: 'transparent' } : {})
                }}>
                  {selectedClient.avatar?.length <= 10 && selectedClient.avatar}
                </div>
                <div>
                  <h3 style={{margin: 0}}>{selectedClient.name}</h3>
                  <span style={{color: 'var(--text-secondary)', fontSize: '0.875rem'}}>{selectedClient.email}</span>
                </div>
              </div>

              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                <div>
                  <label className="form-label" style={{fontWeight: 600, marginBottom: '0.25rem'}}>Teléfono</label>
                  <p style={{margin: 0, color: 'var(--text-secondary)'}}>{selectedClient.phone || 'Sin teléfono'}</p>
                </div>
                <div>
                  <label className="form-label" style={{fontWeight: 600, marginBottom: '0.25rem'}}>Estado</label>
                  <p style={{margin: 0}}><span className="badge badge--success">Activo</span></p>
                </div>
                <div>
                  <label className="form-label" style={{fontWeight: 600, marginBottom: '0.25rem'}}>Dirección</label>
                  <p style={{margin: 0, color: 'var(--text-secondary)'}}>{selectedClient.address || 'Sin dirección'}</p>
                </div>
                <div>
                  <label className="form-label" style={{fontWeight: 600, marginBottom: '0.25rem'}}>Documento</label>
                  <p style={{margin: 0, color: 'var(--text-secondary)'}}>{selectedClient.document || 'Sin documento'}</p>
                </div>
              </div>

              {selectedClient.bio && (
                <div>
                  <label className="form-label" style={{fontWeight: 600, marginBottom: '0.25rem'}}>Biografía</label>
                  <p style={{margin: 0, color: 'var(--text-secondary)'}}>{selectedClient.bio}</p>
                </div>
              )}

              <div>
                <label className="form-label" style={{fontWeight: 600, marginBottom: '0.5rem'}}>Casos Asociados ({clientCases.length})</label>
                {clientCases.length === 0 ? (
                  <p style={{margin: 0, color: 'var(--text-secondary)'}}>Sin casos asignados.</p>
                ) : (
                  <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                    {clientCases.map(c => (
                      <div key={c.id} style={{background: 'var(--bg-secondary, rgba(0,0,0,0.03))', padding: '0.75rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <div>
                          <span style={{fontWeight: 600, fontSize: '0.875rem'}}>{c.id}</span>
                          <span style={{marginLeft: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem'}}>{c.title}</span>
                        </div>
                        <span className={`badge badge--${c.status === 'Activo' ? 'warning' : c.status === 'Resuelto' ? 'success' : 'info'}`}>{c.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-actions" style={{borderTop: '1px solid var(--border, #e5e7eb)', padding: '1rem 1.5rem'}}>
              <button className="btn btn-secondary" onClick={() => setShowViewModal(false)}>Cerrar</button>
              <button className="btn btn-primary" onClick={() => { setShowViewModal(false); handleEditOpen(selectedClient) }}><Edit size={16} /> Editar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Editar Cliente */}
      {showEditModal && selectedClient && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Editar Cliente</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowEditModal(false)}><X size={20} /></button>
            </div>

            {error && (
              <div style={{
                padding: '0.75rem 1rem', marginBottom: '1rem', borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#dc2626',
                fontSize: '0.875rem', border: '1px solid rgba(239, 68, 68, 0.2)'
              }}>{error}</div>
            )}

            <form className="modal-form" onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label className="form-label">Nombre Completo *</label>
                <input type="text" className="form-input" value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Correo Electrónico *</label>
                <div style={{display: 'flex', alignItems: 'center', border: '1px solid var(--border, #d1d5db)', borderRadius: '8px', overflow: 'hidden'}}>
                  <input type="text" className="form-input" style={{border: 'none', flex: 1, borderRadius: 0}} value={editData.email} onChange={(e) => setEditData({...editData, email: e.target.value})} required />
                  <span style={{padding: '0 12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', fontWeight: 500, backgroundColor: 'var(--bg-secondary, rgba(0,0,0,0.02)'}}> @wil.com</span>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <div style={{position: 'relative'}}>
                  <Lock size={18} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none'}} />
                  <input type={showPasswordEdit ? "text" : "password"} className="form-input" style={{paddingLeft: '40px', paddingRight: '40px'}} placeholder="Dejar en blanco para no cambiar" value={editData.password} onChange={(e) => setEditData({...editData, password: e.target.value})} />
                  <button type="button" onClick={() => setShowPasswordEdit(!showPasswordEdit)} style={{position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px'}}>
                    {showPasswordEdit ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input type="text" className="form-input" value={editData.phone} onChange={(e) => setEditData({...editData, phone: e.target.value})} />
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
      {showDeleteConfirm && selectedClient && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()} style={{maxWidth: '450px'}}>
            <div className="modal-header">
              <h3>Confirmar Eliminación</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowDeleteConfirm(false)}><X size={20} /></button>
            </div>
            <div style={{padding: '1.5rem'}}>
              <p style={{margin: 0, fontSize: '0.95rem', lineHeight: '1.6'}}>
                ¿Está seguro de que desea eliminar al cliente <strong>{selectedClient.name}</strong>?
                Esta acción eliminará también sus expedientes, citas y conversaciones asociadas.
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


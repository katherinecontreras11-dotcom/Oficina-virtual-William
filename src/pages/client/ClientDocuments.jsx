import { useState } from 'react'
import { useApp } from '../../context/useApp'
import { FileText, Upload, Download, Trash2, X, Plus, AlertCircle } from 'lucide-react'
import '../client/Dashboard.css'

const typeColor = { PDF: 'danger', DOCX: 'info', IMG: 'success', XLSX: 'warning' }

export default function ClientDocuments() {
  const { user, cases, addClientDocument } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [newDoc, setNewDoc] = useState({ name: '', caseId: '', type: 'PDF', file: null, content: null })
  const [fileError, setFileError] = useState('')

  const myCases = cases.filter(c => c.clientId === user?.id)
  // Documentos asociados a expedientes (persistidos en backend/nube)
  const allDocuments = myCases.flatMap(c => (c.clientDocuments || []).map(doc => ({
      ...doc,
      caseId: c.id,
      date: doc.uploadedAt || new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    })))

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar PDF
    if (newDoc.type === 'PDF' && file.type !== 'application/pdf') {
      setFileError('El archivo debe ser un PDF válido')
      e.target.value = ''
      return
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setFileError('El archivo no debe superar 10MB')
      e.target.value = ''
      return
    }

    setFileError('')
    
    // Leer el archivo como base64
    const reader = new FileReader()
    reader.onload = (event) => {
      const base64Content = event.target.result
      setNewDoc({ ...newDoc, name: file.name, file: file, content: base64Content })
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = (e) => {
    e.preventDefault()
    
    if (!newDoc.file) {
      setFileError('Por favor selecciona un archivo')
      return
    }

    // Requerir expediente para persistir en backend/nube
    if (!newDoc.caseId) {
      setFileError('Debes seleccionar un expediente para compartir con tu abogado')
      return
    }

    // Subir a expediente específico en nube
    addClientDocument(newDoc.caseId, newDoc.file)

    setNewDoc({ name: '', caseId: '', type: 'PDF', file: null, content: null })
    setFileError('')
    setShowModal(false)
  }

  const downloadDocument = (doc) => {
    try {
      const downloadUrl = doc.url || doc.content
      if (!downloadUrl) {
        alert('Este documento no tiene contenido para descargar')
        return
      }

      const link = document.createElement('a')
      link.href = downloadUrl
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

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Mis Documentos</h1>
          <p className="text-secondary">Gestiona tus documentos y expedientes</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Nuevo Documento
        </button>
      </div>

      {/* Modal de subida */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Subir Nuevo Documento</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form className="modal-form" onSubmit={handleUpload}>
              {/* Mensaje de redirección si hay casos */}
              {myCases.length > 0 ? (
                <>
                  <div style={{padding: '1rem', backgroundColor: '#e0f4ff', borderRadius: '0.5rem', border: '1px solid #0ea5e9', color: '#0369a1', marginBottom: '1.5rem', fontSize: '0.9rem'}}>
                    <strong>💡 Recomendación:</strong> Para compartir documentos con tu abogado, ve a <strong>Mis Casos</strong>, selecciona el expediente y sube allí. Tu abogado verá los documentos inmediatamente.
                  </div>
                  <p style={{marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
                    También puedes subir documentos generales aquí:
                  </p>
                </>
              ) : (
                <div style={{padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '0.5rem', border: '1px solid #fcd34d', color: '#92400e', marginBottom: '1.5rem', textAlign: 'center'}}>
                  <p style={{margin: 0, fontSize: '0.9rem'}}>
                    No tienes expedientes aún. Ve a <strong>Mis Casos</strong> para crear uno y compartir documentos con tu abogado.
                  </p>
                </div>
              )}

              <div className="form-group">
                  <label className="form-label">Tipo de Documento</label>
                  <select
                    className="form-input"
                    value={newDoc.type}
                    onChange={(e) => setNewDoc({ ...newDoc, type: e.target.value })}
                  >
                    <option value="PDF">PDF</option>
                    <option value="DOCX">DOCX</option>
                    <option value="IMG">Imagen</option>
                    <option value="XLSX">Excel</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Seleccionar Archivo</label>
                  <div style={{display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '2px dashed var(--border, #e5e7eb)', borderRadius: '0.5rem', backgroundColor: 'var(--bg-secondary, rgba(0,0,0,0.02))'}}>
                    <input 
                      type="file" 
                      accept={newDoc.type === 'PDF' ? '.pdf' : '*'} 
                      onChange={handleFileChange}
                      style={{display: 'none'}} 
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" style={{flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer'}}>
                      <Upload size={18} style={{color: 'var(--text-secondary)'}} />
                      <div>
                        <p style={{margin: 0, fontWeight: 500, fontSize: '0.9rem'}}>
                          {newDoc.file ? `Archivo: ${newDoc.file.name}` : 'Haz clic para seleccionar archivo'}
                        </p>
                        <p style={{margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.8rem'}}>Máximo 10MB</p>
                      </div>
                    </label>
                  </div>
                  {fileError && (
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', color: '#ef4444', fontSize: '0.85rem'}}>
                      <AlertCircle size={16} />
                      {fileError}
                    </div>
                  )}
                </div>

                {myCases.length > 0 && (
                  <div className="form-group">
                    <label className="form-label">📋 Expediente Asociado <span style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>Opcional</span></label>
                    <select
                      className="form-input"
                      value={newDoc.caseId}
                      onChange={(e) => setNewDoc({ ...newDoc, caseId: e.target.value })}
                    >
                      <option value="">-- Selecciona expediente --</option>
                      {myCases.map(c => <option key={c.id} value={c.id}>{c.id} — {c.title}</option>)}
                    </select>
                  </div>
                )}

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  <Plus size={16} /> Subir Documento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabla de documentos */}
      <div className="card">
        <div className="card-header">
          <h3>Tus Documentos ({allDocuments.length})</h3>
        </div>
        <div className="table-responsive">
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{borderBottom: '2px solid var(--neutral-200)', backgroundColor: 'var(--neutral-50)'}}>
                <th style={{textAlign: 'left', padding: '1rem', fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)'}}>Nombre</th>
                <th style={{textAlign: 'center', padding: '1rem', fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', width: '100px'}}>Tipo</th>
                <th style={{textAlign: 'right', padding: '1rem', fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', width: '110px'}}>Tamaño</th>
                <th style={{textAlign: 'center', padding: '1rem', fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', width: '140px'}}>Fecha</th>
                <th style={{textAlign: 'center', padding: '1rem', fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', width: '100px'}}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {allDocuments.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)'}}>
                    <FileText size={32} style={{margin: '0 auto 0.5rem', opacity: 0.5}} />
                    <p>No tienes documentos aún</p>
                  </td>
                </tr>
              ) : (
                allDocuments.map(doc => (
                  <tr key={doc.id} style={{borderBottom: '1px solid var(--neutral-100)', transition: 'background-color 0.2s'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--neutral-50)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem'}}>
                      <FileText size={18} style={{color: 'var(--text-secondary)', flexShrink: 0}} />
                      <span style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{doc.name}</span>
                    </td>
                    <td style={{textAlign: 'center', padding: '1rem', fontSize: '0.9rem'}}>
                      <span className={`badge badge-${typeColor[doc.type] || 'secondary'}`}>
                        {doc.type}
                      </span>
                    </td>
                    <td style={{textAlign: 'right', padding: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
                      {doc.size ? `${(doc.size / 1024 / 1024).toFixed(2)} MB` : '—'}
                    </td>
                    <td style={{textAlign: 'center', padding: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
                      {doc.date || '—'}
                    </td>
                    <td style={{textAlign: 'center', padding: '1rem'}}>
                      <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center'}}>
                        <button
                          className="btn-icon"
                          title="Descargar"
                          onClick={() => downloadDocument(doc)}
                          style={{padding: '0.5rem', borderRadius: '0.4rem', transition: 'background-color 0.2s'}}
                        >
                          <Download size={18} />
                        </button>
                        <button
                          className="btn-icon btn-danger"
                          title="Eliminar"
                          style={{padding: '0.5rem', borderRadius: '0.4rem', transition: 'background-color 0.2s', opacity: 0.35, cursor: 'not-allowed'}}
                          disabled
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


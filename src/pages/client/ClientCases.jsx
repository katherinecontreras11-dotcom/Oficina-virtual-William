import { useState } from 'react'
import { useApp } from '../../context/useApp'
import { Briefcase, Search, Filter, Upload, FileText, Download, Trash2, Plus, X, AlertCircle } from 'lucide-react'
import '../client/Dashboard.css'

const statusBadge = (s) => s === 'Resuelto' ? 'success' : s === 'Activo' || s === 'En Curso' ? 'warning' : 'info'

export default function ClientCases() {
  const { cases, user, addClientDocument, deleteClientDocument } = useApp()
  const [search, setSearch] = useState('')
  const [expandedCase, setExpandedCase] = useState(null)
  const [pdfError, setPdfError] = useState('')

  const myCases = cases.filter(c => c.clientId === user?.id)
  const filteredCases = myCases.filter(c => 
    c.id.toLowerCase().includes(search.toLowerCase()) ||
    c.title.toLowerCase().includes(search.toLowerCase())
  )

  const handlePdfUpload = (e, caseId) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar PDF
    if (file.type !== 'application/pdf') {
      setPdfError('Solo se aceptan archivos en formato PDF')
      e.target.value = ''
      return
    }

    // Validar tamaño
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setPdfError('El archivo no debe superar 10MB')
      e.target.value = ''
      return
    }

    setPdfError('')
    
    addClientDocument(caseId, file)
    e.target.value = ''
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
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mis Casos</h1>
          <p className="page-subtitle">Seguimiento detallado de todos sus expedientes legales.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="table-search">
            <Search size={16} />
            <input type="text" placeholder="Buscar expediente..." className="form-input" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-ghost btn-sm"><Filter size={16} /> Filtrar</button>
        </div>

        {filteredCases.length === 0 ? (
          <div style={{padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)'}}>
            <Briefcase size={40} style={{marginBottom: '1rem', opacity: 0.5}} />
            <p>No se encontraron expedientes.</p>
          </div>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem'}}>
            {filteredCases.map(c => (
              <div key={c.id} style={{border: '1px solid var(--border, #e5e7eb)', borderRadius: '0.5rem', overflow: 'hidden'}}>
                <div 
                  onClick={() => setExpandedCase(expandedCase === c.id ? null : c.id)}
                  style={{
                    padding: '1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'var(--bg-secondary, rgba(0,0,0,0.02))',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary, rgba(0,0,0,0.05))'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary, rgba(0,0,0,0.02))'}
                >
                  <div style={{flex: 1}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem'}}>
                      <span className="case-id">{c.id}</span>
                      <span className={`badge badge--${statusBadge(c.status)}`}>{c.status}</span>
                    </div>
                    <h3 style={{margin: 0, fontSize: '1rem', fontWeight: 600}}>{c.title}</h3>
                    <p style={{margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)'}}>
                      {c.description}
                    </p>
                  </div>
                  <div style={{
                    width: '80px',
                    marginRight: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '0.5rem'
                  }}>
                    <div style={{fontSize: '0.9rem', fontWeight: 600}}>{c.progress || 0}%</div>
                    <div style={{width: '60px', height: '6px', background: 'var(--border, #e5e7eb)', borderRadius: '999px', overflow: 'hidden'}}>
                      <div style={{width: `${c.progress || 0}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: '999px'}} />
                    </div>
                  </div>
                </div>

                {expandedCase === c.id && (
                  <div style={{padding: '1.5rem', borderTop: '1px solid var(--border, #e5e7eb)'}}>
                    {/* Documentos del Cliente */}
                    <div style={{marginBottom: '2rem'}}>
                      <h4 style={{margin: '0 0 1rem 0', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)'}}>
                        📄 Mis Documentos
                      </h4>
                      
                      {c.clientDocuments && c.clientDocuments.length > 0 && (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem'}}>
                          {c.clientDocuments.map(doc => (
                            <div key={doc.id} style={{display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', backgroundColor: 'var(--bg-secondary, rgba(0,0,0,0.02))', borderRadius: '0.375rem', border: '1px solid var(--border, #e5e7eb)'}}>
                              <FileText size={16} style={{color: '#ef4444'}} />
                              <div style={{flex: 1}}>
                                <p style={{margin: 0, fontSize: '0.9rem', fontWeight: 500}}>{doc.name}</p>
                                <p style={{margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)'}}>
                                  {(doc.size / 1024).toFixed(1)} KB • {doc.uploadedAt}
                                </p>
                              </div>
                              <button 
                                onClick={() => deleteClientDocument(c.id, doc.id)}
                                className="btn btn-ghost btn-sm" 
                                title="Eliminar"
                                style={{color: '#ef4444'}}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '2px dashed var(--border, #e5e7eb)', borderRadius: '0.5rem', backgroundColor: 'var(--bg-secondary, rgba(0,0,0,0.02))'}}>
                        <input 
                          type="file" 
                          accept=".pdf" 
                          onChange={(e) => handlePdfUpload(e, c.id)}
                          style={{display: 'none'}} 
                          id={`pdf-upload-${c.id}`}
                        />
                        <label htmlFor={`pdf-upload-${c.id}`} style={{flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer'}}>
                          <Upload size={18} style={{color: 'var(--text-secondary)'}} />
                          <div>
                            <p style={{margin: 0, fontWeight: 500, fontSize: '0.9rem'}}>Haz clic para subir un PDF</p>
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

                    {/* Documentos del Abogado */}
                    <div>
                      <h4 style={{margin: '0 0 1rem 0', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)'}}>
                        📋 Documentos del Abogado
                      </h4>
                      
                      {c.lawyerDocuments && c.lawyerDocuments.length > 0 ? (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
                          {c.lawyerDocuments.map(doc => (
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
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0'}}>
                          No hay documentos disponibles
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


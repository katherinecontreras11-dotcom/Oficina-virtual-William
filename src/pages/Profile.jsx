import { useState, useEffect } from 'react'
import { useApp } from '../context/useApp'
import { Save, Camera, User, Mail, Phone, MapPin, FileText, X, Shield, Briefcase } from 'lucide-react'
import './client/Dashboard.css'

export default function Profile() {
  const { user, updateProfile, uploadAvatar, removeAvatar, cases } = useApp()
  const [isEditing, setIsEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [avatarError, setAvatarError] = useState('')
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    document: user?.document || '',
    address: user?.address || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    avatarPublicId: user?.avatarPublicId || ''
  })

  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '')

  // Sync state when user changes (e.g., after saving)
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        document: user.document || '',
        address: user.address || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        avatarPublicId: user.avatarPublicId || ''
      })
      setAvatarPreview(user.avatar || '')
    }
  }, [user])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp']
    const maxSize = 2 * 1024 * 1024

    if (!allowedMimes.includes(file.type)) {
      setAvatarError('Formato no permitido. Usa JPG, PNG o WEBP')
      e.target.value = ''
      return
    }

    if (file.size > maxSize) {
      setAvatarError('El avatar no debe superar 2MB')
      e.target.value = ''
      return
    }

    setAvatarError('')
    setAvatarUploading(true)
    const result = await uploadAvatar(file)
    setAvatarUploading(false)

    if (!result.success) {
      setAvatarError(result.message || 'No se pudo subir el avatar')
      e.target.value = ''
      return
    }

    const updatedAvatar = result.user?.avatar || ''
    setAvatarPreview(updatedAvatar)
    setFormData(prev => ({
      ...prev,
      avatar: updatedAvatar,
      avatarPublicId: result.user?.avatarPublicId || ''
    }))
    e.target.value = ''
  }

  const handleDeleteAvatar = async () => {
    setAvatarError('')
    setAvatarUploading(true)
    const result = await removeAvatar()
    setAvatarUploading(false)

    if (!result.success) {
      setAvatarError(result.message || 'No se pudo eliminar el avatar')
      return
    }

    const updatedAvatar = result.user?.avatar || ''
    setAvatarPreview(updatedAvatar)
    setFormData(prev => ({
      ...prev,
      avatar: updatedAvatar,
      avatarPublicId: ''
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    updateProfile(user.id, formData)
    setIsEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleCancel = () => {
    // Reset form to current user data
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      document: user?.document || '',
      address: user?.address || '',
      bio: user?.bio || '',
        avatar: user?.avatar || '',
        avatarPublicId: user?.avatarPublicId || ''
    })
    setAvatarPreview(user?.avatar || '')
      setAvatarError('')
    setIsEditing(false)
  }

  const isUrl = avatarPreview?.length > 10
  const myCases = user?.role === 'client' ? cases?.filter(c => c.clientId === user?.id) || [] : cases || []

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mi Perfil</h1>
          <p className="page-subtitle">Gestione su información personal y preferencias.</p>
        </div>
        {!isEditing && (
          <button className="btn btn-primary" onClick={() => setIsEditing(true)} style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
            <User size={18} /> Editar Perfil
          </button>
        )}
      </div>

      {saved && (
        <div style={{
          padding: '0.85rem 1.2rem', marginBottom: '1.5rem', borderRadius: '10px',
          backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#16a34a',
          fontSize: '0.9rem', border: '1px solid rgba(34, 197, 94, 0.25)',
          textAlign: 'center', fontWeight: 600
        }}>✓ Perfil actualizado correctamente</div>
      )}

      {/* Profile View Mode */}
      {!isEditing ? (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Profile Header Card */}
          <div className="card" style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))',
              padding: '2.5rem 2rem 4rem', position: 'relative'
            }}>
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px',
                background: 'var(--surface-0)', borderRadius: '20px 20px 0 0'
              }} />
            </div>
            <div style={{ padding: '0 2rem 2rem', marginTop: '-3.5rem', position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{
                  width: '110px', height: '110px', borderRadius: '50%', border: '4px solid var(--surface-0)',
                  backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '2.5rem', fontWeight: 'bold', overflow: 'hidden', flexShrink: 0,
                  backgroundImage: isUrl ? `url(${avatarPreview})` : 'none',
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
                }}>
                  {!isUrl && (avatarPreview || user?.name?.charAt(0) || 'U')}
                </div>
                <div style={{ paddingBottom: '0.5rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--neutral-900)', margin: 0, lineHeight: 1.2 }}>{user?.name}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
                    <span className={`badge badge--${user?.role === 'admin' ? 'info' : 'success'}`}>
                      {user?.role === 'admin' ? 'Abogado' : 'Cliente'}
                    </span>
                  </div>
                  {user?.bio && <p style={{ fontSize: '0.88rem', color: 'var(--neutral-500)', marginTop: '0.5rem', maxWidth: '500px' }}>{user.bio}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Info Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Contact Info */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--neutral-800)', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} /> Información de Contacto
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--neutral-400)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Correo</span>
                  <p style={{ fontSize: '0.9rem', color: 'var(--neutral-700)', fontWeight: 500, marginTop: '2px' }}>{user?.email || '—'}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--neutral-400)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Teléfono</span>
                  <p style={{ fontSize: '0.9rem', color: 'var(--neutral-700)', fontWeight: 500, marginTop: '2px' }}>{user?.phone || 'No especificado'}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--neutral-400)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Dirección</span>
                  <p style={{ fontSize: '0.9rem', color: 'var(--neutral-700)', fontWeight: 500, marginTop: '2px' }}>{user?.address || 'No especificada'}</p>
                </div>
              </div>
            </div>

            {/* Case/Legal Info */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--neutral-800)', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={16} /> Información Legal
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--neutral-400)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Rol del Sistema</span>
                  <p style={{ fontSize: '0.9rem', color: 'var(--neutral-700)', fontWeight: 500, marginTop: '2px' }}>{user?.role === 'admin' ? 'Abogado / Administrador' : 'Cliente'}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--neutral-400)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Documento de Identidad</span>
                  <p style={{ fontSize: '0.9rem', color: 'var(--neutral-700)', fontWeight: 500, marginTop: '2px' }}>{user?.document || 'No especificado'}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--neutral-400)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Expedientes Asociados</span>
                  <p style={{ fontSize: '0.9rem', color: 'var(--neutral-700)', fontWeight: 500, marginTop: '2px' }}>{myCases.length} expediente(s)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Edit Mode */
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
              <div 
                style={{
                  width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                  fontSize: '3rem', fontWeight: 'bold', overflow: 'hidden', position: 'relative',
                  backgroundImage: isUrl ? `url(${avatarPreview})` : 'none',
                  backgroundSize: 'cover', backgroundPosition: 'center'
                }}
              >
                {!isUrl && (avatarPreview || formData.name.charAt(0))}
                
                <label 
                  style={{
                    position: 'absolute', bottom: 0, width: '100%', height: '35%',
                    backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', cursor: 'pointer', opacity: 0, transition: 'opacity 0.2s',
                    color: 'white'
                  }}
                  className="avatar-overlay"
                >
                  <Camera size={20} />
                  <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                </label>
              </div>
              <style>{`.avatar-overlay:hover { opacity: 1 !important; }`}</style>
              <p style={{ marginTop: '0.5rem', color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                Clic en la imagen para cambiar
              </p>
              {avatarUploading && (
                <p style={{ marginTop: '0.35rem', color: 'var(--primary-700)', fontSize: '0.85rem', fontWeight: 600 }}>
                  Subiendo avatar...
                </p>
              )}
              {avatarError && (
                <p style={{ marginTop: '0.35rem', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600 }}>
                  {avatarError}
                </p>
              )}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleDeleteAvatar}
                disabled={avatarUploading}
                style={{ marginTop: '0.8rem' }}
              >
                Eliminar foto
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label"><User size={16} style={{display: 'inline', marginRight: '5px'}}/> Nombre Completo</label>
                <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label className="form-label"><Mail size={16} style={{display: 'inline', marginRight: '5px'}}/> Correo Electrónico</label>
                <input type="email" className="form-input" value={user?.email || ''} disabled style={{ backgroundColor: '#f3f4f6' }} title="No se puede cambiar el correo" />
              </div>

              <div className="form-group">
                <label className="form-label"><Phone size={16} style={{display: 'inline', marginRight: '5px'}}/> Teléfono</label>
                <input type="text" name="phone" className="form-input" value={formData.phone} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label className="form-label"><FileText size={16} style={{display: 'inline', marginRight: '5px'}}/> Documento de Identidad</label>
                <input type="text" name="document" className="form-input" value={formData.document} onChange={handleChange} />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label"><MapPin size={16} style={{display: 'inline', marginRight: '5px'}}/> Dirección</label>
                <input type="text" name="address" className="form-input" value={formData.address} onChange={handleChange} />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Pequeña biografía o notas importantes</label>
                <textarea name="bio" className="form-input" value={formData.bio} onChange={handleChange} rows="3" placeholder="Información adicional..."></textarea>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
              <button type="button" className="btn btn-secondary" onClick={handleCancel} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <X size={18} /> Cancelar
              </button>
              <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Save size={18} /> Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}


import { X, Trash2, CheckCircle2, Mail, Calendar, FileText, AlertCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import './NotificationCenter.css'

const iconMap = {
  message: Mail,
  appointment: Calendar,
  case: FileText,
  client_created: AlertCircle,
  client_updated: AlertCircle
}

export default function NotificationCenter({ isOpen, onClose, onNavigate }) {
  const { user, notifications, unreadCount, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } = useApp()

  const resolveTargetUrl = (notification) => {
    if (notification.actionUrl) return notification.actionUrl

    if (notification.type === 'message') {
      return user?.role === 'admin' ? '/admin/mensajes' : '/cliente/mensajes'
    }
    if (notification.type === 'appointment') {
      return user?.role === 'admin' ? '/admin/calendario' : '/cliente/citas'
    }
    if (notification.type === 'case') {
      return user?.role === 'admin' ? '/admin/casos' : '/cliente/casos'
    }
    if (notification.type === 'client_created' || notification.type === 'client_updated') {
      return '/admin/clientes'
    }

    return null
  }

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markNotificationAsRead(notification._id)
    }
    const targetUrl = resolveTargetUrl(notification)
    if (targetUrl && onNavigate) {
      onNavigate(targetUrl)
      onClose()
    }
  }

  const getIconComponent = (type) => {
    const IconComponent = iconMap[type] || AlertCircle
    return <IconComponent size={16} />
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date

    // Menos de 1 minuto
    if (diff < 60000) return 'Hace un momento'
    // Menos de 1 hora
    if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`
    // Menos de 1 día
    if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)} horas`
    // Menos de 7 días
    if (diff < 604800000) return `Hace ${Math.floor(diff / 86400000)} días`

    return date.toLocaleDateString('es-ES')
  }

  return (
    <div className={`notification-center ${isOpen ? 'open' : ''}`}>
      {/* Overlay para cerrar */}
      {isOpen && (
        <div className="notification-overlay" onClick={onClose} />
      )}

      <div className="notification-panel">
        {/* Header */}
        <div className="notification-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>Notificaciones</h3>
            {unreadCount > 0 && (
              <span style={{
                backgroundColor: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ color: 'inherit' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="notification-content">
          {notifications.length === 0 ? (
            <div style={{
              padding: '2rem 1rem',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}>
              <p style={{ margin: 0 }}>No tienes notificaciones</p>
            </div>
          ) : (
            <div className="notification-list">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {getIconComponent(notification.type)}
                  </div>

                  <div className="notification-body">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">{formatDate(notification.createdAt)}</div>
                  </div>

                  <div className="notification-actions">
                    {!notification.read && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation()
                          await markNotificationAsRead(notification._id)
                        }}
                        className="btn btn-ghost btn-xs"
                        title="Marcar como leída"
                      >
                        <CheckCircle2 size={16} />
                      </button>
                    )}
                    <button
                      onClick={async (e) => {
                        e.stopPropagation()
                        await deleteNotification(notification._id)
                      }}
                      className="btn btn-ghost btn-xs"
                      title="Eliminar"
                      style={{ color: '#ef4444' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="notification-footer">
            <button
              onClick={markAllNotificationsAsRead}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1 }}
            >
              Marcar todas como leídas
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

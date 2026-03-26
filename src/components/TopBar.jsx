import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Menu, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import NotificationBell from './NotificationBell'
import NotificationCenter from './NotificationCenter'
import './TopBar.css'

export default function TopBar({ onMenuToggle }) {
  const { user } = useApp()
  const navigate = useNavigate()
  const [showNotifications, setShowNotifications] = useState(false)

  const handleProfileClick = () => {
    if (user?.role === 'admin') navigate('/admin/perfil')
    else navigate('/cliente/perfil')
  }

  const handleNotificationNavigate = (url) => {
    navigate(url)
  }

  // Si tiene un avatar largo (URL), muéstralo. Si no, usa la letra.
  const isUrl = user?.avatar?.length > 10

  return (
    <>
      <header className="topbar" id="topbar">
        <button className="topbar-menu-btn" onClick={onMenuToggle} aria-label="Menú">
          <Menu size={22} />
        </button>

        <div className="topbar-search">
          <Search size={18} className="topbar-search-icon" />
          <input
            type="text"
            className="topbar-search-input"
            placeholder="Buscar casos, documentos..."
          />
        </div>

        <div className="topbar-actions">
          <NotificationBell onClick={() => setShowNotifications(!showNotifications)} />

          <div className="topbar-user" onClick={handleProfileClick} style={{cursor: 'pointer'}}>
            <div className="topbar-avatar" style={isUrl ? { backgroundImage: `url(${user.avatar})`, backgroundSize: 'cover', color: 'transparent' } : {}}>
              {!isUrl && (user?.avatar || user?.name?.[0]?.toUpperCase() || 'U')}
            </div>
            <div className="topbar-user-info">
              <span className="topbar-user-name">{user?.name || 'Usuario'}</span>
              <span className="topbar-user-role">
                {user?.role === 'admin' ? 'Abogado' : 'Cliente'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onNavigate={handleNotificationNavigate}
      />
    </>
  )
}

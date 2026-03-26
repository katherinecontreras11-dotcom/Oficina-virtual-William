import { NavLink } from 'react-router-dom'
import { useApp } from '../context/useApp'
import {
  LayoutDashboard, Briefcase, FileText, CalendarDays,
  MessageSquare, Users, ChevronLeft, ChevronRight, LogOut, User
} from 'lucide-react'
import BrandLogo from './BrandLogo'
import './Sidebar.css'

const clientLinks = [
  { to: '/cliente', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/cliente/casos', icon: Briefcase, label: 'Mis Casos' },
  { to: '/cliente/documentos', icon: FileText, label: 'Documentos' },
  { to: '/cliente/citas', icon: CalendarDays, label: 'Citas' },
  { to: '/cliente/mensajes', icon: MessageSquare, label: 'Mensajes' },
  { to: '/cliente/perfil', icon: User, label: 'Mi Perfil' },
]

const adminLinks = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/clientes', icon: Users, label: 'Clientes' },
  { to: '/admin/casos', icon: Briefcase, label: 'Expedientes' },
  { to: '/admin/calendario', icon: CalendarDays, label: 'Calendario' },
  { to: '/admin/mensajes', icon: MessageSquare, label: 'Mensajes' },
  { to: '/admin/perfil', icon: User, label: 'Mi Perfil' },
]

export default function Sidebar({ role, isOpen, onToggle }) {
  const { logout } = useApp()
  const links = role === 'admin' ? adminLinks : clientLinks

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onToggle} />
      <aside className={`sidebar ${isOpen ? 'open' : 'collapsed'}`} id="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-logo-icon">
              <BrandLogo className="sidebar-logo-img" alt="Logo Wil Law Firm" />
            </div>
            {isOpen && <span className="sidebar-brand-text">Wil Law Firm</span>}
          </div>
          <button className="sidebar-toggle" onClick={onToggle} aria-label="Toggle sidebar">
            {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              title={link.label}
            >
              <link.icon size={20} />
              {isOpen && <span>{link.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-link sidebar-logout" onClick={logout} title="Cerrar sesión">
            <LogOut size={20} />
            {isOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>
    </>
  )
}


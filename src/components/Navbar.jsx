import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import BrandLogo from './BrandLogo'
import './Navbar.css'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const links = [
    { to: '/', label: 'Inicio' },
    { to: '/#servicios', label: 'Servicios' },
    { to: '/#nosotros', label: 'Nosotros' },
    { to: '/#contacto', label: 'Contacto' },
  ]

  return (
    <nav className="navbar" id="main-navbar">
      {menuOpen && (
        <div 
          className="navbar-overlay" 
          onClick={() => setMenuOpen(false)}
        />
      )}
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand">
          <div className="navbar-logo">
            <BrandLogo className="navbar-logo-img" alt="Logo Wil Law Firm" />
          </div>
          <span className="navbar-title">Wil Law Firm</span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'active' : ''}`}>
          {links.map(link => (
            <a
              key={link.to}
              href={link.to}
              className={`navbar-link ${location.pathname === link.to ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Link to="/login" className="btn btn-primary btn-sm navbar-cta" onClick={() => setMenuOpen(false)}>
            Acceder
          </Link>
        </div>

        <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menú">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  )
}

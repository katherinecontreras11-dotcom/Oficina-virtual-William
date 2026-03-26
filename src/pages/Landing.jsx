import { Link } from 'react-router-dom'
import {
  Shield, FileText, Users, ArrowRight,
  Briefcase, Clock, Globe, MessageCircle
} from 'lucide-react'
import BrandLogo from '../components/BrandLogo'
import './Landing.css'

const services = [
  { icon: Briefcase, title: 'Derecho Civil', desc: 'Contratos, herencias, bienes raíces y procesos civiles con asesoría especializada.' },
  { icon: Shield, title: 'Derecho Penal', desc: 'Defensa legal integral ante cualquier proceso penal, protegiendo sus derechos.' },
  { icon: Users, title: 'Derecho Laboral', desc: 'Representación en conflictos laborales, despidos y derechos del trabajador.' },
  { icon: FileText, title: 'Asesoría Legal', desc: 'Consultas y revisión de documentos legales para personas y empresas.' },
]

const features = [
  { icon: Globe, title: 'Acceso desde Cualquier Lugar', desc: 'Gestione sus casos desde su PC, tablet o celular, las 24 horas.' },
  { icon: Clock, title: 'Seguimiento en Tiempo Real', desc: 'Manténgase informado sobre el progreso de cada uno de sus expedientes.' },
  { icon: Shield, title: 'Seguridad Garantizada', desc: 'Documentos protegidos con cifrado avanzado y acceso autenticado.' },
  { icon: MessageCircle, title: 'Comunicación Directa', desc: 'Canal privado de mensajería con su abogado asignado.' },
]

const stats = [
  { number: '500+', label: 'Casos Resueltos' },
  { number: '98%', label: 'Satisfacción' },
  { number: '15+', label: 'Años de Experiencia' },
  { number: '24/7', label: 'Disponibilidad' },
]

export default function Landing() {
  return (
    <div className="landing">
      {/* HERO */}
      <section className="hero" id="inicio">
        <div className="hero-bg" />
        <div className="container hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <BrandLogo className="hero-badge-logo" alt="Logo Wil Law Firm" />
              <span>Oficina Virtual Jurídica</span>
            </div>
            <h1 className="hero-title">
              Justicia al alcance de <span className="hero-highlight">TODOS</span>
            </h1>
            <p className="hero-subtitle">
              Gestione sus trámites legales de forma segura, transparente y profesional
              desde cualquier dispositivo. Su equipo legal, siempre disponible.
            </p>
            <div className="hero-actions">
              <Link to="/login" className="btn btn-accent">
                Comenzar Ahora <ArrowRight size={18} />
              </Link>
              <a href="#servicios" className="btn btn-secondary">
                Ver Servicios
              </a>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-card hero-card-1 card">
              <div className="hero-card-icon"><Briefcase size={20} /></div>
              <div>
                <div className="hero-card-title">Caso #2024-0847</div>
                <div className="hero-card-meta">Derecho Civil • En progreso</div>
              </div>
              <span className="badge badge--warning">En Curso</span>
            </div>
            <div className="hero-card hero-card-2 card">
              <div className="hero-card-icon success"><Shield size={20} /></div>
              <div>
                <div className="hero-card-title">Caso #2024-0612</div>
                <div className="hero-card-meta">Derecho Laboral • Resuelto</div>
              </div>
              <span className="badge badge--success">Resuelto</span>
            </div>
            <div className="hero-card hero-card-3 card">
              <div className="hero-card-icon info"><FileText size={20} /></div>
              <div>
                <div className="hero-card-title">3 documentos nuevos</div>
                <div className="hero-card-meta">Subidos hoy a las 14:30</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats-section">
        <div className="container stats-grid">
          {stats.map(s => (
            <div className="stat-item" key={s.label}>
              <span className="stat-number">{s.number}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="section" id="servicios">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Nuestros Servicios</span>
            <h2 className="section-title">Áreas de Práctica Legal</h2>
            <p className="section-desc">
              Contamos con un equipo de abogados especializados en diversas ramas del derecho
              para brindarle la representación que necesita.
            </p>
          </div>
          <div className="services-grid">
            {services.map(s => (
              <div className="service-card card" key={s.title}>
                <div className="service-icon"><s.icon size={24} /></div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section section-alt" id="nosotros">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">¿Por qué Elegirnos?</span>
            <h2 className="section-title">Oficina Legal, Modernizada</h2>
            <p className="section-desc">
              Combinamos la experiencia jurídica con la tecnología para ofrecer
              un servicio legal accesible y eficiente.
            </p>
          </div>
          <div className="features-grid">
            {features.map((f, i) => (
              <div className="feature-item" key={f.title} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="feature-icon"><f.icon size={22} /></div>
                <div>
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container cta-content">
          <h2>¿Necesita asesoría legal?</h2>
          <p>Contáctenos hoy y acceda a todas las herramientas de la oficina virtual.</p>
          <Link to="/login" className="btn btn-accent">
            Acceder a la Plataforma <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/useApp'
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import BrandLogo from '../components/BrandLogo'
import './Login.css'

const WHATSAPP_LINK = 'https://wa.me/51925651248';

export default function Login() {
  const { login } = useApp()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const foundUser = await login(form.email, form.password)
      if (foundUser) {
        navigate(foundUser.role === 'admin' ? '/admin' : '/cliente')
      } else {
        setError('Credenciales incorrectas. Verifique el correo y la contraseña.')
      }
    } catch (err) {
      const message = err?.message || ''
      const isConnectionError = /Failed to fetch|NetworkError|ERR_CONNECTION_REFUSED|Load failed/i.test(message)
      const isCredentialsError = /credenciales|invalid|401|403/i.test(message)

      if (isConnectionError) {
        setError('No se pudo conectar con el servidor. Verifique que el backend este activo.')
      } else if (isCredentialsError) {
        setError('Credenciales incorrectas. Verifique el correo y la contraseña.')
      } else {
        setError('Ocurrio un error al iniciar sesion. Intente nuevamente.')
      }
    }
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-left-content">
          <div className="login-left-logo">
            <BrandLogo className="login-left-logo-img" alt="Logo Wil Law Firm" />
          </div>
          <h2>Bienvenido a Wil Law Firm</h2>
          <p>Su oficina legal virtual. Acceda a sus casos, documentos y comunicación directa con su equipo de abogados.</p>
          <div className="login-left-features">
            <div className="login-feature">
              <span className="login-feature-dot" />
              Acceso seguro las 24 horas
            </div>
            <div className="login-feature">
              <span className="login-feature-dot" />
              Seguimiento de casos en tiempo real
            </div>
            <div className="login-feature">
              <span className="login-feature-dot" />
              Documentos cifrados y protegidos
            </div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-form-wrapper">
          <div className="login-form-header">
            <h3>Iniciar Sesión</h3>
            <p>Ingrese las credenciales que su abogado le proporcionó</p>
          </div>

          {error && (
            <div style={{
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#dc2626',
              fontSize: '0.875rem',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              {error}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Correo Electrónico</label>
              <div className="input-icon-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  className="form-input form-input-icon"
                  placeholder="correo@ejemplo.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Contraseña</label>
              <div className="input-icon-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input form-input-icon"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="input-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="login-extras">
              <label className="login-remember">
                <input type="checkbox" /> Recordarme
              </label>
              <a href="#" className="login-forgot">¿Olvidó su contraseña?</a>
            </div>

            <button type="submit" className="btn btn-primary login-submit">
              Ingresar <ArrowRight size={18} />
            </button>
          </form>

          <p className="login-switch">
            ¿No tiene cuenta?
            <button 
              type="button"
              onClick={() => {
                window.open(WHATSAPP_LINK, '_blank')
              }}
            >
              {' '}Contacte al abogado por WhatsApp
            </button>
          </p>

        </div>
      </div>
    </div>
  )
}


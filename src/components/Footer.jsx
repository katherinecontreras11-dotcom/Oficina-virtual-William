import { Mail, Phone, MapPin } from 'lucide-react'
import BrandLogo from './BrandLogo'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer" id="contacto">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <BrandLogo className="footer-logo-img" alt="Logo Wil Law Firm" />
              <span>Wil Law Firm</span>
            </div>
            <p className="footer-desc">
              Su oficina legal virtual de confianza. Gestión profesional, transparente y accesible desde cualquier dispositivo.
            </p>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Servicios</h4>
            <ul>
              <li><a href="#servicios">Derecho Civil</a></li>
              <li><a href="#servicios">Derecho Laboral</a></li>
              <li><a href="#servicios">Derecho Penal</a></li>
              <li><a href="#servicios">Asesorías</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Contacto</h4>
            <ul className="footer-contact">
              <li><Mail size={16} /> lipwone@gmail.com </li>
              <li><Phone size={16} /> +51 925 651 248 </li>
              <li><MapPin size={16} /> Jr. Mariscal Cáceres N° 1177 - Huamanga, Ayacucho </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Wil Law Firm. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

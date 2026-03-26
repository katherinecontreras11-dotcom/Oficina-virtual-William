import { useEffect } from 'react'
import { X, AlertCircle } from 'lucide-react'
import './Toast.css'

export default function Toast({ message, type = 'info', onClose, autoClose = true }) {
  // Auto-close después de 4 segundos si está habilitado
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, 4000)
      return () => clearTimeout(timer)
    }
  }, [autoClose, onClose])

  const bgColor = {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6'
  }[type] || '#3b82f6'

  return (
    <div className={`toast toast-${type}`} style={{ borderLeftColor: bgColor }}>
      <AlertCircle size={20} style={{ color: bgColor }} />
      <span>{message}</span>
      <button onClick={onClose} className="toast-close">
        <X size={16} />
      </button>
    </div>
  )
}

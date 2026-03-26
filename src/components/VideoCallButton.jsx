import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Video, Loader } from 'lucide-react'
import { canUserStartCall, getCallStatus } from '../utils/videoCallHelpers'
import './VideoCallButton.css'

export default function VideoCallButton({ appointment }) {
  const { user, startCall, joinCall } = useApp()
  const navigate = useNavigate()

  if (!appointment || !user) return null

  // Obtener estado de la llamada
  const status = getCallStatus(appointment, user)
  const canStart = canUserStartCall(appointment, user)
  const isInCall = appointment.joinedUsers?.includes(user.id)

  // Determinar el handler
  const handleClick = () => {
    // Si no estás en la llamada pero está en progreso, unirse
    if (status === 'in-progress' && !isInCall) {
      joinCall(appointment.id, user.id)
    }
    
    // Si estás disponible, iniciar
    if (status === 'available' && !appointment.callActive) {
      startCall(appointment.id)
      joinCall(appointment.id, user.id)
    }
    
    // Siempre navegar si es posible
    if ((status === 'available' || status === 'in-progress') && appointment.roomName) {
      navigate(`/video-call/${appointment.roomName}`)
    }
  }

  // Determinar propiedades del botón según estado
  const getButtonProps = () => {
    switch (status) {
      case 'available':
        return {
          label: '📹 Iniciar Llamada',
          buttonClass: 'btn-video-available',
          disabled: false,
          title: 'Haz clic para iniciar la videollamada'
        }
      case 'in-progress':
        return {
          label: isInCall ? '📹 Volver a Llamada' : '📹 Unirse a Llamada',
          buttonClass: isInCall ? 'btn-video-active' : 'btn-video-joining',
          disabled: false,
          title: isInCall ? 'Click para volver a la videollamada' : 'Haz clic para unirte a la videollamada'
        }
      case 'locked':
        return {
          label: '🔒 Cita no confirmada',
          buttonClass: 'btn-video-disabled',
          disabled: true,
          title: 'La cita debe estar confirmada para iniciar videollamada',
          tooltipText: 'Espera confirmación del abogado'
        }
      case 'expired':
        return {
          label: '⏱️ Fuera de horario',
          buttonClass: 'btn-video-disabled',
          disabled: true,
          title: 'Ventana de videollamada cerrada (±5-15 min)',
          tooltipText: 'Cita bajo o ha terminado'
        }
      default:
        return {
          label: '📹 Videollamada',
          buttonClass: 'btn-video-disabled',
          disabled: true,
          title: 'No disponible'
        }
    }
  }

  const props = getButtonProps()

  return (
    <div className="video-call-button-container" title={props.title}>
      <button
        className={`btn btn-sm ${props.buttonClass}`}
        onClick={handleClick}
        disabled={props.disabled}
      >
        {status === 'in-progress' && isInCall && <Loader size={14} className="animate-spin" />}
        {status !== 'in-progress' || !isInCall ? <Video size={14} /> : null}
        {props.label}
      </button>
      {props.tooltipText && !props.disabled && (
        <div className="video-tooltip">{props.tooltipText}</div>
      )}
    </div>
  )
}

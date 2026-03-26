import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { PhoneOff, Video, Clock, User } from 'lucide-react'
import { getOtherParticipant } from '../utils/videoCallHelpers'
import './VideoCall.css'

export default function VideoCall() {
  const { roomName } = useParams()
  const navigate = useNavigate()
  const { user, appointments, users, endCall } = useApp()
  const jitsiContainerRef = useRef(null)
  const apiRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)
  const [callDuration, setCallDuration] = useState(0)

  const appointment = appointments.find(a => a.roomName === roomName)
  const isAdmin = user?.role === 'admin'
  const otherParticipant = getOtherParticipant(appointment, user, users)

  useEffect(() => {
    if (!jitsiContainerRef.current || !roomName || !user) return

    // Clean up previous instance
    if (apiRef.current) {
      apiRef.current.dispose()
      apiRef.current = null
    }

    const domain = 'meet.jit.si'
    const options = {
      roomName: `wiL_${roomName}`,
      parentNode: jitsiContainerRef.current,
      width: '100%',
      height: '100%',
      userInfo: {
        displayName: user.name,
        email: user.email
      },
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        disableDeepLinking: true,
        prejoinPageEnabled: false,
        toolbarButtons: [
          'microphone', 'camera', 'desktop', 'fullscreen',
          'hangup', 'chat', 'raisehand', 'tileview',
          'toggle-camera', 'settings'
        ]
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: false,
        TOOLBAR_ALWAYS_VISIBLE: true,
        DEFAULT_BACKGROUND: '#0f172a',
        DISABLE_PRESENCE_STATUS: false,
        DISABLE_JOIN_LEAVE_NOTIFICATIONS: false
      }
    }

    try {
      const api = new window.JitsiMeetExternalAPI(domain, options)
      apiRef.current = api

      api.addEventListener('videoConferenceJoined', () => {
        setIsConnected(true)
      })

      api.addEventListener('readyToClose', () => {
        handleEndCall()
      })
    } catch (err) {
      console.error('Error initializing Jitsi:', err)
    }

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose()
        apiRef.current = null
      }
    }
  }, [roomName, user])

  // Contador de duración de llamada
  useEffect(() => {
    if (!isConnected) return
    
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isConnected])

  const handleEndCall = () => {
    if (apiRef.current) {
      apiRef.current.dispose()
      apiRef.current = null
    }
    // Only admin ends the call for everyone
    if (isAdmin && appointment) {
      endCall(appointment.id)
    }
    navigate(isAdmin ? '/admin/calendario' : '/cliente/citas')
  }

  if (!appointment) {
    return (
      <div className="videocall-page" style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{textAlign: 'center', color: '#94a3b8'}}>
          <Video size={48} />
          <h2 style={{color: '#f1f5f9', margin: '1rem 0 0.5rem'}}>Sala no encontrada</h2>
          <p>La videollamada no existe o ya ha terminado.</p>
          <button className="videocall-end-btn" style={{marginTop: '1rem', background: '#6366f1'}} onClick={() => navigate(isAdmin ? '/admin/calendario' : '/cliente/citas')}>
            Volver
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="videocall-page">
      <div className="videocall-header">
        <div className="videocall-header-left">
          <Video size={20} style={{color: '#6366f1'}} />
          <div>
            <h2>Videollamada {appointment.caseId ? `• ${appointment.caseId}` : ''}</h2>
            <span className="videocall-meta">
              {appointment.date} — {appointment.time}
              {isConnected && ` • Duración: ${Math.floor(callDuration / 60)}:${String(callDuration % 60).padStart(2, '0')}`}
            </span>
            {otherParticipant && (
              <span className="videocall-participant">
                <User size={12} /> Con: {otherParticipant.name}
              </span>
            )}
          </div>
          {isConnected && <span className="videocall-live-badge">EN VIVO</span>}
        </div>
        <button className="videocall-end-btn" onClick={handleEndCall}>
          <PhoneOff size={16} /> Finalizar
        </button>
      </div>

      <div className="videocall-container" ref={jitsiContainerRef} />
    </div>
  )
}

/**
 * Convierte formato de hora de 12h a 24h
 * Ej: "10:30 AM" → "10:30", "2:00 PM" → "14:00"
 */
function convertTo24Hour(timeStr) {
  const [time, period] = timeStr.split(' ')
  let [hours, minutes] = time.split(':').map(Number)
  
  if (period === 'PM' && hours !== 12) hours += 12
  if (period === 'AM' && hours === 12) hours = 0
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

/**
 * Convierte "22 Mar 2026" + "10:00 AM" a objeto Date
 */
export function formatAppointmentTime(dateString, timeString) {
  try {
    // Parse date: "22 Mar 2026"
    const dateObj = new Date(dateString + ' 2026')
    if (isNaN(dateObj.getTime())) return null

    // Convertir hora a 24h
    const time24 = convertTo24Hour(timeString)
    const [hours, minutes] = time24.split(':').map(Number)

    dateObj.setHours(hours, minutes, 0, 0)
    return dateObj
  } catch (e) {
    console.error('Error formatting appointment time:', e)
    return null
  }
}

/**
 * Valida si la cita está en ventana temporal para videollamada
 * Ventana: 5 min antes a 15 min después de la hora programada
 */
export function isWithinCallWindow(appointmentDate, appointmentTime) {
  const appointmentDateTime = formatAppointmentTime(appointmentDate, appointmentTime)
  if (!appointmentDateTime) return false

  const now = new Date()
  const minutesBefore = 5
  const minutesAfter = 15

  const windowStart = new Date(appointmentDateTime.getTime() - minutesBefore * 60000)
  const windowEnd = new Date(appointmentDateTime.getTime() + minutesAfter * 60000)

  return now >= windowStart && now <= windowEnd
}

/**
 * Retorna minutos faltantes hasta la cita
 * Negativo si la cita ya pasó
 */
export function getTimeUntilCall(appointmentDate, appointmentTime) {
  const appointmentDateTime = formatAppointmentTime(appointmentDate, appointmentTime)
  if (!appointmentDateTime) return null

  const now = new Date()
  const diffMs = appointmentDateTime - now
  return Math.floor(diffMs / 60000) // convertir a minutos
}

/**
 * Valida si un usuario puede iniciar la videollamada
 * Condiciones:
 * - Cita debe estar "Confirmada"
 * - Usuario debe ser abogado (lawyerId) o cliente (clientId) de la cita
 * - Debe estar dentro de ventana temporal
 */
export function canUserStartCall(appointment, user) {
  if (!appointment || !user) return false

  // Validar status
  if (appointment.status !== 'Confirmada') return false

  // Validar que usuario es parte de la cita
  const isLawyer = user.role === 'admin' && user.id === appointment.lawyerId
  const isClient = user.role === 'client' && user.id === appointment.clientId

  if (!isLawyer && !isClient) return false

  // Validar ventana temporal
  return isWithinCallWindow(appointment.date, appointment.time)
}

/**
 * Retorna estado actual de la videollamada
 * Estados posibles: 'available', 'in-progress', 'expired', 'locked'
 */
export function getCallStatus(appointment, user) {
  if (!appointment) return 'expired'

  // Si cita no confirmada → locked
  if (appointment.status !== 'Confirmada') return 'locked'

  // Si ya hay videollamada en curso → in-progress
  if (appointment.callActive) return 'in-progress'

  // Si esté dentro de ventana → available
  if (isWithinCallWindow(appointment.date, appointment.time)) return 'available'

  // Si pasó la ventana → expired
  return 'expired'
}

/**
 * Retorna el nombre del otro participante en la videollamada
 */
export function getOtherParticipant(appointment, currentUser, allUsers) {
  if (!appointment || !currentUser) return null

  const isLawyer = currentUser.id === appointment.lawyerId
  const targetUserId = isLawyer ? appointment.clientId : appointment.lawyerId

  return allUsers.find(u => u.id === targetUserId)
}

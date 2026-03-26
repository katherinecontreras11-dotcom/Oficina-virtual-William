// Utilidad para debugging de citas
export function debugAppointmentSync() {
  // Verificar qué hay en localStorage
  const localStorageData = localStorage.getItem('lex_appointments')
  const parsedLS = localStorageData ? JSON.parse(localStorageData) : []
  
  console.log('[AppointmentDebug] localStorage check:', {
    hasData: !!localStorageData,
    count: parsedLS.length,
    appointments: parsedLS.map(a => ({
      id: a.id,
      clientId: a.clientId,
      clientIdType: typeof a.clientId,
      date: a.date,
      time: a.time
    }))
  })
  
  return parsedLS
}

export function debugFilterMatch(appointments, userId) {
  console.log('[AppointmentDebug] Filter check:', {
    userId,
    userIdType: typeof userId,
    totalAppointments: appointments.length,
    matching: appointments.filter(a => Number(a.clientId) === Number(userId)).length,
    details: appointments.map(a => ({
      id: a.id,
      clientId: a.clientId,
      clientIdType: typeof a.clientId,
      matches: Number(a.clientId) === Number(userId)
    }))
  })
}

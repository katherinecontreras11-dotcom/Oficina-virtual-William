// ⭐ GLOBAL IN-MEMORY STORE
// Sincroniza con servidor Vite para funcionamiento entre navegadores
// Funciona incluso entre navegadores diferentes del mismo dominio

const GLOBAL_KEY = 'wil_global_appointments'
const BROADCAST_CHANNEL = 'wil_appointments_sync'
const SERVER_API = `${window.location.origin}/api/appointments` // Detecta puerto automáticamente

let inMemoryAppointments = []
let lastStorageHash = ''
let broadcastChannel = null
let pollingInterval = null

// Listeners para cambios
let listeners = []

export const subscribeToAppointments = (callback) => {
  listeners.push(callback)
  return () => {
    listeners = listeners.filter(l => l !== callback)
  }
}

const notifyListeners = () => {
  listeners.forEach(listener => listener(inMemoryAppointments))
}

// ⭐ SERVIDOR API - Sincroniza con servidor central
const syncWithServer = async () => {
  try {
    const response = await fetch(SERVER_API)
    if (response.ok) {
      const data = await response.json()
      const serverAppointments = data.appointments.map(a => ({
        ...a,
        clientId: Number(a.clientId)
      }))
      console.log('[GlobalStore] Synced with server:', serverAppointments.length, 'appointments')
      inMemoryAppointments = serverAppointments
      persistToLocalStorage()
      notifyListeners()
    }
  } catch (e) {
    console.error('[GlobalStore] Error syncing with server:', e)
  }
}

export const initializeGlobalStore = () => {
  try {
    const saved = localStorage.getItem(GLOBAL_KEY)
    if (saved) {
      inMemoryAppointments = JSON.parse(saved).map(a => ({
        ...a,
        clientId: Number(a.clientId)
      }))
      lastStorageHash = saved
      console.log('[GlobalStore] Initialized from localStorage:', inMemoryAppointments.length, 'appointments')
    } else {
      console.log('[GlobalStore] No saved appointments, starting with empty store')
      lastStorageHash = ''
    }
  } catch (e) {
    console.error('[GlobalStore] Error initializing:', e)
  }

  // Sincronizar con servidor apenas se inicializa
  syncWithServer()
}

export const getAppointmentsFromStore = () => {
  return [...inMemoryAppointments]
}

export const addAppointmentToStore = async (appointment) => {
  const normalized = {
    ...appointment,
    clientId: Number(appointment.clientId)
  }
  try {
    const response = await fetch(SERVER_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(normalized)
    })
    if (response.ok) {
      inMemoryAppointments.push(normalized)
      console.log('[GlobalStore] ✅ Added appointment (synced with server):', normalized.id)
      persistToLocalStorage()
      broadcastToOtherBrowsers('ADD_APPOINTMENT', normalized)
      notifyListeners()
    }
  } catch (e) {
    console.error('[GlobalStore] Error adding appointment:', e)
    // Fallback: agregar localmente si el servidor falla
    inMemoryAppointments.push(normalized)
    persistToLocalStorage()
    notifyListeners()
  }
}

export const updateAppointmentInStore = async (id, updatedData) => {
  try {
    const response = await fetch(`${SERVER_API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    })
    if (response.ok) {
      inMemoryAppointments = inMemoryAppointments.map(a => 
        a.id === id ? { ...a, ...updatedData, clientId: Number(a.clientId) } : a
      )
      console.log('[GlobalStore] ✅ Updated appointment (synced with server):', id)
      persistToLocalStorage()
      broadcastToOtherBrowsers('UPDATE_APPOINTMENT', { id, updatedData })
      notifyListeners()
    }
  } catch (e) {
    console.error('[GlobalStore] Error updating appointment:', e)
  }
}

export const deleteAppointmentFromStore = async (id) => {
  try {
    const response = await fetch(`${SERVER_API}/${id}`, {
      method: 'DELETE'
    })
    if (response.ok) {
      inMemoryAppointments = inMemoryAppointments.filter(a => a.id !== id)
      console.log('[GlobalStore] ✅ Deleted appointment (synced with server):', id)
      persistToLocalStorage()
      broadcastToOtherBrowsers('DELETE_APPOINTMENT', { id })
      notifyListeners()
    }
  } catch (e) {
    console.error('[GlobalStore] Error deleting appointment:', e)
  }
}

const persistToLocalStorage = () => {
  try {
    localStorage.setItem(GLOBAL_KEY, JSON.stringify(inMemoryAppointments))
  } catch (e) {
    console.error('[GlobalStore] Error persisting to localStorage:', e)
  }
}

// ⭐ BroadcastChannel API - Sincroniza entre navegadores del mismo dominio
const broadcastToOtherBrowsers = (action, data) => {
  try {
    if (broadcastChannel) {
      broadcastChannel.postMessage({ action, data, timestamp: Date.now() })
      console.log('[GlobalStore] 📡 Broadcast sent:', action)
    }
  } catch (e) {
    console.error('[GlobalStore] Broadcast error:', e)
  }
}

const handleBroadcastMessage = (event) => {
  try {
    const { action, data } = event.data
    console.log('[GlobalStore] 📡 Received broadcast:', action, data)
    
    switch (action) {
      case 'ADD_APPOINTMENT':
        if (!inMemoryAppointments.find(a => a.id === data.id)) {
          inMemoryAppointments.push(data)
          console.log('[GlobalStore] ✅ Added appointment from broadcast:', data.id)
          persistToLocalStorage()
          notifyListeners()
        }
        break
      case 'UPDATE_APPOINTMENT':
        inMemoryAppointments = inMemoryAppointments.map(a => 
          a.id === data.id ? { ...a, ...data.updatedData } : a
        )
        console.log('[GlobalStore] ✅ Updated appointment from broadcast:', data.id)
        persistToLocalStorage()
        notifyListeners()
        break
      case 'DELETE_APPOINTMENT':
        inMemoryAppointments = inMemoryAppointments.filter(a => a.id !== data.id)
        console.log('[GlobalStore] ✅ Deleted appointment from broadcast:', data.id)
        persistToLocalStorage()
        notifyListeners()
        break
      default:
        break
    }
  } catch (err) {
    console.error('[GlobalStore] Error handling broadcast:', err)
  }
}

// Escuchar cambios de storage desde otras pestañas Y verificar regularmente servidor
export const initStorageListener = () => {
  // Method 1: BroadcastChannel para comunicación entre navegadores (mismo navegador)
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL)
      broadcastChannel.onmessage = handleBroadcastMessage
      console.log('[GlobalStore] ⭐ BroadcastChannel initialized - ready for same-browser sync')
    }
  } catch (e) {
    console.warn('[GlobalStore] BroadcastChannel not supported:', e)
  }

  // Method 2: Event listener para otros navegadores/pestañas
  window.addEventListener('storage', (e) => {
    if (e.key === GLOBAL_KEY && e.newValue) {
      try {
        inMemoryAppointments = JSON.parse(e.newValue).map(a => ({
          ...a,
          clientId: Number(a.clientId)
        }))
        console.log('[GlobalStore] Storage event detected, reloaded:', inMemoryAppointments.length, 'appointments')
        notifyListeners()
      } catch (err) {
        console.error('[GlobalStore] Error processing storage event:', err)
      }
    }
  })
  
  // Method 3: Polling del servidor (cada 1000ms) para sincronización cross-browser
  // ⭐ Este es el método principal para sincronizar Chrome ↔ Edge
  pollingInterval = setInterval(async () => {
    try {
      const response = await fetch(SERVER_API)
      if (response.ok) {
        const data = await response.json()
        const serverAppointments = data.appointments.map(a => ({
          ...a,
          clientId: Number(a.clientId)
        }))
        
        // Detectar si cambió el servidor
        const currentHash = JSON.stringify(inMemoryAppointments)
        const serverHash = JSON.stringify(serverAppointments)
        
        if (currentHash !== serverHash) {
          console.log('[GlobalStore] 🔄 Server change detected - syncing', serverAppointments.length, 'appointments')
          inMemoryAppointments = serverAppointments
          persistToLocalStorage()
          notifyListeners()
        }
      }
    } catch (e) {
      console.error('[GlobalStore] Polling error:', e)
    }
  }, 1000) // Sincronizar cada 1 segundo del servidor
  
  console.log('[GlobalStore] ✅ All sync methods initialized (BroadcastChannel + storage events + server polling)')
}

export const stopPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval)
    console.log('[GlobalStore] Polling stopped')
  }
}

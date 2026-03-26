import { useState, useEffect, useRef } from 'react'
import { 
  initializeGlobalStore, 
  getAppointmentsFromStore, 
  addAppointmentToStore, 
  updateAppointmentInStore, 
  deleteAppointmentFromStore,
  subscribeToAppointments,
  initStorageListener
} from './globalStore'
import {
  loginAPI,
  getUsersAPI,
  createUserAPI,
  updateUserAPI,
  deleteUserAPI,
  getAppointmentsAPI,
  createAppointmentAPI,
  updateAppointmentAPI,
  deleteAppointmentAPI,
  getConversationsAPI,
  getMessagesAPI,
  sendMessageAPI,
  editMessageAPI,
  deleteMessageAPI,
  getNotificationsAPI,
  markNotificationReadAPI,
  markAllNotificationsReadAPI,
  deleteNotificationAPI,
  getCasesAPI,
  getCaseAPI,
  createCaseAPI,
  updateCaseAPI,
  deleteCaseAPI,
  uploadPDFAPI,
  addClientCaseDocumentAPI,
  addLawyerCaseDocumentAPI,
  deleteClientCaseDocumentAPI,
  deleteLawyerCaseDocumentAPI,
  setAuthToken,
  getAuthToken
} from '../services/apiService'
import { AppContext } from './appContextInstance'

// ⭐ GLOBAL APPOINTMENTS STORE - Compartido entre todos los usuarios/navegadores
// Esto actúa como una "base de datos" compartida en localStorage


const initialDB = {
  users: [
    { id: 1, role: 'admin', email: 'admin@lex.com', password: 'Admin2026', name: 'Lic. Rodríguez', phone: '+1 555-0000', avatar: 'R', bio: 'Abogado Senior especialista en derecho corporativo.', document: '', address: '' },
    { id: 2, role: 'client', email: 'cliente@wil.com', password: 'Cliente2026', name: 'Carlos Hernández', phone: '+1 555-1234', avatar: 'C', bio: 'Cliente de Wil Law Firm', document: '', address: '' }
  ],
  cases: [
    { id: 'EXP-2026-0001', title: 'Demanda Laboral', clientId: 2, status: 'Activo', priority: 'Alta', progress: 0, date: '23 Mar 2026', description: 'Revisión de liquidación y prestaciones', clientDocuments: [], lawyerDocuments: [] }
  ],
  tasks: [],
  appointments: [],
  conversations: [
    { id: 1, lawyerId: 1, clientId: 2, time: '', unreadClient: 0, unreadLawyer: 0 }
  ],
  messages: {
    1: []
  },
  documents: []
}

export function AppProvider({ children }) {
  // ⭐ PERSISTENCIA EN LOCALSTORAGE
  const AUTH_USER_STORAGE_KEY = 'wil_auth_user'
  const USERS_STORAGE_KEY = 'wil_users_db'
  const CONVERSATIONS_STORAGE_KEY = 'wil_conversations_db'
  const MESSAGES_STORAGE_KEY = 'wil_messages_db'

  const loadAuthUserFromStorage = () => {
    try {
      const storedUser = localStorage.getItem(AUTH_USER_STORAGE_KEY)
      return storedUser ? JSON.parse(storedUser) : null
    } catch (e) {
      console.error('[AppContext] Error loading auth user:', e)
      return null
    }
  }

  // Cargar datos guardados o usar datos iniciales
  const loadUsersFromStorage = () => {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY)
      return stored ? JSON.parse(stored) : initialDB.users
    } catch (e) {
      console.error('[AppContext] Error loading users:', e)
      return initialDB.users
    }
  }

  const loadConversationsFromStorage = () => {
    try {
      const stored = localStorage.getItem(CONVERSATIONS_STORAGE_KEY)
      return stored ? JSON.parse(stored) : initialDB.conversations
    } catch (e) {
      console.error('[AppContext] Error loading conversations:', e)
      return initialDB.conversations
    }
  }

  const loadMessagesFromStorage = () => {
    try {
      const stored = localStorage.getItem(MESSAGES_STORAGE_KEY)
      return stored ? JSON.parse(stored) : initialDB.messages
    } catch (e) {
      console.error('[AppContext] Error loading messages:', e)
      return initialDB.messages
    }
  }

  // Inicializar global store
  useEffect(() => {
    initializeGlobalStore()
    initStorageListener()
  }, [])

  const [user, setUser] = useState(loadAuthUserFromStorage)
  
  // Data States
  const [users, setUsers] = useState(loadUsersFromStorage())
  const [cases, setCases] = useState(initialDB.cases)
  const [tasks, setTasks] = useState(initialDB.tasks)
  const [appointments, setAppointments] = useState(() => {
    const stored = getAppointmentsFromStore()
    console.log('[AppContext] Initialized appointments from global store:', {
      count: stored.length,
      appointments: stored.map(a => ({ id: a.id, clientId: a.clientId, date: a.date, time: a.time }))
    })
    return stored
  })
  const [conversations, setConversations] = useState(loadConversationsFromStorage())
  const [messages, setMessages] = useState(loadMessagesFromStorage())
  const [documents, setDocuments] = useState(initialDB.documents)
  const messagesSyncRequestRef = useRef(0)
  const messagesSyncInFlightRef = useRef(false)

  // Notifications State
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Escuchar cambios de appointments desde el global store
  useEffect(() => {
    const unsubscribe = subscribeToAppointments((updatedAppointments) => {
      console.log('[AppContext] Global store changed, updating state:', updatedAppointments.length, 'appointments')
      setAppointments(updatedAppointments)
    })
    return unsubscribe
  }, [])

  // ⭐ PERSISTENCIA: Guardar users en localStorage
  useEffect(() => {
    try {
      localStorage.setItem('wil_users_db', JSON.stringify(users))
      console.log('[AppContext] Users saved to localStorage')
    } catch (e) {
      console.error('[AppContext] Error saving users:', e)
    }
  }, [users])

  // ⭐ PERSISTENCIA: Guardar conversations en localStorage
  useEffect(() => {
    try {
      localStorage.setItem('wil_conversations_db', JSON.stringify(conversations))
      console.log('[AppContext] Conversations saved to localStorage')
    } catch (e) {
      console.error('[AppContext] Error saving conversations:', e)
    }
  }, [conversations])

  // ⭐ PERSISTENCIA: Guardar messages en localStorage
  useEffect(() => {
    try {
      localStorage.setItem('wil_messages_db', JSON.stringify(messages))
      console.log('[AppContext] Messages saved to localStorage')
    } catch (e) {
      console.error('[AppContext] Error saving messages:', e)
    }
  }, [messages])

  // Auth - Ahora con API
  const login = async (email, password) => {
    try {
      const result = await loginAPI(email, password)
      if (result.success) {
        setAuthToken(result.token)
        const userData = {
          id: result.user.id,
          role: result.user.role,
          email: result.user.email,
          name: result.user.name,
          phone: result.user.phone,
          avatar: result.user.avatar,
          bio: '',
          document: '',
          address: ''
        }
        setUser(userData)
        console.log('[AppContext] Login exitoso:', userData.email)
        return userData
      }
    } catch (error) {
      console.error('[AppContext] Error login:', error.message)
      return null
    }
  }

  const logout =() => {
    setAuthToken(null)
    setUser(null)
    localStorage.removeItem(AUTH_USER_STORAGE_KEY)
    setNotifications([])
    setUnreadCount(0)
    console.log('[AppContext] Logout')
  }

  // Persistir usuario autenticado para mantener sesión tras recargar
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user))
      } else {
        localStorage.removeItem(AUTH_USER_STORAGE_KEY)
      }
    } catch (e) {
      console.error('[AppContext] Error saving auth user:', e)
    }
  }, [user])

  // ⭐ POLLING DE NOTIFICACIONES - Cada 5 segundos
  useEffect(() => {
    if (!user) return

    const fetchNotifications = async () => {
      try {
        const result = await getNotificationsAPI()
        if (result.success) {
          setNotifications(result.notifications)
          setUnreadCount(result.unreadCount)
        }
      } catch (error) {
        console.error('[AppContext] Error fetching notifications:', error.message)
      }
    }

    fetchNotifications()
    const interval = setInterval(fetchNotifications, 5000)
    return () => clearInterval(interval)
  }, [user])

  // ⭐ LOAD USERS FROM API
  useEffect(() => {
    if (!user) return

    const fetchUsers = async () => {
      try {
        const result = await getUsersAPI()
        if (Array.isArray(result)) {
          const formattedUsers = result.map((u) => ({
            id: u._id || u.id,
            role: u.role,
            email: u.email,
            name: u.name,
            phone: u.phone || '',
            avatar: u.avatar || (u.name ? u.name.charAt(0).toUpperCase() : '?'),
            bio: u.bio || '',
            document: u.document || '',
            address: u.address || ''
          }))
          setUsers(formattedUsers)
        }
      } catch (error) {
        console.error('[AppContext] Error fetching users:', error.message)
      }
    }

    fetchUsers()
  }, [user])

  // ⭐ LOAD CASES FROM API
  useEffect(() => {
    if (!user) return

    const fetchCases = async () => {
      try {
        const result = await getCasesAPI()
        if (Array.isArray(result)) {
          const formattedCases = result.map(c => ({
            id: c._id,
            title: c.title,
            clientId: c.clientId._id || c.clientId,
            lawyerId: c.lawyerId._id || c.lawyerId,
            status: c.status,
            priority: c.priority,
            progress: c.progress,
            date: c.date,
            description: c.description,
            clientDocuments: c.clientDocuments || [],
            lawyerDocuments: c.lawyerDocuments || []
          }))
          setCases(formattedCases)
        }
      } catch (error) {
        console.error('[AppContext] Error fetching cases:', error.message)
      }
    }

    fetchCases()
  }, [user])

  // ⭐ LOAD + POLLING CONVERSATIONS/MESSAGES FROM API
  useEffect(() => {
    if (!user) return

    const fetchConversationsAndMessages = async () => {
      if (messagesSyncInFlightRef.current) return
      messagesSyncInFlightRef.current = true
      const requestId = ++messagesSyncRequestRef.current

      try {
        const apiConversations = await getConversationsAPI()

        if (!Array.isArray(apiConversations)) return

        const formattedConversations = apiConversations.map((conv) => ({
          id: conv._id,
          lawyerId: conv.lawyerId?._id || conv.lawyerId,
          clientId: conv.clientId?._id || conv.clientId,
          time: conv.lastMessageTime
            ? new Date(conv.lastMessageTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
            : '',
          unreadClient: conv.unreadClient || 0,
          unreadLawyer: conv.unreadLawyer || 0
        }))

        const messagesByConversation = {}
        for (const conv of apiConversations) {
          const apiMessages = await getMessagesAPI(conv._id)
          messagesByConversation[conv._id] = Array.isArray(apiMessages)
            ? apiMessages.map((msg) => ({
                id: msg._id,
                from: msg.from,
                text: msg.text || msg.message || msg.content || '',
                time: msg.sentAt
                  ? new Date(msg.sentAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                  : '',
                sentAt: msg.sentAt ? new Date(msg.sentAt).getTime() : Date.now(),
                edited: !!msg.edited
              }))
            : []
        }

        // Ignorar respuestas viejas que lleguen tarde
        if (requestId !== messagesSyncRequestRef.current) return

        setConversations(formattedConversations)
        // Merge para no perder mensajes locales/recientes por reemplazo total
        setMessages((prev) => {
          const merged = { ...prev }

          Object.entries(messagesByConversation).forEach(([convId, incoming]) => {
            const existing = prev[convId] || []
            const byId = new Map()

            // Mantener solo mensajes temporales locales (ids numéricos)
            // para no revivir mensajes ya eliminados en el servidor.
            const localDrafts = existing.filter((msg) => /^\d+$/.test(String(msg.id)))

            ;[...incoming, ...localDrafts].forEach((msg) => {
              byId.set(String(msg.id), msg)
            })

            merged[convId] = Array.from(byId.values()).sort(
              (a, b) => (a.sentAt || 0) - (b.sentAt || 0)
            )
          })

          return merged
        })
      } catch (error) {
        console.error('[AppContext] Error cargando conversaciones/mensajes:', error.message)
      } finally {
        messagesSyncInFlightRef.current = false
      }
    }

    fetchConversationsAndMessages()
    // Mantener sincronizado entre abogado/cliente sin recargar la página
    const interval = setInterval(fetchConversationsAndMessages, 5000)
    return () => clearInterval(interval)
  }, [user])

  // Delete user (client) and associated data - Ahora con API
  const deleteUser = async (userId) => {
    try {
      await deleteUserAPI(userId)
      setUsers(prev => prev.filter(u => u.id !== userId))
      setCases(prev => prev.filter(c => c.clientId !== userId))
      setAppointments(prev => prev.filter(a => a.clientId !== userId))
      // Remove conversations and messages for this user
      const userConvIds = conversations.filter(c => c.clientId === userId).map(c => c.id)
      setConversations(prev => prev.filter(c => c.clientId !== userId))
      setMessages(prev => {
        const copy = { ...prev }
        userConvIds.forEach(id => delete copy[id])
        return copy
      })
      console.log('[AppContext] Usuario eliminado:', userId)
      return { success: true }
    } catch (error) {
      console.error('[AppContext] Error eliminando usuario:', error.message)
      return { success: false, message: error.message }
    }
  }

  // Register new client - Ahora con API
  const registerUser = async (name, email, password) => {
    try {
      if (!user || user.role !== 'admin') {
        return { success: false, message: 'Solo admin puede crear usuarios' }
      }

      const result = await createUserAPI(name, email, password, 'client')
      if (result.success) {
        // Agregar a lista local
        const newUser = {
          id: result.user.id,
          role: result.user.role,
          email: result.user.email,
          name: result.user.name,
          phone: '',
          avatar: name.charAt(0).toUpperCase(),
          bio: '',
          document: '',
          address: ''
        }
        setUsers(prev => [...prev, newUser])
        console.log('[AppContext] Usuario registrado:', email)
        return { success: true, user: newUser }
      }
    } catch (error) {
      console.error('[AppContext] Error registrando usuario:', error.message)
      return { success: false, message: error.message }
    }
  }

  // Update Profile - Ahora con API
  const updateProfile = async (id, updatedData) => {
    try {
      const dataToUpdate = { ...updatedData }
      if (dataToUpdate.password === '' || dataToUpdate.password === undefined) {
        delete dataToUpdate.password
      }
      
      const result = await updateUserAPI(id, dataToUpdate)
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...result.user } : u))
      if (user && user.id === id) {
        setUser(prev => ({ ...prev, ...result.user }))
      }
      console.log('[AppContext] Perfil actualizado:', id)
      return { success: true }
    } catch (error) {
      console.error('[AppContext] Error actualizando perfil:', error.message)
      return { success: false, message: error.message }
    }
  }

  // Messages
  const sendMessage = async (convId, text, role) => {
    const normalizedFrom = role === 'admin' ? 'lawyer' : role

    try {
      const result = await sendMessageAPI(convId, text, normalizedFrom)
      const savedMessage = result?.message

      const newMessage = {
        id: savedMessage?._id || Date.now(),
        from: savedMessage?.from || normalizedFrom,
        text: savedMessage?.text || text,
        time: savedMessage?.sentAt
          ? new Date(savedMessage.sentAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
          : new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        sentAt: savedMessage?.sentAt ? new Date(savedMessage.sentAt).getTime() : Date.now(),
        edited: !!savedMessage?.edited
      }

      setMessages(prev => ({
        ...prev,
        [convId]: [...(prev[convId] || []), newMessage]
      }))

      setConversations(prev => prev.map(c =>
        c.id === convId ? { ...c, time: newMessage.time } : c
      ))
    } catch (error) {
      console.error('[AppContext] Error enviando mensaje:', error.message)
    }
  }

  const editMessage = async (convId, messageId, newText) => {
    try {
      await editMessageAPI(messageId, newText)
      setMessages(prev => ({
        ...prev,
        [convId]: (prev[convId] || []).map(m =>
          m.id === messageId ? { ...m, text: newText, edited: true } : m
        )
      }))
    } catch (error) {
      console.error('[AppContext] Error editando mensaje:', error.message)
    }
  }

  const deleteMessages = async (convId, messageIds) => {
    const requestedIds = (messageIds || []).map((id) => String(id))
    const removableIds = new Set()
    const failedIds = []

    for (const rawId of requestedIds) {
      // Mensajes locales temporales (ids numéricos) no existen en backend
      if (/^\d+$/.test(rawId)) {
        removableIds.add(rawId)
        continue
      }

      try {
        await deleteMessageAPI(rawId)
        removableIds.add(rawId)
      } catch (error) {
        if ((error.message || '').includes('404')) {
          removableIds.add(rawId)
        } else {
          failedIds.push(rawId)
        }
      }
    }

    setMessages(prev => {
      const currentList = prev[convId] || []
      return {
        ...prev,
        [convId]: currentList.filter((m) => !removableIds.has(String(m.id)))
      }
    })

    return {
      success: failedIds.length === 0,
      removedCount: removableIds.size,
      failedCount: failedIds.length
    }
  }

  // Appointments - usando global store
  const addAppointment = (appointment) => {
    const roomName = appointment.roomName || appointment.roomId || `sala-${Date.now()}`
    const newAppointment = {
      ...appointment, 
      roomId: appointment.roomId || roomName,
      roomName, 
      callActive: false,
      videoStartTime: null,
      videoEndTime: null,
      joinedUsers: [],
      clientId: String(appointment.clientId),
      lawyerId: String(appointment.lawyerId || user?.id || '')
    }
    console.log('[AppContext] addAppointment calling store:', newAppointment)
    addAppointmentToStore(newAppointment)
  }

  const updateAppointment = (id, updatedData) => {
    console.log('[AppContext] updateAppointment calling store:', { id, updatedData })
    updateAppointmentInStore(id, updatedData)
  }

  const deleteAppointment = (id) => {
    console.log('[AppContext] deleteAppointment calling store:', { id })
    deleteAppointmentFromStore(id)
  }

  const startCall = (appointmentId) => {
    console.log('[AppContext] startCall:', { appointmentId })
    updateAppointmentInStore(appointmentId, {
      callActive: true,
      videoStartTime: new Date().toISOString()
    })
  }

  const endCall = (appointmentId) => {
    console.log('[AppContext] endCall:', { appointmentId })
    updateAppointmentInStore(appointmentId, {
      callActive: false,
      videoEndTime: new Date().toISOString()
    })
  }

  const joinCall = (appointmentId, userId) => {
    const current = appointments.find(a => a.id === appointmentId)
    if (current) {
      const currentJoined = current.joinedUsers || []
      if (!currentJoined.includes(userId)) {
        console.log('[AppContext] joinCall:', { appointmentId, userId })
        updateAppointmentInStore(appointmentId, {
          joinedUsers: [...currentJoined, userId]
        })
      }
    }
  }

  const updateCallTiming = (appointmentId, startTime) => {
    console.log('[AppContext] updateCallTiming:', { appointmentId, startTime })
    updateAppointmentInStore(appointmentId, {
      videoStartTime: startTime
    })
  }

  // Cases
  const addCase = async (caseData) => {
    try {
      const result = await createCaseAPI(
        caseData.title,
        caseData.clientId,
        user.id,
        caseData.status || 'active',
        caseData.priority || 'media',
        caseData.progress || 0,
        caseData.date || '',
        caseData.description || ''
      )
      const newCase = {
        id: result.case._id,
        title: result.case.title,
        clientId: result.case.clientId,
        lawyerId: result.case.lawyerId,
        status: result.case.status,
        priority: result.case.priority,
        progress: result.case.progress,
        date: result.case.date,
        description: result.case.description,
        clientDocuments: result.case.clientDocuments || [],
        lawyerDocuments: result.case.lawyerDocuments || []
      }
      setCases(prev => [...prev, newCase])
      return { success: true }
    } catch (error) {
      console.error('[AppContext] Error creando caso:', error.message)
      return { success: false, message: error.message }
    }
  }

  const updateCase = async (caseId, updatedData) => {
    try {
      const result = await updateCaseAPI(caseId, updatedData)
      setCases(prev => prev.map(c => c.id === caseId ? { ...c, ...result.case } : c))
      return { success: true }
    } catch (error) {
      console.error('[AppContext] Error actualizando caso:', error.message)
      return { success: false, message: error.message }
    }
  }

  const deleteCase = async (caseId) => {
    try {
      await deleteCaseAPI(caseId)
      setCases(prev => prev.filter(c => c.id !== caseId))
      return { success: true }
    } catch (error) {
      console.error('[AppContext] Error eliminando caso:', error.message)
      return { success: false, message: error.message }
    }
  }

  // Document management for cases
  const addClientDocument = async (caseId, file) => {
    try {
      const uploadResult = await uploadPDFAPI(file)
      const docPayload = {
        name: uploadResult.file.name,
        size: uploadResult.file.size,
        mimeType: uploadResult.file.mimeType,
        url: uploadResult.file.url,
        publicId: uploadResult.file.publicId
      }

      const result = await addClientCaseDocumentAPI(caseId, docPayload)
      setCases(prev => prev.map(c => 
        String(c.id) === String(caseId)
          ? { ...c, ...result.case, id: result.case._id || result.case.id }
          : c
      ))
      return { success: true }
    } catch (error) {
      console.error('[AppContext] Error subiendo documento cliente:', error.message)
      return { success: false, message: error.message }
    }
  }

  const addLawyerDocument = async (caseId, file) => {
    try {
      const uploadResult = await uploadPDFAPI(file)
      const docPayload = {
        name: uploadResult.file.name,
        size: uploadResult.file.size,
        mimeType: uploadResult.file.mimeType,
        url: uploadResult.file.url,
        publicId: uploadResult.file.publicId
      }

      const result = await addLawyerCaseDocumentAPI(caseId, docPayload)
      setCases(prev => prev.map(c => 
        String(c.id) === String(caseId)
          ? { ...c, ...result.case, id: result.case._id || result.case.id }
          : c
      ))
      return { success: true }
    } catch (error) {
      console.error('[AppContext] Error subiendo documento abogado:', error.message)
      return { success: false, message: error.message }
    }
  }

  const deleteClientDocument = async (caseId, documentId) => {
    try {
      const result = await deleteClientCaseDocumentAPI(caseId, documentId)
      setCases(prev => prev.map(c => 
        String(c.id) === String(caseId)
          ? { ...c, ...result.case, id: result.case._id || result.case.id }
          : c
      ))
      return { success: true }
    } catch (error) {
      console.error('[AppContext] Error eliminando documento cliente:', error.message)
      return { success: false, message: error.message }
    }
  }

  const deleteLawyerDocument = async (caseId, documentId) => {
    try {
      const result = await deleteLawyerCaseDocumentAPI(caseId, documentId)
      setCases(prev => prev.map(c => 
        String(c.id) === String(caseId)
          ? { ...c, ...result.case, id: result.case._id || result.case.id }
          : c
      ))
      return { success: true }
    } catch (error) {
      console.error('[AppContext] Error eliminando documento abogado:', error.message)
      return { success: false, message: error.message }
    }
  }

  // Tasks
  const addTask = (task) => {
    setTasks(prev => [...prev, { ...task, id: Date.now() }])
  }

  const updateTask = (taskId, updatedData) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updatedData } : t))
  }

  // Documents
  const addDocument = (doc) => {
    setDocuments(prev => [...prev, { ...doc, id: Date.now() }])
  }

  const deleteDocument = (docId) => {
    setDocuments(prev => prev.filter(d => d.id !== docId))
  }

  // Notifications
  const markNotificationAsRead = async (notificationId) => {
    try {
      await markNotificationReadAPI(notificationId)
      let wasUnread = false
      setNotifications(prev =>
        prev.map(n => {
          if (n._id !== notificationId) return n
          if (!n.read) wasUnread = true
          return { ...n, read: true }
        })
      )
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
      return { success: true }
    } catch (error) {
      console.error('[AppContext] Error marking notification as read:', error.message)
      return { success: false, message: error.message }
    }
  }

  const markAllNotificationsAsRead = async () => {
    try {
      await markAllNotificationsReadAPI()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('[AppContext] Error marking all notifications as read:', error.message)
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      await deleteNotificationAPI(notificationId)
      let deletedUnread = false
      setNotifications(prev => {
        const target = prev.find(n => n._id === notificationId)
        if (target && !target.read) deletedUnread = true
        return prev.filter(n => n._id !== notificationId)
      })
      if (deletedUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
      return { success: true }
    } catch (error) {
      console.error('[AppContext] Error deleting notification:', error.message)
      return { success: false, message: error.message }
    }
  }

  return (
    <AppContext.Provider value={{
      user, login, logout, registerUser, updateProfile, deleteUser,
      users, cases, setCases, tasks, appointments, conversations, messages, documents,
      sendMessage, editMessage, deleteMessages,
      addAppointment, updateAppointment, deleteAppointment, startCall, endCall, joinCall, updateCallTiming,
      addCase, updateCase, deleteCase, addClientDocument, addLawyerDocument, deleteClientDocument, deleteLawyerDocument,
      addTask, updateTask, addDocument, deleteDocument,
      notifications, unreadCount, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification
    }}>
      {children}
    </AppContext.Provider>
  )
}

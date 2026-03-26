const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

let authToken = localStorage.getItem('wil_auth_token') || null

export const setAuthToken = (token) => {
  authToken = token
  if (token) {
    localStorage.setItem('wil_auth_token', token)
  } else {
    localStorage.removeItem('wil_auth_token')
  }
}

export const getAuthToken = () => authToken

const apiCall = async (endpoint, method = 'GET', body = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    }
  }
  
  if (body) options.body = JSON.stringify(body)
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, options)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || `Error ${response.status}`)
    }
    
    return data
  } catch (error) {
    console.error(`[API] Error en ${method} ${endpoint}:`, error.message)
    throw error
  }
}

// ==================== AUTH ====================
export const loginAPI = (email, password) =>
  apiCall('/api/auth/login', 'POST', { email, password })

// ==================== USERS ====================
export const getUsersAPI = () =>
  apiCall('/api/users', 'GET')

export const createUserAPI = (name, email, password, role, phone = '') =>
  apiCall('/api/users', 'POST', { name, email, password, role, phone })

export const updateUserAPI = (id, data) =>
  apiCall(`/api/users/${id}`, 'PUT', data)

export const deleteUserAPI = (id) =>
  apiCall(`/api/users/${id}`, 'DELETE')

// ==================== APPOINTMENTS ====================
export const getAppointmentsAPI = (clientId, lawyerId) => {
  let query = ''
  if (clientId) query += `?clientId=${clientId}`
  if (lawyerId) query += `${query ? '&' : '?'}lawyerId=${lawyerId}`
  return apiCall(`/api/appointments${query}`, 'GET')
}

export const createAppointmentAPI = (clientId, lawyerId, date, time, roomId = '') =>
  apiCall('/api/appointments', 'POST', { clientId, lawyerId, date, time, roomId })

export const updateAppointmentAPI = (id, data) =>
  apiCall(`/api/appointments/${id}`, 'PUT', data)

export const deleteAppointmentAPI = (id) =>
  apiCall(`/api/appointments/${id}`, 'DELETE')

// ==================== CONVERSATIONS ====================
export const getConversationsAPI = () =>
  apiCall('/api/conversations', 'GET')

// ==================== MESSAGES ====================
export const getMessagesAPI = (convId) =>
  apiCall(`/api/messages/${convId}`, 'GET')

export const sendMessageAPI = (conversationId, text, from) =>
  apiCall('/api/messages', 'POST', { conversationId, text, from })

export const editMessageAPI = (id, text) =>
  apiCall(`/api/messages/${id}`, 'PUT', { text })

export const deleteMessageAPI = (id) =>
  apiCall(`/api/messages/${id}`, 'DELETE')

// ==================== NOTIFICATIONS ====================
export const getNotificationsAPI = (unreadOnly = false) =>
  apiCall(`/api/notifications?unreadOnly=${unreadOnly}`, 'GET')

export const markNotificationReadAPI = (id) =>
  apiCall(`/api/notifications/${id}/read`, 'PUT')

export const markAllNotificationsReadAPI = () =>
  apiCall('/api/notifications/read/all', 'PUT')

export const deleteNotificationAPI = (id) =>
  apiCall(`/api/notifications/${id}`, 'DELETE')

export const clearReadNotificationsAPI = () =>
  apiCall('/api/notifications/clear/read', 'DELETE')

// ==================== CASES ====================
export const getCasesAPI = (filters = {}) => {
  const params = new URLSearchParams()
  if (filters.clientId) params.append('clientId', filters.clientId)
  if (filters.lawyerId) params.append('lawyerId', filters.lawyerId)
  if (filters.status) params.append('status', filters.status)
  const query = params.toString() ? `?${params.toString()}` : ''
  return apiCall(`/api/cases${query}`, 'GET')
}

export const getCaseAPI = (id) =>
  apiCall(`/api/cases/${id}`, 'GET')

export const createCaseAPI = (title, clientId, lawyerId, status = 'active', priority = 'media', progress = 0, date = '', description = '') =>
  apiCall('/api/cases', 'POST', {
    title,
    clientId,
    lawyerId,
    status,
    priority,
    progress,
    date,
    description
  })

export const updateCaseAPI = (id, updates) =>
  apiCall(`/api/cases/${id}`, 'PUT', updates)

export const deleteCaseAPI = (id) =>
  apiCall(`/api/cases/${id}`, 'DELETE')

// ==================== FILE UPLOADS ====================
export const uploadPDFAPI = async (file) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_URL}/api/uploads/pdf`, {
    method: 'POST',
    headers: {
      ...(authToken && { Authorization: `Bearer ${authToken}` })
    },
    body: formData
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || `Error ${response.status}`)
  }
  return data
}

export const getSignedPdfLinkAPI = (publicId, attachment = false) =>
  apiCall(`/api/uploads/pdf-link?publicId=${encodeURIComponent(publicId)}&attachment=${attachment}`, 'GET')

export const addClientCaseDocumentAPI = (caseId, doc) =>
  apiCall(`/api/cases/${caseId}/client-documents`, 'POST', doc)

export const addLawyerCaseDocumentAPI = (caseId, doc) =>
  apiCall(`/api/cases/${caseId}/lawyer-documents`, 'POST', doc)

export const deleteClientCaseDocumentAPI = (caseId, docId) =>
  apiCall(`/api/cases/${caseId}/client-documents/${docId}`, 'DELETE')

export const deleteLawyerCaseDocumentAPI = (caseId, docId) =>
  apiCall(`/api/cases/${caseId}/lawyer-documents/${docId}`, 'DELETE')

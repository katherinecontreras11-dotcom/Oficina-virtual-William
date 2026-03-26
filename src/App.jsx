import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import { ChatContextProvider } from './context/ChatContext'
import { ChatBubbleIcon } from './components/ChatBubbleIcon'
import { AIChatModal } from './components/AIChatModal'
import './App.css'
import './responsive.css'

/* ─── Layouts ─── */
import PublicLayout from './layouts/PublicLayout'
import DashboardLayout from './layouts/DashboardLayout'

/* ─── Public Pages ─── */
import Landing from './pages/Landing'
import Login from './pages/Login'

/* ─── Client Pages ─── */
import ClientDashboard from './pages/client/ClientDashboard'
import ClientCases from './pages/client/ClientCases'
import ClientDocuments from './pages/client/ClientDocuments'
import ClientAppointments from './pages/client/ClientAppointments'
import ClientMessages from './pages/client/ClientMessages'

/* ─── Admin Pages ─── */
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminClients from './pages/admin/AdminClients'
import AdminCases from './pages/admin/AdminCases'
import AdminCalendar from './pages/admin/AdminCalendar'
import AdminMessages from './pages/admin/AdminMessages'

/* ─── Shared Pages ─── */
import Profile from './pages/Profile'
import VideoCall from './pages/VideoCall'

// Protected Route Wrapper
function ProtectedRoute({ children, allowedRole }) {
  const { user } = useApp()
  if (!user) return <Navigate to="/login" />
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/login" />
  return children
}

function App() {
  return (
    <AppProvider>
      <ChatContextProvider>
        <BrowserRouter>
          {/* Asistente Virtual - Visible en todas las páginas */}
          <ChatBubbleIcon />
          <AIChatModal />
          <Routes>
            {/* Public routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
            </Route>

            {/* Client routes */}
            <Route path="/cliente" element={
              <ProtectedRoute allowedRole="client">
                <DashboardLayout role="client" />
              </ProtectedRoute>
            }>
              <Route index element={<ClientDashboard />} />
              <Route path="casos" element={<ClientCases />} />
              <Route path="documentos" element={<ClientDocuments />} />
              <Route path="citas" element={<ClientAppointments />} />
              <Route path="mensajes" element={<ClientMessages />} />
              <Route path="perfil" element={<Profile />} />
            </Route>

            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRole="admin">
                <DashboardLayout role="admin" />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="clientes" element={<AdminClients />} />
              <Route path="casos" element={<AdminCases />} />
              <Route path="calendario" element={<AdminCalendar />} />
              <Route path="mensajes" element={<AdminMessages />} />
              <Route path="perfil" element={<Profile />} />
            </Route>

            {/* VideoCall Route */}
            <Route path="/video-call/:roomName" element={
              <ProtectedRoute>
                <VideoCall />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </ChatContextProvider>
    </AppProvider>
  )
}

export default App
